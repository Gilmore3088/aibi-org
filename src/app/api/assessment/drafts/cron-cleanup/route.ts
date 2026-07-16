// GET /api/assessment/drafts/cron-cleanup
// Nightly Vercel Cron sweeper. Hard-deletes assessment resume drafts whose
// 30-day TTL (expires_at) has passed, so the public "deleted after 30 days"
// data-handling commitment is actually enforced against the stored
// email + answers, not just hidden on read.

import { NextResponse } from 'next/server';
import { assertCronAuth } from '@/lib/api/cron-auth';
import { purgeExpiredAssessmentDrafts } from '@/lib/assessment/abandoned-drafts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const denied = assertCronAuth(request);
  if (denied) return denied;

  try {
    const result = await purgeExpiredAssessmentDrafts();
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[assessment/drafts/cron-cleanup] failed:', message);
    // Detail goes to logs, not the response body.
    return NextResponse.json({ error: 'cleanup-failed' }, { status: 500 });
  }
}
