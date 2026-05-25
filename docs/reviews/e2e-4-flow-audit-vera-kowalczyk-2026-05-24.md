# Foundation + Assessment — End-to-End 4-Flow Audit
**Reviewer:** Vera Kowalczyk, Sr PM (Plaid / Pinwheel / Truework, 13 yrs)
**Reviewed:** 2026-05-24 · post-Round-1 + P1.3/P1.4 fixes
**Inputs read first:** `foundation-fix-log-2026-05-24.md`, `foundation-critique-synthesis-2026-05-24.html`, code surfaces in `src/app/(addie)/foundation/*`, `src/app/assessment/*`, `src/components/addie/gate/*`.

---

## Headline (3 bullets)

- **The funnel has four front doors and zero hallways.** `/assessment` lives on the legacy route. `/foundation/*` lives in `(addie)`. The gate is its own URL. There is no single state machine that knows which flow a user is in, which means resumability dies at every route boundary. This is the biggest abandonment surface in the product, and it is not a copy problem.
- **The gate foreshadowing fix (P1.3) addresses the *surprise* but not the *equality illusion*.** Three side-by-side `addie-module-card` tiles still read as three equal-weight decisions. Hick's law on cost-shape parity is unresolved. "Three doors. Pick one." is a great line and a bad UI pattern when one door costs $295, one costs an email, and one costs nothing — those are not three doors, they are a price ladder.
- **Mobile resumability is a single point of failure.** sessionStorage holds the free assessment, but nothing binds Carl's progress to *him*. If iOS Safari evicts the tab (which it does aggressively under memory pressure during a phone call), he comes back to a blank `/assessment` and an empty progress bar. The product silently rolls him back to Q1. He will not start over.

---

## Flow 1 — Cold acquisition → first lesson (Edwina Hall, 47, branch mgr, Idaho)

**Context:** Webinar mention drops a URL in chat. Edwina pastes it into Chrome on her ThinkPad between two member appointments. She has ~12 minutes. She is curious, not committed.

### Steps

1. **Lands on `/`.** Sees "Turning Bankers into Builders" + Newsreader hero. Editorial tone reads as serious-not-pushy. *Friction: 0.* This is the peak first-impression moment and the Ledger system carries it.
2. **Scans for "the assessment thing she heard about."** Finds an `assessment` CTA. *Friction: 1 — she does not know whether this is the free 12-Q or the $99 In-Depth, and the hero copy does not disambiguate.* Nielsen #4 (consistency and standards).
3. **Clicks → `/assessment`.** Pre-hydration `AssessmentSkeleton` renders briefly. She does not notice. *Friction: 0.*
4. **Q1 appears.** "One question per view." She picks an answer. Auto-advances? No — there's a Next button. *Friction: 1.* She wants the tap-to-advance pattern of every quiz she has done on her phone. Two taps per question × 12 questions = 24 taps she will count.
5. **Q5 — she sees the same question structure five times in a row.** No interstitial. No "you're a third of the way through." The progress bar is at top, thin, easy to miss in peripheral vision. *Friction: 2.* Zeigarnik effect would help here: a tiny "3 of 12 · ~2 min left" pill in mono caps under the question would lock her in.
6. **Q12.** She clicks Submit. **Email gate appears.** Copy: she has to read it. *Friction: 1.* On desktop the gate is well-mannered. The "first name + email + institution" field count is three, which is one too many — institution can come after the score reveal.
7. **Submits email.** Page scrolls to top (good — there's `window.scrollTo(0, 0)` in `assessment/page.tsx`). `ResultsViewV2` lazy-loads. **Brief blank flash.** *Friction: 2.* The dynamic import has no loading state — `{ ssr: false }` without a `loading` prop means a 200–400ms white gap while the 25KB chunk pulls. On Edwina's office Wi-Fi this is fine. On Carl's break room LTE (Flow 2) this is fatal.
8. **Result page renders.** Score ring, tier, dimension breakdown, starter artifact, three CTAs. *Friction: 1.* The three CTAs are again Pay $295 / Buy $99 / Free course — same Hick's law problem as the gate, three flows back. She has now seen the three-way fork *before she's even started the course.* Pair 1 missed this: the gate is not the surprise. It's a *repeat* of a surprise that already fired here.
9. **She picks "Start the free course."** Lands at `/foundation` (or `/foundation/m0`). *Friction: 1.* The URL structure has no breadcrumb home, and there is no "Welcome, Edwina" personalization despite having captured her first name two pages ago. Peak-end rule — she just gave you her name, use it within 10 seconds.
10. **M0.1 lesson renders.** Honest timing card now reads `6 · 24 · 8–25m` (F7 fixed — good). She skims the lede. *Friction: 0.*
11. **Reads through. Hits the knowledge check.** *Friction: 1.* The KC pattern is fine but the answer feedback after submission is muted — no "got it" peak moment. Compare against any Duolingo lesson finish — the dopamine spike is missing.

**Step count to a checked KC:** 11. **Real time on the clock:** ~6–8 minutes. **Time as it feels to Edwina:** ~10 minutes. She has 4 minutes left in her window.

**"Wait, what?" moments:**
1. **Step 8** — three CTAs after the result. She just gave you an email five seconds ago, why are you asking her to pay $295 now? This violates Nielsen #1 (system status) and the Peak-End rule (your peak should be the *score*, not the upsell stack).
2. **Step 9** — no "welcome back" thread. The system knows her name and her tier and immediately forgets both.
3. **Step 6** — institution field. Half of community bankers will not type their institution name on a free assessment because of an institutional reflex about disclosing data. Defer that field to step 13 or kill it.

**Peak moment:** Score reveal at step 8.
**End moment:** First lesson knowledge-check feedback at step 11 — which is muted. Mismatch.

**Verdict on Flow 1:** Workable, but the funnel leaks at step 8 because you cram the entire monetization triangle into the moment you should be celebrating the user's score. Move the three doors out of the result page and let the result page be the score, period.

---

## Flow 2 — Mobile + interruption (Carl Reyes, 27, MSR, iPhone 14, 35-min lunch, noisy break room)

**Context:** 390pt viewport. Carl's bank pushed him a Slack message about "this AI thing." He has the iPhone Safari tab open while he eats a sandwich. He gets a member phone call at Q5 that pulls him away for 4 minutes. Returns. App still open in Safari? Maybe.

### Steps

1. **Lands on `/`.** Mobile reflow holds (Tailwind responsive — assume Ledger components are sm-tested). *Friction: 0.* But the hero takes ~140% of the fold and pushes the CTA below scroll. *Friction: 1.*
2. **Taps "Take the assessment."** *Friction: 0.*
3. **`/assessment` loads.** Pre-hydration skeleton — *Friction: 0.* But on a flaky LTE connection the skeleton may sit for 1.5–2s before mount. Mobile WCAG 1.4.10 reflow is fine; perceived perf is not.
4. **Q1.** Tap an answer. Tap Next. *Friction: 1.* Same auto-advance gripe as Edwina, doubled on mobile because every tap takes longer with a sandwich in his other hand.
5. **Q2, Q3, Q4.** *Friction: 0.*
6. **Q5 — phone rings.** Carl swipes to the dialer. Talks for 4 minutes. iOS Safari, under low-memory pressure (break room with cellular contention), **kills the tab.** Returns to Safari → tab is gone, or tab is white-screened with a stale view.
7. **Carl taps the back button or a recents tile and reopens `/assessment`.** The page remounts. **Critical moment.** Does the `useAssessmentV2` hook restore from sessionStorage?

   - `sessionStorage` survives tab reload but **not** Safari evicting the tab from memory and re-cold-launching it. iOS treats this as a new session. Carl is back at Q1.
   - *Friction: 3.* He has 18 minutes of lunch left. He says a word, closes Safari, and does not come back today.
   - **Resumability is the headline test, and the product fails it.** The fix is `localStorage` for in-flight responses (anonymized, 24-hour TTL), keyed to the device. The current sessionStorage pattern documented in CLAUDE.md is *fine for tab-reload, broken for memory eviction.*

8. **If sessionStorage holds (best case): Carl resumes at Q5.** But there's no "welcome back" toast, no "you were here." The progress bar shows 5/12. He has to reconstruct what he was doing. *Friction: 2.* A Zeigarnik-positive moment: "You were here. Q5 of 12. Tap to continue" rebuilds the open loop instantly.

9. **Q5–Q12.** He gets through. Email gate.
10. **Email gate on mobile.** Three fields (first name, email, institution). On a 390pt viewport, the keyboard covers ~50% of the screen when focused, and form fields scroll under the iOS keyboard accessory bar. *Friction: 2.* Verify that the submit button is reachable above the keyboard without the page jumping when each field is focused. The standard fix is `scroll-margin-top` on inputs.
11. **Submit.** Dynamic-import of `ResultsViewV2` — 200–400ms gap *Friction: 2 on LTE.*
12. **Result page.** Score ring is the peak. *Friction: 0.* Then the three-CTA stack appears below the fold. He sees the score, taps share on Safari to read later, and bounces. **He does not click the course CTA on mobile.** That is fine — the email lands later and he comes back on desktop.
13. **Email arrives** (Resend transactional). Subject line determines whether he opens. The audit log doesn't tell me whether the subject leads with his score or with "Welcome to AiBI." If the latter, *Friction: 2.*
14. **He clicks the link 6 hours later.** Where does it land? `/results/[id]`? Or back to `/assessment`? `src/app/results/[id]/page.tsx` exists at 45 lines — that's a permalink result. Good. But does it carry his identity (name/tier) without a login? If he can be deep-linked into a personalized result page without auth, the link is the auth.
15. **From the result page he taps "Start free course."** `/foundation/m0`. **Same problem as Edwina at step 9** — no personalization.

**"Wait, what?" moments on mobile:**
1. **Step 7** — assessment vanished after the call. He cannot tell whether the system lost his progress or whether he's hallucinating the earlier session. No "we're missing your earlier answers, want to restart?" recovery path.
2. **Step 10** — keyboard covers the submit button. He stabs at it twice.
3. **Step 13** — email subject does not lead with his score.

**Peak:** Score reveal, step 12.
**End:** Closing the email at step 13 or 14. If subject is generic, end is a 2 — directly contradicting peak-end.

**Verdict on Flow 2:** The 4-minute interruption is the single hardest test in the product and the answer is "depends on iOS memory pressure." That is unacceptable for a product where the assessment is the primary conversion mechanism. Move flight-state to `localStorage` keyed to a hashed device fingerprint, expire at 24h.

---

## Flow 3 — Paid purchase → M4 first Skill (Dr. Hattie Inoue, 53, CLO, $900M bank)

**Context:** Colleague's recommendation. Hattie went to the pricing page, clicked through to Stripe Checkout, used a corporate Amex, paid $295. The browser redirects back. **This is the loneliest screen in SaaS.**

### Steps

1. **Stripe → return URL.** Lands at... `/foundation/dashboard`? `/foundation`? `/courses/foundation/program/purchased`? There are multiple candidate landings and I cannot find a single one wired as `success_url` without diving deeper. *Friction: 2.* Whatever it is, it had better say "Welcome, Hattie. Your seat is open" within 200ms.
2. **Logged in?** Stripe Checkout collected her email. The system needs to bind that to a Supabase Auth account. If she did not pre-register, there is now an orphan `course_enrollments` row keyed only to email. **The user lands on a page that does not know who she is.** *Friction: 3.* This is the abandonment cliff for paid products. The standard fix is a magic-link sent the moment payment succeeds, with the success page reading "Check your email for sign-in" — but that introduces a 30-second silence right after she paid $295. Bad pattern.

   **Better:** Stripe Checkout's `prefilled_email` + `client_reference_id` carries a pre-minted Supabase passwordless session token. The return URL is `/foundation/dashboard?token=...` and the page logs her in transparently. If that's not the current architecture, this is the #1 ship-blocker for the paid flow.

3. **She is on the dashboard.** Sees... what? Module 0–5 modules visible? Locked vs unlocked? *Friction: 1.* She paid for the whole course. There should be a banner: "Modules 4 + 5 are open. Start at M4.1." She does not want to be told to start at M0 — she's a CLO, she paid to skip the orientation.
4. **She clicks `/foundation/m4`.** Renders the [moduleId] page. *Friction: 0.*
5. **Picks `m4.1`.** Lesson loads. The lede sets up SR 11-7 framing (F3 fixed — good). She reads. *Friction: 0.*
6. **Hits the new `[case:good]` "A recurring Skill against rule text is a model under SR 11-7."** This is the moment that justifies the $295. *Friction: 0 — peak moment.*
7. **Moves to `m4.2`.** This is "build the first Skill." *Friction: 1 — the SkillBuilder UX is described in F11 fix log but not yet wired to the M4.2 artifact UI (F8 deferred).* So she goes through the lesson body and gets to "save your Skill" but the artifact rendering does not show version / approver / use-boundary fields. **The peak moment of the paid course is a four-field metadata save that does not yet show four fields.**
8. **She saves.** Goes where? Toolbox? `/my-toolbox`? `/dashboard/toolbox`? Two routes exist. *Friction: 2.* Which one is the canonical user-facing surface? The dashboard one (`/dashboard/toolbox`) sounds operator-side; the `/my-toolbox` sounds user-side. If both render, Hattie will find the wrong one half the time.
9. **She wants to find the Skill again tomorrow.** Toolbox library at `/dashboard/toolbox/library` exists. Is the Skill listed? Is it searchable? Does it have a version label? *Friction depends on what F8 leaves on the table.*

**"Wait, what?" moments:**
1. **Step 2** — post-Stripe identity binding. If she has to type her email twice (once for Stripe, once to register), the trust is broken.
2. **Step 3** — dashboard does not say "you paid, modules 4+5 are open." She has to infer.
3. **Step 8** — two toolbox routes.

**Peak:** Step 6 — the SR 11-7 framing case.
**End:** Step 9 — finding her saved Skill again. If discoverability is muddy, end-moment is a 2 and her perception of the $295 collapses.

**Verdict on Flow 3:** The content arc is right. The systems arc — Stripe return URL → auth binding → dashboard state → toolbox canonical route → saved-artifact discoverability — has at least three soft spots that will cost paid users. None of these are content fixes; all are wiring.

---

## Flow 4 — Gate refusal → 11 days later → return (Tommy Diaz, 33, IT helpdesk, $250M bank)

**Context:** Tommy is curious, not a buyer. He runs through M0–M3 free. Hits the gate. Picks "decline." 11 days later an email lands. He clicks it.

### Steps

1. **Tommy completes M3.5.** Closing case_bad (F19) lands well — the IT scenario (Replit Agent connecting to core without TPRM) hits him personally. *Friction: 0 — actual peak moment for his persona.*
2. **Lands at `/foundation/gate`.** Sees the celebration banner: "You crossed the free line. Three doors. Pick one." *Friction: 1.* Pair 1's foreshadowing reduced the *surprise* — he was told "the gate is approaching" at M3.1, M3.3, M3.4 — but the *shape* of the three doors still violates Hick's law on cost-shape parity. The PayOptionCard ($295), EmailOptionForm (free, give email), and DeclineOption (free, no email) are stacked in identical `addie-module-card` containers. He scans them as equivalent.

   **What he sees:** three columns. *What they cost:* $295, an email, nothing. Three doors are not equal. The design should reflect that — emphasize Pay as the recommended path with a heavier card border or a "Recommended" mono kicker, and demote Decline to a smaller tertiary affordance below the fold. Right now Decline looks like a peer choice.

3. **He picks Decline.** The DeclineOption component must do something graceful — what does the user see next? If it dumps him at the homepage with no acknowledgment, *Friction: 3.* If it acknowledges his choice ("Your artifacts are saved for 30 days at this device") then *Friction: 1.* I cannot tell from the gate code which path fires. **Open question for the code.**

4. **11 days pass.** Does an email reach him? **Only if he provided email at some point** — Tommy declined the email-keep door, so the system does *not* have his email. **There is no nurture sequence for declines.** The brief premised "11 days later he receives an email" but the system architecture as built does not have an email to send to. *Friction: 3 — fundamental flow problem.*

   Two possible reframings:
   (a) Decline is genuinely terminal — he doesn't come back unless he re-types the URL. The flow ends here. Honest, brutal.
   (b) Decline still asks for email "for your artifacts" but lets him skip it. If he skipped, no nurture. If he gave it but did not opt into anything, MailerLite has no list for him.

   The architecture needs to pick one and the gate copy needs to match it. Right now it implies (b) ("keep what you built") but the DeclineOption presumably does not collect email — that's the EmailOption's job. **The three doors are not cleanly separated.**

5. **Assume he gave email via EmailOption (different path than Decline).** Day-11 email arrives via MailerLite. Subject: ?. If it leads with "Come back to your assessment" he reopens. If it leads with "ICYMI" he doesn't.
6. **He clicks the link.** Lands at `/foundation/m4` (locked) or `/foundation/dashboard` or `/foundation`? If he lands at a locked M4.1 with no upsell, *Friction: 3.* If he lands at a dashboard that says "your artifacts are here, unlock the next two modules for $295" *Friction: 1.*
7. **He wants his Pack.** Where is it? `/my-toolbox` or `/dashboard/toolbox`? Has the system rebound his email to a session? **Without auth, no.** So he has to authenticate. He doesn't remember whether he made an account. If the email is the auth (magic link), this works. If not, he is stuck.

**"Wait, what?" moments:**
1. **Step 4** — the brief assumes there's an email-to-Tommy. Architecturally there may not be, depending on which gate door he picked. The product's marketing model and its data model disagree.
2. **Step 7** — auth path for returning declined-but-email-saved users is fuzzy.

**Peak:** Step 1 — the M3.5 case_bad IT scenario.
**End:** Step 7 — if his Pack is findable, end is a 1. If not, the user-perceived flow ends at "I gave them an email and got nothing useful back," which is a 3.

**Verdict on Flow 4:** The flow as written in the brief is not the flow the system architects. Decline is treated in copy as a soft no but in the code as a hard no (no email captured). Pick a stance, write the gate copy to match, and write the email program to match.

---

## Cross-cutting findings

### Sessions + state

- **sessionStorage is the only state for the free assessment.** Survives tab reload. Does not survive iOS memory eviction. Does not survive Carl. Fix: localStorage with TTL.
- **No learner identity binding** until email capture. That means Carl's anonymous-pre-gate progress is fragile and the gate's three-way fork cannot pre-select Tommy's path based on what he did upstream.
- **Gate-fork persistence:** does the system remember Tommy declined? Does it remember Hattie paid? Yes, via `course_enrollments` keyed by Stripe session. But the read path on `/foundation/[moduleId]` does not (as far as I can see) personalize the surface — Hattie at `/foundation/m0` does not see "you've already paid, jump to M4."

### Funnel coherence

- `/assessment` (legacy route) → `/results/[id]` → CTAs → `/foundation` (addie route).
- Two route groups (`(addie)` and the legacy un-grouped tree).
- Two toolbox routes (`/my-toolbox` and `/dashboard/toolbox`).
- The gate at `/foundation/gate` is its own URL — fine, but the breadcrumb back to `/foundation` (the back link at line 106) doesn't tell him whether his progress survived the decline.
- **There is no single state machine for "where is this user in the funnel."** That is the architectural bet to make next.

### Gate (three-way fork after M3.5)

**Foreshadowing fix (P1.3) — partial win.** The M3.1/M3.3/M3.4 reminders fix the *visibility-of-system-status* violation. Tommy is no longer *surprised* by the gate.

**Hick's law on cost-shape parity — unresolved.** Three side-by-side `addie-module-card` tiles, identically sized, present three economically asymmetric choices as visually symmetric. Specific fixes:
1. The PayOptionCard should carry a "Recommended" mono kicker or a 2px ink border (vs the default 1px hairline) to break the equivalence frame.
2. The DeclineOption should drop out of the three-column grid and live below it as a small text affordance ("Not now? Save what you built and decide later. →").
3. Or — keep three doors but reorder visually so the eye scans Pay → Email → Decline left-to-right, anchoring on the recommended path. The current grid order is reasonable; the visual weight is the problem.

**Copy nit:** "Three doors. Pick one." is a peak line. "Bring the whole team in" is a peak line. The team-buy band currently sits *below* the three doors — for institutional buyers (Hattie's persona), it should be a fourth tile or a sticky banner, not a footer.

### Mobile reflow + interruption

- iOS Safari memory eviction during a phone call is the canonical interruption. sessionStorage does not survive it.
- The email-gate form keyboard-overlap on 390pt viewports — verify `scroll-margin-top` and `viewport-fit=cover`.
- The 200–400ms `ResultsViewV2` dynamic-import gap is fine on Wi-Fi, bad on LTE. Add a `loading` prop to the `dynamic()` call.
- The 5–10 minute window: Edwina's window is desktop and forgiving. Carl's is mobile and brutal. The product is designed for Edwina. **Design for Carl and Edwina still works; the reverse does not.**

### Post-payment landing experience

- I cannot confirm from this audit whether the Stripe return URL is `/foundation/dashboard`, `/foundation`, or `/courses/foundation/program/purchased`. Three candidates exist. **Pick one and document it.**
- Identity binding post-Stripe: confirm Stripe Checkout's email is being used to mint a Supabase passwordless session on the success URL, or document the alternative (magic-link in transactional email, which adds a 30-second silence after payment).
- Dashboard does not greet by name within 200ms. Use the first name from `assessment_responses` or from Stripe's `customer_details.name`.

### Email touchpoints (transactional + nurture)

- **Resend (transactional):** assessment-breakdown email post-capture. Subject line not visible in this audit — must lead with the user's score and tier, not a generic welcome.
- **MailerLite (nurture):** Day 0/3/7 sequences referenced in launch gate. For Tommy's flow, what fires day-11? If there's no sequence configured for "declined but kept email," there's nothing.
- **Stripe payment.success → MailerLite welcome tag** — fine. But the welcome tag does not currently differentiate "Hattie paid $295, send the M4 starter prompt" vs generic onboarding.

---

## Top 10 abandonment risks, ranked

1. **iOS Safari tab eviction wipes the free assessment.** sessionStorage-only state. Carl class of users.
2. **Post-Stripe identity binding is fuzzy.** Hattie pays, lands on a page that doesn't know her, walks.
3. **Gate three-door cost-shape parity violates Hick's law.** Decline reads as a peer of Pay; conversion math suffers.
4. **Result page stacks Pay/Buy/Free CTAs on top of the score reveal,** burying the peak moment under the upsell triangle.
5. **No nurture for Decline path** — the brief assumes one exists, the architecture suggests it doesn't.
6. **Two toolbox routes** (`/my-toolbox` and `/dashboard/toolbox`) split the canonical "where my work lives" surface.
7. **Mobile email-gate keyboard overlap** — three fields × iOS keyboard accessory bar = miss-taps.
8. **No "welcome back, Edwina" personalization** after captured email, despite having the name.
9. **`ResultsViewV2` dynamic-import has no loading state** — 200–400ms white flash on LTE.
10. **M4.2 SkillBuilder save UX does not yet render the four-field metadata** (F8 deferred) — the paid peak moment under-delivers.

---

## Top 10 opportunities

1. **Move flight-state to localStorage with TTL.** One-day fix, biggest abandonment win.
2. **Add a "Welcome back, [first name]" toast on `/foundation` after captured email.** Five lines of code, large emotional payoff.
3. **Demote Decline below the three-card grid.** Re-shapes the gate to a recommended-path UX.
4. **Strip the three-CTA stack off the result page; let the score breathe.** Move the doors to a CTA block after a 4–5 second scroll delay or after a "next" affordance.
5. **Stripe success URL: `/foundation/welcome?session_id=...`** that mints the auth and greets by name within 200ms.
6. **Consolidate toolbox routes.** Pick `/my-toolbox` as canonical, redirect `/dashboard/toolbox` or vice versa.
7. **Email subjects lead with the score** ("Edwina, your AI readiness score: 24/48 · Early Stage"), not the brand.
8. **Add a `loading` skeleton to the `ResultsViewV2` dynamic import** matching the result page card layout.
9. **Add a `aria-live` announcement on email-gate submit** and confirm the submit button clears the iOS keyboard.
10. **Rewrite Decline UX:** "Not now? Email me my Pack and I'll decide later" — one button, one email field, no third door. Collapses Hick's law to a binary choice.

---

## Verdict — is the funnel coherent end-to-end?

**Mostly yes on content. Mostly no on systems.**

The content arc — assessment → score → free course → M3 case-bad → gate → M4 SR 11-7 — is sharp. Round-1 fixes landed in the right places. The Pair-1 foreshadowing patch genuinely reduces the surprise of the gate.

The systems arc — sessionStorage durability, post-Stripe identity, route canonicality, personalization carry-through, decline-path nurture — has at least five wiring problems that any of the four personas will hit before they hit a content problem. Edwina will not see them on her ThinkPad. Carl will hit memory eviction. Hattie will hit post-Stripe limbo. Tommy will hit decline-path limbo.

The next round of fixes should not touch lesson copy. It should rewire the state machine that ties `/assessment`, the gate, and `/foundation/*` together as a single session, not three federated pages.

— Vera
