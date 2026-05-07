// Auth callback route — exchanges the code/token from magic link, signup
// confirmation, and password reset flows for a Supabase session, then
// redirects to the intended destination.
//
// Handles two Supabase flows:
//   1. PKCE (OAuth) — code query param
//   2. Token hash (signup confirmation, password reset, magic link) —
//      token_hash + type
//
// IMPORTANT: Next.js 14 Route Handlers do NOT propagate cookies set via
// `cookies()` (next/headers) onto NextResponse.redirect() responses. The
// only reliable way to attach the Supabase session cookies is to capture
// them during the auth call and write them directly onto the response
// object. Without this, verifyOtp succeeds server-side but the browser
// never receives the auth cookies, so the user lands logged-OUT — even
// though the link "worked."

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { backFillProfile } from '@/lib/auth/back-fill-profile';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface CookieToSet {
  readonly name: string;
  readonly value: string;
  readonly options: CookieOptions;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/auth/login?error=not_configured`);
  }

  // Capture cookies that Supabase wants to set during the auth flow. After
  // the auth call resolves we attach this list onto the redirect response.
  const cookiesToWrite: CookieToSet[] = [];
  const cookieStore = cookies();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        for (const c of toSet) cookiesToWrite.push(c);
      },
    },
  });

  function buildResponse(url: string): NextResponse {
    const response = NextResponse.redirect(url);
    for (const { name, value, options } of cookiesToWrite) {
      response.cookies.set(name, value, options);
    }
    return response;
  }

  // PKCE flow — OAuth and any code-based confirmations
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
      return buildResponse(
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
    console.log(`[auth/callback] PKCE session established userId=${user?.id ?? 'unknown'}`);
    return buildResponse(`${origin}${safeNext}`);
  }

  // Token hash flow — signup confirm, password reset, magic link, email change
  if (tokenHash && type) {
    console.log(
      `[auth/callback] verifyOtp type=${type} tokenHashPrefix=${tokenHash.slice(0, 12)}…`,
    );
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as never,
    });
    if (error) {
      console.error(
        `[auth/callback] verifyOtp failed type=${type} error=${error.message} status=${error.status ?? 'unknown'}`,
      );
      return buildResponse(
        `${origin}/auth/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    const user = data.session?.user ?? data.user;
    console.log(`[auth/callback] verifyOtp success userId=${user?.id ?? 'unknown'} cookies=${cookiesToWrite.length}`);

    if (type === 'recovery') {
      return buildResponse(`${origin}/auth/reset-password`);
    }
    if (user?.email) {
      try {
        await backFillProfile(user.id, user.email);
      } catch (err) {
        console.warn('[auth/callback] back-fill failed:', err);
      }
    }
    return buildResponse(`${origin}${safeNext}`);
  }

  return buildResponse(`${origin}/auth/login?error=missing_code`);
}
