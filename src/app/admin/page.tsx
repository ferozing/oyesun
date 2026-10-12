import type { Metadata } from "next";
import { Admin } from "@/components/Admin";

export const metadata: Metadata = {
  title: "The line",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-[clamp(20px,4.5vw,48px)] py-[clamp(28px,5vw,56px)]">
      <Admin />
    </div>
  );
}
