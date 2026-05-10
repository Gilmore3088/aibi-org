// Foundation Lite track — module map.
// 4 modules · 90 minutes · mandatory bank-wide · $99 per learner.

import type { Track } from '../types';
import { TRACK_META } from '../types';
import { moduleL1 } from './module-L1';
import { moduleL2 } from './module-L2';
import { moduleL3 } from './module-L3';
import { moduleL4 } from './module-L4';

export const liteModules = [moduleL1, moduleL2, moduleL3, moduleL4] as const;

export const liteTrack: Track = {
  ...TRACK_META.lite,
  modules: liteModules,
} as const;

export function getLiteModule(position: string) {
  return liteModules.find((m) => m.trackPosition === position);
}
