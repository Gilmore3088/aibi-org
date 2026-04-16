# Pitfalls Research

**Domain:** LMS course delivery within Next.js 14 on Vercel — AiBI-P Banking AI Practitioner course
**Researched:** 2026-04-15
**Confidence:** HIGH (Vercel limits from official docs), MEDIUM (integration patterns from community), LOW (Accredible specifics — official rate limit docs not publicly accessible)

---

## Critical Pitfalls

### Pitfall 1: File Uploads Routed Through Vercel Functions Hit 4.5 MB Hard Limit

**What goes wrong:**
Work product submission (4-part assessed artifact) routes file uploads through a Next.js API route or Server Action. Vercel enforces a hard 4.5 MB request body cap at the infrastructure level — the function returns 413 `FUNCTION_PAYLOAD_TOO_LARGE` regardless of what Next.js or your route code says. There is no configuration override.

**Why it happens:**
Developers test locally (no such limit) and on Vercel Hobby, assume the limit is a soft default that can be raised. It cannot be raised. The limit is enforced by AWS Lambda under Vercel's infrastructure.

**How to avoid:**
Upload files directly from the browser to Supabase Storage using a presigned upload URL. The API route issues the signed URL only — it never receives the file bytes. Pattern: `POST /api/upload-token` returns `{ signedUrl }`, client uploads directly to Supabase, server receives only the resulting path string on form submit.

```typescript
// WRONG — file bytes pass through Vercel function
const formData = await request.formData();
const file = formData.get('submission');

// CORRECT — issue a signed URL, let client upload directly
const { data } = await supabase.storage
  .from('submissions')
  .createSignedUploadUrl(`${userId}/${filename}`);
return Response.json({ signedUrl: data.signedUrl, path: data.path });
```

Next.js Server Actions also impose a separate 1 MB body limit by default. Do not use Server Actions for file upload form submission.

**Warning signs:**
- Works on localhost, 413 errors on Vercel
- "413: FUNCTION_PAYLOAD_TOO_LARGE" in Vercel function logs
- File uploads only fail above 4 MB

**Phase to address:** Course shell and submission flow (before any work product upload UI is built)

---

### Pitfall 2: PDF/Certificate Generation via Puppeteer Exceeds 250 MB Bundle Limit

**What goes wrong:**
A PDF generation route that imports `puppeteer` fails to deploy entirely with: "Serverless Function has exceeded the unzipped maximum size of 250 MB." The function never runs — build fails at deploy time.

**Why it happens:**
Puppeteer bundles a full Chromium binary (~170–200 MB). Vercel's 250 MB unzipped function bundle cap is an AWS Lambda constraint that cannot be increased.

**How to avoid:**
The AiBI-P certificate does not need to be generated locally. Issue the credential through Accredible's API — Accredible generates the PDF and hosts it. This is the correct architecture for this project.

If a locally-generated PDF is ever needed (downloadable Regulatory Cheatsheet, Acceptable Use Card as PDF), use `pdf-lib` or `@react-pdf/renderer` — pure JavaScript, no Chromium dependency, well under the bundle limit. These produce static PDFs from templates, not HTML-rendered pages.

If an HTML-to-PDF path is genuinely required, use `puppeteer-core` + `@sparticuz/chromium-min` (hosted externally on Vercel Blob or S3), never the full `puppeteer` package.

**Warning signs:**
- `npm install puppeteer` in any route that deploys to Vercel
- Build log: "Serverless Function has exceeded the unzipped maximum size"
- Function size reported above 200 MB in build output

**Phase to address:** Artifact download implementation phase (before any PDF export feature is built)

---

### Pitfall 3: Course Progress Stored Only in Client State (Lost on Mobile Tab Kill)

**What goes wrong:**
A learner on iPhone Safari completes 6 of 9 modules, iOS kills the background tab to free memory, and the learner returns to find progress reset to zero. No server-side record existed.

**Why it happens:**
The existing assessment uses sessionStorage as a short-term buffer (correct for a 3-minute flow). Course progress over a 5.5-hour session is a different contract — sessionStorage is cleared on tab close, and iOS aggressively kills backgrounded browser tabs.

**How to avoid:**
Persist module completion to Supabase on every module submission, not just at course completion. sessionStorage is acceptable as a read-back cache to avoid a loading state, but Supabase is the source of truth. Write to Supabase synchronously before advancing the UI to the next module.

```typescript
// Write to Supabase BEFORE advancing module index
const { error } = await supabase
  .from('course_progress')
  .upsert({ user_id: userId, course_id: 'aibi-p', module_index: completedIndex, completed_at: new Date() });
if (error) throw error; // block UI advance on failure
setCurrentModule(completedIndex + 1);
```

Also: `localStorage` (not sessionStorage) should hold a lightweight resume marker as a fallback. localStorage survives tab kills on iOS; sessionStorage does not.

**Warning signs:**
- Any course progress state living only in `useState` or `sessionStorage`
- Module advance that does not await a Supabase write
- No `course_progress` table in the database schema

**Phase to address:** Course progress persistence (first database schema commit for the course feature)

---

### Pitfall 4: Forward-Only Progression Enforced Only on the Client

**What goes wrong:**
A learner inspects the network tab, finds the `/api/modules/[id]/complete` endpoint, and POST-requests module 9 directly without completing modules 1–8. They receive a certificate for a course they never took.

**Why it happens:**
Forward-only logic implemented as UI state (disabling "Next" buttons) has no server-side analog. API routes that mark modules complete do not verify prerequisites.

**How to avoid:**
The module completion API must validate that all prior modules are marked complete in Supabase before accepting the completion record. The forward-only UI is a UX convenience; the gate is on the server.

```typescript
// In /api/modules/[moduleId]/complete
const { data: progress } = await supabase
  .from('course_progress')
  .select('module_index')
  .eq('user_id', userId)
  .eq('course_id', 'aibi-p')
  .order('module_index');

const completedIndices = progress.map(r => r.module_index);
const priorModulesComplete = Array.from(
  { length: moduleId }, (_, i) => i
).every(i => completedIndices.includes(i));

if (!priorModulesComplete) {
  return Response.json({ error: 'Prerequisites not met' }, { status: 403 });
}
```

**Warning signs:**
- Module completion endpoint that does not read existing progress before writing
- Forward-only logic implemented with `disabled` attribute only
- No server-side prerequisite check in the module API route

**Phase to address:** Course API routes (same phase as module completion endpoints)

---

### Pitfall 5: Accredible Certificate Issued Before Work Product is Actually Approved

**What goes wrong:**
A reviewer submits a rubric score, a race condition or optimistic update triggers the certificate issuance webhook before the Supabase record is committed to `approved` status. The learner receives a certificate for a submission that is still under review or was actually failed.

**Why it happens:**
Certificate issuance is expensive to reverse (Accredible does not provide a simple "revoke and reissue" — you delete the credential, which invalidates the LinkedIn badge URL the learner already shared). Developers trigger issuance from the same transaction that writes the review, not from a post-write verified state.

**How to avoid:**
Decouple certificate issuance from the review write. The reviewer submits scores → Supabase triggers a database function or the API route explicitly calls a separate `/api/certify` endpoint only after confirming the record is in `approved` state. Never call the Accredible API optimistically.

```
Reviewer submits rubric
  → Write to review_submissions table with status: 'reviewed'
  → Compute pass/fail including Accuracy hard gate
  → If pass: set status: 'approved', THEN call /api/certify
  → /api/certify: re-reads status from DB before calling Accredible API
```

The re-read before calling Accredible is the safety net against race conditions.

**Warning signs:**
- Accredible API call inside the same try block as the rubric write
- Certificate issuance triggered client-side (any client-visible token)
- No `status` column with explicit `approved` gate on `review_submissions`

**Phase to address:** Reviewer workflow and certificate integration phase

---

### Pitfall 6: Supabase RLS Blocks Legitimate Course Access or Leaks Cross-User Data

**What goes wrong:**
Two failure modes: (A) RLS enabled but no policy for `course_progress` — every query returns empty results, course appears broken. (B) RLS policy on `submissions` table is overly broad, leaking one learner's work products to another.

**Why it happens:**
Supabase enables RLS as a default on new tables but ships with no policies. Empty result sets are valid SQL responses — no error fires. Developers interpret broken queries as application logic bugs and waste hours debugging.

**How to avoid:**
Write RLS policies immediately when creating each new table, in the same migration file. Test policies using the Supabase Dashboard "Row Level Security" tester, not the SQL Editor (SQL Editor bypasses RLS). Follow the `(select auth.uid()) = user_id` pattern from CLAUDE.md for ~95% query performance improvement.

Reviewer access to submissions requires an explicit `reviewer` role policy — do not use the learner's user_id check for reviewer rows.

**Warning signs:**
- New table created without a corresponding policy in the same migration
- Queries returning empty arrays with no error when data should exist
- Using SQL Editor to verify RLS (bypasses policies)
- `auth.uid()` called directly instead of wrapped in `(select auth.uid())`

**Phase to address:** Database schema phase (every table migration)

---

### Pitfall 7: Onboarding Branch Answers Not Persisted — Personalized Content Resets Mid-Course

**What goes wrong:**
The 3-question onboarding survey routes platform-specific content (e.g., Copilot vs. ChatGPT vs. Gemini references throughout 9 modules). The learner completes the survey, the branch data lives in React state. On a return visit or iOS tab kill, the branch context is gone — all modules revert to generic content.

**Why it happens:**
Onboarding survey answers feel like "one-time setup" data that doesn't need persistence. It's treated like session state when it's actually profile data.

**How to avoid:**
Write onboarding answers to `course_enrollments` or a dedicated `learner_profile` column in Supabase immediately on survey completion, before advancing to Module 1. On course resume, load branch context from Supabase alongside progress data.

```typescript
// Write branch context on survey complete
await supabase
  .from('course_enrollments')
  .update({ platform_branch: selectedPlatform })
  .eq('user_id', userId)
  .eq('course_id', 'aibi-p');
```

`localStorage` is an acceptable secondary cache for branch context (lower consequence than progress data), but Supabase is the source of truth.

**Warning signs:**
- Onboarding branch stored only in `useState` or URL params
- `platform_branch` column absent from the enrollment or progress table
- Module content that reads branch from React context without a server-side fallback

**Phase to address:** Onboarding flow phase (before module 1 content renders)

---

### Pitfall 8: Institution Bundle Checkout Doesn't Model Seats — Billing and Access Management Break

**What goes wrong:**
A 10-seat institution bundle is sold as a single Stripe Checkout for `$630` flat. The institution gets one Stripe customer record, no per-seat tracking, and no way to assign the 10 seats to 10 individual learners. Support overhead is high; the database has no concept of "this learner is on institution X's bundle."

**Why it happens:**
Stripe Checkout makes simple one-off purchases easy. Multi-seat logic requires upfront modeling in both Stripe (quantity on a line item) and the application database (seats table, invite flow). Developers defer this modeling and ship a flat-fee workaround.

**How to avoid:**
Model bundle purchases as: one Stripe Checkout with `quantity: N` on the price item → one Supabase row in `institution_enrollments` with `seats_purchased: N`, `seats_used: 0`, `institution_admin_email`. Provide an admin invite flow that burns one seat per activated learner.

Per Stripe docs: per-seat pricing uses `quantity` on the checkout session line item. The metadata can carry `institution_id` so the webhook knows to create a bundle record rather than an individual enrollment.

Do not attempt to use Stripe's built-in per-seat subscription for a one-time course purchase — use quantity on a one-time price with metadata.

**Warning signs:**
- No `institution_enrollments` or `seats` table in the schema
- Stripe metadata containing only `user_id` (no `institution_id`)
- Checkout creates enrollment immediately on success without an invite/activation step

**Phase to address:** Stripe checkout implementation phase

---

### Pitfall 9: Kajabi Migration Hardcoded Out — Content Not Portable When Migration Arrives

**What goes wrong:**
Module content is authored inline inside React components (`<p>The four pillars of prompt engineering are...</p>` directly in JSX). When Kajabi migration arrives in Phase 2, every module needs a content extraction rewrite before migration can begin. The migration doubles in scope.

**Why it happens:**
The `/content/courses/aibi-p/` architecture is planned but not enforced at implementation time. Developers write a quick prototype with inline content and declare it "good enough for Phase 1."

**How to avoid:**
Enforce the content contract from the first module built. Module content lives in `/content/courses/aibi-p/modules/[slug].md` or a JSON/MDX structure. Components receive content as props, never embed copy. The separation is a Phase 1 requirement, not a Phase 2 refactor.

Content schema that maps cleanly to Kajabi: module title, lesson title, body (markdown), activity type, artifact reference, estimated minutes. These map 1:1 to Kajabi's module/lesson/content structure.

**Warning signs:**
- Any prose copy inside a `.tsx` component file that isn't a UI label
- Module content that would require a grep to find and replace
- No `/content/courses/aibi-p/` directory after the first module is built

**Phase to address:** Course architecture phase (establish content schema before first module is authored)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store course progress in sessionStorage only | Simpler — no DB writes per module | Lost on iOS tab kill; zero resume capability | Never for a 5.5-hour course |
| Inline module content in JSX | Faster first module | Full rewrite required before Kajabi migration | Never — content belongs in `/content/` |
| Single enrollment record for institution bundle | Simpler checkout | No seat tracking; no invite flow; no per-learner progress visibility | Never for institutions |
| Call Accredible API directly on rubric submit | Fewer steps | Race condition risk; irreversible certificate issuance | Never |
| Use full `puppeteer` package for PDF | Familiar API | Build fails on deploy (250 MB bundle bust) | Never on Vercel |
| Client-only forward-only enforcement | Fast to build | Bypassable via direct API calls | Never for credentialed assessment |
| Skip RLS policies on course tables | Queries just work | Cross-user data leakage or broken queries when RLS later enabled | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Storage (file upload) | Route file bytes through Next.js API route | Issue presigned URL from API; client uploads directly to Supabase |
| Supabase RLS | Enable RLS without writing policies | Write policy in same migration as table CREATE |
| Supabase RLS | Call `auth.uid()` directly in policy | Wrap in `(select auth.uid())` for ~95% perf gain (per CLAUDE.md) |
| Accredible API | Issue certificate optimistically on rubric submit | Re-read `approved` status from DB before calling Accredible |
| Accredible API | Assume idempotent POST | Check for existing credential before creating — duplicate calls create duplicate credentials |
| Stripe (bundle) | Use flat price for multi-seat | Use `quantity` on line item + `institution_id` in metadata |
| Stripe webhook | Process event without signature verification | Always use `stripe.webhooks.constructEvent()` — throws on invalid |
| ConvertKit | Call live API from staging enrollment | `SKIP_CONVERTKIT=true` on staging (already in CLAUDE.md) |
| pdf-lib / PDF artifacts | Generate in API route with large font/image assets | Keep asset size under 4 MB total; use base64-embedded fonts |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading entire course content bundle on module 1 | Slow initial course load on mobile | Dynamic import per module; only load current module's MDX | Noticeable at 9 modules × large content |
| RLS policy without index on `user_id` | Slow progress queries on every module load | `CREATE INDEX idx_course_progress_user ON course_progress(user_id)` | Visible above 1,000 learners |
| Reviewer queue polling on interval | Excess DB reads; reviewer dashboard feels stale | Use Supabase Realtime subscription on `review_submissions` table | Immediate — polling is always wrong |
| Accredible API called synchronously in request handler | Certificate endpoint times out under load | Fire-and-forget with a queue, or return 202 and confirm asynchronously | Any concurrent certification scenario |
| Supabase client instantiated inside component | New connection per render | Use the singleton from `@/lib/supabase` (per CLAUDE.md) | Visible connection exhaustion above ~50 concurrent users |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Enrollment gate checked client-side only | Learner accesses paid course content without purchase | Check `course_enrollments` in middleware or server component before rendering any module content |
| Presigned upload URL issued without validating enrollment | Non-enrolled user uploads to submissions bucket | Verify enrollment in `/api/upload-token` before issuing signed URL |
| Reviewer endpoint accessible to any authenticated user | Learner accesses other learners' submissions | Reviewer role check in API route — explicit allow-list, not just `auth.uid()` present |
| Supabase service role key used in client component | Full DB bypass exposed in browser | `SUPABASE_SERVICE_ROLE_KEY` used only in server-side routes, never in `'use client'` code |
| Stripe webhook processed without signature check | Fake enrollment events trigger course access | `stripe.webhooks.constructEvent()` must be called before reading any event data |
| Module completion endpoint without enrollment check | Anyone can mark modules complete via API | Verify active enrollment before writing to `course_progress` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Score/pass gated entirely behind reviewer queue | Learner waits days with no feedback | Show rubric score breakdown immediately on approval; don't make them wait for the certificate email to know they passed |
| Certificate email only — no in-app confirmation | Learners who check email on a different device feel like the course "forgot" them | Show completion state in the course UI on next login; don't rely on email as sole confirmation |
| Forward-only with no "review my answers" mode | Learner cannot reference earlier submissions when preparing final work product | Allow read-only backward navigation after module completion; forward-only is about changing answers, not blocking review |
| Mobile activity forms with small tap targets | Learner mis-taps on iPhone 390px viewport — wrong answer submitted, can't correct | 44 × 44 pt minimum tap targets; test all interactive activities on physical iPhone Safari |
| PDF artifacts open in Safari without download trigger | iOS Safari opens PDF inline, learner doesn't know it was "saved" | Use `download` attribute on anchor; provide explicit "Saved to your device" confirmation |
| Reviewer queue with no empty state | Reviewer logs in with nothing pending and sees a blank page — assumes queue is broken | Explicit empty state: "No submissions awaiting review" with timestamp of last check |
| Onboarding branch selection with no "change platform" escape hatch | Learner selected wrong platform at onboarding — stuck with wrong examples for 9 modules | Allow branch re-selection from course settings before any module is completed |

---

## "Looks Done But Isn't" Checklist

- [ ] **Course enrollment gate:** Content routes check for active enrollment in middleware or server component, not just authenticated session
- [ ] **Forward-only progression:** Server-side prerequisite check exists in module completion API — not just disabled UI buttons
- [ ] **File upload:** Submission upload bypasses Vercel function body limit via presigned URL — tested with a file > 4.5 MB
- [ ] **Certificate issuance:** Accredible call is gated on re-read `approved` status from Supabase — not triggered optimistically
- [ ] **Course progress resume:** Returning learner on iPhone Safari after tab kill resumes at correct module — not module 0
- [ ] **Onboarding branch context:** Platform branch persists across sessions — test by logging out and back in after survey
- [ ] **Institution bundle seats:** Seat count decrements in Supabase on each learner activation — test with a 2-seat purchase
- [ ] **RLS on all course tables:** `course_progress`, `review_submissions`, `course_enrollments` all have tested policies
- [ ] **Artifact downloads on iOS:** PDF and .md artifacts download (not just open inline) on iPhone Safari
- [ ] **Reviewer cannot see submissions of other reviewers' assigned learners:** Cross-reviewer data isolation tested
- [ ] **Accuracy hard gate:** Rubric scoring logic rejects any submission with Accuracy = 1 regardless of total score
- [ ] **Content in /content/ not JSX:** No prose copy embedded in `.tsx` files — verified with grep before any module is shipped

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Progress lost on iOS tab kill (server-only fix) | MEDIUM | Add `course_progress` table with migration; backfill any affected learners manually; update UI to write on module advance |
| Bundle content hardcoded in JSX | HIGH | Content extraction refactor before Kajabi migration; grep for prose in TSX, move to `/content/` — cannot be automated |
| Wrong certificate issued via Accredible | HIGH | Delete credential via Accredible API (invalidates LinkedIn badge URL learner already shared); re-issue; send apology email with new URL |
| 4.5 MB file upload limit hit in production | MEDIUM | Implement presigned URL pattern; existing uploads already in Supabase Storage are unaffected; only the route changes |
| RLS blocking all queries (policies missing) | LOW | Add policies in a migration; immediate fix; no data loss |
| Institution bundle without seat tracking | HIGH | Schema migration to add seats table; backfill existing bundle purchases manually; build invite flow before next institution sale |
| Onboarding branch lost on resume | LOW | Add `platform_branch` column to enrollments; on next login, re-show onboarding survey if column is null |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| File uploads through Vercel functions | Course submission flow setup | Upload a 6 MB file from a real iPhone — should succeed via presigned URL |
| Puppeteer / PDF bundle bust | Artifact download implementation | `vercel build` succeeds; no 250 MB warning in build output |
| Course progress lost on iOS tab kill | Database schema phase | Kill Safari tab mid-course on iPhone; return; resume at correct module |
| Forward-only client-only enforcement | Course API route phase | Direct POST to module completion API without prior modules — should 403 |
| Certificate issued before approval | Reviewer workflow phase | Submit failing work product; confirm no Accredible API call fires |
| RLS gaps on course tables | Every DB migration | Run Supabase RLS tester as non-enrolled user; should return 0 rows |
| Onboarding branch not persisted | Onboarding survey phase | Log out after survey; log back in; platform context still correct |
| Institution bundle without seat model | Stripe checkout phase | Purchase 2-seat bundle; activate 2 learners; third activation should fail |
| Content hardcoded in JSX | First module authoring | `grep -r "The four pillars" src/` returns 0 results |
| Accredible duplicate credential | Certificate integration phase | Trigger certification endpoint twice; confirm second call is a no-op |

---

## Sources

- [Vercel Functions Limits — official documentation](https://vercel.com/docs/functions/limitations) (HIGH confidence — official)
- [How to bypass Vercel's 4.5 MB body size limit — Vercel KB](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions) (HIGH confidence — official)
- [Deploying Puppeteer with Next.js on Vercel — Vercel KB](https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel) (HIGH confidence — official)
- [Troubleshooting 250 MB bundle limit — Vercel KB](https://vercel.com/kb/guide/troubleshooting-function-250mb-limit) (HIGH confidence — official)
- [Supabase Row Level Security — official docs](https://supabase.com/docs/guides/database/postgres/row-level-security) (HIGH confidence — official)
- [Supabase Signed URL uploads — official docs](https://supabase.com/docs/reference/javascript/v1/storage-from-upload) (HIGH confidence — official)
- [10 Common Mistakes Building with Next.js and Supabase](https://www.iloveblogs.blog/post/nextjs-supabase-common-mistakes) (MEDIUM confidence — community, aligns with official docs)
- [Anyone generating PDFs server-side in Next.js? — community thread](https://techresolve.blog/2025/12/25/anyone-generating-pdfs-server-side-in-next-js/) (MEDIUM confidence — community)
- [Accredible API Documentation](https://docs.api.accredible.com/) (LOW confidence — rate limits and specific error codes not publicly documented in accessible form)
- [Stripe per-seat pricing documentation](https://docs.stripe.com/subscriptions/pricing-models/per-seat-pricing) (HIGH confidence — official)
- iOS Safari sessionStorage behavior — [Apple Developer Forums](https://developer.apple.com/forums/thread/652815) (MEDIUM confidence — known platform behavior)

---
*Pitfalls research for: AiBI-P LMS course delivery in Next.js 14 on Vercel*
*Researched: 2026-04-15*
