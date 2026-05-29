/**
 * <Wordmark> — the bracketed [Ai] Banking Institute mark, as text.
 *
 * Brand v1 (2026-05-28). Source of truth: docs/brand/brand-guide-v1.html.
 *
 * We render the mark as inline text rather than an <img>/SVG file because:
 *   1. Color inherits from parent — one component works on light/dark/mono.
 *   2. Italic "i" uses the .si class, which beats the universal italics
 *      kill in base.css via specificity. SVG <text> would not.
 *   3. Scales with em + accessibility tree includes the brand string.
 *
 * The mark itself: `[A` `i` `] Banking Institute`
 *   - brackets: gold (--gold), Inter 500
 *   - "A": Inter 600, navy (--ink) on light surfaces, cream on dark
 *   - "i":  Instrument Serif italic 400, same color as "A" (the .si class)
 *   - "Banking Institute": Inter 600, same color as "A"
 *
 * Companion lockups: <Monogram> ([Ai]) and <Mark> ([Ai]BI) in this directory.
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
      {variant === 'full' ? (
        <span aria-hidden="true" style={{ marginLeft: '0.32em' }}>
          Banking Institute
        </span>
      ) : (
        <span aria-hidden="true" style={{ marginLeft: '0.08em' }}>BI</span>
      )}
    </span>
  );
}
