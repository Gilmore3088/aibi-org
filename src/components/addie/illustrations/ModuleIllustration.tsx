// ModuleIllustration — dimensional layered SVG per module. Each
// illustration uses gradients, layered shapes, soft drop shadows, and
// the Ledger accent palette to create depth without resorting to
// stock photography or icon libraries.
//
// Reference aesthetic: Stripe Press feature illustrations + Linear's
// marketing site geometry — layered abstract forms that communicate
// the module's theme. No stick figures. No flat single-stroke lines.

import type { SVGProps } from 'react';

type ModuleKey = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface ModuleIllustrationProps extends SVGProps<SVGSVGElement> {
  readonly module: ModuleKey;
  /** When 'hero', renders at a larger viewBox for module-detail/course-home use. */
  readonly variant?: 'thumb' | 'hero';
  /**
   * Optional photographic hero. When provided, renders an <img> inside the
   * same 320x220 aspect ratio with a hairline parchment frame and a
   * mono-caps credit overlay. When omitted, falls back to the bespoke SVG.
   * Source columns: addie.modules.hero_image_{url,alt,credit} (migration 00058).
   * Per DECISIONS 2026-05-23 photography is permitted inside /foundation/* only.
   */
  readonly photoUrl?: string | null;
  readonly photoAlt?: string | null;
  readonly photoCredit?: string | null;
}

export function ModuleIllustration({
  module,
  variant = 'thumb',
  className = '',
  photoUrl,
  photoAlt,
  photoCredit,
  ...rest
}: ModuleIllustrationProps) {
  if (photoUrl) {
    // Photo path: drop the SVG-only props from `rest` (we receive
    // SVGProps for type-compat with the fallback branch). The wrapper
    // div carries the same `addie-module-illus` sizing class so layout
    // is identical, plus `addie-module-photo` for object-fit + frame.
    return (
      <div
        className={`addie-module-illus addie-module-photo ${variant === 'hero' ? 'addie-module-illus--hero' : ''} ${className}`}
        data-module={module}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- intentional plain img: avoids Next/Image config for swappable operator-managed URLs */}
        <img
          src={photoUrl}
          alt={photoAlt ?? ''}
          loading="lazy"
          decoding="async"
          className="addie-module-photo__img"
        />
        {photoCredit ? (
          <span className="addie-module-photo__credit" aria-hidden="true">
            {photoCredit}
          </span>
        ) : null}
      </div>
    );
  }

  const Body = ILLUSTRATIONS[module];
  return (
    <svg
      viewBox="0 0 320 220"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-illus-m0={module === 'm0' ? '' : undefined}
      data-illus-m1={module === 'm1' ? '' : undefined}
      data-illus-m2={module === 'm2' ? '' : undefined}
      data-illus-m3={module === 'm3' ? '' : undefined}
      data-illus-m4={module === 'm4' ? '' : undefined}
      data-illus-m5={module === 'm5' ? '' : undefined}
      className={`addie-module-illus ${variant === 'hero' ? 'addie-module-illus--hero' : ''} ${className}`}
      preserveAspectRatio="xMidYMid meet"
      {...rest}
    >
      <Defs moduleKey={module} />
      <Body />
    </svg>
  );
}

function Defs({ moduleKey }: { moduleKey: ModuleKey }) {
  // Per-module gradient + shadow defs. Re-declared per instance because
  // SVG ids must be unique per render — we suffix with moduleKey.
  const id = (n: string) => `${moduleKey}-${n}`;
  return (
    <defs>
      <linearGradient id={id('paper')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--ledger-paper)" />
        <stop offset="100%" stopColor="var(--ledger-parch)" />
      </linearGradient>
      <linearGradient id={id('gold')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--ledger-accent)" stopOpacity="0.9" />
        <stop offset="100%" stopColor="var(--ledger-accent)" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id={id('navy')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--ledger-accent-2)" />
        <stop offset="100%" stopColor="var(--ledger-ink)" />
      </linearGradient>
      <linearGradient id={id('ink')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--ledger-ink)" />
        <stop offset="100%" stopColor="var(--ledger-ink-2)" />
      </linearGradient>
      <radialGradient id={id('glow')} cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stopColor="var(--ledger-accent)" stopOpacity="0.35" />
        <stop offset="100%" stopColor="var(--ledger-accent)" stopOpacity="0" />
      </radialGradient>
      <filter id={id('shadow')} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
        <feOffset dx="0" dy="4" result="off" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.25" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={id('softshadow')} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
        <feOffset dx="0" dy="2" result="off" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.18" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// ─── M0 Orientation ─────────────────────────────────────────────
// Compass rose layered over a path; a "you are here" pin glows.

function M0Illustration() {
  return (
    <g>
      {/* transparent: blends with card surface */}
      <ellipse cx="80" cy="110" rx="80" ry="80" fill="url(#m0-glow)" />

      {/* Path through the modules */}
      <path
        d="M 30 170 Q 90 130 150 160 T 290 130"
        fill="none"
        stroke="var(--ledger-rule-strong)"
        strokeWidth="1.5"
        strokeDasharray="3 5"
      />

      {/* Compass disc */}
      <g filter="url(#m0-shadow)">
        <circle cx="80" cy="110" r="58" fill="url(#m0-paper)" stroke="var(--ledger-rule-strong)" strokeWidth="1" />
        <circle cx="80" cy="110" r="46" fill="none" stroke="var(--ledger-rule)" strokeWidth="0.5" />
        <circle cx="80" cy="110" r="32" fill="none" stroke="var(--ledger-rule)" strokeWidth="0.5" />
        {/* North-east arrow filled with gold */}
        <path d="M 80 110 L 110 60 L 86 92 Z" fill="url(#m0-gold)" />
        {/* South-west arrow filled with ink */}
        <path d="M 80 110 L 50 160 L 74 128 Z" fill="url(#m0-ink)" opacity="0.65" />
        {/* Cardinal markers */}
        <text x="80" y="62" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ledger-ink)" letterSpacing="1.4">N</text>
        <text x="80" y="166" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ledger-muted)" letterSpacing="1.4">S</text>
        <text x="34" y="114" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ledger-muted)" letterSpacing="1.4">W</text>
        <text x="126" y="114" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ledger-muted)" letterSpacing="1.4">E</text>
        <circle cx="80" cy="110" r="3" fill="var(--ledger-ink)" />
      </g>

      {/* "You are here" pin */}
      <g filter="url(#m0-softshadow)">
        <circle cx="220" cy="150" r="14" fill="url(#m0-gold)" />
        <circle cx="220" cy="150" r="6" fill="var(--ledger-paper)" />
        <path d="M 220 164 L 215 178 L 225 178 Z" fill="url(#m0-gold)" />
      </g>
      <text x="220" y="120" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ledger-muted)" letterSpacing="1.8">
        START
      </text>
    </g>
  );
}

// ─── M1 What generative AI is ────────────────────────────────────
// Constellation of tokens streaming through layered nodes; one node
// glows gold (the "predicted next chunk").

function M1Illustration() {
  return (
    <g>
      {/* transparent: blends with card surface */}
      <ellipse cx="160" cy="110" rx="120" ry="60" fill="url(#m1-glow)" />

      {/* Token stream rectangles (decreasing opacity = older context) */}
      <g filter="url(#m1-softshadow)">
        {Array.from({ length: 7 }).map((_, i) => {
          const x = 20 + i * 26;
          const opacity = 0.25 + i * 0.1;
          return (
            <rect
              key={i}
              x={x}
              y="100"
              width="20"
              height="22"
              rx="3"
              fill="url(#m1-ink)"
              opacity={opacity}
            />
          );
        })}
        {/* Predicted next — gold filled */}
        <rect x="202" y="100" width="20" height="22" rx="3" fill="url(#m1-gold)" />
      </g>

      {/* Network nodes above and below */}
      <g stroke="var(--ledger-rule-strong)" strokeWidth="1" fill="none">
        <line x1="40" y1="70" x2="100" y2="40" />
        <line x1="100" y1="40" x2="170" y2="65" />
        <line x1="170" y1="65" x2="230" y2="40" />
        <line x1="230" y1="40" x2="280" y2="80" />
        <line x1="40" y1="160" x2="100" y2="190" />
        <line x1="100" y1="190" x2="180" y2="170" />
        <line x1="180" y1="170" x2="260" y2="190" />
        <line x1="100" y1="40" x2="100" y2="190" strokeDasharray="2 4" opacity="0.5" />
        <line x1="230" y1="40" x2="180" y2="170" strokeDasharray="2 4" opacity="0.5" />
      </g>
      <g>
        {[[40, 70], [100, 40], [170, 65], [230, 40], [280, 80],
          [40, 160], [100, 190], [180, 170], [260, 190]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="var(--ledger-paper)" stroke="var(--ledger-ink)" strokeWidth="1" />
        ))}
        {/* Active node — gold */}
        <circle cx="170" cy="65" r="6" fill="url(#m1-gold)" />
      </g>

      {/* Output arrow */}
      <path d="M 232 111 L 250 111" stroke="var(--ledger-accent)" strokeWidth="2" />
      <path d="M 246 107 L 252 111 L 246 115" fill="none" stroke="var(--ledger-accent)" strokeWidth="2" />
      <text x="280" y="115" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="var(--ledger-muted)" letterSpacing="1.4">
        NEXT
      </text>
    </g>
  );
}

// ─── M2 Access & workflow ────────────────────────────────────────
// Layered doorway with a layered platform stack ("getting in").

function M2Illustration() {
  return (
    <g>
      {/* transparent: blends with card surface */}

      {/* Far doorway frame */}
      <g filter="url(#m2-shadow)">
        <rect x="90" y="36" width="140" height="160" rx="6" fill="url(#m2-paper)" stroke="var(--ledger-rule-strong)" strokeWidth="1" />
        <rect x="100" y="46" width="120" height="140" rx="4" fill="var(--ledger-parch)" />
      </g>

      {/* Threshold beam — gold light coming through */}
      <path d="M 110 70 L 210 70 L 200 196 L 120 196 Z" fill="url(#m2-gold)" opacity="0.45" />

      {/* Inner door (slightly open) */}
      <g filter="url(#m2-softshadow)">
        <path
          d="M 100 46 L 160 56 L 160 186 L 100 196 Z"
          fill="url(#m2-ink)"
          opacity="0.85"
        />
        <circle cx="148" cy="120" r="2" fill="url(#m2-gold)" />
      </g>

      {/* Platform stack — layered tiles representing tools/access tiers */}
      <g filter="url(#m2-softshadow)">
        <rect x="38" y="148" width="78" height="14" rx="3" fill="url(#m2-navy)" />
        <rect x="46" y="134" width="78" height="14" rx="3" fill="url(#m2-navy)" opacity="0.85" />
        <rect x="54" y="120" width="78" height="14" rx="3" fill="url(#m2-gold)" opacity="0.9" />
      </g>

      {/* Arrow into the door */}
      <g stroke="var(--ledger-accent)" strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="140" y1="120" x2="172" y2="120" />
        <path d="M 165 114 L 174 120 L 165 126" />
      </g>

      {/* "OPEN" tag */}
      <text x="260" y="100" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ledger-accent)" letterSpacing="2" fontWeight="600">
        OPEN
      </text>
      <line x1="240" y1="110" x2="280" y2="110" stroke="var(--ledger-accent)" strokeWidth="1" />
    </g>
  );
}

// ─── M3 Prompting ────────────────────────────────────────────────
// Layered scaffold "card" with structured prompt anatomy.

function M3Illustration() {
  return (
    <g>
      {/* transparent: blends with card surface */}

      {/* Back card */}
      <g filter="url(#m3-shadow)">
        <rect x="50" y="30" width="220" height="160" rx="6" fill="url(#m3-paper)" stroke="var(--ledger-rule-strong)" strokeWidth="1" />
      </g>
      {/* Header bar */}
      <rect x="50" y="30" width="220" height="22" rx="6" fill="url(#m3-navy)" />
      <rect x="50" y="46" width="220" height="6" fill="url(#m3-navy)" />
      <text x="62" y="46" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ledger-paper)" letterSpacing="1.8" fontWeight="600">
        PROMPT · v2
      </text>
      <text x="258" y="46" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ledger-accent)" letterSpacing="1.4" fontWeight="600">
        OK
      </text>

      {/* Prompt anatomy rows — card spans x=50..270 (width 220); bars
          start at x=104 with ~8px right inset → max usable bar width = 158.
          Widths capped to stay inside the card frame. */}
      {[
        { y: 70, label: 'role', w: 56, c: 'var(--ledger-accent)' },
        { y: 88, label: 'task', w: 150, c: 'var(--ledger-ink)' },
        { y: 106, label: 'context', w: 130, c: 'var(--ledger-ink-2)' },
        { y: 124, label: 'format', w: 96, c: 'var(--ledger-accent-2)' },
        { y: 142, label: 'constraint', w: 78, c: 'var(--ledger-muted)' },
      ].map((row) => (
        <g key={row.label}>
          <text x="62" y={row.y + 4} fontFamily="JetBrains Mono, monospace" fontSize="7" fill="var(--ledger-muted)" letterSpacing="1.4">
            {row.label.toUpperCase()}
          </text>
          <rect x="104" y={row.y - 6} width={row.w} height="10" rx="2" fill={row.c} opacity="0.85" />
        </g>
      ))}

      {/* Output indicator */}
      <g filter="url(#m3-softshadow)">
        <rect x="62" y="160" width="200" height="22" rx="3" fill="url(#m3-gold)" />
        <text x="74" y="174" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ledger-ink)" letterSpacing="1.4" fontWeight="600">
          → RESPONSE
        </text>
      </g>
    </g>
  );
}

// ─── M4 Skills ───────────────────────────────────────────────────
// Stacked skill cards (a personal library) with a connector cord.

function M4Illustration() {
  return (
    <g>
      {/* transparent: blends with card surface */}
      <ellipse cx="160" cy="110" rx="120" ry="50" fill="url(#m4-glow)" />

      {/* Stacked cards — three rotated slightly */}
      <g filter="url(#m4-shadow)" transform="rotate(-6 90 130)">
        <rect x="40" y="80" width="100" height="100" rx="6" fill="url(#m4-paper)" stroke="var(--ledger-rule-strong)" strokeWidth="1" />
        <rect x="40" y="80" width="100" height="14" rx="6" fill="var(--ledger-ink)" />
        <text x="50" y="91" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="var(--ledger-paper)" letterSpacing="1.4">
          DRAFT EMAIL
        </text>
        <line x1="50" y1="110" x2="120" y2="110" stroke="var(--ledger-rule)" strokeWidth="1" />
        <line x1="50" y1="122" x2="130" y2="122" stroke="var(--ledger-rule)" strokeWidth="1" />
        <line x1="50" y1="134" x2="100" y2="134" stroke="var(--ledger-rule)" strokeWidth="1" />
        <circle cx="56" cy="160" r="6" fill="var(--ledger-accent)" />
      </g>

      <g filter="url(#m4-shadow)">
        <rect x="100" y="60" width="120" height="120" rx="6" fill="url(#m4-paper)" stroke="var(--ledger-rule-strong)" strokeWidth="1" />
        <rect x="100" y="60" width="120" height="16" rx="6" fill="url(#m4-navy)" />
        <text x="110" y="73" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ledger-paper)" letterSpacing="1.4" fontWeight="600">
          SR LETTER SUMMARY
        </text>
        <line x1="112" y1="94" x2="208" y2="94" stroke="var(--ledger-rule)" strokeWidth="1" />
        <line x1="112" y1="106" x2="200" y2="106" stroke="var(--ledger-rule)" strokeWidth="1" />
        <line x1="112" y1="118" x2="195" y2="118" stroke="var(--ledger-rule)" strokeWidth="1" />
        <line x1="112" y1="130" x2="185" y2="130" stroke="var(--ledger-rule)" strokeWidth="1" />
        <circle cx="118" cy="156" r="6" fill="url(#m4-gold)" />
        <rect x="130" y="151" width="60" height="10" rx="2" fill="url(#m4-gold)" opacity="0.4" />
      </g>

      <g filter="url(#m4-shadow)" transform="rotate(8 230 130)">
        <rect x="190" y="80" width="100" height="100" rx="6" fill="url(#m4-paper)" stroke="var(--ledger-rule-strong)" strokeWidth="1" />
        <rect x="190" y="80" width="100" height="14" rx="6" fill="var(--ledger-accent)" />
        <text x="200" y="91" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="var(--ledger-paper)" letterSpacing="1.4">
          AML NARRATIVE
        </text>
        <line x1="200" y1="110" x2="270" y2="110" stroke="var(--ledger-rule)" strokeWidth="1" />
        <line x1="200" y1="122" x2="280" y2="122" stroke="var(--ledger-rule)" strokeWidth="1" />
        <line x1="200" y1="134" x2="260" y2="134" stroke="var(--ledger-rule)" strokeWidth="1" />
      </g>
    </g>
  );
}

// ─── M5 Build ────────────────────────────────────────────────────
// Layered geometric "structure" rising — pyramid of forms, accent
// rocket trail.

function M5Illustration() {
  return (
    <g>
      {/* transparent: blends with card surface */}
      <ellipse cx="180" cy="180" rx="120" ry="22" fill="url(#m5-glow)" />

      {/* Ground line */}
      <line x1="20" y1="186" x2="300" y2="186" stroke="var(--ledger-rule-strong)" strokeWidth="1" />

      {/* Layered base structures */}
      <g filter="url(#m5-shadow)">
        <rect x="40" y="146" width="60" height="40" rx="3" fill="url(#m5-navy)" />
        <rect x="106" y="120" width="60" height="66" rx="3" fill="url(#m5-ink)" />
        <rect x="172" y="86" width="60" height="100" rx="3" fill="url(#m5-navy)" />
      </g>

      {/* Pyramid pinnacle */}
      <g filter="url(#m5-softshadow)">
        <polygon points="232,40 280,186 184,186" fill="url(#m5-gold)" />
        <line x1="232" y1="40" x2="208" y2="186" stroke="var(--ledger-paper)" strokeWidth="0.6" opacity="0.5" />
      </g>

      {/* Window dots on the structures */}
      <g fill="url(#m5-gold)" opacity="0.85">
        <circle cx="58" cy="160" r="2" />
        <circle cx="80" cy="160" r="2" />
        <circle cx="58" cy="172" r="2" />
        <circle cx="80" cy="172" r="2" />
        <circle cx="122" cy="138" r="2" />
        <circle cx="148" cy="138" r="2" />
        <circle cx="122" cy="160" r="2" />
        <circle cx="148" cy="160" r="2" />
        <circle cx="122" cy="172" r="2" />
        <circle cx="148" cy="172" r="2" />
      </g>

      {/* Launch arrow — rocket from pinnacle */}
      <g stroke="var(--ledger-accent)" strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="232" y1="40" x2="288" y2="22" />
        <path d="M 282 18 L 290 22 L 286 30" />
      </g>
      <circle cx="288" cy="22" r="4" fill="url(#m5-gold)" />
    </g>
  );
}

const ILLUSTRATIONS: Record<ModuleKey, () => JSX.Element> = {
  m0: M0Illustration,
  m1: M1Illustration,
  m2: M2Illustration,
  m3: M3Illustration,
  m4: M4Illustration,
  m5: M5Illustration,
};
