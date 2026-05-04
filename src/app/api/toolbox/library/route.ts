// src/app/api/toolbox/library/route.ts
//
// Plan C — GET /api/toolbox/library
// Lists Library Skills with optional pillar/category/kind filters.

import { NextResponse } from 'next/server';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { listLibrarySkills } from '@/lib/toolbox/library';
import type { ToolboxKind, ToolboxPillar } from '@/lib/toolbox/types';

const VALID_PILLARS: ReadonlyArray<ToolboxPillar> = ['A', 'B', 'C'];
const VALID_KINDS: ReadonlyArray<ToolboxKind> = ['workflow', 'template'];

export async function GET(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const rawPillar = searchParams.get('pillar');
  const rawCategory = searchParams.get('category');
  const rawKind = searchParams.get('kind');

  if (rawPillar && !VALID_PILLARS.includes(rawPillar as ToolboxPillar)) {
    return NextResponse.json({ error: 'Invalid pillar.' }, { status: 400 });
  }
  if (rawKind && !VALID_KINDS.includes(rawKind as ToolboxKind)) {
    return NextResponse.json({ error: 'Invalid kind.' }, { status: 400 });
  }

  try {
    const skills = await listLibrarySkills({
      pillar: (rawPillar as ToolboxPillar | null) ?? undefined,
      category: rawCategory ?? undefined,
      kind: (rawKind as ToolboxKind | null) ?? undefined,
    });
    return NextResponse.json({ skills });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Library fetch failed.' },
      { status: 500 }
    );
  }
}
