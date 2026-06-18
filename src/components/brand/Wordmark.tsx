/**
 * <Wordmark> — the bracketed [Ai] Banking Institute lockup.
 *
 * Brand v1 (2026-05-28). Source of truth: docs/brand/brand-guide-v1.html.
 * The public SVG lockups in /public/brand are the visual source of truth;
 * this component keeps the same API while rendering those assets everywhere.
 */

import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

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

function toCssSize(size: string | number | undefined): string | undefined {
  if (size === undefined) return undefined;
  return typeof size === 'number' ? `${size}px` : size;
}

function wordmarkSrc(variant: NonNullable<WordmarkProps['variant']>, tone: BrandTone): string {
  if (variant === 'compact') {
    return tone === 'light' ? '/brand/aibi-mark-dark.svg' : '/brand/aibi-mark.svg';
  }

  if (tone === 'light') return '/brand/aibi-wordmark-dark.svg';
  if (tone === 'mono') return '/brand/aibi-wordmark-mono.svg';
  return '/brand/aibi-wordmark.svg';
}

function wordmarkDimensions(variant: NonNullable<WordmarkProps['variant']>): {
  width: number;
  height: number;
} {
  return variant === 'compact'
    ? { width: 260, height: 116 }
    : { width: 740, height: 116 };
}

export function Wordmark({
  variant = 'full',
  tone = 'dark',
  size,
  ariaLabel,
  className,
}: WordmarkProps) {
  const label = ariaLabel ?? (variant === 'full' ? '[Ai] Banking Institute' : '[Ai]BI');
  const height = toCssSize(size);
  const dimensions = wordmarkDimensions(variant);

  return (
    <span
      className={cn('aibi-wordmark-image', className)}
      role="img"
      aria-label={label}
      style={height ? { height } : undefined}
    >
      <Image
        className="aibi-wordmark-image__asset"
        src={wordmarkSrc(variant, tone)}
        width={dimensions.width}
        height={dimensions.height}
        alt=""
        aria-hidden="true"
        unoptimized
      />
    </span>
  );
}
