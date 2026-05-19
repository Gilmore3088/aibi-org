# SME interview brief — Compliance starter kit

**From:** The AI Banking Institute
**To:** [Compliance Officer / BSA/AML Deputy / TPRM Lead SME]
**Estimated time:** 30 minutes
**Return by:** [insert deadline]

## Why we're asking you

We're building a "Compliance" starter kit inside The AI Banking
Institute's toolbox — five AI tools you'd keep on your desk for
the work that nobody else wants: vendor risk language, exception
letters, regulator-friendly summaries, citation-checked research,
policy reviews.

We've shipped the BSA-officer kit; yours is next. Your tools
become the reference five for every compliance officer who joins
the Institute, so we need them grounded in real practice — the
TPRM exception that's overdue, the policy paragraph the regulator
flagged, the executive summary you owe the board.

## What we need from you

Five **tool slots**, each one a separate prompt / skill / agent
you'd actually use. For each, give us:

1. **What it does** — one sentence, plain English.
2. **When you'd reach for it** — the trigger that makes you open
   the tool instead of writing from scratch.
3. **The body** — the actual instructions you'd give the LLM,
   written in the structured format below.
4. **One worked example** — a realistic input (sanitize any real
   vendor / examiner / policy text) plus the kind of output you'd
   want back.

A blank template for each slot is below. Fill what you can. Skip
what doesn't fit — three excellent tools beat five mediocre ones.

## The format we use (and why)

Every tool in the Institute's library follows the same skeleton.
It's heavy on purpose — examiner-grade output requires structure,
not vibes.

```
<role>           who the LLM is acting as, who reads the output
<inputs>         named placeholders for what you'll feed it
<task>           what to produce, with a length cap
<style>          what to enforce, what to strip
<process>        thinking steps the model does silently
<output_format>  exactly how the final output is shaped
<gates>          pre-send checks that catch mistakes
<example>        one realistic worked input + output
```

You don't have to fill in every section — our editor will round
it out — but the more of the skeleton you populate, the closer
your draft is to ship-ready.

The BSA kit's "Vendor TPRM exception letter" prompt is the
closest existing analog. See [`bsa-officer-reference.md`](./bsa-officer-reference.md).

## What we'll do with your input

1. Editorial pass for banned phrases and unsourced claims.
2. Port your five tools into the toolbox codebase.
3. Credit you by name (with your permission) in the kit metadata.
4. Send you the live URL once it ships so you can use it yourself.

---

## Suggested slot inventory (starting point — change anything)

Compliance kits we've seen in practice tend to cluster around:

- **Slot 1 (Prompt):** Vendor risk language for a TPRM file — references the right policy citation, no legal conclusions
- **Slot 2 (Prompt):** Exception letter generator — issuer side, formal, no threats, legal-review hook
- **Slot 3 (Prompt):** Regulator-friendly executive summary — one page, plain English, decision-ready
- **Slot 4 (Skill):** Citation-checked research extract — every quantitative claim links to a source span
- **Slot 5 (Agent):** Three-pass policy-document reviewer — facts / tense / hedges, with stop-on-fail

Use these or replace any. The two questions we have specifically
for you:

1. **Reg framework focus** — do you want one of the slots dedicated
   to a specific reg you live with (Reg E? Reg O? UDAAP?
   FFIEC IT examination? CIP refresh?), or do you want generality?
2. **Regulator preference** — should the tools produce output
   that's calibrated to a specific examiner relationship (FDIC?
   OCC? state? NCUA?), or stay framework-neutral?

Reply with whichever cuts; we'll thread them through the brief.

---

## Slot template — copy this five times

### Slot N: [your tool name]

**Type:** Prompt / Skill / Agent / Playbook (pick one)

**What it does (one sentence):**

**When you'd reach for it (the trigger):**

**Body:**

```
<role>
You are a [job title], drafting/reviewing/extracting/grading
[...] for [reader: an examiner / the board / in-house counsel /
the vendor].
</role>

<inputs>
  <[name]>{{PLACEHOLDER}}</[name]>
  <[name]>{{PLACEHOLDER}}</[name]>
</inputs>

<task>
[One paragraph. What to produce. Length cap or section list.]
</task>

<style>
- [What to enforce — formal register, neutral framing, specific
  policy citations]
- [What to strip — threats, legal conclusions, marketing voice,
  speculation about intent]
- [Sourcing rule — every claim cites the source span or the
  policy section]
</style>

<process>
Silent steps the model takes before drafting:
1. [...]
2. [...]
3. [...]
</process>

<output_format>
[Exactly what the final emission looks like. Letter? Memo?
Structured JSON for ingestion? Where word count goes.]
</output_format>

<gates>
1. [Pre-send check — e.g. no legal conclusion words detected]
2. [Pre-send check — e.g. legal-review hook present]
3. [Pre-send check — e.g. every {{PLACEHOLDER}} resolved]
</gates>
```

**Worked example:**

```
INPUT:
[Realistic vendor situation, policy text, examiner finding.
Sanitize real names and identifiers.]

OUTPUT:
[What you'd want the LLM to produce. Examiner-ready voice.]
```

---

## Reference: shipped BSA-officer "Vendor TPRM exception letter"

For full context on a finished compliance-style tool, see
[`bsa-officer-reference.md`](./bsa-officer-reference.md). The TPRM
letter and the three-pass memo reviewer are both close in shape
to what compliance tools tend to look like.

## Editorial conventions to keep in mind

- **No legal conclusions.** Tools drafting letters or summaries
  state observations, not legal positions. Every output ends with
  a `[LEGAL REVIEW]` hook for in-house counsel sign-off.
- **No threats.** Escalation language stays factual and references
  the agreement's dispute-resolution section, never litigation.
- **No banned phrases.** "Unlock," "supercharge," "leverage,"
  "revolutionize," "FFIEC-aware," "best-in-class" — all forbidden.
- **No unsourced statistics.** If a tool references a number, it
  cites the source span or the policy section. Use the named
  Institute statistic list in `CLAUDE.md` for any aggregate claims.
- **Past tense, third person** for narrative outputs. Present
  tense fine for active correspondence.
- **Citation discipline.** Every quantitative claim must link to
  the source span in the input — orphan numbers fail.

## Questions for us?

Reply to this brief with anything that's unclear. We'll turn
around answers same-day.

Thank you — compliance is where the Institute's promise of
"examiner-ready" lives or dies, and your time on this directly
shapes how the next compliance officer learns to use these tools.
