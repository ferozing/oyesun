import { isAdmin } from "@/lib/admin";
import { json, readJson, serverError, notReady } from "@/lib/http";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername } from "@/lib/username";

// Approve the next N in line, or named people. Returns each contact that was
// left with us, because this is the one moment those are useful — and they are
// not cleared here: a contact dropped before the message actually went out is
// a person who never hears from us. /api/admin/forget-contacts does that,
// afterwards, deliberately.
export async function POST(req: Request) {
  if (!dbConfigured()) return notReady();
  if (!isAdmin(req)) return json({ error: "denied", message: "Wrong key." }, 401);

  const body = await readJson(req);
  const usernames = Array.isArray(body.usernames)
    ? body.usernames.map(normalizeUsername).filter(Boolean)
    : null;

  const res = usernames?.length
    ? await db().rpc("waitlist_approve", { p_usernames: usernames })
    : await db().rpc("waitlist_approve_next", {
        p_count: Math.min(Math.max(Number(body.count) || 10, 1), 100),
      });

  if (res.error) return serverError();
  return json({
    approved: (res.data ?? []).map((r: { out_username: string; out_contact: string | null }) => ({
      username: r.out_username,
      contact: r.out_contact,
    })),
  });
}
