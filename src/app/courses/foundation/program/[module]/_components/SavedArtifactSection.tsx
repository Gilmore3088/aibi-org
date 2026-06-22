import Link from 'next/link';
import { getArtifactFirst } from '@content/courses/foundation-program';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';

const MOCKUP_FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface SavedArtifactSectionProps {
  readonly moduleNum: number;
  readonly totalModules: number;
  readonly isAlreadyCompleted: boolean;
  readonly artifactLabel: string;
}

export function SavedArtifactSection({
  moduleNum,
  totalModules,
  isAlreadyCompleted,
  artifactLabel,
}: SavedArtifactSectionProps) {
  const labBrief = getFoundationLabBrief(moduleNum);
  const nextArtifact = moduleNum < totalModules ? getArtifactFirst(moduleNum + 1) : undefined;
  const transferCue = labBrief?.learningLoop.transferPrompt ?? 'Use this artifact on one real work task before it goes stale.';
  const recallCue = labBrief?.learningLoop.recallPrompt ?? 'Explain the safety rule from memory before you reuse it.';
  const carryCue = nextArtifact
    ? `Bring this forward before ${nextArtifact.saved}.`
    : 'Use the full packet as evidence of safe AI practice.';
  const followThrough = [
    { label: 'Remember', body: recallCue },
    { label: 'Reuse', body: transferCue },
    { label: 'Carry', body: carryCue },
  ] as const;

  return (
    <section
      aria-label="Packet item status"
      style={{ scrollMarginTop: 160, paddingTop: 20 }}
    >
      <div
        className="foundation-saved-artifact"
        style={{
          background: 'white',
          border: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div
          className="foundation-saved-artifact__header"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 16,
            alignItems: 'center',
            padding: '18px 20px',
            background: isAlreadyCompleted ? 'rgba(4,120,87,0.07)' : 'var(--cream-2)',
            borderLeft: `4px solid ${isAlreadyCompleted ? 'var(--emerald-700)' : 'var(--gold)'}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '0 0 8px' }}>
              <span
                style={{
                  fontFamily: MOCKUP_FONT,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--slate-500)',
                }}
              >
                Item {moduleNum} of {totalModules}
              </span>
              <span
                style={{
                  fontFamily: MOCKUP_FONT,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isAlreadyCompleted ? 'var(--emerald-700)' : 'var(--gold-deep)',
                  background: isAlreadyCompleted ? 'rgba(4,120,87,0.10)' : 'var(--gold-a20)',
                  borderRadius: 999,
                  padding: '4px 10px',
                }}
              >
                {isAlreadyCompleted ? 'Saved' : 'Finish submit'}
              </span>
            </div>
            <p
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 18,
                fontWeight: 850,
                color: 'var(--ink)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {artifactLabel}
            </p>
          </div>
          <Link
            href={isAlreadyCompleted ? '/courses/foundation/program/toolkit' : '#st-submit'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              padding: '0 15px',
              borderRadius: 12,
              background: isAlreadyCompleted ? 'var(--ink)' : 'var(--gold)',
              color: isAlreadyCompleted ? '#fff' : 'var(--ink)',
              fontFamily: MOCKUP_FONT,
              fontSize: 11,
              fontWeight: 850,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {isAlreadyCompleted ? 'Open packet' : 'Finish'}
          </Link>
        </div>

        <div
          className="foundation-saved-artifact__nextline"
          style={{
            borderTop: '1px solid var(--ink-a10)',
            padding: '13px 18px',
            background: '#fff',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: MOCKUP_FONT,
              color: 'var(--ink)',
              fontSize: 14,
              lineHeight: 1.45,
              fontWeight: 720,
            }}
          >
            Next: name the rule from memory, use it on one safe work task, then{' '}
            {nextArtifact ? `carry it into ${nextArtifact.saved}.` : 'open the full Foundation packet.'}
          </p>
        </div>

        <details
          className="foundation-saved-artifact__transfer"
          style={{
            borderTop: '1px solid var(--ink-a10)',
          }}
        >
          <summary
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              minHeight: 44,
              padding: '13px 18px',
              cursor: 'pointer',
              listStyle: 'none',
            }}
          >
            <span
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              Reuse prompts
            </span>
            <span
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--slate-500)',
              }}
            >
              Open
            </span>
          </summary>
          <div
            className="foundation-saved-artifact__transfer-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              borderTop: '1px solid var(--ink-a10)',
              background: 'var(--cream-2)',
            }}
          >
            {followThrough.map((item, index) => (
              <div
                key={item.label}
                className="foundation-saved-artifact__transfer-item"
                style={{
                  padding: '12px 14px',
                  borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px',
                    fontFamily: MOCKUP_FONT,
                    fontSize: 10,
                    fontWeight: 850,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--slate-500)',
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: MOCKUP_FONT,
                    fontSize: 13,
                    lineHeight: 1.38,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </details>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .foundation-saved-artifact__transfer summary::-webkit-details-marker {
              display: none;
            }
            @media (max-width: 700px) {
              .foundation-saved-artifact__header {
                grid-template-columns: 1fr !important;
                align-items: start !important;
                padding: 16px !important;
              }
              .foundation-saved-artifact__header a {
                width: 100% !important;
              }
              .foundation-saved-artifact__nextline {
                padding: 12px !important;
              }
              .foundation-saved-artifact__transfer-grid {
                grid-template-columns: 1fr !important;
              }
              .foundation-saved-artifact__transfer-item {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
              }
              .foundation-saved-artifact__transfer-item:first-child {
                border-top: none !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
