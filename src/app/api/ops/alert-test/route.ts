// POST /api/ops/alert-test
//
// Sends a synthetic ops alert through the configured alert transport.
// Protected by CRON_SECRET because this endpoint creates an external side
// effect when webhook or email alerting is configured.

import { NextResponse } from 'next/server';
import { notifyOpsAlert } from '@/lib/ops/alerts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'CRON_SECRET is not configured.' },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized.' },
      { status: 401 },
    );
  }

  const result = await notifyOpsAlert({
    severity: 'info',
    title: 'Ops alert test',
    message:
      'This is a synthetic alert from /api/ops/alert-test. If you received it, the paid-launch alert path is wired.',
    context: {
      route: '/api/ops/alert-test',
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json(
    {
      ok: result.ok,
      channel: result.channel,
      configured: result.configured,
      error: result.error ?? null,
    },
    { status: result.ok ? 200 : 503 },
  );
}
