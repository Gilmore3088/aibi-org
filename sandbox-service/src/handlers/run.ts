/**
 * POST /sandbox/run — core handler.
 *
 * Pure-ish function: takes parsed inputs + identity, returns a RunResult.
 * The Next.js route shim parses the request, resolves identity, and serializes
 * the result. All side effects (DB read, provider call, DB insert) live here.
 */

import { z } from 'zod';
import { assemblePrompt, AssemblyError } from '../exercises/assembler';
import { loadExercise } from '../exercises/loader';
import { dispatch, AllProvidersFailedError } from '../gateway';
import { runOutputGate, SAFE_FALLBACK_MESSAGE } from '../gate/pipeline';
import { getRateLimiter } from '../rateLimit';
import { checkEntitlement } from '../auth/entitlement';
import { getServiceClient } from '../supabase';
import type {
  LearnerIdentity,
  ProviderName,
  RunInput,
  RunResult,
} from '../types';

export class SandboxError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'SandboxError';
  }
}

export const runInputSchema = z.object({
  exerciseId: z.string().min(1).max(128),
  leverSelections: z.record(z.string(), z.string()),
  dataSlotValues: z.record(z.string(), z.string()),
  presetIds: z.array(z.string()),
  provider: z.enum(['anthropic', 'openai', 'google']).optional(),
});

export interface RunHandlerInput extends RunInput {
  identity: LearnerIdentity;
  ipAddress: string | null;
}

const DEFAULT_TEMPERATURE = 0.4;

export async function runSandbox(input: RunHandlerInput): Promise<RunResult> {
  // 1. Load Exercise (server-only fields included).
  const exercise = await loadExercise(input.exerciseId);
  if (!exercise) {
    throw new SandboxError(404, 'EXERCISE_NOT_FOUND', `Exercise not found: ${input.exerciseId}`);
  }

  // 2. Entitlement.
  const ent = await checkEntitlement(input.identity, exercise.entitlement);
  if (!ent.allowed) {
    throw new SandboxError(403, 'NOT_ENTITLED', ent.reason ?? 'not_entitled');
  }

  // 3. Provider selection.
  const requestedProvider = input.provider ?? exercise.defaultProvider;
  if (
    requestedProvider !== exercise.defaultProvider &&
    !exercise.allowProviderSwitch
  ) {
    throw new SandboxError(400, 'PROVIDER_SWITCH_DISALLOWED', 'Provider switch not allowed');
  }

  // 4. Rate limit (stub in Wave 1b).
  const decision = await getRateLimiter().check({
    identity: input.identity,
    exerciseId: input.exerciseId,
    provider: requestedProvider,
    ipAddress: input.ipAddress,
  });
  if (!decision.allowed) {
    throw new SandboxError(429, 'RATE_LIMITED', decision.reason ?? 'rate_limited');
  }

  // 5. Assemble prompt.
  let assembled;
  try {
    assembled = assemblePrompt({
      exercise,
      leverSelections: input.leverSelections,
      dataSlotValues: input.dataSlotValues,
      presetIds: input.presetIds,
    });
  } catch (err) {
    if (err instanceof AssemblyError) {
      throw new SandboxError(400, err.code, err.message);
    }
    throw err;
  }

  // 6. Dispatch with failover.
  const useAnonModel = input.identity.learnerId === null;
  let providerResponse;
  let providerUsed: ProviderName = requestedProvider;
  let providerFailed = false;
  try {
    providerResponse = await dispatch({
      request: {
        system: assembled.system,
        userContent: assembled.userContent,
        maxTokens: exercise.gating.maxOutputTokens,
        temperature: DEFAULT_TEMPERATURE,
      },
      preferredProvider: requestedProvider,
      useAnonModel,
    });
    providerUsed = providerResponse.provider;
  } catch (err) {
    if (err instanceof AllProvidersFailedError) {
      providerFailed = true;
      providerResponse = { outputText: '', tokensUsed: 0, provider: requestedProvider };
    } else {
      throw err;
    }
  }

  // 7. Output gate.
  const gated = providerFailed
    ? {
        outputText: SAFE_FALLBACK_MESSAGE,
        flagged: true,
        flagReasons: ['all_providers_failed'],
      }
    : runOutputGate({
        rawOutput: providerResponse.outputText,
        gating: exercise.gating,
      });

  // 8. Log session.
  const sessionId = await logSession({
    identity: input.identity,
    exerciseId: exercise.id,
    lessonId: exercise.lessonId,
    mode: 'single',
    provider: providerUsed,
    leverSelections: input.leverSelections,
    presetIds: input.presetIds,
    tokens: providerResponse.tokensUsed,
    flagged: gated.flagged,
    flagReasons: gated.flagReasons,
  });

  return {
    sessionId,
    provider: providerUsed,
    outputText: gated.outputText,
    tokensUsed: providerResponse.tokensUsed,
    flagged: gated.flagged,
  };
}

interface LogSessionInput {
  identity: LearnerIdentity;
  exerciseId: string;
  lessonId: string | null;
  mode: 'single' | 'ab' | 'skill';
  provider: ProviderName;
  leverSelections: Record<string, string>;
  presetIds: string[];
  tokens: number;
  flagged: boolean;
  flagReasons: string[];
}

async function logSession(input: LogSessionInput): Promise<string> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('sandbox_sessions')
    .insert({
      learner_id: input.identity.learnerId,
      anon_session_id: input.identity.anonSessionId,
      exercise_id: input.exerciseId,
      lesson_id: input.lessonId,
      mode: input.mode,
      provider: input.provider,
      lever_selections: input.leverSelections,
      preset_ids: input.presetIds,
      tokens: input.tokens,
      flagged: input.flagged,
      flag_reasons: input.flagReasons.length > 0 ? input.flagReasons : null,
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    // Don't fail the user-facing request if logging fails; surface via server logs.
    console.error('sandbox-service: failed to log session', error);
    return 'unlogged';
  }
  return data.id;
}
