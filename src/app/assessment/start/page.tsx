// /assessment/start — redirect to /assessment/take.
//
// "Start" is the intent verb — users (and internal links from /dashboard,
// /not-found, and research articles) follow this route expecting to begin
// the flow, not to read the marketing page. Per the 2026-05-28 mobile
// audit: /assessment/start previously redirected to /assessment, which
// rendered the full 8,703px marketing page on mobile. Now it lands the
// user on the first question of the free 12-question diagnostic.

import { redirect } from "next/navigation";

export default function AssessmentStartRedirect(): never {
  redirect("/assessment/take");
}
