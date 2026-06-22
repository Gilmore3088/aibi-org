import { NextResponse } from 'next/server';
import { getSupportAdminSession } from '@/lib/support/auth';
import { getSupportMetrics, parseSupportMetricsRange } from '@/lib/support/metrics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authError(status: number, reason: string): NextResponse {
  return NextResponse.json({ ok: false, error: reason }, { status });
}

export async function GET(request: Request): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  const url = new URL(request.url);
  const metrics = await getSupportMetrics(parseSupportMetricsRange(url.searchParams.get('range')));
  return NextResponse.json({ ok: true, metrics });
}
