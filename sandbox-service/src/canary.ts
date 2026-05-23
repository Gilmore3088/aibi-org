/**
 * Canary token embedded in every Exercise system prompt. Output gate rejects
 * any response containing this token (indicates the model leaked instructions).
 *
 * The literal value is server-only — content authors must include it via
 * the assembler, not hardcode it into their own systemPrompt strings.
 */
export const CANARY_TOKEN = '[[AIBI-SYS-7Q]]';

export function containsCanary(text: string): boolean {
  return text.includes(CANARY_TOKEN);
}
