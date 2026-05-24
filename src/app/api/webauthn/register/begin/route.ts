// POST /api/webauthn/register/begin — issues WebAuthn registration options
// for the currently-authenticated user. Requires an active Supabase
// session (the user must be signed in via password, magic-link recovery,
// or a recently-issued WebAuthn session) before they can enrol a new
// passkey.
//
// Body: { deviceLabel?: string }  — saved alongside the credential.
// Response: PublicKeyCredentialCreationOptionsJSON (passed directly to
//           navigator.credentials.create on the client).

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { beginRegistration } from '@/lib/webauthn/server';

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

  const options = await beginRegistration({
    userId: user.id,
    userEmail: user.email,
    displayName:
      (user.user_metadata?.full_name as string | undefined) ?? user.email,
    hostOverride: request.headers.get('host') ?? undefined,
  });

  return NextResponse.json(options);
}
