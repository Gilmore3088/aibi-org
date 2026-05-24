# Prompting Cheat Sheet — Five shapes that earn their keep

This is the Lesson 3.3 reading, rendered by the reading lesson player.
Print it. Bookmark it. The five patterns below cover roughly nine out of
every ten prompts a community banker will ever need to write.

Each pattern carries one banking-flavored example you can lift and
adapt. None of them require real customer data — that rule from Module
0 still governs everything.

---

## Pattern 1 — Role + Task + Format

The default brief. Name who the model should pretend to be, what to do,
and what the output should look like. Three lines, one prompt. Most
one-shot questions become twice as useful once you stop skipping these
three lines.

**Why it works.** Role sets vocabulary and depth. Task converts a vague
ask into a verb plus a noun plus an audience. Format prevents the model
from defaulting to a wall of paragraphs when you wanted bullets.

**Banking example.**

```
You are a compliance analyst at a community bank. Summarize the Reg E
change below for branch tellers. Five bullets, under 150 words, end
with one line tellers can read aloud to a member at the window.
```

---

## Pattern 2 — Few-shot examples

When you want a specific style or structure, show the model two short
examples before asking for the third. The model copies the shape of
what you showed it more reliably than it follows abstract instructions
about tone or voice.

**Why it works.** "Empathetic" is fuzzy. Two examples of empathetic
language are concrete. The model latches onto the pattern.

**Banking example.**

```
Rewrite each complaint summary in a calm, empathetic tone.

Example 1:
"Late fee dispute, customer unhappy" -> "A member is upset about a
late fee they feel was unfair."

Example 2:
"Lost card, customer angry" -> "A member is frustrated after losing
their debit card and needs help quickly."

Now rewrite: "Loan denied, customer confused."
```

---

## Pattern 3 — Chain-of-thought hint

For anything that requires reasoning — comparing two policies, walking
a what-if, pricing a fee scenario, deciding whether a transaction looks
suspicious — ask the model to think before it answers. One line is
enough. The output gets noticeably more careful, and the steps make it
easier for you to audit.

**Why it works.** Without the hint, the model rushes to an answer.
With the hint, it shows its work — which is exactly what you would
want from any analyst reviewing a borderline case.

**Banking example.**

```
Walk through the steps you would take before answering. Then give
me your answer.

Question: under the overdraft policy below, does a $4 latte purchase
that goes $0.30 negative trigger a fee, and what should I tell the
member?

[policy text follows]
```

---

## Pattern 4 — Constraints (what NOT to do)

The model will gladly invent. Tell it what is out of bounds. Constraints
are the difference between a draft you can use and a draft you have to
fact-check line by line.

**Why it works.** Models are trained to be helpful, which sometimes
manifests as confidently citing a regulation that does not exist or
inventing fee amounts that sound plausible. Explicit constraints
foreclose the most common invention patterns.

**Banking example.**

```
Do not cite any regulation that is not named in the text I provide.
Do not invent fee amounts, dates, or member names. If something is not
in the source, say "not specified in the source" instead of guessing.
```

---

## Pattern 5 — Ask for what is missing

When the model gives you a generic, surface-level answer, the cause is
almost always that you did not give it enough to specialize on. Flip
the move: ask the model what it would need to do a sharper job. Then
give it that on the next pass.

**Why it works.** It turns one bad output into two good things — a
checklist of context you should have provided, and a draft the model
can produce with what it had.

**Banking example.**

```
Before drafting, tell me what additional context would let you write a
sharper version of this. Then draft the version you can with the
context I gave you.

Task: a one-page memo for the board on AI risk in community banking.
```

---

## How to stack them

These patterns combine. A real working prompt for a banker often uses
Pattern 1 (role + task + format), Pattern 4 (a constraints line), and
Pattern 5 (one closing instruction telling the model to flag what it
needed but did not have). That is the four-part brief from Lesson 3.1
with one extra safety net.

When you save your three prompts in Lesson 3.5, write them this way.
The Starter Prompt Pack you walk out with should not be five-word
prompts — it should be working briefs you can lift on Monday.
