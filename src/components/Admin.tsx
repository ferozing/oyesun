"use client";

import { useCallback, useState } from "react";

type Queue = {
  counts: { waiting: number; approvedPending: number; accounts: number; total: number };
  next: { username: string; jumps: number; contactOnFile: boolean }[];
  pending: { username: string; approvedAt: string | null; contact: string | null }[];
};
type Approved = { username: string; contact: string | null }[];

const fmt = (n: number) => n.toLocaleString("en-IN");
const card = "flex flex-col gap-3 rounded-[22px] border border-line bg-ember p-5";

export function Admin() {
  const [key, setKey] = useState("");
  const [queue, setQueue] = useState<Queue | null>(null);
  const [approved, setApproved] = useState<Approved | null>(null);
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The key is typed in each time, deliberately. It never goes in the URL,
  // where it would end up in history and in every log between here and Vercel,
  // and it is never stored, so closing the tab is the whole of logging out.

  const call = useCallback(
    async <T,>(path: string, body?: unknown): Promise<T | null> => {
      setError(null);
      const res = await fetch(path, {
        method: body === undefined ? "GET" : "POST",
        headers: { "X-Admin-Token": key, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
      }).catch(() => null);
      if (!res) {
        setError("No connection.");
        return null;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Something went wrong.");
        return null;
      }
      return data as T;
    },
    [key],
  );

  const load = useCallback(async () => {
    if (!key) return;
    setBusy(true);
    const q = await call<Queue>(`/api/admin/queue?n=${count}`);
    setBusy(false);
    if (q) setQueue(q);
  }, [call, key, count]);

  const approve = async () => {
    if (!confirm(`Approve the next ${count} in line? They'll be able to sign up straight away.`)) return;
    setBusy(true);
    const res = await call<{ approved: Approved }>("/api/admin/approve", { count });
    setBusy(false);
    if (res) {
      setApproved(res.approved);
      void load();
    }
  };

  const forget = async (usernames: string[]) => {
    if (!usernames.length) return;
    if (!confirm(`Forget ${usernames.length} contact(s)? This can't be undone.`)) return;
    setBusy(true);
    await call<{ forgotten: number }>("/api/admin/forget-contacts", { usernames });
    setBusy(false);
    setApproved(null);
    void load();
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-[clamp(36px,6vw,56px)] leading-[0.95] font-extrabold tracking-[-0.045em]">The line</h1>

      <div className={card}>
        <label htmlFor="admin-key" className="text-[14px] font-bold text-muted">Admin key</label>
        <div className="flex flex-wrap gap-2">
          <input
            id="admin-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ADMIN_TOKEN"
            autoComplete="off"
            className="min-w-0 flex-[1_1_240px] rounded-[14px] border-[1.5px] border-line bg-night px-4 py-3 text-[15px] text-cream outline-none placeholder:text-faint"
          />
          <button type="button" onClick={() => void load()} disabled={busy || !key} className="cursor-pointer rounded-full border-0 bg-sun px-5 py-3 text-[15px] font-extrabold text-night disabled:opacity-60">
            {busy ? "..." : "Load"}
          </button>
        </div>
        {error ? <p role="alert" className="text-[14px] font-semibold text-orange">{error}</p> : null}
      </div>

      {queue ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Waiting" value={queue.counts.waiting} />
            <Stat label="Approved, no account" value={queue.counts.approvedPending} accent />
            <Stat label="Accounts" value={queue.counts.accounts} />
            <Stat label="Ever joined" value={queue.counts.total} />
          </div>

          <div className={card}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <span className="font-display text-[26px] font-extrabold tracking-[-0.03em]">Next in line</span>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="admin-count" className="text-[14px] text-muted">How many</label>
                <input
                  id="admin-count"
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-[72px] rounded-[12px] border-[1.5px] border-line bg-night px-3 py-2 text-[15px] text-cream outline-none"
                />
                <button type="button" onClick={() => void load()} disabled={busy} className="cursor-pointer rounded-full border-[1.5px] border-line bg-transparent px-4 py-2.5 text-[14px] font-bold text-muted disabled:opacity-60">
                  Refresh
                </button>
                <button type="button" onClick={approve} disabled={busy || !queue.next.length} className="cursor-pointer rounded-full border-0 bg-sun px-5 py-2.5 text-[14px] font-extrabold text-night disabled:opacity-60">
                  Approve these {queue.next.length}
                </button>
              </div>
            </div>
            {queue.next.length ? (
              <ol className="flex flex-col gap-1.5">
                {queue.next.map((r, i) => (
                  <li key={r.username} className="flex flex-wrap items-center gap-2 border-b border-dusk py-2 text-[15px] last:border-0">
                    <span className="w-7 text-faint">{i + 1}</span>
                    <span className="font-bold text-cream">@{r.username}</span>
                    {r.jumps > 0 ? <span className="text-[13px] text-sun">▲ {r.jumps} jumped</span> : null}
                    {r.contactOnFile ? <span className="ml-auto text-[13px] text-muted">can be messaged</span> : <span className="ml-auto text-[13px] text-faint">no contact</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[15px] text-muted">Nobody waiting.</p>
            )}
          </div>

          {approved?.length ? (
            <div className="flex flex-col gap-3 rounded-[22px] border border-sun bg-ember p-5">
              <span className="font-display text-[26px] font-extrabold tracking-[-0.03em]">Just approved</span>
              <p className="text-[14px] leading-[1.55] text-muted">
                Everyone here can sign up right now — they don&apos;t need to be told first. Message the ones who left
                a contact, then forget those contacts.
              </p>
              <ul className="flex flex-col gap-1.5">
                {approved.map((r) => (
                  <li key={r.username} className="flex flex-wrap items-center gap-2 border-b border-dusk py-2 text-[15px] last:border-0">
                    <span className="font-bold text-cream">@{r.username}</span>
                    <span className="ml-auto font-mono text-[13px] text-sun">{r.contact ?? "—"}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => forget(approved.filter((r) => r.contact).map((r) => r.username))}
                disabled={busy || !approved.some((r) => r.contact)}
                className="cursor-pointer self-start rounded-full border-[1.5px] border-line bg-transparent px-4 py-2.5 text-[14px] font-bold text-muted disabled:opacity-60"
              >
                I&apos;ve messaged them — forget the contacts
              </button>
            </div>
          ) : null}

          <div className={card}>
            <span className="font-display text-[26px] font-extrabold tracking-[-0.03em]">Approved, not signed up</span>
            <p className="text-[14px] leading-[1.55] text-muted">
              Waiting for them to come back and set a password. Nothing is wrong — most people here never gave us a
              way to be told.
            </p>
            {queue.pending.length ? (
              <ul className="flex flex-col gap-1.5">
                {queue.pending.map((r) => (
                  <li key={r.username} className="flex flex-wrap items-center gap-2 border-b border-dusk py-2 text-[15px] last:border-0">
                    <span className="font-bold text-cream">@{r.username}</span>
                    <span className="text-[13px] text-faint">{r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-IN") : "—"}</span>
                    <span className="ml-auto font-mono text-[13px] text-sun">{r.contact ?? "—"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-muted">Everyone approved has an account.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 rounded-[18px] border p-4 ${accent ? "border-sun bg-ember" : "border-line bg-ember"}`}>
      <span className="font-display text-[32px] leading-none font-extrabold tracking-[-0.04em]">{fmt(value)}</span>
      <span className="text-[13px] leading-[1.3] text-muted">{label}</span>
    </div>
  );
}
