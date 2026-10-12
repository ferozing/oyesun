import "server-only";

// The app itself (FastAPI on Cloud Run) is served under /app on this same
// domain. Server side we talk straight to its origin: the browser never needs
// to know the Cloud Run URL, and the bridge secret never leaves the server.
const ORIGIN = (process.env.APP_ORIGIN ?? "").replace(/\/+$/, "");

export const appConfigured = () => Boolean(ORIGIN);
export const bridgeConfigured = () => Boolean(ORIGIN && process.env.WAITLIST_BRIDGE_SECRET);

type AppResult<T> = { ok: true; data: T } | { ok: false; status: number; detail: string };

// The app answers errors as FastAPI's {"detail": "..."}, and those strings are
// already written for the person ("that username's taken — try another?"), so
// they get passed through rather than replaced with something vaguer.
export async function callApp<T>(
  path: string,
  init: { method?: string; body?: unknown; bridge?: boolean } = {},
): Promise<AppResult<T>> {
  if (!ORIGIN) return { ok: false, status: 503, detail: "not_configured" };

  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.bridge) {
    const secret = process.env.WAITLIST_BRIDGE_SECRET;
    if (!secret) return { ok: false, status: 503, detail: "not_configured" };
    headers["X-Waitlist-Secret"] = secret;
  }

  let res: Response;
  try {
    res = await fetch(`${ORIGIN}${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      // Cloud Run cold starts are slow, but not this slow. Past this the
      // person is better served by "try again" than by a hanging form.
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return { ok: false, status: 502, detail: "unreachable" };
  }

  const data = await res.json().catch(() => null);
  if (res.ok) return { ok: true, data: data as T };
  const detail =
    data && typeof data === "object" && typeof (data as { detail?: unknown }).detail === "string"
      ? (data as { detail: string }).detail
      : "";
  return { ok: false, status: res.status, detail };
}
