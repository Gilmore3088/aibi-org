// Foundation module recommendations driven by In-Depth results (#97 §13).
//
// After the buyer's score lands, the Briefing tells them WHICH Foundation
// modules to start with. Maps the eight readiness dimensions to the
// twelve Foundation modules. Each weakest-dimension → 3 recommended
// starting modules ordered by relevance (primary, supporting, capstone).
//
// The full Foundation course is 12 modules. The recommendation isn't
// "skip the rest" — it's "start here, the gaps below close fastest with
// these three modules." Every Foundation buyer still gets all 12.

import type { Dimension } from './types';

export interface FoundationModuleRef {
  readonly number: number;
  readonly title: string;
  readonly why: string;
}

// Source of truth for module titles is content/courses/foundation-program/
// module-*.ts. If those titles change, update this table.
const MODULES: Record<number, { title: string }> = {
  1: { title: 'AI for Your Workday' },
  2: { title: 'What AI Is and Is Not' },
  3: { title: 'Prompting Fundamentals' },
  4: { title: 'Your AI Work Profile' },
  5: { title: 'Projects and Context' },
  6: { title: 'Files and Document Workflows' },
  7: { title: 'AI Tools Landscape' },
  8: { title: 'Agents and Workflow Thinking' },
  9: { title: 'Safe AI Use in Banking' },
  10: { title: 'Role-Based Use Cases' },
  11: { title: 'Personal Prompt Library' },
  12: { title: 'Final Foundation Lab' },
};

function moduleRef(number: number, why: string): FoundationModuleRef {
  return { number, title: MODULES[number].title, why };
}

// For each weakest dimension, the three Foundation modules the learner
// should prioritize. Order matters: index 0 is the most direct gap-closer.
export const FOUNDATION_RECOMMENDATIONS: Record<
  Dimension,
  readonly [FoundationModuleRef, FoundationModuleRef, FoundationModuleRef]
> = {
  'current-ai-usage': [
    moduleRef(1, 'Embeds AI into a real daily workflow on day one.'),
    moduleRef(6, 'Turns scattered document tasks into repeatable processes.'),
    moduleRef(10, 'Picks role-specific use cases your team will recognize.'),
  ],
  'experimentation-culture': [
    moduleRef(11, 'Builds the personal prompt library that the team learns from.'),
    moduleRef(4, 'Names what each person should be experimenting with.'),
    moduleRef(8, 'Pushes individual prompts into shared workflow patterns.'),
  ],
  'ai-literacy-level': [
    moduleRef(2, 'Levels the floor — what AI is, what it is not, in banker terms.'),
    moduleRef(3, 'Closes the prompting gap that drives both paralysis and oversharing.'),
    moduleRef(9, 'Locks in the safe-use rules every staff member must internalize.'),
  ],
  'quick-win-potential': [
    moduleRef(1, 'Identifies the first workflow that earns its keep this week.'),
    moduleRef(10, 'Surfaces role-specific quick wins per department.'),
    moduleRef(11, 'Captures the win so it compounds instead of evaporating.'),
  ],
  'leadership-buy-in': [
    moduleRef(10, 'Gives executives the role-by-role business case in plain numbers.'),
    moduleRef(12, 'The Final Lab produces an artifact the leader can take to the board.'),
    moduleRef(2, 'Equips leaders to defend AI without overclaiming or under-investing.'),
  ],
  'security-posture': [
    moduleRef(9, 'The Safe AI Use module IS the documented posture.'),
    moduleRef(5, 'Projects and Context teach how to scope tools to permitted data only.'),
    moduleRef(7, 'AI Tools Landscape clarifies what is approved vs prohibited.'),
  ],
  'training-infrastructure': [
    moduleRef(11, 'Personal Prompt Library is the artifact training cadence builds toward.'),
    moduleRef(12, 'Final Foundation Lab gives every learner a reviewed work product.'),
    moduleRef(4, 'AI Work Profile gives each cohort member a personalized path.'),
  ],
  'builder-potential': [
    moduleRef(8, 'Agents and Workflow Thinking is where the builder mindset starts.'),
    moduleRef(5, 'Projects and Context — the structuring discipline a builder uses.'),
    moduleRef(11, 'Personal Prompt Library — the artifact every builder maintains.'),
  ],
};
