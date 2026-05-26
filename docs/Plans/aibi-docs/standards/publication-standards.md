# Publication Standards

The rules that govern how the Standards section operates as a publishing
program. License, versioning, citation format, schema requirements, anchor
stability, and the MDX content schema.

These are operational standards for the Standards. Read this before
authoring or shipping anything in `/standards/`.

---

## 1. License: CC BY 4.0

All published content in the Standards section is licensed under
**Creative Commons Attribution 4.0 International (CC BY 4.0)**.

This includes:

- The Banker AI Fluency Rubric (overview, components, levels, all subsections)
- The Banker AI Transformation Framework (overview, dimensions, levels)
- The Glossary (every term)
- The Bibliography (annotations; cited works themselves retain their own
  licenses)
- The Standards Board page

This does NOT include:

- Site design, code, components, or the AiBI wordmark — those are
  proprietary
- Assessment instruments, scoring methodology, or assessment questions —
  those are AiBI proprietary product
- The annual *State of...* reports — those are separately licensed
  (default: free to read, attribution required for republication)

### What CC BY 4.0 means in practice

Anyone can:

- Quote the frameworks verbatim in any context, commercial or non-commercial
- Translate any framework section into any language
- Adapt the frameworks (e.g., a regional credit union league publishes a
  derivative for its members)
- Build derivative works (e.g., a fintech vendor publishes a self-assessment
  tool based on the framework)

In all cases, they must:

- Provide attribution to AiBI (specifically: "The AI Banking Institute,
  Banker AI Fluency Rubric V1.0, [URL]")
- Link back to the canonical source on `aibankinginstitute.com/standards/`
- Note any modifications they made

### Surfaced on the site

Every framework overview page includes:

- A CC BY 4.0 badge near the page footer
- A link to the human-readable license summary
  (`https://creativecommons.org/licenses/by/4.0/`)
- The "Cite this" block (see § 3) which encodes attribution requirements
  in the suggested citation formats

---

## 2. Versioning

Standards use a semver-style version scheme: `Major.Minor`.

| Version bump | Triggered by |
|---|---|
| **Major** (V1.0 → V2.0) | Restructure of components, dimensions, or levels. Renaming any level. Adding or removing a component or dimension. Anything that breaks external citations against the old version. |
| **Minor** (V1.0 → V1.1) | Refined wording in any section. Additional banker examples. Added citations. Corrections. New glossary terms. Changes that strengthen the framework without breaking external citations. |

### Version cadence

- **V1.0** — Initial publication
- **V1.x** — Minor revisions as feedback arrives. Roughly quarterly for the
  first year.
- **V2.0** — First major revision. Target 12–18 months after V1.0. Driven by
  Standards Board input, accumulated assessment data, and clear gaps in V1.

### Forever-compatibility for citations

External citations against V1.0 must continue to resolve forever.

- The URL `aibankinginstitute.com/standards/fluency-rubric/` always shows
  the current version
- Versioned URLs (`/standards/fluency-rubric/v1.0/`) are preserved as
  read-only snapshots
- The version history page (`/versions/`) lists every version with a link
  to its snapshot

When V2.0 ships:

- The current URL (`/fluency-rubric/`) renders V2.0
- The V1.0 snapshot at `/fluency-rubric/v1.0/` remains live but shows a
  prominent banner: "This is version 1.0 of the Banker AI Fluency Rubric.
  The current version is 2.0. [View current version]"

### Version metadata

Every framework page exports a `version` field in its MDX frontmatter:

```yaml
---
title: "Banker AI Fluency Rubric"
version: "1.0"
publishedAt: "2026-07-15"
lastModified: "2026-07-15"
license: "CC BY 4.0"
---
```

The header component (`<FrameworkVersion>`) reads this and renders the
prominent version badge defined in `standards-implementation-plan.md` § 4.6.

---

## 3. Citation format

Every framework overview page renders a "Cite this" block with three
formats. Authors and developers do not write these by hand — they are
generated from the page's MDX frontmatter by the `<CitationBlock>`
component.

### APA format

```
The AI Banking Institute. (2026). Banker AI Fluency Rubric (Version 1.0).
https://aibankinginstitute.com/standards/fluency-rubric/
```

### Plain-text format

```
"Banker AI Fluency Rubric V1.0," The AI Banking Institute, 2026,
aibankinginstitute.com/standards/fluency-rubric.
```

### BibTeX format

```bibtex
@misc{aibi-fluency-rubric-v1,
  title  = {Banker AI Fluency Rubric},
  author = {{The AI Banking Institute}},
  year   = {2026},
  note   = {Version 1.0},
  url    = {https://aibankinginstitute.com/standards/fluency-rubric/}
}
```

The Glossary and the Transformation Framework follow the same three-format
pattern with appropriate substitutions.

---

## 4. Schema.org structured data

Every framework page emits JSON-LD structured data so the Standards section
gets indexed correctly by search engines and parsed correctly by AI
summarization tools.

### Framework overview pages

`@type: TechArticle`. Includes `headline`, `version`, `datePublished`,
`dateModified`, `author` (AiBI org), `publisher` (AiBI org), `license`
(CC BY 4.0 URL).

### Glossary term pages

`@type: DefinedTerm`. Each term page includes the term name, definition,
URL, and `inDefinedTermSet` reference to the parent glossary.

### Glossary index

`@type: DefinedTermSet`. Includes all child terms as `hasDefinedTerm`
entries.

### Bibliography page

`@type: CreativeWork` with `citation` entries for each cited source.

Validation: every framework page must pass Google's Rich Results test
before shipping. This is part of the Phase 6 acceptance criteria in
`standards-implementation-plan.md`.

---

## 5. Anchor stability

External citations against the Standards depend on stable anchor IDs.
Anchors are an external API contract — treat them as such.

### Anchor formats

| Section | Anchor format | Example |
|---|---|---|
| Components | `#component-{slug}` | `#component-accountability` |
| Levels | `#level-{slug}` | `#level-capable` |
| Dimensions | `#dimension-{slug}` | `#dimension-talent-bench` |
| Glossary terms | route, not anchor | `/standards/glossary/embedded/` |
| Citations | `#cite-{slug}` | `#cite-ffiec-2023-third-party` |
| Version history entries | `#v{version}` | `#v1-1` |

### Stability rules

1. **An anchor that ships with V1.0 must continue to resolve forever.** If
   V2.0 restructures a component, the old anchor either (a) keeps working
   on the V1.0 snapshot URL or (b) server-side 301-redirects to the closest
   V2.0 equivalent.
2. **Never reuse an old anchor for new content.** If V2.0 removes a component
   that V1.0 had, that anchor stays dead on the live URL (or redirects to
   the snapshot). Do not assign that anchor ID to a new component, ever.
3. **Slug source of truth** — anchor slugs are derived from the section's
   `id` field in MDX frontmatter, not from the displayed title. This lets
   the displayed title change while the anchor stays stable.

Example MDX frontmatter:

```yaml
---
id: "accountability"          # anchor: #component-accountability — never changes
displayTitle: "AI Accountability"   # what renders — can be edited freely
order: 4
---
```

---

## 6. MDX content schema

All Standards content is stored in `src/content/standards/` as MDX files.
Each file has frontmatter validated by a Zod schema at build time.

### Required frontmatter — framework pages

```yaml
---
title: "Banker AI Fluency Rubric"   # page title
description: "Individual-scope rubric for AI fluency in community banking"
version: "1.0"
publishedAt: "2026-07-15"
lastModified: "2026-07-15"
license: "CC BY 4.0"
framework: "fluency-rubric"   # or "transformation-framework"
type: "overview"              # overview | component | level | dimension | versions
---
```

### Required frontmatter — component / level / dimension files

```yaml
---
id: "accountability"              # stable; used for anchor
displayTitle: "AI Accountability" # rendered title
order: 4                          # display order
framework: "fluency-rubric"
type: "component"                 # component | level | dimension
parent: "fluency-rubric"
---
```

### Required frontmatter — glossary terms

```yaml
---
term: "Embedded"
slug: "embedded"
displayTitle: "Embedded"
relatedTerms: ["capable", "leading", "aibi-s"]
citations: ["zapier-rubric-v2", "ffiec-third-party"]
---
```

### Zod schema enforcement

A schema file at `src/content/standards/schema.ts` defines the Zod types
for each MDX frontmatter shape. The MDX loader validates every file at
build time. A malformed file fails the build, not the runtime — this
prevents broken Standards content from ever reaching production.

---

## 7. Body content conventions

### Headings

- Page title is the H1 — comes from `title` in frontmatter, rendered by
  the layout, not in MDX body
- Top-level sections within a page are H2
- Subsections are H3
- Never skip levels (no H2 → H4)
- Maximum useful depth: H4

### Citations

Inline citations use a custom MDX component:

```mdx
This is a sentence with a citation.<Citation id="ffiec-2023-third-party" />
```

The `<Citation>` component renders the footnote marker, adds the source
to the page's footnote list, and links to `/standards/bibliography/#cite-ffiec-2023-third-party`.

### Cross-references

Cross-references to other Standards pages use a custom MDX component:

```mdx
This concept is defined in <CrossRef to="/standards/glossary/embedded">Embedded</CrossRef>.
```

The component validates at build time that the target exists. Broken
cross-references fail the build.

### Banned constructs

- No raw HTML `<a>` tags — use Markdown links or the `<CrossRef>` component
- No raw HTML `<sup>` tags — use the `<Citation>` component
- No inline styles — all styling comes from Ledger tokens via CSS classes
- No emoji except in version history entries marking new vs deprecated
- No marketing copy ("revolutionary," "industry-leading," "AI-powered")
  — see `runbooks/content-authoring-guide.md` for full banned-phrase list

---

## 8. Update process

When framework content needs revision:

1. **Open an issue** in the repo titled `Standards content update: [framework]
   [section] [V1.x]`
2. **Branch** off main per CLAUDE.md branching rules
3. **Edit the MDX file** in `src/content/standards/`
4. **Bump version** in the relevant overview page frontmatter
5. **Append to versions file** with the change line
6. **PR review** per `runbooks/pr-review-merge-closeout.md`
7. **Cross-link verification** — confirm any external pages that referenced
   the changed section still make sense
8. **Append to `decisions-log.md`** if the change is substantive

Minor edits (typo fixes, citation additions) can skip the version bump
but still go through PR review. The bar: any change a banker would notice
when reading the Standards twice gets a version bump.

---

## 9. The Standards Board's role in publication

V1 is founder-led. As the Standards Board recruits (Phase 7+), the
publication process changes:

- New V2+ content drafted by founder or research team
- Reviewed by Standards Board members (3+ reviews per section)
- Approved by Standards Board chair for publication
- Founder retains final editorial authority

The page `/standards/standards-board/` documents this process publicly so
external readers understand what blessing a Standards Board version
represents.

---

## See also

- `fluency-rubric-spec.md` — what to author for the Fluency Rubric V1
- `transformation-framework-spec.md` — what to author for the Transformation
  Framework V1
- `../runbooks/content-authoring-guide.md` — voice and writing rules
- `../decisions-log.md` — the resolved decisions that shape these standards
- `../standards-implementation-plan.md` — the engineering plan that
  implements these standards
