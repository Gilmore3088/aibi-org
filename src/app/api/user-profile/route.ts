// GET /api/user-profile?email=<email>
// Returns the Supabase user_profiles row for the given email.
//
// Auth model (2026-05-20 security audit):
//   - Requires an authenticated Supabase session, and the session email
//     must match the requested email. This row carries assessment PII
//     (score, tier, raw answers), so there is no anonymous read path —
//     the prior email-only fallback let anyone enumerate and read another
//     person's results by guessing their email. The only caller is the
//     auth-gated dashboard, which always carries a session cookie; the
//     "returning visitor on a new device" flow logs in via magic link and
//     reads results through the auth-enforced /api/dashboard/* routes.
//
// A valid-format email that has no matching profile returns 404.

import { NextResponse } from 'next/server';
import { getProfileByEmail } from '@/lib/supabase/user-profiles';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAuthUser } from '@/lib/api/auth';
import { EMAIL_RE } from '@/lib/email/validate';


export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim() ?? '';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  const sessionUser = await getAuthUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  // Session email must match the requested email.
  if (sessionUser.email?.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  try {
    const profile = await getProfileByEmail(email);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }
    return NextResponse.json(profile, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[user-profile] fetch error', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
