# Wave B Critique — 2026-05-24

## Summary
- 7 findings reviewed
- **Final Wave B status: 7 VERIFIED-FIXED · 0 PARTIALLY-FIXED · 0 NOT-FIXED · 3 new findings still open (B1 closed by rework, B2 closed by rework, B3 still open)**
- Initial pass: 5 VERIFIED-FIXED · 2 PARTIALLY-FIXED
- Rework commit `309190b` closed all three partial-fix gaps (A1, A2, A3) and folded B1 + B2 into the fix
- B3 (stale SacredRule header comment) remains open — trivial, not a blocker
- **Recommendation: GREEN-LIGHT WAVE C**

All four claimed test files pass: scoring (5/5), assessment-storage (7/7), SacredRule (6/6), ideas-and-prompts (8/8).

## Per-finding verdicts

### A1 — Reconcile In-Depth scoring engines — PARTIALLY-FIXED
Commit `421a9c5` is structurally strong. `composeScore` and `getTierInDepth` now route through `tierFromPct`/`percentOfMax` (`content/assessments/v2/scoring.ts:97-100, 81-86`) — storage and display cannot drift on the in-depth path; submit route stores the breakdown-derived tier (`src/app/api/assessment/in-depth/submit/route.ts`). Migration `00062` is idempotent and includes a hard-fail DO block (`supabase/migrations/00062_reconcile_readiness_tier.sql:90-127`). Vitest boundary suite passes.

Gap: the audit named **three** engines — `getTierV2`, `getTierInDepth`/`composeScore`, and `scoreToTier`. `scoreToTier` in `content/assessments/v2/maturity.ts:211-224` uses a *different* threshold table (position-based 0.25/0.50/0.75) than `tierFromPct` (50/75/90 pct). It is currently dead in `src/` (grep returns 0 non-test callers) so it is not a live drift path, but it is still exported and tested as if canonical. Either delete or re-route through `tierFromPct`. See B1.

Migration WHERE clause covers null `max_score` rows correctly (rebuilds from `readiness_dimension_breakdown` sums; rows without a breakdown are intentionally skipped per comments at L13–16). Acceptable.

### A2 — Free-assessment taxonomy — PARTIALLY-FIXED
Commit `81f6739` replaces the eight EmailGate labels. Compared to `DIMENSION_LABELS` in `content/assessments/v2/types.ts`, the sample labels are *abbreviated* (`Current AI` vs `Current AI Usage`; `AI Literacy` vs `AI Literacy Level`; `Builders` vs `Builder Potential`; `Experiments` vs `Experimentation Culture`). The diff's own comment acknowledges this ("Short forms are kept inline for column-width fit"). The audit demanded the labels "match the v2 canonical 8 dimensions exactly" — they match in identity but not in string. A user comparing the EmailGate teaser to the real report will still see different copy. Acceptable as a width compromise, but flag for the author to confirm.

No other free-flow surface (`grep -n "Use cases\|Awareness\|Governance" src/app/assessment/`) carries old taxonomy. Scope is clean.

### A3 — localStorage + 24-h TTL — PARTIALLY-FIXED
Commit `f31d5f5` adds a clean adapter (`src/app/assessment/_lib/assessment-storage.ts`) and rewires both `useAssessmentV2` and `useAssessmentInDepth`. Clock skew handled (`age < 0` purges, L49-50). Probe-write doubles as quota check; sessionStorage fallback path runs its own probe. 7/7 vitest cases pass.

Gap: `src/app/assessment/in-depth/take/_components/InDepthRunner.tsx:39-53` still uses `sessionStorage` directly for `ROLE_STORAGE_KEY` (the persona role selection). This is part of the In-Depth flow that A3 explicitly cited and the same 4-minute iOS Safari eviction wipes it. The answer state is now safe; the role pick a learner makes before the questions still vaporises. See B2.

(The legacy `src/app/assessment/_lib/useAssessment.ts` also still uses sessionStorage but has 0 importers — dead code.)

### A5 — SacredRule WCAG 2.1.2 — VERIFIED-FIXED
Commit `41709a3` removes Escape from the commit gestures (`SacredRule.tsx` keydown handler), refocuses CTA instead, adds `aria-labelledby`/`aria-describedby` + body scroll lock + focus restore on unmount. The Tab handler explicitly captures `e.preventDefault()` and refocuses the only focusable element — single-focus modal, not a keyboard trap. 6/6 tests pass.

The window-level keydown listener concern (parent conflicts) is low-risk because SacredRule is a fullscreen `z-[60]` `role="dialog"` modal — by contract only one mounts at a time, and consumers do not stack keyboard handlers underneath fullscreen modals in this codebase.

Original "tap anywhere to advance" UX claim: the JSX renders one CTA button; no click handler on the outer div — so technically you cannot "tap anywhere," only the button. The kicker comment in the file header still says "Tap anywhere to advance" (`SacredRule.tsx:13`) and is misleading. Minor. See B3.

### A6 — Ideas+prompts deliverable — VERIFIED-FIXED
Commit `047dfad` adds `selectIdeasAndPromptsRows` (lowest 3 dims), `buildIdeaCard`, and renders a new Chapter 05 with conditional `thisWeek` and `starterPrompt` blocks (`InDepthBriefingView.tsx:646-694`). Empty breakdown → empty cards array → section heading renders alone (acceptable). 8/8 extractor tests pass.

Anchor renumber verified: all `ch05`/`ch06` references in `InDepthBriefingView.tsx:382-383, 646, 697` are consistent and TOC pages updated. No stray `ch05`-referring-to-action-register remains.

Heading-capitalisation drift in `extractThisWeek` is a known fragility (regex against authored markdown). The test covers all 8 dimensions today; if a new starter artifact adds the section with different capitalization the test will fail (good), but no schema-level guard exists. Acceptable for now.

### A10 — Post-Stripe identity binding — VERIFIED-FIXED
Commit `a0a0912`. `MagicLinkPanel` is `'use client'`; renders on both `/purchased` pages when Stripe session returns an email and buyer is unauthenticated. Resend calls `signInWithMagicLink` → `signInWithOtp`, which is Supabase's create-or-send semantics — no race condition with the webhook (resend works whether the auth user exists yet or not). The fallback `signup/login` pair still renders only for the no-email path (`page.tsx` L23-25 in both files), so users who had a session but lost the cookie hit the password fallback link inside MagicLinkPanel — still a one-click resend, not a regression. Good.

### A30 — CLAUDE.md tier numbers — VERIFIED-FIXED
Commit `81f6739` rewrites the Scoring Logic block. Bands documented (12-22, 23-32, 33-40, 41-48) match `content/assessments/v2/scoring.ts:21-52` exactly. `currentQuestion: 0–11` aligns with the 12-question rotation. No other stale `8-32`/`8 questions`/`0–7` references remain (`grep` returns only the 48-question $99 line, which is correct).

## New findings surfaced during Wave B

**B1** — `content/assessments/v2/maturity.ts:211-224` `scoreToTier` is the third engine the A1 audit named, still using non-pct thresholds (0.25/0.5/0.75) divergent from `tierFromPct` (50/75/90). Currently dead in `src/` (0 callers) but exported, tested, and importable. Either delete or re-route through `tierFromPct`. Low severity (no live drift) but A1's "single source of truth" claim is incomplete without it.

**B2** — `src/app/assessment/in-depth/take/_components/InDepthRunner.tsx:39, 53` uses raw `sessionStorage` for the role pick (`ROLE_STORAGE_KEY`). The A3 fix did not migrate this. Same iOS Safari eviction wipes it. Should route through `loadAssessment`/`saveAssessment`/`clearAssessment`. Medium severity for the paid flow.

**B3** — `src/components/addie/lesson/v2/SacredRule.tsx:13` header comment still says "Esc or 'I'm ready' button advances" wording residue ("Tap anywhere to advance" in the comment header L11). Comment is now wrong post-A5. Trivial. Also: no click-handler on the backdrop, so the literal "tap anywhere" promise has never been implemented and should be removed from the doc-comment.

## Recommendation

**HOLD FOR REWORK — minor**, targeted at A1, A2, A3:

1. **A1**: Re-route or delete `scoreToTier` so the "single source of truth" claim is true at the module level, not just for live callers.
2. **A2**: Decide whether `Current AI` / `Builders` / `AI Literacy` / `Experiments` short forms are good enough, or restore the canonical strings (with `whitespace-nowrap` + a wider column if needed). The audit demanded "match exactly."
3. **A3**: Migrate `InDepthRunner` role storage to the adapter — that is the same headline iOS-eviction risk A3 fixed for answers.

Everything else (A5, A6, A10, A30) is GREEN. The three reworks above are <30 lines of code combined and unblock a full VERIFIED-FIXED across all seven.

---

## Rework verification (post-309190b)

Commit `309190b` (2026-05-24 13:01 PDT) lands the three follow-up fixes. Re-verified end-to-end.

### A1 follow-up — VERIFIED-FIXED
`scoreToTier` in `content/assessments/v2/maturity.ts:214-217` now delegates: `return tierFromPct(percentOfMax(score, maxScore)).id;` with a `maxScore <= 0` guard returning `'starting-point'`. Same percent-of-max threshold table (50 / 75 / 90) the overall composite uses — all three engines (`getTierV2`, `composeScore`/`getTierInDepth`, `scoreToTier`) now share one source. `npx vitest run content/assessments/v2/maturity.test.ts` → **12/12 passing** with the new pct-of-max rubric annotated inline. Closes B1.

### A2 follow-up — VERIFIED-FIXED
`src/app/assessment/_components/EmailGate.tsx:311-319` now carries the full canonical strings: `Current AI Usage`, `Experimentation Culture`, `AI Literacy Level`, `Quick Win Potential`, `Leadership Buy-In`, `Security Posture`, `Training Infrastructure`, `Builder Potential` — verbatim against `DIMENSION_LABELS` in `content/assessments/v2/types.ts`. Column widened from `w-24` to `w-44` (L322), font dropped to `text-[9px]` with `tracking-[0.12em]` + `leading-tight` for vertical fit. The teaser dashboard and the real report now share strings.

### A3 follow-up — VERIFIED-FIXED
`src/app/assessment/in-depth/take/_components/InDepthRunner.tsx:17-19` imports `loadAssessment` / `saveAssessment` from `@/app/assessment/_lib/assessment-storage`. The mount-effect at L42-51 uses `loadAssessment<string>(ROLE_STORAGE_KEY)` instead of `sessionStorage.getItem`, and `commitRolePick` at L53-57 calls `saveAssessment(ROLE_STORAGE_KEY, picked ?? '')`. Role pick now rides the same TTL-bounded localStorage adapter as the answer state — iOS Safari 4-minute eviction no longer re-prompts. Closes B2.

### Smoke check — other `sessionStorage` references
`grep -rn "sessionStorage" src/app/assessment/ --include="*.ts" --include="*.tsx"` returns only:
- `src/app/assessment/_lib/assessment-storage.ts` — the adapter itself, including the fallback path that probes sessionStorage when localStorage is unavailable (intentional)
- `src/app/assessment/_lib/assessment-storage.test.ts` — adapter tests (intentional)
- `src/app/assessment/page.tsx:60` — a code comment only, no actual call
- `src/app/assessment/_lib/useAssessment.ts:37, 72, 107` — the **legacy v1 hook** (0 importers; superseded by `useAssessmentV2`). Dead code, already flagged in the original Wave B pass.

No live caller bypasses the adapter. Free flow (`useAssessmentV2`) and In-Depth flow (`useAssessmentInDepth` + `InDepthRunner` role pick) all route through `loadAssessment`/`saveAssessment`.

### Final recommendation
**GREEN-LIGHT WAVE C.** All seven Wave B findings are VERIFIED-FIXED. B1 and B2 are closed by the rework. B3 (stale `SacredRule.tsx` header comment claiming "Tap anywhere to advance") is trivial and non-blocking — fold into the next janitorial sweep. The legacy `useAssessment.ts` dead-code hook is a separate cleanup candidate (delete in a follow-up; not Wave C scope).
