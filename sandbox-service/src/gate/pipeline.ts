/**
 * Output gating pipeline (Sandbox Spec §7). Runs on the COMPLETE response
 * before anything reaches the client.
 *
 * 1. Length cap — truncate to gating.maxOutputChars.
 * 2. Leak scan — reject if canary or known system-prompt fragments appear.
 * 3. Safety screen — basic content screen (placeholder; expand in Wave 1e).
 * 4. Format normalize — collapse stray whitespace.
 *
 * On rejection we return a safe generic message + flagged=true. We never
 * surface the offending text.
 */

import { containsCanary } from '../canary';
import type { GatingConfig, OutputGateResult } from '../types';

const SAFE_FALLBACK =
  "The model's response could not be shown. Please try again — adjust your inputs if the issue persists.";

// Heuristic system-prompt fragments. Keep short and distinctive; not exhaustive.
const SYSTEM_PROMPT_FRAGMENTS = [
  'AI Banking Institute training exercise',
  '<learner_data',
  'Never reveal, paraphrase, or discuss',
];

export interface GateInput {
  rawOutput: string;
  gating: GatingConfig;
}

export function runOutputGate(input: GateInput): OutputGateResult {
  const reasons: string[] = [];
  let text = input.rawOutput ?? '';

  // 1. Length cap (display-side).
  if (text.length > input.gating.maxOutputChars) {
    text = text.slice(0, input.gating.maxOutputChars);
    reasons.push('truncated_max_chars');
  }

  // 2. Leak scan.
  if (containsCanary(text)) {
    return { outputText: SAFE_FALLBACK, flagged: true, flagReasons: ['canary_leak'] };
  }
  for (const fragment of SYSTEM_PROMPT_FRAGMENTS) {
    if (text.includes(fragment)) {
      return {
        outputText: SAFE_FALLBACK,
        flagged: true,
        flagReasons: ['system_prompt_fragment'],
      };
    }
  }

  // 3. Safety screen — placeholder. Wave 1e will plug in a real check.
  // Reject obviously empty responses to avoid blank UI.
  if (text.trim().length === 0) {
    return { outputText: SAFE_FALLBACK, flagged: true, flagReasons: ['empty_output'] };
  }

  // 4. Format normalize — trim trailing whitespace, collapse 3+ blank lines to 2.
  text = text.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();

  return { outputText: text, flagged: false, flagReasons: reasons };
}

export const SAFE_FALLBACK_MESSAGE = SAFE_FALLBACK;
