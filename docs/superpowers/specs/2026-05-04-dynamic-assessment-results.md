# Dynamic Assessment Results Experience

**Status:** Spec captured · not yet planned
**Owner:** James Gilmore (PRD), Claude (planning + implementation)
**Captured:** 2026-05-04
**Tracking issue:** TBD (filed alongside this spec)

> **The big idea:** Stop building an assessment result page. Build a mini AI consultant. The static score + dimension breakdown shipped in V1 (`content/assessments/v2/`) is a diagnostic, not a recommendation engine. This spec turns the post-completion screen into a personalized AI transformation brief that drives conversion into AiBI-P (primary) or readiness/advisory (secondary).

---

## Product goal

Transform a static assessment result into a personalized brief that:
1. Diagnoses the institution clearly
2. Creates urgency and clarity
3. Recommends a specific next move
4. Drives conversion into AiBI-P (primary) or readiness/advisory (secondary)

## User

- **Primary:** Community bank / credit union employee (ops, exec, compliance, etc.)
- **Secondary:** Decision-makers evaluating AI readiness

## Core experience summary

User completes assessment → lands on a dynamic, personalized dashboard that:
- Feels tailored to their institution
- Shows where they stand
- Explains what that means
- Gives a clear first move
- Provides a 7-day plan
- Pushes them into the right product path

---

## User flow (A → Z)

1. **Landing page** — CTA: "Take the 3-minute AI Readiness Assessment"
2. **Assessment flow** — questions (scored) + optional first name, email, institution, interest radio
3. **Submit** — backend calculates score (0–48), tier, top 3 gaps, strengths; builds **User Profile Object**
4. **Redirect → Results experience**

### User Profile Object (the contract)

```json
{
  "score": 20,
  "tier": "Starting Point",
  "persona": "Unstructured Explorer",
  "institution": "First Central Bank",
  "interest": "Education",
  "top_gaps": [
    "Quick Win Potential",
    "Training Infrastructure",
    "Security Posture"
  ],
  "strengths": ["Leadership Buy-In"]
}
```

This object drives **all** UI + content rendering.

---

## Frontend (design PRD)

### Section 1 — Hero (Diagnosis)
- **Layout:** Left = headline + subtext · Right = score card
- **Headline:** `"{Institution} is in the Unstructured AI Phase"` (else `"Your institution is in the Unstructured AI Phase"`)
- **Score card:** Score `20 / 48` · Tier badge · (future) percentile

### Section 2 — What this means
- 3–4 dynamic bullet insights
- Example: *Staff likely experimenting without guardrails · AI not producing consistent time savings · No formal training or governance structure*
- Tone varies by tier

### Section 3 — Gap breakdown (card grid)
- 3 cards (top gaps)
- Each card: title (gap name) · score · short dynamic explanation
- Example: *Quick Win Potential — Your institution has not yet identified a low-risk workflow where AI can immediately save time.*

### Section 4 — Your fastest ROI opportunity (highlight block) — **most important**
- Dynamic recommendation based on tier + top gap
- Example: *"Start with Meeting Summary Automation. Risk level: Low. Time saved: ~60 min per meeting. Owner: Ops / Admin"*
- CTAs: `[Copy Starter Prompt]` `[Try This Now]`

### Section 5 — Interactive prompt block
- Code-style box
- Buttons: Copy · Open in ChatGPT

### Section 6 — 7-day action plan (timeline)
- Horizontal or vertical timeline
- Dynamic based on tier

### Section 7 — Future state (aspiration)
- *What a Practitioner-Ready Institution looks like:* Daily AI usage in internal workflows · Standardized prompts · Human review processes · Measurable time savings

### Section 8 — Recommended path (conversion)
- Dynamic routing — e.g., low score + Education interest → AiBI-P card
- AiBI-P card: 12 modules · Real workflows · Prompt systems · SAFE framework · CTA `Start Practitioner Training`
- Alternate: Executive briefing · Advisory

### Section 9 — CTA footer
- "Get Full AI Transformation Plan"
- "Book Executive Briefing"

---

## Backend (dev PRD)

### 1. Scoring engine
- Input: assessment answers
- Output: `total_score`, `dimension_scores`

### 2. Tier mapping
```ts
if (score <= 24) tier = 'Starting Point';
else if (score <= 36) tier = 'Emerging';
else tier = 'Advanced';
```

### 3. Gap detection
- Sort dimensions ascending → take bottom 3

### 4. Persona mapping
```ts
if (score <= 24) persona = 'Unstructured Explorer';
// ... + Emerging, Advanced personas
```

### 5. Recommendation engine (rules-based)
```ts
if (top_gap === 'Quick Win Potential') {
  recommendation = 'Meeting Summaries';
}
// ... + one rule per gap × tier combination
```

### 6. Content generation — two approaches

- **Option A (fast MVP):** Pre-written templates with variable injection
- **Option B (advanced):** LLM generation with structured prompt

Example LLM prompt:
> Generate a personalized AI readiness explanation for a community bank. Inputs: Tier: Starting Point · Score: 20 · Gaps: Quick Win Potential, Training Infrastructure · Institution: First Central Bank. Output: 3 bullet insights + 1 paragraph explanation.

### 7. Institution handling
- If provided → inject into headline, recommendations, context
- Future: enrich with FDIC API

### 8. State management
- Store results in Supabase
- Associate with email

### 9. Share / export (Phase 2)
- Generate PDF
- Email results

---

## Data model (simplified)

```
users
- id
- email
- institution

assessments
- id
- user_id
- score
- tier
- persona

results
- id
- assessment_id
- top_gaps
- recommendation
```

---

## Success metrics

- % completing assessment
- % reaching results page
- % clicking primary CTA
- % converting to: AiBI-P · Briefing

## Critical UX principles

- No PDFs
- Everything scannable
- One clear next step
- Feels personalized instantly
- Action within 30 seconds

---

## Suggested phasing (recommendation, not locked)

This is too large for one shot. Proposed split:

### Phase 1 — Static personalization (Option A content)
**Scope:** Sections 1, 2, 3, 4, 8 with rules-based templates. No LLM generation, no 7-day timeline, no interactive prompt block, no PDF.
- Score-driven hero with institution name interpolation
- Tier-mapped "what this means" bullets (3 templates × 3 tiers)
- Gap breakdown cards using existing dimension data
- Top recommendation block tied to bottom-ranked dimension via lookup table
- Conversion routing → existing `/coming-soon?interest=…` deep links

**Why first:** Ships the core "feels tailored" win without building an LLM pipeline or timeline component. Most of the perceived improvement.

### Phase 2 — Interactive depth
- Section 5 (interactive prompt block · Copy + Open in ChatGPT)
- Section 6 (7-day action plan timeline · template per tier)
- Section 7 (future state aspiration block)
- Section 9 (CTA footer)

### Phase 3 — LLM-generated content
- Replace template blocks with structured-prompt LLM generation
- Cache results per `assessment_id` to avoid re-generating
- Use existing AI harness (`src/lib/ai-harness/`)

### Phase 4 — Data + share
- Supabase schema additions (`assessments`, `results` tables; user→institution link)
- PDF / email export
- FDIC API enrichment for institution context

---

## Open questions

1. **Persona names beyond "Unstructured Explorer"** — what are the Emerging and Advanced persona labels? The PRD shows one example; the others need naming.
2. **Recommendation lookup table** — every (gap × tier) combination needs a recommendation. That's `8 dimensions × 3 tiers = 24` cells. Who writes the copy?
3. **Institution inference** — if user provides email but not institution, do we infer from email domain (e.g., `@firstcentralbank.com` → "First Central Bank")? Risky for vanity domains.
4. **What replaces the current `/assessment` results screen** — is the dynamic results page a route swap, or does the existing screen stay accessible somewhere?
5. **Results URL design** — does the user get a shareable `/assessment/results/{id}` URL? Implies persistence and probably auth-gated access.
6. **Conversion routing strategy** — when COMING_SOON is on, "Start Practitioner Training" can't actually start training. Does it still appear as a CTA that drops the user into the waitlist with `?interest=course`?

These need answers before Phase 1 planning starts.

---

## Source

Verbatim from user message 2026-05-04. PDF reference: `Free AI Readiness Assessment — The AI Banking Institute.pdf` (the static V1 results currently shipping).
