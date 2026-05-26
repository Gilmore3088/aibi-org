# AiBI — Handoff Documentation Checklist
*What developers and designers need to build this cleanly. ✅ = you have it · 🔲 = still needed · priority P1 (unblocks build) → P3 (nice-to-have).*

---

## ✅ Already in the set (no need to recreate)
- Course vision & funnel — `Interactive_Overview.html`, `ADDIE_Design_v2.md`
- Product requirements (course level) — `Foundation_PRD.md` *(has the data-model list + high-level architecture diagram, but not the detailed specs below)*
- Requirements (module level) — `Module_PRDs.md`
- Build-task tracking — `Launch_Checklist.md`, `Module_Production_Tracker.md`
- Content (M0) — `Module_0_Orientation.md`
- A working UI reference — `LMS_Mockup_Module0.html`
- **Team onboarding / "start here"** — `Start_Here.md` *(was P2; written 2026-05-23)*
- **Sandbox Service Technical Spec** — `Sandbox_Service_Tech_Spec.md` *(was P1; written 2026-05-23 — Exercise model, prompt assembly, gateway, output gating, security tests)*
- **Database schema + RLS spec** — `Database_Schema_RLS_Spec.md` *(was P1; written 2026-05-23 — concrete tables, RLS policies, identity ladder, migration order, acceptance gates)*
- **Auth & Entitlements spec** — `Auth_Entitlements_Spec.md` *(was P1; written 2026-05-23 — identity ladder transitions, gate fork, Stripe checkout + webhook, team seats, marketing consent)*
- **Technical Design Doc** — `Technical_Design_Doc.md` *(was P1; written 2026-05-23 — stack, service boundaries, repo layout, environments, API surface, build sequence)*
- **Design system / UI kit** — `Design_System_Spec.md` *(was P1; written 2026-05-23 — Ledger tokens, typography, components, accessibility, voice, forbidden patterns)*
- **Screen inventory + user flows** — `Screen_Inventory_Spec.md` *(was P1; written 2026-05-23 — ~45 screens, 8 primary flows, per-screen states, mobile considerations)*
- **Security & privacy spec** — `Security_Privacy_Spec.md` *(was P1; written 2026-05-23 — data classes, structural enforcement, injection test plan, honest posture, OWASP mapping, retention/deletion, incident response, pre-pilot gate)*

---

## 🔧 For Developers (needed)

- [x] ~~**Technical Design Doc (architecture)** — `P1`~~ — ✅ **done** (`Technical_Design_Doc.md`).
- [x] ~~**Sandbox Service Technical Spec** — `P1`~~ — ✅ **done** (`Sandbox_Service_Tech_Spec.md`).
- [x] ~~**Database schema + RLS spec** — `P1`~~ — ✅ **done** (`Database_Schema_RLS_Spec.md`).
- [x] ~~**Auth & entitlements spec** — `P1`~~ — ✅ **done** (`Auth_Entitlements_Spec.md`).
- [ ] **Stripe integration spec** — `P2` `[Stripe]` — products/prices ($99/$295/$199-seat), checkout, webhook → entitlement writes, refunds.
- [ ] **MailerLite integration spec** — `P2` `[MailerLite]` — lead sync from Supabase, the nurture automation, consent/unsubscribe, transactional sends (invites, assessment delivery).
- [ ] **Content model / authoring spec** — `P2` — how modules/lessons/tracks/takeaways/checks are stored as data so content updates without a deploy (esp. M1.2's fast-changing tool matrix).
- [ ] **Event taxonomy / analytics spec** — `P2` `[Supabase]` — the exact events + payloads to log (funnel, gate-fork, Toolbox reuse, check results).
- [x] ~~**Security & privacy spec** — `P1`~~ — ✅ **done** (`Security_Privacy_Spec.md`).
- [ ] **QA / test plan** — `P3` — sandbox safety tests, payment flows, email deliverability, accessibility audit, ≤15-min checks.
- [ ] **Environment setup / runbook** — `P3` — get-it-running, secrets, deploy.

## 🎨 For Designers (needed)

- [x] ~~**Design system / UI kit** — `P1`~~ — ✅ **done** (`Design_System_Spec.md`).
- [x] ~~**Screen inventory + user flows** — `P1`~~ — ✅ **done** (`Screen_Inventory_Spec.md`).
- [ ] **Component specs + states** — `P2` — lesson player, sandbox, gate screen, Toolbox drawer, knowledge checks, sorter — each with empty / loading / error / success / locked states.
- [ ] **Brand & voice guide** — `P2` — logo usage, the editorial aesthetic rationale, and voice/tone ("bankers into builders"; the calm, enabling data-discipline tone) + microcopy rules.
- [ ] **Accessibility design spec** — `P2` — WCAG 2.1 AA as a design checklist: contrast, focus order, keyboard paths, captions/transcripts.
- [ ] **Responsive / breakpoint spec** — `P3` — layouts from mobile to desktop.

## 🤝 Shared / PM (needed)

- [x] ~~**Team onboarding / "start here"** — `P2`~~ — ✅ **done** (`Start_Here.md`).
- [ ] **Glossary** — `P3` — standalone version of the PRD's terms (blinders, Toolbox, gate, track, light/rich artifact).

---

## Recommended build order (all P1s complete)
1. ~~**Sandbox Service Technical Spec**~~ — ✅ written 2026-05-23.
2. ~~**Database schema + RLS**~~ — ✅ written 2026-05-23.
3. ~~**Auth & entitlements**~~ — ✅ written 2026-05-23.
4. ~~**Technical Design Doc**~~ — ✅ written 2026-05-23.
5. ~~**Design system / UI kit + Screen inventory & flows**~~ — ✅ written 2026-05-23.
6. ~~**Security & privacy spec**~~ — ✅ written 2026-05-23.

**Engineering can begin.** The cross-team build sequence lives in `AiBI_Technical_Design_Doc.md` §11. The next backlog is the P2s below (integration specs, content model, event taxonomy, brand & voice, accessibility design spec).

*Then P2s (integrations, content model, components, voice) and P3s (runbook, QA detail, responsive, glossary).*
