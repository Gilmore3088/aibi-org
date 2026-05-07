// GET /api/dev/skip-login
//
// Development-only "skip login" that creates a real Supabase auth session
// (cookies and all) instead of the previous sessionStorage flag — that
// flag was never read by any server code, so every page navigation
// appeared to log the user out.
//
// Hard-coded NODE_ENV guard: production returns 404 regardless of env
// vars or query strings.
//
// Flow:
//   1. Read the dev email from ?email= query param OR DEV_LOGIN_EMAIL env.
//   2. Use the service-role client to generate a Supabase magic-link
//      action_link for that email (creates the auth.users row implicitly
//      on first use).
//   3. 302 redirect the browser to the action_link. Supabase consumes it
//      server-side, writes the auth cookies, and then redirects to ?next=
//      (or /dashboard).

import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const url = new URL(request.url);
  const email =
    url.searchParams.get('email')?.trim() ||
    process.env.DEV_LOGIN_EMAIL?.trim() ||
    null;
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (!email) {
    return NextResponse.json(
      {
        error:
          'No email available. Pass ?email=you@example.com or set DEV_LOGIN_EMAIL in .env.local.',
      },
      { status: 400 },
    );
  }

  const origin = `${url.protocol}//${url.host}`;
  const redirectTo = next.startsWith('/') ? `${origin}${next}` : next;

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      console.error('[dev/skip-login] generateLink failed:', error);
      return NextResponse.json(
        { error: 'Failed to generate dev sign-in link.' },
        { status: 500 },
      );
    }

    return NextResponse.redirect(data.properties.action_link, { status: 302 });
  } catch (err) {
    console.error('[dev/skip-login] unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal error during dev sign-in.' },
      { status: 500 },
    );
  }
}
