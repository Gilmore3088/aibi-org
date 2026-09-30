# Persona wave — 100 synthetic buyers & learners

Run: 2026-09-30T08:04:06.694Z · base `http://localhost:3000` · seed 20260930 · 33 min · concurrency 4

## Headline

| Metric | Value |
|---|---|
| Reached first real value | **82/100 (82%)** |
| Median click-to-value | 2 clicks · 14s |
| Avg experience score (0–100) | 91 |
| Personas who hit a product dead end | 17 (22 dead ends total) |
| Rage-quits (frustration > tolerance) | 4 |
| Unique JS exceptions | 0 |
| Harness crashes / timeouts | 0 |

## By journey

| Journey | n | Reached value | Median clicks→value | Median secs→value | Median value index | Avg experience | Rage-quits |
|---|---|---|---|---|---|---|---|
| Buys course, samples 1-2 modules (`course-sampler`) | 10 | 10 (100%) | 1 | 11 | 8 | 96 | 0 |
| Buys course, stalls around module 3-5 (`course-quitter`) | 10 | 10 (100%) | 1 | 9 | 17 | 88 | 0 |
| Works through 6-12 modules (`course-steady`) | 10 | 10 (100%) | 1 | 8 | 36 | 91 | 1 |
| Completes all 18 modules + certificate (`course-completer`) | 10 | 10 (100%) | 1 | 5 | 76 | 60 | 3 |
| Evaluates the course and tries to buy (`course-shopper`) | 8 | 0 (0%) | — | — | 0 | 97 | 0 |
| Takes the free assessment (`free-assessment`) | 14 | 13 (93%) | 14 | 18 | 4 | 98 | 0 |
| Free assessment then $99 In-Depth (`assessment-to-indepth`) | 8 | 8 (100%) | 15 | 16 | 3 | 96 | 0 |
| Hunts for a free template/download (`resource-hunter`) | 10 | 9 (90%) | 5 | 44 | 3 | 93 | 0 |
| Tries the AI practice sandbox (`practice-tinkerer`) | 5 | 5 (100%) | 3 | 12 | 1 | 98 | 0 |
| Evaluates a team/institution rollout (`institution-buyer`) | 5 | 0 (0%) | — | — | 0 | 91 | 0 |
| Compares price and ROI, then decides (`pricing-skeptic`) | 5 | 5 (100%) | 0 | 21 | 2 | 94 | 0 |
| Verifies a certificate (`cert-verifier`) | 2 | 2 (100%) | 2 | 15 | 2 | 97 | 0 |
| Pure random walk, no goal (`explorer`) | 3 | 0 (0%) | — | — | 0 | 91 | 0 |

## Course: value actually delivered

- Learners: **40**; modules attempted **326/333** planned; 39 learners reached their planned depth.
- Try-step activities completed: **326/326**.
- Artifacts built (fields filled + save clicked): **320**; artifacts confirmed saved (2xx from API): **317**.
- Save API statuses: `201` ×317, `none` ×3.
- Completers reaching the certificate: **7/10**.

| # | Module | Attempted | Try done | Try widget | Build fields | Saved | Median time | Median clicks | Words | Save status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Module 1: What AI Can and Cannot Do | 40 | 40 | 0/4moves | 6 | 40 | 6s | 16 | 591 | 201 |
| 2 |  | 36 | 36 | 0/4moves | 6 | 35 | 8s | 20 | 842 | 201, none |
| 3 |  | 30 | 30 | 0/4moves | 2 | 24 | 57s | 71 | 935 | 201, — |
| 4 | Module 4: Build Your First Prompt | 28 | 28 | 0/4moves | 6 | 26 | 8s | 20 | 890 | 201, none |
| 5 | Module 5: Add Context and Constraints | 24 | 24 | 0/4moves | 6 | 24 | 8s | 20 | 860 | 201 |
| 6 | Module 6: Ask for Structured Output | 19 | 19 | 0/4moves | 6 | 19 | 6s | 16 | 568 | 201 |
| 7 | Module 7: Review AI Output Like a Banker | 17 | 17 | 0/4moves | 6 | 17 | 8s | 20 | 846 | 201 |
| 8 |  | 17 | 17 | 0/4moves | 6 | 17 | 8s | 20 | 844 | 201 |
| 9 | Module 9: Turn a Prompt Into a Template | 16 | 16 | 0/4moves | 6 | 16 | 8s | 20 | 873 | 201 |
| 10 | Module 10: Build a Role-Based Prompt | 14 | 14 | 0/4moves | 6 | 14 | 6s | 16 | 575 | 201 |
| 11 | Module 11: Choose the Right AI Use Case | 13 | 13 | 0/4moves | 6 | 13 | 8s | 20 | 859 | 201 |
| 12 | Module 12: Apply Data-Safety Boundaries | 12 | 12 | 0/4moves | 6 | 12 | 8s | 20 | 839 | 201 |
| 13 |  | 10 | 10 | 0/4moves | 6 | 10 | 6s | 16 | 649 | 201 |
| 14 | Module 14: Map a Workflow Before Automating | 10 | 10 | 0/4moves | 6 | 10 | 10s | 20 | 820 | 201 |
| 15 | Module 15: Set the Human Review Gate | 10 | 10 | 0/4moves | 7 | 10 | 6s | 17 | 872 | 201 |
| 16 | Module 16: Keep the Proof | 10 | 10 | 0/4moves | 7 | 10 | 8s | 17 | 578 | 201 |
| 17 | Module 17: Create the Reusable Workflow Kit | 10 | 10 | 0/4moves | 7 | 10 | 6s | 17 | 588 | 201 |
| 18 | Module 18: Final Foundation Packet Review | 10 | 10 | 0/4moves | 6 | 10 | 9s | 18 | 869 | 201 |

Example save failure: `none`

## Issues (product first, then environment-limited)

Severity: 1 = dead end, 0.5 = friction, 0.25 = minor. **Env** = caused by the test environment (no Supabase/Stripe/OpenAI keys, no outbound network) — verify on a preview deploy before treating as a product bug.

| Kind | Detail | Personas | Severity | Env | Where | Screenshot |
|---|---|---|---|---|---|---|
| console_error | Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.   Check the render method of `ModuleTabs | 36 | 0.5 |  | /courses/foundation/program/2 |  |
| api_http_error | 401 POST /api/sandbox/chat | 31 | 0.5 |  | /api/sandbox/chat |  |
| near_empty_page | /courses/foundation/program/certificate has 11 words | 9 | 1 |  | /courses/foundation/program/certificate |  |
| no_next_module_link | module 1 has no visible link to module 2 (mobile) | 16 | 0.5 |  | /courses/foundation/program/1, /courses/foundation/program/2, /courses/foundation/program/ | [png](shots/P001-01-no-next-module-link.png) |
| no_save_button | module 3: no save button in Build | 6 | 1 |  | /courses/foundation/program/3 | [png](shots/P026-03-no-save-button.png) |
| no_click_path | had to type URL /courses/foundation/program/certificate (find certificate) | 10 | 0.5 |  | /courses/foundation/program/certificate, / |  |
| slow_page | /courses/foundation/program took 18.8s | 13 | 0.25 |  | /courses/foundation/program | [png](shots/P005-01-slow-page.png) |
| slow_page | /courses/foundation/program/13 took 11.9s | 12 | 0.25 |  | /courses/foundation/program/13, /courses/foundation/program/1, /courses/foundation/program | [png](shots/P005-02-slow-page.png) |
| artifact_not_saved | module 2: none — no UI feedback | 3 | 1 |  | /courses/foundation/program/2, /courses/foundation/program/4 | [png](shots/P065-03-artifact-not-saved.png) |
| a11y_no_main_landmark | / has no <main> landmark (skip link targets a div) | 26 | 0 |  | / |  |
| slow_page | /courses/foundation/program/certificate took 14.9s | 9 | 0.25 |  | /courses/foundation/program/certificate |  |
| a11y_no_main_landmark | /assessment has no <main> landmark (skip link targets a div) | 18 | 0 |  | /assessment |  |
| slow_page | / took 10.2s | 7 | 0.25 |  | / | [png](shots/P011-01-slow-page.png) |
| a11y_no_main_landmark | /resources has no <main> landmark (skip link targets a div) | 17 | 0 |  | /resources |  |
| a11y_no_main_landmark | /courses has no <main> landmark (skip link targets a div) | 17 | 0 |  | /courses |  |
| no_click_path | had to type URL /assessment/in-depth (upgrade to In-Depth) | 3 | 0.5 |  | /assessment/in-depth | [png](shots/P009-02-no-click-path.png) |
| download_no_file | clicked download, no file or confirmation | 3 | 0.5 |  | /resources/prompting-foundation, /resources/templates/ai-use-policy-starter, /resources/te | [png](shots/P031-03-download-no-file.png) |
| slow_page | /playbooks/retail took 9.3s | 5 | 0.25 |  | /playbooks/retail | [png](shots/P003-01-slow-page.png) |
| slow_page | /resources took 12.4s | 5 | 0.25 |  | /resources | [png](shots/P031-01-slow-page.png) |
| a11y_no_main_landmark | /playbooks/retail has no <main> landmark (skip link targets a div) | 12 | 0 |  | /playbooks/retail |  |
| no_click_path | had to type URL /assessment/take (start assessment) | 2 | 0.5 |  | /assessment/take | [png](shots/P009-01-no-click-path.png) |
| no_click_path | had to type URL /courses (Training nav) | 2 | 0.5 |  | /courses | [png](shots/P018-01-no-click-path.png) |
| near_empty_page | /api/resources/bsa-aml-playbook/download has 3 words | 1 | 1 |  | /api/resources/bsa-aml-playbook/download | [png](shots/P029-02-near-empty-page.png) |
| slow_page | /courses took 11.6s | 4 | 0.25 |  | /courses | [png](shots/P030-02-slow-page.png) |
| slow_page | /assessment/take took 12.9s | 4 | 0.25 |  | /assessment/take | [png](shots/P034-01-slow-page.png) |
| missing_cta | no contact/pilot CTA on institutions page | 1 | 1 |  | /assessment/take | [png](shots/P057-01-missing-cta.png) |
| no_inquiry_form | no form after institution CTA (/assessment/take) | 1 | 1 |  | /assessment/take | [png](shots/P057-02-no-inquiry-form.png) |
| no_click_path | had to type URL /pricing (Pricing nav) | 2 | 0.5 |  | /pricing | [png](shots/P066-01-no-click-path.png) |
| navigation_failed | /courses/foundation/program/certificate: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/courses/foundation/program/certificate | 1 | 1 |  | /courses/foundation/program |  |
| a11y_no_main_landmark | /for-institutions has no <main> landmark (skip link targets a div) | 9 | 0 |  | /for-institutions |  |
| a11y_no_main_landmark | /practice has no <main> landmark (skip link targets a div) | 8 | 0 |  | /practice |  |
| slow_page | /for-institutions took 10.6s | 3 | 0.25 |  | /for-institutions | [png](shots/P019-01-slow-page.png) |
| slow_page | /practice took 9.2s | 3 | 0.25 |  | /practice | [png](shots/P030-01-slow-page.png) |
| slow_page | /verify took 10.4s | 2 | 0.25 |  | /verify | [png](shots/P021-01-slow-page.png) |
| unclickable | open resource: locator.click: Timeout 6000ms exceeded. | 1 | 0.5 |  | /resources/prompting-foundation | [png](shots/P031-02-unclickable.png) |
| unclickable | Pricing nav: locator.click: Timeout 6000ms exceeded. | 1 | 0.5 |  | /pricing | [png](shots/P048-01-unclickable.png) |
| slow_page | /pricing took 18.9s | 2 | 0.25 |  | /pricing | [png](shots/P066-02-slow-page.png) |
| slow_page | /assessment took 17.0s | 2 | 0.25 |  | /assessment | [png](shots/P070-05-slow-page.png) |
| no_next_module_link | module 1 has no visible link to module 2 (desktop) | 1 | 0.5 |  | / | [png](shots/P071-03-no-next-module-link.png) |
| unclickable | download resource: locator.click: Timeout 6000ms exceeded. | 1 | 0.5 |  | /prompt-cards | [png](shots/P073-04-unclickable.png) |
| no_click_path | had to type URL /practice (Practice nav) | 1 | 0.5 |  | /practice | [png](shots/P088-01-no-click-path.png) |
| no_click_path | had to type URL /for-institutions (For Institutions nav) | 1 | 0.5 |  | /for-institutions | [png](shots/P099-01-no-click-path.png) |
| console_error | A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client | 1 | 0.5 |  | /for-institutions |  |
| a11y_no_main_landmark | /security/data-handling has no <main> landmark (skip link targets a div) | 4 | 0 |  | /security/data-handling |  |
| a11y_no_main_landmark | /resources/templates/ai-use-policy-starter has no <main> landmark (skip link targets a div) | 4 | 0 |  | /resources/templates/ai-use-policy-starter |  |
| slow_page | /courses/foundation/program/toolkit took 10.6s | 1 | 0.25 |  | /courses/foundation/program/toolkit | [png](shots/P001-06-slow-page.png) |
| slow_page | /api/resources/bsa-aml-playbook/download took 12.1s | 1 | 0.25 |  | /api/resources/bsa-aml-playbook/download | [png](shots/P029-01-slow-page.png) |
| slow_page | /resources/templates/board-briefing-checklist took 12.4s | 1 | 0.25 |  | /resources/templates/board-briefing-checklist | [png](shots/P031-04-slow-page.png) |
| slow_page | /assessment/in-depth took 12.4s | 1 | 0.25 |  | /assessment/in-depth | [png](shots/P052-01-slow-page.png) |
| slow_page | /resources/templates/ai-use-policy-starter took 15.5s | 1 | 0.25 |  | /resources/templates/ai-use-policy-starter | [png](shots/P064-02-slow-page.png) |
| slow_page | /courses/foundation/program/purchase took 15.1s | 1 | 0.25 |  | /courses/foundation/program/purchase | [png](shots/P066-03-slow-page.png) |
| slow_page | /prompt-cards took 12.3s | 1 | 0.25 |  | /prompt-cards | [png](shots/P069-03-slow-page.png) |
| slow_page | /playbooks/bsa-aml/sar-narrative-template took 26.4s | 1 | 0.25 |  | /playbooks/bsa-aml/sar-narrative-template | [png](shots/P069-05-slow-page.png) |
| slow_page | /playbooks took 16.6s | 1 | 0.25 |  | /playbooks | [png](shots/P069-06-slow-page.png) |
| slow_page | /security took 18.2s | 1 | 0.25 |  | /security | [png](shots/P070-02-slow-page.png) |
| slow_page | /references took 11.3s | 1 | 0.25 |  | /references | [png](shots/P070-04-slow-page.png) |
| slow_page | /security/it-approval took 9.0s | 1 | 0.25 |  | /security/it-approval | [png](shots/P070-06-slow-page.png) |
| slow_page | /playbooks/lending took 11.7s | 1 | 0.25 |  | /playbooks/lending | [png](shots/P079-03-slow-page.png) |
| a11y_no_main_landmark | /verify has no <main> landmark (skip link targets a div) | 2 | 0 |  | /verify |  |
| a11y_no_main_landmark | /playbooks/lending has no <main> landmark (skip link targets a div) | 2 | 0 |  | /playbooks/lending |  |

## Outcomes

- frustration: 4
- behavior: 36
- goal-finished: 56
- patience: 4

Rage-quit triggers:
- 3 × frustrated after near_empty_page
- 1 × frustrated after artifact_not_saved

## Every persona

| ID | Persona | Source → entry | Journey | First value | Clicks→value | Secs→value | Value idx | Exp | Dead ends | Outcome |
|---|---|---|---|---|---|---|---|---|---|---|
| P001 | Compliance Officer · MDI · overwhelmed, low tech · mobile | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 8s | 72 | 62 | 1 | frustration: frustrated after near_empty_page (/courses/foundation/program/certificate has 11 |
| P002 | CEO · Credit union <$250M · box-checker · mobile | HR enrollment email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 8s | 8 | 98 | 0 | behavior: stopped after module 2 (planned depth) |
| P003 | Innovation Officer · Community bank $1B-$10B · skeptic, ROI-driven · desktop | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 15 | 15s | 4 | 97 | 0 | goal-finished: journey completed |
| P004 | Compliance Officer · CDFI · time-starved · mobile | Trade newsletter → `/resources` | practice-tinkerer | practice_sample_output | 3 | 12s | 1 | 100 | 0 | goal-finished: journey completed |
| P005 | Teller / MSR · De novo bank · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 28s | 4 | 94 | 0 | behavior: stopped after module 1 (planned depth) |
| P006 | HR / L&D Director · Credit union $1B+ · box-checker · desktop | Typed URL → `/` | free-assessment | assessment_score | 17 | 16s | 4 | 100 | 0 | goal-finished: journey completed |
| P007 | Board Director · Community bank $1B-$10B · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-steady (9) | module_content | 1 | 4s | 36 | 97 | 0 | behavior: stopped after module 9 (planned depth) |
| P008 | Deposit Ops Manager · Credit union <$250M · skeptic, ROI-driven · desktop | Conference QR code → `/assessment` | free-assessment | assessment_score | 14 | 13s | 4 | 100 | 0 | goal-finished: journey completed |
| P009 | Data Analyst · Community bank <$250M · eager early adopter · desktop | Peer referral → `/courses` | assessment-to-indepth | assessment_score | 17 | 26s | 4 | 88 | 0 | goal-finished: journey completed |
| P010 | Deposit Ops Manager · Trust company · eager early adopter · desktop | Google search → `/` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P011 | Consumer Lender · CDFI · skeptic, ROI-driven · desktop | Typed URL → `/` | assessment-to-indepth | assessment_score | 15 | 23s | 3 | 97 | 0 | goal-finished: journey completed |
| P012 | Branch Manager · Trust company · overwhelmed, low tech · desktop | Peer referral → `/courses` | free-assessment | assessment_score | 15 | 13s | 4 | 100 | 0 | goal-finished: journey completed |
| P013 | Chief Risk Officer · Credit union $1B+ · time-starved · desktop | Trade newsletter → `/resources` | assessment-to-indepth | assessment_score | 15 | 16s | 3 | 100 | 0 | patience: click budget exhausted |
| P014 | HR / L&D Director · Mutual / thrift · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-steady (6) | module_content | 1 | 3s | 24 | 97 | 0 | behavior: stopped after module 6 (planned depth) |
| P015 | Compliance Officer · Mutual / thrift · detail-oriented · desktop | Purchase receipt email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 4s | 8 | 97 | 0 | behavior: stopped after module 2 (planned depth) |
| P016 | Compliance Officer · MDI · cautious, security-first · desktop | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 13 | 11s | 4 | 100 | 0 | goal-finished: journey completed |
| P017 | Deposit Ops Manager · Community bank <$250M · skeptic, ROI-driven · desktop | Trade newsletter → `/resources` | assessment-to-indepth | assessment_score | 14 | 21s | 3 | 91 | 0 | goal-finished: journey completed |
| P018 | Innovation Officer · Credit union <$250M · skeptic, ROI-driven · desktop | Retargeting ad → `/assessment/take` | course-shopper | **none** | — | — | 0 | 94 | 0 | goal-finished: journey completed |
| P019 | HR / L&D Director · Bankers' bank · skeptic, ROI-driven · desktop | Google search → `/` | institution-buyer | **none** | — | — | 0 | 97 | 0 | goal-finished: journey completed |
| P020 | Data Analyst · De novo bank · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 6s | 77 | 67 | 1 | behavior: stopped after module 18 (planned depth) |
| P021 | Deposit Ops Manager · Community bank $1B-$10B · cautious, security-first · mobile | Typed URL → `/verify` | cert-verifier | verify_answer | 2 | 15s | 2 | 97 | 0 | goal-finished: journey completed |
| P022 | Branch Manager · Credit union $250M-$1B · skeptic, ROI-driven · mobile | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 4s | 72 | 59 | 1 | frustration: frustrated after near_empty_page (/courses/foundation/program/certificate has 11 |
| P023 | Deposit Ops Manager · MDI · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 3s | 4 | 100 | 0 | behavior: stopped after module 1 (planned depth) |
| P024 | Operations Specialist · MDI · skeptic, ROI-driven · desktop | Conference QR code → `/assessment` | institution-buyer | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P025 | Chief Risk Officer · Community bank $250M-$1B · detail-oriented · desktop | Trade newsletter → `/resources` | resource-hunter | resource_download | 5 | 44s | 3 | 100 | 0 | goal-finished: journey completed |
| P026 | Teller / MSR · Community bank $250M-$1B · skeptic, ROI-driven · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (5) | module_content | 1 | 8s | 18 | 77 | 1 | behavior: stopped after module 5 (planned depth) |
| P027 | Chief Risk Officer · Credit union $1B+ · skeptic, ROI-driven · desktop | Board forwarded link → `/assessment` | free-assessment | assessment_score | 14 | 21s | 4 | 100 | 0 | goal-finished: journey completed |
| P028 | Consumer Lender · Community bank <$250M · time-starved · mobile | Board forwarded link → `/assessment` | assessment-to-indepth | assessment_score | 15 | 13s | 3 | 100 | 0 | patience: click budget exhausted |
| P029 | Consumer Lender · Community bank $1B-$10B · skeptic, ROI-driven · mobile | Google search → `/` | resource-hunter | resource_download | 4 | 29s | 3 | 79 | 1 | goal-finished: journey completed |
| P030 | Consumer Lender · Credit union <$250M · eager early adopter · desktop | Board forwarded link → `/assessment` | explorer | **none** | — | — | 0 | 94 | 0 | goal-finished: journey completed |
| P031 | BSA/AML Officer · CDFI · cautious, security-first · desktop | LinkedIn post → `/` | resource-hunter | resource_download | 5 | 75s | 3 | 90 | 0 | goal-finished: journey completed |
| P032 | Commercial Lender · Trust company · time-starved · desktop | Purchase receipt email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 13s | 8 | 94 | 0 | behavior: stopped after module 2 (planned depth) |
| P033 | CIO / IT Manager · Trust company · box-checker · mobile | Google search → `/` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P034 | HR / L&D Director · Credit union $250M-$1B · cautious, security-first · desktop | Retargeting ad → `/assessment/take` | pricing-skeptic | pricing_understood | 2 | 21s | 2 | 97 | 0 | goal-finished: journey completed |
| P035 | Consumer Lender · Bankers' bank · overwhelmed, low tech · desktop | Purchase receipt email → `/courses/foundation/program` | course-steady (8) | module_content | 1 | 14s | 32 | 94 | 0 | behavior: stopped after module 8 (planned depth) |
| P036 | Compliance Officer · Bankers' bank · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-quitter (3) | module_content | 2 | 9s | 12 | 97 | 0 | behavior: stopped after module 3 (planned depth) |
| P037 | BSA/AML Officer · De novo bank · time-starved · mobile | Purchase receipt email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 3s | 8 | 95 | 0 | behavior: stopped after module 2 (planned depth) |
| P038 | Internal Auditor · Community bank $1B-$10B · time-starved · mobile | Conference QR code → `/assessment` | free-assessment | **none** | — | — | 0 | 100 | 0 | patience: click budget exhausted |
| P039 | Chief Risk Officer · MDI · time-starved · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (4) | module_content | 1 | 9s | 16 | 95 | 0 | behavior: stopped after module 4 (planned depth) |
| P040 | Operations Specialist · Community bank $250M-$1B · detail-oriented · desktop | Board forwarded link → `/assessment` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P041 | Chief Risk Officer · Community bank <$250M · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 3s | 75 | 52 | 2 | behavior: stopped after module 18 (planned depth) |
| P042 | COO · Credit union $1B+ · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-quitter (5) | module_content | 1 | 4s | 18 | 79 | 1 | behavior: stopped after module 5 (planned depth) |
| P043 | CFO · CDFI · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-quitter (5) | module_content | 1 | 8s | 20 | 97 | 0 | behavior: stopped after module 5 (planned depth) |
| P044 | CFO · MDI · curious browser · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (5) | module_content | 3 | 4s | 20 | 95 | 0 | behavior: stopped after module 5 (planned depth) |
| P045 | HR / L&D Director · Credit union <$250M · time-starved · mobile | Peer referral → `/courses` | practice-tinkerer | practice_sample_output | 3 | 27s | 1 | 97 | 0 | goal-finished: journey completed |
| P046 | BSA/AML Officer · Community bank $1B-$10B · time-starved · mobile | Peer referral → `/courses` | practice-tinkerer | practice_sample_output | 3 | 12s | 1 | 100 | 0 | goal-finished: journey completed |
| P047 | Marketing Lead · De novo bank · curious browser · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 3s | 4 | 100 | 0 | behavior: stopped after module 1 (planned depth) |
| P048 | CEO · MDI · curious browser · mobile | LinkedIn post → `/` | pricing-skeptic | pricing_understood | 0 | 9s | 2 | 98 | 0 | goal-finished: journey completed |
| P049 | COO · Mutual / thrift · overwhelmed, low tech · desktop | Conference QR code → `/assessment` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P050 | Chief Risk Officer · CDFI · box-checker · desktop | Peer referral → `/courses` | free-assessment | assessment_score | 14 | 36s | 4 | 88 | 0 | goal-finished: journey completed |
| P051 | Consumer Lender · Mutual / thrift · eager early adopter · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 18s | 4 | 97 | 0 | behavior: stopped after module 1 (planned depth) |
| P052 | Compliance Officer · De novo bank · box-checker · desktop | Conference QR code → `/assessment` | assessment-to-indepth | assessment_score | 14 | 15s | 3 | 97 | 0 | goal-finished: journey completed |
| P053 | CEO · Trust company · detail-oriented · mobile | HR enrollment email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 24s | 8 | 95 | 0 | behavior: stopped after module 2 (planned depth) |
| P054 | Commercial Lender · Community bank $250M-$1B · box-checker · desktop | Conference QR code → `/assessment` | free-assessment | assessment_score | 14 | 20s | 4 | 100 | 0 | goal-finished: journey completed |
| P055 | Internal Auditor · CDFI · skeptic, ROI-driven · desktop | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 16 | 18s | 3 | 100 | 0 | goal-finished: journey completed |
| P056 | Compliance Officer · CDFI · skeptic, ROI-driven · mobile | Conference QR code → `/assessment` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P057 | Chief Risk Officer · Community bank $250M-$1B · curious browser · desktop | Board forwarded link → `/assessment` | institution-buyer | **none** | — | — | 0 | 64 | 2 | goal-finished: journey completed |
| P058 | Commercial Lender · De novo bank · detail-oriented · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (11) | module_content | 2 | 7s | 44 | 95 | 0 | behavior: stopped after module 11 (planned depth) |
| P059 | BSA/AML Officer · Community bank $1B-$10B · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 4s | 77 | 70 | 1 | behavior: stopped after module 18 (planned depth) |
| P060 | Consumer Lender · Community bank $1B-$10B · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 4s | 77 | 67 | 1 | behavior: stopped after module 18 (planned depth) |
| P061 | Consumer Lender · Community bank $250M-$1B · cautious, security-first · mobile | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 3s | 70 | 41 | 2 | frustration: frustrated after near_empty_page (/courses/foundation/program/certificate has 11 |
| P062 | Consumer Lender · Credit union $1B+ · cautious, security-first · mobile | Trade newsletter → `/resources` | free-assessment | assessment_score | 14 | 25s | 4 | 94 | 0 | goal-finished: journey completed |
| P063 | CEO · Mutual / thrift · box-checker · desktop | HR enrollment email → `/courses/foundation/program` | course-steady (12) | module_content | 1 | 10s | 48 | 88 | 0 | behavior: stopped after module 12 (planned depth) |
| P064 | Operations Specialist · Community bank $250M-$1B · overwhelmed, low tech · desktop | LinkedIn post → `/` | resource-hunter | resource_download | 4 | 54s | 3 | 94 | 0 | goal-finished: journey completed |
| P065 | COO · MDI · cautious, security-first · desktop | HR enrollment email → `/courses/foundation/program` | course-quitter (4) | module_content | 2 | 25s | 14 | 76 | 1 | behavior: stopped after module 4 (planned depth) |
| P066 | CISO · Mutual / thrift · curious browser · desktop | Retargeting ad → `/assessment/take` | pricing-skeptic | pricing_understood | 0 | 21s | 2 | 88 | 0 | goal-finished: journey completed |
| P067 | Operations Specialist · CDFI · time-starved · mobile | HR enrollment email → `/courses/foundation/program` | course-steady (11) | module_content | 1 | 4s | 12 | 59 | 2 | frustration: frustrated after artifact_not_saved (module 4: none — no UI feedback) |
| P068 | CFO · Credit union <$250M · time-starved · mobile | Typed URL → `/` | free-assessment | assessment_score | 15 | 16s | 3 | 100 | 0 | patience: click budget exhausted |
| P069 | Operations Specialist · Community bank $1B-$10B · eager early adopter · desktop | Google search → `/` | resource-hunter | resource_download | 6 | 93s | 3 | 83 | 0 | goal-finished: journey completed |
| P070 | Innovation Officer · Credit union $250M-$1B · detail-oriented · desktop | Peer referral → `/courses` | explorer | **none** | — | — | 0 | 82 | 0 | goal-finished: journey completed |
| P071 | CIO / IT Manager · Community bank <$250M · curious browser · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 23s | 8 | 86 | 0 | behavior: stopped after module 2 (planned depth) |
| P072 | Internal Auditor · CDFI · curious browser · mobile | Retargeting ad → `/assessment/take` | pricing-skeptic | pricing_understood | 0 | 33s | 2 | 85 | 0 | goal-finished: journey completed |
| P073 | CFO · Community bank $1B-$10B · curious browser · desktop | Google search → `/` | resource-hunter | resource_download | 6 | 80s | 3 | 90 | 0 | goal-finished: journey completed |
| P074 | BSA/AML Officer · Community bank $1B-$10B · detail-oriented · desktop | Conference QR code → `/assessment` | course-shopper | **none** | — | — | 0 | 85 | 0 | goal-finished: journey completed |
| P075 | Internal Auditor · Credit union <$250M · eager early adopter · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (4) | module_content | 1 | 42s | 14 | 74 | 1 | behavior: stopped after module 4 (planned depth) |
| P076 | Operations Specialist · Mutual / thrift · overwhelmed, low tech · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (12) | module_content | 1 | 42s | 48 | 89 | 0 | behavior: stopped after module 12 (planned depth) |
| P077 | CEO · Community bank $1B-$10B · box-checker · desktop | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 6s | 77 | 67 | 1 | behavior: stopped after module 18 (planned depth) |
| P078 | CEO · Trust company · eager early adopter · desktop | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 2 | 5s | 77 | 70 | 1 | behavior: stopped after module 18 (planned depth) |
| P079 | BSA/AML Officer · De novo bank · overwhelmed, low tech · desktop | LinkedIn post → `/` | resource-hunter | resource_download | 3 | 31s | 3 | 91 | 0 | goal-finished: journey completed |
| P080 | Operations Specialist · MDI · box-checker · desktop | Board forwarded link → `/assessment` | free-assessment | assessment_score | 16 | 20s | 4 | 100 | 0 | goal-finished: journey completed |
| P081 | Deposit Ops Manager · MDI · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 6s | 75 | 49 | 2 | behavior: stopped after module 18 (planned depth) |
| P082 | COO · Mutual / thrift · box-checker · mobile | Typed URL → `/verify` | cert-verifier | verify_answer | 2 | 14s | 2 | 97 | 0 | goal-finished: journey completed |
| P083 | Commercial Lender · Credit union <$250M · skeptic, ROI-driven · desktop | LinkedIn post → `/` | course-shopper | **none** | — | — | 0 | 94 | 0 | goal-finished: journey completed |
| P084 | Data Analyst · Credit union <$250M · cautious, security-first · desktop | Trade newsletter → `/resources` | explorer | **none** | — | — | 0 | 97 | 0 | goal-finished: journey completed |
| P085 | Branch Manager · Credit union <$250M · skeptic, ROI-driven · mobile | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 13 | 21s | 4 | 94 | 0 | goal-finished: journey completed |
| P086 | Consumer Lender · De novo bank · eager early adopter · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (5) | module_content | 2 | 15s | 20 | 92 | 0 | behavior: stopped after module 5 (planned depth) |
| P087 | CFO · Credit union $250M-$1B · overwhelmed, low tech · desktop | HR enrollment email → `/courses/foundation/program` | course-steady (6) | module_content | 2 | 4s | 24 | 97 | 0 | behavior: stopped after module 6 (planned depth) |
| P088 | Operations Specialist · Bankers' bank · time-starved · desktop | Retargeting ad → `/assessment/take` | practice-tinkerer | practice_sample_output | 1 | 19s | 1 | 91 | 0 | goal-finished: journey completed |
| P089 | Operations Specialist · Community bank $250M-$1B · skeptic, ROI-driven · desktop | LinkedIn post → `/` | assessment-to-indepth | assessment_score | 17 | 15s | 3 | 94 | 0 | goal-finished: journey completed |
| P090 | Compliance Officer · Community bank $250M-$1B · time-starved · mobile | Board forwarded link → `/assessment` | assessment-to-indepth | assessment_score | 14 | 15s | 3 | 100 | 0 | goal-finished: journey completed |
| P091 | Branch Manager · Credit union $1B+ · skeptic, ROI-driven · desktop | Google search → `/` | resource-hunter | resource_download | 6 | 42s | 3 | 100 | 0 | goal-finished: journey completed |
| P092 | Data Analyst · Community bank <$250M · time-starved · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (9) | module_content | 2 | 9s | 36 | 95 | 0 | behavior: stopped after module 9 (planned depth) |
| P093 | Internal Auditor · MDI · skeptic, ROI-driven · desktop | HR enrollment email → `/courses/foundation/program` | course-quitter (3) | module_content | 1 | 6s | 12 | 100 | 0 | behavior: stopped after module 3 (planned depth) |
| P094 | Data Analyst · Community bank $1B-$10B · eager early adopter · mobile | Board forwarded link → `/assessment` | practice-tinkerer | practice_sample_output | 3 | 11s | 1 | 100 | 0 | goal-finished: journey completed |
| P095 | Compliance Officer · Trust company · skeptic, ROI-driven · desktop | Peer referral → `/courses` | pricing-skeptic | pricing_understood | 1 | 5s | 2 | 100 | 0 | goal-finished: journey completed |
| P096 | Board Director · MDI · curious browser · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (10) | module_content | 2 | 8s | 40 | 95 | 0 | behavior: stopped after module 10 (planned depth) |
| P097 | CEO · CDFI · time-starved · mobile | LinkedIn post → `/` | resource-hunter | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P098 | Chief Risk Officer · CDFI · curious browser · mobile | Peer referral → `/courses` | institution-buyer | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P099 | Operations Specialist · Community bank <$250M · overwhelmed, low tech · desktop | Retargeting ad → `/assessment/take` | institution-buyer | **none** | — | — | 0 | 94 | 0 | goal-finished: journey completed |
| P100 | BSA/AML Officer · Community bank <$250M · time-starved · mobile | Google search → `/` | resource-hunter | resource_download | 2 | 6s | 3 | 100 | 0 | goal-finished: journey completed |
