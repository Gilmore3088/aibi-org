# 100-persona synthetic waves, 2026-09-30

## Current status (after three waves)

**Open the interactive report: [`index.html`](index.html).** The plan and each item's status are in [`REMEDIATION-PLAN.md`](REMEDIATION-PLAN.md).

| Final run, 2026-10-03 | Wave 1 · core | Wave 2 · features | Wave 3 · remaining pages |
|---|---|---|---|
| Reached value | 80 / 100 | 86 / 100 | 100 / 100 |
| Rage-quits | 2 → **0** when re-run alone | 0 | 0 |
| Dead ends | 4 → **0** when re-run alone | 2 → **0** | 1 → **0** |

- Every public page is covered (90 of 90). Admin and design-system pages are excluded.
- Every rage-quit caused by a product dead end has been fixed. The final run's two came from dev-server slowness and the test's handling of the new mobile menu; both personas reach value when re-run.
- Failed downloads now show a readable page with next steps on all 14 file routes.
- The exam can no longer be passed by picking "b" or the longest answer, and its result screen now quotes the right course price.
- Re-run in full after main's home rebuild and rebrand; the real problems found are fixed (see the plan's 2026-10-03 section).
- Open owner decision: the exam tests the RTFC framework, but the course teaches CORE.
- Still open: A1, the run against a configured preview with Stripe, Supabase and AI keys. This sandbox can't reach the preview or the live site. Runbook: [`e2e/persona-wave/README.md`](../../e2e/persona-wave/README.md#running-against-a-configured-preview-the-real-test).
- Also open: 46 verified-merged branches need someone with push access to run [`delete-finished-branches.sh`](delete-finished-branches.sh). Dependabot #589's updates are applied in this branch, with Stripe held back. See section E of the plan.

Raw run reports: wave 1 [`wave-report.md`](wave-report.md), wave 3 [`wave3-report.md`](wave3-report.md).

---

## Wave 1 write-up (original, statuses updated)

Harness: [`e2e/persona-wave/`](../../e2e/persona-wave/README.md). Run it with
`npm run e2e:persona-wave` against `SKIP_ENROLLMENT_GATE=true npm run dev`.
Raw output: [`wave-report.md`](wave-report.md) (every issue and every persona)
and [`summary.json`](summary.json). Only the screenshots referenced below are
committed; the rest regenerate with the run (seed `20260930`).

## Scope and limits

The run used a local dev server with **no Supabase, Stripe, OpenAI/Anthropic
keys, and no outbound network**. The course was opened with the dev enrollment
bypass, so every learner starts enrolled with all modules unlocked. Findings
tagged *environment* below were not tested here, not confirmed working. Page
timings come from `next dev` and are not production speeds.

## Headline

| Metric | Result |
|---|---|
| Personas reaching first real value | 82 / 100 |
| Median click-to-value | 2 clicks, 14 s |
| Uncaught JS exceptions | 0 |
| Course learners (40): Try activities completed | 326 / 326 modules attempted |
| Course learners: artifacts saved (API 201) | 317 / 320 built |
| Personas who hit a product dead end | 17 |

The 18 personas with no value were: course shoppers (8, Stripe/bypass,
environment), institution buyers (5, inquiry API 502, environment), explorers
(3, no goal by design), one free-assessment persona, and one resource hunter.

## Product findings (verified)

### 1. No way forward at the end of a module. **Fixed**

Each module runs Understand → Try → Build → **Save**. The Save step ended with
"Next: … carry it into *&lt;next module&gt;*" but no link. The only next-module
CTA sat at the bottom of the Build step. On mobile the course sidebar is
collapsed, so there was **no visible link to the next module at all**.

- Hit by all 16 mobile learners, 3–10 times each (once per module finished).
- Before: [`shots/P001-01-no-next-module-link.png`](shots/P001-01-no-next-module-link.png)
- Fix: `SaveStepNavigation` renders the existing `ModuleNavigation` in the
  Save step. `ModuleContentClient` hands off in-session completion via an event
  plus `sessionStorage`, because tab panels unmount. Tests:
  `SaveStepNavigation.test.tsx`.
- After: [`shots/after-fix-save-step-next-link.png`](shots/after-fix-save-step-next-link.png).
  Re-running five mobile learners gave 0 next-module dead ends (previously 3–10 each).

### 2. Course home has no link to the final packet / certificate. **Fixed** (course-complete card)

All 10 completers had to type `/courses/foundation/program/certificate`. The
course home HTML links to no `submit`, `certificate`, or `post-assessment`
route; only `CompletionCTA` (shown on finishing module 18) and `/dashboard`
link to `/submit`. A learner who finishes and comes back later lands on the
course home with no path to the credential. **Recommend:** a "Submit final
packet / view certificate" card on the course home once all 18 modules are
complete. (The module-18 CompletionCTA path itself could not be exercised
under the bypass.)

### 3. Module 3 Build is gated on a scored prompt. **Closed** (starter prompt, hints, and a no-penalty exit after 6 attempts already exist)

The CORE prompt workshop only offers "Save & continue" after the learner's
prompt passes C·O·R·E scoring. 6 of 30 synthetic learners wrote generic text
and never passed ([`shots/P026-03-no-save-button.png`](shots/P026-03-no-save-button.png)).
This is partly a harness limit (real learners write real prompts), but it is
the one step in the course with no way past a failing score. Worth watching
in real sessions: after 6 failed attempts, is there a hint or an exit?

### 4. React key warning on every module page (low). **Closed** (dev-only React 19 quirk)

`Each child in a list should have a unique "key" prop … Check the render
method of ModuleTabs. It was passed a child from ModulePage.` It appears on
every module page (36 personas). This is dev-only noise, not user-visible, but
it hides real warnings. The source is in the content `ModulePage` passes into
`ModuleTabs`; the tab rail's own keys are correct.

### 5. Marketing pages have no `<main>` landmark (low, accessibility). **Fixed**

"Skip to main content" targets `<div id="main-content">` in
`src/components/system/LayoutChrome.tsx`, and most marketing pages (home,
`/assessment`, `/resources`, `/courses`, `/for-institutions`, `/practice`,
`/verify`) have no `<main>`. Course pages already render their own `<main>`,
so switching the wrapper to `<main>` needs a check for nesting.

### Unconfirmed at the time. Since resolved: In-Depth CTA closed, prompt card fixed, silent saves were harness timeouts

- 3 of 8 In-Depth buyers found no In-Depth CTA on their free result and typed
  the URL; the other 5 found "Get 90-day playbook". This may be result-variant
  specific or a harness miss.
- "Download prompt card" on `/resources/prompting-foundation` produced no file
  or confirmation for 3 personas
  ([`shots/P031-03-download-no-file.png`](shots/P031-03-download-no-file.png)).
  This is likely the Supabase-backed download route.
- 3 of 320 artifact saves sent no request and showed no UI feedback (modules 2 and 4).

## Environment-limited (not tested here)

| Flow | What happened locally | Next step |
|---|---|---|
| $99 In-Depth checkout | `503 {"error":"Payment system not configured."}` | Run wave on preview with Stripe test keys |
| $295 Foundation checkout | Purchase page forwards into the course (dev enrollment bypass) | Same |
| Institution inquiry | `502`, and the UI shows a fallback "email us directly" (good) | Preview with Supabase |
| Resource downloads | `503` from `/api/resources/*/download` | Preview with Supabase |
| AiBI Lab (`/api/sandbox/chat`) | `401` (bypass has no auth session) | Preview with a seeded learner |
| Certificate page | "The certificate service is not configured" | Preview with Supabase |

## Not issues

- **Slow pages** (8–26 s): `next dev` compile times, not production.
- The **free assessment**, **practice sandbox** (sample fallback), **verify
  certificate**, and **pricing/ROI** flows worked end to end.
