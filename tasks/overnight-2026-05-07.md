# Overnight Build — 2026-05-07 → 2026-05-08

**Mode:** Autonomous overnight work, user asleep.
**Operating principle:** Do everything that can be done without dashboard
credentials or judgment calls. Preserve user choice on anything destructive
or strategic. Document everything for morning review.

---

## ✅ Shipped this session

### Production
- **Manual `vercel --prod` deploy fired** — commit `5e3a2bf` (the homepage +
  /education + /for-institutions + /resources content enrichment batch) is
  now live at `aibankinginstitute.com` via deploy
  `aibi-c46n7d74k-gilmore3088s-projects.vercel.app`. The GitHub→Vercel
  webhook never enqueued automatically — see "blockers" below.

### Repo cleanup (origin)
- Pushed previously local-only branches: `design-2.0`, `feature/stripe-products`,
  `feature/wave-1-bucket-a-diagnostic-framework`, `feature/wave-2-bucket-b-executive-ammunition`.
- Deleted **10 fully-merged remote feature branches**: `feature/coming-soon-{a11y,
  distill, form-polish, redesign, rename, tension, trim, valueprop}`,
  `feature/strip-fake-meta`, `feature/waitlist-intent`. All were verified
  merged into `origin/main` before deletion. No commits lost.

### Repo cleanup (local)
- Removed worktrees `~/Projects/aibi-emails` + `~/Projects/aibi-prelaunch`
  and deleted local branches `feature/emails`, `feature/prelaunch-cleanup`
  (both were 0 commits ahead of main — merged remnants).
- Recreated permanent `~/Projects/aibi-staging` worktree tracking
  `origin/staging` per CLAUDE.md spec; `.env.local` symlinked.

### Two PR-ready feature branches pushed for morning review

#### `fix/pdf-libnss3` — Fix `/api/assessment/pdf/warm` libnss3.so missing
- Bumped `@sparticuz/chromium` 121.0.0 → ^148.0.0
- Bumped `puppeteer-core` 21.11.0 → ^24.43.0
- Updated `src/lib/pdf/generate.ts` for the new chromium API (`headless`
  is no longer exported from chromium; default to `true`)
- Build + typecheck green locally
- **Needs:** Vercel preview deploy verification before merge — the libnss3
  error only manifests on Vercel's runtime, not locally
- **Open PR:** `https://github.com/Gilmore3088/aibi-org/pull/new/fix/pdf-libnss3`

#### `feature/sandbox-multi-provider` — OpenAI + Gemini providers
- New `src/lib/sandbox/providers/openai.ts` mirroring the Claude contract
- New `src/lib/sandbox/providers/gemini.ts` mirroring the Claude contract
- `/api/sandbox/chat` now dispatches to the right provider via a switch on
  the `provider` field. `VALID_PROVIDERS` expanded to `['claude','openai','gemini']`
- Defaults: OpenAI `gpt-4o-mini`, Gemini `gemini-2.0-flash`. Override via
  `config?.model`.
- Each adapter returns an error stream if its API key is missing — never
  throws, never blocks the route handler
- Build + typecheck green
- **Needs:** `OPENAI_API_KEY` + `GEMINI_API_KEY` in env to actually exercise.
  UI tabs still labelled "coming soon" — that's a separate UI follow-up
- **Open PR:** `https://github.com/Gilmore3088/aibi-org/pull/new/feature/sandbox-multi-provider`

### Read-only inventory work (no production state changed)

#### Stripe products + prices — already wired in test mode
Account `acct_1TTll2Ry9NIFjtII` ("Ai Banking Institute sandbox") has all
four products from the 2026-05-05 product simplification decision already
live with prices attached. **No new product creation needed.**

| Product | ID | Prices |
|---|---|---|
| AiBI-Practitioner | `prod_UShU302Dln6DMz` | `price_1TTm5iRy9NIFjtIISaDEOkUi` ($295 individual), `price_1TTmudRy9NIFjtIIEPmR1BpP` ($199 institution) |
| In-Depth Assessment | `prod_UShU2x1hnWjYe2` | `price_1TTm5fRy9NIFjtIILoSrp1So` ($99 individual), `price_1TTm5gRy9NIFjtIIH81gCQSe` ($79 institution) |
| AiBI-S Specialist | `prod_UShZSlWrdzgC3w` | (no prices yet — soft-hidden per 2026-05-05 decision) |
| AiBI-L Leader | `prod_UShZBcevbScyJJ` | (no prices yet — soft-hidden per 2026-05-05 decision) |

Per the 2026-05-06 CLAUDE.md decisions log, `STRIPE_AIBIP_PRICE_ID` and
`STRIPE_AIBIP_INSTITUTION_PRICE_ID` already live in Vercel Production
scope. The In-Depth Assessment Price IDs are NOT yet in env — needs:

```
STRIPE_INDEPTH_PRICE_ID=price_1TTm5fRy9NIFjtIILoSrp1So
STRIPE_INDEPTH_INSTITUTION_PRICE_ID=price_1TTm5gRy9NIFjtIIH81gCQSe
```

#### Supabase test-row inventory — counted, not deleted
SELECT preview only. No DELETE issued (deletion is destructive, queued for
explicit caps approval below).

| Table | Rows matching test-pattern (`+...@`/`test%@`/`alias%@`) |
|---|---|
| `auth.users` | 19 |
| `user_profiles` | 18 |
| `course_enrollments` | 1 |

All matching rows are `jlgilmore2+*@gmail.com` aliases — confirmed
intentional test data per the 2026-05-06 entry in the CLAUDE.md decisions
log.

---

## 🔴 Blocked on you (need dashboard or judgment calls)

### Vercel ↔ GitHub webhook is broken
Auto-deploy on `git push origin main` did not fire for `5e3a2bf`. Zero
GitHub check-runs registered from Vercel. I worked around it tonight by
running `vercel --prod` from CLI, but for tomorrow's pushes you'll either
need to:
- (a) Reconnect the GitHub integration in Vercel dashboard (Settings →
  Git), OR
- (b) Continue triggering manually with `vercel --prod` from the project
  worktree

### Decisions queued
| # | Decision | Detail |
|---|---|---|
| 1 | Wave-1 vs wave-2 | Both branches at the exact same SHA `d8ab4e9`. Either one is a leftover alias or the user intended them to diverge. Both are now on origin. |
| 2 | `feature/assessment-briefing-reshape` (12 commits ahead) | Merge, continue, or abandon |
| 3 | `feature/auth-audit` (2 commits ahead) | Merge, continue, or abandon |
| 4 | Kill `COMING_SOON=true` env var entirely? | Bypass list now covers the entire site. Killing is cosmetic but removes dead conditional code. Touches `src/middleware.ts` + `src/app/layout.tsx` |

### Caps-approval needed (destructive)

⚠️ **Supabase test-row deletion**

The 19/18/1 row counts above are confirmed test rows. Whenever you're
ready, the cleanup script is:

```sql
-- preview first (read-only)
SELECT email, created_at FROM auth.users
WHERE email LIKE 'jlgilmore2+%@gmail.com'
ORDER BY created_at DESC;

-- then delete (CASCADE removes user_profiles + course_enrollments)
DELETE FROM auth.users WHERE email LIKE 'jlgilmore2+%@gmail.com';
```

I'd rather you fire it than have me do it overnight.

### Operator weekend work (unchanged from `tasks/weekend-env-setup.md`)
1. Phase 0: `CRON_SECRET`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, replicate
   Supabase keys to Preview + Development
2. Phase 1: ConvertKit — API keys, 4 Tags, 4 Sequences, paste 12 emails
   from `content/email-sequences/`
3. Phase 2: Resend, HubSpot (`npm run hubspot:create-properties`),
   Calendly, AI keys (incl. `OPENAI_API_KEY` + `GEMINI_API_KEY` if you
   want the new sandbox providers to work in prod), `TOOLBOX_IP_HASH_SALT`
4. Phase 3: Stripe webhook endpoint registered in dashboard pointing at
   `https://aibankinginstitute.com/api/webhooks/stripe`
5. Rotate `SUPABASE_SERVICE_ROLE_KEY` + mark Sensitive in Vercel
   (CLAUDE.md 2026-05-06)

### Bigger plans pending decision
- Phase 1.5+ Readiness History build (8–10 hr) — see
  `tasks/outstanding-plan.md §3.1`
- Phase 1.5+ `/dashboard` enhancement (depends on history)
- Phase 3 AiBI-S/L sandbox coverage (3–4 weeks)

---

## State of the repo at end of session

```
LOCAL                                       REMOTE
main 5e3a2bf                                origin/main 5e3a2bf            (in sync)
design-2.0 4df5ffa                          origin/design-2.0 4df5ffa      (in sync, new tonight)
feature/stripe-products 84f2ff8             origin/feature/stripe-products  (in sync)
feature/wave-1-bucket-a-… d8ab4e9           origin/feature/wave-1…          (in sync, new tonight)
feature/wave-2-bucket-b-… d8ab4e9           origin/feature/wave-2…          (in sync, new tonight)
fix/pdf-libnss3 857d2c8                     origin/fix/pdf-libnss3 857d2c8  (in sync, new tonight)
feature/sandbox-multi-provider 1332f54      origin/feature/sandbox-…        (in sync, new tonight)
                                            origin/staging f84a3ae          (worktree recreated)
                                            origin/feature/assessment-briefing-reshape (12 commits, no decision yet)
                                            origin/feature/auth-audit       (2 commits, no decision yet)
```

Worktrees:
```
~/Projects/TheAiBankingInstitute     main           (home)
~/Projects/aibi-staging              staging        (recreated tonight)
~/Projects/aibi-design-2.0           design-2.0
~/Projects/aibi-stripe-products      feature/stripe-products
~/Projects/aibi-wave-1-bucket-a      feature/wave-1-…
~/Projects/aibi-wave-2-bucket-b      feature/wave-2-…
```

---

## Suggested order of operations tomorrow

1. **15 min** — open both PRs, review + merge if you like:
   - `fix/pdf-libnss3` → main (verify Vercel preview deploy first;
     the libnss3 error only shows on Vercel runtime)
   - `feature/sandbox-multi-provider` → main (or hold for env keys)
2. **5 min** — fire the Supabase test-row cleanup SQL above
3. **10 min** — paste In-Depth Assessment price IDs into Vercel env
4. **30 min** — Vercel ↔ GitHub webhook reconnect
5. **2 hrs** — operator weekend work (Phases 0/1/2 from
   `weekend-env-setup.md`)
6. **45 min** — manual verification runbook
   (`docs/manual-verification-runbook.md`)
