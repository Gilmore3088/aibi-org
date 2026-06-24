# Action Items — massive-persona audit (2026-06-23)

**What this is:** the prioritized output of walking 100 diverse personas through every
site experience (free/paid, assessments, resources, course, certificate, toolbox, team,
auth, support), grounded in code (`00-flow-atlas.md`), with per-persona outcomes in
`02-persona-outcomes.md`. Special attention to **clicks-to-value**.

**Headline:** the funnel's *acquisition* surfaces are strong (free assessment is a 1-click
start; resources are well-stocked; dashboard handles empty states; provisioning is cleverly
engineered). The failures cluster **after the click that matters** — fulfillment, retention,
and the terminal deliverables (certificate, paid access, team checkout). **58 of 100 personas
failed or were damaged; 23 critically.** Almost none of those 23 are about clicks — they are
about value that is promised and then **undeliverable**.

Severity: **P0** = lost revenue or broken core promise, fix before any paid push · **P1** =
material conversion/trust leak · **P2** = polish. Effort: S/M/L.

---

## PART 1 — LARGEST GAPS (ranked; fix these first)

These are the business-breaking failures. Each is a place where a user does everything right
and gets nothing, or where the system silently loses money.

### GAP 1 — The $295 certificate is unreachable. The product's terminal promise cannot be delivered. `P0`
Every learner who finishes all 18 modules and submits their work product (personas 10, 37, 48,
60, 78, 94, 100) **waits forever**:
- Nothing in the app sets `work_submissions.review_status='approved'` — no reviewer UI, no cron,
  no auto-approve. The only writes are `'pending'`/`'resubmitted'` (`submit-work-product/route.ts:326,359`).
- **Nothing calls `POST /api/courses/generate-certificate`** (zero app callers; gates on `approved`, `route.ts:179`).
- Even if approved, the cert PDF uses `@react-pdf renderToBuffer` → **React #31 500** (`route.ts:144,349`).
- `/submit` promises "you will receive an email when your score is issued" — **no route sends it** (`submit-work-product/route.ts:341,371` are TODOs).
- The dashboard **falsely shows "Verified ✓"** the moment modules complete (`deriveDashboardViewModel.ts:137`, `dashboard/page.tsx:296`), linking back into the course, not to a credential.
- There is **no `/verify` lookup entry point** for third parties (removed; noindex; robots-disallowed) — so even a hypothetical cert has no verification path (personas 19, 40, 74, 97).

**Action:**
1. Ship a reviewer/approval surface (admin page or a defensible auto-approve rule) that sets `review_status='approved'` and **calls the issuance endpoint**. `M`
2. Replace the cert (and Transformation Report, Acceptable-Use card) `renderToBuffer` with the working Chromium/print path already used by the paid assessment PDF (`window.print()` / Puppeteer print route). `M`
3. Send the submission-received email (wire the two TODOs). `S`
4. Add a real certificate surface on the dashboard (link to the cert + the public `/verify/<id>` URL) and stop showing "Verified" until a cert row exists. `S`
5. Build the `/verify` lookup page (ID input) and remove the noindex once certs can issue. `S`

### GAP 2 — Paid buyers get stranded: access depends on one email that bank gateways filter. `P0`
$99 and $295 fulfillment is a **password-less account + a single transactional magic-link email**
(personas 2, 25, 44, 65, 86, 98). For this exact audience (Mimecast/Proofpoint banks):
- If that email is filtered, the buyer has a **provisioned account they cannot reach**.
- `/auth/login` **requires a password the account never set** (`login/page.tsx:270`); device-confirm is **same-browser-only** (`confirm-device-pending` copy) so a 2nd-device returner loops.
- The webhook only sends the email on `action==='created'`; a failed first send + Stripe retry is a **dedup no-op — never re-sends** (`webhooks/stripe/route.ts:376`).
- There is **no "stranded buyer" detection** (no flag for `enrolled && last_sign_in IS NULL`); ops cannot tell a stranded buyer from a lazy one.

**Action:**
1. Make `/auth/login` lead with **passwordless / magic-link sign-in** (email → link), not a password field. `M`
2. Make device-confirm **cross-device-tolerant** (let the link establish trust from any browser). `M`
3. Add a self-serve **"I bought something but can't get in"** recovery on `/auth/login` + `/support/purchase-help` that re-mints access by email regardless of webhook dedup state. `M`
4. Add a **stranded-buyer flag + ops alert** (`enrolled && never authenticated` after N hours). `S`

### GAP 3 — There is no retention loop. The funnel has a checkout but never follows up. `P0`
No re-engagement exists anywhere (confirmed: only `cleanup-rate-limits` + pdf-cleanup crons; no
MailerLite course/onboarding/abandon sequences):
- **Free-assessment abandoners** (8, 15, 35, 42, 54, 59, 92): state is `sessionStorage`-only, email is captured **only after Q12**, "Start over" **re-rolls a fresh question set**, and cross-device return is **structurally impossible** (no server identity exists until completion). Personas literally expect a reminder that doesn't exist.
- **Idle $99 buyers** (27, 43, 75, 98) and **never-start $295 buyers** (2, 25, 44, 51, 69, 93): nothing ever contacts them again.
- **Module-3 abandoners** (12, 23, 34, 57, 82): progress persists but nothing pulls them back.

**Action:**
1. Capture email **earlier** (or add an explicit "email me my progress / resume link" mid-assessment) and persist a server-side draft keyed to it. `M`
2. Add MailerLite sequences: **"finish your assessment"**, **"you haven't started your course"**, **"continue Module N"**, **"your In-Depth is waiting"**. `M`
3. Stop re-rolling questions on "Start over" / "resume" — restore the same set. `S`

### GAP 4 — Team buyers who are ready to pay get a `mailto:`, not a checkout. `P0`
Nine personas want team/cohort training; the four most ready-to-buy (55, 73, 81, 91) hit a wall:
- `/assessment/team` shows `TeamAssistedRolloutCard` whose copy literally says checkout is **"intentionally gated until two production-like cohorts pass end-to-end QA"** (`team/page.tsx:309`) — telling a CHRO with budget the product isn't ready.
- Every team CTA on `/for-institutions` is a **raw `mailto:`** (`_client.tsx:57,59,97,541,561`) — no form, no CRM capture, no scheduler, no SLA promise.
- The **full self-serve Stripe machinery exists but is flag-dark** (`ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT` unset).
- `/for-institutions` links to the team-report preview **only via a mobile-only deep link** — desktop buyers never see the proof.

**Action:**
1. Replace every `mailto:` with a real **lead-capture form + Calendly/booking link + "we respond within 1 business day"**. `S`
2. Remove the QA-gating rationale from buyer-facing copy. `S`
3. Decide: finish hardening and **flip the self-serve flag**, or present a clean assisted-sales motion — but not a wall that says "not ready." `M`
4. Surface the team-report preview on desktop. `S`

### GAP 5 — The interactive demos are convincing fakes that destroy credibility with the best prospects. `P1` (→P0 for evaluators)
`/playground` and `/practice` are **canned mockups** (personas 9, 18, 45, 64, 96):
- "Run" is a `setInterval` typewriter over hardcoded output; "Save to Toolbox" only `setSaved(true)`; the "recent Toolbox" panel is hardcoded fiction.
- `/practice` **falsely brands itself "Signed-in sandbox / Enrolled-only"** while public, and offers a **`.md` download of fabricated AI output**.
- The **real** working AI loop (`/dashboard/toolbox`, "AiBI Lab") is buried behind auth+payment and not in nav.
- Both are **orphaned** (no nav/home link), so only determined, technical evaluators find them — and they're the ones who notice the fakery.
- ~2,463 lines of orphaned dead code (`_script.js`/`_body.html`) sit alongside.

**Action:**
1. Either wire these to the real (rate-limited, PII-scanned) model, **or** clearly label them "interactive preview" and link to the real product. `M`
2. Remove the false "Enrolled-only" claim and the fabricated `.md` export. `S`
3. Give the real Toolbox a discoverable entry for paid users. `S`
4. Delete the orphaned `_script.js`/`_body.html` dead code. `S`

### GAP 6 — Every email-gated free download is broken; the user surrenders an email, then gets a 500. `P0`
The **only two email-gated free assets** are the only two using `@react-pdf renderToBuffer`
(personas 7, 16, 28, 33, 47, 56, 63):
- **Prompt Cards PDF** (`/api/prompt-cards/download`) and **Safe AI Use Guide** (`/api/guides/safe-ai-use`) both 500 in prod (React #31).
- The Safe Guide shows a **false "Downloading now" success** before the 500 (`GuideRequestForm.tsx:104`).
- Prompt Cards also has a **role-dropdown 400 bug** (`value="foundation"` rejected; default state `'practitioner'` not in the option list) and the "unlock" is a bypassable localStorage flag.
- Same pattern affects **5 of 7 course PDFs** (transformation report, certificate, AUP card, prompt cards, skill-template library).

**Action:**
1. Move all `renderToBuffer` downloads to the working Chromium/print path (or pre-generate static PDFs like the other 22 working assets). `M`
2. Fix the Prompt Cards role dropdown (align options ↔ server `ROLES` ↔ default state). `S`
3. Don't show "unlocked"/"success" until the file actually streams. `S`

---

## PART 2 — ACTION ITEMS BY WEBSITE FUNCTION

### Function A — Free Assessment (the primary conversion engine)
Strong: 1-click start, 14 clicks to score (12 intrinsic), good result cross-linking ($99 + role playbook + PDF). Fixes:
- `P1` Add a graceful **"see a summary without email / no thanks"** lane; the preview is good but the only exits are a dead `#restart` link and a "Start over" that wipes answers. (cohort 1) `S`
- `P1` Remove **hardcoded `marketingOptIn:true`**; add an opt-out checkbox — privacy-skeptic bankers (53, 72, 90) bounce on the forced opt-in. (`EmailGate.tsx:175`) `S`
- `P1` **Persist phase in sessionStorage** so reloading on the score/results page doesn't bounce to the questionnaire (A5); restore the same question set on resume. `S`
- `P2` Fix the dead `#restart` anchor; allow per-question back at the score phase. `S`
- `P2` Handle the Supabase-down / `profileId:null` case so the inline report still offers a print link (no silent no-PDF). `S`
- `P2` Remove `console.log` of raw emails in `capture-email/route.ts`. `S`
- `P2` Delete the dead `TierPreview.tsx` (misrepresents the gate). `S`

### Function B — Resources / Downloads (well-stocked, easy wins available)
22 of 24 downloads work and are 2 clicks from desktop home. Fixes:
- `P0` Fix the 2 broken email-gated downloads (GAP 6). `M`
- `P1` **Discovery:** home has no resources link; `/prompt-cards` + `/playbooks` aren't in nav; the prompt-card library is reachable only via a below-the-fold button. Add resource entry points (see Clicks-to-Value §). `S`
- `P1` **Mobile tax:** "Resources" is behind the "More" panel (+1 click). Promote it. (`SiteHeader.tsx:31`) `S`
- `P1` **Inconsistent gating:** role playbook PDFs are ungated on `/resources` but email-gated on `/playbooks` (same file). Pick one. `S`
- `P2` Remove or surface the **9 "Coming soon" Draft playbook assets** (dead-ends). `S`
- `P2` Wire up or delete the **orphaned GTM Plan template** + `platform-feature-reference-card`. `S`

### Function C — $99 In-Depth Assessment
Mechanics are strong (1 click to checkout, 0 clicks to results). Fixes:
- `P1` **Discoverability:** no home/nav entry; `/security` and `/playground` have no path to it (personas 27, 43). Add a visible entry + cross-links from security/playground/course pages. `S`
- `P1` Idle-buyer re-engagement (GAP 3) + stranded-buyer detection (GAP 2). `M`
- `P2` `/assessment/in-depth/access` shows "Coming soon" scaffolding to individual buyers — hide it for them or finish it. `M`
- `P2` `/purchased` over-promises "your paid Toolbox" but browses free `/resources` — align copy. `S`

### Function D — $295 Foundation Course
Clean 3-click purchase; solid forward-gated progression. Fixes:
- `P0` Certificate dead-end (GAP 1) + stranded buyers (GAP 2) + retention (GAP 3). `M`
- `P1` **Module 3 difficulty cliff** — 0 activities in M2 → a 60-char authored-prompt gate in M3, no skip/scaffolding (personas 12, 23, 34, 57, 82). Add a worked example to adapt, lower the bar, or "save draft & continue". `M`
- `P1` `/courses/foundation/program` home doesn't gate on enrollment (soft leak). `S`
- `P1` Surface course/credential value (verifiable cert, AiBI-S/L ladder) on `/courses` — comparison shoppers can't see what they're buying. `S`
- `P2` `save-progress` fails silently — surface errors. `S`
- `P2` Hardcoded module-9/5 CTAs in `CompletionCTA.tsx` are brittle. `S`
- `P2` Two parallel module-content systems (`micro-modules.ts` live, 14 `module-N.ts` dead) — delete the dead set. `S`

### Function E — Toolbox / Practice / Playground (product demo)
- `P1` Fake-demo credibility (GAP 5). `M`
- `P1` **PII guardrail** is a narrow regex (misses names, addresses, partial accounts, narrative PII) and is **user-overridable with no server-side audit log** — a real compliance exposure for a banking product. Add audit logging of overrides + broaden detection. (`pii-scanner.ts`, `toolbox/run/stream/route.ts:160`) `M`
- `P2` `/api/sandbox/chat` gates auth but **not entitlement** — any free logged-in account can burn metered model budget. `S`

### Function F — Team / Institutions
- `P0` Team checkout wall (GAP 4). `M`
- `P2` Label the `/for-institutions` hero dashboard mockup as illustrative. `S`

### Function G — Auth / Fulfillment / Account
- `P0` Passwordless login + cross-device confirm + recovery (GAP 2). `M`
- `P2` `signOut` doesn't clear the `aibi-trusted-device` cookie. `S`

### Function H — Navigation / IA
- `P1` **Two divergent nav systems.** `/prompt-cards`, `/support/purchase-help`, `/verify/[id]` render legacy chrome with a **dead "About"→`/`** link and look like a different site. Add them to `CHROMELESS_PATHS` (or migrate to `MockupShell`) and delete `system/SiteNav` + `system/SiteFooter`. `S`
- `P1` **Orphan routes:** `/playground` and `/certifications` have zero inbound links. Link or retire them. `S`
- `P2` Home CtaBand "Start learning" → `/courses/foundation` 307→`/courses` — repoint to `/courses`. `S`
- `P2` De-duplicate `CHROMELESS_PATHS` (hand-maintained, error-prone). `S`

### Function I — Support / Refund
- `P1` Refund is contact-form-only with **no SLA shown**, eligibility the buyer **can't self-check**, on a **legacy-chrome page** (personas 11, 61, 87). Show the refund policy + window inline, set a response-time expectation, fix the chrome. `S`

### Function J — Security / Compliance content
- `P1` `/security/data-handling` is credible but missing **AiBI's own retention window, sub-processor/residency list, DPA/SOC 2**, and is silent on the PII-override reality — insufficient for formal vendor due diligence (personas 26, 33, 89). `S`
- `P2` Surface `/security` from `/resources` (currently footer-only) so security-seeking personas find the governance story. `S`

---

## PART 3 — CLICKS-TO-VALUE (the user's special focus)

Click count is **not** the funnel's main problem — but there are real, cheap wins, especially
the free-assessment → resource/role-playbook paths the user flagged.

| Value moment | Today | Friction | Target | Fix |
|---|---|---|---|---|
| Start free assessment | **1 click** | — | 1 | Already optimal (every hero/CTA → `/assessment/take`). |
| See free score | 1 + 12 answers + email | email gate (by design) | same | Keep; add "no-thanks" lane (Fn A). |
| **Free downloadable resource** | **2 desktop / 3 mobile** | no home link; nav-only; mobile behind "More"; prompt cards buried + broken | **1–2** | Add a **"Free downloads" item to primary nav** + a resource/role-playbook tile **on the home page** and **on the free-assessment result** (result already links the matched role playbook — extend to a "grab the kit" tile). Promote Resources out of the mobile "More" panel. |
| **Assessment → role playbook / template** | result links 1 role playbook (good); cold visitor 2–3 clicks + scroll-hunt | the specific artifact is buried under anchors; prompt cards 3–4 clicks + broken | **1–2** | On the result page, surface a **direct download of the matched role's playbook + starter kit** (not just a link to `/playbooks/[role]`). For cold visitors, feature 3–4 top resources on home. |
| Reach $99 offer | footer/upsell-only, then 1 click to Stripe | **no home/nav entry** | 1–2 | Add a visible $99 entry + cross-links from `/security`, `/playground`, `/courses`. |
| Reach $295 checkout | 2 (`/courses`) / 3 (home) | one avoidable 307 hop | 2 | Repoint the home "Start learning" CtaBand to `/courses`. |
| Run the public AI demo | unreachable + fake | orphan + mockup | 1 | Link a **real** (or honestly-labeled) demo from nav/home. |
| Earn certificate after $295 | **BLOCKED** | no issuance path | — | GAP 1. |

**Net:** the clicks-to-value wins are (1) put **resources/role-playbooks one click from home and on the result page**, (2) give the **$99 a visible entry**, (3) drop the **`/courses` redirect hop**, and (4) un-bury the **real demo**. None is large; all are `S`.

---

## PART 4 — REMAINING ITEMS (polish / lower severity)

- `P2` Home hero is abstract/problem-framed ("AI use is spreading. Workflow discipline is not.") with **no ICP mirror** (no "for community banks / credit unions") and concrete value ("Free · 12 questions · 3 minutes") demoted to meta text — hurts 10-second bouncers (36, 62, 80, 95). Consider leading with the plain promise + an ICP line + above-fold proof. `S`
- `P2` Sticky mobile CTA hidden until 600px scroll; animated demo renders above value copy on mobile — both hurt the first-paint window. `S`
- `P2` Report copy is tier-generic, not role/mission-aware (MDI, teller personas note it doesn't speak to them). Content, not code. `M`
- `P2` No press/media contact surface for journalist persona (22). `S`
- `P2` Non-FI visitors (fintech, student, consultant) have no path; acceptable if intentional, but the playground orphan means even curious evaluators bounce. `S`
- `P2` `/assessment/in-depth/results/[id]` and other bearer-token pages are by-design no-auth (UUID = access) — fine, but document it.

---

## Appendix — severity rollup

| Severity | Count of distinct issues | Representative |
|---|---|---|
| P0 (lost revenue / broken core promise) | 6 gaps | cert dead-end, stranded buyers, no retention, team checkout, fake demos, broken gated downloads |
| P1 (material conversion/trust leak) | ~18 | $99 discoverability, pricing scatter, module-3 cliff, nav split, PII audit log, email opt-in, refund UX |
| P2 (polish) | ~20 | hero copy, mobile first-paint, dead anchors, silent failures, dead code |

**Persona coverage:** 100/100 walked; all 14 completion-behavior buckets and every major
flow exercised. 24 reached goal cleanly, 18 damaged, 58 failed (23 critically). The clean-pass
personas are concentrated in resource-grabbing and free-assessment reading — i.e. the
**top of funnel works; the value-delivery bottom of funnel does not.**
