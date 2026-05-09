# Tool logos

`<ToolGrid>` renders a vendor logo from this directory. Each file is loaded by slug:

| Slug | Expected file | Tool | Vendor |
|---|---|---|---|
| `chatgpt` | `chatgpt.svg` | ChatGPT | OpenAI |
| `claude` | `claude.svg` | Claude | Anthropic |
| `copilot` | `copilot.svg` | Microsoft Copilot | Microsoft |
| `gemini` | `gemini.svg` | Google Gemini | Google |
| `notebooklm` | `notebooklm.svg` | NotebookLM | Google |
| `perplexity` | `perplexity.svg` | Perplexity | Perplexity AI |

Source each SVG from the vendor's official brand page (nominative fair use applies for educational reference). Each vendor publishes its press / brand resources at:

- OpenAI — https://openai.com/brand
- Anthropic — https://www.anthropic.com (look for the press / brand kit link in the footer)
- Microsoft — https://www.microsoft.com/en-us/legal/intellectualproperty/Trademarks/UsageGuidelines (strict — read before use)
- Google — https://about.google/brand-resource-center/
- Perplexity — https://www.perplexity.ai (request via their press contact if no direct download)

## Constraints

- Square or short-aspect SVGs render best (the tile reserves `max-h-12 max-w-[60%]`).
- Drop in the original SVG; the component does not apply color filters by default. If a logo conflicts with the parch palette and you want it monochromed, add a `class` to the `<img>` (e.g. `[filter:grayscale(1)_brightness(0)]`) in `ToolGrid.tsx`.
- Do not redraw or modify the vendor's logo. Use the official mark verbatim.

## Missing files

The component renders the `<img>` regardless. If the file is missing, the alt text appears in place of the logo (or a broken-image icon, depending on browser). Add the file to fix.
