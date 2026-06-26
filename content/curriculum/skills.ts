/**
 * Skills the AiBI-Foundation curriculum teaches.
 *
 * Bound to the takeaways across the 18 micro-modules in
 *   content/courses/foundation-program/micro-modules.ts
 *
 * Each entry consolidates one or more module takeaways into a verb-stated
 * skill, with a back-reference to the module(s) where the skill is built.
 *
 * If a module's takeaways change, this list is the place to reconcile.
 */

export interface CurriculumSkill {
  readonly slug: string;
  readonly verb: string;
  readonly note: string;
  /** Modules where this skill is built. */
  readonly modules: readonly number[];
}

// Source learning ladder:
//   M1  AI limits in a bank
//   M2  Rewrite a low-risk message
//   M3  Write a prompt that gets to the core
//   M4  Build a first prompt
//   M5  Add context and constraints
//   M6  Ask for structured output
//   M7  Review AI output like a banker
//   M8  Use source material safely
//   M9  Turn a prompt into a reusable template
//   M10 Build a role-based prompt
//   M11 Choose the right AI use case
//   M12 Apply data-safety boundaries
//   M13 Build a simple reusable skill
//   M14 Map a workflow before automating
//   M15 Add human review checkpoints
//   M16 Document evidence and decisions
//   M17 Package a reusable AI workflow
//   M18 Review the final Foundation Packet
export const SKILLS: readonly CurriculumSkill[] = [
  {
    slug: "spot-the-quick-win",
    verb: "Spot the daily AI wins in your role",
    note: "Identify the recurring writing, summarizing, and thinking-support tasks where AI removes friction without adding risk.",
    modules: [1, 11],
  },
  {
    slug: "explain-llms",
    verb: "Explain LLMs in plain language",
    note: "What they are, what they aren't, why they sound certain even when guessing, and how to set expectations with colleagues.",
    modules: [1],
  },
  {
    slug: "recognize-hallucinations",
    verb: "Recognize and contain hallucinations",
    note: "Numbers, dates, names, and policy claims are the four places hallucinations cluster. Verify each one against the source.",
    modules: [3, 7],
  },
  {
    slug: "prompt-with-pattern",
    verb: "Prompt with a repeatable pattern",
    note: "Role context, task, constraints, format. Build one reusable role prompt for the work you do most often.",
    modules: [4, 5, 6],
  },
  {
    slug: "package-context",
    verb: "Package context once, reuse it everywhere",
    note: "Project briefs and saved context so you stop re-typing your role setup at the start of every chat.",
    modules: [5, 9],
  },
  {
    slug: "ground-in-source",
    verb: "Ground answers in the document you provided",
    note: "Use files safely, ask for source-grounded answers, and verify summaries against the document.",
    modules: [8],
  },
  {
    slug: "match-tool-to-task",
    verb: "Match the right tool to the task",
    note: "ChatGPT, Claude, Copilot, Gemini, NotebookLM, Perplexity each have a fit. Knowing which is which is a skill.",
    modules: [11],
  },
  {
    slug: "design-checkpoints",
    verb: "Place human checkpoints in any AI workflow",
    note: "Before AI is allowed to act, decide where the practitioner reviews. Map before automating.",
    modules: [14, 15, 17],
  },
  {
    slug: "apply-safe-rule",
    verb: "Apply the SAFE rule before pasting",
    note: "Sensitive data, Authority to share, Fit for a public model, Evidence kept. Classify risk in seconds.",
    modules: [12],
  },
  {
    slug: "build-prompt-library",
    verb: "Build a personal prompt library that improves over time",
    note: "Save what works, organize by task, and refine. The library is the practitioner's compounding asset.",
    modules: [9, 10],
  },
  {
    slug: "build-reusable-skill",
    verb: "Turn a good prompt into a reusable skill",
    note: "Add placeholders, review steps, allowed inputs, and blocked uses so a prompt becomes a reusable work action.",
    modules: [13],
  },
  {
    slug: "document-evidence",
    verb: "Document what AI did and what the banker changed",
    note: "Keep a short evidence note that makes the human review visible to a manager, auditor, or compliance partner.",
    modules: [16],
  },
  {
    slug: "ship-a-workflow",
    verb: "Ship a reviewed AI-assisted workflow",
    note: "The capstone artifact: a documented, end-to-end workflow with review decisions captured. The practitioner credential.",
    modules: [17, 18],
  },
] as const;
