import { NextResponse } from 'next/server';
import { getSupportAdminSession } from './auth';
import { parseSupportMetricsRange, type SupportMetricsRange } from './metrics';

export async function requireSupportAdminApi(): Promise<
  | {
      ok: true;
      user: {
        id: string;
        email: string;
      };
    }
  | { ok: false; response: NextResponse }
> {
  const session = await getSupportAdminSession();
  if (session.ok) return session;

  const status = session.status;
  const error =
    session.reason === 'supabase_not_configured'
      ? 'Support admin is not configured.'
      : session.reason === 'forbidden'
        ? 'Forbidden.'
        : 'Unauthorized.';

  return {
    ok: false,
    response: NextResponse.json({ ok: false, error }, { status }),
  };
}

export function parseRange(value: string | null): SupportMetricsRange {
  if (value === '7') return '7d';
  if (value === '90') return '90d';
  return parseSupportMetricsRange(value);
}
