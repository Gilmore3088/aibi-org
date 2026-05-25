# Foundation Course + Assessment Suite — Comprehensive Audit
**Reviewed:** 2026-05-24 · branch `feature/addie-v1`
**Anchored on:** post-Round-1 (12 of 19 fixes) + Pair 1 (P1.3/P1.4) shipped state

## 1. What was reviewed

- **Foundation Course:** 24 lessons + gate (M0–M5; free M0–M3, paid M4–M5)
- **Free Readiness Assessment:** /assessment (12-Q out of 48-pool, 8 dimensions, email-gated full report)
- **In-Depth Assessment ($99):** /assessment/in-depth (48-Q full, 8 dimensions, 4 deliverables)
- **End-to-end funnel:** cold visitor → free assessment → email → course/In-Depth/decline
- **10 interactive exercises:** OffLimitsSorter, ToolLandscapeMatrix, M2.3 sandbox, WhereAIFitsWorksheet, M3.2 A/B sandbox, SpotTheViolation drill, M3.5 sandbox, SkillBuilder, SkillTester, ProblemFrame, PRDBuilder, PrototypeLauncher

## 2. Reviewer fleet

| Group | Lens | Output file |
|---|---|---|
| **Round 1 (prior session)** — 5 banker personas | CRO · Branch Mgr · Sr Ops Analyst · IT Director · CEO | `foundation-critique-*-2026-05-24.md` (5) + `foundation-critique-synthesis-2026-05-24.html` |
| **Round 1 Pair** — UX×ID | Cognitive load + Instructional Design | `foundation-pair1-cogload-id-2026-05-24.md` |
| **Round 2 Pair 2** — Design×Curriculum | Product design + Curriculum architecture (Gagné, backward design) | `foundation-pair2-design-curriculum-2026-05-24.md` *(landing)* |
| **Round 2 Pair 3** — A11y×Assessment | WCAG 2.1 AA + Messick validity + Bloom alignment | `foundation-pair3-a11y-assessment-2026-05-24.md` *(landing)* |
| **Free Assessment** — 3-persona | VP Ops mobile / GC iPad / new-MSR laptop | `free-assessment-3-persona-2026-05-24.md` *(landing)* |
| **In-Depth Assessment** — 3-persona | CRO / IT Director / Sr Ops Analyst, post-purchase | `in-depth-assessment-3-persona-2026-05-24.md` *(landing)* |
| **End-to-end** — 4 flows | Cold acquisition / Mobile-interruption / Paid purchase / Gate-decline → return | `e2e-4-flow-audit-vera-kowalczyk-2026-05-24.md` *(landing)* |

**Total user perspectives represented:** 5 (R1 personas) + 2 (R1 pair) + 2 (R2 Pair 2) + 2 (R2 Pair 3) + 3 (Free Assessment) + 3 (In-Depth) + 4 (E2E flows) = **21 distinct vantage points** across 8 review documents.

## 3. What's already fixed (do not re-flag)

See `foundation-fix-log-2026-05-24.md` for full detail. Headline:

| Finding | Fix shipped |
|---|---|
| F1 + F18 sandbox + PII scanner | `/api/sandbox/chat` excludes `foundation`; client systemPrompt length-capped + override-pattern-filtered; pii-scanner gains spaced/dotted SSN + Luhn-checked PAN; M2.3 + M4.2 copy accurate about what regex catches |
| F2 institutional approval gates | `[warn]` beats in M0.2 / M2.3 / M3.1 |
| F3 SR 11-7 / TPRM / AIEOG thread | New `[case:good]` in M4.1 + M5.1 with the three named frameworks |
| F5 M5.4 tool blast-radius matrix | Inline 4×5 table + IT-handoff `[warn]` |
| F7 honest timing | M0.1 stat "8–30m" + KC rewritten; durations bumped (M3.5=25, M5.3=30) via migration `00061` |
| F10 verification protocol | M3.4 three-rule beat (load-bearing vs decorative) |
| F11 Workbench Pack ghost | Stripped from M5.1 + M5.5 |
| F13 institutional brief | M5.5 AI Governance One-Pager artifact (6 fields) |
| F19 worst-case by department | M3.5 `[case:bad]` before the gate |
| P1.3 gate foreshadowing | `[tip]` countdown at M3.1/M3.3/M3.4 |
| P1.4 lesson timing honesty | M3.5 → 25min, M5.3 → 30min, constraint relaxed |

## 4. The 10 interactive exercises — inventory

Hands-on inventory of the interactive surfaces. Visual screenshots saved under `tmp/exercise-screenshots/`. Pair 2 (Design×Curriculum) and Pair 3 (A11y×Assessment) will provide the deep verdict; below is the source-level inventory.

| # | Lesson | Exercise | Component | LOC | Modality | Free/Paid | First-screen impression |
|---|---|---|---|---:|---|---|---|
| 1 | m0.2 | OffLimitsSorter (5 tracks × 22 items) | `interactives/m0/OffLimitsSorter.tsx` | 260 | interactive | free | Opens with SacredRule full-screen modal — strongest visual beat in the course |
| 2 | m1.2 | ToolLandscapeMatrix | `interactives/m1/ToolLandscapeMatrix.tsx` | 538 | interactive | free | Largest interactive by LOC — extensive keyboard handling |
| 3 | m2.3 | First-conversation sandbox | `lesson/SandboxLessonView.tsx` | — | sandbox | free | Real Claude call via `/api/sandbox/run`, server-assembled prompt |
| 4 | m2.4 | WhereAIFitsWorksheet | `interactives/m2/WhereAIFitsWorksheet.tsx` | 220 | worksheet | free | 7-field per-track worksheet; saves to Toolbox |
| 5 | m3.2 | A/B sandbox (audience + length levers) | `lesson/SandboxABLessonView.tsx` | — | sandbox | free | Calls `/api/sandbox/ab` — Pair 1 flagged this as cognitive-load **CRITICAL** |
| 6 | m3.4 | SpotTheViolation drill (12 scenarios) | `interactives/m3/SpotTheViolation.tsx` | 283 | interactive | free | Native `<button>` keyboard-OK; needs assessment-validity audit |
| 7 | m3.5 | Real-use-cases sandbox + Pack save | `lesson/SandboxLessonView.tsx` (branched) | — | sandbox | free | Conversion finale — now honestly timed 25 min |
| 8 | m4.2 | SkillBuilder (template) | `interactives/m4/SkillBuilder.tsx` | 486 | skill | paid | Behind paywall for non-enrolled |
| 9 | m4.4 | SkillTester (source-aware) | `interactives/m4/SkillTester.tsx` | 407 | skill | paid | Behind paywall for non-enrolled |
| 10 | m5.2 | ProblemFrame worksheet | `interactives/m5/ProblemFrame.tsx` | 189 | worksheet | paid | 5-field problem statement |
| 11 | m5.3 | PRDBuilder | `interactives/m5/PRDBuilder.tsx` | 191 | interactive | paid | Now honestly timed 30 min |
| 12 | m5.4 | PrototypeLauncher + blast-radius matrix | `interactives/m5/PrototypeLauncher.tsx` | 289 | interactive | paid | Newly shipped blast-radius matrix (F5) renders inline |

**A11y signal scan (grep-only, not authoritative — Pair 3 has the real audit):**

| Component | `aria-*` | `role` | `onKey*` | `focus*` | Verdict (preliminary) |
|---|---:|---:|---:|---:|---|
| OffLimitsSorter | 2 | 2 | 1 | 5 | Looks structured |
| ToolLandscapeMatrix | 2 | 0 | 12 | 4 | Heavy keyboard handling |
| WhereAIFitsWorksheet | 2 | 1 | 0 | 2 | Native form (forms are OK without onKey) |
| SpotTheViolation | 4 | 2 | 0 | 1 | Native buttons; needs focus-ring audit |
| SkillBuilder | 2 | 3 | 0 | 2 | Multi-step form; needs Pair 3 review |
| SkillTester | 3 | 3 | 0 | 1 | Streaming output — needs `aria-live` audit |
| PRDBuilder | 1 | 0 | 0 | 2 | Thin — needs explicit landmarks |
| ProblemFrame | 1 | 0 | 0 | 2 | Thin — needs explicit landmarks |
| PrototypeLauncher | 1 | 0 | 0 | 4 | Thin — new blast-radius matrix is a `<table>`, audit needed |

## 5. Findings synthesis

*This section is a scaffold. Pair 2, Pair 3, the two assessment audits, and the E2E flow audit are running in parallel; their findings will be merged into the comprehensive HTML once they land. See `foundation-comprehensive-audit-2026-05-24.html` for the rendered version with all sections filled.*

### Course content & curriculum (Pair 2 — Design × Curriculum)
*Awaiting agent output.*

### Course a11y & assessment design (Pair 3 — A11y × Assessment)
*Awaiting agent output.*

### Free Readiness Assessment (3 personas)
*Awaiting agent output.*

### In-Depth Assessment $99 (3 personas)
*Awaiting agent output.*

### End-to-end funnel (4 flows × 4 personas)
*Awaiting agent output.*

## 6. Robust visually-friendly interactive exercises — provisional verdicts

Pre-agent provisional verdicts based on source-level inventory + screenshots:

| Exercise | Provisional verdict | Rationale |
|---|---|---|
| m0.2 OffLimitsSorter | **Keep + polish** | The SacredRule moment is the strongest single beat in the course; sorter has 22 role-scoped items; structurally good |
| m1.2 ToolLandscapeMatrix | **Audit for over-engineering** | 538 LOC — by far the largest. May be doing too much for one lesson |
| m2.3 sandbox | **Keep** | Server-assembled prompt path (post-F1 fix); the "first contact" moment |
| m2.4 WhereAIFitsWorksheet | **Keep** | 7 fields per track; seeds M3.5 prompt pack — pedagogically necessary |
| m3.2 A/B sandbox | **REBUILD** | Pair 1 flagged as the course's worst cognitive-load offender (P1.1 CRITICAL) — six new constructs on one screen |
| m3.4 SpotTheViolation | **Keep + polish** | 12 scenarios, Bloom-Apply, native a11y — Pair 3 will rule on distractor quality |
| m3.5 sandbox | **Keep** | Conversion finale; now honestly timed; new worst-case-by-dept beat lands before the gate |
| m4.2 SkillBuilder | **Audit** | 486 LOC; Pair 3 will rule on multi-step form a11y |
| m4.4 SkillTester | **Audit** | Streaming output needs `aria-live` audit |
| m5.2 ProblemFrame | **Polish** | Thin a11y signals; 5-field worksheet — should be straightforward |
| m5.3 PRDBuilder | **Polish** | Thin a11y signals; longest paid build-lesson at 30 min |
| m5.4 PrototypeLauncher | **Polish** | New blast-radius matrix (F5) needs Pair 3 table-a11y audit |

## 7. What's next (after agent outputs land)

1. Synthesize all 5 agent outputs into `foundation-comprehensive-audit-2026-05-24.html`
2. Rank cross-cutting findings (severity × number of agents flagging × user-blocking)
3. Triage into: **fix-now** / **fix-this-week** / **track-for-next-session**
4. The "robust visually-friendly interactive exercises" goal — write a separate `interactives-improvement-plan-2026-05-24.md` with per-exercise polish/rebuild specs based on Pair 2 + Pair 3 verdicts

---

*This document grows as agent findings arrive. Last touch: pre-Wave-A landing.*
