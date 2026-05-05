# Assessment Results — Spec 2: PDF Download (Advocacy)

**Date:** 2026-05-04
**Status:** Draft (awaiting user review)
**Owner:** James Gilmore
**Parent:** `docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md`
**Position:** Surface 2 of 4. Ships after Spec 1 (on-screen reshape) merges.

---

## Job

The PDF is the artifact the assessment-taker hands to their CEO / risk committee / board. Optimized for **advocacy**: shareable, citation-heavy, regulator-aware, looks credible on a leadership table.

Audience-of-record: the user's boss, not the user.

## Locked Decisions (from Brainstorm)

| Decision | Choice | Rationale / Tradeoff |
|---|---|---|
| Generation tech | Headless Chromium (Puppeteer or Playwright) + `@sparticuz/chromium` on Vercel serverless function | Highest layout fidelity. Reuses Tailwind / Cormorant / DM Sans / DM Mono verbatim from the on-screen brief. ~150 MB Chromium binary, ~3–8s generation latency. Acceptable on Vercel with extended timeout config. |
| Delivery flow | Warm on results-page-load, instant download once ready | Magical UX (no perceived wait). ~2× compute cost (every results pageload triggers generation whether downloaded or not) — accepted. |
| Depth | Board-ready briefing — 8–12 pages | Matches McKinsey/Oliver Wyman expectation for a leadership-table artifact. Slower (~5–7s) but earns the latency. |
| Storage | Supabase Storage with RLS, bucket `assessment-pdfs` | Reuses existing Supabase project, RLS-protected, integrates with existing auth model. |
| Access control | Full Supabase Auth signup gate at download click | Deliberate override of the recommended token-keyed approach. User is told "Create an account to download" at the click moment. Trade-off (account-creation friction at conversion moment) accepted in favor of building a real authed-user base. |
| Gate timing | At PDF download click only — on-screen brief stays auth-free | Lightest friction shape consistent with the auth requirement. User has on-screen value before being asked to sign up. |
| Warm/auth conflict resolution | Warm anonymously keyed to `assessment_responses.id`. RLS denies read until signup back-fills `user_id = auth.uid()`. PDF is generated and stored regardless of whether user signs up; only download is gated. | Lets us keep both decisions without contradiction. Anonymous PDFs that never get downloaded are cleaned up by retention sweep. |

## Detail-Level Defaults (overridable)

- **Auth method**: Magic link via Supabase Auth + Custom SMTP (Resend, already configured per `CLAUDE.md`). Email captured at assessment time pre-fills the signup form so the user only has to confirm.
- **Retake handling**: Each new `assessment_responses` row produces its own PDF at its own storage path. Old PDFs remain accessible (RLS-permitting) until retention sweep.
- **Retention**: Signed-download-URL TTL = 24h. Storage bucket retention = 30 days from creation. Nightly Supabase cron deletes anything older.
- **Citations**: Pulled from `CLAUDE.md`'s sourced-statistics table + the AIEOG AI Lexicon (Feb 2026) + SR 11-7 + Interagency TPRM Guidance + ECOA / Reg B. All citations include named source + year.
- **Branding in print**: Same terra / parch / linen / ink palette translated to print color. Cormorant + Cormorant SC + DM Sans + DM Mono fonts subset and embedded.
- **Page size**: US Letter (8.5×11). 0.75″ margins. Footer carries page number + "AI Readiness Briefing · {institution_name} · {date}".

## What This Spec Does NOT Do

- **No email delivery of the PDF.** Click-to-download only. **Spec 3** owns email-as-delivery (and may attach or link to the PDF generated here).
- **No public share URL for the PDF.** Each download is RLS-bound to a specific Supabase Auth user. **Spec 4** owns shareable result URLs and may unify share semantics across HTML + PDF.
- **No peer-benchmarking content in the PDF.** Same blocker as on-screen (N≥30 per segment per `CLAUDE.md`). PDF page-composition leaves a placeholder slot in the Future Vision page that lights up post-Phase 1.5.
- **No changes to assessment instrument.** Same questions, same scoring, same dimensions.
- **No changes to the existing email-capture rate-limit, ConvertKit-tagging, or staging suppression flow.** Auth signup is layered on top, not replacing capture.

## Page-by-Page Composition

| Page | Section | Content source |
|---|---|---|
| 1 | Cover | Brand wordmark, "AI Readiness Briefing", `subjectName` (institution), date, tier label, score / 48, prepared-for line ("{firstName}"). |
| 2 | Executive Summary | Persona one-liner, score ring (rasterized from on-screen), top three lensed implications inline. |
| 3 | Lensed Implications (full) | Full `FINANCIAL_IMPLICATIONS[tierId]` — operational / risk / cost lenses, each given a half-page block instead of the dl-row form. |
| 4–5 | Strengths & Gaps overview | Tier ranking visualization for all 8 dimensions; critical gaps highlighted. |
| 6–7 | Gap Card pages | Each critical-tier gap gets a half-page treatment (full `GAP_CONTENT.explanation` + impacts + what-good-looks-like). Up to 4 gaps in this section. |
| 8 | Your First Move | Full `RECOMMENDATIONS[focusGap.id]` content — whyRightNow / inPractice / worksBestFor / risk / time-saved / owner. |
| 9 | Starter Prompt + 7-Day Plan | Starter prompt printed verbatim in mono. 7-Day plan as numbered timeline. |
| 10 | Future Vision | `FUTURE_VISION` content (cut from on-screen). Reserved space for future peer-benchmark callout. |
| 11 | Next Steps | The Section 9 trio (Training / Strategic Planning / Governance) restored from on-screen cut. Clear hierarchy with Training as primary action for tier-appropriate scores. |
| 12 | Governance & Citations | SR 11-7, Interagency TPRM Guidance, ECOA / Reg B, AIEOG AI Lexicon — full named-source citations. Generated date / version. Back cover line. |

## Architecture

**New files:**

- `src/app/api/assessment/pdf/warm/route.ts` — POST endpoint. Triggered by results-page client component on mount. Server action launches Puppeteer, snapshots the print route, uploads to Supabase Storage, returns the storage path.
- `src/app/api/assessment/pdf/download/route.ts` — GET endpoint. Validates auth session, joins `assessment_responses` for ownership, returns a signed Supabase Storage URL (24h TTL).
- `src/app/assessment/results/print/page.tsx` — server-rendered Next.js route Puppeteer snapshots. NOT linked from anywhere user-facing; only fetched by the warm function. Print-only Tailwind, no interactive chrome.
- `src/app/assessment/_components/PdfDownloadButton.tsx` — client component on the results page. Manages warm trigger state ("Preparing your brief…" → "Download PDF") and the auth-gate modal flow.
- `src/lib/pdf/generate.ts` — headless-Chromium wrapper. Handles Puppeteer launch options, page rendering, PDF emission. Single export: `generateAssessmentPdf({ assessmentResponseId }) → Buffer`.
- `src/lib/pdf/storage.ts` — Supabase Storage upload + signed URL helpers. Path scheme: `assessment-pdfs/{assessmentResponseId}.pdf`.
- `supabase/migrations/00025_assessment_pdfs.sql` — adds `pdf_storage_path` and `pdf_generated_at` columns to `assessment_responses`. Creates `assessment-pdfs` bucket. RLS policy: read allowed where `auth.uid() = assessment_responses.user_id`.
- `supabase/migrations/00026_assessment_responses_user_id.sql` — adds nullable `user_id` UUID FK on `assessment_responses` referencing `auth.users(id)`. Back-filled to NULL on existing rows.

**Modified files:**

- `src/app/assessment/_components/ResultsViewV2.tsx` — adds `<PdfDownloadButton assessmentResponseId={id} />` after the appendix (printed only on screen via `data-print-hide` on the print route). No layout disruption.
- `src/app/assessment/page.tsx` — passes the `assessmentResponseId` through to `ResultsViewV2` (already in state from the email-capture flow).

## Acceptance Criteria

1. **Generation succeeds end-to-end**: Completing the assessment, entering email, and waiting on the results page produces a valid 8–12 page PDF in Supabase Storage at `assessment-pdfs/{id}.pdf`.
2. **Warm timing**: PDF is ready (storage row exists, file size > 50 KB, content-type `application/pdf`) within 10 seconds of results-page mount on a typical Vercel cold start, 8 seconds warm.
3. **Auth gate fires correctly**: Before any auth signup, clicking the Download button shows a Supabase magic-link signup form pre-filled with the captured email. After magic-link confirmation and redirect back to results, the Download button transitions to active state.
4. **RLS denies pre-auth**: An unauthenticated request to `/api/assessment/pdf/download?id={x}` returns 401 even when `pdf_storage_path` exists on the row.
5. **RLS permits post-auth**: An authenticated user who owns the row receives a signed URL with 24h TTL.
6. **Page composition matches the table**: A QA pass confirms each of the 12 pages renders the listed content. No section is missing, no content is duplicated across pages.
7. **Brand fidelity**: Cormorant headlines, DM Sans body, DM Mono numbers. Terra / parch / linen / ink colors render correctly in the PDF (no fallback to system fonts, no flat black-and-white). Score ring rasterizes correctly (not vector-empty).
8. **Citations completeness**: Every statistic in the PDF cites a named source per `CLAUDE.md` rules ("FFIEC-aware" never appears anywhere). Governance page lists SR 11-7 / Interagency TPRM / ECOA / Reg B / AIEOG by name.
9. **Retake produces a fresh PDF**: Retaking the assessment creates a new row, a new `pdf_storage_path`, and the previous PDF remains accessible via its old path until retention sweep.
10. **Retention sweep removes 30+ day-old PDFs**: A daily cron (Supabase Scheduled Function or Vercel Cron) deletes storage objects older than 30 days from creation. Verified by a unit test against a seeded old row.
11. **Staging suppression**: In staging (`COMING_SOON_MODE` or equivalent), the warm endpoint short-circuits to a placeholder PDF stub instead of running real Chromium. Avoids burning serverless minutes during testing.
12. **Mobile / responsive**: Download button is keyboard-focusable, ≥44 px tap target, gracefully shows "Preparing your brief…" with progress affordance during warm.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Vercel serverless 10s default timeout < generation latency | Configure `maxDuration: 60` on the warm route. Use Edge runtime where possible; Node runtime for Chromium. |
| `@sparticuz/chromium` version drift breaks Vercel deployment | Pin both `@sparticuz/chromium` and `puppeteer-core` to compatible majors; track upstream issues. |
| Anonymous-warming uploads fill Supabase Storage with PDFs nobody downloads | 30-day retention sweep + Plausible event `pdf_downloaded` to measure actual conversion ratio. If <10% of warmed PDFs ever download, revisit the warm decision. |
| Magic-link email deliverability fails at the conversion moment | Resend is the existing Custom SMTP per `CLAUDE.md`. Provide a "Resend the link" affordance with a 60s rate limit. |
| Auth signup adds friction that drops PDF-download conversion | Tracked: Plausible `pdf_download_clicked` (pre-auth) vs `pdf_downloaded` (post-auth) ratio. If < 50%, reconsider gate (Spec 4 amends). |
| Cost overrun from per-pageload generation | Plausible event + Supabase storage size dashboard. Hard cap: alert if monthly bill > $X (TBD with infra owner). |

## Open Questions (for plan-time, not blockers)

- Magic-link landing redirect URL — back to `/assessment` results, or a dedicated `/assessment/results/{id}` page? Likely the latter once Spec 4 ships; for Spec 2 a query param + sessionStorage round-trip works.
- Page-numbering format — "Page X of Y" footer requires a second-pass render to know total pages. Acceptable to ship with "Page X" only and add "of Y" later.
- Score ring rasterization — embed as inline SVG vs render to PNG. SVG is sharper; PNG is more universally compatible with non-Acrobat readers.
