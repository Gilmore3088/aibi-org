// /foundation/[moduleId]/[lessonId] — lesson player.
// Server component: loads the lesson + module + variant + checks + sibling
// pointers, then delegates to LessonPlayer.

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { LessonPlayer } from '@/components/addie/lesson/LessonPlayer';
import type {
  LessonPayload,
  LessonRow,
  ModuleRow,
  TrackVariant,
  KnowledgeCheckRow,
  Track,
} from '@/components/addie/lesson/types';

export const dynamic = 'force-dynamic';

async function loadActiveTrack(): Promise<Track | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    const cookieStore = await cookies();
    const supa = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* no-op */
        },
      },
    });
    const { data } = await supa.auth.getUser();
    if (!data.user) return null;
    const svc = getAddieServiceClient();
    const { data: profile } = await svc
      .from('learner_profiles')
      .select('track')
      .eq('user_id', data.user.id)
      .maybeSingle();
    return (profile?.track as Track | null) ?? null;
  } catch {
    return null;
  }
}

async function loadPayload(
  moduleId: string,
  lessonId: string,
): Promise<LessonPayload | null> {
  try {
    const svc = getAddieServiceClient();
    const { data: lesson } = await svc
      .from('lessons')
      .select(
        'id, module_id, ordinal, title, modality, duration_min, is_branched, exercise_id, takeaway_artifact_type, body_md, published',
      )
      .eq('id', lessonId)
      .eq('module_id', moduleId)
      .eq('published', true)
      .maybeSingle();
    if (!lesson) return null;
    const { data: m } = await svc
      .from('modules')
      .select('id, ordinal, title, tier, summary')
      .eq('id', moduleId)
      .maybeSingle();
    if (!m) return null;

    const activeTrack = await loadActiveTrack();

    let variant: TrackVariant | null = null;
    if (lesson.is_branched && activeTrack) {
      const { data: v } = await svc
        .from('lesson_track_variants')
        .select('lesson_id, track, body_md, media_ref')
        .eq('lesson_id', lessonId)
        .eq('track', activeTrack)
        .maybeSingle();
      if (v) {
        variant = {
          lesson_id: v.lesson_id as string,
          track: v.track as Track,
          body_md: v.body_md as string,
          media_ref: (v.media_ref as string | null) ?? null,
        };
      }
    }

    const { data: checks } = await svc
      .from('knowledge_checks')
      .select('id, lesson_id, ordinal, prompt, options')
      .eq('lesson_id', lessonId)
      .order('ordinal', { ascending: true });

    const { data: siblings } = await svc
      .from('lessons')
      .select('id, ordinal, title')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('ordinal', { ascending: true });
    const idx = (siblings ?? []).findIndex((s) => s.id === lessonId);
    const prev = idx > 0 ? siblings![idx - 1] : null;
    const next = siblings && idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

    return {
      lesson: lesson as LessonRow,
      module: m as ModuleRow,
      variant,
      activeTrack,
      checks: (checks ?? []) as KnowledgeCheckRow[],
      siblings: {
        prev: prev ? { id: prev.id as string, title: prev.title as string } : null,
        next: next ? { id: next.id as string, title: next.title as string } : null,
      },
    };
  } catch (err) {
    console.warn('[lesson page] load failed:', err);
    return null;
  }
}

export default async function LessonPage({
  params,
}: {
  params: { moduleId: string; lessonId: string };
}) {
  const payload = await loadPayload(params.moduleId, params.lessonId);
  if (!payload) notFound();
  return <LessonPlayer payload={payload} />;
}
