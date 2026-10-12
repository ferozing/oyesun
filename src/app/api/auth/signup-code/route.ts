import { callApp, appConfigured } from "@/lib/appApi";
import { json, readJson, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { normalizeUsername, usernameProblem } from "@/lib/username";

// Signup with an invite code: someone a current user invited, or one of the
// named channel codes. Nothing to do with the waitlist — this hands straight
// to the app's own /auth/signup, which still does the redeeming and still
// counts the redemption against that code for code_stats().
export async function POST(req: Request) {
  if (!appConfigured()) return notReady();
  if (rateLimited(req, "signupcode", 6)) return tooMany();

  const body = await readJson(req);
  const username = normalizeUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  const problem = usernameProblem(username);
  if (problem) return json({ error: "invalid", message: problem }, 400);
  if (password.length < 8) {
    return json({ error: "invalid", message: "Pick a password of at least 8 characters." }, 400);
  }
  if (!code) return json({ error: "invalid", message: "Add your invite code." }, 400);

  const created = await callApp<{ custom_token: string }>("/auth/signup", {
    body: { username, password, invite_code: code, email: email || null },
  });

  if (!created.ok) {
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
