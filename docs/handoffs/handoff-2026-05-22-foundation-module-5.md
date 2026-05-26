# Handoff — Foundation Module 5: Teaching AI Your Style

**Date:** 2026-05-22 · **Author:** prior session (Claude) · **For:** whoever builds Module 5

---

## TL;DR

Build `module-5-experience.html` and `module-5-canvas.html` in `.superpowers/brainstorm/43125-1779397393/content/`. **Use `module-4-experience.html` (v5) as the craft reference.** Read the four memory files at the bottom of this doc before you write a line of code — they encode every redirect we already worked through on M4.

M5's job per the locked curriculum is **Teaching AI Your Style** (internal: *Projects and Context*). M5 builds on M4's Workbench by adding the next layer: giving AI persistent context so its drafts sound like the learner's actual work, every time, without re-explaining who they are and what they care about.

**The bar:** every paid module must feel like *$1000+ value for the $295*. We are turning bankers into builders. By the end of M5 the learner should walk away with a reusable **Style + Context Brief** — a real artifact that makes every future AI session deliver work that sounds like them, on their kind of file, with their guardrails baked in.

---

## The four-module arc (what came before M5)

The Foundation course compounds. Each module installs a habit the next one assumes. Don't break the chain.

| # | Title (learner-facing) | What it installs | Card / artifact saved |
|---|------------------------|------------------|-----------------------|
| 1 | AI for Your Workday | **Confidence.** "AI is for someone like me." Plain English works. The one-paragraph hack: ask, then refine. | Rewrite Card · Summarize Card |
| 2 | What AI Is and Is Not | **Judgment.** AI sounds confident even when wrong. The four-check review reflex (numbers · dates · names/citations · policy claims). | Trust-Check Card |
| 3 | Better Inputs, Better Outputs *(Prompting Fundamentals)* | **Control.** Vague asks → usable work products. The prompt moves: Role · Source-only · Output shape · Audience · Guardrail · Confirm. | Prompt Moves Card · paywall lands at the end |
| 4 | **Your AI Work Profile** *(The AI Workbench)* | **Application.** Real prompts → real markdown responses. Four labs (Data · Compliance · Loan · Ops). Review with banker-context tags. Improve with follow-ups. | **Workbench Pack** — the actual work product, with prompt + response + tags + improved version |

**M5's job:** make every future Workbench session yield work that sounds like the learner — not generic AI drafts. Persistent context. Their voice. Their constraints. Their tools.

---

## What M4 (v5) shipped — the craft baseline M5 must match

M4 went through five rebuilds before the user accepted the shape. Don't repeat the misses. Specifically:

1. **Real prompts. Real markdown responses. No tabs.** A real AI tool returns one continuous markdown response — H2/H3 headings, paragraphs, lists, an inline table where it fits. If we render outputs as five neat tabs, we misrepresent how Claude/ChatGPT/Gemini actually work. Every output in M5 must look like what would actually come back from the API.
2. **Honest prompt↔output proportionality.** Show the full multi-line prompt that produced the response. The prompt is *copy-pasteable into any AI tool*. The response is sized to the prompt's depth — no one-sentence ask producing a five-section opus.
3. **Realistic synthetic banking material.** Never write "real banking material" — the contradiction is a safety failure. Always **realistic synthetic**. Sources use placeholders only (`[applicant]`, `[member]`, `[amount]`, `[loan-file-id]`, `[date]`, `[branch]`, `[prior year]`, etc.). No PII patterns — no fake names paired with member numbers.
4. **Substantive paid artifacts.** The Workbench Pack saves: source · prompt sent · AI response · review tags · follow-up prompt · improved response · adaptation idea. A "card" is not the artifact — the actual work product is. The Profile is secondary, not the prize.
5. **Collapsible dock + referenceable Toolbox.** The right-hand Toolbox dock has a close-X; collapsing widens the canvas, a floating button reopens it. The Toolbox modal opens each card to its real prompt content + when-to-use + Copy button. Saving must produce something the learner can read back later.
6. **Banker-context review tags, not generic rubrics.** Compliance tags ≠ Data tags ≠ Loan tags ≠ Ops tags. Each lab has its own six.
7. **No filler steps.** No "tap each guarantee" quizzes. No fake interactivity. Every screen must answer: *what meaningful choice does the learner make here, and how does the output change because of it?*
8. **Reassurance language is sparse.** "You cannot get this wrong" appears once at most. More than that is infantilizing.
9. **Model comparison is demoted.** A collapsible drawer with a note: *"comparing tools is the headline of Module 7 — not this one."* Single-markdown responses per model, not tabbed.

If you're tempted to compress, simplify, or "make it cleaner" — re-read this list. Every item here is a redirect the user issued during M4.

---

## The $1000+ for $295 bar

The user's actual line on paid value: *"You aren't paying for prompts. You're paying for practice turning messy banking work into usable work products — safely."*

A learner who finishes the paid course should walk away with:

- A **personal AI Work Profile** (M4) — what tool they reach for, what shape of work fits them.
- A **Style + Context Brief** (M5) — the durable artifact that makes their AI sound like them.
- A **library of real saved Packs** (M4+) — each one is a real work product, not a name-badge.
- A **set of agents / workflows** they built themselves (M8 onward) — solving their own problems with their own tools.

Every paid module is judged against this question: *would a banker pay $1000 for what this module delivered, in isolation?* If not, deepen it.

**Bankers to builders** isn't a tagline. It's the test. A builder solves their own problems with the tools they have. By M12 the learner should be doing exactly that, on their own files, in their own voice.

---

## Module 5 — Teaching AI Your Style (the locked spec)

**From `docs/foundation-course-modules.md`:**

- **Length:** ~15–20 min · **Sandbox:** YES (Workbench continues from M4)
- **Job:** install the habit of giving AI persistent context — so it can sound like the learner, every session.
- **Goal (learner-facing):** *By the end: AI can write in your voice, on your kind of file, with your guardrails — without you re-explaining every time.*

**Progression:** M1 confidence → M2 judgment → M3 control → M4 application → **M5 personalization.**

**Key concept (internal: Projects and Context):** real AI tools have features called "Projects" (Claude), "GPTs" / "custom instructions" (ChatGPT), "Gems" (Gemini) — places to store persistent context the model uses for every chat. M5 teaches the learner what to put in those — without naming them as features, because the curriculum is tool-agnostic. The skill is **knowing what context to write down so AI does better work**, not learning each tool's UI.

**The artifact the learner leaves with: the Style + Context Brief.** A copy-pasteable block they paste into Claude Projects / ChatGPT custom instructions / Gemini Gem / Copilot context — and it makes every future session land in their voice with their constraints.

---

## Suggested M5 shape (based on M4's craft + the locked spec)

This is a starting structure, not a final spec. Discuss with the user before building.

**Welcome — The Context Layer.** Frame the shift: M4 made AI useful on a single task; M5 makes AI useful on *every* task without re-explaining. Value visual: blank slate every session → persistent voice & context → consistent output. CTA: "Build my Style + Context Brief."

**Step 1 — What changes when AI knows you.** Show the same prompt run two ways: (a) cold, no context; (b) with a Style + Context Brief loaded. Real markdown responses, side by side. The "knows you" version is dramatically better — tone matches, terminology matches, guardrails baked in. The wow moment of M5.

**Step 2 — Inspect the layers.** Three layers of context worth writing down: **Who I am** (role, institution type, what I do all day) · **How I work** (tone, format preferences, what I always need flagged) · **What I never want** (PII, regulator-shaped claims, anything member-facing without review). Show examples for each.

**Step 3 — Build your Brief.** Three-pane workbench (reuse M4's pattern): left = guided prompts ("describe a recent member conversation you handled — three sentences"), middle = the Brief assembling live as the learner answers, right = a real test prompt + response that proves the Brief is working. Each answer the learner gives feeds back into the test response — they see the personalization happening.

**Step 4 — Test on a real lab task.** Pick one of the four M4 labs (or a new one), run the same kind of prompt — but with the Brief loaded. The response sounds like the learner. Banker-context review tags (reuse). Tag what worked.

**Step 5 — Where this lives.** Plain-English explanation of "Projects / GPTs / Gems / Copilot context" — the place each tool gives you to paste a persistent Brief. *No tool-feature tour;* the point is "every major tool has this; here's how to use yours." Include a copy block for each tool.

**Step 6 — Save the Style + Context Brief.** Extends the Toolbox. The Brief itself is the artifact, **plus** a meta-note ("this is what I paste into Claude Projects / ChatGPT custom instructions / Gemini Gem / Copilot context"). Workbench Pack from M4 grows — every saved Pack from here forward can reference the Brief.

**Adapt as the user redirects.** Treat this as a starting hypothesis, not a locked spec. The user will redirect — that's the process.

---

## M5 design constraints (must travel from M4)

- **No tabs in the response panel.** Markdown render, one continuous artifact.
- **The prompt is shown and copy-pasteable.** Every run.
- **Realistic synthetic.** Placeholders only.
- **Banker-context tags**, not generic.
- **Collapsible dock.** Reopen via floating button.
- **Toolbox cards open to real content.** The Brief is the new card — make it substantive when opened.
- **No filler steps.** Every screen earns its place by changing an output based on a learner choice.
- **Real model names** (Claude / ChatGPT / Gemini / Copilot) only when accurate; tool comparison stays demoted (M7 is the comparison module).
- **Reassurance sparse.** Don't repeat "you cannot get this wrong."

---

## Open threads (don't relitigate; surface to user)

- **Cards from M1–M3 are still thin.** User flagged this in M4 ("cards are amounting to nothing — just filler"). M5 can extend the fix by making sure every M1–M3 card opens to substantive content in the Toolbox modal — we wired the Module 4 version of this. Confirm with user whether to backfill M1–M3 cards content during M5 build, or defer to a later sweep.
- **The Workbench Pack from M4 deviates from the LOCKED 2026-05-21 curriculum** for M4 — `DECISIONS.md` has a 2026-05-22 entry logging the deepening. M5 likewise should expect to deviate from the locked spec if needed; the bar (real value, comprehensive, builder-mode) is the override.
- **The Toolbox should accumulate Packs across paid modules.** M4 saves "My First Workbench Pack — Data Analysis." If a learner runs the workbench on the Compliance lab next, do they save *another* pack? Probably yes — each completed lab is a real artifact. Confirm with user before building Pack-stacking logic.

---

## File map

| File | Purpose |
|------|---------|
| `.superpowers/brainstorm/43125-1779397393/content/module-1-experience.html` | M1 reference (free, confidence) |
| `.superpowers/brainstorm/43125-1779397393/content/module-2-experience.html` | M2 reference (free, judgment) |
| `.superpowers/brainstorm/43125-1779397393/content/module-3-experience.html` | M3 reference (free, control + paywall) |
| `.superpowers/brainstorm/43125-1779397393/content/module-4-experience.html` | **M4 v5 — your primary craft reference** |
| `.superpowers/brainstorm/43125-1779397393/content/module-4-canvas.html` | M4 design canvas (all screens) — same pattern for M5 |
| `docs/foundation-course-modules.md` | Locked curriculum doc — read the M5 section |
| `DECISIONS.md` | Log any M5 deviation here |
| `CLAUDE.md` | Brand rules, color tokens, naming conventions |

---

## Memory files to read before you write a line

These encode the redirects we already lived through. Don't make us re-issue them.

- **`project_m4_workbench_pack.md`** — the four-labs / Workbench Pack architecture and why "Pack > Profile."
- **`real-ai-output-shape.md`** — outputs are continuous markdown responses; no tabbed UI; prompts and responses must be honestly proportional.
- **`toolbox-collapsible-referenceable.md`** — dock must collapse; cards must open to real prompt content with Copy buttons.
- **`cards-are-filler.md`** — "name-only badges aren't value." Saved artifacts must be substantive.
- **`feedback_lock_and_refine.md`** — don't keep re-reframing the high-level structure; develop module-by-module concretely.
- **`feedback_build_to_craft_and_prove.md`** — match the M4 craft bar end-to-end with screenshot evidence before showing the user.
- **`feedback_prd_fidelity.md`** — every detail in user spec becomes a requirement; never skip or condense.
- **`feedback_demo_realism_and_card_concept.md`** — show real AI output, not stylized fake chips; saved items must be substantive.
- **`project_foundation_course_experience.md`** — the calm operating system, finish-line "I can use this Monday."
- **`project_foundation_course_design.md`** — safe professional confidence, tool-agnostic, completion-based, no Anthropic 4D branding.

---

## Verification protocol (the M4 standard)

Before showing the user *anything*:

1. Build `module-5-experience.html` and `module-5-canvas.html` in the brainstorm content directory.
2. Run Playwright across every step at `deviceScaleFactor:1`, `fullPage:true`. Zero console / page errors. Visually inspect each screenshot.
3. Specifically verify: prompt-shown copy button works, response renders as continuous markdown (not tabbed), dock collapse works, Toolbox modal expand-card flow works, the new Brief is substantive when opened.
4. Open in browser via `open module-5-experience.html`. Walk through it as a learner.
5. Only then show the user. Be ready to redo entire sections if redirected.

---

## The mindset

M5 isn't another shallow step in a course. It's the moment "AI knows me" lands for the learner — and the moment they start to feel like a builder, not a bystander. Every screen has to earn its place against the $1000-for-$295 bar.

**Bankers to builders.** Make the work product real. Make the prompts copy-pasteable. Make the dock collapsible. Make the saved artifacts substantive. And when in doubt, re-read the memory files — they encode what we already learned the hard way.
