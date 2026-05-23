# AiBI — Screen Inventory + User Flows
*Every screen we build, every flow that connects them, and the states each screen has to handle. Pairs with `AiBI_Design_System_Spec.md` (how things look). This doc owns **what** screens exist and **how** the learner moves between them.*

| | |
|---|---|
| **Audience** | Designers · frontend devs · QA · PM |
| **Status** | Spec v1 — read before sketching any new screen |
| **Source of truth for flows** | This document. If a flow diagram appears elsewhere and conflicts, this doc wins. |

---

## 1 · Inventory at a glance

| Surface family | Screens | Owner |
|---|---|---|
| Marketing | home, about, security, resources | web app |
| Funnel entry | `/assessment` landing, $99 In-Depth Assessment runner, Foundation course landing | web app |
| Auth | sign-up, sign-in, verify email, password reset, OAuth callback | Supabase Auth + web app |
| Course player | course shell, lesson (all modalities), branched lesson variant, **the gate**, knowledge check | web app |
| Sandbox | first-run single, A/B compare, skill builder, run-skill, output review | web app + Sandbox Service |
| Toolbox | drawer, artifact viewer, artifact editor, export | web app |
| Account | dashboard (own progress), profile, marketing-consent, data export, delete account | web app |
| Team admin | team dashboard, seat list, invite seats, revoke seat | web app |
| Checkout | individual checkout · team checkout · assessment checkout · post-purchase success · purchase receipt | Stripe-hosted + web app |
| System | 404 · 500 · maintenance · coming-soon · cookie/consent notice | web app |

Roughly **45 screens** in v1, depending on how a few states get split. The map below names each one with its purpose, key states, and the components from `AiBI_Design_System_Spec.md` it composes.

---

## 2 · Identity-driven access (the same table as Auth §8, restated as a UX-side rule)

What a learner can *see* maps to their identity state:

| Surface | Anon | Lead | Free learner | Paid learner | Team admin |
|---|---|---|---|---|---|
| Marketing | ✓ | ✓ | ✓ | ✓ | ✓ |
| M0–M3 lesson player | ✓ | ✓ | ✓ | ✓ | ✓ |
| Save artifact (light, cap 4) | ✗ → gate | ✓ | ✓ | ✓ | ✓ |
| Gate (after M3) | ✓ | shown as "already captured" | shown as "your status" | shown as completion ack | shown as completion ack |
| Checkout pages | ✓ | ✓ | ✓ | ✓ | ✓ |
| M4–M5 lesson player | ✗ → upgrade | ✗ → upgrade | ✗ → upgrade | ✓ | ✓ (if entitled) |
| Toolbox unlimited + Prompt Library | ✗ | ✗ | ✗ | ✓ | ✓ |
| Dashboard (own progress) | ✗ → sign in | ✗ → sign in | ✓ | ✓ | ✓ |
| Team dashboard | ✗ | ✗ | ✗ | ✗ | ✓ |
| Account settings | ✗ | ✗ | ✓ | ✓ | ✓ |

Every screen below documents which identity tier(s) it serves.

---

## 3 · Screen catalogue (purpose · states · components)

Each entry lists: identity tier(s), purpose, primary states, and which design-system components it uses.

### 3.1 Marketing

#### `/` Home
- **Tier:** all. **Purpose:** introduce the Institute and route to assessment / Foundation course.
- **States:** default · with-active-cookie (resumes course progress in a strip).
- **Components:** SiteNav · hero card · two CTA cards (Take the Assessment / Start the Course) · brief institute statement · footer.

#### `/about`
- **Tier:** all. **Purpose:** founder story + institute positioning.
- **States:** default.
- **Components:** standard editorial article layout (Newsreader H1, body in Geist).

#### `/security`
- **Tier:** all. **Purpose:** the buyer-trust page — the no-PII-by-design posture, provider data terms, security model.
- **States:** default · with-pdf-download (one-pager).
- **Components:** article layout + downloadable PDF card. Sources the Sandbox spec §5 "honest posture" and Auth §10 marketing-consent statement.

#### `/resources`
- **Tier:** all. **Purpose:** AI Banking Brief archive + newsletter signup.
- **States:** default · post-subscribe.

### 3.2 Funnel entry

#### `/assessment` (landing)
- **Tier:** all. **Purpose:** explain the $99 In-Depth Assessment; offer free preview if one exists; CTA to purchase.
- **States:** default · already-purchased (deep-link into the runner).
- **Components:** hero card · benefits strip (the four deliverables) · proof block · purchase CTA.
- **Note:** existing `/assessment` (12-Q free) and `/assessment/in-depth` ($99) need reconciliation with the ADDIE 48-Q / 10+ dimension spec (CLAUDE.md flagged). Until that reconciliation lands, this screen continues to point at the existing surfaces.

#### `/assessment/in-depth/runner` (the 48-question runner)
- **Tier:** purchased only. **Purpose:** present the 48 questions, score, generate the four deliverables.
- **States:** intro · question N of 48 · save-and-resume · complete · deliverables.
- **Components:** progress strip · question card (one at a time on mobile) · multi-select inputs · "save and resume" affordance.
- **Critical UX:** must be resumable. `sessionStorage` mirror like the current assessment.

#### `/assessment/results`
- **Tier:** purchased only. **Purpose:** show the dimensional scorecard, personalized plan, ideas + prompts, CTAs.
- **States:** default · with-shareable-summary-link (no PII, never shared automatically).
- **Components:** scorecard chart (Ledger chart spec) · plan card · ideas/prompts list · CTA cards.

#### `/courses/foundation` (landing)
- **Tier:** all. **Purpose:** explain the course; show what's free vs. paid; CTA to start (free).
- **States:** default · with-active-progress (resume CTA).
- **Components:** hero · 6-module strip with FREE/PAID markers · proof block · two CTAs (Start free / Buy individual).

### 3.3 Auth

#### `/auth/sign-up` · `/auth/sign-in` · `/auth/verify-email` · `/auth/reset-password` · `/auth/callback`
- **Tier:** anon (sign-up/sign-in); lead (verify); learner (reset).
- **Purpose:** Supabase Auth flows.
- **States:** default · error · loading · email-sent · success.
- **Components:** centered Paper card · Inputs · primary Button · OAuth buttons (Google, Microsoft) · marketing-consent checkbox (sign-up only, unchecked by default).
- **Critical:** never auto-create accounts; never auto-authorize OAuth without explicit click.

### 3.4 Course player (the bulk of the work)

#### Course shell (frame around every lesson)
- **Tier:** anon (free), learner (free + paid).
- **Layout:** SiteNav · breadcrumb · sidebar (module/lesson tree) · main content · Toolbox drawer toggle.
- **States:** default · sidebar-collapsed (mobile) · with-track-indicator (chip showing active track + change link).

#### `/courses/foundation/m0/0-1` — How this works + your Toolbox (M0.1, video)
- **Tier:** anon allowed. **Purpose:** orientation video + track picker.
- **States:** default · video-playing · track-picked · checks-complete · take-saved.
- **Components:** lesson header · video player (captions + transcript) · track picker (5 cards) · "save course roadmap" affordance (saves if learner has identity, prompts gate fork if anon and they try to save) · knowledge check.

#### `/courses/foundation/m0/0-2` — The one rule: data discipline (M0.2, video + sorter)
- **Tier:** anon allowed.
- **States:** default · video-playing · sorter-active · sorter-complete · take-saved · check-complete.
- **Components:** lesson header · video · "off-limits in your world" sorter (5-track variants; 4 items each; immediate feedback) · Data Discipline Card preview + save · knowledge check.

#### M1 lessons (4 lessons, mostly video + one branched audio at 1.3)
Each follows the lesson template. Notable variants:
- `1.2` adds the **tool landscape sortable matrix** (interactive, filterable).
- `1.3` is branched ×5 (audio + read).
- `1.4` is video.

#### M2 lessons (4 lessons, includes the first **sandbox** at 2.3)
- `2.1` getting access (video walkthrough).
- `2.2` what each tool is for (video).
- `2.3` **first conversation** — Sandbox single-mode UI; one preset prompt, one send. Output canvas + save-to-Toolbox.
- `2.4` "where AI fits your week" worksheet (branched ×5).

#### M3 lessons (5 lessons, the last free module; ends in the gate)
- `3.1` anatomy of a prompt (video).
- `3.2` **A/B sandbox** — three lever sets side-by-side. The conceptual heart of the free tier.
- `3.3` prompting patterns (video + cheat sheet save).
- `3.4` banking no-nos + **spot-the-violation** interactive.
- `3.5` real use cases (sandbox, branched ×5) — produces the Starter Prompt Pack.
- **Then the gate.**

#### `/courses/foundation/gate` — The three-way fork
- **Tier:** anon (anyone reaching end of M3).
- **Purpose:** Pay · Email-to-keep · Decline.
- **States:** default · email-submitting · email-error · email-success · decline-confirmed · paying (redirecting to Stripe).
- **Components:** three equal cards (gate fork from Design System §5.6). The most-tested screen in the product.

#### M4 lessons (4 lessons, paid)
- `4.1` what a skill is (video).
- `4.2` build your first skill (skill builder).
- `4.3` build a skill for your role (skill builder, branched ×5).
- `4.4` test, refine, guardrail-check (skill builder).

#### M5 lessons (5 lessons, paid)
- `5.1` what an agent is (video).
- `5.2` framing a problem (video + worksheet → Problem Backlog save).
- `5.3` writing a lightweight PRD (interactive PRD builder).
- `5.4` build a prototype (interactive + link-out to Lovable/Replit/Claude Code; capture link as Prototype artifact).
- `5.5` where to go next (audio send-off).

### 3.5 Sandbox-specific UI patterns

#### Single-run sandbox panel (M2.3, M3.5, M4.3, etc.)
- **States:** idle · pre-flight check (PII scan on data slots) · running (loading, max 3s p50) · output rendered · saved · error · rate-limited.
- **Components:** lever controls · provider switcher · run button · output canvas with metadata (tokens, provider, latency).

#### A/B compare panel (M3.2)
- **States:** idle · running (N parallel) · all-rendered · partial-rendered (one provider failed) · diff-annotated (learner highlights what changed).
- **Components:** 2–3 output canvases · "annotate what improved" inline tool · save best config.

#### Skill builder panel (M4)
- **States:** new · template-selected · slots-being-defined · saved · running-with-new-inputs.
- **Components:** template selector · input-slot editor (labeled + default value) · save action · "run with new inputs" form.

### 3.6 Toolbox

#### Toolbox drawer (overlay, any course screen)
- **Tier:** lead / learner. **Purpose:** see all saved artifacts, open or export.
- **States:** empty · with-items · approaching-cap (free, 3/4) · cap-reached (free, 4/4 — next save prompts gate fork copy) · paid-unlimited.
- **Components:** drawer · artifact cards · export menu · upgrade prompt (free only).

#### `/toolbox/items/:id` Artifact viewer
- **Tier:** owner only. **Purpose:** render the `.md` artifact, allow edit + version history + export.
- **States:** view · edit · version-history · exporting.

### 3.7 Account

#### `/dashboard` — Own progress
- **Tier:** learner. **Purpose:** at-a-glance progress, Toolbox shortcut, "what's next."
- **States:** new (no progress) · in-progress · complete (M5 done).
- **Components:** progress strip · Toolbox preview · next-action card.

#### `/account` — Profile + consent + data export
- **Tier:** learner.
- **States:** view · editing · marketing-consent-update · export-requested · delete-confirm.
- **Components:** form sections · destructive button for delete (Oxblood, confirmation modal).

### 3.8 Team admin

#### `/dashboard/team` — Team rollup
- **Tier:** team admin. **Purpose:** seat status + aggregate progress + activity rollup.
- **States:** seats-all-pending · seats-mixed · all-active · with-revoked.
- **Components:** seat list table · aggregate cards (completion %, sandbox runs, artifacts saved). **No artifact bodies. No transcripts.** Ever.

#### `/dashboard/team/seats/invite`
- **Tier:** team admin.
- **States:** form · validating · sending · sent · errors.
- **Components:** bulk-email input · validation feedback · primary button.

### 3.9 Checkout

#### `/checkout/individual` · `/checkout/team` · `/checkout/assessment`
- **Tier:** all.
- **Purpose:** confirm SKU + initiate Stripe Checkout (server-side redirect).
- **States:** confirm · creating-session · redirecting · returned-success · returned-cancel.

#### `/checkout/success` · `/checkout/cancel`
- **States:** success (show what was unlocked, next step) · cancel (offer retry or go back).

### 3.10 System

#### `/404`, `/500`, `/maintenance`, `/coming-soon`
- **Components:** centered Paper card · short message · single CTA (home or contact).

#### Cookie / consent notice
- **Where:** bottom strip, persistent until acknowledged.
- **Copy:** essential cookies + analytics opt-out link.

---

## 4 · Primary user flows (the ones to wire end-to-end)

### Flow A — Anonymous learner all the way to gate (free path)
```
/ (home) → /courses/foundation (landing) → M0.1 → M0.2 → M1.1–1.4 → M2.1–2.4 (incl. 2.3 sandbox) → M3.1–3.5 (incl. 3.2 A/B, 3.5 sandbox + Starter Prompt Pack) → /courses/foundation/gate
```
Anon throughout. Any "save" prompt before the gate shows a mini gate-fork (Save requires email — give email now, or skip).

### Flow B — Gate → Email-to-keep → Lead
```
gate → POST /api/gate/capture-email → MailerLite synced → "Your artifacts are saved" confirmation → CTA into $99 assessment landing
```
On success: anon → lead. Artifacts migrate from `anon_session_id` to `lead_id` in one transaction.

### Flow C — Gate → Pay (Individual) → Account creation → Paid learner
```
gate → /checkout/individual → Stripe Checkout (hosted) → /checkout/success → "Create your account" prompt → /auth/sign-up → /auth/verify-email → /courses/foundation/m4/4-1
```
Webhook writes entitlement (deferred if user doesn't exist yet); lead-bind fires on sign-up; entitlement attaches.

### Flow D — Gate → Pay (Team) → Admin creates account → Invite seats → Each seat self-registers
```
gate → /checkout/team (with seats input) → Stripe Checkout → /checkout/success → admin creates account → /dashboard/team → invite seats → invitee receives email → invitee /auth/sign-up with invite token → seat assigned + entitlement granted → invitee /courses/foundation
```

### Flow E — Assessment-first entry
```
/ → /assessment → /checkout/assessment → Stripe → /assessment/in-depth/runner (48 Q) → /assessment/results → CTA into /courses/foundation (track + profile pre-filled)
```

### Flow F — Lead returns days later, signs up
```
MailerLite nurture email → /courses/foundation → resume from cookie if present → /auth/sign-up with same email → lead-bind runs → toolbox items + assessment result attach → /dashboard
```

### Flow G — Paid learner builds a Skill (M4.3)
```
/courses/foundation/m4/4-3 (sandbox, branched ×5) → select template → define slots → save Skill → re-run with new inputs → save final to Toolbox
```

### Flow H — Account export / delete (PRD NFR-PRIV2)
```
/account → "Export my data" → email with signed link (24h) → download .zip
/account → "Delete my account" → confirm modal → 30-day soft-delete → email confirmation
```

---

## 5 · State checklist (every screen must handle)

For every screen in §3, QA verifies these states render correctly:

- **Empty** — no data, sensible "first time" copy.
- **Loading** — never a blank canvas; skeleton or spinner.
- **Error** — clear message + recovery action; `role="alert"`.
- **Success** — confirmation + next action.
- **Locked** — when identity tier doesn't permit; explain how to unlock without blame.
- **Offline / network failure** — graceful degradation; retry CTA.

For **interactive** components (sandbox, sorter, skill builder, gate fork) add:
- **Pre-flight check** (PII scan, rate-limit check).
- **In-flight** (loading state on the action, button disabled).
- **Post-flight** (success or error with recovery).

---

## 6 · Mobile considerations (mobile-first non-negotiable)

- **One question per view on the assessment runner.** Existing assessment honors this; new runner inherits.
- **Sandbox levers wrap into a single column on `<md`.** A/B view stacks vertically.
- **Toolbox drawer becomes full-screen** on `<md`.
- **Course-shell sidebar becomes a drawer** on `<md`. (Open §3 of `AiBI_Design_System_Spec.md`.)
- **Touch targets ≥ 44×44** on every interactive control.
- **Hover states must have a tap equivalent** — no hover-only affordances.

---

## 7 · Build order (the screens to ship first)

1. **Auth flows** (sign-up, sign-in, verify, reset) — gate the rest of the system.
2. **Course shell + M0.1 + M0.2** — proves the pattern end-to-end with no sandbox dependency.
3. **The gate fork screen** — the conversion moment; designed and prototyped before any M3 work.
4. **First sandbox surface (M2.3)** — proves the sandbox UI pattern.
5. **A/B sandbox (M3.2)** — the highest-leverage interactive in the free tier.
6. **Toolbox drawer + artifact viewer** — needed before the gate.
7. **Checkout flows** — required for gate → paid path.
8. **M4 + M5 lesson surfaces + skill builder + PRD builder** — paid value.
9. **Team admin dashboard.**
10. **Account settings + export + delete.**
11. **Marketing pages** (refresh on existing aesthetic).
12. **Assessment surfaces** (after reconciliation with `content/assessments/v2/`).

---

## 8 · Acceptance gates

Before any screen ships:
- [ ] Handles all six baseline states (§5).
- [ ] Passes WCAG 2.1 AA (per Design System §9 checklist).
- [ ] Tested on iPhone Safari + a desktop browser.
- [ ] Components used are from the kit; no one-offs.
- [ ] Copy obeys the voice rules (Design System §8).
- [ ] No banned patterns (Design System §11).
- [ ] Mobile touch targets ≥ 44×44.
- [ ] Identity-tier access verified (the right people see the right screens; everyone else gets a graceful "locked" state, not a blank or 500).

---

## 9 · Open decisions (UX)

1. **Track switch latency.** Changing track mid-course recomputes branched lessons. Cache miss vs. instant — fine for v1 to slow-render the new track on next visit, but think about it.
2. **Resume strategy.** When a lead returns, where do we land them? Last lesson? Dashboard? Gate (if they declined)? Default: last lesson.
3. **Reduced-motion empty-state copy** — if `prefers-reduced-motion`, do we strip animations entirely or keep micro-fades? Probably keep micro-fades (no harm); confirm with a screen reader test.
4. **Sandbox "model comparison" surface** — A/B mode shows lever differences; does it also show a model-vs-model panel separate from levers? Pedagogically useful but adds UI; punt to v1.5 unless content authors push for it.
5. **Account-deletion grace period UI** — show a "you can recover until <date>" banner site-wide for the 30-day window, or just on the account page? Probably account-only.

---

## 10 · Cross-references

- `AiBI_Design_System_Spec.md` — the components these screens compose.
- `AiBI_Auth_Entitlements_Spec.md` §8 (gating logic — UX side mirrors that table).
- `AiBI_Sandbox_Service_Tech_Spec.md` §3 + §8 — Exercise modes inform the sandbox UI patterns here.
- Foundation PRD §5 (key user journeys — same flows, this doc draws them as screens).
- Module 0 Orientation — already names the M0.1 + M0.2 screens in their fully-scripted form.
- Handoff Docs Checklist — closes the "Screen inventory + user flows" P1.
