import type { ToolkitArtifact } from '../_local/ArtifactsClient';
import {
  FOUNDATION_FINAL_MODULE_NUMBER,
  getArtifactFirst,
  getFoundationLabBrief,
  modules,
} from '@content/courses/foundation-program';
import { MODULE_ACTIVITIES_BY_NUMBER } from '@content/courses/foundation-program/module-activities';

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
  '13.1': {
    artifact_draft:
      'Compliance FAQ drafting skill with role, source-only rule, output format, and human review boundary.',
    review_note:
      'The skill names the reviewer, flags thresholds for verification, and blocks invented regulatory citations.',
    first_use:
      'Use it on the next internal compliance FAQ draft before manager review.',
  },
  '17.1': {
    workflow_purpose:
      'Build staff-readable compliance FAQs from approved source material only; block customer-specific facts and legal conclusions.',
    prompt_or_skill:
      'Reusable compliance FAQ skill with placeholders for source, audience, reviewer, and blocked-use rule.',
    checkpoint_and_escalation:
      'Compliance officer review is required before distribution; escalate if the source is ambiguous or cites a threshold.',
    peer_test_plan:
      'Have one peer run the kit against a synthetic policy memo and compare flagged claims before reuse.',
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
    parts.push(`${c.workProducts} review-ready work product${c.workProducts === 1 ? '' : 's'}`);
  if (c.cards > 0) parts.push(`${c.cards} decision card${c.cards === 1 ? '' : 's'}`);
  if (c.inventories > 0) parts.push(`${c.inventories} inventory asset${c.inventories === 1 ? '' : 's'}`);
  if (c.reports > 0) parts.push(`${c.reports} review packet${c.reports === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export function buildArtifacts(args: {
  inventoryResponse: Record<string, string> | undefined;
  completedModules: readonly number[];
  courseComplete: boolean;
  enrollmentId: string;
  daysAgo: (n: number) => string;
}): ToolkitArtifact[] {
  const {
    completedModules,
    courseComplete,
    enrollmentId,
    daysAgo,
  } = args;

  const typeByModule: Record<number, ToolkitArtifact['type']> = {
    1: 'card',
    2: 'work-product',
    3: 'evidence',
    4: 'prompt',
    5: 'prompt',
    6: 'prompt',
    7: 'evidence',
    8: 'evidence',
    9: 'prompt',
    10: 'prompt',
    11: 'card',
    12: 'card',
    13: 'skill',
    14: 'workflow',
    15: 'workflow',
    16: 'evidence',
    17: 'workflow',
    18: 'report',
  };

  const typeLabelByType: Record<ToolkitArtifact['type'], string> = {
    prompt: 'Prompt asset',
    skill: 'Reusable skill',
    workflow: 'Workflow artifact',
    evidence: 'Evidence artifact',
    'work-product': 'Work product',
    card: 'Decision card',
    report: 'Foundation packet',
    inventory: 'Inventory',
  };

  return modules.map((module) => {
    const artifactFirst = getArtifactFirst(module.number);
    const labBrief = getFoundationLabBrief(module.number);
    const activitySpec = MODULE_ACTIVITIES_BY_NUMBER[module.number];
    const artifactId = activitySpec?.artifactFilename.replace(/\.md$/, '') ?? `module-${module.number}`;
    const available = completedModules.includes(module.number);
    const type = typeByModule[module.number] ?? 'work-product';
    const isFinalReport = module.number === FOUNDATION_FINAL_MODULE_NUMBER && courseComplete;

    return {
      id: artifactId,
      title: artifactFirst?.saved ?? module.keyOutput,
      description:
        labBrief?.artifactAction ??
        `Module ${module.number} saved artifact for the AiBI-Foundation packet.`,
      type,
      typeLabel: typeLabelByType[type],
      module: module.number,
      moduleHref: `/courses/foundation/program/${module.number}`,
      lastEditedISO: available ? daysAgo(Math.max(0, modules.length - module.number)) : null,
      available,
      readinessLabel: available ? 'Manager review ready' : 'Not saved yet',
      qualitySignals: labBrief?.qualitySignals ?? [],
      transferMove: labBrief?.learningLoop.transferPrompt,
      action: isFinalReport
        ? { kind: 'download-report', enrollmentId }
        : available
          ? {
              kind: 'link',
              href: `/courses/foundation/program/artifacts/${artifactId}`,
              label: 'Open artifact',
            }
          : {
              kind: 'pending',
              href: `/courses/foundation/program/${module.number}`,
            },
    };
  }) satisfies ToolkitArtifact[];
}
