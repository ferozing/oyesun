import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

const description = "Someone who actually listens. In Hinglish, Telugu, Tamil, or however you talk at 2 am. Invite only, just a username.";

export const metadata: Metadata = {
  metadataBase: new URL("https://oyesun.fimolabs.com"),
  title: { default: "Oyesun · Someone who actually listens", template: "%s · Oyesun" },
  description,
  openGraph: { title: "Oyesun · Oye, sun.", description, url: "/", siteName: "Oyesun", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: "Oyesun · Oye, sun.", description },
};

export const viewport: Viewport = { themeColor: "#14100C" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
