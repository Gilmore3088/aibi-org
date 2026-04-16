# Phase 8: Certificate + Verification - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

Reviewer approval triggers certificate record creation and PDF delivery. The certificate matches the PRD typography spec, a public verification endpoint at /verify/[certificateID] returns holder details without auth, and the learner sees their completion page with certificate download and LinkedIn badge link. Accredible integration is deferred to v2 — this phase generates certificates locally via @react-pdf/renderer.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Key constraints:

**Certificate Generation (CERT-01 through CERT-06):**
- Triggered when reviewer sets review_status to 'approved' (re-read status from DB before issuing)
- Certificate displays: recipient name (Cormorant serif 28pt), designation "AiBI-P -- Banking AI Practitioner" (Cormorant SC 18pt), issuing institution (Cormorant SC 14pt), date issued (DM Mono 12pt), certificate ID (DM Mono 10pt), verification URL (DM Mono 10pt), assessment note (DM Sans italic 10pt), AiBI seal watermark at 8% opacity
- Certificate PDF generated via @react-pdf/renderer (already installed from Phase 5)
- Certificate ID: unique alphanumeric string
- No duplicate certificates for same enrollment
- Certificate design should match HTML mockup at aibi_p_official_certificate/

**Verification Endpoint (CERT-05):**
- /verify/[certificateID] — public, no auth required
- Returns: holder name, designation, date issued, issuing institution
- Returns NOTHING ELSE (no email, no scores, no personal data)

**Delivery:**
- PDF delivered to learner email within 24 hours (for now: available for download immediately on completion page)
- Accredible/LinkedIn badge deferred to v2 — show placeholder badge link

**DB: certificates table already exists (Phase 1)**

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- certificates table (Phase 1) with all columns
- @react-pdf/renderer already installed and configured
- AcceptableUseCardDocument.tsx — pattern for react-pdf certificate generation
- review-submission API — sets review_status to 'approved'
- Supabase service role client for writes

### Integration Points
- review-submission API needs to trigger certificate creation on approval
- New page: /verify/[certificateID] (public verification)
- New page: /courses/aibi-p/certificate (learner completion page)
- New API: /api/courses/generate-certificate (PDF generation)
- New lib: src/lib/pdf/CertificateDocument.tsx (react-pdf component)

</code_context>

<specifics>
## Specific Ideas

- Certificate HTML mockup at aibi_p_official_certificate/code.html shows the design
- Use nanoid or similar for unique certificate IDs (e.g., "AIBIP-2026-A7K3M9")
- The verification page should be a simple, clean public page — no course shell or sidebar

</specifics>

<deferred>
## Deferred Ideas

- Accredible API integration → v2
- LinkedIn digital badge → v2
- Email delivery automation → v2

</deferred>
