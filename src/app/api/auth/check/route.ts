import { json, readJson, serverError, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername, usernameProblem } from "@/lib/username";

// Which of the four signup screens this username gets. One round trip, because
// the form asks this on every submit of the first step.
type Row = {
  out_state: "new" | "waiting" | "approved" | "claimed";
  out_position: number | null;
  out_ahead: number | null;
  out_total: number;
};

export async function POST(req: Request) {
  if (!dbConfigured()) return notReady();
  if (rateLimited(req, "authcheck", 20)) return tooMany();

  const username = normalizeUsername((await readJson(req)).username);
  const problem = usernameProblem(username);
  if (problem) return json({ error: "invalid", message: problem }, 400);

  const { data, error } = await db().rpc("waitlist_signup_state", { p_username: username });
  if (error || !data?.length) return serverError();

  const row = data[0] as Row;
  return json({
    username,
    state: row.out_state,
    position: row.out_position,
    ahead: row.out_ahead,
    total: row.out_total,
  });
}
