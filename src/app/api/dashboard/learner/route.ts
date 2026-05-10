import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { AIBI_P_ARTIFACTS } from '@content/practice-reps/aibi-p';

interface EnrollmentRow {
  readonly id: string;
  readonly completed_modules: readonly number[];
  readonly current_module: number;
  readonly enrolled_at: string;
  readonly onboarding_answers: unknown;
}

interface PracticeCompletionRow {
  readonly rep_id: string;
  readonly completed_at: string;
}

interface SavedPromptRow {
  readonly prompt_id: string;
}

interface UserArtifactRow {
  readonly artifact_id: string;
  readonly status: 'available' | 'in-progress' | 'completed' | 'locked';
  readonly updated_at: string;
}

export async function GET(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const supabase = createServerClientWithCookies(cookies());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const [
    enrollmentResult,
    practiceResult,
    promptsResult,
    artifactsResult,
  ] = await Promise.all([
    supabase
      .from('course_enrollments')
      .select('id, completed_modules, current_module, enrolled_at, onboarding_answers')
      .eq('user_id', user.id)
      .in('product', ['aibi-p', 'foundation'])
      .maybeSingle(),
    supabase
      .from('practice_rep_completions')
      .select('rep_id, completed_at')
      .eq('user_id', user.id)
      .in('course_id', ['aibi-p', 'foundation']),
    supabase
      .from('saved_prompts')
      .select('prompt_id')
      .eq('user_id', user.id)
      .in('course_id', ['aibi-p', 'foundation']),
    supabase
      .from('user_artifacts')
      .select('artifact_id, status, updated_at')
      .eq('user_id', user.id)
      .in('course_id', ['aibi-p', 'foundation']),
  ]);

  if (enrollmentResult.error) {
    return NextResponse.json({ error: 'Failed to load enrollment.' }, { status: 500 });
  }

  const enrollment = enrollmentResult.data as EnrollmentRow | null;
  const practiceCompletions = (practiceResult.data ?? []) as PracticeCompletionRow[];
  const savedPrompts = (promptsResult.data ?? []) as SavedPromptRow[];
  const userArtifacts = (artifactsResult.data ?? []) as UserArtifactRow[];

  const completedRepIds = practiceCompletions.map((row) => row.rep_id);
  const currentModule = Math.max(1, enrollment?.current_module ?? 1);
  const completedModules = enrollment?.completed_modules ?? [];
  const artifactRows = AIBI_P_ARTIFACTS.map((artifact) => {
    const persisted = userArtifacts.find((row) => row.artifact_id === artifact.id);
    const sourceRepComplete = completedRepIds.includes(artifact.sourceActivityId);
    const moduleComplete = artifact.moduleNumber
      ? completedModules.includes(artifact.moduleNumber)
      : false;
    const derivedStatus = sourceRepComplete || moduleComplete
      ? 'completed'
      : artifact.moduleNumber && artifact.moduleNumber > currentModule
        ? 'locked'
        : artifact.moduleNumber === currentModule
          ? 'in-progress'
          : 'available';

    return {
      ...artifact,
      status: persisted?.status ?? derivedStatus,
      updatedAt: persisted?.updated_at ?? null,
    };
  });

  return NextResponse.json({
    email: user.email ?? null,
    enrollment: enrollment
      ? {
          id: enrollment.id,
          completedModules: enrollment.completed_modules ?? [],
          currentModule,
          enrolledAt: enrollment.enrolled_at,
          onboardingAnswers: enrollment.onboarding_answers,
        }
      : null,
    practice: {
      completedRepIds,
      completedCount: completedRepIds.length,
      completions: practiceCompletions,
    },
    prompts: {
      savedPromptIds: savedPrompts.map((row) => row.prompt_id),
      savedCount: savedPrompts.length,
    },
    artifacts: artifactRows,
  });
}
