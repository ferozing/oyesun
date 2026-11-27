import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>Last updated 27 November 2026</p>
      <p>
        Oyesun is made by Fimo Labs. Privacy is the point of Oyesun, so this page is short and plain. It covers this
        website and the Oyesun waitlist.
      </p>

      <h2>What we keep</h2>
      <ul>
        <li>The username you pick.</li>
        <li>Your place in line, how many spots you jumped in Read the Room, and the date you last played.</li>
        <li>Whether you are still waiting or have been invited.</li>
      </ul>

      <h2>What we never ask for or keep</h2>
      <ul>
        <li>No phone number, no email and no real name to reserve a spot.</li>
        <li>No IP address and no device ID. To stop spam, we briefly check how often requests come from the same connection. That check lives only in memory and is gone within a minute.</li>
        <li>No advertising trackers. We never sell your data.</li>
      </ul>

      <h2>If you ask us to notify you</h2>
      <p>
        The Notify me box is optional. If you type an email or WhatsApp number there, we keep it only to send you one
        message when you are in. After that message is sent, we delete it.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Waitlist data is stored with Supabase, our database provider, and this website runs on Vercel. They process
        data only to run Oyesun for us.
      </p>

      <h2>Deleting your spot</h2>
      <p>
        Write to <a href="mailto:feroz@fimolabs.com">feroz@fimolabs.com</a> with your username and we will delete
        your spot and anything linked to it within 30 days.
      </p>

      <h2>When you create an account</h2>
      <p>
        We keep your 18+ confirmation and the date you gave it to record your eligibility for the beta.
        If you choose to share your gender, we keep your selection to understand who is joining.
        The <a href="/app/privacy">app privacy policy</a> explains how to export or delete account data.
      </p>

      <h2>Not a crisis service</h2>
      <p>
        Oyesun is not a replacement for professional help. If you are in danger or thinking about hurting yourself,
        call 112, or Tele MANAS on 14416 for free mental health support in India.
      </p>

      <h2>Contact</h2>
      <p>
        fimolabs, email <a href="mailto:feroz@fimolabs.com">feroz@fimolabs.com</a>
      </p>
    </LegalPage>
  );
}
