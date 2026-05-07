# 06 — Content as Data

**Date:** 2026-05-07
**Branch:** `design-2.0`
**Files:** `content/citations/`, `content/copy/`, `content/curriculum/`, `content/essays/`, `content/regulations/` (added Phase 04).

The content layer is what makes the system *scalable*. Templates render content; primitives style content. The site's surface area grows by adding content modules, never by adding bespoke page code.

This document catalogs every content module, the type contract it exposes, and the rule for when to add a new one.

---

## 1. Existing content infrastructure (kept)

The codebase already had a sophisticated content layer for course and assessment data. Phase 06 builds on it:

| Module | Path | Purpose |
|---|---|---|
| Courses | `content/courses/aibi-p/`, `aibi-s/`, `aibi-l/` | Per-course modules + frontmatter (config, modules, expanded modules, etc.). Already drives `<ProgramPage>`-equivalent surfaces in the live app. |
| Assessments | `content/assessments/v1/`, `v2/` | Question banks, scoring rules, rotation, personalization, PDF content, starter artifacts. Versioned for evolvability. |
| Email sequences | `content/email-sequences/<tier>/` | Markdown drip emails per result tier (starting-point / early-stage / building-momentum / ready-to-scale). |
| Practice reps | `content/practice-reps/aibi-p.ts` | Interactive practice exercises. |
| Sandbox data | `content/sandbox-data/aibi-p/` | Demo data for the AI practice sandbox. |
| Certifications | `content/certifications/v1.ts` | Credential definitions. |
| Institutions | `content/institutions/v1.ts` | Sample institution profiles. |
| Advisory | `content/advisory/v1.ts` | Advisory engagement definitions. |
| Prompt cards | `src/content/prompt-cards/cards.ts` | Lead-magnet prompt card content. |
| Toolbox | `src/content/toolbox/templates.ts` | Authenticated toolbox templates. |

**What's preserved:** the existing TS module pattern. The new modules below follow the same shape.

---

## 2. Content modules added in Phase 06

### 2.1 `content/regulations/index.ts`

Single source of truth for the regulatory frameworks the curriculum aligns with. The `<TrustStrip>` primitive reads from this; nothing else can.

```ts
export const REGULATIONS: readonly Regulation[] = [
  { slug: "sr-11-7", short: "SR 11-7", long: "...", issuer: "Federal Reserve & OCC" },
  { slug: "tprm", short: "Interagency TPRM Guidance", ... },
  { slug: "ecoa-reg-b", short: "ECOA / Regulation B", ... },
  { slug: "aieog", short: "AIEOG AI Lexicon", ... },
];
```

When a regulator's name changes (e.g. "AIEOG AI Lexicon" reorganizes), update one entry; every page updates.

### 2.2 `content/citations/index.ts`

Sourced statistics registry. Every figure on the public site references a slug here. Components can't render an unsourced number — by convention, and by absence of helper functions.

```ts
import { citationAsKPI } from "@content/citations";

const items = [
  citationAsKPI("gartner-skills-gap", "Skills gap"),
  citationAsKPI("gartner-no-governance", "Governance gap"),
];
```

Adding a citation = 1 entry. Updating a value = updates everywhere the slug is referenced. Auditing the public site for unsourced numbers = grepping for hardcoded number formats outside `content/citations/`.

### 2.3 `content/copy/index.ts`

Brand copy registry. Tagline, mission, positioning, founder bio, principles, standard CTAs.

```ts
import { BRAND, PRINCIPLES, CTAS } from "@content/copy";

<title>{BRAND.name} — {BRAND.tagline}</title>

<Cta href={CTAS.beginAssessment.href}>{CTAS.beginAssessment.label}</Cta>
```

Tagline drift across pages was a real risk on the old codebase ("Turning Bankers into Builders" had three subtle variants in three places). One module fixes it.

### 2.4 `content/curriculum/tools.ts`

The AI tools the curriculum teaches. Vendor-named, role-relevant. Surfaced on `<ProgramPage>` and `/for-institutions` to make the program tangible.

### 2.5 `content/curriculum/skills.ts`

Verb-stated skills practitioners leave the curriculum knowing how to do. Each skill names the modules where it's built — useful for both audit (does the curriculum actually deliver what we claim?) and for cross-referencing on program pages.

### 2.6 `content/essays/`

The biggest structural shift in Phase 06. Essays migrate from bespoke `src/app/resources/<slug>/page.tsx` (200–400 LOC each) to MDX files in `content/essays/<slug>.mdx`.

#### Why MDX

Long-form prose is not React's native medium. JSX with `<p>` and `<h2>` per paragraph is unmaintainable for 14-min-read essays. MDX lets the body read like Markdown while still allowing `<EditorialQuote>`, `<KPIRibbon>`, `<Marginalia>` to embed inline.

#### Frontmatter contract

Every essay file exports `meta` typed as `EssayMeta`:

```ts
import type { EssayMeta } from "@content/essays/_lib/types";

export const meta: EssayMeta = {
  slug: "the-ai-use-case-inventory",
  title: "...",
  dek: "...",
  date: "2026-04-24",
  category: "Governance",
  readMinutes: 14,
  author: "James Gilmore",
  sources: [
    { label: "Federal Reserve & OCC, Supervisory Letter 11-7" },
    ...
  ],
};
```

#### Registry

`content/essays/_lib/registry.ts` holds an explicit list of essays and their importers. Adding an essay:

1. Create `content/essays/<slug>.mdx`.
2. Add `{ slug, importer: () => import("../<slug>.mdx") }` to `ESSAYS`.

The `/research/[slug]` page calls `loadEssay(slug)` to resolve. The `/research` archive calls `listEssayMeta()` which returns all non-draft essays sorted newest-first.

#### Why an explicit registry instead of fs scanning

Static analysis catches typos in slug references; the bundler stays predictable; frontmatter type-errors at registry-load time, not at runtime. The cost of the explicit list is negligible (one line per essay).

#### Example essay shipped

`content/essays/the-ai-use-case-inventory.mdx` — a complete 14-min essay on AI use-case inventory governance. Demonstrates:
- Embedded `<EditorialQuote>` from the design system
- Embedded `<Marginalia>` for sidebar voices
- Sourced citation list in the meta
- Plain markdown body for everything else

Phase 07 migration ports the existing 6 `/resources/*` essays to this format.

---

## 3. Type contracts (the schemas)

### `Citation`

```ts
interface Citation {
  slug: string;
  value: string;
  claim: string;
  publication: string;
  publisher: string;
  year: number;
  short: string;
  url?: string;
}
```

### `Regulation`

```ts
interface Regulation {
  slug: string;
  short: string;
  long: string;
  issuer: string;
  url?: string;
}
```

### `CurriculumTool` / `CurriculumSkill`

See `content/curriculum/tools.ts` and `skills.ts`.

### `EssayMeta`

```ts
interface EssayMeta {
  slug: string;
  title: string;
  dek?: string;
  date: string;          // ISO
  category: EssayCategory;
  readMinutes: number;
  author?: string;
  sources?: { label: string; url?: string }[];
  order?: number;        // override sort
  draft?: boolean;
}
```

---

## 4. MDX setup

`next.config.mjs` was updated to:
- Wrap with `withMDX` from `@next/mdx`
- Add `mdx` to `pageExtensions`
- Permanent redirects for the entire `design-2.0` route rename map (`/courses/* → /education/<program>/*`, `/resources/* → /research/*`, `/certifications/exam/aibi-p → /education/practitioner/exam`)

Dependencies added: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`.

`src/types/mdx.d.ts` declares the MDX module shape so TypeScript knows essays have a `meta` named export.

---

## 5. The "add new content" cookbook

| Operation | Files touched |
|---|---|
| Add a sourced statistic | 1 line in `content/citations/index.ts` |
| Update the institute tagline | 1 string in `content/copy/index.ts` |
| Add a regulation to the trust strip | 1 entry in `content/regulations/index.ts` |
| Add a tool to the curriculum surface | 1 entry in `content/curriculum/tools.ts` |
| Add a skill to the curriculum surface | 1 entry in `content/curriculum/skills.ts` |
| Publish a new essay | 1 MDX file + 1 line in `content/essays/_lib/registry.ts` |
| Add a new program | ~3 files: `content/courses/<slug>/index.ts` + `modules.ts` + entry in `/education/page.tsx` |
| Add a new module to AiBI-Practitioner | 1 file: `content/courses/aibi-p/module-N.ts` |

Every other operation either composes existing primitives in a page, or modifies a template (rare; templates are stable).

---

## 6. What's still in scope for Phase 07

The content infrastructure is shipped. Phase 07 migration converts the 6 existing `/resources/*` essays to MDX in `content/essays/`. The migration is mostly mechanical: extract the prose, drop into `<slug>.mdx`, add frontmatter, register in `ESSAYS`. Verifying that nothing renders broken on `/research/[slug]` is the primary gate.
