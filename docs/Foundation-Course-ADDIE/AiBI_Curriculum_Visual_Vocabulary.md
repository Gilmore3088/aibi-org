# AiBI Foundation — Curriculum Visual Vocabulary
*The set of in-body visual blocks every lesson can use to give text-heavy narration a richer, more scannable shape.*

**Authority:** Supplements the M0 curriculum doc template (`AiBI_Module_0_Orientation.md`). Pairs with `AiBI_Design_System_Spec.md` (which owns the underlying tokens) and `AiBI_Foundation_Course_ADDIE_Design_v2.md` (which owns pedagogy). When content authors need a visual treatment beyond plain prose, this is the menu.

**Implemented by:** `src/components/addie/lesson/LessonBody.tsx`. The renderer is markdown-subset; everything below is what it actually parses today.

---

## Why this exists

A typical lesson is ~10–15 minutes of narration. Read straight through as plain markdown, the page is a wall of paragraphs and a blockquote — the reader skims, retains 30%, and bounces to the knowledge check. The blocks below give the same content a shape the eye can scan: stats stand out as numbers, examples land as case cards, callouts cluster best-practice and warnings where the reader expects them.

**The rule:** every block earns its line break. Don't use a stat card for a citation that belongs in prose. Don't use a case card for a one-sentence example. The blocks below are tools, not decoration — if removing the block doesn't lose information density, leave it out.

---

## The vocabulary (what the renderer parses)

### 1. Section headers — `## h2` / `### h3`
The basic spine. `## SCRIPT` and `## PRODUCTION` are stripped at render time (production scaffolding for the operator, not the learner). Numbered "Lesson 1.1" `##` headings render as a `§` mono-caps lead-in with a hairline rule.

### 2. Hero quote — long blockquote
A long `> ... > ...` block (≥2 paragraphs or >280 chars) auto-renders as a hero quote — parchment card, dropcap on the first paragraph, gold open-quote glyph. This is what carries narration in most lessons today.

### 3. Numbered scene cards — `**One: …**` / `**Two: …**` / `**Three: …**`
Inside a hero quote, bold leads `**One: <lead>.**` get extracted into a numbered scene-card sequence: big serif numeral on the left, bold lead as h4, body to the right. A closing paragraph that starts with "Hold those …", "Together …", "In short …", "Taken together …" promotes itself into a dark ink "Mental model" recap card.

### 4. Knowledge-check anchors — `### question?`
H3 headings inside a `### CHECK` block render as the lesson's check items. Rendering is owned by `KnowledgeCheck.tsx`, not LessonBody.

### 5. Callouts — `> [tip] …` / `> [warn] …` / `> [save] …` / `> [field] …`
Inline cards with a kicker label and a colored left rule.
- **`[tip]`** — gold rule. "Try this." Practical move.
- **`[warn]`** — oxblood rule. "Watch out." Risk or anti-pattern.
- **`[save]`** — ink rule, parchment-tape fill. "Save this." Memorize-this-line moment.
- **`[field]`** — navy rule. "From the field." Real example, attributed loosely.

### 6. Stat cards — `> [stat] value | source | takeaway`
Sourced-statistic card. Big serif number on the left, citation in mono caps, editorial implication line as the body. Pipe-delimited; all three parts required.

Example:
```
> [stat] ~65% | FDIC Quarterly Banking Profile, Q4 2024 | Community-bank median efficiency ratio. The ten-point gap to the industry is where AI savings land.
```

Renders as a single card across the lesson width. Use sparingly — one per lesson, at most two. If you need more, the body of the lesson is the problem, not the renderer.

### 7. Case-study cards — `> [case:good] Title` / `> [case:bad] Title`
A two-paragraph case-study card with an optional `> [outcome] one-line outcome` footer. Consecutive `[case:…]` blocks automatically group into a grid (1 → single, 2 → side-by-side, 3+ → three-up on lg+).

`good` carries the ink left-rule and an ink outcome footer. `bad` carries the oxblood left-rule and an oxblood outcome footer. The kicker label reads "Good use" or "Bad use" — the pattern is binary by design (the lesson teaches the difference, the cards visually reinforce it).

Example:
```
> [case:good] Rewriting a member letter for clarity
> A back-office colleague drafts an overdraft notice. Technically correct, almost
> unreadable. They paste the generic, anonymised draft into an assistant — no
> names, no account numbers — and ask for plain English at an eighth-grade
> reading level, warm, two sentences shorter.
> [outcome] Twenty minutes, not an hour. The member gets a letter they can understand.

> [case:bad] Pasting a member's full file into a public tool
> Name, account number, income, employer, the lot. This is the rule from
> orientation and it is the one to be religious about.
> [outcome] Same letter, written from the anonymised situation instead. None of the file.
```

Use when a lesson teaches by example. Three good + two bad is the canonical M1.4 shape; two good + one bad fits a 10-minute lesson better.

### 8. Inline markdown — strong, emphasis, code, links
Standard subset. `**strong**` renders ink-weight; `*emphasis*` renders as strong (italics are retired site-wide per CLAUDE.md). Inline ``` `code` ``` gets a parchment-fill chip. `[link text](url)` renders gold with subtle underline; external links open in a new tab.

---

## When to reach for what

| Situation | Block to use |
|---|---|
| The lesson opens with a load-bearing number | `[stat]` immediately after the lede |
| You're teaching by example with 2+ examples | `[case:good]` / `[case:bad]` grid |
| One practical move worth memorizing | `[tip]` callout |
| One pitfall the learner will hit | `[warn]` callout |
| A short artifact-quality line ("this is the move") | `[save]` callout |
| Real-world anecdote, lightly attributed | `[field]` callout |
| Three concept "beats" that build on each other | Numbered scene cards (`**One: …** **Two: …** **Three: …**` inside a blockquote) |
| One long paragraph of narration | Hero quote (default behavior) |
| The "everything together" recap | Closing paragraph in the hero quote starting with "Hold those …" or "Together …" — auto-promotes to dark Mental model card |

---

## What NOT to do

- **Don't decorate.** If the block doesn't add scannability or density, don't add it. A lesson with six callouts and three stat cards is harder to read, not easier.
- **Don't break a case grid up.** If you have five good + two bad like M1.4, write them as one continuous run of `[case:…]` blocks; the renderer groups them. Don't intersperse narration that would force separate grids.
- **Don't quote a statistic in prose AND in a `[stat]` card.** Pick one. The card wins.
- **Don't use `[save]` for narration.** It's for short, memorable lines the learner should screenshot.
- **Don't author italics.** Italics are retired site-wide (CLAUDE.md, 2026-05-21). The renderer will pass them through but the global CSS strips slant — use `**strong**` for emphasis.
- **Don't put `[stat]` or `[case]` cards inside the `## SCRIPT` block.** The SCRIPT block is verbatim narration for the operator to read aloud. Visual blocks belong outside the SCRIPT block, in the lesson body proper.

---

## Worked example — M1.4 upgrade

Before this vocabulary, the M1.4 "good vs. bad use in a bank" lesson was a single hero quote with five `**One: …**` numbered scene cards — long, dense, hard to scan, the good-vs-bad distinction visible only through reading. After: an opening efficiency-ratio `[stat]` card sets the hook, then five `[case:…]` cards lay out as a three-up grid above two-up below, ink for the good uses and oxblood for the bad, each with a one-line outcome footer. Same content, dramatically more scannable. See `supabase/seed/m1_addie.sql` for the diff.

---

## Adding a new block type

When a new visual treatment is genuinely needed:

1. Open `AiBI_Curriculum_Visual_Vocabulary.md` (this doc) and propose the block as a one-paragraph spec (syntax + when to use + when not to use).
2. Get reviewer sign-off.
3. Extend `src/components/addie/lesson/LessonBody.tsx` — add the parser branch in `splitBlocks`, add the render branch in `renderBlock`, add the type to the `Block` union.
4. Add a test in `lessonHeadings.ts` or a snapshot test next to LessonBody.
5. Update this doc with the new entry under §2 vocabulary and the §"When to reach for what" table.
6. Cite the visual vocabulary spec from any author note in the seed SQL where the new block first appears.

The vocabulary is intentionally small. Eight blocks is the right ceiling for the foreseeable future — beyond that, the lesson body becomes its own design system instead of an editorial scaffold.

---

*Last updated 2026-05-24. Pairs with `AiBI_Module_0_Orientation.md`, `AiBI_Design_System_Spec.md`, `AiBI_Foundation_Course_ADDIE_Design_v2.md`. Update when LessonBody.tsx gains or loses a block type.*
