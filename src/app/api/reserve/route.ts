import { json, readJson, serverError, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername, usernameProblem } from "@/lib/username";

export async function POST(req: Request) {
  if (!dbConfigured()) return notReady();
  if (rateLimited(req, "reserve", 8)) return tooMany();
  const username = normalizeUsername((await readJson(req)).username);
  const problem = usernameProblem(username);
  if (problem) return json({ error: "invalid", message: problem }, 400);

  const { error } = await db().from("waitlist").insert({ username });
  if (error) {
    if (error.code === "23505") return json({ error: "taken", message: "That username is taken. Try another one." }, 409);
    return serverError();
  }
  return json({ ok: true, username }, 201);
}
