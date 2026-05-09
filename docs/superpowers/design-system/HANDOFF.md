# HANDOFF — Read this first

**For:** the next session that picks up `design-2.0`.
**Last commit:** `e456005` — *aggressive text cuts; visual replacements (Wave 1)*
**Last context:** ~65% used; we paused mid-direction-shift after the user said "WAY TOO MUCH TEXT" and chose Path 3 (typographic + data-viz richness, no stock photos).

---

## Where you are

```
Worktree:  ~/Projects/aibi-design-2.0
Branch:    design-2.0
Main:      ~/Projects/TheAiBankingInstitute  (untouched, at 4587c19)
Commits:   20 ahead of main, local-only, unpushed, unmerged
Dev:       cd ~/Projects/aibi-design-2.0 && npm run dev → localhost:3000
```

**Do NOT merge to main.** Founder explicit instruction; stays on the branch until they review every wave. **Do NOT push to remote without explicit approval.** Local commits only.

---

## What just happened (last 5 commits)

| Commit | Summary |
|---|---|
| `e456005` | Wave 1 of text-cuts pass: new `TransformationFlow`, `ToolGrid`, `SkillGrid` primitives. Replaced the homepage `<TransformationArc>` paragraph stack and `/for-institutions` tools/skills paragraph lists. Cut cert-ladder blurbs ~70%. |
| `bbbd429` | `STATUS.md` snapshot doc. |
| `bff985f` | Fixed ROI dossier result-cell number overflow (mid case at display-lg overflowed into adjacent cells). Uniform display-sm sizing now. |
| `2413283` | Editorial `QuestionCard` rebuild for `/assessment`. |
| `52aa103` | Hero "facts plate" aside + new `ROIDossier` replacing the homepage `ROICalculator`. |

---

## Active direction (the one that matters)

The user pivoted yesterday from "editorial-institutional research-publication" to **"Raymond James + Monzo level visual richness, way less text."** Three options were on the table; user picked **Path 3 — typographic + data-viz richness, no stock photos**. Constraints from CLAUDE.md still apply: no stock photos, no SaaS gradients, no AI-powered badges.

**Wave 1 done** (commit e456005): homepage transformation arc, /for-institutions tools + skills, cert-ladder blurbs.

**Wave 2 — pick up here:**

1. **`/about`** — still has the long founder narrative paragraph stack ("There is a banker somewhere right now…" → ~6 paragraphs). Keep the headline. Cut the body 50%+. Add a typographic monument + cards.
2. **`/education`** — cert ladder rungs still have body paragraphs. Same cuts as homepage already shipped.
3. **`/security`** — six-chapter grid still text-heavy. Convert to icon/typography tile grid.
4. **Homepage product-preview block** — add a "What you'll see" section with SVG mockups of the assessment Q + score ring + certificate. The visual showcase of what the institution gets. New component: `src/components/system/ProductPreview.tsx`.
5. **Wave 2 visual primitives to build:**
   - `<PillarWheel>` — 4-segment circle showing Awareness/Understanding/Creation/Application. Used on homepage and program pages.
   - `<DimensionalSpider>` — radar chart for the 8 readiness dimensions. Used on results page.
   - `<CertificateMockup>` — SVG-rendered certificate showcase.
   - `<MonumentNumber>` — full-bleed oversized statistic block (e.g. `12 modules`, `$0 platform cost`).

**After Wave 2 visuals, return to Phase 07 migration:**
- Wave C finish: migrate `ResultsViewV2` (602 LOC) and `EmailGate` (376 LOC) to design-system templates.
- Wave D: LMS tree migration (`/courses/aibi-p` → `/education/practitioner`, ~14 sub-routes).
- Wave E: essay MDX conversions (6 essays).
- Wave F: auth + dashboard + toolbox style passes.
- Wave G: cleanup (delete `Header.tsx`, `Footer.tsx`, etc.).

Full per-file plan in `07-migration-plan.md`.

---

## Landmines & constraints (must respect)

1. **Pillar discipline.** Sage = Awareness only. Cobalt = Understanding/security only. Amber = Creation only. Terra = Application + brand. `PILLAR_COLORS` in `src/lib/design-system/tokens.ts` is the single source.
2. **No fabricated content.** The user has called this out three times. Founder bio is empty (`BRAND.founder.bio: ""`) and About-page renders conditionally; do not put words in his mouth. No invented statistics, sample sizes, named examiners, or "X subscribers" proofs. See `08-differences-from-current-site.md` "Placeholder content" section for the audit list.
3. **No hex literals in pages or components.** Tokens propagate by name (`bg-terra`, never `bg-[#b5512e]`). The Tailwind theme is bound to brand tokens; defaults like `bg-blue-500` won't compile to anything useful.
4. **Auto-advance preserved on the assessment.** `QuestionCard` clicks must auto-advance — no separate Continue button. The 3-min mobile completion target depends on this. Accessibility (radiogroup, roving tabindex, focus on prompt change) is also non-negotiable.
5. **Clear `.next` cache between major refactors.** Webpack stale-chunk errors (`Cannot find module './NNNN.js'`) are common when components move between server and client. Standard fix: `lsof -ti:3000 \| xargs kill -9; rm -rf .next; npm run dev`.
6. **MDX import paths.** Inside MDX files, import primitives from their *direct paths* (e.g. `@/components/system/EditorialQuote`), not from the barrel (`@/components/system`). The barrel transitively pulls in client components like `NewsletterCard` and breaks server rendering.
7. **Existing curriculum data is real.** When building anything that surfaces course content, read from `content/courses/aibi-p/v4-expanded-modules.ts` and friends. Do not draft module names or skill lists by hand — the user caught this twice and it broke trust.
8. **Permanent redirects already added** for `/courses/* → /education/<program>/*` and `/resources/* → /research/*` in `next.config.mjs`. Old routes still resolve to old pages until Wave D / Wave E migrations physically move the files.

---

## How to start the next session

Open a fresh Claude Code session with this folder as the working directory:

```bash
cd ~/Projects/aibi-design-2.0
```

Then say something like:

> Read `docs/superpowers/design-system/HANDOFF.md`, then `STATUS.md`, then `07-migration-plan.md`. Confirm branch is `design-2.0`. We're picking up Wave 2 of the text-cuts pass — start with `/about`.

That gets the next session aligned in two minutes.

---

## Doc index for the next session

Read order, in priority:

1. **`HANDOFF.md`** (this file) — picks up exactly where we left off
2. **`STATUS.md`** — full snapshot (foundation, components, migration progress, gates)
3. **`08-differences-from-current-site.md`** — every divergence from `main`, tagged INTENT / PLACEHOLDER / TBD / FIXED. Pre-merge checklist at the bottom.
4. **`07-migration-plan.md`** — wave-by-wave runbook, per-file touch list
5. **`README.md`** — top-level entry, architecture diagram, brand discipline
6. **`03-tokens.md`** — DESIGN.md tokens contract (only when touching CSS/Tailwind)
7. **`04-primitives.md`** — when adding/editing a primitive
8. **`05-templates.md`** — when adding/editing a template
9. **`06-content-model.md`** — when adding/editing content modules

Skip the others on first read; reach for them by name when needed.

---

## Open feedback the user is still waiting on

- Wave 2 of text cuts (above): `/about`, `/education`, `/security`, plus a homepage product-preview block.
- A response to the Raymond James + Monzo direction overall — the new visual primitives need to land before they can react.

---

## Final reminder

Don't expand scope. Don't introduce new dependencies. Don't write new content (essays, bios, statistics) without confirming the user wrote it. **Cut text aggressively. Add visual primitives. Show, don't tell.**

When done with each wave: commit, restart dev server if needed (`rm -rf .next`), spot-check the migrated pages, update `STATUS.md`, update this `HANDOFF.md` with the new "pick up here," report.
