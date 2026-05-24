// GET /api/addie/assessment/results/[id]
// Returns a single saved In-Depth Readiness Assessment if the requester owns
// it (user_id match OR lead_id match via the signed anon-session cookie chain).
// Service-role read, ownership enforced in code (addie.* is not exposed via
// PostgREST).

import { NextResponse, type NextRequest } from 'next/server';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ResultRow {
  id: string;
  user_id: string | null;
  lead_id: string | null;
  email: string;
  raw_answers: unknown;
  dimension_scores: Record<string, number>;
  plan_md: string | null;
  ideas_prompts_md: string | null;
  ctas_md: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const id = params.id;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const identity = await resolveAddieIdentity(req);
  if (!identity.user_id && !identity.lead_id) {
    return NextResponse.json({ error: 'not_authorized' }, { status: 401 });
  }

  try {
    const supa = getAddieServiceClient();
    const { data, error } = await supa
      .from('assessment_results')
      .select(
        'id, user_id, lead_id, email, raw_answers, dimension_scores, plan_md, ideas_prompts_md, ctas_md, stripe_session_id, created_at',
      )
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[api/addie/assessment/results/[id] GET] select failed:', error.message);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    const row = data as unknown as ResultRow;
    const owns =
      (identity.user_id && row.user_id === identity.user_id) ||
      (identity.lead_id && row.lead_id === identity.lead_id);
    if (!owns) {
      // Don't leak existence to non-owners.
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ result: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/assessment/results/[id] GET] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
