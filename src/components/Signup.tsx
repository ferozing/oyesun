"use client";

import Link from "next/link";
import { useState } from "react";
import { api, type Spot } from "./api";
import { enterApp } from "./handoff";
import { LineStatus, fmt, srOnly } from "./Line";
import { cleanName } from "./Waitlist";

type CheckResult = {
  username: string;
  state: "new" | "waiting" | "approved" | "claimed";
  position: number | null;
  ahead: number | null;
  total: number;
};

// Five screens, decided by one call to /api/auth/check. "code" is the separate
// door for someone a current user invited — nothing to do with the line.
type Step =
  | { phase: "ask" }
  | { phase: "new"; username: string; total: number }
  | { phase: "waiting"; spot: Spot }
  | { phase: "approved"; username: string }
  | { phase: "claimed"; username: string }
  | { phase: "code" };

const input =
  "w-full rounded-[16px] border-[1.5px] border-line bg-ember px-4 py-3.5 text-[16px] text-cream outline-none placeholder:text-faint";
const primary =
  "cursor-pointer rounded-full border-0 bg-sun px-6 py-3.5 text-[16px] font-extrabold text-night disabled:opacity-70";
const h1 = "font-display text-[clamp(40px,7vw,64px)] leading-[0.92] font-extrabold tracking-[-0.045em]";

export function Signup({ initialUsername = "" }: { initialUsername?: string }) {
  const [step, setStep] = useState<Step>({ phase: "ask" });
  const [name, setName] = useState(initialUsername);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (raw: string) => {
    const u = cleanName(raw);
    if (!u) return setError("Type your username first.");
    setBusy(true);
    setError(null);
    const res = await api<CheckResult>("/api/auth/check", { username: u });
    setBusy(false);
    if (!res.ok) return setError(res.message);

    const d = res.data;
    if (d.state === "approved") setStep({ phase: "approved", username: d.username });
    else if (d.state === "claimed") setStep({ phase: "claimed", username: d.username });
    else if (d.state === "new") setStep({ phase: "new", username: d.username, total: d.total });
    else {
      setStep({
        phase: "waiting",
        spot: { username: d.username, position: d.position, ahead: d.ahead, total: d.total, status: "waiting" },
      });
    }
  };

  const reserve = async (username: string) => {
    setBusy(true);
    setError(null);
    const res = await api<{ username: string }>("/api/reserve", { username });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    await check(username);
  };

  return (
    <div className="flex flex-col gap-5">
      {step.phase === "ask" ? (
        <Ask
          name={name}
          setName={setName}
          busy={busy}
          error={error}
          onSubmit={() => check(name)}
          onCode={() => { setError(null); setStep({ phase: "code" }); }}
        />
      ) : null}

      {step.phase === "new" ? (
        <Card>
          <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-brown">@{step.username}</span>
          <span className={h1}>Not in line yet.</span>
          <p className="text-[15px] leading-[1.55] text-brown">
            Nobody has taken @{step.username}. Reserve it and you join {fmt(step.total)} others in the line — just a
            username, nothing else.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => reserve(step.username)} disabled={busy} className="cursor-pointer rounded-full border-0 bg-night px-6 py-3.5 text-[16px] font-extrabold text-sun disabled:opacity-70">
              {busy ? "Reserving..." : "Reserve @" + step.username}
            </button>
            <button type="button" onClick={() => { setError(null); setStep({ phase: "ask" }); }} className="cursor-pointer border-0 bg-transparent p-2 text-[15px] font-bold text-brown underline">
              Different username
            </button>
          </div>
          {error ? <Err>{error}</Err> : null}
        </Card>
      ) : null}

      {step.phase === "waiting" ? (
        <>
          <Card>
            <LineStatus
              key={step.spot.username}
              spot={step.spot}
              onSpot={(s) => setStep(s.status === "invited" ? { phase: "approved", username: s.username } : { phase: "waiting", spot: s })}
            />
          </Card>
          <p className="px-2 text-[15px] leading-[1.55] text-muted">
            We open a few more spots every single day. When it&apos;s your turn, come back here and type your
            username — this page becomes your password screen. That&apos;s the whole thing.
          </p>
          <Back onClick={() => { setError(null); setStep({ phase: "ask" }); }} />
        </>
      ) : null}

      {step.phase === "approved" ? <Approved username={step.username} /> : null}

      {step.phase === "claimed" ? (
        <Card>
          <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-brown">@{step.username}</span>
          <span className={h1}>You&apos;re already set up.</span>
          <p className="text-[15px] leading-[1.55] text-brown">This username has an account. Log in and pick up where you left off.</p>
          <Link href={`/login?u=${encodeURIComponent(step.username)}`} className="self-start rounded-full bg-night px-6 py-3.5 text-[16px] font-extrabold text-sun no-underline">
            Log in
          </Link>
        </Card>
      ) : null}

      {step.phase === "code" ? <WithCode onBack={() => { setError(null); setStep({ phase: "ask" }); }} /> : null}

      {step.phase === "ask" || step.phase === "code" ? (
        <p className="px-2 text-[15px] text-faint">
          Already have an account? <Link href="/login" className="font-bold text-sun">Log in</Link>
        </p>
      ) : null}
    </div>
  );
}

function Ask({ name, setName, busy, error, onSubmit, onCode }: {
  name: string;
  setName: (v: string) => void;
  busy: boolean;
  error: string | null;
  onSubmit: () => void;
  onCode: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className={h1}>Oye, sun.</h1>
        <p className="text-[17px] leading-[1.55] text-muted">
          Type the username you reserved. We&apos;ll tell you where you stand.
        </p>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (!busy) onSubmit(); }}
        className="flex flex-wrap gap-2 rounded-full border border-line bg-ember p-1.5"
      >
        <label htmlFor="signup-user" className={srOnly}>Your username</label>
        <span className="self-center pl-4 text-[16px] font-bold text-faint">@</span>
        <input
          id="signup-user"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your username"
          autoComplete="username"
          autoCapitalize="none"
          autoFocus
          spellCheck={false}
          maxLength={21}
          className="min-w-0 flex-[1_1_180px] border-0 bg-transparent px-1.5 py-3 text-[16px] text-cream outline-none placeholder:text-faint focus-visible:outline-none"
        />
        <button type="submit" disabled={busy} className={`flex-none ${primary}`}>
          {busy ? "Checking..." : "Continue"}
        </button>
      </form>
      {error ? <p role="alert" className="px-4 text-[14px] font-semibold text-orange">{error}</p> : null}
      <button type="button" onClick={onCode} className="cursor-pointer self-start border-0 bg-transparent p-2 text-[15px] text-cream">
        Got an invite code? <span className="font-extrabold underline">Use it instead</span>
      </button>
    </>
  );
}

// The moment the whole waitlist exists for. Nothing to paste, nothing to find
// in an inbox: being through the line is itself the permission, so all that is
// left is choosing a password.
function Approved({ username }: { username: string }) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) return setError("Pick a password of at least 8 characters.");
    setBusy(true);
    setError(null);
    const res = await api<{ custom_token: string }>("/api/auth/signup", {
      username,
      password,
      email: email.trim() || undefined,
    });
    if (!res.ok) {
      setBusy(false);
      return setError(res.message);
    }
    enterApp(res.data.custom_token);
  };

  return (
    <Card>
      <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-brown">@{username} · you&apos;re through</span>
      <span className={h1}>You&apos;re in.</span>
      <p className="text-[15px] leading-[1.55] text-brown">Set a password and Oyesun is yours. There&apos;s nothing else to enter.</p>

      <form onSubmit={submit} className="mt-1 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="su-pass" className="pl-1 text-[14px] font-bold text-brown">Password</label>
          <div className="flex gap-2">
            <input
              id="su-pass"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="at least 8 characters"
              autoComplete="new-password"
              autoFocus
              className={input}
            />
            <button type="button" onClick={() => setShow(!show)} className="flex-none cursor-pointer rounded-[16px] border-[1.5px] border-line bg-ember px-4 text-[14px] font-bold text-muted">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="su-email" className="pl-1 text-[14px] font-bold text-brown">Recovery email (optional)</label>
          <input
            id="su-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="only used to reset a lost password"
            autoComplete="email"
            className={input}
          />
          {/* Worth being blunt about: we hold nothing else, so there is no
              support path back in. Better said here than discovered later. */}
          <span className="pl-1 text-[13px] leading-[1.5] text-brown">
            We don&apos;t have your phone, your email or your name. Skip this and a forgotten password can&apos;t be
            recovered by anyone, including us. You can add it later in settings.
          </span>
        </div>

        <button type="submit" disabled={busy} className={`mt-1 self-start ${primary}`}>
          {busy ? "Setting up..." : "Open Oyesun"}
        </button>
        {error ? <Err>{error}</Err> : null}
      </form>
    </Card>
  );
}

// Someone a current user invited. This path doesn't touch the waitlist at all:
// the code is checked and spent by the app, exactly as it always was.
function WithCode({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const u = cleanName(username);
    if (!u) return setError("Pick a username.");
    if (password.length < 8) return setError("Pick a password of at least 8 characters.");
    if (!code.trim()) return setError("Add your invite code.");
    setBusy(true);
    setError(null);
    const res = await api<{ custom_token: string }>("/api/auth/signup-code", {
      username: u,
      password,
      code: code.trim(),
      email: email.trim() || undefined,
    });
    if (!res.ok) {
      setBusy(false);
      return setError(res.message);
    }
    enterApp(res.data.custom_token);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className={h1}>Someone let you in.</h1>
        <p className="text-[17px] leading-[1.55] text-muted">Use your code and skip the line entirely.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code-user" className="pl-1 text-[14px] font-bold text-muted">Pick a username</label>
          <input id="code-user" type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }} placeholder="lowercase, numbers, underscore" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={21} autoFocus className={input} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code-pass" className="pl-1 text-[14px] font-bold text-muted">Password</label>
          <input id="code-pass" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} placeholder="at least 8 characters" autoComplete="new-password" className={input} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code-code" className="pl-1 text-[14px] font-bold text-muted">Invite code</label>
          <input id="code-code" type="text" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }} placeholder="the code you were given" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={32} className={`${input} tracking-[0.08em]`} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code-email" className="pl-1 text-[14px] font-bold text-muted">Recovery email (optional)</label>
          <input id="code-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="only used to reset a lost password" autoComplete="email" className={input} />
        </div>
        <button type="submit" disabled={busy} className={`mt-1 self-start ${primary}`}>
          {busy ? "Setting up..." : "Open Oyesun"}
        </button>
        {error ? <p role="alert" className="px-1 text-[14px] font-semibold text-orange">{error}</p> : null}
      </form>
      <Back onClick={onBack} label="I'm on the waitlist instead" />
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-[28px] bg-cream p-[clamp(22px,4vw,32px)] text-night">{children}</div>;
}

function Err({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="text-[14px] font-semibold text-[#9A3A24]">{children}</p>;
}

function Back({ onClick, label = "Check another username" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer self-start border-0 bg-transparent p-2 text-[15px] font-bold text-faint underline">
      {label}
    </button>
  );
}
