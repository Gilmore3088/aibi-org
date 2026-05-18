# Tasks — Dashboard Ledger Redesign + Sales Refinement

Plan: [`../../Plans/dashboard-ledger-redesign.md`](../../Plans/dashboard-ledger-redesign.md)
Shipped: 2026-05-17 · all items complete.

## `/dashboard` rebuild

- [x] Fetch and read `User Home.html` from the design handoff bundle
- [x] Verify the second bundle (`AyViAgbGthsTGBLq6UlmsQ`) is byte-identical to the first
- [x] Welcome hero with personalised greeting from email local-part
- [x] State-aware hero CTAs (no-readiness / entitled / enrolled / lapsed)
- [x] 7-rung activation ladder (account → readiness → rep → in-depth → Foundation → first module → cert)
- [x] Trio cards (Assess / Practice / Build) wired to live routes
- [x] Today's rep card pulled from `getDailyPracticeRep()`
- [x] Risky→safe demo relabelled as "example" so it reads honestly for any daily rep
- [x] In-Depth section appears only when entitled
- [x] Foundation preview (dark) with honest feature list
- [x] Free resources grid (4 cards, all pointing at real briefings)
- [x] SAFE rule strip with CTA to a real briefing
- [x] Tabs row (Dashboard / The Brief / Curriculum / Toolbox), drop Account
- [x] Scoped styles via `<style jsx global>` referencing `--ledger-*` tokens with raw fallbacks

## `/assessment/in-depth` refocus

- [x] Hero reframed around "board-ready" + written report
- [x] Single buying surface: Free vs In-Depth side-by-side
- [x] Recommended badge + gold border on In-Depth card
- [x] $99 button rendered inside the Recommended card alongside deliverables
- [x] Line-by-line comparison table below (8 rows)
- [x] All three "Purchase In-Depth · $99" CTAs wired to real Stripe checkout
- [x] Generalise `PurchaseButton` with `label` / `pendingLabel` / `size` props
- [x] Remove trust strip footer
- [x] `#compare` anchor scroll fixed (Next/Link with hash → plain anchor)

## Chrome / auth fixes (side effects)

- [x] `/auth/*` — `LedgerSurface` gets `showHeader` prop; auth pages pass `false`
- [x] `/courses/foundation/program/*` — hamburger wrapped in `md:hidden` div
- [x] `/courses/foundation/program` removed from `CHROMELESS_PATHS`
- [x] `/courses/foundation/program` H1 reversed: "Banking AI" → "AI Banking"
- [x] `/courses/foundation/program/purchase` — drop AiBI-S/L roadmap footer
- [x] `/courses/foundation/program` — drop "More credentials launching soon" footer
- [x] `/courses/foundation/program` — combine two redundant hero paragraphs into one promise line

## Copy accuracy sweep

- [x] Foundation card: drop "8-week cohort" (it's self-paced)
- [x] Foundation card: drop "video modules" (no video)
- [x] Foundation card: drop "200+ reps" claim (15 reps; reps are free for everyone)
- [x] Foundation card: drop "cohort community / live calls" (self-paced)
- [x] Foundation card: drop "role-specific tracks for executives / risk / ops / IT" (one course, not four tracks)
- [x] Foundation feature list rebuilt around real counts (12 modules / 30+ prompts / 6 artifacts / hands-on activities / verified cert)
- [x] Dashboard resource links repointed from non-existent routes to real briefings
- [x] SAFE strip CTA points at a real briefing (was a dead link)
- [x] Remove "See all reps →" link (no `/practice` index page)
- [x] "Tour the Institute →" routes to `/courses/foundation` (marketing) not `/program` (gated)

## `PREVIEW_AUTH_BYPASS` helper

- [x] `src/lib/auth/previewBypass.ts` created with `VERCEL_ENV` hard floor
- [x] Wired into `/dashboard/layout.tsx`
- [x] Wired into `/courses/foundation/program/layout.tsx`
- [x] Auto-fire when `NEXT_PUBLIC_SUPABASE_URL` isn't set (no env-var ceremony)
- [x] Verified inert on production (Supabase configured + hard floor)

## Production push

- [x] PR #123 opened
- [x] Branch built clean on Vercel
- [x] Merged `feature/dashboard-ledger` → `main` (commit `764f13e`)
- [x] Follow-up fixes pushed direct to `main` (`3a6e26a`, `54033b3`, `7418545`)
- [x] Production verified: dashboard, in-depth, foundation program all rendering as expected
- [x] Worktree + remote branch deleted
