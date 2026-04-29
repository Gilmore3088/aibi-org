'use client';

import { useEffect, useReducer } from 'react';
import type { Unit, UnitLearnerState, ChatTurn, RubricScore } from '../../../../../../../../lib/aibi-s/types';
import { advance, initialState, canAdvance, type Action } from '../../../../../../../../lib/aibi-s/beat-state';
import { loadUnitState, saveUnitState, clearUnitState } from '../../../../../../../../lib/aibi-s/persist';
import { CourseItemHeader } from '@/lib/course-harness/CourseItemHeader';
import { CourseTabs } from '@/lib/course-harness/CourseTabs';
import type { TabDef, ResolvedCourseItem, ResolvedCourseSection, CourseConfig } from '@/lib/course-harness/types';
import { LearnBeat } from './LearnBeat';
import { PracticeBeat } from './PracticeBeat';
import { ApplyBeat } from './ApplyBeat';
import { DefendBeat } from './DefendBeat';
import { RefineBeat } from './RefineBeat';
import { CaptureBeat } from './CaptureBeat';

function reducer(state: UnitLearnerState, action: { unit: Unit; action: Action }): UnitLearnerState {
  return advance(action.unit, state, action.action);
}

interface UnitRendererProps {
  readonly unit: Unit;
  readonly resolvedItem: ResolvedCourseItem;
  readonly resolvedSection: ResolvedCourseSection;
  readonly config: CourseConfig;
}

export function UnitRenderer({ unit, resolvedItem, resolvedSection, config }: UnitRendererProps) {
  const saved = typeof window !== 'undefined' ? loadUnitState(unit.id) : null;
  const [state, dispatch] = useReducer(reducer, saved ?? initialState(unit));

  useEffect(() => { saveUnitState(state); }, [state]);

  const mayAdvance = canAdvance(unit, state);
  const doAction = (a: Action) => dispatch({ unit, action: a });

  // Group beats by phase (Learn / Build / Strategize)
  const learnBeat = unit.beats.find((b) => b.kind === 'learn');
  const practiceBeat = unit.beats.find((b) => b.kind === 'practice');
  const applyBeat = unit.beats.find((b) => b.kind === 'apply');
  const defendBeat = unit.beats.find((b) => b.kind === 'defend');
  const refineBeat = unit.beats.find((b) => b.kind === 'refine');
  const captureBeat = unit.beats.find((b) => b.kind === 'capture');

  return (
    <div>
      <CourseItemHeader
        item={resolvedItem}
        section={resolvedSection}
        config={config}
        estimatedMinutes={45}
        keyOutput="AI Governance Policy"
      />

      <article className="mx-auto px-8 lg:px-16 py-4">
        <CourseTabs
          storageKey="aibi-s-u-1.1"
          accentColor="var(--color-cobalt)"
          tabs={[
            {
              id: 'learn',
              label: 'Learn',
              sublabel: 'Read the material',
              content: (
                <div className="space-y-8">
                  {learnBeat && learnBeat.kind === 'learn' && (
                    <LearnBeat beat={learnBeat} onAdvance={() => doAction({ type: 'advance' })} />
                  )}
                </div>
              ),
            },
            {
              id: 'build',
              label: 'Build',
              sublabel: 'Practice, apply, defend',
              content: (
                <div className="space-y-12">
                  {practiceBeat && practiceBeat.kind === 'practice' && (
                    <PracticeBeat
                      beat={practiceBeat}
                      selectedOptionId={state.practiceChoice}
                      onChoose={(id) => doAction({ type: 'practiceChoose', optionId: id })}
                      onAdvance={() => doAction({ type: 'advance' })}
                    />
                  )}
                  {applyBeat && applyBeat.kind === 'apply' && (
                    <ApplyBeat
                      beat={applyBeat}
                      value={state.applyResponse}
                      onChange={(v) => doAction({ type: 'applyWrite', text: v })}
                      onAdvance={() => doAction({ type: 'advance' })}
                      canAdvance={mayAdvance}
                    />
                  )}
                  {defendBeat && defendBeat.kind === 'defend' && (
                    <DefendBeat
                      beat={defendBeat}
                      rebuttal={state.rebuttal}
                      onRebuttalChange={(v) => doAction({ type: 'rebuttalWrite', text: v })}
                      turns={state.chatTurns}
                      onAppendTurn={(t: ChatTurn) => doAction({ type: 'chatAppend', turn: t })}
                      score={state.rubricScore}
                      onScore={(s: RubricScore) => doAction({ type: 'rubricScore', score: s })}
                      onAdvance={() => doAction({ type: 'advance' })}
                    />
                  )}
                </div>
              ),
            },
            {
              id: 'strategize',
              label: 'Strategize',
              sublabel: 'Refine and capture',
              content: (
                <div className="space-y-12">
                  {refineBeat && refineBeat.kind === 'refine' && state.rubricScore && (
                    <RefineBeat
                      beat={refineBeat}
                      originalRebuttal={state.rebuttal}
                      score={state.rubricScore}
                      refined={state.refinedRebuttal}
                      onRefine={(v) => doAction({ type: 'refineWrite', text: v })}
                      onAdvance={() => doAction({ type: 'advance' })}
                      canAdvance={mayAdvance}
                    />
                  )}
                  {refineBeat && refineBeat.kind === 'refine' && !state.rubricScore && (
                    <p className="text-sm text-[color:var(--color-ink)]/60">
                      Complete the Build phase first — you&apos;ll refine your defended artifact here once graded.
                    </p>
                  )}
                  {captureBeat && captureBeat.kind === 'capture' && (
                    <CaptureBeat
                      beat={captureBeat}
                      state={state}
                      onCapture={() => doAction({ type: 'capture' })}
                      captured={state.capturedAt !== null}
                    />
                  )}
                </div>
              ),
            },
          ] satisfies TabDef[]}
        />

        <footer className="pt-8 mt-8 border-t border-[color:var(--color-ink)]/10">
          <button
            onClick={() => { if (confirm('Clear your progress for this unit?')) { clearUnitState(unit.id); window.location.reload(); } }}
            className="text-xs text-[color:var(--color-ink)]/50 hover:underline"
          >
            Reset unit progress (prototype only)
          </button>
        </footer>
      </article>
    </div>
  );
}
