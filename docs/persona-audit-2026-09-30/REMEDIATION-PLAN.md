# Remediation plan: no rage-quits, value for every visitor

Source: two 100-persona waves (2026-09-30).
- Wave 1 (`WAVE_SET=core`): core journeys, 29 of 97 pages.
- Wave 2 (`WAVE_SET=features`): the 68 pages and features wave 1 skipped, including the home "Can we help you today?" resource widget, all download types, toolbox, course extras, exam, and account and support forms.

Together the waves reached 57 of 97 pages.

## Definition of done

A combined run of both waves against a **configured Vercel preview** (Stripe test keys, Supabase, AI provider keys, seeded learner) shows:

1. **0 rage-quits.**
2. **Every goal-directed persona reaches value.** Explorers with no goal are excluded.
3. **0 product dead ends.** No page without a way forward. No failure that leaves a raw error or no message.
4. **Every failure path shows a plain message and a next step.** This holds even during an outage.

Local runs can't prove 2 for flows that need keys (checkout, lab, certificate, inquiries). That is why step A1 comes first.

## Where we are

| | Wave 1 (core) | Wave 2 (features) |
|---|---|---|
| Reached value | 82 / 100 | 85 / 100 |
| Rage-quits | 4 | 0 |
| Product dead ends | 22 | 19 (mostly harness or env, see below) |
| Uncaught JS errors | 0 | 1 (dev live-reload socket, not the site) |

Every wave-1 rage-quit traced to a product dead end. All four are now fixed:
- Three completers reached a certificate page with no way out.
- One learner hit a module end with no link forward.

Every remaining no-value persona traces to one of three causes: a key missing in the test build, a persona with no goal, or a harness miss. Section C lists each one.

## Verification re-run (same personas, same seeds, after the fixes)

| Check | Before | After |
|---|---|---|
| Wave-1 completers + resource hunters reaching value | 19 / 20 | **20 / 20** |
| Rage-quits among them | 3 | **0** (after correcting two harness misreads, below) |
| "No link to next module" dead ends per mobile completer | 16–17 | **0** |
| Completers who had to type the certificate address | 10 / 10 | **0 / 10** (they use "Submit final packet") |
| Completer P001 artifacts saved | — | **18 / 18** |

Two re-run rage-quits turned out to be harness misreads, each confirmed by hand:
- **P001.** A save response outlasted the harness's 12-second wait under dev-server load. The UI had already said "Artifact saved". Manual saves on modules 2 and 15, with every readiness choice, return 200 and show "Saved".
- **P041.** The new completion card worked. The harness then expected certificate text on the packet page.

The harness now waits 25 seconds, counts visible "Artifact saved", and treats the packet or certificate page as the credential path.

Wave-2 download personas re-run after F6: templates, prompt cards and playbooks download, and the page confirms "a copy is on its way to your inbox". A few re-run misses happened while app files were being edited mid-run, which made the dev server recompile. They did not reproduce by hand.

## A. Fixed in this branch (verified)

| # | Issue | Wave | Fix | Proof |
|---|---|---|---|---|
| F1 | No link to the next module at the end of Save; invisible on phones | 1 | Save step ends with "Replay, then continue · Module N" and unlocks in the same visit | 16/16 mobile learners hit it before; 0 after on re-run; 5 tests |
| F2 | Course home never links to the packet or certificate | 1 | "Course complete" card: submit packet, certificate, growth check | 10/10 completers typed the URL; 2 tests |
| F3 | Certificate outage screen had no way out, causing 3 rage-quits | 1 | Links to the Foundation Packet and support | tests pass |
| F4 | **Exam passable by always choosing "b"** (37/41 answers were "b"; options never shuffled; all-"b" scored 83% "Advanced") | 2 | Options shuffled per draw and lettered by position | test: fixed-position guessing stays under 50% |
| F5 | **Sample report "Send PDF" was fake**: said "on its way", sent nothing, captured no lead | 2 | Uses `/api/capture-email` with the sample report; direct-download fallback on failure | 2 tests |
| F6 | Free downloads returned 503 when the database was unreachable, before the existing file fallback | 1+2 | Free files served from the deploy; paid files still gated | 2 tests; PDF now returns 200 locally |
| F7 | Governance brief's only next step was an email link | 1+2 | Adds the free assessment link | — |
| F8 | Sign-up, sign-in and reset showed "Auth is not configured. Set Supabase environment variables." to visitors | 2 | Visitor-facing message with the support email | auth tests pass |
| F9 | Course settings Save stayed disabled with no reason given | 2 | "Answer all three questions to save." under the button | settings tests pass |

## B. To do, in priority order

### P0: prove the untested flows (blocks the definition of done)

**A1. Run both waves against a configured preview.**
1. Deploy this branch to a Vercel preview with Stripe **test** keys, Supabase (a non-production project, or the e2e seed opt-in), `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, Resend in test mode, and `SKIP_MAILERLITE=false` pointed at a test group.
2. Run:
   ```
   WAVE_BASE_URL=<preview> npm run e2e:persona-wave
   WAVE_BASE_URL=<preview> WAVE_SET=features npm run e2e:persona-wave
   ```
3. Treat every row still tagged `env` as a product bug.

This covers what could only be marked "not tested" locally:
- $99 and $295 checkout
- institution and team inquiry
- resource downloads with logging
- AiBI Lab runs
- certificate issue and verify
- assessment resume links
- purchase-help requests
- quick wins
- sign-up, sign-in and password reset
- Cookbook recipes (confirm published rows exist in production)
- exam attempt saving

### P1: product fixes

**B1. Exam: correct answer is the longest option in 39 of 40 questions.**
- Shuffling (F4) stops position guessing, but "pick the longest answer" still passes.
- Rewrite distractors in `content/exams/foundation-program/questions.ts` so options have similar length and specificity.
- Then add a content test that fails when more than 40% of correct answers are the longest option.
- Owner: course content, with subject-matter review. The credential's credibility depends on it.

**B2. Never leave a visitor on raw JSON.**
- When a browser navigates to `/api/resources/*/download` and the route fails, it shows `{"error":"..."}`.
- For navigations (`Accept: text/html`), return a small HTML page or redirect back with a message: "This download is temporarily unavailable. We emailed it to you" or "Try again".
- F6 removes the most common cause. Paid-file failures and 404s remain.

**B3. Module 3 CORE workshop: closed, no change needed.**
- Checked in code and by hand: the workshop offers "Use starter prompt" and per-element hints.
- After 6 attempts it says "Out of attempts for this one — no penalty" and still offers "Save my prompt & complete".
- The strategy drill ends in "Save & continue".
- The wave's module-3 misses came from the harness clicking widgets in random order.
- Keep one wave-3 check with a real learner flow.

### P2: friction and polish

- **B4.** Artifact save "no feedback" (3 of 320 in wave 1) did not reproduce by hand. Every save tried showed "Saved", and the re-run traced it to harness timeouts under dev-server load. Re-check on the preview, where there is no dev compile.
- **B5.** In-Depth upgrade button missing from some free results (3 of 8 buyers typed the URL). Check each result tier shows "Get 90-day playbook / In-Depth".
- **B7.** Marketing pages have no `<main>` landmark. "Skip to main content" targets a div in `LayoutChrome`. Make it `<main>`, checking course pages that already render their own.
- **B8.** React "unique key" warning on every module page, from content `ModulePage` passes to `ModuleTabs`.

### P3: coverage (wave 3)

These 40 pages were never visited.

**Needs seeded data or a purchase (run on the preview):**
- In-Depth access, purchased, take and results
- team token, admin and results pages
- the certificate verify page for a real ID, plus print views
- the course purchased page
- auth confirm and reset links

**Reachable, not drawn by chance:**
- `/courses/foundation`
- three research briefs
- course gallery, onboarding, submit and prompt library
- dynamic library, cookbook, skill and practice-rep pages

Add a `WAVE_SET=coverage` quota that guarantees each one at least once.

**Internal, excluded:** `/admin/*`, `/design-system`.

## C. Why the remaining personas got no value

| Cause | Personas | Resolution |
|---|---|---|
| Needs Stripe (course and In-Depth checkout) | 8 course shoppers | A1 |
| Needs the database (inquiry, resume link, support, quick wins, password reset) | 5 institution buyers, 6 resume, 3 support, 1 quick win, 3 reset | A1 (wording fixed in F8) |
| No goal by design | 3 explorers | none (excluded) |
| Harness misses, confirmed working by hand | exam (1), settings save (1), prompt cards, workbook link, guided run | harness fixed where possible |
| Planned stopping point | course samplers and quitters | none (behavior, not a defect) |

## D. Harness notes

- Harness: `e2e/persona-wave/`
- Wave-2 journeys: data in `features.mjs`
- HTML report: `html-report.mjs`
- Verified by hand after each run: the exam flow, settings save, sign-up message, workbook link, Toolbox tour persistence, and the phone menu's Training link.
