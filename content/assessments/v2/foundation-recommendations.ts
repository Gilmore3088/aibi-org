// Foundation module recommendations driven by In-Depth results (#97 §13).
//
// After the buyer's score lands, the Briefing tells them WHICH Foundation
// modules to start with. Maps the eight readiness dimensions to the
// current Foundation micro-module ladder. Each weakest-dimension → 3
// recommended starting modules ordered by relevance.
//
// The full Foundation course is 18 bite-sized modules. The recommendation isn't
// "skip the rest" — it's "start here, the gaps below close fastest with
// these three modules." Every Foundation buyer still gets all 18.

import { FOUNDATION_MICRO_MODULES } from '../../courses/foundation-program/micro-modules';
import type { Dimension } from './types';

export interface FoundationModuleRef {
  readonly number: number;
  readonly title: string;
  readonly why: string;
}

const MODULES_BY_NUMBER = new Map(
  FOUNDATION_MICRO_MODULES.map((module) => [module.number, module]),
);

function moduleRef(number: number, why: string): FoundationModuleRef {
  const module = MODULES_BY_NUMBER.get(number);
  if (!module) throw new Error(`Missing Foundation module ${number}`);
  return { number, title: module.title, why };
}

// For each weakest dimension, the three Foundation modules the learner
// should prioritize. Order matters: index 0 is the most direct gap-closer.
export const FOUNDATION_RECOMMENDATIONS: Record<
  Dimension,
  readonly [FoundationModuleRef, FoundationModuleRef, FoundationModuleRef]
> = {
  'current-ai-usage': [
    moduleRef(2, 'Creates one safe, visible workday win without sensitive data.'),
    moduleRef(11, 'Helps pick a useful AI-supported task instead of a vague AI idea.'),
    moduleRef(14, 'Maps the workflow before anyone tries to automate it.'),
  ],
  'experimentation-culture': [
    moduleRef(4, 'Gives each learner a first prompt card they can test immediately.'),
    moduleRef(9, 'Turns a one-off prompt into a reusable template others can inspect.'),
    moduleRef(13, 'Shows how a tested prompt becomes a simple repeatable skill.'),
  ],
  'ai-literacy-level': [
    moduleRef(1, 'Levels the floor: what AI can and cannot do in bank work.'),
    moduleRef(3, 'Builds the review reflex that catches confident but weak output.'),
    moduleRef(7, 'Turns “review it” into a banker-specific checklist.'),
  ],
  'quick-win-potential': [
    moduleRef(2, 'Starts with a low-risk message rewrite the learner can use this week.'),
    moduleRef(6, 'Makes output easier to review by controlling the answer shape.'),
    moduleRef(9, 'Captures the win as a reusable prompt template instead of a one-off.'),
  ],
  'leadership-buy-in': [
    moduleRef(11, 'Turns AI interest into a specific, governable use-case card.'),
    moduleRef(16, 'Creates manager-readable evidence for what AI did and what the human changed.'),
    moduleRef(18, 'Packages the learner’s safe AI practice into a manager-ready Foundation Packet.'),
  ],
  'security-posture': [
    moduleRef(12, 'Sets the data-safety boundary before a prompt is written.'),
    moduleRef(8, 'Keeps source material grounded and prevents invented policy language.'),
    moduleRef(15, 'Adds a human review gate before AI-assisted work can move forward.'),
  ],
  'training-infrastructure': [
    moduleRef(9, 'Gives the cohort reusable prompt templates with placeholders and version notes.'),
    moduleRef(13, 'Creates a repeatable skill pattern that managers can review.'),
    moduleRef(17, 'Bundles prompts, review gates, evidence, and peer testing into a workflow kit.'),
  ],
  'builder-potential': [
    moduleRef(13, 'Starts the builder path with a simple reusable skill.'),
    moduleRef(14, 'Adds workflow mapping before automation decisions.'),
    moduleRef(17, 'Packages one tested skill or prompt into a peer-ready workflow kit.'),
  ],
};
