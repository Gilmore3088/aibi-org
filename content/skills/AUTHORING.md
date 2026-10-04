# Writing a banker skill

This is the standard for every skill in `content/skills/`. It is used by people
writing new skills and by the weekly improvement run that revises them.

The model skill is **E1 Rewrite this email** in `everyday.ts`. Match its depth.

## Who it is for

A community-bank or credit-union employee: teller, branch manager, lender,
compliance officer, BSA analyst, operations, marketing, IT, HR, executive. They
are busy, careful, and not technical. They will fill in the blanks, run the
skill, and check the result before it goes anywhere.

## The shape (types in `types.ts`)

- **name**: from `catalog.ts`, exactly. Never rename here.
- **slug**: kebab-case of the name (`write-a-formula-for-this`).
- **useWhen / youGet**: one plain sentence each, 25 words or fewer.
- **fields**: 2-6. `snake_case` keys. Each has a plain label, a realistic
  example (invented names and numbers only), a kind (`text`, `long`, `file`,
  `choice`), and `required`. Optional fields get a default stated in the
  instructions ("if blank, use ..."). A field holding a file the bank supplies is
  named `*_path` or `template_path`.
- **instructions**: the skill itself, addressed to the model, 150+ words, with
  these section headers on their own lines, in this order:
  `ROLE`, `CONTEXT`, `TASK`, `OUTPUT`, `RULES`, `IF SOMETHING IS MISSING`.
  - ROLE: one or two sentences. A specific job at a community bank.
  - CONTEXT: every field, labeled. Long pasted text goes between `"""` fences.
  - TASK: numbered steps a careful professional would follow.
  - OUTPUT: the exact shape of the answer: headings, tables, order, length.
  - RULES: the guardrails. Always include "do not invent facts, numbers,
    dates or names that are not in what I gave you" in the skill's own words.
  - IF SOMETHING IS MISSING: ask, don't guess. Say what to ask for.
- **checks**: 3-5 things the banker verifies before using the output.
- **neverPaste**: one line on what data never goes in.
- **example**: realistic filled inputs and a believable output, all invented.
- **tests**: 2-3 cases for the improvement loop. One normal case, one hard
  case (missing input, messy input, a trap like a request to invent a reason).
  Each has 2-5 checkable rubric lines.
- **usesTemplate**: true only when the skill fills or applies a bank-supplied
  file (deck master, spread workbook, tracker template).
- **apps**: where it runs best: `Chat`, `Outlook`, `Word`, `Excel`,
  `PowerPoint`, `Teams`.

## Excel and PowerPoint skills

These run inside Claude for Excel and Claude for PowerPoint, on the file that is
open. Write them that way: "In the open workbook, add a tab named ...", "Do not
overwrite source data; write results to a new tab", "Keep every number exactly
as it appears in the source". A template skill says: "Use the template at
{{template_path}} (or the template bundled with this skill). Keep its layouts,
fonts and colors; only fill the placeholders."

## Banking accuracy

- Name regulations correctly (Regulation B / ECOA, Regulation DD / TISA,
  Regulation E, Regulation CC, UDAAP, BSA, GLBA, FCRA). Do not state a numeric
  threshold, deadline or dollar amount unless you are certain it is current. When
  in doubt, take it as a field or say "per your policy" and tell the banker to
  confirm with compliance.
- Never mention SR 11-7 except as the guidance SR 26-2 superseded in April 2026.
- No statistics. No percentages attributed to a source. Any number in an example
  is invented and must look it (a fictional bank, a fictional branch).
- Skills that touch members, borrowers or suspects work only on redacted or
  synthetic input and say so. SAR-related skills never tell the subject anything
  and never put SAR existence into any member-facing text.
- Fair lending: never infer or use protected characteristics. Adverse-action
  skills use only the reasons the banker supplies.

## Voice

Plain, specific, calm. Short sentences. No hype, no exclamation points, no
"leverage", "utilize", "seamless", "game-changer". "You" is the banker.

## Checks before you finish

`npx vitest run content/skills -t "<ID prefix>"` passes for your skills,
`npx tsc --noEmit` is clean, and `node scripts/check-claims.mjs` passes.
