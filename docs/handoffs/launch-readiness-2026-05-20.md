# Launch Readiness — 2026-05-20

A single, honest view of "what stands between us and the launch email,"
grouped by **who can actually unblock each item**. Companion to the issue
tracker; the issue *count* is misleading because much of it is operator-gated
or blocked. This snapshot is the real scoreboard.

Status legend: ✅ done · 🟡 in flight / partial · ⛔ blocked · 🔧 operator-only

---

## 1. The real scoreboard — MVP Launch Gate (from CLAUDE.md)

The post-conference launch email goes out when these are all true:

| Gate item | Status | Owner / note |
|-----------|--------|--------------|
| DNS live, SSL active on .com + .org→.com | 🔧 | Operator (Vercel/DNS) — #132 |
| Home page renders desktop + mobile | 🟡 | Code present; route render covered by E2E in flight (#141) |
| Assessment: 12 questions, scoring correct | ✅ | Code + new band tests (#135) |
| Email captured before score; full report inline after | ✅ | Code + email-gate test (#135) |
| sessionStorage persistence (mobile tab-kill) | ✅ | Code + persistence test (#135) |
| `/api/capture-email` rate limiting active | ✅ | 30/IP/hr (funnel-safe; DECISIONS 2026-05-20) |
| Email sequences: Day 0/3/7 active | 🔧 | Operator — **MailerLite** now (gate text says ConvertKit) — #133/#161 |
| HubSpot 5 custom properties | ➖ | **Obsolete** — HubSpot removed from code |
| Calendly Executive Briefing tested on iPhone | 🔧 | Operator |
| Services page live + Calendly | ✅ | Now `/for-institutions` (+advisory); E2E in flight (#141) |
| Certifications: inquiry-only, no broken Stripe CTA | ✅ | No checkout CTA found on education/cert routes |
| Analytics events firing | 🟡 | Gate says Plausible; site analytics is `@vercel/analytics`. **Corrected 2026-05-20:** most "plausible" hits are false positives (English word). The real Plausible event code (`ToolboxApp.tsx` `firePlausible` / `playground_pii_override_*`) calls `window.plausible`, which no longer exists → **those Toolbox events silently don't fire**. `ToolboxApp.tsx` is in **PR #224**, so re-wire-to-Vercel-or-drop is a decision for that PR's review, not a sweep. |
| 404 page exists | ✅ | `src/app/not-found.tsx` (just Ledger-migrated) |
| `npm run build` passes, zero TS errors | ✅ | Verified repeatedly this session |
| Full assessment on real iPhone Safari < 3 min | 🔧 | Operator (real device) |
| "FFIEC-aware" string absent from site | ✅* | *Only appears in "do **not** use this phrase" instructions — safe, but a literal string scan will flag 3 negated usages |
| All statistics have named-source citations | ✅ | **Audited 2026-05-20:** stats on the live surfaces (`research/page.tsx`, `resources/*` articles) carry named sources + years matching CLAUDE.md's sourced-stats table. Caveat: primary-surface scan, not an exhaustive per-essay sweep. |

**Read:** the *code/product* side of the gate is largely ✅. The remaining gate
blockers are almost entirely **operator** (DNS, MailerLite sequences, Calendly,
real-device test). The citation audit is done (passes on live surfaces); the
Plausible→Vercel analytics gap is real but lives inside PR #224's `ToolboxApp.tsx`.

---

## 2. The 53 issues, grouped by who unblocks them

### 🔧 Operator-only — no engineer can close these (~1/3 of the board)
**#132** infra/DNS/env/key-rotation · **#133** Supabase Auth email templates *(highest-leverage unblock — see §3)* · **#150** mobile/cross-browser real-device matrix · **#151** final smoke + live purchase/refund + launch comms · **#152** Foundation rollout (Stripe/MailerLite/Resend dashboards) · **#161** marketing content/templates · **#178** RLS runtime audit / pentest / security.txt body · **#180** prod PDF smoke · plus the alerting tails of **#146** (#428–432) and **#149** (prod-data hygiene).

### ✅ Already done — just needs ticking (verified in code this session)
- **#146** analytics: `certificate_issued` + `briefing_booked` (4/5 surfaces) wired → ~90% done.
- **#149**: PDF Linux fix shipped; migrations 00028/29/30 in git.
- **#134** item 41: e2e CI workflow exists.
- **#132** items 9/19/20/21 done (env audit, robots, sitemap, dependabot).
- **#238**: now fully done (last 4 routes migrated this session).

### 🟡 Agent-doable — IN FLIGHT this session
- **#135** ✅ free-assessment E2E (merged).
- **#137** Stripe-webhook/checkout E2E · **#138** module/activity API E2E · **#141** marketing-routes E2E · **#239** LMS refactor (program/page.tsx split) — *running now*.

### 🟡 Agent-doable — QUEUED (next waves)
- LMS refactor remainder **#240–#250** (behavior-preserving file splits).
- Toolbox sequence **#228 → #219 → #231** (closes #229) — must run serially.
- Perf/cleanup **#236, #237, #179**. (Citation audit done; Plausible re-wire belongs in PR #224.)
- a11y axe tests **#143**; **#154** research redesign; **#157** polish; **#158** sandbox phase 2.
- Auth rewrite **#187** (large standalone).

### ⛔ Blocked on an input (agents can't help yet)
- **#134 / #140** auth + email-template E2E → blocked on **#133** (operator) + Supabase env in CI.
- **#136** entitlement/Toolkit tests → blocked on **#219** (entitlements `tier` column).
- **#139 / #281** exam-results tests → blocked on `exam_results` schema decision.
- **#148** delete legacy `tokens.css` → blocked until token migration (#179/#238/#233) fully lands.
- **#155 / #156** data loop + peer benchmarks → blocked on first ~50 / ~200 production respondents.
- **#159 / #160** sandbox AiBI-S/-L → blocked on those product decisions.

---

## 3. Critical path to the launch email

1. **#133 Supabase Auth email templates** (operator, ~15 min dashboard) — single
   highest-leverage item; unblocks the entire authenticated experience and the
   §3/§9 E2E suites.
2. **DNS + SSL live** (#132) and **MailerLite Day 0/3/7 sequences** (#161/#152).
3. **Calendly link tested on iPhone**; **one live purchase + refund** (#151).
4. Citation audit: **done** (stats on live surfaces are sourced). Plausible
   re-wire: fold into the **PR #224** review (its `ToolboxApp.tsx` owns the
   dead event calls).

Everything else — the LMS refactors, the rest of the E2E suites, toolbox,
auth rewrite — improves quality and coverage but is **not** on the
launch-email critical path. The agents are working that backlog down in
parallel; the launch date is gated by the operator items above.
