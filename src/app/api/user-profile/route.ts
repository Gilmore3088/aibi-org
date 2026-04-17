// GET /api/user-profile?email=<email>
// Returns the Supabase user_profiles row for the given email.
// The email is supplied by the client from its localStorage cache —
// this is intentionally unauthenticated so email-only visitors can
// retrieve their own data cross-device.
//
// Security note: this endpoint reveals only the data the visitor
// already has client-side (score, tier, answers). There is no PII
// beyond what was voluntarily submitted at the email gate.
// A valid-format email that has no matching profile returns 404.

import { NextResponse } from 'next/server';
import { getProfileByEmail } from '@/lib/supabase/user-profiles';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim() ?? '';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  try {
    const profile = await getProfileByEmail(email);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err) {
    console.error('[user-profile] fetch error', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
