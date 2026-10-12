import { callApp, appConfigured } from "@/lib/appApi";
import { json, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { normalizeUsername, usernameProblem } from "@/lib/username";

// As-you-type check for the invite-code signup, where the username is being
// chosen fresh. The waitlist path doesn't need this: that username was already
// reserved when they joined the line.
export async function GET(req: Request) {
  if (!appConfigured()) return notReady();
  if (rateLimited(req, "available", 40)) return tooMany();

  const username = normalizeUsername(new URL(req.url).searchParams.get("u"));
  if (usernameProblem(username)) return json({ available: false });

  const res = await callApp<{ available: boolean }>(
    `/auth/username-available?username=${encodeURIComponent(username)}`,
  );
  if (!res.ok) return json({ available: null });
  return json({ available: res.data.available });
}
