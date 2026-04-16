---
phase: 08-certificate-verification
plan: 01
subsystem: api
tags: [react-pdf, supabase, certificates, pdf-generation, course]

# Dependency graph
requires:
  - phase: 07-work-product-reviewer-queue
    provides: review-submission API with approval trigger (triggerCertificate flag)
  - phase: 01-database
    provides: certificates table with UNIQUE(enrollment_id) constraint
provides:
  - Certificate ID generator (AIBIP-YYYY-XXXXXX format, crypto.getRandomValues)
  - CertificateDocument react-pdf component matching HTML mockup design
  - POST /api/courses/generate-certificate with idempotency guard and approval re-read
  - GET /api/courses/generate-certificate for authenticated learner PDF download
  - review-submission API wired to trigger certificate generation on approval
  - /courses/aibi-p/certificate learner page with download and LinkedIn placeholder
affects: [certificate-verification, verify-endpoint, linkedin-badge]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - react-pdf DocumentProps cast pattern for renderToBuffer() type compatibility
    - Uint8Array body wrapping for Web API Response from Node Buffer
    - createSupabaseServerClient directly in route handlers (not wrapper) for cookie auth
    - getEnrollment() shared helper for server component auth/enrollment lookup
    - Idempotency guard: check existing before insert, recover from unique constraint race

key-files:
  created:
    - src/lib/certificates/generateId.ts
    - src/lib/pdf/CertificateDocument.tsx
    - src/app/api/courses/generate-certificate/route.ts
    - src/app/courses/aibi-p/certificate/page.tsx
  modified:
    - src/app/api/courses/review-submission/route.ts

key-decisions:
  - "Text-based seal watermark (not image) — no external image dependency, renders reliably at 8% opacity"
  - "Holder name resolved from auth.users metadata (full_name/name), falls back to title-cased email prefix"
  - "Internal POST route uses service role client only (no cookie auth required) — trust boundary is the DB re-read of review_status"
  - "Certificate generation on approval is best-effort: reviewer response saved first, cert failure does not surface to reviewer"

patterns-established:
  - "React-PDF: cast createElement result as React.ReactElement<DocumentProps> before passing to renderToBuffer()"
  - "PDF response: wrap Buffer with new Uint8Array(buffer) for NextResponse/Response compatibility"
  - "Idempotency: check certificates.enrollment_id before insert, handle 23505 unique violation as race condition"
  - "Security: re-read DB state before any certificate issuance — never trust caller's claim of approval"

requirements-completed: [CERT-01, CERT-02, CERT-03, CERT-04, CERT-06]

# Metrics
duration: 45min
completed: 2026-04-16
---

# Phase 08 Plan 01: Certificate Generation Pipeline Summary

**AiBI-P certificate pipeline: react-pdf document with CERT-02 typography, idempotent DB-backed issuance triggered by reviewer approval, and learner download page**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-04-16T17:24:00Z
- **Completed:** 2026-04-16T18:09:40Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Certificate ID generator using `crypto.getRandomValues()` producing `AIBIP-YYYY-XXXXXX` from an unambiguous 30-char alphabet (~729M combos)
- `CertificateDocument` react-pdf component with all 7 CERT-02 typography elements: Helvetica-Bold 28pt name, 18pt designation (SC treatment), 14pt institution, Courier 12pt date, 10pt cert ID, 10pt verify URL, Helvetica-Oblique 10pt assessment note — LETTER landscape with double-rule border, parchment background, text-based AiBI seal watermark at 8% opacity
- `POST /api/courses/generate-certificate` — re-reads `review_status='approved'` from DB before issuing (T-08-01), checks for existing certificate (idempotency, CERT-01), inserts record, handles unique constraint race condition, generates PDF via `renderToBuffer()`
- `GET /api/courses/generate-certificate?enrollmentId=` — verifies requesting user owns the enrollment (T-08-04) before serving PDF
- `review-submission` route wired: triggers certificate generation as best-effort internal fetch on approval, returns `certificateGenerated` flag in response
- `/courses/aibi-p/certificate` server component: shows certificate details with double-rule card, download button, LinkedIn placeholder with credential reference text, next-steps promotion card

## Task Commits

1. **Task 1: Certificate ID generator and CertificateDocument** - `659f470` (feat)
2. **Task 2: API route, review-submission wiring, certificate page** - `b7a0cd6` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/lib/certificates/generateId.ts` — `generateCertificateId()` using crypto.getRandomValues, AIBIP-YYYY-XXXXXX format
- `src/lib/pdf/CertificateDocument.tsx` — react-pdf certificate component, 7 CERT-02 typography elements, seal watermark at 8% opacity
- `src/app/api/courses/generate-certificate/route.ts` — POST (internal) + GET (learner download) handlers
- `src/app/api/courses/review-submission/route.ts` — added best-effort certificate trigger on approval
- `src/app/courses/aibi-p/certificate/page.tsx` — learner certificate page with download, LinkedIn placeholder, next-steps

## Decisions Made

- Used text-based seal watermark instead of an image file — no external dependency, renders reliably in react-pdf at any opacity level
- Holder name resolved from `auth.users` metadata (`full_name` then `name`), falls back to title-cased email prefix — covers cases where user has no display name set
- Internal POST to generate-certificate uses service role client only; no cookie auth needed since trust boundary is the DB re-read of `review_status='approved'`
- Certificate generation on approval is best-effort — review is persisted first, certificate failure logged but does not fail the reviewer response

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused variable lint error (`WHITE` constant)**
- **Found during:** Task 2 (build verification)
- **Issue:** `WHITE` color constant declared but not referenced in styles after refactoring — ESLint `no-unused-vars` failed build
- **Fix:** Removed `WHITE` constant (linter subsequently restored it via auto-format; final state is clean)
- **Files modified:** `src/lib/pdf/CertificateDocument.tsx`
- **Verification:** `npm run build` passes (`✓ Compiled successfully`)
- **Committed in:** `b7a0cd6`

**2. [Rule 1 - Bug] Fixed TypeScript type errors in generate-certificate route**
- **Found during:** Task 2 (TypeScript check after initial write)
- **Issue:** Three type incompatibilities: (a) `renderToBuffer` expects `ReactElement<DocumentProps>` not `ReactElement<CertificateDocumentProps>`; (b) `Buffer` not assignable to `NextResponse` body; (c) `ReadonlyRequestCookies` incompatible with project's `createServerClient` wrapper
- **Fix:** (a) Applied `as React.ReactElement<DocumentProps>` cast per project pattern; (b) wrapped Buffer with `new Uint8Array(buffer)` and used native `Response` not `NextResponse`; (c) replaced `createServerClient` wrapper with direct `createSupabaseServerClient` using `getAll/setAll` cookie pattern; (d) replaced page auth with `getEnrollment()` shared helper
- **Files modified:** `src/app/api/courses/generate-certificate/route.ts`, `src/app/courses/aibi-p/certificate/page.tsx`
- **Verification:** `npx tsc --noEmit` returns zero errors
- **Committed in:** `b7a0cd6`

---

**Total deviations:** 2 auto-fixed (2 × Rule 1 bugs)
**Impact on plan:** Both fixes necessary for TypeScript correctness and build success. No scope creep.

## Issues Encountered

- Pre-existing `/admin/reviewer` prerender failure due to missing Supabase env vars in build environment — present before this plan, unrelated to certificate work. Build compilation succeeds cleanly.

## Known Stubs

- LinkedIn badge on `/courses/aibi-p/certificate`: shows placeholder text `"LinkedIn badge integration coming soon"` with a credential reference string. Intentional — wiring to LinkedIn Certifications API is a future phase item.

## Threat Flags

None — all surfaces identified in the plan's threat model were mitigated as implemented.

## Next Phase Readiness

- Certificate issuance pipeline complete; ready for Phase 08 Plan 02 (public verification endpoint at `/verify/[certificateId]`)
- `certificates` table has `UNIQUE(certificate_id)` — verification endpoint can look up by cert ID directly
- Certificate page links to `/verify/{certificateId}` — that route needs to exist for the link to work

## Self-Check: PASSED

All created files confirmed present. Both task commits verified in git log.

---
*Phase: 08-certificate-verification*
*Completed: 2026-04-16*
