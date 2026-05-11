import type { ChatTurn } from './types';

export interface ChatContinuation {
  readonly allowed: boolean;
  readonly nextRole: ChatTurn['role'] | null;
}

export function nextTurnIndex(turns: readonly ChatTurn[]): number {
  return turns.length + 1;
}

export function canContinueChat(
  turns: readonly ChatTurn[],
  maxPersonaTurns: number,
): ChatContinuation {
  const personaCount = turns.filter((t) => t.role === 'persona').length;
  const last = turns[turns.length - 1];

  if (personaCount >= maxPersonaTurns && last?.role === 'learner') {
    return { allowed: false, nextRole: null };
  }
  if (!last) return { allowed: true, nextRole: 'persona' };
  if (last.role === 'persona') return { allowed: true, nextRole: 'learner' };
  return { allowed: true, nextRole: 'persona' };
}
