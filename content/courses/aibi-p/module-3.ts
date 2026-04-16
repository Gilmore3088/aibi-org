// AiBI-P Module 3: What You Already Have + Activation
// Pillar: Understanding | Estimated: 30 minutes
// Key Output: First Open discovery log
// roleSpecific: true — M365 activation path varies by license tier

import type { Module } from './types';

export const module3: Module = {
  number: 3,
  id: 'm3-activation',
  title: 'What You Already Have + Activation',
  pillar: 'understanding',
  estimatedMinutes: 30,
  keyOutput: 'First Open discovery log',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m3_what_you_already_have_activation',
  roleSpecific: true,
  sections: [
    {
      id: 'm3-opening',
      title: 'Before You Buy: Audit Your Existing Toolkit',
      content: `Most community banks and credit unions that are "not yet using AI" are, in fact, sitting on substantial AI capabilities they have already paid for.

Microsoft 365 is the dominant productivity suite in community banking. If your institution has Microsoft 365 Business Standard, Business Premium, E3, or E5, you have AI capabilities activated or available for activation today. The question is not whether you have access — it is whether anyone has turned on the right features and whether your institution has assessed them through the TPRM lens.

This module maps what you already have, what requires activation, and what requires budget. Before any institution adopts a paid third-party AI subscription, this inventory should be completed.

**The stability principle:** The most durable AI strategy is built on tools your institution already controls, has assessed for data protection, and has vendor relationships with. Layering new tools on top of an unassessed foundation creates compounding risk.`,
    },
    {
      id: 'm3-m365-path',
      title: 'The M365 Copilot Activation Path',
      content: `Microsoft 365 Copilot is an institutional-grade AI add-on that integrates directly with Outlook, Teams, Word, Excel, PowerPoint, and SharePoint. It operates entirely within your Microsoft tenant — your data does not leave your organization's environment.

**Critical data protection note:** When you use Microsoft 365 Copilot with your institutional account, your prompts do not train the global Microsoft model. Data stays within your tenant boundary. This is the fundamental difference between an institutional AI deployment and a consumer AI tool — and it is the reason TPRM review of M365 Copilot has a different risk profile than consumer ChatGPT.

**Activation requires:**
- An eligible Microsoft 365 license (E3, E5, or Business Premium)
- Purchase of the Copilot add-on license ($30/user/month as of 2025)
- Global Admin provisioning via the Microsoft Admin Center
- Optional but recommended: Microsoft Purview data governance review before rollout

For institutions on legacy Office 365 plans, Copilot is not available — migration to Microsoft 365 infrastructure is required first.`,
    },
    {
      id: 'm3-free-vs-paid',
      title: 'The Free vs. Paid Decision',
      content: `The choice between free and paid AI tiers is not a cost question — it is a capability and compliance question.

**What free tiers give you:**
- Access to the model for general-purpose tasks
- Public web browsing (in tools that support it)
- Basic drafting and research for non-sensitive work
- A trial period to develop prompting skills

**What paid tiers add:**
- Higher message limits and context window sizes
- Enterprise security commitments (your data does not train the model)
- Advanced capabilities: deep research, file analysis, custom instructions
- API access for institutional deployments
- Priority access during high-demand periods

**Why banking staff specifically need paid tiers:**
The "your data trains the model" risk of free tiers creates a compliance exposure for anything beyond Tier 1 (public) data. If you are using AI for any task involving internal documents, policy language, or work-related context, the paid enterprise-grade commitment is necessary for compliant use under your institution's data governance framework.

The ROI calculation is straightforward: if AI saves a staff member 30 minutes per day on drafting and research tasks, the $20-30/month subscription cost pays back in under two hours of saved time per month.`,
    },
    {
      id: 'm3-data-protection',
      title: 'A Note on Data Protection',
      content: `Every AI interaction creates a data residency question. Where does the prompt go? Who can see it? Does it become training data?

For Microsoft 365 Copilot users, the answers are institutional-grade:
- Prompts and responses stay within your Microsoft tenant
- Microsoft does not use your data to train foundation models
- Your Microsoft Purview compliance policies apply to Copilot interactions
- Data residency follows your existing Microsoft data residency commitments

For consumer AI tools (ChatGPT free, Claude free, Gemini free), the answers are less protective:
- Prompts may be used to improve the model unless you opt out
- Enterprise security commitments require a paid business account
- Data handling policies vary by provider and may change

The practical rule for any banking staff member: **treat every free-tier consumer AI prompt as a public document.** Only share information through that interface that you would be comfortable posting publicly.`,
    },
  ],
  tables: [
    {
      id: 'm3-activation-path',
      caption: 'Microsoft 365 Copilot Activation by License Tier',
      columns: [
        { header: 'M365 Plan', key: 'plan' },
        { header: 'Copilot Availability', key: 'availability' },
        { header: 'Institutional Action Required', key: 'action' },
      ],
      rows: [
        {
          plan: 'M365 E3 / E5',
          availability: 'Full integration ready — add-on license available',
          action: 'Purchase Copilot add-on via Admin Center. Apply per-user license. Requires Global Admin permissions.',
        },
        {
          plan: 'M365 Business Premium',
          availability: 'Available with Copilot add-on',
          action: 'Purchase Copilot add-on. Business Premium includes advanced data protection required for compliant Copilot deployment.',
        },
        {
          plan: 'M365 Business Standard',
          availability: 'Limited capacity — upgrade recommended',
          action: 'Upgrade to Business Premium recommended for Advanced Data Protection (ADP) required for banking-grade Copilot deployment.',
        },
        {
          plan: 'Office 365 (Legacy)',
          availability: 'Incompatible — migration required',
          action: 'Migrate to Microsoft 365 infrastructure to unlock Copilot and modern compliance features. Legacy O365 plans are being phased out.',
        },
      ],
    },
    {
      id: 'm3-free-vs-paid',
      caption: 'Free vs. Paid AI Tiers — Banking Staff Decision Guide',
      columns: [
        { header: 'Consideration', key: 'consideration' },
        { header: 'Free Tier', key: 'freeTier' },
        { header: 'Paid Tier', key: 'paidTier' },
      ],
      rows: [
        {
          consideration: 'Data training risk',
          freeTier: 'Your prompts may train the model (varies by provider and opt-out status)',
          paidTier: 'Enterprise commitment: your data is not used for model training',
        },
        {
          consideration: 'Compliant use with internal data',
          freeTier: 'Not recommended — data governance exposure',
          paidTier: 'Acceptable subject to TPRM review and data classification compliance',
        },
        {
          consideration: 'Context window / message limits',
          freeTier: 'Limited — shorter conversations, lower daily caps',
          paidTier: 'Extended context, higher or unlimited message volumes',
        },
        {
          consideration: 'Advanced features',
          freeTier: 'Basic chat only',
          paidTier: 'File analysis, deep research, custom instructions, voice mode (varies by platform)',
        },
        {
          consideration: 'ROI break-even',
          freeTier: 'N/A',
          paidTier: '~2 hours of saved staff time per month at $20/month',
        },
      ],
    },
  ],
  activities: [
    {
      id: '3.1',
      title: 'Your First Activation Discovery',
      description: 'Use your primary AI platform to answer one question about your own workday. If you have Microsoft 365 Copilot, ask it: "Based on my recent emails, what are the three most urgent items I should address this week?" If you are using ChatGPT, Claude, or Gemini, ask: "I work at a community bank in [your department]. What are the three most common AI use cases for staff in my role?" Log what the AI identified that surprised you.',
      type: 'free-text',
      fields: [
        {
          id: 'first-open-discovery',
          label: 'What did the AI identify or produce that surprised you? What worked well and what did not?',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'Describe what the AI produced when you tried the suggested prompt. Did it understand your context? What would you do differently next time? What was more capable or less capable than you expected?',
        },
      ],
      completionTrigger: 'save-response',
    },
  ],
} as const;
