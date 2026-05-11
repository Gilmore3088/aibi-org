// /courses/foundation — canonical course URL
//
// With the 2026-05-11 reversal of the four-track family, AiBI-Foundation
// is one course. The active product page lives at
// /courses/foundation/program (route shape inherited from the original
// rename — see Plans/refactor-aibi-p-to-foundation-migration.md, Conflict
// 1 → Option B). This top-level route redirects there so visitors who
// typed the shorter URL land on the actual course page.

import { redirect } from 'next/navigation';

export default function FoundationOverviewPage() {
  redirect('/courses/foundation/program');
}
