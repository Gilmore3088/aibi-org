import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { AIBI_P_ARTIFACTS } from '@content/practice-reps/foundation-program';

interface CompletePracticeRepBody {
  readonly courseId?: unknown;
  readonly repId?: unknown;
  readonly response?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  let body: CompletePracticeRepBody;
  try {
    body = (await request.json()) as CompletePracticeRepBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.courseId !== 'string' || body.courseId.trim() === '') {
    return NextResponse.json({ error: 'courseId is required.' }, { status: 400 });
  }

  if (typeof body.repId !== 'string' || body.repId.trim() === '') {
    return NextResponse.json({ error: 'repId is required.' }, { status: 400 });
  }

  const supabase = createServerClientWithCookies(cookies());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { error } = await supabase.from('practice_rep_completions').upsert(
    {
      user_id: user.id,
      course_id: body.courseId,
      rep_id: body.repId,
      response: body.response ?? null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,course_id,rep_id' },
  );

  if (error) {
    return NextResponse.json({ error: 'Failed to save practice rep.' }, { status: 500 });
  }

  const linkedArtifacts = AIBI_P_ARTIFACTS.filter(
    (artifact) =>
      artifact.courseId === body.courseId &&
      artifact.sourceActivityId === body.repId,
  );

  if (linkedArtifacts.length > 0) {
    const { error: artifactError } = await supabase.from('user_artifacts').upsert(
      linkedArtifacts.map((artifact) => ({
        user_id: user.id,
        course_id: body.courseId as string,
        artifact_id: artifact.id,
        status: 'completed',
        source_activity_id: artifact.sourceActivityId,
        metadata: {
          completedBy: body.repId,
          completedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'user_id,course_id,artifact_id' },
    );

    if (artifactError) {
      return NextResponse.json(
        { error: 'Practice rep saved, but artifact status could not be updated.' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
