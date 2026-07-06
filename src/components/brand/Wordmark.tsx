/**
 * <Wordmark> — the bracketed [Ai] Banking Institute lockup.
 *
 * Brand v1 (2026-05-28). Source of truth: docs/brand/brand-guide-v1.html.
 *
 * Rendered as a typographic lockup (self-hosted next/font faces via the
 * .aibi-mark classes in brand.css), NOT the /public/brand SVG files: those
 * SVGs @import Google Fonts at runtime, and on networks that block that
 * fetch — standard egress filtering at community banks — the fallback font
 * overflowed the fixed viewBox and the header logo clipped to
 * "[Ai] Banking Insti" (persona audit, 2026-07-03). The SVG files remain in
 * /public/brand for email/PDF surfaces that embed them directly.
 */

import { cn } from '@/lib/utils/cn';

export type BrandTone = 'dark' | 'light' | 'mono';

export interface WordmarkProps {
  /** Display variant. 'full' renders "[Ai] Banking Institute"; 'compact' renders "[Ai]BI". */
  variant?: 'full' | 'compact';
  /** Color tone. `light` is for dark surfaces (cream + gold). `mono` is single-color (print, certs). Default `dark`. */
  tone?: BrandTone;
  /** Font size for the lockup. Accepts any valid CSS length. Default 16px. */
  size?: string | number;
  /** Optional accessible label. Defaults to the lockup string. */
  ariaLabel?: string;
  /** Additional class names. */
  className?: string;
}

function toneClass(tone: BrandTone): string {
  if (tone === 'light') return 'aibi-mark--dark';
  if (tone === 'mono') return 'aibi-mark--mono';
  return '';
}

function toCssSize(size: string | number | undefined): string | undefined {
  if (size === undefined) return undefined;
  return typeof size === 'number' ? `${size}px` : size;
}

export function Wordmark({
  variant = 'full',
  tone = 'dark',
  size,
  ariaLabel,
  className,
}: WordmarkProps) {
  const label = ariaLabel ?? (variant === 'full' ? '[Ai] Banking Institute' : '[Ai]BI');
  const fontSize = toCssSize(size);

  return (
    <span
      className={cn('aibi-mark', toneClass(tone), className)}
      role="img"
      aria-label={label}
      style={fontSize ? { fontSize } : undefined}
    >
      <span className="bk" aria-hidden="true">[</span>
      <span className="ai" aria-hidden="true">A</span>
      <span className="si" aria-hidden="true">i</span>
      <span className="bk" aria-hidden="true">]</span>
      <span className="wt" aria-hidden="true">
        {variant === 'full' ? 'Banking Institute' : 'BI'}
      </span>
    </span>
  );
}
