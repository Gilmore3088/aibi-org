# Interactive Course Takeaways — Build Spec

A developer handoff for turning Foundation Course module takeaways from
**documents you read** into **tools you build and keep**. This is the
through-line: every lesson ends with the learner building a small, real
artifact that lands in **My Toolbox**, where it's reused, edited, and
versioned long after the module ends.

> Pattern, repeated everywhere: **see the bad way → build the real tool →
> save it to the toolbox.** The toolbox is the spine that makes the course
> feel like it pays off.

---

## Where to plug in (existing code the dev should reuse)

| Concern | File / module |
|---|---|
| 12-module curriculum (goal, practice, artifact, takeaways) | `content/courses/foundation-program/v4-expanded-modules.ts` |
| Module 3 source (CORE framework, fee-waiver scenario) | `content/courses/foundation-program/module-3.ts` |
| Module 9 source (5-move card, Red/Yellow/Green, Safety Lab) | `content/courses/foundation-program/module-9.ts` |
| Canonical lesson tabs (01 Learn it / 02 Try it / 03 Use it) | `src/app/courses/foundation/program/_components/ModuleTabs.tsx` |
| Course chrome (sidebar, top bar, learner) | `src/components/lms/` — `CourseShell`, `LMSTopBar`, `LMSModule` |
| Toolbox tool data shape (type, version, history, runs) | `src/lib/my-toolbox/tools.ts` (`ToolData`, `ToolType` = p/s/a/pb) |
| Toolbox save/run API | `src/app/api/toolbox/{save,run}/route.ts` |
| Pillars (awareness/understanding/creation/application) | `src/components/lms/types.ts` (`LMS_PILLARS`) |

**Lesson scaffold (use for every module):** render inside `CourseShell`
(modules, completed[], current, learner) → `LMSTopBar` crumbs → a header
band → `ModuleTabs` with three slots: `learnContent` (the why, short),
`practiceContent` (the interactive build), `applyContent` (the saved
artifact / toolbox handoff).

**Live reference implementations** (preview only, noindex, in PR #501,
under `/design-system/`):
- `/design-system/module3-lesson` — CORE Prompt Wizard
- `/design-system/module9-lesson` — Safety Lab (the weaker "quiz" version)
- `/design-system/safety-check` — Prompt Safety Check (the **tool** reframe)
- `/design-system/hero-options` — homepage hero explorations

---

## Toolbox = the spine (build this first)

Each tool is a `ToolData` record (`src/lib/my-toolbox/tools.ts`): `type`
(p=prompt, s=skill, a=app/agent, pb=playbook), `name`, `cat`, `ver`,
`edited`, `runs`, version `history[]`, and provenance (which module it
came from). Every interactive below ends by writing one of these.

Toolbox must support: **save**, **open/run**, **edit → new version
(v1.0 → v1.1)**, and **share with team**. The "from Module N" provenance
tag is what ties the course to the toolbox.

---

## 1. Module 3 — CORE Prompt Wizard  ·  STATUS: prototyped (live)

- **Pillar:** Understanding. **Takeaway today:** "prompt strategy cheat
  sheet" (a document). **Reframe:** a saved, reusable prompt.
- **Learn it:** the four CORE marks — **C**ontext/role, **O**bjective,
  **R**esources, **E**xpectations (from `module-3.ts`).
- **Try it (the build):** the fee-waiver scenario ("can this $12 fee be
  waived?"). Learner toggles each CORE element on; the prompt assembles
  live and a **CORE score (n/4)** climbs. Critically, the **simulated AI
  answer changes** with the prompt:
  - missing **Resources** → invents a fake policy (hallucination, red)
  - missing **Expectations** → correct but buried/rambling (amber)
  - all four → grounded, scoped, usable (green)
- **Use it:** save as **Fee-Waiver Prompt** (type `p`, "from Module 03").
- **Build note:** the answer-state logic is a pure function of which CORE
  elements are present; see the live ref for the exact mapping.

## 2. Module 9 — Prompt Safety Check  ·  STATUS: prototyped as a TOOL (live)

- **Pillar:** Creation. **Takeaway today:** "safe AI use checklist" (a
  document — the weak version). **Reframe:** a *tool* run before every
  prompt, not a quiz passed once.
- **The tool:** paste any prompt; client-side scan flags:
  - **PII** — SSN `\d{3}-\d{2}-\d{4}`, account/card numbers, email
  - **Red-zone decisions** — verbs: waive/approve/deny/decline/refund/
    reverse/grant/close account/increase limit
  - **No-review sends** — "email/send … to the member/customer/directly"
  - Verdict **Red / Yellow / Green** + a generated **safe rewrite**
    (PII → placeholders; decisions → "pending approval"; appends a
    human-review clause).
- **Use it:** save as **Prompt Safety Check** (type `s`/`a`); runs in
  browser, nothing leaves the page.
- **Build note:** see `/design-system/safety-check` for the regex set,
  scoring, and rewrite transform — copy it directly.
- **Also weave in:** the data-boundary idea should appear as a guardrail
  inside *other* tool builds (e.g., Module 3's prompt), not only here.

## 3. Module 10 — Role Tools  ·  STATUS: prototyped (screenshots only)

The role fork. Keep modules 1–9 role-agnostic; here the **build** is
role-chosen. Same lesson shell, four role variants (drive from the
learner's role). Each shows the bad way (a real bad ChatGPT prompt +
what's wrong) then the tool they build:

- **Loan officer → Auto-loan / rate calculator.** Live inputs (amount,
  APR, term) → monthly payment + total interest. **Math must follow
  Reg Z / FFIEC APR**, not an LLM guess — that's the whole point: the
  tool owns the regulated math, AI only writes the words. Save as App.
- **Frontline/Retail → Complaint Response Builder.** Pick complaint type
  (fee dispute / "didn't understand interest" / service). Generates an
  on-policy response (applies the real fee-waiver decision tree; no
  off-policy promises). Save each type → toolbox grows one-click buttons.
- **Executive → Monthly Board Brief (recurring skill).** Schedules an
  agent: 1st of month, gather peer rate moves + regulator updates +
  fintech entrants → a sourced one-page brief. (Overlaps Module 8.)
- **Compliance → Guidance Digest.** Drop in a bulletin (use the existing
  sample library); get a plain-language read + "what it means for you"
  checklist, every point linked to the source paragraph.
- **Use it:** each saves to toolbox tagged "from Module 10 · <role>".

## 4. Module 11 — Build → Save → Version  ·  STATUS: prototyped (screenshots only)

- **Pillar:** Application. **Takeaway today:** "personal prompt library."
  **Reframe:** the toolbox itself, plus the **versioning** lesson taught
  by *extending a tool you already built*.
- **The loop:** open the loan calculator from your toolbox → add a feature
  → save a new version. Each added feature is a version:
  - base = **v1.0** (built in Module 10)
  - + amortization/payment schedule = **v1.1**
  - + adjustable rate = **v1.2**
  - + early-payoff scenario = **v1.3**
- **Use it:** uses the `ToolData.history[]` versioning already in the data
  model; surface the version history and an "Edit & save v1.x" action.
- **Build note:** this is the Module 10 tool reopened from the toolbox in
  edit mode — reuse the same component, add a "save new version" path.

## 5. Module 8 — Agent Workflow Builder  ·  STATUS: not built

- **Pillar:** Creation. **Takeaway today:** "workflow map" (document).
  **Reframe:** drag-and-build a small workflow with human checkpoints.
- **Try it:** a canvas/list where the learner sequences steps (e.g.,
  gather → draft → **human checkpoint** → send) and must drop at least one
  human checkpoint before any customer-impacting or money step. Invalid
  configs (no checkpoint before a red-zone action) are flagged — reuse the
  red-zone classification from Module 9.
- **Use it:** save as an Agent (type `a`) with its schedule + checkpoints;
  this is where the Module 10 executive "recurring brief" actually gets
  scheduled.
- **Build note:** keep it a simple ordered list with insertable
  checkpoint nodes; no heavy graph library needed.

## 6. Module 7 — Tool-Choice Sorter  ·  STATUS: not built

- **Pillar:** Creation. **Takeaway today:** "tool choice map" (document).
  **Reframe:** a quick-fire matcher.
- **Try it:** a banking task appears (e.g., "summarize a 40-page policy",
  "draft a member email", "compare two rate sheets"); learner picks the
  right tool *category* (general chat / workplace copilot / search-answer
  / notebook) and the safe data zone, with instant one-line feedback and a
  reason. ~8 tasks, untimed. (Module 7 already lists these categories;
  `module-7` sections + the "AiBI-Foundation Tool Choice Map".)
- **Use it:** save the learner's personal **Tool Choice Map** to the
  toolbox (type `pb`), pre-filled from their answers.
- **Build note:** smallest of the set — a data array of tasks + correct
  category + reason; render as a sorter with feedback.

---

## Suggested build order (impact ÷ effort)

1. **Toolbox save/version plumbing** — everything else depends on it.
2. **Module 3 Prompt Wizard** (live ref exists) — foundational skill.
3. **Module 9 Safety Check tool** (live ref exists) — brand-defining.
4. **Module 10 loan calculator** — the "this is real" moment; needs the
   Reg Z/FFIEC math done correctly.
5. **Module 11 versioning** — reopen + extend #4.
6. **Module 7 sorter**, then **Module 8 workflow builder** — lighter.

## Cross-cutting requirements

- Every interactive must have an SSR/no-JS/`prefers-reduced-motion`
  fallback that shows the meaningful end state.
- Mobile: dense two-column layouts must collapse to one column and pass
  the mobile-viewport-overflow check (`e2e/mobile-viewport-audit.spec.ts`).
- Use the canonical `ModuleTabs` so lessons match live module chrome.
- Synthetic data only in every example; never real customer data.
