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

import { useEffect, useState } from 'react';
import { type Dimension, type MaturityBand } from '@content/assessments/v4/types';
import { ROLE_V4_META, type RoleV4 } from '@content/assessments/v4/roles';
import { INK, CREAM } from '@/lib/brand/colors';
import {
  getActionPacket,
  classifyDimensions,
} from '@content/assessments/v4/action-packet';
import type {
  DimensionScoreSerializedV4,
  InstitutionContext,
} from '@/lib/assessment/load-response';
import { Sidebar } from './paid-report/Sidebar';
import { PersonalizationStripe } from './paid-report/PersonalizationStripe';
import { Section1Summary } from './paid-report/Section1Summary';
import { SectionRootCause } from './paid-report/SectionRootCause';
import { SectionActionPlan } from './paid-report/SectionActionPlan';
import { Section2Artifact } from './paid-report/Section2Artifact';
import { SectionWorkProducts } from './paid-report/SectionWorkProducts';
import { Section3Timeline } from './paid-report/Section3Timeline';
import { Section4Packet } from './paid-report/Section4Packet';
import { NotesSection } from './paid-report/NotesSection';
import { SectionLearning } from './paid-report/SectionLearning';
import { Section5ScoreAppendix } from './paid-report/Section5ScoreAppendix';
import { Footer } from './paid-report/Footer';
import { PrintCSS, ResponsiveCSS } from './paid-report/layout-css';
import type { PersonalizationState, PersonalizationPayload } from './paid-report/types';

export interface PaidReportProps {
  readonly profileId: string;
  readonly email: string;
  readonly score: number; // normalized 0-100
  readonly band: MaturityBand;
  readonly role: RoleV4 | null;
  readonly dimensionBreakdown: Record<Dimension, DimensionScoreSerializedV4>;
  readonly readinessAt: string;
  readonly institutionContext: InstitutionContext | null;
  readonly actionPacketNotes?: string | null;
  readonly notesEnabled?: boolean;
  readonly personalizationEnabled?: boolean;
}

export function PaidReport({
  profileId,
  email,
  score,
  band,
  role,
  dimensionBreakdown,
  institutionContext,
  actionPacketNotes = null,
  notesEnabled = true,
  personalizationEnabled = true,
}: PaidReportProps): JSX.Element {
  const packet = getActionPacket(role);
  const roleMeta = role ? ROLE_V4_META[role] : null;
  const { protect, use, build } = classifyDimensions(dimensionBreakdown);
  const topGap = protect[0];
  const ctx = institutionContext ?? {};
  const personalization = usePersonalization(profileId, personalizationEnabled && !!ctx.first_name);

  // Inline mailto: prefilled with score + role + a placeholder note line.
  const briefingMailto = `mailto:hello@aibankinginstitute.com?subject=${encodeURIComponent(
    `Executive Briefing — In-Depth result (${roleMeta?.label ?? 'role'})`,
  )}&body=${encodeURIComponent(
    `Hi, my In-Depth diagnostic returned a score of ${score}/100 in the ${band.label} band. My role: ${roleMeta?.label ?? 'unspecified'}. My top gap: ${topGap?.label ?? 'see report'}. I'd like to discuss the next move.\n\nThanks,\n`,
  )}`;


  // Anchor highlighting — observe each section, mark its sidebar nav link
  // as active when the section is in view.
  const sectionIds = notesEnabled
    ? ['summary', 'rootcause', 'actionplan', 'artifact', 'workproducts', 'timeline', 'packet', 'notes', 'learning', 'score']
    : ['summary', 'rootcause', 'actionplan', 'artifact', 'workproducts', 'timeline', 'packet', 'learning', 'score'];
  const activeSection = useActiveSection(sectionIds);
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
            notesEnabled={notesEnabled}
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
              band={band}
              topGap={topGap}
            />
            <SectionRootCause protect={protect} use={use} />
            <SectionActionPlan protect={protect} use={use} />
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
            {notesEnabled && (
              <NotesSection profileId={profileId} initialNotes={actionPacketNotes} />
            )}
            <SectionLearning protect={protect} packet={packet} />
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

// ── Personalization data hook (institution-specific value-add) ────────────

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
