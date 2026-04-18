---
phase: "05-modules-1-5-activities-artifacts"
tested: 2026-04-18
status: gaps_found
tester: claude (via agent-browser + Supabase MCP)
note: "3 SC passed in browser; 2 remain partially tested; 1 UX bug + 1 stale dev comment flagged"
---

# Phase 5: UAT Results

Tested against localhost dev server on 2026-04-18. Enrollment
`e38f2991-9d6b-4d10-9ff9-09793ce8e175` used across Phases 04 and 05
UAT runs. Progress fast-forwarded in DB to reach Module 5 without
walking modules 2-4 (content review rather than flow test).

## Results

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Activity 1.1 submitted → Cheatsheet PDF + Module 2 unlocks | ✅ PASS | Filled two textareas ≥20 chars each, clicked Submit, server accepted. Response row inserted in `activity_responses` (activity_id="1.1"). "Download Regulatory Cheatsheet" link appeared with href `/artifacts/regulatory-cheatsheet.pdf` → HTTP 200 verified. "Complete Module" button enabled; click advanced `current_module: 1 → 2` and `completed_modules: [] → [1]`. "Next Module" link became active. |
| 2 | Module 5 drill scores + annotations; Activity 5.2 → Acceptable Use Card PDF | ✅ PASS with UX bug | Drill renders with scenario counter (1/20), countdown timer (20s), progress bar, radio tier picker, keyboard shortcuts (1/2/3 press-select verified). Timer auto-advances on expiry. Review screen shows tier breakdown (2/5 Tier 1, 0/8 Tier 2, 0/7 Tier 3), per-scenario annotation with "TIME EXPIRED" badge, correct answer, and reasoning. See `/tmp/m5-drill.png` and `/tmp/m5-end.png`. **UX BUG:** Activity 5.2 submission shows disabled "Generate Acceptable Use Card" button until page reload; after reload, the real `<a href=".../generate-acceptable-use-card">` download link appears. Fresh submitters get a broken experience for one reload. |
| 3 | Module 4 Platform Reference Card PDF + role-specific spotlight | ✅ PDF · ⏳ SPOTLIGHT | PDF serves HTTP 200 at `/artifacts/platform-feature-reference-card.pdf`. Role-specific spotlight content routing via `contentRouting.ts` was not spot-checked in-browser (would require walking Module 4 content with different `primary_role` values in `onboarding_answers`). Code path verified in the retro audit; trust code + reload test. |
| 4 | Keyboard-only completion; color is not the sole indicator | ✅ KEYBOARD · ⏳ COLOR | Keyboard shortcuts in drill verified (`1`/`2`/`3` select tiers, drill auto-advances). ActivityForm tab order was not exhaustively walked. Color-indicator audit (red/green/etc. paired with text or icons) was not done — needs a dedicated accessibility pass with axe-core or manual contrast check. |
| 5 | Full completion on iPhone Safari 390px without horizontal scroll, text ≥14pt | ⏳ UNTESTED | Headless Chromium default viewport ≈1280px. Agent-browser supports viewport options but a full mobile walkthrough was not executed. Recommend running `agent-browser --viewport 390x844` against each module, or use Safari DevTools responsive mode manually. |

**Score (live verified):** 3/5 fully pass; 2/5 partial (SC3 spotlight, SC4 color, SC5 mobile untested).

## Findings

### 🐛 UX Bug — fresh Acceptable Use Card submitters see broken button

`src/app/courses/aibi-p/_components/AcceptableUseCardForm.tsx:305` gates
the download link on `isReadOnly` (prop from server), not `state.submitted`
(client state after successful POST). On the current render after submit,
the component is in `state.submitted=true, isReadOnly=false` — falling
into the `else` branch that renders a disabled button with label
"PDF generation available after setup" and a stale tooltip
"PDF generation route available in Plan 03".

**User impact:** after clicking "Submit and build card", the user sees a
disabled button that implies the feature isn't built yet. Only on page
reload does the real download link appear.

**Fix suggestion:** Either (a) change the condition to
`isReadOnly || state.submitted` so the just-submitted state behaves like
a reload, or (b) trigger `router.refresh()` on submission success so the
server re-renders with `isReadOnly=true`.

### 🐛 Stale developer comment leaking to production UI

The same file has `title="PDF generation route available in Plan 03"` on
the disabled button. References the GSD plan number. Should be replaced
with honest user-facing copy (or removed when the button bug is fixed,
since the disabled state becomes unreachable).

### ✅ Confirmed working beyond spec
- Cheatsheet PDF fully renders and serves
- Platform Reference Card PDF fully renders and serves
- Keyboard shortcuts on drill: real (not just ARIA promise — verified by key-press advancing scenarios)
- Drill auto-advance on timer expiry: graceful, no crash
- Server-side forward-only (carried over from Phase 04): reconfirmed

## Recommendation

Update `05-VERIFICATION.md` status from `human_needed` to `gaps_found`
until the two bugs are fixed. SC3/SC4/SC5 partial statuses should be
noted but don't block milestone unless the user explicitly scopes them.

Two-line code fix on `AcceptableUseCardForm.tsx` clears the UX bug.
