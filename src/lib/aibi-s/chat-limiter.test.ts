import { describe, it, expect } from 'vitest';
import { canContinueChat, nextTurnIndex } from './chat-limiter';
import type { ChatTurn } from './types';

const turn = (role: ChatTurn['role'], idx: number, content = '...'): ChatTurn =>
  ({ role, turnIndex: idx, content });

describe('chat-limiter', () => {
  it('allows the first persona turn when no turns exist', () => {
    expect(canContinueChat([], 3)).toEqual({ allowed: true, nextRole: 'persona' });
  });

  it('requires learner turn after each persona turn', () => {
    const turns = [turn('persona', 1)];
    expect(canContinueChat(turns, 3)).toEqual({ allowed: true, nextRole: 'learner' });
  });

  it('allows next persona turn after a learner response', () => {
    const turns = [turn('persona', 1), turn('learner', 2)];
    expect(canContinueChat(turns, 3)).toEqual({ allowed: true, nextRole: 'persona' });
  });

  it('blocks once maxTurns reached (counting persona prompts only)', () => {
    const turns = [
      turn('persona', 1), turn('learner', 2),
      turn('persona', 3), turn('learner', 4),
      turn('persona', 5), turn('learner', 6),
    ];
    expect(canContinueChat(turns, 3)).toEqual({ allowed: false, nextRole: null });
  });

  it('blocks midway if persona turn count is at max and learner has responded', () => {
    const turns = [
      turn('persona', 1), turn('learner', 2),
      turn('persona', 3), turn('learner', 4),
      turn('persona', 5), turn('learner', 6),
    ];
    expect(canContinueChat(turns, 3).allowed).toBe(false);
  });

  it('nextTurnIndex is 1 for empty transcript', () => {
    expect(nextTurnIndex([])).toBe(1);
  });

  it('nextTurnIndex increments correctly', () => {
    const turns = [turn('persona', 1), turn('learner', 2)];
    expect(nextTurnIndex(turns)).toBe(3);
  });
});
