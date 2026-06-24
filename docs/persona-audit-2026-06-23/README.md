# Massive-Persona UX Audit — 2026-06-23

A comprehensive review of every user experience on the AI Banking Institute site,
conducted by simulating **100 diverse personas** (FI type × role × personality × source ×
goal × completion behavior) against the **real, code-grounded** site flows.

Branch: `massive-persona`. Read-only audit — no app code was changed.

## Contents
| Doc | What it is |
|---|---|
| [`00-flow-atlas.md`](./00-flow-atlas.md) | Ground truth: every route, gate, exact click-count, and known-broken surface, traced from code (sections A–G). |
| [`01-persona-roster.md`](./01-persona-roster.md) | The 100 personas, fully specified, with coverage check. |
| [`02-persona-outcomes.md`](./02-persona-outcomes.md) | All 100 walked: outcome (✅/⚠️/❌) + worst friction + severity, plus cross-cohort new issues. |
| [`03-action-items.md`](./03-action-items.md) | **The deliverable.** Prioritized fixes by largest gap, by website function, by clicks-to-value, and remaining polish. |

## How it was done
1. **Flow Atlas** — 7 agents read the actual code and mapped every flow with file:line evidence and exact click counts.
2. **Persona roster** — 100 personas authored across every diversity axis and all 14 completion-behavior buckets.
3. **Simulation** — 8 agents walked all 100 personas step-by-step through the real Atlas, recording clicks-to-value, friction, dead-ends, loops, and whether each reached their goal.
4. **Synthesis** — deduped, severity-ranked, organized as requested.

## Executive summary

**The top of the funnel works; the bottom does not.** Acquisition surfaces are strong — the
free assessment is a 1-click start (14 clicks to score, 12 of them intrinsic), resources are
well-stocked and 2 clicks away, provisioning is cleverly engineered, and the dashboard handles
empty states gracefully. **24 of 100 personas reached their goal cleanly** — almost all of them
resource-grabbers and free-assessment readers.

But **58 of 100 personas failed, bounced, or were stranded — 23 critically** — and the failures
are concentrated **after the click that matters**, in value-delivery, not in clicks:

1. **The certificate is unreachable.** Every learner who finishes the $295 course waits forever — no approval path, no issuance caller, broken PDF, a dashboard that falsely says "Verified," and an email that's never sent. The product's terminal promise cannot be delivered.
2. **Paid buyers get stranded.** Access is a single magic-link email + a password-less account; bank email gateways (the exact audience) filter it; the login page demands a password they never set; the webhook won't re-send; nobody can detect who's stuck.
3. **No retention loop exists.** Abandoners, idle buyers, never-starters, and mid-course quitters are never contacted again. The free assessment can't even be resumed cross-device.
4. **Team buyers ready to pay get a `mailto:`,** while the self-serve checkout machinery sits built-but-dark and the assisted card tells them the product "isn't ready."
5. **The interactive demos are convincing fakes** that persist nothing and damage credibility with the most technical, highest-intent evaluators.
6. **Every email-gated free download is broken** — the user surrenders an email and receives a 500.

**Clicks-to-value** (the flagged concern) is real but secondary: the wins are cheap — put
resources/role-playbooks one click from home and on the result page, give the $99 a visible
entry, drop one redirect hop, and un-bury the real demo.

**Recommended sequence:** fix the 6 largest gaps (Part 1 of the action items) before any paid
marketing push — they are where money is lost and trust is broken. Then the function-level P1s,
then the clicks-to-value and polish items.

See [`03-action-items.md`](./03-action-items.md) for the full prioritized plan with file
references and effort estimates.
