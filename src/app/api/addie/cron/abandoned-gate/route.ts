// GET /api/addie/cron/abandoned-gate
// Nightly sweeper that finds leads who captured email at the post-M3 gate
// 72h–14d ago and never converted (no paid gate-fork, no recent activity),
// and adds them to MAILERLITE_GROUP_ID_GATE_ABANDONED so the abandoned-gate
// nurture automation fires.
//
// Dedupes via the events table: emits `gate_abandoned_notified` on success
// so subsequent runs skip already-notified leads. No new tables required.
//
// Wire as a Vercel cron in vercel.json:
//   { "path": "/api/addie/cron/abandoned-gate", "schedule": "0 5 * * *" }

import { NextResponse } from 'next/server';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { subscribeToGateAbandoned } from '@/lib/mailerlite';
import { emit } from '@/lib/addie/events/emit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

interface LeadRow {
  id: string;
  email: string;
  created_at: string;
}

interface EventRow {
  action: string;
  payload: { fork?: string } | null;
  created_at: string;
}

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (process.env.SKIP_CRON_AUTH !== 'true' && authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Short-circuit when the destination group isn't configured — there's
  // no business reason to scan the table if we can't act on the result.
  if (!process.env.MAILERLITE_GROUP_ID_GATE_ABANDONED) {
    return NextResponse.json({ status: 'skipped', reason: 'no-group-id' });
  }

  const now = Date.now();
  const olderThanISO = new Date(now - 72 * HOUR_MS).toISOString();
  const newerThanISO = new Date(now - 14 * DAY_MS).toISOString();
  const stillActiveSinceISO = new Date(now - 24 * HOUR_MS).toISOString();

  try {
    const svc = getAddieServiceClient();

    // Candidate leads: source='gate', created 72h–14d ago.
    const { data: leads, error: leadsErr } = await svc
      .from('leads')
      .select('id, email, created_at')
      .eq('source', 'gate')
      .gte('created_at', newerThanISO)
      .lt('created_at', olderThanISO);
    if (leadsErr) throw leadsErr;

    const candidates = (leads ?? []) as LeadRow[];
    if (candidates.length === 0) {
      return NextResponse.json({ status: 'ok', scanned: 0, notified: 0 });
    }

    const ids = candidates.map((l) => l.id);

    // One round-trip: pull all relevant events for the candidate leads. We
    // only need actions that can disqualify or have already disqualified.
    const { data: events, error: evErr } = await svc
      .from('events')
      .select('action, payload, created_at, lead_id')
      .in('lead_id', ids)
      .in('action', ['gate_abandoned_notified', 'gate_decision', 'lesson_view', 'lesson_complete']);
    if (evErr) throw evErr;

    const byLead = new Map<string, EventRow[]>();
    for (const row of events ?? []) {
      const r = row as EventRow & { lead_id: string };
      const arr = byLead.get(r.lead_id) ?? [];
      arr.push(r);
      byLead.set(r.lead_id, arr);
    }

    let notified = 0;
    const skips: Record<string, number> = {
      already_notified: 0,
      paid: 0,
      active: 0,
    };

    for (const lead of candidates) {
      const evs = byLead.get(lead.id) ?? [];
      if (evs.some((e) => e.action === 'gate_abandoned_notified')) {
        skips.already_notified++;
        continue;
      }
      if (evs.some((e) => e.action === 'gate_decision' && e.payload?.fork === 'paid')) {
        skips.paid++;
        continue;
      }
      if (evs.some((e) => e.created_at >= stillActiveSinceISO)) {
        skips.active++;
        continue;
      }

      // Eligible — subscribe + emit dedupe event. MailerLite call is
      // best-effort; we still emit the dedupe event on success only.
      const result = await subscribeToGateAbandoned({ email: lead.email });
      if (result.status === 'subscribed' || result.status === 'skipped') {
        await emit({
          action: 'gate_abandoned_notified',
          lead_id: lead.id,
          payload: { mailerlite_status: result.status, reason: result.reason ?? null },
        });
        if (result.status === 'subscribed') notified++;
      } else {
        console.warn(
          '[addie/cron/abandoned-gate] mailerlite failed for lead',
          lead.id,
          result.reason,
        );
      }
    }

    return NextResponse.json({
      status: 'ok',
      scanned: candidates.length,
      notified,
      skips,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[addie/cron/abandoned-gate] failed:', message);
    return NextResponse.json({ error: 'sweep-failed', detail: message }, { status: 500 });
  }
}
