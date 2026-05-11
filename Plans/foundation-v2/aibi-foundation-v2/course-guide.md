# AiBI-Foundation v2
## Master Course Guide

*Architecture, design philosophy, and rollout reference.*

**Version:** 2.0
**Last updated:** 2026-Q2
**Major change from v1:** Activities-driven, API-powered, expanded module set, three new tracks (Foundation Lite, Manager, Board).

---

## 1. What changed from v1 (and why)

| Decision in v1 | Decision in v2 | Why |
|---|---|---|
| Video-led modules | **Activities-driven, video minimal or eliminated** | Bankers learn by doing. Video doesn't transfer to behavior. |
| Single tool (M365 Copilot Chat) | **Multi-model API-powered platform: Claude, ChatGPT, Gemini, plus M365 Copilot** | Comparison teaches judgment; one tool teaches dependence. |
| 12 modules / 6.8 hours | **Foundation Full: 20 modules / ~9.5 hours** | Adds Cybersecurity, Talking About AI With Members, Spreadsheets, Vendor Pitches, Incident Response, Examiner Q&A, How AI Got Here, Safe AI Use split |
| One credential | **Four tracks: Foundation Lite, Foundation Full, Manager, Board Briefing** | Right-size the credential to the audience |
| Final Lab as the only certifying artifact | **Each activity produces a daily-use outcome; Final Lab is the integration test** | Every minute of the course produces something the learner keeps |

---

## 2. The four tracks at a glance

| Track | Audience | Modules | Duration | Outcome |
|---|---|---|---|---|
| **Foundation Lite** | Every employee. Tellers, vault, custodial, board members for orientation, seasonal staff. Mandatory bank-wide. | 4 | ~90 min | Literacy + safe-use baseline |
| **Foundation Full** | Anyone who'll actually use AI for work. Customer-facing, back-office, lending, compliance, finance, ops. | 20 | ~9.5 hrs | A practitioner with a tested Personal Prompt Library and certifying Lab Package |
| **Manager Track** | Anyone supervising staff who use AI | 3 | ~90 min | Coaching capability + library review skill |
| **Board Briefing** | Directors, audit committee, board observers | 2 | ~60 min | Governance vocabulary + question playbook |

Foundation Lite is a hard prerequisite for Foundation Full. Foundation Full is a prerequisite for AiBI-Specialist and AiBI-Leader.

---

## 3. The pedagogy: activities, not videos

Every module follows this structure:

```
Module = 3–5 activities
Each activity =
   1–2 min: Setup (text, no video)
   bulk:    The activity (API-powered, hands-on)
   1–2 min: Capture (outcome added to a personal artifact)
```

Video appears only as: (a) optional 60-second "what is this module" intros, (b) optional "how to use the platform" mechanics. Never as primary instruction. **Most learners can complete modules without watching any video.**

See `activity-pattern.md` for the full pedagogical specification.

### The eight activity types

| # | Type | What the learner does | Example |
|---|---|---|---|
| 1 | **Single-model prompt** | Writes a prompt; one model responds | "Write your first member email rewrite prompt" |
| 2 | **Multi-model comparison** | Same prompt, 3 models in parallel, learner compares | "Same prompt to Claude, ChatGPT, Gemini — pick best, merge, capture" |
| 3 | **Sorting / classification** | Drag items into categories with adaptive feedback | "Sort 20 banking artifacts into the four data tiers" |
| 4 | **Adaptive scenario** | Branching choices with consequences | "An examiner asks X — pick your answer; see what they ask next" |
| 5 | **Build & test** | Build something (prompt, project, workflow); platform tests it | "Write a system prompt; the platform runs adversarial inputs against it" |
| 6 | **Find the flaw** | Given AI output, identify what's wrong | "Three AI responses — one has a planted hallucination — find it" |
| 7 | **Tabletop simulation** | Walk through a scenario step-by-step | "A teller pasted NPI into ChatGPT — what happens next?" |
| 8 | **Real-world capture** | Bring real (sanitized) work; do real work in the platform | "Paste your messiest real email; rewrite it under guidance" |

---

## 4. The platform requirements

The course requires a custom learning platform that exposes:

- **Multi-model API access** (Claude, ChatGPT, Gemini, M365 Copilot via Microsoft Graph where available)
- **Side-by-side comparison UI** for activity type 2
- **Drag-and-drop classification UI** with adaptive feedback for type 3
- **Branching scenario engine** for types 4 and 7
- **Adversarial test runner** for type 5 (the platform sends prompt-injection or stress-test inputs to the learner's system prompt and shows results)
- **Verification step capture** — every output the learner saves includes a verification log
- **Personal artifact store** that follows the learner across modules, builds the Personal Prompt Library, and is exportable

See `platform/platform-requirements.md` for the technical brief.

**Critically:** the course platform is the learner's **lab environment** — it provides API access to multiple models for *educational purposes only*. Real-world work uses the bank's approved tools (M365 Copilot Chat etc.). The course teaches *patterns*, not platform dependence.

---

## 5. Foundation Full module map (20 modules)

### Pillar A — Awareness (4 modules · 90 min)

| # | Title | Min | Primary activity type | Daily-use outcome |
|---|---|---|---|---|
| 1 | AI for Your Workday | 20 | Multi-model comparison | First Rewritten Member Communication; multi-model preference note |
| 2 | What AI Is and Is Not | 25 | Find the flaw + Hallucination Lab | Hallucination Catch Log entry; verification habit established |
| 3 | How AI Got Here, in Plain English | 20 | Adaptive scenario timeline | "What this means for my bank" briefing card (1 page) |
| 4 | Safe AI Use I — Data and the Five Never-Do's | 25 | Sorting / classification | Personal Data-Tier Routing Card |

### Pillar B — Understanding (6 modules · 150 min)

| # | Title | Min | Primary activity type | Daily-use outcome |
|---|---|---|---|---|
| 5 | Cybersecurity & AI Threats | 30 | Build & test (prompt-injection lab) + Find the flaw (deepfake recognition) | Voice-Verification Protocol; Prompt-Injection Defense Card |
| 6 | Talking About AI With Members | 20 | Adaptive scenario (member dialogues) | Member-Conversation Script Cards (5) |
| 7 | Safe AI Use II — Regulatory Landscape | 30 | Adaptive scenario (regulator routing) | First-Call List + scenario-routed crosswalk |
| 8 | Prompting Fundamentals | 30 | Multi-model comparison (same prompt across models) | Prompt Strategy Cheat Sheet (multi-model annotated) |
| 9 | Your AI Work Profile | 20 | Build & test (task fit calculator) | AI Work Profile with top-3 candidates |
| 10 | Projects and Context | 20 | Build & test (multi-platform project build) | First Project Brief, deployable in 2 platforms |

### Pillar C — Creation (5 modules · 150 min)

| # | Title | Min | Primary activity type | Daily-use outcome |
|---|---|---|---|---|
| 11 | Document Workflows | 30 | Multi-model document Q&A | Document Workflow Prompt + model-strength notes |
| 12 | Spreadsheet Workflows | 30 | Build & test (Excel + AI lab) | Three reusable Excel/AI patterns |
| 13 | AI Tools Comparison Lab | 30 | Multi-model comparison (one big task across all four tools) | Personal Tool Choice Map (evidence-based) |
| 14 | Agents and Workflow Thinking | 30 | Build & test (workflow builder) | Workflow Map + first low-code agent design |
| 15 | Vendor Pitch Decoder | 30 | Find the flaw (real vendor pitch decks) | Vendor Evaluation Scorecard |

### Pillar D — Application (5 modules · 180 min)

| # | Title | Min | Primary activity type | Daily-use outcome |
|---|---|---|---|---|
| 16 | Role-Based Use Cases | 40 | Real-world capture (10 role families) | Role Use-Case Card |
| 17 | Personal Prompt Library | 30 | Build & test (library stress-tested across models) | Personal Prompt Library, ≥5 entries, multi-model verified |
| 18 | Incident Response Drill | 30 | Tabletop simulation | Incident Response Checklist + draft notification template |
| 19 | Examiner Q&A Practice | 20 | Adaptive scenario (simulated examiner) | Examiner Q&A Prep Card |
| 20 | Final Practitioner Lab | 60 | All eight types, integrated | Final Lab Package + library updated |

**Total: 570 min · 9.5 hrs**

---

## 6. Foundation Lite module map (4 modules · 90 min)

For staff who need literacy and safe-use baseline only — not skill-building.

| # | Title | Min | Activity |
|---|---|---|---|
| L1 | AI for Your Workday | 20 | Single multi-model prompt activity |
| L2 | What AI Is, Is Not, and How to Spot a Lie | 25 | Find the flaw lab (combines Module 2 + cyber awareness) |
| L3 | Safe AI Use — Your Five Never-Do's | 20 | Sorting + scenario activity |
| L4 | Talking to Members + Recognizing AI Threats | 25 | Adaptive scenario (member dialogue + voice phishing recognition) |

Lite graduates can later upgrade to Full by completing modules 3, 5–20.

---

## 7. Manager Track module map (3 modules · 90 min)

Prerequisite: Foundation Full (or Foundation Lite + 6 months supervisory experience).

| # | Title | Min | Activity |
|---|---|---|---|
| M1 | Coaching Your Team's AI Use | 30 | Adaptive scenario (1:1 coaching role-play) |
| M2 | Reading and Reviewing a Personal Prompt Library | 30 | Find the flaw (review 3 sample team libraries) |
| M3 | Spotting Misuse and Closing the Loop | 30 | Tabletop simulation (escalation drills) |

---

## 8. Board Briefing module map (2 modules · 60 min)

For directors. No prerequisites.

| # | Title | Min | Activity |
|---|---|---|---|
| BB1 | AI in Banking — What You Need to Know as a Director | 30 | Adaptive scenario (board-meeting question types) |
| BB2 | Governance Questions Every Director Should Ask | 30 | Build & test (question playbook builder) |

---

## 9. The artifact spine (now expanded)

The Personal Prompt Library remains the spine. New artifacts feed into it.

```
Lite     →  Member Communication
            Hallucination Catch Log
            Data-Tier Routing Card
            Member-Conversation Script Cards (5)
            Voice-Verification Protocol
            Personal Threat Awareness Card

Full      →  All Lite artifacts plus:
            "What this means for my bank" briefing card
            Prompt-Injection Defense Card
            First-Call List
            Regulatory crosswalk (annotated by learner)
            Prompt Strategy Cheat Sheet (multi-model)
            AI Work Profile
            Project Brief (×N)
            Document Workflow Prompt (×N)
            Spreadsheet/AI Patterns (×3)
            Personal Tool Choice Map
            Workflow Map (×N)
            Agent Design Sketch
            Vendor Evaluation Scorecard
            Role Use-Case Card
            Personal Prompt Library (≥5 entries, multi-model tested)
            Incident Response Checklist
            Examiner Q&A Prep Card
            Final Practitioner Lab Package

Manager  →  Coaching Conversation Pack
            Library Review Worksheet (per direct report)
            Escalation Decision Card

Board    →  Board AI Vocabulary Card
            Director Question Playbook (15 questions)
```

---

## 10. Multi-model usage and the data-tier rules

Critical principle that pervades v2: **the platform's API access is for the learning environment, not for real bank work.**

### What's safe in the course platform

The platform is sandboxed. Activities use synthetic data (pre-stripped, marked as such). Learners work with Claude, ChatGPT, Gemini, etc. *for educational purposes*. No real bank data enters the platform.

### What learners apply at the bank

The bank's *approved* tools — typically M365 Copilot Chat (commercial data protection) on the work account, plus whatever specialist tools the bank has reviewed. The course teaches the *pattern*; the bank's tool inventory determines the application.

### Why this distinction matters

A community bank that hasn't yet rolled out M365 Copilot tenant-grounded paid Copilot can still send staff through Foundation. Learners gain real skill in a sandbox; they apply within the bank's approved boundaries when they return to work.

### The course is explicit about this in every module

Every activity that uses Claude/ChatGPT/Gemini in the platform includes a "back at the bank" callout: *"In the platform you used [model X]. At your bank, the equivalent approved tool is [Copilot Chat] for [data tier], or [paid M365 Copilot] for [Confidential]. Apply this pattern there."*

---

## 11. Pricing and positioning shift

| Track | v1 price | v2 price | Why |
|---|---|---|---|
| Foundation Lite | n/a | $99 / learner | New track |
| Foundation Full | $295 | $495 / learner | 40% more content; activities platform; multi-model APIs |
| Manager Track | n/a | $195 / supervisor | New track |
| Board Briefing | n/a | $295 / director (or $1,495 flat board rate) | New track |

Volume pricing for institution-wide deployment.

---

## 12. Refresh cadence (unchanged from v1)

Quarterly. With multi-model platform, the refresh expands:

- Re-test every multi-model activity against current model behavior (model versions update; activities calibrated against current outputs)
- Update planted-error scenarios (so they don't go stale)
- Refresh vendor pitch deck library (Module 15)
- Refresh examiner Q&A scenarios with any new regulatory developments
- Re-record any (now minimal) screen-recording videos

---

## 13. Asset locations

```
/aibi-foundation-v2/
├── course-guide.md                       ← this file
├── activity-pattern.md                   ← pedagogy specification
├── modules/
│   ├── foundation-full/                 (20 module specs)
│   ├── foundation-lite/                 (4 module specs)
│   ├── manager-track/                   (3 module specs)
│   └── board-briefing/                  (2 module specs)
├── artifacts/                           (all artifact templates)
├── platform/
│   └── platform-requirements.md         ← technical brief for platform team
└── positioning/
    └── foundation-positioning.md
```

---

*The AI Banking Institute · AiBI-Foundation v2 Master Course Guide · v2.0*
