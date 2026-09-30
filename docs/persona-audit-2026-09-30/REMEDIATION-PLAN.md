# Remediation plan: no rage-quits, value for every visitor

Source: three 100-persona waves (2026-09-30).
- Wave 1 (`WAVE_SET=core`): core journeys, 29 of 97 pages.
- Wave 2 (`WAVE_SET=features`): the 68 pages and features wave 1 skipped, including the home "Can we help you today?" resource widget, all download types, toolbox, course extras, exam, and account and support forms.
- Wave 3 (`WAVE_SET=coverage`): the 40 pages neither wave reached. That is 34 public pages at 2–3 personas each, plus 6 internal admin and design-system pages, which are excluded.

**Coverage: every public page (90 of 90).**
- 81 were loaded directly.
- 8 are redirect stubs that land on a working page.
- 1 was checked by hand: `/resources/[slug]` has no essays registered, so it only serves a 404 with a way forward.

The 7 internal routes are excluded. Check with `node e2e/persona-wave/route-coverage.mjs <run dirs>`.

## Definition of done

A combined run of both waves against a **configured Vercel preview** (Stripe test keys, Supabase, AI provider keys, seeded learner) shows:

1. **0 rage-quits.**
2. **Every goal-directed persona reaches value.** Explorers with no goal are excluded.
3. **0 product dead ends.** No page without a way forward. No failure that leaves a raw error or no message.
4. **Every failure path shows a plain message and a next step.** This holds even during an outage.

Local runs can't prove 2 for flows that need keys (checkout, lab, certificate, inquiries). That is why step A1 comes first.

## Where we are

| | Wave 1 (core) | Wave 2 (features) | Wave 3 (coverage), first run | Wave 3, after fixes |
|---|---|---|---|---|
| Reached value | 82 / 100 | 85 / 100 | 92 / 100 | **100 / 100** |
| Rage-quits | 4 | 0 | 5 | **0** |
| Product dead ends | 22 | 19 (mostly harness or env, see below) | 2 outage screens + harness misreads | **0** |
| Uncaught JS errors | 0 | 1 (dev live-reload socket, not the site) | 0 | **0** |

Wave 3 details:
- The five first-run rage-quits came from two things. First, two outage screens with no way forward, fixed as F11 and F12. Second, harness misreads: expected 404s scored as dead ends, and client-rendered pages judged before they filled in.
- What is left in the final run is dev-server slowness (pages over 8s while `next dev` compiles) and one explained disabled button: the final packet needs a file upload.
- There were also two hydration-attribute warnings on `/auth/login` and `/auth/confirm-device-pending`. Both came from the last two personas of the run and did not reproduce in 6 fresh loads. Re-check on the preview.

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
| F10 | **Exam: correct answer was the longest option in 39 of 40 questions** (B1) | 2 | 117 distractors rewritten as plausible mistakes of similar length. Correct answers, keys and explanations are unchanged | longest is now 6/40; guard tests fail above 40% |
| F11 | Toolbox library skill page threw a 500 on a database error | 3 | "Temporarily unavailable" with links to the library and support | wave 3: 3/3 value |
| F12 | In-Depth assessment outage said "isn't configured in this environment", with no way forward | 3 | Plain-language copy with Try again and Contact support | wave 3: 3/3 value |
| F13 | **Failed downloads showed raw JSON** (B2) | 1+2 | `withReadableDownloadErrors` on all 14 visitor-facing file routes. Page loads get a short page: what happened, plus Try again / Sign in / pricing / library, Go back, Contact support. Script callers still get JSON. A bad link reads "link may be out of date" | 8 tests; checked live |
| F14 | About half the pages had no main landmark (B7) | 1 | `#main-content` gets role=main when a page has no `<main>` | exactly one landmark on 10 page types |

## B. To do, in priority order

### P0: prove the untested flows (blocks the definition of done)

**A1. Run all three waves against a configured preview.** *Blocked in this sandbox. The environment can't reach `*.vercel.app` or the live domain and has no keys. Runbook: `e2e/persona-wave/README.md` → "Running against a configured preview".*
1. Deploy this branch to a Vercel preview with Stripe **test** keys, Supabase (a non-production project, or the e2e seed opt-in), `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, Resend in test mode, and `SKIP_MAILERLITE=false` pointed at a test group.
2. Run:
   ```
   WAVE_BASE_URL=<preview> npm run e2e:persona-wave
   WAVE_BASE_URL=<preview> WAVE_SET=features npm run e2e:persona-wave
   WAVE_BASE_URL=<preview> WAVE_SET=coverage npm run e2e:persona-wave
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

**B1. Done (F10).** Subject-matter review of the rewritten distractors is still worthwhile before the next cohort.

~~Exam: correct answer is the longest option in 39 of 40 questions.~~
- Shuffling (F4) stops position guessing, but "pick the longest answer" still passes.
- Rewrite distractors in `content/exams/foundation-program/questions.ts` so options have similar length and specificity.
- Then add a content test that fails when more than 40% of correct answers are the longest option.
- Owner: course content, with subject-matter review. The credential's credibility depends on it.

**B2. Done (F13).**

~~Never leave a visitor on raw JSON.~~
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
- **B5. Closed, no change needed.** The In-Depth call to action is on every result tier. The three buyers who missed it were non-emailing personas stuck at the email gate. The harness now uses the gate's "View your summary without email" exit.
- **B7. Done (F14).**
- **B8. Closed, dev-only.** React's "unique key" warning on module pages. Every list is keyed. Bisecting shows the warning persists with the suspect components removed. It is a React 19 development-mode quirk with server-to-client elements, and production builds don't emit it. Re-check the preview console.

### P3: coverage (wave 3). Done

Wave 3 covers all 34 public pages below: 100/100 reached value, 0 rage-quits, 0 dead ends. Pages that need a purchase, sign-in or real ID pass when they show a clear message with a next step. Made-up IDs pass when they return a helpful 404. The preview run (A1) will exercise them with real data.

These 40 pages were never visited by waves 1–2.

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

`WAVE_SET=coverage` (`e2e/persona-wave/coverage.mjs`) guarantees each one 2–3 visits.

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
- Wave-2 journeys: data in `features.mjs`. Wave-3 pages: `coverage.mjs`
- Route coverage across runs: `route-coverage.mjs`
- HTML report: `html-report.mjs`
- Verified by hand after each run: the exam flow, settings save, sign-up message, workbook link, Toolbox tour persistence, and the phone menu's Training link.

## E. Repo and dependency housekeeping (2026-09-30)

| Item | Status |
|---|---|
| Expired claim `motley-fool-digital-76` (failed CI everywhere) | **Done.** Re-verified on fool.com. The site copy said "would switch for a better digital experience"; the survey says "likely to switch banks for one that better meets their needs". Copy corrected, review date 2027-03-30. |
| Dependabot #581 | **Merged** (all checks green). |
| Dependabot #589 (26 grouped updates, replaced #585) | **Held.** Stripe 22.6 requires API version `2026-08-26.dahlia`, but `src/lib/stripe.ts` pins `2026-07-29.dahlia`. The type check fails, so smoke, mobile and Lighthouse fail too. Changing the payments API version is an owner decision. |
| Dependabot #574 (TypeScript 7) | Open, major upgrade. |
| 5 kept branches | **Unified.** Merged in here: `repo-cleanup-pruning`, plus both video-tool branches in `video-studio/` and `walkthrough/`, which are excluded from the site's type check, lint and deploys. Ported from `rescue/2026-08-15`: email redaction in server logs. Kept as a record by decision: the rest of `rescue/2026-08-15`. Kept separate by decision: `feature/home-refocus`, which ships as its own reviewed change. |
| 47 finished branches | **Ready, needs a person.** This session can't delete remote branches. Run `delete-finished-branches.sh`. After this branch merges, the three branches merged into it can be deleted too. |
| Production build | Now passes locally, since main self-hosts fonts (#590). |
