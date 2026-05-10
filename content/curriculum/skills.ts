/**
 * Skills the AiBI-Foundation curriculum teaches.
 *
 * Bound to the takeaways across the 12 modules in
 *   content/courses/aibi-p/v4-expanded-modules.ts
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

// Source module takeaways (verbatim, for reference):
//   M1  Identify quick wins · Use AI without exposing sensitive data · Review every output
//   M2  Explain LLMs simply · Recognize hallucinations · Separate verified facts from assumptions
//   M3  Use a repeatable prompt pattern · Add useful constraints · Create one reusable role prompt
//   M4  Define role context · Capture voice preferences · Set personal AI boundaries
//   M5  Package context once · Use project briefs for better outputs · Avoid repeating setup prompts
//   M6  Use files safely · Ask for source-grounded answers · Verify document summaries
//   M7  Compare tool categories · Match tools to tasks · Separate personal accounts from approved access
//   M8  Explain agents simply · Map before automating · Place human checkpoints
//   M9  Know what not to paste · Use SAFE before prompting · Classify risk quickly
//   M10 Identify role-specific AI wins · Know when to escalate · Design review into the workflow
//   M11 Save what works · Organize prompts by task · Improve prompts over time
//   M12 Package a real AI-assisted workflow · Document review decisions · Earn the practitioner credential
export const SKILLS: readonly CurriculumSkill[] = [
  {
    slug: "spot-the-quick-win",
    verb: "Spot the daily AI wins in your role",
    note: "Identify the recurring writing, summarizing, and thinking-support tasks where AI removes friction without adding risk.",
    modules: [1, 10],
  },
  {
    slug: "explain-llms",
    verb: "Explain LLMs in plain language",
    note: "What they are, what they aren't, why they sound certain even when guessing, and how to set expectations with colleagues.",
    modules: [2],
  },
  {
    slug: "recognize-hallucinations",
    verb: "Recognize and contain hallucinations",
    note: "Numbers, dates, names, and policy claims are the four places hallucinations cluster. Verify each one against the source.",
    modules: [2, 6],
  },
  {
    slug: "prompt-with-pattern",
    verb: "Prompt with a repeatable pattern",
    note: "Role context, task, constraints, format. Build one reusable role prompt for the work you do most often.",
    modules: [3, 4],
  },
  {
    slug: "package-context",
    verb: "Package context once, reuse it everywhere",
    note: "Project briefs and saved context so you stop re-typing your role setup at the start of every chat.",
    modules: [5],
  },
  {
    slug: "ground-in-source",
    verb: "Ground answers in the document you provided",
    note: "Use files safely, ask for source-grounded answers, and verify summaries against the document.",
    modules: [6],
  },
  {
    slug: "match-tool-to-task",
    verb: "Match the right tool to the task",
    note: "ChatGPT, Claude, Copilot, Gemini, NotebookLM, Perplexity each have a fit. Knowing which is which is a skill.",
    modules: [7],
  },
  {
    slug: "design-checkpoints",
    verb: "Place human checkpoints in any AI workflow",
    note: "Before AI is allowed to act, decide where the practitioner reviews. Map before automating.",
    modules: [8, 10, 12],
  },
  {
    slug: "apply-safe-rule",
    verb: "Apply the SAFE rule before pasting",
    note: "Sensitive data, Authority to share, Fit for a public model, Evidence kept. Classify risk in seconds.",
    modules: [9],
  },
  {
    slug: "build-prompt-library",
    verb: "Build a personal prompt library that improves over time",
    note: "Save what works, organize by task, and refine. The library is the practitioner's compounding asset.",
    modules: [11],
  },
  {
    slug: "ship-a-workflow",
    verb: "Ship a reviewed AI-assisted workflow",
    note: "The capstone artifact: a documented, end-to-end workflow with review decisions captured. The practitioner credential.",
    modules: [12],
  },
] as const;
