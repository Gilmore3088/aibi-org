// POST /api/addie/lesson/summary
//
// Returns the 3-sentence recap of the named lesson for the current learner.
// Cache-hit returns instantly; cache-miss generates via Claude Haiku
// (~1.5–2s) and caches the result. Audit §3.2.

import { NextResponse, type NextRequest } from 'next/server';
import { readAnonSession } from '@/lib/addie/auth/anonSession';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';
import { getOrGenerateLessonSummary } from '@/lib/addie/lessonSummary/generate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  lessonId?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit looser than the tutor — these are short generations and
  // cache aggressively. 60/IP/hr accommodates rapid lesson-browsing.
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-lesson-summary',
    limit: 60,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
  }

  const anonId = readAnonSession(req).id;
  // userId would come from Supabase session; for the MVP we use anon
  // identity and let the lead-bind flow associate it later.
  const result = await getOrGenerateLessonSummary({
    lessonId,
    userId: null,
    anonId,
  });

  if (!result) {
    return NextResponse.json({ summary: null, cached: false });
  }
  return NextResponse.json({
    summary: result.summary,
    cached: result.cached,
  });
}
