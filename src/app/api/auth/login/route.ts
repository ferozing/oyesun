import { callApp, appConfigured } from "@/lib/appApi";
import { json, readJson, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { normalizeUsername } from "@/lib/username";

// Login goes through here rather than straight to /app/auth/login purely for
// the rate limit — the app has none of its own, and this is the one endpoint
// worth guessing at.
//
// It deliberately does NOT look at the waitlist on failure. The app already
// refuses to say whether it was the username or the password that was wrong,
// and adding "you're still in the queue" here would hand that back: anyone
// could probe which usernames are on the waitlist. A wrong login says one
// thing, always.
export async function POST(req: Request) {
  if (!appConfigured()) return notReady();
  if (rateLimited(req, "login", 10)) return tooMany();

  const body = await readJson(req);
  const username = normalizeUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return json({ error: "invalid", message: "Enter your username and password." }, 400);
  }

  const res = await callApp<{ custom_token: string }>("/auth/login", { body: { username, password } });
  if (!res.ok) {
    if (res.status === 400) {
      return json({ error: "bad_credentials", message: "Wrong username or password." }, 400);
    }
    return json({ error: "app_down", message: "We couldn't reach Oyesun. Try again in a minute." }, 502);
  }

  return json({ ok: true, username, custom_token: res.data.custom_token });
}
