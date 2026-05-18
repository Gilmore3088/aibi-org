/**
 * Tools the AiBI-Foundation curriculum teaches.
 *
 * Live tool guides live in:
 *   content/courses/foundation-program/tool-guides-notebooklm-perplexity.ts
 *
 * NotebookLM and Perplexity are the two platforms surfaced on
 * /courses/foundation/program/tool-guides. ChatGPT, Claude, Copilot,
 * and Gemini are referenced in the curriculum but do not yet have
 * canonical structured guides — see task C1c for the transcription
 * follow-up.
 *
 * Pages that surface the "tools your bankers will use" list
 * (e.g. /for-institutions, /education) read from this module.
 *
 * Module 7 of the curriculum covers tool comparison; this list reflects
 * the platforms the curriculum walks the practitioner through using.
 */

export type ToolCategory =
  | "general-llm"      // ChatGPT, Claude — general-purpose chat models
  | "office-suite"     // Copilot, Gemini — embedded in Microsoft / Google productivity
  | "research"         // Perplexity — search-grounded LLM
  | "documents";       // NotebookLM — document-grounded LLM

export interface CurriculumTool {
  readonly slug: string;
  readonly name: string;
  readonly vendor: string;
  readonly category: ToolCategory;
  readonly note: string;
  /** Modules where this tool is taught. Sourced from the course content. */
  readonly modules: readonly number[];
}

export const TOOLS: readonly CurriculumTool[] = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    category: "general-llm",
    note: "General-purpose drafting, summarization, and decision support. Module 7 covers free vs. paid tier tradeoffs.",
    modules: [3, 7],
  },
  {
    slug: "claude",
    name: "Claude",
    vendor: "Anthropic",
    category: "general-llm",
    note: "Long-context reading and policy-grounded analysis. Strong on careful reasoning over uploaded documents.",
    modules: [3, 6, 7],
  },
  {
    slug: "copilot",
    name: "Microsoft Copilot",
    vendor: "Microsoft",
    category: "office-suite",
    note: "Embedded in Outlook, Word, Excel, Teams. The path of least resistance for institutions on Microsoft 365.",
    modules: [7],
  },
  {
    slug: "gemini",
    name: "Google Gemini",
    vendor: "Google",
    category: "office-suite",
    note: "Embedded in Gmail, Docs, Sheets, Meet. Equivalent path of least resistance for Google Workspace shops.",
    modules: [7],
  },
  {
    slug: "notebooklm",
    name: "NotebookLM",
    vendor: "Google",
    category: "documents",
    note: "Document-grounded notebook for source-bounded Q&A across uploaded policies, bulletins, and memos.",
    modules: [6, 7],
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    vendor: "Perplexity AI",
    category: "research",
    note: "Search-grounded LLM with citations. Useful for regulatory research where source attribution matters.",
    modules: [6, 7],
  },
] as const;
