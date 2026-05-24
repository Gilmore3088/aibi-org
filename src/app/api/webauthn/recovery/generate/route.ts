// POST /api/webauthn/recovery/generate — issue a fresh batch of 8
// single-use backup codes for the currently-authenticated user. Wipes
// any prior batch — only one set is active at a time.
//
// Auth required. Typically called from:
//   1. /auth/passkey/enroll right after a successful registration
//   2. /dashboard/security when the user requests new codes
//
// Plaintext codes are returned ONCE. Server only retains hashes.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { generateCodesForUser } from '@/lib/webauthn/recovery-codes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Auth not configured.' }, { status: 503 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();
  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const result = await generateCodesForUser(user.id);
  if (!result.ok || !result.codes) {
    return NextResponse.json(
      { error: result.error ?? 'Could not generate codes.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, codes: result.codes });
}
