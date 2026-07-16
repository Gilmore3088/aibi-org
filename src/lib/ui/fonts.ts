// Canonical Inter font-family stacks. These were copy-pasted (as INTER_STACK /
// MOCKUP_FONT / FONT_STACK / INTER) across ~42 files in five slightly different
// forms. Consumers import the variant that matches their rendering context.

/** Default on-page stack. */
export const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

/** Quoted face name — required by Satori / OpenGraph image rendering. */
export const INTER_STACK_QUOTED =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

/** Short fallback stack. */
export const INTER_STACK_SHORT = 'Inter, ui-sans-serif, system-ui, sans-serif';

/** Wraps the whole stack in the --font-inter CSS variable. */
export const INTER_STACK_VAR =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

/** --font-inter var for the face name only, then the fallback chain. */
export const INTER_STACK_VAR_INNER =
  'var(--font-inter, Inter), ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
