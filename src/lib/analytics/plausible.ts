// Safe wrapper around the Plausible deferred queue.
// Import and call from any client component — no-op on the server.

export type AssessmentTierId =
  | 'starting-point'
  | 'early-stage'
  | 'building-momentum'
  | 'ready-to-scale';

export type PlausibleEventName =
  | 'assessment_start'
  | 'assessment_complete'
  | 'email_captured'
  | 'briefing_booked'
  | 'purchase_initiated'
  | 'toolbox_skill_saved'
  | 'toolbox_scenario_run'
  | 'toolbox_skill_exported';

export function trackEvent(
  name: PlausibleEventName,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.plausible !== 'function') return;
  window.plausible(name, props ? { props } : undefined);
}
