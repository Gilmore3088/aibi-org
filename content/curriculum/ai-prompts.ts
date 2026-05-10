/**
 * Flagship reusable prompts the AiBI Foundations curriculum publishes.
 *
 * "Prompt" here is the AI primitive distinct from a Skill or Agent —
 * a single, focused, reusable instruction template you can paste into
 * any approved platform. The course's Module 11 ("Personal Prompt
 * Library") teaches practitioners to save what works and refine over
 * time. The full library lives at content/courses/foundations/prompt-library.ts
 * (~30 prompts, growing).
 *
 * The flagships listed here are a representative sample for the
 * /education and homepage panel. Each entry refers back by id so the
 * full prompt text + scaffolding can be looked up when needed.
 */

export type AiPromptRole =
  | "Lending"
  | "Compliance"
  | "Finance"
  | "Executive"
  | "IT"
  | "Marketing"
  | "Retail"
  | "Operations";

export type AiPromptPlatform =
  | "ChatGPT"
  | "Claude"
  | "Copilot"
  | "Gemini"
  | "NotebookLM"
  | "Perplexity";

export interface AiPrompt {
  /** id from content/courses/foundations/prompt-library.ts */
  readonly libraryId: string;
  readonly title: string;
  readonly role: AiPromptRole;
  readonly platform: AiPromptPlatform;
  readonly summary: string;
}

export const AI_PROMPTS: readonly AiPrompt[] = [
  {
    libraryId: "m7-compliance-sar-narrative",
    title: "SAR narrative drafting assistant",
    role: "Compliance",
    platform: "Claude",
    summary:
      "Drafts the FinCEN-format SAR narrative covering the five required elements, with explicit BSA-officer review flags.",
  },
  {
    libraryId: "m4-compliance-perplexity",
    title: "CFPB guidance research",
    role: "Compliance",
    platform: "Perplexity",
    summary:
      "Pulls and summarizes a CFPB bulletin or final rule with sourced citations — the regulatory-research starting point.",
  },
  {
    libraryId: "m7-lending-loan-checklist",
    title: "Loan file completeness checker",
    role: "Lending",
    platform: "ChatGPT",
    summary:
      "Audits a loan file against the institution's underwriting checklist; flags missing items before credit committee.",
  },
  {
    libraryId: "m4-lending-deep-research",
    title: "CRE market trends research",
    role: "Lending",
    platform: "Claude",
    summary:
      "Sourced research brief on commercial real-estate trends in a target market — for the credit memo's external-context section.",
  },
  {
    libraryId: "m7-finance-variance-analysis",
    title: "Monthly variance commentary",
    role: "Finance",
    platform: "ChatGPT",
    summary:
      "Generates the variance-narrative paragraph the CFO appends to monthly financials. House voice, numbered drivers.",
  },
  {
    libraryId: "ref-exec-board-prep",
    title: "Board meeting prep",
    role: "Executive",
    platform: "Claude",
    summary:
      "Synthesizes prior-meeting minutes, current packet, and outstanding actions into a one-page CEO prep brief.",
  },
  {
    libraryId: "ref-it-vendor-assessment",
    title: "AI vendor due-diligence questionnaire",
    role: "IT",
    platform: "ChatGPT",
    summary:
      "Drafts the IT vendor questionnaire response from a vendor's SOC 2 + DPA, mapped to your TPRM framework.",
  },
] as const;
