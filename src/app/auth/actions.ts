'use server';

// Server actions for auth flows. Keep these here so client components
// can call signOut / sendMagicLink without importing the Supabase browser
// client — otherwise the SDK (+ Web3 auth providers) gets bundled into
// every page that mounts a client component referencing those helpers.

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeNext } from '@/lib/supabase/auth';

export async function sendMagicLinkAction(
  email: string,
  redirectTo?: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured.' };
  }
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const proto = requestHeaders.get('x-forwarded-proto') ?? 'https';
  const origin = host ? `${proto}://${host}` : 'https://aibankinginstitute.com';
  const next = sanitizeNext(redirectTo);
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  return { error: error?.message ?? null };
}

export async function signOutAction(): Promise<void> {
  // Clear every Supabase auth cookie. The @supabase/ssr cookie names
  // follow the pattern `sb-<project-ref>-auth-token[.<chunk>]`, so we
  // delete anything starting with `sb-`. Doing this directly (rather
  // than calling supabase.auth.signOut()) means this server action does
  // not import the Supabase SDK, so AuthDropdown — its only caller —
  // stays free of any Supabase JS in the client bundle.
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name);
    }
  }
  redirect('/');
}
