// AiBI-Foundation test-out checks — prior-experience recognition.
//
// Adult learners arrive with real experience; forcing every learner through
// the Awareness basics one module at a time ignores it. A test-out check
// lets a learner prove a module's core judgment in three questions and mark
// it complete — a fast-forward of their CURRENT module only, so
// completed_modules stays a contiguous prefix and the forward-only gate in
// courseProgress.ts is untouched.
//
// Rules:
//   - Checks are authored for the Awareness ramp (modules 1–4) only. Every
//     countsTowardCertificate artifact and the Final Foundation Packet live
//     in later modules, so testing out never bypasses credential evidence;
//     the passed check itself is recorded in activity_responses as the
//     module's evidence.
//   - A module is eligible when it has an authored check AND it sits in the
//     Awareness pillar or before the learner's role startHereModule.
//   - Grading happens server-side (see /api/courses/test-out); a pass
//     requires all three answers correct. Retries are allowed — the point
//     is recognition of prior knowledge, not a high-stakes exam.

import type { LearnerRole } from '@/types/course';
import { getModuleByNumber } from './modules';
import { getRolePath } from './role-paths';

export interface TestOutQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly {
    readonly id: string;
    readonly label: string;
    readonly correct?: boolean;
  }[];
}

export interface TestOutCheck {
  readonly moduleNumber: number;
  readonly questions: readonly TestOutQuestion[];
}

export const TEST_OUT_CHECKS: readonly TestOutCheck[] = [
  {
    moduleNumber: 1,
    questions: [
      {
        id: 'm1-q1',
        prompt: 'Which task is a good fit for AI help at a community bank today?',
        options: [
          { id: 'a', label: 'Drafting and structuring an internal summary for your review', correct: true },
          { id: 'b', label: 'Approving a loan exception on its own' },
          { id: 'c', label: 'Verifying a regulatory citation without any human check' },
        ],
      },
      {
        id: 'm1-q2',
        prompt: 'What can a general AI assistant NOT be trusted to know on its own?',
        options: [
          { id: 'a', label: 'How to shorten a wordy paragraph' },
          { id: 'b', label: 'Your institution’s own policies and current procedures', correct: true },
          { id: 'c', label: 'How to turn notes into a bulleted list' },
        ],
      },
      {
        id: 'm1-q3',
        prompt: 'Who owns a regulated decision when AI helped draft the work?',
        options: [
          { id: 'a', label: 'The AI tool, since it produced the draft' },
          { id: 'b', label: 'Nobody, if the draft was reviewed twice' },
          { id: 'c', label: 'The accountable banker — AI never owns the decision', correct: true },
        ],
      },
    ],
  },
  {
    moduleNumber: 2,
    questions: [
      {
        id: 'm2-q1',
        prompt: 'Which message is the right FIRST AI use case?',
        options: [
          { id: 'a', label: 'A non-sensitive internal message you want to make clearer', correct: true },
          { id: 'b', label: 'A customer email containing account numbers' },
          { id: 'c', label: 'A SAR narrative with case details' },
        ],
      },
      {
        id: 'm2-q2',
        prompt: 'When AI rewrites your message, what stays your job?',
        options: [
          { id: 'a', label: 'Nothing — the rewrite ships as-is' },
          { id: 'b', label: 'The facts and the final judgment', correct: true },
          { id: 'c', label: 'Only fixing the AI’s spelling' },
        ],
      },
      {
        id: 'm2-q3',
        prompt: 'A rewrite added a deadline you never mentioned. What is that?',
        options: [
          { id: 'a', label: 'A helpful inference you should keep' },
          { id: 'b', label: 'An invented detail you must remove before sending', correct: true },
          { id: 'c', label: 'Proof the AI knows your calendar' },
        ],
      },
    ],
  },
  {
    moduleNumber: 3,
    questions: [
      {
        id: 'm3-q1',
        prompt: 'What are the four parts of a CORE prompt?',
        options: [
          { id: 'a', label: 'Context, Objective, Resources, Expectations', correct: true },
          { id: 'b', label: 'Copy, Output, Review, Edit' },
          { id: 'c', label: 'Question, Answer, Source, Format' },
        ],
      },
      {
        id: 'm3-q2',
        prompt: 'Why do vague prompts fail?',
        options: [
          { id: 'a', label: 'The AI refuses to answer them' },
          { id: 'b', label: 'Vague prompts get vague answers you cannot review or reuse', correct: true },
          { id: 'c', label: 'They cost more per word' },
        ],
      },
      {
        id: 'm3-q3',
        prompt: 'What never belongs inside the prompt itself?',
        options: [
          { id: 'a', label: 'A description of the output format you expect' },
          { id: 'b', label: 'Placeholders for the inputs that change each time' },
          { id: 'c', label: 'Customer or member data', correct: true },
        ],
      },
    ],
  },
  {
    moduleNumber: 4,
    questions: [
      {
        id: 'm4-q1',
        prompt: 'Module 4 turns the CORE structure into what?',
        options: [
          { id: 'a', label: 'A reusable prompt for one real, recurring task in your own role', correct: true },
          { id: 'b', label: 'A one-time answer to a sample scenario' },
          { id: 'c', label: 'A policy document for the whole institution' },
        ],
      },
      {
        id: 'm4-q2',
        prompt: 'What makes a prompt card reusable next week?',
        options: [
          { id: 'a', label: 'It names this week’s specific customer' },
          { id: 'b', label: 'Placeholders for changing inputs and a clear output shape', correct: true },
          { id: 'c', label: 'It is at least a full page long' },
        ],
      },
      {
        id: 'm4-q3',
        prompt: 'Which example belongs in a saved prompt card?',
        options: [
          { id: 'a', label: 'A realistic but non-sensitive sample input', correct: true },
          { id: 'b', label: 'A real member’s loan application' },
          { id: 'c', label: 'Last quarter’s confidential board minutes' },
        ],
      },
    ],
  },
] as const;

const CHECKS_BY_MODULE = new Map(TEST_OUT_CHECKS.map((check) => [check.moduleNumber, check]));

export function getTestOutCheck(moduleNumber: number): TestOutCheck | null {
  return CHECKS_BY_MODULE.get(moduleNumber) ?? null;
}

/**
 * A module is test-out eligible when a check is authored for it AND it is
 * early-ramp material for this learner: in the Awareness pillar, or before
 * the role path's recommended start module.
 */
export function isTestOutEligible(moduleNumber: number, learnerRole: LearnerRole): boolean {
  if (!CHECKS_BY_MODULE.has(moduleNumber)) return false;
  const mod = getModuleByNumber(moduleNumber);
  if (!mod) return false;
  if (mod.pillar === 'awareness') return true;
  const rolePath = getRolePath(learnerRole);
  return rolePath ? moduleNumber < rolePath.startHereModule : false;
}

/** Server-side grading: a pass requires every question answered correctly. */
export function gradeTestOut(
  moduleNumber: number,
  answers: Readonly<Record<string, string>>,
): { readonly passed: boolean; readonly correctCount: number; readonly total: number } {
  const check = CHECKS_BY_MODULE.get(moduleNumber);
  if (!check) return { passed: false, correctCount: 0, total: 0 };
  let correctCount = 0;
  for (const question of check.questions) {
    const correctOption = question.options.find((option) => option.correct);
    if (correctOption && answers[question.id] === correctOption.id) {
      correctCount += 1;
    }
  }
  return {
    passed: correctCount === check.questions.length,
    correctCount,
    total: check.questions.length,
  };
}
