// Personal AI Toolkit — /courses/foundation/program/toolkit
// Server Component: reads activity responses for the learner's enrollment,
// builds a unified artifact list (skills, work products, cards, report),
// and hands it to the client filter/sort grid.
//
// Design: mockup system (cream surface, ink primary, gold accent).
// WCAG 2.1 AA; no hardcoded hex — CSS variables only.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import type { ActivityResponse } from '@/types/course';
import { ArtifactsClient } from './_local/ArtifactsClient';
import { SectionCard } from './_local/SectionCard';
import { SubscriptionInventoryDetail } from './_local/SubscriptionInventoryDetail';
import { CapstoneSummary } from './_local/CapstoneSummary';
import { buildArtifacts } from './_local/buildArtifacts';
import {
  DEV_ACTIVITY_RESPONSES,
  buildCountLine,
  kickerStyle,
  type CountSummary,
} from './_local/toolkitConstants';

export const metadata: Metadata = {
  title: 'My Toolkit | AiBI-Foundation',
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

  const { artifacts, inventoryResponse, m7SkillMd, m7Title, m8Response } = buildArtifacts({
    activityResponses,
    completedModules: enrollment.completed_modules,
    enrollmentId: enrollment.id,
  });

  const counts: CountSummary = {
    prompts: artifacts.filter((a) => a.available && a.type === 'prompt').length,
    workProducts: artifacts.filter((a) => a.available && a.type === 'work-product').length,
    cards: artifacts.filter((a) => a.available && a.type === 'card').length,
    inventories: artifacts.filter((a) => a.available && a.type === 'inventory').length,
    reports: artifacts.filter((a) => a.available && a.type === 'report').length,
  };
  const countLine = buildCountLine(counts);

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'My Toolkit']}>
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
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
            fontSize: 15,
            lineHeight: 1.55,
            color: 'var(--slate-600)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          Everything you produced during the course, in one place. Sort, filter, and re-download
          on demand.
        </p>
      </header>

      <SectionCard title="Artifacts" label="All saved work">
        <ArtifactsClient artifacts={artifacts} />
      </SectionCard>

      {inventoryResponse && (
        <SubscriptionInventoryDetail inventoryResponse={inventoryResponse} />
      )}

      {m8Response && m7SkillMd && (
        <CapstoneSummary m7Title={m7Title} m8Response={m8Response} />
      )}
    </CourseShellWrapper>
  );
}
