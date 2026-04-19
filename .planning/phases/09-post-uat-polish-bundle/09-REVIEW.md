---
phase: 09-post-uat-polish-bundle
reviewed: 2026-04-18T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - supabase/migrations/00006_course_enrollments_updated_at.sql
  - src/app/courses/aibi-p/page.tsx
  - src/app/courses/aibi-s/page.tsx
  - src/lib/pdf/CertificateDocument.tsx
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 09: Code Review Report

**Reviewed:** 2026-04-18
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 09 bundles four small post-UAT polish fixes:

1. **Migration 00006** — adds `updated_at` column + trigger to `course_enrollments`. Reuses the hardened `public.set_updated_at()` from migration 00004 (search_path-pinned). Idempotent and well-structured.
2. **`/courses/aibi-p` page** — wraps `currentModule` in `Math.max(1, …)` to guard the Resume URL.
3. **`/courses/aibi-s` page** — same `Math.max(1, …)` guard for `currentWeek`.
4. **`CertificateDocument.tsx`** — replaces Helvetica/Courier with brand fonts via `Font.register()`, loading TTFs from `public/fonts/`.

The migration is clean. The two `Math.max` guards do their job at the URL level but leave a deeper inconsistency the orchestrator should be aware of (see WR-01). The font registration has two operational risks worth flagging before next deploy: a serverless cold-start file-resolution risk and a missing italic-Bold font face that will produce a runtime warning and synthetic-italic fallback for the signature line (CERT-02 typography spec calls for italic Bold). Two info-level issues are noted around an unrelated stale schema field used elsewhere in `aibi-s/page.tsx` and the unused `bundlePagesRouterDependencies` configuration concern.

No critical security issues. No SQL injection, hardcoded secrets, or auth bypasses introduced. The migration runs inside an implicit transaction and holds a brief ACCESS EXCLUSIVE lock on `course_enrollments` for the ALTER + UPDATE backfill — acceptable given current row count is in the tens.

## Warnings

### WR-01: `Math.max(1, currentModule ?? 1)` masks a stale DB default rather than fixing it

**File:** `src/app/courses/aibi-p/page.tsx:34` and `src/app/courses/aibi-s/page.tsx:32`
**Issue:** The schema default for `course_enrollments.current_module` is `0` (see `supabase/migrations/00001_course_tables.sql:37` — `current_module integer NOT NULL DEFAULT 0`). New enrollments therefore land with `current_module = 0`, which would build a `/courses/aibi-p/0` URL and 404. The new `Math.max(1, enrollment?.current_module ?? 1)` guard fixes the symptom on these two pages, but every other consumer of `current_module` (server-side route handlers, progress-update endpoints, anything that compares `current_module` to a 1-based module index) still sees `0`. This means:

- The "Resume" button works.
- The `getModuleStatus(mod.number, completedModules, currentModule)` call on line 106 receives the *guarded* value of 1, so the visual "current" indicator on Module 1 lights up correctly.
- But a freshly enrolled user whose `current_module` is 0 in the DB will get inconsistent behavior between any code path that uses the raw column value vs. these two pages.

**Fix:** Either (a) prefer fixing the schema default and the enrollment-creation code path so `current_module` starts at 1, or (b) document explicitly in `course_enrollments` table comments that 0 means "not yet started" and centralize the `Math.max(1, …)` coercion in `getEnrollment.ts` so every consumer gets a normalized value. Recommended:

```ts
// In src/app/courses/aibi-p/_lib/getEnrollment.ts
return {
  ...data,
  current_module: Math.max(1, data.current_module ?? 1),
} as EnrollmentData;
```

That way page components and any future consumers all see the same coerced value.

### WR-02: Cormorant Italic Bold is missing — signature line will fall back to synthetic italic

**File:** `src/lib/pdf/CertificateDocument.tsx:20-27, 296-304`
**Issue:** `Font.register({ family: 'Cormorant', fonts: [...] })` registers three faces:
- Regular (no weight, no style)
- Bold (`fontWeight: 'bold'`)
- Italic (`fontStyle: 'italic'`)

But the `signatureName` style at line 296 requests **both** `fontWeight: 'bold'` and `fontStyle: 'italic'` simultaneously:

```ts
signatureName: {
  fontFamily: 'Cormorant',
  fontWeight: 'bold',
  fontStyle: 'italic',
  fontSize: 16,
  ...
}
```

`@react-pdf/renderer`'s font matcher requires an exact (weight, style) pair; when no Bold-Italic face is registered it falls back unpredictably (often Regular Italic, sometimes Bold upright) and emits `Font family Cormorant, font weight bold, font style italic wasn't found` to stderr. The same applies to `sealText` at line 271 (also Bold + Italic). The header's Cormorant Italic at `presentsText` (line 136-141) is fine because it asks for italic only.

**Fix:** Register a Cormorant Bold-Italic face explicitly. Either ship `Cormorant-BoldItalic.ttf` to `public/fonts/`, or restructure the styles so the signature uses italic-only:

```ts
// Option A: register the missing face
Font.register({
  family: 'Cormorant',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/Cormorant-Regular.ttf') },
    { src: path.join(process.cwd(), 'public/fonts/Cormorant-Bold.ttf'),   fontWeight: 'bold' },
    { src: path.join(process.cwd(), 'public/fonts/Cormorant-Italic.ttf'), fontStyle: 'italic' },
    { src: path.join(process.cwd(), 'public/fonts/Cormorant-BoldItalic.ttf'),
      fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// Option B: drop fontWeight from italic styles
signatureName: { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 16, ... },
sealText:      { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 20, ... },
```

Verify by rendering a certificate locally and checking that the signature glyphs are actually italic and weighted, not synthesized.

## Info

### IN-01: `process.cwd()` font paths are fine on Vercel but worth pinning to a constant

**File:** `src/lib/pdf/CertificateDocument.tsx:23-32`
**Issue:** `process.cwd()` resolves to the deployment root on Vercel (where `public/fonts/*.ttf` are co-located), so font files are reachable in the serverless function bundle as long as Vercel includes them in the function output. Next.js does include `public/` files in the lambda by default, so this should work — but the path is computed at module-load time, and module-scope `Font.register` calls run *inside* the cold-start path of every cold lambda. If the fonts ever fail to copy (e.g., when running `vercel dev` with a non-standard cwd, or in a Docker build where cwd is unexpected), `renderToBuffer` will throw a cryptic "ENOENT" deep inside the renderer. **No race condition exists** because module-scope `Font.register` runs synchronously before the first `renderToBuffer` call — the font list is loaded lazily when first referenced, but registration entries are in place before any handler executes.

**Fix:** Optional hardening — extract the font directory to a single constant and add a one-time `fs.existsSync` smoke check at module load, throwing a clear error on misconfiguration:

```ts
const FONT_DIR = path.join(process.cwd(), 'public/fonts');
const requireFont = (name: string) => {
  const p = path.join(FONT_DIR, name);
  if (!fs.existsSync(p)) {
    throw new Error(`Brand font missing: ${p}. Run \`ls public/fonts/\` to verify.`);
  }
  return p;
};
```

This catches misconfiguration at the first import rather than the first user PDF.

### IN-02: AiBI-S getEnrollment selects columns (`role_track`, `cohort_id`, `cohort_start_date`) that don't exist in any migration

**File:** `src/app/courses/aibi-s/page.tsx:33` (consumer); root cause in `src/app/courses/aibi-s/_lib/getEnrollment.ts:54-55` (not in this phase's diff)
**Issue:** The `aibi-s/page.tsx` change in this phase only added the `Math.max(1, …)` guard, so this is **not a new bug introduced by Phase 09**. However, while reviewing the call site I noticed that `getEnrollment()` in the AiBI-S lib selects `role_track, cohort_id, cohort_start_date`, none of which exist in any migration in `supabase/migrations/`. Grep confirms zero matches for these columns in the schema. At runtime this Supabase select will fail with `42703 column does not exist`, the function returns `null`, and the page renders the "not enrolled" branch — meaning **AiBI-S has no working enrollment path today, regardless of whether a row exists in `course_enrollments`**. The `Math.max` guard added in Phase 09 will therefore never run on a non-null enrollment.

**Fix:** Out of scope for this phase, but flag for the orchestrator to add to the backlog: either (a) add a migration `00007_aibi_s_cohort_columns.sql` that introduces `role_track`, `cohort_id`, `cohort_start_date` on `course_enrollments`, or (b) move them to a separate `aibi_s_enrollments` table per the cohort design. The current AiBI-S getEnrollment is dead code until then.

### IN-03: Migration 00006 backfill UPDATE has no batch limit — fine now, would matter at scale

**File:** `supabase/migrations/00006_course_enrollments_updated_at.sql:11-13`
**Issue:** `UPDATE course_enrollments SET updated_at = created_at WHERE updated_at IS NULL` runs as a single statement and holds row-level locks on every matched row for the duration. With current row counts (tens, possibly low hundreds) this completes in milliseconds. Worth noting for the post-launch playbook: if `course_enrollments` ever crosses ~100k rows, this style of unbatched backfill in a future migration would create lock contention with concurrent inserts from the Stripe webhook. Not actionable now.

**Fix:** None for this migration. If a similar pattern is needed later at scale, batch via `WHERE id IN (SELECT id FROM course_enrollments WHERE updated_at IS NULL LIMIT 1000)` in a loop, or use Supabase's `pg_cron` for incremental backfill.

### IN-04: Comment at top of CertificateDocument.tsx says "safe at module scope for Next.js serverless" — verify intent

**File:** `src/lib/pdf/CertificateDocument.tsx:19`
**Issue:** The comment "Register brand fonts once at module load (safe at module scope for Next.js serverless)" is slightly misleading. Module scope IS safe in Next.js serverless because each lambda instance loads the module once and reuses it across warm invocations. But the comment could be read as "safe regardless of how many times this is imported," which is also true (`Font.register` is idempotent for the same family in `@react-pdf/renderer`) but worth clarifying for future maintainers who may worry about double registration.

**Fix:** Tighten the wording, e.g.:

```ts
// Register brand fonts once per lambda cold start. Font.register is
// idempotent: re-imports across requests reuse the existing registry.
```

---

_Reviewed: 2026-04-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
