# CLAUDE.md — The AI Banking Institute

Operating rules for Claude sessions working in this repo. Several files cite
"per CLAUDE.md"; this is that document.

## What this is

A Next.js 15 site selling AI-readiness assessment ($99 In-Depth), the
Foundation course ($295), and free gated resources to **community banks and
credit unions**, with a MailerLite nurture funnel. Content currency is the
product: every regulatory citation and statistic on any surface is governed
by the claims registry (below).

## Audience & editorial bar

Write for a community-bank CEO, CFO, compliance officer, or IT lead. The test
for every piece of content: **would this reader act differently after reading
it?** If a paragraph doesn't change what they'd do, ask, or check, cut it.

Voice (mirror the live articles under `src/app/resources/*/page.tsx` and
`content/briefings/`): plain-spoken, sourced, unhurried, zero hype. Short
declarative sentences. Numbers always attributed. "You" is the institution.
No "game-changer", no "revolutionize", no exclamation points. Emails and
deep dives are signed "— James"; pulse briefings are bylined
**AiBI Research Desk**, never James.

## Sourcing rules (non-negotiable)

- **Primary sources only** for facts: the regulator's own document, the
  original survey, official data. A trade-press article is a pointer to a
  primary source, not a source.
- Every fact carries an **as-of date** in your notes, and ages: a 2024 survey
  cited in 2026 says so.
- **SR 11-7 is history.** It may appear only as the guidance SR 26-2
  superseded (April 2026), with that framing on or near the same line.
  SR 26-2 is non-binding and excludes generative/agentic AI from formal scope.
- No number appears on any surface unless it is covered by
  `content/claims/registry.json` (marketing/briefings/emails) or
  `content/citations/index.ts` (site KPI surfaces).

## Claims registry discipline

`content/claims/registry.json` + `scripts/check-claims.mjs` (CI: Claims
workflow) enforce: no expired claims (reviewBy dates), every regulatory token
registered, every statistic in email HTML and briefing MDX registered.

- Adding content with a new stat/citation → add a registry entry **in the same
  PR**: claim text, source, url, asOf, verified (today), reviewBy, match
  tokens. Verify against the primary source before registering.
- Pulse (auto-publish) PRs may only **add** registry entries, never modify or
  delete existing ones.
- Run `node scripts/check-claims.mjs` before every push that touches content.

## Content map

| Surface | Lives at | Notes |
| --- | --- | --- |
| Briefings (pulse + deep dives) | `content/briefings/<YYYY-MM-DD>-<slug>.mdx` | Filesystem-discovered; filename must match meta.date/slug |
| Legacy articles | `src/app/resources/<slug>/page.tsx` | Six bespoke TSX pages; listed in briefings feed via `content/essays/_lib/registry.ts` |
| Course | `content/courses/foundation-program/micro-modules.ts` | Strict copy tests; module 19+ needs a Supabase migration |
| Downloadables | `src/lib/resources/freeResources.manifest.json` + `public/downloads/` | Generator scripts in `scripts/`; presentation maps in `src/app/resources/data.ts` throw on missing slugs |
| Live nurture emails | `docs/mailerlite-emails/*.html` | Canonical bodies; MailerLite is synced from these |
| Claims | `content/claims/registry.json` | The fact backbone |

## Commands

- `node scripts/check-claims.mjs` — claims gate
- `npm test` / `npx vitest run <file>` — unit tests
- `npx tsc --noEmit` — typecheck
- `npm run lint` — eslint
- `npm run build` — production build (hermetic; fonts are self-hosted)
- `npm run e2e:smoke` — Playwright smoke

## Hard do-nots

- **Never edit `content/sandbox-data/`** — deliberately time-fixed teaching
  samples; module 3 contains PLANTED false citations students must catch.
- **Never use the MailerLite `update_automation_email` tool** without
  immediately rewriting the body via `update_automation_email_content` from
  the canonical file in `docs/mailerlite-emails/` — historically it destroyed
  pasted bodies.
- Never commit secrets (webhook secrets and API keys live in Vercel env).
- Never merge a deep-dive, course, or downloadable PR — James does.
- Never put a statistic anywhere without its registry/citation entry.
