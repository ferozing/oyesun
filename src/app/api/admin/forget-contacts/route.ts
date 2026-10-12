import { isAdmin } from "@/lib/admin";
import { json, readJson, serverError, notReady } from "@/lib/http";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername } from "@/lib/username";

// Run once the invite messages have gone out. The only thing anywhere that
// deletes a contact, and a separate step on purpose.
export async function POST(req: Request) {
  if (!dbConfigured()) return notReady();
  if (!isAdmin(req)) return json({ error: "denied", message: "Wrong key." }, 401);

  const body = await readJson(req);
  const usernames = Array.isArray(body.usernames)
    ? body.usernames.map(normalizeUsername).filter(Boolean)
    : [];
  if (!usernames.length) return json({ error: "invalid", message: "Nobody named." }, 400);

  const { data, error } = await db().rpc("waitlist_forget_contacts", { p_usernames: usernames });
  if (error) return serverError();
  return json({ forgotten: data ?? 0 });
}
