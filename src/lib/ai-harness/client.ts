import type { LLMClient, ProviderName } from './types';
import { createAnthropicClient } from './providers/anthropic';
import { createOpenAIClient } from './providers/openai';
import { createGeminiClient } from './providers/gemini';

export function createLLMClient(provider: ProviderName): LLMClient {
  switch (provider) {
    case 'anthropic': {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error('ANTHROPIC_API_KEY not set');
      return createAnthropicClient(key);
    }
    case 'openai': {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error('OPENAI_API_KEY not set');
      return createOpenAIClient(key);
    }
    case 'gemini': {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error('GEMINI_API_KEY not set');
      return createGeminiClient(key);
    }
  }
}
