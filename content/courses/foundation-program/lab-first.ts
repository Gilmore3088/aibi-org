import type { LearnerRole } from '@/types/course';
import {
  FOUNDATION_MICRO_MODULES,
  MICRO_MODULES_BY_NUMBER,
} from './micro-modules';

export interface FoundationLabBrief {
  readonly module: number;
  readonly outcome: string;
  readonly concept: string;
  readonly bankingGuardrail: string;
  readonly visualModel: readonly string[];
  readonly labTask: string;
  readonly artifactAction: string;
  readonly referenceLabel: string;
  readonly reviewChecklist: readonly string[];
  readonly qualitySignals: readonly string[];
  readonly learningLoop: FoundationLearningLoop;
  readonly decisionDrill: FoundationDecisionDrill;
}

export interface FoundationLearningLoop {
  readonly recallPrompt: string;
  readonly workedExample: string;
  readonly deliberatePractice: string;
  readonly transferPrompt: string;
  readonly feedbackCue: string;
}

export interface FoundationDecisionDrill {
  readonly prompt: string;
  readonly options: readonly FoundationDecisionOption[];
}

export interface FoundationDecisionOption {
  readonly id: string;
  readonly label: string;
  readonly correct?: boolean;
  readonly explainer: string;
}

export interface FoundationWorkedExample {
  readonly weakLabel: string;
  readonly weak: string;
  readonly strongLabel: string;
  readonly strong: string;
  readonly why: string;
}

export interface FoundationRoleTransfer {
  readonly roleLabel: string;
  readonly roleContext: string;
  readonly transferMove: string;
  readonly proofToSave: string;
}

export const FOUNDATION_LAB_BRIEFS: Record<number, FoundationLabBrief> = Object.fromEntries(
  FOUNDATION_MICRO_MODULES.map((module) => [
    module.number,
    {
      module: module.number,
      outcome: module.mission,
      concept: module.plainLanguageConcept,
      bankingGuardrail: module.bankingGuardrail,
      visualModel: module.visualModel,
      labTask: module.tryTask,
      artifactAction: module.buildTask,
      referenceLabel: `${module.guidanceSource} guardrail`,
      reviewChecklist: module.reviewChecklist,
      qualitySignals: module.qualitySignals,
      learningLoop: {
        recallPrompt: `In one sentence, say why this matters: ${module.plainLanguageConcept}`,
        workedExample: `Compare weak vs. strong: ${module.exampleWhy}`,
        deliberatePractice: module.tryTask,
        transferPrompt: module.transferMove,
        feedbackCue: module.reviewChecklist.join(' / '),
      },
      decisionDrill: {
        prompt: `Which version is safer for Module ${module.number}: ${module.title}?`,
        options: [
          {
            id: 'weak',
            label: module.weakExample,
            explainer: 'This version is too vague, too risky, or too hard to review.',
          },
          {
            id: 'strong',
            label: module.strongExample,
            correct: true,
            explainer: module.exampleWhy,
          },
          {
            id: 'skip',
            label: 'Skip the review because the output is only a draft.',
            explainer: 'Draft status does not remove banker review, data-safety, or evidence requirements.',
          },
        ],
      },
    },
  ]),
) as Record<number, FoundationLabBrief>;

export const FOUNDATION_WORKED_EXAMPLES: Record<number, FoundationWorkedExample> =
  Object.fromEntries(
    FOUNDATION_MICRO_MODULES.map((module) => [
      module.number,
      {
        weakLabel: 'Weak version',
        weak: module.weakExample,
        strongLabel: 'Better version',
        strong: module.strongExample,
        why: module.exampleWhy,
      },
    ]),
  ) as Record<number, FoundationWorkedExample>;

const ROLE_TRANSFER_CONTEXT: Record<LearnerRole, { readonly label: string; readonly context: string }> = {
  lending: {
    label: 'Lending',
    context: 'a borrower communication, loan file review, credit memo, or committee prep task',
  },
  operations: {
    label: 'Operations',
    context: 'a procedure update, exception review, meeting summary, or handoff workflow',
  },
  compliance: {
    label: 'Compliance',
    context: 'a policy review, control note, training update, or exception escalation',
  },
  finance: {
    label: 'Finance',
    context: 'a variance explanation, board packet note, forecast question, or reporting workflow',
  },
  marketing: {
    label: 'Marketing',
    context: 'a campaign brief, approved message review, member education draft, or channel plan',
  },
  it: {
    label: 'IT / InfoSec',
    context: 'an access request, vendor review, incident note, system change, or AI tool approval task',
  },
  retail: {
    label: 'Retail banking',
    context: 'a branch coaching note, staff email, member-service scenario, or daily operations task',
  },
  executive: {
    label: 'Executive',
    context: 'a board question, initiative brief, risk summary, or leadership decision memo',
  },
  other: {
    label: 'Your role',
    context: 'one recurring task you already perform and can safely sanitize',
  },
};

export function getFoundationLabBrief(moduleNumber: number): FoundationLabBrief | undefined {
  return FOUNDATION_LAB_BRIEFS[moduleNumber];
}

export function getFoundationWorkedExample(moduleNumber: number): FoundationWorkedExample | undefined {
  return FOUNDATION_WORKED_EXAMPLES[moduleNumber];
}

export function getFoundationRoleTransfer(
  moduleNumber: number,
  role: LearnerRole = 'other',
): FoundationRoleTransfer | undefined {
  const roleContext = ROLE_TRANSFER_CONTEXT[role] ?? ROLE_TRANSFER_CONTEXT.other;
  const module = MICRO_MODULES_BY_NUMBER.get(moduleNumber);

  if (!module) {
    return undefined;
  }

  return {
    roleLabel: roleContext.label,
    roleContext: roleContext.context,
    transferMove: module.transferMove,
    proofToSave: module.proofToSave,
  };
}
