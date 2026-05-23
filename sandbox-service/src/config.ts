/**
 * Server-only env loader. Throws fast on missing required vars.
 *
 * Provider keys are loaded ONLY here and ONLY consumed by gateway/*.
 * They must never be imported into client components or route handlers
 * outside `src/app/api/sandbox/`.
 */

import type { ProviderName } from './types';

interface ProviderConfig {
  apiKey: string | null;
  defaultModel: string;
  anonModel: string; // cheaper model pinned for anon/free traffic
}

export interface SandboxConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  providers: Record<ProviderName, ProviderConfig>;
  providerPriority: ProviderName[];
  requestTimeoutMs: number;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`sandbox-service: missing required env var ${name}`);
  }
  return value;
}

let cached: SandboxConfig | null = null;

export function getConfig(): SandboxConfig {
  if (cached) return cached;

  cached = {
    supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    providers: {
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY ?? null,
        defaultModel: process.env.SANDBOX_ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
        anonModel: process.env.SANDBOX_ANTHROPIC_ANON_MODEL ?? 'claude-haiku-4-5',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY ?? null,
        defaultModel: process.env.SANDBOX_OPENAI_MODEL ?? 'gpt-4o',
        anonModel: process.env.SANDBOX_OPENAI_ANON_MODEL ?? 'gpt-4o-mini',
      },
      google: {
        apiKey: process.env.GEMINI_API_KEY ?? null,
        defaultModel: process.env.SANDBOX_GEMINI_MODEL ?? 'gemini-2.5-pro',
        anonModel: process.env.SANDBOX_GEMINI_ANON_MODEL ?? 'gemini-2.5-flash',
      },
    },
    providerPriority: ['anthropic', 'openai', 'google'],
    requestTimeoutMs: 10_000,
  };

  return cached;
}

/** Test hook — clears the memoized config so tests can re-read env. */
export function resetConfigForTests(): void {
  cached = null;
}
