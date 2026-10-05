import { ReadsTheRoom } from "@/components/ReadsTheRoom";
import { BetweenYouTwo, FinalCta, Hero, LanguageMarquee, Remembers } from "@/components/Sections";
import { WaitlistProvider } from "@/components/Waitlist";

export default function Home() {
  return (
    <WaitlistProvider>
      <main>
        <Hero />
        <LanguageMarquee />
        <ReadsTheRoom />
        <Remembers />
        <BetweenYouTwo />
        <FinalCta />
      </main>
    </WaitlistProvider>
  );
}
