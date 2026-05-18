// AiBI-Foundation tool guides — canonical schema.
//
// One ToolGuide interface for all 6 platforms (ChatGPT, Claude, Copilot,
// Gemini, NotebookLM, Perplexity). Each platform lives in its own file
// and is barrelled from index.ts; consumers should import from
// '@content/courses/foundation-program/tool-guides' (the barrel),
// never directly.
//
// Schema rationale:
//   - Identity (platformId / platformLabel / colorVar / tagline / url)
//     is fixed shape, never optional.
//   - Getting started + pricing + data safety are structured fields
//     so the UI can render consistent sections per platform.
//   - Banking use cases vary in shape: some platforms support file
//     upload and structured workflows (ChatGPT, Claude, Copilot),
//     others are pure conversational (Gemini), document-grounded
//     (NotebookLM), or research-cited (Perplexity). The use-case shape
//     includes optional fields (description / steps / verifyBefore /
//     dataWarning) so platforms only fill what's meaningful.

import type { PromptPlatform } from '../prompt-library';

export type PlatformId =
  | 'chatgpt'
  | 'claude'
  | 'copilot'
  | 'gemini'
  | 'notebooklm'
  | 'perplexity';

// ─── Banking use case ────────────────────────────────────────────────────────

export interface BankingUseCase {
  /** Display number — keeps stable across re-orderings of the array. */
  readonly number: number;
  readonly title: string;
  /** Optional one-paragraph context before the steps/prompt block. Used
   *  by platforms whose use cases benefit from scenario framing. */
  readonly description?: string;
  /** Optional ordered steps — when a use case is a workflow, not just
   *  a one-shot prompt. */
  readonly steps?: readonly string[];
  readonly prompt: string;
  readonly expectedOutput: string;
  /** Optional review checklist — what the learner must verify before
   *  acting on the AI output. */
  readonly verifyBefore?: string;
  /** Optional data classification warning when the use case touches
   *  borderline data. */
  readonly dataWarning?: string;
}

// ─── Pricing tier ────────────────────────────────────────────────────────────

export interface PricingTier {
  readonly tierName: string;
  readonly cost: string;
  readonly keyLimits: readonly string[];
  readonly bankingVerdict: string;
}

// ─── Pro tip ─────────────────────────────────────────────────────────────────

export interface ProTip {
  readonly number: number;
  readonly tip: string;
}

// ─── The ToolGuide ───────────────────────────────────────────────────────────

export interface ToolGuide {
  readonly platformId: PlatformId;
  readonly platformLabel: string;
  readonly platform: PromptPlatform;     // ties to the prompt-library platform enum
  readonly colorVar: string;
  readonly tagline: string;
  readonly url: string;

  readonly gettingStarted: {
    readonly steps: readonly string[];
    readonly firstSessionNote: string;
  };

  readonly pricing: readonly PricingTier[];
  readonly bankingUseCases: readonly BankingUseCase[];

  readonly customInstructions: {
    readonly available: boolean;
    readonly howTo: string;
    /** Multi-line example showing what to paste into the platform's
     *  custom-instructions surface (system prompt / persona / etc.).
     *  Use \n for line breaks; the renderer pre-formats. */
    readonly bankingExample?: string;
  };

  readonly dataSafety: {
    readonly summary: string;
    readonly details: readonly string[];
    readonly bankingVerdict: string;
  };

  readonly proTips: readonly ProTip[];
}
