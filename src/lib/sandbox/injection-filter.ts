/**
 * Prompt injection filter for the AI Practice Sandbox.
 *
 * Scans learner input for common jailbreak and prompt-override patterns.
 * Uses word-boundary matching and contextual exclusions to avoid
 * false positives on legitimate banking and AI-training language.
 */

interface InjectionResult {
  safe: boolean;
  reason?: string;
}

const BLOCKED_REASON = 'That message was blocked. Please focus on the exercise.';

/**
 * Patterns that indicate prompt injection or jailbreak attempts.
 * Each entry is a regex tested against the lowercased input.
 * Word boundaries (\b) prevent matching inside longer phrases.
 */
const INJECTION_PATTERNS: RegExp[] = [
  // Instruction override attempts
  /\bignore\b.{0,20}\b(previous|your|all prior)\b.{0,20}\binstructions?\b/,
  /\bforget\s+everything\b/,
  /\bdisregard\b.{0,20}\b(instructions?|rules?|guidelines?|system|prompt)\b/,
  /\boverride\b.{0,20}\b(instructions?|rules?|system|prompt|restrictions?)\b/,

  // System prompt extraction
  /\bsystem\s+prompt\b/,
  /\breveal\b.{0,20}\bprompt\b/,
  /\bshow\b.{0,20}\byour\b.{0,20}\binstructions?\b/,
  /\bwhat\s+are\s+your\s+instructions?\b/,

  // Jailbreak keywords
  /\bDAN\b/,
  /\bdo\s+anything\s+now\b/,
  /\bjailbreak\b/,

  // Role override attempts
  /\byou\s+are\s+now\b/,
  /\bpretend\s+you\s+are\b/,
  /\bact\s+as\s+if\s+you\s+are\b/,

  // Delimiter-based injection (3+ consecutive special chars)
  /[|]{3,}/,
  /[#]{3,}/,
  /[=]{3,}/,
  /[>]{3,}/,
  /[<]{3,}/,
  /[-]{5,}/,
  /[*]{3,}/,
];

/**
 * Allowlist patterns that override a match when the surrounding context
 * makes clear the phrase is legitimate banking or lesson language.
 *
 * Each entry: [triggerSubstring, allowlistRegex].
 * If the input contains the trigger AND the allowlist regex matches,
 * the input is allowed through.
 */
const ALLOWLIST: Array<[string, RegExp]> = [
  // "ignore the late fee", "ignore the hold", etc.
  ['ignore', /\bignore\b.{0,20}\b(fee|hold|charge|penalty|balance|payment|notice|warning)\b/],

  // "override the hold", "override the limit"
  ['override', /\boverride\b.{0,20}\b(hold|limit|block|freeze|flag|alert|restriction on)\b/],

  // "previous instructions from the examiner/auditor/regulator"
  ['previous', /\bprevious\s+instructions?\s+(from|per|by|of|regarding)\b/],

  // "the system uses prompt engineering" / "system prompt engineering"
  ['system', /\bsystem\b.{0,10}\buses\b/],

  // "disregard the notice/fee"
  ['disregard', /\bdisregard\b.{0,20}\b(notice|fee|charge|penalty|alert|flag)\b/],
];

/**
 * Scan user input for prompt injection attempts.
 *
 * @param text - The raw user message to evaluate.
 * @returns `{ safe: true }` if clean, or `{ safe: false, reason }` if blocked.
 */
export function scanForInjection(text: string): InjectionResult {
  const lower = text.toLowerCase();

  for (const pattern of INJECTION_PATTERNS) {
    if (!pattern.test(lower)) {
      continue;
    }

    // Check whether an allowlist rule rescues this match
    const rescued = ALLOWLIST.some(
      ([trigger, allowRegex]) => lower.includes(trigger) && allowRegex.test(lower)
    );

    if (rescued) {
      continue;
    }

    return { safe: false, reason: BLOCKED_REASON };
  }

  return { safe: true };
}
