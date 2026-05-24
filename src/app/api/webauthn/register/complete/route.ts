// POST /api/webauthn/register/complete — verifies the attestation
// produced by navigator.credentials.create and stores the credential.
//
// Body: { response: RegistrationResponseJSON, deviceLabel?: string }

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { completeRegistration } from '@/lib/webauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
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
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { response?: RegistrationResponseJSON; deviceLabel?: string }
    | null;
  if (!body?.response) {
    return NextResponse.json({ error: 'Missing response.' }, { status: 400 });
  }

  // Use the request's origin so preview deploys verify against their
  // own host. WebAuthn is strict about origin matching.
  const originOverride = request.headers.get('origin') ?? undefined;

  const result = await completeRegistration({
    userId: user.id,
    response: body.response,
    deviceLabel: body.deviceLabel,
    originOverride,
    hostOverride: request.headers.get('host') ?? undefined,
  });

  if (!result.verified) {
    return NextResponse.json(
      { error: result.error ?? 'Verification failed.' },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, credentialId: result.credentialId });
}
