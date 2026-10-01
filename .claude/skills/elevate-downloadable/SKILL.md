---
name: elevate-downloadable
description: Turn an approved elevation issue into a new free downloadable — source HTML, generated PDF, manifest row, presentation entry, and checks. Use only when an `elevation`-labeled issue has been approved by the owner; downloadable PRs are never auto-merged.
---

# Elevate content into a downloadable

Free downloads are repo-committed files served by
`/api/resources/[slug]/download`, described by one manifest:
`src/lib/resources/freeResources.manifest.json`.

## The pipeline for a new PDF resource

1. **Source:** hand-write `public/downloads/source/<slug>.html` using
   `_brand.css` like the existing playbooks/desk cards (this HTML also powers
   the Word variant). Claims rules apply to its copy.
2. **Generate:** `node scripts/generate-source-html-pdfs.mjs` (Playwright is
   available in-session) → commit the PDF under `public/downloads/`. Large
   print: `node scripts/generate-large-print-resource-pdfs.mjs`. If the
   resource joins a kit ZIP: `node scripts/generate-kit-zips.mjs` and
   regenerate that ZIP.
3. **Manifest row:** slug, title, audience, category, `funnelSegment`
   (governance / data-handling / lending-review / role-playbook are the only
   values that trigger a resource nurture sequence — see
   `src/lib/mailerlite/resource-category.ts`), visibleSurfaces, download
   {filePath, fileType, tierRequired}, variants, gatePolicy
   (`free-email-gated` is the default), sourceCitations, status `public`.
4. **Presentation map:** add the slug's icon/blurb entry in
   `src/app/resources/data.ts` for its category — the maps THROW on missing
   slugs, so the build fails loudly if you skip this.
5. **Checks:** `npx vitest run src/lib/resources src/app/resources` (manifest
   ↔ file consistency), `npm run audit:resources`,
   `node scripts/check-claims.mjs`, `npx tsc --noEmit`.

Templates instead go through `TEMPLATE_INDEX`/`TEMPLATES` under
`src/app/resources/templates/` + `scripts/generate-template-pdfs.ts`
(`TEMPLATE_PDF_SLUGS` list) — same manifest/presentation steps apply.

## Watch out

- A Supabase `resources` table row overrides the manifest (file_path, tier,
  `published=false` hides it). If a new resource misbehaves in prod, check
  that table before debugging code.
- `zipSize` strings in the presentation maps are hand-typed — update when a
  kit ZIP regenerates.

## Ship

Branch `claude/elevate-<slug>` → PR referencing the elevation issue with
generated files committed → James merges. Never auto-merge.
