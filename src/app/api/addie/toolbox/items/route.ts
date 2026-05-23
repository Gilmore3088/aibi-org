// GET  /api/addie/toolbox/items — list own Toolbox artifacts
// POST /api/addie/toolbox/items — create a new artifact (enforces 4-cap on free tier)
// Wave 2a addition.

import { NextResponse, type NextRequest } from 'next/server';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import {
  createItem,
  isArtifactType,
  listItemsFor,
  FREE_TIER_ARTIFACT_CAP,
} from '@/lib/addie/toolbox/items';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const identity = await resolveAddieIdentity(req);
  if (!identity.user_id && !identity.lead_id) {
    return NextResponse.json({ items: [] });
  }
  try {
    const items = await listItemsFor({
      user_id: identity.user_id,
      lead_id: identity.lead_id,
    });
    return NextResponse.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/toolbox/items GET] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

interface CreateBody {
  type?: unknown;
  title?: unknown;
  body_md?: unknown;
  lesson_id?: unknown;
  track?: unknown;
}

const VALID_TRACKS: ReadonlySet<string> = new Set([
  'risk_compliance',
  'customer_facing',
  'back_office',
  'technical',
  'leadership',
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-toolbox-create',
    limit: 30,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  const identity = await resolveAddieIdentity(req);
  if (!identity.user_id && !identity.lead_id) {
    return NextResponse.json({ error: 'no_identity', cap: FREE_TIER_ARTIFACT_CAP }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!isArtifactType(body.type)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }
  if (typeof body.title !== 'string' || body.title.trim().length === 0 || body.title.length > 200) {
    return NextResponse.json({ error: 'invalid_title' }, { status: 400 });
  }
  if (typeof body.body_md !== 'string' || body.body_md.length === 0 || body.body_md.length > 50000) {
    return NextResponse.json({ error: 'invalid_body_md' }, { status: 400 });
  }
  const lesson_id =
    typeof body.lesson_id === 'string' && body.lesson_id.length <= 32 ? body.lesson_id : null;
  const track =
    typeof body.track === 'string' && VALID_TRACKS.has(body.track) ? body.track : null;

  try {
    const result = await createItem({
      identity: { user_id: identity.user_id, lead_id: identity.lead_id },
      type: body.type,
      title: body.title.trim(),
      body_md: body.body_md,
      lesson_id,
      track,
    });
    if (result.capped) {
      return NextResponse.json(
        { error: 'free_tier_cap', cap: FREE_TIER_ARTIFACT_CAP },
        { status: 402 },
      );
    }
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/toolbox/items POST] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
