'use client';

import { Wordmark } from '@/components/brand';
import { type MaturityBand } from '@content/assessments/v4/types';
import { INK } from '@/lib/brand/colors';
import { GOLD_SOFT } from './constants';

export function Sidebar({
  score,
  band,
  roleLabel,
  topGap,
  primaryArtifact,
  activeSection,
  notesEnabled,
}: {
  readonly score: number;
  readonly band: MaturityBand;
  readonly roleLabel: string;
  readonly topGap: { score: number; label: string } | undefined;
  readonly primaryArtifact: string;
  readonly activeSection: string;
  readonly notesEnabled: boolean;
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
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 900 }}>
          <Wordmark variant="full" tone="light" size={20} />
        </div>
        <div
          style={{
            fontSize: '5.125rem',
            color: GOLD_SOFT,
            fontWeight: 950,
            lineHeight: 0.9,
            letterSpacing: '-0.06em',
            marginTop: 22,
          }}
        >
          {score}
          <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,.5)' }}> /100</span>
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
        <SidebarNav href="#actionplan" label="Action Plan" num="03" active={activeSection === 'actionplan'} />
        <SidebarNav href="#artifact" label="Artifact" num="04" active={activeSection === 'artifact'} />
        <SidebarNav href="#workproducts" label="Work Products" num="05" active={activeSection === 'workproducts'} />
        <SidebarNav href="#timeline" label="Timeline" num="06" active={activeSection === 'timeline'} />
        <SidebarNav href="#packet" label="Reviewer Packet" num="07" active={activeSection === 'packet'} />
        {notesEnabled && (
          <SidebarNav href="#notes" label="My Notes" num="08" active={activeSection === 'notes'} />
        )}
        <SidebarNav href="#learning" label="Learning Path" num={notesEnabled ? '09' : '08'} active={activeSection === 'learning'} />
        <SidebarNav href="#score" label="Score Appendix" num={notesEnabled ? '10' : '09'} active={activeSection === 'score'} />
      </nav>
    </aside>
  );
}

function SidebarBlock({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
      <span style={{ display: 'block', color: 'rgba(255,255,255,.55)', fontSize: '0.8125rem' }}>
        {label}
      </span>
      <b style={{ display: 'block', marginTop: 4, fontSize: '1.0625rem' }}>{value}</b>
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
        fontSize: '0.875rem',
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
