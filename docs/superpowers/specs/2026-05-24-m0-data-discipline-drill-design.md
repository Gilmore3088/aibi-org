# Design Spec — Module 0 v2 Data Discipline Drill

**Date:** 2026-05-24
**Branch:** `feature/addie-v1`
**Status:** Design draft, awaiting user review before plan
**Source PRD:** Provided via `/superpowers:brainstorming` (compact form set as session goal). The PRD itself acts as the requirements document; this spec is the *implementation contract* — how the PRD lands against the existing codebase, what changes, what defaults the open questions take, and what gets deferred.

## 1 · Decisions locked in brainstorming

| # | Decision | Choice |
| --- | --- | --- |
| 1 | Scope across M0 | **L2 redesign + L1 light pass.** m0.2 becomes the full six-step drill; m0.1 gets a copy + chrome pass only. |
| 2 | AI Coach behavior | **Hybrid.** Six suggested-question chips return canned (pre-authored) answers; a free-text input below them routes to a bounded Anthropic call via the existing sandbox gateway. |

## 2 · How the PRD maps to existing components

The branch already shipped the proof-of-concept v2 shell for m0.2 (`M02Experience`) with five purpose-built components. This redesign is mostly polish + extension, not greenfield.

| PRD step | Existing component | Current state | Gap |
| --- | --- | --- | --- |
| 01 Rule | `src/components/addie/lesson/v2/RuleHeroCard.tsx` + `SacredRule.tsx` | Rule + move + test are present | Tighten copy to PRD verbatim; ensure the test line ("Would I be comfortable…") is on-screen above the fold |
| 02 Strip | `src/components/addie/lesson/v2/AnonymizationFlow.tsx` | 4 tokens (2 sensitive: `Maria Lopez`, `4421`); `$35 overdraft fee` is non-tappable context | **Update tokens** to PRD example: `Maria Lopez`, `account ending 4421`, `$128`, `Friday` all sensitive; `customer upset about a fee` + `needs a response` non-sensitive context. Add per-token feedback strings. Add copyable "Safe prompt" reveal at the end. |
| 03 Sort | `src/components/addie/interactives/m0/OffLimitsSorter.tsx` | **Two-bucket UI** (`off_limits`, `allowed`); enum carries `depends_on_review` but no third column rendered | **Three-bucket UI** required. Add `needs_review` column, route items currently keyed to `depends_on_review`, write per-item feedback for all three categories. Reseed item set to PRD's 7–9 items if current set diverges. |
| 04 Check | `KnowledgeCheck` + 3 seeded m0.2 rows in `addie.knowledge_checks` | KC widget exists | Reseed the 3 m0.2 rows with PRD questions verbatim. Enforce 3/3 gate before "Save" CTA (the widget already supports retry — just wire the gate to step advance). |
| 05 Save | `DataDisciplineCardArtifact.tsx` + `ToolboxAccumulation` | Card artifact + Toolbox save infra both shipped | Align card sections + copy to PRD §10 Screen 5. Wire email-capture modal at save for anon learners (per branch policy: "every save is a lead"). Card is already saved as a `ToolboxItem` row; verify the artifact-type enum has `data_discipline_card` (it does — confirmed via list_tables on 2026-05-24). |
| 06 Recap | `LessonStepShell` final-slot prop | Has a recap slot | Author Monday-move copy + bullets + Module-1 CTA per PRD §10 Screen 6. |
| Stepper | `LessonStickyNav` | Generic stepper | Replace lesson labels with `Rule / Strip / Sort / Check / Save / Recap` (six steps), persistent bottom CTA, course outline collapsed to drawer. |
| Coach drawer | **New component** `LessonCoachDrawer.tsx` | None | Right-side drawer (desktop) / bottom sheet (mobile). 6 static-answer chips + free-text input bound to `/api/sandbox/chat` with an M0-scoped system prompt. PII pre-scan via existing `src/lib/sandbox/pii-scanner.ts`. |

## 3 · Six-step drill — component-level contract

### Step 01 · Rule (`RuleHeroCard` revision)

- Display: rule line (Newsreader serif, large), move line (bold inline), test line (mono kicker).
- CTA: **Try the strip-it move** (mono caps).
- No interaction required to advance — proceeds on CTA click.

### Step 02 · Strip (`AnonymizationFlow` extension)

- Tokens table (replaces current `DEFAULT_TOKENS`):

  | text | sensitive | replacement | feedback on tap |
  | --- | --- | --- | --- |
  | `Maria Lopez` | ✅ | `[customer]` | "Correct — real names stay out." |
  | `account ending 4421` | ✅ | `[account identifier removed]` | "Correct — account identifiers stay out." |
  | `$128` | ✅ | `[amount]` | "Correct — dollar amounts tied to a real account stay out." |
  | `wants a response by Friday` | ✅ | `[needs a response]` | "Generalize the timing — describe the situation, not the specific commitment." |
  | `called about a` | ❌ | — | (non-tappable) |
  | `overdraft fee` | ❌ | — | "Keep the situation, but generalize it." (advisory tooltip only — does not advance count) |

- Reveal-after-completion (all 4 sensitive tokens stripped):
  - **Safe situation** card: "A customer is upset about a fee and needs a clear, empathetic response."
  - **Safe prompt** card (copyable button): "Draft a short, professional response to a customer who is upset about a fee. Do not include names, account numbers, or account-specific details."
  - Key line: **Same work. Safer input.**
- Persists `StripItActivityResult` on completion via `/api/addie/lesson-events`.

### Step 03 · Sort (`OffLimitsSorter` three-bucket revision)

- Render three columns instead of two:

  | Column id | Label | Border tone |
  | --- | --- | --- |
  | `allowed` | Allowed | `--ledger-accent-2` navy border + `--ledger-ink` text on `--ledger-paper` |
  | `needs_review` | Needs Review | `--ledger-accent` gold border + ink text on paper |
  | `off_limits` | Off-Limits | `--ledger-weak` oxblood border + ink text on paper |

  (Color is supplementary; the column has a mono-cap label as the primary indicator. The branch-scoped CLAUDE.md retires the sage/cobalt/terra pillar tones, so the Ledger gold + oxblood + navy trio is the available palette.)

- Items (use the PRD §10 Screen 3 set; reseed `OFF_LIMITS_ITEMS` constant):

  | id | label | correct_category | feedback (per category) |
  | --- | --- | --- | --- |
  | `cfpb_summary` | Public CFPB rule summary | `allowed` | "Correct. Public information is generally safe to use." |
  | `public_procedure` | Public-facing bank procedure | `allowed` | "Public-facing material is safe in public AI." |
  | `anon_situation` | "A customer is upset about a fee" | `allowed` | "Correct — situation, not person." |
  | `branch_huddle_notes` | Internal branch huddle notes | `needs_review` | "Internal-only material may still be confidential. Redact or use approved tools." |
  | `internal_audit_memo` | Internal-only audit memo | `needs_review` | "Careful. Internal-only material may still be confidential even without customer data." |
  | `sar_redacted` | SAR narrative with identifiers removed | `needs_review` | "Even redacted suspicious activity material is sensitive. Escalate or use approved internal processes only." |
  | `name_plus_acct` | Customer name plus account number | `off_limits` | "Correct. Names tied to account details never go into public AI." |
  | `cardholder_mailer` | Cardholder mailing list | `off_limits` | "Correct. Customer lists never go into public AI." |
  | `loan_file_borrower` | Loan file with borrower details | `off_limits` | "Correct. Loan files with borrower data are confidential." |

- Three-bucket UI must support **click-to-classify** (a11y mandate) in addition to drag.
- Completion rule: all items sorted, learner has reviewed corrections (the existing "retry incorrect" affordance applies).
- Track-aware appendix (existing `TRACK_OFF_LIMITS` map): for the learner's role track, append one extra off-limits item that's role-specific (e.g., risk_compliance → "draft examiner correspondence with bank name"). This is the only branched behaviour in M0.L2.

### Step 04 · Check (KnowledgeCheck reseed)

- Three rows in `addie.knowledge_checks` for `lesson_id = 'm0.2'`. Migration in this phase replaces existing 3 rows with PRD wording (the m0.2 KCs need a `correct_option_id` + `explanation` per option — existing schema supports this via `options jsonb`).
- Q1: "Which of these can safely go into a consumer AI tool?" → "An anonymized situation…"
- Q2: "What is the move when you need help on something that involves real customer details?" → "Describe the situation, not the person."
- Q3 (T/F): "True or false: the course sandbox may help enforce safe practice, but real tools outside the course may not stop you from pasting sensitive data." → "True — the habit is yours"
- 3/3 required to advance; misses surface inline explanation and the step lets the learner retry the missed item only (not the whole quiz).

### Step 05 · Save (`DataDisciplineCardArtifact` content alignment)

- Card content matches PRD §10 Screen 5 verbatim (Rule, Move, Pattern, Examples, Allowed / Needs Review / Keep Out, When in doubt).
- Save action:
  - **Signed-in:** writes a `toolbox_items` row + first `toolbox_item_versions` row directly. Existing infra.
  - **Anonymous:** triggers the existing email-capture modal (used elsewhere on the gate flow). On submit, persist via `addie.leads`, set `addie.toolbox_items.lead_id`, and write the version. "Continue without saving" stays available.
- Card is copyable + printable (CSS `@media print` on the artifact wrapper).
- Toolbox right-rail strip updates immediately on save.

### Step 06 · Recap (`LessonStepShell` recap slot)

- Title: **You know the first safety move**
- Five capability bullets per PRD §10 Screen 6.
- Monday-move block (four lines).
- Next-module CTA: **Continue to Module 1** (ink button); secondary: **Open my Toolbox** (outline).
- Recap only appears once Step 05 completes (saved OR explicitly skipped).

## 4 · AI Coach drawer (new component)

**File:** `src/components/addie/lesson/v2/LessonCoachDrawer.tsx`

- Desktop: right-side drawer (320px wide), persistent toggle button labelled `Ask the AI Coach` in the chrome.
- Mobile: floating button bottom-right; opens as bottom sheet with focus trap.
- Six static-answer chips (pre-authored markdown responses in `src/content/addie/m0-coach.ts`):
  1. Can I paste internal policy?
  2. What counts as member data?
  3. How do I anonymize this?
  4. What if my bank has an approved AI tool?
  5. Is a redacted SAR narrative safe?
  6. Can I use public regulatory information?
- Free-text textarea (max 280 chars) → POST `/api/addie/coach/chat` (new route) with:
  - System prompt template anchored to M0 data-discipline rules (rule + move + classification triage); explicit refusals: no legal advice, no institution-approval claims, no policy override.
  - PII pre-scan via `pii-scanner.ts` — if the user input matches name/SSN/account/card regex, the API returns a guardrail response without calling the model and toasts "Please remove names, account numbers, member details, or confidential bank information before asking."
  - 1k token cap; logged to `addie.events` with `action='coach_ask'`, **no raw content**, only `questionCategory` enum derived heuristically from the input.
- Drawer never blocks lesson progress; closing it returns focus to the previous interactive element.

## 5 · Chrome diff (applies to m0.1 too)

- **Top nav** — unchanged.
- **Lesson progress** — replace the generic stepper labels with six-step `Rule / Strip / Sort / Check / Save / Recap` on m0.2. m0.1 keeps a two-step stepper.
- **Left course outline** — collapsed by default; "View course outline" opens a drawer (left). Same shape on m0.1.
- **Bottom nav** — single sticky bar: `← Back · Step X of 6 · <primary CTA>` on m0.2. m0.1 keeps a similar two-step bar.

## 6 · Data + analytics (gap from current state)

| Entity | Current state | Spec gap |
| --- | --- | --- |
| `ModuleProgress` | tracked via lesson-completion rows | already covered; current-step persistence is new — add `addie.lesson_step_progress(user_id, lesson_id, current_step, completed_steps[])` table |
| `StripItActivityResult` | not tracked | new table `addie.strip_it_results` OR persist in `addie.events` payload jsonb (recommend the latter to avoid a one-off table) |
| `SortActivityResult` | partial (event-stream) | persist completion row in `addie.events` with full payload |
| `QuickCheckResult` | tracked in `addie.knowledge_check_results` (existing) | no change |
| `ToolboxItem` | tracked in `addie.toolbox_items` (existing) | no change |
| `CoachInteraction` | not tracked | persist in `addie.events` with `action='coach_ask'`; PII-scrubbed |

Analytics events (PRD §16): all routed through existing `addie.events` table (already shipping 161 rows). No new analytics infra.

## 7 · PRD §24 open-question defaults (each can be revisited in plan)

| # | Question | Default | Rationale |
| --- | --- | --- | --- |
| 1 | M0 free without email, or email at card save? | **Email at card save**, signed-in saves direct. | Branch policy: every save = lead. |
| 2 | Card printable without login? | **Yes** for the in-page print view; PDF download deferred to v2. | CSS-only, low cost. |
| 3 | Needs Review = internal policy excerpts, or Keep Out for simplicity? | **Needs Review with explicit warning copy** per PRD §10. | The three-bucket model is the lesson; flattening to two undercuts the drill. |
| 4 | SAR examples in beginner module? | **Yes, framed as Needs Review with escalation copy.** | Aligns with PRD; flagged for content reviewer (CRO persona) to sign off. |
| 5 | AI Coach behavior | **Hybrid** (locked in brainstorming). | — |
| 6 | Role-track examples in m0.2? | **One track-specific item in Sort step only**, no other branching. | Existing `TRACK_OFF_LIMITS` map supports this; broader branching starts at m1.3 per Module PRDs. |
| 7 | M0 toward certificate? | **N/A.** No credential v1 on this branch. | Branch-scoped CLAUDE.md. |
| 8 | Institution-specific disclaimers? | **Deferred to enterprise mode.** | Out of v1 scope. |

## 8 · Acceptance criteria (consolidated)

A learner completing m0.2 must:

1. Strip all 4 sensitive tokens in Step 02 to advance.
2. Sort all 9 items in Step 03 (incorrect items reviewable before advance).
3. Score 3/3 in Step 04 (missed items reviewed inline before advance).
4. Either save the Data Discipline Card to Toolbox (signed-in or anonymous + email) or explicitly skip.
5. View the Recap with the Module 1 CTA visible.

Plus chrome + a11y:

- Course outline collapsed by default on both m0.1 and m0.2.
- Stepper labels visible at all times; bottom CTA sticky on mobile.
- Coach drawer focus-trapped; ESC closes; respects `prefers-reduced-motion`.
- All interactions keyboard-reachable; color is never the sole category indicator.
- `npx tsc --noEmit` clean; route smoke-test 200 across `/foundation/m0/m0.1`, `/foundation/m0/m0.2`, `/foundation-canvas/m0`.

## 9 · Out of scope (deferred)

- Institution policy ingestion.
- Real AI calls inside the Strip-it / Sort drills.
- Document upload anywhere in M0.
- PDF download of the Data Discipline Card (CSS print view only in v1).
- Custom bank policy overrides for the sorter rubric.
- Cross-module branched rendering beyond the single track-specific item in Step 03.

## 10 · Plan handoff notes

The implementation plan (writing-plans skill, next) should organize work into approximately:

1. **DB/seed wave** — migration 00072 adds `addie.lesson_step_progress`; reseed `addie.knowledge_checks` m0.2 rows; reseed sorter items if shape differs.
2. **Component wave (parallel)** — extend `AnonymizationFlow`, three-bucket `OffLimitsSorter`, content-align `DataDisciplineCardArtifact`, recap content in `M02Experience`.
3. **Coach drawer wave** — new component + new API route + system-prompt content + chrome wiring.
4. **Chrome wave** — six-step `LessonStickyNav`, outline-drawer-only course nav, bottom sticky CTA, m0.1 light pass.
5. **Polish + verify** — canvas regenerate, route probe, specialist re-dispatch on m0.2, gap reconciliation.
