// Plausible analytics was removed on 2026-05-10. This module is kept as a
// stub so existing callsites compile; trackEvent is a no-op.
// Delete this file and remove the imports if you want a hard cleanup.

export type AssessmentTierId =
  | 'starting-point'
  | 'early-stage'
  | 'building-momentum'
  | 'ready-to-scale';

export type PlausibleEventName = string;

export function trackEvent(
  _name: PlausibleEventName,
  _props?: Record<string, string | number | boolean>,
): void {
  // no-op
}
