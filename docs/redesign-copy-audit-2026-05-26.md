---
title: Full Copy Audit — feature/redesign-mockup-system
date: 2026-05-26
branch: feature/redesign-mockup-system
scope: every page in src/app/**/page.tsx (~85 routes)
follows: docs/redesign-copy-review.md (P0 framing)
status: open
---

# Full Copy Audit

Site-wide successor to `docs/redesign-copy-review.md`. Produced after the P0
restore on `/`, `/assessment`, `/security` shipped (commit 2947fd2). Five
parallel audit passes covered the rest of the redesign branch. This doc
consolidates findings, ranks them, and lists the work outstanding before push.

---

## TL;DR — what must be fixed before push

### Production blockers (do not push without these)

1. **`/results` leaks a full sample report with no email gate.** Public route at `src/app/results/page.tsx` renders score 62/100, tier, all 5 dimensions, recommended artifacts — directly violates the email-gate UX rule (CLAUDE.md "Assessment Tool" + DECISIONS 2026-05-18). Either rename to `/results/sample` with "Sample" badges on every score card, gate it, or delete.
2. **`/redesign-checklist` has no `noindex`.** `src/app/redesign-checklist/page.tsx` ships no `metadata` block — internal QA tool will index. Add `robots: { index: false, follow: false }`.
3. **`unlock` appears in user-facing copy.** Banned word per CLAUDE.md voice rules. Hits:
   - `src/app/courses/foundation/program/quick-wins/page.tsx:16` — "Hit three wins to **unlock** a recommendation letter template."
   - `src/app/prompt-cards/PromptCardsExperience.tsx` lines 11, 42, 362, 365.
4. **Calendly URL hardcoded twice in `/briefing-preview`** (lines 18, 38) — bypasses `NEXT_PUBLIC_CALENDLY_URL`. Will dead-link.
5. **Dual route collision — `/briefing-preview` and `/faq`.** Both routes exist on `main` as internal, `robots:noindex` HTML bundles. The redesign reuses both as public marketing surfaces. Confirm rename intent or rename the internal versions; otherwise an internal asset ships publicly.
6. **`/assessment` page promises no email gate, then enforces one.** Line 543 step 2 reads "Inline, no email gate." Contradicts how the flow actually works. One-line fix; misleads every visitor on the marketing page.

### Brand-rule violations (CLAUDE.md hard rules)

1. **Retired 3-pillar discipline reappears in `/dashboard/toolbox/library/*` and `.../cookbook/*`** — six files hardcode `PILLAR_LABEL = { A: 'Accessible', B: 'Boundary-Safe', C: 'Capable' }` with per-pillar colors. Current frame is the 4-pillar Awareness / Understanding / Creation / Application (LMS-only, no visual grammar). Substantive content regression.
2. **Retired Terra/Sage/Cobalt tokens reappear in `/dashboard/progression/page.tsx`** (lines 22, 28, 34) and **`/courses/aibi-l/page.tsx`** (multiple) and **`/courses/aibi-s/page.tsx`** (lines 33, 50, 55) — `var(--color-terra)`, `var(--color-cobalt)`, `var(--color-sage)`. Pillar color discipline is retired.
3. **Credential display format regression — `/courses/foundation/program/certificate/page.tsx:221`** uses em-dash: `"AiBI-Foundation — The AI Banking Institute"`. CLAUDE.md spec is **middle dot**: `"AiBI-Foundation · The AI Banking Institute"`. This is the cert PDF / LinkedIn share lineage.
4. **`/research/page.tsx:833`** uses en-dash: `AiBI–Foundation`. Canonical is hyphen: `AiBI-Foundation`.
5. **`/coming-soon/page.tsx`** hardcodes Ledger hex (`#ECE9DF`, `#0E1B2D`) and an unapproved font (`Cormorant Garamond`). Should reference `--cream` / `--ink` tokens and use Inter.
6. **Italics-in-code intent.** Site-wide italic kill in `base.css` neutralizes display, but code-level `fontStyle: 'italic'` and `font-serif italic` classes still encode the wrong intent. If the kill rule ever drops, every one of these visually regresses in one commit. Hits in: `HeroIntro.tsx:68`, `program/[module]/page.tsx:221, 234`, `program/purchase/page.tsx:128, 248`, `aibi-l/page.tsx:62, 65`, `auth/login/page.tsx` (many `<em>`), and across `/research/page.tsx` and three `/resources/*` articles.

### Citation integrity

| Page | Claim | Status |
|---|---|---|
| `/resources/the-widening-ai-gap` | 2.3× top-10 acceleration, +25% talent, JPMC 79.0 etc. | **wrong-source** — Evident AI Index Oct 2025 is not in CLAUDE.md "Reference Documents." Either add Evident as a sanctioned source or rewrite against canonical numbers. |
| `/resources/the-skill-not-the-prompt:19` | Example prompt contains the literal string `"FFIEC examination"` | "FFIEC-aware" is banned; "FFIEC examination" is technically fine but trips the naive launch-gate grep. Recommend replacing with "OCC supervision" or "interagency examination". |
| `/resources/what-your-efficiency-ratio-is-hiding` | Lede says "nine-point gap"; meta says "ten-point gap" | Reconcile to nine (65 − 55.7 ≈ 9.3). |
| `/playbooks/[role]` snapshot maturity bars | "Governance clarity 72", etc. | Unsourced. Add caption clarifying these are illustrative defaults, not industry benchmarks. |
| `/privacy:21` | Names MailerLite + Supabase + Vercel Analytics | Missing **Resend** (transactional email per CLAUDE.md). Privacy policy must disclose. |

### Lost copy — top regressions vs `main`

1. **`/education`** is the single largest regression. Lost the entire catalog: two assessment tiles with prices/question counts, the $99 / $79-at-10 / $295 / $199-at-10 / lifetime-access pricing ladder, the "Resume the program" enrolled-state widget, and concrete tile-level CTAs. Currently four short headings of generic prose.
2. **`/for-institutions`** lost three load-bearing differentiators: "No software seats. No vendor lock-in.", "The dimension dragging you down", "Aggregate dashboard for your champion." Plus "10-seat coached cohort over eight weeks" and "scored on reviewed work." The new sizer is a good addition; tier-level "included" bullets must come back.
3. **`/about`** lost the market-declaration ("anchor towns and neighborhoods — not for the twenty largest banks"), the transparency tagline ("Built on regulator-aligned criteria. Tuition published. Methodology published."), the Six Principles section, the FDIC 8,400 stat monument, and the "We turn bankers into builders. Not efficiency ratios…" mission line.
4. **`/assessment/in-depth` and `/assessment/in-depth/purchased`** were never migrated to the mockup system. Whole pages still render on Ledger tokens with `text-terra`, `font-serif italic`, retired `<em>` emphasis. Copy is strong on the landing — port the chrome, keep the copy.
5. **`/assessment/in-depth/dashboard`** ships developer-voice scaffolding to paying buyers: "/api/indepth/aggregate endpoint will compute these…", "entitlement check on the Toolbox surface…". Rewrite as buyer-facing.
6. **`/for-institutions/advisory`** unmigrated — still Ledger tokens, `font-serif italic` violates the italics retirement.

---

## Page-by-page findings

The five parallel audits are summarized below. Read the detailed reports for full citations and quoted lines.

### Top-level marketing (audit 1)

| Page | Verdict |
|---|---|
| `/` | Restored P0. Hero lede + product trio copy + pricing ladder back. |
| `/assessment` | Restored P0. Step-2 "no email gate" line at L543 still misleads. |
| `/security` | Restored P0. SR 11-7 / TPRM / ECOA / AIEOG framing + 6 chapters back. |
| `/about` | **Severe regression.** Triple-shot anti-positioning, tagline, Six Principles, FDIC stat all dropped. |
| `/for-institutions` | **Severe regression.** "No software seats. No vendor lock-in.", per-tier bullets, cohort timeline, champion persona gone. |
| `/for-institutions/advisory` | Visual chrome unmigrated (Ledger tokens, italics). Copy fine. |
| `/education` | **Severe regression.** Catalog gone. Page is four short headings. |
| `/briefing-preview` | Calendly URL hardcoded × 2. Route collision with internal version on `main`. |
| `/certifications` | "Credential your examiner respects" frame absent. No pricing. No reg citation. |
| `/courses` | "Scored on reviewed work" gone. Otherwise solid. |
| `/courses/foundation` | Redirect only. Fine. |
| `/faq` | Route collision with internal version on `main`. Voice slightly SaaS. |
| `/coming-soon` | Ledger hex literals + Cormorant font. |

### Assessment flow (audit 2)

- `/assessment` post-restore is strong except L543 misleading line and missing `$79/seat at 10+` volume break in the In-Depth tile.
- `/assessment/take` score-phase still uses Ledger `text-terra` + `font-serif italic` (visual only).
- `/assessment/in-depth` (the $99 conversion page) — **never migrated**. Copy is among the strongest in the funnel; chrome is dead. Port wholesale.
- `/assessment/in-depth/purchased` — **never migrated**. Buyer's first post-payment impression on retired tokens.
- `/assessment/in-depth/dashboard` — ships developer-voice scaffolding to buyers. Rewrite required.
- `/results` — **email-gate leak**. Highest single risk in scope.
- `content/assessments/v2/questions.ts` — all 48 questions clean. Banker-grade, second-person throughout, no embedded statistics.

### Resources / Research / Playbooks (audit 3)

- `/resources` index + 5 of 6 articles citation-clean.
- `/resources/the-widening-ai-gap` — entire thesis on uncatalogued Evident AI Index.
- `/resources/the-skill-not-the-prompt` — "FFIEC examination" string + italic Tailwind classes on Mediocre examples.
- `/resources/what-your-efficiency-ratio-is-hiding` — nine-point vs ten-point inconsistency.
- `/research` page — italics structural (the design depends on emphasis the global kill flattens). Restructure with weight/color. Also en-dash AiBI–Foundation.
- `/research/[slug]` — thin shell, OK.
- `/playbooks/[role]` — snapshot maturity % numbers unsourced.

### Course interior (audit 4)

- Credential rename to `AiBI-Foundation` is fully landed across the LMS. **Zero** banned credential-name hits in user-facing copy.
- `program/quick-wins/page.tsx:16` — "unlock" banned word.
- `program/certificate/page.tsx:221` — em-dash credential format regression.
- `HeroIntro.tsx:68` + several module pages — italic-in-code intent contradicts policy.
- H1 surfaces on the program landing + purchase page lead with "AI Banking Foundation." instead of the credential token "AiBI-Foundation."
- "Earn the AiBI-Foundation credential your examiner respects" — single strongest sales line in the corpus — absent from LMS interior.
- `/courses/aibi-l/page.tsx:3` code comment still references "Pillar B".
- `/courses/aibi-l/page.tsx:10` title uses colon instead of middle dot.

### Tools / Auth / Dashboard / Meta (audit 5)

- `/playground` voice-OK. CTA case inconsistent.
- `/practice` needs one line distinguishing it from `/playground` per the two-surface architecture.
- `/my-toolbox` + skill-builder — `'Copied!'` exclamation × 2 (banned).
- `/prompt-cards` — 4× "unlock" hits (banned).
- `/dashboard/page.tsx` — pre-redesign "Pick up where you left off" copy survived the partial wrap. Strong.
- `/dashboard/progression`, `/dashboard/toolbox/library/*`, `/dashboard/toolbox/cookbook/*` — retired Pillar A/B/C + Terra/Sage/Cobalt regressions.
- `/dashboard/assessments` — Ledger tokens (transitional, flag for sweep).
- Auth pages — voice on-brand. Ledger components transitional.
- `/privacy` — missing Resend disclosure.
- `/terms` — "30-day refund" claim unsourced.
- `/redesign-checklist` — **MISSING `noindex`**.

---

## Priority order

| Priority | Item | Estimated effort |
|---|---|---|
| **P0 — production blockers** | `/results` email-gate leak; `/redesign-checklist` noindex; "unlock" hits in quick-wins + prompt-cards; `/briefing-preview` Calendly URL × 2; `/assessment:L543` misleading step-2; `/briefing-preview` + `/faq` route-collision confirmation | ~2 hours |
| **P1 — biggest restorations** | `/education` catalog; `/for-institutions` per-tier bullets + anti-positioning; `/about` market-declaration + tagline + Six Principles | ~1 day |
| **P2 — brand-rule violations** | Retire Pillar A/B/C + Terra/Sage/Cobalt regressions in dashboard surfaces; em-dash → middle-dot on certificate; en-dash → hyphen on /research; Ledger hex on coming-soon; italic-in-code sweep | ~half day |
| **P3 — migration completions** | Port `/assessment/in-depth`, `/assessment/in-depth/purchased`, `/assessment/in-depth/dashboard`, `/for-institutions/advisory` to mockup chrome | ~1 day |
| **P4 — citation integrity** | Resolve `the-widening-ai-gap` source; fix nine-point/ten-point inconsistency; add Resend to /privacy; caption /playbooks snapshot bars | ~2 hours |
| **P5 — polish** | "Examiner respects" credential frame on LMS H1s + program metadata; `/practice` orientation line; `'Copied!'` exclamation strip; CTA-case consistency in /playground | ~2 hours |

**Total estimate to clear through P4: ~3 working days.** P5 can ship after.

---

## What this audit does not cover

- Print PDF deliverables — `assessment/results/print/[id]` and `assessment/in-depth/results/[id]` are server shells; the actual report content lives in `_components/` and warrants its own copy review.
- Module-by-module course content — only the LMS framing, not the lesson body. Course PRD + curriculum content reviewed separately under `content/courses/`.
- Email sequences — MailerLite + Resend templates ship outside this repo.
- SEO meta sweep — separate from copy audit.
- A11y audit — see `docs/handoffs/a11y-audit-2026-05-17.md`.

---

## When this audit can be archived

Move to `docs/_archive/` when P0 + P1 are merged and a follow-up scan confirms
the items above. Until then, this is the master list for the redesign-branch
copy cleanup.
