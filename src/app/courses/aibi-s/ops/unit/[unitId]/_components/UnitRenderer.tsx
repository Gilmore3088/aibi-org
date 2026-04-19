'use client';

import { useEffect, useReducer } from 'react';
import type { Unit, UnitLearnerState, ChatTurn, RubricScore } from '../../../../../../../../lib/aibi-s/types';
import { advance, initialState, canAdvance, type Action } from '../../../../../../../../lib/aibi-s/beat-state';
import { loadUnitState, saveUnitState, clearUnitState } from '../../../../../../../../lib/aibi-s/persist';
import { LearnBeat } from './LearnBeat';
import { PracticeBeat } from './PracticeBeat';
import { ApplyBeat } from './ApplyBeat';
import { DefendBeat } from './DefendBeat';
import { RefineBeat } from './RefineBeat';
import { CaptureBeat } from './CaptureBeat';

function reducer(state: UnitLearnerState, action: { unit: Unit; action: Action }): UnitLearnerState {
  return advance(action.unit, state, action.action);
}

export function UnitRenderer({ unit }: { readonly unit: Unit }) {
  const saved = typeof window !== 'undefined' ? loadUnitState(unit.id) : null;
  const [state, dispatch] = useReducer(reducer, saved ?? initialState(unit));

  useEffect(() => { saveUnitState(state); }, [state]);

  const beat = unit.beats[state.currentBeatIndex];
  const mayAdvance = canAdvance(unit, state);

  const doAction = (a: Action) => dispatch({ unit, action: a });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <header className="flex justify-between items-baseline">
        <h1 className="font-serif text-4xl">{unit.title}</h1>
        <span className="text-xs font-mono text-[color:var(--color-ink)]/60">
          Beat {state.currentBeatIndex + 1} / {unit.beats.length}
        </span>
      </header>
      <p className="text-lg italic">{unit.summary}</p>

      {beat.kind === 'learn' && (
        <LearnBeat beat={beat} onAdvance={() => doAction({ type: 'advance' })} />
      )}
      {beat.kind === 'practice' && (
        <PracticeBeat
          beat={beat}
          selectedOptionId={state.practiceChoice}
          onChoose={(id) => doAction({ type: 'practiceChoose', optionId: id })}
          onAdvance={() => doAction({ type: 'advance' })}
        />
      )}
      {beat.kind === 'apply' && (
        <ApplyBeat
          beat={beat}
          value={state.applyResponse}
          onChange={(v) => doAction({ type: 'applyWrite', text: v })}
          onAdvance={() => doAction({ type: 'advance' })}
          canAdvance={mayAdvance}
        />
      )}
      {beat.kind === 'defend' && (
        <DefendBeat
          beat={beat}
          rebuttal={state.rebuttal}
          onRebuttalChange={(v) => doAction({ type: 'rebuttalWrite', text: v })}
          turns={state.chatTurns}
          onAppendTurn={(t: ChatTurn) => doAction({ type: 'chatAppend', turn: t })}
          score={state.rubricScore}
          onScore={(s: RubricScore) => doAction({ type: 'rubricScore', score: s })}
          onAdvance={() => doAction({ type: 'advance' })}
        />
      )}
      {beat.kind === 'refine' && state.rubricScore && (
        <RefineBeat
          beat={beat}
          originalRebuttal={state.rebuttal}
          score={state.rubricScore}
          refined={state.refinedRebuttal}
          onRefine={(v) => doAction({ type: 'refineWrite', text: v })}
          onAdvance={() => doAction({ type: 'advance' })}
          canAdvance={mayAdvance}
        />
      )}
      {beat.kind === 'capture' && (
        <CaptureBeat
          beat={beat}
          state={state}
          onCapture={() => doAction({ type: 'capture' })}
          captured={state.capturedAt !== null}
        />
      )}

      <footer className="pt-8 border-t border-[color:var(--color-ink)]/10">
        <button
          onClick={() => { if (confirm('Clear your progress for this unit?')) { clearUnitState(unit.id); window.location.reload(); } }}
          className="text-xs text-[color:var(--color-ink)]/50 hover:underline"
        >
          Reset unit progress (prototype only)
        </button>
      </footer>
    </div>
  );
}
