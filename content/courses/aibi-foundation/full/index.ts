// Foundation Full — module map.
// 20 modules · 9.5 hours · $495 per learner.
// Pillar order strictly linear (defensible-to-examiners design):
//   Awareness     1-4
//   Understanding 5-10
//   Creation      11-15
//   Application   16-20

import type { Track, FoundationModule } from '../types';
import { TRACK_META } from '../types';

import { module01 } from './module-01';
import { module02 } from './module-02';
import { module03 } from './module-03';
import { module04 } from './module-04';
import { module05 } from './module-05';
import { module06 } from './module-06';
import { module07 } from './module-07';
import { module08 } from './module-08';
import { module09 } from './module-09';
import { module10 } from './module-10';
import { module11 } from './module-11';
import { module12 } from './module-12';
import { module13 } from './module-13';
import { module14 } from './module-14';
import { module15 } from './module-15';
import { module16 } from './module-16';
import { module17 } from './module-17';
import { module18 } from './module-18';
import { module19 } from './module-19';
import { module20 } from './module-20';

export const fullModules: readonly FoundationModule[] = [
  module01, module02, module03, module04, module05,
  module06, module07, module08, module09, module10,
  module11, module12, module13, module14, module15,
  module16, module17, module18, module19, module20,
] as const;

export const fullTrack: Track = {
  ...TRACK_META.full,
  modules: fullModules,
} as const;

export function getFullModule(position: string): FoundationModule | undefined {
  return fullModules.find((m) => m.trackPosition === position);
}
