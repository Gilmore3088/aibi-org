# Foundation UI Specialist — dashboard surfaces (2026-05-24)

**Routes:**
- `/foundation/dashboard` · **HTTP:** 200
- `/foundation/dashboard/toolbox` · **HTTP:** 200
- `/foundation/dashboard/team` · **HTTP:** 200

**Brief:** [`foundation-ui-specialist-brief.md`](./foundation-ui-specialist-brief.md)

**Sources reviewed:**
- `src/app/(addie)/foundation/dashboard/page.tsx`
- `src/app/(addie)/foundation/dashboard/toolbox/page.tsx`
- `src/app/(addie)/foundation/dashboard/toolbox/[itemId]/page.tsx`
- `src/app/(addie)/foundation/dashboard/team/page.tsx`
- `src/components/addie/dashboard/{NextUpCard,ProgressRing,ToolboxSummary}.tsx`
- `src/components/addie/dashboard/team/{TeamHeader,SeatsTable,InviteSeatsForm,NotATeamAdminEmptyState,RevokeSeatButton,SeatStatusPill}.tsx`
- `src/components/addie/toolbox/ToolboxItemCard.tsx`

---

## Findings

### F1 — Toolbox "Open Toolbox" link is broken (doubled path segment)

- **Severity:** BLOCKER
- **Rule:** Functional regression — link does not navigate to a real route. The dashboard's primary route into the Toolbox is dead.
- **File:** `src/components/addie/dashboard/ToolboxSummary.tsx:28`
- **What's wrong:** `href` is `/foundation/foundation/dashboard/toolbox` — note the doubled `foundation/foundation/`. The real route is `/foundation/dashboard/toolbox`. Clicking the link from `/foundation/dashboard` produces a 404 (or whatever the deeper segment resolves to).
- **Evidence:**
  ```tsx
  <Link
    href="/foundation/foundation/dashboard/toolbox"
    className="mt-3 inline-block font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-accent)] hover:underline"
  >
    Open Toolbox →
  </Link>
  ```
- **Fix:** Change href to `/foundation/dashboard/toolbox`. Same comment at the top of `src/app/(addie)/foundation/dashboard/toolbox/[itemId]/page.tsx:1` (`// /foundation/foundation/dashboard/toolbox/[itemId] — single artifact viewer.`) — wrong path in the comment only, but worth a swipe.

### F2 — Team-page headings use `font-newsreader`, which is not defined in Tailwind config

- **Severity:** HIGH
- **Rule:** 3 (Typography) — Newsreader is the display family, but it must be referenced via the defined utility. `tailwind.config.ts` only registers `font-serif` (which maps to `var(--font-serif)`). `font-newsreader` is not a registered utility; the class is dropped and headings render in the browser default serif (or whatever inherits), which on Ledger ends up as inconsistent type vs the rest of the dashboard (which uses `font-serif`).
- **Files:**
  - `src/components/addie/dashboard/team/TeamHeader.tsx:21`
  - `src/components/addie/dashboard/team/NotATeamAdminEmptyState.tsx:12`
  - `src/app/(addie)/foundation/dashboard/team/page.tsx:44, 76, 86`
- **What's wrong:** Class string `font-newsreader` is referenced in five places on the team surface; no other foundation page uses it (dashboard + toolbox use `font-serif`). It silently no-ops in Tailwind.
- **Evidence:**
  ```tsx
  // TeamHeader.tsx:21
  <h1 className="font-newsreader text-3xl text-[var(--ledger-ink)] mt-2">
    {team.name}
  </h1>

  // team/page.tsx:44
  <h1 className="font-newsreader text-3xl text-[var(--ledger-ink)] mt-2">
    Sign in to manage your team
  </h1>

  // team/page.tsx:76, 86
  <h2 id="seats-heading" className="font-newsreader text-xl text-[var(--ledger-ink)] mb-3">
    Seats
  </h2>
  ```
- **Fix:** Replace every `font-newsreader` with `font-serif` across the five sites — that is the Tailwind-mapped utility for Newsreader on this project. Alternative (worse): add `newsreader: ["var(--font-serif)"]` to `tailwind.config.ts` `fontFamily`. Don't do that — it duplicates a token under two names.

### F3 — `MaturityJourney` full variant is not actually rendered on `/foundation/dashboard`

- **Severity:** MEDIUM
- **Rule:** Brief alignment / consistency — the dispatch brief states "The `MaturityJourney` full variant renders here." It does not. `grep` for `MaturityJourney` against `src/app/(addie)/foundation/dashboard/**` returns zero hits. The component exists at `src/components/addie/lesson/MaturityJourney.tsx` and is only referenced from lesson surfaces.
- **File:** `src/app/(addie)/foundation/dashboard/page.tsx` (omission; no line)
- **What's wrong:** Either (a) the brief is stale and MaturityJourney should not appear here, or (b) it was meant to be mounted and was dropped. If the dashboard is the spine view of the 5-stage transformation arc, the absence is a real content gap; if not, this finding can be closed by updating the brief.
- **Fix:** Confirm intent with the engineer. If MaturityJourney belongs on the dashboard, mount the `full` variant beneath the next-up / progress / toolbox row inside `<main>` of `page.tsx`. If not, remove the line from the dispatch brief and close.

### F4 — Empty/anonymous dashboard has no path into the Toolbox for an anonymous lead

- **Severity:** LOW
- **Rule:** 1 (branch-scoped PRD) — every save is a lead; an anon viewer needs a visible way to get to the gate. Currently the anonymous state on `/foundation/dashboard` shows only the next-up card + a one-line "browsing anonymously" note. The Toolbox tile (with its `count / FREE_TIER_ARTIFACT_CAP` line and "Open Toolbox →" link) renders only on the signed-in branch — but anon viewers are exactly who the dashboard should be pulling toward the gate.
- **File:** `src/app/(addie)/foundation/dashboard/page.tsx:120-165`
- **What's wrong:** `<ToolboxSummary>` always renders, but only inside the signed-in `<div>` half. For anon viewers, the right column is just `<ProgressRing value={0} />` + 0/0 lessons. No CTA toward the gate, no "what is the Toolbox," no email prompt beyond the one-liner in the header. The header sentence also reads slightly defensive ("You're browsing anonymously") rather than directional.
- **Fix:** Either (a) render a "Save what you build — add an email" CTA tile in place of the Toolbox tile for anon viewers (link to `/foundation/gate`), or (b) extend `<ToolboxSummary>` with an anonymous variant that says "0 of 4 free saves used · add an email to keep them." Keep the call to the gate from this surface; don't leave anon viewers with a dead-feeling right column.

### F5 — `font-mono` `text-[0.7rem]` and `text-[0.65rem]` literals are inconsistent

- **Severity:** LOW
- **Rule:** 3 (Typography) — the project has type tokens (`text-mono-sm`, `text-label-md`) for exactly this. Arbitrary `text-[0.65rem]` and `text-[0.7rem]` literals proliferate the kicker sizing instead of using the token.
- **Files (sample):**
  - `src/components/addie/dashboard/NextUpCard.tsx:20`
  - `src/components/addie/dashboard/ProgressRing.tsx:58`
  - `src/components/addie/dashboard/ToolboxSummary.tsx:29`
  - `src/components/addie/dashboard/team/TeamHeader.tsx:37, 59`
  - `src/components/addie/dashboard/team/SeatStatusPill.tsx:29-30`
  - `src/components/addie/dashboard/team/SeatsTable.tsx:154, 192, 224`
  - `src/components/addie/dashboard/team/InviteSeatsForm.tsx:112, 173, 183`
  - `src/components/addie/toolbox/ToolboxItemCard.tsx:37`
- **What's wrong:** Two different literal sizes (`0.65rem` and `0.7rem`) appear with the same role (mono kicker). Either the project has a single kicker size and one of these is wrong, or the design system has both sizes and they should be token utilities. Right now you can't tell from the call sites.
- **Fix:** Pick one of two paths: (a) replace both literals with the `text-mono-sm` / `text-label-md` Tailwind utilities defined in `tailwind.config.ts:97-99`; or (b) standardize on `<KickerLabel>` (used elsewhere on these surfaces) and drop the inline mono kicker spans. The `<KickerLabel>` component is already imported on every one of these files — use it.

### F6 — Seat table "STATUS" pill colors include gold (`--ledger-accent`) as a status hue

- **Severity:** LOW
- **Rule:** Design context — gold is for emphasis and primary-CTA only, never as a data/status hue. Oxblood for destructive. The "assigned" pill uses `border-[var(--ledger-accent)]` + `bg-[var(--ledger-tape)]` — that puts gold on every active seat in the table.
- **File:** `src/components/addie/dashboard/team/SeatStatusPill.tsx:11-15`
- **What's wrong:** Three statuses, three color systems. Gold on assigned reads as if every assigned seat is being emphasized; rule 6 says one shadow / one accent. The tape ground is fine; the gold border puts emphasis on every row.
- **Evidence:**
  ```tsx
  assigned:
    'bg-[var(--ledger-tape)] text-[var(--ledger-ink)] border-[var(--ledger-accent)]',
  ```
- **Fix:** Drop the gold border. Use `border-[var(--ledger-rule-strong)]` for the "assigned" pill so it reads as the calm/active state; leave oxblood for revoked. Or, drop colored borders entirely and differentiate the three statuses with the ground tone alone (parch / tape / paper).

### F7 — `ProgressRing` text node will inherit the global italic-kill but should declare `font-style: normal` for resilience

- **Severity:** LOW
- **Rule:** 3 (Typography) — italics retired globally. The SVG `<text>` is fine in modern browsers because `*{font-style:normal!important}` in `base.css` catches it, but the team `SeatStatusPill` and TeamHeader dt/dd nodes carry no explicit fallback. Not a finding by itself, just worth noting: nothing on these three surfaces introduces italics, so the global rule holds. No fix required — flagging only because the brief asked specifically about `<em>`/`italic`.
- **File:** n/a — observational
- **Fix:** None. Confirmed clean.

### F8 — Anonymous toolbox page returns "Sign in to see your Toolbox" without a CTA

- **Severity:** LOW
- **Rule:** Voice/journey — anon users can't actually save anything on the rebuild without crossing the gate, so the toolbox page's empty state should either link to the gate or to sign-in, not just describe what's missing.
- **File:** `src/app/(addie)/foundation/dashboard/toolbox/page.tsx:69-72`
- **Evidence:**
  ```tsx
  {!d.signedIn ? (
    <p className="text-[var(--ledger-muted)]">
      Sign in to see your Toolbox. Anonymous saves require an email — visit the gate to add one.
    </p>
  )
  ```
- **Fix:** Wrap the words "the gate" with `<Link href="/foundation/gate">` and pair with a secondary `<LedgerButton>` linking to `/auth/login?next=/foundation/dashboard/toolbox`. Don't tell readers to "visit the gate" without giving them the door.

### F9 — "Wave 2b will seed them" copy still recurs (out of this surface's scope, but flagged per brief instruction)

- **Severity:** LOW (informational; not on these three routes)
- **Rule:** Brief instruction — "verify it doesn't recur"
- **File:** `src/components/addie/interactives/m3/SpotTheViolation.tsx:143`
- **What's wrong:** The brief asked the specialist to verify the Wave 2b copy has been replaced. It is gone from the three reviewed routes, but one site remains in the M3 interactive ("No scenarios have been seeded for this exercise. Wave 2b will seed…"). Outside this dispatch's scope; logging here so the next M3 specialist sees it.
- **Fix:** Defer to the M3 sweep. Either replace with a route-stable empty state ("No scenarios available yet — check back after course launch.") or seed the scenarios so the branch never reaches.

---

## Verdict

**Fix-then-ship.** F1 is a real navigation bug (the dashboard's primary link to the Toolbox is dead) and F2 is a silently-failing typography class on the entire team surface — both must land before this set of surfaces is reviewable visually. F3 is either a missed mount or a stale brief and needs an answer from the engineer. F4–F8 are polish items that should land before the surfaces ship to learners but don't block a re-review.

**Severity counts:** 1 BLOCKER · 1 HIGH · 1 MEDIUM · 6 LOW
