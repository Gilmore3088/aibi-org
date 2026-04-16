// AiBI-P Module 1: The Regulatory Landscape
// Pillar: Awareness | Estimated: 25 minutes
// Key Output: Regulatory Cheatsheet

import type { Module } from './types';

export const module1: Module = {
  number: 1,
  id: 'm1-regulatory-landscape',
  title: 'Navigating the Regulatory Landscape',
  pillar: 'awareness',
  estimatedMinutes: 25,
  keyOutput: 'Regulatory Cheatsheet',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m1_refined_regulatory_landscape',
  sections: [
    {
      id: 'm1-opening',
      title: 'The Regulatory Environment Through 2026',
      content: `Understanding AI governance in community banking begins with recognizing that no single law governs AI — instead, five existing frameworks have been extended to cover it. Each framework was written for a different purpose, but together they form the institutional boundaries within which every AI use case at your bank must operate.

The US Government Accountability Office confirmed in its May 2025 report (GAO-25-107197) that there is no comprehensive AI-specific banking regulation yet. What exists is a patchwork of extensions: SR 11-7 applied to AI models, TPRM guidance extended to AI vendors, ECOA enforced against algorithmic lending decisions, BSA/AML standards applied to AI-driven transaction monitoring, and the AIEOG AI Lexicon providing shared vocabulary across regulators.

This is not a temporary gap. The regulatory environment will remain framework-dependent for the foreseeable future. Your job as a practitioner is to understand which framework applies to each AI use case you encounter — and what it means for how you must document, test, and communicate about that use case.`,
    },
    {
      id: 'm1-governed-vs-ungoverned',
      title: 'Governed vs. Ungoverned AI Use',
      content: `The most important distinction in community banking AI practice is not "good AI vs. bad AI" — it is **governed AI vs. ungoverned AI**.

**Governed AI** is use that has been:
- Reviewed against applicable regulatory frameworks
- Documented with clear records of validation and testing
- Subject to human-in-the-loop oversight for material decisions
- Disclosed to affected parties where required

**Ungoverned AI** is use where these elements are absent. This includes the informal use of consumer AI tools (ChatGPT, Claude, Gemini) with institutional data that has not been assessed for data classification compliance, vendor AI features enabled without third-party risk review, and automated outputs used in credit or compliance decisions without validation.

Shadow AI — staff using AI tools without institutional knowledge — is the most common source of ungoverned use. Module 5 covers the specific data classification framework for managing this risk.`,
    },
    {
      id: 'm1-aieog',
      title: 'The AIEOG AI Lexicon',
      content: `In February 2026, the US Treasury, FBIIC, and FSSCC jointly published the AIEOG AI Lexicon — the first cross-regulator glossary for AI in financial services. Understanding these definitions matters because regulators will use them.

**Key terms from the AIEOG Lexicon:**

- **Hallucination**: An AI output that is factually incorrect, fabricated, or misleading, presented with apparent confidence. The AIEOG definition distinguishes hallucination from model error — hallucination specifically refers to outputs that lack grounding in source data.

- **AI Governance**: The policies, processes, and organizational structures that define how an institution develops, deploys, monitors, and retires AI systems. Per the Lexicon, governance is distinct from individual model risk management — it applies to the institutional AI program as a whole.

- **AI Use Case Inventory**: A structured record of all AI systems and tools in active use at an institution, including their purpose, data inputs, outputs, and applicable risk controls. The Lexicon treats this as a baseline governance requirement.

- **HITL (Human-in-the-Loop)**: A design pattern in which a human reviews or approves AI outputs before they are acted upon. HITL is required for any AI system that makes or influences material decisions affecting customers.

- **Third-Party AI Risk**: Risks arising from AI systems operated by vendors or service providers. TPRM guidance has been extended to require the same risk assessment rigor for AI-enabled vendor tools as for any other critical third party.

- **Explainability**: The capacity of an AI system to provide human-understandable reasons for its outputs. SR 11-7 requires conceptual soundness and transparency for model outputs used in decisions.`,
    },
  ],
  tables: [
    {
      id: 'm1-frameworks',
      caption: 'Five Regulatory Frameworks Applied to AI Banking',
      columns: [
        { header: 'Framework', key: 'framework' },
        { header: 'Regulatory Body', key: 'body' },
        { header: 'Core Intent', key: 'intent' },
        { header: 'How It Applies to AI', key: 'aiApplication' },
        { header: 'Staff-Level Impact', key: 'staffImpact' },
      ],
      rows: [
        {
          framework: 'SR 11-7',
          body: 'Federal Reserve / OCC',
          intent: 'Model Risk Management — governance framework for quantitative models across their full lifecycle',
          aiApplication: 'Any AI system used in credit underwriting, fraud detection, or risk scoring is a "model" under SR 11-7 and must be validated, documented, and monitored',
          staffImpact: 'You must be able to explain what an AI tool does and cite its limitations. Explainability and conceptual soundness are required, not optional',
        },
        {
          framework: 'TPRM',
          body: 'Interagency',
          intent: 'Third-Party Risk Management — managing risks from outsourced services and vendors',
          aiApplication: 'Every AI tool from a vendor — including Microsoft Copilot, ChatGPT Enterprise, and AI-enabled core banking features — requires TPRM assessment before deployment',
          staffImpact: 'Do not activate or broadly adopt any new AI vendor tool until IT and compliance have completed a TPRM review. "Free tier" tools are not exempt',
        },
        {
          framework: 'ECOA / Reg B',
          body: 'CFPB',
          intent: 'Equal Credit Opportunity Act — prohibits discrimination in credit decisions',
          aiApplication: 'AI-driven lending models must provide specific adverse action reasons. Outputs like "score too low" from a black-box model do not satisfy ECOA requirements',
          staffImpact: 'If AI touches any lending or credit decision workflow, adverse action explanations must be human-readable, specific, and traceable to the model\'s inputs',
        },
        {
          framework: 'BSA / AML',
          body: 'FinCEN',
          intent: 'Bank Secrecy Act / Anti-Money Laundering — financial integrity and suspicious activity monitoring',
          aiApplication: 'AI transaction monitoring systems must meet the same documentation and auditability standards as manual SAR processes. Model performance must be validated',
          staffImpact: 'AI-generated SAR recommendations require human review before filing. You are accountable for what you submit — the AI does not carry regulatory responsibility',
        },
        {
          framework: 'AIEOG AI Lexicon',
          body: 'US Treasury / FBIIC / FSSCC',
          intent: 'Cross-regulator AI vocabulary published February 2026',
          aiApplication: 'Establishes shared definitions for hallucination, AI governance, HITL, third-party AI risk, and explainability. Regulators will use this vocabulary in examinations',
          staffImpact: 'Align your institution\'s AI policy language with the AIEOG Lexicon. Inconsistent terminology creates examination risk',
        },
      ],
    },
  ],
  activities: [
    {
      id: '1.1',
      title: 'Regulatory Cheatsheet',
      description: 'Answer two questions to generate your personalized Regulatory Cheatsheet. Your responses are used to personalize the front page of the cheatsheet to your role.',
      type: 'free-text',
      fields: [
        {
          id: 'framework-relevance',
          label: 'Which of the five frameworks is most directly relevant to your current role, and why?',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'Consider which regulatory framework most directly affects your daily responsibilities. For example, if you work in lending, ECOA/Reg B may be most relevant. If you work in operations or IT, TPRM may apply most directly...',
        },
        {
          id: 'governance-message',
          label: 'What is one thing about AI governance that you wish your manager or team understood better?',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'Think about the governance implications that matter most for your team. This could be about documentation requirements, the difference between governed and ungoverned AI use, or the data classification rules that apply to AI prompts...',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'regulatory-cheatsheet',
    },
  ],
  artifacts: [
    {
      id: 'regulatory-cheatsheet',
      title: 'Regulatory Cheatsheet',
      description: 'One-page PDF: five frameworks with staff-level implications (front), AIEOG vocabulary (back). Front page personalized with your role context from Activity 1.1.',
      format: 'pdf',
      triggeredBy: '1.1',
      dynamic: false,
    },
  ],
} as const;
