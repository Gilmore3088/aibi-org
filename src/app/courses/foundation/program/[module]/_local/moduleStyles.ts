// Shared mockup-system text styles for the dynamic module page.
// Kept in module scope so the page stays self-contained (no shared LMS
// components touched in Wave 1).

import type { CSSProperties } from 'react';

export const MOCKUP_FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export const KICKER_STYLE: CSSProperties = {
  fontFamily: MOCKUP_FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

export const META_STYLE: CSSProperties = {
  fontFamily: MOCKUP_FONT,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: 'var(--slate-500)',
};

export const SECTION_H2_STYLE: CSSProperties = {
  fontFamily: MOCKUP_FONT,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '0 0 16px',
};
