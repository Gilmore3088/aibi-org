# AI-native page system (2026-10 rebrand)

The rules every marketing page follows. The logo, colours and fonts are
unchanged: the `[Ai] Banking Institute` wordmark, ink `#071A2F`, gold
`#C8A24A`, cream `#F7F3EA`, Newsreader for display, Inter for body,
JetBrains Mono for labels.

## The rules

1. **Real artifacts, not illustrations.** Use the thing itself: a Foundation
   practice rep's starter prompt and model answer, a skill file from
   `public/artifacts/skill-templates/`, the first page of a real PDF
   (`scripts/render-pdf-covers.sh`), the real inventory workbook columns. If
   it is an example, label it ("Synthetic data", "Example output").
2. **No colour-filled cards.** One surface per section. Containers are
   hairline panels — windows, tables, lists — never tiles of navy, gold and
   cream side by side.
3. **Gold is an accent, not a fill.** The primary button, the cursor, the
   active/selected state, and at most one word per headline.
4. **Read as software.** Mono labels, a `>` command line above hero
   headlines, numbered citations `[1]` matched to a sources list, `✓` / `✕`
   checklists.
5. **One moving thing per page, at most.** Motion is for showing AI working
   (the homepage session). Everything respects `prefers-reduced-motion`.
   Tabs and toggles are fine; auto-advancing carousels are not.
6. **Alternate navy and cream; never navy on navy.** Heroes and statements
   are navy (ink + dot grid); content sections alternate with warm cream
   bands (`<AxSection light>` / `.ax-light`). Cards are quiet paper — white
   with a hairline and a soft shadow on cream, warm cream on navy. Documents
   (sheets, briefs, lessons, tables) read as paper; only software (the AI
   session, code windows, cover wells) stays dark. Gold is the one accent.
7. **Show the file.** Library cards lead with page 1 of the real PDF
   (`scripts/render-resource-covers.sh`, which skips any page that cites
   SR 11-7 as current). Briefing cards quote their key figure verbatim from the dek
   (`src/app/briefings/covers.test.ts` enforces it). Pricing plans each lead
   with what the buyer receives.

## Where it lives

- `src/styles/system.css` — the site-wide layer (labels, display type, dark
  surfaces, flat cards) and the `ax-` primitives.
- `src/components/ax/` — `AxHero`, `AxSection`, `AxWindow`, `CopyPrompt`,
  `InventoryPreview`.
- `src/styles/home.css` + `src/components/home/` — homepage pieces,
  including the in-browser prompt checker (`src/lib/prompt-check/`).
- `src/styles/pages.css` — page-level pieces: playbook register and
  document layouts (`pb-`), the article masthead and reading column
  (`ax-article`, used by `ArticleShell`), assessment landing (`as-land-`),
  the example certificate, auth band, and dark-island token restores.
- `MockupShell` renders the content pages (security, FAQ, legal,
  references, certifications, verify) on the system: navy hero, cream
  sections, navy close.
- Link previews: `src/lib/og/articleCard.tsx` (one card for the default,
  each briefing, and each role playbook). Static font instances for it and
  for the template PDFs live in `assets/brand-fonts/`.
- Downloadable PDFs render from `public/downloads/source/*.html`
  (`scripts/generate-source-html-pdfs.mjs`) and the templates from
  `scripts/generate-template-pdfs.ts`; both use the site's faces.

## Pages rebuilt on the system

Every public and signed-in page: home, assessment (landing, take,
results, sample, paid report), pricing, courses and the course interior,
for-institutions, briefings (index and articles), resources (library,
essays, templates), playbooks (index, roles, templates), security, FAQ,
certifications, references, legal, verify, dashboard, toolbox, prompt
cards, practice, auth, purchase confirmations, and 404. Internal tools
(`/admin`, `/design-system`) and print views are intentionally unchanged.

## Guardrails

- Every statistic still needs its claims-registry entry; SR 11-7 still only
  appears as the guidance SR 26-2 superseded (the claims gate checks both).
- Never link to `/resources/<slug>` for a free download — those routes are
  essays. Free downloads live behind the gate on `/resources`; playbooks at
  `/playbooks/<role>`.
- Keep `SiteHeader` text colours intact: set cream text on dark sections,
  not on the page wrapper.
