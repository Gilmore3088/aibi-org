import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { PUBLIC_PLAYGROUND_FEATURE_ID } from './public-budget';

export type PlaygroundUsageRange = '7d' | '30d' | '90d';

export interface PlaygroundUsageRow {
  readonly id: string;
  readonly provider: string;
  readonly model: string;
  readonly input_tokens: number | null;
  readonly output_tokens: number | null;
  readonly cost_cents: number | string | null;
  readonly status: 'succeeded' | 'rate-limited' | 'errored' | string;
  readonly error_kind: string | null;
  readonly ip_hash: string | null;
  readonly created_at: string;
}

export interface PlaygroundUsageTopIp {
  readonly ipHash: string;
  readonly calls: number;
  readonly succeeded: number;
  readonly rateLimited: number;
  readonly errored: number;
  readonly costCents: number;
  readonly lastSeenAt: string;
}

export interface PlaygroundUsageDay {
  readonly day: string;
  readonly calls: number;
  readonly succeeded: number;
  readonly rateLimited: number;
  readonly errored: number;
  readonly costCents: number;
}

export interface PlaygroundUsageMetrics {
  readonly range: PlaygroundUsageRange;
  readonly startIso: string;
  readonly calls: number;
  readonly succeeded: number;
  readonly rateLimited: number;
  readonly errored: number;
  readonly uniqueIpHashes: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costCents: number;
  readonly topIps: readonly PlaygroundUsageTopIp[];
  readonly byDay: readonly PlaygroundUsageDay[];
  readonly recent: readonly PlaygroundUsageRow[];
}

export function parsePlaygroundUsageRange(value: string | null | undefined): PlaygroundUsageRange {
  return value === '7d' || value === '90d' ? value : '30d';
}

function rangeDays(range: PlaygroundUsageRange): number {
  return range === '7d' ? 7 : range === '90d' ? 90 : 30;
}

export function playgroundUsageStartIso(range: PlaygroundUsageRange, now: Date = new Date()): string {
  return new Date(now.getTime() - rangeDays(range) * 86_400_000).toISOString();
}

function cents(value: number | string | null): number {
  return Number(value ?? 0);
}

export function calculatePlaygroundUsageMetrics(params: {
  readonly range: PlaygroundUsageRange;
  readonly startIso: string;
  readonly rows: readonly PlaygroundUsageRow[];
}): PlaygroundUsageMetrics {
  const topIpMap = new Map<string, PlaygroundUsageTopIp>();
  const dayMap = new Map<string, PlaygroundUsageDay>();
  const ipHashes = new Set<string>();
  let succeeded = 0;
  let rateLimited = 0;
  let errored = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let costCents = 0;

  for (const row of params.rows) {
    const rowCost = cents(row.cost_cents);
    const isSucceeded = row.status === 'succeeded';
    const isRateLimited = row.status === 'rate-limited';
    const isErrored = row.status === 'errored';

    if (isSucceeded) succeeded += 1;
    if (isRateLimited) rateLimited += 1;
    if (isErrored) errored += 1;
    inputTokens += row.input_tokens ?? 0;
    outputTokens += row.output_tokens ?? 0;
    costCents += rowCost;

    const day = row.created_at.slice(0, 10);
    const existingDay = dayMap.get(day) ?? {
      day,
      calls: 0,
      succeeded: 0,
      rateLimited: 0,
      errored: 0,
      costCents: 0,
    };
    dayMap.set(day, {
      ...existingDay,
      calls: existingDay.calls + 1,
      succeeded: existingDay.succeeded + (isSucceeded ? 1 : 0),
      rateLimited: existingDay.rateLimited + (isRateLimited ? 1 : 0),
      errored: existingDay.errored + (isErrored ? 1 : 0),
      costCents: existingDay.costCents + rowCost,
    });

    if (!row.ip_hash) continue;
    ipHashes.add(row.ip_hash);
    const existingIp = topIpMap.get(row.ip_hash) ?? {
      ipHash: row.ip_hash,
      calls: 0,
      succeeded: 0,
      rateLimited: 0,
      errored: 0,
      costCents: 0,
      lastSeenAt: row.created_at,
    };
    topIpMap.set(row.ip_hash, {
      ...existingIp,
      calls: existingIp.calls + 1,
      succeeded: existingIp.succeeded + (isSucceeded ? 1 : 0),
      rateLimited: existingIp.rateLimited + (isRateLimited ? 1 : 0),
      errored: existingIp.errored + (isErrored ? 1 : 0),
      costCents: existingIp.costCents + rowCost,
      lastSeenAt: row.created_at > existingIp.lastSeenAt ? row.created_at : existingIp.lastSeenAt,
    });
  }

  return {
    range: params.range,
    startIso: params.startIso,
    calls: params.rows.length,
    succeeded,
    rateLimited,
    errored,
    uniqueIpHashes: ipHashes.size,
    inputTokens,
    outputTokens,
    costCents,
    topIps: Array.from(topIpMap.values())
      .sort((a, b) => b.calls - a.calls || b.costCents - a.costCents)
      .slice(0, 20),
    byDay: Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day)),
    recent: params.rows.slice(0, 100),
  };
}

export async function getPublicPlaygroundUsageMetrics(
  range: PlaygroundUsageRange,
): Promise<PlaygroundUsageMetrics> {
  const startIso = playgroundUsageStartIso(range);
  if (!isSupabaseConfigured()) {
    return calculatePlaygroundUsageMetrics({ range, startIso, rows: [] });
  }

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('ai_usage_log')
    .select('id, provider, model, input_tokens, output_tokens, cost_cents, status, error_kind, ip_hash, created_at')
    .eq('feature_id', PUBLIC_PLAYGROUND_FEATURE_ID)
    .gte('created_at', startIso)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(error.message);
  }

  return calculatePlaygroundUsageMetrics({
    range,
    startIso,
    rows: (data ?? []) as unknown as PlaygroundUsageRow[],
  });
}
