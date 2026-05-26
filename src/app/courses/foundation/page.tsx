// /courses/foundation — canonical course URL
//
// The marketing landing for AiBI-Foundation lives at /courses (the
// catalog page covers Foundation in full — syllabus, $295 pricing,
// enrollment CTA). This top-level redirect ensures the shorter URL
// lands on the public marketing page instead of bouncing visitors
// into the gated LMS at /courses/foundation/program.
//
// Operator decision 2026-05-26: drop the redirect-into-LMS bug —
// the consumer journey is now Foundation link → /courses → Enroll
// → /courses/foundation/program/purchase (Stripe).

import { redirect } from 'next/navigation';

export default function FoundationOverviewPage() {
  // /courses itself 308s to /education (see next.config.mjs).
  // Send the consumer there directly to skip the redirect chain.
  redirect('/education');
}
