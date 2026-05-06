# In-Depth Assessment (feature/stripe-products) — UI Review

**Audited:** 2026-05-05
**Baseline:** Project design contract (CLAUDE.md) + spec
`docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md`
+ abstract 6-pillar standards
**Screenshots:** Not captured (code-only audit; no dev server requested)
**Stance:** Adversarial — assume failure until proven otherwise

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Voice is institutional; CTAs are specific; no generic "Submit" / "OK" anywhere |
| 2. Visuals | 3/4 | Clean hierarchy, but the take UI lacks any selected-state affordance beyond color and the dashboard distribution bar mixes terra at two opacities in a way that is hard to read |
| 3. Color | 2/4 | **Multiple terra-as-status uses break the discipline.** `STATUS_COLOR['in-progress']` and `STATUS_COLOR.complete` are both terra (lines 76–77), so two distinct states render visually identical. Champion scores, "Strongest" tag, and dashboard distribution "high" all stack terra without semantic separation. Sage / cobalt / amber are entirely absent — terra carries everything. |
| 4. Typography | 3/4 | Type stack is on-brand (Cormorant + Cormorant SC + DM Sans + DM Mono with `tabular-nums`), but eyebrow sizes drift across files (`text-xs`, `text-[11px]`, `text-[10px]`) and the take UI uses `font-mono` for "Question N of M" instead of the spec's `font-serif-sc` eyebrow pattern used everywhere else |
| 5. Spacing | 3/4 | Largely on the Tailwind scale, but arbitrary letter-spacing values (`tracking-[0.18em]`, `tracking-[0.2em]`, `tracking-[0.22em]`, `tracking-[1.2px]`, `tracking-[1.4px]`) proliferate and there is no centralized eyebrow component. Also one stray `border-[color:var(--color-ink)]/8` (line 457) — `/8` is not a valid Tailwind opacity step |
| 6. Experience Design | 3/4 | Loading, error, empty, and locked states are all handled. But: roster is read-only after first paint (`useState` with no setter, line 94) so `router.refresh()` will not re-populate it client-side; no client-side seat-cap enforcement on the textarea; no per-row "resend invite" affordance; no confirmation before sending invites |

**Overall: 18 / 24**

---

## Top 3 Priority Fixes

1. **Distinct status colors on the dashboard roster** —
   `_DashboardClient.tsx:74–78` maps both `in-progress` and `complete` to
   `var(--color-terra)`. A leader cannot tell at a glance who finished vs
   who is mid-flow. Map `complete → var(--color-sage)` and leave
   `in-progress → var(--color-terra)`; `pending → var(--color-slate)` is
   already correct. (Sage is reserved for "Pillar A" per CLAUDE.md but a
   neutral "completed" semantic is the closest analog and the brand contract
   does not forbid it for status — confirm with user; alternative is
   `--color-ink` for complete + terra for in-progress.)

2. **Roster does not refresh after sending invites** —
   `_DashboardClient.tsx:94` declares `const [roster] = useState(initialRoster)`
   with no setter. After `router.refresh()` on line 161, the server fetches
   a new roster and re-renders the page, but because `initialRoster` is only
   read on first mount the client component will keep the stale array unless
   the route segment fully remounts. Either (a) lift roster off `useState`
   and read directly from `props.initialRoster`, or (b) add a setter and
   refetch via a client API call. The current shape silently drops the
   primary user feedback signal: "did my invites land?"

3. **Eyebrow / status / number typography is inconsistent across surfaces** —
   The take UI (`_TakeClient.tsx:134`, `:137`, `:193`, `:197`) uses
   `font-mono text-xs uppercase tracking-widest` for eyebrows, while every
   other surface (results, dashboard, marketing) uses
   `font-serif-sc text-[11px] uppercase tracking-[0.2em]`. Pick one
   eyebrow recipe and apply it everywhere — the take UI currently looks
   like a different product. Recommend the `font-serif-sc` pattern that
   the rest of the In-Depth surfaces have already adopted; reserve
   `font-mono` for actual numbers.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

Voice is consistent and institutional throughout. Nothing reads as
promotional or SaaS-y.

Specifics:
- `page.tsx:82` — "The same instrument we use to scope a cohort." —
  earned, specific, on-voice.
- `BuyForMyselfCard.tsx:105` — "Buy for myself — $99" instead of
  "Submit" or "Pay now." Good.
- `BuyForMyTeamCard.tsx:168` — "Buy for my team — ${total}" with live
  total interpolation. Good.
- `_TakeClient.tsx:204–208` — completion confirmation reads as a
  diagnostic instrument, not a quiz.
- `take/page.tsx:42–46` — invalid invite copy is precise and offers
  recovery without melodrama.
- `[id]/page.tsx:94` — "Your assessment, in full." — restrained
  headline.
- `_DashboardClient.tsx:353–360` — locked-aggregate copy is the right
  shape: explains the privacy floor, tells the leader what unlocks it,
  no apology.
- No occurrences of forbidden phrases ("FFIEC-aware", "AI-powered",
  "BAI-P", etc.) in any of the audited files.
- One nit: `_DashboardClient.tsx:182–184` — "Invite your team, track
  who has finished, and read the anonymized aggregate report once you
  have at least three completed responses." Would tighten to two
  sentences for the same rhythm as the rest of the surfaces, but not
  blocking.

### Pillar 2: Visuals (3/4)

Hierarchy is clear; the focal point of every page is unambiguous.

Issues:
- `_TakeClient.tsx:166–185` — selected-state for an answer is *only*
  a color shift (terra border + terra-pale background). No checkmark,
  no left rail, no font weight change. For a 48-question instrument
  someone may revisit, the affordance is thin. Add a left accent rail
  or a small `aria-hidden` checkmark glyph.
- `_DashboardClient.tsx:529–545` — the per-dimension distribution bar
  stacks `bg-[color:var(--color-error)]/60`, `bg-[color:var(--color-terra)]/40`,
  and `bg-[color:var(--color-terra)]` in a row. The middle (terra/40)
  and right (terra/100) segments are the same hue at different
  opacities and read as one continuous bar in low light. Use distinct
  tokens (e.g., terra-pale, terra, ink) or add a 1px ink divider.
- `[id]/page.tsx:104–119` — the score number / "/192" / tier label
  baseline-align via `flex items-baseline gap-x-6 gap-y-2`. With the
  6xl/7xl number this works on desktop but on mobile the tier label
  wraps awkwardly under a giant number with no breathing room. Add
  a small bottom margin or break to a stacked layout under `md:`.
- Icon-only buttons: none present (no aria-label gaps to flag).

### Pillar 3: Color (2/4)

This is where the implementation diverges most from the brand contract.

CLAUDE.md says: "Pillar discipline is visual grammar — sage/cobalt/terra
never interchange." It also says terra is the brand signal / CTA color.
The audited surfaces interpret this as "use terra for everything,"
which is a different failure mode but still a discipline failure: when
a single color does CTA + eyebrow + active-progress + complete-status +
strongest-dimension + champion-score + distribution-high, semantic
distinctions collapse.

Findings:
- **`_DashboardClient.tsx:74–78`** — `in-progress` and `complete`
  both render `var(--color-terra)`. Two operationally distinct states
  → one visual signal. **BLOCKER for the leader UX.**
- `_DashboardClient.tsx:467` — champion scores rendered in terra. Fine
  individually, but combined with the terra "Strongest" tag two lines
  above, terra appears 4× in one card.
- `_DashboardClient.tsx:484–488` — `DimensionCard` accent flips between
  `var(--color-error)` (weakest), `var(--color-terra)` (strongest), and
  `var(--color-ink)` (default). Sage is the natural "strongest"
  signal but is unavailable per the Pillar A reservation. Acceptable
  given the constraint, but flag for user: "Strongest" being terra
  competes with the page's CTA terra.
- `_DashboardClient.tsx:531–542` — distribution bar uses error/60,
  terra/40, terra/100 — see Pillar 2. The terra-on-terra opacity stack
  is the more visually broken half of this finding.
- `_DashboardClient.tsx:501` — `'rgba(0,0,0,0.08)'` hardcoded. Should
  reference `var(--color-ink)` with an opacity modifier.
- `_DashboardClient.tsx:501` — accent border uses `accent + '40'`
  (string concat to fake 25% opacity on a hex). Works for `#b5512e40`
  but is fragile and brittle. Prefer Tailwind's
  `border-[color:var(--color-terra)]/25` syntax.
- `[id]/page.tsx:107` — score number color comes from
  `tier.colorVar` (a CSS variable name from `getTierV2`). Good — this
  is the one place the score color carries tier semantic, which is
  the canonical use.
- No hardcoded hex values in any other audited file. No use of sage,
  cobalt, or amber anywhere in the In-Depth surfaces. Every surface
  reads in terra + parch + linen + ink — institutional, but
  monochromatic.

### Pillar 4: Typography (3/4)

Type tokens are correctly imported. Numbers consistently get DM Mono
with `tabular-nums`. Cormorant SC eyebrows are used in most places.

Inconsistencies:
- `_TakeClient.tsx:134, 137, 193, 197` — eyebrows use `font-mono` not
  `font-serif-sc`. The marketing page, results page, and dashboard
  all use `font-serif-sc text-[11px] uppercase tracking-[0.2em]`.
  The take UI looks foreign because of this single mismatch.
- Eyebrow size drift: `text-xs` (page.tsx:49,114), `text-[11px]`
  (page.tsx:91,141; BuyForMyself:58; _DashboardClient:174,190,314,350,407,436,449),
  `text-[10px]` (BuyForMyself:76; results:178; _DashboardClient:385,463,509).
  Three sizes for one element class. Centralize as a component or token.
- `[id]/page.tsx:174–176` — the starter-artifact body is rendered in
  `<pre className="whitespace-pre-wrap font-sans">`. `<pre>` with
  `font-sans` is a contradiction — `<pre>` semantically signals
  preformatted (typically monospaced) text. If the artifact body is
  prose with intentional line breaks, prefer a `<div>` with
  `whitespace-pre-wrap`. If it's structured/code-like, use `font-mono`.
- `[id]/page.tsx:111` — `font-mono text-sm` for "/ 192" next to a
  6xl/7xl number. Visually the slash-and-denominator looks crammed
  against the score; consider `text-base` or aligning baseline more
  deliberately.
- Italic Cormorant on `page.tsx:54` ("Assessment") — correct per
  brief ("italic Cormorant for warmth"). Used sparingly. Good.
- No DM Sans italics found. Good.
- No `font-bold` on Cormorant. Good.

### Pillar 5: Spacing (3/4)

Most spacing uses the standard Tailwind scale (`p-6`, `py-12`, `gap-4`,
`mb-10`). Major spacing rhythm is consistent.

Issues:
- Letter-spacing arbitrary values: `tracking-[0.18em]`, `tracking-[0.2em]`,
  `tracking-[0.22em]`, `tracking-[1.2px]`, `tracking-[1.4px]`. Five
  distinct values for what is arguably 2 use cases (eyebrows + button
  labels). Consolidate.
- `_DashboardClient.tsx:457` — `border-[color:var(--color-ink)]/8`.
  Tailwind opacity scale does not include `/8`; valid steps are
  `/5`, `/10`, `/15`, `/20`. This compiles to nothing in some
  Tailwind versions / produces an arbitrary value lookup. Confirm
  build output; recommend `/10`.
- `_DashboardClient.tsx:240` — `min-h-[1.5rem]` arbitrary. Could be
  `min-h-6`.
- `BuyForMyselfCard.tsx:89, 99, 102` — `rounded-[2px]` and
  `rounded-[3px]` both used in the same card. Brief says "rounded
  corners >4px" forbidden; both 2px and 3px are fine, but pick one.
  Audit shows `rounded-[2px]` for inputs/buttons and `rounded-[3px]`
  for cards is the convention — confirm and document it.
- Border-opacity values on dividers/borders: `/10`, `/15`, `/20`, `/8`
  (the invalid one), `/5`, `/30`. Mostly consistent within a file but
  diverges across files (results uses `/15`, dashboard uses `/10`).
- `[id]/page.tsx:170` — `text-[15px] leading-[1.6]` — both arbitrary
  values for what should be `text-base leading-relaxed`. The body-
  text recipe is established in dozens of other places using
  `text-base text-[color:var(--color-ink)]/75 leading-relaxed`.

### Pillar 6: Experience Design (3/4)

State coverage is thorough; the take UI in particular handles
hydration, persistence, submit-pending, and submit-error cleanly.

Strengths:
- `_TakeClient.tsx:34–67` — localStorage persistence with hydration
  guard. Matches the established sessionStorage pattern from
  CLAUDE.md but uses localStorage (correct for a 48-question
  instrument that may span a coffee break).
- `_TakeClient.tsx:98–123` — submit handler covers loading, error,
  cleanup, and redirect.
- `_DashboardClient.tsx:318–340` — aggregate panel has loading,
  error, locked, and unlocked states all rendered.
- `take/page.tsx:33–50` — `InvalidInvite` shell is dignified.
- `take/page.tsx:92–102` — best-effort consumption marker with
  swallowed errors. Good — failure here must not block the take.
- `dashboard/page.tsx:65–139` — auth + binding + ownership check
  sequence is correct and failure modes have specific copy.

Issues:
- **`_DashboardClient.tsx:94`** — `const [roster] = useState(initialRoster)`
  has no setter. After invites send and `router.refresh()` runs
  (line 161), the *server* component re-renders and passes a new
  `initialRoster` prop, but React's `useState` only reads the initial
  value once per mount. The client roster is effectively frozen.
  This silently breaks the primary feedback loop on this page.
- `_DashboardClient.tsx:218` — textarea is disabled when
  `remainingSeats === 0` but does not enforce N ≤ remaining-seats
  client-side as the user is typing. The server will reject overage,
  but the user only learns this after submit. Spec §4.2 step 8 says
  "system enforces N ≤ remaining seats" — server enforcement exists
  per the API route, but the UI should provide a live count of
  pasted-vs-remaining.
- No confirmation dialog before sending invites. Bulk-emailing 10+
  staff via a textarea + button has no "are you sure" gate. At minimum
  a "You are about to send {n} invites" preview is warranted.
- No per-row "resend" affordance on the roster table. If invitee X
  loses their email, the leader has no recourse from the dashboard.
- `_TakeClient.tsx:201–235` — when `allAnswered`, the submit panel
  appears below the current question but does not scroll into view.
  After answering Q48, the user may not realize the submit button
  exists below. Consider auto-scroll or a sticky submit bar once
  all-answered.
- `[id]/page.tsx:11–13` — comment correctly notes "Owner-binding is
  intentionally NOT enforced here yet." Acceptable as a documented
  decision but flag in a follow-up issue: the UUID-as-token model
  means anyone with the URL sees the results.
- No print stylesheet hooks on the results page. Spec §10 says
  "PDF deferred" so this is in-scope-deferred, but the existing
  `@media print` rules in `globals.css:113–166` would benefit from
  a `data-print-hide="true"` on the footer CTA.
- `_DashboardClient.tsx:240` — `aria-live="polite"` on the result
  region is correct. Good a11y instinct.
- `take/page.tsx:18` — `robots: { index: false, follow: false }` on
  the take page. Correct — token-gated content should not index.

---

## Files Audited

- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/assessment/in-depth/page.tsx`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/assessment/in-depth/_components/BuyForMyselfCard.tsx`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/assessment/in-depth/_components/BuyForMyTeamCard.tsx`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/assessment/in-depth/take/page.tsx`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/assessment/in-depth/take/_TakeClient.tsx`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/results/in-depth/[id]/page.tsx`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/assessment/in-depth/dashboard/page.tsx`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/assessment/in-depth/dashboard/_DashboardClient.tsx`

Reference files read for context (not audited):
- `/Users/jgmbp/Projects/TheAiBankingInstitute/CLAUDE.md`
- `/Users/jgmbp/Projects/aibi-stripe-products/docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md`
- `/Users/jgmbp/Projects/aibi-stripe-products/src/app/globals.css`
