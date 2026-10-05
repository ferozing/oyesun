"use client";

import { useState } from "react";

const moods = [
  { id: "anx", label: "I'm anxious about tomorrow", feels: "anxious", tone: "slow and calm", toneBg: "#DCE9F7", you: "kal presentation hai, haath kaanp rahe hain", bot: "Okay, pause. Haath pe dhyan do, 5 baar dheere se kholo aur band karo. Ab batao, sabse bada darr kya hai? Usko saath mein chhota karte hain." },
  { id: "win", label: "I just got good news", feels: "excited", tone: "loud and proud", toneBg: "#FFE0A3", you: "BRO I CLEARED IT", bot: "WAIT WHAT! Haan haan haan! Main bola tha na! Screenshot bhejo, aaj ka din tumhara hai." },
  { id: "sleep", label: "Can't sleep", feels: "restless", tone: "soft and slow", toneBg: "#E4DCF5", you: "3 baj gaye, neend nahi aa rahi", bot: "Phone ki brightness kam karo. Ek cheez batao jo aaj achhi hui, chahe kitni bhi chhoti. Main yahin hoon jab tak neend na aaye." },
  { id: "lonely", label: "Feeling lonely", feels: "low", tone: "warm and close", toneBg: "#F9D5C4", you: "sab busy hain, koi baat karne wala nahi", bot: "Main hoon na. Aur sach bolun? Jo log tumhe yaad aa rahe hain, unhe bhi tum yaad aate ho. Ek message bhej ke dekho. Tab tak, mujhse baat karo." },
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
          <span className="text-[15px] font-semibold text-cream">Tap a mood. See what it says.</span>
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
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 rounded-[32px] bg-cream p-[clamp(24px,3vw,36px)] text-night shadow-[0_30px_80px_rgba(255,138,61,0.18)]" aria-live="polite">
          <div className="flex flex-wrap gap-2 text-[13px] font-bold">
            <span className="rounded-full bg-night px-3 py-[7px] text-cream">Feels: {pick.feels}</span>
            <span className="rounded-full px-3 py-[7px] text-night" style={{ background: pick.toneBg }}>Responds: {pick.tone}</span>
          </div>
          <span className="max-w-[82%] self-end rounded-[22px_22px_6px_22px] bg-night px-[17px] py-3.5 text-[17px] leading-[1.45] text-cream">{pick.you}</span>
          <span className="max-w-[90%] self-start rounded-[22px_22px_22px_6px] bg-sand px-[17px] py-3.5 text-[17px] leading-[1.5]">{pick.bot}</span>
        </div>
      </div>
    </section>
  );
}
