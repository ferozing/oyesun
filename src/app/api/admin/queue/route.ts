import { isAdmin } from "@/lib/admin";
import { json, serverError, notReady } from "@/lib/http";
import { db, dbConfigured } from "@/lib/supabase";

// Everything the approval page shows before anything is pressed: the counts,
// who is next in line, and who was approved but hasn't signed up yet.
export async function GET(req: Request) {
  if (!dbConfigured()) return notReady();
  if (!isAdmin(req)) return json({ error: "denied", message: "Wrong key." }, 401);

  const count = Number(new URL(req.url).searchParams.get("n") ?? 10);
  const take = Number.isFinite(count) ? Math.min(Math.max(count, 1), 100) : 10;

  const [summary, next, pending] = await Promise.all([
    db().rpc("waitlist_admin_summary"),
    db().rpc("waitlist_next_in_line", { p_count: take }),
    db().rpc("waitlist_approved_pending"),
  ]);
  if (summary.error || next.error || pending.error) return serverError();

  const s = summary.data?.[0];
  return json({
    counts: {
      waiting: s?.out_waiting ?? 0,
      approvedPending: s?.out_approved_unclaimed ?? 0,
      accounts: s?.out_accounts ?? 0,
      total: s?.out_total ?? 0,
    },
    // contactOnFile rather than the contact itself: the queue gets looked at
    // far more often than anyone needs to be messaged.
    next: (next.data ?? []).map((r: { out_username: string; out_jumps: number; out_contact_on_file: boolean }) => ({
      username: r.out_username,
      jumps: r.out_jumps,
      contactOnFile: r.out_contact_on_file,
    })),
    pending: (pending.data ?? []).map((r: { out_username: string; out_approved_at: string | null; out_contact: string | null }) => ({
      username: r.out_username,
      approvedAt: r.out_approved_at,
      contact: r.out_contact,
    })),
  });
}
