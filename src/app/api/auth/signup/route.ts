import { callApp, bridgeConfigured } from "@/lib/appApi";
import { json, readJson, serverError, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername, usernameProblem } from "@/lib/username";

// Signup for someone the waitlist has approved. Approval is the credential:
// there is no code to type, and the only thing that decides whether this works
// is their row in the waitlist. The viral invite-code path is /signup-code.
export async function POST(req: Request) {
  if (!dbConfigured() || !bridgeConfigured()) return notReady();
  if (rateLimited(req, "signup", 6)) return tooMany();

  const body = await readJson(req);
  const username = normalizeUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  const problem = usernameProblem(username);
  if (problem) return json({ error: "invalid", message: problem }, 400);
  if (password.length < 8) {
    return json({ error: "invalid", message: "Pick a password of at least 8 characters." }, 400);
  }

  // Take the approval before anything else. waitlist_claim only succeeds once,
  // so a double submit or two open tabs can't turn one approval into two
  // accounts — and if it fails, nothing downstream should run at all.
  const claim = await db().rpc("waitlist_claim", { p_username: username });
  if (claim.error) return serverError();
  if (claim.data !== true) {
    const state = await db().rpc("waitlist_signup_state", { p_username: username });
    if (state.data?.[0]?.out_state === "claimed") {
      return json({ error: "claimed", message: "You already have an account. Log in instead." }, 409);
    }
    return json({ error: "not_approved", message: "You're not through the line yet." }, 403);
  }

  const created = await callApp<{ custom_token: string }>("/auth/signup-approved", {
    body: { username, password, email: email || null },
    bridge: true,
  });

  if (!created.ok) {
    // Give the approval back. This failure is either ours or a username taken
    // in the meantime, and in both cases they have to be able to try again
    // rather than lose their place to our error.
    await db().rpc("waitlist_unclaim", { p_username: username });
    if (created.status === 400 && created.detail) {
      return json({ error: "invalid", message: created.detail }, 400);
    }
    return json(
      { error: "app_down", message: "We couldn't finish setting up your account. Try again in a minute." },
      502,
    );
  }

  return json({ ok: true, username, custom_token: created.data.custom_token }, 201);
}
