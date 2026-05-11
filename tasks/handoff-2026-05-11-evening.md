# Session handoff — 2026-05-11 evening

**Branch state:** `main` is clean. 75 PRs merged this session.
**Active dev:** none — pause point before two queued items.
**Production status:** deployed, security headers active, CSP in report-only.

---

## Open items, in priority order

### 1. BUG — `/courses/foundation/program/onboarding` renders blank

**Status:** diagnosed, not yet patched. Caught at end-of-session.

**What's happening:**
PR #65 wrapped this page in `<CourseShellWrapper>`. The
`OnboardingSurvey` client component has its own two-column layout
(SurveyBranding sidebar + form via SurveyStepContent). Nesting it
inside CourseShellWrapper's 1080px max-width inline-styled column
breaks one or both child columns — net result is a blank page.

**Recommended fix (≤10 lines):**
Revert the wrap on `/onboarding` only. Match the `/purchased` page
pattern — chromeless, full-bleed. The LMS sidebar isn't useful in
mid-onboarding anyway (modules are locked until the survey
completes). Edit only `src/app/courses/foundation/program/onboarding/page.tsx`:

```tsx
// Remove the CourseShellWrapper import.
// Replace the return with the original simple wrapper:
return (
  <div className="min-h-screen bg-[color:var(--color-linen)]">
    <OnboardingSurvey enrollmentId={enrollment.id} />
  </div>
);
```

**Verify:** log in as an enrolled user with `onboarding_answers IS NULL`,
visit `/courses/foundation/program/onboarding`. Should see WelcomeFirstPrompt
on first hit, then the SurveyStepContent form.

**Similar surfaces to consider:** post-assessment and settings were
also wrapped in PR #65. Settings probably works fine (single column).
Post-assessment uses PostAssessmentClient which renders a full
two-column experience too — may need the same revert. Verify visually.

---

### 2. FEATURE — In-Depth Assessment rich results report

**Status:** known not-yet-built. User flagged at end-of-session.

**Current behavior:**
`src/app/assessment/in-depth/take/_components/InDepthRunner.tsx` line 60:

```ts
// Redirect into the existing /results/[id] surface for now — same UI
// as the free flow until the 20-page in-depth report is built.
if (data.profileId) {
  router.replace(`/results/${data.profileId}`);
}
```

After completing 48 questions, the runner redirects to `/results/[id]`
which is the FREE assessment results template (score + tier +
dimension breakdown + 1 starter artifact). The buyer paid $99 for the
in-depth experience and gets the same view as a free completer.

**What's promised (per page metadata + marketing copy):**
"Forty-eight questions across the four readiness dimensions. Returns
a 20-page personalized report with peer-band comparison and a 30-day
action plan."

**What needs to be built:**
1. **New route** `src/app/assessment/in-depth/results/[id]/page.tsx`
   - Owner-bound via the same bearer-UUID pattern as `/results/[id]`
   - Server component; loads from `indepth_takes` table
2. **Data model already in place** (verify):
   - `indepth_takes` table from PR #44 schema (cherry-pick from
     `backup/stripe-products-pre-rebase-2026-05-11` if missing — see
     handoff-2026-05-10.md item 7)
   - Dimension breakdown columns in `user_profiles` (migration 00011)
3. **Peer-band comparison** — needs ≥30 respondents per band before
   comparisons are statistically meaningful. Until then, show "Peer
   data unlocking at N=30" placeholder per the 2026-04-15 deferral.
4. **30-day action plan** — content authoring task. Could be templated
   from the lowest-scoring dimension + the existing 8 starter
   artifacts, or AI-synthesized at submit time via Anthropic SDK.
5. **PDF download** — server route + `@react-pdf/renderer` template.
   Pattern exists in `src/lib/pdf/` (SkillTemplateLibrary,
   TransformationReport, AcceptableUseCard PDFs).
6. **Redirect change** — `InDepthRunner.tsx:63` to point at the new
   surface.

**Scope estimate:** half-day to full-day of focused build, spread
across 3 PRs:
- PR A: new route + minimal Ledger-styled report shell + dimension
  deep-dive cards
- PR B: PDF download via @react-pdf/renderer
- PR C: 30-day action plan generator (content or AI-synthesized) +
  peer-band placeholder

**Don't start mid-session.** This needs a fresh context window and
brand/content alignment with the operator on the report's narrative
arc.

---

### 3. INCIDENT NOTES — 2026-05-11 ghost-user / Gmail-alias

Resolved end-to-end. Recorded here so the next session doesn't
re-debug if it sees alias-related anomalies.

**What happened:**
1. Buyer paid for In-Depth Assessment as `jlgilmore2+2@gmail.com`
   (Stripe test alias). Stripe webhook created auth user with
   that exact alias, set `course_enrollments.user_id = NULL`.
2. Buyer signed in as canonical `jlgilmore2@gmail.com`.
   `/assessment/in-depth/take` couldn't find an entitlement
   (exact-string email match) → redirected to
   `/assessment/in-depth?reason=no-purchase`.
3. Operator retried, paid AGAIN through `/courses/foundation/program/purchase`
   ($295 foundation course), thinking it was a re-try of the in-depth.
4. My in-flight PR #66 had landed by then. New row created with
   `user_id` resolved via canonical match — picked the WRONG auth
   user (the +2 ghost) because canonical-first matching had no
   exact-match preference.

**Fixes shipped:**
- PR #66 — Read-side canonicalization. All entitlement queries
  match by user_id OR any email variant.
- PR #67 — `resolveUserId` exact-match first, canonical fallback,
  prefer most-recently-active among canonical matches.
- PR #68 — `ensureAuthUser` canonical-first lookup + create with
  canonical email. No more ghost +alias auth users.
- Direct SQL — bound both enrollments to the real user_id; deleted
  the +1 and +2 ghost auth.users rows.

**Edge case still possible:** a non-Gmail provider with `+tag` (Outlook,
ProtonMail) gets created as an alias-specific auth user because the
canonicalizer deliberately doesn't normalize them. Acceptable per the
canonicalization comment — those providers' rules are less universal.

---

## Production state

- **main HEAD:** PR #75 merge (E2E coverage expansion + env audit)
- **Vercel deploys:** all green; CSP in report-only
- **Supabase migrations applied:** through `00031_rate_limits`
- **Open PRs:** 0
- **Open issues:** #48 (In-Depth Assessment leader/institution features) —
  separate from the rich-report scope above

---

## Operator action queue (carryover, in priority order)

1. **Run E2E suite locally** — `npm install && npm run e2e:install`
   then `npm run e2e:smoke` and `npm run e2e:a11y` to validate.
2. **Audit env vars** — `vercel env pull .env.local && npm run audit:env:strict`
   to confirm every referenced var is set in Vercel.
3. **Rotate `SUPABASE_SERVICE_ROLE_KEY`** — flagged as plaintext-readable.
4. **Flip CSP to enforce** — change `Content-Security-Policy-Report-Only`
   → `Content-Security-Policy` in `next.config.mjs:198` once preview
   shows zero violations.
5. **Smoke test on real iPhone Safari** — assessment, in-depth take,
   foundation overview, foundation purchase.
6. **Submit sitemap to Google Search Console** (§14.411).

---

## Key project state references (read these next session before touching code)

- **`CLAUDE.md`** — project intelligence file with full Decisions Log.
  Don't skip; the 2026-04-15 / 2026-05-09 / 2026-05-11 entries
  document non-obvious overrides.
- **`tasks/launch-checklist.md`** — 520-item launch checklist with
  current status.
- **`tasks/launch-status-2026-05-11.md`** — what closed this session.
- **`tasks/handoff-2026-05-10.md`** — previous-day handoff (still
  largely applies; the Supabase Auth template fix listed there as
  the launch blocker was completed this session).
- **`docs/brand-refresh-2026-05-09/`** — canonical design source
  (Ledger system).
- **`tasks/api-auth-audit-2026-05-11.md`** — the 42-route security
  audit; blockers are fixed but the rate-limit + RLS recommendations
  remain.

---

## Files to NOT touch unless you understand why

- `src/components/lms/CourseShell.tsx` + `LMSSidebar.tsx` +
  `LMSTopBar.tsx` + `CourseShellWrapper.tsx` — the new LMS chrome
  primitives. Every course surface depends on these. Test changes
  with `npm run build` AND eyeball Vercel preview.
- `src/lib/email/canonicalize.ts` — the Gmail-alias fix. Don't
  add non-Gmail provider rules without considering the false-collision
  risk documented in the file.
- `src/lib/stripe/provision-enrollment.ts` `resolveUserId` —
  exact-match-first ordering is load-bearing per the 2026-05-11
  incident.
- `next.config.mjs` `headers()` — CSP origin list. Adding a third-party
  origin requires adding it to `script-src` / `connect-src` /
  `frame-src` as appropriate.
- `supabase/migrations/00028a_legacy_rename_applied_2026_05_10.sql`
  + `00031_rate_limits.sql` — applied to production; renaming or
  re-running breaks state.

---

## How to resume next session

1. Read this doc.
2. Read `tasks/launch-status-2026-05-11.md` for the full PR list.
3. Confirm which branch to work on (`git worktree list`; expect
   `~/Projects/TheAiBankingInstitute` on `main`).
4. Ask operator: pick up the two open items above, or new direction?
5. If picking up the onboarding fix: 5-min change, ship as a single
   small PR. Test by visiting `/courses/foundation/program/onboarding`
   after the deploy.
6. If picking up the in-depth report: start with a brainstorm on the
   report's narrative arc (what 20 pages cover, what's templated vs
   AI-synthesized) BEFORE touching code. This is product design
   work, not just engineering.
