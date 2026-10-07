import { ReadsTheRoom } from "@/components/ReadsTheRoom";
import { BetweenYouTwo, FinalCta, Hero, LanguageMarquee, NotEvenUs, Remembers } from "@/components/Sections";
import { WaitlistProvider } from "@/components/Waitlist";

export default function Home() {
  return (
    <WaitlistProvider>
      <main>
        <Hero />
        <LanguageMarquee />
        <ReadsTheRoom />
        <Remembers />
        <NotEvenUs />
        <BetweenYouTwo />
        <FinalCta />
      </main>
    </WaitlistProvider>
  );
}
