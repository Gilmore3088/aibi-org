// Manager Track — module map.
// 3 modules · 90 minutes · prerequisite Foundation Full · $195 per supervisor.

import type { Track } from '../types';
import { TRACK_META } from '../types';
import { moduleM1 } from './module-M1';
import { moduleM2 } from './module-M2';
import { moduleM3 } from './module-M3';

export const managerModules = [moduleM1, moduleM2, moduleM3] as const;

export const managerTrack: Track = {
  ...TRACK_META.manager,
  modules: managerModules,
} as const;

export function getManagerModule(position: string) {
  return managerModules.find((m) => m.trackPosition === position);
}
