// Artifact-first framing for every Foundation module.
//
// The course is organized around the artifact each module produces. Every
// module page opens with the same four-line contract so the learner always
// knows what they are building, why it matters at work, what lands in their
// Foundation Packet, and what human-judgment bar they must clear.
//
//   You are building   → the artifact (mirrors Module.keyOutput)
//   You will use it for → the real banking task
//   You will save       → the toolbox object that enters the Foundation Packet
//   You must prove      → the human review / safety / judgment requirement
//
// This is the single source for both the module header (ModuleArtifactHeader)
// and the dashboard Foundation Packet tracker, so the artifact names stay
// consistent everywhere. Authored from each module's keyOutput, goal, practice,
// and bankingBoundary in v4-expanded-modules.ts.

export interface ArtifactFirstMeta {
  readonly module: number;
  readonly building: string; // You are building
  readonly usedFor: string; // You will use it for
  readonly saved: string; // You will save (Foundation Packet slot label)
  readonly mustProve: string; // You must prove
}

export const ARTIFACT_FIRST_BY_MODULE: Record<number, ArtifactFirstMeta> = {
  1: {
    module: 1,
    building: 'A rewritten email — clear action, owner, and deadline',
    usedFor: 'Turning the messy internal emails and notes that eat your morning into five-minute review tasks',
    saved: 'Rewritten Email + a reusable rewrite prompt',
    mustProve: 'You strip names and account data first, and review every draft before it sends',
  },
  2: {
    module: 2,
    building: 'An AI Claim Review — three outputs marked clean or flagged',
    usedFor: 'Catching the confident-but-wrong numbers, dates, names, and policy claims AI slips into banking answers',
    saved: 'AI Claim Review worksheet',
    mustProve: 'You treat every confident claim as a draft until the fact, date, number, or citation is verified',
  },
  3: {
    module: 3,
    building: 'A Prompt Strategy Cheat Sheet — the right strategy for each job',
    usedFor: 'Building reusable, role-based prompts for the tasks you repeat every week',
    saved: 'Prompt Strategy Cheat Sheet',
    mustProve: 'You describe the task without exposing PII, NPI, account, or confidential bank data',
  },
  4: {
    module: 4,
    building: 'An AI Work Profile — your role, tone, tasks, and do-not rules',
    usedFor: 'Giving AI safe, reusable context about how you work so every prompt starts stronger',
    saved: 'Your about-me.md work profile',
    mustProve: 'Your profile carries work preferences and role context — never customer data or confidential records',
  },
  5: {
    module: 5,
    building: 'A Project Brief — objective, scope, success metric, risks, reviewers',
    usedFor: 'Giving AI reusable project context so outputs stay on-scope across a real initiative',
    saved: 'Project Brief Template',
    mustProve: 'Project context is sanitized and approved before you reuse it in any AI tool',
  },
  6: {
    module: 6,
    building: 'A Document Workflow Prompt — source-grounded, with verification steps',
    usedFor: 'Summarizing, comparing, and extracting from policies and procedures without drift',
    saved: 'Document Workflow Prompt',
    mustProve: 'You only use files your institution permits, and verify every summary against the source',
  },
  7: {
    module: 7,
    building: 'A Tool Choice Map — tools matched to task, data class, and approval',
    usedFor: 'Deciding which AI tool is safe for which banking task before you start',
    saved: 'Tool Choice Map',
    mustProve: 'You treat capability and approval as separate — policy decides what tool touches what data',
  },
  8: {
    module: 8,
    building: 'A Workflow Map — AI steps, human handoffs, and blocked decisions',
    usedFor: 'Decomposing one recurring workflow into AI-supported steps with human checkpoints',
    saved: 'Workflow Map',
    mustProve: 'Customer-impacting, credit, compliance, legal, and payment actions stay behind approved controls',
  },
  9: {
    module: 9,
    building: 'A Safe AI Use Checklist — strip, verify, escalate',
    usedFor: 'Running the same safety habits on any AI-assisted work that influences a decision',
    saved: 'Safe AI Use Checklist',
    mustProve: 'Red-zone data and decisions are escalated to approved systems, never pasted into public tools',
  },
  10: {
    module: 10,
    building: 'A Role Use-Case Card — input, review owner, failure mode, escalation',
    usedFor: 'Turning the foundations into one concrete, defensible use case for your role',
    saved: 'Role Use-Case Card',
    mustProve: 'Human review stays on every customer-facing, credit, compliance, and operational-risk output',
  },
  11: {
    module: 11,
    building: 'A Personal Prompt Library — three reusable prompts with safety notes',
    usedFor: 'Turning your best one-off prompts into a daily system you reuse and share',
    saved: 'Personal Prompt Library (3 prompts)',
    mustProve: 'Saved prompts use placeholders and safety notes instead of sensitive real data',
  },
  12: {
    module: 12,
    building: 'Your Final Foundation Lab Package — the capstone of all 12 artifacts',
    usedFor: 'Proving you can run a real banking task with AI, safely, end to end',
    saved: 'Final Foundation Lab Package',
    mustProve: 'The submission shows safe prompting, verification, limits, and human judgment throughout',
  },
};

export function getArtifactFirst(moduleNumber: number): ArtifactFirstMeta | undefined {
  return ARTIFACT_FIRST_BY_MODULE[moduleNumber];
}
