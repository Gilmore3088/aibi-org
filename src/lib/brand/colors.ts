// Canonical brand palette for TS/JS contexts that can't read CSS custom
// properties (react-pdf documents, Satori/OG images, server-built email and
// Word HTML). These mirror the CSS tokens in src/styles/tokens-mockup.css —
// keep them in sync. DOM components should prefer the CSS var; use these only
// where a raw value is required.

export const INK = '#071A2F';
export const CREAM = '#F7F3EA';
export const GOLD = '#C8A24A';

/** On-dark / default gold-deep (mirrors --gold-deep default). */
export const GOLD_DEEP = '#9A7A2F';
/** On-light gold-deep, WCAG-AA on white/cream (mirrors the on-light token). */
export const GOLD_DEEP_ON_LIGHT = '#7A5F1E';
/** CSS-var form with the on-light hex fallback, for DOM components. */
export const GOLD_DEEP_VAR = 'var(--gold-deep, #7A5F1E)';
