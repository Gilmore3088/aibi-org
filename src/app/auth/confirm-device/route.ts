// GET /auth/confirm-device?token=<plaintext>
//
// Email-link landing for #187 PR 2. The user has just signed in with a
// password on a new device; this route consumes the one-time token from
// the email, issues a trusted_devices row, sets the aibi-trusted-device
// cookie (HttpOnly, 90 days), and redirects to the originally-requested
// destination.
//
// Failure modes (expired, already-used, malformed) route back to
// /auth/login with an error query param.

import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import {
  consumeDeviceConfirmation,
  issueTrustedDevice,
  TRUSTED_DEVICE_COOKIE,
  trustedDeviceCookieOptions,
} from '@/lib/auth/trusted-device';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function redirectToLogin(origin: string, message: string): NextResponse {
  const url = new URL(`/auth/login?error=${encodeURIComponent(message)}`, origin);
  return NextResponse.redirect(url);
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const origin = url.origin;

  if (!isSupabaseConfigured()) {
    return redirectToLogin(origin, 'not_configured');
  }

  const token = url.searchParams.get('token');
  if (!token) {
    return redirectToLogin(origin, 'missing_code');
  }

  const consumed = await consumeDeviceConfirmation(token);
  if ('error' in consumed) {
    const msg =
      consumed.error === 'expired'
        ? 'The confirmation link has expired. Please sign in again.'
        : consumed.error === 'already_used'
          ? 'This confirmation link has already been used.'
          : 'The confirmation link is invalid. Please sign in again.';
    return redirectToLogin(origin, msg);
  }

  // The link binds a user_id to a device, but the browser holding the link
  // must also have an active Supabase session for that same user. If the
  // user opened the link in a DIFFERENT browser than the one that
  // initiated sign-in, the session won't be there — in which case we
  // route them to /auth/login with the redirect preserved.
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetUserId = consumed.userId;
  const dest = new URL(consumed.redirectTo, url.origin);

  if (!user || user.id !== targetUserId) {
    // The token is valid but this browser doesn't carry the session it was
    // issued for. Send them to /auth/login with the original destination
    // preserved so they can sign in here. We don't burn the cookie or
    // create the trusted_devices row — they'll need to re-confirm.
    const loginUrl = new URL('/auth/login', url.origin);
    loginUrl.searchParams.set('next', consumed.redirectTo);
    loginUrl.searchParams.set(
      'error',
      'Open the confirmation link in the same browser where you signed in.',
    );
    return NextResponse.redirect(loginUrl);
  }

  const headerList = await headers();
  const rawIp =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerList.get('x-real-ip') ??
    'anonymous';
  const userAgent = headerList.get('user-agent');

  const issued = await issueTrustedDevice({
    userId: targetUserId,
    ipHash: hashIp(rawIp),
    userAgent,
  });

  if ('error' in issued) {
    return redirectToLogin(origin, 'Could not register this device. Please try again.');
  }

  const response = NextResponse.redirect(dest);
  response.cookies.set(TRUSTED_DEVICE_COOKIE, issued.cookieToken, trustedDeviceCookieOptions());
  return response;
}
