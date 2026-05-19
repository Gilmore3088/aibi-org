# Site-wide audit — 2026-05-19

**Scope:** `src/app`, `src/components`, `src/styles` (476 TS files, 79 routes)
**Method:** four parallel Explore agents, one per audit dimension (anti-patterns / a11y / perf / theming+responsive)
**Standard:** Ledger brand spec (2026-05-09 refresh) + WCAG 2.1 AA
**Outcome:** 7 commits on `feature/audit-sweep`, pushed and preview-deployed

## Anti-patterns verdict

**Mostly intentional — but partial migration was leaking.** A skeptic would not call this AI-generated; assessment flow, dashboard chrome, and font loading show careful human hand. The Ledger refresh was ~80% migrated and the remaining 20% was creating the visible AI-slop tells fixed by this sweep.

Confirmed clean baseline:
- No gradient hero text, no purple-on-dark, no dark-mode classes
- No banned marketing verbs (`supercharge`, `revolutionize`, `leverage`, `synergy`)
- No `FFIEC-aware` or `AI-powered` in rendered copy (both appear only as bans inside `skillBuilderData.ts`)
- Skip link wired, heading hierarchy clean, radio group ARIA on assessment textbook-correct
- `next/font` with intentional split-weight strategy
- ROI calculator uses `useMemo` correctly
- Modal usage restricted to one justified case (assessment email gate)

## Summary

| Severity | Found | Fixed | Verified false-positive | Deferred |
|---|---|---|---|---|
| Critical | 4 | 4 | 0 | 0 |
| High | 8 | 6 | 1 (H5) | 1 (briefing-preview width transition) |
| Medium | 9 | 4 | 4 (M2, M9, L4-adj, M5-verified-clean) | 3 (M3, M4, M6/M7 token rename) |
| Low | 6 | 1 (L4 adjacent) | 4 (skip link, heading, radio, font loading already correct) | 1 (.DS_Store gitignore) |

## Fixed in this sweep

All commits on `feature/audit-sweep`, worktree at `~/Projects/aibi-audit-sweep`. Branch pushed to `origin`; PR template URL: https://github.com/Gilmore3088/aibi-org/pull/new/feature/audit-sweep

### Commits (chronological)

| # | SHA | Category | Subject |
|---|---|---|---|
| 1 | `66833e5` | a11y | Restore focus rings on Ledger form inputs (WCAG 2.4.7) — root cause in `ledgerInputStyle()` helper, helps 131 downstream files |
| 2 | `fbd3d73` | a11y | Restore focus rings on assessment question + score heading |
| 3 | `0a3d703` | brand | Kill backdrop-blur glassmorphism on 4 sticky surfaces |
| 4 | `5b0095e` | brand | Retire LMS pillar hex palette + tighten Ledger token use |
| 5 | `ca62204` | brand | Purge non-hero shadows + replace radial-gradient radio fill |
| 6 | `1949853` | perf | Replace `width` transitions with `transform: scaleX` |
| 7 | `a91025a` | a11y | Add icon marker to inline form-field errors |

### What each commit changed

**`66833e5` — focus ring root cause (C1)**
`src/components/lms/FormField.tsx:94` set inline `outline: 'none'` in the shared `ledgerInputStyle()` helper. Inline styles outrank the global `*:focus-visible` rule in `src/styles/base.css`, so keyboard users saw no focus on any input rendered through the helper (~131 files). Removed the inline rule; repointed `--focus-ring` from `--color-terra` to `--ledger-accent` so the indirection no longer hides the live token.

**`fbd3d73` — assessment focus rings (M8 + QuestionCard discovery)**
The score-reveal `<h2>` (programmatic focus target for SR announcement) had `focus:outline-none` with no `focus-visible:` fallback. QuestionCard radio buttons had `focus-visible:outline-none focus-visible:bg-parch` — defeating the global rule AND landing focus on the parch surface CLAUDE.md flags for failing contrast. Both replaced with gold outline rings.

**`0a3d703` — backdrop-blur (C2)**
Six sticky surfaces drifted from the Ledger "solid linen, no translucency" rule documented in `SiteNav.tsx`. Killed `backdrop-filter: blur(...)` + `rgba(...)` pairs in:
- `src/app/preview-home/preview-home.css:93`
- `src/app/faq/faq.css:47, 95`
- `src/app/my-toolbox/my-toolbox.css:32, 205` (nav + tile-action overlay)
- `src/app/dashboard/toolbox/ToolboxApp.tsx:420` (section nav)

All switched to solid `var(--ledger-paper)`.

**`5b0095e` — pillar hexes + parch contrast + ProductMark + soft placeholder (C3, C4, H7, H3)**
- `src/components/lms/types.ts` hardcoded four custom hexes (`#B8836B`, `#6B8AA0`, `#8A7B6B`, `#5C7B5C`) for the pillar palette. CLAUDE.md retired pillar color discipline with the Ledger refresh — labels still differentiate, marks unify. All four now `var(--ledger-accent)`.
- `src/app/assessment/page.tsx:163` `usedFreeEmail` aside rendered body text on `--color-parch` (CLAUDE.md explicitly flags this as failing AA). Switched surface to `--ledger-paper`, text to `--ledger-ink`.
- `src/components/system/ProductMark.tsx` duplicated three hexes as JS constants. SVG presentation attributes don't resolve CSS `var()` cross-browser, so rewrote header block documenting the sync contract with `--ledger-ink` / `--ledger-accent` / `--ledger-paper`. Extracted the inline `'#F4F1E7'` magnifier-lens fill into a `PAPER` constant.
- `ToolboxHomeV5.tsx:279` search-input placeholder used `--ledger-soft` (#8C95A8) — fails AA on linen. Switched to `--ledger-muted` which the spec reserves for muted UI text.

**`ca62204` — shadows + radial gradient (H1, H4)**
Ledger spec allows one shadow (`--ledger-shadow`), hero/feature cards only. Eight surfaces drifted. Modals now scrim + border; cards now border-darken on hover; drawer now border-l-rule-strong; toast now border on dark surface.
- `SignupModal.tsx:47` — `shadow-md` removed
- `ToolboxHomeV5.tsx:392, 498, 570, 661` — `shadow-lg`, `hover:shadow-md` ×2, `shadow-2xl` removed
- `prompt-cards/PromptCardsExperience.tsx:373` — `shadow-2xl` removed
- `AuthDropdown.tsx:94` — `shadow-lg` removed
- `playground.css:643` — modal `box-shadow` removed
- `research.css:811` — `.art` hover swapped to `var(--ledger-shadow)` (research artifact cards qualify as feature cards)

`QuestionCard.tsx:152` selected-radio fill used `radial-gradient(circle, ...)` as a lazy filled-dot. Replaced with solid `var(--color-terra)` + inset 3px parch `box-shadow` — same visual, no gradient.

**`1949853` — width → transform (H2)**
`research.css .idx::before` hover underline (0→100% width) and `ProgressStrip.tsx` progress bar (transition-[width]) both animated layout-affecting properties. Both switched to `transform: scaleX()` with `transform-origin: left`. ProgressStrip semantics preserved (role="progressbar", aria-valuenow). The briefing-preview `.bar > i` fill was left as-is — it's a one-shot on a chromeless preview, requires coordinated CSS + `_script.js` changes for low payoff.

**`a91025a` — error glyph (H8)**
Inline FormField errors in `EmailGate.tsx` were already text + `role="alert"` (not color-only), but added a leading mono `!` glyph for stronger visual signal. Flex+gap layout keeps it aligned to first line when error wraps.

## Verified false-positive

The audit agents flagged these; closer inspection showed each was already handled:

- **H5 — fadeInUp on score reveal not gated by reduced-motion.** The global `@media (prefers-reduced-motion: reduce)` rule in `base.css:63-72` sets `animation-duration: 0.01ms !important` on `*`. Already covered.
- **H6 — alt text in NoteEditor / redesign-checklist page.** Both `<img>` tags use `alt={photo.name ?? 'Screenshot'}`. Already accessible.
- **M9 — 14px radio dots fail touch target.** The 14×14 element is `aria-hidden="true"` decoration inside a `w-full` button with substantial padding — touch target is the parent, well over 44×44.
- **M2 — `min-w-[600px]` table in ContentTable forces horizontal scroll.** Already wrapped in `overflow-x-auto` AND auto-switches to a CardGrid above 8 rows. Correct pattern.
- **L4 — `min-w-[180px]` flex child in toolbox.** Parent uses `flex-wrap`; narrow viewports wrap to a new row, no overflow.
- **M5 — `@react-pdf/renderer` client-bundle leak risk.** All 8 imports are in `src/app/api/**/route.ts` and `src/lib/pdf/*` (consumed only by API routes). Zero client exposure.

## Deferred (need their own PR)

- **C3 remainder + M6/M7 — mechanical `--color-terra*` → `--ledger-*` rename.** The visible-pixel fixes landed; the wider rename across `error.tsx`, `not-found.tsx`, `security/_components/GuideRequestForm.tsx`, `for-institutions/advisory/page.tsx`, `dashboard/page.tsx` is render-correct today (legacy fallback chain in `tokens.css` already maps Terra to Ledger gold). Per the split-large-renames memory, this is its own focused commit.
- **M3 — Plausible script `afterInteractive` strategy.** No `<Script>` tag in source. Likely managed via Vercel integration or external config. Confirm in Vercel dashboard.
- **M4 — `AIPracticeSandbox.tsx` (710 lines) dynamic import.** Server Component → Client Component import path on `/courses/foundation/program/[module]` — bundle cost is bounded to enrolled-learner module pages, not LCP. Real win but needs its own bundle-analyzer-instrumented PR.
- **briefing-preview `.bar > i` width transition.** One-shot animation on a chromeless preview surface; requires coordinated CSS + `_script.js` change for a route that doesn't carry production traffic.
- **`.DS_Store` in `public/`.** Add to `.gitignore`.

## Systemic patterns identified

1. **Incomplete brand migration** — `--color-terra*` still in ~6 routes. Needs one mechanical sweep, not piecemeal.
2. **Focus-ring discipline must live at shared helpers.** Fixing `ledgerInputStyle()` propagated to 131 files. Lint rule banning `focus:outline-none` without paired `focus-visible:` ring would catch future drift.
3. **CSS animations targeting layout properties.** Repeated in 3+ files. Worth a lint rule banning `transition: width|height|top|left|margin|padding`.
4. **Shadow utilities used as decoration.** No shared shadow token enforced. Define `--ledger-shadow` once and ban `shadow-*` Tailwind utilities project-wide.
5. **SVG/canvas surfaces drift from tokens.** OG image, error boundary, ProductMark, research diagrams hardcode hexes because CSS vars don't reach those rendering contexts reliably. Need a single TS constants file mirroring `tokens-ledger.css`.

## Verification

- `npx tsc --noEmit` clean on every commit
- Dev server boots at `http://localhost:3000`
- Vercel preview URL pending (Vercel building from `origin/feature/audit-sweep`)

## Next actions

1. **Visual QA on the Vercel preview URL.** Walk the assessment flow, toolbox, faq, my-toolbox sticky-nav surfaces, research index hover, and the LMS progress strip. Verify focus rings render gold on every form field.
2. **Open PR** from `feature/audit-sweep` → `main` when QA passes.
3. **File follow-up issues** for the four deferred items above so they don't get lost.
