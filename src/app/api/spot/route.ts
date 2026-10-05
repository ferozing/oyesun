import { json, serverError, toSpot, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername, usernameProblem } from "@/lib/username";

export async function GET(req: Request) {
  if (!dbConfigured()) return notReady();
  if (rateLimited(req, "spot", 30)) return tooMany();
  const username = normalizeUsername(new URL(req.url).searchParams.get("u"));
  if (usernameProblem(username)) return json({ error: "not_found", message: "We couldn't find that username." }, 404);

  const { data, error } = await db().rpc("waitlist_spot", { p_username: username });
  if (error) return serverError();
  if (!data?.length) return json({ error: "not_found", message: "We couldn't find that username." }, 404);
  return json({ username, ...toSpot(data[0]) });
}
