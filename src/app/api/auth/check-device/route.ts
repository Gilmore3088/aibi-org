// POST /api/auth/check-device
//
// Called by /auth/login immediately after a successful password sign-in.
// Decides whether the browser already has a trusted-device cookie for
// the signed-in user.
//
//   - trusted   → returns { trusted: true, dest: <body.redirectTo> }
//                 — client routes straight to the destination
//   - untrusted → server creates a single-use device_confirmations
//                 token, emails the user a link to /auth/confirm-device,
//                 returns { trusted: false, dest: '/auth/confirm-device-pending' }
//                 — client routes to the holding page
//
// The session itself is left alone in both cases. Trust is enforced on
// /dashboard and other protected layouts by the same isDeviceTrusted()
// helper used here, so a stolen Supabase cookie alone cannot unlock a
// new-device sign-in: the layout check will still bounce the request
// to the holding page.

import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import { sanitizeNext } from '@/lib/supabase/auth';
import {
  createDeviceConfirmation,
  isDeviceTrusted,
  TRUSTED_DEVICE_COOKIE,
  DEVICE_CONFIRMATION_TTL_MINUTES,
} from '@/lib/auth/trusted-device';
import { sendDeviceConfirmation } from '@/lib/resend';
import { getRequestIpFromHeaders } from '@/lib/api/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckBody {
  readonly redirectTo?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  let body: CheckBody;
  try {
    body = (await request.json().catch(() => ({}))) as CheckBody;
  } catch {
    body = {};
  }

  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const redirectTo = sanitizeNext(typeof body.redirectTo === 'string' ? body.redirectTo : null);
  const cookieToken = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;

  if (await isDeviceTrusted({ userId: user.id, cookieToken })) {
    return NextResponse.json({ trusted: true, dest: redirectTo });
  }

  // Untrusted device. Email a one-time confirmation link.
  const headerList = await headers();
  const rawIp =
    getRequestIpFromHeaders(headerList);
  const userAgent = headerList.get('user-agent');

  const confirmation = await createDeviceConfirmation({
    userId: user.id,
    redirectTo,
    ipHash: hashIp(rawIp),
    userAgent,
  });

  if ('error' in confirmation) {
    return NextResponse.json(
      { error: 'Could not start device confirmation. Please try again.' },
      { status: 500 },
    );
  }

  const origin =
    headerList.get('origin') ??
    `${headerList.get('x-forwarded-proto') ?? 'https'}://${headerList.get('host') ?? 'aibankinginstitute.com'}`;
  const confirmUrl = `${origin}/auth/confirm-device?token=${encodeURIComponent(confirmation.token)}`;

  // Approximate IP for display (first three octets of v4 or "anonymous").
  const ipApprox = rawIp.match(/^(\d+\.\d+\.\d+)\./)?.[1]
    ? `${rawIp.match(/^(\d+\.\d+\.\d+)\./)![1]}.×`
    : null;

  await sendDeviceConfirmation({
    email: user.email ?? '',
    confirmUrl,
    expiresInMinutes: DEVICE_CONFIRMATION_TTL_MINUTES,
    ipApprox,
    userAgent,
    atDisplay: new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  });

  return NextResponse.json({
    trusted: false,
    dest: `/auth/confirm-device-pending?email=${encodeURIComponent(user.email ?? '')}&redirectTo=${encodeURIComponent(redirectTo)}`,
  });
}
