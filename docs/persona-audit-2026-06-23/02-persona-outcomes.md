# 100-Persona Outcomes — consolidated (massive-persona audit, 2026-06-23)

Every persona from `01-persona-roster.md` walked step-by-step against the grounded
`00-flow-atlas.md`. Outcome legend: ✅ reached goal · ⚠️ reached but damaged · ❌ failed/bounced/stranded.
Severity = impact of the worst friction that persona hit.

## Outcome table (all 100)

| # | Persona | Outcome | Worst friction hit | Sev |
|---|---|---|---|---|
| 1 | Curious CEO | ✅ | no-PDF if Supabase down (latent); silent acct | Low |
| 2 | Board-Pressured President | ❌ stranded-likely | $295 single-email gateway filter; no never-login nudge | **Crit** |
| 3 | Skeptical CFO | ❌ bounced | no pricing page; $99 invisible; cert value unexplained | High |
| 4 | Eager Innovation Officer | ⚠️ soft lead | team CTA is raw mailto, no form/CRM | High |
| 5 | Overwhelmed Compliance Chief | ✅ | discovery 2-3 clicks; template works | Low |
| 6 | Detail-Driven BSA Officer | ✅ | discovery only; no BSA template (only playbook) | Low |
| 7 | Burned-by-Vendors CIO | ❌ frustrated | Safe AI Use Guide FALSE success → 500 | **Crit** |
| 8 | Time-Starved CRO | ❌ lost | mobile abandon → sessionStorage tab-kill, no recovery | High |
| 9 | Self-Learning Lender | ❌ bounced | /playground orphaned + fake | High |
| 10 | Required-to-Certify Analyst | ❌ waits forever | certificate dead-end; employer-mandated | **Crit** |
| 11 | Refund-Seeker | ⚠️ | refund form-only; legacy chrome dead link | Med |
| 12 | De Novo Founder | ❌ abandons M3 | M3 60-char authoring wall; no pull-back | High |
| 13 | MDI Mission Officer | ✅ | report not mission-aware (content) | Low |
| 14 | CDFI Grant Writer | ✅ | kits not CDFI-specific | Low |
| 15 | Thrift Traditionalist | ❌ lost | abstract hero fails skeptic; restart from Q1 | High |
| 16 | Trust Company Counsel | ⚠️ mixed | Safe Guide 500 if pursued; security siloed off resources | High |
| 17 | Bankers' Bank Strategist | ⚠️ soft lead | mailto wall; no multi-institution path | High |
| 18 | Fintech Vendor Scout | ❌ bounced (non-ICP) | playground orphan; FI-only pricing | Low |
| 19 | State Examiner | ❌ nothing to verify | no /verify entry point; no certs exist | High |
| 20 | Independent Consultant | ✅ | free-first works; bank-framed report (mild) | Low |
| 21 | Grad Student | ✅ | works | Low |
| 22 | Trade Journalist | ✅ bounced (expected) | no press/media contact surface | Low |
| 23 | Frontline Teller | ❌ abandons M3 | M3 authoring wall hostile to low-tech | **Crit** |
| 24 | L&D Director | ⚠️ soft lead | mailto; cohort artifact buried | High |
| 25 | Branch Ops Manager | ❌ stranded-likely | $295 gateway filter; no nudge | **Crit** |
| 26 | CISO Gatekeeper | ⚠️ semi-satisfied | data-handling missing retention/DPA/sub-processors | Med |
| 27 | Digital Banking Lead | ❌ idle/never-takes | no $99 path from playground; no reminder | High |
| 28 | Marketing CMO | ⚠️ read, eval dinged | clicked a broken gated PDF while vetting | Med |
| 29 | Internal Auditor | ✅ | discovery only | Low |
| 30 | Board Director | ⚠️ preview only | no "no-thanks" path; dead #restart; start-over re-rolls | Med |
| 31 | Project Manager | ⚠️ soft lead | mailto; no scope/SLA for project plan | Med |
| 32 | Chief Credit Officer | ✅ | healthy path | Low |
| 33 | Vendor-Mgmt Officer | ❌ frustrated | Safe Guide 500; no DPA to vet | **Crit** |
| 34 | Operations Clerk | ❌ abandons M3 | M3 authoring wall; intimidating for laggard | **Crit** |
| 35 | Returning Mobile→Desktop | ❌ total loss | cross-device return structurally impossible | **Crit** |
| 36 | Accidental Clicker | ❌ bounced 10s | abstract motion-first hero, no ICP hook | Med |
| 37 | Eager Early Adopter | ❌ no cert | cert dead-end; /toolkit report 500 | **Crit** |
| 38 | Budget Hawk CFO | ❌ bounced | pricing scatter; no tier comparison | High |
| 39 | Compliance Box-Checker | ✅ | discovery only | Low |
| 40 | 3rd-Party Cert Verifier | ❌ no entry | no cert-ID lookup; legacy chrome | High |
| 41 | Curious Director | ✅ | discovery only | Low |
| 42 | Overwhelmed CEO | ❌ likely lost | mid-quit; no "X/12 done" reassurance/reminder | High |
| 43 | Risk-Averse CRO | ❌ idle/never-takes | /security has no $99 path; idle, no nudge | High |
| 44 | CUNA Newsletter Reader | ❌ stranded-likely | $295 gateway filter; no nudge | **Crit** |
| 45 | IT Generalist | ❌ bounced | /practice public+fake+mislabeled "Enrolled-only" | High |
| 46 | Lending Team Lead | ⚠️ soft lead | relevant data point dropped into blank mailto | Med |
| 47 | Skeptical Examiner-Whisperer | ⚠️ partial | Safe Guide 500 after email handoff | **High** |
| 48 | First-Time Founder | ❌ no cert | "Credential Pending" + Refresh CTA that never changes | **Crit** |
| 49 | MDI CEO | ✅ | silent acct (latent) | Low |
| 50 | CDFI Ops Lead | ✅ | discovery only | Low |
| 51 | Half-Hearted Buyer | ❌ never logs in | zero re-engagement to recover | High |
| 52 | Diligent In-Depth Buyer | ✅ | longest funnel | Low |
| 53 | Won't-Give-Email Skeptic | ❌ bounced | hardcoded marketing opt-in, no toggle; no "no-thanks" | Med-High |
| 54 | Mid-Assessment Bailer | ❌ lost | start-over re-rolls; no reminder | High |
| 55 | Cohort Champion | ❌ frustrated | ready-to-buy → assisted card says "gated for QA" | **Crit** |
| 56 | Prompt-Card Collector | ❌ broken | buried link → role 400 → PDF 500 | **Crit** |
| 57 | Module-3 Quitter | ❌ abandons M3 | forced authoring + handoff/transfer notes | High |
| 58 | Recommending COO | ⚠️ course landmine | certificate dead-end seen during eval | High |
| 59 | Returning Desktop Finisher | ❌ lost | expects email reminder that doesn't exist | **Crit** |
| 60 | Cert-Completer | ❌ no cert | cert + report + AUP card all 500; no dashboard cert link | **Crit** |
| 61 | Refund Regretter | ⚠️ | refund form not in nav; CFO expects instant | Med |
| 62 | Quick-Bounce Director | ❌ bounced 10s | abstract hero, no ICP mirror | Med |
| 63 | Security Guide Hunter | ❌ frustrated | sole goal is the download → 500 after false success | **Crit** |
| 64 | Playground Tinkerer | ❌ bounced | playground+practice fake; concludes vaporware | **Crit** |
| 65 | Board-Asked CRO | ❌ stranded-likely | $295 gateway filter; no nudge | **Crit** |
| 66 | Won't-Pay Browser | ❌ bounced (benign) | pricing scatter; no "what costs money" map | Med |
| 67 | Detail Auditor | ✅ | discovery only | Low |
| 68 | Eager New Lender | ✅ | $295 upsell may exceed small-CU budget | Low |
| 69 | Sleeper Buyer | ❌ never logs in | no reminder ever fires | High |
| 70 | Mobile First-Timer | ⚠️ relevance quit | hero + questions not teller-relevant | Med |
| 71 | Email-Only Reader | ✅ | corp gateway (latent, served inline) | Low |
| 72 | Stubborn Non-Emailer | ❌ bounced | opt-in, no "no-thanks", dead #restart | Med |
| 73 | Team Pilot Buyer | ❌ frustrated | wants pilot SKU; min-10-seats behind sales | High |
| 74 | Certificate Auditor | ❌ no entry | can't look up by ID; holder-supplied link only | High |
| 75 | Idle $99 Owner | ❌ idle | zero re-engagement email | High |
| 76 | Strategist CEO | ⚠️ both expansions walled | cert dead-end + Team mailto wall + $99 hidden | High |
| 77 | Anxious Exam-Prep CCO | ⚠️ near-miss | urgent; /playbooks gate + "Coming soon" trap | Med |
| 78 | Self-Directed Completer | ❌ no cert | /toolkit AUP card + report dead | **Crit** |
| 79 | Comparison Shopper | ❌ bounced | no pricing page; can't compare what's invisible | High |
| 80 | Accidental Mobile Tap | ❌ bounced 10s | demo above value copy; sticky CTA hidden <600px | Med |
| 81 | Whole-Team Buyer | ❌ no checkout | checkout-ready → mailto; biggest revenue leak | **Crit** |
| 82 | Module-3 Abandoner | ❌ abandons M3 | M3 wall; no re-engagement | High |
| 83 | Curious Regulator | ✅ satisfied | coherent /about + /resources | Low |
| 84 | ROI-Calc Obsessive | ⚠️ context lost | ROI calc → assessment carries zero state | Med-High |
| 85 | In-Depth Finisher | ✅ | reload-on-results bounce (A5) | Low-Med |
| 86 | Returning Cert-Chaser | ❌ catastrophic | password-less login wall on 2nd device → cert dead-end | **Crit** |
| 87 | Reluctant Refunder | ⚠️ | $295 refund eligibility subjective, self-unverifiable | Med-High |
| 88 | Template Snatcher | ✅ | discovery only | Low |
| 89 | Skeptical IT Auditor | ⚠️ semi-satisfied | data-handling gaps; PII override not disclosed | Med |
| 90 | Won't-Email Director | ❌ bounced | opt-in, no "no-thanks", opaque data-handling | Med |
| 91 | Eager Cohort Lead | ❌ frustrated | two mailto subjects, choice paralysis on dead end | High |
| 92 | Mobile Mid-Quit | ❌ lost | interruption at worst moment; no recovery | High |
| 93 | Idle Course Owner | ❌ never logs in | progress persists but nothing pulls back | High |
| 94 | Diligent Self-Learner | ❌ no cert | /submit "no need to refresh" → indefinite limbo | **Crit** |
| 95 | Quick-Glance CEO | ❌ bounced 10s | problem-first hero, proof below fold | Med |
| 96 | Practice-Sandbox Tester | ❌ bounced | /practice false "Enrolled-only" + fake + fake .md export | **Crit** |
| 97 | Cert-Verifying Examiner | ❌ unreachable | no entry point; legacy chrome undercuts authenticity | High |
| 98 | $99 Buyer Who Vanishes | ❌ likely stranded | corp gateway filters magic link; no resend/detection | **Crit** |
| 99 | Resource-Only Grazer | ✅ | discovery only | Low |
| 100 | Full-Funnel Champion | ❌ no cert + no referral | finishes everything → no credential, no referral mechanism | **Crit** |

## Outcome tally

- ✅ Reached goal cleanly: **24** (mostly resource-grabbers + free-assessment readers + happy $99 completers + research personas)
- ⚠️ Reached but damaged: **18**
- ❌ Failed / bounced / stranded: **58**

Of the 58 failures: **23 are Critical** — concentrated in (a) certificate completers, (b) stranded paid buyers, (c) team buyers with no checkout, (d) fake-demo evaluators, (e) broken email-gated downloads, (f) cross-device returners.

## Cross-cohort NEW issues (beyond the Atlas, surfaced by the persona lens)

1. **No re-engagement / abandonment-recovery anywhere** — free abandon (no email captured pre-Q12, sessionStorage-only, "Start over" re-rolls questions), idle $99, never-login $295, mid-course abandon, finishers. Only crons are `cleanup-rate-limits` + pdf-cleanup. No "finish your assessment", no "you haven't started", no win-back. (cohorts 2,3,6,8)
2. **"Idle" and "stranded" are indistinguishable** — paid-but-never-authenticated has no flag; ops can't see who paid and never got in. (cohorts 5,6)
3. **Dashboard falsely shows "Verified ✓"** the instant all modules complete, with no real certificate and a link back into the course. (cohort 7)
4. **No referral mechanism exists** at all — the champion (100) who finishes the whole funnel has no way to refer peers. (cohort 7)
5. **ROI calculator → assessment carries zero state** — the CFO's dollar figure is discarded at the click. (cohort 1)
6. **Email gate: hardcoded `marketingOptIn:true`, no opt-out, no "no-thanks" lane** — privacy-skeptic bankers bounce; dead `TierPreview` component misrepresents the gate. (cohort 1)
7. **Safe AI Use Guide shows FALSE "Downloading now" success before the 500.** (cohort 4)
8. **No `/pricing` page; the 4 prices live on 4 unrelated surfaces** — comparison shoppers can't assemble the offer. (cohort 4)
9. **Certification value never explained on the buying path; verifiers have no cert-ID entry point** (lookup page removed, noindex, robots-disallowed). (cohorts 4,7)
10. **Module 3 is an unflagged difficulty cliff** (0 activities in M2 → a 60-char authored-prompt gate in M3) with no skip/scaffolding. (cohort 6)
11. **Team funnel is mailto-only**; assisted card literally states checkout is "gated until two production-like cohorts pass QA"; self-serve Stripe machinery is built but flag-dark; no form/scheduler/SLA. (cohort 8)
12. **`/practice` falsely claims "Signed-in sandbox / Enrolled-only"** while public+fake and even offers a `.md` download of fabricated AI output. (cohorts 4,8)
13. **Login requires a password the account never had** — returning password-less buyers on a new device hit a wall; device-confirm is same-browser-only. (cohort 2)
14. **Mobile click tax + first-paint problems** — Resources behind "More" panel (+1 click), sticky CTA hidden until 600px scroll, animated demo above value copy, abstract problem-first hero with no ICP mirror. (cohort 2)
15. **data-handling page** missing AiBI's own retention window, sub-processor/residency list, DPA/SOC 2, and silent on the PII-override-no-audit-log reality. (cohort 4)
16. **Two parallel module-content systems** (live `micro-modules.ts` enumerating 18 + dead `module-N.ts` files) — maintenance trap; the "18 modules" count itself is CORRECT. (cohorts 1,6,7)
17. **Silent failures** — `DownloadReportButton` swallows 500s with no toast; `save-progress` fails silently; `/submit` promises an email no route sends. (cohorts 6,7)
