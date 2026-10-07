"use client";

import { useEffect, useState } from "react";
import { api, type PublicQuestion, type Spot } from "./api";
import { useReducedMotion } from "./motion";
import { cleanName, useWaitlist } from "./Waitlist";

type GameStart = { done: boolean; jumpsToday: number; answered: number[]; questions: PublicQuestion[] };
type AnswerResult = { correct: boolean; verdict: "right" | "close" | "wrong"; answer: number; close: number; gained: number; position: number | null; ahead: number | null; total: number; status: "waiting" | "invited" };
type Game =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "played" }
  | { phase: "on"; questions: PublicQuestion[]; index: number; jumps: number; choice: number | null; result: AnswerResult | null }
  | { phase: "done"; jumps: number };

const srOnly = "absolute h-px w-px overflow-hidden [clip:rect(0_0_0_0)]";
const fmt = (n: number) => n.toLocaleString("en-IN");

export function CheckSpot({ auto }: { auto?: string } = {}) {
  const { reserved } = useWaitlist();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(Boolean(auto));
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [shown, setShown] = useState(0);
  const [jump, setJump] = useState<{ n: number; key: number } | null>(null);
  const [game, setGame] = useState<Game>({ phase: "idle" });
  const [gameError, setGameError] = useState<string | null>(null);

  const target = spot?.position ?? 0;
  const displayed = reduce ? target : shown;

  // Count down to the real position, like the design.
  useEffect(() => {
    if (reduce || !spot?.position || shown <= spot.position) return;
    const id = setInterval(() => {
      setShown((s) => (s > target ? s - Math.max(1, Math.ceil((s - target) / 7)) : s));
    }, 60);
    return () => clearInterval(id);
  }, [reduce, spot?.position, shown, target]);

  // The "jumped" badge fades after a few seconds.
  useEffect(() => {
    if (!jump) return;
    const id = setTimeout(() => setJump(null), 2700);
    return () => clearTimeout(id);
  }, [jump]);

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
      setShown(res.data.position ? res.data.position + Math.max(5, Math.round(res.data.position * 0.1)) : 0);
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
    setShown(res.data.position ? res.data.position + Math.max(5, Math.round(res.data.position * 0.1)) : 0);
    setGame({ phase: "idle" });
    setGameError(null);
  };

  const startGame = async () => {
    if (!spot) return;
    setGame({ phase: "loading" });
    setGameError(null);
    const res = await api<GameStart>(`/api/game?u=${encodeURIComponent(spot.username)}`);
    if (!res.ok) { setGame({ phase: "idle" }); setGameError(res.message); return; }
    if (res.data.done) { setGame({ phase: "played" }); return; }
    const left = res.data.questions.filter((q) => !res.data.answered.includes(q.id));
    setGame({ phase: "on", questions: left, index: res.data.answered.length, jumps: res.data.jumpsToday, choice: null, result: null });
  };

  const answer = async (choice: number) => {
    if (game.phase !== "on" || game.choice !== null || !spot) return;
    const q = game.questions[0];
    setGame({ ...game, choice });
    const res = await api<AnswerResult>("/api/game/answer", { username: spot.username, questionId: q.id, choice });
    if (!res.ok) { setGame({ ...game, choice: null }); setGameError(res.message); return; }
    setGame({ ...game, choice, result: res.data, jumps: game.jumps + res.data.gained });
    if (res.data.position) setSpot({ ...spot, position: res.data.position, ahead: res.data.ahead, total: res.data.total, status: res.data.status });
    if (res.data.gained > 0) setJump({ n: res.data.gained, key: Date.now() });
  };

  const next = () => {
    if (game.phase !== "on") return;
    const rest = game.questions.slice(1);
    if (rest.length) setGame({ phase: "on", questions: rest, index: game.index + 1, jumps: game.jumps, choice: null, result: null });
    else setGame({ phase: "done", jumps: game.jumps });
  };

  if (!open) {
    return (
      <button type="button" onClick={openCheck} className="cursor-pointer border-0 bg-transparent p-3 text-[15px] text-cream">
        Already reserved? <span className="font-extrabold underline">Check your spot</span>
      </button>
    );
  }

  const barPct = spot?.position
    ? Math.max(4, Math.min(100, Math.round(100 * (1 - (displayed - 1) / Math.max(spot.total, displayed, 1)))))
    : 100;

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
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-brown">@{spot.username} · your spot</span>
              <span className="font-display text-[64px] leading-[0.9] font-extrabold tracking-[-0.05em]">You&apos;re in.</span>
              <span className="mt-2 text-[14px] text-brown">Welcome to Oyesun. Your invite is on its way.</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-brown">@{spot.username} · your spot</span>
                  <span className="font-display text-[64px] leading-[0.9] font-extrabold tracking-[-0.05em]" aria-live="polite">#{fmt(displayed)}</span>
                </div>
                {jump ? (
                  <span key={jump.key} className="pop rounded-full bg-[#1F8A4C] px-3.5 py-2 text-[15px] font-extrabold text-white">▲ {jump.n} spots</span>
                ) : null}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#EBDDC4]">
                <div className="h-full rounded-full bg-orange transition-[width] duration-300" style={{ width: `${barPct}%` }} />
              </div>
              <span className="text-[14px] text-brown">{fmt(Math.max(0, displayed - 1))} people ahead of you. Real usernames, real line.</span>

              {game.phase === "idle" || game.phase === "loading" ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-night px-[18px] py-4 text-cream">
                  <div className="flex flex-[1_1_220px] flex-col gap-1">
                    <span className="font-display text-[22px] font-extrabold tracking-[-0.02em]">Want to jump the line?</span>
                    <span className="text-[14px] text-muted">Play Read the Room. 3 rounds. Right +5, close +2, wrong −2. Up to 10 spots a day.</span>
                  </div>
                  <button type="button" onClick={startGame} disabled={game.phase === "loading"} className="cursor-pointer rounded-full border-0 bg-sun px-5 py-[13px] text-[15px] font-extrabold text-night disabled:opacity-70">
                    {game.phase === "loading" ? "Loading..." : "Play"}
                  </button>
                </div>
              ) : null}

              {game.phase === "on" ? <Round game={game} onAnswer={answer} onNext={next} /> : null}

              {game.phase === "done" ? (
                <div className="flex flex-col gap-1.5 rounded-[18px] bg-sun p-[18px]">
                  <span className="font-display text-[26px] font-extrabold tracking-[-0.02em]">
                    {game.jumps > 0 ? `You jumped ${game.jumps} spots. Nice read.` : "No jump today."}
                  </span>
                  <span className="text-[14px] text-[#3D2D0A]">
                    {game.jumps > 0
                      ? "You clearly get people. Oyesun will like you. New round unlocks tomorrow."
                      : "Reading a room is harder than it looks. New round unlocks tomorrow."}
                  </span>
                </div>
              ) : null}

              {game.phase === "played" ? (
                <div className="flex flex-col gap-1.5 rounded-[18px] bg-sun p-[18px]">
                  <span className="font-display text-[26px] font-extrabold tracking-[-0.02em]">You played today.</span>
                  <span className="text-[14px] text-[#3D2D0A]">New round unlocks tomorrow. Come back and jump again.</span>
                </div>
              ) : null}

              {gameError ? <p role="alert" className="text-[14px] font-semibold text-[#9A3A24]">{gameError}</p> : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Round({ game, onAnswer, onNext }: {
  game: Extract<Game, { phase: "on" }>;
  onAnswer: (choice: number) => void;
  onNext: () => void;
}) {
  const q = game.questions[0];
  const r = game.result;
  const answered = r !== null;
  const last = game.questions.length === 1;

  return (
    <div className="flex flex-col gap-3.5 rounded-[18px] bg-night p-[18px] text-cream">
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-sun">Read the Room · Round {game.index + 1} of 3</span>
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-[22px] rounded-full" style={{ background: i < game.index || (i === game.index && answered) ? "#FFC94A" : "#3A2A1C" }} />
          ))}
        </div>
      </div>
      <span className="text-[14px] text-muted">Someone texts Oyesun. How are they feeling?</span>
      <span className="max-w-[92%] self-start rounded-[18px_18px_18px_6px] bg-cream px-4 py-3 text-[17px] leading-[1.4] font-semibold text-night">{q.msg}</span>
      <div className="flex flex-wrap gap-2">
        {q.opts.map((label, i) => {
          let style = { bg: "transparent", fg: "#FFF4E2", border: "#4A3A24" };
          if (answered && i === r.answer) style = { bg: "#1F8A4C", fg: "#FFFFFF", border: "#1F8A4C" };
          else if (answered && i === game.choice) style = { bg: "#3A2A1C", fg: "#C9B796", border: "#3A2A1C" };
          else if (!answered && i === game.choice) style = { bg: "transparent", fg: "#FFC94A", border: "#FFC94A" };
          return (
            <button
              key={label}
              type="button"
              onClick={() => onAnswer(i)}
              disabled={game.choice !== null}
              className="flex-[1_1_90px] cursor-pointer rounded-[14px] border-[1.5px] px-3 py-[13px] text-[15px] font-extrabold disabled:cursor-default"
              style={{ background: style.bg, color: style.fg, borderColor: style.border }}
            >
              {label}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span
            className="text-[15px] font-bold"
            style={{ color: r.verdict === "right" ? "#7BE0A3" : r.verdict === "close" ? "#FFC94A" : "#FF8A3D" }}
          >
            {r.verdict === "right"
              ? `Spot on! +${r.gained} spots`
              : r.verdict === "close"
                ? `Close. They felt ${q.opts[r.answer].toLowerCase()}. +${r.gained}`
                : r.gained < 0
                  ? `Not quite. They felt ${q.opts[r.answer].toLowerCase()}. ${r.gained} spots`
                  : `Not quite. They felt ${q.opts[r.answer].toLowerCase()}.`}
          </span>
          <button type="button" onClick={onNext} className="cursor-pointer rounded-full border-0 bg-sun px-[18px] py-[11px] text-[14px] font-extrabold text-night">
            {last ? "See my spot" : "Next"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
