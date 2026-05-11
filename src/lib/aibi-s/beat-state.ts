import type { Unit, UnitLearnerState, RubricScore, ChatTurn } from './types';

export type Action =
  | { type: 'advance' }
  | { type: 'practiceChoose'; optionId: string }
  | { type: 'applyWrite'; text: string }
  | { type: 'rebuttalWrite'; text: string }
  | { type: 'chatAppend'; turn: ChatTurn }
  | { type: 'rubricScore'; score: RubricScore }
  | { type: 'refineWrite'; text: string }
  | { type: 'capture' };

export function initialState(unit: Unit): UnitLearnerState {
  return {
    unitId: unit.id,
    currentBeatIndex: 0,
    practiceChoice: null,
    applyResponse: '',
    rebuttal: '',
    chatTurns: [],
    rubricScore: null,
    refinedRebuttal: '',
    capturedAt: null,
  };
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function canAdvance(unit: Unit, state: UnitLearnerState): boolean {
  const beat = unit.beats[state.currentBeatIndex];
  if (!beat) return false;
  switch (beat.kind) {
    case 'learn':
      return true;
    case 'practice':
      return state.practiceChoice !== null;
    case 'apply':
      return wordCount(state.applyResponse) >= beat.minWords;
    case 'defend':
      return state.rubricScore !== null;
    case 'refine':
      return state.refinedRebuttal.trim().length > 0;
    case 'capture':
      return state.capturedAt !== null;
  }
}

export function advance(
  unit: Unit,
  state: UnitLearnerState,
  action: Action,
): UnitLearnerState {
  switch (action.type) {
    case 'advance': {
      if (!canAdvance(unit, state)) return state;
      const next = state.currentBeatIndex + 1;
      if (next >= unit.beats.length) return state;
      return { ...state, currentBeatIndex: next };
    }
    case 'practiceChoose':
      return { ...state, practiceChoice: action.optionId };
    case 'applyWrite':
      return { ...state, applyResponse: action.text };
    case 'rebuttalWrite':
      return { ...state, rebuttal: action.text };
    case 'chatAppend':
      return { ...state, chatTurns: [...state.chatTurns, action.turn] };
    case 'rubricScore':
      return { ...state, rubricScore: action.score };
    case 'refineWrite':
      return { ...state, refinedRebuttal: action.text };
    case 'capture':
      return { ...state, capturedAt: new Date().toISOString() };
  }
}
