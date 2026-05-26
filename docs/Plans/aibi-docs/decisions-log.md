# Decisions Log

Append-only log of architectural and strategic decisions for AiBI. Newer
entries on top. When a decision needs revisiting, append a new entry that
references and supersedes the old one — never edit history.

For irreversible code-level decisions, see `DECISIONS.md` at the repo root.
This log is for product/architecture/strategy calls.

---

## 2026-05-17 — Two-framework architecture (individual + institutional)

**Decision:** AiBI publishes two distinct frameworks under the Standards
section, not one combined framework.

- **Banker AI Fluency Rubric** — individual diagnostic (4 components × 4 levels)
- **Banker AI Transformation Framework** — institutional diagnostic (6 dimensions × 4 levels)

**Rationale:** AiBI serves two audiences with materially different needs.
Individual bankers care about their own fluency; institutional buyers (CRO,
COO, Head of Lending) care about the organization's transformation maturity.
One framework would fuzz the language for both. Two frameworks serve each
audience precisely and unlock different price points (individual programs vs
enterprise advisory engagements).

The frameworks share authority anchors. Fluency Rubric is methodologically
adapted from the Zapier AI Fluency Rubric V2; Transformation Framework is
adapted from McKinsey Rewired 2.0. Both cite the same banking authorities
(FFIEC, SR 11-7, NIST AI RMF, AIEOG).

---

## 2026-05-17 — Standards section as gravity center, not companion artifact

**Decision:** Standards is a top-level navigation item, sitting between Home
and Programs. Every other product surface (Programs, Assessments, Advisory,
Research) is positioned as derivative of, or downstream from, Standards.

**Rationale:** A companion rubric lives on a page and adds credibility but
doesn't deepen the product. A spine framework becomes the canonical reference
that everything maps to. The strategic asymmetry: making Standards primary
turns "our AI course" into "the program that certifies Capable on a published
rubric." Different conversation, different price.

This is the architectural decision that turns AiBI from a course business
with a research blog into an institute with products.

**Trade-off accepted:** Standards-first nav deemphasizes product nav by one
position. Expected short-term: slightly fewer raw clicks on Foundation in
month one. Expected medium-term: materially better conversion per click
because visitors arrive with a real reason to buy.

---

## 2026-05-17 — License: CC BY 4.0 for all published frameworks

**Decision:** The Banker AI Fluency Rubric, the Banker AI Transformation
Framework, the glossary, and the bibliography are published under
Creative Commons Attribution 4.0 (CC BY 4.0).

**Rationale:** The frameworks' value is being the canonical reference the
industry cites, not the words themselves. CC BY 4.0 lets bankers, vendors,
consultants, and regulators quote, adapt, and build on the frameworks freely
— with attribution. That accelerates citation velocity and authority. The
moat is the assessment data, the certifications, and the products that move
people through the frameworks, not the framework text.

All-Rights-Reserved alternatives would result in paraphrased versions
circulating without attribution. CC BY 4.0 makes verbatim citation legal and
preferable.

**Operational implication:** Every framework page surfaces a "Cite this"
block in three formats (APA, plain-text, BibTeX) and an explicit CC BY 4.0
notice with link.

---

## 2026-05-17 — Content format: MDX

**Decision:** Standards section content is authored and stored as MDX
(Markdown + HTML / React components in one file).

**Rationale:** MDX gives the best of both worlds. Authors write prose in
plain Markdown for the 90% of content that's text. They drop in HTML or
React components when the page needs richer layout (matrix visualizations,
citation copy-buttons, footnotes with hover popovers). The format is
familiar to any technical writer or developer; non-developers can edit
prose without touching React.

**Validation:** Frontmatter is validated with a Zod schema so type
errors fail at build time. Body content is free-form MDX.

**Alternative considered:** TypeScript content modules. Rejected because
they require a developer for every word change. Future content hires and
Standards Board reviewers should not need to learn TypeScript to fix a
typo.

---

## 2026-05-17 — Existing /design-system page: noindex now, internal later

**Decision:** Add `robots: { index: false, follow: false }` to
`src/app/design-system/page.tsx` immediately. After the Standards section
launches (Phase 6+), move the route to `/internal/design-system` behind
admin auth.

**Rationale:** The current `/design-system` page is publicly accessible
but is functionally an internal artifact (the Ledger token reference for
designers and developers). It competes with the new Standards section
for "what is the canonical document on AiBI's site" mental space and
confuses bankers who land on it cold.

Two-step move: `noindex` is a one-line change that doesn't break team
bookmarks. Full route move happens after Standards is live so there's
something canonical to point at and the migration is clean.

---

## 2026-05-17 — Nav item naming: "Standards"

**Decision:** The new top-level navigation item is labeled "Standards,"
not "Frameworks" or "Research."

**Rationale:** "Standards" matches how bankers already think (compliance
standards, accounting standards, risk standards). Signals authority.
Doesn't require explanation. Matches what FFIEC calls its outputs.

"Frameworks" is what McKinsey/NIST use — accurate but less familiar to
the banker audience. "Research" is wrong because research is the data;
standards are the rules derived from research.

---

## 2026-05-17 — Versioning visibility: prominent in framework headers

**Decision:** Version numbers (V1.0, V1.1, V2.0 etc.) appear in the header
of every framework page, not buried in a footer or metadata.

**Rationale:** Bankers expect institutional documents to carry visible
versioning (every FFIEC or NIST publication does). Hiding the version
softens institutional tone toward consumer/marketing tone. The cost of
visible versioning is near-zero; the credibility benefit is real.

Format: `V1.0 · Published 2026-XX-XX · [View versions]` in mono caps under
the page title.

---

## 2026-05-17 — Research routing: AI Banking Brief stays at /research/

**Decision:** The AI Banking Brief continues to live under `/research/`.
Annual *State of...* reports (when they launch in Phase 11+) live in the
same section.

**Rationale:** Research = findings and data. Standards = canonical frameworks.
These are different artifacts and warrant different sections. No conflict
between them; the cross-references go one direction (Research cites
Standards; Standards do not cite Research).

---

## 2026-05-17 — .impeccable.md retirement

**Decision:** Delete `.impeccable.md` at repo root. It was a pre-Ledger
brand bible that contradicted CLAUDE.md on every brand axis.

**Rationale:** Hidden filename made it easy to miss. Contradicted the
canonical brand on palette, typography, pillar discipline, and seal usage.
Any AI session or contributor reading it as authoritative would have
written off-brand code.

**Resolved by:** Closed via PR #118 (issue #112) on 2026-05-17.

---

## 2026-05-17 — Lighthouse CI: local-build pattern

**Decision:** Replace the `wait-for-vercel-preview` action with a deterministic
local build for Lighthouse CI. Same pattern extended to all three E2E job
lanes (smoke, a11y, auth) in PR #120.

**Rationale:** The Vercel preview URL polling action couldn't get past Vercel
Deployment Protection SSO redirect, causing timeout on every PR run. The
local-build pattern (checkout → install → build → start → wait → run lhci →
teardown) is faster, has no auth wall, and tests the PR's own code rather
than whatever Vercel decided to deploy.

Also bumped `actions/checkout` v4→v5 and `actions/upload-artifact` v4→v5 to
clear the Node 20 deprecation warning that surfaces after 2026-06-02.

**Resolved by:** PR #118 (issue #105), pattern extended in PR #120 (issue #119).

---

## How to add a new entry

```markdown
## YYYY-MM-DD — One-line decision title

**Decision:** What was decided, in declarative voice.

**Rationale:** Why. Include trade-offs accepted.

**Operational implication:** What changes in code, content, or process
as a result. (Optional.)

**Resolved by:** PR #, issue #, or session note. (Optional.)
```

Append at the top of the log. Never edit existing entries — supersede them
with a new entry that references the old one.
