// GET    /api/addie/toolbox/items/:id        — single item + version history
// PATCH  /api/addie/toolbox/items/:id        — append a new version
// DELETE /api/addie/toolbox/items/:id        — delete (cascades versions)
// Wave 2a addition.

import { NextResponse, type NextRequest } from 'next/server';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { appendVersion, deleteItem, getItem } from '@/lib/addie/toolbox/items';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function withIdentity(
  req: NextRequest,
  id: string,
): Promise<
  | { ok: true; identity: Awaited<ReturnType<typeof resolveAddieIdentity>> }
  | { ok: false; res: NextResponse }
> {
  if (!UUID_RE.test(id)) return { ok: false, res: NextResponse.json({ error: 'invalid_id' }, { status: 400 }) };
  const identity = await resolveAddieIdentity(req);
  if (!identity.user_id && !identity.lead_id) {
    return { ok: false, res: NextResponse.json({ error: 'no_identity' }, { status: 401 }) };
  }
  return { ok: true, identity };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const r = await withIdentity(req, params.id);
  if (!r.ok) return r.res;
  try {
    const out = await getItem(params.id, {
      user_id: r.identity.user_id,
      lead_id: r.identity.lead_id,
    });
    if (!out) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(out);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/toolbox/items/:id GET] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

interface PatchBody {
  body_md?: unknown;
  title?: unknown;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const r = await withIdentity(req, params.id);
  if (!r.ok) return r.res;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (typeof body.body_md !== 'string' || body.body_md.length === 0 || body.body_md.length > 50000) {
    return NextResponse.json({ error: 'invalid_body_md' }, { status: 400 });
  }
  const title =
    typeof body.title === 'string' && body.title.trim().length > 0 && body.title.length <= 200
      ? body.title
      : undefined;
  try {
    const out = await appendVersion(
      params.id,
      body.body_md,
      { user_id: r.identity.user_id, lead_id: r.identity.lead_id },
      { title },
    );
    if (!out) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(out);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/toolbox/items/:id PATCH] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const r = await withIdentity(req, params.id);
  if (!r.ok) return r.res;
  try {
    const ok = await deleteItem(params.id, {
      user_id: r.identity.user_id,
      lead_id: r.identity.lead_id,
    });
    if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/toolbox/items/:id DELETE] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
