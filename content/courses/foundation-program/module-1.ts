// AiBI-Foundation Module 1: AI for Your Workday
// Pillar: Awareness | Estimated: 25 minutes
// Key Output: Rewritten Email
//
// Metadata + tables + activities only. Learner-facing body content
// is in v4-expanded-modules.ts. Legacy `sections` arrays were
// removed 2026-05-17 once all 12 modules had V4 entries.

import type { Module } from './types';

export const module1: Module = {
  number: 1,
  id: 'm1-regulatory-landscape',
  title: 'AI for Your Workday',
  pillar: 'awareness',
  estimatedMinutes: 25,
  keyOutput: 'Rewritten Email',
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
        { header: 'Impact Level', key: 'impactLevel' },
      ],
      rows: [
        {
          framework: 'SR 11-7',
          body: 'Federal Reserve / OCC',
          intent: 'Model Risk Management — governance framework for quantitative models across their full lifecycle',
          aiApplication: 'Any AI system used in credit underwriting, fraud detection, or risk scoring is a "model" under SR 11-7 and must be validated, documented, and monitored',
          staffImpact: 'You must be able to explain what an AI tool does and cite its limitations. Explainability and conceptual soundness are required, not optional',
          impactLevel: 'Critical',
        },
        {
          framework: 'TPRM',
          body: 'Interagency',
          intent: 'Third-Party Risk Management — managing risks from outsourced services and vendors',
          aiApplication: 'Every AI tool from a vendor — including Microsoft Copilot, ChatGPT Enterprise, and AI-enabled core banking features — requires TPRM assessment before deployment',
          staffImpact: 'Do not activate or broadly adopt any new AI vendor tool until IT and compliance have completed a TPRM review. "Free tier" tools are not exempt',
          impactLevel: 'High',
        },
        {
          framework: 'ECOA / Reg B',
          body: 'CFPB',
          intent: 'Equal Credit Opportunity Act — prohibits discrimination in credit decisions',
          aiApplication: 'AI-driven lending models must provide specific adverse action reasons. Outputs like "score too low" from a black-box model do not satisfy ECOA requirements',
          staffImpact: 'If AI touches any lending or credit decision workflow, adverse action explanations must be human-readable, specific, and traceable to the model\'s inputs',
          impactLevel: 'Critical',
        },
        {
          framework: 'BSA / AML',
          body: 'FinCEN',
          intent: 'Bank Secrecy Act / Anti-Money Laundering — financial integrity and suspicious activity monitoring',
          aiApplication: 'AI transaction monitoring systems must meet the same documentation and auditability standards as manual SAR processes. Model performance must be validated',
          staffImpact: 'AI-generated SAR recommendations require human review before filing. You are accountable for what you submit — the AI does not carry regulatory responsibility',
          impactLevel: 'Critical',
        },
        {
          framework: 'AIEOG AI Lexicon',
          body: 'US Treasury / FBIIC / FSSCC',
          intent: 'Cross-regulator AI vocabulary published February 2026',
          aiApplication: 'Establishes shared definitions for hallucination, AI governance, HITL, third-party AI risk, and explainability. Regulators will use this vocabulary in examinations',
          staffImpact: 'Align your institution\'s AI policy language with the AIEOG Lexicon. Inconsistent terminology creates examination risk',
          impactLevel: 'High',
        },
      ],
    },
    {
      id: 'm1-cheatsheet-rules',
      caption: 'Regulatory Cheatsheet — Three Non-Negotiable Rules for AI Use',
      columns: [
        { header: 'Rule', key: 'rule' },
        { header: 'Principle', key: 'principle' },
        { header: 'Framework Source', key: 'source' },
        { header: 'What This Means in Practice', key: 'practice' },
      ],
      rows: [
        {
          rule: 'Rule 1',
          principle: 'Explainability is non-negotiable',
          source: 'SR 11-7',
          practice: 'SR 11-7 mandates that complex models must be conceptually sound and transparent. If you cannot explain what an AI tool does and why it produced a given output, you cannot use that output in a decision.',
        },
        {
          rule: 'Rule 2',
          principle: 'Know your data lineage',
          source: 'TPRM / Interagency',
          practice: 'TPRM requires knowing exactly where your training data originates and its legal standing. Every AI vendor must be assessed for data handling before deployment — including tools already in use.',
        },
        {
          rule: 'Rule 3',
          principle: 'Adverse action clarity',
          source: 'ECOA / Reg B',
          practice: 'ECOA demands specific, human-readable reasons for any credit denial. "Score too low" from a black-box model does not satisfy this requirement. AI outputs that influence credit decisions must be traceable to specific, explainable factors.',
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
