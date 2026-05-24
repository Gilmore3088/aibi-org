'use client';

// InteractiveLessonView — dispatches on lesson.exercise_id to a concrete
// non-LLM widget. Waves 2b + 3a registered widgets across M0/M1/M3/M4/M5.
//
// Sandbox lessons (modality='sandbox') do NOT pass through here — they go
// to SandboxLessonView / SandboxABLessonView, which call /api/sandbox/run.
// Worksheet lessons (modality='worksheet') dispatch in WorksheetLessonView.

import type { LessonPayload } from './types';
import { OffLimitsSorter } from '@/components/addie/interactives/m0/OffLimitsSorter';
import { ToolLandscapeMatrix } from '@/components/addie/interactives/m1/ToolLandscapeMatrix';
import { SpotTheViolation } from '@/components/addie/interactives/m3/SpotTheViolation';
import { SkillBuilder } from '@/components/addie/interactives/m4/SkillBuilder';
import { SkillTester } from '@/components/addie/interactives/m4/SkillTester';
import { PRDBuilder } from '@/components/addie/interactives/m5/PRDBuilder';
import { PrototypeLauncher } from '@/components/addie/interactives/m5/PrototypeLauncher';

interface InteractiveLessonViewProps {
  readonly payload: LessonPayload;
}

export function InteractiveLessonView({ payload }: InteractiveLessonViewProps) {
  const exerciseId = payload.lesson.exercise_id;
  const descriptor = payload.interactiveExercise ?? null;
  const track = payload.activeTrack ?? null;

  if (exerciseId && descriptor) {
    switch (exerciseId) {
      case 'm0-2-off-limits-sorter':
        return <OffLimitsSorter exerciseDescriptor={descriptor} track={track} />;
      case 'm1-2-tool-landscape':
        return <ToolLandscapeMatrix exerciseDescriptor={descriptor} />;
      case 'm3-4-spot-the-violation':
        return <SpotTheViolation exerciseDescriptor={descriptor} />;
      case 'm4-2-build-first-skill':
        return <SkillBuilder exerciseDescriptor={descriptor} mode="template" track={track} />;
      case 'm4-3-role-skill':
        return <SkillBuilder exerciseDescriptor={descriptor} mode="role-skill" track={track} />;
      case 'm4-4-test-refine':
        return <SkillTester exerciseDescriptor={descriptor} />;
      case 'm5-3-prd-builder':
        return <PRDBuilder exerciseDescriptor={descriptor} track={track} />;
      case 'm5-4-prototype-launch':
        return <PrototypeLauncher exerciseDescriptor={descriptor} track={track} />;
      default:
        break;
    }
  }

  const body = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  return (
    <div>
      <p className="text-sm text-[var(--ledger-muted)] mb-3">
        Interactive (exercise: {exerciseId ?? '—'}). Widget not registered.
      </p>
      {body ? (
        <div className="whitespace-pre-wrap font-serif text-[var(--ledger-ink)]">{body}</div>
      ) : null}
    </div>
  );
}
