"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "./api";
import { CheckSpot } from "./CheckSpot";

type Waitlist = {
  reserved: string | null;
  notified: boolean;
  reserve: (raw: string) => Promise<string | null>;
  notify: (contact: string) => Promise<string | null>;
};

const WaitlistContext = createContext<Waitlist | null>(null);
export const useWaitlist = () => {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error("useWaitlist must be inside WaitlistProvider");
  return ctx;
};

export const cleanName = (raw: string) => raw.trim().replace(/^@+/, "").toLowerCase();

// Shared by the hero and the final call to action, so reserving in one updates both.
// Nothing is saved in the browser: the username lives only in this page's memory.
export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [reserved, setReserved] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);

  const reserve = async (raw: string) => {
    const username = cleanName(raw);
    if (!username) return "Pick a username first.";
    const res = await api<{ username: string }>("/api/reserve", { username });
    if (!res.ok) return res.message;
    setReserved(res.data.username);
    return null;
  };

  const notify = async (contact: string) => {
    if (!reserved) return "Reserve a username first.";
    const res = await api("/api/notify", { username: reserved, contact });
    if (!res.ok) return res.message;
    setNotified(true);
    return null;
  };

  return <WaitlistContext.Provider value={{ reserved, notified, reserve, notify }}>{children}</WaitlistContext.Provider>;
}

const srOnly = "absolute h-px w-px overflow-hidden [clip:rect(0_0_0_0)]";

export function ReserveForm({ id, variant }: { id: string; variant: "hero" | "cta" }) {
  const { reserve } = useWaitlist();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hero = variant === "hero";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(await reserve(value));
    setBusy(false);
  };

  return (
    <div className={hero ? "flex flex-col gap-2" : "flex w-full max-w-[520px] flex-col gap-2"}>
      <form
        onSubmit={submit}
        className={hero
          ? "flex flex-wrap gap-2 rounded-full border border-line bg-ember p-1.5"
          : "flex w-full flex-wrap gap-2 rounded-full bg-cream p-1.5"}
      >
        <label htmlFor={id} className={srOnly}>Pick a username</label>
        <span className={`self-center text-[16px] font-bold ${hero ? "pl-4 text-faint" : "pl-[18px] text-[#8C7A5E]"}`}>@</span>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          placeholder="pick a username"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={21}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-w-0 flex-[1_1_180px] border-0 bg-transparent px-1.5 py-3 text-[16px] outline-none focus-visible:outline-none ${hero ? "text-cream placeholder:text-faint" : "text-night placeholder:text-[#8C7A5E]"}`}
        />
        <button
          type="submit"
          disabled={busy}
          className={`flex-none cursor-pointer rounded-full border-0 px-6 py-3.5 text-[16px] font-extrabold disabled:opacity-70 ${hero ? "bg-sun text-night" : "bg-night text-sun"}`}
        >
          {busy ? "Reserving..." : "Reserve my spot"}
        </button>
      </form>
      {error ? (
        <p id={`${id}-error`} role="alert" className={`px-4 text-[14px] font-semibold ${hero ? "text-orange" : "text-night"}`}>{error}</p>
      ) : null}
    </div>
  );
}

export function HeroJoined() {
  const { reserved, notified, notify } = useWaitlist();
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(await notify(contact));
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-[26px] border border-sun bg-ember px-[22px] py-5">
      <div className="flex items-center gap-3 font-bold">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#FFC94A" /><path d="M6 10.5l2.6 2.6L14 7.6" fill="none" stroke="#14100C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Spot reserved, @{reserved}.
      </div>
      {reserved ? <CheckSpot auto={reserved} /> : null}
      <span className="text-[14px] leading-[1.5] text-muted">Come back anytime and type your username to check if you&apos;re in.</span>
      {notified ? (
        <span className="text-[14px] font-bold text-sun">Done. One message when you&apos;re in, then we forget it.</span>
      ) : (
        <>
          <form onSubmit={submit} className="flex flex-wrap gap-2 rounded-full border border-line bg-night p-[5px]">
            <label htmlFor="hero-notify" className={srOnly}>Email or WhatsApp, optional</label>
            <input
              id="hero-notify"
              type="text"
              value={contact}
              onChange={(e) => { setContact(e.target.value); setError(null); }}
              placeholder="Email or WhatsApp (optional)"
              autoComplete="off"
              maxLength={120}
              className="min-w-0 flex-[1_1_180px] border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-cream outline-none placeholder:text-faint focus-visible:outline-none"
            />
            <button type="submit" disabled={busy} className="flex-none cursor-pointer rounded-full border-[1.5px] border-sun bg-transparent px-[18px] py-2.5 text-[14px] font-extrabold text-sun disabled:opacity-70">
              {busy ? "Saving..." : "Notify me"}
            </button>
          </form>
          {error ? <p role="alert" className="px-3 text-[14px] font-semibold text-orange">{error}</p> : null}
        </>
      )}
    </div>
  );
}

export function HeroWaitlist() {
  const { reserved } = useWaitlist();
  return (
    <div className="flex max-w-[500px] flex-col gap-2.5">
      {reserved ? <HeroJoined /> : <ReserveForm id="hero-wa" variant="hero" />}
      <span className="pl-2 text-[14px] text-faint">Just a username. No phone, no email, no real name.</span>
    </div>
  );
}
