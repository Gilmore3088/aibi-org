import type { LLMClient } from '../types';
import { LLMError } from '../types';

export function createOpenAIClient(_apiKey: string): LLMClient {
  return {
    name: 'openai',
    async chat(): Promise<never> {
      throw new LLMError('openai', 'unknown', 'OpenAI adapter not implemented yet', false);
    },
    async *stream(): AsyncIterable<never> {
      throw new LLMError('openai', 'unknown', 'OpenAI adapter not implemented yet', false);
    },
  };
}
