// GET /api/cron/paid-reengagement
// Sends deduped transactional reminders for paid buyers who have not started
// or have stalled after purchase, plus 30/60/90-day post-certificate
// transfer prompts. Auth mirrors the other Vercel cron routes.

import { NextResponse } from 'next/server';
import { assertCronAuth } from '@/lib/api/cron-auth';
import { notifyOpsAlert } from '@/lib/ops/alerts';
import { runCertificateTransferMonitor } from '@/lib/support/certificate-transfer';
import { runPaidReengagementMonitor } from '@/lib/support/paid-reengagement';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;


export async function GET(request: Request) {
  const denied = assertCronAuth(request);
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  try {
    const result = await runPaidReengagementMonitor();
    const transferResult = await runCertificateTransferMonitor();

    const failedReminders = [
      ...result.failedReminders,
      ...transferResult.failedReminders,
    ];

    if (failedReminders.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      await notifyOpsAlert({
        title: 'Paid re-engagement reminders failed',
        message: `${failedReminders.length} paid re-engagement / certificate-transfer reminder(s) failed. Check Resend and paid_reengagement_events.`,
        severity: 'warning',
        context: {
          dedupeKey: `paid-reengagement-failures:${today}`,
          failedReminders,
          checkedEnrollments: result.checkedEnrollments,
          eligibleCandidates: result.eligibleCandidates,
          checkedCertificates: transferResult.checkedCertificates,
          eligibleTransferCandidates: transferResult.eligibleCandidates,
        },
      });
    }

    return NextResponse.json({ ...result, certificateTransfer: transferResult });
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
    // Full message goes to logs + ops alert above; keep the response generic.
    return NextResponse.json({ error: 'paid-reengagement-monitor-failed' }, { status: 500 });
  }
}
