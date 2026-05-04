// src/app/api/toolbox/library/[slug]/fork/route.ts
//
// Plan C — POST /api/toolbox/library/[slug]/fork
// Copies a Library Skill version into the user's personal toolbox_skills.
// Body: { versionId?: string } — defaults to current version when omitted.

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import {
  forkLibrarySkill,
  getLibrarySkill,
} from '@/lib/toolbox/library';

interface ForkBody {
  versionId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });

  // Resolve user id from session (access.userId may not be set on all paths;
  // re-fetching keeps the route self-contained).
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const userId = userData.user.id;

  const { slug } = await params;

  let body: ForkBody = {};
  try {
    body = (await request.json().catch(() => ({}))) as ForkBody;
  } catch {
    body = {};
  }

  try {
    const detail = await getLibrarySkill(slug);
    if (!detail) return NextResponse.json({ error: 'Library skill not found.' }, { status: 404 });

    const versionId = body.versionId ?? detail.currentVersion.id;

    const { id } = await forkLibrarySkill({
      ownerId: userId,
      librarySkillId: detail.skill.id,
      versionId,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fork failed.' },
      { status: 500 }
    );
  }
}
