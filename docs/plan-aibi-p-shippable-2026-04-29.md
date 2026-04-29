# Plan: Make AiBI-P actually shippable as a course

**Goal:** Close every audit finding that prevents AiBI-P from being a real, paid, banker-credible course. Eight phases, sequenced by dependency. Output: a single PR (or merged set) that lets you say "AiBI-P is ready" without caveats.

**Branch:** `claude/aibi-p-shippable` · Worktree: `~/Projects/aibi-shippable` · Base: main @ 23e3888

---

## Phase sequence

Sequenced so each phase unblocks the next and can be committed atomically.

### A — Sandbox data for modules 10, 11, 12 (~4h)

The most role-applied modules currently have no Practice tab. `public/sandbox-data/aibi-p/` stops at module 9. Builds confidence by completing the existing pattern.

- Inspect existing M1-M9 sample data shape (`public/sandbox-data/aibi-p/module-N/*`)
- Author M10 (Role-based use cases — banker-specific scenarios per role)
- Author M11 (Personal prompt library — prompt patterns + worked examples)
- Author M12 (Final practitioner lab — capstone scenarios)
- Wire each into `src/components/AIPracticeSandbox.tsx` SANDBOX_CONFIGS map
- Smoke test all three Practice tabs render

**Done when:** every AiBI-P module has a working Practice tab with banker-specific samples.

---

### B — Per-module Apply activities (1-2d, the core lift)

Today every module's Apply is the same generic textarea. This is the audit's single most important finding (C1+C2+H6).

Plan: replace the universal `buildV4Activity` with per-module forms. Reuse existing components where possible (`ClassificationDrill.tsx` for M9 already exists, unused).

| Module | Apply activity | Artifact output |
|---|---|---|
| M1 — Workday wins | Email rewriter form (paste before, edit after, save) | `email-rewrite-{date}.md` |
| M2 — What AI is/isn't | Hallucination spotter (3 AI outputs, banker marks errors) | `hallucination-log-{date}.md` |
| M3 — Prompting fundamentals | Prompt builder (role/task/constraints/format wizard) | `prompt-template-{module}.md` |
| M4 — AI work profile | About-me.md generator | `about-me.md` |
| M5 — Projects + context | Project brief writer (objective, audience, constraints, success) | `project-brief-{name}.md` |
| M6 — Files + document workflows | Document summary template generator | `doc-summary-template.md` |
| M7 — AI tools landscape | Tool selection matrix (use case × tool fit) | `tool-selection-matrix.md` |
| M8 — Agents + workflow thinking | Workflow decomposer (steps + handoff points) | `workflow-design.md` |
| M9 — Safe AI use | ClassificationDrill (already built) — red/yellow/green scenarios | `safe-ai-use-card.md` |
| M10 — Role-based use cases | Role-tailored prompt generator (teller/lender/compliance/finance) | `role-playbook-{role}.md` |
| M11 — Personal prompt library | Multi-prompt library editor + tagger | `prompt-library-export.md` |
| M12 — Final practitioner lab | Capstone artifact assembler (combines outputs from M1-M11) | `aibi-p-capstone.md` |

Each form:
- Per-module React component in `src/app/courses/aibi-p/_components/apply/`
- Server-side artifact generation (markdown template + user input merge)
- Download as .md from the completion screen
- Saved to `course_enrollments` so resuming returns the user to their saved work

**Decision needed:** the existing `submit-activity` route + `activity_responses` table already store completion text. The artifact .md generation is a new thin server endpoint that templates the saved response. Approach: add `/api/courses/generate-module-artifact?module=N` that takes the saved `activity_responses` row and returns the .md. Frontend hits it on click of "Download artifact." Store the generated .md path back to the `course_enrollments` so re-downloads work.

**Done when:** all 12 modules produce a real, downloadable, user-personalized .md artifact.

---

### C — First-prompt-in-90-seconds onboarding (~4h)

Audit H12: the first 5 minutes is a survey, not value. A banker doesn't write a prompt or see an AI output before being routed to Module 1.

Plan: insert a single-prompt sandbox before the OnboardingSurvey. The flow:

1. New user lands on `/courses/aibi-p/onboarding`
2. Sees ONE prompt prefilled: "Rewrite this email for a banking customer: [pre-filled messy draft]"
3. Hits "Try with AI" — gets an Anthropic-backed response in their first 90 seconds
4. After that wins them, the OnboardingSurvey opens

Reuse `AIPracticeSandbox.tsx` in a stripped "single-prompt-no-history" mode. Ship before survey.

**Done when:** new banker sees their first AI output within 90 seconds of landing on /courses/aibi-p/onboarding.

---

### D — Resend transactional email pipeline (~1d)

The EmailGate copy says "we will email you a brief interpretation." Today: just CRM tagging. The promise is broken.

Per CLAUDE.md 2026-04-17, Resend is configured (smtp.resend.com:465 via Custom SMTP in Supabase Auth — but transactional emails outside auth flows need direct Resend API calls).

Plan:
- Add `src/lib/resend/` with `sendAssessmentBreakdown(email, score, tier, breakdown, artifactBody)`
- Create email template: tier-specific HTML with score, top 3 gaps, the starter artifact inline + as downloadable attachment
- Wire into `/api/capture-email` after the upsertReadinessResult succeeds (best-effort, non-blocking)
- Test with `audit@aibankinginstitute.test` via Resend test mode
- Update EmailGate copy to reflect what's actually delivered

**Done when:** dropping an email at the assessment results in a real branded email landing in inbox within 1 minute.

---

### E — Revive PR #2 (phase-2 keyTakeaways + LearnSection) (~2-3h)

11 commits parked. Real work that improves all 3 courses. Sequenced AFTER B because phase-2's keyTakeaways structure may inform the per-module Apply artifact design.

Plan:
- Check out `feature/phase-2`, branch off as `claude/phase-2-revival`
- Squash phase-2's 11 commits into 1 commit (cleaner conflict resolution)
- Rebase the squashed commit on main
- Resolve modify/delete conflicts on aibi-s/[week] and WeekContent: accept main's deletion (those files were retired during course-shell consolidation), port phase-2's keyTakeaways concept into the new shell
- TS check, smoke test all 3 courses
- Open PR #4

**Done when:** keyTakeaways block renders at the bottom of every AiBI-P module, every AiBI-S week, every AiBI-L session.

---

### F — V4 module content rewrite decision + execution (multi-day)

Audit C1: `[module]/page.tsx:73-76` overrides the rich legacy `module-N.ts` content with V4_AIBIP_MODULES (2 paragraphs + 1 textarea per module). Decision needed:

**Option F1 (1 day):** Restore legacy 200-line modules. Remove the V4 override. Pros: rich content already written. Cons: legacy modules predate the per-module Apply work in Phase B — they'll need integration.

**Option F2 (3-5 days):** Rewrite V4 modules to match legacy depth. Pros: integrates cleanly with Phase B. Cons: substantial writing.

**My recommendation:** F2 — V4 already integrates with the new Apply pattern; bring it up to legacy depth in voice + length. Match the writing voice in `ResultsViewV2.tsx` tier interpretations (the strongest copy on the site).

**Done when:** every module has 1500+ words of banker-credible content with named citations + concrete examples.

---

### G — Re-run UI audit (~30min)

Validate the projected 17/24 → 21/24 actually landed, find new audit findings introduced by Phases A-F.

Plan: dispatch `gsd-ui-auditor` agent against live `:3001`, write to `docs/ui-review-2026-05-XX.md`.

**Done when:** scored audit doc exists and either confirms 21+ or surfaces specific new fixes.

---

### H — Delete `feature/phase-2` parking branch (~30s)

After Phase E successfully revives the work into a new PR, the parking branch is redundant. Tag is already on origin.

Plan:
- Verify Phase E's PR is merged
- `git push origin --delete feature/phase-2`
- Confirm `archive/feature-phase-2-2026-04-29` tag still exists

**Done when:** `git ls-remote --heads origin` shows only `main`.

---

## Sequencing

```
Phase A (4h) ──┐
                │
Phase C (4h) ──┼─→ Phase B (1-2d) ──→ Phase D (1d) ──→ Phase G (30m)
                │
Phase F (3-5d)─┘                          ↓
                                          Phase E (2-3h) → Phase H (30s)
```

A and C are independent, run in parallel mentally. B depends on A (artifact pattern needs sandbox surface) but not on C. D depends on B (the artifact .md is what gets emailed). F can run in parallel with B if scoped as "rewrite V4 to match legacy depth"; if F1 (restore legacy) it must come before B since the Apply integration changes. E is independent but valuable post-B because phase-2's keyTakeaways pattern slots into the new module shell. G validates. H closes out.

## Estimated total

**Aggressive: 6 working days. Realistic: 8-10.**

## Commit / PR strategy

One commit per Phase milestone, atomic. Single feature branch (`claude/aibi-p-shippable`) → single PR at end with phases visible in commit history.

For Phase E (parked work revival): separate branch + separate PR (#4) since it's structurally different work.

For Phase F: if F2 path (rewrite V4), commit per 3-module batch (M1-M4, M5-M8, M9-M12).

## Open decisions before executing further than Phase A

1. **Phase F path: F1 (restore legacy) or F2 (rewrite V4 to match)?** I'm recommending F2 unless you say otherwise.
2. **Resend account: which sender domain are we using for transactional?** CLAUDE.md says interim was `onboarding@resend.dev` pending custom domain verification. Need to confirm if custom domain is now verified or stick with resend.dev.
3. **Per-module artifact filename convention:** `{userEmail-prefix}-{module}-{date}.md` or `aibi-p-m{N}-{slug}.md`? The latter is cleaner; the former lets the banker see whose it is.

## Phase A starts now (no decisions needed)

Sandbox data for M10-M12 doesn't depend on any of the open questions. Starting immediately.
