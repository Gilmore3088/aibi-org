// Per-module interactive content for the new robust-step components.
// Only the modules with explicit entries get the interactive widgets;
// other modules render without them (graceful degradation).

import type { KnowledgeCheckOption } from '@/app/courses/foundation/program/_components/KnowledgeCheck';
import type { ModulePracticeScenario } from '@/app/courses/foundation/program/_components/ModulePractice';

export interface ModuleKnowledgeCheck {
  readonly prompt: string;
  readonly options: readonly KnowledgeCheckOption[];
}

export interface ModulePracticeConfig {
  readonly systemPrompt: string;
  readonly scenarios: readonly ModulePracticeScenario[];
}

const KNOWLEDGE_CHECKS: Record<number, ModuleKnowledgeCheck> = {
  1: {
    prompt:
      'Which of these is safe to paste into a public LLM to help you rewrite an internal email?',
    options: [
      {
        id: 'a',
        label: 'The full email including the member’s name and account number.',
        explainer:
          'Public LLMs may train on the input. Names and account numbers are NPI — never paste them.',
      },
      {
        id: 'b',
        label:
          'The email with names redacted as [MEMBER] and account numbers removed.',
        correct: true,
        explainer:
          'Redaction first. The model can rewrite the structure and tone without seeing real identifiers.',
      },
      {
        id: 'c',
        label: 'Just the subject line and the rest is "you know the context".',
        explainer:
          'A model with no context will invent it. Give it redacted structure, not vibes.',
      },
    ],
  },
  3: {
    prompt:
      'You ask an AI to draft an adverse-action letter. What is the AI allowed to do?',
    options: [
      {
        id: 'a',
        label: 'Decide whether the loan should be denied based on the file.',
        explainer:
          'Adverse-action decisions are human-only. AI may clarify wording, not make the call.',
      },
      {
        id: 'b',
        label: 'Add a new principal reason it inferred from the file.',
        explainer:
          'ECOA / Reg B requires the specific reasons used. AI cannot add reasons that were not the actual basis.',
      },
      {
        id: 'c',
        label:
          'Rewrite the human-provided principal reasons in plain English without adding new ones.',
        correct: true,
        explainer:
          'This is the safe use: clarify, do not create. Use a traceability table to confirm AI added nothing.',
      },
    ],
  },
  7: {
    prompt: 'When choosing an AI tool category, the FIRST question is:',
    options: [
      {
        id: 'a',
        label: 'Which model is cheapest per token?',
        explainer:
          'Cost matters, but a wrong tool at any price is a wrong tool.',
      },
      {
        id: 'b',
        label: 'What data class will this tool touch?',
        correct: true,
        explainer:
          'Data class determines whether the tool may run at all. Public, internal, confidential, or prohibited.',
      },
      {
        id: 'c',
        label: 'Has my CEO heard of this vendor?',
        explainer: 'Brand recognition does not equal data-handling fitness.',
      },
    ],
  },
};

const PRACTICE_CONFIGS: Record<number, ModulePracticeConfig> = {
  1: {
    systemPrompt:
      'You help community-bank staff rewrite internal emails. Keep tone clear, brief, and professional. Never invent details. If information is missing, flag it with [VERIFY].',
    scenarios: [
      {
        id: 'rate-change',
        label: 'Rewrite an internal rate-change announcement for retail staff',
        userPrompt:
          'Rewrite this for branch staff: "Effective Monday rates change again. Make sure youre using the right ones. Old sheets are dead. If a member asks just say what the new rate is and that the old sheet is not valid anymore." Keep it under 80 words, two short paragraphs, no exclamation points.',
      },
      {
        id: 'policy-summary',
        label: 'Summarize a policy change into a 3-bullet branch huddle note',
        userPrompt:
          'Summarize for a 5-minute branch huddle: "Effective immediately, members may use our online banking AI assistant for balance inquiries, recent-transaction lookups, and finding a branch. The AI does not authenticate members. Sensitive requests still require staff." Three bullets max.',
      },
    ],
  },
  3: {
    systemPrompt:
      'You help community-bank lending staff structure prompts. Your job is to take a rough request and return a tight, role-task-context-format-constraints version. Do not add facts the user did not provide.',
    scenarios: [
      {
        id: 'underwriting-summary',
        label: 'Structure a prompt to summarize a credit file for committee',
        userPrompt:
          'Turn this rough request into a structured prompt with Role, Task, Context, Format, Constraints: "I need to summarize a credit file for committee, hit the key risk points, two pages max, no decisions."',
      },
    ],
  },
};

export function getKnowledgeCheck(moduleNumber: number): ModuleKnowledgeCheck | null {
  return KNOWLEDGE_CHECKS[moduleNumber] ?? null;
}

export function getModulePracticeConfig(
  moduleNumber: number,
): ModulePracticeConfig | null {
  return PRACTICE_CONFIGS[moduleNumber] ?? null;
}
