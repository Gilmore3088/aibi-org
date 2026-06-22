# Module 6: Source-Grounded Workflow Drafts

Repair these prompts so document work stays tied to the source.

## Source Excerpt: Procedure Review

Approved source excerpt:

> Exceptions must be reviewed by the department manager within five business days. Exceptions older than 30 days require escalation to the operations director. The monthly summary should include count by age bucket, owner group, and unresolved root cause if documented in the source file.

Source limits:
- The excerpt does not define customer communication steps.
- The excerpt does not name a regulatory citation.
- The excerpt does not authorize automated closure.

## Weak Prompt 1

Summarize this procedure and tell me what we should do next.

Issues:
- No source-only rule.
- No output format.
- No not-in-source behavior.
- No human review step.

## Weak Prompt 2

Act as an expert examiner and write a policy summary with citations.

Issues:
- Asks for citations not present in the source.
- Role may invite invented authority.
- No circulation limit.

## Stronger Pattern

Use only the provided source. If the source does not answer, write "Not in source." Include section references or quoted phrases. Do not infer regulatory requirements. A human procedure owner reviews before circulation.
