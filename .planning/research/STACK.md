# Stack Research — AiBI-P Course Features

**Domain:** Self-paced LMS course on existing Next.js 14 site
**Researched:** 2026-04-15
**Confidence:** HIGH (PDF/upload/forms), MEDIUM (Accredible — API docs behind login wall, structure confirmed via community sources)

---

## What Is Already Covered — Do NOT Re-Add

The existing stack handles these without new dependencies:

| Capability | Existing Solution |
|------------|------------------|
| Data persistence (course progress, submissions) | Supabase Postgres + RLS |
| Authentication / user identity | Supabase Auth |
| File storage (work product uploads) | Supabase Storage (built into existing `@supabase/supabase-js`) |
| Payments / seat pricing | Stripe Checkout Session (existing `stripe` package not yet installed but wired) |
| Email sequences on enrollment/cert | ConvertKit (existing `CONVERTKIT_API_KEY` env pattern) |
| CRM property updates | HubSpot (existing `HUBSPOT_API_KEY` env pattern) |
| Analytics events | Plausible deferred queue (existing pattern in layout.tsx) |
| Form state / validation | React Hook Form — already a well-understood pattern; no new library needed for simple forms; add only if complex multi-step forms require it |
| Module content files | `/content/courses/aibi-p/` flat `.json`/`.md` files (existing content versioning pattern) |
| Countdown timer (20-scenario drill) | `useRef` + `useEffect` pattern — zero-dependency implementation; no library needed |
| Timed drill state machine | `useState` + `sessionStorage` (same pattern as existing assessment) |

---

## New Dependencies Required

### Core Additions

| Package | Version | Purpose | Why This One |
|---------|---------|---------|--------------|
| `@react-pdf/renderer` | `^4.4.1` | Dynamic PDF generation: Acceptable Use Card (personalized from form responses) | Runs server-side in Next.js route handlers via `renderToBuffer()`. Declarative JSX syntax matches team's React knowledge. v4.1.0+ supports React 19 and fixes the Next.js App Router crash bug that plagued v3. Alternative (Puppeteer) requires a headless Chrome process — too heavy for a Vercel serverless function and overkill for 1-page PDFs. jsPDF is client-side only and produces lower-quality output. |
| `react-dropzone` | `^14.3.5` | Drag-and-drop file upload UI for work product submission (4 items: skill .md, text fields, PDF) | Industry standard for React file inputs. Accessible, mobile-friendly, integrates cleanly with Supabase Storage's presigned URL pattern. UploadThing is an alternative but adds a third-party SaaS dependency; for a banking-context product, keeping uploads within already-trusted Supabase Storage is preferable. |

### Supporting Libraries

| Package | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hook-form` | `^7.54.2` | Multi-field subscription inventory form (routing logic), onboarding branch form, work product submission fields | Add only for forms with 5+ interdependent fields or conditional routing logic. The 3-question onboarding branch and the 10-field subscription inventory both qualify. Simple single-field forms (email capture) do not need it — use controlled `useState` as the existing assessment does. |
| `zod` | `^3.24.1` | Runtime schema validation for form inputs and API boundary guards | Already the TypeScript ecosystem standard. Use for validating file MIME type/size on the server before passing to Supabase Storage, and for validating submission payloads at `/api/course/submit-work-product`. Pairs with `react-hook-form` via `@hookform/resolvers/zod`. |
| `@hookform/resolvers` | `^3.9.1` | Bridges zod schemas into react-hook-form | Required whenever using zod + react-hook-form together. |

---

## Accredible Integration

**Approach:** Thin server-side API wrapper — no npm package needed.

Accredible's REST API is straightforward enough that a purpose-built wrapper in `src/lib/accredible/` is the right call. Installing a third-party Accredible SDK would add untested dependency surface area.

**Confirmed API shape (MEDIUM confidence — structure verified via community sources and the now-redirected Apiary docs):**

```
POST https://api.accredible.com/v1/credentials
Authorization: Token token=<ACCREDIBLE_API_KEY>
Content-Type: application/json

{
  "credential": {
    "group_id": <your_group_id>,      // pre-created in Accredible dashboard
    "recipient": {
      "name": "Jane Smith",
      "email": "jane@firstbank.com"
    },
    "issued_on": "2026-04-15",
    "name": "AiBI-P Banking AI Practitioner"
  }
}
```

Response includes `credential.id` and `credential.url` (shareable verification URL) and `credential.badge_url` (LinkedIn-ready badge image URL).

**Environment variable to add:**
```
ACCREDIBLE_API_KEY=<from Accredible dashboard>
ACCREDIBLE_GROUP_ID=<numeric group id for AiBI-P>
```

**Required pre-work:** Create the AiBI-P credential group in the Accredible dashboard before any API calls. The group defines the badge design and certificate template. Group ID is stable and does not rotate.

**Verification endpoint:** Accredible hosts verification at `https://www.credential.net/verify/<credential-id>` — no custom endpoint needed. Store the `credential.url` in Supabase `course_enrollments` table.

---

## PDF Generation Pattern

Use `@react-pdf/renderer` from a Next.js **route handler** (not a Server Component or client component) to keep the PDF rendering in the Node.js runtime:

```
GET/POST /api/course/aibi-p/acceptable-use-card
  → receives form field values (institution name, platform choice, dept, attestation)
  → calls renderToBuffer(<AcceptableUseCardDocument {...data} />)
  → returns Response with Content-Type: application/pdf
```

**next.config required change:**
```js
// next.config.js
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],  // Next.js 14.2+
  // Note: key was renamed from experimental.serverComponentsExternalPackages in 14.0
}
```

**Static PDFs** (Regulatory Cheatsheet, Platform Reference Card, Skill Template Library) do NOT use react-pdf. Store as pre-built `.pdf` files in `public/downloads/` and serve via standard `<a href="/downloads/..." download>` anchor tags. No server involvement, no library cost.

---

## File Upload Pattern (Work Product Submission)

Keep uploads within Supabase Storage. No third-party upload service.

**Flow:**
1. Client calls `POST /api/course/aibi-p/upload-url` (Server Action or Route Handler)
2. Server validates user's enrollment status in Supabase, then calls `supabase.storage.from('work-products').createSignedUploadUrl(path, 60)`
3. Server returns signed URL to client
4. `react-dropzone` component uploads file directly to Supabase Storage via the signed URL (bypasses Next.js body size limit)
5. Server records upload path in `work_product_submissions` Supabase table

**Accepted file types:** `.md` (skill file), `.pdf`, `.docx`, `.txt` — validate with zod on the server before issuing signed URL.

**RLS policy pattern (two roles):**
```sql
-- Learners can upload to their own path
CREATE POLICY "Learner upload own work" ON storage.objects
  FOR INSERT TO authenticated
  USING (bucket_id = 'work-products' AND (storage.foldername(name))[1] = (select auth.uid())::text);

-- Reviewers can read all work products
CREATE POLICY "Reviewer read all" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'work-products' AND EXISTS (
    SELECT 1 FROM reviewer_roles WHERE user_id = (select auth.uid())
  ));
```

---

## Reviewer Queue

No new library. The reviewer dashboard is a standard Next.js Server Component page at `/admin/reviews` (protected via Supabase RLS + a `reviewer_roles` table). Data fetching via the existing Supabase client. Rubric scoring is a form submission — use `react-hook-form` (already added) with 5 numeric fields and a hard-gate check on Accuracy before enabling the submit button.

The `reviewer_roles` table requires an entry before any reviewer can access submissions — reviewers are manually seeded by the admin. No self-serve reviewer signup.

---

## Seat / Bundle Pricing

No new Stripe library. The existing Stripe Checkout Session pattern handles institution bundles.

**Pattern:**
```
POST /api/create-checkout
  body: { seats: 5, institution: "First National Bank" }
  → if seats >= 5: price = $79 * seats * 0.80 (20% discount)
  → if seats < 5:  price = $79 * seats
  → stripe.checkout.sessions.create({ line_items: [{ price_data: { unit_amount: calculated }, quantity: 1 }] })
```

Use a single calculated `unit_amount` rather than Stripe's `quantity` multiplier so the discount logic stays in your code, not in Stripe's transform rules. Store `seats_purchased` in Supabase `course_enrollments`.

---

## .md File Download (Skill Builder)

Zero dependencies. Pure client-side Blob URL pattern:

```typescript
// In the skill builder 'use client' component
const downloadSkill = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
```

No library, no API route, no server. Content is assembled in the browser from the 5-component form fields and downloaded instantly.

---

## Installation

```bash
# Core new additions
npm install @react-pdf/renderer react-dropzone react-hook-form zod @hookform/resolvers

# No new dev dependencies required
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `@react-pdf/renderer` in route handler | Puppeteer / headless Chrome | ~150MB binary, Vercel serverless incompatible without a separate render service. Overkill for 1-page AUC PDF. |
| `@react-pdf/renderer` in route handler | jsPDF | Client-side only (or awkward workarounds for SSR). Lower typographic quality. No React component model. |
| `@react-pdf/renderer` in route handler | PDFKit directly | Lower-level, no component abstraction, requires manual layout math. |
| Supabase Storage for uploads | UploadThing | Third-party SaaS dependency. Banking clients expect data to stay in already-contracted infrastructure. Supabase is already in scope. |
| Supabase Storage for uploads | AWS S3 / Cloudflare R2 | New infra surface not yet in stack. Supabase Storage is S3-compatible and already trusted. |
| Custom `fetch` wrapper for Accredible | Accredible npm packages | Ruby/PHP SDKs only. No official JS SDK. Community ones are unmaintained. The REST API is simple enough that a 40-line `src/lib/accredible/client.ts` is cleaner. |
| Blob URL download for .md files | Server-side file generation API route | Unnecessary server roundtrip for content the client already has. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Kajabi SDK / API | Out of scope for Phase 1; course lives on Next.js site | Revisit at Phase 2 migration |
| Any LMS framework (Moodle, Canvas, etc.) | Full system replacement, not additive | The 9-module progression pattern is simple enough to implement directly in Supabase + Next.js |
| `react-query` / `tanstack-query` | No cache-heavy data requirements in course flow; Server Components + Server Actions handle data fetching | Next.js App Router data fetching primitives |
| `next-auth` | Supabase Auth already handles session management | `@supabase/supabase-js` existing client |
| PDF.js (react-pdf) | For *viewing* PDFs in browser — this project generates and downloads them, not views them | `@react-pdf/renderer` |
| Stripe Billing subscriptions | AiBI-P is a one-time purchase, not a recurring subscription | `stripe.checkout.sessions.create` with `mode: 'payment'` |

---

## next.config.js Changes Required

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  // rest of existing config...
};

module.exports = nextConfig;
```

This prevents the App Router bundler from trying to bundle `@react-pdf/renderer` as a server component, which causes a crash on Next.js < 14.1.1. The existing install is 14.2.35, so this is a belt-and-suspenders measure rather than a strict requirement, but it eliminates ambiguity.

---

## Version Compatibility

| Package | Requires | Notes |
|---------|----------|-------|
| `@react-pdf/renderer@4.4.1` | React 18+ | React 19 support added in v4.1.0. Existing project uses React 18 — compatible. |
| `react-dropzone@14.3.5` | React 16.8+ | No conflicts with existing dependencies. |
| `react-hook-form@7.54.2` | React 16.8+ | No conflicts. Does NOT require `'use client'` directive if used inside client components only. |
| `zod@3.24.1` | Node.js 14+ | Runtime-agnostic; works in both route handlers and client components. |
| `@hookform/resolvers@3.9.1` | Must match react-hook-form major version | `^3.x` is the resolver version for `react-hook-form@7.x`. |

---

## Sources

- [@react-pdf/renderer npm (v4.4.1, 860K weekly downloads)](https://www.npmjs.com/package/@react-pdf/renderer) — version confirmed
- [react-pdf compatibility page](https://react-pdf.org/compatibility) — Next.js App Router notes verified HIGH confidence
- [Next.js 14 + react-pdf integration discussion](https://benhur-martins.medium.com/nextjs-14-and-react-pdf-integration-ccd38b1fd515) — integration pattern MEDIUM confidence
- [Supabase Storage signed URL docs](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl) — official docs HIGH confidence
- [Supabase Storage access control docs](https://supabase.com/docs/guides/storage/security/access-control) — RLS pattern HIGH confidence
- [Accredible API docs](https://docs.api.accredible.com/) — structure confirmed, endpoint details behind account wall MEDIUM confidence
- [Stripe per-seat pricing docs](https://docs.stripe.com/subscriptions/pricing-models/per-seat-pricing) — Checkout Session pattern HIGH confidence
- [react-dropzone docs](https://react-dropzone.js.org/) — HIGH confidence
- [react-hook-form docs](https://react-hook-form.com/) — HIGH confidence

---

*Stack research for: AiBI-P course additions to Next.js 14 site*
*Researched: 2026-04-15*
