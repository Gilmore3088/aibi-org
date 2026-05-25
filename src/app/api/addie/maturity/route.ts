// GET /api/addie/maturity
//
// Returns the learner's maturity-arc snapshot: lessonsCompleted +
// artifactsSaved. The MaturityJourney component derives the stage from
// these counts client-side (so we don't need to redeploy the API to
// retune thresholds).
//
// Identity resolution priority — matches the toolbox route:
//   user_id  →  lead_id  →  anon_session_id
//
// Authenticated learners must see their real counts; the previous
// implementation only checked anon_session_id and silently zero'd
// every paid user.

import { NextResponse, type NextRequest } from 'next/server';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MaturityResponse {
  lessonsCompleted: number;
  artifactsSaved: number;
}

const EMPTY: MaturityResponse = { lessonsCompleted: 0, artifactsSaved: 0 };

export async function GET(req: NextRequest): Promise<NextResponse> {
  const identity = await resolveAddieIdentity(req);
  if (!identity.user_id && !identity.lead_id && !identity.anon_session_id) {
    return NextResponse.json(EMPTY);
  }

  try {
    const svc = getAddieServiceClient();

    // Build identity filter for events + toolbox_items. Priority order:
    // user_id wins, then lead_id, then anon_session_id. We OR them so a
    // learner who logs in mid-session still sees their anon-era progress
    // (events keep both columns populated during the bind window).
    const idColumns: Array<{ col: 'user_id' | 'lead_id' | 'anon_session_id'; val: string }> = [];
    if (identity.user_id) idColumns.push({ col: 'user_id', val: identity.user_id });
    if (identity.lead_id) idColumns.push({ col: 'lead_id', val: identity.lead_id });
    if (identity.anon_session_id) idColumns.push({ col: 'anon_session_id', val: identity.anon_session_id });

    const orFilter = idColumns.map((c) => `${c.col}.eq.${c.val}`).join(',');

    const { data: completes } = await svc
      .from('events')
      .select('object_id')
      .eq('action', 'lesson_complete')
      .or(orFilter)
      .not('object_id', 'is', null);

    const distinct = new Set<string>();
    for (const row of (completes ?? []) as { object_id: string | null }[]) {
      if (row.object_id) distinct.add(row.object_id);
    }

    const { count: artifactsSaved } = await svc
      .from('toolbox_items')
      .select('*', { count: 'exact', head: true })
      .or(orFilter);

    return NextResponse.json({
      lessonsCompleted: distinct.size,
      artifactsSaved: artifactsSaved ?? 0,
    });
  } catch (err) {
    console.warn('[addie/maturity] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(EMPTY);
  }
}
