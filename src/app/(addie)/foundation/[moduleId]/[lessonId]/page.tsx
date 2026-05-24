// /foundation/[moduleId]/[lessonId] — lesson player.
// Server component: loads the lesson + module + variant + checks + sibling
// pointers, then delegates to LessonPlayer.

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import Link from 'next/link';
import { LessonPlayer } from '@/components/addie/lesson/LessonPlayer';
import { CourseSidebar } from '@/components/addie/shell/CourseSidebar';
import { hasAnyFoundationEntitlement } from '@/lib/addie/entitlements/check';
import type {
  LessonPayload,
  LessonRow,
  ModuleRow,
  TrackVariant,
  KnowledgeCheckRow,
  Track,
  InteractiveExercisePayload,
} from '@/components/addie/lesson/types';
import {
  GATE_TRIGGER_MODULE_ID,
  GATE_TRIGGER_LESSON_ID,
} from '@/lib/addie/courses/gateTrigger';

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

    // Non-LLM interactive/worksheet widgets need preset_context_blocks bodies.
    // We fetch the full exercise row server-side via service_role and forward
    // ONLY the client-safe fields + preset block bodies. system_prompt and
    // lever_directives never leave the server. Loaded for every modality so
    // video + audio lessons that have a paired widget (M0.2, M1.2, M3.4,
    // M5.2 per Screen Inventory §3.4) can also render it inline.
    let interactiveExercise: InteractiveExercisePayload | null = null;
    const lessonRow = lesson as LessonRow;
    if (lessonRow.exercise_id) {
      const { data: ex } = await svc
        .from('exercises')
        .select('id, task_scaffold, preset_context_blocks, published')
        .eq('id', lessonRow.exercise_id)
        .eq('published', true)
        .maybeSingle();
      if (ex) {
        const blocks = (ex.preset_context_blocks as unknown as Array<{
          id: string;
          label: string;
          body?: string;
        }>) ?? [];
        interactiveExercise = {
          id: ex.id as string,
          exercise_id: ex.id as string,
          task_scaffold: (ex.task_scaffold as string | null) ?? null,
          preset_context_blocks: blocks,
        };
      }
    }

    // m3.5 completion routes to the three-way gate, not the next module.
    const gateNext =
      lessonRow.module_id === GATE_TRIGGER_MODULE_ID &&
      lessonRow.id === GATE_TRIGGER_LESSON_ID;

    return {
      lesson: lessonRow,
      module: m as ModuleRow,
      variant,
      activeTrack,
      checks: (checks ?? []) as KnowledgeCheckRow[],
      siblings: {
        prev: prev ? { id: prev.id as string, title: prev.title as string } : null,
        next: next ? { id: next.id as string, title: next.title as string } : null,
      },
      interactiveExercise,
      gateNext,
    };
  } catch (err) {
    console.warn('[lesson page] load failed:', err);
    return null;
  }
}

async function getAuthUserId(): Promise<string | null> {
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
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

function PaywallScreen({
  moduleTitle,
  moduleId,
}: {
  readonly moduleTitle: string;
  readonly moduleId: string;
}) {
  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
      <p className="font-mono uppercase tracking-wider text-xs text-[var(--ledger-muted)]">
        Paid module · {moduleId}
      </p>
      <h1 className="mt-3 font-serif text-3xl text-[var(--ledger-ink)]">
        {moduleTitle}
      </h1>
      <p className="mt-4 text-[var(--ledger-ink-2)]">
        This module is part of the paid Foundation course. You can buy individual
        access for $295, or your team admin can invite you to a team seat.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/foundation/gate" className="inline-block">
          <span className="font-mono uppercase tracking-wider text-sm rounded-[2px] border border-[var(--ledger-ink)] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] px-5 py-2.5">
            See your options →
          </span>
        </Link>
        <Link
          href="/foundation"
          className="text-sm text-[var(--ledger-muted)] underline underline-offset-4"
        >
          Back to course home
        </Link>
      </div>
    </article>
  );
}

export default async function LessonPage({
  params,
}: {
  params: { moduleId: string; lessonId: string };
}) {
  const payload = await loadPayload(params.moduleId, params.lessonId);
  if (!payload) notFound();

  // Paid-tier gate. Service-role fetch bypassed RLS, so enforce here.
  if (payload.module.tier === 'paid') {
    const userId = await getAuthUserId();
    const hasAccess = userId ? await hasAnyFoundationEntitlement(userId) : false;
    if (!hasAccess) {
      return <PaywallScreen moduleTitle={payload.module.title} moduleId={payload.module.id} />;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-8 lg:gap-10">
      <aside className="lg:order-first">
        <CourseSidebar activeModuleId={params.moduleId} activeLessonId={params.lessonId} />
      </aside>
      <div className="flex-1 min-w-0">
        <LessonPlayer payload={payload} />
      </div>
    </div>
  );
}
