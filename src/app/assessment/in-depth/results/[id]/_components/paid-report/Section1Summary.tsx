import { type Dimension, type MaturityBand } from '@content/assessments/v4/types';
import { DIMENSION_BRIEF, PLAYBOOK_FOR_GAP } from '@content/assessments/v4/exec-summary';
import { INK, GOLD_DEEP, GOLD } from '@/lib/brand/colors';
import { type ActionPacket } from '@content/assessments/v4/action-packet';
import { SLATE, LINE, pageStyle, sectionPad, btnPrimary, btnDark } from './constants';
import { Label, PrintButton } from './primitives';
import { type PersonalizationState } from './types';

// Choose the headline shown in Section 1.
//
// The role-templated headline is keyed to the role's *typical* top gap.
// When a specific taker's actual lowest-scoring dimension matches that
// framing, the templated headline is honest — use it. When it doesn't,
// the templated headline would diagnose a gap the data doesn't show, so
// fall back to a data-derived headline grounded in their actual scores.
function deriveHeadline(packet: ActionPacket, topGap: { label: string } | undefined): string {
  if (!topGap) return packet.thesisHeadline;
  const lower = packet.thesisHeadline.toLowerCase();
  // Heuristic match: any word from the top-gap label longer than 4 chars
  // appearing in the templated headline means the headline is honest for
  // this taker. Catches "approved access" / "access", "compliance",
  // "vendor", "workflow", etc.
  const words = topGap.label.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  const matches = words.some((w) => lower.includes(w));
  if (matches) return packet.thesisHeadline;
  return `Your top gap is ${topGap.label}. Start there.`;
}

export function Section1Summary({
  packet,
  briefingMailto,
  personalization,
  band,
  topGap,
}: {
  packet: ActionPacket;
  briefingMailto: string;
  personalization: PersonalizationState;
  band: MaturityBand;
  topGap: { key: Dimension; score: number; label: string } | undefined;
}): JSX.Element {
  const headline = deriveHeadline(packet, topGap);
  const brief = topGap ? DIMENSION_BRIEF[topGap.key] : null;
  // Serve the playbook that matches the RESULT (the top gap), not the role's
  // default — so a Compliance gap opens the Compliance playbook.
  const gapPlaybook = topGap ? PLAYBOOK_FOR_GAP[topGap.key] : null;
  const recPlaybook = gapPlaybook ?? { slug: packet.playbookPath.best.slug, label: packet.playbookPath.best.label };
  return (
    <section id="summary" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Paid diagnostic · Action packet</Label>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            lineHeight: 0.96,
            letterSpacing: '-0.06em',
            margin: '10px 0 14px',
            fontWeight: 800,
          }}
        >
          {headline}
        </h1>
        <p style={{ maxWidth: 850, fontSize: '1.125rem', color: SLATE, lineHeight: 1.58 }}>
          {packet.thesisBody}
        </p>
        {topGap && brief && (
          <div style={{ margin: '22px 0 0', border: `1px solid ${LINE}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
              <SnapField label="Readiness level" value={band.label} />
              <SnapField label="Top gap" value={`${topGap.label} · ${topGap.score}/100`} />
              <SnapField label="Primary risk" value={brief.risk} />
              <SnapField label="Primary opportunity" value={brief.opportunity} />
            </div>
            <div style={{ background: INK, color: 'white', padding: '16px 20px' }}>
              <span style={{ color: GOLD, fontSize: '0.6563rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Recommendation
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '1rem', lineHeight: 1.5 }}>
                Your greatest opportunity is {brief.recommendation}.
              </p>
            </div>
          </div>
        )}
        <AIExecSummary state={personalization} />
        <div
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}
        >
          <a href={briefingMailto} style={btnPrimary}>
            Book briefing
          </a>
          <a href={`/playbooks/${recPlaybook.slug}`} style={btnDark}>
            Open the {recPlaybook.label} playbook
          </a>
          <PrintButton />
        </div>
      </div>
      <div className="mk-pr-actionStrip">
        {packet.actionStrip.map((step, i) => (
          <div
            key={step.title}
            className="mk-pr-action"
            style={{ padding: 18, borderRight: `1px solid ${LINE}` }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 11,
                background: INK,
                color: GOLD,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 950,
                marginBottom: 10,
              }}
            >
              {i + 1}
            </div>
            <b style={{ display: 'block', fontSize: '0.9375rem' }}>{step.title}</b>
            <span
              style={{ display: 'block', color: SLATE, fontSize: '0.8125rem', lineHeight: 1.4, marginTop: 5 }}
            >
              {step.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SnapField({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ padding: '14px 18px', borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <div style={{ color: '#9A7A2F', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ marginTop: 5, fontSize: '0.875rem', lineHeight: 1.4, color: INK }}>{value}</div>
    </div>
  );
}

function AIExecSummary({ state }: { state: PersonalizationState }): JSX.Element | null {
  // Render nothing until personalization succeeds. We deliberately do not
  // show a loading skeleton — a "Personalizing…" tease that may never
  // resolve is worse than no tease at all.
  if (state.status !== 'ready') return null;
  return (
    <div
      style={{
        marginTop: 18,
        background: 'rgba(200,162,74,.06)',
        border: `1px solid rgba(200,162,74,.25)`,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div
        style={{
          color: GOLD_DEEP,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          fontSize: '0.625rem',
          fontWeight: 900,
        }}
      >
        Personalized executive summary
      </div>
      <div
        style={{
          fontSize: '0.9375rem',
          color: INK,
          lineHeight: 1.65,
          marginTop: 8,
          whiteSpace: 'pre-line',
        }}
      >
        {state.data.execSummary}
      </div>
    </div>
  );
}
