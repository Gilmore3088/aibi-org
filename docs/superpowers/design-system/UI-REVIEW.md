# design-2.0 — UI Review

**Audited:** 2026-05-08
**Branch:** `design-2.0` (24 commits ahead of `main`, local-only)
**Baseline:** `docs/superpowers/design-system/03-tokens.md`, `04-primitives.md`, `05-templates.md`, `08-differences-from-current-site.md`
**Surfaces audited:** `/`, `/about`, `/education`, `/for-institutions`
**Screenshots:** Not captured (Playwright MCP unavailable in session); code-only review.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Headlines are aggressive and earned; CTAs verb-stated; no generic "Submit/Learn more" anywhere; magazine affectations cleared. |
| 2. Visuals | 3/4 | Hand-drawn SVG glyph system is consistent and on-brand; one section (`/about` § Contact) is structurally over-loaded. |
| 3. Color | 2/4 | **Pillar discipline broken: `text-amber-light` is being used as the generic dark-band accent across `/about`, `/education`, `/for-institutions` and the `MarketingPage` template itself.** Per `03-tokens.md` §2.1, amber = Pillar C / Creation only. |
| 4. Typography | 3/4 | Token scale used cleanly; italic-Cormorant frequency now four uses across the four pages — at the edge of "decorative wallpaper." |
| 5. Spacing | 4/4 | All page-level spacing uses the `s1`–`s12` token scale; zero arbitrary spacing values; section padding canonical. |
| 6. Experience Design | 3/4 | InteractiveSkillsPreview is genuinely strong (animated reveal, copy-prompt, aria-live, tablist semantics); no loading/error states elsewhere because the audited surfaces are static SSR — appropriate. Lost a half-point for `/education` rendering Marginalia + assessment-tile payload simultaneously, which competes for attention. |

**Overall: 19/24**

---

## Top 3 Priority Fixes

1. **Stop using `text-amber-light` and `bg-amber-light` as the generic accent on dark bands and secondary tags.** It violates the explicit non-negotiable in `03-tokens.md` §2.1 — amber belongs to Pillar C (Creation) only. Replace with `text-cream` (already in use as inverse secondary) for eyebrows on dark, and `text-bone` / `border-bone` for the `/about` mailto link. The `In-Depth` paid-tag pill on `/education` should use a parch-warm chip with `text-terra` border, not amber.
   - Affected: `src/components/system/templates/MarketingPage.tsx:111`, `src/components/system/templates/ProgramPage.tsx:202`, `src/components/system/templates/ResultsPage.tsx:202`, `src/app/about/page.tsx:194,210`, `src/app/education/page.tsx:125,265`, `src/app/for-institutions/page.tsx:208,234`.
   - Why this is a BLOCKER: it ships a discipline rule the design-system docs explicitly call non-negotiable. Every other rule in the system is enforced by token absence (no hex, no Tailwind defaults, no >2px radius). This one is enforced only by author memory, and it has already drifted into the canonical templates.

2. **Decide what to do about the In-Depth Assessment paid-tag chip.** Today it reads `bg-amber-light text-ink` (`src/app/education/page.tsx:125`) — a screaming yellow paint chip whose color framework is forbidden here, and whose visual weight makes it the loudest element in the catalog tile. Better treatment: a small parch-dark pill with mono price text in ink and a hairline border, matching the editorial-restraint posture of every other label in the system. Pair the "Free" tile chip and the "$99…" chip with the same shape and weight; differentiate by content, not chroma.

3. **Reconcile the `/education` hero with its payload.** The hero band now contains: eyebrow + title + Marginalia "Your progress" aside (when enrolled) + a two-tile assessment catalog payload underneath. When the marginalia is rendered, the hero is doing four jobs at once — wayfinding, headline, progress, and product catalog. Either (a) push the assessment tiles down into a `<Section variant="parch">` of their own with a `§01 · Begin where you are` SectionHeader (this is what it already wants to be), or (b) drop the Marginalia from the hero on this surface and let the catalog tiles be the hero's payload alone. The current both-at-once reading is exactly the "two sections that should be one" pattern user flagged today — except inverted (one section pretending to be three).

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

**What works:**
- ✓ Headlines are short and earned. `/`: "Turning bankers into builders." `/for-institutions`: "Capability, not a platform." `/about`: "An education company for community banks and credit unions." Every H1 lands a brand promise in under twelve words.
- ✓ CTAs are verb-stated and grounded: "Begin the readiness assessment", "Take the free assessment →", "Begin the In-Depth Assessment →", "Read the institutional engagement page →". Zero generics in the four audited pages (`grep` for `>Submit<`, `>Click here<`, `>Learn more<`, `>OK<`, `>Cancel<` returned nothing).
- ✓ The InteractiveSkillsPreview demos sell the automation rather than describe the curriculum, per the user's audit note. Each capability shows a real prompt and a real-shape result; "Verify before you ship" lands a brand-discipline message inside the otherwise-marketing component.
- ✓ Magazine affectations are gone: no `Marginalia` label, no `Diagnostic` tag, no `WHAT WAS MISSING` stamp. The `§` pilcrow has been removed from `<SectionHeader>` (`src/components/system/SectionHeader.tsx:46-51` shows mono `NN · LABEL` only). The remaining `§` characters in source are all comment markers (`{/* §01 — */}`) or legitimate regulatory citations inside the InteractiveSkillsPreview demo content (`§4.2`, `§1005.11`, `§III.B`) — those are correct copywriting, not affectation.

**Watch:**
- ⚠ `Tools, named` and `Skills, verb-stated` (`src/app/for-institutions/page.tsx:188,198`) read as editorial labels. Compared with the punchier `The Path` / `Credentials` / `How we work` / `Engagement` elsewhere, these two labels still sound like an editor describing the section to a copydesk. Consider `Six platforms` and `On day one`.

### Pillar 2: Visuals (3/4)

**What works:**
- ✓ Hand-drawn SVG glyph system is consistent — `/about` principle glyphs (`src/app/about/page.tsx:7-50`), `/about` mission cards (`src/app/about/page.tsx:97-150`), and `/for-institutions` value-prop glyphs (`src/app/for-institutions/page.tsx:60-119`) all use the same vocabulary: stroke 1.25–1.5, terra fill, 32×32 or 36×36 viewBox, no fills + paths combined, no fancy SVG features. They read as a single hand.
- ✓ Hero "facts plate" on `/page.tsx` (`src/app/page.tsx:181-237`) is the strongest single visual moment in the audit — masthead-style data plate with one display-xl monumental number, hairline-divided 2-cell sub-stats, ink-on-bone band header. Reads exactly like the IBISWorld reference.
- ✓ Zero icon-library imports. `grep` for `lucide`, `@heroicons`, `@radix-ui/react-icons`, `react-icons`, `@phosphor-icons` returns empty across `src/app` and `src/components`.

**Issues:**
- ✗ The `/about` § Contact dark band (`src/app/about/page.tsx:191-216`) is doing too much: amber-light eyebrow, display-md headline in bone, body-md mailto blurb, mailto address rendered as display-xs amber-light underlined link. Four type weights, four color values, all on one band. The pull-quote band right above it is single-element editorial; the contact band loses that posture.
- ⚠ The `/about` mission monument (`src/app/about/page.tsx:75-92`) places "8,400" in `text-[clamp(4rem,12vw,9rem)]` — that's an arbitrary value rather than a token. It works visually, but it's the only arbitrary-typography-value in the audited surfaces and it's not in the type scale. Either elevate it to a real `--text-display-xxl` token or rein it back to `text-display-xl`.

### Pillar 3: Color (2/4)

**Findings:**
- ✗ **BLOCKER — amber-light used as a generic dark-band accent.** Eight occurrences across the four pages and three templates, all outside any Pillar C context:
  - `src/components/system/templates/MarketingPage.tsx:111` — closing CTA eyebrow on every dark band
  - `src/components/system/templates/ProgramPage.tsx:202` — capstone band eyebrow
  - `src/components/system/templates/ResultsPage.tsx:202` — three-paths grid arrow
  - `src/app/about/page.tsx:194` — "Talk to the Institute" eyebrow
  - `src/app/about/page.tsx:210` — mailto link
  - `src/app/education/page.tsx:125` — "$99 · $79 at 10+" pricing tag (also `bg-amber-light`)
  - `src/app/education/page.tsx:265` — team enrollment eyebrow
  - `src/app/for-institutions/page.tsx:208` — pilot-CTA eyebrow
  - `src/app/for-institutions/page.tsx:234` — bullet-list dash on dark band
  Per `03-tokens.md` §2.1: *"`--color-amber` Pillar C · Creation only. **Forbidden** outside Pillar C context."* This is the single most consequential discipline violation in the audited surface — it's already calcified into the templates, which means every page composed from `MarketingPage` inherits the violation. No "exception for dark-band accents" is documented anywhere.
- ✓ No hex literals in pages or audited components. Arbitrary hex values exist in `src/app/auth/*`, `src/app/error.tsx`, `src/app/not-found.tsx` — those are out of audit scope but should be cleaned in Wave F.
- ✓ Sage and cobalt are correctly absent from non-pillar contexts: `text-sage`, `bg-sage`, `text-cobalt`, `bg-cobalt` return zero matches across the four pages.
- ✓ Terra is the brand workhorse and behaves: hero emphasis (`<em className="not-italic text-terra">`), eyebrows, glyph fills, focus rings, the InteractiveSkillsPreview tab indicator — all canonical.

### Pillar 4: Typography (3/4)

**What works:**
- ✓ Type scale is bound to tokens (`text-display-xl`, `text-display-lg`, `text-display-md`, etc.) — no arbitrary `text-[28px]` or pixel sizes in the four pages (the one exception, the `/about` 8,400 monument, is flagged above).
- ✓ Tracking is bound (`tracking-widest` for serif-SC eyebrows, `tracking-wider` for mono labels, `tracking-tightish` for hero H1s — and `tightish` is a real token, not a guess; `tailwind.config.ts:81`).
- ✓ DM Sans never goes italic (no `font-sans italic` in any audited file).

**Issues:**
- ⚠ Italic Cormorant has reached five distinct uses across the four audited surfaces: `MarketingPage` hero tagline (`templates/MarketingPage.tsx:76`), `SectionHeader` subtitle (`SectionHeader.tsx:56`), `/about` "For the institutions that anchor towns." monument (`about/page.tsx:77`), `/education` Marginalia "AiBI Foundations · in progress" (`education/page.tsx:108`), `ROIDossier` editorial caption (`ROIDossier.tsx:145`), and the InteractiveSkillsPreview tab subhead (`InteractiveSkillsPreview.tsx:238`). Six places, four pages. The user has already flagged this as starting to feel cheap. The legitimate "warmth lever" use is the `/about` monument quote and the hero tagline. The two that should probably go: the `<SectionHeader>` subtitle italic (it's not warmth, it's just a sub-headline) and the InteractiveSkillsPreview tab subhead italic (those are functional UI captions, not editorial flourish).
- ⚠ `MarketingPage` hero h1 is `text-display-lg md:text-display-xl` (`templates/MarketingPage.tsx:72`) — the docs say `display-xl` is "Hero H1 on /about, /education, /research" *only*, and `display-lg` is "Hero H1 default (homepage, /for-institutions)". Currently both pages use the same template-resolved breakpoint pair, so /, /about, /education, and /for-institutions all promote to `display-xl` on `md`. The doc said /about and /education get the bigger size, the other two stay at `display-lg`. Either tighten the doc rule or split the template.

### Pillar 5: Spacing (4/4)

**What works:**
- ✓ Spacing tokens used cleanly: top hits in the four pages are `s3` (19), `s6` (14), `s4` (11), `s10` (10), `s2` (9), `s8` (7), `s5` (7), with stragglers at `s7`, `s12`, `s1`. The distribution matches the doc's "narrow scale, strong contrast at the high end" intent.
- ✓ Zero arbitrary spacing values (`p-[14px]`, `mt-[28px]`, etc.) in the audited surfaces.
- ✓ Section horizontal padding is canonical (`px-s7` on every `<Section>` via the primitive).
- ✓ Hairline-grid pattern (`gap-px bg-hairline border-y border-strong`) used consistently for tile groups on `/about`, `/education`, `/for-institutions` — same composition, so reading the page builds a vocabulary.

### Pillar 6: Experience Design (3/4)

**What works:**
- ✓ InteractiveSkillsPreview (`src/components/sections/InteractiveSkillsPreview.tsx`) is a small clinic in restrained interaction design: `role="tablist"` + `aria-selected` + `aria-controls` + `aria-live="polite"` on the panel; staggered line-by-line reveal (360ms first line, +320ms per subsequent line) animated via real timers, not CSS-only; copy-prompt button with `Copied` state and 1800ms reset; clipboard fallback that handles older browsers (`document.execCommand('copy')`); animated terra dot trio while the result is generating, replaced by a "Verify before you ship" mono caption when complete. The animation respects the user's "AI auto-completes inputs you watch" mental model without theatre.
- ✓ Hero CTAs are stacked correctly (primary + secondary + persistent header CTA = three CTAs page-wide, matching `08-differences-from-current-site.md` "one in the hero, one in the dark closing band, one in the header" intent — the middle band CTA was correctly removed).
- ✓ Conditional UI on `/education`: when the user is enrolled in AiBI Foundations, the hero renders a Marginalia "Your progress" card with the live `completed_modules` count and a "Resume the program" CTA. Real personalization driven from Supabase data, gracefully omitted when unenrolled.

**Issues:**
- ⚠ `/education` hero stacks Marginalia + payload tiles when enrolled, which compresses three competing focal points (eyebrow, headline, progress card, paid catalog tiles) into one band. Suggest moving the assessment tiles into their own `<Section>` immediately under the hero so each band carries one job (see Top 3 fix #3).
- ⚠ The mailto link on `/about` (`src/app/about/page.tsx:208-213`) styles a serif `display-xs` link with an underline border. On dark, it works. But there's no focus-visible treatment on the anchor explicitly — it inherits the global `--focus-ring`, but the existing border-bottom may swallow the 2px terra outline visually. Worth a manual keyboard-tab test.

---

## Files Audited

**Pages:**
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/education/page.tsx`
- `src/app/for-institutions/page.tsx`

**Components (reviewed for scoring):**
- `src/components/sections/InteractiveSkillsPreview.tsx`
- `src/components/sections/ROIDossier.tsx`
- `src/components/system/SectionHeader.tsx`
- `src/components/system/templates/MarketingPage.tsx`

**Components (touched in scoring, not deep-read):**
- `src/components/system/templates/ProgramPage.tsx` (amber-light usage)
- `src/components/system/templates/ResultsPage.tsx` (amber-light usage)
- `src/components/system/ToolGrid.tsx`, `SkillGrid.tsx` (footer audit only)

**Design-system docs read against:**
- `docs/superpowers/design-system/README.md`
- `docs/superpowers/design-system/03-tokens.md`
- `docs/superpowers/design-system/04-primitives.md`
- `docs/superpowers/design-system/05-templates.md`
- `docs/superpowers/design-system/08-differences-from-current-site.md`
- `docs/superpowers/design-system/STATUS.md`
