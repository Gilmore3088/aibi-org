import type { ToolboxSkillTemplate } from '@/lib/toolbox/types';

export const TOOLBOX_TEMPLATES = [
  {
    "id": "exam-prep",
    "cmd": "/exam-prep",
    "name": "Regulatory Exam Preparation",
    "dept": "Compliance",
    "deptFull": "Compliance & BSA/AML",
    "difficulty": "intermediate",
    "timeSaved": "~6 hr",
    "cadence": "Per exam",
    "desc": "Reads policy library and prior exam findings, identifies open issues, produces a regulator-ready summary.",
    "purpose": "Reads our policy library and prior exam findings, identifies open compliance issues, and produces a regulator-ready summary package with recommended pre-exam actions ranked by urgency.",
    "success": "A 1-page Word executive summary listing strengths, open findings, and three recommended actions with owners and deadlines.",
    "files": [
      "/about-me/about-me.md",
      "/policies/  —  all institutional policies",
      "/exams/prior-findings.docx",
      "/templates/exam-summary.docx"
    ],
    "connectors": [
      "Google Drive"
    ],
    "questions": "What is the exam date and the agency (NCUA, OCC, FDIC, State)?\nWhich regulations are in scope?\nAre there findings from the prior exam still marked open?\nWho is the lead examiner?\nAny focus areas requested in the entry letter?",
    "steps": [
      "Read every document in /policies/ and map regulations to policies.",
      "Cross-reference /exams/prior-findings.docx; flag items still open.",
      "Identify policy gaps for in-scope regulations.",
      "Draft summary with sections: Coverage, Open Items, Recommended Actions.",
      "Format using template; save to /outputs/exam-prep/"
    ],
    "output": "Word Doc (.docx)",
    "tone": "Regulatory / Formal",
    "length": "2–3 Pages",
    "guardrails": [
      "Never make final decisions",
      "Cite only my policy files",
      "Flag missing data",
      "Always ask the questions"
    ],
    "customGuard": "Never assert \"compliant\" — frame as \"policy in place\" or \"control documented.\" Only the examiner makes that determination.",
    "owner": "VP Compliance",
    "maturity": "production",
    "samples": [
      {
        "title": "NCUA exam, 7 weeks out",
        "prompt": "Exam date: June 15, 2026 (7 weeks out)\nAgency: NCUA Region IV\nLead examiner: Sarah Chen (worked with us last cycle)\n\nRegulations in scope: BSA/AML (31 CFR 1020), Reg E (12 CFR 1005), Reg DD (12 CFR 1030), Member Business Lending\n\nPrior exam findings still open:\n1. BSA training documentation gaps — 60% remediated; board-level training attestations still pending\n2. Overdraft fee disclosure language deemed potentially confusing — new language drafted, not yet deployed to all members\n\nEntry letter focus areas:\n- BSA program effectiveness post-officer transition\n- MBL portfolio concentration risk\n- IT general controls and cybersecurity\n\nContext: First major exam since CEO change in January. New BSA Officer (Tom Reyes) started 6 months ago. CRE portfolio grew 22% YoY.\n\nPrepare the regulator-ready summary package."
      },
      {
        "title": "OCC safety & soundness",
        "prompt": "Exam date: August 1-15, 2026\nAgency: OCC Northeast District\nLead examiner: David Park\n\nRegulations in scope: Standard CAMELS — capital adequacy, asset quality, management, earnings, liquidity, sensitivity to market risk.\n\nPrior exam findings: All 3 findings from last cycle closed and verified. Prior CAMELS: 2-2-2-2-2-2, composite 2.\n\nEntry letter requests:\n- Detailed CRE concentration analysis (now 285% of capital, up from 240%)\n- ALLL methodology documentation\n- Cyber incident response testing records\n\nContext: Strong liquidity (LCR 142%). NIM compressed 12 bps YoY. Two new branches opened in Q1.\n\nPrepare the pre-exam summary package."
      }
    ]
  },
  {
    "id": "sar-narrative",
    "cmd": "/sar-narrative",
    "name": "SAR Narrative Drafting",
    "dept": "Compliance",
    "deptFull": "Compliance & BSA/AML",
    "difficulty": "advanced",
    "timeSaved": "~2 hr",
    "cadence": "Per case",
    "desc": "Drafts a Suspicious Activity Report narrative in FinCEN 5W format using transaction data.",
    "purpose": "Drafts a SAR narrative in FinCEN 5W format (Who, What, When, Where, Why) for BSA officer review prior to filing.",
    "success": "A complete narrative addressing all five W elements with no speculation beyond documented facts.",
    "files": [
      "/policies/bsa-policy.pdf",
      "/templates/sar-template.md",
      "/typologies/"
    ],
    "connectors": [
      "Core Banking"
    ],
    "questions": "What is the case identifier (do not use member name)?\nWhat transaction period is under review?\nWhat suspicious typology applies?\nIs there a prior SAR on this subject?\nIs the investigation file complete?",
    "steps": [
      "Read transaction data; identify relevant transactions.",
      "Compare patterns to typologies; confirm red flags.",
      "Structure narrative in 5W format.",
      "Confirm no speculation beyond evidence.",
      "Format per template; return to BSA officer for review."
    ],
    "output": "Markdown (.md)",
    "tone": "Regulatory / Formal",
    "length": "Full Detail",
    "guardrails": [
      "Never make final decisions",
      "Anonymize member & PII",
      "Flag missing data",
      "Never send anything externally"
    ],
    "customGuard": "Use case identifier (CASE-XXXX), never the subject's name. Never speculate about intent. Never disclose SAR filing status per 31 CFR 1020.320(e).",
    "owner": "BSA Officer",
    "maturity": "production",
    "samples": [
      {
        "title": "Structuring case CASE-2026-0142",
        "prompt": "Case ID: CASE-2026-0142\nTransaction period: January 15 – March 31, 2026\nSubject: Member since 2018, runs a small landscaping business\n\nSuspicious typology: Structuring\n- 27 cash deposits across 4 branches over 10 weeks\n- Each deposit $9,200–$9,800 (just under the $10K reporting threshold)\n- Total deposited: $264,500\n- Historical pattern was $3K–$5K weekly deposits\n\nPrior SARs: One prior SAR filed 2024-08-15 on similar pattern (FinCEN closed, no action).\n\nInvestigation file: Complete — transaction records indexed, branch logs collected, business registration verified, member due diligence file pulled.\n\nAdditional facts:\n- Recent address change (business address → residential)\n- No prior law enforcement contacts\n- Subject's stated explanation: \"saving for equipment purchase\"\n\nDraft the FinCEN 5W narrative for BSA officer review."
      },
      {
        "title": "Elder financial exploitation",
        "prompt": "Case ID: CASE-2026-0167\nTransaction period: October 1, 2025 – April 1, 2026\nSubject: Member age 84, joined 1998\n\nSuspicious typology: Elder financial exploitation\n- New \"advisor\" added as joint signer in October 2025\n- 14 wire transfers totaling $187,000 to one beneficiary in Texas\n- Member's typical activity prior: pension deposits and monthly bills only\n- New beneficiary identified as romantic interest met online\n\nPrior SARs: None on this member.\n\nInvestigation file: Complete. Branch staff first flagged in February. Adult Protective Services contacted (case open). Daughter (POA) alerted and requesting filing.\n\nAdditional facts:\n- Member appears cognitively diminished per branch staff observations\n- Member refuses to discuss the wires when asked\n- Daughter has documentation of unusual recent contacts\n\nDraft the SAR narrative."
      }
    ]
  },
  {
    "id": "reg-change",
    "cmd": "/reg-change-brief",
    "name": "Regulatory Change Brief",
    "dept": "Compliance",
    "deptFull": "Compliance & BSA/AML",
    "difficulty": "beginner",
    "timeSaved": "~3 hr",
    "cadence": "Weekly",
    "desc": "Reads new regulatory guidance, summarizes changes, maps to current policies, estimates implementation effort.",
    "purpose": "Reads new regulatory guidance, identifies what changed, maps to affected policies and products, estimates implementation lift.",
    "success": "A 1-page brief: source citation, summary, affected policies/products, required updates, implementation estimate.",
    "files": [
      "/policies/",
      "/products/",
      "/templates/reg-brief.docx"
    ],
    "connectors": [
      "Web Search",
      "Google Drive"
    ],
    "questions": "What is the source authority?\nWhat is the effective date?\nProvide URL of the guidance.\nDo we have products in scope?\nIs this final, proposed, or interpretive?",
    "steps": [
      "Fetch full guidance text.",
      "Summarize what changed.",
      "Search /policies/ for affected documents.",
      "List required updates with owners.",
      "Estimate effort; flag legal review items.",
      "Format and save."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Regulatory / Formal",
    "length": "One Page",
    "guardrails": [
      "Cite only my policy files",
      "Flag missing data",
      "Never make final decisions"
    ],
    "customGuard": "Always cite source authority with publication date. Flag interpretive ambiguity for legal review.",
    "owner": "Compliance Analyst",
    "maturity": "production",
    "samples": [
      {
        "title": "CFPB overdraft amendments",
        "prompt": "Source authority: CFPB\nStatus: Final rule\nEffective date: October 1, 2026 (5 months out)\nCitation: 12 CFR 1005 (Reg E) amendments\nSource link: [provided in agency notification]\n\nWhat changed: New Schumer-box-style fee summary required at account opening; restrictions on certain overdraft fee structures; new opt-in/opt-out workflow for ATM and one-time debit overdraft coverage.\n\nOur products in scope: All consumer checking accounts (12 product variants), our courtesy pay program, member-facing online and mobile banking disclosures.\n\nContext: 47,000 active checking accounts. Courtesy pay revenue last year: $2.3M.\n\nBrief the implementation lift."
      },
      {
        "title": "NCUA cybersecurity letter",
        "prompt": "Source authority: NCUA\nStatus: Letter to Credit Unions (LCU 26-CU-04)\nEffective date: Immediate; examiner attention 90 days\nSource link: [provided in agency notification]\n\nWhat changed: Heightened expectations for IRT testing frequency, ransomware-specific tabletop exercises, third-party vendor cyber attestations, and member notification timelines for incidents.\n\nOur products/systems in scope: All systems holding NPI; online and mobile banking; vendor management program.\n\nContext: Last cyber tabletop was 8 months ago. We have 23 critical vendors; 4 lack current SOC 2 Type II.\n\nBrief the gap analysis."
      }
    ]
  },
  {
    "id": "credit-memo",
    "cmd": "/credit-memo",
    "name": "Commercial Credit Memo",
    "dept": "Lending",
    "deptFull": "Lending & Underwriting",
    "difficulty": "advanced",
    "timeSaved": "~4 hr",
    "cadence": "Per loan",
    "desc": "Calculates ratios, compares to policy thresholds, drafts a credit memo with risk rating and recommendation.",
    "purpose": "Reads borrower financials, calculates underwriting ratios, compares to lending policy, drafts a complete credit memo.",
    "success": "A 2-3 page Word memo: executive summary, financial analysis, collateral, risk rating, conditioned recommendation.",
    "files": [
      "/policies/lending-policy.pdf",
      "/policies/risk-rating-matrix.pdf",
      "/templates/credit-memo.docx"
    ],
    "connectors": [
      "Loan Origination"
    ],
    "questions": "What is the borrower entity and loan ID (use LN-XXXX)?\nLoan amount, structure, purpose?\nCollateral and valuation?\nRelationship history?\nKnown concerns to flag?",
    "steps": [
      "Read all financial statements.",
      "Calculate DSCR, LTV, DTI, current ratio, global cash flow.",
      "Compare to policy thresholds; flag exceptions.",
      "Analyze 3-year trend.",
      "Summarize collateral and lien priority.",
      "Assign risk rating with justification.",
      "Draft recommendation with conditions."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Regulatory / Formal",
    "length": "2–3 Pages",
    "guardrails": [
      "Never approve or deny credit",
      "No prohibited basis factors",
      "Cite only my policy files",
      "Flag missing data",
      "Anonymize member & PII"
    ],
    "customGuard": "Use loan ID (LN-XXXX), never borrower name. Show all calculations. Flag policy exceptions per §4.2.",
    "owner": "VP Commercial Lending",
    "maturity": "production",
    "samples": [
      {
        "title": "Westside Industrial — $2.4M CRE acquisition",
        "prompt": "Loan ID: LN-2026-0419\nBorrower: Westside Industrial Properties LLC (single-purpose entity)\nPersonal Guarantor: Michael Westbrook (75% member)\n\nRequest: $2,400,000 CRE acquisition loan\nStructure: 25-year amortization, 7-year balloon, fixed rate\nLTV: 75%\nUse of proceeds: Acquisition of 28,000 sq ft industrial warehouse, Tacoma WA\n\nCollateral: First lien on subject property; appraised value $3,200,000 (Smith Appraisal Services, 03/2026); assignment of rents.\n\nProperty financials (CY2024 audited):\n- NOI: $387,000\n- DSCR at proposed terms: 1.42x\n- Occupancy: 92% across 4 tenants\n\nGuarantor (Westbrook) personal:\n- Net worth: $4.2M (50% liquid)\n- DTI: 31%\n- FICO: 762\n\nRelationship: Member since 2019, three prior loans paid as agreed, current $1.8M aggregate exposure across two performing CRE loans.\n\nConcerns to flag:\n1. One tenant (32% of NOI) has lease expiring in 18 months\n2. Guarantor's liquidity concentrated in single-stock position ($2.1M MSFT)\n\nDraft the credit memo."
      },
      {
        "title": "Pacific NW Manufacturing — $500K WC line",
        "prompt": "Loan ID: LN-2026-0420\nBorrower: Pacific Northwest Manufacturing Inc (operating company)\nPersonal Guarantors: Sandra Chen (60%) and Robert Chen (40%) — jointly and severally\n\nRequest: $500,000 revolving working capital line\nStructure: 12-month term, renewable; interest only monthly; secured by AR/inventory\nUse of proceeds: Seasonal working capital needs, inventory build\n\nCollateral: Blanket UCC-1 on all business assets; AR aging 95% under 60 days; inventory turnover 8.2x.\n\nBorrower financials (CY2025 reviewed):\n- Revenue: $8.4M\n- EBITDA: $1.1M\n- Working capital: $1.8M\n- Debt service coverage: 2.1x\n\nGuarantors combined net worth: $3.4M, DTI 28%, FICOs 745/731.\n\nRelationship: 12-year member, deposit relationship $480K average, no prior commercial credit. Strong personal banking history.\n\nConcerns: Concentration — top 3 customers represent 64% of revenue. One customer (32%) recently restructured.\n\nDraft the credit memo."
      }
    ]
  },
  {
    "id": "covenant-watch",
    "cmd": "/covenant-watch",
    "name": "Covenant Compliance Monitoring",
    "dept": "Lending",
    "deptFull": "Lending & Underwriting",
    "difficulty": "intermediate",
    "timeSaved": "~2 hr",
    "cadence": "Quarterly",
    "desc": "Calculates each covenant ratio, flags violations or approaching triggers, drafts borrower notification.",
    "purpose": "Reads quarterly borrower financials; calculates covenant ratios; flags violations or covenants approaching trigger.",
    "success": "Updated Excel covenant tracker plus Word memo to RM if any covenant is in violation.",
    "files": [
      "/loans/[loan-id]/loan-agreement.pdf",
      "/templates/covenant-tracking.xlsx"
    ],
    "connectors": [
      "Loan Origination"
    ],
    "questions": "Loan ID and reporting period?\nFinancials final or draft?\nPrior period results?\nWaivers in effect?",
    "steps": [
      "Extract every covenant with threshold.",
      "Calculate each ratio for current period.",
      "Mark: Compliant, Approaching, Violation.",
      "Update tracker.",
      "Draft RM memo if violation."
    ],
    "output": "Spreadsheet (.xlsx)",
    "tone": "Professional",
    "length": "2–3 Pages",
    "guardrails": [
      "Never send anything externally",
      "Flag missing data",
      "Never make final decisions"
    ],
    "customGuard": "Never communicate to borrower without RM approval. Show every calculation. Note draft financials prominently.",
    "owner": "Portfolio Manager",
    "maturity": "production",
    "samples": [
      {
        "title": "Bauer Manufacturing — Q1 final financials",
        "prompt": "Loan ID: LN-2024-0312\nBorrower: Bauer Manufacturing Inc\nReporting period: Q1 2026 (March 31, 2026)\nFinancials: Final, audited by Sterling CPA Group, received 04/22/2026\nPrior period (Q4 2025): All compliant; DSCR 1.38x, leverage 2.7x\n\nActive covenants per loan agreement:\n1. Minimum DSCR: 1.25x (quarterly)\n2. Maximum total leverage: 3.5x (quarterly)\n3. Minimum tangible net worth: $4.5M (annual)\n4. Maximum CapEx: $750K/year (annual)\n5. No material adverse change\n\nQ1 2026 financials provided:\n- Revenue: $8.2M (+3.8% YoY)\n- EBITDA: $1.1M\n- Annual debt service: $920K (calculated)\n- Total funded debt: $4.1M\n- TNW: $5.2M (audited 12/31/2025)\n\nActive waivers: None.\n\nRun the covenant analysis."
      },
      {
        "title": "Riverside Multifamily — approaching trigger",
        "prompt": "Loan ID: LN-2025-0089\nBorrower: Riverside Multifamily LP (124-unit apartment property)\nReporting period: Q1 2026\nFinancials: Draft (T-12 financials, sponsor-prepared)\nPrior period (Q4 2025): DSCR 1.27x — APPROACHING trigger of 1.25x\n\nActive covenants:\n1. Minimum DSCR: 1.25x (quarterly)\n2. Minimum occupancy: 90% (quarterly)\n3. Annual property tax current\n\nQ1 2026 financials:\n- Effective gross income: $1,082,000\n- Operating expenses: $548,000\n- NOI: $534,000\n- Annual debt service: $432,000\n- Occupancy as of 03/31: 88% (down from 91% Q4)\n- Property taxes: paid current\n\nActive waivers: One on annual operating budget submission (sponsor 60 days late, waived through 06/30/2026).\n\nRun the covenant analysis."
      }
    ]
  },
  {
    "id": "loan-decision",
    "cmd": "/loan-decision",
    "name": "Loan Decision Documentation",
    "dept": "Lending",
    "deptFull": "Lending & Underwriting",
    "difficulty": "intermediate",
    "timeSaved": "~1 hr",
    "cadence": "Per decision",
    "desc": "Documents credit decisions, prepares ECOA-compliant adverse action notices for declined applications.",
    "purpose": "Documents formal decision rationale and drafts ECOA-compliant adverse action notice for declined applications.",
    "success": "A decision memo plus, if applicable, a Reg B-compliant adverse action notice within ECOA timing.",
    "files": [
      "/credit-memos/[loan-id]-memo.docx",
      "/policies/lending-policy.pdf",
      "/templates/adverse-action.docx"
    ],
    "connectors": [
      "Loan Origination"
    ],
    "questions": "Loan ID and decision (approve/decline/counter)?\nVote breakdown?\nConditions added?\nIf declined, what reasons (must be ECOA-permissible)?\nApplication date for ECOA timing?",
    "steps": [
      "Read credit memo.",
      "Document decision: outcome, vote, date, authority.",
      "For approvals: list conditions with owners.",
      "For declines: identify ECOA-permissible reasons only.",
      "If adverse action: draft notice with required disclosures.",
      "Save to credit file."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Regulatory / Formal",
    "length": "One Page",
    "guardrails": [
      "Never approve or deny credit",
      "No prohibited basis factors",
      "Cite only my policy files",
      "Disclose AI involvement"
    ],
    "customGuard": "Reasons must come from ECOA-permissible bases only. Notice delivered within 30 days per Reg B 1002.9.",
    "owner": "Chief Credit Officer",
    "maturity": "production",
    "samples": [
      {
        "title": "Westside — approval with conditions",
        "prompt": "Loan ID: LN-2026-0419 (Westside Industrial Properties)\nApplication date: March 15, 2026\nDecision: APPROVED\nVote: 4-1 (CCO Davis dissented citing tenant concentration)\n\nApproving authority: Loan Committee\nLoan officer: Jennifer Park, VP Commercial Lending\n\nConditions imposed (5):\n1. Personal guaranty from Michael Westbrook (75% member), unlimited\n2. Subordination of any related-party loans\n3. Annual personal financial statement required\n4. Deposit relationship: maintain minimum $250K balance throughout loan term\n5. Property tax escrow required\n\nDocument the formal decision rationale."
      },
      {
        "title": "Bayside Restaurant — decline + adverse action",
        "prompt": "Loan ID: LN-2026-0421\nBorrower: Bayside Restaurant Group LLC\nApplication date: April 1, 2026 (today is April 25 — 5 days remaining for adverse action notice per Reg B 1002.9)\nDecision: DECLINED\nVote: 5-0 unanimous\n\nECOA-permissible decline reasons:\n1. Insufficient cash flow — calculated DSCR 0.92x, below policy minimum 1.25x\n2. Excessive obligations relative to income — DTI 64%\n3. Length of credit history insufficient — business operating <12 months\n\nDocument the decision and draft the Reg B-compliant adverse action notice."
      }
    ]
  },
  {
    "id": "pipeline-review",
    "cmd": "/pipeline-review",
    "name": "Loan Pipeline Review",
    "dept": "Relationship",
    "deptFull": "Relationship Management",
    "difficulty": "beginner",
    "timeSaved": "~3 hr/wk",
    "cadence": "Weekly",
    "desc": "Summarizes pipeline by stage, flags stalled deals, surfaces deals approaching close, recommends next actions.",
    "purpose": "Reads pipeline export, groups by stage, flags stalled deals, identifies deals closing soon, recommends next actions.",
    "success": "A 2-page report with pipeline by stage, stalled deals (14+ days), deals closing in 30 days, next action per stalled deal.",
    "files": [
      "/data/pipeline.xlsx",
      "/templates/pipeline-report.docx"
    ],
    "connectors": [
      "CRM",
      "Gmail"
    ],
    "questions": "What time period?\nProduct line or all?\nWhat counts as stalled (default 14 days)?\nFor a meeting?",
    "steps": [
      "Read pipeline; group by stage.",
      "Calculate days since last activity; flag 14+ stalled.",
      "Identify 30-day close deals; surface blockers.",
      "Scan recent emails for top 5 stalled.",
      "Draft next action per stalled deal.",
      "Format report."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Professional",
    "length": "2–3 Pages",
    "guardrails": [
      "Anonymize member & PII",
      "Flag missing data",
      "Never send anything externally"
    ],
    "customGuard": "Use loan IDs in shared output. Member names only in officer-only sections.",
    "owner": "SVP Commercial",
    "maturity": "production",
    "samples": [
      {
        "title": "Weekly review for team meeting",
        "prompt": "Time period: Week of April 21–25, 2026\nProduct line: All commercial loan pipeline\nStalled threshold: 14 days no activity (default)\nFor: Thursday May 1 commercial team meeting\n\nPipeline summary (47 active deals, $117M aggregate):\n\nBy stage:\n- Application: 12 deals, $28M\n- Underwriting: 15 deals, $42M\n- Approval: 8 deals, $18M\n- Documentation: 7 deals, $21M\n- Funding: 5 deals, $8M\n\nStalled deals (14+ days no activity): 9 total\n- 4 in Application (waiting on financials)\n- 3 in Underwriting (analyst capacity)\n- 2 in Documentation (legal review)\n\nClosing in next 30 days: 11 deals, $28M total\n\nRun the pipeline review report."
      },
      {
        "title": "End-of-quarter push",
        "prompt": "Time period: Q2 2026 to date (April through May 1)\nProduct line: All commercial\nStalled threshold: 21 days (extended for quarter-end)\nFor: SVP Commercial Friday meeting\n\nPipeline data:\n- 62 active deals, $156M aggregate\n- 18 already closed YTD ($43M)\n- Q2 closing target: $52M\n- Currently at $34M closed/in-funding\n\nStalled deals: 14, totaling $38M\nTop blockers: legal review backlog (6 deals), documentation requests outstanding (5 deals).\n\nClosing 30 days: 16 deals, $42M.\n\nGenerate the report focused on what we can pull forward to hit Q2 targets."
      }
    ]
  },
  {
    "id": "pre-call-prep",
    "cmd": "/pre-call-prep",
    "name": "Pre-Call Preparation Sheet",
    "dept": "Relationship",
    "deptFull": "Relationship Management",
    "difficulty": "beginner",
    "timeSaved": "~30 min",
    "cadence": "Ad hoc",
    "desc": "One-page brief before any client meeting — relationship history, talking points, recommended ask.",
    "purpose": "Produces a one-page brief covering relationship history, recent touchpoints, three talking points, and one recommended ask.",
    "success": "A focused one-page brief reviewable in five minutes before walking into a meeting.",
    "files": [
      "/clients/[client-name]/"
    ],
    "connectors": [
      "Gmail",
      "CRM"
    ],
    "questions": "Who is the meeting with?\nWhat is the purpose?\nMost important outcome?\nDuration?",
    "steps": [
      "Pull emails from last 90 days.",
      "Pull last 3 meeting notes.",
      "Identify open commitments and unresolved issues.",
      "Draft three talking points and one ask.",
      "Format as one-page brief."
    ],
    "output": "Chat Reply",
    "tone": "Internal / Casual",
    "length": "One Page",
    "guardrails": [
      "Anonymize member & PII",
      "Always ask the questions",
      "Never send anything externally"
    ],
    "customGuard": "Treat relationship history as confidential. Never reference financial detail in shared documents.",
    "owner": "Relationship Manager",
    "maturity": "production",
    "samples": [
      {
        "title": "Eastside Construction — treasury renewal",
        "prompt": "Meeting: Tomorrow (April 26) at 2:00 PM\nWith: Lisa Mendoza, CFO of Eastside Construction Corp\nLocation: Their offices\nDuration: 60 minutes\nPurpose: Annual treasury services renewal review\nMost important outcome: Secure 3-year contract renewal with expanded fee structure\n\nRelationship facts:\n- Member since 2018\n- Annual treasury revenue: $48K\n- Average deposit balance: $3.2M (up from $2.8M last year)\n- Lending: $2.1M term loan (closed 2022, performing), $1.5M line (50% utilized)\n- Last 90 days touchpoints: 3 emails, 2 calls (mostly operational issues)\n\nOpen commitments:\n- We promised to deliver new ACH origination pricing by 4/15 (delivered 4/18 — 3 days late)\n- They asked about positive pay onboarding (we sent demo 4/10)\n\nRecent context: Their CFO mentioned in March they're evaluating two competitors. Their AR/AP volume is up 40% YoY.\n\nGenerate the pre-call brief."
      },
      {
        "title": "Thompson Logistics — prospect first meeting",
        "prompt": "Meeting: Friday May 2 at 12:00 PM\nWith: Marcus Thompson, Owner of Thompson Logistics LLC\nLocation: Lunch at Bella Vista\nDuration: 75 minutes\nPurpose: Prospect discovery — referred by John Davis (existing member)\nMost important outcome: Understand banking needs, secure follow-up meeting with team\n\nProspect facts (from referral):\n- 8-year-old logistics company, ~30 trucks\n- Estimated $12M revenue\n- Currently with regional bank (frustrated with service)\n- Owner active in Toastmasters with our referrer\n\nWhat we don't know yet: current loan structure, treasury volume, decision timeline, full team structure.\n\nGenerate the pre-call brief."
      }
    ]
  },
  {
    "id": "rate-memo",
    "cmd": "/rate-memo",
    "name": "Rate Change Memo",
    "dept": "Treasury",
    "deptFull": "Finance & Treasury",
    "difficulty": "intermediate",
    "timeSaved": "~2 hr",
    "cadence": "Monthly",
    "desc": "Board-ready rate change memo with market context, margin impact, competitive positioning, recommendation.",
    "purpose": "Drafts a board-ready rate change memo with market context, margin impact analysis, and clear recommendation.",
    "success": "A one-page memo to ALCO standard with proposed rate, margin impact, competitive position, and single recommendation.",
    "files": [
      "/data/rate-history.xlsx",
      "/data/competitor-rates.xlsx",
      "/templates/alco-rate-memo.docx"
    ],
    "connectors": [
      "Web Search",
      "Google Drive"
    ],
    "questions": "Which products?\nProposed rate and effective date?\nDriving factor?\nALCO or full board?\nNext meeting date?",
    "steps": [
      "Search Fed rate, FOMC, 2-yr Treasury.",
      "Read rate history; calculate 12-mo NIM trend.",
      "Position against competitors.",
      "Build before/after impact table.",
      "Draft memo with all sections.",
      "Format and save."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Board / Executive",
    "length": "One Page",
    "guardrails": [
      "Cite only my policy files",
      "Flag missing data",
      "Never make final decisions"
    ],
    "customGuard": "Show NIM impact methodology. Never assert competitor will/won't match. Cite Fed rate as of specific date.",
    "owner": "Treasurer",
    "maturity": "production",
    "samples": [
      {
        "title": "12-month CD rate increase",
        "prompt": "Product affected: 12-month Certificate of Deposit\nProposed change: Increase APY from 4.25% to 4.75% (50 bps)\nEffective date: June 1, 2026\nDriving factor: Liquidity needs + competitive pressure\nFor: ALCO meeting May 10, 2026\n\nCurrent market context:\n- Fed Funds: 5.25–5.50% (last move September 2025)\n- 1-yr Treasury: 4.62%\n- Major regional competitor (NorthBank): 12-mo CD at 4.85%\n- Direct local credit union (United Heritage): 12-mo CD at 4.65%\n\nOur position:\n- 12-mo CD balances: $284M (12% of total deposits, target 14%)\n- NIM trend: 3.42% YTD (down from 3.61% prior year)\n- Loan/Deposit ratio: 92% (target 85–90%)\n\nEstimated impact:\n- New money: +$22M projected over 90 days\n- Cost: ~+$110K annualized at proposed rate\n- NIM impact: -3 bps in Q3\n\nDraft the ALCO rate change memo."
      },
      {
        "title": "CRE 5-yr fixed — +25 bps",
        "prompt": "Product affected: Commercial CRE rate (5-year fixed)\nProposed change: Increase by 25 bps (from 6.50% to 6.75%)\nEffective date: May 15, 2026\nDriving factor: FOMC indicating no near-term cut + portfolio yield optimization\nFor: Full board meeting May 17, 2026\n\nCurrent market:\n- Fed Funds: 5.25–5.50%\n- 5-yr Treasury: 4.31%\n- Our current spread: 219 bps over 5-yr Treasury\n- Competitor avg: 6.85%\n\nOur position:\n- CRE portfolio: $487M (38% of loan book)\n- Weighted avg yield: 5.92% (well below new originations)\n- Q1 originations: $42M at average 6.50%\n- Prepayment rates: 18% annualized\n- New construction pipeline: $38M\n\nEstimated impact:\n- Volume risk: estimate -10% origination volume (-$4M Q3)\n- Yield improvement: +25 bps on $42M annual originations = +$105K\n- Net: positive at proposed rate per analysis\n\nDraft the rate change memo for the board."
      }
    ]
  },
  {
    "id": "board-package",
    "cmd": "/board-package",
    "name": "Board Package Generator",
    "dept": "Executive",
    "deptFull": "Executive & Board Reporting",
    "difficulty": "advanced",
    "timeSaved": "~8 hr",
    "cadence": "Monthly",
    "desc": "Pulls financials, drafts variance narratives, assembles committee reports into a complete board package.",
    "purpose": "Assembles a board package: financial dashboard, variance narratives, committee reports, executive summary.",
    "success": "A board-ready PowerPoint plus Word executive summary, all figures verified, narratives in board voice.",
    "files": [
      "/financials/",
      "/strategic-plan/",
      "/templates/board-deck.pptx",
      "/data/budget.xlsx"
    ],
    "connectors": [
      "Google Drive",
      "SharePoint"
    ],
    "questions": "Meeting date and reporting period?\nWhich committees reporting?\nSpecial agenda items?\nBoard chair detail preference?",
    "steps": [
      "Pull current financial statements.",
      "Compare to budget and prior year.",
      "Flag variances >10% or >$50K.",
      "Draft variance narrative in board voice.",
      "Pull committee report inputs.",
      "Build executive summary.",
      "Format and save."
    ],
    "output": "Slide Deck (.pptx)",
    "tone": "Board / Executive",
    "length": "Full Detail",
    "guardrails": [
      "Flag missing data",
      "Cite only my policy files",
      "Never make final decisions"
    ],
    "customGuard": "Never present unverified projections as fact. Always show budget vs actual. Flag restatements explicitly.",
    "owner": "Corporate Secretary",
    "maturity": "pilot",
    "samples": [
      {
        "title": "May board — April month-end",
        "prompt": "Meeting: May 15, 2026\nReporting period: April 2026 (month-end financials)\nReporting committees: Finance, Audit, Risk, Compensation\n\nSpecial agenda items:\n- Q1 Strategic Plan progress check-in\n- Executive compensation review (annual cycle)\n- Cybersecurity incident response policy update (proposed)\n\nBoard chair preference: Detailed memos preferred; financial dashboard with explanations.\n\nFinancial highlights (April 2026):\n- Total assets: $2.84B (+1.2% MoM, +6.8% YoY)\n- Net income MTD: $4.2M (vs budget $3.9M, +8%)\n- ROA: 0.59% (target 0.55%)\n- NIM: 3.38% (vs prior year 3.61% — down 23 bps)\n- Loan growth YTD: +4.2%\n- Deposit growth YTD: +3.1%\n- Allowance for credit losses: $18.4M (1.42% of loans)\n\nVariances to flag:\n- Non-interest income +14% MoM (mortgage refis up)\n- Operating expenses +6% MoM (one-time IT modernization charge $480K)\n- NPLs at 0.42% (up from 0.38% — small uptick on one CRE relationship)\n\nBuild the board package."
      },
      {
        "title": "Q1 quarterly board review",
        "prompt": "Meeting: April 17, 2026 (already happened — this is for follow-up reporting)\nReporting period: Q1 2026\nReporting committees: All\n\nSpecial agenda items:\n- Q1 results vs budget\n- 5-year strategic plan annual refresh\n- New branch grand opening review (Pacific Heights, opened February)\n\nFinancial highlights Q1 2026:\n- Net income: $11.8M (budget $11.2M, +5%)\n- ROA: 0.62%, ROE: 8.4%\n- Asset growth: +1.8% Q1\n- Loan growth: +2.1%, Deposit growth: +1.4%\n- Net charge-offs: $480K (annualized 0.04%)\n- Capital: Tier 1 11.4%, Total 13.2% (well-capitalized)\n\nStrategic plan progress (4 of 12 initiatives):\n- ON TRACK: digital banking modernization, branch expansion (1 of 2 completed)\n- AT RISK: commercial deposit growth (-3% vs target)\n- COMPLETED: vendor consolidation project\n\nBuild the comprehensive Q1 board package."
      }
    ]
  },
  {
    "id": "member-complaint",
    "cmd": "/member-complaint",
    "name": "Member Complaint Resolution",
    "dept": "Operations",
    "deptFull": "Operations & Retail Banking",
    "difficulty": "beginner",
    "timeSaved": "~45 min",
    "cadence": "Per complaint",
    "desc": "Categorizes complaints, drafts member response, creates log entry meeting tracking requirements.",
    "purpose": "Structures a complaint, identifies owner, drafts member response, creates log entry.",
    "success": "Member response email drafted in plain language plus log entry with all tracking fields.",
    "files": [
      "/policies/complaint-policy.pdf",
      "/templates/complaint-log.xlsx"
    ],
    "connectors": [
      "Gmail",
      "Core Banking"
    ],
    "questions": "Nature of complaint?\nProduct or service?\nMember already contacted?\nRegulatory flag (UDAAP, Reg E, FCRA)?\nDate received?",
    "steps": [
      "Categorize by type and product.",
      "Check policy for response timeframe.",
      "Identify owner.",
      "Draft response in plain language.",
      "Create log entry with regulatory flags.",
      "Escalate UDAAP/Reg E/FCRA items."
    ],
    "output": "Email Draft",
    "tone": "Member-facing / Plain",
    "length": "Bullets Only",
    "guardrails": [
      "Anonymize member & PII",
      "Use our terminology",
      "Flag missing data",
      "Never send anything externally"
    ],
    "customGuard": "Member response is draft only. Never commit to specific outcomes — only timeline. Reg E disputes flagged for 10/45/90 day tracking.",
    "owner": "Member Service Manager",
    "maturity": "production",
    "samples": [
      {
        "title": "Reg E unauthorized ATM",
        "prompt": "Complaint received: Today (April 25, 2026)\nFrom: Sarah Mitchell (Member ID: M-0087423)\nChannel: Phone call to branch manager\nMember status: Member since 2014, no prior complaints\n\nNature of complaint: Member reports unauthorized ATM withdrawal of $300 on April 23, 2026 at 3:42 PM at our Northgate branch ATM. Member states card was in their possession at time of withdrawal and they did not authorize the transaction.\n\nProduct/service: Debit card / ATM (Reg E applies)\nRegulatory implications: Reg E unauthorized transaction — must investigate within 10 business days, provisional credit if not resolved by then. 45 days for full investigation.\n\nAvailable facts:\n- ATM video footage: requested, expected by EOD tomorrow\n- Other recent transactions: normal pattern\n- Card status: still active, not previously reported lost/stolen\n- Member states they were at work that afternoon (can provide proof)\n\nProcess the complaint."
      },
      {
        "title": "Overdraft fee + notification claim",
        "prompt": "Complaint received: Yesterday (April 24, 2026)\nFrom: David Park (Member ID: M-0156789)\nChannel: Email to memberservice@ourcu.org\nMember status: Member since 2019, one prior complaint (2022, resolved)\n\nNature of complaint: Member assessed $35 overdraft fee on April 22, 2026 for a $42 grocery purchase. Claims he never received the low-balance notification email that should have arrived per his alert settings. Demands fee refund plus apology.\n\nProduct/service: Checking account / Courtesy Pay program\nRegulatory implications:\n- Possible UDAAP angle (notification failure could be deceptive practice)\n- Reg DD disclosures (we promote the alert system)\n- Not a Reg E dispute (member acknowledges he made the purchase)\n\nAvailable facts:\n- Member's alert settings: confirmed enabled for \"balance below $50\"\n- Email logs (IT pulled): notification sent 4/22 at 11:42 AM, not bounced\n- Member's previous OD notifications: 6 in past 12 months, all received\n- Possibly went to spam (member to check)\n- Amount: $35 fee, $42 transaction, account at -$22 after\n\nProcess the complaint."
      }
    ]
  },
  {
    "id": "branch-perf",
    "cmd": "/branch-performance",
    "name": "Branch Performance Scorecard",
    "dept": "Operations",
    "deptFull": "Operations & Retail Banking",
    "difficulty": "intermediate",
    "timeSaved": "~3 hr",
    "cadence": "Monthly",
    "desc": "Pulls production by branch, calculates against goals, identifies top/bottom performers, drafts narrative.",
    "purpose": "Generates branch performance scorecard with production vs goal, outliers, narrative for retail leadership.",
    "success": "Excel scorecard ranked by goal attainment plus Word narrative explaining outliers and trends.",
    "files": [
      "/branches/",
      "/goals/branch-goals.xlsx",
      "/templates/scorecard.xlsx"
    ],
    "connectors": [
      "Core Banking",
      "CRM"
    ],
    "questions": "Reporting period?\nWhich metrics?\nComparison basis?\nFor leadership only or branch managers?",
    "steps": [
      "Pull production data by branch.",
      "Compare to goal and prior period.",
      "Normalize for branch size.",
      "Rank by goal attainment.",
      "Identify top/bottom performers.",
      "Draft narrative — branches not individuals.",
      "Format and save."
    ],
    "output": "Spreadsheet (.xlsx)",
    "tone": "Professional",
    "length": "Full Detail",
    "guardrails": [
      "Anonymize member & PII",
      "Flag missing data"
    ],
    "customGuard": "Branches only — never single out individual staff. Always normalize for branch size. Flag data quality issues.",
    "owner": "SVP Retail",
    "maturity": "production",
    "samples": [
      {
        "title": "April monthly scorecard",
        "prompt": "Reporting period: April 2026 (month-end)\nBranches included: All 14 branches\nMetrics: New checking, new savings, deposit growth, loan referrals to commercial team, member acquisition\nComparison basis: vs goal, vs prior month, vs prior year same period\nAudience: Retail leadership team meeting, Wednesday May 7\n\nApril production summary:\n- Total new checking accounts: 247 (goal 240, +3%)\n- Total new savings: 189 (goal 195, -3%)\n- Net deposit growth: $14.2M (goal $12M, +18%)\n- Loan referrals: 47 (goal 42, +12%)\n- New members: 156 (goal 150, +4%)\n\nBranch-level highlights:\n- Top performer (% of goal): Pacific Heights (new branch, opened Feb)\n- Bottom performer: Downtown (legacy branch, 87% of goal)\n- 3 branches missed deposit goal due to large business member moves\n- Branch sizes range from 4 FTE to 12 FTE\n\nGenerate the scorecard."
      },
      {
        "title": "Q1 wrap with deposit focus",
        "prompt": "Reporting period: Q1 2026 (Jan–Mar)\nBranches: All 14\nMetrics focus: Deposit growth, member retention, cross-sell ratio\nComparison basis: vs Q1 2025, vs annual plan\nAudience: SVP Retail and CEO\n\nQ1 highlights:\n- Network deposit growth: +$38M (annualized 5.4%)\n- Goal was +$32M, ahead of plan\n- Member retention: 94.2% (target 93%)\n- Cross-sell ratio: 2.4 (target 2.5)\n\nBranch-level:\n- 4 branches exceeded all metrics\n- 3 branches missed deposit goal\n- New Pacific Heights branch hit 142% of opening-quarter goal\n- 2 branches showing concerning member retention (under 91%)\n\nGenerate the Q1 scorecard with retention deep-dive."
      }
    ]
  },
  {
    "id": "campaign-compliance",
    "cmd": "/campaign-compliance",
    "name": "Marketing Campaign Compliance Review",
    "dept": "Marketing",
    "deptFull": "Marketing & Member Experience",
    "difficulty": "intermediate",
    "timeSaved": "~2 hr",
    "cadence": "Per campaign",
    "desc": "Reviews materials against required disclosures, checks UDAAP, produces annotated review.",
    "purpose": "Reviews marketing campaign drafts against required disclosures and UDAAP standards.",
    "success": "Annotated review with every required disclosure verified or missing, UDAAP risks flagged, required edits.",
    "files": [
      "/policies/advertising-policy.pdf",
      "/policies/disclosure-library.pdf",
      "/campaigns/draft/"
    ],
    "connectors": [
      "Google Drive",
      "SharePoint"
    ],
    "questions": "What channel?\nWhat product?\nTarget audience and geography?\nPromotional rate?\nLaunch date?",
    "steps": [
      "Read campaign material.",
      "For credit: verify Reg Z disclosures.",
      "For deposits: verify Reg DD disclosures.",
      "Verify NCUSIF/FDIC notice.",
      "Scan for UDAAP risk language.",
      "Check fair lending implications.",
      "Produce annotated review.",
      "Flag for compliance officer."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Regulatory / Formal",
    "length": "2–3 Pages",
    "guardrails": [
      "Cite only my policy files",
      "Never make final decisions",
      "Flag missing data"
    ],
    "customGuard": "Compliance officer must approve final launch. Never approve \"guaranteed\" or \"best in market\" without substantiation.",
    "owner": "Marketing Compliance",
    "maturity": "production",
    "samples": [
      {
        "title": "High-yield savings email blast",
        "prompt": "Channel: Email blast to existing members\nProduct: New \"Premium High-Yield Savings\" account\nTarget audience: All checking members with savings <$10K\nGeographic scope: All states we operate (WA, OR, ID)\nPromotional rate: 4.50% APY for first 12 months on balances $5K–$100K\nStandard rate: 3.75% APY thereafter\nLaunch date: June 1, 2026\nExpected reach: 18,400 members\n\nCampaign creative provided:\n- Subject line: \"Your money deserves more — 4.50% APY\"\n- Hero copy: \"Earn 4.50% APY on your savings. Open an account in 5 minutes. FDIC insured.\"\n- CTA: \"Open now — limited time offer\"\n- Footer disclosure: APY accurate as of [DATE]; minimum opening deposit $500; promotional rate for 12 months on balances $5K–$100K; rates may change\n\nRun the compliance review."
      },
      {
        "title": "HELOC direct mail postcard",
        "prompt": "Channel: Direct mail (postcard)\nProduct: Home Equity Line of Credit\nTarget audience: Homeowners with primary residence in our footprint\nGeographic scope: Pierce, King, Snohomish counties (WA)\nPromotional offering: Variable rate Prime + 0.50% (currently 9.00%); $500 closing cost credit if drawn $25K+ within 30 days\nLaunch date: May 15, 2026\nExpected reach: 25,000 mailings\n\nCampaign creative provided:\n- Front: \"Your home's value, your money — HELOC at Prime + 0.50%\"\n- Reverse: \"Up to $250,000 line. As low as 9.00% APR. $500 closing cost credit. Apply by July 1.\"\n- Disclosure block: Standard Reg Z box (rate, fees, payments examples)\n\nRun the compliance review."
      }
    ]
  },
  {
    "id": "vendor-risk",
    "cmd": "/vendor-risk",
    "name": "Third-Party Risk Assessment",
    "dept": "Risk",
    "deptFull": "Risk & Vendor Management",
    "difficulty": "advanced",
    "timeSaved": "~4 hr",
    "cadence": "Per onboarding",
    "desc": "Categorizes vendor criticality, assesses data sensitivity, reviews security docs, identifies gaps per FFIEC.",
    "purpose": "Conducts third-party risk assessment per FFIEC and OCC 2013-29: criticality, data sensitivity, security review.",
    "success": "Complete vendor risk assessment with criticality tier, data classification, SOC 2 gap analysis, mitigations.",
    "files": [
      "/policies/vendor-management.pdf",
      "/templates/vendor-risk.docx",
      "/vendors/[vendor]/"
    ],
    "connectors": [
      "Google Drive",
      "SharePoint"
    ],
    "questions": "Vendor name and service?\nWhat data accessed?\nContract value and term?\nNew or renewal?\nSOC 2 Type II provided?\nRecovery time tolerance?",
    "steps": [
      "Categorize criticality by RTO.",
      "Classify data sensitivity.",
      "Review SOC 2; identify gaps.",
      "Check required documentation.",
      "Identify gaps.",
      "Draft risk rating with justification.",
      "List required mitigations."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Regulatory / Formal",
    "length": "2–3 Pages",
    "guardrails": [
      "Never make final decisions",
      "Cite only my policy files",
      "Flag missing data"
    ],
    "customGuard": "Assessment only — never approves onboarding. Critical-tier vendors must escalate to executive review. Flag SOC 2 qualified opinions.",
    "owner": "CISO",
    "maturity": "production",
    "samples": [
      {
        "title": "NorthStar — new core banking vendor",
        "prompt": "Vendor: NorthStar Banking Systems Inc\nService: Core banking platform replacement (deposit and loan systems)\nContract value: $480,000/year, 5-year term, $2.4M total contract value\nStatus: New onboarding (replacing 22-year-old legacy system)\n\nData accessed:\n- All member NPI (names, SSN, account numbers, balances)\n- Transaction history\n- Loan documents and payment records\n- Employee access credentials\n\nRecovery time tolerance: 4 hours (mission critical)\n\nSOC 2 Type II: Provided (one qualified opinion regarding network segmentation — vendor remediated, awaiting next audit)\n\nOther documentation:\n- Cyber insurance: $50M (sufficient)\n- BCM/DR documentation: provided\n- Penetration test results: most recent 8 months ago\n- Subcontractors: 4 critical (AWS, Snowflake, Twilio, Auth0)\n\nContext: 18-month implementation, parallel run for 6 months, full cutover Q3 2027.\n\nRun the risk assessment."
      },
      {
        "title": "Pacific Print — statement vendor renewal",
        "prompt": "Vendor: Pacific Print Solutions\nService: Member statement printing and mailing\nContract value: $185,000/year, 3-year renewal\nStatus: Renewal (current vendor 7 years)\n\nData accessed:\n- Member names and addresses\n- Account numbers (masked)\n- Statement balances\n- No SSN or full account number access\n\nRecovery time tolerance: 5 business days (statements have flex)\n\nSOC 2 Type II: Provided (clean opinion)\n\nOther documentation:\n- Cyber insurance: $10M\n- BCM/DR: tested annually\n- Subcontractors: 1 (USPS for mailing)\n- Prior issues: none in 7 years; 99.7% on-time delivery\n\nRun the risk assessment."
      }
    ]
  },
  {
    "id": "strategic-update",
    "cmd": "/strategic-update",
    "name": "Strategic Initiative Status",
    "dept": "Executive",
    "deptFull": "Executive & Board Reporting",
    "difficulty": "intermediate",
    "timeSaved": "~3 hr",
    "cadence": "Monthly",
    "desc": "Pulls initiative status, compares to milestones, identifies risks, recommends resource changes.",
    "purpose": "Generates monthly strategic initiative status report comparing actual to milestones for ELT or board.",
    "success": "1-page Word executive update with each initiative status, milestone progress, blockers, resource needs.",
    "files": [
      "/strategic-plan/",
      "/initiatives/",
      "/templates/exec-update.docx"
    ],
    "connectors": [
      "Google Drive",
      "CRM"
    ],
    "questions": "Reporting period and meeting date?\nKey audience?\nInitiatives needing decisions?\nNew initiatives this period?",
    "steps": [
      "Read each initiative folder.",
      "Compare to planned milestones.",
      "Categorize: On Track, At Risk, Off Track.",
      "Identify resource needs and blockers.",
      "Draft summary.",
      "Format and save."
    ],
    "output": "Word Doc (.docx)",
    "tone": "Board / Executive",
    "length": "One Page",
    "guardrails": [
      "Cite only my policy files",
      "Flag missing data",
      "Never make final decisions"
    ],
    "customGuard": "Never present at-risk initiatives as on-track. Always include resource needs explicitly.",
    "owner": "Chief Strategy Officer",
    "maturity": "production",
    "samples": [
      {
        "title": "May ELT update",
        "prompt": "Reporting period: April 2026 (month-end)\nMeeting: ELT, Wednesday May 8, 2026\nKey audience: CEO and direct reports (12 people)\n\nInitiatives needing decisions:\n1. Digital lending platform — vendor selection (RFP scoring complete)\n2. Branch consolidation in declining markets (2 branches under review)\n\nNew initiatives this period: None\n\n12 active initiatives:\n\nDigital Banking Modernization (1 of 4 sub-initiatives complete; on track)\n- Mobile app refresh: completed March\n- Online banking: in pilot, 30% complete\n- API platform: in design\n- Business banking online: not started\n\nCommercial Deposit Growth (off track)\n- Q1 deposit growth: +1% vs goal of +4%\n- Treasury services pricing review: pending\n- New commercial deposit RM: open req\n\nMember Acquisition (on track)\n- New member growth: +3.2% YTD vs goal +3%\n- Pacific Heights branch: ahead of pro forma\n- Digital acquisition: 18% of new members (was 12%)\n\nTalent & Culture (on track)\n- Engagement score: 4.2/5 (up from 3.9)\n- Retention rate: 88% (target 85%)\n\nGenerate the strategic update."
      },
      {
        "title": "Q1 board strategic check-in",
        "prompt": "Reporting period: Q1 2026\nMeeting: Board strategic session May 22, 2026\nKey audience: Full board (9 directors)\n\nInitiatives needing decisions:\n1. M&A opportunity — small thrift in adjacent market ($350M assets, $4M offer)\n2. New branch market entry (King County north — opportunity vs cost)\n\nNew initiatives this period: One (Member Financial Wellness program — board-approved March)\n\n12 initiatives status:\n- 7 ON TRACK\n- 3 AT RISK (commercial deposit growth, IT modernization timeline, fee income diversification)\n- 2 OFF TRACK (digital lending platform, vendor consolidation)\n- 1 NEW (financial wellness program)\n\nResource needs:\n- Digital lending: $400K incremental Q3 spend to recover timeline\n- IT modernization: extension to Q1 2027 (was Q4 2026)\n- Vendor consolidation: 2 FTE deferred 6 months\n\nCritical risks:\n- NIM compression (-23 bps YoY) impacting initiative funding\n- Regulatory exam preparation consuming capacity\n- 2 senior leaders retiring Q3\n\nGenerate the strategic update."
      }
    ]
  }
] as const satisfies readonly ToolboxSkillTemplate[];
