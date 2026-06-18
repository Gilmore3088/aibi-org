// Personal AI Toolkit — /courses/foundation/program/toolkit
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
import {
  generateIteratedMarkdown,
  buildIteratedFilename,
} from '../_components/IterationTrackerData';
import type { ActivityResponse } from '@/types/course';
import { ArtifactsClient } from './_local/ArtifactsClient';
import { ToolkitSectionCard } from './_components/ToolkitSectionCard';
import { ToolkitCapstoneSummary } from './_components/ToolkitCapstoneSummary';
import {
  PLATFORM_LABELS,
  ACCESS_LABELS,
  DEV_ACTIVITY_RESPONSES,
  buildCountLine,
  buildArtifacts,
} from './_lib/toolkitArtifacts';

export const metadata: Metadata = {
  title: 'My Toolkit | AiBI-Foundation',
};

const kickerStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
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

  const m7Response = activityResponses['7.1'];
  const m7SkillMd: string | null = m7Response?.['skill-md-content'] ?? null;
  const m7Title = m7SkillMd
    ? (() => {
        const match = /^# (.+?) - v1/m.exec(m7SkillMd);
        return match ? match[1].trim() : 'Banking AI Skill v1.0';
      })()
    : 'Banking AI Skill v1.0';
  const m7Filename = m7SkillMd
    ? `${m7Title.replace(/\s+/g, '-').slice(0, 60)}-v1.0.md`
    : 'Banking-AI-Skill-v1.0.md';

  const m8Response = activityResponses['8.1'];
  const m8IteratedMd: string | null =
    m7SkillMd && m8Response ? generateIteratedMarkdown(m7SkillMd, m8Response) : null;
  const m8Filename = m8IteratedMd ? buildIteratedFilename(m7SkillMd ?? '') : 'Banking-AI-Skill-v1.1.md';

  const inventoryResponse = activityResponses['2.1'];
  const completedModules = enrollment.completed_modules;
  const courseComplete = completedModules.length >= 12;

  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

  const artifacts = buildArtifacts({
    inventoryResponse,
    completedModules,
    courseComplete,
    m7Title,
    m7SkillMd,
    m7Filename,
    m8IteratedMd,
    m8Filename,
    m8Response,
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

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'My Toolkit']}>
      <header style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span style={kickerStyle}>AiBI-Foundation · Saved artifacts</span>
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
          My AI toolkit
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
          {countLine || 'Nothing saved yet — finish Module 3 to start building your toolkit.'}
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
          Everything you produced during the course, in one place. Sort, filter, and re-download
          on demand.
        </p>
      </header>

      <ToolkitSectionCard title="Artifacts" label="All saved work">
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

      {m8Response && m7SkillMd && (
        <ToolkitSectionCard title="Capstone summary" label="Module 9 narrative">
          <ToolkitCapstoneSummary m7Title={m7Title} m8Response={m8Response} />
        </ToolkitSectionCard>
      )}
    </CourseShellWrapper>
  );
}
