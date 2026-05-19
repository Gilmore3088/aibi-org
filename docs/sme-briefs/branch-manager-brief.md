# SME interview brief — Branch manager starter kit

**From:** The AI Banking Institute
**To:** [Branch Manager / Member Service Lead SME]
**Estimated time:** 30 minutes
**Return by:** [insert deadline]

## Why we're asking you

We're building a "Branch manager" starter kit inside The AI Banking
Institute's toolbox — five AI tools you'd keep on your desk for the
weekly rhythm of coaching, complaints, communications, and the
hundred small member-facing decisions that nobody else handles.

We've already shipped the BSA-officer kit; yours is next. Your
tools become the reference five for every branch manager who joins
the Institute, so we need them grounded in real practice — the
member email you're about to send, the coaching note you owe a
new teller, the huddle you're prepping for Monday.

## What we need from you

Five **tool slots**, each one a separate prompt / skill / agent you
would actually use. For each, give us:

1. **What it does** — one sentence, plain English.
2. **When you'd reach for it** — the trigger that makes you open
   the tool instead of writing from scratch.
3. **The body** — the actual instructions you'd give the LLM,
   written in the structured format below.
4. **One worked example** — a realistic input (sanitize any real
   member data) plus the kind of output you'd want back.

A blank template for each slot is below. Fill what you can. Skip
what doesn't fit — three excellent tools beat five mediocre ones.

## The format we use (and why)

Every tool in the Institute's library follows the same skeleton.
It looks heavy, but the structure is what makes the LLM behave
predictably under real workload.

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

The BSA kit's "tense + voice check" tool is a great example of
a finished skill. See [`bsa-officer-reference.md`](./bsa-officer-reference.md).

## What we'll do with your input

1. Editorial pass for banned phrases and unsourced claims.
2. Port your five tools into the toolbox codebase.
3. Credit you by name (with your permission) in the kit metadata.
4. Send you the live URL once it ships so you can use it yourself.

---

## Suggested slot inventory (starting point — change anything)

Branch-manager kits we've seen in practice tend to cluster around:

- **Slot 1 (Prompt):** Member complaint response — empathetic, regulator-friendly, fair-lending-aware
- **Slot 2 (Prompt):** Weekly huddle prep brief — three items, ranked, no jargon
- **Slot 3 (Skill):** Coaching note tone check — fair, specific, behavioral (not personal)
- **Slot 4 (Prompt):** Member follow-up after an escalation — apology that doesn't admit liability
- **Slot 5 (Playbook):** Bundle of the above as a one-click adopt

Use these or replace any of them. We care more about what **you**
actually do than what we guessed.

A specific question: do you have an AI tool you'd want for the
**back-office work** that branch managers absorb — staffing schedule
revisions, vault audits, ATM balance reconciliations — that we
should swap into one of the slots? Tell us.

---

## Slot template — copy this five times

### Slot N: [your tool name]

**Type:** Prompt / Skill / Agent / Playbook (pick one)

**What it does (one sentence):**

**When you'd reach for it (the trigger):**

**Body:**

```
<role>
You are a [job title], drafting/reviewing/coaching/responding to
[...] for [reader: a member / a teller / the regional manager /
the compliance file].
</role>

<inputs>
  <[name]>{{PLACEHOLDER}}</[name]>
  <[name]>{{PLACEHOLDER}}</[name]>
</inputs>

<task>
[One paragraph. What to produce. Length cap or section list.]
</task>

<style>
- [What to enforce — tone, register, specificity, fair-lending
  carefulness]
- [What to strip — defensiveness, hedging, blame language]
- [Voice rule — first or third person, when to use member names,
  when to apologize without admitting liability]
</style>

<process>
Silent steps the model takes before drafting:
1. [...]
2. [...]
3. [...]
</process>

<output_format>
[Exactly what the final emission looks like. Plain email? Memo?
Coaching note? Word cap goes in a final tag.]
</output_format>

<gates>
1. [Pre-send check — e.g. no protected-class references]
2. [Pre-send check — e.g. member name resolved, not {{member}}]
</gates>
```

**Worked example:**

```
INPUT:
[Realistic member situation, complaint text, coaching context.
Sanitize any real names / account numbers.]

OUTPUT:
[What you'd want the LLM to produce. Real branch voice.]
```

---

## Reference: shipped BSA kit

For full context on how a completed tool reads, see
[`bsa-officer-reference.md`](./bsa-officer-reference.md). The
"BSA tense + voice check" skill is the closest analog to what
a branch-manager coaching-note checker might look like.

## Editorial conventions to keep in mind

- **Member-safe language.** No accusatory tone, no language that
  implies a member is at fault before the facts are in, no
  protected-class references.
- **No banned phrases.** "Unlock," "supercharge," "leverage,"
  "revolutionize," "go above and beyond" — all forbidden. Plain
  banker English only.
- **No unsourced statistics.** If a tool references a number, it
  needs to come from a named source.
- **Fair-lending discipline.** Coaching notes and complaint
  responses get extra scrutiny in fair-lending exams. The tools
  should default to fair-lending-aware framing.
- **Past tense, third person** for anything that goes into a
  member file or coaching record. Present tense is fine for live
  member emails.

## Questions for us?

Reply to this brief with anything that's unclear. We'll
turn around answers same-day.

Thank you — branch managers are some of the hardest-pressed people
in any community bank, and your time on this directly shapes how
the next manager who joins us learns to use these tools.
