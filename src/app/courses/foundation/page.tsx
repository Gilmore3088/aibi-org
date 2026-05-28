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
  // 2026-05-27: previous implementation redirected to /education which
  // then 308'd to /courses — two hops where one suffices. Per #316 the
  // canonical Foundation detail page is /courses (its H1 is
  // "Learn AI by building reviewed banking workflows" and the entire
  // page is Foundation-centric). Land there directly.
  redirect('/courses');
}
