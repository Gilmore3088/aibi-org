/**
 * Service-role Supabase client. Server-only.
 *
 * The repo's main convention is to use `@/lib/supabase`, but on this branch
 * the sandbox-service ships as its own deployable module, so we mirror the
 * pattern locally. Do not import this from any 'use client' file.
 */

import { createClient } from '@supabase/supabase-js';
import { getConfig } from './config';

type AddieClient = ReturnType<typeof makeClient>;

function makeClient() {
  const cfg = getConfig();
  return createClient(cfg.supabaseUrl, cfg.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'addie' },
  });
}

let cached: AddieClient | null = null;

export function getServiceClient(): AddieClient {
  if (!cached) cached = makeClient();
  return cached;
}
