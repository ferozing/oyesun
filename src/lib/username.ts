// Usernames: 3 to 20 characters, lowercase letters, numbers and underscore.
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().replace(/^@+/, "").toLowerCase() : "";
}

export function usernameProblem(u: string): string | null {
  if (u.length < 3) return "Usernames need at least 3 characters.";
  if (u.length > 20) return "Usernames can be at most 20 characters.";
  if (!USERNAME_RE.test(u)) return "Use only letters, numbers and underscore.";
  return null;
}
