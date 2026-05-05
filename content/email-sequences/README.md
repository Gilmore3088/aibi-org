# Assessment Follow-Up Email Sequences

Source content for the four ConvertKit Sequences shipped in Spec 3
(PR #42). Drafted as Markdown so you can review and edit in-repo,
then paste into the ConvertKit dashboard editor.

**Don't link this directory from anywhere — it's an authoring workspace,
not a production surface.** The actual emails go out from CK once you
copy each tier's three files into the matching CK Sequence.

## Layout

```
content/email-sequences/
├── starting-point/
│   ├── 01-day-0-brief-ready.md      ← subject + body for Email #1
│   ├── 02-day-3-future-vision.md
│   └── 03-day-7-conversion-ask.md
├── early-stage/                      (same shape)
├── building-momentum/                (same shape)
└── ready-to-scale/                   (same shape)
```

Each file leads with frontmatter: `subject`, `delay`, `tags`. The body
is the email content. Personalization variables use ConvertKit's
mustache syntax: `{{ subscriber.first_name | default: "" }}` etc.

## Authoring conventions (per CLAUDE.md brand voice)

- Lowercase-leading subject lines, no exclamation marks, no emoji.
- Plain prose. No "AI-powered" badges, no breathless adjectives.
- Every statistic must trace to a named source in CLAUDE.md's
  Sourced Statistics table. If a draft below uses a stat, the source
  is in a footnote at the bottom of the file.
- The closing CTA matches the on-screen `TIER_CLOSING_CTA` content
  in `content/assessments/v2/personalization.ts`. If you change one,
  change the other.

## How to load these into ConvertKit

1. Open the matching Sequence in CK (e.g. "AiBI Assessment Follow-Up
   — Starting Point").
2. For each of the three emails:
   - Copy the `subject:` value from the frontmatter into CK's subject field.
   - Copy the body Markdown into CK's email editor.
   - Set the delay per the `delay:` value (Day 0 = 1–2 hours after tag,
     Day 3 = 3 days, Day 7 = 7 days).
   - Save.
3. Activate the Sequence.
4. Test by sending a Preview from CK to your own address.

## When to revise

If you change tier copy in `content/assessments/v2/personalization.ts`
(persona, big-insight, dimension content), check whether Email #2 still
matches. The future-vision content the email leans on lives in
`content/assessments/v2/pdf-content.ts:PDF_FUTURE_VISION` —
re-read both before editing one.

## Drafted

- 2026-05-05 — initial drafts for all 12 emails. James reviews + edits
  before pasting into CK dashboard.
