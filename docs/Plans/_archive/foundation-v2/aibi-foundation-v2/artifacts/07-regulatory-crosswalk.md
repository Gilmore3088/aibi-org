# What rule applies when?

**A community-banker's reference for AI use**
**Module 3 companion artifact · AiBI-Foundation**

This one-pager maps the regulatory landscape that touches AI use in a community bank. You don't need to memorize it. You need to know which lens applies to which kind of work, so you know who to call.

---

## The five regulatory lenses

### 1. Model Risk

**Applies when:** AI output is used to make or substantially influence a financial, regulatory, or credit decision.

**Examples in your day:**
- AI-generated credit score or approval recommendation
- AI-driven BSA/AML alert generation or tuning
- Automated valuation models (AVMs) for mortgage collateral
- AI-influenced ALLL or CECL calculations
- AI-assisted loan grading or risk rating

**Primary sources:**
- **SR 11-7 / OCC Bulletin 2011-12** — Supervisory Guidance on Model Risk Management. Adopted by FDIC in 2017. The cornerstone of model governance in banking. Requires independent validation, ongoing monitoring, and documentation sufficient for an outsider to understand the model.
- **OCC Bulletin 2025-26 (September 18, 2025)** — Model Risk Management: Clarification for Community Banks. Permits community banks (defined as up to $30B in assets) to tailor model risk management practices to size and complexity. This is permission to right-size, not permission to skip.
- **Interagency Final Rule on Automated Valuation Models (June 2024)** — sets quality control standards for AVMs used in mortgage transactions. Responsibility ultimately rests with the institution using the model, not the vendor.
- **U.S. Treasury Financial Services AI Risk Management Framework (February 2026)** — non-binding but increasingly referenced. Maps to NIST AI RMF.

**What to do:** If the AI output influences a decision, ask your model risk owner whether it falls under the bank's MRM program. If you don't know who that is — that's the first thing to find out.

---

### 2. Third-Party Risk

**Applies when:** Anything you use is provided by a vendor — and that includes every cloud AI tool.

**Examples in your day:**
- Microsoft Copilot (Microsoft is a third party)
- Claude, ChatGPT, Gemini, Perplexity (each vendor is a third party)
- AI features embedded in your core processor, LOS, or CRM
- Any AI capability your IT or MSP provider has added

**Primary sources:**
- **Interagency Guidance on Third-Party Risk Management (June 2023)** — Federal Reserve, OCC, and FDIC. Sets expectations for vendor risk management throughout the lifecycle: planning, due diligence, contracts, ongoing monitoring, termination.
- **FFIEC IT Examination Handbook** — Outsourcing Technology Services, Architecture/Infrastructure/Operations, and Management booklets all relevant.

**What to do:** Don't bring a new AI tool into the bank without asking. The bank's vendor management process applies even when the tool is "free." If a vendor demos an AI feature that touches member data, the vendor goes through the same review as any other third party.

---

### 3. Fair Lending & Consumer Protection

**Applies when:** AI affects access to credit, pricing, terms, marketing reach, or any consumer-facing communication.

**Examples in your day:**
- AI-influenced credit decisions or pricing
- AI-generated adverse action notices
- AI-driven marketing that targets or excludes groups
- AI-assisted customer-service responses (UDAAP risk if misleading)
- Chatbots that handle member questions about products

**Primary sources:**
- **Equal Credit Opportunity Act (ECOA) / Regulation B** — adverse action explanations must be specific and accurate, regardless of whether the underlying decision involved AI. "The algorithm decided" is not a permissible reason.
- **Fair Credit Reporting Act (FCRA)** — applies whenever consumer reports inform decisions, AI or otherwise.
- **UDAAP (Dodd-Frank §1031, §1036)** — unfair, deceptive, or abusive acts or practices. AI-generated communications still have to be accurate and non-misleading.
- **Joint Statement on Enforcement of Civil Rights, Fair Competition, Consumer Protection, and Equal Opportunity Laws in Automated Systems** — nine federal agencies confirmed that existing legal authorities apply to AI systems.

**Note on CFPB activity:** In May 2025, CFPB withdrew a number of AI-adjacent circulars and interpretive rules. The underlying laws (ECOA, FCRA, UDAAP) did not change. The withdrawn circulars don't grant permission to be careless.

**What to do:** Any AI use that affects how members are treated needs your compliance officer's eyes on it. Marketing AI is not exempt — disparate impact tests still apply.

---

### 4. BSA/AML & Privacy

**Applies when:** AI touches transaction monitoring, suspicious activity detection, customer due diligence, or any handling of customer NPI.

**Examples in your day:**
- AI-generated SAR narratives (drafting, not deciding)
- Alert tuning or false-positive reduction
- Customer due diligence data summarization
- AI-assisted Customer Identification Program work
- Any tool that ingests transaction data

**Primary sources:**
- **Bank Secrecy Act (BSA)** and the FFIEC BSA/AML Examination Manual — AI use in BSA/AML programs is permitted; the bank remains responsible for program effectiveness.
- **Gramm-Leach-Bliley Act (GLBA) / Regulation P** — privacy of nonpublic personal information. Pasting NPI into an unapproved tool is a GLBA issue.
- **FDIC FIL on AI use in financial institutions** — periodic FIL guidance; check the FDIC News Releases page for the most current.

**What to do:** AI can draft a SAR narrative. AI cannot decide whether to file one. AI can help reduce false positives. AI cannot replace human review of alerts. NPI never leaves an approved tool.

---

### 5. Cybersecurity & IT Risk

**Applies when:** Any AI tool processes bank data or operates on bank systems.

**Examples in your day:**
- Cloud AI tools handling internal documents
- AI features that integrate with email, files, or core systems
- Code or scripts generated by AI and run on bank systems
- AI-driven threat detection or fraud monitoring tools

**Primary sources:**
- **FFIEC IT Examination Handbook** — Information Security booklet; Architecture, Infrastructure, and Operations booklet.
- **NIST AI Risk Management Framework (AI RMF 1.0)** and the **NIST Cyber AI Profile (preliminary draft, December 2025)** — harmonizes cybersecurity expectations across regulators into diagnostic statements.
- **GLBA Safeguards Rule** — administrative, technical, and physical safeguards for customer information.

**What to do:** Treat AI tools as you'd treat any other system processing bank data. They belong in your IT inventory, your access controls, and your incident response plan.

---

## How to use this one-pager

1. **Identify the work** you're about to do with AI.
2. **Match it to a lens** above. Most work touches one or two; some touches three or more.
3. **Note the primary source** so you can cite it if asked.
4. **Find your owner** — for a $500M community bank, this is usually a small group:
 - Model risk → CFO, risk officer, or designated MRM owner
 - Third-party risk → COO or vendor management lead
 - Fair lending / consumer protection → compliance officer
 - BSA/AML → BSA officer
 - Cybersecurity → IT lead or CISO/MSP partner
5. **Ask before you build, not after.**

---

## Quarterly refresh

Regulations move. This page should be reviewed every quarter by the curriculum owner.

| Last updated | Next review | Notes |
|---|---|---|
| 2026-Q2 | 2026-Q3 | Treasury FS AI RMF added (Feb 2026); CFPB May 2025 withdrawals reflected; OCC 2025-26 community-bank flexibility added |

---

*This is a learner reference. It is not legal advice. Your bank's compliance and legal counsel are the authoritative source for how these rules apply to your institution.*
