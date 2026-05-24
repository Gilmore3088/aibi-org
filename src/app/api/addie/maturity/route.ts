// GET /api/addie/maturity
//
// Returns the learner's maturity-arc snapshot: lessonsCompleted +
// artifactsSaved + derived stage. Per the transformation vision doc,
// the Aware → Governing arc is the actual curriculum; this endpoint
// is the source of truth the MaturityJourney component reads.
//
// v1 derivation:
//   - lessonsCompleted = distinct lesson_id with action='lesson_complete'
//   - artifactsSaved   = count of addie.toolbox_items rows
//
// Both lookups are scoped to the current identity (user_id OR anon_session_id).

import { NextResponse, type NextRequest } from 'next/server';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { readAnonSession } from '@/lib/addie/auth/anonSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const anonId = readAnonSession(req).id;
  if (!anonId) {
    return NextResponse.json({ lessonsCompleted: 0, artifactsSaved: 0 });
  }

  try {
    const svc = getAddieServiceClient();

    // Count distinct completed lessons for this identity.
    const { data: completes } = await svc
      .from('events')
      .select('object_id')
      .eq('action', 'lesson_complete')
      .eq('anon_session_id', anonId)
      .not('object_id', 'is', null);
    const distinct = new Set<string>();
    for (const row of (completes ?? []) as { object_id: string | null }[]) {
      if (row.object_id) distinct.add(row.object_id);
    }

    // Count saved artifacts (Toolbox items) for this identity.
    const { count: artifactsSaved } = await svc
      .from('toolbox_items')
      .select('*', { count: 'exact', head: true })
      .eq('anon_session_id', anonId);

    return NextResponse.json({
      lessonsCompleted: distinct.size,
      artifactsSaved: artifactsSaved ?? 0,
    });
  } catch (err) {
    console.warn('[addie/maturity] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ lessonsCompleted: 0, artifactsSaved: 0 });
  }
}
