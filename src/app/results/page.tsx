import { redirect } from 'next/navigation';

// Bare `/results` (no [id]) has no meaningful state on its own. Users
// land here from stale bookmarks or accidentally-truncated email links.
// Send them back to /assessment so they can either retake (fresh) or
// resume an in-progress session (sessionStorage hydrates the questions
// phase automatically).
//
// Without this handler, App Router falls through to the 404 page —
// recoverable but less direct. The dynamic [id] sibling route handles
// every legitimate /results/<uuid> URL.
export default function ResultsIndex() {
  redirect('/assessment');
}
