import { json, readJson, serverError, toSpot, tooMany, notReady } from "@/lib/http";
import { getQuestion } from "@/lib/questions";
import { rateLimited } from "@/lib/ratelimit";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername, usernameProblem } from "@/lib/username";

type Row = { out_ok: boolean; out_reason: string | null; out_gained: number };

// Checked on the server: +5 right, +2 wrong, each question once, 15 jumps a day at most.
export async function POST(req: Request) {
  if (!dbConfigured()) return notReady();
  if (rateLimited(req, "answer", 20)) return tooMany();
  const body = await readJson(req);
  const username = normalizeUsername(body.username);
  const q = getQuestion(Number(body.questionId));
  const choice = Number(body.choice);
  if (usernameProblem(username)) return json({ error: "not_found", message: "We couldn't find that username." }, 404);
  if (!q || ![0, 1, 2].includes(choice)) return json({ error: "invalid", message: "That answer didn't make sense." }, 400);

  const correct = choice === q.a;
  const { data, error } = await db().rpc("waitlist_answer", { p_username: username, p_qid: q.id, p_gain: correct ? 5 : 2 });
  if (error) return serverError();
  const row = (data as Row[] | null)?.[0];
  if (!row?.out_ok) {
    const reason = row?.out_reason ?? "no_game";
    const message =
      reason === "already_answered" ? "You already answered that one." :
      reason === "invited" ? "You're already in." :
      reason === "not_found" ? "We couldn't find that username." :
      "Start today's game first.";
    return json({ error: reason, message }, 409);
  }

  const spot = await db().rpc("waitlist_spot", { p_username: username });
  return json({
    correct,
    answer: q.a,
    gained: row.out_gained,
    ...(spot.data?.[0] ? toSpot(spot.data[0]) : {}),
  });
}
