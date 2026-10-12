import Link from "next/link";
import type { ReactNode } from "react";
import { SunLogo } from "./SunLogo";

// The shell for /signup and /login. Same nav and footer as the legal pages,
// but a narrow single column: there is one thing to do on these pages.
export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col px-[clamp(20px,4.5vw,64px)]">
      <nav aria-label="Main" className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-3 py-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 text-cream no-underline">
          <SunLogo decorative />
          <span className="font-display text-[24px] font-extrabold tracking-[-0.03em]">oyesun</span>
        </Link>
      </nav>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center pt-[clamp(24px,4vw,48px)] pb-[clamp(48px,8vw,96px)]">
        {children}
      </main>
      <footer className="mx-auto flex w-full max-w-[1240px] flex-wrap justify-between gap-3 border-t border-dusk py-8 text-[14px] text-faint">
        <span className="inline-flex items-center gap-2.5">
          <SunLogo size={24} decorative />
          <span>oyesun · a <a href="https://fimolabs.com" className="text-cream">Fimo Labs</a> product · <Link href="/privacy" className="text-cream">Privacy</Link> · <Link href="/terms" className="text-cream">Terms</Link></span>
        </span>
        <span>Not a replacement for professional help. In a crisis, call your local helpline.</span>
      </footer>
    </div>
  );
}
