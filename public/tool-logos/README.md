# Tool logos — currently unused

`<ToolGrid>` renders typeset Cormorant monograms, not vendor logos. This directory is reserved for the future case where formal logo licensing is obtained.

## Why monograms, not logos

After reviewing each vendor's brand policy (2026-05-09):

- **Microsoft** — explicit license required for any logo use; no self-serve path. Educational use does not get a special exemption.
- **Google** — brand resource center is partner-gated. Non-partners directed to general Brand Standards only.
- **Anthropic** — press kit downloadable; specifics require review of the included guidelines.
- **OpenAI / Perplexity** — public brand pages were not retrievable; policies need direct confirmation.

Three of the six vendors clearly gate logo usage behind formal licensing. Mixing real logos for some tiles with fallbacks for others would read as inconsistent design, so the entire grid uses a uniform monogram treatment instead.

## If/when licensing is obtained

To swap the monogram for a real logo on a per-tool basis:

1. Drop the official SVG into `public/tool-logos/<slug>.svg`. Slugs:
   `chatgpt` · `claude` · `copilot` · `gemini` · `notebooklm` · `perplexity`
2. Edit `src/components/system/ToolGrid.tsx` to render an `<img>` (or `<object>` with monogram fallback) for tools where a logo file exists.

Vendor brand pages (for the licensing conversation):

- OpenAI — https://openai.com/brand
- Anthropic — https://www.anthropic.com/press-kit
- Microsoft — https://www.microsoft.com/en-us/legal/intellectualproperty/Trademarks (email trademarks@microsoft.com)
- Google — https://about.google/brand-resource-center → partner application
- Perplexity — press contact via perplexity.ai
