export function SunLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="18" r="9" fill="#FFC94A" />
      <path d="M4 18h3M25 18h3M16 4v3M7 9l2 2M25 9l-2 2" stroke="#FFC94A" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 19.5c1.2 1.6 6.8 1.6 8 0" fill="none" stroke="#14100C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
