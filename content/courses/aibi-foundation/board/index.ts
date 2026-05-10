// Board Briefing — module map.
// 2 modules · 60 minutes · no prereq · $295/director or $1,495 flat board rate.

import type { Track } from '../types';
import { TRACK_META } from '../types';
import { moduleBB1 } from './module-BB1';
import { moduleBB2 } from './module-BB2';

export const boardModules = [moduleBB1, moduleBB2] as const;

export const boardTrack: Track = {
  ...TRACK_META.board,
  modules: boardModules,
} as const;

export function getBoardModule(position: string) {
  return boardModules.find((m) => m.trackPosition === position);
}
