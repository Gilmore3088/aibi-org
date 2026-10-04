# Persona wave — 100 synthetic buyers & learners

Run: 2026-10-03T15:27:23.713Z · base `http://localhost:3000` · seed 20260930 · 39 min · concurrency 3

## Headline

| Metric | Value |
|---|---|
| Reached first real value | **80/100 (80%)** |
| Median click-to-value | 2 clicks · 13s |
| Avg experience score (0–100) | 96 |
| Personas who hit a product dead end | 4 (4 dead ends total) |
| Rage-quits (frustration > tolerance) | 2 |
| Unique JS exceptions | 0 |
| Harness crashes / timeouts | 0 |

## By journey

| Journey | n | Reached value | Median clicks→value | Median secs→value | Median value index | Avg experience | Rage-quits |
|---|---|---|---|---|---|---|---|
| Buys course, samples 1-2 modules (`course-sampler`) | 10 | 10 (100%) | 1 | 8 | 8 | 99 | 0 |
| Buys course, stalls around module 3-5 (`course-quitter`) | 10 | 10 (100%) | 1 | 5 | 18 | 99 | 0 |
| Works through 6-12 modules (`course-steady`) | 10 | 10 (100%) | 1 | 10 | 38 | 96 | 0 |
| Completes all 18 modules + certificate (`course-completer`) | 10 | 10 (100%) | 1 | 4 | 77 | 96 | 0 |
| Evaluates the course and tries to buy (`course-shopper`) | 8 | 0 (0%) | — | — | 0 | 98 | 0 |
| Takes the free assessment (`free-assessment`) | 14 | 13 (93%) | 15 | 18 | 4 | 99 | 0 |
| Free assessment then $99 In-Depth (`assessment-to-indepth`) | 8 | 7 (88%) | 15 | 14 | 3 | 95 | 1 |
| Hunts for a free template/download (`resource-hunter`) | 10 | 9 (90%) | 4 | 30 | 6 | 91 | 1 |
| Tries the AI practice sandbox (`practice-tinkerer`) | 5 | 5 (100%) | 3 | 14 | 1 | 99 | 0 |
| Evaluates a team/institution rollout (`institution-buyer`) | 5 | 0 (0%) | — | — | 0 | 94 | 0 |
| Compares price and ROI, then decides (`pricing-skeptic`) | 5 | 5 (100%) | 2 | 12 | 2 | 95 | 0 |
| Verifies a certificate (`cert-verifier`) | 2 | 1 (50%) | 2 | 11 | 1 | 90 | 0 |
| Pure random walk, no goal (`explorer`) | 3 | 0 (0%) | — | — | 0 | 85 | 0 |

## Course: value actually delivered

- Learners: **40**; modules attempted **333/333** planned; 40 learners reached their planned depth.
- Try-step activities completed: **333/333**.
- Artifacts built (fields filled + save clicked): **333**; artifacts confirmed saved (2xx from API): **333**.
- Save API statuses: `201` ×333.
- Completers reaching the certificate: **10/10**.

| # | Module | Attempted | Try done | Try widget | Build fields | Saved | Median time | Median clicks | Words | Save status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Module 1: What AI Can and Cannot Do | 40 | 40 | 0/4moves | 6 | 40 | 6s | 16 | 591 | 201 |
| 2 | Module 2: Rewrite a Low-Risk Message | 36 | 36 | 0/4moves | 6 | 36 | 8s | 20 | 842 | 201 |
| 3 |  | 30 | 30 | 0/4moves | 0 | 30 | 37s | 68 | 935 | 201 |
| 4 | Module 4: Build Your First Prompt | 28 | 28 | 0/4moves | 6 | 28 | 8s | 20 | 890 | 201 |
| 5 | Module 5: Add Context and Constraints | 25 | 25 | 0/4moves | 6 | 25 | 8s | 20 | 860 | 201 |
| 6 | Module 6: Ask for Structured Output | 20 | 20 | 0/4moves | 6 | 20 | 6s | 16 | 568 | 201 |
| 7 |  | 18 | 18 | 0/4moves | 6 | 18 | 8s | 20 | 846 | 201 |
| 8 |  | 18 | 18 | 0/4moves | 6 | 18 | 8s | 16 | 844 | 201 |
| 9 | Module 9: Turn a Prompt Into a Template | 17 | 17 | 0/4moves | 6 | 17 | 8s | 20 | 873 | 201 |
| 10 | Module 10: Build a Role-Based Prompt | 15 | 15 | 0/4moves | 6 | 15 | 5s | 16 | 575 | 201 |
| 11 | Module 11: Choose the Right AI Use Case | 14 | 14 | 0/4moves | 6 | 14 | 8s | 20 | 859 | 201 |
| 12 | Module 12: Apply Data-Safety Boundaries | 12 | 12 | 0/4moves | 6 | 12 | 7s | 20 | 839 | 201 |
| 13 | Module 13: Build a Simple Reusable Skill | 10 | 10 | 0/4moves | 6 | 10 | 5s | 16 | 649 | 201 |
| 14 | Module 14: Map a Workflow Before Automating | 10 | 10 | 0/4moves | 6 | 10 | 8s | 20 | 820 | 201 |
| 15 | Module 15: Set the Human Review Gate | 10 | 10 | 0/4moves | 7 | 10 | 8s | 17 | 872 | 201 |
| 16 | Module 16: Keep the Proof | 10 | 10 | 0/4moves | 7 | 10 | 5s | 17 | 578 | 201 |
| 17 | Module 17: Create the Reusable Workflow Kit | 10 | 10 | 0/4moves | 7 | 10 | 6s | 17 | 588 | 201 |
| 18 | Module 18: Final Foundation Packet Review | 10 | 10 | 0/4moves | 6 | 10 | 8s | 20 | 869 | 201 |

## Issues (product first, then environment-limited)

Severity: 1 = dead end, 0.5 = friction, 0.25 = minor. **Env** = caused by the test environment (no Supabase/Stripe/OpenAI keys, no outbound network) — verify on a preview deploy before treating as a product bug.

| Kind | Detail | Personas | Severity | Env | Where | Screenshot |
|---|---|---|---|---|---|---|
| console_error | Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.   Check the render method of `ModuleTabs | 36 | 0.5 |  | /courses/foundation/program/2 |  |
| slow_page | /courses/foundation/program took 8.1s | 13 | 0.25 |  | /courses/foundation/program | — |
| slow_page | /courses/foundation/program/18 took 11.7s | 11 | 0.25 |  | /courses/foundation/program/18, /courses/foundation/program/1, /courses/foundation/program | — |
| slow_page | / took 12.8s | 9 | 0.25 |  | / | — |
| slow_page | /resources took 11.0s | 7 | 0.25 |  | /resources | — |
| slow_page | /assessment took 10.3s | 5 | 0.25 |  | /assessment | — |
| slow_page | /courses/foundation/program/submit took 12.1s | 4 | 0.25 |  | /courses/foundation/program/submit |  |
| slow_page | /assessment/take took 13.1s | 4 | 0.25 |  | /assessment/take | — |
| slow_page | /pricing took 15.0s | 4 | 0.25 |  | /pricing | — |
| unclickable | open resource: locator.click: Timeout 12000ms exceeded. | 2 | 0.5 |  | /resources/prompting-foundation, /resources | — |
| verify_no_answer | no clear verify result | 1 | 1 |  | /verify | — |
| checkout_no_response | buy In-Depth $99: click did nothing observable | 1 | 1 |  | /assessment/in-depth | — |
| unclickable | Resources nav: locator.click: Timeout 12000ms exceeded. | 2 | 0.5 |  | /, /resources | — |
| console_error | A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client | 2 | 0.5 |  | / |  |
| no_download_path | resource page has no download CTA and little content | 1 | 1 |  | /playbooks/marketing | — |
| inquiry_no_response | form submit produced no request | 1 | 1 |  | /for-institutions | — |
| slow_page | /for-institutions took 8.4s | 3 | 0.25 |  | /for-institutions | — |
| slow_page | /courses took 11.9s | 3 | 0.25 |  | /courses | — |
| slow_page | /security/it-approval took 11.6s | 2 | 0.25 |  | /security/it-approval | — |
| slow_page | /practice took 10.4s | 2 | 0.25 |  | /practice | — |
| download_no_file | clicked download, no file or confirmation | 1 | 0.5 |  | /resources/prompting-foundation | — |
| unclickable | open module 1 from course menu: locator.click: Timeout 12000ms exceeded. | 1 | 0.5 |  | /courses/foundation/program/8 | — |
| slow_page | /courses/foundation/program/toolkit took 10.7s | 2 | 0.25 |  | /courses/foundation/program/toolkit | — |
| slow_page | /courses/foundation/program/purchase took 8.1s | 2 | 0.25 |  | /courses/foundation/program/purchase | — |
| slow_page | /verify took 15.9s | 2 | 0.25 |  | /verify | — |
| unclickable | download resource: locator.click: Timeout 12000ms exceeded. | 1 | 0.5 |  | /prompt-cards | — |
| slow_page | /security/data-handling took 9.0s | 2 | 0.25 |  | /security/data-handling | — |
| unclickable | start free assessment: locator.click: Timeout 12000ms exceeded. | 1 | 0.5 |  | /assessment/take |  |
| no_click_path | had to type URL /assessment (Assessment nav) | 1 | 0.5 |  | /assessment | — |
| no_click_path | had to type URL /assessment/take (start assessment) | 1 | 0.5 |  | /assessment/take | — |
| no_click_path | had to type URL /resources (Resources nav) | 1 | 0.5 |  | /resources | — |
| a11y_no_main_landmark | / has no <main> landmark (skip link targets a div) | 3 | 0 |  | / |  |
| slow_page | /resources/templates/ai-use-policy-starter took 11.5s | 1 | 0.25 |  | /resources/templates/ai-use-policy-starter | — |
| slow_page | /playbooks/bsa-aml took 8.3s | 1 | 0.25 |  | /playbooks/bsa-aml | — |
| slow_page | /references took 9.5s | 1 | 0.25 |  | /references | — |
| slow_page | /certifications took 9.1s | 1 | 0.25 |  | /certifications |  |
| slow_page | /resources/templates/board-briefing-checklist took 10.2s | 1 | 0.25 |  | /resources/templates/board-briefing-checklist | — |
| slow_page | /playbooks/retail took 8.6s | 1 | 0.25 |  | /playbooks/retail | — |
| slow_page | /playbooks/bsa-aml/sar-narrative-template took 14.6s | 1 | 0.25 |  | /playbooks/bsa-aml/sar-narrative-template | — |
| slow_page | /playbooks took 21.3s | 1 | 0.25 |  | /playbooks | — |
| slow_page | /prompt-cards took 10.0s | 1 | 0.25 |  | /prompt-cards | — |
| slow_page | /playbooks/lending took 11.4s | 1 | 0.25 |  | /playbooks/lending | — |
| slow_page | /dashboard/toolbox took 9.6s | 1 | 0.25 |  | /dashboard/toolbox | — |
| slow_page | /security took 9.3s | 1 | 0.25 |  | /security | — |
| slow_page | /resources/templates/ai-use-case-inventory took 10.8s | 1 | 0.25 |  | /resources/templates/ai-use-case-inventory | — |
| slow_page | /playbooks/infosec took 15.0s | 1 | 0.25 |  | /playbooks/infosec | — |
| slow_page | /resources/templates/cdfi-grant-ai-evidence-checklist took 10.7s | 1 | 0.25 |  | /resources/templates/cdfi-grant-ai-evidence-checklist | — |
| slow_page | /for-institutions/samples/efficiency-ratio-workbook took 19.0s | 1 | 0.25 |  | /for-institutions/samples/efficiency-ratio-workbook | — |
| slow_page | /resources/templates/ai-workflow-sop took 10.5s | 1 | 0.25 |  | /resources/templates/ai-workflow-sop | — |
| two_click_path | Pricing nav: reached /pricing via the home page | 2 | 0 |  | /pricing |  |
| two_click_path | Training nav: reached /courses via the home page | 1 | 0 |  | /courses |  |
| two_click_path | Practice nav: reached /practice via the home page | 1 | 0 |  | /practice |  |
| two_click_path | For Institutions nav: reached /for-institutions via the home page | 1 | 0 |  | /for-institutions |  |
| lab_run_failed | module 3: 401 {"error":"Authentication required."} | 32 | 0.5 | env | /courses/foundation/program/3, /courses/foundation/program/5, /courses/foundation/program/ | — |
| api_http_error | 401 POST /api/sandbox/chat | 32 | 0.5 | env | /api/sandbox/chat |  |
| bypass_enrolled_redirect | purchase page forwarded to course (dev enrollment bypass) — Foundation checkout untestable here | 12 | 0.5 | env | /courses/foundation/program/18 | — |
| checkout_failed | buy In-Depth $99: 503 /api/checkout/in-depth {"error":"Checkout is temporarily unavailable. Please try again in a few minutes, or email hello@aibankinginstitute | 4 | 1 | env | /assessment/in-depth | — |
| inquiry_failed | 502 /api/inquiry | 4 | 1 | env | /for-institutions | — |
| api_http_error | 500 POST /api/playground/run | 5 | 0.5 | env | /api/playground/run |  |
| api_http_error | 503 POST /api/checkout/in-depth | 4 | 0.5 | env | /api/checkout/in-depth |  |

## Outcomes

- behavior: 40
- goal-finished: 54
- patience: 4
- frustration: 2

Rage-quit triggers:
- 1 × frustrated after slow_page
- 1 × frustrated after no_download_path

## Every persona

| ID | Persona | Source → entry | Journey | First value | Clicks→value | Secs→value | Value idx | Exp | Dead ends | Outcome |
|---|---|---|---|---|---|---|---|---|---|---|
| P001 | Compliance Officer · MDI · overwhelmed, low tech · mobile | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 7s | 77 | 97 | 0 | behavior: stopped after module 18 (planned depth) |
| P002 | CEO · Credit union <$250M · box-checker · mobile | HR enrollment email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 7s | 8 | 100 | 0 | behavior: stopped after module 2 (planned depth) |
| P003 | Innovation Officer · Community bank $1B-$10B · skeptic, ROI-driven · desktop | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 15 | 18s | 4 | 100 | 0 | goal-finished: journey completed |
| P004 | Compliance Officer · CDFI · time-starved · mobile | Trade newsletter → `/resources` | practice-tinkerer | practice_sample_output | 3 | 5s | 1 | 100 | 0 | goal-finished: journey completed |
| P005 | Teller / MSR · De novo bank · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 9s | 4 | 100 | 0 | behavior: stopped after module 1 (planned depth) |
| P006 | HR / L&D Director · Credit union $1B+ · box-checker · desktop | Typed URL → `/` | free-assessment | assessment_score | 17 | 14s | 4 | 100 | 0 | goal-finished: journey completed |
| P007 | Board Director · Community bank $1B-$10B · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-steady (9) | module_content | 1 | 3s | 36 | 100 | 0 | behavior: stopped after module 9 (planned depth) |
| P008 | Deposit Ops Manager · Credit union <$250M · skeptic, ROI-driven · desktop | Conference QR code → `/assessment` | free-assessment | assessment_score | 14 | 12s | 4 | 100 | 0 | goal-finished: journey completed |
| P009 | Data Analyst · Community bank <$250M · eager early adopter · desktop | Peer referral → `/courses` | assessment-to-indepth | assessment_score | 19 | 32s | 4 | 100 | 0 | goal-finished: journey completed |
| P010 | Deposit Ops Manager · Trust company · eager early adopter · desktop | Google search → `/` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P011 | Consumer Lender · CDFI · skeptic, ROI-driven · desktop | Typed URL → `/` | assessment-to-indepth | assessment_score | 15 | 13s | 3 | 100 | 0 | goal-finished: journey completed |
| P012 | Branch Manager · Trust company · overwhelmed, low tech · desktop | Peer referral → `/courses` | free-assessment | assessment_score | 15 | 17s | 4 | 100 | 0 | goal-finished: journey completed |
| P013 | Chief Risk Officer · Credit union $1B+ · time-starved · desktop | Trade newsletter → `/resources` | assessment-to-indepth | assessment_score | 15 | 17s | 3 | 100 | 0 | patience: click budget exhausted |
| P014 | HR / L&D Director · Mutual / thrift · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-steady (6) | module_content | 1 | 12s | 24 | 100 | 0 | behavior: stopped after module 6 (planned depth) |
| P015 | Compliance Officer · Mutual / thrift · detail-oriented · desktop | Purchase receipt email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 11s | 8 | 100 | 0 | behavior: stopped after module 2 (planned depth) |
| P016 | Compliance Officer · MDI · cautious, security-first · desktop | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 13 | 11s | 4 | 100 | 0 | goal-finished: journey completed |
| P017 | Deposit Ops Manager · Community bank <$250M · skeptic, ROI-driven · desktop | Trade newsletter → `/resources` | assessment-to-indepth | assessment_score | 14 | 13s | 3 | 100 | 0 | goal-finished: journey completed |
| P018 | Innovation Officer · Credit union <$250M · skeptic, ROI-driven · desktop | Retargeting ad → `/assessment/take` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P019 | HR / L&D Director · Bankers' bank · skeptic, ROI-driven · desktop | Google search → `/` | institution-buyer | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P020 | Data Analyst · De novo bank · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 6s | 77 | 97 | 0 | behavior: stopped after module 18 (planned depth) |
| P021 | Deposit Ops Manager · Community bank $1B-$10B · cautious, security-first · mobile | Typed URL → `/verify` | cert-verifier | verify_answer | 2 | 11s | 2 | 100 | 0 | goal-finished: journey completed |
| P022 | Branch Manager · Credit union $250M-$1B · skeptic, ROI-driven · mobile | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 3s | 77 | 97 | 0 | behavior: stopped after module 18 (planned depth) |
| P023 | Deposit Ops Manager · MDI · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 3s | 4 | 100 | 0 | behavior: stopped after module 1 (planned depth) |
| P024 | Operations Specialist · MDI · skeptic, ROI-driven · desktop | Conference QR code → `/assessment` | institution-buyer | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P025 | Chief Risk Officer · Community bank $250M-$1B · detail-oriented · desktop | Trade newsletter → `/resources` | resource-hunter | resource_download | 3 | 21s | 6 | 100 | 0 | goal-finished: journey completed |
| P026 | Teller / MSR · Community bank $250M-$1B · skeptic, ROI-driven · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (5) | module_content | 1 | 3s | 20 | 100 | 0 | behavior: stopped after module 5 (planned depth) |
| P027 | Chief Risk Officer · Credit union $1B+ · skeptic, ROI-driven · desktop | Board forwarded link → `/assessment` | free-assessment | assessment_score | 14 | 26s | 4 | 97 | 0 | goal-finished: journey completed |
| P028 | Consumer Lender · Community bank <$250M · time-starved · mobile | Board forwarded link → `/assessment` | assessment-to-indepth | assessment_score | 15 | 13s | 3 | 100 | 0 | patience: click budget exhausted |
| P029 | Consumer Lender · Community bank $1B-$10B · skeptic, ROI-driven · mobile | Google search → `/` | resource-hunter | resource_download | 4 | 35s | 6 | 91 | 0 | goal-finished: journey completed |
| P030 | Consumer Lender · Credit union <$250M · eager early adopter · desktop | Board forwarded link → `/assessment` | explorer | **none** | — | — | 0 | 79 | 0 | goal-finished: journey completed |
| P031 | BSA/AML Officer · CDFI · cautious, security-first · desktop | LinkedIn post → `/` | resource-hunter | resource_download | 5 | 96s | 3 | 87 | 0 | goal-finished: journey completed |
| P032 | Commercial Lender · Trust company · time-starved · desktop | Purchase receipt email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 23s | 8 | 91 | 0 | behavior: stopped after module 2 (planned depth) |
| P033 | CIO / IT Manager · Trust company · box-checker · mobile | Google search → `/` | course-shopper | **none** | — | — | 0 | 94 | 0 | goal-finished: journey completed |
| P034 | HR / L&D Director · Credit union $250M-$1B · cautious, security-first · desktop | Retargeting ad → `/assessment/take` | pricing-skeptic | pricing_understood | 2 | 20s | 2 | 97 | 0 | goal-finished: journey completed |
| P035 | Consumer Lender · Bankers' bank · overwhelmed, low tech · desktop | Purchase receipt email → `/courses/foundation/program` | course-steady (8) | module_content | 1 | 7s | 32 | 100 | 0 | behavior: stopped after module 8 (planned depth) |
| P036 | Compliance Officer · Bankers' bank · detail-oriented · desktop | HR enrollment email → `/courses/foundation/program` | course-quitter (3) | module_content | 2 | 4s | 12 | 100 | 0 | behavior: stopped after module 3 (planned depth) |
| P037 | BSA/AML Officer · De novo bank · time-starved · mobile | Purchase receipt email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 5s | 8 | 100 | 0 | behavior: stopped after module 2 (planned depth) |
| P038 | Internal Auditor · Community bank $1B-$10B · time-starved · mobile | Conference QR code → `/assessment` | free-assessment | **none** | — | — | 0 | 97 | 0 | patience: click budget exhausted |
| P039 | Chief Risk Officer · MDI · time-starved · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (4) | module_content | 1 | 4s | 16 | 100 | 0 | behavior: stopped after module 4 (planned depth) |
| P040 | Operations Specialist · Community bank $250M-$1B · detail-oriented · desktop | Board forwarded link → `/assessment` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P041 | Chief Risk Officer · Community bank <$250M · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 3s | 77 | 94 | 0 | behavior: stopped after module 18 (planned depth) |
| P042 | COO · Credit union $1B+ · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-quitter (5) | module_content | 1 | 3s | 20 | 100 | 0 | behavior: stopped after module 5 (planned depth) |
| P043 | CFO · CDFI · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-quitter (5) | module_content | 1 | 5s | 20 | 100 | 0 | behavior: stopped after module 5 (planned depth) |
| P044 | CFO · MDI · curious browser · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (5) | module_content | 3 | 28s | 20 | 95 | 0 | behavior: stopped after module 5 (planned depth) |
| P045 | HR / L&D Director · Credit union <$250M · time-starved · mobile | Peer referral → `/courses` | practice-tinkerer | practice_sample_output | 3 | 14s | 1 | 100 | 0 | goal-finished: journey completed |
| P046 | BSA/AML Officer · Community bank $1B-$10B · time-starved · mobile | Peer referral → `/courses` | practice-tinkerer | practice_sample_output | 3 | 17s | 1 | 100 | 0 | goal-finished: journey completed |
| P047 | Marketing Lead · De novo bank · curious browser · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 3s | 4 | 100 | 0 | behavior: stopped after module 1 (planned depth) |
| P048 | CEO · MDI · curious browser · mobile | LinkedIn post → `/` | pricing-skeptic | pricing_understood | 1 | 11s | 2 | 97 | 0 | goal-finished: journey completed |
| P049 | COO · Mutual / thrift · overwhelmed, low tech · desktop | Conference QR code → `/assessment` | course-shopper | **none** | — | — | 0 | 97 | 0 | goal-finished: journey completed |
| P050 | Chief Risk Officer · CDFI · box-checker · desktop | Peer referral → `/courses` | free-assessment | assessment_score | 16 | 16s | 4 | 97 | 0 | goal-finished: journey completed |
| P051 | Consumer Lender · Mutual / thrift · eager early adopter · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (1) | module_content | 1 | 4s | 4 | 100 | 0 | behavior: stopped after module 1 (planned depth) |
| P052 | Compliance Officer · De novo bank · box-checker · desktop | Conference QR code → `/assessment` | assessment-to-indepth | assessment_score | 14 | 14s | 3 | 100 | 0 | goal-finished: journey completed |
| P053 | CEO · Trust company · detail-oriented · mobile | HR enrollment email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 19s | 8 | 97 | 0 | behavior: stopped after module 2 (planned depth) |
| P054 | Commercial Lender · Community bank $250M-$1B · box-checker · desktop | Conference QR code → `/assessment` | free-assessment | assessment_score | 14 | 21s | 4 | 97 | 0 | goal-finished: journey completed |
| P055 | Internal Auditor · CDFI · skeptic, ROI-driven · desktop | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 16 | 13s | 4 | 100 | 0 | goal-finished: journey completed |
| P056 | Compliance Officer · CDFI · skeptic, ROI-driven · mobile | Conference QR code → `/assessment` | course-shopper | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P057 | Chief Risk Officer · Community bank $250M-$1B · curious browser · desktop | Board forwarded link → `/assessment` | institution-buyer | **none** | — | — | 0 | 100 | 0 | goal-finished: journey completed |
| P058 | Commercial Lender · De novo bank · detail-oriented · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (11) | module_content | 2 | 17s | 44 | 100 | 0 | behavior: stopped after module 11 (planned depth) |
| P059 | BSA/AML Officer · Community bank $1B-$10B · box-checker · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 11s | 77 | 94 | 0 | behavior: stopped after module 18 (planned depth) |
| P060 | Consumer Lender · Community bank $1B-$10B · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 4s | 77 | 97 | 0 | behavior: stopped after module 18 (planned depth) |
| P061 | Consumer Lender · Community bank $250M-$1B · cautious, security-first · mobile | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 3s | 77 | 100 | 0 | behavior: stopped after module 18 (planned depth) |
| P062 | Consumer Lender · Credit union $1B+ · cautious, security-first · mobile | Trade newsletter → `/resources` | free-assessment | assessment_score | 14 | 20s | 4 | 97 | 0 | goal-finished: journey completed |
| P063 | CEO · Mutual / thrift · box-checker · desktop | HR enrollment email → `/courses/foundation/program` | course-steady (12) | module_content | 1 | 3s | 48 | 97 | 0 | behavior: stopped after module 12 (planned depth) |
| P064 | Operations Specialist · Community bank $250M-$1B · overwhelmed, low tech · desktop | LinkedIn post → `/` | resource-hunter | resource_download | 4 | 30s | 3 | 97 | 0 | goal-finished: journey completed |
| P065 | COO · MDI · cautious, security-first · desktop | HR enrollment email → `/courses/foundation/program` | course-quitter (4) | module_content | 2 | 4s | 16 | 100 | 0 | behavior: stopped after module 4 (planned depth) |
| P066 | CISO · Mutual / thrift · curious browser · desktop | Retargeting ad → `/assessment/take` | pricing-skeptic | pricing_understood | 2 | 12s | 2 | 94 | 0 | goal-finished: journey completed |
| P067 | Operations Specialist · CDFI · time-starved · mobile | HR enrollment email → `/courses/foundation/program` | course-steady (11) | module_content | 1 | 4s | 44 | 94 | 0 | behavior: stopped after module 11 (planned depth) |
| P068 | CFO · Credit union <$250M · time-starved · mobile | Typed URL → `/` | free-assessment | assessment_score | 15 | 19s | 3 | 100 | 0 | patience: click budget exhausted |
| P069 | Operations Specialist · Community bank $1B-$10B · eager early adopter · desktop | Google search → `/` | resource-hunter | resource_download | 4 | 21s | 6 | 94 | 0 | goal-finished: journey completed |
| P070 | Innovation Officer · Credit union $250M-$1B · detail-oriented · desktop | Peer referral → `/courses` | explorer | **none** | — | — | 0 | 88 | 0 | goal-finished: journey completed |
| P071 | CIO / IT Manager · Community bank <$250M · curious browser · desktop | HR enrollment email → `/courses/foundation/program` | course-sampler (2) | module_content | 1 | 16s | 8 | 97 | 0 | behavior: stopped after module 2 (planned depth) |
| P072 | Internal Auditor · CDFI · curious browser · mobile | Retargeting ad → `/assessment/take` | pricing-skeptic | pricing_understood | 2 | 14s | 2 | 94 | 0 | goal-finished: journey completed |
| P073 | CFO · Community bank $1B-$10B · curious browser · desktop | Google search → `/` | resource-hunter | resource_download | 5 | 33s | 6 | 92 | 0 | goal-finished: journey completed |
| P074 | BSA/AML Officer · Community bank $1B-$10B · detail-oriented · desktop | Conference QR code → `/assessment` | course-shopper | **none** | — | — | 0 | 97 | 0 | goal-finished: journey completed |
| P075 | Internal Auditor · Credit union <$250M · eager early adopter · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (4) | module_content | 1 | 25s | 16 | 97 | 0 | behavior: stopped after module 4 (planned depth) |
| P076 | Operations Specialist · Mutual / thrift · overwhelmed, low tech · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (12) | module_content | 1 | 20s | 48 | 97 | 0 | behavior: stopped after module 12 (planned depth) |
| P077 | CEO · Community bank $1B-$10B · box-checker · desktop | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 3s | 77 | 94 | 0 | behavior: stopped after module 18 (planned depth) |
| P078 | CEO · Trust company · eager early adopter · desktop | HR enrollment email → `/courses/foundation/program` | course-completer (18) | module_content | 2 | 4s | 77 | 97 | 0 | behavior: stopped after module 18 (planned depth) |
| P079 | BSA/AML Officer · De novo bank · overwhelmed, low tech · desktop | LinkedIn post → `/` | resource-hunter | resource_download | 3 | 4s | 6 | 97 | 0 | goal-finished: journey completed |
| P080 | Operations Specialist · MDI · box-checker · desktop | Board forwarded link → `/assessment` | free-assessment | assessment_score | 16 | 28s | 4 | 97 | 0 | goal-finished: journey completed |
| P081 | Deposit Ops Manager · MDI · cautious, security-first · desktop | Purchase receipt email → `/courses/foundation/program` | course-completer (18) | module_content | 1 | 5s | 77 | 91 | 0 | behavior: stopped after module 18 (planned depth) |
| P082 | COO · Mutual / thrift · box-checker · mobile | Typed URL → `/verify` | cert-verifier | **none** | — | — | 0 | 79 | 1 | goal-finished: journey completed |
| P083 | Commercial Lender · Credit union <$250M · skeptic, ROI-driven · desktop | LinkedIn post → `/` | course-shopper | **none** | — | — | 0 | 94 | 0 | goal-finished: journey completed |
| P084 | Data Analyst · Credit union <$250M · cautious, security-first · desktop | Trade newsletter → `/resources` | explorer | **none** | — | — | 0 | 88 | 0 | goal-finished: journey completed |
| P085 | Branch Manager · Credit union <$250M · skeptic, ROI-driven · mobile | Retargeting ad → `/assessment/take` | free-assessment | assessment_score | 13 | 23s | 4 | 100 | 0 | goal-finished: journey completed |
| P086 | Consumer Lender · De novo bank · eager early adopter · mobile | HR enrollment email → `/courses/foundation/program` | course-quitter (5) | module_content | 2 | 18s | 20 | 97 | 0 | behavior: stopped after module 5 (planned depth) |
| P087 | CFO · Credit union $250M-$1B · overwhelmed, low tech · desktop | HR enrollment email → `/courses/foundation/program` | course-steady (6) | module_content | 2 | 4s | 24 | 97 | 0 | behavior: stopped after module 6 (planned depth) |
| P088 | Operations Specialist · Bankers' bank · time-starved · desktop | Retargeting ad → `/assessment/take` | practice-tinkerer | practice_sample_output | 3 | 39s | 1 | 94 | 0 | goal-finished: journey completed |
| P089 | Operations Specialist · Community bank $250M-$1B · skeptic, ROI-driven · desktop | LinkedIn post → `/` | assessment-to-indepth | assessment_score | 17 | 14s | 3 | 82 | 1 | goal-finished: journey completed |
| P090 | Compliance Officer · Community bank $250M-$1B · time-starved · mobile | Board forwarded link → `/assessment` | assessment-to-indepth | **none** | — | — | 0 | 77 | 0 | frustration: frustrated after slow_page (/assessment/take took 13.3s) |
| P091 | Branch Manager · Credit union $1B+ · skeptic, ROI-driven · desktop | Google search → `/` | resource-hunter | resource_download | 3 | 74s | 6 | 80 | 0 | goal-finished: journey completed |
| P092 | Data Analyst · Community bank <$250M · time-starved · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (9) | module_content | 2 | 41s | 36 | 91 | 0 | behavior: stopped after module 9 (planned depth) |
| P093 | Internal Auditor · MDI · skeptic, ROI-driven · desktop | HR enrollment email → `/courses/foundation/program` | course-quitter (3) | module_content | 1 | 22s | 12 | 97 | 0 | behavior: stopped after module 3 (planned depth) |
| P094 | Data Analyst · Community bank $1B-$10B · eager early adopter · mobile | Board forwarded link → `/assessment` | practice-tinkerer | practice_sample_output | 3 | 8s | 1 | 100 | 0 | goal-finished: journey completed |
| P095 | Compliance Officer · Trust company · skeptic, ROI-driven · desktop | Peer referral → `/courses` | pricing-skeptic | pricing_understood | 1 | 10s | 2 | 94 | 0 | goal-finished: journey completed |
| P096 | Board Director · MDI · curious browser · mobile | Purchase receipt email → `/courses/foundation/program` | course-steady (10) | module_content | 2 | 51s | 40 | 88 | 0 | behavior: stopped after module 10 (planned depth) |
| P097 | CEO · CDFI · time-starved · mobile | LinkedIn post → `/` | resource-hunter | **none** | — | — | 0 | 75 | 1 | frustration: frustrated after no_download_path (resource page has no download CTA and little  |
| P098 | Chief Risk Officer · CDFI · curious browser · mobile | Peer referral → `/courses` | institution-buyer | **none** | — | — | 0 | 73 | 1 | goal-finished: journey completed |
| P099 | Operations Specialist · Community bank <$250M · overwhelmed, low tech · desktop | Retargeting ad → `/assessment/take` | institution-buyer | **none** | — | — | 0 | 97 | 0 | goal-finished: journey completed |
| P100 | BSA/AML Officer · Community bank <$250M · time-starved · mobile | Google search → `/` | resource-hunter | resource_download | 2 | 13s | 6 | 97 | 0 | goal-finished: journey completed |
