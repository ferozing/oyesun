import Link from "next/link";
import { CheckSpot } from "./CheckSpot";
import { HeroPhone } from "./HeroPhone";
import { SunLogo } from "./SunLogo";
import { HeroWaitlist, ReserveForm, WaitlistJoinedCta } from "./WaitlistCta";

const raw: [string, string][] = [
  ["bas yaar, kuch acha nahi lag raha", "Hinglish"], ["nenu okay ne, kani kaadu", "Telugu"], ["romba tired ah irukku", "Tamil"],
  ["can we just talk for a bit", "English"], ["mood off hai aaj", "Hindi"], ["ninna maathaadona", "Kannada"],
  ["exam ka tension hai bro", "Hinglish"], ["manasu baagaledu ra", "Telugu"], ["enakku thookam varala", "Tamil"],
  ["kuch share karna tha", "Hindi"], ["honestly idk what im feeling", "English"], ["ghar ki yaad aa rahi hai", "Hindi"],
];
const palette = [["#FFC94A", "#14100C"], ["#2A2219", "#FFF4E2"], ["#FF8A3D", "#14100C"], ["#FFF4E2", "#14100C"]];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-[clamp(20px,4.5vw,64px)] pb-[clamp(64px,8vw,110px)]">
      <div aria-hidden="true" className="sun-drift pointer-events-none absolute top-[320px] left-1/2 -ml-[550px] h-[1100px] w-[1100px] rounded-full opacity-55" style={{ background: "radial-gradient(circle at 50% 50%, #FFC94A 0%, #FF8A3D 34%, rgba(255,106,61,0.22) 52%, rgba(20,16,12,0) 70%)" }} />
      <div className="relative mx-auto max-w-[1240px]">
        <nav aria-label="Main" className="flex flex-wrap items-center justify-between gap-3 py-6">
          <Link href="#top" className="flex min-h-11 items-center gap-2.5 text-cream no-underline">
            <SunLogo />
            <span className="font-display text-[24px] font-extrabold tracking-[-0.03em]">oyesun</span>
          </Link>
          <a href="#waitlist" className="rounded-full bg-cream px-5 py-[13px] text-[15px] font-bold text-night no-underline">Get early access</a>
        </nav>

        <div id="top" className="flex flex-wrap items-center gap-[clamp(40px,6vw,80px)] pt-[clamp(32px,6vw,80px)]">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[26px]">
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-line-2 bg-[rgba(255,201,74,0.06)] px-3.5 py-2 text-[14px] font-semibold text-sun">
              <span className="inline-block h-2 w-2 rounded-full bg-sun" />Invite only · Letting people in a few at a time
            </span>
            <h1 className="font-display text-[clamp(64px,10vw,156px)] leading-[0.86] font-extrabold tracking-[-0.05em]">Oye,<span className="block text-sun">sun.</span></h1>
            <p className="max-w-[500px] text-[clamp(19px,1.7vw,23px)] leading-[1.5] text-warm">Someone who actually listens. In Hinglish, Telugu, Tamil, or however you talk at 2 am.</p>
            <HeroWaitlist />
          </div>
          <HeroPhone />
        </div>
      </div>
    </section>
  );
}

export function LanguageMarquee() {
  const lines = [...raw, ...raw];
  return (
    <section aria-label="Talk in any language" className="overflow-hidden border-y border-dusk py-10">
      <div className="marquee flex w-max gap-3.5 whitespace-nowrap" aria-hidden="true">
        {lines.map(([text, lang], i) => (
          <span key={i} className="inline-flex flex-none items-center gap-2.5 rounded-full px-6 py-3.5 font-display text-[clamp(22px,2.6vw,34px)] font-semibold tracking-[-0.02em]" style={{ background: palette[i % 4][0], color: palette[i % 4][1] }}>
            {text}
            <span className="font-sans text-[12px] font-bold uppercase tracking-[0.06em] opacity-70">{lang}</span>
          </span>
        ))}
      </div>
      <p className="mx-auto mt-7 max-w-[700px] px-5 text-center text-[18px] leading-[1.5] text-muted">Mix languages mid sentence. Use slang. Type how you think. Oyesun keeps up.</p>
    </section>
  );
}

export function Remembers() {
  return (
    <section className="px-[clamp(20px,4.5vw,64px)] pb-[clamp(80px,10vw,140px)]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(32px,5vw,64px)] rounded-[40px] bg-sun p-[clamp(32px,5vw,72px)] text-night">
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
          <span className="text-[14px] font-extrabold uppercase tracking-[0.08em] text-[#6A4A00]">It remembers</span>
          <h2 className="font-display text-[clamp(42px,5.2vw,78px)] leading-[0.95] font-extrabold tracking-[-0.045em]">Tell it once. It never forgets what matters.</h2>
          <p className="max-w-[440px] text-[18px] leading-[1.55] text-[#3D2D0A]">Your exams, your people, the fight with your best friend, what helps when you&apos;re low. No repeating yourself. Ever.</p>
        </div>
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-3.5">
          <div className="flex flex-col gap-2 rounded-[22px] bg-[rgba(20,16,12,0.08)] px-5 py-[18px]">
            <span className="text-[12px] font-extrabold uppercase tracking-[0.06em] text-[#6A4A00]">Monday, 11:40 pm</span>
            <span className="text-[16px] leading-[1.45]">You: maths exam on Friday, scared hoon honestly</span>
          </div>
          <div className="flex flex-col gap-2.5 rounded-[22px] bg-night px-[22px] py-5 text-cream">
            <span className="text-[12px] font-extrabold uppercase tracking-[0.06em] text-sun">Friday, 4:15 pm</span>
            <span className="text-[19px] leading-[1.45] font-semibold">Oye! Maths ho gaya? Kaisa gaya? Whatever happened, proud of you for showing up.</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {["Your people", "Your plans", "What helps you"].map((x) => (
              <span key={x} className="rounded-full border-[1.5px] border-night px-3.5 py-2 text-[14px] font-bold">{x}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const lockIcon = <svg width="34" height="34" viewBox="0 0 28 28" aria-hidden="true"><rect x="6" y="12" width="16" height="12" rx="3" fill="none" stroke="#FFC94A" strokeWidth="2" /><path d="M9.5 12V9a4.5 4.5 0 0 1 9 0v3" fill="none" stroke="#FFC94A" strokeWidth="2" /><circle cx="14" cy="18" r="1.6" fill="#FFC94A" /></svg>;
const downloadIcon = <svg width="34" height="34" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 4v12M9 11l5 5l5 -5" fill="none" stroke="#FFC94A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 18v4h18v-4" fill="none" stroke="#FFC94A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const heartIcon = <svg width="34" height="34" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 24s-9-5.2-9-12a5 5 0 0 1 9 -3a5 5 0 0 1 9 3c0 6.8 -9 12 -9 12z" fill="#14100C" /></svg>;
const cardTitle = "font-display text-[28px] leading-[1.05] font-extrabold tracking-[-0.03em]";

export function BetweenYouTwo() {
  return (
    <section className="px-[clamp(20px,4.5vw,64px)] pb-[clamp(80px,10vw,140px)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-[760px] flex-col gap-[18px]">
            <span className="text-[14px] font-bold uppercase tracking-[0.08em] text-sun">Just between you two</span>
            <h2 className="font-display text-[clamp(44px,5.6vw,84px)] leading-[0.95] font-extrabold tracking-[-0.045em]">Say anything. <span className="text-sun">It stays with your true friend.</span></h2>
          </div>
          <p className="max-w-[380px] text-[18px] leading-[1.55] text-muted">No one knows it&apos;s you. Not even us. That&apos;s how it should be when you&apos;re finally being honest.</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-4">
          <div className="flex min-h-[250px] flex-col gap-3.5 rounded-[28px] bg-cream p-[30px] text-night">
            <span className="self-start rounded-xl bg-night px-3.5 py-2 font-display text-[22px] font-extrabold text-sun">@just_me</span>
            <span className={cardTitle}>Only a username</span>
            <span className="text-[16px] leading-[1.55] text-[#4A3D28]">No phone number. No email. No real name. Sign up in five seconds, stay anonymous forever.</span>
          </div>
          <div className="flex min-h-[250px] flex-col gap-3.5 rounded-[28px] border border-line p-[30px]">
            {lockIcon}
            <span className={cardTitle}>Every chat encrypted</span>
            <span className="text-[16px] leading-[1.55] text-muted">Locked while it travels and while it&apos;s stored. Never sold, never used for ads.</span>
          </div>
          <div className="flex min-h-[250px] flex-col gap-3.5 rounded-[28px] border border-line p-[30px]">
            {downloadIcon}
            <span className={cardTitle}>Export or delete, anytime</span>
            <span className="text-[16px] leading-[1.55] text-muted">Download everything you&apos;ve said. Or ask us to delete it all, and it&apos;s gone. Your story, your call.</span>
          </div>
          <div className="flex min-h-[250px] flex-col gap-3.5 rounded-[28px] bg-orange p-[30px] text-night">
            {heartIcon}
            <span className={cardTitle}>You come first. Always.</span>
            <span className="text-[16px] leading-[1.55] text-[#2A1A08]">Talk about anything, no judgement. And if you&apos;re ever not safe, Oyesun stays with you and helps you reach real help.</span>
          </div>
        </div>
        <span className="text-[15px] text-faint">Free to start. Unlimited plans from ₹29 a month.</span>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="waitlist" className="relative overflow-hidden px-[clamp(20px,4.5vw,64px)] pt-[clamp(90px,12vw,170px)] pb-[clamp(60px,8vw,100px)] text-center">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[720px] left-1/2 -ml-[600px] h-[1200px] w-[1200px] rounded-full" style={{ background: "radial-gradient(circle at 50% 50%, #FFC94A 0%, #FF8A3D 30%, rgba(255,106,61,0.2) 50%, rgba(20,16,12,0) 68%)" }} />
      <div className="relative mx-auto flex max-w-[820px] flex-col items-center gap-[26px]">
        <h2 className="font-display text-[clamp(52px,8vw,128px)] leading-[0.9] font-extrabold tracking-[-0.05em]">Someone&apos;s ready to listen.</h2>
        <p className="text-[19px] leading-[1.5] text-warm">Oyesun is invite only for now. Reserve your username and you&apos;re in line. Nothing else needed.</p>
        <WaitlistJoinedCta fallback={<ReserveForm id="cta-wa" variant="cta" />} />
        <CheckSpot />
      </div>
      <footer className="relative mx-auto mt-[clamp(80px,10vw,140px)] flex max-w-[1240px] flex-wrap justify-between gap-3 text-left text-[14px] font-semibold text-cream">
        <span>oyesun · a <a href="https://fimolabs.com" className="text-cream underline underline-offset-2">Fimo Labs</a> product · <Link href="/privacy" className="text-cream underline underline-offset-2">Privacy</Link> · <Link href="/terms" className="text-cream underline underline-offset-2">Terms</Link></span>
        <span>Not a replacement for professional help. In a crisis, call your local helpline.</span>
      </footer>
    </section>
  );
}
