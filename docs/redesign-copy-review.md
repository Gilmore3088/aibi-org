---
title: Redesign Copy Review — Pre vs Post Mockup Migration
date: 2026-05-26
branch: feature/redesign-mockup-system
status: working-draft
---

# Redesign Copy Review

**Read this before pushing the redesign branch.** The mockup migration upgraded the visual system substantially but **dropped a lot of high-quality copy** in the process. This document inventories what was lost, what regressed, and what needs restoring.

## TL;DR

| Aspect | Pre-redesign | Post-redesign | Verdict |
|---|---|---|---|
| Visual identity | Tight, editorial (Ledger) | Modern, software-feel (Mockup) | **Better** |
| Regulatory citations | Named throughout (SR 11-7, ECOA, AIEOG) | Mostly gone | **Regressed** |
| Pricing/discount specifics | Inline ($79 at 10+, $199/seat, lifetime access) | Generic ($99 / $295) | **Regressed** |
| Audience targeting | "Community banks that anchor towns — not the twenty largest" | "For community banks and credit unions" | **Regressed** |
| Urgency language | "this week", "Monday", "before exam" | Mostly absent | **Regressed** |
| Anti-positioning | "No vendor lock-in", "No software seats" | Absent | **Regressed** |
| Verb specificity | operationalize, anchor, evidence, document, ship, examined | use, build, ship, open | **Mixed** |
| Headline punch | "Turning Bankers into Builders" (preserved) | New + strong: "Train people to use AI without losing control." | **Both work** |

**Bottom line:** The new pages READ but they no longer SELL the way the old pages did. The old copy understood the buyer (a compliance-anxious mid-tier bank CEO). The new copy reads as generic product marketing.

---

## 1. Language Patterns — Before vs After

### Verb taxonomy

| Pre-redesign verbs | Post-redesign verbs |
|---|---|
| **operationalize**, **anchor**, **evidence**, **document**, **ship**, **examined**, **launch** | **use**, **build**, **train**, **practice**, **start** |
| "**drop into** your AI governance framework" | "use safely" |
| "**you leave with** your in-depth score" | "see your score" |
| "credential your examiner **respects**" | "Foundation Certificate" |
| "AI workflows your daily banking work **demands**" | "AI-supported work" |

The old verbs were **transactional** (you walk in, you walk out with X). The new verbs are **descriptive** (here is a thing you can use). Buyers respond to transactional.

### Citation density

The old copy was riddled with named authorities. The new copy strips most of them.

Pre-redesign `/security`:
> Aligned with **SR 11-7**, **Interagency TPRM Guidance**, **ECOA / Reg B**, and the **AIEOG AI Lexicon** (US Treasury, FBIIC, FSSCC, February 2026).

Post-redesign `/security`:
> No member data ever touches a model.

The new line is good — but the old line was the buy signal for a compliance officer. They scan for SR 11-7. We removed it.

### Audience targeting

Pre-redesign `/about`:
> The AI Banking Institute **exists for the community banks and credit unions that anchor towns and neighborhoods — not for the twenty largest banks.** Here is why.

Post-redesign `/about`:
> We started The AI Banking Institute because the AI training community banks were being sold did not survive contact with an exam, a board meeting, or a teller line.

The new line has its own punch ("did not survive contact"), but the old line did three things at once: declared the target market, anti-targeted the BAS/CITI tier, and signaled "we are independent of the big banks." That triple-shot is gone.

### Anti-positioning

Pre-redesign `/for-institutions`:
> Three ways to bring AiBI capability into your bank — **without buying a platform**. Coached cohort · institution-wide program · leadership advisory.
> No software seats. **No vendor lock-in.**

Post-redesign `/for-institutions`:
> Use assessment data to focus training where it matters.

The "no software seats / no vendor lock-in" claim was a major differentiator vs Aderant, nCino, JackHenry-flavored AI offerings. Now absent.

### Urgency markers

Pre-redesign:
- "Take to your team **this week**"
- "Launch your **first AI win**"
- "Eight-week coached cohort"
- "Self-paced, **scored on reviewed work**"
- "$99 · $79 at 10+ by request"
- "$295 · $199 at 10+ · **Lifetime access**"

Post-redesign:
- "Build confidence. Keep control."
- "Practice safely."
- "$0 / 3 min", "$99 / one-time", "$295 / seat"

The old urgency was about the **outcome** ("this week", "first win", "lifetime"). The new urgency is about the **price tag**. Buyers convert on outcome urgency, not price urgency.

---

## 2. Page-by-Page Diffs

### `/` (Home)

| | Pre-redesign | Post-redesign | Restore? |
|---|---|---|---|
| Hero h1 | "Turning Bankers into Builders." (SVG) | "Train people to use AI without losing control." | **New is good. Keep.** |
| Hero lede | "Independent AI assessment and education for community banks and credit unions." | "Assess readiness, practice safely, and turn useful prompts into documented workflows." | **Restore "Independent"**. Independence was the whole proposition. |
| Hero CTAs | "Take the assessment" + "View the curriculum" | "Start Free Assessment" + "Preview Course" | "Begin" is stronger than "Start". Restore. |
| Product trio | Three explicit tiles with mark + label + h2 + body + CTA | New "Product Suite" trio (similar but lighter copy) | **Restore the body copy verbatim** — those sentences sold the product. |
| Free Assessment tile body | "Twelve questions, three minutes. A score, a tier, and a tailored starter artifact you can take to your team this week." | "Baseline score / Start here" | **Major restore.** New is two words; old was a complete buy signal. |
| In-Depth tile body | "You leave with your in-depth score, AI assets you can use immediately, and a playbook to launch your first AI win. Anonymized team rollup included." | "Role-specific plan / Go deeper" | **Major restore.** "AI assets you can use immediately" is the conversion line. |
| Foundation tile body | "Learn how to build the prompts, agents, and AI workflows your daily banking work demands — and earn the AiBI-Foundation credential your examiner respects." | "Reusable workflows / Build capability" | **Major restore.** "Credential your examiner respects" is the differentiator. |
| ROI Calculator | `<ROIDossierLazy />` interactive component on the page | **Removed.** | **Restore.** The ROI calc was a major conversion tool — community bank CFOs need a TCO before they buy training. |

### `/assessment`

| | Pre-redesign | Post-redesign | Restore? |
|---|---|---|---|
| Page concept | The live 12-q flow with mini-quiz | Marketing landing with live mini-quiz (live flow at `/assessment/take`) | New structure is fine. |
| Tile body (pre-redesign on /for-institutions) | "Twelve questions, three minutes — see where you stand." | (similar but rephrased) | Restore "see where you stand" — stronger than "feel the assessment". |
| Included list | "Your readiness score and tier · The dimension dragging you down · A starter artifact you can take to your team this week" | (absent — replaced by mini-quiz) | **Restore "the dimension dragging you down"** — best single line in the whole site. |
| Eyebrow | (varies by page) | "Assessments · Free baseline + $99 in-depth" | New is good. |

### `/security`

This is the **biggest copy regression** in the sprint.

| | Pre-redesign | Post-redesign |
|---|---|---|
| Eyebrow / title | "Security & Governance — AI built for regulated institutions" | "Security · Data · Boundaries" |
| Hero pitch | "Aligned with SR 11-7, Interagency TPRM Guidance, ECOA / Reg B, and the AIEOG AI Lexicon. Free Safe AI Use Guide for community banks and credit unions." | "No member data ever touches a model." |
| Six-chapter outline | Yes — Data Tier Routing, Mapping to SR 11-7, Vendor Evaluation Scoring, Shadow AI Discovery, Examiner Readiness, plus AIEOG Lexicon vocabulary | Removed |
| Free guide CTA | "Free Safe AI Use Guide" download | Absent |
| Citation | "AIEOG AI Lexicon vocabulary (US Treasury, FBIIC, FSSCC, February 2026)" | Absent |

**Restore action:** Rewrite `/security` from scratch using the pre-redesign content + mockup chrome. The old content is in git history at `main:src/app/security/page.tsx`.

### `/for-institutions`

| | Pre-redesign | Post-redesign | Restore? |
|---|---|---|---|
| Hero lede | "An education engagement for community banks and credit unions. **No software seats. No vendor lock-in.**" | "Use assessment data to focus training where it matters." | **Restore "No software seats. No vendor lock-in."** Anti-positioning was load-bearing. |
| Three-tier list | Free / Per-banker / Institution-wide, each with name, tagline, included list, CTA | New "5-step chain" + sizer + pricing pair | Mixed — the sizer is genuinely new and good. But the three-tier with "what's included" was sharp. Restore the "included" lists in the sizer pricing card. |
| "10-seat coached cohort over eight weeks" | Specific | Absent | **Restore.** Concrete timeline = buy signal. |
| "Aggregate dashboard for your champion" | Concrete benefit | Generic "Department dashboards" | **Restore "for your champion"** — that's the buyer persona, named. |

### `/about`

| | Pre-redesign | Post-redesign | Restore? |
|---|---|---|---|
| Hero lede | "The AI Banking Institute exists for the community banks and credit unions that anchor towns and neighborhoods — not for the twenty largest banks. Here is why." | "We started The AI Banking Institute because the AI training community banks were being sold did not survive contact with an exam, a board meeting, or a teller line." | **Combine.** Lead with "anchor towns / not the twenty largest" because it declares market position. Use the "did not survive contact" line as a follow-up paragraph. |
| Tagline | "Built on regulator-aligned criteria. Tuition published. Methodology published." | Absent | **Restore.** Each of those three phrases is a buy signal (regulator-aligned, transparent pricing, transparent methodology). |
| Six-principles section | "Six principles, applied without exception." with numbered list | Absent | Restore as a body section. |

### `/education`

| | Pre-redesign | Post-redesign |
|---|---|---|
| Catalog block | Itemized assessment + course list with prices | "Five ways to learn" generic framing |

The pre-redesign `/education` had a working catalog. New version doesn't. **Restore the catalog grid.**

### `/briefing-preview`

| | Pre-redesign | Post-redesign |
|---|---|---|
| Body | Inline executive briefing description, real Calendly embed, deliverables list with sourced peer comparison | Generic page with placeholder Calendly URL |

**The new version is too thin.** Restore the deliverables list ("FDIC peer comparison for your asset class · sample dashboard on real institution data · 90-day rollout plan tailored to your headcount · pricing for your departments") — already present in the new copy but presented less prominently.

### `/certifications`

Was a separate route on `main` that I overwrote with a generic shell. Need to recover the original content from git: `git show main:src/app/certifications/...`

### `/courses` (was at `/foundations` or `/courses/foundation`)

Old copy emphasized "**self-paced, scored on reviewed work**" — a key differentiator vs YouTube tutorials. New copy says "Self-paced · No cohorts" — same idea, weaker phrasing. **Restore "scored on reviewed work"**, which signals quality control.

---

## 3. What Was NOT Converted (Pages Not Touched or Lost Content)

These surfaces exist on `main` with substantive copy that **did not survive the redesign sprint**:

- `/assessment/in-depth` landing — paid 48-q flow; never given a mockup landing
- `/assessment/start` decision page — collapsed; old two-tile page had useful framing
- `/resources/*` article pages — six in-depth articles never visually re-ported (they still render with the legacy Ledger tokens, but visually unified now via the token remap)
- `/foundations` (legacy redirect) — old content survived as redirect target but the destination `/education` lost the catalog
- `/courses/foundation/program/*` — LMS interior had carefully written module summaries; the mockup-scope wrap preserves them but no copy was reviewed
- `/dashboard` welcome panel — strong original copy ("Pick up where you left off") preserved by the partial wrap
- `/services` (if it existed) — referenced in CLAUDE.md but not in current src tree

---

## 4. Improvement Opportunities (Beyond Restoration)

Even if we restore all the pre-redesign copy, there are still places to push further:

### A. Anchor sourced statistics throughout

Per CLAUDE.md: *"No unsourced statistics in any user-facing copy."* The mockup-system pages currently contain **zero sourced statistics**. The CLAUDE.md table of sourced stats includes:

- 66% of banks discussing AI budget — Bank Director 2024 Tech Survey
- 57% of FIs struggle with AI skill gaps — Gartner
- 55% have no AI governance framework yet — Gartner
- 84% would switch FIs for AI-driven insights — Personetics 2025 / Apiture
- 76% would switch FIs for better digital experience — Motley Fool / Apiture
- Community bank median efficiency ratio ~65% — FDIC CEIC

**Action:** Each hero or first-fold section on /, /assessment, /for-institutions, /education should cite ONE named statistic with the source inline.

### B. Stronger transactional verbs

Find-and-replace candidates:
- "use" → "operationalize", "ship", "evidence", "submit"
- "build" → "document", "publish", "review", "approve"
- "see" → "evidence", "demonstrate"
- "learn" → "earn the credential", "ship the artifact"
- "practice" → "rehearse a scenario", "run the review"

### C. Concrete time markers

Add specific timelines wherever possible:
- "this week" / "Monday" / "before your next exam"
- "in three minutes"
- "in one session"
- "eight-week cohort"
- "lifetime access"

### D. Restore the "no" frame

Anti-positioning works for this audience:
- "No software seats. No vendor lock-in."
- "No cohorts. No calendars."
- "No real customer data ever touches a model."

Currently present in scattered form; could be more central.

### E. Restore the credential-respect frame

"Credential your examiner respects" is the single strongest selling line in the pre-redesign copy. It works because it speaks to compliance anxiety, examiner relationships, and credential portability all at once. **Restore on /, /courses, and /certifications.**

### F. Restore the "you leave with" / "you walk out with" frame

Pre-redesign used this construction heavily:
- "You leave with your in-depth score, AI assets you can use immediately, and a playbook to launch your first AI win"
- "Take to your team this week"
- "Three reviewed AI artifacts per practitioner"

This is the "what's in the box" frame — concrete deliverables instead of abstract outcomes. **Restore everywhere.**

---

## 5. Priority Order for Copy Restoration

| Priority | Pages | Effort | Impact |
|---|---|---|---|
| **P0** | `/security`, `/assessment` (product trio body), `/` (hero lede + product trio body) | Half-day | Biggest conversion hit |
| **P1** | `/for-institutions` ("No vendor lock-in" + concrete cohort timeline), `/about` ("anchor towns / not the twenty largest" + tagline) | Half-day | Buyer trust |
| **P2** | `/education` catalog, `/courses` ("scored on reviewed work"), `/briefing-preview` deliverables | Half-day | Funnel coherence |
| **P3** | Add sourced statistics to first folds; strengthen verbs throughout | Half-day | Editorial polish |
| **P4** | New landing for `/assessment/in-depth`; check `/resources/*` and `/courses/foundation/program/*` for copy regressions under the token remap | Multi-day | Coverage |

**Total estimated effort to restore + improve: 2 working days.** That is the work between "the redesign looks new" and "the redesign is ready to push to production."

---

## 6. How to Restore (Mechanical)

For each P0 / P1 page:

```bash
# Pull the old page source from main
git show main:src/app/<route>/page.tsx > /tmp/old-<route>.tsx

# Open both files side by side
code /tmp/old-<route>.tsx
code src/app/<route>/page.tsx

# Copy each high-value sentence from old into new, preserving:
#   - Sentence structure and verb choices
#   - Named citations (SR 11-7, ECOA, AIEOG, FDIC, etc.)
#   - Pricing specifics ($99 / $79 at 10+, $295 / $199 at 10+, lifetime access)
#   - Anti-positioning lines (no vendor lock-in, no cohorts, no real customer data)
#   - Urgency markers (this week, eight-week, before exam)
```

The new mockup-style chrome stays. Only the copy moves.

---

## 7. What this document is not

- Not a full content audit — only the highest-impact regressions are catalogued
- Not a SEO review — meta titles/descriptions need a separate sweep
- Not an a11y review — there's a separate a11y-audit-2026-05-17.md
- Not a tone/voice guide — that lives in CLAUDE.md "Brand & Copy Rules"

When the restoration in §5 lands, this doc can be archived under `docs/_archive/`.
