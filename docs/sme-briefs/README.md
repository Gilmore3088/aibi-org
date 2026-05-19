# SME interview briefs — starter-kit content

**Purpose:** Three one-page briefs to send to subject-matter experts for
each of the three remaining starter kits in `/my-toolbox`. Each brief
asks the SME to produce real, rigorous tool content for their kit so
the kit row in the toolbox stops being a metadata-only shell.

**Background:** The v5 toolbox design shipped 2026-05-18 with four
starter kit cards (BSA officer · Lender · Branch manager ·
Compliance). The **BSA officer** kit ships complete — five
production-grade prompts/skills/agents reviewed against Anthropic's
documented prompting best practices. The other three are visible but
empty: clicking adopt currently just flips an active marker.

Filed as [issue #184](https://github.com/Gilmore3088/aibi-org/issues/184).
Today the gap is internal-only (`/my-toolbox` is
`robots: noindex,nofollow`). When the customer-facing port to
`/dashboard/toolbox` ships ([issue #183](https://github.com/Gilmore3088/aibi-org/issues/183)),
it becomes launch-blocking unless the empty kits are hidden behind
"Coming soon" until SME-signed-off content lands.

## How to use these briefs

1. Pick the right SME for each role — someone who actually does the
   job at a community bank or credit union and has used at least one
   LLM (Claude, ChatGPT, Copilot, Gemini, Perplexity, NotebookLM) on
   real work.
2. Send them the brief that matches their role (Lender / Branch
   manager / Compliance). One brief per person; don't bundle.
3. Each brief is structured so the SME can complete it in about
   thirty minutes by filling in five tool slots with whatever they
   would actually use. Anthropic prompting patterns are documented
   inline so they can read the template without prior background.
4. When the brief comes back, the engineer ports each completed tool
   into `src/lib/my-toolbox/tools.ts` using the BSA-officer entries
   (`sar`, `tone`, `builder`, `kit`, `tensecheck`) as the reference
   shape.

## What "rigorous" means

The BSA-officer kit is the rigor benchmark. Each tool in that kit:

- Has a `<role>` framing that names the user persona and the reader.
- Uses XML-tagged sections — `<inputs>`, `<task>`, `<style>`,
  `<process>`, `<output_format>`, `<gates>`, `<example>` — instead
  of bullet lists.
- Specifies inputs as named placeholders (`{{ALERT_FACTS_JSON}}`,
  `{{KYC_JSON}}`) so the prompt is contract-driven, not vibes-driven.
- Forces a chain-of-thought process before the final output, with
  explicit instructions on what the model should and should not emit.
- Ships at least one worked example with realistic numbers and
  banker voice — past tense, third person, sourced quantities,
  no judgement adjectives.
- Carries a `<gates>` section that defines hard pre-send checks
  (word cap, placeholder resolution, mandatory legal-review hook).

Skip the rigor and the kit becomes filler — exactly what the
2026-05-18 content directive forbids.

## Files

- [`lender-brief.md`](./lender-brief.md) — for a community-bank lender or commercial loan officer
- [`branch-manager-brief.md`](./branch-manager-brief.md) — for a branch manager or member-facing service lead
- [`compliance-brief.md`](./compliance-brief.md) — for a compliance officer or BSA/AML deputy
- [`bsa-officer-reference.md`](./bsa-officer-reference.md) — the shipped BSA kit, formatted as a template the SMEs can mirror

## Sign-off workflow

1. SME fills the brief and replies via email or shared doc.
2. The Institute's editorial pass (you or the relevant editor) confirms
   no banned phrases, no unsourced statistics, no marketing voice.
3. Engineer ports into `src/lib/my-toolbox/tools.ts`, adds tile +
   drawer entries to `src/app/my-toolbox/_body.html` if needed, and
   opens a PR that closes the matching slice of #184.
4. The kit card on `/my-toolbox` flips from metadata-only to
   functional adoption — selecting the role swaps the visible
   tool set on the shelf and grid.
