// Typed analytics events for Vercel Analytics.
//
// Vercel Analytics' `track()` accepts an event name + flat property bag.
// This module gives every callable surface a single typed function so:
//   - The event name is fixed (typos caught at compile time).
//   - The property shape is documented next to the call site.
//   - Server-side and client-side callers use the same names.
//
// Use these from any client component:
//   import { trackAssessmentComplete } from '@/lib/analytics/events';
//   trackAssessmentComplete({ tier: 'building-momentum', score: 28 });
//
// For server-side events (webhook handlers, API routes), use the server
// counterpart imported from '@vercel/analytics/server' — same event names,
// same props.

import { track } from '@vercel/analytics';

/**
 * Fired when /assessment loads. Not a conversion event — just measures
 * top-of-funnel volume.
 */
export function trackAssessmentStart(): void {
  track('assessment_start');
}

/**
 * Fired when the user's score is calculated and shown (the page transitions
 * from question phase to score phase). Always fires whether or not email
 * is captured.
 */
export function trackAssessmentComplete(props: {
  readonly tier: string;
  readonly score: number;
}): void {
  track('assessment_complete', { ...props });
}

/**
 * Fired when /api/capture-email returns 200 (or its client wrapper resolves).
 * The conversion event. {tier} matches the assessment's resulting tier.
 */
export function trackEmailCaptured(props: { readonly tier: string }): void {
  track('email_captured', { ...props });
}

/**
 * Fired when the user clicks the Calendly CTA. Captures which surface they
 * came from so we can attribute briefings to traffic source.
 */
export function trackBriefingBooked(props: {
  readonly source: 'assessment' | 'services' | 'home' | 'cta' | 'results';
}): void {
  track('briefing_booked', { ...props });
}

/**
 * Fired when the user clicks an Enroll/Purchase CTA (before Stripe redirect).
 * Pairs with purchase_completed on success.
 */
export function trackPurchaseInitiated(props: {
  readonly product: 'foundation' | 'in-depth-assessment' | 'aibi-s' | 'aibi-l';
  readonly mode?: 'individual' | 'institution';
}): void {
  track('purchase_initiated', { ...props });
}

/**
 * Fired from the Stripe webhook handler after a successful provision.
 * Server-side only — use `@vercel/analytics/server` track at the call site.
 * Documented here so the event name and props stay in sync.
 *
 * Note: this client wrapper exists for completeness but will rarely fire
 * client-side — the post-checkout success page may use it to mirror the
 * server-side event for client-side dashboards.
 */
export function trackPurchaseCompleted(props: {
  readonly product: 'foundation' | 'in-depth-assessment' | 'aibi-s' | 'aibi-l';
  readonly amountUsd: number;
}): void {
  track('purchase_completed', { ...props });
}

/**
 * Fired when a learner completes a module (advances current_module).
 */
export function trackModuleCompleted(props: {
  readonly moduleNumber: number;
}): void {
  track('module_completed', { ...props });
}

/**
 * Fired when the Foundation exam submits.
 */
export function trackExamCompleted(props: {
  readonly pct: number;
  readonly proficiency: string;
}): void {
  track('exam_completed', { ...props });
}

/**
 * Fired when a certificate is first issued (on capstone approval).
 */
export function trackCertificateIssued(props: {
  readonly certificateId: string;
}): void {
  track('certificate_issued', { ...props });
}
