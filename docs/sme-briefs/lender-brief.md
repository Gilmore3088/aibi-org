# SME interview brief — Lender starter kit

**From:** The AI Banking Institute
**To:** [Lender / Commercial Loan Officer / Credit Analyst SME]
**Estimated time:** 30 minutes
**Return by:** [insert deadline]

## Why we're asking you

We're building a "Lender" starter kit inside The AI Banking
Institute's toolbox — a set of five AI prompts, skills, and agents
that a credit officer would actually keep on their desk for the
real work of underwriting, structuring, and communicating credit
decisions. We've already shipped the BSA-officer kit; yours is
next.

Your tools become the reference five for every lender who joins
the Institute. We need them grounded in real practice, not
generic templates.

## What we need from you

Five **tool slots**, each one a separate prompt / skill / agent
that you would actually use. For each, give us:

1. **What it does** — one sentence, plain English.
2. **When you'd reach for it** — the trigger that makes you open
   the tool instead of writing from scratch.
3. **The body** — the actual instructions you'd give the LLM,
   written in the structured format below.
4. **One worked example** — a realistic input + the kind of
   output you'd want back.

A blank template for each slot is on the next page. Fill what you
can. Skip what doesn't fit; we'd rather have three excellent tools
than five mediocre ones.

## The format we use (and why)

The Institute teaches a specific way to write prompts because it
works in production. Every tool follows the same skeleton:

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

You don't have to fill in every section — we'll do the editorial
pass — but the more of the skeleton you populate, the closer your
draft is to ship-ready.

**One real example from the BSA kit** is on the page after the
slots. Skim it if you want to see what a finished tool looks like.

## What we'll do with your input

1. Editorial pass for banned phrases and unsourced claims.
2. Port your five tools into the toolbox codebase.
3. Credit you by name (with your permission) in the kit metadata.
4. Send you the live URL once it ships so you can use it yourself.

---

## Suggested slot inventory (starting point — change anything)

The shipped BSA kit has a Prompt / Skill / Agent / Playbook split.
Lender kits we've seen in practice tend to cluster around:

- **Slot 1 (Prompt):** Borrower-context summary from supplied loan docs
- **Slot 2 (Prompt):** ECOA / Reg-B-compliant adverse action letter
- **Slot 3 (Skill):** Extract financial covenants into a structured table
- **Slot 4 (Agent):** Four-pass credit memo scaffold (borrower → sources → risk → recommendation)
- **Slot 5 (Playbook):** Bundle of the above as a one-click adopt

Use these or replace any of them. We're more interested in what
**you** actually do than what we guessed.

---

## Slot template — copy this five times

### Slot N: [your tool name]

**Type:** Prompt / Skill / Agent / Playbook (pick one)

**What it does (one sentence):**

**When you'd reach for it (the trigger):**

**Body:**

```
<role>
You are a [job title], drafting/reviewing/extracting/scoring [...]
for [reader: a credit committee / a senior underwriter / the
borrower's principal / etc.].
</role>

<inputs>
  <[name]>{{PLACEHOLDER}}</[name]>
  <[name]>{{PLACEHOLDER}}</[name]>
</inputs>

<task>
[One paragraph. What to produce. Length cap or section list.]
</task>

<style>
- [What to enforce — tense, voice, specificity]
- [What to strip — hedging, judgement, marketing language]
- [Sourcing rule — every number cites a span, no extrapolation]
</style>

<process>
Silent steps the model takes before drafting:
1. [...]
2. [...]
3. [...]
</process>

<output_format>
[Exactly what the final emission looks like. Tags, sections,
where the word count goes.]
</output_format>

<gates>
1. [Pre-send check]
2. [Pre-send check]
</gates>
```

**Worked example:**

```
INPUT:
[Realistic borrower data, financial figures, situation]

OUTPUT:
[What you'd want the LLM to produce. Real banker voice.]
```

---

## Reference: shipped BSA-officer "SAR-grade narrative frame"

For full context on how a completed tool reads, see
[`bsa-officer-reference.md`](./bsa-officer-reference.md) in this same
folder. That tool is currently in production and demonstrates every
section the format expects.

## Editorial conventions to keep in mind

- **No banned phrases.** "Unlock," "supercharge," "leverage,"
  "revolutionize," "FFIEC-aware" — all forbidden. Plain banker
  English only.
- **No unsourced statistics.** If a tool references a number, it
  needs to come from FDIC, FFIEC, GAO, or a named industry survey.
- **Specific quantities over qualitative claims.** "Strong cash
  flow" is not acceptable; "DSCR of 1.45x trailing twelve months"
  is.
- **Past tense, third person** for any tool whose output goes
  into a record (memos, narratives). Present tense is fine for
  letters and live communication.

## Questions for us?

Reply to this brief with anything that's unclear. We'll
turn around answers same-day.

Thank you — your time on this directly shapes how every other
lender at the Institute learns to use these tools.
