# Self-hosted web fonts

Latin-subset woff2 builds of the site's Google Fonts families, committed so
`next build` never fetches fonts.googleapis.com (that build-time fetch was the
repo's only recurring CI flake). Loaded via `next/font/local` in
`src/app/layout.tsx`.

| File | Family | Axes / weight |
| --- | --- | --- |
| newsreader-latin-opsz-{normal,italic}.woff2 | Newsreader | variable [opsz, wght 200–800] |
| inter-latin-wght-normal.woff2 | Inter | variable [wght 100–900] |
| jetbrains-mono-latin-wght-normal.woff2 | JetBrains Mono | variable [wght 100–800] |
| cormorant-sc-latin-400-normal.woff2 | Cormorant SC | static 400 |
| instrument-serif-latin-400-italic.woff2 | Instrument Serif | static 400 italic |

Source: the [@fontsource](https://fontsource.org) builds of the upstream
Google Fonts releases. All families are licensed under the SIL Open Font
License 1.1, which permits bundling and redistribution; upstream license
texts live with each family on Google Fonts / its source repository.

To update a family: `npm pack @fontsource-variable/<family>` (or
`@fontsource/<family>` for static cuts), copy the matching `files/*-latin-*`
woff2 here, keep the filename, and rebuild.
