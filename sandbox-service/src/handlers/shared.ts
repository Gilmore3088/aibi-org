/**
 * Shared helpers for /sandbox/run, /sandbox/ab, /skill/run. Centralizes the
 * assemble → dispatch (with circuit breaker) → output-gate → log → spend-bump
 * loop so the three handlers can't drift from each other.
 */

import { assemblePrompt, AssemblyError } from '../exercises/assembler';
import { piiCheck } from '../exercises/piiCheck';
import {
  AllProvidersFailedError,
  dispatch,
  type DispatchResult,
} from '../gateway';
import { runOutputGate, SAFE_FALLBACK_MESSAGE } from '../gate/pipeline';
import { getConfig } from '../config';
import {
  getOpenCircuits,
  recordSpend,
} from '../rateLimit';
import { estimateCostUsd } from '../observability/cost';
import { getServiceClient } from '../supabase';
import type {
  Exercise,
  ExerciseMode,
  LearnerIdentity,
  ProviderName,
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

const DEFAULT_TEMPERATURE = 0.4;

export interface ExecuteInput {
  exercise: Exercise;
  identity: LearnerIdentity;
  leverSelections: Record<string, string>;
  dataSlotValues: Record<string, string>;
  presetIds: string[];
  requestedProvider: ProviderName;
}

export interface ExecuteResult {
  provider: ProviderName;
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
  flagReasons: string[];
  estCostUsd: number;
}

/** Run PII patterns over every slot value that has piiCheck:true on its descriptor. */
export function enforcePiiPolicy(input: ExecuteInput): void {
  for (const slot of input.exercise.dataSlots) {
    if (!slot.piiCheck) continue;
    const v = input.dataSlotValues[slot.key];
    if (!v) continue;
    const { hits } = piiCheck(v);
    if (hits.length > 0) {
      throw new SandboxError(
        400,
        'PII_REJECTED',
        `Data slot '${slot.key}' appears to contain ${hits.join(', ')}. Use realistic synthetic material only.`,
      );
    }
  }
}

export function validateProviderSwitch(
  exercise: Exercise,
  requestedProvider: ProviderName,
): void {
  if (
    requestedProvider !== exercise.defaultProvider &&
    !exercise.allowProviderSwitch
  ) {
    throw new SandboxError(
      400,
      'PROVIDER_SWITCH_DISALLOWED',
      'Provider switch not allowed',
    );
  }
}

/**
 * Assemble + dispatch + gate. Honors the daily-budget circuit breaker by
 * preferring providers that are still under budget; if every provider is
 * over budget, returns the safe fallback flagged=true.
 */
export async function executeOnce(input: ExecuteInput): Promise<ExecuteResult> {
  // Assemble
  let assembled;
  try {
    assembled = assemblePrompt({
      exercise: input.exercise,
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

  // Circuit breaker — find a provider that's still under daily budget.
  const cfg = getConfig();
  const open = await getOpenCircuits(cfg.providerPriority);
  let preferred: ProviderName = input.requestedProvider;
  if (open.has(preferred)) {
    const fallback = cfg.providerPriority.find((p) => !open.has(p));
    if (!fallback) {
      // Every provider is over budget → trip the breaker entirely.
      return {
        provider: preferred,
        outputText: SAFE_FALLBACK_MESSAGE,
        tokensUsed: 0,
        flagged: true,
        flagReasons: ['daily_budget_exhausted'],
        estCostUsd: 0,
      };
    }
    preferred = fallback;
  }

  const useAnonModel = input.identity.learnerId === null;
  let dispatched: DispatchResult | undefined;
  let providerFailed = false;
  try {
    dispatched = await dispatch({
      request: {
        system: assembled.system,
        userContent: assembled.userContent,
        maxTokens: input.exercise.gating.maxOutputTokens,
        temperature: DEFAULT_TEMPERATURE,
      },
      preferredProvider: preferred,
      useAnonModel,
    });
  } catch (err) {
    if (err instanceof AllProvidersFailedError) {
      providerFailed = true;
    } else {
      throw err;
    }
  }

  const providerUsed: ProviderName = dispatched?.provider ?? preferred;
  const tokensUsed = dispatched?.tokensUsed ?? 0;

  const gated = providerFailed
    ? {
        outputText: SAFE_FALLBACK_MESSAGE,
        flagged: true,
        flagReasons: ['all_providers_failed'],
      }
    : runOutputGate({
        rawOutput: dispatched?.outputText ?? '',
        gating: input.exercise.gating,
      });

  // Cost estimate + spend record (best-effort; never blocks the response).
  const providerCfg = cfg.providers[providerUsed];
  const modelUsed = useAnonModel ? providerCfg.anonModel : providerCfg.defaultModel;
  const estCostUsd = estimateCostUsd(providerUsed, modelUsed, tokensUsed);
  if (estCostUsd > 0) {
    recordSpend(providerUsed, estCostUsd).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('sandbox-service: failed to record spend', err);
    });
  }

  return {
    provider: providerUsed,
    outputText: gated.outputText,
    tokensUsed,
    flagged: gated.flagged,
    flagReasons: gated.flagReasons,
    estCostUsd,
  };
}

export interface LogSessionInput {
  identity: LearnerIdentity;
  exerciseId: string;
  lessonId: string | null;
  mode: ExerciseMode;
  provider: ProviderName;
  leverSelections: Record<string, string>;
  presetIds: string[];
  tokens: number;
  estCostUsd: number;
  flagged: boolean;
  flagReasons: string[];
}

export async function logSession(input: LogSessionInput): Promise<string> {
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
      est_cost_usd: input.estCostUsd,
      flagged: input.flagged,
      flag_reasons: input.flagReasons.length > 0 ? input.flagReasons : null,
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('sandbox-service: failed to log session', error);
    return 'unlogged';
  }
  return data.id;
}
