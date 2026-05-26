'use client';

// EmbeddedExercise — renders the matching interactive widget for a
// lesson when its modality is something else (video / audio / reading)
// and an exercise_id is set. Mirrors the dispatch table in
// InteractiveLessonView but wraps each widget in a labeled "Try it"
// frame so the embedded use is visually distinct from the
// primary-modality interactive lessons.

import { OffLimitsSorter } from '@/components/addie/interactives/m0/OffLimitsSorter';
import { ToolLandscapeMatrix } from '@/components/addie/interactives/m1/ToolLandscapeMatrix';
import { SpotTheViolation } from '@/components/addie/interactives/m3/SpotTheViolation';
import { SkillBuilder } from '@/components/addie/interactives/m4/SkillBuilder';
import { SkillTester } from '@/components/addie/interactives/m4/SkillTester';
import { WorkbenchPackBuilder } from '@/components/addie/interactives/m4/WorkbenchPackBuilder';
import { PRDBuilder } from '@/components/addie/interactives/m5/PRDBuilder';
import { PrototypeLauncher } from '@/components/addie/interactives/m5/PrototypeLauncher';
import { ProblemFrame } from '@/components/addie/interactives/m5/ProblemFrame';
import { WhereAIFitsWorksheet } from '@/components/addie/interactives/m2/WhereAIFitsWorksheet';
import type { LessonPayload } from './types';

interface EmbeddedExerciseProps {
  readonly payload: LessonPayload;
}

export function EmbeddedExercise({ payload }: EmbeddedExerciseProps) {
  const exerciseId = payload.lesson.exercise_id;
  const descriptor = payload.interactiveExercise;
  const track = payload.activeTrack ?? null;
  if (!exerciseId || !descriptor) return null;

  const widget = renderWidget(exerciseId, descriptor, track);
  if (!widget) return null;

  return (
    <section
      aria-labelledby="embedded-exercise-heading"
      className="my-10 border border-[var(--ledger-accent)] rounded-[4px] bg-[color-mix(in_srgb,var(--ledger-accent)_4%,var(--ledger-paper))]"
    >
      <header className="px-5 py-3 border-b border-[color-mix(in_srgb,var(--ledger-accent)_30%,transparent)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="addie-chip" data-tone="accent">
            Try it
          </span>
          <h2
            id="embedded-exercise-heading"
            className="font-serif text-lg text-[var(--ledger-ink)]"
          >
            {labelFor(exerciseId)}
          </h2>
        </div>
        <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
          Hands-on
        </span>
      </header>
      <div className="p-5">{widget}</div>
    </section>
  );
}

function labelFor(id: string): string {
  switch (id) {
    case 'm0-2-off-limits-sorter':
      return 'Sort the off-limits items';
    case 'm1-2-tool-landscape':
      return 'Browse the tool landscape';
    case 'm2-4-where-ai-fits':
      return 'Your week — where AI fits';
    case 'm3-4-spot-the-violation':
      return 'Spot the violation';
    case 'm4-2-build-first-skill':
      return 'Build your first Workbench Pack';
    case 'm4-3-role-skill':
      return 'Build a Pack for your role';
    case 'm4-4-test-refine':
      return 'Test + refine the Pack';
    case 'm5-2-problem-frame':
      return 'Frame the problem';
    case 'm5-3-prd-builder':
      return 'Draft the lightweight PRD';
    case 'm5-4-prototype-launch':
      return 'Launch the prototype';
    default:
      return 'Exercise';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderWidget(id: string, descriptor: any, track: any): JSX.Element | null {
  switch (id) {
    case 'm0-2-off-limits-sorter':
      return <OffLimitsSorter exerciseDescriptor={descriptor} track={track} />;
    case 'm1-2-tool-landscape':
      return <ToolLandscapeMatrix exerciseDescriptor={descriptor} />;
    case 'm2-4-where-ai-fits':
      return <WhereAIFitsWorksheet exerciseDescriptor={descriptor} track={track} />;
    case 'm3-4-spot-the-violation':
      return <SpotTheViolation exerciseDescriptor={descriptor} />;
    case 'm4-2-build-first-skill':
      return (
        <WorkbenchPackBuilder
          initialSourcePacket={'A draft adverse-action letter (synthetic): a $5,800 unsecured loan denial. The denial reason field reads "credit history insufficient." The letter as drafted does not name the specific reasons under ECOA/Reg B. Tighten the writing and surface a complete reason list. Do not invent reasons not implied by "credit history insufficient." Member: synthetic; no real identifiers.'}
        />
      );
    case 'm4-3-role-skill':
      return (
        <WorkbenchPackBuilder
          initialSourcePacket={'A track-defaulted synthetic source for your role. (Track pre-load wiring is a follow-up — for now, edit Region 01 to your week\'s most-recurring artifact: vendor questionnaire response, Reg-E summary for tellers, process-memo rewrite, board talking points, or member-fee-complaint reply.)'}
        />
      );
    case 'm4-4-test-refine':
      return (
        <WorkbenchPackBuilder
          initialSourcePacket={'Test the Pack you built in M4.2 or M4.3 on a NEW realistic synthetic source — different complaint, different reg excerpt, different proposal. Walk the four guardrail questions. Flip use_boundary to "named-task production" only if the Pack will run recurrently against real institution material with outputs that leave your desktop.'}
        />
      );
    case 'm5-2-problem-frame':
      return <ProblemFrame exerciseDescriptor={descriptor} track={track} />;
    case 'm5-3-prd-builder':
      return <PRDBuilder exerciseDescriptor={descriptor} track={track} />;
    case 'm5-4-prototype-launch':
      return <PrototypeLauncher exerciseDescriptor={descriptor} track={track} />;
    default:
      return null;
  }
}
