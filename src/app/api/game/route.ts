import { json, serverError, tooMany, notReady } from "@/lib/http";
import { getQuestion, pickQuestionIds, publicQuestion } from "@/lib/questions";
import { rateLimited } from "@/lib/ratelimit";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername, usernameProblem } from "@/lib/username";

type Row = { out_qids: number[]; out_answered: number[]; out_jumps: number; out_done: boolean; out_status: string };

// Starts (or resumes) today's game. Questions go out without answers.
export async function GET(req: Request) {
  if (!dbConfigured()) return notReady();
  if (rateLimited(req, "game", 20)) return tooMany();
  const username = normalizeUsername(new URL(req.url).searchParams.get("u"));
  if (usernameProblem(username)) return json({ error: "not_found", message: "We couldn't find that username." }, 404);

  const { data, error } = await db().rpc("waitlist_start_game", { p_username: username, p_qids: pickQuestionIds(3) });
  if (error) return serverError();
  const row = (data as Row[] | null)?.[0];
  if (!row) return json({ error: "not_found", message: "We couldn't find that username." }, 404);
  if (row.out_status === "invited") return json({ error: "invited", message: "You're already in." }, 409);

  return json({
    done: row.out_done,
    jumpsToday: row.out_jumps,
    answered: row.out_answered,
    questions: row.out_qids.map(getQuestion).filter((q) => q !== undefined).map(publicQuestion),
  });
}
