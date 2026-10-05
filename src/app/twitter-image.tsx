import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Oyesun. Oye, sun. Someone who actually listens.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const bricolage = await readFile(join(process.cwd(), "src/app/fonts/bricolage-800.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "#14100C", color: "#FFF4E2", fontFamily: "Bricolage" }}>
        <div style={{ position: "absolute", left: 600 - 550, top: 300, width: 1100, height: 1100, borderRadius: 9999, background: "radial-gradient(circle at 50% 50%, #FFC94A 0%, #FF8A3D 34%, rgba(255,106,61,0.22) 52%, rgba(20,16,12,0) 70%)", opacity: 0.6 }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "64px 80px", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="56" height="56" viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="#FFC94A" /><path d="M4 18h3M25 18h3M16 4v3M7 9l2 2M25 9l-2 2" stroke="#FFC94A" strokeWidth="2.4" strokeLinecap="round" /><path d="M12 19.5c1.2 1.6 6.8 1.6 8 0" fill="none" stroke="#14100C" strokeWidth="2" strokeLinecap="round" /></svg>
            <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5 }}>oyesun</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 150, fontWeight: 800, lineHeight: 0.9, letterSpacing: -7 }}>
            <span>Oye,</span>
            <span style={{ color: "#FFC94A" }}>sun.</span>
          </div>
          <span style={{ fontSize: 36, color: "#E9D9C0", maxWidth: 820 }}>Someone who actually listens. However you talk at 2 am.</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: bricolage, weight: 800, style: "normal" }] },
  );
}
