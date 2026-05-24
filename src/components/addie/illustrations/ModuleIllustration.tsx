// ModuleIllustration — bespoke SVG line-art per module. One illustration
// per Foundation module; rendered inside the module card on /foundation.
//
// All paths use currentColor + the [data-accent] hook so they inherit the
// Ledger palette (ink for primary, accent gold for emphasis). No fills —
// this is hairline editorial line-art, not filled shapes. Designed to
// pair with the addie-course-surface CSS only; safe to use elsewhere but
// will be slightly under-styled outside that scope.

import type { SVGProps } from 'react';

type ModuleKey = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface ModuleIllustrationProps extends SVGProps<SVGSVGElement> {
  readonly module: ModuleKey;
}

export function ModuleIllustration({ module, className = '', ...rest }: ModuleIllustrationProps) {
  const Body = ILLUSTRATIONS[module];
  return (
    <svg
      viewBox="0 0 240 96"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`addie-module-illus ${className}`}
      {...rest}
    >
      <Body />
    </svg>
  );
}

const ILLUSTRATIONS: Record<ModuleKey, () => JSX.Element> = {
  // M0 — Orientation. A compass / starting marker on a path.
  m0: () => (
    <g>
      <line x1="20" y1="78" x2="220" y2="78" />
      <circle cx="32" cy="78" r="6" data-accent stroke="currentColor" />
      <circle cx="32" cy="78" r="2" data-accent fill="currentColor" stroke="none" />
      <path d="M 32 50 L 32 24" data-accent />
      <path d="M 24 32 L 32 24 L 40 32" data-accent />
      <text x="56" y="34" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="currentColor" stroke="none" letterSpacing="2">
        YOU ARE HERE
      </text>
      <line x1="60" y1="78" x2="80" y2="78" strokeDasharray="2 4" />
      <line x1="90" y1="78" x2="110" y2="78" strokeDasharray="2 4" />
      <line x1="120" y1="78" x2="140" y2="78" strokeDasharray="2 4" />
      <line x1="150" y1="78" x2="170" y2="78" strokeDasharray="2 4" />
      <line x1="180" y1="78" x2="200" y2="78" strokeDasharray="2 4" />
      <circle cx="210" cy="78" r="3" stroke="currentColor" />
    </g>
  ),
  // M1 — Awareness. A network of nodes — what generative AI actually is.
  m1: () => (
    <g>
      <circle cx="60" cy="48" r="6" />
      <circle cx="120" cy="24" r="6" data-accent />
      <circle cx="120" cy="72" r="6" />
      <circle cx="180" cy="48" r="6" />
      <circle cx="60" cy="48" r="2" fill="currentColor" stroke="none" />
      <circle cx="120" cy="24" r="2" data-accent fill="currentColor" stroke="none" />
      <circle cx="120" cy="72" r="2" fill="currentColor" stroke="none" />
      <circle cx="180" cy="48" r="2" fill="currentColor" stroke="none" />
      <line x1="66" y1="46" x2="114" y2="26" />
      <line x1="66" y1="50" x2="114" y2="70" />
      <line x1="126" y1="26" x2="174" y2="46" data-accent />
      <line x1="126" y1="70" x2="174" y2="50" />
      <line x1="120" y1="30" x2="120" y2="66" strokeDasharray="2 3" />
    </g>
  ),
  // M2 — Access & workflow. A door / threshold being entered.
  m2: () => (
    <g>
      <rect x="80" y="20" width="80" height="60" rx="2" />
      <line x1="80" y1="80" x2="160" y2="80" strokeWidth="2" />
      <circle cx="150" cy="50" r="2" fill="currentColor" stroke="none" />
      <line x1="40" y1="80" x2="76" y2="80" data-accent />
      <path d="M 60 74 L 76 80 L 60 86" data-accent />
      <line x1="100" y1="80" x2="100" y2="32" />
      <line x1="140" y1="80" x2="140" y2="32" />
      <line x1="100" y1="32" x2="140" y2="32" />
      <text x="170" y="50" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="currentColor" stroke="none" letterSpacing="1">
        OPEN
      </text>
    </g>
  ),
  // M3 — Prompting. A blueprint / scaffold — the anatomy of a prompt.
  m3: () => (
    <g>
      <rect x="30" y="18" width="180" height="60" rx="2" />
      <line x1="30" y1="34" x2="210" y2="34" />
      <line x1="50" y1="18" x2="50" y2="78" strokeDasharray="2 3" />
      <text x="36" y="29" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="currentColor" stroke="none" letterSpacing="1">
        SR-01
      </text>
      <line x1="58" y1="44" x2="120" y2="44" data-accent />
      <line x1="58" y1="54" x2="200" y2="54" />
      <line x1="58" y1="64" x2="160" y2="64" />
      <line x1="58" y1="72" x2="100" y2="72" data-accent />
    </g>
  ),
  // M4 — Skills. Stacked saved-prompts (gear-like but as cards).
  m4: () => (
    <g>
      <rect x="36" y="18" width="80" height="50" rx="3" />
      <rect x="46" y="28" width="80" height="50" rx="3" data-accent />
      <rect x="56" y="38" width="80" height="50" rx="3" />
      <line x1="62" y1="50" x2="124" y2="50" />
      <line x1="62" y1="60" x2="110" y2="60" />
      <line x1="62" y1="70" x2="100" y2="70" />
      <line x1="160" y1="48" x2="210" y2="48" data-accent />
      <path d="M 196 42 L 210 48 L 196 54" data-accent />
      <circle cx="160" cy="48" r="3" data-accent fill="currentColor" stroke="none" />
    </g>
  ),
  // M5 — Build. A small structure / launch — from idea to prototype.
  m5: () => (
    <g>
      <path d="M 40 78 L 80 30 L 120 78 Z" />
      <path d="M 100 78 L 140 30 L 180 78 Z" data-accent />
      <line x1="40" y1="78" x2="200" y2="78" strokeWidth="1.5" />
      <circle cx="80" cy="42" r="2" fill="currentColor" stroke="none" />
      <circle cx="140" cy="42" r="2" data-accent fill="currentColor" stroke="none" />
      <path d="M 200 50 L 220 30" data-accent />
      <path d="M 214 28 L 220 30 L 218 36" data-accent />
    </g>
  ),
};
