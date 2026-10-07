"use client";

import { Bubble, ChatHeader, Typing, type Mood } from "./Chat";
import { useReducedMotion, useTick } from "./motion";

type Convo = { you: string; bot: string } & Mood;

// English first, and English throughout: the first thing anyone sees should be
// readable to everyone. Three different moods, so the mood readout visibly
// changes as the chats loop.
const convos: Convo[] = [
  {
    you: "interview tomorrow and i can't sleep",
    bot: "That's your body taking it seriously, not a warning. Let's slow it down: breathe in for 4, out for 6. Then tell me the one question you're dreading.",
    mood: "Anxious",
    tone: "slow and calm",
    bg: "#DCE9F7",
    fg: "#1D3B5C",
  },
  {
    you: "I GOT THE JOB!!! i can't believe it",
    bot: "YES! I knew it! Don't play this down today, you earned it. Who are you telling first?",
    mood: "Thrilled",
    tone: "loud and proud",
    bg: "#FFE0A3",
    fg: "#6A4A00",
  },
  {
    you: "everyone's busy. i haven't really talked to anyone all week",
    bot: "A whole week is a long time to hold everything on your own. I'm here now. What's been sitting with you the longest?",
    mood: "Lonely",
    tone: "warm and close",
    bg: "#F9D5C4",
    fg: "#7A2E12",
  },
];

/** Three chats loop, 120 ticks of 60ms each. */
export function HeroPhone() {
  const reduce = useReducedMotion();
  const tick = useTick(60, !reduce);
  const t = reduce ? 50 : tick;
  const cv = convos[Math.floor(t / 120) % convos.length];
  const ph = t % 120;
  const showYou = ph >= 6;
  const typing = ph >= 18 && ph < 40;
  const showBot = ph >= 40;
  const dot = (k: number) => (Math.floor(t / 3) % 3 === k ? 1 : 0.35);

  return (
    <div className="flex flex-[1_1_340px] justify-center">
      <div className="w-[340px] max-w-full rounded-[46px] border border-line bg-[#0B0907] p-3 shadow-[0_40px_100px_rgba(255,138,61,0.25)]">
        <div
          className="flex h-[580px] flex-col overflow-hidden rounded-[36px] bg-cream text-night"
          role="img"
          aria-label={`A chat with Oyesun. Someone says "${cv.you}", and Oyesun reads the mood as ${cv.mood} and answers ${cv.tone}.`}
        >
          <ChatHeader status={typing ? "typing..." : "here for you"} mood={cv} />
          <div className="flex flex-1 flex-col justify-end gap-2.5 px-4 py-[18px]" aria-hidden="true">
            {showYou ? <Bubble from="you">{cv.you}</Bubble> : null}
            {typing ? <Typing opacity={dot} /> : null}
            {showBot ? <Bubble from="oyesun">{cv.bot}</Bubble> : null}
          </div>
          <div className="mx-3.5 mb-4 flex items-center gap-2 rounded-full border border-[#EBDDC4] bg-white py-2 pr-2 pl-4" aria-hidden="true">
            <span className="flex-1 text-[14px] text-[#8C7A5E]">Say anything, I&apos;m listening...</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-night">
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="#FFC94A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
