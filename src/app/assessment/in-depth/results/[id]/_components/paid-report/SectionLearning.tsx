import Link from 'next/link';
import { type Dimension } from '@content/assessments/v4/types';
import { learningPath, PLAYBOOK_FOR_GAP, type ModuleRec } from '@content/assessments/v4/exec-summary';
import { INK, GOLD_DEEP, GOLD } from '@/lib/brand/colors';
import { type ActionPacket } from '@content/assessments/v4/action-packet';
import { SLATE, LINE, pageStyle, sectionPad, btnOutline } from './constants';
import { Label } from './primitives';

// ── Section: Learning Recommendations ───────────────────────────────────────
// The assessment as the front door: results map straight into Foundation and
// the role playbooks.
export function SectionLearning({
  protect,
  packet,
}: {
  protect: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  packet: ActionPacket;
}): JSX.Element {
  const path: readonly ModuleRec[] = learningPath(protect.map((d) => d.key));
  // Offer BOTH: the role's playbooks (kept) AND the playbooks that serve the
  // top gaps — de-duplicated so the same playbook never shows in both groups.
  const rolePlaybooks = [packet.playbookPath.best, ...packet.playbookPath.supporting];
  const roleSlugs = new Set(rolePlaybooks.map((p) => p.slug));
  const gapPlaybooks = (() => {
    const seen = new Set<string>();
    const out: { readonly slug: string; readonly label: string }[] = [];
    for (const d of protect) {
      const pb = PLAYBOOK_FOR_GAP[d.key];
      if (!seen.has(pb.slug) && !roleSlugs.has(pb.slug)) {
        seen.add(pb.slug);
        out.push(pb);
      }
    }
    return out;
  })();
  return (
    <section id="learning" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Learning recommendations</Label>
        <h2
          style={{
            fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          Where to build the skill.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58, maxWidth: 680 }}>
          Your results map straight into the Foundation course. Start here, in this order —
          each module closes one of your priority gaps.
        </p>
        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          {path.map((m, i) => (
            <Link
              key={m.number}
              href={`/courses/foundation/program/${m.number}`}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                background: 'white',
                border: `1px solid ${LINE}`,
                borderRadius: 18,
                padding: 16,
                textDecoration: 'none',
                color: INK,
              }}
            >
              <span
                style={{
                  flex: 'none',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: INK,
                  background: GOLD,
                  borderRadius: 999,
                  padding: '4px 11px',
                }}
              >
                Priority {i + 1}
              </span>
              <div>
                <b style={{ display: 'block', fontSize: '1rem' }}>
                  Module {m.number} · {m.title}
                </b>
                <span style={{ display: 'block', color: SLATE, fontSize: '0.8438rem', marginTop: 3 }}>{m.why}</span>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 22 }}>
          <Label>Recommended playbooks</Label>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: '0.6563rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD_DEEP }}>
              Matched to your role
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {rolePlaybooks.map((p) => (
                <Link
                  key={p.slug}
                  href={`/playbooks/${p.slug}`}
                  style={{ ...btnOutline, border: `1px solid ${LINE}`, textDecoration: 'none', display: 'inline-flex' }}
                >
                  {p.label} playbook
                </Link>
              ))}
            </div>
          </div>
          {gapPlaybooks.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.6563rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD_DEEP }}>
                Matched to your top gaps
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                {gapPlaybooks.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/playbooks/${p.slug}`}
                    style={{ ...btnOutline, border: `1px solid ${LINE}`, textDecoration: 'none', display: 'inline-flex' }}
                  >
                    {p.label} playbook
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
