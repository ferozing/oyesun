"use client";

import { useReducedMotion, useTick } from "./motion";

const convos = [
  { you: "yaar kal interview hai, bohot nervous hoon", bot: "Nervous hona normal hai. Chalo saath mein: 4 second saans andar, 4 bahar. Tumne iske liye mehnat ki hai.", mood: "Calm", bg: "#DCE9F7", fg: "#1D3B5C" },
  { you: "I GOT THE JOB!!! cant believe it", bot: "KYA BAAT HAI! Told you na! Aaj celebrate karna banta hai. Sabse pehle kisko bataoge?", mood: "Hype", bg: "#FFE0A3", fg: "#6A4A00" },
  { you: "intiki dooram ga unna, amma ni chala miss avutunna", bot: "Ardham avutundi. Ee roju ammaki call chey, nuvvu miss avutunnav ani cheppu. Aamekadi best gift.", mood: "Warm", bg: "#F9D5C4", fg: "#7A2E12" },
];

// Three chats loop: Hinglish (Calm), English (Hype), Telugu (Warm). 120 ticks of 60ms each.
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
        <div className="flex h-[580px] flex-col overflow-hidden rounded-[36px] bg-cream text-night" role="img" aria-label="A chat with Oyesun. Someone writes that they are nervous about an interview, and Oyesun helps them breathe.">
          <div className="flex items-center gap-2.5 border-b border-[#EBDDC4] px-5 pt-[22px] pb-3.5">
            <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#14100C" /><circle cx="16" cy="17" r="7" fill="#FFC94A" /></svg>
            <div className="flex flex-col">
              <span className="text-[15px] font-extrabold">Oyesun</span>
              <span className="text-[12px] text-brown">{typing ? "typing..." : "here for you"}</span>
            </div>
            <span className="ml-auto rounded-full px-2.5 py-1.5 text-[12px] font-bold" style={{ background: cv.bg, color: cv.fg }}>{cv.mood}</span>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-2.5 px-4 py-[18px]" aria-hidden="true">
            {showYou ? (
              <span className="max-w-[80%] self-end rounded-[20px_20px_6px_20px] bg-night px-[15px] py-3 text-[15px] leading-[1.45] text-cream">{cv.you}</span>
            ) : null}
            {typing ? (
              <span className="inline-flex gap-[5px] self-start rounded-[20px_20px_20px_6px] bg-sand px-4 py-3.5">
                {[0, 1, 2].map((k) => <span key={k} className="h-[7px] w-[7px] rounded-full bg-brown" style={{ opacity: dot(k) }} />)}
              </span>
            ) : null}
            {showBot ? (
              <span className="max-w-[86%] self-start rounded-[20px_20px_20px_6px] bg-sand px-[15px] py-3 text-[15px] leading-[1.45] text-night">{cv.bot}</span>
            ) : null}
          </div>
          <div className="mx-3.5 mb-4 flex items-center gap-2 rounded-full border border-[#EBDDC4] bg-white py-2 pr-2 pl-4" aria-hidden="true">
            <span className="flex-1 text-[14px] text-[#8C7A5E]">Bol na, sun raha hoon...</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-night">
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="#FFC94A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
