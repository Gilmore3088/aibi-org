// FullCurriculumAccordion — collapses the existing CourseStructure
// pillar grid behind a native <details> "Show all modules" trigger.
// Stays server-renderable (no client state).
//
// Audit §2 item 5.

import type { ReactNode } from 'react';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface FullCurriculumAccordionProps {
  readonly totalModules: number;
  readonly children: ReactNode;
}

export function FullCurriculumAccordion({
  totalModules,
  children,
}: FullCurriculumAccordionProps) {
  return (
    <section id="full-curriculum" style={{ fontFamily: FONT_INTER }}>
      <details
        style={{
          borderRadius: 24,
          border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
          background: 'var(--cream)',
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            listStyle: 'none',
            cursor: 'pointer',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            fontFamily: FONT_INTER,
          }}
        >
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              Full curriculum
            </span>
            <span
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.005em',
              }}
            >
              Show all {totalModules} modules
            </span>
          </span>
          <span
            aria-hidden="true"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Expand
          </span>
        </summary>
        <div style={{ padding: '0 4px 4px' }}>{children}</div>
      </details>
    </section>
  );
}
