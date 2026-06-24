// GET /api/cron/assessment-abandoned
// Sends one resume reminder to stale free-assessment drafts.

import { NextResponse } from 'next/server';
import { runAbandonedAssessmentMonitor } from '@/lib/assessment/abandoned-drafts';
import { notifyOpsAlert } from '@/lib/ops/alerts';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function cronAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  return process.env.SKIP_CRON_AUTH === 'true' || authHeader === expected;
}

export async function GET(request: Request): Promise<NextResponse> {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  try {
    const result = await runAbandonedAssessmentMonitor();
    if (result.failedReminders.length > 0) {
      await notifyOpsAlert({
        title: 'Assessment abandonment reminder failures',
        message: `${result.failedReminders.length} free-assessment reminder(s) failed to send.`,
        severity: 'warning',
        context: {
          dedupeKey: `assessment-abandoned-failed:${new Date().toISOString().slice(0, 10)}`,
          failedReminders: result.failedReminders,
          checkedDrafts: result.checkedDrafts,
        },
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[cron/assessment-abandoned] failed:', message);
    await notifyOpsAlert({
      title: 'Assessment abandonment monitor failed',
      message,
      severity: 'error',
      context: {
        dedupeKey: 'assessment-abandoned-monitor-failed',
        route: '/api/cron/assessment-abandoned',
      },
    });
    return NextResponse.json({ error: 'assessment-abandoned-monitor-failed', detail: message }, { status: 500 });
  }
}
