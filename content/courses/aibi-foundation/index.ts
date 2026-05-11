// AiBI-Foundation v2 — top-level course index.
// Four-track product family under one credential.
// Canonical reference: Plans/foundation-v2/AIBI-FOUNDATION-COMPLETE.md
// Decision context: CLAUDE.md → Decisions Log → 2026-05-09 entry

import type { Track, TrackId, FoundationModule } from './types';
import { liteTrack } from './lite';
import { fullTrack } from './full';
import { managerTrack } from './manager';
import { boardTrack } from './board';

export * from './types';
export * from './refresh-slots';

export const tracks: readonly Track[] = [
  liteTrack,
  fullTrack,
  managerTrack,
  boardTrack,
] as const;

export function getTrack(id: TrackId): Track | undefined {
  return tracks.find((t) => t.id === id);
}

export function getModule(
  trackId: TrackId,
  trackPosition: string
): FoundationModule | undefined {
  const track = getTrack(trackId);
  return track?.modules.find((m) => m.trackPosition === trackPosition);
}

export { liteTrack, fullTrack, managerTrack, boardTrack };
