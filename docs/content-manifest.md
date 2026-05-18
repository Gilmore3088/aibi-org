# Content manifest

**Owner:** James Gilmore
**Last audit:** 2026-05-18
**Scope:** every user-facing route under `src/app/**/page.tsx` plus the
shared client components those routes mount.

The site is much further along than a typical pre-launch repo. The
audit found **no `Lorem ipsum`, no `[insert ...]` brackets, no `TODO`
or `FIXME` strings in user-visible JSX, and no unsourced statistics**
that aren't already flagged in `CLAUDE.md`. Real gaps are narrow and
already shipped behind explicit "scaffolded" labels that name the
follow-up issue.

This document is the working punchlist for closing the remaining real
gaps. Update the status column as work ships.

## Status codes

| Code | Meaning |
|------|---------|
| **SHIPPED** | Content is real, current, sourced where it makes a claim, and reflects platform/Anthropic best practices where it teaches them. Nothing to do. |
| **PARTIAL** | Page renders real content but one or more sections are explicitly scaffolded with a "Coming soon" card that names the follow-up issue. Acceptable for now; close as roadmap items ship. |
| **PREVIEW** | A `/preview-*` or `/lms-preview` style route that renders an imported HTML design bundle verbatim. The bundle is the source of truth; updates flow through `bundle-links.ts`. Not part of the consumer funnel. |
| **REDIRECT** | The route exists only to redirect (URL alias). No content surface. |
| **STUB** | The route is wired but the user-facing copy is thin or generic. Replace with real content. |
| **GAP** | A specific section or string is acting as filler. Replace. |

## Route inventory

### Marketing + funnel (public)

| Route | Status | Notes |
|-------|--------|-------|
| `/` | SHIPPED | Homepage. Real copy, sourced statistics, ROI calculator. |
| `/about` | SHIPPED | Founder narrative and Institute positioning. |
| `/education` | SHIPPED | Catalog of programs (Foundation, AiBI-S, AiBI-L) + assessment entry. |
| `/security` | SHIPPED | Pillar B landing. |
| `/research` | SHIPPED | Long-form research index (865 lines of real content). |
| `/research/[slug]` | SHIPPED | Individual research pieces. |
| `/resources` | PARTIAL | Five resource articles shipped. **The "AI Banking Brief" newsletter teaser at the bottom is a real "Coming soon" announcement — appropriate, not filler.** |
| `/resources/the-widening-ai-gap` | SHIPPED | |
| `/resources/six-ways-ai-fails-in-banking` | SHIPPED | |
| `/resources/the-skill-not-the-prompt` | SHIPPED | |
| `/resources/ai-governance-without-the-jargon` | SHIPPED | |
| `/resources/members-will-switch` | SHIPPED | |
| `/resources/what-your-efficiency-ratio-is-hiding` | SHIPPED | |
| `/for-institutions` | SHIPPED | Institution landing page. |
| `/for-institutions/advisory` | SHIPPED | Leadership Advisory engagement page. |
| `/for-institutions/samples/efficiency-ratio-workbook` | SHIPPED | |

### Assessment funnel

| Route | Status | Notes |
|-------|--------|-------|
| `/assessment` | SHIPPED | 12-question free diagnostic + score + email gate (sourced statistics, no FFIEC-aware language). |
| `/assessment/start` | REDIRECT | → `/assessment`. |
| `/assessment/in-depth` | SHIPPED | $295 In-Depth Assessment landing. |
| `/assessment/in-depth/purchased` | SHIPPED | Post-purchase confirmation. |
| `/assessment/in-depth/take` | SHIPPED | 48-question harness with progress save. |
| `/assessment/in-depth/results/[id]` | SHIPPED | 8-dimension Briefing render with InDepthBriefingView. |
| `/assessment/in-depth/dashboard` | PARTIAL | Real container. Three sub-surfaces (Invite staff, Aggregate report, Read-only Toolbox tier) are scaffolded with named follow-up issues. Each scaffold card explains exactly what is pending and offers a real fallback (`mailto:hello@aibankinginstitute.com` or read-only Toolbox access). Acceptable; do not replace with filler. |
| `/assessment/results/print/[id]` | SHIPPED | Print stylesheet for the free-tier results. |
| `/results/[id]` | SHIPPED | Result lookup (wraps results component). |

### Auth

| Route | Status | Notes |
|-------|--------|-------|
| `/auth/login` | SHIPPED | |
| `/auth/signup` | SHIPPED | |
| `/auth/forgot-password` | SHIPPED | |
| `/auth/reset-password` | SHIPPED | |
| `/auth/confirm` | SHIPPED | |

### Course — AiBI-Foundation

| Route | Status | Notes |
|-------|--------|-------|
| `/courses/foundation` | REDIRECT | → `/courses/foundation/program`. |
| `/courses/foundation/program` | SHIPPED | Course overview shell — 707 lines, real content. |
| `/courses/foundation/program/[module]` | SHIPPED | Per-module pages render real curriculum from `_lib/` data. |
| `/courses/foundation/program/artifacts/[artifactId]` | SHIPPED | Artifact reader. |
| `/courses/foundation/program/certificate` | PARTIAL | Real certificate render. The "LinkedIn badge integration coming soon" note is a roadmap item, not filler. |
| `/courses/foundation/program/gallery` | SHIPPED | Cohort gallery. |
| `/courses/foundation/program/onboarding` | SHIPPED | First-run onboarding. |
| `/courses/foundation/program/post-assessment` | SHIPPED | |
| `/courses/foundation/program/prompt-library` | REDIRECT | → `/dashboard/toolbox/library`. |
| `/courses/foundation/program/purchase` | SHIPPED | Stripe purchase flow. |
| `/courses/foundation/program/purchased` | SHIPPED | Post-purchase confirmation. |
| `/courses/foundation/program/quick-wins` | SHIPPED | (wraps QuickWinsClient.tsx). |
| `/courses/foundation/program/settings` | SHIPPED | |
| `/courses/foundation/program/submit` | SHIPPED | Work-product submission. |
| `/courses/foundation/program/tool-guides` | SHIPPED | Tool guide library. |
| `/courses/foundation/program/toolkit` | SHIPPED | Toolkit module. |
| `/courses/foundation-preview` | PREVIEW | Internal preview of the design bundle. |

### Course — AiBI-S (Specialist)

| Route | Status | Notes |
|-------|--------|-------|
| `/courses/aibi-s` | PARTIAL | Real landing for the Specialist tier. Future tracks (Lending, Compliance, etc.) intentionally marked "Coming soon" — they ship one at a time. |
| `/courses/aibi-s/ops` | PARTIAL | Ops track landing. Individual unit pages show "Soon" badges for unbuilt units. |
| `/courses/aibi-s/ops/unit/[unitId]` | PARTIAL | Built units render real content; unbuilt units render `UnitStub` with "Coming soon" — that is the explicit design until each unit script ships. |
| `/courses/aibi-s/purchase` | SHIPPED | |

### Course — AiBI-L (Leadership)

| Route | Status | Notes |
|-------|--------|-------|
| `/courses/aibi-l` | SHIPPED | Leadership landing. |
| `/courses/aibi-l/[session]` | SHIPPED | Per-session pages. |
| `/courses/aibi-l/request` | SHIPPED | Cohort request form. |

### Dashboard + Toolbox (logged-in learner)

| Route | Status | Notes |
|-------|--------|-------|
| `/dashboard` | SHIPPED | Ledger redesign shipped 2026-05-17 (1147 lines). |
| `/dashboard/assessments` | SHIPPED | |
| `/dashboard/progression` | SHIPPED | |
| `/dashboard/toolbox` | SHIPPED | Real ToolboxApp (59KB) with Library + Cookbook + Build. |
| `/dashboard/toolbox/library` | SHIPPED | Asset library. |
| `/dashboard/toolbox/library/[slug]` | SHIPPED | Per-asset detail + Fork. |
| `/dashboard/toolbox/cookbook` | SHIPPED | Recipe index. |
| `/dashboard/toolbox/cookbook/[slug]` | SHIPPED | Per-recipe steps. |

### Certifications

| Route | Status | Notes |
|-------|--------|-------|
| `/certifications/exam/foundation` | SHIPPED | Foundation Certificate exam render. |
| `/verify/[certificateId]` | SHIPPED | Public certificate verification page. |

### Practice + Playground + Toolbox preview

| Route | Status | Notes |
|-------|--------|-------|
| `/practice/[repId]` | SHIPPED | Practice rep harness (wraps PracticeRepClient). |
| `/playground` | SHIPPED | Playground entry (35 lines wrapping a client experience). |
| `/prompt-cards` | SHIPPED | 20 prompt cards (wraps PromptCardsExperience). |
| `/my-toolbox` | SHIPPED | v5 design + 12 production-grade tool bodies (this branch). |

### Legal

| Route | Status | Notes |
|-------|--------|-------|
| `/terms` | SHIPPED | Real terms. |
| `/privacy` | SHIPPED | Real privacy policy. |
| `/ai-use-disclaimer` | SHIPPED | Real disclaimer. |

### Design previews (internal — not consumer-facing)

These routes render imported HTML design bundles verbatim. The
bundles are the source of truth; updates land via
`src/lib/redesign/bundle-links.ts`. Each is `robots: noindex,nofollow`.

| Route | Status | Notes |
|-------|--------|-------|
| `/preview-home` | PREVIEW | The AI Banking Institute bundle homepage. |
| `/user-home` | PREVIEW | Logged-in home preview. |
| `/lms-preview` | PREVIEW | LMS prototype. |
| `/briefing-preview` | PREVIEW | In-Depth Briefing preview. |
| `/faq` | PREVIEW | FAQ bundle. |
| `/design-system` | PREVIEW | Design system reference. |

### Internal + ops

| Route | Status | Notes |
|-------|--------|-------|
| `/coming-soon` | SHIPPED | Takedown/waitlist page (intentional). |
| `/redesign-checklist` | SHIPPED | Internal QA checklist (NoteEditor). |

## Gaps to close

After the audit, only one class of true gap remains, and it is the
known one already captured elsewhere:

1. **Future AiBI-S tracks (Lending, Compliance, Risk).** Each track
   ships as its own unit pack. Plan owner already on roadmap.
   Action: keep "Coming soon" labels until each track's curriculum
   data lands in `src/app/courses/aibi-s/<track>/_lib/`.

2. **In-Depth dashboard sub-surfaces** (invite staff, aggregate report,
   read-only Toolbox tier). Action: close when issue #48 ships.

3. **Foundation certificate LinkedIn badge.** Action: close when the
   LinkedIn issuer integration ships.

4. **AI Banking Brief newsletter.** Action: launch the newsletter, then
   replace the teaser with a recent-issues list.

Everything else either renders real content or is correctly labelled
as a redirect or preview surface.

## Content quality bar

For every new content surface, the bar (from the 2026-05-18 directive):

1. **Sourced.** Every statistic cites a named publication + year. The
   sourced-statistics table in `CLAUDE.md` is the canonical list.
2. **No filler.** No Lorem, no generic "supercharge / unlock /
   leverage" copy. No marketing voice in editorial surfaces.
3. **Best-practice grade where it teaches a craft.** Prompts, skills,
   agents, and playbooks demonstrate the patterns Anthropic
   documents at `platform.claude.com/docs/.../prompt-engineering/`:
   `<role>` framing, XML-tagged sections, structured CoT, worked
   examples, explicit output formats, gates.
4. **One responsibility per file.** Side effects in `lib/`, content in
   `_lib/`, copy in the JSX it renders.

Apply this bar retroactively to anything that drifts below it.
