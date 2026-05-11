// GET /api/cron/cleanup-rate-limits
// Daily Vercel Cron sweeper. Deletes rate_limits rows older than 24h
// via the cleanup_rate_limits() RPC. Keeps the table small —
// without this, every IP that ever hit a rate-limited route leaves
// rows around indefinitely.
//
// Wire as a Vercel cron in vercel.json:
//   { "path": "/api/cron/cleanup-rate-limits", "schedule": "0 4 * * *" }

import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RETENTION_HOURS = 24;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (process.env.SKIP_CRON_AUTH !== 'true' && authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc('cleanup_rate_limits', {
      p_older_than_hours: RETENTION_HOURS,
    });
    if (error) {
      console.error('[cron/cleanup-rate-limits] RPC error:', error);
      return NextResponse.json({ error: 'cleanup-failed', detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ status: 'ok', deleted: data ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[cron/cleanup-rate-limits] failed:', message);
    return NextResponse.json({ error: 'cleanup-failed', detail: message }, { status: 500 });
  }
}
