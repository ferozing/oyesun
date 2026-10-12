"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "./api";
import { enterApp } from "./handoff";
import { cleanName } from "./Waitlist";

const input =
  "w-full rounded-[16px] border-[1.5px] border-line bg-ember px-4 py-3.5 text-[16px] text-cream outline-none placeholder:text-faint";

export function Login({ initialUsername = "" }: { initialUsername?: string }) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const u = cleanName(username);
    if (!u || !password) return setError("Enter your username and password.");
    setBusy(true);
    setError(null);
    const res = await api<{ custom_token: string }>("/api/auth/login", { username: u, password });
    if (!res.ok) {
      setBusy(false);
      return setError(res.message);
    }
    enterApp(res.data.custom_token);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(40px,7vw,64px)] leading-[0.92] font-extrabold tracking-[-0.045em]">Welcome back.</h1>
        <p className="text-[17px] leading-[1.55] text-muted">Same username, same password. Right where you left off.</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="li-user" className="pl-1 text-[14px] font-bold text-muted">Username</label>
          <input
            id="li-user"
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
            placeholder="your username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={21}
            autoFocus={!initialUsername}
            className={input}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="li-pass" className="pl-1 text-[14px] font-bold text-muted">Password</label>
          <div className="flex gap-2">
            <input
              id="li-pass"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="your password"
              autoComplete="current-password"
              autoFocus={Boolean(initialUsername)}
              className={input}
            />
            <button type="button" onClick={() => setShow(!show)} className="flex-none cursor-pointer rounded-[16px] border-[1.5px] border-line bg-ember px-4 text-[14px] font-bold text-muted">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button type="submit" disabled={busy} className="mt-1 cursor-pointer self-start rounded-full border-0 bg-sun px-6 py-3.5 text-[16px] font-extrabold text-night disabled:opacity-70">
          {busy ? "Opening..." : "Open Oyesun"}
        </button>
        {error ? <p role="alert" className="px-1 text-[14px] font-semibold text-orange">{error}</p> : null}
      </form>

      {forgot ? (
        // Password reset lives in the app, which is where the reset form and
        // the email sending already are. No point rebuilding it here.
        <p className="rounded-[18px] border border-line bg-ember p-4 text-[14px] leading-[1.6] text-muted">
          A reset link can only go to a recovery email, and only if you added one. If you did,{" "}
          <a href="/app" className="font-bold text-sun">open Oyesun</a> and use &quot;Forgot password&quot; on the login
          screen. If you didn&apos;t add one, there&apos;s genuinely no way back into that account — we hold nothing
          else about you. Reserving a new username is the only option, and we&apos;re sorry.
        </p>
      ) : (
        <button type="button" onClick={() => setForgot(true)} className="cursor-pointer self-start border-0 bg-transparent p-2 text-[15px] font-bold text-faint underline">
          Forgot your password?
        </button>
      )}

      <p className="px-2 text-[15px] text-faint">
        No account yet? <Link href="/signup" className="font-bold text-sun">Start here</Link>
      </p>
    </div>
  );
}
