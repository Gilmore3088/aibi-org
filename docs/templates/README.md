# `docs/templates/` — Operator collateral templates

Branded HTML/print assets for off-platform use. Not part of the website
runtime. Edit, copy, paste into the appropriate downstream tool.

| File | Use | Output format |
|---|---|---|
| `email-signature.html` | Branded HTML signature for `hello@aibankinginstitute.com` | Paste into Gmail / Outlook / Apple Mail signature settings |
| `engagement-report-cover.html` | One-page cover sheet for engagement reports (Briefings, Quick Win Sprint readouts, etc.) | Print-to-PDF (Letter, no margins) or pipe through `scripts/generate-template-pdfs.mjs` |

Both are self-contained HTML files using inline styles + system fonts +
inline SVG, so they render identically across email clients and print
engines without dependencies. Each file has its own usage notes in a
top comment.

## Design system reference

Mockup tokens (used by both files):

```
--ink         #071A2F  navy (primary dark)
--gold        #C8A24A  primary accent
--gold-deep   #9A7A2F  kicker / metadata
--cream       #F7F3EA  page surface
--slate-600   #475569  body text
--slate-500   #64748B  secondary text
--slate-200   #E2E8F0  hairline
```

Adding a new operator template here? Match the same constraints:
inline styles only, system fonts, inline SVG, single self-contained
file per deliverable.
