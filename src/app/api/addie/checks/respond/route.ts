// POST /api/addie/checks/respond — grade a knowledge-check selection.
// Wave 2a addition (see DECISIONS.md). Rate-limited 20/IP/hr.

import { NextResponse, type NextRequest } from 'next/server';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { gradeKnowledgeCheck } from '@/lib/addie/checks/grade';

export const runtime = 'nodejs';

interface Body {
  check_id?: unknown;
  selected_option?: unknown;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-checks-respond',
    limit: 20,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (typeof body.check_id !== 'string' || !UUID_RE.test(body.check_id)) {
    return NextResponse.json({ error: 'invalid_check_id' }, { status: 400 });
  }
  if (typeof body.selected_option !== 'string' || body.selected_option.length > 64) {
    return NextResponse.json({ error: 'invalid_selected_option' }, { status: 400 });
  }

  const identity = await resolveAddieIdentity(req);
  if (!identity.user_id && !identity.anon_session_id) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  try {
    const result = await gradeKnowledgeCheck({
      check_id: body.check_id,
      selected_option: body.selected_option,
      user_id: identity.user_id,
      anon_session_id: identity.anon_session_id,
    });
    if (!result) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/checks/respond] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
