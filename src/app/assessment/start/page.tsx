// /assessment/start — redirect to /assessment.
//
// The two-tile decision page that lived here duplicated content already
// available on /education (the assessment catalog block). Existing links
// across the codebase still point to /assessment/start; rather than
// rewriting every reference, this route now performs a server-side
// redirect to /assessment. Visitors who want to choose between the free
// 12-question diagnostic and the paid In-Depth start on /education.

import { redirect } from "next/navigation";

export default function AssessmentStartRedirect(): never {
  redirect("/assessment");
}
