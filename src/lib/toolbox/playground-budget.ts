import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

// Placeholders per spec §10.1 — calibrate from real usage.
// Update in lockstep with the per-call rate limit numbers in
// src/app/api/toolbox/run/route.ts and stream/route.ts.
export const DAILY_CAP_CENTS = 50;     // $0.50 / learner / day
export const MONTHLY_CAP_CENTS = 1000; // $10   / learner / month

interface UsageSummary {
  readonly todayCents: number;
  readonly monthCents: number;
}

function startOfUtcDayIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

function startOfUtcMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getUsageForUser(userId: string): Promise<UsageSummary> {
  if (!isSupabaseConfigured()) return { todayCents: 0, monthCents: 0 };
  const client = createServiceRoleClient();

  const today = await client
    .from('ai_usage_log')
    .select('total_cents:cost_cents.sum()')
    .eq('user_id', userId)
    .gte('created_at', startOfUtcDayIso());
  const month = await client
    .from('ai_usage_log')
    .select('total_cents:cost_cents.sum()')
    .eq('user_id', userId)
    .gte('created_at', startOfUtcMonthIso());

  const todayRow = today.data?.[0] as { total_cents?: number } | undefined;
  const monthRow = month.data?.[0] as { total_cents?: number } | undefined;
  return {
    todayCents: todayRow?.total_cents ?? 0,
    monthCents: monthRow?.total_cents ?? 0,
  };
}
