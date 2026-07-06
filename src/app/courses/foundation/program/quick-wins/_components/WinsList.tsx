'use client';

import { minutesToLabel, toolLabel, type QuickWin } from '../../_lib/quickWinsData';

interface WinsListProps {
  readonly wins: QuickWin[];
  readonly loading: boolean;
}

export function WinsList({ wins, loading }: WinsListProps) {
  return (
    <section aria-labelledby="wins-list-heading" style={{ marginBottom: 48 }}>
      <h2
        id="wins-list-heading"
        style={{
          fontWeight: 700,
          fontSize: '1.375rem',
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 18px',
        }}
      >
        Your wins
      </h2>

      {loading && (
        <p style={{ fontSize: '1rem', color: 'var(--slate-500)', margin: 0 }}>Loading...</p>
      )}

      {!loading && wins.length === 0 && (
        <div
          style={{
            border: '1px dashed var(--ink-a15)',
            borderRadius: 16,
            padding: '20px 22px',
            background: 'var(--cream)',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
              margin: '0 0 8px',
            }}
          >
            Sample line — what a win looks like
          </p>
          <p
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 8px',
              lineHeight: 1.4,
            }}
          >
            Weekly exception report drafting · 45 min saved each Friday
          </p>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--slate-500)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Use the form below to log your first one.
          </p>
        </div>
      )}

      {!loading && wins.length > 0 && (
        <ol
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
          aria-label="Logged quick wins"
        >
          {wins.map((win) => (
            <li
              key={win.id}
              style={{
                background: 'var(--cream-2)',
                border: '1px solid var(--ink-a10)',
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <p
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    lineHeight: 1.4,
                    flex: 1,
                    margin: 0,
                  }}
                >
                  {win.description}
                </p>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                  }}
                >
                  {minutesToLabel(win.time_saved_minutes)}
                </span>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px 16px',
                }}
              >
                {[
                  toolLabel(win.tool),
                  win.skill_name,
                  win.frequency,
                  win.department,
                ].map((meta, i) => (
                  <span
                    key={`${win.id}-meta-${i}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--slate-500)',
                    }}
                  >
                    {meta}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
