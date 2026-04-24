import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';

interface SavedPromptBody {
  readonly courseId?: unknown;
  readonly promptId?: unknown;
}

async function getAuthedClient() {
  const supabase = createServerClientWithCookies(cookies());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

async function parseBody(request: Request): Promise<SavedPromptBody | null> {
  try {
    return (await request.json()) as SavedPromptBody;
  } catch {
    return null;
  }
}

function validateBody(body: SavedPromptBody | null): { courseId: string; promptId: string } | null {
  if (!body) return null;
  if (typeof body.courseId !== 'string' || body.courseId.trim() === '') return null;
  if (typeof body.promptId !== 'string' || body.promptId.trim() === '') return null;
  return { courseId: body.courseId, promptId: body.promptId };
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const parsed = validateBody(await parseBody(request));
  if (!parsed) {
    return NextResponse.json({ error: 'courseId and promptId are required.' }, { status: 400 });
  }

  const { supabase, user } = await getAuthedClient();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { error } = await supabase.from('saved_prompts').upsert(
    {
      user_id: user.id,
      course_id: parsed.courseId,
      prompt_id: parsed.promptId,
    },
    { onConflict: 'user_id,course_id,prompt_id' },
  );

  if (error) {
    return NextResponse.json({ error: 'Failed to save prompt.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const parsed = validateBody(await parseBody(request));
  if (!parsed) {
    return NextResponse.json({ error: 'courseId and promptId are required.' }, { status: 400 });
  }

  const { supabase, user } = await getAuthedClient();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { error } = await supabase
    .from('saved_prompts')
    .delete()
    .eq('user_id', user.id)
    .eq('course_id', parsed.courseId)
    .eq('prompt_id', parsed.promptId);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove saved prompt.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
