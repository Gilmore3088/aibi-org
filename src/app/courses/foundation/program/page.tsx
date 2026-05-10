// /courses/aibi-p — top-level redirect to /courses/foundation.
//
// Per the 2026-05-10 decision, the marketing URL for the active AiBI-
// Foundation course moved from /courses/aibi-p to /courses/foundation.
// The deep routes under /courses/aibi-p/* (modules, settings, certificate,
// purchase, dashboard, etc.) remain in place so existing buyers'
// bookmarks continue to resolve to their course content. Only the bare
// overview redirects.
//
// The previous 287-line sales/progress page is in git history; revert
// this file to that commit if the redirect needs to be undone.

import { redirect } from 'next/navigation';

export default function CourseAibiPRedirect(): never {
  redirect('/courses/foundation');
}
