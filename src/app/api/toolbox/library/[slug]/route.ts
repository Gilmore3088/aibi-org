// src/app/api/toolbox/library/[slug]/route.ts
//
// Plan C — GET /api/toolbox/library/[slug]
// Returns one Library Skill plus its current version content.

import { NextResponse } from 'next/server';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { getLibrarySkill } from '@/lib/toolbox/library';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });

  const { slug } = await params;

  try {
    const result = await getLibrarySkill(slug);
    if (!result) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Library fetch failed.' },
      { status: 500 }
    );
  }
}
