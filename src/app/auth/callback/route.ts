// Auth callback route — exchanges the code/token from magic link, signup
// confirmation, and password reset flows for a Supabase session, then
// redirects to the intended destination.
//
// Handles two Supabase flows:
//   1. PKCE (OAuth) — code query param
//   2. Token hash (signup confirmation, password reset, magic link) —
//      token_hash + type
//
// IMPORTANT — email-scanner pre-fetch defense (2026-05-11):
// Outlook Defender, Apple Mail Privacy Protection, and Gmail's link
// prefetcher all GET URLs from emails before the recipient clicks them.
// If GET on this route consumed the OTP/code, scanners burned every
// token a second after delivery and users got "expired" errors. The
// signature in the auth logs was exactly this: pairs of POST /verify
// calls one second apart, second call returning otp_expired.
//
// Fix: GET no longer consumes the token. It redirects to the
// /auth/confirm interstitial, which renders a click-through button.
// The button POSTs back to this route, and POST is the only verb that
// calls exchangeCodeForSession / verifyOtp. Scanners can hit GET all
// day; only the user's deliberate click consumes the token.
//
// IMPORTANT — cookie propagation:
// Next.js 14 Route Handlers do NOT propagate cookies set via cookies()
// (next/headers) onto NextResponse.redirect() responses. The only
// reliable way to attach the Supabase session cookies is to capture
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

// Read auth params from either URL query string (GET) or form body (POST).
async function readParams(request: NextRequest): Promise<{
  readonly code: string | null;
  readonly tokenHash: string | null;
  readonly type: string | null;
  readonly next: string;
}> {
  const url = new URL(request.url);
  if (request.method === 'POST') {
    try {
      const form = await request.formData();
      return {
        code: (form.get('code') as string | null) ?? null,
        tokenHash: (form.get('token_hash') as string | null) ?? null,
        type: (form.get('type') as string | null) ?? null,
        next: (form.get('next') as string | null) ?? '/dashboard',
      };
    } catch {
      // Fall through to query-string reading
    }
  }
  return {
    code: url.searchParams.get('code'),
    tokenHash: url.searchParams.get('token_hash'),
    type: url.searchParams.get('type'),
    next: url.searchParams.get('next') ?? '/dashboard',
  };
}

// GET — never consumes a token. Forwards to the interstitial so a real
// click is required before verifyOtp/exchangeCodeForSession fires.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin, searchParams } = new URL(request.url);
  // Bounce to /auth/confirm with the same query string so the interstitial
  // can render a "Confirm" button posting back here.
  const qs = searchParams.toString();
  return NextResponse.redirect(`${origin}/auth/confirm${qs ? `?${qs}` : ''}`);
}

// POST — the verb fired by the user's click on the interstitial.
// Performs the actual code exchange / OTP verification and sets cookies.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { origin } = new URL(request.url);
  const { code, tokenHash, type, next } = await readParams(request);
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/auth/login?error=not_configured`, { status: 303 });
  }

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

  // Status 303 turns the POST → redirect into a GET on the destination,
  // which is what we want after form submission.
  function buildResponse(url: string): NextResponse {
    const response = NextResponse.redirect(url, { status: 303 });
    for (const { name, value, options } of cookiesToWrite) {
      response.cookies.set(name, value, options);
    }
    return response;
  }

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
