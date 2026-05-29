/**
 * <Monogram> — the [Ai] mark only. Icon-sized.
 *
 * Use for small surfaces: nav on mobile, app icon contexts, social previews
 * at small render sizes, footer credit lines, certificate badges. For the
 * full lockup use <Wordmark>; for the [Ai]BI compact lockup use <Mark>.
 *
 * Brand v1 (2026-05-28).
 */

import { cn } from '@/lib/utils/cn';
import type { BrandTone } from './Wordmark';

export interface MonogramProps {
  tone?: BrandTone;
  size?: string | number;
  ariaLabel?: string;
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

export function Monogram({
  tone = 'dark',
  size,
  ariaLabel = '[Ai]',
  className,
}: MonogramProps) {
  const fontSize = toCssSize(size);

  return (
    <span
      className={cn('aibi-mark', toneClass(tone), className)}
      role="img"
      aria-label={ariaLabel}
      style={fontSize ? { fontSize } : undefined}
    >
      <span className="bk" aria-hidden="true">[</span>
      <span className="ai" aria-hidden="true">A</span>
      <span className="si" aria-hidden="true">i</span>
      <span className="bk" aria-hidden="true">]</span>
    </span>
  );
}
