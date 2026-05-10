# Curriculum notes — Tool Calling (for Module 8)

Date: 2026-05-09
Source: https://machinelearningmastery.com/the-roadmap-to-mastering-tool-calling-in-ai-agents/
(Couldn't fetch the original — pulled via mirrors. Sanity-checked, not curriculum-grade.)

## Why this matters for AiBI-Practitioner

The article validates the primitive distinction we shipped on /education
(Models / Prompts / Skills / Agents). It does NOT translate the discipline
into banking. Module 8 (Agents and Workflow Thinking) should absorb the
parts the article skips.

## What the article says (one-liner per stage)

1. Tool definition + protocol — clear names, schemas, structured I/O
2. Execution + validation — input check, send result back to model
3. Error handling + parallelization — strategies that hold under scale
4. Catalog management + security + evaluation beyond end-to-end success

Frame: "Most AI agents demo well. Few ship real work." Failure is at the
tool-calling layer — wrong tool picked, malformed args, unhandled errors.

## What's worth taking

- The "demo well, ship few" critique is real and underrated
- Tool catalog management as audit-inspectable infrastructure
- Validates Models / Prompts / Skills / Agents as the right ladder

## What's missing — and where Module 8 should land

1. Zero regulatory framing. SR 11-7, TPRM, AIEOG AI Lexicon — none. Every
   external tool a model invokes is a third-party-model surface. This is
   THE banker lens.

2. Parallelization framed as perf optimization. Banking reality: two parallel
   tool calls touching the same record = race condition that violates audit
   trail integrity.

3. No human-in-the-loop discipline. Our content/curriculum/ai-agents.ts
   already names explicit human gates per Agent (/sar-from-alert queues for
   BSA officer review; /vendor-onboarding stops at model risk officer signoff).
   The article doesn't see this. It should be the spine of Module 8.

4. No bounded-authority concept. What gets a read tool vs write tool? What
   $-threshold flips a tool from draft to commit? At what confidence
   level does the agent refuse and escalate? For a $1B FI this is THE
   governance question.

5. No refusal/escalation evals. End-to-end task success is the easy metric.
   The hard one — and the one our curriculum should bake in — is: when
   the agent shouldn't have acted, did it refuse correctly? When uncertainty
   crossed threshold, did it escalate to the right human?

## Action item for Module 8 author

Add a short panel: "Tool calling and the boundary between Skills and Agents."
Anchor it on:
- Tool catalog as audit-inspectable infrastructure (the AIEOG AI Use Case
  Inventory translates directly here)
- Bounded authority (read vs write, draft vs commit, $-thresholds)
- Refusal and escalation as first-class evals, not afterthoughts
- Human-in-the-loop as a feature, not a fallback

## Verdict

Useful as confirmation the broader AI ecosystem is converging on the
primitive vocabulary we're using. Not useful as a curriculum source —
too engineering-flavored, no regulatory awareness. Read it as a sanity
check, not a syllabus.
