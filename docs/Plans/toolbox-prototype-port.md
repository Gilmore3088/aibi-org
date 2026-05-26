---
status: active
created: 2026-05-26
owner-tasks: tasks/toolbox-prototype-port.md
---

# Toolbox prototype port — `/my-toolbox` → `/dashboard/toolbox`

## Why

The `/my-toolbox` claude.ai/design prototype (preserved at `src/app/my-toolbox/`)
is a meaningfully better home view for the paid toolbox than what
currently ships at `/dashboard/toolbox`. It reframes the surface from
"five tabs of functionality" to "your working desk, by role." Specifically:

- A **stats strip** at the top — count in toolbox, new this week, stale,
  kept-after-review %, MTD spend — giving a banker an instant read of
  whether the toolbox is healthy.
- An **ask-search bar** ("Ask your toolbox — find, run, or compose…")
  that pivots the toolbox from a list to an entry point.
- **Type filter cards** — Prompts (28) · Skills (11) · Agents (5) ·
  Playbooks (3) — replacing the current kind-picker dropdown.
- **Role-based starter kits** — BSA officer, Lender, Branch manager,
  Compliance. Each kit is a curated bundle of 4–5 tools the role can
  adopt as their default desk. Marked "★ Active" when current.
- A **"Shared with you"** shelf for institution-shared artifacts (peer/team).

This is **not a visual refresh** — it is a different information
architecture for the toolbox home view. The migration is multi-day work
spanning UI, content, and likely API.

## What stays the same

- The Foundation paywall (`getPaidToolboxAccess()`).
- The Library, Build, Playground, and toolbox-detail sub-views.
- `KindPicker` / `ModelPicker` / `TemplateBuilder` / Stripe + sandbox
  integrations underneath.
- The auth gates and entitlement checks in
  `src/app/courses/foundation/program/layout.tsx` / dashboard layout.

The port replaces the **home view** (default tab) only — Library, Build,
Playground, and the detail screens continue to render below.

## Scope outline

### Phase 1 — Home view shell + static role kits

- New component `src/app/dashboard/toolbox/_components/ToolboxHomeV6.tsx`
  (succeeding `ToolboxHomeV5.tsx`). Lays out:
  - Header (kicker + role chip dropdown + H1 "Your toolbox.")
  - Stats strip (5 cells, from `useUsage()` + counts from existing
    `TOOLBOX_TEMPLATES` / saved-toolbox state)
  - Ask-search input (wired to filter `TOOLBOX_TEMPLATES` initially;
    promote to model-backed search later)
  - Type filter cards (Prompts / Skills / Agents / Playbooks) — read
    counts from `TOOLBOX_TEMPLATES` filtered by `kind`
  - Role starter kits grid (4 kits)
- Static seed data for starter kits in
  `src/content/toolbox/starter-kits.ts` — each kit: id, role label,
  headline, description, tool count, current `active` flag, tool IDs.
- Wire `ToolboxApp.tsx` (line 26) to render `ToolboxHomeV6` instead of
  `ToolboxHomeV5` when the active tab is `toolbox`.

### Phase 2 — Make the role kits functional

- "Adopt kit" mutates the user's toolbox saves to include the kit's tools
  in one batch. Reuse existing toolbox-save plumbing.
- Role switcher in the header (BSA officer ▾) persists to user prefs
  and re-orders the home view (active kit pinned).
- Track which kit is active in the dashboard layer.

### Phase 3 — Ask-search backend

- Replace the client-only filter with a thin server route that
  semantic-searches `TOOLBOX_TEMPLATES` + the user's saved tools.
  Use existing model adapters in `src/lib/sandbox/`.

### Phase 4 — "Shared with you" shelf

- Requires team/institution data model — defer until institution
  enrollment surfaces ship (`institution_enrollments` table is already
  defined per spec v2 §4).

### Phase 5 — Archive

- Once Phase 1 ships and the prototype is no longer needed as a
  source-of-truth visual reference, archive the bundle into
  `docs/brand-refresh-2026-05-09/promoted/my-toolbox/` (mirroring the
  other promoted previews) and remove `src/app/my-toolbox/` from the
  build. Strip its entry from `CHROMELESS_PATHS` and
  `src/lib/redesign/bundle-links.ts`.

## Critical files

- Live home view today: `src/app/dashboard/toolbox/_components/ToolboxHomeV5.tsx`
- Live shell: `src/app/dashboard/toolbox/ToolboxApp.tsx` (line 21 import, line 26 tab id)
- Live access gate: `src/app/dashboard/toolbox/page.tsx` → `getPaidToolboxAccess()`
- Tool data: `src/content/toolbox/templates.ts`
- Prototype source: `src/app/my-toolbox/_body.html` + `_script.js` + `my-toolbox.css`
- Prototype tool seed: `src/lib/my-toolbox/tools.ts` (already exports the
  JSON-island TOOLS map that the prototype renders)

## Verification

Each phase verifies independently:

- **Phase 1**: `/dashboard/toolbox` renders the new home view with stats,
  type filters, and four role kits. Existing Library / Build / Playground
  tabs still work. `npm run build && npx tsc --noEmit && npm run lint`
  green. Visual QA against `/my-toolbox` prototype.
- **Phase 2**: Click "Adopt kit" and observe the user's saved tools list
  contains the kit's tool IDs. Switching role pins the new active kit.
- **Phase 3**: Ask-search returns ranked tools for free-text queries.
- **Phase 4**: Institution-shared tools appear when the user is in an
  institution enrollment.
- **Phase 5**: `/my-toolbox` route is gone; only `/dashboard/toolbox`
  serves the experience.

## Out of scope

- Re-skinning Library, Build, or Playground views — these stay as
  currently shipped (already Ledger). Polish is a separate plan.
- Sharing / collaboration features beyond the "Shared with you" shelf.
- Mobile-specific layouts beyond what the prototype already shows.
