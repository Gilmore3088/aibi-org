import { NextResponse } from 'next/server';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { sendAuthSignInLink } from '@/lib/resend';
import { sanitizeNext } from '@/lib/supabase/auth';
import { ensureAuthUser, generateMagicLink } from '@/lib/supabase/auth-admin';
import { EMAIL_RE } from '@/lib/email/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


interface Payload {
  readonly email?: unknown;
  readonly next?: unknown;
}

function genericResponse(): NextResponse {
  return NextResponse.json({
    ok: true,
    message: 'If that email can sign in, a one-time link is on its way.',
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const limitedIp = await rateLimitOrFail({
    key: 'auth-sign-in-link',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 8,
    windowSeconds: 3600,
  });
  if (limitedIp) return limitedIp;

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
  }

  const limitedEmail = await rateLimitOrFail({
    key: 'auth-sign-in-link',
    scope: 'email',
    identifier: email,
    max: 4,
    windowSeconds: 3600,
  });
  if (limitedEmail) return limitedEmail;

  const next = sanitizeNext(typeof body.next === 'string' ? body.next : null);

  try {
    await ensureAuthUser(email);
    const accessUrl = await generateMagicLink(email, next);
    if (accessUrl) {
      await sendAuthSignInLink({ email, accessUrl });
    }
  } catch (err) {
    console.warn('[auth/send-sign-in-link] skipped:', err);
  }

  return genericResponse();
}
