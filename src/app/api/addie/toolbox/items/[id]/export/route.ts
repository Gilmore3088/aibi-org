// GET /api/addie/toolbox/items/:id/export — stream the latest version as .md.
// Wave 2a addition. v1 streams directly rather than minting a signed Storage
// URL (artifacts live in Postgres, not Storage, today).

import { NextResponse, type NextRequest } from 'next/server';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { getItem } from '@/lib/addie/toolbox/items';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeFilename(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'artifact';
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }
  const identity = await resolveAddieIdentity(req);
  if (!identity.user_id && !identity.lead_id) {
    return NextResponse.json({ error: 'no_identity' }, { status: 401 });
  }

  try {
    const out = await getItem(params.id, {
      user_id: identity.user_id,
      lead_id: identity.lead_id,
    });
    if (!out) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const latest = out.versions[0]?.body_md ?? '';
    const name = `${safeFilename(out.item.title)}.md`;
    return new NextResponse(latest, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/toolbox/items/:id/export] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
