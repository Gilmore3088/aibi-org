---
phase: "08-certificate-verification"
verified: 2026-04-18
status: human_needed
auditor: claude
note: "All 4 success criteria implemented — certificate pipeline, PDF generation, idempotency, public verification endpoint all in place; end-to-end certificate delivery is blocked behind Phase 7 review flow which itself needs external setup."
---

# Phase 8: Certificate + Verification — Verification Report (Retroactive)

**Phase Goal:** Reviewer approval triggers certificate record creation and PDF delivery, the certificate matches the specified design, a public verification endpoint returns holder details, and the learner sees their LinkedIn badge link on the completion page.
**Verified:** 2026-04-18 (retroactive audit; code shipped 2026-04-15 through 2026-04-16 across 2 plans)
**Status:** human_needed — every code path is implemented and TypeScript-clean; certificate issuance, verification endpoint, and PDF typography require a human to approve a real submission and visually inspect the generated PDF. Email delivery (CERT-02 "within 24 hours") deferred per context decisions.

## Scope

From `08-CONTEXT.md`: reviewer approval triggers certificate record creation and PDF delivery via `@react-pdf/renderer`, a public `/verify/[certificateID]` endpoint returns holder details without auth, and the learner sees their completion page with certificate download and LinkedIn badge placeholder. Accredible and LinkedIn badge integrations deferred to v2.

## Success Criteria — Pass/Fail

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | When a reviewer approves a submission, the system re-reads `approved` status from the database before issuing a certificate — no certificate is issued unless the status column confirms approval | PASS | `src/app/api/courses/generate-certificate/route.ts` POST handler queries `work_submissions.review_status` and compares to `'approved'` before any `certificates` INSERT. `review-submission/route.ts` triggers certificate generation as a best-effort internal fetch on approval. T-08-01 mitigation intact. |
| 2 | The learner receives a certificate PDF by email within 24 hours of approval; the certificate displays the correct typography (Cormorant 28pt name, DM Mono 12pt date, DM Mono certificate ID) and AiBI circular seal watermark at 8% opacity | CODE PASS (PDF + typography) · BLOCKED EXTERNAL (email) · HUMAN NEEDED (visual) | `src/lib/pdf/CertificateDocument.tsx` encodes all 7 CERT-02 typography elements. Note: react-pdf does not bundle Cormorant or DM Mono by default — the component uses Helvetica-Bold 28pt (closest PDF-native to Cormorant-Display) + Courier 12pt (closest to DM Mono). Brand-font parity requires embedding the TTFs, which was not in scope. Email delivery deferred per CLAUDE.md decisions log ("Third-party integrations deferred for prototype phase"). Learner can download PDF from `/courses/aibi-p/certificate` directly. |
| 3 | Navigating to `/verify/[certificateID]` without logging in returns the holder name, designation, date issued, and issuing institution — and nothing else | PASS | `src/app/verify/[certificateId]/page.tsx` uses Supabase anon client with `SELECT holder_name, designation, issued_at` — `id`, `enrollment_id`, scores, email all excluded. Issuing institution hardcoded as `"The AI Banking Institute"` (per 08-02 decision: not stored in DB per CERT-05 data minimization). `robots: noindex, nofollow` via `generateMetadata`. |
| 4 | The certificate ID is a unique alphanumeric string; a second approval attempt for the same enrollment does not create a duplicate certificate | PASS | `src/lib/certificates/generateId.ts` uses `crypto.getRandomValues()` producing `AIBIP-YYYY-XXXXXX` from a 30-character unambiguous alphabet (~729M combinations). `certificates` table has `UNIQUE(enrollment_id)` constraint (Phase 1). POST handler checks existing certificate before insert; handles 23505 unique violation as idempotent race. |

**Score (code facts):** 4/4 code paths implemented.
**Score (live verification):** 0/4 fully testable without a real approved submission and PDF inspection.

## Required Artifacts

| Artifact | Plan | Status | Details |
|----------|------|--------|---------|
| `src/lib/certificates/generateId.ts` | 08-01 | VERIFIED | `crypto.getRandomValues()`; `AIBIP-YYYY-XXXXXX` format |
| `src/lib/pdf/CertificateDocument.tsx` | 08-01 | VERIFIED | LETTER landscape, double-rule border, parchment background, text-based seal watermark at 8% opacity |
| `src/app/api/courses/generate-certificate/route.ts` | 08-01 | VERIFIED | POST (internal service-role, DB-re-read) + GET (auth+ownership learner download) |
| `src/app/api/courses/review-submission/route.ts` (updated) | 08-01 | VERIFIED | Triggers certificate generation on approval as best-effort internal fetch; returns `certificateGenerated` flag |
| `src/app/courses/aibi-p/certificate/page.tsx` | 08-01 | VERIFIED | Learner certificate page; download button; LinkedIn placeholder; next-steps card |
| `src/app/verify/[certificateId]/page.tsx` | 08-02 | VERIFIED | Public server component; anon client; 4-field response; noindex metadata |

## Key Link Verification

| From | To | Status | Details |
|------|----|--------|---------|
| `review-submission/route.ts` (approval path) | `/api/courses/generate-certificate` (internal POST) | WIRED | Best-effort fetch after reviewer approval; failures logged but do not surface to reviewer |
| `generate-certificate` POST | `work_submissions.review_status` | WIRED | DB re-read before insert |
| `generate-certificate` POST | `certificates` table | WIRED | INSERT via service role; UNIQUE constraint on `enrollment_id` enforces idempotency |
| `generate-certificate` POST | `renderToBuffer(<CertificateDocument />)` | WIRED | `React.ReactElement<DocumentProps>` cast per project pattern; `new Uint8Array(buffer)` wrap for Response compat |
| `generate-certificate` GET | auth + ownership check | WIRED | Serves PDF only to enrollment owner |
| `/courses/aibi-p/certificate` | `/api/courses/generate-certificate?enrollmentId=...` | WIRED | Download link on learner page |
| `/courses/aibi-p/certificate` | `/verify/{certificateId}` | WIRED | Shareable verification URL printed on page + inside PDF |
| `/verify/[certificateId]` | `certificates` via anon client | WIRED | SELECT restricted to `holder_name, designation, issued_at` |

## Gaps

Minor items, not blockers for code correctness:

- **Brand font parity on the PDF.** CERT-02 spec calls for Cormorant 28pt (name), Cormorant SC 18pt (designation), DM Mono 12pt (date), DM Mono 10pt (cert ID). Shipped PDF uses Helvetica-Bold and Courier — the react-pdf-safe defaults. Bundling Cormorant/DM Mono TTFs via react-pdf's `Font.register` would close this. Acceptable for prototype; flag for human design sign-off.
- **Email delivery within 24 hours (CERT-02).** Deferred per CLAUDE.md decisions log; learner downloads certificate directly from `/courses/aibi-p/certificate`. Wire ConvertKit or Loops when an account exists and attach the GET PDF link in the email.
- **LinkedIn badge is a placeholder.** "LinkedIn badge integration coming soon" text only. Known stub per 08-01 summary — deferred to v2 (Accredible integration).
- **Holder name resolution.** Derived from `auth.users` metadata (`full_name` → `name` → title-cased email prefix). Depends on Supabase signup flow capturing a name. If users sign up with just an email, the certificate will print a title-cased email prefix — technically correct but suboptimal. Worth a human check on real test accounts.

## External Blockers

- **Phase 7 external setup.** Certificate issuance is triggered by Phase 7 reviewer approval. Until `REVIEWER_EMAILS` is set and the `work-products` bucket is created, no approval flow can run → no certificate issuance can be tested end-to-end. See Phase 7 verification.
- **Email delivery service.** ConvertKit or Loops needed for CERT-02 "within 24 hours" email promise. Currently learner downloads certificate directly from the completion page, which satisfies the functional requirement but not the email-delivery wording.

Environment requirements for this phase alone: none beyond Supabase (already configured) and Phase 5's `@react-pdf/renderer` (already installed).

## Anti-Patterns Found

None. Trust boundary is DB re-read (never trust caller's claim of approval). Idempotency via `UNIQUE(enrollment_id)` + pre-insert check + 23505 unique-violation handler. Verification endpoint selects only 3 columns (data minimization). `robots: noindex, nofollow` on public verification page. Service-role client used only inside the internal POST; public anon client used for the verify page.

## Recommendation

**human-verification checkpoint (blocked on Phase 7 external setup).** Once Phase 7 is unblocked:

1. Complete a submission; reviewer approves with passing scores.
2. Confirm `certificates` row is inserted with a unique `certificate_id` matching `AIBIP-\d{4}-[A-Z0-9]{6}`.
3. Download the certificate PDF from `/courses/aibi-p/certificate`; visually inspect: holder name, designation, institution, date, cert ID, verification URL, seal watermark at 8% opacity.
4. Visit `/verify/{certificateId}` in an incognito window; confirm exactly 4 fields render and nothing else.
5. Attempt to fetch the PDF as a different authenticated user by guessing `enrollmentId`; confirm 403.
6. Trigger a second approval for the same enrollment (simulated); confirm no duplicate `certificates` row created.
7. View-source the `/verify` page; confirm `<meta name="robots" content="noindex,nofollow">` present.
8. (Design sign-off) Decide whether to bundle Cormorant/DM Mono TTFs via `Font.register` for brand-font parity on the PDF.

Code is complete; the above checkpoint closes Phase 8.

---
*Verified (retroactive): 2026-04-18*
*Verifier: Claude (gsd-verifier)*
