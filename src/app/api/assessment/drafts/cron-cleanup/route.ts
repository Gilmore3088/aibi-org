// GET /api/assessment/drafts/cron-cleanup
// Nightly Vercel Cron sweeper. Hard-deletes assessment resume drafts whose
// 30-day TTL (expires_at) has passed, so the public "deleted after 30 days"
// data-handling commitment is actually enforced against the stored
// email + answers, not just hidden on read.

import { NextResponse } from 'next/server';
import { purgeExpiredAssessmentDrafts } from '@/lib/assessment/abandoned-drafts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  // Fail closed when the secret is unset — otherwise an empty Bearer token
  // would authenticate.
  const secret = process.env.CRON_SECRET;
  const authorized =
    process.env.SKIP_CRON_AUTH === 'true' ||
    (Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`);
  if (!authorized) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

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
