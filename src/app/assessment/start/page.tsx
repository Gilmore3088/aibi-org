// /assessment/start — legacy redirect to /assessment/take.
//
// As of the 2026-06-01 flow audit, internal UI links point DIRECTLY at
// /assessment/take so a live click never pays a redirect hop. This route is
// retained only as back-compat for external/bookmarked/old links that still
// say "/assessment/start" (it is the "intent verb" URL used in email and
// print copy). It lands the user on the first question of the free
// 12-question diagnostic — not the marketing page (per the 2026-05-28 mobile
// audit, which fixed an earlier redirect to the 8,703px /assessment page).

import { redirect } from "next/navigation";

export default function AssessmentStartRedirect(): never {
  redirect("/assessment/take");
}
