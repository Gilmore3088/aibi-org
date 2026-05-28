// Shared inline styles + date helper for the certificate page.
// Kept here so the page stays self-contained and matches the per-page
// sketch convention.

import type { CSSProperties } from 'react';

export const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export const KICKER: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

export const META_LABEL: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
