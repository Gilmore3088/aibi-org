// Server-side loaders for the ADDIE assessment reader pages.
// These resolve identity via cookies (Supabase session + signed anon cookie)
// and only return rows the viewer owns.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { ANON_SESSION_COOKIE, verifyAnonSessionCookie } from '@/lib/addie/auth/anonSession';

export interface ViewerIdentity {
  readonly user_id: string | null;
  readonly lead_id: string | null;
}

export interface AssessmentResultRow {
  readonly id: string;
  readonly user_id: string | null;
  readonly lead_id: string | null;
  readonly email: string;
  readonly dimension_scores: Record<string, number>;
  readonly plan_md: string | null;
  readonly ideas_prompts_md: string | null;
  readonly ctas_md: string | null;
  readonly created_at: string;
}

export interface AssessmentResultSummary {
  readonly id: string;
  readonly created_at: string;
  readonly total_score: number;
  readonly dimension_count: number;
}

async function readViewerIdentity(): Promise<ViewerIdentity> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cookieStore = await cookies();

  let user_id: string | null = null;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supa = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => cookieStore.getAll(),
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

  let lead_id: string | null = null;
  if (!user_id) {
    const raw = cookieStore.get(ANON_SESSION_COOKIE)?.value ?? null;
    const anon_session_id = verifyAnonSessionCookie(raw);
    if (anon_session_id) {
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
  }

  return { user_id, lead_id };
}

export async function loadOwnAssessmentResults(): Promise<{
  readonly identity: ViewerIdentity;
  readonly results: readonly AssessmentResultSummary[];
}> {
  const identity = await readViewerIdentity();
  if (!identity.user_id && !identity.lead_id) {
    return { identity, results: [] };
  }
  try {
    const svc = getAddieServiceClient();
    let query = svc
      .from('assessment_results')
      .select('id, dimension_scores, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (identity.user_id) query = query.eq('user_id', identity.user_id);
    else if (identity.lead_id) query = query.eq('lead_id', identity.lead_id);
    const { data, error } = await query;
    if (error || !data) return { identity, results: [] };

    const results: AssessmentResultSummary[] = data.map((row) => {
      const scores = (row.dimension_scores as Record<string, number>) ?? {};
      const total = Object.values(scores).reduce(
        (acc, n) => acc + (Number.isFinite(n) ? n : 0),
        0,
      );
      return {
        id: row.id as string,
        created_at: row.created_at as string,
        total_score: total,
        dimension_count: Object.keys(scores).length,
      };
    });
    return { identity, results };
  } catch {
    return { identity, results: [] };
  }
}

export async function loadOwnAssessmentResult(id: string): Promise<{
  readonly identity: ViewerIdentity;
  readonly result: AssessmentResultRow | null;
}> {
  const identity = await readViewerIdentity();
  if (!identity.user_id && !identity.lead_id) {
    return { identity, result: null };
  }
  try {
    const svc = getAddieServiceClient();
    const { data, error } = await svc
      .from('assessment_results')
      .select(
        'id, user_id, lead_id, email, dimension_scores, plan_md, ideas_prompts_md, ctas_md, created_at',
      )
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return { identity, result: null };
    const row = data as unknown as AssessmentResultRow;
    const owns =
      (identity.user_id && row.user_id === identity.user_id) ||
      (identity.lead_id && row.lead_id === identity.lead_id);
    if (!owns) return { identity, result: null };
    return { identity, result: row };
  } catch {
    return { identity, result: null };
  }
}
