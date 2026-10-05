import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>Last updated 6 October 2026</p>
      <p>These terms apply when you use this website and the Oyesun waitlist, run by Fimo Labs. By reserving a username, you agree to them.</p>

      <h2>Who can join</h2>
      <p>You need to be 18 or older, or have permission from a parent or guardian to join.</p>

      <h2>The waitlist</h2>
      <ul>
        <li>Oyesun is invite only for now. We let people in a few at a time.</li>
        <li>Your place in line is an estimate and can change. Reserving a spot does not guarantee an invite by any date.</li>
        <li>One username per person. Pick a name that does not pretend to be someone else and is not offensive. We may remove usernames that break these terms.</li>
      </ul>

      <h2>Read the Room</h2>
      <ul>
        <li>You can play one game a day and jump up to 15 spots a day.</li>
        <li>Bots, scripts or multiple usernames used to jump the line are not allowed. We may reset jumps that come from them.</li>
      </ul>

      <h2>Price</h2>
      <p>Oyesun is free to start. Unlimited plans start from ₹29 a month. We will show the full price before you pay for anything.</p>

      <h2>Not professional help</h2>
      <p>
        Oyesun is a companion to talk to. It is not a doctor, therapist or emergency service. In a crisis, call 112, or
        Tele MANAS on 14416 for free mental health support in India.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms as Oyesun grows. If a change is important, we will tell you before it applies.</p>

      <h2>Law</h2>
      <p>These terms are governed by the laws of India, and courts in Chennai have jurisdiction.</p>

      <h2>Contact</h2>
      <p>Fimo Labs, 7G, Velachery, Chennai 600042. Email <a href="mailto:pm.ferozmd@gmail.com">pm.ferozmd@gmail.com</a>.</p>
    </LegalPage>
  );
}
