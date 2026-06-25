import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const PUBLIC_PLAYGROUND_FEATURE_ID = 'playground-public';
export const PUBLIC_PLAYGROUND_COURSE_SLUG = 'public-playground';

// Provider + model for the public playground demo. These two constants are the
// single source of truth: the run route reads them to pick the LLM client and
// price the call, so the env key that must be set is provider-driven —
// 'openai' requires OPENAI_API_KEY, 'anthropic' requires ANTHROPIC_API_KEY.
// The chosen provider must stay in sync with whichever key is configured in
// Vercel for the production playground.
export const PUBLIC_PLAYGROUND_PROVIDER = 'openai' as const;
export const PUBLIC_PLAYGROUND_MODEL = 'gpt-4o-mini';

export const DEFAULT_PUBLIC_PLAYGROUND_PER_IP_PER_MINUTE = 1;
export const DEFAULT_PUBLIC_PLAYGROUND_PER_IP_PER_DAY = 5;
export const DEFAULT_PUBLIC_PLAYGROUND_DAILY_CAP_CENTS = 200;

export interface PublicPlaygroundLimits {
  readonly perIpPerMinute: number;
  readonly perIpPerDay: number;
  readonly dailyCapCents: number;
}

export interface PublicPlaygroundBudgetDecision {
  readonly allowed: boolean;
  readonly reason?:
    | 'per-ip-per-minute-exceeded'
    | 'per-ip-per-day-exceeded'
    | 'daily-budget-exceeded'
    | 'budget-check-unavailable';
  readonly retryAfterSeconds?: number;
}

function parsePositiveInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function resolvePublicPlaygroundLimits(): PublicPlaygroundLimits {
  return {
    perIpPerMinute: parsePositiveInteger(
      process.env.PUBLIC_PLAYGROUND_PER_IP_PER_MINUTE,
      DEFAULT_PUBLIC_PLAYGROUND_PER_IP_PER_MINUTE,
      1,
      20,
    ),
    perIpPerDay: parsePositiveInteger(
      process.env.PUBLIC_PLAYGROUND_PER_IP_PER_DAY,
      DEFAULT_PUBLIC_PLAYGROUND_PER_IP_PER_DAY,
      1,
      100,
    ),
    dailyCapCents: parsePositiveInteger(
      process.env.PUBLIC_PLAYGROUND_DAILY_CAP_CENTS,
      DEFAULT_PUBLIC_PLAYGROUND_DAILY_CAP_CENTS,
      1,
      50_000,
    ),
  };
}

function isoSecondsAgo(seconds: number): string {
  return new Date(Date.now() - seconds * 1000).toISOString();
}

function startOfUtcDayIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function secondsUntilUtcMidnight(): number {
  const now = new Date();
  const tomorrowUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0),
  );
  return Math.ceil((tomorrowUtc.getTime() - now.getTime()) / 1000);
}

async function countRecent(params: {
  readonly ipHash: string;
  readonly sinceIso: string;
}): Promise<number | null> {
  const client = createServiceRoleClient();
  const { count, error } = await client
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('feature_id', PUBLIC_PLAYGROUND_FEATURE_ID)
    .eq('ip_hash', params.ipHash)
    .gte('created_at', params.sinceIso);

  if (error) {
    console.error('[playground-public] count query failed:', error);
    return null;
  }
  return count ?? 0;
}

async function dailyCostCents(): Promise<number | null> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('ai_usage_log')
    .select('cost_cents')
    .eq('feature_id', PUBLIC_PLAYGROUND_FEATURE_ID)
    .eq('status', 'succeeded')
    .gte('created_at', startOfUtcDayIso());

  if (error) {
    console.error('[playground-public] budget query failed:', error);
    return null;
  }

  return (data ?? []).reduce(
    (sum: number, row: { cost_cents: number | string | null }) => sum + Number(row.cost_cents ?? 0),
    0,
  );
}

export async function checkPublicPlaygroundBudget(
  ipHash: string,
  limits: PublicPlaygroundLimits = resolvePublicPlaygroundLimits(),
): Promise<PublicPlaygroundBudgetDecision> {
  if (!isSupabaseConfigured()) {
    return process.env.NODE_ENV === 'production'
      ? { allowed: false, reason: 'budget-check-unavailable', retryAfterSeconds: 300 }
      : { allowed: true };
  }

  const perMinuteCount = await countRecent({ ipHash, sinceIso: isoSecondsAgo(60) });
  if (perMinuteCount === null) {
    return { allowed: false, reason: 'budget-check-unavailable', retryAfterSeconds: 300 };
  }
  if (perMinuteCount >= limits.perIpPerMinute) {
    return { allowed: false, reason: 'per-ip-per-minute-exceeded', retryAfterSeconds: 60 };
  }

  const perDayCount = await countRecent({ ipHash, sinceIso: startOfUtcDayIso() });
  if (perDayCount === null) {
    return { allowed: false, reason: 'budget-check-unavailable', retryAfterSeconds: 300 };
  }
  if (perDayCount >= limits.perIpPerDay) {
    return {
      allowed: false,
      reason: 'per-ip-per-day-exceeded',
      retryAfterSeconds: secondsUntilUtcMidnight(),
    };
  }

  const totalCents = await dailyCostCents();
  if (totalCents === null) {
    return { allowed: false, reason: 'budget-check-unavailable', retryAfterSeconds: 300 };
  }
  if (totalCents >= limits.dailyCapCents) {
    return {
      allowed: false,
      reason: 'daily-budget-exceeded',
      retryAfterSeconds: secondsUntilUtcMidnight(),
    };
  }

  return { allowed: true };
}
