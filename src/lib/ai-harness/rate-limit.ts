// Rate limiting + cost tracking backed by Supabase ai_usage_log.
// checkRateLimit is called BEFORE the AI call.
// logUsage is called AFTER (on success, error, or rate-limit rejection).

import { createHash } from 'node:crypto';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ProviderName, LLMErrorKind } from './types';

export function hashIp(ip: string): string {
  const salt = process.env.TOOLBOX_IP_HASH_SALT ?? '';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export interface PerMinuteLimits {
  readonly perUserPerMinute: number;
  readonly perIpPerMinute: number;
}

export interface PerMinuteDecision {
  readonly allowed: boolean;
  readonly reason?: 'per-user-per-minute-exceeded' | 'per-ip-per-minute-exceeded';
  readonly retryAfterSeconds?: number;
}

function sixtySecondsAgoIso(): string {
  return new Date(Date.now() - 60_000).toISOString();
}

export async function checkPerMinuteLimits(params: {
  readonly userId: string;
  readonly ipHash: string;
  readonly limits: PerMinuteLimits;
}): Promise<PerMinuteDecision> {
  if (!isSupabaseConfigured()) return { allowed: true };
  const client = createServiceRoleClient();
  const since = sixtySecondsAgoIso();

  const { count: userCount, error: userErr } = await client
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', params.userId)
    .gte('created_at', since);
  if (userErr) return { allowed: true };
  if ((userCount ?? 0) >= params.limits.perUserPerMinute) {
    return { allowed: false, reason: 'per-user-per-minute-exceeded', retryAfterSeconds: 60 };
  }

  const { count: ipCount, error: ipErr } = await client
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', params.ipHash)
    .gte('created_at', since);
  if (ipErr) return { allowed: true };
  if ((ipCount ?? 0) >= params.limits.perIpPerMinute) {
    return { allowed: false, reason: 'per-ip-per-minute-exceeded', retryAfterSeconds: 60 };
  }

  return { allowed: true };
}

export interface RateLimits {
  readonly perLearnerDaily?: number;      // max calls per user per UTC day
  readonly perCourseDailyCents?: number;  // max total cost (cents) per course per UTC day
}

export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly reason?: 'per-learner-exceeded' | 'per-course-budget-exceeded';
  readonly retryAfterSeconds?: number;
}

function secondsUntilUtcMidnight(): number {
  const now = new Date();
  const tomorrowUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0),
  );
  return Math.ceil((tomorrowUtc.getTime() - now.getTime()) / 1000);
}

function startOfUtcDayIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0),
  ).toISOString();
}

export async function checkRateLimit(params: {
  readonly userId: string;
  readonly courseSlug: string;
  readonly featureId: string;
  readonly limits: RateLimits;
}): Promise<RateLimitDecision> {
  if (!isSupabaseConfigured()) {
    // Fail open in dev when Supabase is unconfigured
    return { allowed: true };
  }

  const client = createServiceRoleClient();
  const since = startOfUtcDayIso();

  // Per-learner check
  if (params.limits.perLearnerDaily !== undefined) {
    const { count, error } = await client
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', params.userId)
      .eq('feature_id', params.featureId)
      .eq('status', 'succeeded')
      .gte('created_at', since);

    if (error) {
      console.error('[rate-limit] per-learner query failed:', error);
      return { allowed: true }; // fail open — don't block users on DB errors
    }
    if ((count ?? 0) >= params.limits.perLearnerDaily) {
      return {
        allowed: false,
        reason: 'per-learner-exceeded',
        retryAfterSeconds: secondsUntilUtcMidnight(),
      };
    }
  }

  // Per-course budget check
  if (params.limits.perCourseDailyCents !== undefined) {
    const { data, error } = await client
      .from('ai_usage_log')
      .select('cost_cents')
      .eq('course_slug', params.courseSlug)
      .eq('status', 'succeeded')
      .gte('created_at', since);

    if (error) {
      console.error('[rate-limit] per-course query failed:', error);
      return { allowed: true };
    }
    const totalCents = (data ?? []).reduce(
      (acc: number, row: { cost_cents: number | null }) => acc + (row.cost_cents ?? 0),
      0,
    );
    if (totalCents >= params.limits.perCourseDailyCents) {
      return {
        allowed: false,
        reason: 'per-course-budget-exceeded',
        retryAfterSeconds: secondsUntilUtcMidnight(),
      };
    }
  }

  return { allowed: true };
}

export async function logUsage(params: {
  readonly userId: string | null;
  readonly courseSlug: string;
  readonly featureId: string;
  readonly provider: ProviderName;
  readonly model: string;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly costCents?: number;
  readonly status: 'succeeded' | 'rate-limited' | 'errored';
  readonly errorKind?: LLMErrorKind;
  readonly ipHash?: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = createServiceRoleClient();
  const { error } = await client.from('ai_usage_log').insert({
    user_id: params.userId,
    course_slug: params.courseSlug,
    feature_id: params.featureId,
    provider: params.provider,
    model: params.model,
    input_tokens: params.inputTokens ?? null,
    output_tokens: params.outputTokens ?? null,
    cost_cents: params.costCents ?? null,
    status: params.status,
    error_kind: params.errorKind ?? null,
    ip_hash: params.ipHash ?? null,
  });
  if (error) {
    console.error('[rate-limit] logUsage insert failed:', error);
  }
}
