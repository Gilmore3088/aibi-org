# Handoff — Foundation Module 4: "Your AI Work Profile"

**Date:** 2026-05-22 · **Author:** prior session (Claude) · **For:** whoever builds Module 4

---

## TL;DR

Build `module-4-experience.html` (the clickable prototype) the same way M1–M3 were built — as a **guided interactive lab**, not a lecture — by **copying `module-3-experience.html` as the template** and reworking content/JS. Then build `module-4-canvas.html` (tile board) and verify with Playwright screenshots before showing the user.

**M4 is the FIRST PAID module.** The free tier ends at M3 (whose finale is the $295/$99 paywall). So M4's experience assumes an enrolled/paid learner — no paywall inside it; the **Sandbox makes its debut here.**

The full M3 design history, every user correction, and all conventions live in memory: **`project_m3_conversion_finale.md`** and the `feedback_*` / `project_foundation_*` files. Read those first.

---

## Where M4 sits

- Progression: M1 confidence → M2 judgment → M3 control → **M4 "I can actually do this myself."**
- **Activation module:** cross the observer → participant threshold without anxiety.
- ~12–15 min, 6 steps. Sandbox debut: guided, low-risk, **impossible to fail.**

## Locked spec (from `docs/foundation-course-modules.md`, M4 section — do not deviate without flagging)

- **Goal (learner-facing):** *By the end: you've actually used AI yourself — run the same task in a couple of tools, felt the difference, and picked the one that fits how you work.*
- **Sandbox-debut rules:** prompt **pre-written**, data **fake**, **we fund it**, nothing to break, no one watching. First task is a **transformation** task (low creativity pressure, obvious success), never a creation task. Tool choice framed by **comfort/personality, not benchmarks** — no declared winner, no feature matrix.

**Steps:**
1. **Feel seen** — *"Okay, but I still haven't actually done anything."* → *"You've already done the hard part — the thinking. What's left is pressing a button."* + *"Nothing to break, nothing to get wrong, and no one watching."* (NOTE: per M3 feedback, **do NOT put the words "Feel seen" in the learner-facing UI** — that's an internal label. Use a real title like "You've learned it — now use it" with a kicker like "Activate".)
2. **Meet the Sandbox, gently.** Reassurance chips: ✓ made-up data only · ✓ we pay for it · ✓ prompt pre-written · ✓ nothing to break. Privacy line: *"No real customer or member information is used here, saved here, or needed here."* → *"You literally cannot get this wrong."*
3. **Press Run · the debut task.** Transform messy (believable) meeting notes → clear action items. Everything pre-loaded; they just run it. **Output intentionally a little imperfect** (*"a couple of these may need an owner confirmed"*) → reinforces AI-drafts/human-finalizes. *"You did that."*
4. **Discover your fit · same task, different tools.** Run the same prompt in Claude / ChatGPT / Gemini. Light personality labels only: **Claude — conversational & thoughtful · ChatGPT — balanced & structured · Gemini — concise & direct.** Micro-check *"Which felt most natural to you?"* → reveal: *"There's no 'best' AI — there's the one that sounds most like you. You're not marrying a tool — switch anytime. This is just a comfortable starting point."*
5. **Make it yours · constrained personalization.** "Pick one — or type your own": customer follow-up email · meeting summary · action-item list · polite rewrite · branch announcement. Run again, watch it adapt. *"This is the steering from Module 3 — now you're doing it yourself."* *"Practice with made-up or non-sensitive examples only."* Payoff: *"You just did in five minutes what most people are still nervous to try."*
6. **Leave with your profile.** Identity artifact.

- **Card kept — My AI Work Profile:** *My starting tool: ___ · What I'll use it for first: ___* (saved to Toolbox).
- **Close:** *"You're not someone who's read about AI anymore. You're someone who's used it."*

## ⚠️ The one M4-specific design landmine

Step 4 runs the **same prompt across Claude/ChatGPT/Gemini.** The user **HATES non-functional model pickers** — in M3 we had to remove fake Claude/ChatGPT/Gemini chips because they looked broken. So in M4, the multi-tool comparison must feel **real**: in the prototype, give each tool a **genuinely different canned output** (matching its personality label) that the learner can flip between — not three identical/empty panes. At port time this is where the live multi-provider sandbox gets wired (`src/lib/ai-harness/` already has a 3-provider engine; see `docs/.../plans-readable.html` notes on enrollment-gate + "server owns the prompt" security work before any non-payer reach — but M4 is paid, so enrollment-gated is fine).

---

## How to build it (reuse everything from M3)

**Template:** copy `module-3-experience.html`. It has the full Ledger design system, the 3-zone layout (left journey rail · center "beats"/steps · right Toolbox dock), the step engine (`go(n)`, `render()`, `data-step` beats, `BEATS`, `titles[]`), the `#s=N&demo=1` deep-link that pre-fires interactions for the canvas, the reveal pattern (`.rhide`/`.rshow`), save-to-Toolbox card mechanic, the **email-gated Toolbox modal**, and the verify-yourself screenshot workflow.

**Files to create:**
- `.superpowers/brainstorm/43125-1779397393/content/module-4-experience.html`
- `.superpowers/brainstorm/43125-1779397393/content/module-4-canvas.html` (copy `module-3-canvas.html`; it auto-fits each tile to full content height)

**Toolbox / cards:** learner-facing saved items are **"Cards"** (never "prompts"). Kit so far when M4 starts: Rewrite Card, Summarize Card, Trust-Check Card, Prompt Moves Card (4). M4 adds **My AI Work Profile**. The Toolbox is **email-gated** (no email → no Toolbox). Dock shows the prior cards as already saved.

**Verify before showing the user (non-negotiable — "build to craft and prove it"):** run Playwright from the worktree `~/Projects/TheAiBankingInstitute/.worktrees/foundation-build` (it has the `playwright` lib; scripts must run from there). Screenshot each step at `deviceScaleFactor:1` (2× full-page exceeds the 2000px image limit), confirm **zero console errors**, then `open` the file. Canvas full-page screenshots show lower tiles blank (offscreen-iframe lazy paint) — that's a screenshot artifact, not a bug; they render live.

---

## Hard-won lessons from M1–M3 (apply all of these)

1. **Lab, not lecture.** Every screen must prove cause-and-effect: click → output visibly changes. No staged walls of text with buttons around them. (M3 was rebuilt 3× until it was genuinely interactive.)
2. **Use the space.** Don't squish content into a narrow column with huge margins — canvas is 840 base / 1120 on lab steps. Outputs should be big and readable.
3. **Stateful, not pre-filled.** The live experience starts in the weakest/empty state and the learner builds it up. Only the `#demo=1` deep-link pre-fires (for the canvas board).
4. **Real banking substance, plain English.** Operational work products (action items, profiles), not "AI for emails." No `FFIEC-aware`; cite sources; no unsourced stats (see CLAUDE.md brand rules).
5. **No fake interactivity.** If a control looks usable, it must work (or be honestly labeled "preview · live in the full course"). This is doubly true for M4's tool picker.
6. **"Run again" affordance:** after a first run, changing inputs should re-enable the run button as "Run again" (just added to M3 Step 5 — copy the pattern: `s5busy`/`s5ran` flags + `markStale()`).
7. **No internal IDC labels in UI** ("Feel seen", "free tier done", etc.).
8. **Italics retired** site-wide; emphasis via weight/color. In standalone prototypes there's no global kill rule, so don't use `<i>`/`<em>` — use `<b>`.
9. **Saving is free; the Toolbox is email-gated; the paywall/upgrade is the conversion moment.** (M4 is post-paywall, so it's about deepening value, not converting.)

## Open threads (not blocking M4)
- Whether to formally split overloaded steps into separate steps (M3 kept them consolidated).
- At port time: log the "sandbox taste in free M3" deviation in DECISIONS.md; wire the real multi-provider sandbox (M4) with enrollment gating + server-owned prompts.

## Status of M1–M3
M1, M2, M3 experience prototypes + canvases are built and iterated heavily (see `project_m3_conversion_finale.md` for the 7-pass M3 history). Free tier is in good shape. Nothing is ported to the Next.js app yet — these are HTML prototypes in `.superpowers/brainstorm/43125-1779397393/content/`.
