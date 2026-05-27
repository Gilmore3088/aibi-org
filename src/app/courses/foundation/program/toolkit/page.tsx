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
import { ArtifactsClient, type ToolkitArtifact } from './_local/ArtifactsClient';

export const metadata: Metadata = {
  title: 'My Toolkit | AiBI-Foundation',
};

// ---- Platform labels for subscription inventory display ----

const PLATFORM_LABELS: Record<string, string> = {
  'chatgpt-access': 'ChatGPT (OpenAI)',
  'claude-access': 'Claude (Anthropic)',
  'gemini-access': 'Gemini (Google)',
  'copilot-access': 'Microsoft 365 Copilot',
  'perplexity-access': 'Perplexity',
  'notebooklm-access': 'NotebookLM (Google)',
  'copilot-free-access': 'Microsoft Copilot (Free)',
};

const ACCESS_LABELS: Record<string, string> = {
  free: 'Free tier',
  paid: 'Paid subscription',
  'not-sure': 'Not sure',
  none: 'Not using',
  institutional: 'Institutional license (IT-provisioned)',
  'not-provisioned': 'Not provisioned for me',
};

// ---- Dev-mode placeholder data ----

const DEV_ACTIVITY_RESPONSES: Record<string, Record<string, string>> = {
  '2.1': {
    'chatgpt-access': 'paid',
    'claude-access': 'free',
    'gemini-access': 'none',
    'copilot-access': 'not-provisioned',
    'perplexity-access': 'none',
    'notebooklm-access': 'free',
    'copilot-free-access': 'free',
  },
  '7.1': {
    'skill-role':
      'You are a senior compliance officer at a community bank with expertise in BSA/AML regulations and staff training.',
    'skill-context':
      'The bank needs to translate dense regulatory guidance into plain-language FAQs for frontline staff who handle BSA-related customer interactions.',
    'skill-task':
      'Analyze the provided regulatory guidance document and produce a structured FAQ of 8–12 questions with plain-language answers suitable for frontline staff with no compliance background.',
    'skill-format': 'numbered-list',
    'skill-constraint':
      'Never fabricate regulatory citations. Flag any threshold, deadline, or penalty amount for human verification. Use plain language — avoid legal jargon. Maximum 2 sentences per answer.',
    'skill-md-content':
      '# Compliance Officer Skill - v1.0\n\n## Role\nYou are a senior compliance officer at a community bank with expertise in BSA/AML regulations and staff training.\n\n## Context\nThe bank needs to translate dense regulatory guidance into plain-language FAQs for frontline staff who handle BSA-related customer interactions.\n\n## Task\nAnalyze the provided regulatory guidance document and produce a structured FAQ of 8–12 questions with plain-language answers suitable for frontline staff with no compliance background.\n\n## Format\nNumbered list\n\n## Constraints\nNever fabricate regulatory citations. Flag any threshold, deadline, or penalty amount for human verification. Use plain language — avoid legal jargon. Maximum 2 sentences per answer.\n',
  },
  '8.1': {
    'test-input-1':
      'BSA Officer Memo from October 2025 re: updated CTR filing thresholds and structuring detection requirements.',
    'output-assessment-1':
      'Performed well overall. The FAQ structure was clean and staff-readable. One failure: the AI generated a specific dollar threshold without flagging it for verification — a direct violation of the Constraints component.',
    'test-input-2':
      'CFPB guidance on UDAP/UDAAP plain-language disclosure requirements. More ambiguous and less structured than a BSA memo.',
    'output-assessment-2':
      'Constraints gap exposed: the skill did not handle ambiguous source documents well. The AI presented interpretations as facts rather than flagging them as areas requiring legal review.',
    'revision-notes':
      'Added a Constraint: "If the source document contains ambiguous language or interpretations, present them as areas requiring legal review — never as definitive rules." Also strengthened the task definition to explicitly require flagging all specific dollar amounts, dates, and thresholds.',
    'sharing-ladder-level': 'team',
  },
  '9.capstone': {
    'automation-what':
      'Automated the first draft of BSA regulatory FAQ documents for frontline staff training.',
    'automation-tier': 'Tier B — Requires compliance officer review before distribution',
    'quality-standard': 'passed',
  },
};

// ---- Shared styles ----

const kickerStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const sectionCardStyle: CSSProperties = {
  background: 'var(--cream-2)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 24,
  padding: 28,
  marginBottom: 24,
  boxShadow: 'var(--shadow-soft)',
};

// ---- Section card wrapper ----

function SectionCard({
  title,
  label,
  children,
}: {
  readonly title: string;
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  const slug = label.replace(/\s+/g, '-').toLowerCase();
  return (
    <section style={sectionCardStyle} aria-labelledby={`section-${slug}`}>
      <p style={{ ...kickerStyle, marginBottom: 4 }}>{label}</p>
      <h2
        id={`section-${slug}`}
        style={{
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 20px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ---- Headline counts ----

interface CountSummary {
  readonly prompts: number;
  readonly workProducts: number;
  readonly cards: number;
  readonly inventories: number;
  readonly reports: number;
}

function buildCountLine(c: CountSummary): string {
  const parts: string[] = [];
  if (c.prompts > 0) parts.push(`${c.prompts} saved prompt${c.prompts === 1 ? '' : 's'}`);
  if (c.workProducts > 0)
    parts.push(`${c.workProducts} reviewed work product${c.workProducts === 1 ? '' : 's'}`);
  if (c.cards > 0)
    parts.push(`${c.cards} Acceptable Use card${c.cards === 1 ? '' : 's'}`);
  if (c.inventories > 0)
    parts.push(`${c.inventories} subscription inventor${c.inventories === 1 ? 'y' : 'ies'}`);
  if (c.reports > 0)
    parts.push(`${c.reports} transformation report${c.reports === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

// ---- Main page ----

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

  // Synthetic last-edited stamps: dev mode shows recent activity; production
  // would replace with actual activity_responses.updated_at timestamps once
  // they're surfaced from Supabase.
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

  const artifacts: ToolkitArtifact[] = [
    // M2 inventory (treated as a saved prompt-style reference)
    {
      id: 'subscription-inventory',
      title: 'Subscription Inventory',
      description: 'Your recorded access tier for the seven major AI platforms — the baseline reference for what you can use at work and at home.',
      type: 'inventory',
      typeLabel: 'Inventory',
      module: 2,
      moduleHref: '/courses/foundation/program/2',
      lastEditedISO: inventoryResponse ? daysAgo(18) : null,
      available: Boolean(inventoryResponse),
      action: inventoryResponse
        ? { kind: 'link', href: '/courses/foundation/program/2', label: 'View / edit' }
        : { kind: 'pending', href: '/courses/foundation/program/2' },
    },
    // M4 platform reference card
    {
      id: 'platform-feature-reference-card',
      title: 'Platform Feature Reference Card',
      description: 'Quick reference matching your onboarding platform to its key features and top banking use cases.',
      type: 'card',
      typeLabel: 'Reference card',
      module: 4,
      moduleHref: '/courses/foundation/program/4',
      lastEditedISO: completedModules.includes(4) ? daysAgo(14) : null,
      available: completedModules.includes(4),
      action: completedModules.includes(4)
        ? { kind: 'link', href: '/courses/foundation/program/4', label: 'Re-download' }
        : { kind: 'pending', href: '/courses/foundation/program/4' },
    },
    // M5 Acceptable Use card
    {
      id: 'acceptable-use-card',
      title: 'Acceptable Use Card',
      description: 'Personalized one-page reference with your role context, permitted tools, and highest-risk guardrails. Designed to print and keep at your workstation.',
      type: 'card',
      typeLabel: 'Acceptable Use card',
      module: 5,
      moduleHref: '/courses/foundation/program/5',
      lastEditedISO: completedModules.includes(5) ? daysAgo(12) : null,
      available: completedModules.includes(5),
      action: completedModules.includes(5)
        ? { kind: 'link', href: '/courses/foundation/program/5', label: 'Re-download' }
        : { kind: 'pending', href: '/courses/foundation/program/5' },
    },
    // M1 cheatsheet
    {
      id: 'regulatory-cheatsheet',
      title: 'Regulatory Cheatsheet',
      description: 'One-page PDF: five frameworks with staff-level implications (front), AIEOG vocabulary (back).',
      type: 'card',
      typeLabel: 'Reference card',
      module: 1,
      moduleHref: '/courses/foundation/program/1',
      lastEditedISO: completedModules.includes(1) ? daysAgo(22) : null,
      available: completedModules.includes(1),
      action: completedModules.includes(1)
        ? { kind: 'link', href: '/courses/foundation/program/1', label: 'Re-download' }
        : { kind: 'pending', href: '/courses/foundation/program/1' },
    },
    // M6 skill library
    {
      id: 'skill-template-library',
      title: 'Skill Template Library',
      description: '12 pre-built banking skill templates across four roles (Lending, Compliance, Operations, Marketing) with all five RTFC components filled in.',
      type: 'prompt',
      typeLabel: 'Saved prompt',
      module: 6,
      moduleHref: '/courses/foundation/program/6',
      lastEditedISO: completedModules.includes(6) ? daysAgo(8) : null,
      available: completedModules.includes(6),
      action: completedModules.includes(6)
        ? { kind: 'link', href: '/courses/foundation/program/6', label: 'Re-download' }
        : { kind: 'pending', href: '/courses/foundation/program/6' },
    },
    // M7 first skill
    {
      id: 'my-first-skill',
      title: m7Title,
      description: 'Your five-component RTFC banking AI skill built in Module 7. Ready to paste into ChatGPT, Claude, Gemini, or any AI platform.',
      type: 'prompt',
      typeLabel: 'Saved prompt',
      module: 7,
      moduleHref: '/courses/foundation/program/7',
      lastEditedISO: m7SkillMd ? daysAgo(5) : null,
      available: Boolean(m7SkillMd),
      action: m7SkillMd
        ? { kind: 'download-md', md: m7SkillMd, filename: m7Filename }
        : { kind: 'pending', href: '/courses/foundation/program/7' },
    },
    // M8 iterated skill
    {
      id: 'iterated-skill',
      title: `${m7Title.replace(/\s*v1\.0\s*$/i, '').trim()} v1.1`,
      description: 'Stress-tested and revised version of your Module 7 skill with iteration log embedded.',
      type: 'prompt',
      typeLabel: 'Saved prompt',
      module: 8,
      moduleHref: '/courses/foundation/program/8',
      lastEditedISO: m8IteratedMd ? daysAgo(2) : null,
      available: Boolean(m8IteratedMd),
      action: m8IteratedMd
        ? { kind: 'download-md', md: m8IteratedMd, filename: m8Filename }
        : { kind: 'pending', href: '/courses/foundation/program/8' },
    },
    // M9 capstone work product
    {
      id: 'capstone-work-product',
      title: 'Module 9 Capstone Work Product',
      description: 'The deliverable you produced using your iterated skill, reviewed against the five-dimension AiBI-Foundation rubric.',
      type: 'work-product',
      typeLabel: 'Reviewed work product',
      module: 9,
      moduleHref: '/courses/foundation/program/9',
      lastEditedISO: m8Response && m7SkillMd ? daysAgo(1) : null,
      available: Boolean(m8Response && m7SkillMd),
      action:
        m8Response && m7SkillMd
          ? { kind: 'link', href: '/courses/foundation/program/submit', label: 'Submit / review' }
          : { kind: 'pending', href: '/courses/foundation/program/9' },
    },
    // Transformation report
    {
      id: 'transformation-report',
      title: 'AiBI-Foundation Transformation Report',
      description: 'Five-page PDF summarising your pre/post assessment comparison, skills built, estimated annual time savings, and course completion status. The document you show your manager.',
      type: 'report',
      typeLabel: 'Transformation report',
      module: 12,
      moduleHref: '/courses/foundation/program/12',
      lastEditedISO: courseComplete ? daysAgo(0) : null,
      available: courseComplete,
      action: courseComplete
        ? { kind: 'download-report', enrollmentId: enrollment.id }
        : { kind: 'pending', href: '/courses/foundation/program/12' },
    },
  ];

  // Build count summary from available artifacts only
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

      {/* Subscription Inventory detail — full table view kept for reference */}
      {inventoryResponse && (
        <SectionCard title="Subscription inventory detail" label="Module 2 baseline">
          <p
            style={{
              fontSize: 13,
              color: 'var(--slate-500)',
              marginBottom: 16,
              lineHeight: 1.55,
            }}
          >
            Recorded during Module 2. Update by revisiting{' '}
            <Link
              href="/courses/foundation/program/2"
              style={{
                color: 'var(--ink)',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
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
                    borderBottom:
                      i === arr.length - 1 ? 'none' : '1px solid var(--ink-a10)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      flex: '0 0 220px',
                    }}
                  >
                    {platformName}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--slate-500)' }}>
                    {displayValue || 'No selection recorded'}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Capstone summary — narrative context for the Module 9 work product */}
      {m8Response && m7SkillMd && (
        <SectionCard title="Capstone summary" label="Module 9 narrative">
          <div style={{ display: 'grid', gap: 16 }}>
            <p
              style={{
                fontSize: 13,
                color: 'var(--slate-500)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Summary of your Module 9 capstone: the workflow you automated, the quality
              standard your work product was built to meet, and the iteration path that
              got you there.
            </p>

            <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
              <p style={{ ...kickerStyle, marginBottom: 4 }}>Skill used for capstone</p>
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>
                {m7Title}{' '}
                {m8Response['sharing-ladder-level'] ? (
                  <span style={{ color: 'var(--slate-500)' }}>
                    — Sharing level:{' '}
                    {
                      {
                        personal: 'Personal sandbox',
                        team: 'Ready for team review',
                        institution: 'Institution-wide',
                        'not-sure': 'Needs one more iteration',
                      }[m8Response['sharing-ladder-level']] ?? m8Response['sharing-ladder-level']
                    }
                  </span>
                ) : null}
              </p>
            </div>

            {m8Response['test-input-1'] && (
              <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
                <p style={{ ...kickerStyle, marginBottom: 4 }}>Tested against</p>
                <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>
                  {m8Response['test-input-1']}
                </p>
              </div>
            )}

            {m8Response['revision-notes'] && (
              <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
                <p style={{ ...kickerStyle, marginBottom: 4 }}>Iteration improvements</p>
                <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>
                  {m8Response['revision-notes']}
                </p>
              </div>
            )}

            <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
              <p style={{ ...kickerStyle, marginBottom: 4 }}>Quality standard met</p>
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>
                Five-dimension AiBI-Foundation rubric: Accuracy (hard gate), Completeness,
                Tone, Judgment, and Skill Quality.
              </p>
            </div>
          </div>
        </SectionCard>
      )}

    </CourseShellWrapper>
  );
}
