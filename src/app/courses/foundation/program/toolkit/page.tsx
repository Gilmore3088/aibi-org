// Foundation Packet — /courses/foundation/program/toolkit
// Server Component: reads activity responses for the learner's enrollment,
// builds a unified artifact list (skills, work products, cards, report),
// and hands it to the client filter/sort grid.
//
// Design: mockup system (cream surface, ink primary, gold accent).
// WCAG 2.1 AA; no hardcoded hex — CSS variables only.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import type { ActivityResponse } from '@/types/course';
import { ArtifactsClient } from './_local/ArtifactsClient';
import { DownloadReportButton } from './DownloadReportButton';
import { ToolkitSectionCard } from './_components/ToolkitSectionCard';
import { ToolkitCapstoneSummary } from './_components/ToolkitCapstoneSummary';
import {
  FOUNDATION_MODULE_COUNT,
  FOUNDATION_PACKET_ARTIFACT_COUNT,
} from '@content/courses/foundation-program';
import {
  PLATFORM_LABELS,
  ACCESS_LABELS,
  DEV_ACTIVITY_RESPONSES,
  buildCountLine,
  buildArtifacts,
} from './_lib/toolkitArtifacts';

export const metadata: Metadata = {
  title: 'My Foundation Packet | AiBI-Foundation',
};

const kickerStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const primaryLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 42,
  padding: '10px 16px',
  borderRadius: 14,
  background: 'var(--ink)',
  color: 'var(--cream)',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  textDecoration: 'none',
};

const overviewPanelStyle: CSSProperties = {
  border: '1px solid var(--ink-a10)',
  borderRadius: 20,
  background: 'var(--cream-2)',
  boxShadow: 'var(--shadow-soft)',
};

export default async function ToolkitPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  const activityResponses: Record<string, Record<string, string>> = {};

  if (isSupabaseConfigured()) {
    const serviceClient = createServiceRoleClient();
    const { data: rows } = await serviceClient
      .from('activity_responses')
      .select('activity_id, response')
      .eq('enrollment_id', enrollment.id);

    if (rows) {
      for (const row of rows as Pick<ActivityResponse, 'activity_id' | 'response'>[]) {
        activityResponses[row.activity_id] = row.response as Record<string, string>;
      }
    }
  } else {
    Object.assign(activityResponses, DEV_ACTIVITY_RESPONSES);
  }

  const skillResponse = activityResponses['13.1'];
  const workflowResponse = activityResponses['17.1'];

  const inventoryResponse = activityResponses['2.1'];
  const completedModules = enrollment.completed_modules;
  const courseComplete = completedModules.length >= FOUNDATION_MODULE_COUNT;

  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

  const artifacts = buildArtifacts({
    inventoryResponse,
    completedModules,
    courseComplete,
    enrollmentId: enrollment.id,
    daysAgo,
  });

  const countLine = buildCountLine({
    prompts: artifacts.filter((a) => a.available && a.type === 'prompt').length,
    workProducts: artifacts.filter((a) => a.available && a.type === 'work-product').length,
    cards: artifacts.filter((a) => a.available && a.type === 'card').length,
    inventories: artifacts.filter((a) => a.available && a.type === 'inventory').length,
    reports: artifacts.filter((a) => a.available && a.type === 'report').length,
  });

  const availableArtifacts = artifacts.filter((artifact) => artifact.available);
  const availableCount = availableArtifacts.length;
  const totalArtifacts = artifacts.length;
  const readinessScore = totalArtifacts > 0 ? Math.round((availableCount / totalArtifacts) * 100) : 0;
  const nextArtifact = artifacts.find((artifact) => !artifact.available);
  const promptCount = availableArtifacts.filter((artifact) => artifact.type === 'prompt').length;
  const decisionCount = availableArtifacts.filter((artifact) => artifact.type === 'card').length;
  const reviewCount = availableArtifacts.filter(
    (artifact) => artifact.type === 'work-product' || artifact.type === 'report',
  ).length;
  const qualityCueCount = availableArtifacts.reduce(
    (total, artifact) => total + (artifact.qualitySignals?.length ?? 0),
    0,
  );
  const packetStatus =
    readinessScore === 100
      ? 'Complete'
      : readinessScore >= 70
        ? 'Review draft'
        : readinessScore >= 35
          ? 'In progress'
          : 'Building';

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'My Toolkit']}>
      <header style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span style={kickerStyle}>
            AiBI-Foundation · {FOUNDATION_PACKET_ARTIFACT_COUNT}-piece packet
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: 'clamp(36px, 4.6vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
            color: 'var(--ink)',
          }}
        >
          My Foundation Packet
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.45,
            color: 'var(--ink)',
            margin: '0 0 12px',
            maxWidth: '60ch',
            fontWeight: 500,
          }}
        >
          {countLine || 'Nothing saved yet — finish Module 1 to start building your packet.'}
        </p>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          The manager-ready work products you produced during the course, in one place. Review
          status, quality cues, and next actions before you share anything outside the course.
        </p>
      </header>

      <section
        aria-labelledby="packet-readiness"
        style={{
          ...overviewPanelStyle,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 22,
              minWidth: 0,
            }}
          >
            <div>
              <p style={{ ...kickerStyle, marginBottom: 8 }}>Packet readiness</p>
              <h2
                id="packet-readiness"
                style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'var(--ink)',
                  margin: '0 0 12px',
                }}
              >
                {availableCount}/{totalArtifacts} saved
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: 'var(--slate-500)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {packetStatus}. Each saved artifact should show purpose, input, AI-assisted work,
                human review, and a safety boundary.
              </p>
            </div>

            <div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={readinessScore}
                aria-label="Foundation Packet completion"
                style={{
                  height: 12,
                  borderRadius: 999,
                  background: 'var(--ink-a10)',
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: `${readinessScore}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'var(--gold)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {courseComplete ? (
                  <DownloadReportButton enrollmentId={enrollment.id} />
                ) : nextArtifact ? (
                  <Link href={nextArtifact.moduleHref} style={primaryLinkStyle}>
                    Continue Module {nextArtifact.module}
                  </Link>
                ) : null}
                <Link
                  href="/courses/foundation/program"
                  style={{
                    ...primaryLinkStyle,
                    background: 'var(--cream)',
                    color: 'var(--ink)',
                    border: '1px solid var(--ink-a10)',
                  }}
                >
                  Program home
                </Link>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              minWidth: 0,
            }}
          >
            {[
              ['Prompt assets', promptCount, 'Reusable instructions with placeholders'],
              ['Review artifacts', reviewCount, 'Work products ready for manager review'],
              ['Decision cards', decisionCount, 'Reusable boundaries and escalation rules'],
              ['Quality cues', qualityCueCount, 'Signals to check before sharing'],
            ].map(([label, value, note]) => (
              <div
                key={label}
                style={{
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 16,
                  background: 'var(--cream)',
                  padding: 16,
                  minHeight: 128,
                }}
              >
                <p style={{ ...kickerStyle, marginBottom: 14 }}>{label}</p>
                <p
                  style={{
                    fontSize: 34,
                    lineHeight: 1,
                    fontWeight: 800,
                    color: 'var(--ink)',
                    margin: '0 0 10px',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.45,
                    color: 'var(--slate-500)',
                    margin: 0,
                  }}
                >
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="manager-summary"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: 18,
            alignItems: 'stretch',
            marginBottom: 24,
        }}
      >
        <div
          style={{
            ...overviewPanelStyle,
            padding: 24,
            background: 'var(--ink)',
          }}
        >
          <p style={{ ...kickerStyle, color: 'var(--gold)', marginBottom: 10 }}>
            Manager handoff
          </p>
          <h2
            id="manager-summary"
            style={{
              color: 'var(--cream)',
              fontSize: 'clamp(24px, 3vw, 34px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Review the packet as evidence of judgment, not AI usage.
          </h2>
        </div>

        <div
          style={{
            ...overviewPanelStyle,
            padding: 24,
            display: 'grid',
            gap: 0,
          }}
        >
          {[
            ['What changed', 'Cleaner work products, reusable prompts, and safer tool choices.'],
            ['What to inspect', 'Sources, assumptions, review owner, blocked data, and escalation path.'],
            ['What to reuse', 'The artifacts that can become team templates after manager review.'],
          ].map(([label, copy], index) => (
            <div
              key={label}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, 150px) minmax(0, 1fr)',
                gap: 16,
                padding: index === 0 ? '0 0 16px' : '16px 0',
                borderBottom: index === 2 ? 'none' : '1px solid var(--ink-a10)',
              }}
            >
              <p style={{ ...kickerStyle }}>{label}</p>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.5,
                  color: 'var(--ink)',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ToolkitSectionCard
        title="Foundation Packet"
        label={`${FOUNDATION_PACKET_ARTIFACT_COUNT} saved work products`}
      >
        <ArtifactsClient artifacts={artifacts} />
      </ToolkitSectionCard>

      {inventoryResponse && (
        <ToolkitSectionCard title="Subscription inventory detail" label="Module 2 baseline">
          <p style={{ fontSize: 16, color: 'var(--slate-500)', marginBottom: 16, lineHeight: 1.6 }}>
            Recorded during Module 2. Update by revisiting{' '}
            <Link
              href="/courses/foundation/program/2"
              style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              Module 2
            </Link>
            .
          </p>
          <div style={{ display: 'grid', gap: 0 }}>
            {Object.entries(PLATFORM_LABELS).map(([fieldId, platformName], i, arr) => {
              const rawValue = inventoryResponse[fieldId] ?? '';
              const displayValue = ACCESS_LABELS[rawValue] ?? rawValue;
              return (
                <div
                  key={fieldId}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 16,
                    padding: '10px 0',
                    borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--ink-a10)',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', flex: '0 0 220px' }}>
                    {platformName}
                  </span>
                  <span style={{ fontSize: 16, color: 'var(--slate-500)' }}>
                    {displayValue || 'No selection recorded'}
                  </span>
                </div>
              );
            })}
          </div>
        </ToolkitSectionCard>
      )}

      {(skillResponse || workflowResponse) && (
        <ToolkitSectionCard title="Reusable workflow evidence" label="Packet proof">
          <ToolkitCapstoneSummary
            skillResponse={skillResponse}
            workflowResponse={workflowResponse}
          />
        </ToolkitSectionCard>
      )}
    </CourseShellWrapper>
  );
}
