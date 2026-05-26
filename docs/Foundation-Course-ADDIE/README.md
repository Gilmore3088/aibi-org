# AiBI Foundation — Current Document Set
*This folder holds the canonical, up-to-date documents. If anything elsewhere conflicts, these win.*

| File | What it is | Authority |
|---|---|---|
| `AiBI_Start_Here.md` | **Read this first.** Team orientation: what each doc is for, who reads it when, role-specific reading paths, conflict-resolution rules | **Entry point for new team members** |
| `AiBI_Foundation_Course_ADDIE_Design_v2.md` | Instructional design — course architecture, modules, gate, sandbox philosophy, evaluation | **Source of truth for design** |
| `AiBI_Foundation_PRD.md` | Product/engineering requirements — features, data model, stack, assessment spec, decisions | **Source of truth for build** |
| `AiBI_Foundation_Interactive_Overview.html` | Visual, clickable product overview (open in a browser) | Derived from the two specs above |
| `AiBI_Launch_Checklist.md` | Zero-to-launch execution plan across all workstreams | Derived from the two specs above |
| `AiBI_Module_Production_Tracker.md` | Per-module curriculum build needs + status (companion to the launch checklist) | Derived; tracks curriculum production |
| `AiBI_Module_PRDs.md` | Module-level build specs for all 6 modules (the engineering spec layer) | Derived; per-module requirements |
| `AiBI_Sandbox_Service_Tech_Spec.md` | Backend technical spec for the controlled AI sandbox — Exercise model, prompt assembly, provider gateway, output gating, security tests | **Source of truth for sandbox implementation** |
| `AiBI_Database_Schema_RLS_Spec.md` | Concrete Postgres schema + RLS policies for every learner-data table, the identity ladder (anon → lead → learner), migration order, acceptance gates | **Source of truth for database** |
| `AiBI_Auth_Entitlements_Spec.md` | Server-side flow for identity transitions, gate fork endpoints, Stripe checkout + webhook, team-seat lifecycle, marketing consent | **Source of truth for auth + payments flow** |
| `AiBI_Technical_Design_Doc.md` | Top-level engineering blueprint — stack, service boundaries, repo layout, environments, env vars, API surface, CI/CD, build sequence | **Source of truth for engineering architecture** |
| `AiBI_Design_System_Spec.md` | The visual + interaction language: Ledger tokens, typography, components, accessibility, voice, forbidden patterns | **Source of truth for UI kit** |
| `AiBI_Screen_Inventory_Spec.md` | Every screen we build + the flows that connect them, state checklist, mobile considerations, build order | **Source of truth for screens + flows** |
| `AiBI_Security_Privacy_Spec.md` | Consolidated security + privacy: data classes, structural enforcement, prompt-injection test plan, the honest posture, OWASP mapping, retention + deletion, incident response | **Source of truth for security posture** |
| `AiBI_Module_0_Orientation.md` | Detailed curriculum for Module 0 (scripts, exercises, takeaway) — the template for all modules | Detailed spec |
| `AiBI_LMS_Mockup_Module0.html` | Clickable LMS interface mockup with Module 0 fully wired (open in a browser) | Visual prototype |
| `AiBI_Handoff_Docs_Checklist.md` | What dev/design/PM docs still need writing before build, with priority (P1–P3) and recommended order | Derived; gap checklist |

**Confirmed tools:** Stripe (payments) · Supabase (DB/auth/storage/events) · MailerLite (all other email) · LLM APIs (Anthropic default + OpenAI + Gemini, sandbox only).

**Superseded — do not use:** `AiBI_Foundation_Course_ADDIE_Design.md` (the original v1, pre–blank-slate redesign).

*Detailed per-module curriculum docs are added here as they're produced (M0 done; M1–M5 to come), one module at a time on a shared lesson template. Track production status in `AiBI_Module_Production_Tracker.md`.*

**Documentation layers:** Course PRD (whole product) → Module PRDs (per-module build specs) → Module curriculum docs (per-module learner content). Specs are consolidated; content is per-module file.
