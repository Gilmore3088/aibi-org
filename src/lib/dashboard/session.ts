import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { isDeviceTrusted, TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';

type DashboardSupabaseClient = ReturnType<typeof createServerClientWithCookies>;

export type DashboardSessionResult =
  | {
      readonly ok: true;
      readonly supabase: DashboardSupabaseClient;
      readonly user: User;
    }
  | {
      readonly ok: false;
      readonly status: 401 | 503;
      readonly reason: 'supabase_not_configured' | 'unauthenticated' | 'untrusted_device';
      readonly email?: string | null;
    };

export async function getDashboardSession(): Promise<DashboardSessionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, status: 503, reason: 'supabase_not_configured' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, status: 401, reason: 'unauthenticated' };
  }

  const trustedCookie = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
  let trusted = false;
  try {
    trusted = await isDeviceTrusted({ userId: user.id, cookieToken: trustedCookie });
  } catch {
    return { ok: false, status: 503, reason: 'supabase_not_configured' };
  }

  if (!trusted) {
    return {
      ok: false,
      status: 401,
      reason: 'untrusted_device',
      email: user.email ?? null,
    };
  }

  return { ok: true, supabase, user };
}

export function dashboardSessionErrorResponse(
  session: Extract<DashboardSessionResult, { ok: false }>,
): NextResponse {
  if (session.reason === 'supabase_not_configured') {
    return NextResponse.json({ error: 'Service not configured.' }, { status: session.status });
  }

  if (session.reason === 'untrusted_device') {
    return NextResponse.json(
      { error: 'Trusted device required.', reason: session.reason },
      { status: session.status },
    );
  }

  return NextResponse.json({ error: 'Not authenticated.' }, { status: session.status });
}
