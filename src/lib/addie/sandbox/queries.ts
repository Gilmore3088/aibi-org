// Server-side aggregations for /admin/sandbox. Reads addie.sandbox_sessions
// + addie.sandbox_spend via the service-role client (addie.* is not exposed
// to anon/authenticated keys — see migration 00037 + 00055).
//
// All functions return tight DTOs. Errors are caught and surfaced as
// `error` so panels can render an inline state rather than crashing the
// page.

import { getAddieServiceClient } from '@/lib/addie/supabase/service';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// Daily budget cap. Read at request time so a Vercel env change is picked
// up without a redeploy. Default keeps the surface usable when unset.
function dailyBudgetUsd(): number {
  const raw = process.env.SANDBOX_DAILY_BUDGET_USD;
  if (!raw) return 20;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

// ---------- Today's spend + daily trend ----------

export interface SpendDay {
  readonly day: string;            // YYYY-MM-DD
  readonly totalUsd: number;
}

export interface ProviderSpend {
  readonly provider: 'anthropic' | 'openai' | 'google';
  readonly todayUsd: number;
  readonly pctOfCap: number;       // 0–100+ (>100 = over cap)
}

export interface SpendDTO {
  readonly capUsd: number;
  readonly today: string;
  readonly totalTodayUsd: number;
  readonly perProvider: readonly ProviderSpend[];
  readonly trend: readonly SpendDay[];   // last 7 days incl. today, oldest→newest
  readonly monthToDateUsd: number;
  readonly error: string | null;
}

export async function loadSandboxSpend(windowDays = 7): Promise<SpendDTO> {
  const cap = dailyBudgetUsd();
  const today = todayUTC();
  try {
    const svc = getAddieServiceClient();
    const firstOfMonth = today.slice(0, 8) + '01';

    const { data, error } = await svc
      .from('sandbox_spend')
      .select('spend_date, provider, spend_usd')
      .gte('spend_date', firstOfMonth);
    if (error) throw error;

    const rows = (data ?? []) as { spend_date: string; provider: string; spend_usd: number | string }[];

    // Per-provider today
    const providers: Array<'anthropic' | 'openai' | 'google'> = ['anthropic', 'openai', 'google'];
    const perProvider: ProviderSpend[] = providers.map((p) => {
      const row = rows.find((r) => r.spend_date === today && r.provider === p);
      const todayUsd = row ? Number(row.spend_usd) : 0;
      return {
        provider: p,
        todayUsd,
        pctOfCap: cap > 0 ? Math.round((todayUsd / cap) * 1000) / 10 : 0,
      };
    });
    const totalTodayUsd = perProvider.reduce((s, p) => s + p.todayUsd, 0);

    // Trend: last `windowDays` days incl. today
    const trend: SpendDay[] = [];
    for (let i = windowDays - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
      const totalUsd = rows
        .filter((r) => r.spend_date === day)
        .reduce((s, r) => s + Number(r.spend_usd), 0);
      trend.push({ day, totalUsd });
    }

    const monthToDateUsd = rows.reduce((s, r) => s + Number(r.spend_usd), 0);

    return {
      capUsd: cap,
      today,
      totalTodayUsd,
      perProvider,
      trend,
      monthToDateUsd,
      error: null,
    };
  } catch (err) {
    return {
      capUsd: cap,
      today,
      totalTodayUsd: 0,
      perProvider: [],
      trend: [],
      monthToDateUsd: 0,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ---------- Session volume ----------

export interface SandboxVolumeDTO {
  readonly windowDays: number;
  readonly total: number;
  readonly byMode: { single: number; ab: number; skill: number };
  readonly anonCount: number;
  readonly authCount: number;
  readonly totalTokens: number;
  readonly totalEstCostUsd: number;
  readonly error: string | null;
}

export async function loadSandboxVolume(windowDays = 7): Promise<SandboxVolumeDTO> {
  const since = daysAgoISO(windowDays);
  try {
    const svc = getAddieServiceClient();
    const { data, error } = await svc
      .from('sandbox_sessions')
      .select('mode, learner_id, anon_session_id, tokens, est_cost_usd')
      .gte('created_at', since);
    if (error) throw error;

    const rows = (data ?? []) as {
      mode: 'single' | 'ab' | 'skill';
      learner_id: string | null;
      anon_session_id: string | null;
      tokens: number | null;
      est_cost_usd: number | string | null;
    }[];

    const byMode = { single: 0, ab: 0, skill: 0 };
    let anonCount = 0;
    let authCount = 0;
    let totalTokens = 0;
    let totalEstCostUsd = 0;
    for (const r of rows) {
      if (r.mode === 'single' || r.mode === 'ab' || r.mode === 'skill') byMode[r.mode]++;
      if (r.learner_id) authCount++;
      else if (r.anon_session_id) anonCount++;
      totalTokens += r.tokens ?? 0;
      totalEstCostUsd += r.est_cost_usd ? Number(r.est_cost_usd) : 0;
    }
    return {
      windowDays,
      total: rows.length,
      byMode,
      anonCount,
      authCount,
      totalTokens,
      totalEstCostUsd,
      error: null,
    };
  } catch (err) {
    return {
      windowDays,
      total: 0,
      byMode: { single: 0, ab: 0, skill: 0 },
      anonCount: 0,
      authCount: 0,
      totalTokens: 0,
      totalEstCostUsd: 0,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ---------- Flagged sessions ----------

export interface FlaggedSession {
  readonly id: string;
  readonly created_at: string;
  readonly exercise_id: string;
  readonly mode: string;
  readonly provider: string;
  readonly reasons: readonly string[];
  readonly identity: 'anon' | 'auth';
}

export interface FlaggedDTO {
  readonly windowDays: number;
  readonly totalFlagged: number;
  readonly recent: readonly FlaggedSession[];
  readonly error: string | null;
}

export async function loadFlaggedSessions(windowDays = 7, limit = 20): Promise<FlaggedDTO> {
  const since = daysAgoISO(windowDays);
  try {
    const svc = getAddieServiceClient();
    const { count, error: cErr } = await svc
      .from('sandbox_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)
      .eq('flagged', true);
    if (cErr) throw cErr;

    const { data, error } = await svc
      .from('sandbox_sessions')
      .select('id, created_at, exercise_id, mode, provider, flag_reasons, learner_id, anon_session_id')
      .gte('created_at', since)
      .eq('flagged', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;

    const recent: FlaggedSession[] = (data ?? []).map((row) => {
      const r = row as {
        id: string;
        created_at: string;
        exercise_id: string;
        mode: string;
        provider: string;
        flag_reasons: unknown;
        learner_id: string | null;
        anon_session_id: string | null;
      };
      const reasons = normalizeReasons(r.flag_reasons);
      return {
        id: r.id,
        created_at: r.created_at,
        exercise_id: r.exercise_id,
        mode: r.mode,
        provider: r.provider,
        reasons,
        identity: r.learner_id ? 'auth' : 'anon',
      };
    });
    return {
      windowDays,
      totalFlagged: count ?? 0,
      recent,
      error: null,
    };
  } catch (err) {
    return {
      windowDays,
      totalFlagged: 0,
      recent: [],
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

function normalizeReasons(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === 'string');
  if (raw && typeof raw === 'object') return Object.keys(raw as Record<string, unknown>);
  if (typeof raw === 'string') return [raw];
  return [];
}

// ---------- Top exercises by spend ----------

export interface ExerciseSpend {
  readonly exercise_id: string;
  readonly sessions: number;
  readonly totalUsd: number;
  readonly avgUsd: number;
}

export interface TopExercisesDTO {
  readonly windowDays: number;
  readonly rows: readonly ExerciseSpend[];
  readonly error: string | null;
}

export async function loadTopExercisesBySpend(windowDays = 7, limit = 10): Promise<TopExercisesDTO> {
  const since = daysAgoISO(windowDays);
  try {
    const svc = getAddieServiceClient();
    const { data, error } = await svc
      .from('sandbox_sessions')
      .select('exercise_id, est_cost_usd')
      .gte('created_at', since);
    if (error) throw error;

    const map = new Map<string, { sessions: number; totalUsd: number }>();
    for (const row of data ?? []) {
      const r = row as { exercise_id: string; est_cost_usd: number | string | null };
      const cur = map.get(r.exercise_id) ?? { sessions: 0, totalUsd: 0 };
      cur.sessions += 1;
      cur.totalUsd += r.est_cost_usd ? Number(r.est_cost_usd) : 0;
      map.set(r.exercise_id, cur);
    }
    const rows = Array.from(map.entries())
      .map(([exercise_id, v]) => ({
        exercise_id,
        sessions: v.sessions,
        totalUsd: v.totalUsd,
        avgUsd: v.sessions > 0 ? v.totalUsd / v.sessions : 0,
      }))
      .sort((a, b) => b.totalUsd - a.totalUsd)
      .slice(0, limit);

    return { windowDays, rows, error: null };
  } catch (err) {
    return {
      windowDays,
      rows: [],
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}
