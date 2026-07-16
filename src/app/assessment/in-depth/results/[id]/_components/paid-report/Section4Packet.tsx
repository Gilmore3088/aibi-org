import { INK, CREAM, GOLD_DEEP, GOLD } from '@/lib/brand/colors';
import { type ActionPacket } from '@content/assessments/v4/action-packet';
import { SLATE, LINE, pageStyle, sectionPad } from './constants';
import { Label } from './primitives';

export function Section4Packet({ packet }: { packet: ActionPacket }): JSX.Element {
  return (
    <section id="packet" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Reviewer packet</Label>
        <h2
          style={{
            fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          What you should be able to show.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58 }}>
          This is the evidence stack for your first workflow. It should feel
          printable, sendable, and review-ready.
        </p>
        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          {packet.reviewerPacket.map((item) => (
            <div
              key={item.name}
              style={{
                background: 'white',
                border: `1px solid ${LINE}`,
                borderRadius: 18,
                padding: 15,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  background: GOLD,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  flex: 'none',
                  color: INK,
                }}
              >
                ✓
              </span>
              <div>
                <b style={{ display: 'block' }}>{item.name}</b>
                <p style={{ margin: '4px 0 0', color: SLATE, fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: 30, borderTop: `1px solid ${LINE}` }}>
        <Label>Recommended playbooks</Label>
        <div className="mk-pr-playbooks" style={{ marginTop: 14 }}>
          <PlaybookCardEl
            tone="best"
            tag="Best match"
            label={packet.playbookPath.best.label}
            use={packet.playbookPath.best.use}
            href={`/playbooks/${packet.playbookPath.best.slug}`}
          />
          {packet.playbookPath.supporting.map((p) => (
            <PlaybookCardEl
              key={p.slug}
              tone="default"
              tag="Supporting"
              label={p.label}
              use={p.use}
              href={`/playbooks/${p.slug}`}
            />
          ))}
          <PlaybookCardEl
            tone="default"
            tag="Template"
            label={packet.playbookPath.template.label}
            use={packet.playbookPath.template.use}
            href="/playbooks"
          />
        </div>
      </div>
    </section>
  );
}

function PlaybookCardEl({
  tone,
  tag,
  label,
  use,
  href,
}: {
  tone: 'best' | 'default';
  tag: string;
  label: string;
  use: string;
  href: string;
}): JSX.Element {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        background: 'white',
        border: tone === 'best' ? `1px solid ${GOLD}` : `1px solid ${LINE}`,
        boxShadow: tone === 'best' ? `0 0 0 4px rgba(200,162,74,.12)` : 'none',
        borderRadius: 18,
        padding: 16,
        textDecoration: 'none',
        color: INK,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          borderRadius: 999,
          background: CREAM,
          padding: '6px 9px',
          fontSize: '0.75rem',
          fontWeight: 900,
          color: GOLD_DEEP,
          marginBottom: 10,
        }}
      >
        {tag}
      </span>
      <h3 style={{ fontSize: '1.125rem', margin: '0 0 6px', fontWeight: 800 }}>{label}</h3>
      <p style={{ margin: 0, color: SLATE, fontSize: '0.875rem', lineHeight: 1.5 }}>{use}</p>
    </a>
  );
}
