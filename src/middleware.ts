// Middleware — three responsibilities:
//   1. (When COMING_SOON=true) Rewrite all public routes to /coming-soon.
//   2. Refresh the Supabase auth session on every request (keeps cookies in sync).
//   3. Forward the request pathname as x-pathname so Server Component layouts
//      can read the current path without receiving it as a prop.
//
// The Supabase session refresh MUST happen in middleware so that the Server
// Components that run after it can rely on an up-to-date session.
// See: https://supabase.com/docs/guides/auth/server-side/nextjs

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Coming-soon takedown — controlled by the COMING_SOON env var.
//   COMING_SOON=true  → rewrite every public route to /coming-soon
//   COMING_SOON unset/false → real site is live, no rewrite happens
//
// To LAUNCH (turn the real site back on): set COMING_SOON=false in the
// Vercel env vars (or delete the variable entirely) and redeploy.
// No code change required.
//
// Bypass list is intentionally minimal — only the prefixes that MUST keep
// working while the public site is dark:
//   /api          — Stripe webhooks, capture-email, etc. cannot break.
//   /auth         — operator login. Without this you cannot sign in.
//   /admin        — admin surface for the operator.
//   /coming-soon  — destination itself; do not rewrite onto itself.
//   _next, static — implicitly bypassed via the matcher below.
const COMING_SOON_MODE = process.env.COMING_SOON === 'true';
const COMING_SOON_PATH = '/coming-soon';
const COMING_SOON_BYPASS_PREFIXES: readonly string[] = [
  '/api',
  '/auth',
  '/admin',
  '/coming-soon',
  '/assessment',
  '/results',
  '/verify',
  '/education',
  '/for-institutions',
  '/courses',
  '/dashboard',
];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Coming-soon mode: rewrite every public route to /coming-soon.
  // The browser URL stays the same; the visitor sees the placeholder.
  if (COMING_SOON_MODE) {
    // Special-case the root: prefix-matching against '/' would match every
    // path. Allow exactly '/' through so the homepage redesign is visible
    // alongside the rest of the bypass list.
    const isRoot = pathname === '/';
    const isBypassed =
      isRoot ||
      COMING_SOON_BYPASS_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );
    if (!isBypassed) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = COMING_SOON_PATH;
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      rewriteResponse.headers.set('x-pathname', COMING_SOON_PATH);
      return rewriteResponse;
    }
  }

  // Start with a mutable response so we can write cookies onto it.
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Always forward the pathname header regardless of Supabase config.
  response.headers.set('x-pathname', request.nextUrl.pathname);

  // If Supabase is not configured (local dev without .env.local), skip session refresh.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response;
  }

  // Create a server client that reads/writes cookies on the request/response pair.
  // The getAll/setAll pattern is required by @supabase/ssr 0.5+.
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Write each cookie onto the request (so downstream server code sees it)
        // and onto the response (so the browser receives it).
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.headers.set('x-pathname', request.nextUrl.pathname);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Calling getUser() triggers a token refresh if the access token is near expiry.
  // We intentionally ignore the result — route-level auth checks happen in page/layout code.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
