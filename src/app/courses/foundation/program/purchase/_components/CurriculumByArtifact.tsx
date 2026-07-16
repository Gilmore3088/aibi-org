// CurriculumByArtifact — flat ordered list of all Foundation modules keyed by
// the artifact each one produces. Replaces the pillar-grouped view.
// Uses <details> for native expand/collapse so the component stays a
// server component with no client JS.

import { modules } from '@content/courses/foundation-program';
import { INTER_STACK_VAR as INTER_STACK } from '@/lib/ui/fonts';


export function CurriculumByArtifact() {
  const ordered = [...modules].sort((a, b) => a.number - b.number);

  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 22, maxWidth: 720 }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: INTER_STACK,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          The full curriculum
        </span>
        <h2
          style={{
            fontFamily: INTER_STACK,
            fontWeight: 700,
            fontSize: 'clamp(1.625rem, 2.8vw, 2.125rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          Eighteen bite-sized modules, eighteen saved artifacts.
        </h2>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.9375rem',
            color: 'var(--slate-600)',
            lineHeight: 1.55,
            margin: '10px 0 0',
            maxWidth: '60ch',
          }}
        >
          Each module produces a saved artifact. Click any row to read what
          the module covers and what you leave with.
        </p>
      </div>

      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          background: '#fff',
          border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {ordered.map((m, i) => (
          <li
            key={m.id}
            style={{
              borderTop: i === 0 ? 'none' : '1px solid var(--ink-a10, rgba(7,26,47,0.08))',
            }}
          >
            <details>
              <summary
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr auto',
                  gap: 18,
                  alignItems: 'center',
                  padding: '18px 24px',
                  cursor: 'pointer',
                  fontFamily: INTER_STACK,
                  listStyle: 'none',
                }}
              >
                <span
                  aria-label={`Module ${m.number}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: 'var(--ink)',
                    color: 'var(--gold)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    flex: 'none',
                  }}
                >
                  {String(m.number).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {m.title}{' '}
                  <span
                    style={{
                      fontWeight: 500,
                      color: 'var(--slate-600)',
                      fontSize: '0.875rem',
                    }}
                  >
                    → produces {m.keyOutput}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--slate-500)',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.estimatedMinutes} min
                </span>
              </summary>

              <div
                style={{
                  padding: '4px 24px 22px 82px',
                  fontFamily: INTER_STACK,
                  fontSize: '0.875rem',
                  color: 'var(--slate-600)',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-deep)',
                      marginRight: 8,
                    }}
                  >
                    You leave with
                  </span>
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
                    {m.keyOutput}
                  </span>
                </div>
                <div>
                  Pillar: {m.pillar.charAt(0).toUpperCase() + m.pillar.slice(1)} ·{' '}
                  {m.estimatedMinutes} minutes of self-paced material with
                  guided practice and a saved artifact.
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
