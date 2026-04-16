---
phase: 05-modules-1-5-activities-artifacts
plan: "03"
subsystem: course-artifacts
tags: [pdf, artifacts, react-pdf, api-route, static-assets]
dependency_graph:
  requires: ["05-01"]
  provides: ["ARTF-01", "ARTF-02", "ARTF-05", "generate-acceptable-use-card-route"]
  affects: ["AcceptableUseCardForm (disabled stub now wired)", "M1 Activity 1.1 download", "M4 completion download"]
tech_stack:
  added: ["@react-pdf/renderer@4.5.1"]
  patterns: ["server-side PDF generation via renderToBuffer", "React PDF JSX document components", "static asset generation script", "GET+POST API route for PDF download"]
key_files:
  created:
    - public/artifacts/regulatory-cheatsheet.pdf
    - public/artifacts/platform-feature-reference-card.pdf
    - scripts/generate-static-artifacts.mjs
    - src/lib/pdf/AcceptableUseCardDocument.tsx
    - src/app/api/courses/generate-acceptable-use-card/route.ts
  modified:
    - next.config.mjs
    - package.json
    - package-lock.json
decisions:
  - "@react-pdf/renderer marked as serverComponentsExternalPackages in experimental (Next.js 14.2.x) — not the top-level serverExternalPackages key which is Next.js 15+"
  - "Buffer from renderToBuffer converted to Uint8Array before passing to Web API Response constructor for TS compatibility"
  - "Static PDFs generated via one-time script (scripts/generate-static-artifacts.mjs) rather than at build time — avoids adding PDF generation to every build and keeps PDFs version-controlled in public/artifacts/"
  - "Platform Reference Card uses LETTER landscape orientation for the feature matrix to fit 8 columns legibly"
metrics:
  duration_minutes: 30
  completed_date: "2026-04-16"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 3
---

# Phase 05 Plan 03: Course Artifacts — PDF Generation Summary

**One-liner:** Installed @react-pdf/renderer, generated two static brand-consistent PDFs (Regulatory Cheatsheet + Platform Feature Reference Card), and wired dynamic Acceptable Use Card PDF generation via a GET+POST API route.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install @react-pdf/renderer, configure Next.js, create static PDFs | c8b33b5 | next.config.mjs, package.json, public/artifacts/*.pdf, scripts/generate-static-artifacts.mjs |
| 2 | Dynamic Acceptable Use Card PDF generation API route | ca0800b | src/lib/pdf/AcceptableUseCardDocument.tsx, src/app/api/courses/generate-acceptable-use-card/route.ts |

## What Was Built

### Static PDFs (ARTF-01, ARTF-05)

**Regulatory Cheatsheet** (`public/artifacts/regulatory-cheatsheet.pdf`):
- 2-page LETTER PDF
- Page 1: Five regulatory frameworks table (SR 11-7, TPRM, ECOA/Reg B, BSA/AML, AIEOG Lexicon) with Framework, Regulatory Body, How It Applies to AI, Staff-Level Impact columns
- Page 2: AIEOG AI Lexicon with all 6 key terms (Hallucination, AI Governance, AI Use Case Inventory, HITL, Third-Party AI Risk, Explainability) with terracotta left-border accent per term
- Brand design: terracotta header band, parchment background, ink text, Helvetica (closest PDF-native serif-like option)

**Platform Feature Reference Card** (`public/artifacts/platform-feature-reference-card.pdf`):
- 2-page PDF (landscape + portrait)
- Page 1 (landscape): 8 features x 6 platforms feature matrix with best banking use column
- Page 2 (portrait): Role-specific feature clusters for 6 roles (Lending, Compliance, Operations, Marketing, Retail/Frontline, Finance/Accounting) + paid tier pricing note
- Data classification warning box (red accent) on matrix page

Both PDFs are served as plain `<a href="/artifacts/...">` anchor tags — no JavaScript required (A11Y-05).

### Dynamic PDF API Route (ARTF-02)

**AcceptableUseCardDocument** (`src/lib/pdf/AcceptableUseCardDocument.tsx`):
- Single-page LETTER portrait React PDF component
- Sections: Your Role, Authorized AI Tools, STOP: Highest-Risk Scenario (red #9b2226 left border + DO NOT proceed warning), START HERE: Safe Use Case (sage #4a6741 left border), Three-Tier Classification quick reference table
- Footer with generated date and AIBankingInstitute.com

**Route** (`src/app/api/courses/generate-acceptable-use-card/route.ts`):
- `GET ?enrollmentId=<id>` — re-downloads PDF from saved activity_responses row (activity_id=5.2)
- `POST { enrollmentId, responses: { roleContext, primaryAiTool, highestRiskScenario, quickWinUseCase } }` — generates from fresh data
- Auth: session required (401 if unauthenticated)
- Ownership: enrollment.user_id must match authenticated user (403 otherwise) — T-05-10, T-05-12
- Returns `application/pdf` with `Content-Disposition: attachment; filename="AiBI-Acceptable-Use-Card.pdf"`
- Buffer converted to Uint8Array for Web API Response compatibility

The `AcceptableUseCardForm` disabled stub (Plan 02) is now wired — the GET anchor link was already present in the form's `isReadOnly` branch pointing to `/api/courses/generate-acceptable-use-card?enrollmentId=...`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Next.js 14.2.x uses experimental.serverComponentsExternalPackages, not serverExternalPackages**
- **Found during:** Task 1
- **Issue:** Plan noted "check Context7 for correct Next.js 14 config key." Next.js 14.2.x uses `experimental.serverComponentsExternalPackages`; the top-level `serverExternalPackages` key is Next.js 15+.
- **Fix:** Used `experimental.serverComponentsExternalPackages` in next.config.mjs
- **Files modified:** next.config.mjs

**2. [Rule 1 - Bug] TypeScript: renderToBuffer requires ReactElement<DocumentProps>**
- **Found during:** Task 2
- **Issue:** `renderToBuffer` is typed as accepting `ReactElement<DocumentProps>`, but `React.createElement(AcceptableUseCardDocument, ...)` produces `ReactElement<AcceptableUseCardProps>`. This causes a TS2345 error.
- **Fix:** Cast the element as `React.ReactElement<DocumentProps>` before passing to `renderToBuffer` with a comment explaining the cast is safe (component renders a `<Document>` root).

**3. [Rule 1 - Bug] TypeScript: Node.js Buffer not assignable to Web API BodyInit**
- **Found during:** Task 2
- **Issue:** `new Response(buffer, ...)` fails TS because `Buffer<ArrayBufferLike>` is missing URLSearchParams methods expected by `BodyInit`.
- **Fix:** `new Uint8Array(buffer)` before passing to Response — standard Node→Web API conversion.

**Pre-existing errors (out of scope):** `src/app/api/webhooks/stripe/route.test.ts` has 3 errors about unexported members — existed before this plan, not touched.

## Known Stubs

None. The AcceptableUseCardForm disabled stub from Plan 02 is now fully wired to the live GET endpoint.

## Threat Surface Scan

No new trust boundaries introduced beyond those in the plan's threat model. The `generate-acceptable-use-card` route was already accounted for in T-05-10 through T-05-13. Auth and ownership enforcement implemented as specified.

## Self-Check: PASSED

- public/artifacts/regulatory-cheatsheet.pdf: EXISTS (8,925 bytes)
- public/artifacts/platform-feature-reference-card.pdf: EXISTS (12,476 bytes)
- src/lib/pdf/AcceptableUseCardDocument.tsx: EXISTS
- src/app/api/courses/generate-acceptable-use-card/route.ts: EXISTS
- commit c8b33b5: EXISTS
- commit ca0800b: EXISTS
- `npm run build` passes — `/api/courses/generate-acceptable-use-card` appears in build output as dynamic route
