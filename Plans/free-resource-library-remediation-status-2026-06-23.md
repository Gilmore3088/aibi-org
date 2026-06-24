# Free Resource Library Remediation Status

Date: 2026-06-24
Branch: `codex/resource-library-remediation`; continued in `codex/resource-review-after-persona` / PR #517

## What This Branch Completes

This branch implements the first guardrail pass from the content resource review and a first slice of the shared free-resource gate:

- Added a canonical free-resource manifest at `src/lib/resources/freeResources.manifest.json`.
- Added typed manifest helpers in `src/lib/resources/freeResources.ts`.
- Derived the download catalog and admin resource metadata from the manifest.
- Added `npm run audit:resources` to detect duplicate slugs, missing files, orphaned public downloads, dev/local URLs, ZIP drift, and Markdown-only core ZIP members.
- Added unit tests for manifest integrity, committed download coverage, catalog lookup, and resource metadata.
- Surfaced two previously orphaned public downloads in `/resources`:
  - Platform Feature Reference Card
  - AI GTM Plan
- Rebuilt the four kit ZIPs so core assets are PDFs, not raw Markdown:
  - Governance Starter Kit
  - Frontline Enablement Kit
  - Lending Review Kit
  - Marketing Review Kit
- Regenerated nine role playbook PDFs and four template PDFs with production URLs instead of localhost link annotations.
- Updated PDF generation scripts so future playbook/template PDFs default to `https://www.aibankinginstitute.com`.
- Promoted the missing Executive, Operations, and Training/HR role playbooks from planned manifest rows to public, email-gated PDF downloads.
- Added the three promoted role playbooks to `/resources`, the all-nine-role filter rail, storage seed metadata, and download/playbook E2E coverage.
- Derived `/resources` role playbook cards from the canonical `PLAYBOOK_INDEX` plus the free-resource manifest so role titles, descriptions, ordering, and PDF routes cannot silently drift.
- Added a lightweight template index and derived `/resources` template cards from that index plus the free-resource manifest, keeping the full template body out of the client resource-card bundle.
- Derived `/resources` desk-card and paid-preview cards from public manifest rows, leaving only card-specific descriptions, actions, and icons in the resource page data.
- Derived `/resources` starter kit titles, ZIP routes, audiences, and included artifact links from public manifest rows and ZIP membership, leaving only UI ids, descriptions, file-size labels, and icons local.
- Derived `/resources` problem-path artifact labels and routes from public manifest rows and rendered the existing problem-path data as a visible guided finder section.
- Added a shared `FreeResourceDownloadGate` for resource CTAs.
- Wired `/resources` starter kits, featured-kit downloads, role playbook PDFs, template Word downloads, desk cards, and paid-preview samples through the shared gate.
- Wired `/resources` problem-path PDF/sample actions through the shared gate while keeping template problem paths on their canonical template pages.
- Added `/api/resources/[slug]/word` for public PDF resources that have committed branded source HTML, producing self-contained Word-compatible `.doc` downloads with inline brand CSS.
- Added manifest Word routes for 18 generic source-backed resources:
  - Safe AI Use Checklist
  - Red / Yellow / Green Use Card
  - Prompt Strategy Cheat Sheet
  - Regulatory Cheat Sheet
  - Platform Feature Reference Card
  - Data Handling Reference Card
  - Fair-Lending AI Review Checklist
  - Compliance Playbook
  - Branch / Retail Playbook
  - Marketing Playbook
  - Lending Playbook
  - BSA / AML Playbook
  - IT / InfoSec Playbook
  - Executive Playbook
  - Operations Playbook
  - Training / HR Playbook
  - In-Depth Assessment Playbook
  - Sample Readiness Report
- Confirmed every public PDF resource in the manifest now has an editable Word route: `23` public PDFs, `0` missing Word routes. ZIP starter kits remain ZIP-only by design.
- Upgraded `/api/resources/templates/[slug]/word` from a plain `.doc` HTML dump to a branded editable document with:
  - `[Ai] Banking Institute` cover treatment
  - audience, use-time, and version metadata
  - document-status/adaptation warning
  - structured sections from the template registry
  - styled source-basis box
- Updated `scripts/generate-artifact-pdfs.mjs` so markdown-backed artifacts can emit branded source HTML for Word-compatible delivery, and regenerated:
  - `artifact-data-handling-reference-card.pdf`
  - `artifact-fair-lending-ai-review-checklist.pdf`
- Added branded source HTML and regenerated PDFs for the three promoted role playbooks:
  - `executive-playbook.pdf`
  - `operations-playbook.pdf`
  - `training-hr-playbook.pdf`
- Exposed optional Word download actions on `/resources` role playbook cards, desk-card cards, and paid-preview cards when the manifest has a real Word route.
- Tightened `npm run audit:resources` so every public PDF with branded source HTML must expose the matching `/api/resources/[slug]/word` route, and every such generic Word route must have source HTML.
- Tightened `npm run audit:resources` again so public PDFs must have readable page counts, meaningful extracted text, and no browser/error chrome phrases from failed page captures.
- Added source-HTML audit gates requiring source/citation language plus adapt-before-adoption language before a branded source-backed PDF can pass.
- Added explicit adaptation warnings to the older source-backed public resources and regenerated the 12 affected PDFs.
- Rebuilt `sample-readiness-report.pdf` from the source HTML so it now matches the current v3 free assessment model: 12 readiness signals, 12-48 score range, current tier labels, top-gap starter artifact framing, and the separate 48-question In-Depth diagnostic.
- Added a sample-report-specific audit gate so both source HTML and extracted PDF text fail if stale `62`, `Structured Beginner`, v2, or old eight-dimension free-report language returns.
- Added a visible `/resources` Start Here chooser for rules, role playbooks, board artifacts, staff training, and post-assessment next steps.
- Added keyboard skip links for `/resources` start-here, filters, and main resource content.
- Added a polite live result-count announcement for `/resources` filter changes.
- Replaced the `/playbooks/[role]` PDF modal with the shared gate, removing the duplicate name/institution `/api/inquiry` capture path for free playbook PDFs.
- Updated assessment email capture to unlock free-resource downloads for the current browser session.
- Updated `/api/capture-email` to set a short-lived first-party resource capture cookie.
- Updated `/api/resources/[slug]/download` to use that capture cookie for known-email attribution in `resource_downloads.email` when the visitor is not logged in.
- Updated Prompt Cards to honor the shared free-resource session unlock, so an assessment/resource-captured visitor can open the full prompt-card library without a second email gate.
- Updated the Safe AI Use Guide form to remember the shared free-resource session after the committed PDF fetch succeeds.
- Added `resource_downloads` attribution columns for source surface, assessment role, assessment tier id/label, and assessment top gap.
- Updated the shared free-resource gate so downloads carry non-PII attribution query parameters from the clicked surface and remembered assessment context.
- Removed pre-capture copy/download CTAs from free template surfaces: static templates expose gated Word downloads, and the AI Workflow SOP copy / Markdown download actions run only after email capture.
- Added best-effort `resource_downloads` logging for the special static Prompt Cards and Safe AI Guide PDF endpoints, including source-surface attribution and known-email capture from the first-party resource cookie.
- Added a service-role-only `resource_download_attribution_metrics` view and surfaced attribution segment tables in `/admin/funnel`.
- Added source-backed readable HTML variants at `/resources/access/[slug]` for every public PDF resource that already has committed source HTML and a source-backed Word route.
- Surfaced "Read HTML" links on `/resources` role playbooks, desk cards, paid previews, problem paths, and starter-kit item rows when a readable route exists.
- Added readable-resource helper tests and audit coverage so source-backed public PDFs cannot silently lose the shared readable route.
- Added large-print PDF variants for the five source-backed desk cards:
  - Safe AI Use Checklist
  - Red / Yellow / Green Use Card
  - Prompt Strategy Cheat Sheet
  - Regulatory Cheat Sheet
  - Platform Feature Reference Card
- Added large-print PDF variants for the two source-backed artifact PDFs that appear inside starter kits:
  - Data Handling Reference Card
  - Fair-Lending AI Review Checklist
- Added `npm run generate:large-print-resources`, which reflows dense source tables into stacked large-print cards instead of preserving clipped comparison grids.
- Added `/api/resources/[slug]/large-print`, visible `/resources` large-print actions, focused route tests, Playwright coverage, and audit checks for committed large-print PDFs.
- Updated starter-kit item rows and problem paths so manifest-declared large-print PDFs are included in the `/resources` link inventory and remain email-gated before download.
- Rebuilt `prompt-strategy-cheat-sheet.pdf` from a 20-page mini-manual into a 4-page quick card aligned to the original resource promise:
  - RCFC + R prompt pattern
  - Green/yellow/red safety lane
  - five reusable banking prompt patterns
  - verification checklist and source/adaptation box
- Regenerated `prompt-strategy-cheat-sheet` large-print PDF from 31 pages down to 8 pages.
- Updated the large-print generator so dense tables reflow into compact two-column row groups, and risk-band cards avoid awkward page splits when possible.
- Rebuilt Frontline Enablement Kit and Marketing Review Kit ZIPs so bundled prompt resources use the concise quick-card PDF.
- Cleared the parent-page launch-gate failures found during resource verification:
  - Home primary CTA now exposes "Get my AI readiness score" and the sample readiness score uses `/48`.
  - `/assessment` now says the free path is 12 questions in three minutes and uses "Start free assessment" on the primary CTA.
  - `/for-institutions` now has "Book a briefing" and "See enrollment options" paths, with the briefing CTA using `NEXT_PUBLIC_EXECUTIVE_BRIEFING_URL` or a Calendly fallback.

## Verified

- `npm run audit:resources`
- `npx vitest run src/app/resources/data.test.ts` (`12` tests)
- `npx vitest run src/app/api/resources/[slug]/word/route.test.ts src/lib/resources/freeResources.test.ts src/app/resources/data.test.ts` (`22` tests)
- `npx vitest run src/app/api/resources/templates/[slug]/word/route.test.ts` (`3` tests)
- `npx vitest run src/lib/resources/freeResourceCapture.test.ts src/components/resources/FreeResourceDownloadGate.test.tsx src/app/api/resources/[slug]/download/route.test.ts` (`12` tests)
- `npx vitest run src/app/admin/funnel/_components/ResourceDownloads.test.tsx`
- `npx vitest run src/lib/resources/readableResourceContent.test.ts src/app/resources/data.test.ts src/lib/resources/freeResources.test.ts` (`20` tests)
- `npx vitest run src/lib/resources/freeResources.test.ts src/app/resources/data.test.ts src/app/api/resources/[slug]/large-print/route.test.ts` (`23` tests)
- `npx vitest run src/lib/resources/freeResources.test.ts src/app/api/resources/[slug]/large-print/route.test.ts src/app/resources/data.test.ts` (`25` tests)
- `npx vitest run src/app/resources/data.test.ts src/lib/resources/freeResources.test.ts src/lib/resources/downloadCatalog.test.ts src/lib/resources/resourceMeta.test.ts`
- `npm test` (`617` tests)
- `npm run lint`
- `npm run build`
- `npx playwright test e2e/resources.spec.ts --project=chromium` (`15` tests)
- `npx playwright test e2e/resource-delivery.spec.ts --project=chromium -g "playbook HTML pages" --workers=1`
- `npx playwright test e2e/resources.spec.ts e2e/resource-delivery.spec.ts --project=chromium`
- `npx playwright test e2e/parent-flows.spec.ts e2e/resources.spec.ts --project=chromium`
- `npx vitest run src/app/prompt-cards/PromptCardsExperience.test.tsx src/lib/resources/freeResourceCapture.test.ts`
- `npx vitest run src/components/resources/FreeResourceDownloadGate.test.tsx src/app/resources/ResourcesExperience.test.tsx src/app/prompt-cards/PromptCardsExperience.test.tsx src/lib/resources/freeResourceCapture.test.ts`
- `npx vitest run src/lib/resources/downloadLogging.test.ts src/app/api/prompt-cards/download/route.test.ts src/app/api/prompt-cards/lead/route.test.ts src/app/api/guides/safe-ai-use/route.test.ts src/app/api/inquiry/route.test.ts src/app/prompt-cards/PromptCardsExperience.test.tsx src/app/security/_components/GuideRequestForm.test.tsx`
- `npx vitest run src/app/security/_components/GuideRequestForm.test.tsx src/lib/resources/freeResourceCapture.test.ts src/lib/resources/downloadLogging.test.ts`
- `npx playwright test e2e/resources-workflow-sop.spec.ts e2e/resources.spec.ts --project=chromium`
- `npx playwright test e2e/marketing-extended.spec.ts --project=chromium -g "security renders"`
- `npx playwright test e2e/smoke.spec.ts --project=chromium`
- Prior PR #517 remote checks: Vercel preview, smoke, axe, Lighthouse, mobile viewport, and secret scan all passed before this artifact large-print update.
- Visual PDF check after prompt-card rebuild:
  - Standard prompt card: 4 pages, rendered pages inspected, no clipping.
  - Large-print prompt card: 8 pages, rendered pages inspected, no clipping; card breaks favor complete sections over dense fit.
  - Platform large-print matrix: 12 pages, rendered table pages inspected, no clipped comparison rows.
  - Data Handling large-print artifact: 5 pages, cover and first content page rendered and inspected, no clipped text.
  - Fair-Lending large-print artifact: 5 pages, cover and first content page rendered and inspected, no clipped text.

Latest resource audit result: `31 manifest rows, 31 public downloads`.

The latest audit now includes route/manifest coverage, dev-token checks, ZIP drift checks, PDF extraction checks, browser/error chrome checks, and source/adaptation-language gates for source-backed resources.

Env audit note: `npm run audit:env` completed and now treats `NEXT_PUBLIC_EXECUTIVE_BRIEFING_URL` as an optional public override. The local shell still lacks the expected production secrets, so non-strict audit output lists those as missing.

## Still Outstanding From The Resource Review

These items remain separate from this implementation:

- Rebase after the massive persona branch lands and verify overlapping persona fixes.
- Replace remaining hardcoded `/resources`, assessment-output, playbook, and template lists with manifest-derived rendering where practical. Starter kits, role playbook cards, problem paths, desk cards, and paid previews now derive from the manifest; template cards now derive from the lightweight template index and the manifest.
- The raw download log now captures known email, source surface, assessment role, assessment tier, assessment top gap, HTTP referrer, and hashed IP for generic resources, large-print resources, Prompt Cards, and the Safe AI Use Guide; `/admin/funnel` now shows attribution segment tables. Remaining analytics work is deeper campaign/source analysis once real traffic exists.
- Core public downloads now pass route/manifest/dev-token/ZIP/PDF extraction/browser-chrome/source/adaptation audit. Source-backed PDFs now have readable HTML variants, and desk-card plus starter-kit artifact PDFs now have reflowed large-print PDFs. Remaining artifact work is deeper official source refresh, tagged PDFs, broader large-print coverage for long-form playbooks, and visual QA beyond automated text extraction.
- Continue deeper source refresh and accessibility QA for dynamic Word/template outputs. The dynamic Word template route is now branded, source-boxed, and directly tested.
- The sample readiness report now matches current v3 free-assessment scoring and is guarded by source/PDF text audit checks.
- Add deeper guided resource finder UX and accessibility improvements. The Start Here chooser, visible problem-path section, all nine role filters, format filters, skip links, clear/reset filters, and live result-count announcement are now present.
- Add current official source grounding and accessibility variants for major resources.
- Add route, artifact, accessibility, and E2E checks from the full plan.

## Persona-Branch Dependency

The massive persona update may already touch mobile Resources navigation, Safe AI Guide behavior, playbook gates, privacy/no-thanks email gate behavior, and several resource links. Treat those as expected upstream fixes, not complete assumptions. After persona work lands, this branch should verify those routes and confirm every persona-mentioned public resource is manifest-backed or intentionally archived.
