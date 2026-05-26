# Promoted preview surfaces — local record

This folder holds the pixel-faithful HTML / CSS / JS bundles that were
translated from the claude.ai/design exports into Next.js routes at
`src/app/{preview-home,user-home,briefing-preview,lms-preview,courses/foundation-preview}/`
during the 2026-05 Ledger brand refresh.

Those routes have now been **decommissioned** because their visual
intent landed in the corresponding production routes:

| Old preview route | Promoted into | Notes |
|---|---|---|
| `/preview-home` | `/` (homepage) | The live 3-tile homepage (per spec v2) supersedes the prototype's older 2-pillar layout. Prototype kept for design-intent record only. |
| `/user-home` | `/dashboard` | Dashboard already uses `.ledger-dash` chrome that matches the prototype; the "Recent artifacts" strip is a future toolbox-driven feature. |
| `/briefing-preview` | `/results/[id]` + `/assessment/in-depth/results/[id]` | Masthead lockup ("Readiness Briefing · The AI Banking Institute · Confidential" + dateline + "Prepared for") ported into `ResultsViewV2.tsx`. |
| `/courses/foundation-preview` | `/courses/foundation/program/purchase` | Curriculum-by-pillar, FAQ accordion, and final-CTA sections ported into the live purchase landing. |
| `/lms-preview` | `/courses/foundation/program` | Live LMS shipped in PR #52–#56. Iframe prototype kept here as a design record. |

These bundles are **not built or routed** — they live here purely as
a design-intent reference. If you need to re-open the original
mockups, copy the `_body.html` + CSS into a scratch HTML file and
open it locally.

Sibling folder `/my-toolbox/` is intentionally NOT here yet — its
prototype IA (role-based starter kits, ask-search, stats strip) is
slated to drive a rebuild of `/dashboard/toolbox`. It will land here
when that work closes. See `Plans/toolbox-prototype-port.md` for the
in-flight plan.

Other routes that stayed live (Track C):
- `/design-system` — internal Ledger reference
- `/faq` — real public FAQ (listed in `src/app/sitemap.ts`)
- `/playground` — interactive multi-model surface
- `/redesign-checklist` — internal QA tool (revisit once migration is closed)
