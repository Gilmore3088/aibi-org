import type { ToolkitArtifact } from '../_local/ArtifactsClient';

export type { ToolkitArtifact };

// ---- Platform labels for subscription inventory display ----

export const PLATFORM_LABELS: Record<string, string> = {
  'chatgpt-access': 'ChatGPT (OpenAI)',
  'claude-access': 'Claude (Anthropic)',
  'gemini-access': 'Gemini (Google)',
  'copilot-access': 'Microsoft 365 Copilot',
  'perplexity-access': 'Perplexity',
  'notebooklm-access': 'NotebookLM (Google)',
  'copilot-free-access': 'Microsoft Copilot (Free)',
};

export const ACCESS_LABELS: Record<string, string> = {
  free: 'Free tier',
  paid: 'Paid subscription',
  'not-sure': 'Not sure',
  none: 'Not using',
  institutional: 'Institutional license (IT-provisioned)',
  'not-provisioned': 'Not provisioned for me',
};

// ---- Dev-mode placeholder data ----

export const DEV_ACTIVITY_RESPONSES: Record<string, Record<string, string>> = {
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

// ---- Headline count summary ----

export interface CountSummary {
  readonly prompts: number;
  readonly workProducts: number;
  readonly cards: number;
  readonly inventories: number;
  readonly reports: number;
}

export function buildCountLine(c: CountSummary): string {
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

export function buildArtifacts(args: {
  inventoryResponse: Record<string, string> | undefined;
  completedModules: readonly number[];
  courseComplete: boolean;
  m7Title: string;
  m7SkillMd: string | null;
  m7Filename: string;
  m8IteratedMd: string | null;
  m8Filename: string;
  m8Response: Record<string, string> | undefined;
  enrollmentId: string;
  daysAgo: (n: number) => string;
}): ToolkitArtifact[] {
  const {
    inventoryResponse,
    completedModules,
    courseComplete,
    m7Title,
    m7SkillMd,
    m7Filename,
    m8IteratedMd,
    m8Filename,
    m8Response,
    enrollmentId,
    daysAgo,
  } = args;

  return [
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
        ? { kind: 'download-report', enrollmentId }
        : { kind: 'pending', href: '/courses/foundation/program/12' },
    },
  ] satisfies ToolkitArtifact[];
}
