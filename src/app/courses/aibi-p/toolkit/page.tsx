// Personal AI Toolkit — /courses/aibi-p/toolkit
// Server Component: reads activity responses for the learner's enrollment.
// Dev mode: uses placeholder data matching the mock enrollment in getEnrollment.ts.
//
// Four sections:
//   1. My Skills — M7 skill (.md) and M8 iterated skill (.md v1.1)
//   2. My Artifacts — five downloadable course artifacts by module
//   3. My Subscription Inventory — M2 survey results
//   4. What I Automated — M9 capstone summary
//
// Design: parchment background, Cormorant headings, card layout per section.
// WCAG 2.1 AA; no hardcoded hex — CSS variables only.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DownloadSkillButton } from './DownloadSkillButton';
import { DownloadReportButton } from './DownloadReportButton';
import {
  generateIteratedMarkdown,
  buildIteratedFilename,
} from '../_components/IterationTrackerData';
import type { ActivityResponse } from '@/types/course';

export const metadata: Metadata = {
  title: 'My Toolkit | AiBI-P',
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

// ---- Section card wrapper ----

function SectionCard({
  title,
  label,
  labelColor,
  children,
}: {
  readonly title: string;
  readonly label: string;
  readonly labelColor: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section
      className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-6 mb-6"
      aria-labelledby={`section-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-widest mb-1"
        style={{ color: labelColor }}
      >
        {label}
      </p>
      <h2
        id={`section-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-5"
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
    <p className="font-sans text-sm text-[color:var(--color-slate)] italic">{message}</p>
  );
}

// ---- Main page ----

export default async function ToolkitPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/aibi-p/purchase');
  }

  // Fetch activity responses — all modules in a single query
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
    // Dev mode — use placeholder data
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

  // Subscription inventory
  const inventoryResponse = activityResponses['2.1'];

  // Capstone data from work_submissions (read separately if Supabase is configured)
  // For simplicity, surface M9 capstone data from the work_submissions annotation
  // In dev mode this is shown as a summary derived from DEV placeholders.

  const completedModules = enrollment.completed_modules;
  const m7Complete = completedModules.includes(7);
  const m8Complete = completedModules.includes(8);

  return (
    <>
      {/* Page header band */}
      <div className="bg-[color:var(--color-terra)] text-[color:var(--color-linen)] py-10 px-6">
        <div className="mx-auto px-8 lg:px-16">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra-pale)] mb-2">
            AiBI-P Course
          </p>
          <h1 className="font-serif text-3xl font-bold mb-2">My AI Toolkit</h1>
          <p className="font-sans text-sm text-[color:var(--color-terra-pale)] leading-relaxed max-w-2xl">
            Your accumulated course assets in one place — skills, artifacts, subscription
            inventory, and capstone summary. Everything you built during AiBI-P is here to
            keep and use.
          </p>
        </div>
      </div>

      <article className="mx-auto px-8 lg:px-16 px-6 lg:px-8 py-8">

        {/* 1 — My Skills */}
        <SectionCard title="My Skills" label="Skills" labelColor="var(--color-amber)">
          <div className="space-y-4">

            {/* M7 skill */}
            <div className="border border-[color:var(--color-parch-dark)] rounded-sm p-4 bg-white/30">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-amber)] mb-1">
                    Module 7 — My First Skill
                  </p>
                  <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
                    {m7SkillMd
                      ? (() => {
                          const match = /^# (.+?) - v1/m.exec(m7SkillMd);
                          return match ? match[1].trim() : 'Banking AI Skill v1.0';
                        })()
                      : 'Banking AI Skill v1.0'}
                  </p>
                  <p className="font-sans text-xs text-[color:var(--color-slate)]">
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
                    href="/courses/aibi-p/7"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[color:var(--color-parch-dark)] text-[color:var(--color-slate)] text-[10px] font-mono uppercase tracking-widest rounded-sm"
                    aria-label="Go to Module 7 to build your skill"
                  >
                    Go to Module 7
                  </Link>
                )}
              </div>
            </div>

            {/* M8 iterated skill */}
            <div className="border border-[color:var(--color-parch-dark)] rounded-sm p-4 bg-white/30">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
                    Module 8 — Iterated Skill
                  </p>
                  <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
                    {m8IteratedMd
                      ? (() => {
                          const match = /^# (.+?) - v1/m.exec(m7SkillMd ?? '');
                          return match ? `${match[1].trim()} v1.1` : 'Banking AI Skill v1.1';
                        })()
                      : 'Banking AI Skill v1.1'}
                  </p>
                  <p className="font-sans text-xs text-[color:var(--color-slate)]">
                    {m8IteratedMd
                      ? 'Stress-tested and revised version of your Module 7 skill with iteration log embedded.'
                      : m8Complete
                        ? 'Iterated skill unavailable — Module 7 skill file is required to generate v1.1.'
                        : 'Complete Module 8 to test and iterate your skill.'}
                  </p>
                  {m8Response?.['revision-notes'] && (
                    <p className="font-sans text-xs text-[color:var(--color-ink)] mt-2 leading-relaxed">
                      <span className="font-semibold">Revision notes: </span>
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
                    href="/courses/aibi-p/8"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[color:var(--color-parch-dark)] text-[color:var(--color-slate)] text-[10px] font-mono uppercase tracking-widest rounded-sm"
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
        <SectionCard title="My Artifacts" label="Artifacts" labelColor="var(--color-cobalt)">
          <div className="space-y-3">
            {ARTIFACTS.map((artifact) => {
              const isUnlocked = completedModules.includes(artifact.module);
              return (
                <div
                  key={artifact.id}
                  className={[
                    'border rounded-sm p-4 flex items-start justify-between gap-4 flex-wrap',
                    isUnlocked
                      ? 'border-[color:var(--color-parch-dark)] bg-white/30'
                      : 'border-[color:var(--color-parch-dark)] bg-[color:var(--color-parch-dark)]/30 opacity-60',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)]">
                        Module {artifact.module}
                      </p>
                      <span
                        className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border"
                        style={{
                          borderColor: 'var(--color-cobalt)',
                          color: 'var(--color-cobalt)',
                        }}
                      >
                        {artifact.format}
                      </span>
                    </div>
                    <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-0.5">
                      {artifact.title}
                    </p>
                    <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                      {artifact.description}
                    </p>
                  </div>
                  {isUnlocked ? (
                    <Link
                      href={`/courses/aibi-p/${artifact.module}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[color:var(--color-cobalt)] text-[color:var(--color-cobalt)] hover:bg-[color:var(--color-cobalt)] hover:text-[color:var(--color-linen)] text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Re-download
                    </Link>
                  ) : (
                    <Link
                      href={`/courses/aibi-p/${artifact.module}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[color:var(--color-parch-dark)] text-[color:var(--color-slate)] text-[10px] font-mono uppercase tracking-widest rounded-sm"
                      aria-label={`Go to Module ${artifact.module} to unlock this artifact`}
                    >
                      Locked
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 3 — My Subscription Inventory */}
        <SectionCard
          title="My Subscription Inventory"
          label="Subscription Inventory"
          labelColor="var(--color-sage)"
        >
          {inventoryResponse ? (
            <div className="space-y-2">
              <p className="font-sans text-xs text-[color:var(--color-slate)] mb-4 leading-relaxed">
                Recorded during Module 2. Update by revisiting{' '}
                <Link
                  href="/courses/aibi-p/2"
                  className="underline underline-offset-2 text-[color:var(--color-ink)] hover:text-[color:var(--color-terra)] transition-colors"
                >
                  Module 2
                </Link>
                .
              </p>
              <div className="grid gap-2">
                {Object.entries(PLATFORM_LABELS).map(([fieldId, platformName]) => {
                  const rawValue = inventoryResponse[fieldId] ?? '';
                  const displayValue = ACCESS_LABELS[rawValue] ?? rawValue;
                  return (
                    <div
                      key={fieldId}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-[color:var(--color-parch-dark)] last:border-0"
                    >
                      <span className="font-sans text-sm font-semibold text-[color:var(--color-ink)] sm:w-56 shrink-0">
                        {platformName}
                      </span>
                      <span className="font-sans text-sm text-[color:var(--color-slate)]">
                        {displayValue || <em>No selection recorded</em>}
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
        <SectionCard
          title="What I Automated"
          label="Capstone Summary"
          labelColor="var(--color-terra)"
        >
          {m8Response && m7SkillMd ? (
            <div className="space-y-4">
              <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed mb-4">
                Summary of your Module 9 capstone: the workflow you automated, the quality
                standard your work product was built to meet, and the iteration path that
                got you there.
              </p>

              {/* Skill summary */}
              <div className="border-l-4 pl-4 py-1" style={{ borderColor: 'var(--color-terra)' }}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
                  Skill Used for Capstone
                </p>
                <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                  {(() => {
                    const match = /^# (.+?) - v1/m.exec(m7SkillMd);
                    return match ? match[1].trim() : 'Banking AI Skill';
                  })()}{' '}
                  {m8Response['sharing-ladder-level'] ? (
                    <span className="text-[color:var(--color-slate)]">
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

              {/* Automation type from stress test */}
              {m8Response['test-input-1'] && (
                <div className="border-l-4 pl-4 py-1" style={{ borderColor: 'var(--color-amber)' }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-amber)] mb-1">
                    Tested Against
                  </p>
                  <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                    {m8Response['test-input-1']}
                  </p>
                </div>
              )}

              {/* Revision summary */}
              {m8Response['revision-notes'] && (
                <div className="border-l-4 pl-4 py-1" style={{ borderColor: 'var(--color-sage)' }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)] mb-1">
                    Iteration Improvements
                  </p>
                  <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                    {m8Response['revision-notes']}
                  </p>
                </div>
              )}

              {/* Quality standard */}
              <div className="border-l-4 pl-4 py-1" style={{ borderColor: 'var(--color-cobalt)' }}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-1">
                  Quality Standard Met
                </p>
                <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                  Five-dimension AiBI-P rubric: Accuracy (hard gate), Completeness,
                  Tone, Judgment, and Skill Quality.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/courses/aibi-p/submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
                >
                  Submit Work Product
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState message="Complete Modules 7 and 8 to see your capstone automation summary here." />
          )}
        </SectionCard>

        {/* 5 — Transformation Report */}
        <SectionCard
          title="Transformation Report"
          label="Course Report"
          labelColor="var(--color-terra)"
        >
          <div className="border border-[color:var(--color-parch-dark)] rounded-sm p-4 bg-white/30">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
                  AiBI-P Complete
                </p>
                <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
                  AiBI-P Transformation Report
                </p>
                <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
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
    </>
  );
}
