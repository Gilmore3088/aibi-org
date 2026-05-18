# Foundation Course — Content Asset Inventory & Usage Map

**Date:** 2026-05-17
**Scope:** AiBI-Foundation (course slug `foundation`, legacy DB key `aibi-p`)
**Purpose:** Authoritative map of every educational asset for the Foundation
course, where each is consumed in the app, and what is missing, stale,
or orphaned.

> The product is one course (per the 2026-05-10 reversal: AiBI Foundations
> is a **single SKU**, not four tracks). Twelve modules. Single shell at
> `/courses/foundation/program`.

---

## 1. The five content domains

| Domain | Folder | What lives there |
|---|---|---|
| **Module bodies** | `content/courses/foundation-program/` | The 12 modules + V4 expanded version + supporting libraries (prompts, examples, role paths, tool guides, activities) |
| **Practice & artifacts** | `content/practice-reps/foundation-program.ts` | Daily practice reps, artifact definitions, certificate requirements |
| **Sandbox data** | `content/sandbox-data/foundation-program/` | Per-module realistic banker scenarios (12 module folders) |
| **Exam** | `content/exams/foundation-program/` | 40-question exam pool + scoring rules |
| **Assessment routing** | `content/assessments/v2/foundation-recommendations.ts` | Maps post-assessment tier → Foundation enrollment CTA |

---

## 2. Module bodies (`content/courses/foundation-program/`)

| File | Lines | Role | Consumed by |
|---|---:|---|---|
| `types.ts` | 89 | Shared types (`Module`, `Section`, `Activity`) | All content files in this folder |
| `modules.ts` | 39 | Aggregates `module-1`…`module-12` into typed array | `course-config.ts`, `[module]/page.tsx` |
| `module-1.ts` … `module-12.ts` | 60–303 | **Legacy** per-module data: metadata + section bodies + activities | Metadata path only (see V4 note) |
| `v4-expanded-modules.ts` | 527 | **Canonical** learner-facing copy: goal, includes, practice, artifact, banking boundary, takeaways, sections | `[module]/page.tsx` via `V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER` |
| `module-activities.ts` | 1006 | Per-module Activity Builder specs (field schemas + markdown artifact templates) | `_components/ActivitySection.tsx`, `/api/courses/submit-activity` |
| `course-config.ts` | 83 | Assembles `foundationProgramCourseConfig` from modules + practice + artifacts | `page.tsx`, dashboard, education page |
| `index.ts` | 21 | Barrel export | Most consumers |

### Source-of-truth split (important to understand)

The legacy `module-1.ts`…`module-12.ts` files now drive **metadata only**:
`number`, `title`, `pillar`, `estimatedMinutes`, `keyOutput`. The
learner-facing body (sections, takeaways, "try this") is rendered from
`v4-expanded-modules.ts`. All 12 modules have V4 entries — the legacy
`sections` arrays in `module-N.ts` are present but not rendered. This is
documented in `modules.ts` (lines 5–15) and scheduled for cleanup. See
also `course-config.ts:6` — the `pillar` field intentionally comes from
the legacy file, not from V4.

### Supporting libraries

| File | Lines | Exports | Used? |
|---|---:|---|---|
| `prompt-library.ts` | 1381 | `ALL_PROMPTS`, `M3_TUTORIALS`, `M7_TUTORIALS`, `filterPrompts`, `getPromptById` | Yes — `prompt-library/page.tsx`, several components |
| `output-examples.ts` | 1724 | `OUTPUT_EXAMPLES`, `filterOutputExamples` | Yes — `gallery/OutputGalleryClient.tsx`, `OutputExample.tsx` |
| `role-paths.ts` | 544 | `ROLE_PATHS`, `getRolePath`, `isDeepDiveModule` | Yes — `RolePathCard.tsx`, `_lib/contentRouting.ts` |
| `tool-guides-notebooklm-perplexity.ts` | 342 | `notebooklmGuide`, `perplexityGuide`, `ALL_TOOL_GUIDES`, `TOOL_GUIDE_MAP` | Yes — `tool-guides/page.tsx`, `ToolGuide.tsx` |
| `tool-guides-copilot-gemini.ts` | 561 | `copilotGuide`, `geminiGuide`, `toolGuides`, `getToolGuideById` | **No consumers in `src/`** |
| `tool-guides.ts` | 635 | `chatGPTGuide`, `claudeGuide`, `toolGuides`, `getToolGuideById` | **No consumers anywhere** |

### Markdown / reference

| File | Role | Consumed? |
|---|---|---|
| `skill-pedagogy-reference.md` | Curriculum design notes for M6–M8 | No — internal reference only |
| `stitch_ai_banking_institute_course/` (8.8 MB, 16 entries) | Source mockup HTML zip + 9 unpacked module folders + PRD `.docx`/`.txt` copies | No — orphan archive |

---

## 3. Practice, artifacts, certificate

`content/practice-reps/foundation-program.ts` exports:

| Export | Coverage | Used by |
|---|---|---|
| `AIBI_P_PRACTICE_REPS` | 12/12 modules (one rep per module) | `practice/[repId]`, `/api/practice-reps/complete`, dashboard, `course-config.ts` |
| `AIBI_P_SIMULATIONS` | Derived from practice reps | `course-config.ts` |
| `AIBI_P_ARTIFACTS` | 12/12 modules (one artifact per module) | `artifacts/[artifactId]`, gallery, dashboard |
| `AIBI_P_CERTIFICATE_REQUIREMENTS` | The credential gate | `certificate/page.tsx`, `course-config.ts` |
| `getDailyPracticeRep(seed)` | Deterministic daily pick | Dashboard daily-practice card |
| `getPracticeRepById(repId)` | Lookup | Practice route |

**Naming debt:** all exports still use the `AIBI_P_` prefix from the
pre-rename era. New writes from Stripe webhooks now emit `'foundation'`
(see `src/lib/products/normalize.ts`), so these symbol names are
internal-only legacy.

---

## 4. Sandbox data — `content/sandbox-data/foundation-program/`

12 module folders, each containing per-module realistic banker scenario
data (emails, transcripts, sample customer cases, etc.). Exposed via
`SANDBOX_CONFIGS` in `index.ts`. Read by `[module]/page.tsx` to surface
"try this" scenarios in the V4 expanded view.

**Coverage:** complete — all 12 modules have a sandbox folder.

---

## 5. Exam — `content/exams/foundation-program/`

| File | Role | Numbers |
|---|---|---|
| `questions.ts` | Exam pool | 40 questions, 5 topics × 8 each: `gen-ai-fundamentals`, `prompting`, `safe-use`, `use-case-identification`, `measurement` |
| `scoring.ts` | Proficiency bands | `proficiencyLevels`, `getProficiencyLevel(pctCorrect)` |

Consumed by `src/app/certifications/exam/foundation/page.tsx` and
`src/app/certifications/exam/_lib/useExam.ts`.

---

## 6. Route → asset matrix (what each Foundation route renders)

| Route | Primary assets read |
|---|---|
| `/courses/foundation/page.tsx` | Marketing landing (no content imports) |
| `/courses/foundation-preview` | Static HTML body — pre-purchase preview (separate from `program/`) |
| `/courses/foundation/program/page.tsx` | `foundationProgramCourseConfig`, role paths, certificate reqs |
| `/courses/foundation/program/[module]/page.tsx` | `modules` (metadata), `V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER` (body), `MODULE_ACTIVITIES`, `SANDBOX_CONFIGS`, `PRACTICE_REPS`, `ARTIFACTS` |
| `/courses/foundation/program/onboarding` | Survey questions + `contentRouting.getPlatformPriority` |
| `/courses/foundation/program/post-assessment` | `foundation-recommendations.ts`, role paths |
| `/courses/foundation/program/prompt-library` | `ALL_PROMPTS`, `filterPrompts` |
| `/courses/foundation/program/gallery` | `OUTPUT_EXAMPLES`, `filterOutputExamples` |
| `/courses/foundation/program/tool-guides` | `notebooklmGuide`, `perplexityGuide`, `ALL_TOOL_GUIDES` (NotebookLM + Perplexity only) |
| `/courses/foundation/program/toolkit` | `MODULE_ACTIVITIES` (downloadable artifacts) |
| `/courses/foundation/program/quick-wins` | Static; no module imports |
| `/courses/foundation/program/artifacts/[artifactId]` | `AIBI_P_ARTIFACTS` |
| `/courses/foundation/program/certificate` | `AIBI_P_CERTIFICATE_REQUIREMENTS` |
| `/courses/foundation/program/purchase` | Marketing → Stripe |
| `/courses/foundation/program/submit` | Final capstone submission |
| `/courses/foundation/program/settings` | Onboarding answers editor |

External consumers of Foundation content:

- `src/app/dashboard/page.tsx` — daily practice rep, course progress
- `src/app/education/page.tsx` — Foundation overview card
- `src/app/certifications/exam/foundation/page.tsx` — gating + exam pool
- `src/app/redesign-checklist/data.ts` — references `foundation-preview`
- `src/lib/toolbox/save-mappers.ts`, `/api/toolbox/save` — artifact save
- `src/lib/ai-harness/feature-handler.ts` — AI feature wiring

---

## 7. Gaps, stale items, and dead weight

### Dead code (safe to delete, no app consumers)

1. **`content/courses/foundation-program/tool-guides.ts`** (635 lines).
   Defines ChatGPT + Claude guides. Not imported anywhere. The only
   reference is a comment in `content/curriculum/tools.ts`.
2. **`content/courses/foundation-program/tool-guides-copilot-gemini.ts`**
   (561 lines). Defines Copilot + Gemini guides. Not imported anywhere.
3. **`content/courses/foundation-program/stitch_ai_banking_institute_course/`**
   (8.8 MB). Source mockup archive (zip + 9 unpacked module HTML
   folders + duplicate PRD `.docx`/`.txt`). Not referenced. If kept,
   move to `Plans/_assets/` per the folder convention.
4. **`content/courses/AiBI-P v1/`** — sibling of `foundation-program/`,
   contains only `aibi-p-prd-complete copy.txt` and the `.docx`
   original. Orphan from the pre-rename era. Move to `Plans/_archive/`
   or delete.

### Stale comments / path references

5. **`content/curriculum/tools.ts:5–7`** — comment block references three
   paths under `content/courses/foundation/program/` that don't exist
   (real path is `foundation-program/`). The two `tool-guides-*.ts`
   files it points to are also unused.
6. **`content/courses/foundation-program/index.ts:2`** — usage comment
   says `'@/content/courses/foundation/program'`; actual import path is
   `'@content/courses/foundation-program'`.

### Naming debt (not broken, but misleading)

7. All practice/artifact exports use `AIBI_P_*` prefix despite the
   course rename. Renaming to `FOUNDATION_*` is mechanical but touches
   ~10 files. Worth bundling with the legacy-module cleanup below.
8. The course config sets `id: 'aibi-p'` deliberately (DB compatibility
   for `course_enrollments.product`) — this is **correct**, but
   `aibiPReusableModules` is the active export name. New code reading
   the config sees both `id: 'aibi-p'` and `'foundation'` depending on
   path; the boundary shim in `src/lib/products/normalize.ts` resolves
   this. Document in onboarding for new contributors.

### Incomplete content

9. **Legacy `module-N.ts` `sections` arrays** are typed and present but
   never rendered (V4 wins). Per the note in `modules.ts:5–15`, they
   are scheduled for removal once the V4 contract absorbs the metadata
   fields. Right now they are ~10% of `content/courses/foundation-program/`
   line count and a footgun: a contributor editing module-3.ts copy
   will see no change in the app.
10. **Tool guides are 2-of-4 covered.** `tool-guides/page.tsx` renders
    only NotebookLM and Perplexity. ChatGPT, Claude, Copilot, and
    Gemini guides exist in the unused `tool-guides.ts` and
    `tool-guides-copilot-gemini.ts` — content is written but never
    surfaced. Two options:
    a. **Wire them in** — extend the page to render all 6, replace the
       split tool-guides files with one barrel.
    b. **Decide they're not needed** — delete the unused files (item
       #1, #2 above).
11. **Certificate page → coming-soon for Specialist.** `certificate/page.tsx:280`
    links to `/coming-soon?interest=specialist` — i.e. the
    post-Foundation CTA to AiBI-S is not yet a real page. Tracked
    against the AiBI-S build per Specialist PRD.

### Cross-system mess (out of scope for this doc but worth flagging)

12. Foundation uses `src/types/lms.ts` + `src/components/lms`; AiBI-S
    uses `src/lib/course-harness/types.ts` + `course-harness/`
    components; AiBI-L uses neither. Two parallel `CourseConfig`
    interfaces. See conversation 2026-05-17 for the alignment options.

---

## 8. Recommended cleanup order (smallest blast radius first)

1. Delete `tool-guides.ts` and `tool-guides-copilot-gemini.ts` **or**
   wire them into `tool-guides/page.tsx`. Decision needed — content is
   real, not stub.
2. Move `stitch_ai_banking_institute_course/` and `AiBI-P v1/` out of
   `content/courses/` (to `Plans/_assets/` and `Plans/_archive/`
   respectively). 8.8 MB of source mockups in the active content tree
   is noise.
3. Fix stale path comments in `content/curriculum/tools.ts` and
   `content/courses/foundation-program/index.ts`.
4. Once V4 is confirmed as the only render path, strip the unused
   `sections` arrays from `module-1.ts`…`module-12.ts`. Keep metadata
   exports (`number`, `title`, `pillar`, `estimatedMinutes`,
   `keyOutput`).
5. Rename `AIBI_P_*` exports → `FOUNDATION_*` in
   `content/practice-reps/foundation-program.ts` and its consumers.
   Keep `id: 'aibi-p'` in the config for DB compatibility.

Each is independently committable. None touches the live render path
for paying learners.
