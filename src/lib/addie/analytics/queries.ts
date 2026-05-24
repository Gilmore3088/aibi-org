// Server-side aggregations for /admin/analytics. Reads addie.events,
// addie.leads, addie.entitlements, addie.toolbox_items, addie.sales_leads
// through the service-role client (the addie schema is not exposed to
// anon/authenticated keys — see migration 00037 + 00055).
//
// All functions return tight DTOs. No raw DB shape leaks to pages.
// Errors are caught and surfaced as `error` on the DTO so panels can
// render an inline error state rather than crashing the page.

// Server-only by virtue of importing the service-role client.
import { getAddieServiceClient } from '@/lib/addie/supabase/service';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function startOfDayUTC(d: Date): Date {
  const c = new Date(d);
  c.setUTCHours(0, 0, 0, 0);
  return c;
}

function pct(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return Math.round((num / denom) * 1000) / 10;
}

// ---------- Funnel (30 days) ----------

export interface FunnelStep {
  readonly label: string;
  readonly count: number;
  readonly pctOfStart: number;
}

export interface FunnelDTO {
  readonly windowDays: number;
  readonly steps: readonly FunnelStep[];
  readonly gateForks: { readonly paid: number; readonly email: number; readonly decline: number };
  readonly error: string | null;
}

export async function loadFunnel(windowDays = 30): Promise<FunnelDTO> {
  const since = daysAgoISO(windowDays);
  try {
    const svc = getAddieServiceClient();

    // Distinct anon_session_ids in window = "anonymous sessions" (any event).
    const { data: anon, error: anonErr } = await svc
      .from('events')
      .select('anon_session_id')
      .gte('created_at', since)
      .not('anon_session_id', 'is', null);
    if (anonErr) throw anonErr;
    const anonSet = new Set<string>();
    for (const r of anon ?? []) {
      const id = (r as { anon_session_id: string | null }).anon_session_id;
      if (id) anonSet.add(id);
    }

    // Started M0 — any lesson_view with object_id starting 'm0-' OR action 'm0_started'.
    const startedM0 = await countDistinctAnon(
      svc,
      ['lesson_view', 'm0_started'],
      since,
      (row) => {
        const oid = row.object_id ?? '';
        const act = row.action;
        return act === 'm0_started' || oid.startsWith('m0-') || oid.startsWith('m0_');
      },
    );

    // Completed M3 — lesson_complete with object_id in m3.
    const completedM3 = await countDistinctAnon(
      svc,
      ['lesson_complete'],
      since,
      (row) => {
        const oid = row.object_id ?? '';
        return oid.startsWith('m3-') || oid.startsWith('m3_');
      },
    );

    // Reached gate — any gate_decision event (each user reaches the gate
    // before deciding) OR an explicit 'gate_view' event if we ever add one.
    const reachedGate = await countDistinctAnon(svc, ['gate_decision', 'gate_view'], since);

    // Gate-fork split from gate_decision payload.fork.
    const { data: forks, error: forksErr } = await svc
      .from('events')
      .select('payload, action')
      .eq('action', 'gate_decision')
      .gte('created_at', since);
    if (forksErr) throw forksErr;
    let paid = 0;
    let emailF = 0;
    let decline = 0;
    for (const r of forks ?? []) {
      const fork = (r as { payload: { fork?: string } | null }).payload?.fork;
      if (fork === 'paid') paid++;
      else if (fork === 'email') emailF++;
      else if (fork === 'decline') decline++;
    }

    const startCount = anonSet.size;
    const steps: FunnelStep[] = [
      { label: 'Anonymous sessions', count: startCount, pctOfStart: 100 },
      { label: 'Started M0', count: startedM0, pctOfStart: pct(startedM0, startCount) },
      { label: 'Completed M3', count: completedM3, pctOfStart: pct(completedM3, startCount) },
      { label: 'Reached gate', count: reachedGate, pctOfStart: pct(reachedGate, startCount) },
      { label: 'Made a choice', count: paid + emailF + decline, pctOfStart: pct(paid + emailF + decline, startCount) },
    ];

    return {
      windowDays,
      steps,
      gateForks: { paid, email: emailF, decline },
      error: null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return {
      windowDays,
      steps: [],
      gateForks: { paid: 0, email: 0, decline: 0 },
      error: msg,
    };
  }
}

// Helper: count distinct anon_session_id for events matching a filter.
async function countDistinctAnon(
  svc: ReturnType<typeof getAddieServiceClient>,
  actions: readonly string[],
  since: string,
  predicate?: (row: { action: string; object_id: string | null }) => boolean,
): Promise<number> {
  const { data, error } = await svc
    .from('events')
    .select('anon_session_id, action, object_id')
    .in('action', [...actions])
    .gte('created_at', since)
    .not('anon_session_id', 'is', null);
  if (error) throw error;
  const set = new Set<string>();
  for (const r of data ?? []) {
    const row = r as { anon_session_id: string | null; action: string; object_id: string | null };
    if (!row.anon_session_id) continue;
    if (predicate && !predicate(row)) continue;
    set.add(row.anon_session_id);
  }
  return set.size;
}

// ---------- Gate conversion sparkline (7 days) ----------

export interface GateConversionDay {
  readonly day: string; // ISO date (yyyy-mm-dd)
  readonly paid: number;
  readonly email: number;
  readonly decline: number;
}

export interface GateConversionDTO {
  readonly windowDays: number;
  readonly total: { readonly paid: number; readonly email: number; readonly decline: number };
  readonly pct: { readonly paid: number; readonly email: number; readonly decline: number };
  readonly days: readonly GateConversionDay[];
  readonly error: string | null;
}

export async function loadGateConversion(windowDays = 7): Promise<GateConversionDTO> {
  const since = daysAgoISO(windowDays);
  try {
    const svc = getAddieServiceClient();
    const { data, error } = await svc
      .from('events')
      .select('created_at, payload')
      .eq('action', 'gate_decision')
      .gte('created_at', since);
    if (error) throw error;

    // Seed empty days so the sparkline always has windowDays bars.
    const buckets = new Map<string, { paid: number; email: number; decline: number }>();
    const today = startOfDayUTC(new Date());
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY_MS);
      buckets.set(d.toISOString().slice(0, 10), { paid: 0, email: 0, decline: 0 });
    }

    let paidT = 0;
    let emailT = 0;
    let declineT = 0;
    for (const r of data ?? []) {
      const row = r as { created_at: string; payload: { fork?: string } | null };
      const dayKey = row.created_at.slice(0, 10);
      const b = buckets.get(dayKey);
      const fork = row.payload?.fork;
      if (!b || !fork) continue;
      if (fork === 'paid') {
        b.paid++;
        paidT++;
      } else if (fork === 'email') {
        b.email++;
        emailT++;
      } else if (fork === 'decline') {
        b.decline++;
        declineT++;
      }
    }

    const total = paidT + emailT + declineT;
    return {
      windowDays,
      total: { paid: paidT, email: emailT, decline: declineT },
      pct: { paid: pct(paidT, total), email: pct(emailT, total), decline: pct(declineT, total) },
      days: Array.from(buckets.entries()).map(([day, v]) => ({ day, ...v })),
      error: null,
    };
  } catch (err) {
    return {
      windowDays,
      total: { paid: 0, email: 0, decline: 0 },
      pct: { paid: 0, email: 0, decline: 0 },
      days: [],
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ---------- Toolbox reuse (the L3 metric) ----------

export interface ToolboxReuseDTO {
  readonly savedCount: number;
  readonly reusedCount: number;
  readonly reusePct: number;
  readonly medianTimeToReuseHours: number | null;
  readonly windowLabel: string;
  readonly error: string | null;
}

/**
 * "Re-opened ≥7d after creation". We measure by joining artifact_reuse
 * events against toolbox_items.created_at. Items created in the last 7d
 * cannot possibly qualify, so we restrict the denominator to items
 * older than 7d. Looks back 90d for a representative window.
 */
export async function loadToolboxReuse(): Promise<ToolboxReuseDTO> {
  const windowDays = 90;
  const minAgeDays = 7;
  const cutoffAge = daysAgoISO(minAgeDays);
  const since = daysAgoISO(windowDays);
  try {
    const svc = getAddieServiceClient();
    const { data: items, error: itemsErr } = await svc
      .from('toolbox_items')
      .select('id, created_at')
      .lte('created_at', cutoffAge)
      .gte('created_at', since);
    if (itemsErr) throw itemsErr;

    const savedCount = items?.length ?? 0;
    if (savedCount === 0) {
      return {
        savedCount: 0,
        reusedCount: 0,
        reusePct: 0,
        medianTimeToReuseHours: null,
        windowLabel: `Items saved 7–${windowDays}d ago`,
        error: null,
      };
    }

    const itemMap = new Map<string, Date>();
    for (const r of items ?? []) {
      const row = r as { id: string; created_at: string };
      itemMap.set(row.id, new Date(row.created_at));
    }

    // Reuse events for those items, must occur ≥7d after creation.
    const ids = Array.from(itemMap.keys());
    const { data: reuses, error: reuseErr } = await svc
      .from('events')
      .select('object_id, created_at')
      .eq('action', 'artifact_reuse')
      .in('object_id', ids);
    if (reuseErr) throw reuseErr;

    const firstReuse = new Map<string, Date>();
    for (const r of reuses ?? []) {
      const row = r as { object_id: string; created_at: string };
      const created = itemMap.get(row.object_id);
      if (!created) continue;
      const reuseAt = new Date(row.created_at);
      const ageMs = reuseAt.getTime() - created.getTime();
      if (ageMs < minAgeDays * DAY_MS) continue;
      const existing = firstReuse.get(row.object_id);
      if (!existing || reuseAt < existing) firstReuse.set(row.object_id, reuseAt);
    }

    const reusedCount = firstReuse.size;
    const lagsHours: number[] = [];
    firstReuse.forEach((reuseAt, itemId) => {
      const created = itemMap.get(itemId);
      if (created) lagsHours.push((reuseAt.getTime() - created.getTime()) / (60 * 60 * 1000));
    });
    lagsHours.sort((a, b) => a - b);
    const median =
      lagsHours.length === 0
        ? null
        : Math.round(lagsHours[Math.floor(lagsHours.length / 2)] * 10) / 10;

    return {
      savedCount,
      reusedCount,
      reusePct: pct(reusedCount, savedCount),
      medianTimeToReuseHours: median,
      windowLabel: `Items saved 7–${windowDays}d ago`,
      error: null,
    };
  } catch (err) {
    return {
      savedCount: 0,
      reusedCount: 0,
      reusePct: 0,
      medianTimeToReuseHours: null,
      windowLabel: `Items saved 7–${windowDays}d ago`,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ---------- Lead pipeline (counts + 7-day delta) ----------

export interface PipelineCard {
  readonly label: string;
  readonly count: number;
  readonly delta7d: number;
}

export interface PipelineDTO {
  readonly cards: readonly PipelineCard[];
  readonly error: string | null;
}

export async function loadPipeline(): Promise<PipelineDTO> {
  try {
    const svc = getAddieServiceClient();
    const since7 = daysAgoISO(7);
    const since14 = daysAgoISO(14);

    const [
      { count: leadsAll, error: leadsErrAll },
      { count: leads7, error: leadsErr7 },
      { count: leads14, error: leadsErr14 },
      { count: paidAll, error: paidErrAll },
      { count: paid7, error: paidErr7 },
      { count: paid14, error: paidErr14 },
      { count: salesAll, error: salesErrAll },
      { count: sales7, error: salesErr7 },
      { count: sales14, error: salesErr14 },
    ] = await Promise.all([
      svc.from('leads').select('*', { count: 'exact', head: true }),
      svc.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', since7),
      svc.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', since14),
      svc
        .from('entitlements')
        .select('*', { count: 'exact', head: true })
        .in('product', ['foundation_individual', 'assessment_in_depth']),
      svc
        .from('entitlements')
        .select('*', { count: 'exact', head: true })
        .in('product', ['foundation_individual', 'assessment_in_depth'])
        .gte('created_at', since7),
      svc
        .from('entitlements')
        .select('*', { count: 'exact', head: true })
        .in('product', ['foundation_individual', 'assessment_in_depth'])
        .gte('created_at', since14),
      svc.from('sales_leads').select('*', { count: 'exact', head: true }),
      svc.from('sales_leads').select('*', { count: 'exact', head: true }).gte('created_at', since7),
      svc.from('sales_leads').select('*', { count: 'exact', head: true }).gte('created_at', since14),
    ]);

    const firstErr =
      leadsErrAll ?? leadsErr7 ?? leadsErr14 ?? paidErrAll ?? paidErr7 ?? paidErr14 ?? salesErrAll ?? salesErr7 ?? salesErr14;
    if (firstErr) throw firstErr;

    const delta = (last7: number | null, last14: number | null): number =>
      (last7 ?? 0) - ((last14 ?? 0) - (last7 ?? 0));

    return {
      cards: [
        { label: 'Leads (all time)', count: leadsAll ?? 0, delta7d: delta(leads7, leads14) },
        { label: 'Paid entitlements', count: paidAll ?? 0, delta7d: delta(paid7, paid14) },
        { label: 'Sales inquiries', count: salesAll ?? 0, delta7d: delta(sales7, sales14) },
      ],
      error: null,
    };
  } catch (err) {
    return {
      cards: [],
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ---------- Leads table ----------

export interface LeadRow {
  readonly id: string;
  readonly email: string;
  readonly fi_name: string | null;
  readonly gate_decision: 'paid' | 'email' | 'decline' | null;
  readonly marketing_opt_in: boolean;
  readonly last_activity_at: string | null;
  readonly created_at: string;
}

export interface LeadsPageDTO {
  readonly rows: readonly LeadRow[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly error: string | null;
}

export async function loadLeadsPage(page: number, pageSize = 25): Promise<LeadsPageDTO> {
  const safePage = Math.max(1, Math.floor(page));
  try {
    const svc = getAddieServiceClient();
    const from = (safePage - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await svc
      .from('leads')
      .select('id, email, marketing_opt_in, created_at, bound_user_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;

    const rows: LeadRow[] = [];
    for (const r of data ?? []) {
      const row = r as {
        id: string;
        email: string;
        marketing_opt_in: boolean;
        created_at: string;
      };
      // Enrich with most recent gate_decision + most recent activity.
      const [{ data: gd }, { data: act }, { data: sl }] = await Promise.all([
        svc
          .from('events')
          .select('payload')
          .eq('action', 'gate_decision')
          .eq('lead_id', row.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        svc
          .from('events')
          .select('created_at')
          .eq('lead_id', row.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        svc
          .from('sales_leads')
          .select('fi_name')
          .eq('email', row.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      const fork = (gd as { payload?: { fork?: string } } | null)?.payload?.fork;
      rows.push({
        id: row.id,
        email: row.email,
        fi_name: (sl as { fi_name: string } | null)?.fi_name ?? null,
        gate_decision: fork === 'paid' || fork === 'email' || fork === 'decline' ? fork : null,
        marketing_opt_in: row.marketing_opt_in,
        last_activity_at: (act as { created_at: string } | null)?.created_at ?? null,
        created_at: row.created_at,
      });
    }

    return {
      rows,
      total: count ?? 0,
      page: safePage,
      pageSize,
      error: null,
    };
  } catch (err) {
    return {
      rows: [],
      total: 0,
      page: safePage,
      pageSize,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// CSV export — small payloads only (cap rows).
export function leadsToCSV(rows: readonly LeadRow[]): string {
  const header = ['email', 'fi_name', 'gate_decision', 'marketing_opt_in', 'last_activity_at', 'created_at'];
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.email, r.fi_name, r.gate_decision, r.marketing_opt_in, r.last_activity_at, r.created_at]
        .map(escape)
        .join(','),
    );
  }
  return lines.join('\n');
}
