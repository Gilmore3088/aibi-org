# MailerLite Dashboard Runbook — finish the nurture build

What the API/connector already did, and the exact dashboard steps it could **not** do.
Account: hello@aibankinginstitute.com (ID 2331976). **Everything stays disabled until the SR 26-2 / SR 11-7 copy sweep is done.**

The per-step HTML is in the build guide (`nurture-build/index.html`) with **Copy HTML** buttons, or in `nurture-build/emails/` and `mailerlite-emails/`.

---

## ✅ Already done via the connector (no action needed)

- **5 resource segments created** (Governance, Compliance, Role, InfoSec, Lending).
- **5 resource automations created** as disabled drafts, each with the Day 1 / 4 / 8 / 14 cadence (delays 1·3·4·6 days) and subjects set.
- **4 assessment automations** confirmed present and disabled (Day 0/3/7 structure).
- Stray empty duplicate automation deleted.
- **Email files finalized:** Day-14 eyebrows unified into the series ("Tier · Day 14"); signature changed to "— James / The AI Banking Institute" across all 37 emails; Foundation CTA in `bm-day14` and `rts-day14-default` corrected to `/courses/foundation/program/purchase` (the real $295 checkout).

## ❌ Must be done in the dashboard (connector cannot)

The connector can create an email **step** (subject only) but **cannot author HTML**, set **segment filter rules**, add steps to **existing** automations, or set **exit conditions**. Those four things are below.

---

## STEP 1 — Set the 5 segment filter rules

Subscribers → Segments → open each → Edit conditions → add the single rule, save.

| Segment | Rule | Segment ID |
|---|---|---|
| Resource · Governance | `resource_category` **is** `governance` | 191402350108214805 |
| Resource · Compliance | `resource_category` **is** `compliance` | 191402350883112482 |
| Resource · Role | `resource_category` **is** `role` | 191402351693661759 |
| Resource · InfoSec | `resource_category` **is** `infosec` | 191402352441296472 |
| Resource · Lending | `resource_category` **is** `lending` | 191402353228777094 |

> These stay empty until the capture-code change writes `resource_category` on capture. That's expected.

---

## STEP 2 — Paste HTML into every email step

Open each automation, open each email step, add/replace a **Custom HTML** block, paste from the matching file, save. 37 blocks total.

### Assessment automations (existing — paste Day 0/3/7 if not already, then see Step 3 for Day 14)

| Automation (ID) | Step | Subject | File |
|---|---|---|---|
| **Starting Point** (186965478342657970) | Day 0 | Your assessment result: Starting Point | `mailerlite-emails/01-starting-point-day0.html` |
| | Day 3 | A 60-minute pilot you can run this week | `02-starting-point-day3.html` |
| | Day 7 | Three board-ready AI numbers | `03-starting-point-day7.html` |
| **Early Stage** (186965527420208336) | Day 0 | Your assessment result: Early Stage | `04-early-stage-day0.html` |
| | Day 3 | The one-page AI governance memo | `05-early-stage-day3.html` |
| | Day 7 | From Early Stage to Building Momentum: the 90-day arc | `06-early-stage-day7.html` |
| **Building Momentum** (186965564883732340) | Day 0 | Your assessment result: Building Momentum | `07-building-momentum-day0.html` |
| | Day 3 | The three rungs of the AI capability ladder | `08-building-momentum-day3.html` |
| | Day 7 | The habits of Ready to Scale | `09-building-momentum-day7.html` |
| **Ready to Scale** (186965601924679393) | Day 0 | Your assessment result: Ready to Scale | `10-ready-to-scale-day0.html` |
| | Day 3 | The institution-wide credential program | `11-ready-to-scale-day3.html` |
| | Day 7 | A standing invitation: Leadership Advisory | `12-ready-to-scale-day7.html` |

> If the Day 0/3/7 steps already contain their HTML in the dashboard, just verify and skip. Otherwise paste from the files above.

### Resource automations (new — paste all 4 each)

| Automation (ID) | Step | Subject | File |
|---|---|---|---|
| **Governance** (191402428503950531) | Day 1 | Your AI Governance Starter Kit — use this page first | `nurture-build/emails/gov-1.html` |
| | Day 4 | The control most AI governance skips | `gov-2.html` |
| | Day 8 | A checklist is not a readiness plan | `gov-3.html` |
| | Day 14 | Turn the kit into a 90-day AI governance plan | `gov-4.html` |
| **Compliance** (191402941140174185) | Day 1 | Your Compliance AI Playbook — start with the risk line | `comp-1.html` |
| | Day 4 | Documented is not the same as defensible | `comp-2.html` |
| | Day 8 | A checklist is not a readiness plan | `comp-3.html` |
| | Day 14 | From documented to defensible | `comp-4.html` |
| **Role Playbooks** (191402946493154812) | Day 1 | Your role playbook — run page one this week | `role-1.html` |
| | Day 4 | The part of the workflow most teams skip | `role-2.html` |
| | Day 8 | A playbook is a starting point, not a skill | `role-3.html` |
| | Day 14 | Build the skill behind the checklist | `role-4.html` |
| **InfoSec** (191402951610205261) | Day 1 | Your InfoSec AI kit — draw the data line first | `infosec-1.html` |
| | Day 4 | Approved tools are not enough | `infosec-2.html` |
| | Day 8 | A kit is not a readiness plan | `infosec-3.html` |
| | Day 14 | Approved tools are not enough | `infosec-4.html` |
| **Lending / BSA** (191402956528027530) | Day 1 | Your high-stakes AI review kit — start where the file has to hold up | `lend-1.html` |
| | Day 4 | The file has to prove the decision stayed human | `lend-2.html` |
| | Day 8 | A checklist is not a readiness plan | `lend-3.html` |
| | Day 14 | The file has to prove the decision stayed human | `lend-4.html` |

---

## STEP 3 — Add the Day-14 step to each assessment automation

In each assessment automation, after the Day-7 email add: a **Delay = 7 days**, then an **Email** with the subject + HTML below. (Lands Day 14.)

| Automation | Delay | Day-14 subject | File |
|---|---|---|---|
| Starting Point | 7 days | Make AI visible before you scale it | `nurture-build/emails/sp-day14.html` |
| Early Stage | 7 days | Turn your first controls into a 90-day plan | `es-day14.html` |
| Building Momentum | 7 days | Convert scattered AI wins into reusable capability | `bm-day14.html` |
| Ready to Scale | 7 days | Move from AI pilots to evidence | `rts-day14-default.html` |

**Team-intent variant (Ready to Scale):** for leads showing team intent (multiple from same domain, institution/pricing visit, reply), swap the Ready-to-Scale Day-14 step to `rts-day14-team.html` — subject "Move from AI pilots to institution evidence."

---

## STEP 4 — Set exit / suppression conditions

Per automation → Settings → exit/stop conditions.

**All 4 assessment automations:** stop when the subscriber **buys the $99 In-Depth** AND stop when they **enroll in Foundation** ($295). (Never pitch what they bought.)

**All 5 resource automations:** stop when **`tier_label` is set** (they completed the assessment — move them to the assessment track) · stop on **$99 purchase** · stop on **Foundation enrollment**.

> Prerequisite: the $99 purchase and Foundation enrollment must tag the subscriber (a group or field) so these conditions have something to reference. Confirm those "customer" signals exist before relying on suppression.

---

## STEP 5 — Test-send, then hold

- Send a test of each automation to **jlgilmore2@gmail.com** and **james.gilmore@csiweb.com**. (I can trigger test-sends via the connector once the HTML is in — just ask.)
- **Leave every automation OFF.** Do not enable until the SR 26-2 / SR 11-7 copy sweep is complete.

---

## Open flags

- **Foundation CTA in Day-7 emails** already uses the correct `/courses/foundation/program/purchase`. The Day-14 files were corrected to match. Confirm any other emails point at the checkout, not the course interior.
- **Resource segments populate only after** the capture-code change writes `resource_category` on capture. Until then the 5 resource automations have no one to enroll (fine for disabled drafts).
