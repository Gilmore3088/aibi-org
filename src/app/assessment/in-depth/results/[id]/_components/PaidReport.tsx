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

import { useState } from 'react';
import { DIMENSION_LABELS, type Dimension, type MaturityBand } from '@content/assessments/v4/types';
import { ROLE_V4_META, type RoleV4 } from '@content/assessments/v4/roles';
import {
  getActionPacket,
  classifyDimensions,
  type ActionPacket,
} from '@content/assessments/v4/action-packet';
import type { DimensionScoreSerializedV4 } from '@/lib/assessment/load-response';

export interface PaidReportProps {
  readonly profileId: string;
  readonly email: string;
  readonly score: number; // normalized 0-100
  readonly band: MaturityBand;
  readonly role: RoleV4 | null;
  readonly dimensionBreakdown: Record<Dimension, DimensionScoreSerializedV4>;
  readonly readinessAt: string;
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
}: PaidReportProps): JSX.Element {
  const packet = getActionPacket(role);
  const roleMeta = role ? ROLE_V4_META[role] : null;
  const { protect, use, build } = classifyDimensions(dimensionBreakdown);
  const topGap = protect[0];

  // Inline mailto: prefilled with score + role + a placeholder note line.
  const briefingMailto = `mailto:hello@aibankinginstitute.com?subject=${encodeURIComponent(
    `Executive Briefing — In-Depth result (${roleMeta?.label ?? 'role'})`,
  )}&body=${encodeURIComponent(
    `Hi, my In-Depth diagnostic returned a score of ${score}/100 in the ${band.label} band. My role: ${roleMeta?.label ?? 'unspecified'}. My top gap: ${topGap?.label ?? 'see report'}. I'd like to discuss the next move.\n\nThanks,\n`,
  )}`;

  // "Send to reviewer" — pre-populated with the artifact name and prompt.
  const reviewerMailto = `mailto:?subject=${encodeURIComponent(
    `AI work review — ${packet.primaryArtifact.name}`,
  )}&body=${encodeURIComponent(
    `I ran the AI-assisted workflow below and would like your review.\n\nWorkflow: ${packet.primaryArtifact.name}\nUse before: ${packet.primaryArtifact.useBefore}\n\nRule:\n${packet.primaryArtifact.copyRule}\n\nPrompt used:\n${packet.primaryArtifact.copyPrompt}\n\n— Sent from my AiBI In-Depth report (${email})`,
  )}`;

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
          />
          <main style={{ minWidth: 0 }}>
            <Section1Summary packet={packet} briefingMailto={briefingMailto} />
            <Section2Artifact
              packet={packet}
              protect={protect}
              use={use}
              build={build}
              reviewerMailto={reviewerMailto}
            />
            <Section3Timeline packet={packet} />
            <Section4Packet packet={packet} reviewerMailto={reviewerMailto} />
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
    </div>
  );
}

// ── Sidebar (sticky on desktop) ─────────────────────────────────────────────

function Sidebar({
  score,
  band,
  roleLabel,
  topGap,
  primaryArtifact,
}: {
  readonly score: number;
  readonly band: MaturityBand;
  readonly roleLabel: string;
  readonly topGap: { score: number; label: string } | undefined;
  readonly primaryArtifact: string;
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
        <SidebarBlock label="Top gap" value={`${topGap.label} · ${topGap.score}`} />
      )}
      <SidebarBlock label="Primary artifact" value={primaryArtifact} />
      <nav style={{ padding: 18 }}>
        <SidebarNav href="#summary" label="Action Packet" num="01" />
        <SidebarNav href="#artifact" label="Artifact" num="02" />
        <SidebarNav href="#timeline" label="Timeline" num="03" />
        <SidebarNav href="#packet" label="Reviewer Packet" num="04" />
        <SidebarNav href="#score" label="Score Appendix" num="05" />
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
}: {
  href: string;
  label: string;
  num: string;
}): JSX.Element {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 13px',
        borderRadius: 14,
        color: 'rgba(255,255,255,.78)',
        textDecoration: 'none',
        fontWeight: 800,
        fontSize: 14,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.09)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span>{label}</span>
      <span style={{ color: 'rgba(255,255,255,.45)' }}>{num}</span>
    </a>
  );
}

// ── Section 1: Action Packet Summary ────────────────────────────────────────

function Section1Summary({
  packet,
  briefingMailto,
}: {
  packet: ActionPacket;
  briefingMailto: string;
}): JSX.Element {
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
          {packet.thesisHeadline}
        </h1>
        <p style={{ maxWidth: 850, fontSize: 18, color: SLATE, lineHeight: 1.58 }}>
          {packet.thesisBody}
        </p>
        <div
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}
        >
          <a href={briefingMailto} style={btnPrimary}>
            Book briefing
          </a>
          <a href={`/playbooks/${packet.playbookPath.best.slug}`} style={btnDark}>
            Open {packet.playbookPath.best.label} playbook
          </a>
          <a href="#timeline" style={btnOutline}>
            Start 30-day plan
          </a>
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
  reviewerMailto,
}: {
  packet: ActionPacket;
  protect: ReadonlyArray<{ score: number; label: string }>;
  use: ReadonlyArray<{ score: number; label: string }>;
  build: ReadonlyArray<{ score: number; label: string }>;
  reviewerMailto: string;
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
          <Label tone="badge">Use before</Label>
          <h3 style={{ fontSize: 18, letterSpacing: '-0.02em', margin: '4px 0 0', fontWeight: 800 }}>
            {a.useBefore}
          </h3>
        </div>
      </div>

      <div style={sectionPad}>
        {a.table && <ArtifactTable cols={a.table.columns} rows={a.table.rows} />}

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

        <div className="mk-pr-grid2" style={{ marginTop: 18 }}>
          <div>
            <Label>Copy-ready prompt</Label>
            <PromptBlock text={a.copyPrompt} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <CopyButton text={a.copyPrompt} label="Copy prompt" />
              <a href={`/playbooks/${packet.playbookPath.best.slug}`} style={btnOutline}>
                Open playbook
              </a>
              <a href={reviewerMailto} style={btnOutline}>
                Send to reviewer
              </a>
            </div>
          </div>
          <div>
            <Label>Protect · Use · Build</Label>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
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

function PromptBlock({ text }: { text: string }): JSX.Element {
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

function Section3Timeline({ packet }: { packet: ActionPacket }): JSX.Element {
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
      </div>
      <div>
        {packet.timeline.map((p) => (
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
                {p.checks.map((c) => (
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
        ))}
      </div>
    </section>
  );
}

// ── Section 4: Reviewer Packet ──────────────────────────────────────────────

function Section4Packet({
  packet,
  reviewerMailto,
}: {
  packet: ActionPacket;
  reviewerMailto: string;
}): JSX.Element {
  return (
    <section id="packet" style={pageStyle}>
      <div className="mk-pr-packet" style={sectionPad}>
        <div>
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
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={reviewerMailto} style={btnPrimary}>
              Send reviewer packet
            </a>
          </div>
        </div>
        <DocStack items={packet.reviewerPacket} />
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

function DocStack({ items }: { items: ReadonlyArray<{ name: string }> }): JSX.Element {
  // Decorative — visualizes the stack of reviewer-packet docs. Hidden on
  // narrow viewports via mk-pr-stack class in ResponsiveCSS.
  const positions: ReadonlyArray<{ left: number; top: number; rotate: number }> = [
    { left: 55, top: 38, rotate: -5 },
    { left: 130, top: 80, rotate: 4 },
    { left: 75, top: 150, rotate: -2 },
    { left: 160, top: 210, rotate: 5 },
  ];
  return (
    <div
      className="mk-pr-stack"
      aria-hidden="true"
      style={{
        height: 360,
        border: `1px solid ${LINE}`,
        borderRadius: 26,
        background: 'linear-gradient(135deg, #fff, #f7f3ea)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {items.slice(0, 4).map((item, i) => {
        const p = positions[i] ?? positions[0];
        return (
          <div
            key={item.name}
            style={{
              position: 'absolute',
              width: 250,
              height: 140,
              background: 'white',
              border: `1px solid ${LINE}`,
              borderRadius: 18,
              boxShadow: '0 18px 40px rgba(7,26,47,.11)',
              padding: 18,
              left: p.left,
              top: p.top,
              transform: `rotate(${p.rotate}deg)`,
            }}
          >
            <b style={{ fontSize: 14 }}>{item.name}</b>
            <div style={{ height: 8, background: GOLD, borderRadius: 999, marginTop: 12 }} />
            <div style={{ height: 8, background: '#d7cfbd', borderRadius: 999, marginTop: 10 }} />
            <div
              style={{
                height: 8,
                background: '#d7cfbd',
                borderRadius: 999,
                marginTop: 10,
                width: '62%',
              }}
            />
          </div>
        );
      })}
    </div>
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
          // Fallback for older browsers: select the prompt text manually.
          // Silently no-op; user can still highlight and copy.
        }
      }}
      style={{
        ...btnPrimary,
        border: 0,
        cursor: 'pointer',
      }}
    >
      {copied ? 'Copied ✓' : label}
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
