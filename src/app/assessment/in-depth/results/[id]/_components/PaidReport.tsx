'use client';

// PaidReport — v4 In-Depth Action Packet.
//
// Rebuilt 2026-05-30 per operator spec: stop feeling like "here are your
// scores", start feeling like "here is your personalized AI operating
// packet — open this, copy this, build this, show this to a reviewer."
//
// Layout (matches the approved mockup, preview (3).html):
//   Sticky sidebar (dark navy) — score, role, top gap, primary artifact, nav
//   Main column —
//     1. Action Packet Summary  (thesis + 3 CTAs + numbered 5-step strip)
//     2. Primary Artifact       (table + copy-rule + copy-prompt + Protect/Use/Build)
//     3. 30/60/90 Timeline      (3 phases × check items)
//     4. Reviewer Packet        (5 docs + visual stack + 4 playbook cards)
//     5. Score Appendix         (compact eight-dimension scorecard, demoted)

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DIMENSION_LABELS, type Dimension, type MaturityBand } from '@content/assessments/v4/types';
import { ROLE_V4_META, type RoleV4 } from '@content/assessments/v4/roles';
import { rootCauseFor } from '@content/assessments/v4/root-causes';
import { orderWorkProducts, type WorkProduct } from '@content/assessments/v4/work-products';
import {
  getActionPacket,
  classifyDimensions,
  type ActionPacket,
} from '@content/assessments/v4/action-packet';
import type {
  DimensionScoreSerializedV4,
  InstitutionContext,
} from '@/lib/assessment/load-response';

export interface PaidReportProps {
  readonly profileId: string;
  readonly email: string;
  readonly score: number; // normalized 0-100
  readonly band: MaturityBand;
  readonly role: RoleV4 | null;
  readonly dimensionBreakdown: Record<Dimension, DimensionScoreSerializedV4>;
  readonly readinessAt: string;
  readonly institutionContext: InstitutionContext | null;
}

interface PersonalizationPayload {
  readonly execSummary: string;
  readonly thirtyDayPlan: readonly string[];
  readonly model: string;
  readonly generatedAt: string;
}

const INK = '#071A2F';
const CREAM = '#F7F3EA';
const PAPER = '#FFFCF6';
const GOLD = '#C8A24A';
const GOLD_SOFT = '#E6D39B';
const GOLD_DEEP = '#9A7A2F';
const SLATE = '#637083';
const SLATE_500 = '#64748B';
const LINE = 'rgba(7,26,47,.12)';

export function PaidReport({
  profileId,
  email,
  score,
  band,
  role,
  dimensionBreakdown,
  institutionContext,
}: PaidReportProps): JSX.Element {
  const packet = getActionPacket(role);
  const roleMeta = role ? ROLE_V4_META[role] : null;
  const { protect, use, build } = classifyDimensions(dimensionBreakdown);
  const topGap = protect[0];
  const ctx = institutionContext ?? {};
  const personalization = usePersonalization(profileId, !!ctx.first_name);

  // Inline mailto: prefilled with score + role + a placeholder note line.
  const briefingMailto = `mailto:hello@aibankinginstitute.com?subject=${encodeURIComponent(
    `Executive Briefing — In-Depth result (${roleMeta?.label ?? 'role'})`,
  )}&body=${encodeURIComponent(
    `Hi, my In-Depth diagnostic returned a score of ${score}/100 in the ${band.label} band. My role: ${roleMeta?.label ?? 'unspecified'}. My top gap: ${topGap?.label ?? 'see report'}. I'd like to discuss the next move.\n\nThanks,\n`,
  )}`;


  // Anchor highlighting — observe each section, mark its sidebar nav link
  // as active when the section is in view.
  const activeSection = useActiveSection(['summary', 'rootcause', 'artifact', 'workproducts', 'timeline', 'packet', 'score']);
  // Anchor IDs above intentionally match the five remaining sections — vendor
  // and examiner sections were removed because they shipped unsourced claims.

  return (
    <div
      style={{
        background: CREAM,
        color: INK,
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        minHeight: '100vh',
      }}
    >
      <div className="mk-pr-wrap" style={{ maxWidth: 1380, margin: '0 auto', padding: 28 }}>
        <div className="mk-pr-shell">
          <Sidebar
            score={score}
            band={band}
            roleLabel={roleMeta?.label ?? 'Your role'}
            topGap={topGap}
            primaryArtifact={packet.primaryArtifact.name}
            activeSection={activeSection}
          />
          <main style={{ minWidth: 0 }}>
            {ctx.first_name && (
              <PersonalizationStripe
                ctx={ctx}
                roleLabel={roleMeta?.label ?? 'your role'}
              />
            )}
            <Section1Summary
              packet={packet}
              briefingMailto={briefingMailto}
              personalization={personalization}
              topGap={topGap}
            />
            <SectionRootCause protect={protect} use={use} />
            <Section2Artifact
              packet={packet}
              protect={protect}
              use={use}
              build={build}
              roleLabel={roleMeta?.label ?? 'role'}
            />
            <SectionWorkProducts
              protect={protect}
              use={use}
              roleLabel={roleMeta?.label ?? 'role'}
            />
            <Section3Timeline packet={packet} personalization={personalization} />
            <Section4Packet packet={packet} />
            <Section5ScoreAppendix
              score={score}
              band={band}
              dimensionBreakdown={dimensionBreakdown}
            />
            <Footer profileId={profileId} email={email} />
          </main>
        </div>
      </div>
      <ResponsiveCSS />
      <PrintCSS />
    </div>
  );
}

// Active-section tracker — IntersectionObserver-backed. Returns the id of
// whichever observed section is currently most-visible in the viewport.
function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? '');
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;
    const visibility = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visibility.set(e.target.id, e.intersectionRatio);
        }
        let topId = ids[0];
        let topRatio = 0;
        for (const id of ids) {
          const r = visibility.get(id) ?? 0;
          if (r > topRatio) {
            topRatio = r;
            topId = id;
          }
        }
        if (topId) setActive(topId);
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const n of nodes) obs.observe(n);
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

// ── Sidebar (sticky on desktop) ─────────────────────────────────────────────

function Sidebar({
  score,
  band,
  roleLabel,
  topGap,
  primaryArtifact,
  activeSection,
}: {
  readonly score: number;
  readonly band: MaturityBand;
  readonly roleLabel: string;
  readonly topGap: { score: number; label: string } | undefined;
  readonly primaryArtifact: string;
  readonly activeSection: string;
}): JSX.Element {
  return (
    <aside
      className="mk-pr-sidebar"
      style={{
        background: INK,
        color: 'white',
        borderRadius: 28,
        boxShadow: '0 24px 70px rgba(7,26,47,.17)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontWeight: 900 }}>
          <span style={{ color: GOLD, fontSize: 18, lineHeight: 1 }}>[</span>
          <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>A</span>
          <span
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            i
          </span>
          <span style={{ color: GOLD, fontSize: 18, lineHeight: 1 }}>]</span>
          <span style={{ marginLeft: 4, fontSize: 14, fontWeight: 600 }}>Banking Institute</span>
        </div>
        <div
          style={{
            fontSize: 82,
            color: GOLD_SOFT,
            fontWeight: 950,
            lineHeight: 0.9,
            letterSpacing: '-0.06em',
            marginTop: 22,
          }}
        >
          {score}
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,.5)' }}> /100</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,.68)', margin: '10px 0 0' }}>{band.label}</p>
      </div>
      <SidebarBlock label="Role" value={roleLabel} />
      {topGap && (
        <SidebarBlock label="Top gap" value={`${topGap.label} · ${topGap.score}/100`} />
      )}
      <SidebarBlock label="Primary artifact" value={primaryArtifact} />
      <nav style={{ padding: 18 }}>
        <SidebarNav href="#summary" label="Action Packet" num="01" active={activeSection === 'summary'} />
        <SidebarNav href="#rootcause" label="Root Cause" num="02" active={activeSection === 'rootcause'} />
        <SidebarNav href="#artifact" label="Artifact" num="03" active={activeSection === 'artifact'} />
        <SidebarNav href="#workproducts" label="Work Products" num="04" active={activeSection === 'workproducts'} />
        <SidebarNav href="#timeline" label="Timeline" num="05" active={activeSection === 'timeline'} />
        <SidebarNav href="#packet" label="Reviewer Packet" num="06" active={activeSection === 'packet'} />
        <SidebarNav href="#score" label="Score Appendix" num="07" active={activeSection === 'score'} />
      </nav>
    </aside>
  );
}

function SidebarBlock({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
      <span style={{ display: 'block', color: 'rgba(255,255,255,.55)', fontSize: 13 }}>
        {label}
      </span>
      <b style={{ display: 'block', marginTop: 4, fontSize: 17 }}>{value}</b>
    </div>
  );
}

function SidebarNav({
  href,
  label,
  num,
  active,
}: {
  href: string;
  label: string;
  num: string;
  active: boolean;
}): JSX.Element {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 13px',
        borderRadius: 14,
        color: active ? 'white' : 'rgba(255,255,255,.78)',
        background: active ? 'rgba(255,255,255,.09)' : 'transparent',
        textDecoration: 'none',
        fontWeight: 800,
        fontSize: 14,
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span>{label}</span>
      <span style={{ color: active ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.45)' }}>{num}</span>
    </a>
  );
}

// ── Section 1: Action Packet Summary ────────────────────────────────────────

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

function Section1Summary({
  packet,
  briefingMailto,
  personalization,
  topGap,
}: {
  packet: ActionPacket;
  briefingMailto: string;
  personalization: PersonalizationState;
  topGap: { label: string } | undefined;
}): JSX.Element {
  const headline = deriveHeadline(packet, topGap);
  return (
    <section id="summary" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Paid diagnostic · Action packet</Label>
        <h1
          style={{
            fontSize: 'clamp(40px, 5vw, 72px)',
            lineHeight: 0.96,
            letterSpacing: '-0.06em',
            margin: '10px 0 14px',
            fontWeight: 800,
          }}
        >
          {headline}
        </h1>
        <p style={{ maxWidth: 850, fontSize: 18, color: SLATE, lineHeight: 1.58 }}>
          {packet.thesisBody}
        </p>
        <AIExecSummary state={personalization} />
        <div
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}
        >
          <a href={briefingMailto} style={btnPrimary}>
            Book briefing
          </a>
          <a href={`/playbooks/${packet.playbookPath.best.slug}`} style={btnDark}>
            Open {packet.playbookPath.best.label} playbook
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
            <b style={{ display: 'block', fontSize: 15 }}>{step.title}</b>
            <span
              style={{ display: 'block', color: SLATE, fontSize: 13, lineHeight: 1.4, marginTop: 5 }}
            >
              {step.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Section 2: Primary Artifact ─────────────────────────────────────────────

function Section2Artifact({
  packet,
  protect,
  use,
  build,
  roleLabel,
}: {
  packet: ActionPacket;
  protect: ReadonlyArray<{ score: number; label: string }>;
  use: ReadonlyArray<{ score: number; label: string }>;
  build: ReadonlyArray<{ score: number; label: string }>;
  roleLabel: string;
}): JSX.Element {
  const a = packet.primaryArtifact;
  return (
    <section id="artifact" style={pageStyle}>
      <div
        className="mk-pr-artHead"
        style={{
          background: INK,
          color: 'white',
          padding: 26,
        }}
      >
        <div>
          <Label tone="dark">Primary work product</Label>
          <h2
            style={{
              fontSize: 'clamp(30px, 3vw, 46px)',
              lineHeight: 1,
              letterSpacing: '-0.045em',
              margin: '6px 0 8px',
              fontWeight: 800,
            }}
          >
            {a.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.68)', margin: 0 }}>{a.intent}</p>
        </div>
        <div
          style={{
            background: GOLD,
            color: INK,
            borderRadius: 18,
            padding: 16,
          }}
        >
          <Label tone="badge">When to use</Label>
          <h3 style={{ fontSize: 18, letterSpacing: '-0.02em', margin: '4px 0 0', fontWeight: 800 }}>
            {a.useBefore}
          </h3>
        </div>
      </div>

      <div style={sectionPad}>
        {a.table && (
          <>
            <div
              style={{
                marginBottom: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#EFE7D7',
                color: GOLD_DEEP,
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Sample · replace with your own redacted cases
            </div>
            <ArtifactTable cols={a.table.columns} rows={a.table.rows} />
          </>
        )}

        <div
          style={{
            marginTop: 16,
            background: '#fff8e8',
            border: `1px solid rgba(200,162,74,.35)`,
            borderRadius: 18,
            padding: 15,
            fontWeight: 700,
            color: '#73591f',
          }}
        >
          Copy-ready rule: {a.copyRule}
        </div>

        <div className="mk-pr-grid2" style={{ marginTop: 18, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label>Copy-ready prompt</Label>
            <PromptBlock text={a.copyPrompt} stretch />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <CopyButton text={a.copyPrompt} label="Copy prompt" />
              <SaveToToolboxButton
                artifactName={a.name}
                roleLabel={roleLabel}
                prompt={a.copyPrompt}
                rule={a.copyRule}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label>Protect · Use · Build</Label>
            <div
              style={{
                display: 'grid',
                gap: 10,
                marginTop: 12,
                gridAutoRows: '1fr',
              }}
            >
              {protect.map((d) => (
                <DiagRow key={d.label} kicker="Protect first" label={d.label} score={d.score} />
              ))}
              {use.map((d) => (
                <DiagRow key={d.label} kicker="Use next" label={d.label} score={d.score} />
              ))}
              {build.map((d) => (
                <DiagRow key={d.label} kicker="Build next" label={d.label} score={d.score} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtifactTable({
  cols,
  rows,
}: {
  cols: readonly string[];
  rows: ReadonlyArray<ReadonlyArray<string>>;
}): JSX.Element {
  const gridTemplate = '1.1fr 1.2fr .55fr .7fr .9fr';
  return (
    <div
      className="mk-pr-table"
      style={{
        border: `1px solid ${LINE}`,
        borderRadius: 22,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <div
        className="mk-pr-thead"
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          background: CREAM,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 950,
          color: '#73591f',
        }}
      >
        {cols.map((c, i) => (
          <div
            key={c}
            style={{
              padding: 14,
              borderRight: i < cols.length - 1 ? `1px solid ${LINE}` : 'none',
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="mk-pr-tr"
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            borderTop: `1px solid ${LINE}`,
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          {row.map((cell, ci) => (
            <div
              key={ci}
              style={{
                padding: 14,
                borderRight: ci < row.length - 1 ? `1px solid ${LINE}` : 'none',
              }}
            >
              {renderCell(cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function renderCell(value: string): JSX.Element {
  // Light styling: tiny pill for short verdicts so the table reads at a glance.
  const v = value.trim();
  const ok = ['no', 'approve', 'yes — verify'];
  const edit = ['edit', 'verify', 'review'];
  if (ok.includes(v.toLowerCase())) {
    return <Pill tone="ok">{v}</Pill>;
  }
  if (edit.includes(v.toLowerCase())) {
    return <Pill tone="edit">{v}</Pill>;
  }
  return <span>{v}</span>;
}

function Pill({ tone, children }: { tone: 'ok' | 'edit'; children: string }): JSX.Element {
  const bg = tone === 'ok' ? '#D1FADF' : '#FEF0C7';
  const fg = tone === 'ok' ? '#05603A' : '#93370D';
  return (
    <span
      style={{
        display: 'inline-flex',
        borderRadius: 999,
        padding: '6px 9px',
        fontSize: 12,
        fontWeight: 800,
        background: bg,
        color: fg,
      }}
    >
      {children}
    </span>
  );
}

function PromptBlock({ text, stretch }: { text: string; stretch?: boolean }): JSX.Element {
  return (
    <pre
      style={{
        background: INK,
        color: GOLD_SOFT,
        borderRadius: 20,
        padding: 18,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 13,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        margin: '12px 0 0',
        overflowX: 'auto',
        flex: stretch ? '1 1 auto' : undefined,
      }}
    >
      {text}
    </pre>
  );
}

function DiagRow({
  kicker,
  label,
  score,
}: {
  kicker: string;
  label: string;
  score: number;
}): JSX.Element {
  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${LINE}`,
        borderRadius: 16,
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <div>
        <span
          style={{
            display: 'block',
            color: GOLD_DEEP,
            fontWeight: 950,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
          }}
        >
          {kicker}
        </span>
        <b style={{ display: 'block', marginTop: 2 }}>{label}</b>
      </div>
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: 800,
          color: INK,
          fontSize: 20,
        }}
      >
        {score}
      </span>
    </div>
  );
}

// ── Section 3: Timeline ─────────────────────────────────────────────────────

function Section3Timeline({
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
            fontSize: 'clamp(30px, 3vw, 46px)',
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
              fontSize: 12,
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
                fontSize: 12,
              }}
            >
              {p.phase}
            </div>
            <div>
              <h3 style={{ fontSize: 23, letterSpacing: '-0.025em', margin: 0, fontWeight: 800 }}>
                {p.heading}
              </h3>
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
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
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Section 4: Reviewer Packet ──────────────────────────────────────────────

// ── Section: Root Cause Analysis ────────────────────────────────────────────
// A score is a symptom. For each priority gap, show the structural reasons
// behind it — what is missing, not just what is low — plus a confidence.
function SectionRootCause({
  protect,
  use,
}: {
  protect: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  use: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
}): JSX.Element {
  const items = [...protect, ...use];
  return (
    <section id="rootcause" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Root cause analysis</Label>
        <h2
          style={{
            fontSize: 'clamp(30px, 3vw, 46px)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          Why these scores exist.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58 }}>
          A score is a symptom. Each priority gap below is broken down into the
          structural reasons behind it — what is missing, not just what is low.
          That is the difference between a report and a diagnosis.
        </p>
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {items.map((d) => {
            const rc = rootCauseFor(d.key, d.score);
            return (
              <div
                key={d.key}
                style={{
                  background: 'white',
                  border: `1px solid ${LINE}`,
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <b style={{ fontSize: 18, letterSpacing: '-0.01em' }}>
                    {d.label} scored {d.score}/100 because:
                  </b>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: rc.confidence === 'High' ? '#047857' : '#9A7A2F',
                    }}
                  >
                    Confidence: {rc.confidence}
                  </span>
                </div>
                <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 9 }}>
                  {rc.reasons.map((r) => (
                    <li
                      key={r}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: SLATE, fontSize: 14, lineHeight: 1.5 }}
                    >
                      <span style={{ color: GOLD, fontWeight: 900, flex: 'none' }}>—</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Section: Generated Work Products (+ Toolbox feed) ───────────────────────
// The thesis made tangible — not advice, assets. Each is a ready-to-run prompt
// that produces a usable banking document; copy it, or add it to the Toolbox
// as a skill in one click. "Add all" is the success-metric behaviour.
function SectionWorkProducts({
  protect,
  use,
  roleLabel,
}: {
  protect: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  use: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  roleLabel: string;
}): JSX.Element {
  const priorityDims = [...protect, ...use].map((d) => d.key);
  const recommended = new Set(protect.map((d) => d.key));
  const products = orderWorkProducts(priorityDims);
  return (
    <section id="workproducts" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Generated work products</Label>
        <h2
          style={{
            fontSize: 'clamp(30px, 3vw, 46px)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          What you receive today.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58, maxWidth: 680 }}>
          Not advice — assets. Each is a ready-to-run prompt that produces a usable
          banking document, grounded in your own approved sources. Copy it, or add it
          to your Toolbox as a reusable skill in one click.
        </p>
        <div style={{ marginTop: 16 }}>
          <AddAllToToolbox products={products} roleLabel={roleLabel} />
        </div>
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {products.map((w) => (
            <WorkProductCard
              key={w.id}
              product={w}
              roleLabel={roleLabel}
              recommended={recommended.has(w.dimension)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkProductCard({
  product,
  roleLabel,
  recommended,
}: {
  product: WorkProduct;
  roleLabel: string;
  recommended: boolean;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${recommended ? GOLD : LINE}`,
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <b style={{ fontSize: 18, letterSpacing: '-0.01em' }}>{product.name}</b>
        {recommended && (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: INK,
              background: GOLD,
              borderRadius: 999,
              padding: '3px 10px',
            }}
          >
            Closes your {DIMENSION_LABELS[product.dimension]} gap
          </span>
        )}
      </div>
      <p style={{ margin: '6px 0 0', color: SLATE, fontSize: 14, lineHeight: 1.5 }}>{product.intent}</p>
      <p style={{ margin: '8px 0 0', color: SLATE, fontSize: 13 }}>
        <b style={{ color: INK }}>Use before:</b> {product.useBefore}
      </p>
      {open && (
        <div style={{ marginTop: 12 }}>
          <PromptBlock text={product.copyPrompt} stretch />
          <p style={{ margin: '8px 0 0', color: SLATE, fontSize: 12.5 }}>{product.copyRule}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{ ...btnOutline, border: `1px solid ${LINE}`, cursor: 'pointer' }}
        >
          {open ? 'Hide prompt' : 'View prompt'}
        </button>
        <CopyButton text={product.copyPrompt} label="Copy prompt" />
        <SaveToToolboxButton
          artifactName={product.name}
          roleLabel={roleLabel}
          prompt={product.copyPrompt}
          rule={product.copyRule}
        />
      </div>
    </div>
  );
}

function AddAllToToolbox({
  products,
  roleLabel,
}: {
  products: readonly WorkProduct[];
  roleLabel: string;
}): JSX.Element {
  type S = 'idle' | 'saving' | 'done' | 'auth' | 'upgrade' | 'error';
  const [status, setStatus] = useState<S>('idle');
  const [n, setN] = useState(0);
  const goldCta: React.CSSProperties = {
    background: GOLD,
    color: INK,
    border: 'none',
    borderRadius: 12,
    padding: '11px 18px',
    fontWeight: 800,
    fontSize: 13,
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  };
  if (status === 'upgrade') {
    return (
      <Link href="/courses/foundation/program/purchase" style={goldCta}>
        <BookmarkIcon />
        <span>Upgrade to add all</span>
      </Link>
    );
  }
  const label =
    status === 'saving'
      ? `Adding ${n}/${products.length}…`
      : status === 'done'
        ? `Added ${products.length} to Toolbox ✓`
        : status === 'auth'
          ? 'Sign in to add'
          : status === 'error'
            ? 'Try again'
            : `Add all ${products.length} to Toolbox`;
  return (
    <button
      type="button"
      onClick={async () => {
        setStatus('saving');
        setN(0);
        for (let i = 0; i < products.length; i++) {
          const w = products[i];
          try {
            const res = await fetch('/api/toolbox/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                origin: 'in-depth',
                payload: { artifactName: w.name, roleLabel, prompt: w.copyPrompt, rule: w.copyRule },
              }),
            });
            if (res.status === 401) {
              setStatus('auth');
              setTimeout(() => {
                window.location.href = '/auth/login?next=' + encodeURIComponent(window.location.pathname);
              }, 800);
              return;
            }
            if (res.status === 403) {
              setStatus('upgrade');
              return;
            }
            if (!res.ok) {
              setStatus('error');
              return;
            }
            setN(i + 1);
          } catch {
            setStatus('error');
            return;
          }
        }
        setStatus('done');
      }}
      style={goldCta}
    >
      <BookmarkIcon />
      <span>{label}</span>
    </button>
  );
}

function Section4Packet({ packet }: { packet: ActionPacket }): JSX.Element {
  return (
    <section id="packet" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Reviewer packet</Label>
        <h2
          style={{
            fontSize: 'clamp(30px, 3vw, 46px)',
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
                <p style={{ margin: '4px 0 0', color: SLATE, fontSize: 14 }}>{item.desc}</p>
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
          fontSize: 12,
          fontWeight: 900,
          color: GOLD_DEEP,
          marginBottom: 10,
        }}
      >
        {tag}
      </span>
      <h3 style={{ fontSize: 18, margin: '0 0 6px', fontWeight: 800 }}>{label}</h3>
      <p style={{ margin: 0, color: SLATE, fontSize: 14, lineHeight: 1.5 }}>{use}</p>
    </a>
  );
}

// ── Section 5: Score Appendix (demoted, but present for paid users) ────────

function Section5ScoreAppendix({
  score,
  band,
  dimensionBreakdown,
}: {
  score: number;
  band: MaturityBand;
  dimensionBreakdown: Record<Dimension, DimensionScoreSerializedV4>;
}): JSX.Element {
  return (
    <section id="score" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Score appendix</Label>
        <h2
          style={{
            fontSize: 'clamp(28px, 2.6vw, 38px)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          Your eight-dimension scorecard.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58 }}>
          You scored <b>{score} / 100</b> — {band.label}. Use this view when the
          person across the table asks for the score; use the rest of the report
          when you need to act on it.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 10,
            marginTop: 18,
          }}
        >
          {(Object.entries(dimensionBreakdown) as [Dimension, DimensionScoreSerializedV4][]).map(
            ([key, dim]) => (
              <div
                key={key}
                style={{
                  background: 'white',
                  border: `1px solid ${LINE}`,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: GOLD_DEEP,
                  }}
                >
                  {DIMENSION_LABELS[key]}
                </div>
                <div
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 24,
                    fontWeight: 800,
                    color: INK,
                    marginTop: 4,
                  }}
                >
                  {dim.score}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────

function Footer({ profileId, email }: { profileId: string; email: string }): JSX.Element {
  return (
    <div
      style={{
        padding: '24px 30px 60px',
        color: SLATE_500,
        fontSize: 12,
        textAlign: 'center',
      }}
    >
      Report for {email} · permalink:{' '}
      <code style={{ fontFamily: 'ui-monospace, monospace' }}>/{profileId.slice(0, 8)}</code> · The
      AI Banking Institute
    </div>
  );
}

// ── Shared primitives ───────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  background: PAPER,
  border: `1px solid ${LINE}`,
  borderRadius: 30,
  boxShadow: '0 12px 36px rgba(7,26,47,.10)',
  overflow: 'hidden',
  marginBottom: 22,
};
const sectionPad: React.CSSProperties = { padding: 30 };

function Label({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'dark' | 'badge';
}): JSX.Element {
  const color =
    tone === 'dark' ? 'rgba(255,255,255,.55)' : tone === 'badge' ? 'rgba(7,26,47,.65)' : GOLD_DEEP;
  return (
    <div
      style={{
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        fontSize: 10,
        fontWeight: 900,
      }}
    >
      {children}
    </div>
  );
}

const btnBase: React.CSSProperties = {
  borderRadius: 14,
  padding: '13px 16px',
  fontWeight: 900,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: 14,
};
const btnPrimary: React.CSSProperties = { ...btnBase, background: GOLD, color: INK };
const btnDark: React.CSSProperties = { ...btnBase, background: INK, color: 'white' };
const btnOutline: React.CSSProperties = {
  ...btnBase,
  background: 'white',
  border: `1px solid ${LINE}`,
  color: INK,
};

function PrintButton(): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') window.print();
      }}
      style={{ ...btnOutline, border: `1px solid ${LINE}`, cursor: 'pointer' }}
    >
      Download PDF
    </button>
  );
}

function SaveToToolboxButton({
  artifactName,
  roleLabel,
  prompt,
  rule,
}: {
  artifactName: string;
  roleLabel: string;
  prompt: string;
  rule: string;
}): JSX.Element {
  type SaveStatus =
    | 'idle'
    | 'saving'
    | 'saved'
    | 'auth-required'
    | 'foundation-required'
    | 'error';
  const [status, setStatus] = useState<SaveStatus>('idle');
  const label =
    status === 'saving'
      ? 'Saving…'
      : status === 'saved'
        ? 'Saved'
        : status === 'auth-required'
          ? 'Sign in to save'
          : status === 'foundation-required'
            ? 'Upgrade to save'
            : status === 'error'
              ? 'Try again'
              : 'Save to toolbox';
  const icon = status === 'saved' ? <CheckIcon /> : <BookmarkIcon />;
  // foundation-required: turn the button into a link to the Foundation
  // purchase page — In-Depth-only buyers cannot save until they upgrade.
  if (status === 'foundation-required') {
    return (
      <Link
        href="/courses/foundation/program/purchase"
        style={{
          ...btnOutline,
          border: `1px solid ${LINE}`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={async () => {
        setStatus('saving');
        try {
          const res = await fetch('/api/toolbox/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: 'in-depth',
              payload: { artifactName, roleLabel, prompt, rule },
            }),
          });
          if (res.status === 401) {
            setStatus('auth-required');
            setTimeout(() => {
              window.location.href =
                '/auth/login?next=' + encodeURIComponent(window.location.pathname);
            }, 800);
            return;
          }
          if (res.status === 403) {
            // Signed in but lacks Foundation tier — surface as upgrade path.
            setStatus('foundation-required');
            return;
          }
          if (!res.ok) {
            setStatus('error');
            return;
          }
          setStatus('saved');
          setTimeout(() => setStatus('idle'), 2400);
        } catch {
          setStatus('error');
        }
      }}
      style={{
        ...btnOutline,
        border: `1px solid ${LINE}`,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ── Enhancement components (v2 — institution-specific value-adds) ─────────

type PersonalizationState =
  | { status: 'loading' }
  | { status: 'ready'; data: PersonalizationPayload }
  | { status: 'error'; message: string }
  | { status: 'disabled' };

function usePersonalization(profileId: string, enabled: boolean): PersonalizationState {
  const [state, setState] = useState<PersonalizationState>(
    enabled ? { status: 'loading' } : { status: 'disabled' },
  );
  useEffect(() => {
    if (!enabled) return;
    const cacheKey = `aibi:personalize:${profileId}`;
    // Check cache first so reloads don't re-spend tokens.
    try {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as PersonalizationPayload;
        if (parsed.execSummary) {
          setState({ status: 'ready', data: parsed });
          return;
        }
      }
    } catch {
      // ignore cache errors
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/assessment/in-depth/personalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (cancelled) return;
          setState({
            status: 'error',
            message: (body as { error?: string }).error ?? `Request failed (${res.status}).`,
          });
          return;
        }
        const data = (await res.json()) as PersonalizationPayload;
        if (cancelled) return;
        try {
          window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {
          // quota exceeded; non-fatal
        }
        setState({ status: 'ready', data });
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'unknown error';
        setState({ status: 'error', message: msg });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, enabled]);
  return state;
}

function PersonalizationStripe({
  ctx,
  roleLabel,
}: {
  ctx: InstitutionContext;
  roleLabel: string;
}): JSX.Element {
  const parts: string[] = [];
  if (ctx.institution_name) parts.push(ctx.institution_name);
  if (ctx.asset_size_usd_millions)
    parts.push(`~$${ctx.asset_size_usd_millions}M assets`);
  else if (ctx.asset_band) parts.push(`${ctx.asset_band} band`);
  if (ctx.state) parts.push(ctx.state);
  if (ctx.regulator) parts.push(`${ctx.regulator}-supervised`);
  if (ctx.dept_fte) parts.push(`${roleLabel} team of ${ctx.dept_fte}`);
  return (
    <div
      style={{
        background: INK,
        color: 'white',
        borderRadius: 30,
        padding: '20px 30px',
        marginBottom: 22,
        boxShadow: '0 12px 36px rgba(7,26,47,.10)',
      }}
    >
      <div
        style={{
          color: GOLD_SOFT,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: 10,
          fontWeight: 900,
        }}
      >
        Built for
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          marginTop: 4,
        }}
      >
        {[ctx.first_name, ctx.last_name].filter(Boolean).join(' ')}
        {parts.length > 0 ? ' · ' : ''}
        <span style={{ color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>
          {parts.join(' · ')}
        </span>
      </div>
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
          fontSize: 10,
          fontWeight: 900,
        }}
      >
        Personalized executive summary
      </div>
      <div
        style={{
          fontSize: 15,
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

function PrintCSS(): JSX.Element {
  // Browser-native print path. The user clicks "Download PDF" → window.print()
  // → standard OS print dialog with "Save as PDF" option. No Puppeteer round-
  // trip needed for v1. Hides the sticky sidebar, removes shadows, forces
  // black-on-white text, and lets each section break on its own page.
  return (
    <style>{`
      @media print {
        body { background: white !important; }
        .mk-pr-sidebar { display: none !important; }
        .mk-pr-shell { grid-template-columns: 1fr !important; }
        .mk-pr-wrap { padding: 0 !important; max-width: 100% !important; }
        [style*="position: sticky"] { position: static !important; }
        section[id="summary"],
        section[id="artifact"],
        section[id="timeline"],
        section[id="packet"],
        section[id="score"] {
          page-break-inside: avoid;
          page-break-after: always;
          border-radius: 0 !important;
          box-shadow: none !important;
          border: 0 !important;
          margin-bottom: 0 !important;
        }
        a { color: inherit !important; text-decoration: none !important; }
        button { display: none !important; }
        .mk-pr-stack { display: none !important; }
      }
    `}</style>
  );
}

function ClipboardIcon(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="4" width="12" height="16" rx="2" />
      <path d="M16 4h-2a2 2 0 0 0-4 0H8" />
      <path d="M4 8v12a2 2 0 0 0 2 2h8" />
    </svg>
  );
}

function BookmarkIcon(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function CheckIcon(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 12 10 18 20 6" />
    </svg>
  );
}

function CopyButton({ text, label }: { text: string; label: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // Fallback for older browsers: user can still highlight and copy.
        }
      }}
      style={{
        ...btnPrimary,
        border: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}

// Responsive grid + sticky behavior — kept in one place so the inline-style
// approach above stays portable. Inline <style> is intentional: this file
// ships as a single client component, no global CSS coupling needed.
function ResponsiveCSS(): JSX.Element {
  return (
    <style>{`
      .mk-pr-shell {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 22px;
        align-items: start;
      }
      @media (min-width: 1001px) {
        .mk-pr-sidebar { position: sticky; top: 28px; }
      }
      .mk-pr-actionStrip {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        border-top: 1px solid ${LINE};
        background: white;
      }
      .mk-pr-action:last-child { border-right: 0 !important; }
      .mk-pr-artHead {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 18px;
        align-items: center;
      }
      .mk-pr-grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .mk-pr-packet {
        display: grid;
        grid-template-columns: .45fr .55fr;
        gap: 22px;
        align-items: start;
      }
      .mk-pr-phase {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 20px;
      }
      .mk-pr-playbooks {
        display: grid;
        grid-template-columns: 1.2fr 1fr 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 1000px) {
        .mk-pr-wrap { padding: 16px !important; }
        .mk-pr-shell { grid-template-columns: 1fr; }
        .mk-pr-sidebar { position: static !important; }
        .mk-pr-actionStrip,
        .mk-pr-playbooks,
        .mk-pr-artHead,
        .mk-pr-grid2,
        .mk-pr-packet,
        .mk-pr-phase {
          grid-template-columns: 1fr !important;
        }
        .mk-pr-action {
          border-right: 0 !important;
          border-bottom: 1px solid ${LINE};
        }
        .mk-pr-stack { display: none !important; }
        .mk-pr-table { overflow-x: auto; }
        .mk-pr-thead, .mk-pr-tr {
          grid-template-columns: repeat(5, minmax(120px, 1fr)) !important;
        }
      }
    `}</style>
  );
}
