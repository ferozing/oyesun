"use client";

export type Spot = { username: string; position: number | null; ahead: number | null; total: number; status: "waiting" | "invited" };
export type PublicQuestion = { id: number; msg: string; opts: [string, string, string] };

type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string; message: string };

export async function api<T>(path: string, body?: unknown): Promise<Result<T>> {
  try {
    const res = await fetch(path, body === undefined ? { cache: "no-store" } : {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: data as T };
    return { ok: false, status: res.status, error: data.error ?? "server", message: data.message ?? "Something went wrong. Try again in a bit." };
  } catch {
    return { ok: false, status: 0, error: "network", message: "No connection. Check your internet and try again." };
  }
}
