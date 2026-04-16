# The AI Banking Institute — AiBI-P Course

## What This Is

The AI Banking Institute (AiBI) website is an AI proficiency and transformation platform for community banks and credit unions. The existing site includes a free AI readiness assessment, certification catalog, exam infrastructure, and marketing pages. This milestone adds the first paid course — AiBI-P (Banking AI Practitioner) — a self-paced, 9-module online course that teaches every staff member at a community FI how to use AI tools safely and professionally.

## Core Value

The AiBI-P course must be completable on mobile in under 5.5 hours, produce 5 tangible artifacts the learner keeps, and culminate in an assessed work product that earns the AiBI-P credential — not a test score, but a demonstration of professional capability.

## Current Milestone: v1.0 First Course — AiBI-P (Banking AI Practitioner)

**Goal:** Build the complete AiBI-P course experience within the existing Next.js site, covering all 9 modules across 4 pillars (Awareness, Understanding, Creation, Application), with onboarding routing, interactive activities, downloadable artifacts, assessed work product submission, reviewer workflow, certificate delivery, and Stripe checkout.

**Target features:**
- 3-question onboarding branch that routes platform-specific content throughout
- 9-module course shell with forward-only progress, resume functionality, mobile-first
- Interactive activities per module (forms, drills, skill builders, inventories)
- 5 downloadable artifacts (Regulatory Cheatsheet, Acceptable Use Card, Skill Template Library, My First Skill, Platform Feature Reference Card)
- Skill builder interface with 5-component fields and .md export
- 4-item assessed work product submission with file upload
- Reviewer queue with 5-dimension rubric scoring (Accuracy hard gate)
- Certificate generation via Accredible, verification endpoint, LinkedIn badge
- Stripe checkout ($79 individual, ~$63/seat institution at 5+)
- 9 Plausible analytics events
- ConvertKit tags and HubSpot property updates on enrollment/certification

## Requirements

### Validated

- Assessment flow (8 questions, scoring, email gate) — shipped in Phase 1 prototype
- Exam infrastructure (40-question bank, 12 per attempt, 5 topics) — shipped in Phase 1 prototype
- Certification catalog page — shipped in Phase 1 prototype
- Content versioning architecture (`/content/` folder pattern) — shipped in Phase 1 prototype
- Homepage with 8-section marketing funnel — shipped in Phase 1 prototype

### Active

- [ ] AiBI-P course: 9 modules, 4 pillars, onboarding branch, activities, artifacts, assessment, certificate
- [ ] Stripe checkout for $79 individual and institution bundle pricing
- [ ] Course progress tracking and resume functionality
- [ ] Reviewer workflow for assessed work products
- [ ] Certificate generation and verification

### Out of Scope

- Kajabi LMS migration — Phase 2, build course to be migration-ready but deliver on Next.js first
- AiBI-S and AiBI-L courses — future milestones
- Executive Briefing deep assessment (30-40 questions) — separate from course, future milestone
- Real-time chat or video content — not in AiBI-P spec
- Dark mode — per designer brief, explicitly excluded
- Copilot Studio deployment of skills — enterprise feature, not AiBI-P scope

## Context

- Existing Next.js 14 app with App Router, TypeScript strict, Tailwind CSS
- Content-first architecture: questions, scoring, certifications in `/content/` folder
- Assessment already has sessionStorage persistence pattern (reusable for course progress)
- Supabase for data persistence, Stripe for payments, ConvertKit for email sequences
- PRD specifies Phase 1 delivery at `/courses/aibi-p` within the Next.js site
- Course content must be structured for future Kajabi migration without rebuilding
- Free 12-question assessment (rotating from 40-50 pool) is the top of funnel — PRD upgrades from current 8-question fixed set
- $79 price point per PRD (supersedes $97 reference in earlier CLAUDE.md for this specific product)

## Constraints

- **Mobile-first**: Full course completable on iPhone Safari without horizontal scrolling. 14pt minimum on 390px viewport.
- **Accessibility**: WCAG 2.1 AA. Keyboard operable, 4.5:1 contrast, alt text, captions if video used.
- **Content separation**: Module content in `/content/courses/aibi-p/` — not hardcoded in components.
- **Brand system**: Terracotta/parchment, Cormorant/DM Sans/DM Mono typography, pillar color discipline (Sage=Awareness, Cobalt=Understanding, Amber=Creation, Terra=Application).
- **No test score**: Certificate awarded by assessed work product rubric, not exam score.
- **Forward-only**: Learners cannot go back to change answers once submitted.
- **Accuracy hard gate**: Rubric score of 1 on Accuracy = automatic fail regardless of total.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phase 1 delivery on Next.js, not Kajabi | Kajabi integration is Phase 2; ship faster on existing stack | -- Pending |
| $79 individual / ~$63 institution pricing | PRD v2.0 spec, validated against market | -- Pending |
| Skill submission as assessment (not test score) | Demonstrates real capability, not memorization | -- Pending |
| Forward-only module progression | Prevents score inflation and second-guessing | -- Pending |
| Content in /content/courses/aibi-p/ | Matches existing content architecture pattern | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-15 after milestone v1.0 initialization*
