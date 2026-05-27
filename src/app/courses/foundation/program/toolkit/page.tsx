// Personal AI Toolkit — /courses/foundation/program/toolkit
// Server Component: reads activity responses for the learner's enrollment.
// Dev mode: uses placeholder data matching the mock enrollment in getEnrollment.ts.
//
// Four sections:
//   1. My Skills — M7 skill (.md) and M8 iterated skill (.md v1.1)
//   2. My Artifacts — five downloadable course artifacts by module
//   3. My Subscription Inventory — M2 survey results
//   4. What I Automated — M9 capstone summary
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
import { DownloadSkillButton } from './DownloadSkillButton';
import { DownloadReportButton } from './DownloadReportButton';
import {
  generateIteratedMarkdown,
  buildIteratedFilename,
} from '../_components/IterationTrackerData';
import type { ActivityResponse } from '@/types/course';

export const metadata: Metadata = {
  title: 'My Toolkit | AiBI-Foundation',
};

// ---- Artifact definitions pulled from module data (mirrors module-*.ts entries) ----

interface ArtifactMeta {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly format: string;
  readonly module: number;
  readonly moduleTitle: string;
}

const ARTIFACTS: readonly ArtifactMeta[] = [
  {
    id: 'regulatory-cheatsheet',
    title: 'Regulatory Cheatsheet',
    description:
      'One-page PDF: five frameworks with staff-level implications (front), AIEOG vocabulary (back).',
    format: 'PDF',
    module: 1,
    moduleTitle: 'Navigating the Regulatory Landscape',
  },
  {
    id: 'acceptable-use-card',
    title: 'Acceptable Use Card',
    description:
      'Personalized one-page reference card with your role context, permitted tools, and highest-risk guardrails. Designed to be printed and kept at workstation.',
    format: 'PDF',
    module: 5,
    moduleTitle: 'Safe Use Guardrails',
  },
  {
    id: 'skill-template-library',
    title: 'Skill Template Library',
    description:
      '12 pre-built banking skill templates across four roles (Lending, Compliance, Operations, Marketing) with all five components filled in.',
    format: 'PDF + MD',
    module: 6,
    moduleTitle: 'Anatomy of a Skill',
  },
  {
    id: 'platform-feature-reference-card',
    title: 'Platform Feature Reference Card',
    description:
      'Quick reference card matching your onboarding platform to its key features and top banking use cases.',
    format: 'PDF',
    module: 4,
    moduleTitle: 'Platform Features Deep Dive',
  },
  {
    id: 'my-first-skill',
    title: 'My First Skill',
    description:
      'Your five-component banking AI skill (.md) built in Module 7, formatted for immediate deployment in ChatGPT, Claude, Gemini, or any AI platform.',
    format: 'MD',
    module: 7,
    moduleTitle: 'Anatomy of a Skill — Build',
  },
] as const;

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

const itemCardStyle: CSSProperties = {
  border: '1px solid var(--ink-a10)',
  borderRadius: 16,
  padding: 18,
  background: 'var(--cream)',
};

const ghostLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  border: '1px solid var(--ink-a10)',
  color: 'var(--slate-500)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  borderRadius: 12,
  textDecoration: 'none',
};

const accentLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  border: '1px solid var(--gold)',
  color: 'var(--gold-deep)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  borderRadius: 12,
  textDecoration: 'none',
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
    <section
      style={sectionCardStyle}
      aria-labelledby={`section-${slug}`}
    >
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

// ---- Empty state ----

function EmptyState({ message }: { readonly message: string }) {
  return (
    <p style={{ fontSize: 14, color: 'var(--slate-500)', margin: 0 }}>
      {message}
    </p>
  );
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

  // Reconstruct skill files
  const m7Response = activityResponses['7.1'];
  const m7SkillMd: string | null = m7Response?.['skill-md-content'] ?? null;
  const m7Filename = m7SkillMd
    ? (() => {
        const match = /^# (.+?) - v1/m.exec(m7SkillMd);
        return match ? `${match[1].trim().replace(/\s+/g, '-').slice(0, 60)}-v1.0.md` : 'Banking-AI-Skill-v1.0.md';
      })()
    : 'Banking-AI-Skill-v1.0.md';

  const m8Response = activityResponses['8.1'];
  const m8IteratedMd: string | null =
    m7SkillMd && m8Response ? generateIteratedMarkdown(m7SkillMd, m8Response) : null;
  const m8Filename = m8IteratedMd ? buildIteratedFilename(m7SkillMd ?? '') : 'Banking-AI-Skill-v1.1.md';

  const inventoryResponse = activityResponses['2.1'];

  const completedModules = enrollment.completed_modules;
  const m7Complete = completedModules.includes(7);
  const m8Complete = completedModules.includes(8);

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
          <span style={kickerStyle}>AiBI-Foundation · Accumulated assets</span>
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
            color: 'var(--slate-600)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          Your course assets in one place — skills, artifacts, subscription
          inventory, and capstone summary.
        </p>
      </header>

      <article>
        {/* 1 — My Skills */}
        <SectionCard title="My skills" label="Skills">
          <div style={{ display: 'grid', gap: 14 }}>
            {/* M7 skill */}
            <div style={itemCardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...kickerStyle, marginBottom: 4 }}>
                    Module 7 — My first skill
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      margin: '0 0 4px',
                    }}
                  >
                    {m7SkillMd
                      ? (() => {
                          const match = /^# (.+?) - v1/m.exec(m7SkillMd);
                          return match ? match[1].trim() : 'Banking AI Skill v1.0';
                        })()
                      : 'Banking AI Skill v1.0'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}>
                    {m7SkillMd
                      ? 'Five-component RTFC skill built during Module 7. Ready to paste into ChatGPT, Claude, or Gemini.'
                      : m7Complete
                        ? 'Skill file not found in your activity responses.'
                        : 'Complete Module 7 to build and download your first skill.'}
                  </p>
                </div>
                {m7SkillMd ? (
                  <DownloadSkillButton
                    mdContent={m7SkillMd}
                    filename={m7Filename}
                    label="Download .md"
                  />
                ) : (
                  <Link
                    href="/courses/foundation/program/7"
                    style={ghostLinkStyle}
                    aria-label="Go to Module 7 to build your skill"
                  >
                    Go to Module 7
                  </Link>
                )}
              </div>
            </div>

            {/* M8 iterated skill */}
            <div style={itemCardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...kickerStyle, marginBottom: 4 }}>
                    Module 8 — Iterated skill
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      margin: '0 0 4px',
                    }}
                  >
                    {m8IteratedMd
                      ? (() => {
                          const match = /^# (.+?) - v1/m.exec(m7SkillMd ?? '');
                          return match ? `${match[1].trim()} v1.1` : 'Banking AI Skill v1.1';
                        })()
                      : 'Banking AI Skill v1.1'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}>
                    {m8IteratedMd
                      ? 'Stress-tested and revised version of your Module 7 skill with iteration log embedded.'
                      : m8Complete
                        ? 'Iterated skill unavailable — Module 7 skill file is required to generate v1.1.'
                        : 'Complete Module 8 to test and iterate your skill.'}
                  </p>
                  {m8Response?.['revision-notes'] && (
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--ink)',
                        marginTop: 8,
                        lineHeight: 1.55,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Revision notes: </span>
                      {m8Response['revision-notes'].slice(0, 160)}
                      {m8Response['revision-notes'].length > 160 ? '…' : ''}
                    </p>
                  )}
                </div>
                {m8IteratedMd ? (
                  <DownloadSkillButton
                    mdContent={m8IteratedMd}
                    filename={m8Filename}
                    label="Download .md"
                  />
                ) : (
                  <Link
                    href="/courses/foundation/program/8"
                    style={ghostLinkStyle}
                    aria-label="Go to Module 8 to iterate your skill"
                  >
                    Go to Module 8
                  </Link>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 2 — My Artifacts */}
        <SectionCard title="My artifacts" label="Artifacts">
          <div style={{ display: 'grid', gap: 12 }}>
            {ARTIFACTS.map((artifact) => {
              const isAvailable = completedModules.includes(artifact.module);
              return (
                <div
                  key={artifact.id}
                  style={{
                    ...itemCardStyle,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    opacity: isAvailable ? 1 : 0.6,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 4,
                      }}
                    >
                      <p style={kickerStyle}>Module {artifact.module}</p>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 999,
                          border: '1px solid var(--gold)',
                          color: 'var(--gold-deep)',
                        }}
                      >
                        {artifact.format}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--ink)',
                        margin: '0 0 4px',
                      }}
                    >
                      {artifact.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--slate-500)',
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      {artifact.description}
                    </p>
                  </div>
                  {isAvailable ? (
                    <Link
                      href={`/courses/foundation/program/${artifact.module}`}
                      style={accentLinkStyle}
                    >
                      Re-download
                    </Link>
                  ) : (
                    <Link
                      href={`/courses/foundation/program/${artifact.module}`}
                      style={ghostLinkStyle}
                      aria-label={`Go to Module ${artifact.module} to access this artifact`}
                    >
                      Pending
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 3 — My Subscription Inventory */}
        <SectionCard title="My subscription inventory" label="Subscription inventory">
          {inventoryResponse ? (
            <div>
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
            </div>
          ) : (
            <EmptyState message="Complete the Subscription Inventory activity in Module 2 to see your results here." />
          )}
        </SectionCard>

        {/* 4 — What I Automated */}
        <SectionCard title="What I automated" label="Capstone summary">
          {m8Response && m7SkillMd ? (
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

              <div
                style={{
                  borderLeft: '3px solid var(--gold)',
                  paddingLeft: 14,
                }}
              >
                <p style={{ ...kickerStyle, marginBottom: 4 }}>Skill used for capstone</p>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--ink)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {(() => {
                    const match = /^# (.+?) - v1/m.exec(m7SkillMd);
                    return match ? match[1].trim() : 'Banking AI Skill';
                  })()}{' '}
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
                <div
                  style={{
                    borderLeft: '3px solid var(--gold)',
                    paddingLeft: 14,
                  }}
                >
                  <p style={{ ...kickerStyle, marginBottom: 4 }}>Tested against</p>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--ink)',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {m8Response['test-input-1']}
                  </p>
                </div>
              )}

              {m8Response['revision-notes'] && (
                <div
                  style={{
                    borderLeft: '3px solid var(--gold)',
                    paddingLeft: 14,
                  }}
                >
                  <p style={{ ...kickerStyle, marginBottom: 4 }}>Iteration improvements</p>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--ink)',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {m8Response['revision-notes']}
                  </p>
                </div>
              )}

              <div
                style={{
                  borderLeft: '3px solid var(--gold)',
                  paddingLeft: 14,
                }}
              >
                <p style={{ ...kickerStyle, marginBottom: 4 }}>Quality standard met</p>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--ink)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  Five-dimension AiBI-Foundation rubric: Accuracy (hard gate), Completeness,
                  Tone, Judgment, and Skill Quality.
                </p>
              </div>

              <div style={{ paddingTop: 4 }}>
                <Link
                  href="/courses/foundation/program/submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 20px',
                    background: 'var(--ink)',
                    color: 'var(--cream-2)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    borderRadius: 12,
                    textDecoration: 'none',
                  }}
                >
                  Submit work product →
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState message="Complete Modules 7 and 8 to see your capstone automation summary here." />
          )}
        </SectionCard>

        {/* 5 — Transformation Report */}
        <SectionCard title="Transformation report" label="Course report">
          <div style={itemCardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...kickerStyle, marginBottom: 4 }}>AiBI-Foundation complete</p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    margin: '0 0 4px',
                  }}
                >
                  AiBI-Foundation Transformation Report
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--slate-500)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  Five-page PDF summarising your pre/post assessment comparison, skills built,
                  estimated annual time savings, quick wins logged, and course completion
                  status. The document a learner shows their manager.
                </p>
              </div>
              <DownloadReportButton enrollmentId={enrollment.id} />
            </div>
          </div>
        </SectionCard>
      </article>
    </CourseShellWrapper>
  );
}
