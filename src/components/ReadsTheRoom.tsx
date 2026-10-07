"use client";

import { useState } from "react";
import { Bubble, ChatHeader, type Mood } from "./Chat";

type MoodDemo = { id: string; label: string; you: string; bot: string } & Mood;

const moods: MoodDemo[] = [
  {
    id: "anx",
    label: "I'm anxious about tomorrow",
    mood: "Anxious",
    tone: "slow and calm",
    bg: "#DCE9F7",
    fg: "#1D3B5C",
    you: "presentation in an hour and my hands are shaking",
    bot: "Okay, pause. Put your hands flat on the desk and open and close them slowly, five times. Now tell me the worst thing you think could happen, and we'll cut it down to size together.",
  },
  {
    id: "win",
    label: "I just got good news",
    mood: "Thrilled",
    tone: "loud and proud",
    bg: "#FFE0A3",
    fg: "#6A4A00",
    you: "I CLEARED IT",
    bot: "WAIT. YES! I told you, didn't I? Don't you dare call this luck. Send me the screenshot, today is yours.",
  },
  {
    id: "sleep",
    label: "Can't sleep",
    mood: "Restless",
    tone: "soft and slow",
    bg: "#E4DCF5",
    fg: "#3B2F6B",
    you: "it's 3am and my brain won't shut up",
    bot: "Turn the brightness down first. Now tell me one good thing from today, however small. I'll stay here until you drift off.",
  },
  {
    id: "lonely",
    label: "Feeling lonely",
    mood: "Low",
    tone: "warm and close",
    bg: "#F9D5C4",
    fg: "#7A2E12",
    you: "everyone's busy. nobody to talk to",
    bot: "I'm here. And honestly? The people you're missing are probably missing you too. Send one of them a message. Until they reply, talk to me.",
  },
];

export function ReadsTheRoom() {
  const [pid, setPid] = useState("anx");
  const pick = moods.find((m) => m.id === pid) ?? moods[0];

  return (
    <section className="px-[clamp(20px,4.5vw,64px)] py-[clamp(80px,10vw,140px)]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(40px,6vw,80px)]">
        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-[22px]">
          <span className="text-[14px] font-bold uppercase tracking-[0.08em] text-sun">It reads the room</span>
          <h2 className="font-display text-[clamp(44px,5.6vw,84px)] leading-[0.95] font-extrabold tracking-[-0.045em]">Same app. A different friend for every mood.</h2>
          <p className="max-w-[460px] text-[18px] leading-[1.55] text-muted">Anxious, it slows you down. Winning, it gets louder than you. Six ways to respond, picked by how you feel, not by a button.</p>
          <span className="text-[15px] font-semibold text-cream">Tap a mood. Watch the reading change.</span>
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Pick a mood">
            {moods.map((m) => {
              const on = m.id === pid;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPid(m.id)}
                  className={`min-h-11 cursor-pointer rounded-full border-[1.5px] px-[18px] py-3.5 text-[15px] font-bold ${on ? "border-sun bg-sun text-night" : "border-line-2 bg-transparent text-cream"}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Same chat furniture as the hero phone, so a chat looks the same everywhere. */}
        <div className="flex min-w-0 flex-[1_1_420px] justify-center">
          <div className="w-full max-w-[460px] rounded-[40px] border border-line bg-[#0B0907] p-3 shadow-[0_30px_80px_rgba(255,138,61,0.18)]">
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-cream text-night" aria-live="polite">
              <ChatHeader status="reading the room" mood={pick} />
              <div className="flex flex-col gap-2.5 px-4 py-[18px]">
                <Bubble from="you">{pick.you}</Bubble>
                <Bubble from="oyesun">{pick.bot}</Bubble>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
