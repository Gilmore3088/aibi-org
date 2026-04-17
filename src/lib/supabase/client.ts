// Supabase client module — server + browser factories.
// Import from here; never create new Supabase instances elsewhere.
// Uses @supabase/ssr for App Router compatibility.

import {
  createBrowserClient as ssrCreateBrowserClient,
  createServerClient as ssrCreateServerClient,
} from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MISSING_CONFIG_MSG =
  'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.';

const MISSING_SERVICE_ROLE_MSG =
  'Service role key not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local.';

/**
 * Returns true when both required env vars are present.
 * Use this to guard code paths before calling any client factory.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

/**
 * Browser client — use in Client Components ('use client').
 * Maintains session via cookies automatically.
 */
export function createBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(MISSING_CONFIG_MSG);
  }
  return ssrCreateBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Server client — use in Server Components, Route Handlers, and Server Actions.
 * Reads/writes cookies via the provided cookie store to keep the session in sync.
 *
 * Usage in Server Component:
 *   import { cookies } from 'next/headers';
 *   const supabase = createServerClient(cookies());
 *
 * Usage in Route Handler:
 *   const supabase = createServerClient(cookieStore);
 */
export function createServerClient(cookieStore: {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  delete(name: string, options: CookieOptions): void;
}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(MISSING_CONFIG_MSG);
  }
  return ssrCreateServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // set() throws in Server Components — safe to ignore; middleware keeps session alive.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete(name, options);
        } catch {
          // delete() throws in Server Components — safe to ignore.
        }
      },
    },
  });
}

/**
 * Server client using the getAll/setAll cookie pattern — use in Server Components,
 * Route Handlers, and Server Actions that need to read the auth session.
 *
 * This accepts the ReadonlyRequestCookies object returned by next/headers `cookies()`.
 * Prefer this over `createServerClient` for auth-sensitive code (login, session checks).
 *
 * Usage:
 *   import { cookies } from 'next/headers';
 *   const supabase = createServerClientWithCookies(await cookies());
 */
export function createServerClientWithCookies(cookieStore: {
  getAll(): Array<{ name: string; value: string }>;
}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(MISSING_CONFIG_MSG);
  }
  return ssrCreateServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // setAll is intentionally omitted — session is kept alive by middleware.
      // Auth callbacks that need to set cookies use the full middleware pattern.
    },
  });
}

/**
 * Service role client — bypasses RLS.
 * Use ONLY in server-side code (Route Handlers, Server Actions, webhooks).
 * Never expose or use in Client Components.
 *
 * Use cases: Stripe webhook enrollment writes, reviewer queue updates,
 * certificate generation — any operation that must act on behalf of the system.
 */
export function createServiceRoleClient() {
  if (!SUPABASE_URL) {
    throw new Error(MISSING_CONFIG_MSG);
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(MISSING_SERVICE_ROLE_MSG);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
