# Foundation Course content audit — 2026-05-24

*Audit of `feature/addie-v1` against `docs/Foundation-Course-ADDIE/`. Asks what's missing on a "build for a future high-end AI experience" bar — beyond the per-module checklist the Production Tracker already covers.*

**Scope:** all of `supabase/seed/m{0..5}_addie.sql` + `src/content/addie/` + `src/components/addie/interactives/` + `src/app/(addie)/foundation/` + the LessonBody renderer.
**Spec baseline:** `AiBI_Foundation_PRD.md`, `AiBI_Foundation_Course_ADDIE_Design_v2.md`, `AiBI_Module_PRDs.md`, `AiBI_Module_0_Orientation.md`, `AiBI_Module_Production_Tracker.md`.

---

## 1. Headline: what's actually shipped vs. spec

| Asset class | Spec target | Shipped | Gap |
|---|---|---|---|
| Modules | 6 (M0–M5) | 6 | ✅ |
| Lessons | 24 | 24 | ✅ |
| Lesson body_md (narration) | every lesson scripted | 23 of 24 dual-layer; M0 single-layer | M0 inconsistent format |
| Track variants (DB rows) | 4 lessons × 5 = 20 | 5 (M0.2) + 5 (M1.3) + 5 (M3.5) + 5 (M4.3) = 20 | ✅ |
| Track variants (widget-hardcoded) | M2.4 worksheet | WhereAIFitsWorksheet has them | ✅ |
| Knowledge checks | ~52 (target) | 6 + 10 + 10 + 11 + 8 + 10 = **55** | ✅ |
| Sandbox configs (addie.exercises) | 9 sandbox lessons | 13 exercise rows (1+1+2+3+3+3) | ✅ |
| Toolbox templates | ~11 named | 12 `.md` files | ✅ |
| Per-module interactive widgets | 1+ per module | 11 widgets across m0–m5 | ✅ |
| **Detailed curriculum docs** | 6 (M0..M5) | **1** (M0 only) | **5 missing** |
| **Sandbox UI** (real lever toggles, A/B compare, PII pre-flight) | working | shipped Wave 2/3 | ✅ |
| Gate (3-way fork) | working | shipped Wave 2a | ✅ |
| Paywall preview | working | shipped Wave 2/3 | ✅ |
| Operator analytics | analytics + sandbox dashboards | shipped (incl. /admin/sandbox 2026-05-24) | ✅ |
| Video media | 13 videos | 0 (operator work, blocked) | gap noted in handoff |
| Audio media | 2 audios + 5 m1.3 variants | 0 | gap noted in handoff |

**Net: the data-and-code skeleton is essentially complete.** What's missing is craft polish, depth of personalization, and the "AI-native" experience layer the user is calling for.

---

## 2. Real content gaps (concrete, fixable)

### 2.1 M0 lessons aren't in the dual-layer SCRIPT/PRODUCTION format

`supabase/seed/m0_addie.sql` lesson bodies render as plain prose — no `## SCRIPT (verbatim)` / `## PRODUCTION` blocks. The new renderer (`LessonBody.tsx`) was designed around the dual-layer format used by M1–M5, with scene cards from numbered leads, mental-model dark cards, and `[tip]/[warn]/[save]/[field]` callouts. M0 silently misses every one of those affordances.

**Fix:** rewrite m0.1 + m0.2 bodies in the canonical format. The script content already exists verbatim in `AiBI_Module_0_Orientation.md`. ~2 hr of work for a real session. Once done, M0 visually matches the rest of the course.

### 2.2 The M0 detailed curriculum doc exists; M1–M5 don't

`AiBI_Module_0_Orientation.md` is the only `Aibi_Module_N_*.md` file. The Production Tracker marks M1–M5 specs as "✅ seeded in supabase/seed/...sql" — but the SQL bodies *are* the content, not a curriculum spec. There's no docs/per-module doc explaining beats, timings, on-screen elements, b-roll cues, transcript-quality narration with per-beat HOOK/TEACH/DO/TAKE/CHECK structure.

**Why this matters for "high-end":** the docs are how the operator can:
- Record videos with a real shot list
- Review/edit copy without grepping SQL
- Onboard future contributors
- Hand off to a media production firm

**Fix:** generate 5 spec docs (`AiBI_Module_1_Awareness.md` ... `AiBI_Module_5_Build.md`) following the M0 template. ~1 day per module if done by hand; much faster with the Claude API + the existing seed bodies as primary source.

### 2.3 Knowledge checks aren't logged per-lesson during the e2e tour

Per-lesson KC count is fine on paper, but in the e2e screenshots most lessons render the 2–3 checks at the bottom unstyled — they look like form rows rather than an interactive quiz. The `LessonBody.tsx` renderer has nothing special for KC; they come from a separate component. Confirm but don't assume: result-logging works (the API exists), but the UI doesn't celebrate correct answers, doesn't show streak, doesn't suggest the next lesson on perfect score.

**Fix:** small KC redesign — green-tick affirmation, brief explanation reveal on each option, optional "all correct → unlock next" celebration. ~3 hr.

### 2.4 Toolbox templates are 12 files but several are placeholder-heavy

The AI Toolkit Map template I read end-to-end is excellent — banker-grade prose, real standing rules, well-structured. Sampling other templates is needed to confirm uniformity. **Recommendation:** do a 1-line-per-template pass to grade depth, then upgrade the thin ones to match the Toolkit Map bar.

### 2.5 Per-track content sits in **three different places** with no contract

- M0.2 → `lesson_track_variants` table (5 rows)
- M1.3 → `lesson_track_variants` table (5 rows)
- M2.4 → hardcoded in `WhereAIFitsWorksheet` widget
- M3.5 → `lesson_track_variants` + `track_defaults` JSON on the exercise
- M4.3 → `lesson_track_variants` + `track_defaults` JSON

This works, but it's a maintenance trap. When the operator wants to change the customer-facing track copy across all lessons, they have to find it in three places. **Future improvement:** consolidate to a single content model (e.g. `addie.lesson_track_variants` for narrative, `addie.exercises.track_defaults` for sandbox params — drop the widget hardcoding by feeding the widget from `lesson_track_variants` too).

---

## 3. The "high-end AI experience" layer — what's *not* in the spec yet

These are the moves that would take the course from "well-built editorial LMS" to "obviously-AI-native product." None are in the spec. Each one is shippable in 1–3 days.

### 3.1 In-lesson AI tutor sidebar (highest leverage)

A persistent right-rail "Ask a question about this lesson" with a model that knows:
- The current lesson body_md
- The learner's role track
- Their progress so far
- The standing data-discipline rule (it must refuse to summarize a member's name + account)

Built on the existing sandbox-service (provider gateway + injection guard) so the same guardrails apply. Streams responses. Bounded to the lesson context. Every question is a Toolbox-saveable artifact ("Questions I asked while learning M3").

**Why this is the move:** every banker has questions they're embarrassed to ask their committee. An AI tutor that's trained on data discipline and knows their role is the differentiator vs. every other LMS.

**Cost:** ~2 days. Reuses existing infra. Net new: `src/app/api/addie/tutor/route.ts`, `src/components/addie/lesson/LessonTutor.tsx`, prompt assembler with lesson-content injection.

### 3.2 Generated per-lesson summary on completion

When a learner finishes a lesson, an LLM generates a 3-sentence personalized recap based on:
- The lesson scene cards
- The KC answers they got right/wrong
- Their role track
- The takeaway artifact they saved

Shown inline on the next-lesson landing. Costs ~$0.001 per learner per lesson. Real practical value: 6 weeks later when they return, they have a one-line reminder of what they did. Also writable to a "course journal" Toolbox artifact.

**Cost:** ~1 day. New route, new prompt template, new artifact type.

### 3.3 Adaptive sandbox prompts based on KC performance

The sandbox lessons (M2.3, M3.2, M3.5, M4.x) currently show every preset prompt to every learner. If a learner aced the prompting-fundamentals KC, the sandbox should skip the "here's a basic prompt" preset and offer harder starters. If they failed it, offer scaffolded starters with explicit role/task/context labels.

**Cost:** ~1 day. New: `addie.knowledge_check_results` → sandbox preset filter.

### 3.4 Real model output in the M2.3 "first conversation" lesson preview

Right now M2.3 renders the sandbox UI with no example output — learners click Run to see anything. For the homepage/marketing pages, pre-generate a real example exchange (`addie.exercise_demo_outputs` table, one row per exercise) and render it as a frozen example above the Run button. Shows the value before requiring interaction.

**Cost:** ~4 hr. Cron-generates examples weekly using the real sandbox-service.

### 3.5 Auto-generated "Your AI Banking Brief" digest per learner

The product already has the **AI Banking Brief** newsletter on the marketing side. Tie it to the course: after M3 completion, auto-generate a personalized "Brief for [name], [track]" with 3 things to do next week, sourced from their saved artifacts + 3 industry data points relevant to their role. Email weekly. Free for paid learners; gated for free.

**Cost:** ~2 days. New cron, new prompt template, new Resend template.

### 3.6 Voice mode for lessons + sandbox

The handoff notes 2 audio lessons + 5 m1.3 audio variants are unrecorded. Instead of waiting on operator recording, ship a TTS layer (ElevenLabs or OpenAI tts-1) that reads any lesson body aloud on demand, with the learner controlling speed. Real audio when ready overrides the generated. For sandbox lessons, optional voice input via Whisper.

**Cost:** ~2 days. New route, new player component, audio-state in session.

### 3.7 Multi-modal artifact composition

The current Toolbox saves markdown artifacts. The PRD builder (M5.3), Skill builder (M4.2/3), and Starter Prompt Pack (M3.5) could output:
- A diagram (Mermaid generated by the model)
- A spreadsheet variant
- A "ready to paste into Claude/ChatGPT" version
- A QR code linking back to the learner's edit page

**Cost:** ~3 days. Per artifact type.

### 3.8 Daily generated "On this date in banking AI" inline citations

The lesson bodies currently cite static stats ("FDIC ~65% community-bank efficiency"). For the Sourced Statistics rule (CLAUDE.md), maintain a rolling fact corpus — every Monday, an LLM ranks the week's top regulatory + vendor news and inserts the freshest example into the lesson body via the existing `media_ref` field's caption. Operator approves before publish.

**Cost:** ~1 day. New corpus table, new cron, new approval admin page.

---

## 4. Recommended next 2 weeks (build sequence)

Ordered by leverage:

1. **Day 1** — M0 body rewrite in dual-layer format (2.1 above). Visible course-wide improvement on the most-trafficked lessons. Already-written content; just reformat.
2. **Day 2–3** — In-lesson AI tutor sidebar (3.1). The single biggest "this feels next-gen" win, reusing existing sandbox-service guardrails.
3. **Day 4** — KC redesign (2.3) + adaptive sandbox prompts (3.3). Small visual polish + real personalization.
4. **Day 5** — Generate M1 detailed curriculum doc (2.2) using the existing m1_addie.sql bodies as source. Then M2.
5. **Day 6** — Generated per-lesson summary on completion (3.2). Cheap, durable value.
6. **Day 7** — TTS audio (3.6) unblocks the missing audio lessons.
7. **Day 8–10** — M3, M4, M5 detailed curriculum docs (2.2 continued).
8. **Day 11–12** — Multi-modal artifact composition (3.7) starting with the Skill builder.
9. **Day 13–14** — Daily generated citations (3.8) + the rolling "AI Banking Brief per learner" (3.5).

After this sequence, the course delivers:
- Every lesson has lesson body, scene cards, callouts, KC, an inline AI tutor, a per-completion summary, and an audio fallback.
- Every sandbox is personalized by track AND by prior KC performance.
- Every Toolbox artifact has a markdown form, a paste-ready form, and a diagram form.
- Operator has 6 curriculum docs sufficient for media production handoff.
- Learners get a weekly personalized Brief that re-engages them.

That's the gap between "well-built editorial LMS" and "obviously-AI-native learning product." It's tractable, mostly reuses existing infra, and is sequenced so any single-day cut yields a shippable improvement.

---

## 5. What I'm NOT recommending (out of scope decisions)

- **Live cohorts.** Spec is explicit: async self-paced v1. Don't deviate.
- **Third-party LMS embed.** Spec is explicit: in-house. Don't.
- **More tracks beyond the 5.** Spec is explicit. Don't.
- **Reducing lesson count or merging modules.** The 24-lesson / 6-module shape is the load-bearing structure. Don't.
- **Replacing the on-rails sandbox with open chat.** The "blinders" sandbox IS the pedagogical and risk choice. Don't.

---

## Appendix A — Production Tracker gap rollup (terse)

| Module | Detailed spec doc | Body dual-layer | Track variants | Sandbox config | KCs | Widgets | Templates |
|---|---|---|---|---|---|---|---|
| M0 | ✅ | ❌ (single-layer) | ✅ (5 in m0.2) | n/a | ✅ (6) | ✅ (1) | ✅ (2) |
| M1 | ❌ | ✅ | ✅ (5 in m1.3) | n/a | ✅ (10) | ✅ (1) | ✅ (1) |
| M2 | ❌ | ✅ | ✅ (widget) | ✅ (m2.3) | ✅ (10) | ✅ (1) | ✅ (1) |
| M3 | ❌ | ✅ | ✅ (5 in m3.5) | ✅ (m3.2, m3.5) | ✅ (11) | ✅ (1) | ✅ (2) |
| M4 | ❌ | ✅ | ✅ (5 in m4.3) | ✅ (skill builder) | ✅ (8) | ✅ (2) | ✅ (2) |
| M5 | ❌ | ✅ | n/a (no branches) | ✅ (PRD, prototype) | ✅ (10) | ✅ (3) | ✅ (4) |

**Two real gaps:** M0 body format · 5 missing curriculum docs.

— End of audit.
