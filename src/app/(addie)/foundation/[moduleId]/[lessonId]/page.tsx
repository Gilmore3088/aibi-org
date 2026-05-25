// /foundation/[moduleId]/[lessonId] — lesson player.
// Server component: loads the lesson + module + variant + checks + sibling
// pointers, then delegates to LessonPlayer.

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import Link from 'next/link';
import { LessonPlayer } from '@/components/addie/lesson/LessonPlayer';
import { LessonStepPlayer } from '@/components/addie/lesson/LessonStepPlayer';
import { ModalityView } from '@/components/addie/lesson/ModalityView';
import { LessonObjectiveBeat } from '@/components/addie/lesson/LessonObjectiveBeat';
import { LessonTransferBeat } from '@/components/addie/lesson/LessonTransferBeat';
import { NextLessonCTA } from '@/components/addie/lesson/NextLessonCTA';
import { EmbeddedExercise } from '@/components/addie/lesson/EmbeddedExercise';
import { KnowledgeCheck } from '@/components/addie/lesson/KnowledgeCheck';
import { SaveTakeawayCTA } from '@/components/addie/lesson/SaveTakeawayCTA';
import { CourseSidebar } from '@/components/addie/shell/CourseSidebar';
import { PaywallPreview } from '@/components/addie/lesson/PaywallPreview';
import { LessonTOC } from '@/components/addie/lesson/LessonTOC';
import { extractHeadings } from '@/components/addie/lesson/lessonHeadings';
import { LessonTutor } from '@/components/addie/lesson/LessonTutor';
import { LessonSummaryCard } from '@/components/addie/lesson/LessonSummaryCard';
import { MaturityJourney } from '@/components/addie/lesson/MaturityJourney';
import { ToolboxAccumulation } from '@/components/addie/lesson/ToolboxAccumulation';
import { TrackChrome } from '@/components/addie/lesson/TrackChrome';
import { MaturityCelebration } from '@/components/addie/lesson/MaturityCelebration';
import { ProactiveTutorSuggestion } from '@/components/addie/lesson/ProactiveTutorSuggestion';
import { M02Experience } from '@/components/addie/lesson/v2/M02Experience';
import { M01Experience } from '@/components/addie/lesson/v2/M01Experience';
import { LessonCoachDrawer } from '@/components/addie/lesson/v2/LessonCoachDrawer';
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
        'id, module_id, ordinal, title, modality, duration_min, is_branched, exercise_id, takeaway_artifact_type, body_md, objective_md, transfer_md, published, shell_kind',
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
      .select('id, lesson_id, ordinal, prompt, options, kind')
      .eq('lesson_id', lessonId)
      .order('ordinal', { ascending: true });

    const { data: siblings } = await svc
      .from('lessons')
      .select('id, ordinal, title')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('ordinal', { ascending: true });
    const idx = (siblings ?? []).findIndex((s) => s.id === lessonId);
    const prevWithin = idx > 0 ? siblings![idx - 1] : null;
    const nextWithin =
      siblings && idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

    // Cross-module continuation: when we're on the last lesson of a module,
    // look up the next module's first lesson so the player flows continuously
    // without bouncing through /foundation/dashboard.
    let next = nextWithin;
    let prev = prevWithin;
    let nextModuleId: string | null = null;
    let prevModuleId: string | null = null;
    if (!nextWithin) {
      const { data: nextMod } = await svc
        .from('modules')
        .select('id, ordinal')
        .eq('published', true)
        .gt('ordinal', (m as { ordinal: number }).ordinal)
        .order('ordinal', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (nextMod) {
        const { data: firstOfNext } = await svc
          .from('lessons')
          .select('id, ordinal, title')
          .eq('module_id', nextMod.id as string)
          .eq('published', true)
          .order('ordinal', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (firstOfNext) {
          next = firstOfNext;
          nextModuleId = nextMod.id as string;
        }
      }
    }
    if (!prevWithin) {
      const { data: prevMod } = await svc
        .from('modules')
        .select('id, ordinal')
        .eq('published', true)
        .lt('ordinal', (m as { ordinal: number }).ordinal)
        .order('ordinal', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prevMod) {
        const { data: lastOfPrev } = await svc
          .from('lessons')
          .select('id, ordinal, title')
          .eq('module_id', prevMod.id as string)
          .eq('published', true)
          .order('ordinal', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastOfPrev) {
          prev = lastOfPrev;
          prevModuleId = prevMod.id as string;
        }
      }
    }

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
        .select(
          'id, mode, task_scaffold, preset_context_blocks, levers, data_slots, default_provider, allow_provider_switch, published',
        )
        .eq('id', lessonRow.exercise_id)
        .eq('published', true)
        .maybeSingle();
      if (ex) {
        const blocks = (ex.preset_context_blocks as unknown as Array<{
          id: string;
          label: string;
          body?: string;
        }>) ?? [];
        // Strip lever option payloads to client-safe id+label shape; the
        // server-only lever_directives never reach this query (we don't
        // select them). Same for system_prompt.
        const rawLevers = (ex.levers as unknown as Array<{
          key: string;
          label: string;
          type: 'toggle' | 'select';
          options: Array<{ id: string; label: string }>;
        }>) ?? [];
        const levers = rawLevers.map((l) => ({
          key: l.key,
          label: l.label,
          type: l.type,
          options: (l.options ?? []).map((o) => ({ id: o.id, label: o.label })),
        }));
        const rawSlots = (ex.data_slots as unknown as Array<{
          key: string;
          label: string;
          maxChars: number;
          required: boolean;
          piiCheck: true;
        }>) ?? [];
        const data_slots = rawSlots.map((s) => ({
          key: s.key,
          label: s.label,
          maxChars: s.maxChars,
          required: s.required,
          piiCheck: true as const,
        }));
        interactiveExercise = {
          id: ex.id as string,
          exercise_id: ex.id as string,
          task_scaffold: (ex.task_scaffold as string | null) ?? null,
          preset_context_blocks: blocks,
          levers,
          data_slots,
          default_provider:
            (ex.default_provider as 'anthropic' | 'openai' | 'google' | null) ??
            'anthropic',
          allow_provider_switch: Boolean(ex.allow_provider_switch),
          mode: (ex.mode as 'single' | 'ab' | 'skill' | null) ?? 'single',
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
        prev: prev
          ? {
              id: prev.id as string,
              title: prev.title as string,
              moduleId: prevModuleId ?? moduleId,
            }
          : null,
        next: next
          ? {
              id: next.id as string,
              title: next.title as string,
              moduleId: nextModuleId ?? moduleId,
            }
          : null,
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

async function loadLockedModuleLessons(
  moduleId: string,
): Promise<Array<{ ordinal: number; title: string; duration_min: number }>> {
  try {
    const svc = getAddieServiceClient();
    const { data } = await svc
      .from('lessons')
      .select('ordinal, title, duration_min')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('ordinal', { ascending: true });
    return ((data as Array<{ ordinal: number; title: string; duration_min: number }> | null) ?? []);
  } catch {
    return [];
  }
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
      const lockedLessons = await loadLockedModuleLessons(payload.module.id);
      return (
        <PaywallPreview
          moduleId={payload.module.id}
          moduleOrdinal={payload.module.ordinal}
          moduleTitle={payload.module.title}
          moduleSummary={payload.module.summary}
          lessons={lockedLessons}
        />
      );
    }
  }

  const bodyForToc = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  const headings = extractHeadings(bodyForToc);

  // m0.1 — onboarding shell (not a lesson page). Per 2026-05-24 critique:
  // the first screen sells "why I'm here," not "what lesson am I in."
  if (payload.lesson.id === 'm0.1') {
    return (
      <div className="min-h-screen pb-32">
        <M01Experience
          initialTrack={payload.activeTrack ?? null}
          nextHref="/foundation/m0/m0.2"
        />
      </div>
    );
  }

  // v2 lesson shell — currently opt-in per lesson. m0.2 is the first
  // migration; future lessons add themselves here as the v2 shell rolls out.
  // See docs/Foundation-Course-ADDIE/AiBI_Lesson_Shell_Migration.md.
  const useV2Shell = payload.lesson.id === 'm0.2';
  if (useV2Shell) {
    const nextHref = payload.siblings?.next
      ? `/foundation/${payload.siblings.next.moduleId}/${payload.siblings.next.id}`
      : null;
    return (
      <div className="min-h-screen pb-32">
        <M02Experience
          checks={payload.checks}
          interactiveExercise={payload.interactiveExercise ?? null}
          track={payload.activeTrack ?? null}
          nextHref={nextHref}
          nextLabel={payload.siblings?.next?.title ?? null}
        />
        {/* PRD §11 — m0.2-scoped Coach drawer with six static chip answers.
            Hybrid free-text route deferred (next-up ticket). */}
        <LessonCoachDrawer />
        {/* Generic tutor remains available across other lesson shells. */}
        <LessonTutor lessonId={params.lessonId} />
      </div>
    );
  }

  // Phase 1 Guided Lesson Shell (2026-05-25). Opt-in per lesson via
  // addie.lessons.shell_kind = 'step'. M0.1 + M0.2 branch on lesson_id
  // above and ignore this column. Everything else falls through to
  // LessonPlayer (legacy long-scroll) unless flipped to 'step' here.
  if (payload.lesson.shell_kind === 'step') {
    const nextHref = payload.siblings?.next
      ? `/foundation/${payload.siblings.next.moduleId}/${payload.siblings.next.id}`
      : null;
    const crossesModule = payload.siblings?.next?.moduleId !== payload.module.id;
    const embedExercise =
      !!payload.interactiveExercise &&
      payload.lesson.modality !== 'interactive' &&
      payload.lesson.modality !== 'worksheet';

    return (
      <div className="min-h-screen pb-32">
        <LessonStepPlayer
          payload={payload}
          objectiveNode={
            payload.lesson.objective_md ? (
              <LessonObjectiveBeat objective={payload.lesson.objective_md} />
            ) : undefined
          }
          modalityNode={<ModalityView payload={payload} />}
          exerciseNode={embedExercise ? <EmbeddedExercise payload={payload} /> : undefined}
          knowledgeCheckNode={<KnowledgeCheck checks={payload.checks} />}
          saveTakeawayNode={
            <SaveTakeawayCTA
              lessonId={payload.lesson.id}
              artifactType={payload.lesson.takeaway_artifact_type}
              moduleTier={payload.module.tier}
            />
          }
          transferNode={
            payload.lesson.transfer_md ? (
              <LessonTransferBeat transfer={payload.lesson.transfer_md} />
            ) : undefined
          }
          nextCTANode={
            <NextLessonCTA
              nextHref={nextHref}
              nextLabel={payload.siblings?.next?.title}
              nextCrossesModule={crossesModule}
              endOfCourse={!payload.siblings?.next}
              gateNext={payload.gateNext ?? false}
            />
          }
        />
        <LessonTutor lessonId={params.lessonId} />
      </div>
    );
  }

  // MaturityJourney intentionally NOT rendered on individual lesson pages —
  // the breadcrumb + sidebar already locate the learner, and stacking a 4th
  // horizontal nav strip above the lesson body crowds the read. The arc is
  // surfaced on /foundation home + /foundation/dashboard.
  return (
    <div>
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-6 pb-32 flex flex-col lg:flex-row gap-8 lg:gap-10">
      <aside className="lg:order-first">
        <CourseSidebar activeModuleId={params.moduleId} activeLessonId={params.lessonId} />
      </aside>
      <div className="flex-1 min-w-0 lg:max-w-[700px]">
        <TrackChrome
          activeTrack={payload.activeTrack ?? null}
          moduleId={params.moduleId}
          lessonId={params.lessonId}
        />
        <LessonPlayer payload={payload} />
        {/* AI-generated 3-sentence recap of this lesson. Cached per
            (lesson, identity) in addie.events. Renders nothing on
            generation failure. */}
        <LessonSummaryCard
          lessonId={params.lessonId}
          lessonTitle={payload.lesson.title}
        />
        {/* Proactive tutor: pattern-detection over saved artifacts.
            Renders nothing when no pattern matches; dismissals
            persist per pattern. */}
        <ProactiveTutorSuggestion />
        {/* The Toolbox is EXPERIENCED, not described — visible
            accumulation at the bottom of every lesson. Per the
            Transformation Vision. */}
        <div className="mt-8">
          <ToolboxAccumulation variant="inline" />
        </div>
      </div>
      <LessonTOC headings={headings} />
      {/* Tutor places itself: xl rail card under the TOC, otherwise a
          fixed bottom-right chip → full-screen sheet. Always mounted. */}
      <LessonTutor lessonId={params.lessonId} />
    </div>
    {/* Stage celebration: client-side, fires once per stage threshold cross. */}
    <MaturityCelebration />
    </div>
  );
}
