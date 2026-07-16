import { INK, GOLD_DEEP, GOLD } from '@/lib/brand/colors';
import { type ActionPacket } from '@content/assessments/v4/action-packet';
import { LINE, pageStyle, sectionPad } from './constants';
import { Label } from './primitives';
import { type PersonalizationState } from './types';

export function Section3Timeline({
  packet,
  personalization,
}: {
  packet: ActionPacket;
  personalization: PersonalizationState;
}): JSX.Element {
  // If AI personalization produced a calibrated 30-day plan, use it
  // instead of the templated first-phase checks. Phases 2 and 3 stay
  // templated — those are role-shape patterns, not org-shape.
  const aiFirstPhaseChecks =
    personalization.status === 'ready' && personalization.data.thirtyDayPlan.length >= 3
      ? personalization.data.thirtyDayPlan
      : null;
  return (
    <section id="timeline" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Execution timeline</Label>
        <h2
          style={{
            fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 0',
            fontWeight: 800,
          }}
        >
          30 / 60 / 90 checklist
        </h2>
        {aiFirstPhaseChecks && (
          <p
            style={{
              fontSize: '0.75rem',
              color: GOLD_DEEP,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              margin: '10px 0 0',
            }}
          >
            ⚡ First 30 days calibrated for your team size and asset band
          </p>
        )}
      </div>
      <div>
        {packet.timeline.map((p, i) => {
          const checks = i === 0 && aiFirstPhaseChecks ? aiFirstPhaseChecks : p.checks;
          return (
          <div
            key={p.phase}
            className="mk-pr-phase"
            style={{
              padding: '22px 30px',
              borderTop: `1px solid ${LINE}`,
            }}
          >
            <div
              style={{
                fontWeight: 900,
                color: GOLD_DEEP,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.75rem',
              }}
            >
              {p.phase}
            </div>
            <div>
              <h3 style={{ fontSize: '1.4375rem', letterSpacing: '-0.025em', margin: 0, fontWeight: 800 }}>
                {p.heading}
              </h3>
              <div style={{ fontSize: '0.6563rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD_DEEP, margin: '12px 0 0' }}>
                Completion evidence
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                {checks.map((c) => (
                  <label
                    key={c}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: `2px solid ${GOLD}`,
                        background: 'white',
                        flex: 'none',
                        display: 'inline-block',
                        marginTop: 2,
                      }}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#F7F3EA', borderRadius: 10 }}>
                <span style={{ color: GOLD_DEEP, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.625rem', fontWeight: 800 }}>
                  Success metric
                </span>
                <span style={{ display: 'block', marginTop: 2, fontSize: '0.8125rem', color: INK, lineHeight: 1.45 }}>
                  {[
                    'Your first approved artifact is published and in use by the team.',
                    'One AI-assisted workflow runs end-to-end with evidenced human review.',
                    'The practice is owned, measured, and repeatable without you driving it.',
                  ][i] ?? 'The phase outcome is evidenced and signed off.'}
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
