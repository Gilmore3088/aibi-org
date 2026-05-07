// Auth callback route — exchanges the code/token from magic link and OAuth flows
// for a Supabase session, then redirects to the intended destination.
//
// Handles two Supabase flows:
//   1. PKCE (magic link, OAuth) — code query param
//   2. Token hash (email confirmation, password reset) — token_hash + type

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { backFillProfile } from '@/lib/auth/back-fill-profile';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  // `next` carries the post-auth redirect destination set by the caller.
  const next = searchParams.get('next') ?? '/dashboard';

  // Guard: sanitize `next` — only allow relative paths to prevent open redirect.
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/auth/login?error=not_configured`);
  }

  // Use getAll/setAll so the session cookie is written onto the response.
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  // PKCE flow — magic link and OAuth
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    const user = data.session?.user;
    if (user?.email) {
      try {
        await backFillProfile(user.id, user.email);
      } catch (err) {
        console.warn('[auth/callback] back-fill failed:', err);
      }
    }
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  // Token hash flow — email confirmation, password reset invite, magic link
  if (tokenHash && type) {
    console.log(`[auth/callback] verifyOtp type=${type} tokenHashPrefix=${tokenHash.slice(0, 12)}…`);
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as never });
    if (error) {
      console.error(
        `[auth/callback] verifyOtp failed type=${type} error=${error.message} status=${error.status ?? 'unknown'}`,
      );
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    console.log(`[auth/callback] verifyOtp success — userId=${data.session?.user?.id ?? data.user?.id ?? 'unknown'}`);
    // Password reset: redirect to the form so user can set a new password.
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }
    const user = data.session?.user ?? data.user;
    if (user?.email) {
      try {
        await backFillProfile(user.id, user.email);
      } catch (err) {
        console.warn('[auth/callback] back-fill failed:', err);
      }
    }
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  // No recognised parameters — send to login with a generic error.
  return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
}
