# Module 4 — Automating the repetitive: skills *(detailed curriculum)*
### AiBI Foundation Course · "We turn your bankers into your builders."

| | |
|---|---|
| **Tier** | Paid (first paid module — entry through the post-M3 gate) |
| **Lessons** | 4 (1 video · 3 interactive · 1 branched ×5 tracks) |
| **Total runtime** | ~52 min |
| **Sandbox** | Reuses the controlled sandbox from M2/M3; the Skill Builder writes to it |
| **Module takeaways** | **Skill Template** (4.2) · **Working Skill** for your role (4.3) · **Verified Skill** with guardrail notes (4.4) |
| **Entitlement effects on entering M4** | The Module-3 gate purchase unlocks: **(1) the full Prompt Library**, **(2) unlimited Toolbox saves** (the free 4-artifact cap lifts), and **(3) every paid module** (M4 + M5). Surfaced once on lesson 4.1 open. |
| **Module objective** | The learner can convert a prompt from their Starter Pack into a parameterised, named, versioned Skill that runs on new material in 30 seconds — and can defend the guardrails attached to it. |

**How to read this spec.** Same rail as M0: every lesson is **Hook → Teach → Do → Take → Check**, with **SCRIPT (verbatim)** and **PRODUCTION** layers. Lesson 4.3 is branched ×5 tracks; track variants live in `addie.lesson_track_variants` (seeded in `supabase/seed/m4_addie.sql`).

**Why this module exists.** The free tier teaches you to *use* AI. M4 is where you start *building* infrastructure for yourself — your personal library of named, parameterised prompts that a colleague could run cold. A bank that ships ten of these per quarter quietly compounds productivity; a bank that runs the same prompt by hand a hundred times does not.

**Prerequisite artifacts** (must exist in Toolbox before M4 starts):
- Starter Prompt Pack (m3.5)
- A first-conversation transcript (m2.3) — used as a learning reference
- Selected role track (m0.1)

---

## Lesson 4.1 — What a skill is
**Video · ~10 min · Paid**
**Objective:** *Define* a skill as locked-choices + named slots, and *distinguish* it from a one-off prompt and from an agent.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–7:00 |
| Do (no interaction — anchor card review) | 7:00–8:30 |
| Take + Check | 8:30–10:00 |

### HOOK
**SCRIPT (verbatim):**
> "A skill is your good prompt, saved with the choices already made, ready to run on Monday morning without retyping anything. That's the whole concept. Everything else in this module is mechanics."

**PRODUCTION:** Single dense card — *Locked Choices · Input Slots* — animates apart as the narrator names each half. Background ledger paper; gold rule under the headline.

### TEACH
**SCRIPT (verbatim):**
> "Three things to understand about skills before you build one.
>
> **One: saved beats remembered, every single time.** You wrote a strong prompt in Module 3 — role, task, context, format, the constraint that stopped the model inventing citations. Two weeks from now, when a new SR letter drops or a similar member complaint hits the queue, you will not retype that prompt from scratch. You either reach for the saved version, or you write a worse one because you're in a hurry. Save the prompt. Lock the choices underneath. That's the move and the move underneath the move.
>
> **Two: the anatomy is locked choices plus input slots.** Locked choices are the decisions that make your prompt work for this shape of task — the role, the audience, the length, the constraints. Input slots are the bits that change every time — the rule excerpt, the complaint summary, the vendor category. Name each slot. Give it a one-line help label your future self will read in a hurry.
>
> **Three: bounded scope is the feature.** A skill does not run on its own. It does not chain into other skills. It does not browse the web or read your inbox. It is one named, parameterised prompt — and that boundary is what makes it safe to hand to a colleague, safe to run on a cadence, safe to defend in front of a regulator. Agents are Module 5 territory. Today, one reliable named prompt at a time."

**PRODUCTION:**
- Three case-good cards build in sequence as the narrator names each.
- Closing card: a single named skill rendered as a passport-style record — name, locked choices listed, slots labelled. This card sets the visual expectation for the Skill Builder UI in 4.2.

### DO — No interaction
Module-opening lesson. The Do beat is a 90-second review of the anchor card before moving to 4.2.

### TAKE — Mental model anchor
No Toolbox artifact (the first artifact is the Skill Template in 4.2). The takeaway is the two-part definition that survives the lesson.

### CHECK
1. *What are the two parts of every skill?* → **Locked choices and named input slots.**
2. *What's the bounded-scope rule?* → **One named, parameterised prompt. No chaining, no browsing, no autonomy.**
3. *Why is saved better than remembered?* → **Future you, in a hurry, will not write the better version from scratch.**

---

## Lesson 4.2 — Build your first skill
**Interactive · ~15 min · Paid · Toolbox artifact: Skill Template**
**Objective:** *Build and save* a parameterised template from a prompt in the learner's Starter Pack.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–3:30 |
| Do (Skill Builder) | 3:30–13:00 |
| Take + Check | 13:00–15:00 |

### HOOK
**SCRIPT (verbatim):**
> "Take an M3 prompt and turn it into a parameterised template. Four steps, fifteen minutes, one Skill Template in your Toolbox."

**PRODUCTION:** Four step-indicator chips across the top of the builder, all dim. The first one lights as the lesson opens.

### TEACH
**SCRIPT (verbatim):**
> "Four steps in the builder. Each one takes a minute or two. Skip any of them and the skill works once and breaks the second time.
>
> **One: pick a source.** A Starter Pack prompt you've already run twice. The source decides what controls the skill exposes.
>
> **Two: lock the choices.** For each control — role, audience, length, format, constraints — either fix it (always teller audience, always five bullets) or mark 'choose at run time.' Mostly-fixed with one or two runtime levers is the right ratio.
>
> **Three: name your input slots.** Short banker-readable names — `rule_excerpt`, not `input_1`. One-line help labels future-you will read in a hurry. 'Paste public regulatory text only — no member identifiers' beats 'paste your text.'
>
> **Four: save.** The skill becomes a Skill Template artifact. Lesson 4.3 tunes it to your role; 4.4 verifies it. Every save is versioned."

**PRODUCTION:**
- Four steps map to four progressively-revealed sections of the Skill Builder.
- After step 3, a live preview card on the right shows the assembled skill in passport style — exactly the card from 4.1's closing visual.

### DO — Skill Builder *(interactive)*
**PRODUCTION:** `SkillBuilder` widget (Wave 3a). On submit, writes to `addie.toolbox_items` with `type = 'skill_template'`. Save button highlights once all four steps have content. Toolbox sidebar preview pulses on save (fires the `aibi:artifact-saved` custom event).

### TAKE — Skill Template artifact
A `.md` artifact in the learner's Toolbox under the M4 collection. Schema:
```
name: <human-readable>
source_exercise: <id from m3>
locked_choices: { role, audience, length, format, constraints }
slots: [{ name, help_label }]
version: 1
```

### CHECK
1. *Why name slots in banker English?* → **Future you reads them in a hurry; cryptic names become trip-hazards.**
2. *What does the PII screen do at runtime?* → **Blocks paste of account-number/SSN/full-name patterns before the model sees them. Backstop, not substitute.**
3. *What's the right ratio of locked vs. runtime levers?* → **Mostly locked with one or two runtime.**

---

## Lesson 4.3 — Build a skill for your role *(branched ×5)*
**Interactive · ~15 min · Paid · Toolbox artifact: Working Skill (role-tuned)**
**Objective:** *Tune* a track-defaulted skill to the learner's institution, and *save* it at "would hand to a colleague today" quality.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–3:00 |
| Do (Skill Builder, pre-loaded per track) | 3:00–13:00 |
| Take + Check | 13:00–15:00 |

### HOOK
**SCRIPT (verbatim):**
> "Same builder, pre-loaded for your role. Per-track framing below; you can take the defaults or swap the source."

**PRODUCTION:** The builder opens with a "Track default" badge on every pre-filled control. The badge becomes "Edited" the moment the learner changes anything.

### TEACH
**SCRIPT (verbatim):**
> "Three things to do differently this time, even though the builder looks the same.
>
> **One: trust the pre-load, then question it.** If the defaults fit your week, accept them. If they don't — if you read vendor questionnaires more than SR letters — swap the source.
>
> **Two: tune to your institution, not just your role.** 'Member' vs. 'customer.' 'CCO' vs. 'BSA officer.' Edit the locked role and constraint language until the output sounds like your bank at a glance.
>
> **Three: save as a Working Skill, not a draft.** A Working Skill is the version you would hand to a colleague today and trust them to use without retraining. Not at that bar yet? Say so in the name ('draft, needs one more pass')."

**PRODUCTION:**
- Per-track narration renders above the builder, pulled from `addie.lesson_track_variants` for `m4.3`.
- The builder's source-exercise dropdown shows the track default as the first option; alternatives below.

### DO — Skill Builder, track-defaulted *(interactive ×5)*
Five distinct seeded defaults — see `supabase/seed/m4_addie.sql`, m4-3 exercise:
- **Risk & Compliance:** Reg-E summariser → tellers
- **Customer-Facing:** Member-comms clarifier
- **Back-Office Process:** Process memo → operator one-pager
- **Technical:** Vendor due-diligence checklist
- **Leadership:** Board talking-points framer

### TAKE — Working Skill artifact
Same schema as 4.2 but `type = 'skill'` (not template). Saved under the learner's M4 collection.

### CHECK
1. *When should you swap the track default?* → **When your seat shapes the recurring task differently from the default.**
2. *What signals "Working Skill" vs. "draft"?* → **You would hand it to a colleague today without retraining.**
3. *Why tune to institution language?* → **A skill that lands in your tone the first read is one you keep using; one that needs a tone edit every run disappears.**

---

## Lesson 4.4 — Test, refine, guardrail-check
**Interactive · ~12 min · Paid · No new Toolbox artifact (extends 4.3's Skill with guardrail notes)**
**Objective:** *Run* a saved skill on new realistic material, *capture* a four-question guardrail check, and *mark* the skill verified.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–2:30 |
| Do (run + guardrail check) | 2:30–10:30 |
| Take + Check | 10:30–12:00 |

### HOOK
**SCRIPT (verbatim):**
> "A skill that has never been run on new material is a guess. Three moves turn it into a verified piece of your toolkit."

**PRODUCTION:** Two side-by-side panels: the sandbox runner on the left, the four-question guardrail panel on the right. Both empty at start.

### TEACH
**SCRIPT (verbatim):**
> "Three moves, in order.
>
> **One: run the skill on realistic new material.** Realistic synthetic — a public reg text the skill hasn't seen, a situation in your own words, a generic vendor proposal stripped of identifiers. Read the output like it landed at 3pm Thursday: send, forward, or fix?
>
> **Two: walk the four-question guardrail check.** Does the output cite anything outside the slot material? Comfortable sending as-is? Where does it need a human pass? One input pattern that would break this skill?
>
> **Three: refine and re-save.** If output drifts predictably — invented citations, off tone, wrong audience — edit the locked choices and re-run. Two clean runs on different inputs = verified."

**PRODUCTION:**
- The four-question guardrail panel is a small form (4 textareas, all required). Submission attaches the notes to the skill's `addie.toolbox_items` record.
- A "verified" stamp animates onto the Toolbox passport card after two clean runs.

### DO — Sandbox runner + guardrail check *(interactive)*
**PRODUCTION:** The runner is the same controlled sandbox from M2/M3 in skill-execution mode. Each run records to `addie.events` with `action = 'skill_run'` for later analytics.

### TAKE — Verified Skill *(extends 4.3 artifact)*
Updates the existing Working Skill record with `verified = true` and a `guardrail_notes` JSON block. No new Toolbox row.

### CHECK
1. *What's the bar for "verified"?* → **Two clean runs on different inputs.**
2. *Why four questions, not more?* → **More than four guardrail notes signals the skill is doing too much. Split it.**
3. *What stays out by the data-discipline rule, even with the PII screen?* → **The screen catches obvious patterns; institutional MNPI and confidential vendor material need judgement.**

---

## Module artifacts summary

| Lesson | Toolbox artifact | Type | Schema reference |
|---|---|---|---|
| 4.2 | Skill Template | `skill_template` | `content/addie/toolbox-templates/m4/skill-template.md` |
| 4.3 | Working Skill (×5 track variants) | `skill` | `content/addie/toolbox-templates/m4/working-skill.md` |
| 4.4 | Verified extension on 4.3's skill | (updates existing row) | inline `guardrail_notes` JSON |

By the end of M4, the learner's Toolbox should hold **at least one Skill Template, one Working Skill, and one Verified Skill**. The free-tier 4-artifact cap is lifted at the gate; this module assumes unlimited saves.

## Reconciliation with AiBI_Module_PRDs.md (M4) and the seeded SQL

The Module PRD (`AiBI_Module_PRDs.md`) and the implementation seed
(`supabase/seed/m4_addie.sql`) diverge in two places. **The seed is the
implementation truth; this curriculum doc matches the seed.** The PRD has
been left as-is to preserve the historical record.

| Item | PRD says | Seed (and this doc) say | Resolution |
|---|---|---|---|
| Back-Office role default | "press-release generator" | "Process rewrite to one page" | Seed wins. PRD was an early sketch; the team picked a more recurring task. |
| Leadership role default | "ten competitors research compiler" | "Board memo, one page" | Seed wins. Same reason; the board-deck digest hits Leadership readers more squarely. |
| 4.4 guardrail check | "validated against data-discipline rule **before save**" (FR-M4-3) | Two-layer: (a) the existing PII screen blocks sensitive paste at save time — already in the sandbox runner; (b) the learner writes 4 guardrail notes after a clean run | Both layers exist. The PRD line referred to (a); this doc and the seed describe (b) as the lesson's pedagogical action. |
| Takeaways | "Working Skill · Skill Template · Prompt Library unlock · unlimited saves" | This doc lists the three artifacts and surfaces Prompt Library unlock + unlimited saves as **entitlement effects** above (not artifacts) | Same meaning, different shape. The unlock is a Stripe-driven RLS effect, not a Toolbox row. |

## Operator notes

- **Sandbox config:** `m4-2-build-first-skill` and `m4-3-role-skill` reuse the existing sandbox guardrails (canary, PII screen, token gating) — see `supabase/seed/m4_addie.sql` exercise rows.
- **Entitlement gate:** `/foundation/m4/*` checks `hasAnyFoundationEntitlement(user)` before rendering; non-entitled users see `PaywallPreview` showing the lesson title + 4.1's anchor card only.
- **Tests:** `SkillBuilder.test.tsx` + `m4_seed.test.ts` cover the builder + seed shape; 8/8 passing as of 2026-05-24.
