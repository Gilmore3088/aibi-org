# 05 — Page Templates

**Date:** 2026-05-07
**Branch:** `design-2.0`
**Files:** `src/components/system/templates/*` + LMS/diagnostic specialized primitives in `src/components/system/lms/*` and `src/components/system/diagnostic/*`.

Six page archetypes cover every public page in the site. Pages provide structured content as props; templates make the layout decisions. Adding a new program is a content config + a one-line `<ProgramPage {...config} />` call — never new layout work.

---

## Import contract

```ts
import {
  MarketingPage,
  EssayPage,
  ProgramPage,
  LMSPage,
  DiagnosticPage,
  ResultsPage,
} from "@/components/system/templates";
```

The shared chrome (`<SiteNav>`, `<SiteFooter>`) is rendered by `app/layout.tsx`, not by templates. Templates focus on the content shape inside `<main>`.

---

## 1. `<MarketingPage>` — public marketing archetype

Used by `/`, `/about`, `/for-institutions`, `/security`, `/education`.

Composes:

1. **Editorial hero** — left-aligned. Eyebrow → serif H1 → optional italic tagline → lede → primary CTA + secondary CTA. Optional aside slot for marginalia, founder card, or quote.
2. **Optional KPI ribbon** under the hero (sourced metrics).
3. **Body sections** — passed in as `children`. Each section the page composes from primitives (`<TransformationArc>`, `<CertificationLadder>`, `<DimensionGrid>`, etc.) wrapped in `<Section variant=...>`.
4. **Optional closing CTA** on a dark band.

```tsx
<MarketingPage
  hero={{
    eyebrow: "A proficiency standard for community banking",
    title: <>Turning bankers into <em>builders.</em></>,
    lede: "An education company for community banks and credit unions...",
    primaryCta: { href: "/assessment/start", label: "Begin the readiness assessment" },
    secondaryCta: { href: "/education", label: "View the curriculum" },
    aside: <Marginalia label="Practitioner">{...}</Marginalia>,
  }}
  kpis={[
    { label: "Curriculum", value: "9 modules", delta: "~12 hrs", desc: "..." },
    ...
  ]}
  closing={{
    title: "Start with the assessment.",
    body: "In a few minutes you'll know your readiness level...",
    cta: { href: "/assessment/start", label: "Take the assessment" },
  }}
>
  <Section variant="linen"><SectionHeader number="01" .../><TransformationArc .../></Section>
  <Section variant="dark"><ROICalculator /></Section>
</MarketingPage>
```

The `<em>` inside the H1 turns terra (the brand-emphasis treatment).

---

## 2. `<EssayPage>` — research essay archetype

Used by every `/research/[slug]`. Renders MDX content in a narrow reading column.

Composes:

1. **Back-link** to the archive ("← The AI Banking Brief").
2. **Hero** — category eyebrow, serif H1, italic dek, `<EssayMeta>` line, optional author.
3. **Body** — `children` rendered with prose styling (Tailwind typography).
4. **Sources block** on parch — numbered list with mono labels and optional links.
5. **Newsletter card** at the close on parch-dark.

```tsx
<EssayPage
  title="The AI use-case inventory is the cheapest examiner-readiness move..."
  dek="Most community institutions already have nine to fourteen AI-touched workflows running..."
  date="2026-04-24"
  category="Governance"
  readMinutes={14}
  author="James Gilmore"
  sources={[
    { label: "AIEOG AI Lexicon · Treasury / FBIIC / FSSCC, Feb 2026", url: "https://..." },
    ...
  ]}
>
  {/* MDX body — H2/H3, KPIRibbons, EditorialQuotes, paragraphs */}
</EssayPage>
```

---

## 3. `<ProgramPage>` — program detail archetype

Used by `/education/practitioner`, `/education/specialist`, `/education/leader`. Same template renders any program; content comes from `content/courses/<slug>/`.

Composes:

1. **Pillar-stripe hero** — 4px stripe in the program's pillar color → level eyebrow → serif H1 (program code) → italic designation → optional tagline → lede → primary/secondary CTAs. Right-side **price card** with mono amount + DefinitionList of facts.
2. **KPI ribbon** of program facts (Format / Effort / Outcome / Aligned-with).
3. **§01 Outcomes** — two-column list of "What you'll be able to do" with terra dashes.
4. **§02 Curriculum** — full-width module table on parch with mono numbers and minute counts.
5. **§03 Capstone** — dark band with three artifact cards.

```tsx
<ProgramPage
  code="AiBI-Practitioner"
  designation="Banking AI Practitioner · The AI Banking Institute"
  level="01 · Foundational"
  pillar="application"
  lede="Working AI literacy for everyone inside a community bank..."
  facts={[
    { label: "Format", value: "Self-paced", delta: "Online, lifetime" },
    { label: "Effort", value: "~12 hrs", delta: "9 modules" },
    { label: "Outcome", value: "3 artifacts", delta: "peer & instructor reviewed" },
    { label: "Aligned with", value: "SR 11-7 · TPRM", delta: "ECOA · AIEOG" },
  ]}
  outcomes={["Choose the right prompt strategy for the job", ...]}
  modules={[
    { number: 1, title: "What AI is, and what it isn't", summary: "...", minutes: 60 },
    ...
  ]}
  artifacts={[
    { slug: "drafting", title: "A reviewed draft", description: "..." },
    ...
  ]}
  priceCard={{
    heading: "Tuition",
    amount: "$295",
    per: "per practitioner, lifetime access",
    facts: [
      { label: "Team rate", value: "$199", mono: true },
      { label: "Threshold", value: "10+ seats" },
      ...
    ],
  }}
  primaryCta={{ href: "/education/practitioner/purchase", label: "Enroll — $295" }}
  secondaryCta={{ href: "/assessment/start", label: "Take the free assessment first" }}
/>
```

---

## 4. `<LMSPage>` — module/lesson interior archetype

Used by `/education/practitioner/m/[module]` and equivalent for AiBI-S/L.

Composes (3-rail layout on `lg:`, single-column on mobile):

1. **`<ProgressStrip>`** — dark course bar with title, % complete, mono progress bar, resume link.
2. **`<ModuleNavigator>`** (left rail, 280px) — all modules with state (complete/current/upcoming/locked); current expands to show sub-lessons with active marker.
3. **Lesson body** (center, fluid) — `children` with `<LMSPage.Lesson>` convenience subcomponent providing breadcrumb / title / meta-pills / body slot.
4. **`<LessonResources>`** (right rail, 280px) — tools mini-card, downloads list, optional dark citation pull quote.

```tsx
<LMSPage
  progress={{ courseTitle: "AiBI-Practitioner", designation: "Foundational Credential", completed: 3, total: 9, resumeHref: "..." }}
  modules={[
    { number: 1, title: "What AI is, and what it isn't", state: "complete", href: "..." },
    { number: 2, title: "Boundary safety", state: "complete", href: "..." },
    { number: 3, title: "Prompting as a banker", state: "current", href: "...",
      lessons: [
        { id: "3.1", title: "Why prompts matter", state: "complete", href: "..." },
        { id: "3.3", title: "Verifiable outputs", state: "current" },
        ...
      ] },
    { number: 4, title: "Drafting and reviewing", state: "upcoming", minutesLabel: "75 min" },
    { number: 8, title: "Capstone", state: "locked" },
  ]}
  resources={{
    tools: [{ name: "Claude or ChatGPT", note: "for verifiable-output patterns" }],
    resources: [{ type: "PDF", title: "Banker prompt patterns · v3", href: "..." }],
    citation: { text: "Verifiability is the single most important property...", source: "Module 03 reading" },
  }}
>
  <LMSPage.Lesson
    breadcrumb="Module 03 · Prompting · Lesson 3.3 · Verifiable outputs"
    title="Verifiable outputs — making AI answers your compliance officer can sign off on."
    meta={["Lesson 3.3", "Reading · 8 min", "+ video · 12 min"]}
  >
    {/* lesson MDX body */}
  </LMSPage.Lesson>
</LMSPage>
```

### LMS specialized primitives

These live next to the LMS template (not in the global primitive barrel) because they only appear inside this template:

- `<ProgressStrip>` (`src/components/system/lms/ProgressStrip.tsx`)
- `<ModuleNavigator>` (`src/components/system/lms/ModuleNavigator.tsx`)
- `<LessonResources>` (`src/components/system/lms/LessonResources.tsx`)

If a second template needs them, promote to the global primitive barrel.

---

## 5. `<DiagnosticPage>` — assessment in-flow archetype

Used by `/assessment` per question. The questions iterate via the page; the template renders one question at a time.

Composes:

1. **Parch-dark progress strip** — "Question 04 of 08" mono counter + bar + optional "Save & continue" link.
2. **`<QuestionFrame>`** — main column with dimension label / question / 4 ranked answers; right column with "Why this question" panel and optional citation.
3. **Action row** — back link + Continue button.
4. **Footer caption** with privacy note + running tally.

The selection state is owned by the parent page; the template is presentational.

```tsx
<DiagnosticPage
  questionNumber={4}
  totalQuestions={8}
  dimensionLabel="Dimension 02 · Governance & Use-Case Inventory"
  question="Does your institution maintain a documented inventory of its AI use cases..."
  answers={[
    { id: "a", score: 1, label: "No inventory exists.", detail: "..." },
    { id: "b", score: 2, label: "Informal list, kept by one person.", detail: "..." },
    { id: "c", score: 3, label: "Formal inventory, not actively maintained.", detail: "..." },
    { id: "d", score: 4, label: "Maintained inventory, governance-reviewed.", detail: "..." },
  ]}
  selectedId={selected}
  onSelect={setSelected}
  why={{
    heading: "Examiners increasingly ask for an AI use-case inventory before they ask anything else.",
    body: "The interagency guidance treats AI as model risk and third-party risk simultaneously...",
    citation: { text: "Defines AI use case inventory as a foundational governance practice...", source: "AIEOG AI Lexicon · Treasury / FBIIC / FSSCC, Feb 2026" },
  }}
  prevHref="/assessment?q=3"
  onNext={() => advance()}
  nextDisabled={!selected}
  runningScore={7}
  runningMax={32}
  saveAndContinueHref="/assessment/save"
/>
```

### Diagnostic specialized primitive

- `<QuestionFrame>` (`src/components/system/diagnostic/QuestionFrame.tsx`)

---

## 6. `<ResultsPage>` — assessment results archetype

Used by `/results/[id]`. The conversion deliverable.

Composes:

1. **Dark header strip** — run-date + owner-bound URL `/results/r-7d3b9a · private · owner-bound`.
2. **3-column hero** — `<ScoreRing>` | tier headline + diagnostic | tier card with action list.
3. **§01 — `<DimensionGrid>`** of 8 scored dimensions, each with bar, comment, optional act-first/strength tag.
4. **§02 — Starter artifact** on dark band — preview pane on the left (with content fade-out at the bottom), download list + optional briefing card on the right.
5. **§03 — Three paths forward** — individual / team / institution next-step grid.

```tsx
<ResultsPage
  resultId="r-7d3b9a"
  runDate="2026-04-27"
  score={24}
  headline={<>You're <em>building momentum.</em></>}
  diagnostic="You scored 24 of 32 across the eight dimensions..."
  heroActions={[
    { label: "Download PDF report", href: "...", tone: "primary" },
    { label: "Share with colleague", href: "...", tone: "secondary" },
    { label: "Re-run in 90 days", href: "...", tone: "secondary" },
  ]}
  dimensions={[...8 entries]}
  artifact={{
    title: "AI use-case inventory template, drafted for your tier.",
    meta: "For: community bank · Building Momentum tier · v1.2",
    leadParagraph: "...",
    purposeList: [...],
    downloads: [{ type: "DOCX", label: "Editable template", href: "..." }, ...],
    briefing: { heading: "Walk through it with us", body: "...", cta: { href: "...", label: "Schedule" } },
  }}
  nextSteps={[...]}
/>
```

The `<em>` inside `headline` turns terra automatically.

---

## 7. Template ↔ archetype mapping

| Live route | Template | Notes |
|---|---|---|
| `/` | `<MarketingPage>` | Hero + transformation arc + ROI + KPI ribbon + assessment-CTA |
| `/about` | `<MarketingPage>` | Hero + mission band + principles grid + advisors + contact |
| `/security` | `<MarketingPage>` | Pillar B (cobalt) — sage/cobalt discipline check |
| `/education` | `<MarketingPage>` (catalog hub) | Hero + free-classes section + `<CertificationLadder>` |
| `/for-institutions` | `<MarketingPage>` | Hero + value-prop band + tiers + tools/skills + agg dashboard + pilot |
| `/research` | `<MarketingPage>` (variant) | Hero + featured + `<EssayArchive>` |
| `/research/[slug]` | `<EssayPage>` | MDX body |
| `/education/practitioner` | `<ProgramPage>` | All program content from `content/courses/aibi-p/` |
| `/education/specialist` | `<ProgramPage>` | From `content/courses/aibi-s/` |
| `/education/leader` | `<ProgramPage>` | From `content/courses/aibi-l/` |
| `/education/practitioner/m/[module]` | `<LMSPage>` | Module data from courses content |
| `/assessment` | `<DiagnosticPage>` | Question state owned by page |
| `/results/[id]` | `<ResultsPage>` | Score + breakdown + artifact + next-steps |

Every other route either reuses one of these templates (sub-pages of programs) or is a utility page (auth, legal, verify) that uses primitives directly without a template.

---

## 8. Type-check guarantee

`npx tsc --noEmit` is clean against Phase 05 as committed. All template props are typed; all dependencies on primitives use the typed barrel exports.
