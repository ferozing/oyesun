"use client";

import { useEffect, useState } from "react";
import { api, type Spot } from "./api";
import { LineStatus, srOnly } from "./Line";
import { cleanName, useWaitlist } from "./Waitlist";

export function CheckSpot({ auto }: { auto?: string } = {}) {
  const { reserved } = useWaitlist();
  const [open, setOpen] = useState(Boolean(auto));
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);

  const openCheck = () => {
    setOpen(true);
    if (reserved && !name) setName(reserved);
  };

  // Auto mode: we already know the username, so show the spot without asking.
  useEffect(() => {
    if (!auto) return;
    let stale = false;
    (async () => {
      const res = await api<Spot>(`/api/spot?u=${encodeURIComponent(auto)}`);
      if (stale) return;
      if (!res.ok) { setError(res.message); return; }
      setSpot(res.data);
    })();
    return () => { stale = true; };
  }, [auto]);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = cleanName(name);
    if (!u || busy) return;
    setBusy(true);
    setError(null);
    const res = await api<Spot>(`/api/spot?u=${encodeURIComponent(u)}`);
    setBusy(false);
    if (!res.ok) {
      setSpot(null);
      setError(res.status === 404 ? `We couldn't find @${u}. Reserve it above first.` : res.message);
      return;
    }
    setSpot(res.data);
  };

  if (!open) {
    return (
      <button type="button" onClick={openCheck} className="cursor-pointer border-0 bg-transparent p-3 text-[15px] text-cream">
        Already reserved? <span className="font-extrabold underline">Check your spot</span>
      </button>
    );
  }

  return (
    <div className={auto
      ? "flex w-full flex-col gap-3 text-left"
      : "flex w-full max-w-[520px] flex-col gap-3 rounded-[28px] border border-line bg-night p-[18px] text-left"}>
      {auto ? null : <span className="pl-1.5 text-[15px] font-bold text-cream">Check your spot</span>}
      <form onSubmit={check} hidden={Boolean(auto)} className="flex flex-wrap gap-2 rounded-full bg-ember p-[5px]">
        <label htmlFor="check-user" className={srOnly}>Your username</label>
        <span className="self-center pl-3.5 font-bold text-faint">@</span>
        <input
          id="check-user"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          placeholder="your username"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={21}
          className="min-w-0 flex-[1_1_160px] border-0 bg-transparent px-1.5 py-2.5 text-[16px] text-cream outline-none placeholder:text-faint focus-visible:outline-none"
        />
        <button type="submit" disabled={busy} className="flex-none cursor-pointer rounded-full border-0 bg-sun px-5 py-3 text-[15px] font-extrabold text-night disabled:opacity-70">
          {busy ? "Checking..." : "Check"}
        </button>
      </form>
      {error ? <p role="alert" className="px-2 text-[14px] font-semibold text-orange">{error}</p> : null}

      {spot ? (
        <div className="flex flex-col gap-4 rounded-3xl bg-cream p-[22px] text-night">
          {spot.status === "invited" ? (
            // Approved. Most people here left us no contact at all, by design,
            // so this screen is how they find out — not a message. It has to do
            // more than say "soon": it has to be the way in.
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-brown">@{spot.username} · your spot</span>
              <span className="font-display text-[64px] leading-[0.9] font-extrabold tracking-[-0.05em]">You&apos;re in.</span>
              <span className="mt-2 text-[14px] text-brown">Set a password and Oyesun is yours. Nothing else to enter.</span>
              <a
                href={`/signup?u=${encodeURIComponent(spot.username)}`}
                className="mt-3 self-start rounded-full bg-night px-6 py-3.5 text-[15px] font-extrabold text-sun no-underline"
              >
                Set my password
              </a>
            </div>
          ) : (
            <LineStatus key={spot.username} spot={spot} onSpot={setSpot} />
          )}
        </div>
      ) : null}
    </div>
  );
}
