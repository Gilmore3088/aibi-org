---
title: UX Review Synthesis — three independent reviewers
date: 2026-05-26
branch: feature/redesign-mockup-system
reviewers:
  - Conversion specialist (docs/ux-review-conversion-2026-05-26.md)
  - Design-systems & IA critic (docs/ux-review-system-2026-05-26.md)
  - Banker buyer advocate (docs/ux-review-buyer-2026-05-26.md)
status: action-pending
---

# Synthesis

Three independent reviews against `localhost:3000` of the redesign branch. This doc consolidates findings, ranks them by **convergence** (how many reviewers flagged the same issue) and **effort**, and breaks them into three execution tiers.

## TL;DR

**Six convergent blockers** (flagged by 2+ reviewers):

1. **`/courses/foundation/program/purchase` is the worst page on the site** — wrong design system (Ledger), drops "examiner respects" line, H1 says "AI Banking Foundation" not "AiBI-Foundation", forces signin before Stripe. **All three reviewers hit this.**
2. **`/research` archive is broken** — different global nav from rest of site, no max-width cap on layout, WCAG-fail contrast. **Conversion + System.**
3. **SiteHeader still on Ledger tokens across every mockup-system page** — most-seen surface in the product is wrong system; no mobile nav. **System.**
4. **`/my-toolbox` first fold is a paywall** — "Toolbox" in nav lands on $295 enrollment. **Conversion.**
5. **`/assessment:L543` still promises "no email gate"** (was P0 in earlier audit, never fixed). **Buyer.**
6. **Anti-positioning ("No software seats. No vendor lock-in.") missing on every page where money changes hands.** /, /assessment, /education, /purchase. **Buyer.**

**Three execution tiers below.** Tier 1 ships before merge (cheap copy/route fixes). Tier 2 ships before merge if you accept ~3 hours of work. Tier 3 ships post-merge (multi-day refactors).

---

## Tier 1 — fix now, ~90 minutes total

These ship before merge. Mostly copy + single-line route changes.

| # | Fix | File / location | Effort | Convergence |
|---|---|---|---|---|
| 1 | Replace "no email gate" line at `/assessment:L543` with truthful version | `src/app/assessment/page.tsx` | 5 min | Buyer (was P0) |
| 2 | Remove "unlock" banned word from `program/quick-wins:16` and `prompt-cards/PromptCardsExperience.tsx` × 4 | 2 files | 10 min | Buyer (was P0) |
| 3 | Add "No software seats. No vendor lock-in." to `/` lede | `src/app/page.tsx` | 5 min | Buyer |
| 4 | Add "No software seats. No vendor lock-in." pull-quote on `/education` | `src/app/education/page.tsx` | 10 min | Buyer |
| 5 | Fix `/courses/foundation/program/purchase` H1: "AI Banking Foundation" → "AiBI-Foundation" + restore "credential your examiner respects" line | `src/app/courses/foundation/program/purchase/page.tsx` | 15 min | All three |
| 6 | `/my-toolbox` hero — soften the immediate paywall; lead with "browse the preview", relegate enrollment CTA below the fold | `src/app/my-toolbox/page.tsx` | 15 min | Conversion |
| 7 | `/` voice fix — replace "Inside the platform / Learner Command Center" SaaS-y kickers with Institute voice | `src/app/page.tsx` | 10 min | Buyer |
| 8 | Pricing parseable — break "$295 · $199 at 10+ · Lifetime access" into structured row (price · volume tier · access term) | `src/app/page.tsx` + `src/app/education/page.tsx` | 20 min | Conversion |

**Total: ~90 minutes.** Closes 60–70% of all flagged issues by volume.

---

## Tier 2 — ship before merge if you accept ~3 hours

These are the high-impact structural fixes. None requires new design, but each touches more code.

| # | Fix | Effort | Convergence |
|---|---|---|---|
| 9 | `/research` archive — apply mockup-system chrome (kill bespoke `aibi-research` / `ticker` / `dot` classes), cap container width, fix gold-on-cream contrast | 60 min | Conversion + System |
| 10 | SiteHeader port — drop Ledger tokens (`bg-linen`, `font-serif-sc`, `text-dust`, `rounded-sharp`), use mockup palette, add mobile nav below 1180px | 60–90 min | System (BLOCKER) |
| 11 | `/courses/foundation/program/purchase` — port to mockup chrome (remove `lms-shell` topbar, retired italics, pillar headings, `--ledger-muted`) | 60–90 min | All three |
| 12 | `/research/<slug>` articles — port chrome from legacy to mockup (six articles, same template) | 90 min | System |

**Total: ~3 hours** (10 if doing the article ports too).

The user already greenlit "everything live on aibankinginstitute.com" so the question is: ship Tier 1 only and accept Tier 2/3 as post-merge, or invest the additional 3 hours and ship a cleaner cut.

---

## Tier 3 — post-merge follow-up

Multi-day work. Not ship-blocking but worth tracking.

| # | Fix | Effort |
|---|---|---|
| 13 | `/purchase` — eliminate signin gate before Stripe (route directly to checkout, provision on `payment.success`) | 1 day |
| 14 | LMS interior mockup pass (Wave 1–4 per `docs/lms-page-map-2026-05-26.md`) | multi-day |
| 15 | Resolve CTA-verb sprawl ("book a briefing" × 6 variants, "take the assessment" × 4) into a consistent dictionary | 2 hrs |
| 16 | Extract recurring patterns into shared components (four eyebrow treatments, three pricing-trio chromes, three hero-aside cards) | 1 day |

---

## What's working well (from all three reviews)

- `/assessment`'s 4-question try-it widget — the best pre-commit pattern on the site (Conversion specialist)
- `/security`'s regulatory citations in the first 200 words (Conversion + Buyer)
- `/about`, `/security`, and both `/research/*` articles pass the "forward to the board" test (Buyer)
- The two research articles are the gold standard — every other page should be measured against them (Buyer)
- The mockup-system chrome where it IS applied is clean and consistent (System)

---

## Decision

The next message after this synthesis is the actual execution. Tier 1 starts immediately.

If, after Tier 1, the user wants to invest the Tier 2 hours before merge — say "do Tier 2." Otherwise, merge after Tier 1 and create issues for the rest.
