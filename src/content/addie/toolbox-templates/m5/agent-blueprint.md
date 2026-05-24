# Agent Blueprint — The AI Banking Institute

| Field | Value |
| --- | --- |
| Learner | {{learner_name}} |
| Track | {{track_label}} |
| Date | {{date_iso}} |
| Version | v1 |
| Maturity | Draft · not for member-facing deployment |

A blueprint for a future agent — drafted while you are still in the
Foundation Course, so the shape is there when the rest of your bank is
ready to build it. This is the framing artifact from Lesson 5.1. Save
it at any point in Module 5.

The rule from Lesson 5.1 still governs: **today's agents are not
acceptable on member-facing banking flows.** Anything you draft here
is an internal-use prototype thought experiment, with a human review
point on every step that does real work.

---

## What the agent is for

{{agent_purpose}}

> One sentence. The outcome, not the architecture. "Reconcile end-of-day
> exception reports for the back office" is a purpose. "An agent that
> uses tools" is not.

## Trigger

{{trigger}}

> What kicks the agent off? A scheduled time, a file landing in a
> folder, a button a back-office reviewer presses, a queue going over
> a threshold. Be specific.

## Steps

The numbered loop. For each step, name what it reads, what it produces,
and whether it requires human review before the next step runs.

1. **{{step_1_name}}** — reads: {{step_1_reads}} · produces: {{step_1_produces}} · review: {{step_1_review}}
2. **{{step_2_name}}** — reads: {{step_2_reads}} · produces: {{step_2_produces}} · review: {{step_2_review}}
3. **{{step_3_name}}** — reads: {{step_3_reads}} · produces: {{step_3_produces}} · review: {{step_3_review}}
4. **{{step_4_name}}** — reads: {{step_4_reads}} · produces: {{step_4_produces}} · review: {{step_4_review}}

## Tools

What real systems the agent is allowed to touch. Read-only and
write-capable should be marked separately — write capability is where
the highest risk lives.

- {{tool_1}} ({{tool_1_access}})
- {{tool_2}} ({{tool_2_access}})
- {{tool_3}} ({{tool_3_access}})

## Guardrails

The rules the agent must never break. Phrase them as hard "must not"s.

- Must not act on customer records in a member-facing surface.
- Must not move money.
- Must not bypass the human review point on any write-capable step.
- {{custom_guardrail_1}}
- {{custom_guardrail_2}}

## Data discipline (banking-specific)

- No real customer PII in prompts, context, or logs.
- No material non-public information passed through.
- All data used for testing is **synthetic** — invented names,
  invented account shapes, invented amounts.

## Escalation point

When does the agent stop and call a human? Be explicit — vagueness
here is the difference between a useful tool and a runaway.

{{escalation_trigger}}

The human escalation owner is **{{escalation_owner}}**.

## What you would need to deploy this internally

A short list of the things that would have to be true before this
draft could become a real internal-only build. Use it as a checklist
in a future conversation.

- {{deploy_prereq_1}}
- {{deploy_prereq_2}}
- {{deploy_prereq_3}}

---

## The honesty line

This is a draft blueprint, not a deployment plan. Member-facing
flows are out of scope. Production deployment requires governance,
review, and approvals that are not part of the Foundation Course.

---

*Saved from Module 5 · AiBI-Foundation · The AI Banking Institute*
