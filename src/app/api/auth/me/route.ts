// GET /api/auth/me — returns the current Supabase Auth user's email
// (and nothing else) so client components can prefill forms without
// asking authenticated visitors to retype what we already know.
//
// Returns 200 { email } when logged in, 200 { email: null } when not.
// Always 200 — clients should not branch on status.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ email: null });
  }
  try {
    const supabase = createServerClientWithCookies(cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return NextResponse.json({ email: user?.email ?? null });
  } catch {
    return NextResponse.json({ email: null });
  }
}
