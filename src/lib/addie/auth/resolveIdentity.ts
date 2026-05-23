// Shared identity resolver for ADDIE UI/API routes.
// Returns {user_id, anon_session_id, lead_id} given a NextRequest.
// - user_id: authenticated learner (Supabase session)
// - lead_id: anonymous lead (anon→lead bind already happened via gate)
// - anon_session_id: pre-lead anonymous viewer

import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { readAnonSession } from './anonSession';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';

export interface ResolvedIdentity {
  readonly user_id: string | null;
  readonly anon_session_id: string | null;
  readonly lead_id: string | null;
}

export async function resolveAddieIdentity(req: NextRequest): Promise<ResolvedIdentity> {
  let user_id: string | null = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supa = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: () => {
            /* no-op */
          },
        },
      });
      const { data } = await supa.auth.getUser();
      user_id = data.user?.id ?? null;
    } catch {
      user_id = null;
    }
  }

  const anon_session_id = readAnonSession(req).id;

  // Resolve lead_id by reverse-lookup through events table — we emit a
  // gate_decision event keyed (lead_id, anon_session_id) at capture time.
  // The most recent such event for this anon cookie identifies the lead.
  let lead_id: string | null = null;
  if (!user_id && anon_session_id) {
    try {
      const svc = getAddieServiceClient();
      const { data } = await svc
        .from('events')
        .select('lead_id')
        .eq('anon_session_id', anon_session_id)
        .not('lead_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      lead_id = (data?.lead_id as string | null) ?? null;
    } catch {
      lead_id = null;
    }
  }

  return { user_id, anon_session_id, lead_id };
}
