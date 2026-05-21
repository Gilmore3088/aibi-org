---
date: 2026-05-21
type: handoff
author: claude
session: "Consolidation — merge queue, conflict resolution, issue reconciliation, dependabot, doc sync"
---

# Session sign-off — 2026-05-21 (consolidation)

The goal this session was consolidation: collapse the half-done branch
sprawl into one working main, then see what's truly left. Done.

## Shipped to production today (main → Vercel)

| PR | What | Closed |
|----|------|--------|
| #234 / #252 / #255 | Ledger token sweep · program/page split · shared ActivityFields (merged individually by operator) | #239 |
| **#254** | Consolidation + **security hardening** (cert RLS `00036`, `/api/user-profile` 401, rate limits, dep bumps), **#238** last-routes Terra→Ledger, E2E suites, dependabot, env-vars audit | #141 |
| **#256** | Toolbox onboarding slices 1/2/4a | #229 |
| **#257** | Perf: briefing score bars `width`→`transform: scaleX()` | #237 |

QA'd the merged LMS changes (M5 Activity 5.2 FormField swap, program-overview
split, ActivityForm radio/select, token sweep, focus rings) at the code level —
all pass. Pixel-verified the program overview + both `/purchased` cards.

## ⚠️ Open obligations (operator)

1. **Apply migration `00036` in Supabase** — the certificate enumeration hole
   stays open until it runs. Code is inert without it. *(verify page already
   reads via service-role, so verification keeps working post-apply.)*
2. **Apply migration `00035`** → then merge **PR #224** (Starter tier). This
   unblocks toolbox onboarding **Slices 3 + 4b/c** (they read `access.tier`).
3. **Dependabot:** #261 (runtime minor/patch group) and #260 (Actions, needs
   rebase) await your review. The 4 build-breaking majors were closed.

## Open PRs

| PR | State | Action |
|----|-------|--------|
| #224 | held | apply `00035`, then merge |
| #225 | draft | SME content for kits; not launch-blocking (content lands later) |
| #260 | dependabot, rebasing | merge when green (Actions bump) |
| #261 | dependabot | operator review (11 runtime minor/patch updates) |

## The honest outstanding picture (46 open issues)

**You are gated by ~6 operator/decision items, not by the issue count.**

- **🔧 Launch-critical operator/decision:** #133 Supabase auth templates
  (15-min, biggest unblock) · #132 DNS/SSL · #151 §20 final smoke · #152
  external rename (Stripe/MailerLite/Resend) · #187 auth-flow decision ·
  #224+#219 Starter tier (migration `00035`).
- **🟡 The big LMS push (deferred by you):** #240/#241/#242/#243/#245/#247/
  #248/#249/#250 file splits · #228 toolbox structural restructure · #233 LMS
  audit umbrella · #148 LMS cleanup · #251 settings bug (needs schema decision).
- **🤖 E2E umbrellas blocked on Supabase env in CI:** #134–#140, #143.
- **📋 Backlog/post-launch:** #144, #154–#161, #162, #178–#180.

## Look ahead — recommended order

1. **Tonight (operator):** #133 auth templates → apply `00036` → apply `00035`
   + merge #224 → DNS (#132). That ungates the authed experience, closes the
   security hole, and unblocks the rest of onboarding.
2. **Next agent session (unblocked by the above):** finish #231 Slices 3 +
   4b/c on the real `access.tier`; then start the **big LMS push** (#240–#250
   file splits + #228 restructure) — the "competing structures" cleanup, done
   as a focused series like #252 proved out.
3. **Then:** the E2E suites (#134–#140) once Supabase keys are in CI.

## Notes / housekeeping

- CLAUDE.md synced this session: ConvertKit→MailerLite+Resend, HubSpot removed,
  analytics is `@vercel/analytics` + Plausible coexisting (not a clean cutover),
  capture-email + MVP-gate items corrected.
- `COMING_SOON="true"` is now in local `.env.local` — `npm run dev` shows the
  holding page on public routes; run `COMING_SOON=false npm run dev` to QA.
- Merged-PR worktrees (`aibi-onboarding-231`, `aibi-perf-237`) + stale
  `design-2.0` / `mailerlite` / `audit-sweep` / `marketing-e2e` are cleanup
  candidates (operator nod needed).
- Preview auth bypass only unlocks the auth-layout redirect — enrollment/
  entitlement-gated LMS + toolbox surfaces still redirect, so their pixel QA
  needs a seeded session.
