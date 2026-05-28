import { SectionCard } from './SectionCard';
import { kickerStyle } from './toolkitConstants';

const SHARING_LADDER_LABELS: Record<string, string> = {
  personal: 'Personal sandbox',
  team: 'Ready for team review',
  institution: 'Institution-wide',
  'not-sure': 'Needs one more iteration',
};

const callout = { borderLeft: '3px solid var(--gold)', paddingLeft: 14 } as const;
const calloutBody = {
  fontSize: 14,
  color: 'var(--ink)',
  lineHeight: 1.55,
  margin: 0,
} as const;

export function CapstoneSummary({
  m7Title,
  m8Response,
}: {
  readonly m7Title: string;
  readonly m8Response: Record<string, string>;
}) {
  const sharingLevel = m8Response['sharing-ladder-level'];

  return (
    <SectionCard title="Capstone summary" label="Module 9 narrative">
      <div style={{ display: 'grid', gap: 16 }}>
        <p
          style={{
            fontSize: 13,
            color: 'var(--slate-500)',
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          Summary of your Module 9 capstone: the workflow you automated, the quality
          standard your work product was built to meet, and the iteration path that got
          you there.
        </p>

        <div style={callout}>
          <p style={{ ...kickerStyle, marginBottom: 4 }}>Skill used for capstone</p>
          <p style={calloutBody}>
            {m7Title}{' '}
            {sharingLevel ? (
              <span style={{ color: 'var(--slate-500)' }}>
                — Sharing level: {SHARING_LADDER_LABELS[sharingLevel] ?? sharingLevel}
              </span>
            ) : null}
          </p>
        </div>

        {m8Response['test-input-1'] && (
          <div style={callout}>
            <p style={{ ...kickerStyle, marginBottom: 4 }}>Tested against</p>
            <p style={calloutBody}>{m8Response['test-input-1']}</p>
          </div>
        )}

        {m8Response['revision-notes'] && (
          <div style={callout}>
            <p style={{ ...kickerStyle, marginBottom: 4 }}>Iteration improvements</p>
            <p style={calloutBody}>{m8Response['revision-notes']}</p>
          </div>
        )}

        <div style={callout}>
          <p style={{ ...kickerStyle, marginBottom: 4 }}>Quality standard met</p>
          <p style={calloutBody}>
            Five-dimension AiBI-Foundation rubric: Accuracy (hard gate), Completeness,
            Tone, Judgment, and Skill Quality.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
