# 08 — What's Different from the Current Live Site

**Date:** 2026-05-07
**Branch:** `design-2.0`
**Purpose:** Track every place the design-2.0 surface diverges from what's live on `main`. Not all divergences are mistakes — some are intentional brand moves; some are placeholder content awaiting real copy. This doc keeps the divergences explicit so nothing slips into "shipped" status without the founder seeing it.

Each entry is tagged:

| Tag | Meaning |
|---|---|
| **INTENT** | Deliberate brand change. Will stay. |
| **PLACEHOLDER** | Drafted text or content that needs the founder's real copy before merge. |
| **TBD** | Decision needed before merge — flagged for the founder to choose. |
| **FIXED** | Was a problem; now resolved on `design-2.0`. |

---

## Brand voice & framing

### Homepage hero
- **CURRENT:** "Teach your team how to use AI safely at work." — centered, max-w-4xl, one CTA.
- **NEW:** "Turning bankers into *builders.*" — left-aligned editorial hero, terra accent on "builders," lede paragraph, primary + secondary CTAs.
- **TAG:** **INTENT.** The institute brief lists "Turning Bankers into Builders" as the canonical tagline; the new hero reflects it directly. The previous "teach your team" headline read more like a HR-training tool than an Institute.

### Homepage "How it works"
- **CURRENT:** 4-card icon grid (Assess · Learn · Practice · Apply) with line-icon SVGs.
- **NEW:** TransformationArc — three editorial stages: *the banker → the practitioner → the builder*, with attribute lists and arrow connectors.
- **TAG:** **INTENT.** Replaces feature-grid SaaS pattern with a transformation narrative. The mission rendered as content.

### Homepage CTA bands
- **CURRENT:** Three "Take the Assessment" CTAs on one page (top hero, middle band after stats, bottom terra-bleed).
- **NEW:** One in the hero, one in the dark closing band, one persistent in the header. The middle CTA is gone.
- **TAG:** **INTENT.** Editorial discipline; one closing CTA is enough.

### About page
- **CURRENT:** "There is a banker somewhere right now who has been doing the same thing every Tuesday morning for six years." Original prose preserved.
- **NEW:** Same hero. Body copy preserved verbatim. Adds: dark mission pull-quote, 6-principle grid, dark contact strip, founder marginalia card.
- **TAG:** **INTENT.** Founder narrative is intact; supporting structure added.

---

## Information architecture

### Routes renamed
| Old | New | Status |
|---|---|---|
| `/courses/aibi-p` | `/education/practitioner` | **TBD.** Permanent redirect added in `next.config.mjs`; actual page move scheduled for Wave D. |
| `/courses/aibi-s` | `/education/specialist` | Same. |
| `/courses/aibi-l` | `/education/leader` | Same. |
| `/courses/aibi-p/[module]` | `/education/practitioner/m/[module]` | Same; `m/` prefix prevents future slug collisions. |
| `/certifications/exam/aibi-p` | `/education/practitioner/exam` | Same. |
| `/resources` | `/research` | **PARTIALLY DONE.** `/research` ships; individual essays still at `/resources/<slug>` until Wave E migrates them to MDX. |
| `/resources/<slug>` | `/research/<slug>` | Held until each essay is converted. |

**TAG:** **INTENT.** Cleaner tree; `/education` is the catalog hub the brand calls itself; `/research` matches the v4 "research shop" voice.

### New routes added
- `/research` — essay archive landing, lists all essays (MDX + legacy)
- `/research/[slug]` — MDX essay route

### Routes preserved
Everything else: `/`, `/about`, `/education`, `/for-institutions`, `/security`, `/assessment`, `/results/[id]`, `/auth/*`, `/dashboard/*`, etc.

---

## Color & typography

### Color tokens
- **CURRENT:** `globals.css` has terra/sage/cobalt/amber/ink/parch/linen/slate/dust/error tokens.
- **NEW:** Same tokens preserved. Promoted from per-page arbitrary-value usage (`bg-[color:var(--color-terra)]`) to Tailwind theme bindings (`bg-terra`).
- **TAG:** **INTENT.** No color changes; only the access pattern changed.

### Typography
- **CURRENT:** Cormorant Garamond + Cormorant SC + DM Sans + DM Mono loaded.
- **NEW:** Same fonts. Added a documented type scale (`text-display-xl` through `text-label-sm`) bound to tokens.
- **TAG:** **INTENT.**

### Pillar discipline
- **CURRENT:** Loose. Color tokens are documented but not enforced; pages can write any pillar color anywhere.
- **NEW:** `<PillarCard>` and other primitives accept a typed `pillar?: Pillar` prop and resolve color via `PILLAR_COLORS` map. Free-form color escape hatch is gone.
- **TAG:** **INTENT.**

---

## Placeholder content drafted by the system that needs real copy

These were drafted as scaffolding and need the founder to either replace with real copy or keep as-is. Until then they're hidden, removed, or labeled.

### Founder bio — **PLACEHOLDER (HIDDEN)**
- **What I drafted:** "Twenty years working alongside community-bank operators on technology, risk, and member experience. Founded the Institute after watching the same team try to absorb four AI vendor pitches in a quarter and lose the plot."
- **Status:** Removed. `BRAND.founder.bio` is empty string in `content/copy/index.ts`. The `/about` page conditionally renders the bio block — empty string hides it. Founder name + role still appear.
- **Action needed:** Founder writes real bio; drop into `content/copy/index.ts`.

### "340+ subscribers" newsletter proof — **PLACEHOLDER (REMOVED)**
- **What I drafted:** "Subscribers at 340+ US community institutions" on the footer NewsletterCard.
- **Status:** Removed. The footer NewsletterCard now reads only "Fortnightly research on community-bank AI adoption."
- **Action needed:** When the brief has real subscribers, replace with sourced figure.

### Example essay (`the-ai-use-case-inventory.mdx`) — **PLACEHOLDER (UNREGISTERED)**
- **What I drafted:** A 14-min essay on AI use-case inventory governance.
- **Fabrications inside it:**
  - "five regional examiners over the past six months" — invented research provenance
  - "between nine and fourteen AI-touched workflows running" — invented sample range
  - Marginalia quote attributed to "risk officer at a $1.2B community bank, March 2026" — fabricated
- **Status:** Removed from `ESSAYS` registry. The MDX file still exists in the repo as a *system demo* (it documents the MDX content pattern for future essays) but is not published. `/research` lists only the 6 legacy essays at `/resources/<slug>`.
- **Action needed:** If the user wants real essays in MDX, write them and add to the registry. Otherwise the file can be deleted and the registry rule (essays must be founder-written) enforced going forward.

### Curriculum tools / skills — **PLACEHOLDER**
- **What I drafted in `content/curriculum/tools.ts` and `content/curriculum/skills.ts`:**
  - 5 tools: Claude/ChatGPT, Microsoft Copilot, your bank's AI gateway, vendor AI in core/LOS/fraud, the use-case inventory tool
  - 6 skills: prompt for verifiable output, contain hallucination, apply boundary safety, map to SR 11-7/TPRM, author the use-case inventory, build role-specific workflows
- **Status:** Drafted from the v4 mockups, not from the actual `content/courses/aibi-p/` curriculum data. Does not yet match the real 12-module course content (modules.ts, v4-expanded-modules.ts).
- **Action needed:** Either (a) read `content/courses/aibi-p/v4-expanded-modules.ts` and rewrite the tools/skills lists to match, or (b) remove the tools/skills sections entirely from `/for-institutions` until they can be derived from the real curriculum data.

### Practitioner module list on the new `<ProgramPage>` doc — **PLACEHOLDER**
- **What I drafted:** A 9-module curriculum table in `docs/superpowers/design-system/05-templates.md` example.
- **Status:** Documentation-only example. The real `<ProgramPage>` consumer (`/education/practitioner`, when migrated in Wave D) will read from `content/courses/aibi-p/modules.ts` (12 modules, not 9).
- **Action needed:** Wave D LMS migration uses the real module count.

### Sample alumna quote — **REMOVED**
- **What I drafted in v4 mockup:** "I came in handling exceptions. I left with a working AI workflow my compliance officer signed off on the same week." — attributed to "Sample alumna · community bank, $480M assets · AiBI-Practitioner · Cohort 01"
- **Status:** Never made it into shipped pages — was only in brainstorming HTML mockups. No action needed.

### Aggregate dashboard sample numbers — **REMOVED**
- **What I drafted in v4 mockup:** "Sample Bank, FSB · N=47 practitioners assessed" with 8 dimensional scores like "Governance 2.3/4."
- **Status:** Was only in brainstorming HTML mockups; not in shipped `/for-institutions`. The current `/for-institutions` aggregate-dashboard preview is **not yet built** in the new system. When it is, it should use real or clearly-labeled "sample" data.

### Advisor roster — **REMOVED**
- **What I drafted in v4 mockup:** Four monogram-portrait tiles ("AC, RM, JK, DF") with placeholder names and roles.
- **Status:** Never made it into shipped `/about`. The `/about` page in design-2.0 has no advisor section.
- **Action needed:** When real advisors exist with consent to attribute, add a section.

---

## What's been removed from the live site

### Plausible queue init — **PRESERVED**
The deferred-call pattern from the original `layout.tsx` is preserved exactly.

### Coming-soon mode — **PRESERVED**
`COMING_SOON` env-gated chromeless behavior is preserved.

### Print stylesheet — **PRESERVED**
Moved from inline in `globals.css` to `src/styles/print.css`; behavior unchanged.

### Section components — **PRESERVED**
`HomeContextStrip`, `InteractiveSkillsPreview`, `ROICalculator`, `ROICalculatorBody`, `SampleQuestion` still exist. The new homepage no longer imports `HomeContextStrip` or `InteractiveSkillsPreview`. The migration plan (Wave G) catalogs which can be deleted after the full migration.

---

## Things to verify before merge

A short pre-merge checklist drawn from the work above:

- [ ] Founder bio either provided or kept hidden
- [ ] No fabricated statistics anywhere on the public site (the citations registry catches new ones; existing pages need a one-time grep)
- [ ] Tools / Skills lists either bound to the real curriculum or removed
- [ ] Aggregate-dashboard preview on `/for-institutions` either built with real data or labeled "Sample"
- [ ] All 6 legacy essays either migrated to MDX with real content or kept at `/resources/<slug>`
- [ ] LMS tree migrated (Wave D) — real module count from `content/courses/aibi-p/`
- [ ] No "AiBI-S" / "AiBI-L" tile claims a launch date that doesn't exist yet
- [ ] Phrase audit (`grep -rE '340\+|five regional examiners|community bank, \$|past six months' src/ content/`) returns zero matches outside this doc and the unregistered example MDX

---

## How to use this doc

When you spot drafted content that doesn't reflect the institute, add it here under the appropriate tag. When the founder provides real copy, update the entry to **FIXED** (or delete it once both `main` and `design-2.0` agree).

This doc is the seam between "what the brand is right now" and "what the design system can render once given real content."
