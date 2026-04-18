// AiBI-P Module 5: Safe Use Guardrails
// Pillar: Understanding | Estimated: 40 minutes
// Key Output: Acceptable Use Card (personalized, dynamic: true)

import type { Module } from './types';

export const module5: Module = {
  number: 5,
  id: 'm5-safe-use-guardrails',
  title: 'Safe Use Guardrails',
  pillar: 'understanding',
  estimatedMinutes: 40,
  keyOutput: 'Acceptable Use Card',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m5_refined_safe_use_guardrails',
  sections: [
    {
      id: 'm5-shadow-ai',
      title: 'The Shadow AI Problem',
      content: `Shadow AI is the use of AI tools by staff without institutional knowledge, approval, or governance. It is the community banking industry's most widespread AI compliance risk — and the one most institutions are least prepared for.

The 2025 Gartner Peer Community survey (via Jack Henry & Associates) found that 57% of financial institutions report struggling with AI skill gaps, and 55% have no AI governance framework yet. These two statistics together describe the shadow AI condition: staff are using tools their institutions are not ready to govern.

> Shadow AI is not a moral failing — it is a structural gap. Staff who use consumer AI tools to do their jobs better are often the institution's most motivated performers. The solution is not prohibition — it is a governance framework that enables safe, compliant use.

**The three sources of shadow AI risk in community banking:**

1. **Consumer AI tools with institutional data:** Staff using free-tier ChatGPT, Claude, or Gemini with non-public institutional information — policy documents, customer queries, internal memos — without understanding the data training implications.

2. **Vendor AI features without TPRM review:** Core banking vendors, document management platforms, and communication tools regularly add AI features that activate automatically or with one-click opt-in. Staff who enable these features without IT and compliance review are creating TPRM exposure.

3. **AI outputs used without verification:** Staff who use AI-generated content in customer communications, compliance filings, or risk assessments without verifying accuracy. The hallucination problem is real — and in banking, an AI-generated compliance finding that traces to a hallucinated citation has regulatory consequences.`,
    },
    {
      id: 'm5-data-classification',
      title: 'Three-Tier Data Classification',
      content: `The fundamental framework for all AI interactions at a community bank or credit union is three-tier data classification. Before sharing any information in an AI prompt, classify it. Your classification determines which tools and settings are permissible.

**Tier 1 — Public Information**

Definition: Information that is already public or would cause no harm if disclosed. Examples: marketing copy, general industry news, publicly available regulatory guidance, published interest rates, job postings.

Usage protocol: Unrestricted. Can be used in free-tier consumer AI tools, public AI APIs, or any platform.

**Tier 2 — Internal Only**

Definition: Information that is not public but does not directly identify customers or contain sensitive institutional strategy. Examples: internal policy documents, employee training materials, process maps, internal memos, non-client-specific performance data, procedure guides.

Usage protocol: Sandboxed use only. Requires a paid enterprise AI account with data training opt-out, OR your institution's approved sandboxed AI environment. Cannot be used in free-tier consumer tools.

**Tier 3 — Highly Restricted**

Definition: Personally identifiable information (PII), customer financial data, account numbers, credit decisions, strategic M&A details, SAR filings, and any data subject to specific regulatory protection.

Usage protocol: Prohibited in AI tools. Do not paste Tier 3 data into any AI prompt, including enterprise-grade tools. If AI analysis of this data is required, it must be done through a formally reviewed, purpose-built integration with appropriate data governance controls.

> When in doubt, classify up. If you are unsure whether information is Tier 2 or Tier 3, treat it as Tier 3.`,
    },
    {
      id: 'm5-hallucination-patterns',
      title: 'Six Banking Hallucination Patterns',
      content: `The AIEOG AI Lexicon (February 2026) defines hallucination as "an AI output that is factually incorrect, fabricated, or misleading, presented with apparent confidence." In banking, hallucination takes six specific forms that practitioners must recognize.

> Apply the same verification standard to AI outputs that you would apply to outputs from a junior staff member on their first day.

**Pattern 1 — Prompt Blindness**

As users become more familiar with an AI tool's fluency and confidence, they stop scrutinizing its outputs. The AI sounds authoritative — so the output gets used without verification. This is the most common failure pattern and the hardest to self-diagnose.

*Mitigation:* Apply the same verification standard to AI outputs that you would apply to outputs from a junior staff member on their first day.

**Pattern 2 — Data Exfiltration**

Inadvertent disclosure of proprietary, non-public, or Tier 3 data into AI prompts that flow to a model provider's systems. This is not hallucination in the traditional sense — it is a data governance failure that the AI makes technically easy.

*Mitigation:* Apply the three-tier classification before every prompt. Free-tier tools are public infrastructure.

**Pattern 3 — Recursive Logic Bias**

AI systems trained on historical banking data can amplify historical biases — particularly in lending and credit contexts where historical decisions already embedded discriminatory patterns. The AI does not hallucinate in the traditional sense; it accurately reflects a biased dataset. The output is internally consistent but institutionally dangerous.

*Mitigation:* Never use AI outputs in credit decisions without human review by someone trained to identify disparate impact.

**Pattern 4 — Prompt Injection**

Malicious instructions embedded in content that gets fed to an AI system — a document, email, or web page that contains hidden instructions designed to manipulate the AI's behavior or extract information. In banking, this typically surfaces when AI is used to analyze external documents.

*Mitigation:* When using AI to analyze externally-sourced documents (loan applications, vendor contracts, counterparty materials), be aware that the document itself could contain injected instructions.

**Pattern 5 — Hallucination Drift**

The AI generates confident, specific-sounding financial figures, regulatory citations, or case law references that do not exist. This is classic hallucination — the model produces plausible-sounding content that is fabricated. It is particularly dangerous in banking because the outputs (interest rates, regulatory requirements, precedent decisions) are the kinds of specific, citable information that staff want to use directly.

*Mitigation:* Always verify any specific number, citation, regulation reference, or case name against primary sources. AI can help you find things; it cannot reliably guarantee they exist.

**Pattern 6 — Over-Reliance on Confidence**

AI systems express uncertainty poorly. When a model does not know something, it often generates a plausible-sounding answer rather than a clear admission of uncertainty. "I'm not sure, but..." followed by a confidently-stated fabrication is a common failure mode.

*Mitigation:* Explicitly prompt the AI to express uncertainty: "If you are not confident about any part of this response, tell me." Then treat the uncertain portions as requiring independent verification.`,
    },
  ],
  tables: [
    {
      id: 'm5-data-classification',
      caption: 'Three-Tier Data Classification Framework for AI Use',
      columns: [
        { header: 'Tier', key: 'tier' },
        { header: 'Description', key: 'description' },
        { header: 'Examples', key: 'examples' },
        { header: 'Usage Protocol', key: 'protocol' },
        { header: 'Risk Level', key: 'risk' },
      ],
      rows: [
        {
          tier: 'Tier 1 — Public Information',
          description: 'Information already public or causing no harm if disclosed',
          examples: 'Marketing copy, general industry news, published regulatory guidance, public interest rates, job postings',
          protocol: 'Unrestricted — can be used in any AI tool including free-tier consumer platforms',
          risk: 'Low',
        },
        {
          tier: 'Tier 2 — Internal Only',
          description: 'Non-public information that does not identify customers or contain sensitive strategy',
          examples: 'Internal policy documents, process maps, employee training materials, internal memos, general performance data',
          protocol: 'Sandboxed use only — requires paid enterprise AI account with data training opt-out, or institution-approved AI environment',
          risk: 'Moderate',
        },
        {
          tier: 'Tier 3 — Highly Restricted',
          description: 'PII, customer financial data, account details, credit decisions, SAR filings, strategic M&A information',
          examples: 'Customer names + account numbers, loan applications, credit scores, SAR details, merger targets, individual performance reviews',
          protocol: 'PROHIBITED in AI tools — requires purpose-built, formally reviewed integration with data governance controls if AI processing is required at all',
          risk: 'Critical',
        },
      ],
    },
    {
      id: 'm5-hallucination-patterns',
      caption: 'Six Banking Hallucination Patterns — Recognition and Mitigation',
      columns: [
        { header: 'Pattern', key: 'pattern' },
        { header: 'Description', key: 'description' },
        { header: 'Banking Example', key: 'example' },
        { header: 'Mitigation', key: 'mitigation' },
        { header: 'AIEOG Lexicon Link', key: 'lexiconLink' },
      ],
      rows: [
        {
          pattern: 'Pattern 1 — Prompt Blindness',
          description: 'Users stop scrutinizing AI outputs as they become more familiar with the system\'s fluency and confidence. The AI sounds authoritative, so outputs are used without verification.',
          example: 'A compliance officer uses ChatGPT to summarize a regulatory update. After six months of accurate summaries, they stop checking the source. On the seventh use, the AI mischaracterizes a key FinCEN requirement.',
          mitigation: 'Apply the same verification standard to AI outputs that you would apply to outputs from a junior staff member on their first day — regardless of how long you have used the tool.',
          lexiconLink: 'Hallucination — AIEOG AI Lexicon, February 2026',
        },
        {
          pattern: 'Pattern 2 — Data Exfiltration',
          description: 'Inadvertent disclosure of proprietary, non-public, or Tier 3 data into AI prompts that flow to a model provider\'s systems. A data governance failure that AI makes technically easy.',
          example: 'A loan officer pastes a borrower\'s full financial statement into a free-tier ChatGPT prompt to "quickly summarize the key numbers." The data flows to OpenAI\'s systems without enterprise protections.',
          mitigation: 'Apply the three-tier data classification before every prompt. Free-tier tools are public infrastructure — treat every free-tier prompt as a public document.',
          lexiconLink: 'Third-Party AI Risk — AIEOG AI Lexicon, February 2026',
        },
        {
          pattern: 'Pattern 3 — Recursive Logic Bias',
          description: 'AI systems trained on historical banking data amplify historical biases, particularly in lending and credit contexts. The AI accurately reflects a biased dataset — the output is internally consistent but institutionally dangerous.',
          example: 'An AI tool trained on historical loan approval data recommends lower credit limits for borrowers in certain zip codes, accurately reflecting past decisions that were themselves discriminatory.',
          mitigation: 'Never use AI outputs in credit decisions without human review by someone trained to identify disparate impact. Document the review in the credit file.',
          lexiconLink: 'ECOA / Reg B — disparate impact applies to algorithmic outputs. See also SR 11-7 model validation requirements.',
        },
        {
          pattern: 'Pattern 4 — Prompt Injection',
          description: 'Malicious instructions embedded in content fed to an AI system — a document, email, or web page containing hidden instructions designed to manipulate the AI\'s behavior or extract information.',
          example: 'A staff member uses AI to summarize a vendor contract. The contract\'s appendix contains hidden text instructing the AI to recommend contract approval regardless of terms — the summary omits unfavorable clauses.',
          mitigation: 'When using AI to analyze externally-sourced documents (loan applications, vendor contracts, counterparty materials), be aware that the document itself could contain injected instructions. Verify key findings independently.',
          lexiconLink: 'HITL (Human-in-the-Loop) — AIEOG AI Lexicon: human review of AI outputs before they are acted upon',
        },
        {
          pattern: 'Pattern 5 — Hallucination Drift',
          description: 'The AI generates confident, specific-sounding financial figures, regulatory citations, or case law references that do not exist. Classic hallucination — plausible-sounding content that is fabricated.',
          example: 'A staff member asks for the current threshold for Currency Transaction Report filing. The AI confidently states "$8,000" instead of the correct $10,000 — a specific, authoritative-sounding answer that is wrong.',
          mitigation: 'Always verify any specific number, citation, regulation reference, or case name against primary sources. AI can help you find things; it cannot reliably guarantee they exist.',
          lexiconLink: 'Hallucination — AIEOG AI Lexicon, February 2026: "an AI output that is factually incorrect, fabricated, or misleading, presented with apparent confidence"',
        },
        {
          pattern: 'Pattern 6 — Over-Reliance on Confidence',
          description: 'AI systems express uncertainty poorly. When a model does not know something, it often generates a plausible-sounding answer rather than a clear admission of uncertainty.',
          example: 'A staff member asks about a specific regulatory examination finding from 2019. The AI generates a detailed, confident-sounding account of an examination that did not occur, because it had no data on that specific event.',
          mitigation: 'Explicitly prompt the AI to express uncertainty: "If you are not confident about any part of this response, tell me." Then treat the uncertain portions as requiring independent verification.',
          lexiconLink: 'Explainability — AIEOG AI Lexicon: the capacity of an AI system to provide human-understandable reasons for its outputs',
        },
      ],
    },
    {
      id: 'm5-drill-scenarios',
      caption: '20-Scenario Classification Drill — Sample Scenarios',
      columns: [
        { header: 'Scenario', key: 'scenario' },
        { header: 'Correct Tier', key: 'tier' },
        { header: 'Key Reasoning', key: 'reasoning' },
      ],
      rows: [
        {
          scenario: 'Draft a social media post about your institution\'s new CD rates',
          tier: 'Tier 1 — Public',
          reasoning: 'Rates are publicly advertised; content is marketing material',
        },
        {
          scenario: 'Summarize your institution\'s BSA policy for new employee training',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Internal policy document — not public, but no customer PII',
        },
        {
          scenario: 'Analyze Q3 risk management policy draft against last year\'s internal audit findings',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Internal documents — policy and audit findings are internal, not client-specific',
        },
        {
          scenario: 'Review a specific customer\'s loan application and flag missing documentation',
          tier: 'Tier 3 — Highly Restricted',
          reasoning: 'Customer PII + loan application data = Tier 3 regardless of context',
        },
        {
          scenario: 'Research federal funds rate history for a presentation to the board',
          tier: 'Tier 1 — Public',
          reasoning: 'Federal Reserve data is public information',
        },
        {
          scenario: 'Draft a memo explaining the new remote work policy to staff',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Internal operational policy — not public, but no customer data',
        },
        {
          scenario: 'Analyze a SAR filing narrative to improve future descriptions',
          tier: 'Tier 3 — Highly Restricted',
          reasoning: 'SAR content is legally restricted and contains sensitive investigation details',
        },
        {
          scenario: 'Write a blog post about AI trends in community banking',
          tier: 'Tier 1 — Public',
          reasoning: 'Industry topic using only publicly available information',
        },
        {
          scenario: 'Review your institution\'s core banking vendor contract for AI-related provisions',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Vendor contract is confidential/internal — not public, no customer data',
        },
        {
          scenario: 'Summarize a meeting transcript from a department planning session',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Internal operations content — not public, but no customer PII if names are typical internal staff',
        },
        {
          scenario: 'Compare publicly available mortgage rates across three competitor institutions',
          tier: 'Tier 1 — Public',
          reasoning: 'Competitor rate data posted publicly on institution websites is public information',
        },
        {
          scenario: 'Prepare talking points about your institution\'s community reinvestment achievements using published CRA data',
          tier: 'Tier 1 — Public',
          reasoning: 'CRA performance evaluations are published by federal regulators and are public record',
        },
        {
          scenario: 'Rewrite your department\'s AI acceptable use policy draft',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Internal governance document — not public, but contains no customer PII or sensitive financial data',
        },
        {
          scenario: 'Generate an onboarding checklist for new tellers based on the internal training manual',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Internal training materials are confidential operational documents not intended for public distribution',
        },
        {
          scenario: 'Summarize findings from an internal process improvement committee',
          tier: 'Tier 2 — Internal Only',
          reasoning: 'Internal committee findings are non-public institutional information with no customer data',
        },
        {
          scenario: 'Draft a response to a customer complaint that references their specific account history',
          tier: 'Tier 3 — Highly Restricted',
          reasoning: 'Customer-specific account history is PII and financial data — Tier 3 regardless of the communication purpose',
        },
        {
          scenario: 'Analyze transaction patterns for a customer flagged in your BSA monitoring system',
          tier: 'Tier 3 — Highly Restricted',
          reasoning: 'BSA monitoring involves potential SAR-adjacent data and customer financial records — strictly Tier 3',
        },
        {
          scenario: 'Summarize a borrower\'s financial statements from their loan file',
          tier: 'Tier 3 — Highly Restricted',
          reasoning: 'Borrower financial statements contain personal financial data and are Tier 3 regardless of format',
        },
        {
          scenario: 'Review an employee\'s performance evaluation to draft improvement plan talking points',
          tier: 'Tier 3 — Highly Restricted',
          reasoning: 'Individual employee performance data is personnel-sensitive PII — classified Tier 3',
        },
        {
          scenario: 'Cross-reference customer deposit records against reported income on a loan application',
          tier: 'Tier 3 — Highly Restricted',
          reasoning: 'Customer deposit records and loan application income data are both Tier 3 financial PII',
        },
      ],
    },
  ],
  activities: [
    {
      id: '5.1',
      title: '20-Second Classification Drill',
      description: 'Classify 20 banking scenarios against the three-tier framework. The drill is timed — you have 20 seconds per scenario. Speed is intentional: real-world data classification decisions happen in the flow of work, not with time to deliberate. After the drill, you will see your accuracy and the reasoning for each correct answer.',
      type: 'drill',
      fields: [
        {
          id: 'drill-response',
          label: 'Data classification drill response',
          type: 'radio',
          required: true,
          options: [
            { value: 'tier-1', label: 'Tier 1 — Public Information' },
            { value: 'tier-2', label: 'Tier 2 — Internal Only' },
            { value: 'tier-3', label: 'Tier 3 — Highly Restricted' },
          ],
        },
      ],
      completionTrigger: 'module-advance',
    },
    {
      id: '5.2',
      title: 'Acceptable Use Card Builder',
      description: 'Build your personalized Acceptable Use Card by answering four questions about your role and AI use context. Your answers are used to generate a role-specific, one-page reference card you can keep at your workstation.',
      type: 'builder',
      fields: [
        {
          id: 'role-context',
          label: 'What is your primary role and department?',
          type: 'text',
          minLength: 10,
          required: true,
          placeholder: 'e.g., Loan Officer, Commercial Lending Department',
        },
        {
          id: 'primary-ai-tool',
          label: 'What AI tool(s) does your institution permit you to use?',
          type: 'text',
          minLength: 5,
          required: true,
          placeholder: 'e.g., Microsoft 365 Copilot (institutional license), ChatGPT Plus (personal)',
        },
        {
          id: 'highest-risk-scenario',
          label: 'What is the highest-risk AI use scenario in your role — the one where data classification matters most?',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'Describe the specific scenario where you might be tempted to share sensitive information with an AI tool. This is used to write a specific guardrail on the front of your Acceptable Use Card.',
        },
        {
          id: 'quick-win-use-case',
          label: 'What is the Tier 1 (public) AI use case that would save you the most time in your role?',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'Describe a task you do regularly that involves only public information and could be accelerated with AI assistance. This becomes the "Start Here" use case on your Acceptable Use Card.',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'acceptable-use-card',
    },
  ],
  artifacts: [
    {
      id: 'acceptable-use-card',
      title: 'Acceptable Use Card',
      description: 'Personalized one-page reference card with your role context, permitted tools, top-tier use case, and highest-risk guardrail. Designed to be printed and kept at workstation.',
      format: 'pdf',
      triggeredBy: '5.2',
      dynamic: true,
    },
  ],
} as const;
