import "server-only";
import { timingSafeEqual } from "node:crypto";

// One shared token, sent as a header. Not a user account: there is exactly one
// person who approves people, and a password box that remembers the token for
// the tab is the whole of what that needs. Unset means /admin is simply off,
// which is the right default for a token that has to be deliberately set.
export const adminConfigured = () => Boolean(process.env.ADMIN_TOKEN);

export function isAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const got = Buffer.from(req.headers.get("x-admin-token") ?? "");
  const want = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, and the length itself is not
  // worth protecting here, so it is checked first.
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}
