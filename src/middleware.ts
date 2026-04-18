// Middleware — two responsibilities:
//   1. Refresh the Supabase auth session on every request (keeps cookies in sync).
//   2. Forward the request pathname as x-pathname so Server Component layouts
//      can read the current path without receiving it as a prop.
//
// The Supabase session refresh MUST happen in middleware so that the Server
// Components that run after it can rely on an up-to-date session.
// See: https://supabase.com/docs/guides/auth/server-side/nextjs

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Coming-soon takedown — rewrite all public routes to /coming-soon while
// keeping internal routes (auth, admin, dashboard, API, healthchecks) live
// so we can still log in and operate the site.
// To restore the public site: delete this constant and the rewrite block
// below, plus remove '/coming-soon' from CHROMELESS_PATHS in app/layout.tsx.
const COMING_SOON_PATH = '/coming-soon';
const COMING_SOON_BYPASS_PREFIXES: readonly string[] = [
  '/api',
  '/auth',
  '/admin',
  '/dashboard',
  '/coming-soon',
];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // If the request is for a public route, rewrite it to /coming-soon.
  // The browser URL stays the same; the user sees the placeholder.
  const isBypassed = COMING_SOON_BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isBypassed) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = COMING_SOON_PATH;
    const rewriteResponse = NextResponse.rewrite(rewriteUrl);
    rewriteResponse.headers.set('x-pathname', COMING_SOON_PATH);
    return rewriteResponse;
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
