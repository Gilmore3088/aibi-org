# Foundation UI Specialist Audit — 2026-05-24

## Methodology

Audit performed against the running dev server (`localhost:3000`, `feature/addie-v1` worktree). For every route in the audit list I confirmed HTTP 200 via `curl -sI`, fetched rendered HTML for keyword-grep triage, then ground every finding to a source file by `grep -rEn` across `src/components/addie/**` and `src/app/(addie)/foundation/**` plus `src/app/foundation-canvas/**`. Specific files (`page.tsx`, `LessonBody.tsx`, `LessonTutor.tsx`, `MaturityJourney.tsx`, `PaywallPreview.tsx`, `GateScreen.tsx`, the per-module canvas, etc.) were read in full to catch token + copy violations. No source files were edited.

## Severity legend
- BLOCKER — broken, blocks a learner
- HIGH — brand/a11y violation, ship-stopper
- MEDIUM — visible inconsistency
- LOW — polish / nit

## Findings

### F1 — Credential marketing in branch that explicitly forbids it
- **Severity:** HIGH
- **Surface:** every `/foundation/*` lesson page (full variant rendered on `/foundation` home + `/foundation/dashboard`)
- **File:** `src/components/addie/lesson/MaturityJourney.tsx:30` and `:215`
- **What's wrong:** Branch-scoped CLAUDE.md says "No credential / no certificate in v1. 'Foundations Certificate' is dropped." The `MaturityJourney` ships a fifth stage labelled `'Governing'` whose `require` reads `'Specialist (AiBI-S) credential'`, and the final footer reads `'You have completed the Foundation arc. Next: the Specialist (AiBI-S) credential.'`
- **Evidence:**
  ```ts
  { key: 'governing', ..., require: 'Specialist (AiBI-S) credential' },
  // line 215:
  You have completed the Foundation arc. Next: the Specialist (AiBI-S) credential.
  ```
- **Fix:** Remove the `governing` stage entirely (Foundation arc ends at `leading`) or rewrite the requirement as a non-credential next step ("Continue with Specialist track when it ships"). Drop the line-215 footer copy.

### F2 — "AiBI-S" credential references inside lesson role-sims
- **Severity:** HIGH
- **Surface:** `/foundation/m*/m*` for the lessons that render `RoleSimulation`
- **File:** `src/components/addie/lesson/RoleSimulation.tsx:156, :336, :515`
- **What's wrong:** Three closing-card copy strings advertise the harder version "ships with AiBI-S/Risk", "AiBI-S/IT", "AiBI-S/Retail" — credential marketing the branch removed.
- **Fix:** Replace with neutral copy ("The harder version is on the Specialist track") or remove the trailer entirely.

### F3 — Banned word "unlock" used as marketing verb
- **Severity:** HIGH
- **Surface:** `/foundation` home, every locked paid-module landing
- **File:** `src/app/(addie)/foundation/page.tsx:241`; `src/components/addie/lesson/PaywallPreview.tsx:4, :112, :117`
- **What's wrong:** CLAUDE.md banned-words list includes `unlock`. Home: `"the last two unlock the skills + build work"`. Paywall: comment + section label `"What you'd unlock"`.
- **Evidence:** `src/app/(addie)/foundation/page.tsx:241`: `the last two unlock the`; `PaywallPreview.tsx:117`: `What you&apos;d unlock`.
- **Fix:** Home → `"the last two open the skills + build work"`. PaywallPreview → `"What's inside"` or `"What you'd build"`.

### F4 — Raw hex colors in `/foundation/security` SVG diagram
- **Severity:** HIGH
- **Surface:** `/foundation/security`
- **File:** `src/app/(addie)/foundation/security/page.tsx:317, 335, 336, 345, 356, 377, 390, 401`
- **What's wrong:** Multiple `fill="#0E1B2D"`, `fill="#F4F1E7"`, `fill="#4F5C6E"` literals in inline SVG. Ledger rule allows raw hex only in four exempt contexts (Satori OG, static favicon `.svg`, vanilla-JS chart constants, server-generated downloads). Inline JSX SVG inside a server component is none of these.
- **Fix:** Move to `var(--ledger-ink)`, `var(--ledger-paper)`, `var(--ledger-muted)`. CSS `currentColor` + a wrapper class is the cleanest path.

### F5 — Raw hex inside the security print stylesheet
- **Severity:** MEDIUM
- **Surface:** `/foundation/security` (print)
- **File:** `src/app/(addie)/foundation/security/page.tsx:873-881`
- **What's wrong:** `.addie-security-doc { background: #ffffff !important; color: #000000 !important; }` and similar. Print CSS still needs to reference ledger tokens or at least centralise the "force black-and-white print" CSS in `src/styles/print.css` rather than a per-page override.
- **Fix:** Move to `src/styles/print.css` keyed on a body class; replace `#ffffff/#000000` with `Canvas`/`CanvasText` system tokens or `var(--ledger-paper)`/`var(--ledger-ink)` overridden by a print media query.

### F6 — `bg-white` raw utility on foundation-canvas tiles
- **Severity:** LOW
- **Surface:** `/foundation-canvas` (operator-only)
- **File:** `src/app/foundation-canvas/page.tsx:123, 210, 262`
- **What's wrong:** Three `className="... bg-white ..."` declarations on tile backgrounds. Canvas is operator-gated but still subject to the no-`bg-white` rule.
- **Fix:** Replace with `bg-[var(--ledger-paper)]` or a dedicated `bg-[#ffffff]` override only if a true-white screenshot canvas is required — better: `bg-[var(--ledger-paper)]`.

### F7 — `<em>` wrapper used to emit italics (now suppressed globally — dead markup)
- **Severity:** LOW
- **Surface:** every lesson page (LessonTutor mounts site-wide)
- **File:** `src/components/addie/lesson/LessonTutor.tsx:312`
- **What's wrong:** `<em className="not-italic">…</em>` × 2 inside example copy. Italics retired site-wide via `base.css` universal `font-style:normal`; the `<em>` wrappers are now semantically meaningless and confuse screen-reader emphasis. Same shape in `LessonBody.tsx:487` (`italic-off` is not a real Tailwind/CSS class).
- **Evidence:**
  ```tsx
  Examples · <em className="not-italic">&ldquo;Why do you keep saying…&rdquo;</em>
  ```
- **Fix:** Replace `<em>` with `<span>` (or drop entirely) since the visual + semantic emphasis is intentionally removed. Delete the literal `italic-off` token in `LessonBody.tsx:487` — it has no rule and looks like a stale Tailwind safelist string.

### F8 — Body text on `--ledger-parch` (contrast rule violated)
- **Severity:** HIGH
- **Surface:** every lesson page (MaturityJourney compact strip)
- **File:** `src/components/addie/lesson/MaturityJourney.tsx:103`
- **What's wrong:** Compact strip is `bg-[var(--ledger-parch)]` with `text-[var(--ledger-muted)]` body text. CLAUDE.md: "Body text on Paper or BG, never on Parch (insufficient contrast)." This strip prints on every lesson + dashboard.
- **Evidence:** `bg-[var(--ledger-parch)]` paired with `text-[var(--ledger-muted)]` at 0.6rem mono.
- **Fix:** Switch the strip background to `bg-[var(--ledger-paper)]` (the rest of the design system already uses paper for these chrome strips).

### F9 — Body text on parch in `DeliverableSection`, `SkillBuilder`, seat pill
- **Severity:** MEDIUM
- **Surface:** `/foundation/assessment/[id]`, `/foundation/m4/m4.2` (SkillBuilder), team dashboard
- **File:** `src/components/addie/assessment/DeliverableSection.tsx:202`; `src/components/addie/interactives/m4/SkillBuilder.tsx:444`; `src/components/addie/dashboard/team/SeatStatusPill.tsx:11`
- **What's wrong:** Same `bg-[var(--ledger-parch)] text-[var(--ledger-ink-2)]` / `text-[var(--ledger-muted)]` pattern repeated on real prose blocks (preformatted code samples, empty-state copy, status pill).
- **Fix:** Either change ground to `--ledger-paper` for prose, or restrict `--ledger-parch` use to chips/badges with mono caps where contrast is not the AA bar.

### F10 — Locked paid lessons all share the identical generic PaywallPreview
- **Severity:** HIGH
- **Surface:** `/foundation/m4/m4.1` through `/foundation/m5/m5.5`
- **File:** `src/components/addie/lesson/PaywallPreview.tsx` (and its single call site `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx:341-348`)
- **What's wrong:** The same component renders for every locked lesson in every paid module. It takes only `moduleId/Title/Summary` + the module-level lesson list — no `lessonId`, no lesson-level title, no per-lesson takeaway. Nine paid lessons therefore present as two visually identical screens (m4.* and m5.*). Confirmed by the canvas-index banner ("M4 + M5 paid lessons all show the same PaywallPreview").
- **Fix:** Either redirect `/foundation/m4/<x>` → `/foundation/m4` for non-entitled viewers (one paywall per module, honest), or extend `PaywallPreview` to take the current `lessonId` + the lesson row and render a lesson-specific teaser block above the module outline.

### F11 — Hero/feature card shadow override violates the one-shadow rule
- **Severity:** MEDIUM
- **Surface:** `/foundation` home, every locked paid module
- **File:** `src/app/(addie)/foundation/page.tsx:190`; `src/components/addie/lesson/PaywallPreview.tsx:87`
- **What's wrong:** Custom drop shadow `shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)]`. Design system: "One shadow only — `--ledger-shadow` — and only on hero/feature cards." Two ad-hoc rgba shadows duplicated across files.
- **Fix:** Define a `--ledger-shadow` token (if it doesn't exist) and replace both call sites with `shadow-[var(--ledger-shadow)]`. Audit all `shadow-[` occurrences.

### F12 — Inner CTA shadow on home hero `Start Module 0`
- **Severity:** MEDIUM
- **Surface:** `/foundation`
- **File:** `src/app/(addie)/foundation/page.tsx:144`
- **What's wrong:** `shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]` on a button. Buttons are not hero/feature cards — they shouldn't carry any shadow per the design rules.
- **Fix:** Remove the shadow utility from the CTA.

### F13 — H1 → H3 heading skip on locked-module preview
- **Severity:** MEDIUM
- **Surface:** every paid-module landing (`/foundation/m4`, `/foundation/m5` for anon)
- **File:** `src/components/addie/lesson/PaywallPreview.tsx:167`
- **What's wrong:** Page renders `<h1>` (module title), then `<h2>` ("Pick how you want to keep going."), then the lesson outline list. The lesson list dropped from `<h3>` to `<p>` (good) but the "What you'd unlock" / "What you'd build" labels above the outline are styled as section headings yet rendered as `<span>` — they aren't in the doc outline at all.
- **Fix:** Promote the two "What you'd …" kickers to real `<h2>` (or `<h3>` after demoting the doors heading to `<h2>`) so the section structure is announceable.

### F14 — "Module bundles" save-as-PDF tiles use object-cover with white frame
- **Severity:** LOW
- **Surface:** `/foundation-canvas`
- **File:** `src/app/foundation-canvas/page.tsx:118-131`
- **What's wrong:** `bg-white` + `aspect-[3/4]` + `object-cover object-top` clips long lesson bundles at the fold; operators reviewing modules see only the hero of each module. Combined with the LOW finding above, raw `bg-white` is the second smell.
- **Fix:** Switch to `object-contain` (or render a real thumbnail at 3:4 ratio in the regenerator script). Drop the raw `bg-white`.

### F15 — Foundation home features `Featured module` decorative tape + duplicated decorative layers
- **Severity:** LOW
- **Surface:** `/foundation`
- **File:** `src/app/(addie)/foundation/page.tsx:188-189`
- **What's wrong:** Two stacked `absolute` decorative slabs with `color-mix(in srgb, var(--ledger-accent) 18%, …)` + `var(--ledger-tape)` create a soft tinted shadow effect — close to a gradient + decoration. Design rule #1 says "restraint over decoration", #4 says "lines do real work". The double-slab also costs two non-token rounded radii: `rounded-[12px]` (cards) twice + once at the article — `rounded-[12px]` is not in the allowed set (2/3/4 px).
- **Fix:** Collapse to a single hairline-rule frame + the standard card radius (`rounded-[4px]`).

### F16 — `rounded-[12px]` and `rounded-[6px]` outside the allowed set
- **Severity:** MEDIUM
- **Surface:** `/foundation` home, locked paid pages
- **File:** `src/app/(addie)/foundation/page.tsx:188-190`; `src/components/addie/lesson/PaywallPreview.tsx:87, 92`
- **What's wrong:** Multiple `rounded-[12px]` and `rounded-[6px]` literals. CLAUDE.md: "Radii: 2px (buttons, inputs, chips) · 3px (cards, sidebars, sections) · 4px (hero cards)." No 6px or 12px tier exists.
- **Fix:** Replace with `rounded-[4px]` for hero cards, `rounded-[3px]` for nested cards.

### F17 — Custom `'group-hover:scale-[1.02]'` micro-zoom on every canvas thumbnail
- **Severity:** LOW
- **Surface:** `/foundation-canvas`
- **File:** `src/app/foundation-canvas/page.tsx:219, 267`
- **What's wrong:** Image scale transition on hover. Design system motion rule: "Almost none. 120ms (UI) / 200ms (page transitions) … No skeleton shimmers, no parallax, no spring physics." Scale-on-hover is a SaaS tic.
- **Fix:** Replace with `hover:border-[var(--ledger-ink)]` only (already partially in place) and drop the `group-hover:scale-[1.02] transition-transform`.

### F18 — Hero `group-hover:-translate-y-1` on featured-module card
- **Severity:** LOW
- **Surface:** `/foundation`
- **File:** `src/app/(addie)/foundation/page.tsx:190`
- **What's wrong:** `group-hover:-translate-y-1` is "card lifts on hover" — SaaS micro-interaction explicitly counter to the design rules.
- **Fix:** Remove the translate; hover should change border tone only.

### F19 — Gate banner uses two decorative star SVGs around the kicker
- **Severity:** LOW
- **Surface:** `/foundation/gate`
- **File:** `src/components/addie/gate/GateScreen.tsx:20-28`
- **What's wrong:** Two flanking stroked stars at 20×20 around "Milestone · Module 3 complete." Decorative SVG (not informational) on a hero. Design system: "Content is the design — restraint over decoration."
- **Fix:** Drop both stars; keep the mono kicker and the rule-only separator pattern used everywhere else.

### F20 — `addie-chip` is loaded with `'unlock'` and `'AI-powered'`-shape language elsewhere
- **Severity:** LOW
- **Surface:** `/foundation` (closing band)
- **File:** `src/app/(addie)/foundation/page.tsx:311-313`
- **What's wrong:** Closing band copy `<h2>One lesson is enough to feel the difference.</h2>` is on-brand, but the framing chip "Ten minutes" + the CTA "Start Module 0" is the second copy of the same hero CTA at the bottom of the page — same `bg-[var(--ledger-accent)] text-[var(--ledger-ink)]` button. Gold-on-ink CTA repeated inverts the "gold for emphasis only — never decoration" intent when the gold also wraps the heading accent at the top (line 131).
- **Fix:** Keep the gold accent in exactly one place per long page (the hero heading). The closing-band CTA should be `bg-[var(--ledger-paper)] text-[var(--ledger-ink)]` to match the lockup pattern used elsewhere.

### F21 — Every M0–M3 free lesson uses the same hero-illustration + scrolling-body + TOC-rail template
- **Severity:** MEDIUM
- **Surface:** `/foundation/m0/m0.1` … `/foundation/m3/m3.5` (everything except `m0.2`)
- **File:** `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx:382-417` (the only non-`m0.2` branch)
- **What's wrong:** The canvas-index banner already flags this and the page source confirms it: a single shared layout drives 23 of 24 free lessons, with module illustration carrying differentiation. Visual sameness is a known finding; the migration target (`M02Experience` for `m0.2`) is the variant template.
- **Fix:** Land the `Lesson_Shell_Migration.md` plan — incrementally migrate the remaining lessons to `M02Experience` (step header, no hero illustration, no right rail) so each module has a distinguishing rhythm. At minimum, vary the hero illustration density between modules to reduce template fatigue.

### F22 — Lesson player branches on a hard-coded `m0.2` string
- **Severity:** LOW
- **Surface:** every lesson page
- **File:** `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx:358`
- **What's wrong:** `const useV2Shell = payload.lesson.id === 'm0.2';` — opt-in by lesson id literal. Maintenance hazard; flag belongs in lesson metadata.
- **Fix:** Add a `lesson.shell_version` column (or a `tags` array) and switch on data.

### F23 — `<em>` + `not-italic` pattern smells like a stale safelist
- **Severity:** LOW
- **Surface:** `/foundation/for-community-banks`
- **File:** `src/app/(addie)/foundation/for-community-banks/page.tsx:250`
- **What's wrong:** `<cite className="mt-auto pt-5 not-italic …">` — same pattern. Italics are killed globally; `not-italic` adds nothing.
- **Fix:** Remove `not-italic` from this file (and any siblings); the global rule handles it.

### F24 — "AI Readiness Journey" phrase appears as a visible body kicker on every lesson — but design retired pillar discipline + journey marketing
- **Severity:** LOW
- **Surface:** every lesson + dashboard
- **File:** `src/components/addie/lesson/MaturityJourney.tsx:107, 157`
- **What's wrong:** The compact strip + the dashboard card both lead with "AI Readiness Journey" in gold caps. The Foundation Course on this branch deliberately drops the credential/journey framing in favor of "you finished M3, here's the gate." The standing strip on every page reintroduces a maturity-arc narrative that the curriculum no longer enforces.
- **Fix:** Either retitle to "Your progress" + keep mechanics, or hide on lesson pages and surface only on the dashboard (the file's comment already debates this — lesson pages opt out, but the compact strip is rendered above lessons through the page chrome).

### F25 — Dashboard has an admin/wave-2b leak in user-facing copy
- **Severity:** MEDIUM
- **Surface:** `/foundation/dashboard` (when no lessons published)
- **File:** `src/app/(addie)/foundation/dashboard/page.tsx:144-146`
- **What's wrong:** Visible copy `"No lessons published yet. Wave 2b will seed them."` exposes internal sprint naming to a learner.
- **Fix:** Replace with neutral copy: `"The course is being prepared. Come back shortly."`

## Cross-cutting patterns

**1. Generic "locked" treatment is the biggest design debt.** F10/F13/F16 all converge on the same component: `PaywallPreview` is one screen reused across nine paid lessons, with module-level data only. The fix is structural — either redirect lesson URLs to the module landing for non-entitled viewers, or thread the lesson row into the paywall and render a per-lesson teaser (objective + takeaway + first 80 words).

**2. Decorative motion + shadows are sneaking back in.** F11, F12, F17, F18, F19 all add SaaS micro-flourishes (stacked tinted shadows, hover-lift, hover-scale, decorative stars). The Ledger system bans every one of those individually; together they shift the page tone from "editorial ledger" toward "modern SaaS course". A grep gate in CI for `shadow-\[(?!var\()`, `translate-y`, `scale-\[`, and `rounded-\[(6|8|10|12)px\]` would prevent regressions.

**3. Italics-suppression scaffolding is now noise.** `not-italic`, `italic-off`, and `<em>` wrappers (F7, F23) were a transitional fix; the global `*{font-style:normal!important}` rule supersedes them. They make the code lie about emphasis and confuse screen-reader semantics. One pass with `grep -rEn "not-italic|italic-off"` and remove them.

**4. Credential vocabulary still leaks from the legacy course.** F1, F2, and the older `Foundations Certificate` register live across `MaturityJourney`, `RoleSimulation`, and elsewhere. The branch-scoped CLAUDE.md is explicit: no credential, no certificate. A `grep -rEn "credential|AiBI-S|certificate"` sweep across `/foundation/**` should yield zero matches before launch.

**5. Free-lesson sameness is acknowledged but not yet remediated.** F21 + the canvas-index banner agree: 23/24 free lessons share one template. The fix already exists (`M02Experience`); the work is migration, not invention.

## Recommended fix order

1. F1, F2 — drop credential strings (blocking brand violation, single-file edits)
2. F3 — replace "unlock" everywhere (text-only)
3. F8 — fix body-text-on-parch in MaturityJourney compact strip (a11y AA)
4. F4, F5 — replace raw hex in `/foundation/security` with tokens
5. F10, F13 — make PaywallPreview lesson-specific OR redirect lesson URLs to module landing
6. F11, F12, F17, F18, F19 — strip non-ledger shadows / hover-lift / decorative SVG
7. F16 — normalize all radii to 2/3/4 px
8. F9 — sweep remaining body-on-parch surfaces
9. F25 — replace "Wave 2b" copy
10. F7, F23 — remove `not-italic`/`italic-off`/`<em>` leftovers
11. F15, F20 — single decorative tape + one gold accent per page
12. F14, F6 — canvas tile polish (`object-contain`, drop `bg-white`)
13. F21, F22 — Lesson Shell Migration (data-driven flag, expand `M02Experience` adoption)
14. F24 — rework MaturityJourney scope (dashboard-only or rename)
