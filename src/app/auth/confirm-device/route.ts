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

import {
  createServerClientWithCookies,
  createServiceRoleClient,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import { generateMagicLink } from '@/lib/supabase/auth-admin';
import { getRequestIpFromHeaders } from '@/lib/api/rate-limit';
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
    // Cross-device tolerance: if the user opens this device-confirmation
    // email on another browser, that browser has no Supabase session to
    // bind. Generate a fresh one-time auth link for the same user and
    // route them through /auth/callback instead of dead-ending on login.
    try {
      const service = createServiceRoleClient();
      const { data } = await service.auth.admin.getUserById(targetUserId);
      const email = data.user?.email;
      const accessUrl = email ? await generateMagicLink(email, consumed.redirectTo) : null;
      if (accessUrl) return NextResponse.redirect(accessUrl);
    } catch (err) {
      console.warn('[auth/confirm-device] cross-device auth link failed:', err);
    }

    const loginUrl = new URL('/auth/login', url.origin);
    loginUrl.searchParams.set('next', consumed.redirectTo);
    loginUrl.searchParams.set(
      'error',
      'This browser needs a fresh sign-in link. Enter your email below.',
    );
    return NextResponse.redirect(loginUrl);
  }

  const headerList = await headers();
  const rawIp =
    getRequestIpFromHeaders(headerList);
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
