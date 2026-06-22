# Sample Foundation Packet

## Workflow

**Name:** Branch procedure update message

**Purpose:** Turn approved internal procedure notes into a clear staff message with action, owner, and deadline.

**Owner:** Branch operations manager.

**First reuse:** Weekly branch operations updates.

## Reusable Asset

**Asset type:** Reusable prompt and review checklist.

**Prompt:**

> Rewrite these redacted internal procedure notes into a staff message for branch managers. Keep the facts unchanged. Use plain language. Put the action, owner, and deadline in the first three sentences. Do not add policy interpretation. Flag any missing owner, date, or approval source.

**Output shape:** 120-word staff message plus a review flag list.

## Boundaries

**Allowed inputs:**

- Approved procedure notes.
- Redacted operational reminders.
- Generic audience and deadline details.

**Blocked inputs:**

- Customer names, account numbers, or transaction details.
- Examiner comments.
- Unapproved policy interpretation.
- Confidential board or strategy material.

**Approved tool path:** Use the institution-approved AI workspace only.

## Human Review

**Reviewer role:** Branch operations manager.

**Review happens before:** Message is sent to branch managers.

**Stop rule:** Stop if the draft changes the policy meaning, invents an approval source, references customer-specific information, or omits the action owner.

## Evidence

- Source: approved procedure notes.
- Prompt version: v1.
- Raw output summary: AI produced a clear message but softened the deadline.
- Human edits: deadline restored, owner moved to first paragraph, approval source verified.
- Final output: saved in the branch operations folder.
- Review note: branch operations manager initials and date.

## Manager Question

Would a different branch operations manager know what inputs are safe, what to check, and when to stop before sending?
