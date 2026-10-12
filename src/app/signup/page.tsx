import type { Metadata } from "next";
import { AuthPage } from "@/components/AuthPage";
import { Signup } from "@/components/Signup";
import { normalizeUsername } from "@/lib/username";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Type the username you reserved and see where you stand in the line.",
  robots: { index: false },
};

// ?u= comes from "Check your spot" on the landing page and from the approved
// card, so nobody retypes a username they just typed.
export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { u } = await searchParams;
  return (
    <AuthPage>
      <Signup initialUsername={normalizeUsername(typeof u === "string" ? u : "")} />
    </AuthPage>
  );
}
