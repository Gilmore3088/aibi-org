// Builds the unified Toolkit artifact list from raw activity responses + enrollment.
// Pure (no IO) so it can be unit-tested separately from the server component.

import {
  generateIteratedMarkdown,
  buildIteratedFilename,
} from '../../_components/IterationTrackerData';
import type { ToolkitArtifact } from './ArtifactsClient';

export interface BuildArtifactsInput {
  readonly activityResponses: Record<string, Record<string, string>>;
  readonly completedModules: ReadonlyArray<number>;
  readonly enrollmentId: string;
}

export interface BuildArtifactsResult {
  readonly artifacts: ToolkitArtifact[];
  readonly inventoryResponse: Record<string, string> | undefined;
  readonly m7SkillMd: string | null;
  readonly m7Title: string;
  readonly m8Response: Record<string, string> | undefined;
}

export function buildArtifacts(input: BuildArtifactsInput): BuildArtifactsResult {
  const { activityResponses, completedModules, enrollmentId } = input;

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
  const m8Filename = m8IteratedMd
    ? buildIteratedFilename(m7SkillMd ?? '')
    : 'Banking-AI-Skill-v1.1.md';

  const inventoryResponse = activityResponses['2.1'];
  const courseComplete = completedModules.length >= 12;

  // Synthetic last-edited stamps for dev mode. Production should replace
  // with activity_responses.updated_at once surfaced from Supabase.
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

  const artifacts: ToolkitArtifact[] = [
    {
      id: 'subscription-inventory',
      title: 'Subscription Inventory',
      description:
        'Your recorded access tier for the seven major AI platforms — the baseline reference for what you can use at work and at home.',
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
    {
      id: 'platform-feature-reference-card',
      title: 'Platform Feature Reference Card',
      description:
        'Quick reference matching your onboarding platform to its key features and top banking use cases.',
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
    {
      id: 'acceptable-use-card',
      title: 'Acceptable Use Card',
      description:
        'Personalized one-page reference with your role context, permitted tools, and highest-risk guardrails. Designed to print and keep at your workstation.',
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
    {
      id: 'regulatory-cheatsheet',
      title: 'Regulatory Cheatsheet',
      description:
        'One-page PDF: five frameworks with staff-level implications (front), AIEOG vocabulary (back).',
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
    {
      id: 'skill-template-library',
      title: 'Skill Template Library',
      description:
        '12 pre-built banking skill templates across four roles (Lending, Compliance, Operations, Marketing) with all five RTFC components filled in.',
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
    {
      id: 'my-first-skill',
      title: m7Title,
      description:
        'Your five-component RTFC banking AI skill built in Module 7. Ready to paste into ChatGPT, Claude, Gemini, or any AI platform.',
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
    {
      id: 'iterated-skill',
      title: `${m7Title.replace(/\s*v1\.0\s*$/i, '').trim()} v1.1`,
      description:
        'Stress-tested and revised version of your Module 7 skill with iteration log embedded.',
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
    {
      id: 'capstone-work-product',
      title: 'Module 9 Capstone Work Product',
      description:
        'The deliverable you produced using your iterated skill, reviewed against the five-dimension AiBI-Foundation rubric.',
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
    {
      id: 'transformation-report',
      title: 'AiBI-Foundation Transformation Report',
      description:
        'Five-page PDF summarising your pre/post assessment comparison, skills built, estimated annual time savings, and course completion status. The document you show your manager.',
      type: 'report',
      typeLabel: 'Transformation report',
      module: 12,
      moduleHref: '/courses/foundation/program/12',
      lastEditedISO: courseComplete ? daysAgo(0) : null,
      available: courseComplete,
      action: courseComplete
        ? { kind: 'download-report', enrollmentId }
        : { kind: 'pending', href: '/courses/foundation/program/12' },
    },
  ];

  return { artifacts, inventoryResponse, m7SkillMd, m7Title, m8Response };
}
