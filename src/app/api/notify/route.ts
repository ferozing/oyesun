import { json, readJson, serverError, tooMany, notReady } from "@/lib/http";
import { rateLimited } from "@/lib/ratelimit";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizeUsername, usernameProblem } from "@/lib/username";

// The only place a contact is ever stored, and only because the person typed it.
// It is cleared (set to null) once their invite message has been sent.
export async function POST(req: Request) {
  if (!dbConfigured()) return notReady();
  if (rateLimited(req, "notify", 6)) return tooMany();
  const body = await readJson(req);
  const username = normalizeUsername(body.username);
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  if (usernameProblem(username)) return json({ error: "not_found", message: "We couldn't find that username." }, 404);
  if (contact.length < 3 || contact.length > 120) {
    return json({ error: "invalid", message: "Add an email or WhatsApp number we can reach." }, 400);
  }

  const { data, error } = await db()
    .from("waitlist")
    .update({ notify_contact: contact })
    .eq("username", username)
    .eq("status", "waiting")
    .select("username");
  if (error) return serverError();
  if (!data?.length) return json({ error: "not_found", message: "We couldn't find that username." }, 404);
  return json({ ok: true });
}
