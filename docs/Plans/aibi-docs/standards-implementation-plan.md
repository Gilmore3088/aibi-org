# AiBI Standards Section — Implementation & Design Plan

**Status:** Ready for implementation
**Owner:** Founder + assigned developer(s)
**Target completion:** 13 weeks (3 months) for full launch through Phase 5
**Brand baseline:** Ledger design system per `docs/brand/brand-guide.md` and `src/styles/tokens-ledger.css`

---

## 1. Overview

We are adding a new top-level **Standards** section to the AiBI website. Standards contains AiBI's two canonical published frameworks:

1. **Banker AI Fluency Rubric** — individual-level diagnostic (4 components × 4 levels). Drives the free assessment, In-Depth (individual), and Foundation / S / L certifications.
2. **Banker AI Transformation Framework** — institutional-level diagnostic (6 dimensions × 4 levels). Drives In-Depth (team), Leadership Advisory, and institutional engagements.

Standards is the gravity center of the Institute. Every other surface (Programs, Assessments, Advisory, Research) is positioned as derivative of, or downstream from, the Standards. This is an architectural decision, not a marketing one.

### Why this matters commercially

- **Standards make the Programs defensible.** AiBI-Foundation isn't "our course"; it's "the program that certifies Capable on the Banker AI Fluency Rubric." That positioning changes the price ceiling.
- **Standards anchor Advisory pricing.** Leadership Advisory delivers a Transformation Framework assessment and roadmap — that's a different sale than generic consulting.
- **Standards build inbound authority.** A published, citation-friendly framework gets linked, quoted, and cited externally. That compounds.
- **Standards are permanent infrastructure.** Products evolve quarterly; the frameworks evolve on a 12–24 month cadence. They are the anchor.

### What is NOT in scope of this plan

This plan covers the **publication infrastructure**: information architecture, page structure, design specs, technical implementation, acceptance criteria. It does NOT include:

- Authoring the actual rubric / framework content (separate authoring workstream)
- Rewriting the assessment scoring engine to map to the rubric (Phase 6+)
- Building the actual Standards Board (real people; Phase 7)
- Annual reports / data publications (Phase 8)
- V2 of either framework (months 9+)

---

## 2. Information Architecture

### 2.1 Global navigation — before and after

**Current nav (inferred):**

```
Home | Assessment | Foundation | Research | About | Sign in
```

**New nav:**

```
Home | Standards | Programs | Assessments | Advisory | Research | About | Sign in
```

Standards is the **first item after Home**. This visual primacy is the architectural signal — everything else derives from here.

If `Advisory` doesn't have a public route yet, ship it as a thin "by request" page with a contact form. The public-facing presence signals the Institute does this work, even before the route is fully built out.

### 2.2 URL structure

```
/standards/                              ← Standards landing page
/standards/fluency-rubric/               ← Rubric overview
/standards/fluency-rubric/components/    ← Component detail (anchor-linked subsections)
/standards/fluency-rubric/levels/        ← Level detail (anchor-linked subsections)
/standards/fluency-rubric/versions/      ← Version history + changelog
/standards/transformation-framework/     ← Framework overview
/standards/transformation-framework/dimensions/
/standards/transformation-framework/levels/
/standards/transformation-framework/versions/
/standards/glossary/                     ← Controlled vocabulary
/standards/glossary/[term]/              ← Individual term pages (anchor-linkable externally)
/standards/bibliography/                 ← Citation library
/standards/standards-board/              ← Governance / contributors
```

Deep-anchor URLs must be stable forever. Bankers will link to specific anchors in their own documents (`/standards/fluency-rubric#component-accountability`). Treat these like API contracts.

### 2.3 File structure (Next.js App Router)

```
src/app/
└── standards/
    ├── layout.tsx                    ← Standards section shell (sidebar nav, breadcrumbs)
    ├── page.tsx                      ← /standards/ landing
    ├── fluency-rubric/
    │   ├── page.tsx                  ← overview
    │   ├── components/
    │   │   └── page.tsx              ← four components, anchor-linked
    │   ├── levels/
    │   │   └── page.tsx              ← four levels, anchor-linked
    │   └── versions/
    │       └── page.tsx              ← version history
    ├── transformation-framework/
    │   ├── page.tsx
    │   ├── dimensions/
    │   │   └── page.tsx
    │   ├── levels/
    │   │   └── page.tsx
    │   └── versions/
    │       └── page.tsx
    ├── glossary/
    │   ├── page.tsx                  ← term index
    │   └── [term]/
    │       └── page.tsx              ← individual term (dynamic route)
    ├── bibliography/
    │   └── page.tsx                  ← cited sources
    ├── standards-board/
    │   └── page.tsx                  ← governance
    └── opengraph-image.tsx           ← shared OG image for standards section

src/content/standards/                 ← MDX content (preferred) or TS modules
├── fluency-rubric/
│   ├── overview.mdx
│   ├── components/
│   │   ├── mindset.mdx
│   │   ├── strategy.mdx
│   │   ├── building.mdx
│   │   └── accountability.mdx
│   ├── levels/
│   │   ├── aware.mdx
│   │   ├── capable.mdx
│   │   ├── embedded.mdx
│   │   └── leading.mdx
│   └── versions.mdx
├── transformation-framework/
│   └── (parallel structure)
├── glossary/
│   └── [term].mdx                    ← one file per term
└── bibliography.mdx
```

Content lives as MDX so the authoring team can edit prose without touching React components.

### 2.4 Footer updates

Add a new footer column:

```
Standards
├── Fluency Rubric
├── Transformation Framework
├── Glossary
└── Bibliography
```

This is the second-most-visited entry point after the global nav. Bankers reading research or blog posts will hit the Standards via the footer.

---

## 3. Page-by-page specifications

### 3.1 Standards landing — `/standards/`

**Purpose:** Single page that explains what the Standards are, why they exist, and how to use them.

**Sections (top to bottom):**

1. **Lede** — One paragraph. What AiBI Standards are. Editorial voice. Newsreader serif. No CTA.
2. **The two frameworks** — Two large cards side by side: Fluency Rubric (individual) and Transformation Framework (institutional). Each card has a one-line description, the level scale visualized, and a "Read the standard" link.
3. **How to use the Standards** — Short editorial section. Three numbered points: cite them, assess against them, certify with them.
4. **Recent updates** — Compact list of last 3 version events across both frameworks. Date, framework, change line.
5. **Standards Board** — One-paragraph blurb on governance + named board members (initially just founder) + "Read the methodology" link.

**Visual treatment:** Ledger aesthetic. Parchment background, ink type. Each framework card uses a hairline rule (`--ledger-rule`) and the structural radius (`--ledger-r-2`). No gradients. No shadows except `--ledger-shadow` on the two framework cards.

**Below-the-fold "About these Standards":** Sourced — links to Bibliography. Versioned — links to most recent version-history entries. Open — note that this is published openly under [chosen license, e.g., CC BY 4.0] to maximize citability.

### 3.2 Fluency Rubric overview — `/standards/fluency-rubric/`

**Purpose:** The canonical home of the Banker AI Fluency Rubric.

**Sections:**

1. **Header band** — Title ("Banker AI Fluency Rubric"), version (`V1.0 · Published [date]`), "Cite this" button.
2. **Abstract** — One paragraph. What this rubric measures, who it's for, what it doesn't cover.
3. **The 4×4 matrix** — Hero visualization. Four components across, four levels down. Each cell shows a one-line descriptor. Cells are linked to anchor-deep URLs in the components and levels pages.
4. **The four components** — Each component gets a card: name, one-paragraph definition, "Read more" link to `/standards/fluency-rubric/components/#mindset` (etc.).
5. **The four levels** — Each level gets a card: name, one-paragraph definition, "Read more" link.
6. **How this rubric is used** — Short block on assessment positioning, certification mapping, institutional benchmarking.
7. **Citation block** — Suggested citation in three formats (APA, plain-text, BibTeX). Sticky on scroll if feasible.
8. **Related** — Links to Glossary, Bibliography, Versions, Transformation Framework.

### 3.3 Fluency Rubric components — `/standards/fluency-rubric/components/`

**Purpose:** Long-form detail for each of the four components.

**Structure:**

- Page has a sticky left rail with anchor links to each component
- Each component is its own H2 section with stable anchor (`#component-mindset`, `#component-strategy`, `#component-building`, `#component-accountability`)
- Each component has subsections:
  - Definition (2–3 paragraphs)
  - What this looks like in practice (3–5 banker-specific examples)
  - How this is measured (assessment items, observable signals)
  - Citations (footnoted, links to Bibliography)
  - "Banker AI Fluency Rubric § X.Y" — institutional-grade section numbering

This page is long. Treat it like a working paper, not a marketing page. Editorial typography (Newsreader for prose), wide margins, generous line-height, footnote rendering.

### 3.4 Fluency Rubric levels — `/standards/fluency-rubric/levels/`

**Same structure as components, but for the four levels:** Aware, Capable, Embedded, Leading.

Each level has:
- Definition
- What this looks like in practice
- How to demonstrate it
- Mapping to AiBI certifications (Capable → AiBI-Foundation, Embedded → AiBI-S, Leading → AiBI-L)
- Citations

### 3.5 Transformation Framework — parallel structure

Mirror the Fluency Rubric pages for the Transformation Framework:

- `/standards/transformation-framework/` (overview, 6×4 matrix)
- `/standards/transformation-framework/dimensions/` (six dimensions detailed)
- `/standards/transformation-framework/levels/` (four levels detailed)

Six dimensions: Roadmap, Talent Bench, Operating Model, Tech Environment, Data Embedding, Adoption & Scale.

Four levels: Exploring, Piloting, Scaling, Rewired.

### 3.6 Glossary — `/standards/glossary/`

**Purpose:** Controlled vocabulary that both frameworks reference. Citable externally.

**Index page** — alphabetical list of all defined terms with one-line definitions. Search/filter UI optional but recommended.

**Per-term page** — `/standards/glossary/embedded/`:
- Term name
- One-paragraph definition
- Used in (links to each framework section that references it)
- Related terms
- Citations

Every term gets its own URL so bankers can link to a definition in their own documents.

### 3.7 Bibliography — `/standards/bibliography/`

**Purpose:** The citation library.

**Structure:**

- Grouped by source type: Regulatory guidance, NIST publications, industry frameworks, academic references
- Each entry has: full citation, link to source if public, one-line note on what it informs
- Used by: in-line citation links throughout the framework pages

Minimum V1 citations:

- FFIEC Interagency Guidance on Third-Party Relationships: Risk Management (2023)
- Federal Reserve SR 11-7: Guidance on Model Risk Management
- NIST AI Risk Management Framework (AI RMF 1.0)
- AIEOG AI Lexicon
- Zapier AI Fluency Rubric V2 (Tracy St. Dic, 2026)
- McKinsey Rewired 2.0 (Lamarre et al., 2026)
- OCC Risk Governance Framework
- BIS / Basel guidance on AI/ML in banking (if applicable)

### 3.8 Standards Board — `/standards/standards-board/`

**Purpose:** Governance and contributors. Signals legitimacy.

**Sections:**

1. **What the Standards Board does** — brief mission paragraph
2. **Methodology** — how V1 was authored, how revisions happen, how contributors are added
3. **Current board** — initially just the founder, with an explicit note that this is a founder-led V1 and the board is being recruited
4. **Contributing** — how an interested community-bank practitioner can apply to join V2 review
5. **Cadence** — quarterly review, annual revision, public changelog

### 3.9 Versions — `/standards/fluency-rubric/versions/` and equivalent for Transformation Framework

**Purpose:** Public version history.

Format:

```
V1.0 — [date]
  Initial publication.

V1.1 — [date]
  Refined wording in Accountability component based on Standards Board review.
  Added 4 new banker-specific examples in Strategy component.
  Cited 3 additional FFIEC sources.

V2.0 — [date]
  TBD
```

Plain-text. Reverse chronological. Each version line is anchored so bankers can link to a specific revision.

---

## 4. Component specifications

These are the new reusable React components needed across the Standards section. All consume Ledger tokens from `src/styles/tokens-ledger.css`. No new design tokens are introduced.

### 4.1 `<FrameworkMatrix>`

The 4×4 (Fluency) or 6×4 (Transformation) grid visualization on each framework's overview page.

**Props:**
- `framework: 'fluency' | 'transformation'`
- `data: MatrixCell[][]` — rows = components/dimensions, columns = levels
- `linkPrefix: string` — e.g., `/standards/fluency-rubric/`

**Behavior:**
- Each cell is a link to a deep anchor in the components or levels page
- Hover state: cell border darkens via `--ledger-rule-strong`
- Mobile: collapses to a vertical accordion (component-by-component)
- All cell text uses `--ledger-mono` for consistency with editorial-statistical feel

### 4.2 `<LevelCard>` and `<ComponentCard>`

Card-style components for the framework overview pages.

**Visual:**
- Background `--ledger-paper`
- Border 1px `--ledger-rule`, radius `--ledger-r-2`
- Header in Newsreader serif (the level/component name)
- Body in Geist sans (definition + descriptor)
- Footer link in mono uppercase tracking (Ledger button style)

### 4.3 `<CitationBlock>`

The "Cite this" UI on framework overview pages.

**Behavior:**
- Three formats: APA, plain-text, BibTeX
- Click-to-copy each
- Sticky on scroll on desktop, collapsed expandable accordion on mobile
- Updates dynamically if the version is parameterized

### 4.4 `<Footnote>` and `<FootnoteList>`

Footnote rendering for the long-form framework pages.

**Behavior:**
- Inline footnote markers in superscript JetBrains Mono
- On hover (desktop): popover preview of the citation
- On click: jump to the citation list at the bottom of the page
- The citation list links back to `/standards/bibliography/` for the full reference

### 4.5 `<StandardsBreadcrumb>`

The breadcrumb component used in the Standards section layout.

**Example rendering:**
```
Standards › Fluency Rubric › Components › Accountability
```

Mono caps for the trail. The active page in `--ledger-ink`, parents in `--ledger-slate`.

### 4.6 `<FrameworkVersion>`

A small badge component shown in the header of every framework page.

**Visual:**
```
V1.0 · Published 2026-06-XX · [View versions]
```

Mono, small tracking. Background `--ledger-tape` (highlight tape color). Sets institutional tone immediately.

---

## 5. Technical implementation

### 5.1 Metadata strategy

Every framework page exports a `metadata` object with:

- `title` — page-specific, suffixed with `· The AI Banking Institute`
- `description` — first sentence of the section's abstract
- `openGraph.title`, `openGraph.description`, `openGraph.images[]`
- `twitter.card: 'summary_large_image'`
- `alternates.canonical` — explicit canonical URL (no parameter bleed)

OG images for the Standards section should be authored as on-brand Ledger compositions. Use the dynamic `opengraph-image.tsx` pattern at `/standards/opengraph-image.tsx` to generate consistent images per page if practical.

### 5.2 Structured data (JSON-LD)

Each framework page emits Schema.org structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Banker AI Fluency Rubric",
  "datePublished": "2026-06-XX",
  "dateModified": "2026-06-XX",
  "version": "1.0",
  "author": {
    "@type": "Organization",
    "name": "The AI Banking Institute"
  },
  "publisher": {
    "@type": "Organization",
    "name": "The AI Banking Institute",
    "url": "https://aibankinginstitute.com"
  }
}
```

Each glossary term page emits a `DefinedTerm` schema. The glossary index emits a `DefinedTermSet`. This is what gets Standards picked up as authoritative by search engines and AI summarization tools.

### 5.3 Sitemap

Update `next-sitemap.config.js` (or equivalent) to include all `/standards/*` routes. Glossary terms are dynamic — generate the sitemap entries at build time by reading the MDX files in `src/content/standards/glossary/`.

### 5.4 Anchor links and stability

Every component, level, and dimension gets a stable anchor ID. **These never change after V1 publication.** Format:

- Components: `#component-mindset`, `#component-strategy`, etc.
- Levels: `#level-aware`, `#level-capable`, etc.
- Dimensions: `#dimension-roadmap`, `#dimension-talent-bench`, etc.

If V2 renames a component, the old anchor must continue to redirect (server-side 301) to the new one.

### 5.5 Mobile responsiveness

- Standards landing — single-column on mobile, framework cards stack
- Framework overview — matrix collapses to accordion
- Component/level/dimension detail pages — sticky left rail collapses to a top tab/accordion
- Citation block becomes a collapsed accordion at top of page

### 5.6 Performance targets

- Lighthouse Performance: ≥ 90 on all Standards pages
- Lighthouse Accessibility: ≥ 98
- Lighthouse Best Practices: ≥ 95
- Lighthouse SEO: 100
- Largest Contentful Paint < 1.5s on mid-range mobile

These should be enforced via the existing `.lighthouserc.json` configuration with the Standards routes added.

### 5.7 Accessibility specifics

- WCAG 2.1 AA minimum
- Skip-link present on every Standards page
- Heading hierarchy strict — one H1, no skipped levels, proper nesting
- All matrix cells keyboard-navigable
- Footnote popovers fully keyboard-accessible
- All citation links have descriptive link text (no "click here")
- High contrast against `--ledger-paper` and `--ledger-bg` confirmed via tooling

### 5.8 Internal cross-linking strategy

Every existing page that references AI fluency or transformation gets updated to link to the relevant Standards page:

- Free assessment results page → "Your score on the [Banker AI Fluency Rubric](/standards/fluency-rubric/)"
- In-Depth assessment results page → same
- AiBI-Foundation course page → "Certifies you at Capable level on the [Banker AI Fluency Rubric](/standards/fluency-rubric/#level-capable)"
- AiBI-S and AiBI-L pages → same pattern
- Advisory page → "Built around the [Banker AI Transformation Framework](/standards/transformation-framework/)"
- About page → reference Standards as the Institute's primary contribution
- The AI Banking Brief / research → every issue cites the relevant framework section

This cross-linking is what makes the Standards feel like the gravity center rather than an isolated page.

---

## 6. Content authoring requirements

The infrastructure plan does not produce the content. Authoring is a parallel workstream. The required content artifacts:

### 6.1 Banker AI Fluency Rubric V1

- Abstract (one paragraph, ~150 words)
- Four component definitions (~400 words each + 3–5 banker examples each)
- Four level definitions (~400 words each + descriptors per component + certification mapping)
- 16 cell descriptors for the matrix (one line each)
- ~12 citations minimum

### 6.2 Banker AI Transformation Framework V1

- Abstract (one paragraph, ~150 words)
- Six dimension definitions (~400 words each + 3–5 banker examples each)
- Four level definitions (~400 words each + descriptors per dimension)
- 24 cell descriptors for the matrix (one line each)
- ~15 citations minimum

### 6.3 Glossary

- ~20–30 terms for V1 (Capable, Embedded, Leading, Rewired, Model Risk, Examiner Readiness, Tech Muscle, etc.)
- Each: definition (~50–100 words), related terms, citations

### 6.4 Bibliography

- 15–25 entries spanning regulatory, NIST, industry, academic, and non-banking AI framework sources

### 6.5 Standards Board page

- Mission paragraph
- Methodology (~500 words)
- Founder-led V1 acknowledgment
- Contributing instructions

### 6.6 Standards landing copy

- Lede (~150 words)
- "How to use" copy (~300 words)

**Estimated total V1 authoring effort: 25,000–35,000 words.** This is a 3–4 week serious authoring sprint. It cannot be drafted by AI alone — banker-specific examples and regulatory citations require human authorship and review.

---

## 7. Phased rollout

| Phase | Weeks | Deliverable | Acceptance signal |
|---|---|---|---|
| 1 | 1–2 | Standards section infrastructure: nav, routes, layout, breadcrumb, empty content shells | Routes resolve, layout renders, nav updated, Lighthouse green on shells |
| 2 | 3–4 | Fluency Rubric V1 published (with content) | All `/standards/fluency-rubric/*` pages render with real content, citations resolve, matrix renders, mobile responsive |
| 3 | 5–6 | Transformation Framework V1 published (with content) | All `/standards/transformation-framework/*` pages render, parallel acceptance to Phase 2 |
| 4 | 7–8 | Glossary + Bibliography + Standards Board pages published | All term pages resolve, bibliography links work, Standards Board page reads as institutional |
| 5 | 9–10 | Cross-linking sweep across the rest of the site | Every assessment/program/advisory page references the relevant Standard; backlog audit confirms zero missed touchpoints |
| 6 | 11–13 | OG/social card images, schema validation, final polish | All Standards pages have on-brand OG images; Google Rich Results test passes for all framework pages; final Lighthouse + a11y audit passes |

After Phase 6 the Standards section is publicly launched. Phases 7+ (assessment scoring integration, annual reports, V2 work) are separate workstreams.

---

## 8. Acceptance criteria — section-level

The Standards section is "done" when:

- [ ] `Standards` appears in the global navigation as the first item after Home
- [ ] All routes under `/standards/*` resolve and render without errors
- [ ] The Fluency Rubric and Transformation Framework each have full V1 content authored, reviewed, and published
- [ ] Every component, level, dimension, and glossary term has a stable URL anchor
- [ ] The matrix renders on both framework overview pages and collapses cleanly on mobile
- [ ] All footnote citations link to the Bibliography page and back
- [ ] Glossary index lists all V1 terms; every term page resolves
- [ ] Bibliography page lists all cited sources with proper formatting
- [ ] Standards Board page is published with V1 founder-led acknowledgment
- [ ] Every existing site page that should link to the Standards does link to the Standards (audit confirms via grep)
- [ ] Lighthouse scores: Performance ≥ 90, Accessibility ≥ 98, Best Practices ≥ 95, SEO = 100
- [ ] Schema.org structured data validates on every framework page (Google Rich Results test)
- [ ] OG and Twitter card images are on-Ledger and pass visual review against `brand-guide.md`
- [ ] Sitemap includes all Standards routes including dynamic glossary terms
- [ ] No retired brand artifacts appear (run the Art Director drift scan against `src/app/standards/`)
- [ ] All E2E tests for navigation, breadcrumbs, and anchor links pass

---

## 9. Out of scope (tracked for later)

The following are deliberately not in this plan and have their own future work:

- Assessment scoring engine rewrite to map to the Fluency Rubric (Phase 7, ~3 weeks)
- AiBI-Foundation curriculum tagging to rubric components and level transitions (Phase 8, ~2 weeks)
- In-Depth (team) reporting that outputs an institutional position on the Transformation Framework (Phase 9, ~4 weeks)
- Leadership Advisory engagement productization (people, agents, automation workforce planning exercise) (Phase 10, separate stream)
- Annual *State of Banker AI Fluency* report (Phase 11, 6+ months from now)
- Annual *State of Banker AI Transformation* report (Phase 12)
- Standards Board recruitment of external community-bank practitioners (Phase 13, 6+ months from now)
- V2 of either framework (months 9–12+)

---

## 10. Decisions resolved (see `decisions-log.md` for full entries)

The seven architectural questions raised during planning have been resolved.
Each one has a decisions-log entry that supersedes earlier recommendations.

| # | Question | Resolution |
|---|---|---|
| 1 | License for the Standards | **CC BY 4.0**. Each framework page surfaces a Cite-this block in three formats (APA, plain-text, BibTeX) with explicit CC BY 4.0 notice. |
| 2 | Nav item name | **Standards**. Matches how bankers think (compliance/risk/accounting standards). First item after Home. |
| 3 | Versioning visibility | **Prominent in framework page headers.** Format: `V1.0 · Published YYYY-MM-DD · [View versions]` in mono caps. |
| 4 | Content format | **MDX** (Markdown + HTML/React components in one file). Frontmatter validated by Zod. Non-developers can edit prose without touching components. |
| 5 | Standards Board V1 composition | **Founder-led V1** with explicit acknowledgment on the Standards Board page. "Contributing" page published in advance to recruit V2 reviewers from community-bank practitioners. |
| 6 | Existing `/design-system` page | **Two-step:** add `robots: { index: false, follow: false }` now (one-line change, no broken bookmarks). Move to `/internal/design-system` behind admin auth after Standards launches (Phase 6+). |
| 7 | AI Banking Brief routing | **Stays at `/research/`.** Annual *State of...* reports also live there. Research = findings and data; Standards = canonical frameworks. Different artifacts, one-way cross-references (Research cites Standards). |

No open architectural questions block Phase 1 kickoff. Operational questions
(who authors what, when each phase is staffed) are tracked in
`open-questions.md`.

---

## 11. Stakeholder sign-off

Before kicking off Phase 1, confirm:

- [x] The seven architectural questions in Section 10 are resolved (see `decisions-log.md`)
- [ ] The information architecture in Section 2 is approved (nav order, URL structure, file structure)
- [ ] The content authoring workstream is staffed and the V1 word-count estimate (25K–35K words) is accepted
- [ ] The 13-week phased rollout timeline is realistic for the team
- [ ] The cross-linking sweep in Phase 5 has an explicit owner who will audit existing pages
- [ ] Lighthouse and accessibility targets are accepted as launch gates

Signed off by founder: _______________________   Date: __________

---

## Appendix A — Reference documents

- `CLAUDE.md` — project intelligence and rules
- `docs/brand/brand-guide.md` — Ledger design system, voice, banned phrases
- `src/styles/tokens-ledger.css` — live design tokens
- `docs/brand-refresh-2026-05-09/` — canonical brand bundle
- `docs/brand/pages.yaml` — master page registry (add Standards entries here as Phase 1 ships)
- This document: `docs/plans/standards-implementation-plan.md`
