"use client";

import type { ReactNode } from "react";
import { HeroWaitlist, ReserveForm, useWaitlist } from "./Waitlist";

export { HeroWaitlist, ReserveForm };

export function WaitlistJoinedCta({ fallback }: { fallback: ReactNode }) {
  const { reserved } = useWaitlist();
  if (!reserved) return <>{fallback}</>;
  return <div className="rounded-full bg-cream px-[26px] py-[18px] font-extrabold text-night">Spot reserved. Check back with your username anytime.</div>;
}
