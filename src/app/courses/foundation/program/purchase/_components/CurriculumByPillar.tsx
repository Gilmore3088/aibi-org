// CurriculumByPillar — marketing-style pillar grouping for the purchase landing.
//
// Renders the four Foundation pillars (Awareness / Understanding / Creation /
// Application), each with its modules listed in row form: number · title ·
// "You'll keep <keyOutput>" · minutes.  Used on the non-enrolled purchase
// page to show prospects the full curriculum without committing.

import type { Pillar } from '@content/courses/foundation-program';
import { modules } from '@content/courses/foundation-program';

interface PillarBlock {
  readonly id: Pillar;
  readonly num: string;
  readonly label: string;
}

const PILLAR_BLOCKS: readonly PillarBlock[] = [
  { id: 'awareness',     num: '01', label: 'Awareness' },
  { id: 'understanding', num: '02', label: 'Understanding' },
  { id: 'creation',      num: '03', label: 'Creation' },
  { id: 'application',   num: '04', label: 'Application' },
] as const;

export function CurriculumByPillar() {
  return (
    <section style={{ margin: '56px 0' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingBottom: 18,
          marginBottom: 32,
          borderBottom: '1px solid var(--ledger-rule-strong)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ledger-accent)',
            fontWeight: 600,
          }}
        >
          Curriculum
        </span>
        <h2
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontWeight: 500,
            fontSize: 'clamp(34px, 4vw, 48px)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--ledger-ink)',
          }}
        >
          From cautious to capable in twelve modules.
        </h2>
      </div>

      {PILLAR_BLOCKS.map((pillar) => {
        const pillarModules = modules.filter((m) => m.pillar === pillar.id);
        const totalMinutes = pillarModules.reduce(
          (sum, m) => sum + m.estimatedMinutes,
          0,
        );

        return (
          <div
            key={pillar.id}
            style={{
              borderBottom: '1px solid var(--ledger-rule)',
              paddingBottom: 28,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 18,
                marginBottom: 16,
                paddingBottom: 10,
                borderBottom: '1px dashed var(--ledger-rule)',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--ledger-accent)',
                  fontWeight: 700,
                }}
              >
                Pillar {pillar.num} — {pillar.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ledger-muted)',
                  marginLeft: 'auto',
                  fontWeight: 600,
                }}
              >
                {pillarModules.length} modules · {totalMinutes} min
              </span>
            </div>

            {pillarModules.map((mod) => (
              <div
                key={mod.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr 240px 100px',
                  gap: 24,
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderBottom: '1px solid var(--ledger-rule)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--ledger-serif)',
                    fontSize: 26,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: 'var(--ledger-ink)',
                    fontWeight: 500,
                    minWidth: 44,
                  }}
                >
                  {String(mod.number).padStart(2, '0')}
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: 'var(--ledger-serif)',
                      fontWeight: 500,
                      fontSize: 19,
                      lineHeight: 1.2,
                      letterSpacing: '-0.015em',
                      margin: 0,
                      color: 'var(--ledger-ink)',
                    }}
                  >
                    {mod.title}
                  </h4>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--ledger-sans)',
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: 'var(--ledger-muted)',
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--ledger-mono)',
                      fontSize: 9,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--ledger-muted)',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: 3,
                    }}
                  >
                    You will keep
                  </span>
                  {mod.keyOutput}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 10.5,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--ledger-muted)',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}
                >
                  {mod.estimatedMinutes} min
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}
