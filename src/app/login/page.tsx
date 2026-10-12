import type { Metadata } from "next";
import { AuthPage } from "@/components/AuthPage";
import { Login } from "@/components/Login";
import { normalizeUsername } from "@/lib/username";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Oyesun.",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { u } = await searchParams;
  return (
    <AuthPage>
      <Login initialUsername={normalizeUsername(typeof u === "string" ? u : "")} />
    </AuthPage>
  );
}
