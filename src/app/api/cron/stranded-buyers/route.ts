// GET /api/cron/stranded-buyers
// Finds paid enrollments whose buyer has never completed a Supabase sign-in
// after the waiting window and opens a deduped support case for access rescue.

import { NextResponse } from 'next/server';
import { notifyOpsAlert } from '@/lib/ops/alerts';
import { runStrandedBuyerMonitor } from '@/lib/support/stranded-buyers';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function cronAuthorized(request: Request): boolean {
  if (process.env.SKIP_CRON_AUTH === 'true') return true;
  // Fail closed when the secret is unset — otherwise an empty Bearer token
  // would authenticate.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  try {
    const result = await runStrandedBuyerMonitor();

    if (result.createdCases.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      await notifyOpsAlert({
        title: 'Stranded buyer access cases opened',
        message: `${result.createdCases.length} paid buyer(s) have not signed in after purchase. Support cases were opened for access rescue.`,
        severity: 'warning',
        context: {
          dedupeKey: `stranded-buyers-summary:${today}`,
          createdCases: result.createdCases,
          checkedEnrollments: result.checkedEnrollments,
          alertAfterHours: result.options.alertAfterHours,
          lookbackDays: result.options.lookbackDays,
        },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[cron/stranded-buyers] failed:', message);
    await notifyOpsAlert({
      title: 'Stranded buyer monitor failed',
      message,
      severity: 'error',
      context: {
        dedupeKey: 'stranded-buyers-monitor-failed',
        route: '/api/cron/stranded-buyers',
      },
    });
    return NextResponse.json({ error: 'stranded-buyer-monitor-failed', detail: message }, { status: 500 });
  }
}
