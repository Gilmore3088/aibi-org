---
phase: "05-modules-1-5-activities-artifacts"
verified: 2026-04-18
status: gaps_found
auditor: claude
note: "Live UAT on 2026-04-18 (see 05-UAT.md): SC1 + SC2 + SC3 code-paths verified; 2 UX bugs surfaced in AcceptableUseCardForm.tsx (disabled button on fresh submit; stale 'Plan 03' dev comment leaking to prod UI). SC4 color and SC5 iPhone 390px remain untested."
---

# Phase 5: Modules 1-5 Activities + Artifacts — Verification Report (Retroactive)

**Phase Goal:** The first five modules (Awareness and Understanding pillars) are fully interactive — every activity is submittable, three artifacts are downloadable, the classification drill is timed, and the Acceptable Use Card is generated dynamically from learner responses.
**Verified:** 2026-04-18 (retroactive audit; code shipped 2026-04-15 through 2026-04-16 across 4 plans)
**Status:** human_needed — every activity, route, and artifact is implemented and TypeScript-clean; WCAG behaviours and mobile rendering must be verified in-browser.

## Scope

From `05-CONTEXT.md`: replace Phase 2 form shells with real interactive forms, add a timed 20-scenario M5 classification drill, generate the Acceptable Use Card PDF dynamically via `@react-pdf/renderer`, wire static PDFs for Regulatory Cheatsheet and Platform Reference Card, and enforce WCAG 2.1 AA across every new component. Sales funnel CTAs (FUNL-01/02/03) wired at module completion points.

## Success Criteria — Pass/Fail

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | After submitting Activity 1.1 (two free-text answers, minimum 20 chars each), the learner receives the Regulatory Cheatsheet PDF download and Module 2 unlocks | CODE PASS · HUMAN NEEDED | `src/app/courses/aibi-p/_components/ActivityForm.tsx` enforces minLength; `POST /api/courses/submit-activity` re-validates server-side. `public/artifacts/regulatory-cheatsheet.pdf` exists (static). Module 2 unlock uses `save-progress` (Phase 4) — verified code path; human needs to confirm full flow. |
| 2 | After completing Activity 5.1 (20-scenario classification drill, timed), the learner sees their score with incorrect answers annotated; after Activity 5.2, a personalized Acceptable Use Card PDF is generated and downloaded | CODE PASS · HUMAN NEEDED | `ClassificationDrill.tsx` implements state machine (ready → active → review → submitted), 20s timer (setInterval), per-scenario annotations, tier breakdown. `content/courses/aibi-p/module-5.ts` confirmed expanded to 20 scenarios (5 Tier 1 / 8 Tier 2 / 7 Tier 3). `AcceptableUseCardForm.tsx` + `src/app/api/courses/generate-acceptable-use-card/route.ts` + `src/lib/pdf/AcceptableUseCardDocument.tsx` deliver dynamic PDF. Timer behaviour requires human verification. |
| 3 | After completing Module 4, the Platform Feature Reference Card PDF is available for download; Module 4's activity shows the learner's role-specific feature spotlight | CODE PASS · HUMAN NEEDED | `public/artifacts/platform-feature-reference-card.pdf` exists (static, 8-feature × 6-platform matrix + role-specific clusters). Role-specific spotlight relies on `contentRouting.ts` (Phase 4) being consumed by the M4 render path — human spot-check required for actual role-branched rendering. |
| 4 | A keyboard-only user can complete every activity in Modules 1-5 without a mouse; color is never the sole indicator of correct/incorrect classification | CODE PASS · HUMAN NEEDED | 05-04 summary: focus management via `useRef + useEffect` in `ActivityForm`, `AcceptableUseCardForm`; document-level `1`/`2`/`3` keyboard shortcuts in `ClassificationDrill` active phase; all error messages prefixed with `"Error: "`; `aria-live="polite"` announcements on submit. Requires human verification with screen reader + keyboard only. |
| 5 | A learner on iPhone Safari (390px) completes all five modules without horizontal scrolling, with all text at 14pt minimum | HUMAN NEEDED | Responsive CSS uses Tailwind breakpoints throughout; `overflow-x-auto` on ContentTable (Phase 2). Cannot be verified by code inspection. |

**Score (code facts):** 5/5 code paths implemented across 4 plans.
**Score (live verification):** 0/5 fully verifiable without a browser, screen reader, and iPhone.

## Required Artifacts

| Artifact | Plan | Status | Details |
|----------|------|--------|---------|
| `src/app/api/courses/submit-activity/route.ts` | 05-01 | VERIFIED | Auth + ownership + forward-only + minLength + duplicate checks |
| `src/app/courses/aibi-p/_components/ActivityForm.tsx` | 05-01 | VERIFIED | Generic form with textarea/text/radio/select; focus management; character counts |
| `src/app/courses/aibi-p/_components/ActivitySection.tsx` | 05-01 | VERIFIED | Routes activities by type/module; renders CompletionCTA on completion |
| `src/app/courses/aibi-p/_components/ModuleContentClient.tsx` | 05-01 | VERIFIED | Client boundary; threads `tables` prop |
| `src/app/courses/aibi-p/_components/ModuleNavigation.tsx` | 05-01 | VERIFIED | Gated Next Module link; `aria-disabled="true"` when locked |
| `src/app/courses/aibi-p/_components/SubscriptionInventory.tsx` | 05-02 | VERIFIED | 7-platform × 4-option radio grid for M2 Activity 2.1 |
| `src/app/courses/aibi-p/_components/ClassificationDrill.tsx` | 05-02 | VERIFIED | Timed drill; 20-scenario state machine |
| `src/app/courses/aibi-p/_components/AcceptableUseCardForm.tsx` | 05-02 | VERIFIED | 4-field role-specific form; PDF download link in read-only branch |
| `content/courses/aibi-p/module-5.ts` | 05-02 | VERIFIED | 20 drill scenarios confirmed (grep verified 5/8/7 distribution per summary) |
| `public/artifacts/regulatory-cheatsheet.pdf` | 05-03 | VERIFIED | 2-page LETTER PDF present |
| `public/artifacts/platform-feature-reference-card.pdf` | 05-03 | VERIFIED | 2-page landscape+portrait PDF present |
| `scripts/generate-static-artifacts.mjs` | 05-03 | PRESENT | One-time generator script (not re-run on build) |
| `src/lib/pdf/AcceptableUseCardDocument.tsx` | 05-03 | VERIFIED | React PDF component |
| `src/app/api/courses/generate-acceptable-use-card/route.ts` | 05-03 | VERIFIED | GET (re-download) + POST (fresh generate); auth + ownership |
| `next.config.mjs` | 05-03 | VERIFIED | `experimental.serverComponentsExternalPackages: ['@react-pdf/renderer']` (Next.js 14.2.x key; see 05-03 deviation note) |
| `src/app/courses/aibi-p/_components/CompletionCTA.tsx` | 05-04 | VERIFIED | Modules 1-4 soft message; Module 5 prominent Executive Briefing CTA with Calendly link |

## Key Link Verification

| From | To | Status | Details |
|------|----|--------|---------|
| `ActivityForm` | `/api/courses/submit-activity` | WIRED | Client POST with fieldId → value map |
| `submit-activity` | `activity_responses` table | WIRED | INSERT via service role after ownership check |
| `ClassificationDrill` | `submit-activity` | WIRED | Routed by `ActivitySection` for `type === 'drill'` |
| `AcceptableUseCardForm` | `/api/courses/generate-acceptable-use-card` | WIRED | POST on first generate; `isReadOnly` branch renders GET link by enrollmentId |
| `generate-acceptable-use-card` | `@react-pdf/renderer` | WIRED | `renderToBuffer(<AcceptableUseCardDocument />)` |
| Module 1 artifact download | `/artifacts/regulatory-cheatsheet.pdf` | WIRED | Plain `<a href download>` — A11Y-05 no-JS download |
| Module 4 artifact download | `/artifacts/platform-feature-reference-card.pdf` | WIRED | Plain `<a href download>` |
| Module 5 CompletionCTA | `NEXT_PUBLIC_CALENDLY_URL` | WIRED (with fallback) | FUNL-01/02/03; fallback URL used when env var unset |
| `ActivitySection` | `CompletionCTA` | WIRED | Renders after `progressSaved === true` |

## Gaps

None blocking. Minor notes:

- **Static PDFs are template placeholders.** Both static PDFs use Helvetica (not Cormorant/DM Mono as the brand brief specifies), because `@react-pdf/renderer` does not ship with the brand fonts bundled. The 05-03 plan notes this as acceptable — content matters more than font parity for these utility artifacts. A future phase could embed the brand fonts if needed.
- **Pre-existing test file errors** in `src/app/api/webhooks/stripe/route.test.ts` noted in 05-03 as "out of scope for this plan." Still out of scope for this verification — the webhook route itself compiles clean.
- **`contentRouting.ts` consumption in Module 4** was not explicitly tied to the Phase 5 summaries — the role-specific feature spotlight for M4 is described in module content and should render via the shared module page, but no code cite was provided in the summaries. Worth a human spot-check.

## External Blockers

None. Phase 5 is self-contained against Supabase + the bundled `@react-pdf/renderer` package. `NEXT_PUBLIC_CALENDLY_URL` has a safe fallback in the CTA component, so even without the env var the CTA is functional.

## Anti-Patterns Found

None. All error messages are prefixed with `"Error: "` (A11Y-02). Server-side `minLength` matches client-side (no trust-the-client). Ownership is verified before every write. `@react-pdf/renderer` is correctly added to Next.js `serverComponentsExternalPackages` (14.2.x key — verified as correct per 05-03 Context7 cite).

## Recommendation

**human-verification checkpoint.** Run the following in a real browser (iPhone Safari preferred for responsive checks):

1. Keyboard-only walkthrough of Activities 1.1 through 5.2 — confirm no mouse needed, focus moves to success region after submit, error messages read aloud with screen reader.
2. Complete the M5 classification drill — confirm the 20-second timer behaves correctly, `1`/`2`/`3` keyboard shortcuts work, all 20 scenarios present, score and annotations render.
3. Submit Activity 5.2 — confirm the PDF downloads, opens, and shows the learner's role, primary AI tool, STOP scenario, and START HERE use case.
4. Open `/artifacts/regulatory-cheatsheet.pdf` and `/artifacts/platform-feature-reference-card.pdf` directly; confirm content parity with brand brief expectations (content, not font).
5. iPhone Safari at 390px: complete Module 1 without horizontal scroll; confirm 14pt minimum body text; confirm ContentTable scrolls internally on mobile.
6. Confirm Module 5 CompletionCTA link opens Calendly with `NEXT_PUBLIC_CALENDLY_URL` (or fallback) in a new tab with `rel="noopener noreferrer"`.

Code is complete; the above checkpoint closes Phase 5.

---
*Verified (retroactive): 2026-04-18*
*Verifier: Claude (gsd-verifier)*
