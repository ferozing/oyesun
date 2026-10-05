import "server-only";
import { NextResponse } from "next/server";

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const tooMany = () => json({ error: "slow_down", message: "Too many tries. Give it a minute." }, 429);
export const serverError = () => json({ error: "server", message: "Something went wrong. Try again in a bit." }, 500);

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export type Spot = { position: number | null; ahead: number | null; total: number; status: "waiting" | "invited" };

type SpotRow = { out_position: number | null; out_ahead: number | null; out_total: number; out_status: "waiting" | "invited" };
export function toSpot(row: SpotRow): Spot {
  return { position: row.out_position, ahead: row.out_ahead, total: row.out_total, status: row.out_status };
}

// Shown until Supabase keys are added in Vercel.
export const notReady = () => json({ error: "not_ready", message: "The waitlist opens very soon. Check back in a little while." }, 503);
