# 07 — Migration Plan

**Date:** 2026-05-07
**Branch:** `design-2.0`
**Purpose:** Track the wholesale migration of the live site onto the new design system. Big-bang refactor; no live audience to redirect; old routes deleted as new ones ship.

---

## Status snapshot

| Wave | Scope | Status |
|---|---|---|
| **A** | High-visibility public pages | ✅ Shipped |
| **B** | Catalog + research + governance | ✅ Shipped |
| **C** | Assessment funnel (start, in-flow, results) | ⏸ Not yet started |
| **D** | LMS — `/courses/aibi-p` → `/education/practitioner` tree | ⏸ Not yet started |
| **E** | Essay MDX conversions (6 essays) | ⏸ Not yet started |
| **F** | Auth + Dashboard + Toolbox interior styling pass | ⏸ Not yet started |
| **G** | Cleanup — delete old `Header.tsx`, `Footer.tsx`, bespoke section components | ⏸ Not yet started |

---

## What shipped in Waves A + B

### Chrome & layout
- `src/app/layout.tsx` — uses `<SiteNav>` + `<SiteFooter>` from `@/components/system`. Coming-soon chromeless logic preserved.
- Brand metadata pulled from `@content/copy` `BRAND` — single source of truth across `<title>`, OG, Twitter, etc.

### Pages migrated to templates
| Route | Template | File |
|---|---|---|
| `/` | `<MarketingPage>` | `src/app/page.tsx` |
| `/about` | `<MarketingPage>` | `src/app/about/page.tsx` |
| `/research` | `<MarketingPage>` (variant) | `src/app/research/page.tsx` |
| `/research/[slug]` | `<EssayPage>` | `src/app/research/[slug]/page.tsx` |
| `/education` | `<MarketingPage>` | `src/app/education/page.tsx` |
| `/for-institutions` | `<MarketingPage>` | `src/app/for-institutions/page.tsx` |
| `/security` | bespoke (cobalt hero) + `<Section>` | `src/app/security/page.tsx` |

### Content infrastructure live
- `content/citations/index.ts` — sourced statistics registry
- `content/copy/index.ts` — brand copy + principles + CTAs
- `content/curriculum/tools.ts`, `skills.ts`
- `content/regulations/index.ts` — single source for `<TrustStrip>`
- `content/essays/_lib/registry.ts` + `the-ai-use-case-inventory.mdx`
- `content/essays/_lib/registry.ts` `LEGACY_ESSAYS` — 6 metadata stubs for unmigrated essays so `/research` archive lists everything

### Build verification
`npm run build` passes after each commit.

---

## Wave C — Assessment funnel

The conversion engine. Highest priority for next session.

### C1 — `/assessment/start` (intro)
Currently 76 LOC with its own layout. Migrate to a custom composition (not a template) using `<Section>` primitives. The page is a single-column intro card with a single CTA.

**Touch:** `src/app/assessment/start/page.tsx`. Preserve any existing event tracking (Plausible `assessment_start`).

### C2 — `/assessment` (in-flow)
The 12-question diagnostic. Currently 216 LOC with state managed via `useState` + `sessionStorage`. Migrate the *visual* surface to `<DiagnosticPage>` template; preserve the question state machine and persistence logic verbatim (it's the most-tested code in the app).

**Touch:** `src/app/assessment/page.tsx`. Wrap each question render in `<DiagnosticPage>` and `<QuestionFrame>`. Pass the existing `question`, `answers`, `selectedId`, `onSelect`, and `why` payload from `content/assessments/v2/`.

The diagnostic state shape stays:
```ts
interface AssessmentState {
  currentQuestion: number;
  answers: number[];
  phase: 'questions' | 'score' | 'results';
  email: string;
  emailCaptured: boolean;
}
```

### C3 — `/results/[id]` (deliverable)
Currently routes via `src/app/results/[id]/page.tsx` (size unknown — read first). Migrate to `<ResultsPage>` template.

The `ScoreRing`, `DimensionGrid`, dark-band starter artifact, and 3-paths grid are already built. The page just needs to fetch the result, derive `dimensions[]` from the answers array, resolve the starter artifact from `content/assessments/v2/starter-artifacts.ts`, and pass everything as props to `<ResultsPage>`.

### C4 — `/assessment/results/print/[id]` (PDF source)
The PDF print version. Already optimized for print via `globals.css` `@media print` rules. Likely no visual rebuild needed — just verify the new print stylesheet works against the new `<ResultsPage>`.

---

## Wave D — LMS migration (the big one)

`/courses/aibi-p/*` → `/education/practitioner/*`. 14 sub-routes touched.

### Strategy

Two options:

**Option D1 — Symlink-equivalent:** Create new `src/app/education/practitioner/*` files that re-export from the existing `/courses/aibi-p/*` files. URL changes; code doesn't. Risk: divergence over time as edits land in one location.

**Option D2 — Move-and-rewrite:** Move every file from `src/app/courses/aibi-p/` to `src/app/education/practitioner/`, update internal `<Link>` hrefs, swap `Header`/`Footer`/bespoke sections for the new system. Big-bang.

**Recommendation: D2.** The user's instruction was "we don't have any" (audience), so URL changes are free. D1 keeps a code-debt landmine.

### File-by-file plan (D2)

| Old → New | Rebuild? |
|---|---|
| `/courses/aibi-p/page.tsx` → `/education/practitioner/page.tsx` | Rebuild on `<ProgramPage>` |
| `/courses/aibi-p/[module]/page.tsx` → `/education/practitioner/m/[module]/page.tsx` | Rebuild on `<LMSPage>` |
| `/courses/aibi-p/onboarding` → `/education/practitioner/onboarding` | Style pass — preserve flow |
| `/courses/aibi-p/post-assessment` → same | Style pass |
| `/courses/aibi-p/purchase` → same | Style pass — Stripe form |
| `/courses/aibi-p/certificate` → same | Use `<EditorialQuote>` for credential narrative |
| `/courses/aibi-p/gallery` → same | Style pass — artifact gallery |
| `/courses/aibi-p/quick-wins` → same | Style pass — 520 LOC, the largest |
| `/courses/aibi-p/settings` → same | Style pass |
| `/courses/aibi-p/submit` → same | Style pass — submission form |
| `/courses/aibi-p/tool-guides` → same | Style pass |
| `/courses/aibi-p/toolkit` → same | Style pass — 604 LOC, the largest |
| `/courses/aibi-p/prompt-library` → same | Style pass |
| `/courses/aibi-p/artifacts/[artifactId]` → same | Style pass |
| `/certifications/exam/aibi-p` → `/education/practitioner/exam` | Style pass |

### Internal-link cleanup
Every internal `<Link href="/courses/aibi-p...">` and `<Link href="/courses/aibi-s...">` must update. A grep + replace pass:
- `/courses/aibi-p` → `/education/practitioner`
- `/courses/aibi-s` → `/education/specialist`
- `/courses/aibi-l` → `/education/leader`
- `/certifications/exam/aibi-p` → `/education/practitioner/exam`

The `next.config.mjs` redirects already cover this; the goal of the grep pass is to remove indirection.

### Database identifiers stay
`course_enrollments.product = 'aibi-p'` is a DB string, not a URL. URL changes; DB string doesn't.

---

## Wave E — Essay MDX conversions

6 essays at `src/app/resources/<slug>/page.tsx` → MDX in `content/essays/<slug>.mdx`.

### Conversion procedure (per essay)

1. Read the existing `page.tsx`. Extract:
   - Frontmatter from `metadata` and any `const` arrays (e.g., `STAT_CARDS`, `PATTERNS`).
   - Body prose from JSX `<p>` and `<h2>` tags.
2. Create `content/essays/<slug>.mdx` with `export const meta` matching `EssayMeta`.
3. Convert prose to Markdown body. Replace structured arrays with `<KPIRibbon>`, `<EditorialQuote>`, `<Marginalia>` from `@/components/system`.
4. Add `{ slug, importer: () => import("../<slug>.mdx") }` to `ESSAYS` in registry.
5. Remove the corresponding `LEGACY_ESSAYS` entry.
6. Delete `src/app/resources/<slug>/page.tsx`.
7. Build + visual spot check.

### Order (smallest first)
1. `the-widening-ai-gap.mdx` (200 LOC source)
2. `members-will-switch.mdx` (208)
3. `what-your-efficiency-ratio-is-hiding.mdx` (284)
4. `the-skill-not-the-prompt.mdx` (313)
5. `ai-governance-without-the-jargon.mdx` (342)
6. `six-ways-ai-fails-in-banking.mdx` (402)

### When all 6 are migrated
- Delete `src/app/resources/` entirely
- Re-add `{ source: '/resources/:path*', destination: '/research/:path*', permanent: true }` to `next.config.mjs`
- Remove `LEGACY_ESSAYS` array from `registry.ts`
- Build verification

---

## Wave F — Auth + Dashboard + Toolbox

These are post-conversion surfaces (lower visibility per visit, but every active member sees them every day).

### F1 — `/auth/*`
4 surfaces: login, signup, forgot-password, reset-password. Each is an InquiryForm-shaped layout. Standardize on a small `<AuthShell>` composition using `<Section variant="parch" container="narrow" padding="hero">`.

### F2 — `/dashboard`
Member home. 531 LOC. Composes its own grid of progress, recent activity, and CTAs. Style pass to align typography with the design system; functional UI mostly preserved.

### F3 — `/dashboard/progression`
634 LOC — the largest single dashboard surface. Style pass.

### F4 — `/dashboard/toolbox/*`
Toolbox hub + library + cookbook + per-item views. Style pass per file.

### F5 — `/practice/[id]`, `/prompt-cards`
Lower priority but worth a style pass.

### F6 — `/verify/[id]`
421 LOC. Public credential verification — branded face employers see. Worth a focused rebuild on the design system.

---

## Wave G — Cleanup

Once every page consumes `@/components/system`:

1. Delete `src/components/Header.tsx`
2. Delete `src/components/Footer.tsx`
3. Delete `src/components/MobileNav.tsx` if it's no longer imported (else fold into `<SiteNav>`)
4. Delete `src/components/JourneyBanner.tsx` if unused after migration
5. Delete `src/components/sections/HomeContextStrip.tsx` (homepage no longer imports it)
6. Delete `src/components/sections/InteractiveSkillsPreview.tsx` (homepage no longer imports it)
7. Audit `src/components/sections/` for any remaining unreferenced bespoke sections
8. Final `npx tsc --noEmit` + `npm run build` + visual smoke test of every page

### Migration-completion gate

Before merging `design-2.0` to `main`, every item in this checklist must be green:

- [ ] Wave C complete (assessment funnel)
- [ ] Wave D complete (LMS tree)
- [ ] Wave E complete (essays migrated)
- [ ] Wave F complete (auth, dashboard, toolbox)
- [ ] Wave G cleanup applied
- [ ] `npm run build` passes with zero errors and zero warnings
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] Visual smoke test on iPhone Safari for the funnel: `/` → `/assessment/start` → `/assessment` (q1–q12) → `/results/[id]` → `/education/practitioner` → `/auth/signup`
- [ ] Phrase audit: the strings "FFIEC-aware", "Foundations" (as a course name), "BAI-P", "AiBi" do not appear anywhere in `src/`
- [ ] Hex literal audit: `grep -rE '#[0-9a-fA-F]{6}'` returns only matches inside `src/styles/tokens.css`, `tailwind.config.ts`, comments, and SVG attributes that explicitly need them

---

## What "done" looks like

- One `<SiteNav>` and one `<SiteFooter>` for the entire site
- ~10 atomic primitives + 5 composites + 6 templates compose every page
- Every color in components reads from `var(--color-*)` tokens
- Every essay is MDX in `content/essays/`
- Every program detail page is a `<ProgramPage>` instance fed by `content/courses/<slug>/`
- Adding the next AiBI-S Lending track is a content config + 1 route file
- Adding the next essay is one MDX file
- Updating the tagline is one string in `content/copy/index.ts`

That's the system the Institute will build on for the next twelve months.
