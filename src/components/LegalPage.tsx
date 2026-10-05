import Link from "next/link";
import type { ReactNode } from "react";
import { SunLogo } from "./SunLogo";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen px-[clamp(20px,4.5vw,64px)]">
      <nav aria-label="Main" className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 py-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 text-cream no-underline">
          <SunLogo />
          <span className="font-display text-[24px] font-extrabold tracking-[-0.03em]">oyesun</span>
        </Link>
        <Link href="/#waitlist" className="rounded-full bg-cream px-5 py-[13px] text-[15px] font-bold text-night no-underline">Get early access</Link>
      </nav>
      <main className="mx-auto max-w-[760px] pt-[clamp(32px,6vw,72px)] pb-[clamp(64px,9vw,120px)]">
        <h1 className="font-display text-[clamp(48px,7vw,96px)] leading-[0.9] font-extrabold tracking-[-0.05em]">{title}</h1>
        <div className="mt-8 flex flex-col gap-4 text-[17px] leading-[1.6] text-warm [&_a]:text-sun [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[28px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.03em] [&_h2]:text-cream [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </main>
      <footer className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-3 border-t border-dusk py-8 text-[14px] text-faint">
        <span>oyesun · a <a href="https://fimolabs.com" className="text-cream">Fimo Labs</a> product · <Link href="/privacy" className="text-cream">Privacy</Link> · <Link href="/terms" className="text-cream">Terms</Link></span>
        <span>Not a replacement for professional help. In a crisis, call your local helpline.</span>
      </footer>
    </div>
  );
}
