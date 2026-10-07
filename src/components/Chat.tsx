/**
 * The pieces every chat on the page shares: the Oyesun avatar, the header and
 * the mood readout. Both the hero phone and the "reads the room" card use
 * these, so a chat looks the same wherever it appears.
 */

export type Mood = {
  /** One word for how they feel. */
  mood: string;
  /** How Oyesun answers because of it. */
  tone: string;
  /** Background and ink for the mood colour. */
  bg: string;
  fg: string;
};

export function OyesunAvatar({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <circle cx="16" cy="16" r="16" fill="#14100C" />
      <circle cx="16" cy="17" r="7" fill="#FFC94A" />
      <g stroke="#FFC94A" strokeWidth="2" strokeLinecap="round">
        <path d="M16 3.5v2.5M26.5 8.5l-1.8 1.8M5.5 8.5l1.8 1.8" />
      </g>
    </svg>
  );
}

/**
 * The mood readout. This is the thing to look at: it names the feeling Oyesun
 * picked up and the voice it answers in, in that feeling's colour.
 */
export function MoodBadge({ mood, tone, bg, fg, size = "lg" }: Mood & { size?: "lg" | "sm" }) {
  const big = size === "lg";
  return (
    <div
      className={`flex flex-col gap-0.5 rounded-2xl ${big ? "px-3.5 py-2" : "px-3 py-1.5"}`}
      style={{ background: bg, color: fg }}
    >
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: fg }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: fg }} />
        </span>
        <span className={`font-extrabold tracking-[-0.01em] ${big ? "text-[15px]" : "text-[13px]"}`}>{mood}</span>
      </span>
      <span className={`font-semibold opacity-75 ${big ? "text-[11.5px]" : "text-[11px]"}`}>{tone}</span>
    </div>
  );
}

/** Avatar, name, what it is doing, and the mood, in one row. */
export function ChatHeader({ status, mood }: { status: string; mood: Mood }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[#EBDDC4] px-5 pt-[22px] pb-3.5">
      <OyesunAvatar />
      <div className="flex min-w-0 flex-col">
        <span className="text-[15px] font-extrabold">Oyesun</span>
        <span className="text-[12px] text-brown">{status}</span>
      </div>
      <div className="ml-auto">
        <MoodBadge {...mood} />
      </div>
    </div>
  );
}

/** One message. `from` is who sent it. */
export function Bubble({ from, children }: { from: "you" | "oyesun"; children: React.ReactNode }) {
  return from === "you" ? (
    <span className="max-w-[80%] self-end rounded-[20px_20px_6px_20px] bg-night px-[15px] py-3 text-[15px] leading-[1.45] text-cream">
      {children}
    </span>
  ) : (
    <span className="max-w-[86%] self-start rounded-[20px_20px_20px_6px] bg-sand px-[15px] py-3 text-[15px] leading-[1.45] text-night">
      {children}
    </span>
  );
}

/** The three dots, while Oyesun is writing. */
export function Typing({ opacity }: { opacity: (k: number) => number }) {
  return (
    <span className="inline-flex gap-[5px] self-start rounded-[20px_20px_20px_6px] bg-sand px-4 py-3.5">
      {[0, 1, 2].map((k) => (
        <span key={k} className="h-[7px] w-[7px] rounded-full bg-brown" style={{ opacity: opacity(k) }} />
      ))}
    </span>
  );
}
