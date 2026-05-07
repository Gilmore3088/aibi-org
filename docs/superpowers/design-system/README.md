# AiBI Design System (design-2.0)

A wholesale rebuild of the AI Banking Institute brand surface as a unified, modular, scalable system. Started 2026-05-06 on branch `design-2.0`.

---

## Read order

| # | Doc | Purpose |
|---|---|---|
| 01 | [Reconciliation](./01-reconciliation.md) | What was already shipping vs. what needed to change |
| 02 | [Information Architecture](./02-information-architecture.md) | The clean route tree the Institute will scale on |
| 03 | [Design Tokens (DESIGN.md)](./03-tokens.md) | Intent-bound color, type, spacing, motion contract |
| 04 | [Primitives & Composites](./04-primitives.md) | The 17 reusable components every page composes from |
| 05 | [Page Templates](./05-templates.md) | Six archetypes that render every page |
| 06 | [Content as Data](./06-content-model.md) | Citations, copy, curriculum, essays — all data-driven |
| 07 | [Migration Plan](./07-migration-plan.md) | Wave-by-wave runbook; what's shipped, what's next |

---

## Architecture

```
┌─ Tokens ──────────────────────────────────────────────────────┐
│  src/styles/tokens.css      CSS variables (runtime SoT)       │
│  src/lib/design-system/tokens.ts   typed TS exports + helpers │
│  tailwind.config.ts         brand utilities (bg-terra,        │
│                              text-ink, font-serif, etc.)       │
└────────────────────────────────────────────────────────────────┘
           ▲
           │ propagate by name
           │
┌─ Primitives ──────────────────────────────────────────────────┐
│  src/components/system/                                        │
│    Section, SectionHeader, KPIRibbon, PillarCard,             │
│    DefinitionList, TrustStrip, Marginalia, EditorialQuote,    │
│    ScoreRing, EssayMeta, Cta                                  │
│                                                                │
│  + composites:                                                 │
│    TransformationArc, CertificationLadder, DimensionGrid,     │
│    EssayArchive, NewsletterCard                                │
│                                                                │
│  + chrome:  SiteNav, SiteFooter                                │
│  + lms/:    ProgressStrip, ModuleNavigator, LessonResources    │
│  + diagnostic/:  QuestionFrame                                 │
└────────────────────────────────────────────────────────────────┘
           ▲
           │ compose into
           │
┌─ Templates ───────────────────────────────────────────────────┐
│  src/components/system/templates/                              │
│    MarketingPage, EssayPage, ProgramPage,                     │
│    LMSPage, DiagnosticPage, ResultsPage                       │
└────────────────────────────────────────────────────────────────┘
           ▲
           │ instantiate with
           │
┌─ Content ─────────────────────────────────────────────────────┐
│  content/                                                      │
│    citations/      sourced statistics                          │
│    copy/           brand copy + principles + CTAs              │
│    curriculum/     tools + skills                              │
│    regulations/    SR 11-7 / TPRM / ECOA / AIEOG               │
│    essays/         MDX essays + legacy stubs                   │
│    courses/        program data (preserved)                    │
│    assessments/    question banks + scoring (preserved)        │
│    institutions/   tier definitions (preserved)                │
│    advisory/       advisory engagements (preserved)            │
│    email-sequences/  drip emails per tier (preserved)          │
│    practice-reps/  practice rep data (preserved)               │
│    sandbox-data/   sandbox demo (preserved)                    │
└────────────────────────────────────────────────────────────────┘
           ▲
           │ drives
           │
┌─ Pages ───────────────────────────────────────────────────────┐
│  src/app/                                                      │
│    page.tsx → MarketingPage(content from @content/copy)        │
│    about/page.tsx → MarketingPage                              │
│    research/page.tsx → MarketingPage + listAllEssays()         │
│    research/[slug]/page.tsx → EssayPage(loadEssay(slug))       │
│    education/page.tsx → MarketingPage + CertificationLadder    │
│    for-institutions/page.tsx → MarketingPage + tools/skills    │
│    security/page.tsx → bespoke cobalt + Sections               │
│    ...                                                         │
└────────────────────────────────────────────────────────────────┘
```

---

## Brand discipline (non-negotiable)

| Rule | Why |
|---|---|
| **Pillar colors stay in their pillar** | Sage = Awareness only; Cobalt = Understanding/security only; Amber = Creation only; Terra = Application + brand. Mixing dissolves curriculum logic. |
| **No hex literals in components or pages** | Tokens propagate by name. `bg-terra`, never `bg-[#b5512e]`. |
| **No drop shadows** | Editorial discipline. Where elevation matters, use a hairline. |
| **No gradients** | Same. |
| **No backdrop-blur** | Same. |
| **No border-radius > 2px** | Sharp edges = institutional. Rounded = SaaS. The brand is institutional. |
| **No Inter / Roboto / system-ui as primary** | Cormorant Garamond, Cormorant SC, DM Sans, DM Mono only. |
| **Sourced numbers only** | Every stat references `content/citations/`. No marketing figures. |
| **Mono numbers, tabular** | `font-variant-numeric: tabular-nums` on every numeric display. |
| **Italic Cormorant for warmth, never DM Sans italic** | Italic is the editorial-emphasis lever; sans body never italicizes. |

---

## Status

- ✅ Tokens shipped (Phase 03)
- ✅ Primitives shipped (Phase 04)
- ✅ Templates shipped (Phase 05)
- ✅ Content infrastructure shipped (Phase 06)
- 🔄 Migration in progress (Phase 07) — see [07-migration-plan.md](./07-migration-plan.md)
  - ✅ Wave A: homepage, about, research
  - ✅ Wave B: for-institutions, education, security
  - ⏸ Wave C: assessment funnel
  - ⏸ Wave D: LMS tree (`/courses/aibi-p` → `/education/practitioner`)
  - ⏸ Wave E: 6 essay MDX conversions
  - ⏸ Wave F: auth + dashboard + toolbox style passes
  - ⏸ Wave G: cleanup (delete legacy chrome)
