// AiBI-Foundation tool guides — barrel.
//
// Consumers should import from '@content/courses/foundation-program/tool-guides'
// (this file), not from the per-platform files directly.
//
// The order of ALL_TOOL_GUIDES drives the default order on the
// /courses/foundation/program/tool-guides page. The contentRouting
// logic in src/app/courses/foundation/program/_lib/contentRouting.ts
// re-sorts this based on the learner's onboarding answers (M365 →
// Copilot front, ChatGPT Plus → ChatGPT front, etc.).

export type {
  ToolGuide,
  BankingUseCase,
  PricingTier,
  ProTip,
  PlatformId,
} from './types';

export { chatgptGuide } from './chatgpt';
export { claudeGuide } from './claude';
export { copilotGuide } from './copilot';
export { geminiGuide } from './gemini';
export { notebooklmGuide } from './notebooklm';
export { perplexityGuide } from './perplexity';

import type { PlatformId, ToolGuide } from './types';
import { chatgptGuide } from './chatgpt';
import { claudeGuide } from './claude';
import { copilotGuide } from './copilot';
import { geminiGuide } from './gemini';
import { notebooklmGuide } from './notebooklm';
import { perplexityGuide } from './perplexity';

/** Default ordering — front-loads the platforms most learners will
 *  recognize and reach for first. Onboarding-based re-ordering happens
 *  at the route layer. */
export const ALL_TOOL_GUIDES: readonly ToolGuide[] = [
  chatgptGuide,
  claudeGuide,
  copilotGuide,
  geminiGuide,
  notebooklmGuide,
  perplexityGuide,
] as const;

export const TOOL_GUIDE_MAP: Readonly<Record<PlatformId, ToolGuide>> = {
  chatgpt: chatgptGuide,
  claude: claudeGuide,
  copilot: copilotGuide,
  gemini: geminiGuide,
  notebooklm: notebooklmGuide,
  perplexity: perplexityGuide,
} as const;

export function getToolGuideByPlatform(platformId: PlatformId): ToolGuide {
  return TOOL_GUIDE_MAP[platformId];
}
