# One prompt framework across the site: plan

Status: all seven steps done, 2026-10-03. Waiting on James: exam question review, merge, and the post-merge upload below.

**Decisions (James, 2026-10-03):** CORE is the one framework. The Banker Prompt Formula card is retitled (same URL). James reviews the 8 rewritten exam questions before merge. Per CLAUDE.md, course and downloadable changes ship as a PR that James merges.

## The problem

The course teaches one way to structure a prompt. The rest of the site teaches five others. A learner can finish the course, then take an exam built on a framework the course never named. Visitors can download free cards that teach a third structure, and the course's own end-of-course report describes a fourth.

| # | Framework | Parts | Where a visitor or learner meets it |
|---|---|---|---|
| 1 | **CORE** | Context, Objective, Resources, Expectations | Course modules 3 and 4 (lesson, Try, CORE prompt wizard and scorecard, CORE prompt card), the CORE card PDF, the test-out quiz, the In-Depth executive summary |
| 2 | RTFC, 4 parts | Role, Task, Format, Constraints | Certification exam (8 questions, topic "Prompting & the RTFC Framework"), the exam screen's topic label, the research brief *The skill, not the prompt*, lab sample files for modules 6, 8 and 9, the prompt library (5 tags, 1 tutorial), the quick-wins form placeholder, the free-resource manifest |
| 3 | RTFC, 5 parts | Role, Task, Format, Constraints, Context | The Transformation Report PDF every course graduate downloads |
| 4 | Banker Prompt Formula | Role, Task, Source, Format, Constraints, Review | Free PDF, one of the four covers on the home page |
| 5 | Checklist list | role, task, context, format, constraints | Safe AI Use Checklist (free PDF) |
| 6 | "5-line prompt method" | role, source, output format, don't-invent rules, verify, reviewer | Prompt Like a Banker guide (free PDF) and builder |

RTFC isn't even consistent with itself (4 parts in the exam, 5 in the report).

The guard test (step 1) found more part lists that the first inventory missed. These are added to steps 3 and 6:
- Course: module 10's visual model ("Role, Task, Source, Reviewer"), module 3's own activity text, the strategy drill's "name the role, task, and format", and the practice rep "role, task, format, and constraints".
- Prompt cards page and its card data ("role, task, constraints, and output format").
- In-Depth starter artifacts ("role, task, constraints, audience").
- `content/curriculum/skills.ts` (not imported anywhere, but aligned anyway).
- The home page's free-tools section, which shows the "Banker Prompt Formula" title (moves with the card in step 5).

The 5-move discipline on the CORE card is not a competing framework: moves 1–3 (State, Ground, Constrain) build a CORE prompt, and moves 4–5 (Check, Escalate) handle the answer. That mapping is recorded in `content/frameworks/core.ts`.

## Recommendation: CORE everywhere

CORE is what the paid product teaches and tests. It has the interactive wizard, the scorecard, a downloadable card, a test-out check, and two modules built on it. Every other framework's parts already fit inside it, so nothing of value is lost:

| CORE part | Absorbs |
|---|---|
| **Context**: who you are, who it's for, the situation | Role, audience, context |
| **Objective**: the one job to do | Task |
| **Resources**: the only material the AI may use, with placeholders for sensitive data | Source, "use only [SOURCE]", placeholders |
| **Expectations**: format, limits, what not to do, how it gets checked | Format, Constraints, Review, "mark [VERIFY]", "draft for [REVIEWER]" |

The safety habits the free cards teach (use only the given source, placeholders, mark [VERIFY], human reviewer) stay. They become the explicit content of Resources and Expectations instead of separate letters.

The alternative is to move the course to RTFC or the Banker Formula. That would mean rebuilding the module 3 wizard, its scorecard, the module 3–4 lessons, the test-out quiz and the CORE card. That's more work, and it puts the paid course's tested material in doubt. Not recommended.

## The work, in order

Each step ends with its own check before the next starts.

### 1. Lock the definition (half a day)
- One shared source of truth: `content/frameworks/core.ts` with the four parts, a one-line definition each, and the absorption table above.
- A guard test that fails the build if "RTFC", "Banker Prompt Formula" or a different part list appears in any page, content file or download source. Allowed exceptions are listed explicitly; for example, a sentence that says "you may have seen RTFC elsewhere".
- **Check:** the test runs and lists every current violation, which should match the inventory above.

### 2. Certification exam (1 day + subject-matter review)
- Rename the topic to "Prompting with CORE" in `content/exams/foundation-program/questions.ts` and on the exam screen (`ExamRunner.tsx`).
- Rewrite the 8 prompting questions so stems, options and explanations use CORE parts. The tested skills (specific objective, use only the provided source, set the format, add limits, reusable templates for repeated work) stay the same; only the vocabulary changes.
- Keep the answer-length guard: the correct answer must not be the longest option more than 40% of the time.
- **Check:** exam tests pass, the length guard passes, a persona takes the exam end to end, and a subject-matter reviewer signs off on the 8 questions.

### 3. Course materials outside modules 3–4 (half a day)
- **Found during step 3:** none of the four RTFC-labeled sample files (`module-6/weak-prompts.md`, `module-8/sample-skill-to-test.md`, `module-9/strong-example.md`, `module-9/portfolio-template.md`) is loaded by any lab or linked anywhere; learners never see them. The one place a learner meets older labels is the module 6 lab coach's instructions ("Role / Source / Task / Output format"), used by course module 8. Every lab request now also tells the coach to label prompts in CORE and map older labels (`CORE_COACH_RULE`), and the lab shows the mapping note whenever its loaded material uses older labels. Verified on module 8 (note shown) and module 1 (no note).
- **Lab sample files for modules 6, 8 and 9 are not edited.** CLAUDE.md forbids changes to `content/sandbox-data/`: they are time-fixed teaching samples, and module 3's contains planted false citations. Their copies in `public/sandbox-data/` are left alone too. Instead, each of those three module pages gets a one-line note above the lab: "The sample file labels this an RTFC prompt, an older name. Read Role as Context, Task as Objective, and Format and Constraints as Expectations." The guard test lists these files as known exceptions. If James later wants the samples relabeled, that is a separate, explicit change to the time-fixed set.
- Prompt library: tags `RTFC` become `CORE`; the lending-skill tutorial walks through C, O, R, E.
- Quick-wins placeholder: "RTFC Framework" becomes "CORE prompt card".
- `skill-pedagogy-reference.md` (internal): note that skill anatomy extends CORE.
- **Check:** guard test is clean for `content/` and `src/app/courses/`, course tests pass, and the course persona wave shows no regressions.

### 4. Transformation Report PDF (2 hours)
- `src/lib/pdf/transformation-report.ts`: "five-component RTFC framework (Role, Task, Format, Constraints, Context)" becomes "the CORE framework (Context, Objective, Resources, Expectations)".
- **Check:** generate a sample report and read the page.

### 5. Free downloads (1 day)
- **Banker Prompt Formula card**: restructure under the four CORE headings, keeping each safety line (Source → Resources; Format, Constraints and Review → Expectations). Retitle it to something like "The CORE Prompt Card for Bankers". The download URL and slug stay the same, so existing links and emails keep working.
- **Prompt Like a Banker guide**: label its five lines with the CORE part each one serves.
- **Safe AI Use Checklist**: "Name the role, task, context, format, and constraints" becomes "Use CORE: context, objective, resources, expectations".
- Rebuild PDFs and covers with the repo's scripts (`scripts/generate-source-html-pdfs.mjs`, `render-pdf-covers.sh`, `generate-kit-zips.mjs`), never by hand.
- Manifest: "RTFC skill framework" citation becomes "CORE prompt framework".
- **Check:** `scripts/qa-downloads.mjs` passes, each changed PDF is opened and read, home-page covers show the new title, and the download persona wave runs clean.

### 6. Public pages (2 hours)
- *The skill, not the prompt* brief: "simplified in practice to the RTFC Framework (Role, Task, Format, Constraints)" becomes CORE, and the closing course description is updated.
- Search the briefings, prompt cards, home prompt checker and playbooks for any remaining part lists.
- **Check:** guard test passes for the whole repo.

**Found during step 6:**
- The guard missed prompt templates written as section tags (`[ROLE] … [TASK]`), as labeled fields (`{ label: 'Role' }`), as bulleted parts ("- Role (…)") and inline ("Role: [YOUR ROLE]. Task: [TASK]"). It now checks all four shapes. They turned up in the module 3 and 11 gallery samples, My Toolbox's sample prompt and skill page, the AI Task Framer prompt card, a practice rep, and the In-Depth "prompting skill" action and starter kit. All are now CORE.
- *The skill, not the prompt* still showed a five-row Role/Context/Task/Format/Constraints table. It now shows the four CORE parts, and its course description matches what Module 13 does.
- Three paid or free PDFs had no generator in the repo: the Skill Template Library, the starter artifacts (both deleted in a June cleanup) and the prompt cards (never committed). All three generators are restored or written under `scripts/` (`npm run generate:skill-library`, `generate:starter-artifacts`, `generate:prompt-cards`), and each was checked against the committed PDF before any change. The Skill Template Library is now in CORE and points to Module 13, which does what the old "Module 7" text described.
- Rebuilding from current sources also replaced four starter artifacts and two large-print PDFs that still cited SR 11-7 as current. Their sources were corrected earlier, but the PDFs were never rebuilt.

### 7. Final audit
- Guard test clean, full test suite, type check, lint, production build.
- Three persona waves, plus a targeted run that walks module 3 → module 9 lab → exam → Transformation Report → free Banker card and confirms the same four words every time.
- Update the persona report and this plan's status.

**Result (2026-10-03):**
- Guard test clean with an empty pending list. 863/863 unit tests, type check, lint (0 errors), claims check and production build all pass.
- Walk-through on a local server: modules 3, 4, 8, 9, 10 and 13, both galleries, the exam, the prompt library, prompt cards, *The skill, not the prompt*, Prompting Foundation, home and resources. No older framework appears in visible text on any of them. Modules 3 and 4, the prompt cards, both resource pages and module 10 show all four CORE parts. My Toolbox shows its sign-in gate without Supabase, so its sample prompt was checked in source.
- All 87 PDFs (including those inside the kit ZIPs) scanned: no RTFC, RCFC, Banker Prompt Formula, role/task part list, "Module 7: Build" or SR 11-7 cited as current.
- Persona waves:

| Wave | Reached value | Before this work | Rage-quits | Dead ends |
|---|---|---|---|---|
| Core (40 course learners) | 83/100 | 80/100 | 0 | 2, both during a dev-server memory restart |
| Features (run twice) | 85/100, 85/100 | 86/100 | 0 | 9, then 5, on different personas each run. Traced ones were slow first compiles plus 503s from missing Supabase keys. None on a page or download this work changed |
| Coverage | 99/100 | 100/100 | 0 | 1: `/dashboard` still on its loading skeleton at the check. It loads fully in under 5 seconds when re-checked |

All 40 learners reached their planned module depth; 332 of 333 artifacts saved (the one miss was during the server restart).

## After merge (James)

Production serves downloads from Supabase storage, so the regenerated files reach visitors only after they are uploaded. From a machine with `.env.local` holding the service key:

```
node scripts/seed-resources-bucket.mjs
```

It uploads every PDF and ZIP at the top level of `public/downloads` and overwrites the stored copies; it is safe to re-run. The changed files it carries are `banker-prompt-formula-card.pdf` (now "The CORE Prompt Card for Bankers"), `prompting-foundation-guide.pdf`, `safe-ai-use-checklist.pdf`, `prompt-strategy-cheat-sheet.pdf`, `operations-playbook.pdf`, `aibi-prompt-cards.pdf`, `aibi-skill-template-library.pdf`, and the `prompting-foundation-kit`, `frontline-enablement-kit`, `governance-starter-kit` and `banker-builder-brief-kit` ZIPs.

These are read straight from the deployed files and go live on deploy with no upload: the large-print PDFs (`public/downloads/large-print/`), the post-assessment starter artifacts (`public/downloads/starter-artifacts/`), the prompt cards download and the Skill Template Library.

PDFs and kits were rebuilt with the repo's scripts. On a machine without network access use `PW_LOCAL_FONTS=1` (and `PW_EXECUTABLE_PATH` if the installed Chromium differs from the Playwright pin), so the brand fonts come from `src/app/fonts` instead of Google Fonts.

## Decisions

1. **Canonical framework**: CORE. *(decided)*
2. **Banker Prompt Formula card**: retitled, for example "The CORE Prompt Card for Bankers"; URL and slug unchanged. *(decided)*
3. **Exam reviewer**: James reviews the 8 questions before merge. *(decided)*
4. **Lab sample files (modules 6, 8, 9)**: left as-is per CLAUDE.md, with an on-page note mapping RTFC to CORE. Open only if James wants an exception.

## What won't change

- Module 3 and 4 content, the CORE wizard and its scoring, the CORE card, the test-out quiz: already correct.
- Download URLs, slugs and file names: existing links keep working.
- The safety rules taught in the free cards: they move under Resources and Expectations, not out.
