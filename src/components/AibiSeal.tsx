interface AibiSealProps {
  readonly size?: number;
  readonly className?: string;
}

// Circular seal with double-ring and AiBI wordmark.
// Used in the Header and anywhere the brand mark needs to appear inline.
export function AibiSeal({ size = 40, className }: AibiSealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <text
        x="32"
        y="40"
        fontFamily="var(--font-serif)"
        fontSize="18"
        fontWeight="600"
        fill="currentColor"
        textAnchor="middle"
      >
        AiBI
      </text>
    </svg>
  );
}
