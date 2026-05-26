# Content Authoring Guide

For anyone writing for the Standards section, the AI Banking Brief, the
annual *State of...* reports, or any other AiBI public-facing copy.

This is the operational companion to `brand/brand-guide.md`. The brand guide
defines voice, banned phrases, and visual conventions. This guide is about
the *writing process* — how to draft, when to use AI, how to cite, what the
bar is for what ships.

---

## The voice in one paragraph

AiBI writes like a serious institute, not a startup. Declarative, specific,
institutional — but readable to a community banker, not academic. Closer
to a Federal Reserve working paper than to a marketing blog post. Closer
to a Cornerstone Advisors research piece than to a SaaS thought-leadership
post. Closer to plain expert journalism than to consulting deliverables.

If you can't picture a community bank CRO reading the sentence on a printed
page and nodding, rewrite it.

---

## What we are, and are not, writing

| | We are | We are not |
|---|---|---|
| Genre | Editorial reference — institutional, dry, citable | Marketing copy — sales-driven, promotional |
| Voice | First person plural ("we"), or no person ("the Rubric defines...") | Second person ("you'll discover," "imagine if you could") |
| Tense | Present tense for definitions and rules. Past tense for citations and historical context. | Hypothetical future ("AI will revolutionize banking by 2030") |
| Tone | Confident without being smug. Specific without being academic. | Hype. Vague gestures at transformation. Industry-jargon name-dropping. |
| Length | As long as the idea requires. Some sections are 800 words. Some are 80. | Padded for word count or thinness disguised by length |

---

## Banned phrases (blocker-tier — do not ship)

Direct from `brand/brand-guide.md` § Banned phrases. These are non-negotiable:

- `FFIEC-aware` (anything) — misrepresents regulatory alignment. Replace
  with the specific guidance you mean: "aligned with SR 11-7, Interagency
  TPRM Guidance, ECOA/Reg B, AIEOG."
- `AiBI-Practitioner` — superseded credential name
- `AiBI Foundations` (plural) — wrong pluralization
- `Banking AI Practitioner` — pre-rebrand name
- `BAI-P`, `BAI-S`, `BAI-L` — wrong brand prefix
- `AiBi`, `AIBI` — wrong casing
- "The AI Banking Institute" in prose (use it for first reference, then
  switch to "AiBI" or "the Institute")

If any of these appear in a draft, the section does not ship until they're
gone.

---

## Slop phrases (style-tier — also do not ship)

From `brand/brand-guide.md` § Slop signatures. These mark AI-generated
copy that hasn't been edited:

- "supercharge," "unlock," "revolutionize," "transform" (as a verb of AI doing
  something on its own), "leverage," "synergy," "AI-powered"
- "in today's fast-paced world," "in the age of AI"
- "navigate the complexities of," "harness the power of"
- "delve into," "dive deep into"
- "seamlessly" (almost always lying)
- "intelligent" and "smart" as marketing adjectives for software
- Closing sentences that start with "Ultimately," "In conclusion," "As we've
  seen"
- Opening sentences that are throat-clearing: "It's no secret that," "We all
  know that," "In recent years"

The slop test: would Tracy St. Dic (Zapier's Global Head of Talent who wrote
the AI Fluency rubric blog post) or a McKinsey partner publish this
sentence? If not, rewrite.

---

## Citations — the discipline

Every claim a banker could push back on must trace to a named source.
"FFIEC says..." is acceptable. "Industry experts agree..." is not.

### When you must cite

- Any statistic ("X% of community banks have adopted AI for...")
- Any regulatory claim ("SR 11-7 requires that...")
- Any reference to an external framework (Zapier, McKinsey, NIST, FFIEC)
- Any quote, paraphrase, or close summary of a published work
- Any banker example that is real (anonymize the bank but credit the
  source: "from a $1.2B community bank in the Midwest, per a 2026 Cornerstone
  survey")

### When you don't need to cite

- Definitions established within the Standards themselves (cross-link to
  the canonical section instead)
- Common knowledge ("community banks are state- or federally-chartered
  depository institutions")
- The author's own argument or framing

### Citation format

Inside MDX, citations use the custom `<Citation>` component:

```mdx
The 2023 FFIEC Interagency Guidance on Third-Party Risk Management
explicitly addresses AI vendor relationships.<Citation id="ffiec-2023-third-party" />
```

Every `id` must already exist as an entry in `src/content/standards/bibliography.mdx`.
The build fails if a citation references an unknown source. This is
intentional — broken citations should never reach production.

### Adding a new source to the bibliography

1. Open `src/content/standards/bibliography.mdx`
2. Add an entry with: full citation, source URL, one-line annotation
   describing what the source supports
3. Use the `id` (a kebab-case slug) wherever you cite it
4. Cross-link the source to every Standards section that cites it

---

## When AI-assist is okay, and when it isn't

AiBI publishes content about AI fluency. The expectation that AiBI's own
writing reflects fluent, accountable AI use is the brand. AI-assisted
drafting is fine. AI-authored shipping is not.

### AI is fine for

- Generating initial drafts you then heavily revise
- Producing variants of a sentence to compare
- Summarizing a long source so you can quote it accurately
- Rephrasing to test if a section reads more clearly
- Generating example structures (the *form* of an example, then you fill in
  the banker-specific specifics)

### AI is not fine for

- Generating banker-specific examples whole — they will be generic, wrong, or
  both. Examples must come from real banking experience and be reviewed by
  someone with that experience.
- Producing citations — AI hallucinates citation details. Every citation
  must be verified against the actual source.
- Final voice pass — AI writing has tells. The slop list above is what AI
  outputs when not corrected. Final voice must be human-edited.
- Anything Standards Board members will sign their name to. Reviewers
  expect the work to be written by a person.

### The rule

If you used AI to draft a section, the version that ships has been
re-read by a human who would defend every sentence as their own. If you
can't say that, the section doesn't ship.

This is the same standard AiBI teaches bankers: AI can draft, but the
banker owns what goes out. We hold ourselves to it.

---

## The ship bar

A section is ready to publish when all of these are true:

- [ ] Voice matches the brand-guide § Voice description
- [ ] Zero banned phrases (blocker-tier — see § Banned phrases above)
- [ ] No slop phrases (style-tier — see § Slop phrases above)
- [ ] Every claim that could be challenged is cited to a named source
- [ ] At least one banker-specific example anchors the section in real
      practice (for Standards content) or one named institution/source
      (for research content)
- [ ] Reviewed by at least one person other than the author
- [ ] Citations validate against the bibliography (build doesn't break)
- [ ] Cross-references validate (build doesn't break)
- [ ] Read aloud once — sentences that stumble get rewritten
- [ ] Final pass: would the founder defend every sentence to a community
      bank CRO across the table?

If any item fails, the section is not ready. There is no "we'll fix it
later" for V1 publication.

---

## The structural conventions

For Standards section content specifically:

### Section opening

Open with the claim, not the setup. Bankers reading the Rubric scan first.
The first sentence of any component, level, or dimension must establish
what the section is about in plain language.

**Good opening:**
> Accountability is the spine of the Banker AI Fluency Rubric.

**Bad opening:**
> In today's rapidly evolving regulatory landscape, accountability for AI
> outputs has emerged as one of the most critical considerations for
> community bankers seeking to integrate artificial intelligence into
> their operations.

### Paragraph length

200 words per paragraph maximum. 80–120 is typical. Long paragraphs are
fine for genuinely complex arguments; pad-length paragraphs are not.

### Sentence length

Mix. A run of all 25-word sentences reads as AI output. A run of all
8-word sentences reads as marketing copy. Vary deliberately. Read aloud
to feel the rhythm.

### Bullet points

Used sparingly. Standards content is mostly prose. Bullets are appropriate
for:

- Genuinely list-shaped content (the four components, the six dimensions)
- Step-by-step processes (the citation process above)
- Comparison tables (handled with actual tables, not bullets)

If a section is mostly bullets, it's an outline, not a finished section.

---

## A note on length

V1 of the Standards is long — roughly 20,000–25,000 words of original
content across the two frameworks, glossary, and bibliography. Resist the
urge to compress it for "skimmability."

The reader is a community bank CRO, compliance officer, or strategic
planner. They are accustomed to reading FFIEC guidance documents that
are 50+ pages of careful, dry prose. They do not need to be entertained.
They need to be able to *defend* the framework when their board asks
where it came from.

Long, careful, citation-rich prose is what institutional credibility looks
like. Short, punchy, marketing-friendly copy is what a SaaS landing page
looks like. AiBI is the former.

---

## See also

- `../brand/brand-guide.md` — voice, banned phrases, design system
- `../standards/fluency-rubric-spec.md` — what to author for the Rubric
- `../standards/transformation-framework-spec.md` — what to author for
  the Framework
- `../standards/publication-standards.md` — license, versioning, MDX
  schema, anchor stability
- `../decisions-log.md` — resolved decisions on voice and authorship
