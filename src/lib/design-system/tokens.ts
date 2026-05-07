/**
 * AiBI design tokens — typed TypeScript exports.
 *
 * Components import named tokens from this module instead of typing CSS
 * variable strings inline. Use the helper `cssVar('terra')` to produce a
 * `var(--color-terra)` string when you need it as inline-style or in
 * `<svg>` attributes.
 *
 * Intent contract: docs/superpowers/design-system/03-tokens.md
 * CSS source of truth: src/styles/tokens.css
 *
 * Keep this file in sync with tokens.css. Mismatches between them are bugs.
 */

// ---- Color · Pillar (discipline rule applies) -------------------------------

export const PILLAR_COLORS = {
  awareness: 'var(--color-sage)', // Pillar A
  understanding: 'var(--color-cobalt)', // Pillar B (also security)
  creation: 'var(--color-amber)', // Pillar C
  application: 'var(--color-terra)', // Pillar D + brand signal
} as const;

export type Pillar = keyof typeof PILLAR_COLORS;

export const PILLAR_PALE = {
  awareness: 'var(--color-sage-pale)',
  understanding: 'var(--color-cobalt-pale)',
  creation: 'var(--color-amber-light)', // amber has no -pale; use -light
  application: 'var(--color-terra-pale)',
} as const;

// ---- Color · All tokens -----------------------------------------------------

export const COLORS = {
  // Pillar
  terra: 'var(--color-terra)',
  terraLight: 'var(--color-terra-light)',
  terraPale: 'var(--color-terra-pale)',
  sage: 'var(--color-sage)',
  sagePale: 'var(--color-sage-pale)',
  cobalt: 'var(--color-cobalt)',
  cobaltPale: 'var(--color-cobalt-pale)',
  amber: 'var(--color-amber)',
  amberLight: 'var(--color-amber-light)',

  // Surfaces
  linen: 'var(--color-linen)',
  parch: 'var(--color-parch)',
  parchDark: 'var(--color-parch-dark)',
  ink: 'var(--color-ink)',

  // Text
  slate: 'var(--color-slate)',
  dust: 'var(--color-dust)',
  bone: 'var(--color-bone)',
  cream: 'var(--color-cream)',

  // Semantic
  error: 'var(--color-error)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',

  // Dividers
  hairline: 'var(--divider-hairline)',
  dividerStrong: 'var(--divider-strong)',
} as const;

export type ColorToken = keyof typeof COLORS;

// ---- Tier colors (assessment results) ---------------------------------------
// These are *roles* mapped to color tokens, used by ScoreRing and tier badges.
export const TIER_COLORS = {
  'starting-point': 'var(--color-error)',
  'early-stage': 'var(--color-terra)',
  'building-momentum': 'var(--color-terra-light)',
  'ready-to-scale': 'var(--color-sage)',
} as const;

export type Tier = keyof typeof TIER_COLORS;

// ---- Typography -------------------------------------------------------------

export const FONTS = {
  serif: 'var(--font-serif)',
  serifSc: 'var(--font-serif-sc)',
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
} as const;

export const TEXT_SIZES = {
  displayXl: 'var(--text-display-xl)',
  displayLg: 'var(--text-display-lg)',
  displayMd: 'var(--text-display-md)',
  displaySm: 'var(--text-display-sm)',
  displayXs: 'var(--text-display-xs)',
  bodyLg: 'var(--text-body-lg)',
  bodyMd: 'var(--text-body-md)',
  bodySm: 'var(--text-body-sm)',
  monoMd: 'var(--text-mono-md)',
  monoSm: 'var(--text-mono-sm)',
  labelMd: 'var(--text-label-md)',
  labelSm: 'var(--text-label-sm)',
} as const;

// ---- Spacing ----------------------------------------------------------------

export const SPACING = {
  s1: 'var(--space-1)',
  s2: 'var(--space-2)',
  s3: 'var(--space-3)',
  s4: 'var(--space-4)',
  s5: 'var(--space-5)',
  s6: 'var(--space-6)',
  s7: 'var(--space-7)',
  s8: 'var(--space-8)',
  s9: 'var(--space-9)',
  s10: 'var(--space-10)',
  s12: 'var(--space-12)',
  s16: 'var(--space-16)',
} as const;

export const CONTAINER = {
  narrow: 'var(--container-narrow)',
  default: 'var(--container-default)',
  wide: 'var(--container-wide)',
} as const;

// ---- Radius -----------------------------------------------------------------

export const RADIUS = {
  none: 'var(--radius-none)',
  hairline: 'var(--radius-hairline)',
  sharp: 'var(--radius-sharp)',
  circle: 'var(--radius-circle)',
} as const;

// ---- Motion -----------------------------------------------------------------

export const MOTION = {
  instant: 'var(--motion-instant)',
  fast: 'var(--motion-fast)',
  medium: 'var(--motion-medium)',
  slow: 'var(--motion-slow)',
} as const;

export const EASING = {
  default: 'var(--ease-default)',
  spring: 'var(--ease-spring)',
} as const;

// ---- Z-index ----------------------------------------------------------------

export const Z = {
  base: 'var(--z-base)',
  sticky: 'var(--z-sticky)',
  overlay: 'var(--z-overlay)',
  modal: 'var(--z-modal)',
  skip: 'var(--z-skip)',
} as const;

// ---- Helpers ----------------------------------------------------------------

/**
 * Generic helper to reference any CSS custom property by its short name.
 * Useful for inline `style={{ color: cssVar('terra') }}` and SVG attributes.
 *
 * @example
 *   <circle stroke={cssVar('terra')} />
 */
export function cssVar(name: string): string {
  return `var(--color-${name}, var(--${name}))`;
}

/**
 * Tier resolver — assessment scoring tiers map to brand color tokens.
 * The score thresholds match content/assessments/v2/scoring.ts (12-48 scale).
 */
export function tierForScore(score: number): Tier {
  if (score >= 39) return 'ready-to-scale';
  if (score >= 30) return 'building-momentum';
  if (score >= 21) return 'early-stage';
  return 'starting-point';
}

export function tierColor(score: number): string {
  return TIER_COLORS[tierForScore(score)];
}

/**
 * Pillar resolver — accepts a pillar slug or returns terra (the brand
 * default) when the input is undefined. Lets components fall back gracefully.
 */
export function pillarColor(pillar?: Pillar | null): string {
  if (!pillar) return PILLAR_COLORS.application;
  return PILLAR_COLORS[pillar];
}
