# design-2.0 — Status

**Updated:** 2026-05-08
**Branch:** `design-2.0` (worktree at `~/Projects/aibi-design-2.0`)
**Commits ahead of `main`:** 18
**Files changed:** 68 (+9,815 / −1,360)
**Pushed:** No. Local only. **Not merged to `main`.**

---

## What this branch is

A wholesale rebuild of the AI Banking Institute brand surface as a unified, modular, scalable system. Started 2026-05-06 from `main` at `4587c19`. Tokens → Primitives → Templates → Content → Pages, with each layer documented in `docs/superpowers/design-system/`.

The branch will not be merged until the founder reviews remaining waves and approves.

---

## Foundation (complete)

| Phase | Status | Output |
|---|---|---|
| 01 — Reconciliation | ✅ | `01-reconciliation.md` — what was already shipping vs. what changed |
| 02 — Information architecture | ✅ | `02-information-architecture.md` — clean route tree, rename map |
| 03 — Design tokens | ✅ | `03-tokens.md` (DESIGN.md format) + `src/styles/tokens.css` + `src/lib/design-system/tokens.ts` + `tailwind.config.ts` |
| 04 — Primitives | ✅ | `04-primitives.md` + 17 React components in `src/components/system/*` |
| 05 — Templates | ✅ | `05-templates.md` + 6 page archetypes + 4 specialized primitives |
| 06 — Content as data | ✅ | `06-content-model.md` + new modules: `citations/`, `copy/`, `curriculum/`, `regulations/`, `essays/` |

### Component inventory

**Atomic primitives (10) — `src/components/system/`**
`Section` · `SectionHeader` · `KPIRibbon` · `PillarCard` · `DefinitionList` · `TrustStrip` · `Marginalia` · `EditorialQuote` · `ScoreRing` · `EssayMeta`

**Composites (5)**
`TransformationArc` · `CertificationLadder` · `DimensionGrid` · `EssayArchive` · `NewsletterCard`

**Site chrome (2)**
`SiteNav` (replaces `Header`) · `SiteFooter` (replaces `Footer`)

**Cta primitive**
`Cta` (button-as-link, primary / secondary, light / dark tone)

**Templates (6) — `src/components/system/templates/`**
`MarketingPage` · `EssayPage` · `ProgramPage` · `LMSPage` · `DiagnosticPage` · `ResultsPage`

**LMS specialized — `src/components/system/lms/`**
`ProgressStrip` · `ModuleNavigator` · `LessonResources`

**Diagnostic specialized — `src/components/system/diagnostic/`**
`QuestionFrame`

**Section components (homepage)**
`ROIDossier` (new editorial replacement for `ROICalculator`)

### Content registry shipped

| Module | Purpose |
|---|---|
| `content/regulations/` | SR 11-7 / TPRM / ECOA / AIEOG — single source for `<TrustStrip>` |
| `content/citations/` | Sourced statistics registry; `citationAsKPI()` helper |
| `content/copy/` | `BRAND`, `PRINCIPLES`, `CTAS` — taglines & founder copy |
| `content/curriculum/tools.ts` | 6 real platforms from the AiBI Foundations curriculum |
| `content/curriculum/skills.ts` | 11 verb-stated skills derived from module takeaways |
| `content/essays/` | MDX support + frontmatter types + registry |

---

## Migration (Phase 07) — in progress

### Wave A — high-visibility public pages (✅ shipped)

| Route | Template | File |
|---|---|---|
| `/` | `MarketingPage` | `src/app/page.tsx` |
| `/about` | `MarketingPage` | `src/app/about/page.tsx` |
| `/research` | `MarketingPage` (variant) | `src/app/research/page.tsx` |
| `/research/[slug]` | `EssayPage` | `src/app/research/[slug]/page.tsx` |

`src/app/layout.tsx` swapped `<Header>` / `<Footer>` for `<SiteNav>` / `<SiteFooter>`. Coming-soon chromeless logic preserved.

### Wave B — catalog + research + governance (✅ shipped)

| Route | Template / approach | File |
|---|---|---|
| `/education` | `MarketingPage` + `CertificationLadder` | `src/app/education/page.tsx` |
| `/for-institutions` | `MarketingPage` + value-prop band + tools/skills | `src/app/for-institutions/page.tsx` |
| `/security` | bespoke cobalt hero + `Section` primitives | `src/app/security/page.tsx` |

### Wave C — assessment funnel (🔶 partial)

| Route / surface | Status |
|---|---|
| `QuestionCard` chrome | ✅ rebuilt on design system (editorial header, hairline-ruled answer rows with mono scores, auto-advance + accessibility preserved verbatim) |
| `ProgressBar` | ▫ unchanged (already a thin token-driven hairline) |
| `ResultsViewV2` (602 LOC) | ⏸ untouched — score ring, dimensional breakdown, email gate, PDF download all on old chrome |
| `EmailGate` (376 LOC) | ⏸ untouched |
| `/results/[id]` (renders `ResultsViewV2`) | ⏸ untouched |

### Wave D — LMS tree (`/courses/aibi-p` → `/education/practitioner`) (⏸ not started)

~14 sub-routes touched. Scope and per-file plan documented in `07-migration-plan.md`. Permanent redirects added in `next.config.mjs`; pages not yet moved.

### Wave E — essay MDX conversions (⏸ not started)

6 essays still rendered as bespoke pages under `/resources/<slug>/`. Listed in `LEGACY_ESSAYS` registry so `/research` archive shows them with `/resources/<slug>` hrefs.

The example MDX (`content/essays/the-ai-use-case-inventory.mdx`) is intentionally **unregistered** — it was a system demo that contained fabricated specifics ("five regional examiners", invented sample sizes). Real essays go through MDX when written.

### Wave F — auth, dashboard, toolbox (⏸ not started)

`/auth/*`, `/dashboard`, `/dashboard/progression`, `/dashboard/toolbox/*`, `/practice/[id]`, `/prompt-cards`, `/verify/[id]`. Style passes scheduled.

### Wave G — cleanup (⏸ not started)

Delete legacy `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, unused `sections/` components after final migration.

---

## Recent fixes (last 7 commits)

| Commit | What |
|---|---|
| `bff985f` | ROI result cells were overflowing into each other (mid case at `display-lg` was 8 chars wider than its 1/3 cell). Now uniform `display-sm` across all three; mid case anchors via parch wash + terra label only. |
| `2413283` | `QuestionCard` editorial rebuild on design-2.0 system. Auto-advance + radiogroup accessibility preserved verbatim. |
| `52aa103` | Hero "facts plate" aside (sourced industry statistics in masthead format) + new `ROIDossier` replacing the homepage `ROICalculator`. |
| `eee01c3` | AiBI-S/AiBI-L spelled out as headings; "Foundational" → "Practitioner" level; module count corrected to 12; "View the curriculum" CTA → `/courses/aibi-p`. |
| `a6e9050` | Removed footer trust strip; fixed ROI double-wrap bug; added Marginalia aside to `/for-institutions` hero. |
| `3549307` | Curriculum tools/skills lists bound to real `content/courses/aibi-p/` data (was drafted from v4 mockups). 6 real platforms with vendor + module backreferences; 11 verb-stated skills with module backreferences. |
| `de86774` | Stripped fabricated content (founder bio, "340+ subscribers", invented essay statistics). Created `08-differences-from-current-site.md` to track every divergence. |

---

## Production-readiness gates (`07-migration-plan.md` checklist)

- ✅ `npm run build` passes
- ✅ `npx tsc --noEmit` clean
- ▫ `npm run lint` not yet run on full branch
- ⏸ Visual smoke test on iPhone Safari for the funnel (pending after Wave C/D)
- ✅ Phrase audit: "FFIEC-aware", "Foundations" course-name, "BAI-P", "AiBi" — none present in `src/`
- ⏸ Hex literal audit
- ⏸ Wave C complete (assessment funnel)
- ⏸ Wave D complete (LMS tree)
- ⏸ Wave E complete (essays migrated)
- ⏸ Wave F complete (auth, dashboard, toolbox)
- ⏸ Wave G cleanup applied

---

## Documentation

```
docs/superpowers/design-system/
├── README.md                         entry point — read order, architecture diagram
├── 01-reconciliation.md              what was shipping vs. what changed
├── 02-information-architecture.md    proposed route tree
├── 03-tokens.md                      intent-bound DESIGN.md
├── 04-primitives.md                  17 components catalog
├── 05-templates.md                   6 page archetypes
├── 06-content-model.md               citations/copy/curriculum/essays
├── 07-migration-plan.md              wave-by-wave runbook
├── 08-differences-from-current-site.md  every divergence from main
└── STATUS.md                         this file
```

---

## To resume (next session priorities)

1. **Wave C — finish assessment funnel.**
   - Migrate `ResultsViewV2` to `<ResultsPage>` template (uses `<ScoreRing>`, `<DimensionGrid>`, dark-band starter artifact, three-paths grid).
   - Migrate `EmailGate` to design-system primitives.
   - Update `/results/[id]/page.tsx` to render the migrated `ResultsViewV2`.
2. **Wave E — convert ≥1 real essay to MDX** (smallest first: `the-widening-ai-gap` at 200 LOC source). Establishes the migration pattern; founder writes the rest.
3. **Wave D — LMS tree migration.** Largest single piece. Move `src/app/courses/aibi-p/*` to `src/app/education/practitioner/*` and rebuild the program landing on `<ProgramPage>`, the module interior on `<LMSPage>`.
4. **Wave F — auth + dashboard interior.**
5. **Wave G — cleanup, lint sweep, hex-literal audit, final smoke test, ready-to-merge gate.**

Estimated 2–3 focused sessions to complete Waves C–G.

---

## How to view

```bash
cd ~/Projects/aibi-design-2.0
npm run dev
# http://localhost:3000
```

Most-finished surfaces:
- `/` — hero with sourced facts plate, ROI dossier, transformation arc, certification ladder
- `/about` — founder narrative + dark mission pull quote + 6-principle grid
- `/for-institutions` — hero with engagement marginalia, value-prop band, 3 tier tiles, real tools/skills, dark pilot CTA
- `/education` — catalog hub with 3-rung certification ladder
- `/security` — Pillar B cobalt hero
- `/research` — essay archive (1 MDX placeholder + 6 legacy)
- `/assessment` (start one to see the new `<QuestionCard>`)

---

## Branch isolation confirmed

```
$ git -C ~/Projects/TheAiBankingInstitute branch --show-current
main

$ git -C ~/Projects/aibi-design-2.0 branch --show-current
design-2.0

$ git -C ~/Projects/aibi-design-2.0 log --oneline main..HEAD | wc -l
18
```

Local-only commits. Nothing pushed. `main` is at `4587c19` — untouched since this branch began.
