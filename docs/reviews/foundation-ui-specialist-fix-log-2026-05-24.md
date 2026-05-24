# Foundation UI Specialist — Fix Log (2026-05-24)

Source audit: [`foundation-ui-specialist-audit-2026-05-24.md`](./foundation-ui-specialist-audit-2026-05-24.md) — 25 findings (0 BLOCKER · 6 HIGH · 9 MEDIUM · 10 LOW).

## HIGH — fixed in this pass

| ID  | Surface | File | Disposition |
| --- | ------- | ---- | ----------- |
| F1  | every lesson + dashboard | `src/components/addie/lesson/MaturityJourney.tsx` | FIXED — dropped `governing` stage from the `Stage` union + `STAGES` array; rewrote terminal-stage footer to "You have completed the Foundation arc." Removes the "Specialist (AiBI-S) credential" credential pitch on this branch. |
| F2  | role-sim closing cards | `src/components/addie/lesson/RoleSimulation.tsx:156, :336, :515` | FIXED — removed three "harder version ships with AiBI-S/{Risk,IT,Retail}" trailers. |
| F3  | `/foundation`, `PaywallPreview` | `src/app/(addie)/foundation/page.tsx:241`, `src/components/addie/lesson/PaywallPreview.tsx` | FIXED — "unlock" replaced with "open"; "What you'd unlock" → "What's inside" (now a real `<h2>` + the takeaway label is also `<h2>`, partially addressing F13). |
| F4  | `/foundation/security` | `src/app/(addie)/foundation/security/page.tsx` | FIXED — 7 inline-SVG `fill`/`stroke` hex literals replaced with `style={{ fill: 'var(--ledger-…)'}}` (attribute form does not accept CSS vars). |
| F8  | every lesson | `src/components/addie/lesson/MaturityJourney.tsx:103` | FIXED — compact strip ground switched from `bg-[var(--ledger-parch)]` to `bg-[var(--ledger-paper)]`; clears the body-on-parch AA violation. |
| F10 | every `/foundation/m4/*`, `/foundation/m5/*` | `src/components/addie/lesson/PaywallPreview.tsx` | **DEFERRED** — structural change: needs the lesson row threaded into the paywall so each locked lesson renders a per-lesson teaser. Tracked as a separate plan. Today's pass softened the marketing copy and lifted the kickers to real headings; the underlying "nine locked lessons render the same screen" still stands. |

## F24 partially addressed alongside F1/F8

"AI Readiness Journey" gold caps retitled to "Your progress" (compact strip + full variant + aria-labels). Strip remains visible on lesson pages — the audit's secondary recommendation (hide on lesson pages, surface only on dashboard) is left for a follow-up since the strip also carries the lesson-/artifact-count tabular nums learners use to navigate.

## MEDIUM — disposition

| ID  | Disposition | Rationale |
| --- | ----------- | --------- |
| F5  | DEFER | Print CSS hex (`#ffffff`/`#000000`) inside the security page's print stylesheet. Right fix is to centralise in `src/styles/print.css` keyed off a body class — separate refactor; the inline rule isn't user-visible until print. |
| F9  | DEFER | Body-on-parch in `DeliverableSection`, `SkillBuilder`, `SeatStatusPill`. Same shape as F8 but on three further surfaces; pulling into a "ground-token sweep" pass so the audit + fix happen together. |
| F11 | DEFER | Ad-hoc `shadow-[0_24px_60px…]` in `/foundation` home + `PaywallPreview`. Right fix is to register `--ledger-shadow` and replace both call sites; needs token PR. |
| F13 | PARTIAL | F3's edit promoted "What's inside" + "What you'd build" to `<h2>`. The "Three doors" `<h2>` still follows the H1 directly, which is fine — outline is now H1 → H2 → H2 → H2. No more skip. |
| F15 | DEFER | Featured-module decorative double-slab. Replacement is a single hairline frame at `rounded-[4px]`; not a one-line fix. |
| F16 | DEFER | `rounded-[6px]` and `rounded-[12px]` literals. Sweep once F11+F15 land — same files. |
| F21 | TRACK | Free-lesson template sameness is the `Lesson_Shell_Migration.md` plan — a separate multi-PR effort, not a fix-log item. |
| F25 | FIXED | `dashboard/page.tsx:145` "Wave 2b will seed them." → "The course is being prepared. Come back shortly." |

## LOW — disposition

| ID  | Disposition |
| --- | ----------- |
| F6  | DEFER — `bg-white` on operator canvas tiles is acceptable for true-screenshot rendering; queue alongside F14. |
| F7  | DEFER — `<em className="not-italic">` and the literal `italic-off` token. Sweep with a `grep -rEn "not-italic\|italic-off"` pass once italics-suppression scaffolding is the only remaining work. |
| F12 | DEFER — Inner CTA shadow on hero `Start Module 0`. Bundle with F11. |
| F14 | DEFER — Canvas tile `object-cover` clipping. Easy fix; tracked with F6. |
| F15 | (see MEDIUM table) |
| F17, F18 | DEFER — micro-motion (`group-hover:scale-[1.02]`, `group-hover:-translate-y-1`). One regex sweep when motion-tightening pass runs. |
| F19 | DEFER — decorative gate stars; one-line removal in `GateScreen.tsx:20-28`. |
| F20 | DEFER — second gold CTA in the closing band. Copy/design call. |
| F22 | DEFER — lesson-id literal switch in `[lessonId]/page.tsx:358`. Needs schema column. |
| F23 | DEFER — sweep with F7. |

## Verification

After the fixes:

```text
grep -REn 'unlock'   src/app/(addie)/foundation src/components/addie/lesson  →  0
grep -REn 'AiBI-S/'  src/components/addie/lesson                              →  0
grep -En  'fill="#|stroke="#'  src/app/(addie)/foundation/security/page.tsx  →  0
grep -REn 'Wave 2b'  src/app/(addie)/foundation                              →  0
npx tsc --noEmit  (excluding addie-v1-stash/)                                 →  0 errors
```

Smoke-tested routes on `localhost:3000`:

| Route | Status |
| --- | --- |
| `/foundation` | 200 |
| `/foundation/security` | 200 |
| `/foundation/dashboard` | 200 |
| `/foundation/m4` | 200 |
| `/foundation/m4/m4.1` | 200 |
| `/foundation-canvas/m3` | 200 |

## Follow-up tickets to file

1. **PaywallPreview lesson-specific teaser (F10).** Thread `lessonRow` into the paywall so each of the nine locked lessons renders its own objective + takeaway + first 80 words. Or: redirect `/foundation/m4|m5/<lessonId>` → `/foundation/m4|m5` for non-entitled viewers.
2. **`--ledger-shadow` token + radii sweep (F11, F12, F15, F16).** Define `--ledger-shadow`, replace ad-hoc `shadow-[…]` literals, normalize `rounded-[6px|12px]` to the 2/3/4 px set.
3. **Italics-suppression cleanup (F7, F23).** One pass removing `<em className="not-italic">`, the literal `italic-off`, and stale `not-italic` utilities now that `base.css` enforces non-italic globally.
4. **Body-on-parch sweep (F9).** Reuse F8 fix shape across `DeliverableSection`, `SkillBuilder`, `SeatStatusPill`.
5. **Lesson Shell Migration (F21).** Land the existing `Lesson_Shell_Migration.md` plan to roll the `M02Experience` shell out to the remaining 23 free lessons.
