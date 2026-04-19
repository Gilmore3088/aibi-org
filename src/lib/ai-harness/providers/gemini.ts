import type { LLMClient } from '../types';
import { LLMError } from '../types';

export function createGeminiClient(_apiKey: string): LLMClient {
  return {
    name: 'gemini',
    async chat(): Promise<never> {
      throw new LLMError('gemini', 'unknown', 'Gemini adapter not implemented yet', false);
    },
    async *stream(): AsyncIterable<never> {
      throw new LLMError('gemini', 'unknown', 'Gemini adapter not implemented yet', false);
    },
  };
}
