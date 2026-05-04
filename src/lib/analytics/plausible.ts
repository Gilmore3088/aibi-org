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
  | 'toolbox_skill_exported'
  | 'prompt_cards_page_view'
  | 'prompt_card_email_submit'
  | 'prompt_card_view'
  | 'prompt_card_prompt_copy'
  | 'prompt_card_expand_click'
  | 'prompt_card_pdf_download'
  | 'prompt_card_course_click'
  // Auth funnel — added in feature/auth-audit (2026-05-01) so we can see
  // sign-up completion rate, sign-in success rate, and password recovery
  // usage. Failures are intentionally NOT tracked here: they're a noisy
  // security signal that belongs in server logs, not the marketing funnel.
  | 'signup_initiated'
  | 'signup_completed'
  | 'signin_succeeded'
  | 'magic_link_sent'
  | 'signout'
  | 'password_reset_requested'
  | 'password_reset_completed';

export function trackEvent(
  name: PlausibleEventName,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.plausible !== 'function') return;
  window.plausible(name, props ? { props } : undefined);
}
