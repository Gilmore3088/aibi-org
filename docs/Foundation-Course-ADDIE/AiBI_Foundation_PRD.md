# AiBI Foundation Course — Product Requirements Document (PRD)
### *"We turn your bankers into your builders."*

| | |
|---|---|
| **Product** | The AI Banking Institute — Foundation Course |
| **Version** | PRD v1.0 |
| **Status** | Draft for build |
| **Companion doc** | `AiBI_Foundation_Course_ADDIE_Design_v2.md` (instructional design — the source of truth for curriculum/pedagogy; this PRD is the source of truth for product/engineering) |
| **Owner** | James |

---

## 1. Summary

The Foundation Course is an exclusively-online, self-paced course that takes a banking professional from "I've heard of generative AI" to "I built something useful this week and I know the line I can't cross." It is also the top of AiBI's commercial funnel.

The product has four interlocking systems: a **content/curriculum engine** (6 modules, ~22 lessons, all ≤15 min, branched into 5 role tracks); a **controlled AI sandbox** (on-rails, multi-provider, injection-resistant); a **Toolbox** (email-gated artifact persistence); and a **freemium gate** (free Modules 0–3, a three-way fork after Module 3, paid Modules 4–5). A separate **$99 Readiness Assessment** sits both as an entry point and as the nurture destination for email leads.

## 2. Goals & success metrics

| Goal | Metric | Target (directional) |
|---|---|---|
| Prove value before paywall | Free-tier completion (reach end of M3) | ≥ 40% of starters |
| Convert at the gate | Free → paid OR free → email | ≥ 60% take *some* action at the gate |
| Capture leads | Email capture among non-buyers | ≥ 50% of "not yet" learners |
| Change behavior | **Toolbox reuse** (artifact re-opened/re-run ≥7 days post-creation) | tracked as headline L3 metric |
| Keep lessons digestible | Median lesson completion time | ≤ 15 min, no lesson exceeds it |
| Sandbox works | Sandbox task completion rate | ≥ 85% |

## 3. Non-goals (what this course is *not*)

- **No formal credential / certificate.** Completion is tracked but not marketed as a credential. (Revisit post-traction.)
- **No cohort / live facilitation.** Async-only.
- **No specialist/advanced tracks.** This is the Foundation course in its entirety; specialist depth is a separate course, reached via a link-out.
- **No open/free-form chat with the model.** All model interaction is through the controlled sandbox.
- **No handling of real customer data, PII, account numbers, or MNPI anywhere in the course** — by structural design, not policy alone.
- **No native mobile app.** Responsive web is sufficient.

## 4. Users & personas

### Learner tracks (content branches)
| Track | Roles | Comfort assumption |
|---|---|---|
| Risk & Compliance | Compliance, Risk | cautious, regulation-driven |
| Customer-Facing | Frontline, Retail, Lending | time-poor, non-technical |
| Back-Office Process | Operations, Marketing | process-minded |
| Technical | IT | higher comfort, governance lens |
| Leadership | Leadership | decision/ROI lens |

### Buyer personas (commercial)
- **Individual learner** ($295) — self-serve; buys for own upskilling.
- **Team admin / L&D buyer** ($199/seat, ≥10) — purchases seats, assigns, monitors progress.
- **Executive sponsor** — not a user; needs proof (dashboard rollups, time-saved) to justify spend.

## 5. Key user journeys

**J1 — Anonymous free learner**
View M0–M3 with no account/email → create artifacts in-session → hit gate after M3 → fork: (a) pay, (b) give email to keep artifacts, (c) decline. Email path → Toolbox unlocked for free artifacts → nurture toward $99 assessment.

**J2 — Buyer (individual)**
At gate → choose Individual → pay $295 → account created by the learner → M4–M5 unlock + unlimited Toolbox + persistent account.

**J3 — Team rollout**
Admin buys ≥10 seats → invites learners by email → each learner self-creates account → admin dashboard shows per-seat progress, sandbox activity, Toolbox creation (aggregate, privacy-respecting).

**J4 — Assessment-first entry**
Learner buys $99 assessment → completes it → profile written (track, tool exposure, comfort) → enters course pre-personalized.

## 6. Functional requirements

### 6.1 Curriculum & content engine
- **FR-C1** Support 6 modules / ~22 lessons; each lesson ≤15 min of content.
- **FR-C2** Per-lesson modality types: video (captioned + transcript), audio (transcript), interactive activity, controlled-sandbox activity, worksheet/template.
- **FR-C3** Lesson structure enforced as a template: Hook → Teach → Do → Take → Check.
- **FR-C4** **Role-track branching** at designated "applied" lessons (M1.3, M2.4, M3.5, M4.3); shared content elsewhere. Track is a learner attribute; branched lessons render the track variant.
- **FR-C5** Each lesson emits a knowledge-check (2–3 items); results logged for L2 measurement.
- **FR-C6** **Tier gating:** M0–M3 free (viewable without account/email); M4–M5 require a paid entitlement.
- **FR-C7** Content is authorable/updatable without code deploy (esp. M1.2 tool matrix — scheduled quarterly review).

### 6.2 Controlled AI sandbox *(technical centerpiece — see §10 for architecture)*
- **FR-S1 Provider abstraction.** One internal interface fronting Claude, OpenAI, and Gemini. Provider is swappable per lesson.
- **FR-S2 Learner-facing provider switcher.** Default provider per lesson (Claude primary); learner may switch model across vendors. Switching is *exposed and taught* (compare same prompt across models). Switching changes only *which* model, never the prompt assembly.
- **FR-S3 Controlled prompt assembly ("blinders").** The dispatched prompt = hidden system prompt (course-set, never shown/editable) + fixed task scaffold (lesson-set, not editable) + **bounded learner levers** (toggle role / format / examples / pick preset context blocks). Any free-text learner entry is inserted **as data into a labeled slot**, never as instruction.
- **FR-S4 Injection resistance.** Learner input is always untrusted data. System prompt is non-extractable and filtered from any output. No tool/function access from inside the sandbox. No retrieval of other learners' data.
- **FR-S5 Output gating.** Model responses pass a display filter before render: length caps, content screening, and removal of any leakage of the hidden system prompt.
- **FR-S6 A/B mode.** Render 2–3 configurations side-by-side for the prompt-structure lessons; visualize the diff.
- **FR-S7 Save-to-Toolbox.** Every output is savable (subject to entitlement/email — see 6.3).
- **FR-S8 No raw sensitive input possible.** Because inputs are bounded, learners cannot paste arbitrary PII/account data into controlled exercises. (This is the structural enforcement of the data-discipline rule.)
- **FR-S9 Rate limiting & cost control.** Per-learner request caps; provider cost budgeting; graceful degradation if a provider is unavailable (fall back to default).

### 6.3 Toolbox
- **FR-T1** Artifacts are created **in-session** during any module, including free ones.
- **FR-T2 Persistence requires identity.** No anonymous saving. Saving requires **either a paid account or a captured email**. Every save is a lead/identity event.
- **FR-T3** Free path: capped to the **4 light artifacts** (Data Discipline Card, AI Toolkit Map, First Conversation, Starter Prompt Pack).
- **FR-T4** Paid path: **unlimited, versioned** artifacts; the full Prompt Library unlocks; richer M4/M5 artifacts (Skill, Skill Template, Agent Blueprint, PRD, Prototype link, Problem Backlog).
- **FR-T5** Each artifact is versioned (edit history) and **exportable as `.md`**.
- **FR-T6** Artifacts are private to the learner; never shared by the system (no permission/sharing features — see §8 security).

### 6.4 Freemium gate & email capture
- **FR-G1** After M3, present the **three-way fork**: (1) Pay to continue, (2) Give email to keep free artifacts, (3) Decline.
- **FR-G2** Email path: validate email, persist the 4 free artifacts, register a **lead** record, and present the **$99 Readiness Assessment** nurture offer.
- **FR-G3** Marketing-consent must be explicit at email capture (compliance — see §8).
- **FR-G4** Gate analytics: log fork choice, drop-off, and downstream conversion.

### 6.5 Payments & entitlements
- **FR-P1** Products: Individual ($295, one seat), Team ($199/seat, **minimum 10 seats**), Readiness Assessment ($99).
- **FR-P2** Payment is processor-hosted (PCI scope minimized; the product never stores card data).
- **FR-P3** Purchase grants an **entitlement** that unlocks M4–M5 and unlimited Toolbox for the buyer (individual) or assigned seats (team).
- **FR-P4** **The learner creates their own account / sets their own password.** The system never creates accounts or sets credentials on a user's behalf.
- **FR-P5** Team purchase issues N seat invitations; each invitee self-registers.

### 6.6 Readiness Assessment (a standalone $99 product)
- **FR-A1 Instrument.** A **48-question** diagnostic scored across **8 dimensions** of AI readiness (multi-dimensional, not a single score).
- **FR-A2 Deliverables.** On completion the learner receives: (a) a **dimensional scorecard** across the 8 dimensions, (b) a **personalized plan**, (c) curated **ideas and prompts** they can use immediately, and (d) **CTAs** (next steps — into the free course, the paid course, or team purchase). These deliverables are what give the $99 product standalone value.
- **FR-A3 Profile handoff.** The assessment writes a **profile** keyed to learner identity (email): at minimum `track`, `tool_exposure`, `comfort_level`, plus the dimension scores. The course reads it to (conservatively) pre-select the track and tune the M1.3 branch.
- **FR-A4 Position.** The assessment may run before the course (entry point) **or** after the gate (the email-lead nurture destination). Same profile-handoff contract either way; when taken after the free course, it also enriches the lead for targeted upsell.

### 6.7 Team admin & dashboard
- **FR-D1** Seat management: invite, revoke, reassign seats (within purchased count).
- **FR-D2** Progress view: per-seat module/lesson completion, sandbox activity, artifact creation counts.
- **FR-D3** Aggregate rollups for the exec-sponsor story: completion %, est. time-saved (self-reported), skills built.
- **FR-D4** **Privacy guardrail:** the dashboard never exposes the *content* of a learner's artifacts or sandbox transcripts — only activity metadata.

### 6.8 Accounts & auth
- **FR-U1** Free viewing of M0–M3 requires no account.
- **FR-U2** Saving (email) or buying (account) establishes identity.
- **FR-U3** Auth supports email/password (user-set) and SSO/OAuth for existing accounts. The system never auto-authorizes password access on a user's behalf.

### 6.9 Analytics & instrumentation
- **FR-N1** Log events directly in **Supabase** (no third-party LMS / xAPI) for lesson views/completions, knowledge-check results, sandbox runs, artifact saves/reuse, and gate decisions.
- **FR-N2** Funnel analytics: assessment→free→email/pay paths, gate-fork distribution, conversion rates.
- **FR-N3** **Toolbox reuse tracking** as the headline behavior metric.

## 7. Non-functional requirements

### 7.1 Security & data discipline *(highest priority — this is the brand promise)*
- **NFR-SEC1** No PII, account numbers, customer data, or MNPI is collected, stored, or transmittable through any product surface. The sandbox's bounded inputs make raw-data entry structurally impossible in exercises.
- **NFR-SEC2** Prompt-injection resistance per FR-S4; the hidden system prompt is never recoverable.
- **NFR-SEC3** Learner data (email, profile, artifacts) encrypted at rest and in transit.
- **NFR-SEC4** No card data stored (processor-hosted payments).
- **NFR-SEC5** No system-initiated sharing of any learner content (no "share" features that could expand audience).

### 7.2 Privacy & compliance
- **NFR-PRIV1** Explicit, separate consent for marketing email at capture; honor unsubscribe.
- **NFR-PRIV2** Data-retention and deletion policy; learner can request export/delete of their data and artifacts.
- **NFR-PRIV3 Provider data posture (buyer-facing trust statement).** Banking buyers will ask whether learner input is used to train or is retained by the AI vendors. The answer rests on two pillars: (1) **by design, no customer data can be entered** — the sandbox's bounded inputs make raw PII/account data physically impossible to submit; and (2) providers are accessed via their **commercial APIs**, which (unlike consumer apps) generally do not train on inputs and offer no-/limited-retention terms. **Action:** confirm each vendor's *current* commercial data terms from their docs and publish a one-page posture for buyers. (Verify before publishing — vendor terms change.)

### 7.3 Accessibility
- **NFR-A11Y1** WCAG 2.1 AA. Captions + transcripts on video; transcripts on audio; keyboard-navigable interactives and sandbox; sufficient contrast.

### 7.4 Performance & reliability
- **NFR-PERF1** Sandbox first-token latency target < 3s p50; full content pages < 2s load.
- **NFR-REL1** Provider failover (FR-S9); no single-provider outage blocks a lesson.

## 8. Data model (core entities)

| Entity | Key fields | Notes |
|---|---|---|
| **Learner** | id, email, auth, track | email may exist before a full account (lead) |
| **Profile** | learner_id, track, tool_exposure, comfort_level | written by assessment; read by course |
| **Entitlement** | learner_id, product, seat_id?, status, expiry? | unlocks paid content |
| **Team** | id, admin_id, seats_purchased | ≥10 |
| **Seat** | team_id, learner_id?, status | invite/assign/revoke |
| **Module / Lesson** | id, tier(free/paid), track_variant?, modality | content engine |
| **KnowledgeCheck / Result** | lesson_id, learner_id, score | L2 metric |
| **SandboxSession** | learner_id, lesson_id, provider, levers[], output_ref | no raw sensitive data |
| **ToolboxItem (Artifact)** | learner_id, type, version[], md_export | email- or entitlement-gated |
| **Lead** | email, source(gate), consent, nurture_state | created at email capture |
| **AssessmentResult** | learner_id, dimension_scores[], plan, ideas[], prompts[] | 48-question diagnostic; feeds Profile (see 6.6) |
| **Event** | actor, action, object, timestamp | analytics spine — logged in Supabase (no third-party LMS) |

## 9. Integrations & stack

**Build approach:** a **custom, self-built web app** (no third-party LMS, no xAPI). The app owns content delivery, gating, the sandbox, the Toolbox, and analytics directly.

| Component | Choice | Purpose |
|---|---|---|
| **Database / auth / storage** | **Supabase** (Postgres) | Canonical store of record — learners, profiles, entitlements, Toolbox artifacts, leads, events; learner auth; artifact/media storage; row-level security |
| **Transactional email** | **Resend** | System emails — gate email verification, team-seat invites, receipts, password resets, assessment delivery |
| **Marketing / nurture** | **MailerLite** | The lead nurture sequence (the "not yet → email" path → $99 assessment), broadcasts, automations |
| **LLM providers** (Anthropic / OpenAI / Google) | via commercial APIs | Sandbox model responses, behind the provider gateway (§10); accessed under commercial terms (no-train; see §7.2) |
| **Payments** | *processor TBD — Stripe is the natural Supabase pairing* | $99 / $295 / $199-seat hosted checkout; no card storage |
| **Builder tools** (Lovable / Replit / Claude Code) | link-out | The M5 prototype step; not embedded; learners use their own accounts |

**Data flow note:** the lead captured at the gate is written to **Supabase** (the record of truth) and synced to **MailerLite** (the nurture engine). Resend handles one-to-one system mail; MailerLite handles list-based marketing.

## 10. Technical architecture (overview)

```
                         ┌─────────────────────────────────────┐
   Learner (browser) ──► │  Custom web app                      │
                         │  (content, lessons, gate, Toolbox,   │
                         │   dashboard) · tier + role gating    │
                         └───────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┼───────────────────────────┐
        ▼                                ▼                            ▼
┌──────────────────┐         ┌────────────────────┐       ┌────────────────────┐
│  Supabase         │        │  Sandbox Service    │       │  Resend (system) + │
│  Postgres · auth ·│        │  ── provider gateway│       │  MailerLite (nurt.)│
│  storage · RLS    │        │  ── prompt assembler│       └────────────────────┘
│  learners·profiles│        │  ── output gate     │
│  entitlements·    │        │  ── injection guard │
│  toolbox·leads·   │        └─────────┬───────────┘
│  events (analytics)│                  ▼
└──────────────────┘        ┌─────────┬─────────────┬──────────┐
                            │ Claude  │   OpenAI    │  Gemini   │  (swappable)
                            └─────────┴─────────────┴──────────┘
```

**Sandbox Service** is the security boundary. It owns the hidden system prompt, assembles the controlled prompt from bounded learner levers, selects the provider (default or learner-switched), enforces injection resistance, and gates output. The web app never talks to a provider directly.

## 11. Course scope — the complete Foundation course

This PRD specifies the Foundation course **in its entirety** as a single, cohesive deliverable — not a phased product rollout. Everything below is in scope and developed as one body of work:

| Component | Scope |
|---|---|
| **Modules** | All 6 (M0–M5) — Orientation, Awareness, Access & Workflow, Prompting, Skills, Build |
| **Lessons** | ~22, every one ≤15 min, each following Hook → Teach → Do → Take → Check |
| **Role tracks** | All 5, branched at the applied lessons (M1.3, M2.4, M3.5, M4.3) |
| **Controlled sandbox** | One environment, reused M2 → M5; provider-agnostic with learner switcher |
| **Toolbox & takeaways** | All ~11 artifact templates, light (free) through rich (paid), `.md` exportable |
| **Readiness Assessment** | Designed and integrated as both entry point and email-lead destination |
| **The gate** | The three-way fork after M3 — a *commercial* design within one complete course, not a release boundary |

The free/paid split (M0–M3 free, M4–M5 paid) is a **monetization gate inside a finished course**, not a reason to build the course in stages. The whole course is designed, produced, and shipped together.

## 12. Course production plan (ADDIE → Development)

The work of *producing* the complete course, in dependency order. This is course-development sequencing, not software releases — the course goes live as a whole.

1. **Storyboard the full course.** Lock learning objectives, lesson scripts/storyboards for all ~22 lessons across all 5 tracks, knowledge checks, and the takeaway artifact for each. (ADDIE Design → Development handoff.)
2. **Build the controlled sandbox.** Provider gateway + prompt assembler + output gate + injection guard — the technical spine reused across M2–M5. Build/validate first because every interactive depends on it.
3. **Produce the media.** Record and edit the ~12 video and ~2 audio lessons; caption + transcribe all.
4. **Build the interactives.** The on-rails sandbox activities (first conversation, A/B prompting, spot-the-violation), the skill/agent builders, and the worksheets.
5. **Assemble the Toolbox.** Author the ~11 takeaway templates; wire artifact creation, versioning, `.md` export, and email/entitlement-gated persistence.
6. **Integrate assessment + gate.** The Readiness Assessment, the profile handoff, and the three-way gate fork with email capture.
7. **QA the whole course.** Verify every lesson ≤15 min, every track branch renders, every takeaway saves, data-discipline holds throughout, accessibility (WCAG 2.1 AA).
8. **Pilot the complete course** with one friendly community bank / credit union; gather formative feedback (Evaluation 5.1 in the ADDIE doc) and refine before broad release.

## 13. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Prompt injection / system-prompt leak in sandbox | Brand/security failure | Bounded levers, input-as-data, output gating, non-extractable system prompt; security review before pilot |
| LLM cost runaway | Margin erosion | Per-learner rate caps, default-provider economics, cost budgeting/alerts |
| Free tier cannibalizes paid | Low conversion | Clear value step-up across gate; the *build* modules and unlimited Toolbox are paid-only |
| Banking buyers reject data handling | Lost deals | No-PII-by-design, documented provider data terms, no customer data anywhere |
| Tool landscape drifts (M1.2) | Stale content | Content authorable without deploy; scheduled quarterly refresh |
| Provider outage mid-lesson | Broken experience | Multi-provider failover (FR-S9) |

## 14. Decisions (resolved) & remaining items

**Resolved:**
1. **Build approach — custom, self-built app.** No third-party LMS, no xAPI. Events logged directly in Supabase. Sandbox embedded in the app.
2. **Stack — Supabase (DB/auth/storage) + Resend (transactional email) + MailerLite (nurture).** Lead written to Supabase, synced to MailerLite. (See §9.)
3. **Assessment deliverables — 48 questions, 8 scored dimensions**, producing a dimensional scorecard + a personalized plan + curated ideas/prompts + CTAs. (See §6.6.)
4. **Provider data posture — answered by design** (bounded inputs prevent customer data; commercial APIs don't train on inputs). Buyer-facing one-pager to be confirmed against current vendor terms. (See §7.2.)

**Remaining:**
- **Payment processor** not yet chosen — Stripe is the natural Supabase pairing; confirm before building checkout.
- **Hosting target** for the app itself (e.g., Vercel/Netlify for the frontend; Supabase hosts the backend).

## 15. Glossary
- **Blinders** — the controlled-prompt design that lets learners manipulate bounded levers but never the underlying system prompt.
- **Toolbox** — the learner's persistent, versioned library of created artifacts.
- **Gate** — the three-way fork after Module 3 (pay / email / decline).
- **Track** — one of five role-based content branches.
- **Light vs rich artifact** — free-tier single takeaways vs paid-tier multi-artifact outputs.
