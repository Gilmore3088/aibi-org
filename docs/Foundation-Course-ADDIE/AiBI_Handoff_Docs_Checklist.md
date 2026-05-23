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

---

## 🔧 For Developers (needed)

- [ ] **Technical Design Doc (architecture)** — `P1` — stack choices, service boundaries, repo structure, hosting `[Host]`, env/secrets, CI/CD. *(PRD has only a high-level diagram.)*
- [x] ~~**Sandbox Service Technical Spec** — `P1`~~ — ✅ **done** (`Sandbox_Service_Tech_Spec.md`).
- [ ] **Database schema + RLS spec** — `P1` `[Supabase]` — concrete tables, columns, types, relationships, indexes, and row-level-security policies. *(PRD lists entities only. **Now the top P1.**)*
- [ ] **Auth & entitlements spec** — `P1` `[Supabase][Stripe]` — anonymous-view → email-lead → paid states, gating logic after M3, team-seat model, invite/assign/revoke.
- [ ] **Stripe integration spec** — `P2` `[Stripe]` — products/prices ($99/$295/$199-seat), checkout, webhook → entitlement writes, refunds.
- [ ] **MailerLite integration spec** — `P2` `[MailerLite]` — lead sync from Supabase, the nurture automation, consent/unsubscribe, transactional sends (invites, assessment delivery).
- [ ] **Content model / authoring spec** — `P2` — how modules/lessons/tracks/takeaways/checks are stored as data so content updates without a deploy (esp. M1.2's fast-changing tool matrix).
- [ ] **Event taxonomy / analytics spec** — `P2` `[Supabase]` — the exact events + payloads to log (funnel, gate-fork, Toolbox reuse, check results).
- [ ] **Security & privacy spec** — `P1` — consolidated: data-discipline enforcement, the injection/leak **test plan**, encryption, retention/deletion, and the buyer-facing provider-data posture. *(Scattered in PRD NFRs today.)*
- [ ] **QA / test plan** — `P3` — sandbox safety tests, payment flows, email deliverability, accessibility audit, ≤15-min checks.
- [ ] **Environment setup / runbook** — `P3` — get-it-running, secrets, deploy.

## 🎨 For Designers (needed)

- [ ] **Design system / UI kit** — `P1` — color tokens, type scale (Fraunces / Newsreader / IBM Plex Mono), spacing, component library, iconography. *(The mockup implies it — this codifies it so it's reusable and consistent.)*
- [ ] **Screen inventory + user flows** — `P1` — every screen and the flows between them: onboarding, lesson player, **all sandbox states**, the gate, checkout, Toolbox, team admin dashboard, the assessment. *(Mockup covers only M0 + the gate.)*
- [ ] **Component specs + states** — `P2` — lesson player, sandbox, gate screen, Toolbox drawer, knowledge checks, sorter — each with empty / loading / error / success / locked states.
- [ ] **Brand & voice guide** — `P2` — logo usage, the editorial aesthetic rationale, and voice/tone ("bankers into builders"; the calm, enabling data-discipline tone) + microcopy rules.
- [ ] **Accessibility design spec** — `P2` — WCAG 2.1 AA as a design checklist: contrast, focus order, keyboard paths, captions/transcripts.
- [ ] **Responsive / breakpoint spec** — `P3` — layouts from mobile to desktop.

## 🤝 Shared / PM (needed)

- [x] ~~**Team onboarding / "start here"** — `P2`~~ — ✅ **done** (`Start_Here.md`).
- [ ] **Glossary** — `P3` — standalone version of the PRD's terms (blinders, Toolbox, gate, track, light/rich artifact).

---

## Recommended build order (the P1s unblock everyone)
1. ~~**Sandbox Service Technical Spec**~~ — ✅ written 2026-05-23.
2. **Database schema + RLS** and **Auth & entitlements** — everything reads/writes through these. *(Current top of the queue.)*
3. **Technical Design Doc** — ties the stack together.
4. **Design system / UI kit** + **Screen inventory & flows** — unblock design in parallel with backend.
5. **Security & privacy spec** — needed before the pilot and before banking buyers ask.

*Then P2s (integrations, content model, components, voice) and P3s (runbook, QA detail, responsive, glossary).*
