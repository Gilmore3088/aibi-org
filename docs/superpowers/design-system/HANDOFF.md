# HANDOFF — Read this first

**For:** the next session that picks up `design-2.0`.
**Last commit:** `dc580c8` — *UI-REVIEW.md from /gsd-ui-review audit (19/24)*
**Last context:** end of 2026-05-09 session. User signed off on the homepage simplification, /assessment/start rebuild, and footer 4-column cleanup. **Wave 2 of text-cuts is effectively complete** — the public surfaces (`/`, `/about`, `/education`, `/for-institutions`, `/security` partial, `/assessment/start`) all read on the new aesthetic. Branch is **46 commits ahead of main**, local-only.

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

## What just happened (2026-05-09 session — 26 commits)

The session pivoted from "Wave 2 visual primitives" to a more focused
"simple and powerful landing pages" direction once the user saw the
text-heavy state. Net delta: dramatic compositional simplification of
every public page, ~600 lines net code removed, no new tokens.

| Commit | Surface | Summary |
|---|---|---|
| `dc580c8` | docs | UI-REVIEW.md (19/24); BLOCKER on amber-light pillar discipline violation |
| `00cb173` | footer | Newsletter becomes its own column — 4-up layout |
| `247e21b` | footer | Mission cut, broken Programs links dropped, legal links to bottom |
| `ba15698` | /assessment/start | Body paragraph → em-dash deliverables list |
| `3e6a35a` | /assessment/start | Audience eyebrows: 'Best for individuals' / 'Best for teams or groups' |
| `f861bcd` | /assessment/start | Hero + two-tile split rebuild |
| `6b7c7c6` | /  ROIDossier | Slider label+value consolidated, larger type, dynamic CTA pinned to result.low |
| `ec62a26` | /  ROIDossier | Editorial sidebar dropped (-95 lines) |
| `f2bdff2` | / | Dark band + closing hero dropped; ROIDossier remounted |
| `bec5249` | / | Simplified composition: hero + 2-tile + dark band + closing |
| `b4251c8` | InteractiveSkillsPreview | Demos rewritten to SELL automation (5 capabilities) |
| `deff8d1` | InteractiveSkillsPreview | Vertical 1×1 layout restored |
| `66b8b2f` | / and /education | InteractiveSkillsPreview rebuilt around Tools/Prompts/Skills/Agents/More |
| `f5598ee` | cert ladder | Blurb sentences dropped from every rung |
| `f3fcc0f` | /education | Hero+payload merge — single band, not two |
| `344070c` | /education | Dual hero consolidated into one assessment-led entry |
| `2c23c15` | ToolGrid/SkillGrid + /education | Unaudited module footnotes dropped; 'free' surfaced on tile |
| `5218ed5` | /for-institutions | Custom SVG glyphs on the 4 value-prop cards |
| `0955a33` | / and /for-institutions | Magazine affectations dropped (Diagnostic, Marginalia, etc.) |
| `c1037eb` | SectionHeader | § pilcrow dropped |
| `8f06245` | /education | Two-assessment catalog + In-Depth secondary CTA |
| `77975d6` | /about | Hero rewrite + per-principle SVG glyphs |
| `35dc2cc` | /about | 8,400 stat monument + card glyphs |
| `25156c2` | /about | Founder narrative cut to monument + 3-card distillation |

---

## Active direction (the one that matters)

Direction shifted again on 2026-05-09 from "Wave 2 visual primitives" to
**"simple and powerful landing pages, modeled on restraint."** User
referenced clean editorial mocks (gold/navy aesthetic) but explicitly
clarified: composition + restraint, not palette. Existing terra/parch/ink
tokens stay.

The pattern that emerged on the homepage and now propagates:
  - Hero: punctuated serif headline with one italic-terra accent word
  - Two-tile split (linen + parch halves, hairline center divider)
  - Dynamic / sourced / interactive payload
  - No closing dark band on most pages

Pages on the new aesthetic:
  ✓ /                   hero + two-tile + ROIDossier (savings calc)
  ✓ /about              hero + monument + 3 cards + 6 principles glyphs
  ✓ /education          consolidated hero+payload + free classes + ladder
  ✓ /for-institutions   hero + value-prop glyphs + tools/skills/tiers
  ✓ /assessment/start   hero + two-tile (Free / In-Depth) + trust strip
  ✓ /security           Pillar B cobalt hero (untouched today)
  ✓ Footer              4-column layout, newsletter as own column

**Pick up here next session:**

1. **Top BLOCKER from /gsd-ui-review audit (UI-REVIEW.md): `text-amber-light`
   used as generic dark-band accent.** Violates pillar discipline (amber =
   Pillar C only). 8 occurrences across MarketingPage.tsx:111,
   ProgramPage.tsx:202, ResultsPage.tsx:202, and four pages. Either
   remove from templates or introduce a new neutral dark-accent token.
2. **`/education` paid pill `bg-amber-light text-ink`** — same violation,
   needs the editorial-pill treatment that the FREE pill already uses.
3. **`/for-institutions` further refinement** — user just asked about
   updating it on session-end. Likely apply the same cuts: tighter hero,
   trim the engagement-tier 'three ways to enroll' section, simplify the
   tools/skills sections.
4. **`/assessment/in-depth` route** — exists on main but not on
   design-2.0. Wave C work. Migrating + design-system rebuild needed
   before merge so /education and /assessment/start tile links resolve.
5. **Wave D LMS tree migration** — `/courses/aibi-p` → `/education/practitioner`,
   ~14 sub-routes. Permanent redirects already in `next.config.mjs`;
   pages not yet moved.
6. **Wave E essay MDX conversions** — 6 essays still on `/resources/<slug>`.

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
