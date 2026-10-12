import Image from "next/image";

/**
 * The brand sun, straight from the logo pack. Used on its own and as the
 * left half of the nav lockup (sun + "oyesun" wordmark).
 *
 * An <img> rather than inlined SVG on purpose: nothing here needs to recolour
 * it, the colour lives in the asset, and inlining the same artwork into every
 * nav, footer and legal page would repeat it in the markup each time.
 *
 * `decorative` is for the places where the wordmark sits right beside it — a
 * screen reader announcing "Oyesun sun" and then "oyesun" reads the brand
 * twice, so the lockup hides the image and lets the text speak.
 */
export function SunLogo({ size = 32, decorative = false }: { size?: number; decorative?: boolean }) {
  return (
    <Image
      src="/brand/03-doodle/doodle-primary.svg"
      width={size}
      height={size}
      alt={decorative ? "" : "Oyesun sun"}
      aria-hidden={decorative || undefined}
      priority
      style={{ width: size, height: size }}
    />
  );
}
