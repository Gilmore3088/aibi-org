# 02 — Information Architecture: Proposed Route Tree

**Date:** 2026-05-06
**Branch:** `design-2.0`
**Purpose:** Propose a clean, scalable route tree for the site as it will look in 12 months — multiple programs, ongoing essay cadence, member dashboard, public credential verification — and document the rename map from current routes to proposed routes.
**Constraint:** No live audience or SEO equity to preserve. Free hand on renames.

---

## Principles

1. **Programs collapse under one prefix.** AiBI-Practitioner, AiBI-S, AiBI-L, and any future program live as siblings under `/education/<program>/`. Adding program N+1 is a content config + zero new page code.
2. **LMS interior is nested cleanly** under the program that owns it. The course is the program; the modules are the chapters.
3. **Research lives where research lives.** Essays move from `/resources/<slug>` → `/research/<slug>` to match the v4 brand language ("research shop, not a content hub").
4. **Funnel routes are short and named consistently.** `/assessment` (start) → `/results/[id]` (deliverable). One word, one job, one page.
5. **Member dashboard is a fortress.** Everything auth-gated lives under `/dashboard/`. Nothing leaks outside.
6. **Verify is public** by design — employers and examiners look up credentials without auth.
7. **Content as data is honored.** Routes that render lists or per-item detail iterate over content modules; they never grow new files per item.

---

## Proposed top-level tree

```
PUBLIC MARKETING & FUNNEL
  /                                        Homepage
  /about                                   Institute story + founder
  /research                                Essay archive (the AI Banking Brief)
  /research/[slug]                         Individual essay (MDX)
  /education                               Programs catalog hub (free + paid)
  /education/practitioner                  AiBI-Practitioner detail
  /education/practitioner/m/[module]       LMS module / lesson interior
  /education/practitioner/onboarding       First-run onboarding
  /education/practitioner/post-assessment  Post-course assessment
  /education/practitioner/purchase         Stripe checkout
  /education/practitioner/exam             Final certification exam
  /education/practitioner/certificate      Certificate display + download
  /education/practitioner/gallery          Practitioner artifact gallery
  /education/practitioner/toolkit          Practitioner toolkit hub
  /education/practitioner/tool-guides      Tool walkthroughs
  /education/practitioner/prompt-library   Prompt library
  /education/practitioner/quick-wins       Quick-wins log
  /education/practitioner/submit           Artifact submission
  /education/practitioner/settings         Course-scoped settings
  /education/practitioner/artifacts/[id]   Single artifact view
  /education/specialist                    AiBI-S detail
  /education/specialist/[track]            Track view (e.g., specialist/ops)
  /education/specialist/[track]/u/[unit]   Unit interior
  /education/specialist/purchase           Specialist checkout
  /education/leader                        AiBI-L detail
  /education/leader/s/[session]            Cohort session
  /education/leader/request                Request engagement
  /for-institutions                        Institutional sales surface
  /for-institutions/advisory               Advisory engagement detail
  /for-institutions/samples/[slug]         Sample artifacts (efficiency-ratio-workbook + future)

ASSESSMENT FUNNEL
  /assessment                              Diagnostic (the actual question flow)
  /assessment/start                        Diagnostic intro
  /assessment/results/print/[id]           Print version (PDF source)
  /results/[id]                            Owner-bound results (the conversion deliverable)

AUTH SURFACES
  /auth/login
  /auth/signup
  /auth/forgot-password
  /auth/reset-password

MEMBER DASHBOARD (auth-gated)
  /dashboard                               Member home
  /dashboard/progression                   Progression view across enrolled programs
  /dashboard/toolbox                       Toolbox hub
  /dashboard/toolbox/library               Library index
  /dashboard/toolbox/library/[slug]        Library item
  /dashboard/toolbox/cookbook              Cookbook index
  /dashboard/toolbox/cookbook/[slug]       Cookbook recipe

PRACTICE & MISC
  /practice/[id]                           Single practice rep
  /prompt-cards                            Prompt-cards lead magnet (public)
  /verify/[id]                             Public credential verification

LEGAL & UTILITY
  /security                                Security & governance (Pillar B landing)
  /privacy
  /terms
  /ai-use-disclaimer
  /coming-soon                             Holding page (only when COMING_SOON env active)

ADMIN (internal)
  /admin
  /admin/reviewer
  /admin/reviewer/[id]
```

---

## Rename map: current → proposed

### Programs / Courses → /education/<program>/

| Current | Proposed | Notes |
|---|---|---|
| `/courses/aibi-p` | `/education/practitioner` | Drop "aibi-p" code from URL. Keep `aibi-p` as DB identifier and component-internal. |
| `/courses/aibi-p/[module]` | `/education/practitioner/m/[module]` | `m/` prefix disambiguates module routes from utility routes (toolkit, exam, etc.). Cleaner than bare `/[module]` which can collide with future siblings. |
| `/courses/aibi-p/onboarding` | `/education/practitioner/onboarding` | |
| `/courses/aibi-p/post-assessment` | `/education/practitioner/post-assessment` | |
| `/courses/aibi-p/purchase` | `/education/practitioner/purchase` | |
| `/courses/aibi-p/certificate` | `/education/practitioner/certificate` | |
| `/courses/aibi-p/gallery` | `/education/practitioner/gallery` | |
| `/courses/aibi-p/toolkit` | `/education/practitioner/toolkit` | |
| `/courses/aibi-p/tool-guides` | `/education/practitioner/tool-guides` | |
| `/courses/aibi-p/prompt-library` | `/education/practitioner/prompt-library` | |
| `/courses/aibi-p/quick-wins` | `/education/practitioner/quick-wins` | |
| `/courses/aibi-p/submit` | `/education/practitioner/submit` | |
| `/courses/aibi-p/settings` | `/education/practitioner/settings` | |
| `/courses/aibi-p/artifacts/[artifactId]` | `/education/practitioner/artifacts/[artifactId]` | |
| `/courses/aibi-s` | `/education/specialist` | |
| `/courses/aibi-s/ops` | `/education/specialist/ops` | Treat tracks as direct children of specialist, no `/track/` prefix. Tracks are a defined finite set (Ops, Lending, Compliance, Risk). |
| `/courses/aibi-s/ops/unit/[unitId]` | `/education/specialist/ops/u/[unit]` | `u/` prefix for unit, parallel with `m/` for module. |
| `/courses/aibi-s/purchase` | `/education/specialist/purchase` | |
| `/courses/aibi-l` | `/education/leader` | |
| `/courses/aibi-l/[session]` | `/education/leader/s/[session]` | `s/` prefix for session, parallel with `m/` and `u/`. |
| `/courses/aibi-l/request` | `/education/leader/request` | |
| `/certifications/exam/aibi-p` | `/education/practitioner/exam` | The exam belongs inside the program, not in a separate `/certifications/` tree. |

### Research / Resources

| Current | Proposed | Notes |
|---|---|---|
| `/resources` | `/research` | Matches v4 brand language. "Resources" reads SaaS-y; "Research" reads institutional. |
| `/resources/six-ways-ai-fails-in-banking` | `/research/six-ways-ai-fails-in-banking` | Slug preserved; route prefix only. |
| `/resources/ai-governance-without-the-jargon` | `/research/ai-governance-without-the-jargon` | |
| `/resources/the-skill-not-the-prompt` | `/research/the-skill-not-the-prompt` | |
| `/resources/what-your-efficiency-ratio-is-hiding` | `/research/what-your-efficiency-ratio-is-hiding` | |
| `/resources/members-will-switch` | `/research/members-will-switch` | |
| `/resources/the-widening-ai-gap` | `/research/the-widening-ai-gap` | |

Essays migrate from bespoke `page.tsx` files to MDX at `content/essays/<slug>.mdx` with frontmatter (title, dek, date, topic, read-time, sources). A single `<EssayPage>` template renders any essay; `/research/[slug]/page.tsx` is one file.

### Routes that stay where they are

| Route | Reason |
|---|---|
| `/`, `/about` | Already correct. |
| `/education` | Catalog hub; already merged courses + certifications correctly per 2026-04-17 decision. |
| `/for-institutions`, `/for-institutions/advisory`, `/for-institutions/samples/[slug]` | Stable, well-organized. |
| `/assessment`, `/assessment/start`, `/assessment/results/print/[id]` | Funnel-critical, named correctly. |
| `/results/[id]` | Owner-bound, public-shareable URL. |
| `/auth/*` | Standard. |
| `/dashboard`, `/dashboard/progression`, `/dashboard/toolbox/*` | Member tree, well-organized. |
| `/practice/[id]`, `/prompt-cards`, `/verify/[id]` | Each does one thing, named correctly. |
| `/security`, `/privacy`, `/terms`, `/ai-use-disclaimer`, `/coming-soon` | Utility, no rename needed. |
| `/admin/*` | Internal, no rename. |

---

## Why "/education" remains the catalog hub (not "/programs")

I considered renaming `/education` → `/programs`. Rejected for these reasons:

1. **`/education` is the institute's word.** The brand calls itself an *education company*, not a *programs company*. The route should match the brand vocabulary.
2. **Free Classes are not programs.** The `/education` page (`src/app/education/page.tsx`) lists *both* free entry points (assessment, the Brief, short-form classes) and paid certifications. "Programs" implies paid; "Education" includes both.
3. **The 2026-04-17 decision** already merged courses + certifications into `/education`. Reverting to a `/programs` prefix relitigates a decision that's been working.

What does change is that the *individual program detail pages* nest under `/education/<program>/` instead of in a separate `/courses/` tree. One umbrella, clean nesting.

---

## Why exam moves out of `/certifications/`

The current `/certifications/exam/aibi-p` route implies "certifications" is a top-level area of the site. It isn't. Per the 2026-04-17 decision, certifications were merged into education. The exam is the final assessment of a specific program. It belongs at `/education/practitioner/exam` for the same reason the syllabus is at `/education/practitioner` and the certificate is at `/education/practitioner/certificate`.

---

## Why module/unit/session URLs use `m/`, `u/`, `s/` segments

The current `/courses/aibi-p/[module]` pattern works for AiBI-P because there are no sibling routes that would collide with module slugs. But once the program adds peers (`toolkit`, `gallery`, `quick-wins`, `prompt-library`, etc.), bare-segment module URLs are a footgun. A future module slug `gallery` would collide with the gallery route.

`m/[module]`, `u/[unit]`, `s/[session]` segments fix this and match a learning-system convention readers will recognize:

- `m/` for a module (AiBI-P)
- `u/` for a unit within a track (AiBI-S)
- `s/` for a cohort session (AiBI-L)

Three letters; permanent disambiguation; future-proof.

---

## Content-as-data layer (already partially built)

`content/` directory inventory as of 2026-05-06:

```
content/
├── advisory/v1.ts
├── assessments/
│   ├── v1/{questions,scoring}.ts
│   └── v2/{questions,scoring,rotation,personalization,pdf-content,starter-artifacts,types,index}.ts
├── certifications/v1.ts
├── courses/
│   ├── aibi-p/   (28 files: modules, v4-expanded-modules, module-10, etc.)
│   ├── aibi-s/   (skeleton)
│   └── aibi-l/   (types, index, prd)
├── email-sequences/   (4 tier folders × 3 emails each, MD)
├── institutions/v1.ts
├── practice-reps/aibi-p.ts
├── sandbox-data/aibi-p/
└── exams/
src/content/
├── prompt-cards/cards.ts
└── toolbox/templates.ts
```

**The data layer is already real.** Pages already iterate over course modules. Adding AiBI-S Lending track is `content/courses/aibi-s/lending/index.ts` + a route entry; no new bespoke page code.

What's still missing:

1. **Essays** — currently bespoke pages. Move to `content/essays/<slug>.mdx` with frontmatter.
2. **Tools/skills catalog** — referenced in v4 mockups (the "Tools you'll work with / Skills you'll leave with" sections); need `content/curriculum/tools.ts` and `content/curriculum/skills.ts`.
3. **Sourced statistics registry** — every figure in the codebase that needs a citation should reference a shared `content/citations/index.ts` so the same source isn't typed differently in three places.
4. **Marketing copy registry** — taglines, value props, the institute's mission statement should be one importable module so they don't drift across pages.

---

## Scaling characteristics

After migration, the operations to add common content become:

| Operation | Files touched |
|---|---|
| Add a new essay | 1 file: `content/essays/<slug>.mdx` |
| Add a new program (program N+1) | ~3 files: `content/courses/<n>/index.ts`, `content/courses/<n>/modules.ts`, route entry in `/education/page.tsx` |
| Add a new module to AiBI-Practitioner | 1 file: `content/courses/aibi-p/module-N.ts` (auto-picked up by existing iteration) |
| Add a new sample artifact | 1 file under `content/institutions/` or `content/samples/` plus 1 route file |
| Update a tagline or value prop | 1 file: `content/copy/index.ts` |
| Add a new sourced statistic | 1 entry in `content/citations/index.ts`; reference by id everywhere |
| Update a regulatory citation list | 1 file: `content/regulations/index.ts` (used by `<TrustStrip>`) |

This is the modular, scalable architecture the user asked for.

---

## Sitemap visualization

```
/
├── about
├── research
│   └── [slug]
├── education                                      ← public catalog
│   ├── practitioner                               ← AiBI-Practitioner program
│   │   ├── m/[module]                             ← LMS interior
│   │   ├── onboarding
│   │   ├── post-assessment
│   │   ├── purchase
│   │   ├── exam                                   ← final certification exam
│   │   ├── certificate
│   │   ├── gallery
│   │   ├── toolkit
│   │   ├── tool-guides
│   │   ├── prompt-library
│   │   ├── quick-wins
│   │   ├── submit
│   │   ├── settings
│   │   └── artifacts/[id]
│   ├── specialist                                 ← AiBI-S
│   │   ├── ops
│   │   │   └── u/[unit]
│   │   ├── lending                                ← future track (placeholder)
│   │   ├── compliance                             ← future track (placeholder)
│   │   ├── risk                                   ← future track (placeholder)
│   │   └── purchase
│   └── leader                                     ← AiBI-L
│       ├── s/[session]
│       └── request
├── for-institutions
│   ├── advisory
│   └── samples/[slug]
├── assessment
│   ├── start
│   └── results/print/[id]
├── results/[id]
├── auth
│   ├── login
│   ├── signup
│   ├── forgot-password
│   └── reset-password
├── dashboard                                      ← auth-gated
│   ├── progression
│   └── toolbox
│       ├── library
│       │   └── [slug]
│       └── cookbook
│           └── [slug]
├── practice/[id]
├── prompt-cards
├── verify/[id]
├── security
├── privacy
├── terms
├── ai-use-disclaimer
└── coming-soon                                    ← env-gated
```

---

## Migration considerations

Because there's no live audience to redirect, the old routes (`/courses/*`, `/resources/*`, `/certifications/exam/*`) can simply be **deleted** from `src/app/` once the new routes ship. No `next.config.mjs` redirect rules required.

Internal links in shared chrome (`Footer.tsx`, `Header.tsx`, `MobileNav.tsx`) and per-page `<Link>` instances must be updated. A grep + replace pass is sufficient:

- `/courses/aibi-p` → `/education/practitioner`
- `/courses/aibi-s` → `/education/specialist`
- `/courses/aibi-l` → `/education/leader`
- `/resources` → `/research`
- `/certifications/exam/aibi-p` → `/education/practitioner/exam`

Database identifiers (e.g., `course_enrollments.product = 'aibi-p'`) **stay** — they're identifiers, not URLs. The DB and the URL no longer share a string, which is a feature: rename the URL freely, never touch the DB.

---

## Decision gate

Once this proposal is accepted:

- Phase 03 (tokens) and Phase 04 (primitives) write CSS and React with the new route tree assumed. `<SiteNav>` ships with the new nav config.
- Phase 07 (migration) executes the rename in code: move directories, update imports, grep-and-replace internal links.

Estimated migration touch-count: ~40 page files moved/renamed, ~80 internal links updated, ~6 essay pages converted to MDX. One focused day's work once primitives and templates are in place.
