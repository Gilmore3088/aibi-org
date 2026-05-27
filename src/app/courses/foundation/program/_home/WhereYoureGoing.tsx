// WhereYoureGoing — the next 3 modules in plain ordered prose
// (not pillared), each as "Module N: Title → produces [artifact]".
// Beyond that: "+ N more modules" link.
//
// Audit §2 item 4.

import Link from 'next/link';
import type { LMSModule } from '@/components/lms';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface WhereYoureGoingProps {
  readonly lmsModules: readonly LMSModule[];
  readonly currentModuleNum: number;
  readonly completedModules: readonly number[];
}

export function WhereYoureGoing({
  lmsModules,
  currentModuleNum,
  completedModules,
}: WhereYoureGoingProps) {
  const upcoming = lmsModules.filter(
    (m) => m.num > currentModuleNum && !completedModules.includes(m.num),
  );
  const next3 = upcoming.slice(0, 3);
  const remaining = upcoming.length - next3.length;

  if (next3.length === 0) return null;

  return (
    <section
      style={{
        marginBottom: 40,
        background: 'var(--cream-2)',
        border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
        borderRadius: 24,
        padding: 'clamp(24px, 3vw, 32px)',
        fontFamily: FONT_INTER,
      }}
      aria-labelledby="where-going-heading"
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          marginBottom: 8,
        }}
      >
        Where you are going
      </div>
      <h2
        id="where-going-heading"
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          marginBottom: 20,
        }}
      >
        Up next
      </h2>

      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 12,
        }}
      >
        {next3.map((mod) => (
          <li
            key={mod.num}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'baseline',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 16,
              background: '#FFFFFF',
              border: '1px solid var(--slate-200)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--slate-500)',
                whiteSpace: 'nowrap',
              }}
            >
              Module {String(mod.num).padStart(2, '0')}
            </span>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  letterSpacing: '-0.005em',
                }}
              >
                {mod.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--slate-600)',
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: 'var(--slate-500)' }} aria-hidden="true">→ </span>
                Produces {mod.output}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {remaining > 0 && (
        <div style={{ marginTop: 20 }}>
          <Link
            href="#full-curriculum"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--gold-deep)',
              paddingBottom: 2,
            }}
          >
            + {remaining} more module{remaining === 1 ? '' : 's'}
          </Link>
        </div>
      )}
    </section>
  );
}
