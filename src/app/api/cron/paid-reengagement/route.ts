// GET /api/cron/paid-reengagement
// Sends deduped transactional reminders for paid buyers who have not started
// or have stalled after purchase. Auth mirrors the other Vercel cron routes.

import { NextResponse } from 'next/server';
import { notifyOpsAlert } from '@/lib/ops/alerts';
import { runPaidReengagementMonitor } from '@/lib/support/paid-reengagement';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function cronAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  return process.env.SKIP_CRON_AUTH === 'true' || authHeader === expected;
}

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  try {
    const result = await runPaidReengagementMonitor();

    if (result.failedReminders.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      await notifyOpsAlert({
        title: 'Paid re-engagement reminders failed',
        message: `${result.failedReminders.length} paid re-engagement reminder(s) failed. Check Resend and paid_reengagement_events.`,
        severity: 'warning',
        context: {
          dedupeKey: `paid-reengagement-failures:${today}`,
          failedReminders: result.failedReminders,
          checkedEnrollments: result.checkedEnrollments,
          eligibleCandidates: result.eligibleCandidates,
        },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[cron/paid-reengagement] failed:', message);
    await notifyOpsAlert({
      title: 'Paid re-engagement monitor failed',
      message,
      severity: 'error',
      context: {
        dedupeKey: 'paid-reengagement-monitor-failed',
        route: '/api/cron/paid-reengagement',
      },
    });
    return NextResponse.json({ error: 'paid-reengagement-monitor-failed', detail: message }, { status: 500 });
  }
}
