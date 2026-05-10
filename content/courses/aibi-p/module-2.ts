// AiBI Foundations Module 2: What AI Is and Is Not
// Pillar: Awareness | Estimated: 20 minutes
// Key Output: AI Claim Review

import type { Module } from './types';

export const module2: Module = {
  number: 2,
  id: 'm2-ai-ecosystem',
  title: 'What AI Is and Is Not',
  pillar: 'awareness',
  estimatedMinutes: 20,
  keyOutput: 'AI Claim Review',
  mockupRef: 'content/courses/AiBI Foundations v1/stitch_ai_banking_institute_course/m2_the_expanded_ai_ecosystem',
  sections: [
    {
      id: 'm2-opening',
      title: 'Navigating the Modern AI Ecosystem',
      content: `The AI tools landscape is not one category — it is a spectrum of platforms serving different professional purposes. For community bank and credit union staff, understanding which tool serves which purpose is the foundation of professional AI use.

This module covers the seven platforms most relevant to banking practitioners. It does not cover every AI tool that exists — it covers the ones you are most likely to encounter in your institution's approved toolkit or hear about from colleagues.

**The organizing principle:**

> Every AI tool has a primary strength. The mistake practitioners make is using a generalist tool for a specialist task, or a specialist tool where a generalist tool would produce better results.

The ecosystem comparison table gives you a quick-reference framework for matching tool to task.`,
    },
    {
      id: 'm2-out-of-scope',
      title: 'Out-of-Scope Tools',
      content: `Some AI platforms — specifically website creation tools like Framer and 10Web, and full-stack application builders like Lovable and Replit Agent — appear in the ecosystem overview but are primarily covered in the **AiBI-S (Specialist)** curriculum.

These tools are powerful but require software development context that goes beyond the AiBI Foundations practitioner scope.

> If you encounter them in your work environment, treat them as tools for specialized technical staff until you have completed AiBI-S.

Similarly, AI-powered image generation tools (Midjourney, DALL-E 3) and video tools are not covered in this module beyond a brief orientation. Their primary use cases in community banking are marketing and communications tasks that typically involve dedicated creative staff.`,
    },
    {
      id: 'm2-onboarding-branch',
      title: 'Your Personalized Journey',
      content: `During course onboarding, you selected your primary platform. That selection routes personalized content throughout Modules 3, 4, and 7.

**Why this matters:**

A compliance officer using Microsoft 365 Copilot navigates AI differently than a lender using ChatGPT Plus, who navigates it differently than a marketing coordinator using Claude. The underlying skills (regulatory awareness, data classification, skill construction) are the same — but the specific workflows, features, and gotchas differ by platform.

If you selected "Microsoft 365 Copilot" during onboarding, Module 3 will walk you through the M365 activation path specific to your institution's license tier. If you selected a generalist AI (ChatGPT, Claude, Gemini), Module 3 will cover the free-vs-paid transition and how to assess whether a paid subscription is justified for your role.

You can always revisit modules with different platform context by resetting your onboarding answers from your profile settings.`,
    },
  ],
  tables: [
    {
      id: 'm2-platforms',
      caption: 'AI Platform Ecosystem — Seven Platforms by Professional Category',
      columns: [
        { header: 'Platform', key: 'platform' },
        { header: 'Category', key: 'category' },
        { header: 'Primary Strength', key: 'strength' },
        { header: 'Banking Use Case', key: 'bankingUse' },
        { header: 'Access Level', key: 'access' },
      ],
      rows: [
        {
          platform: 'ChatGPT (OpenAI)',
          category: 'Generalist Generative AI',
          strength: 'Multimodal versatility, deep research mode, broad task range',
          bankingUse: 'Drafting, research synthesis, policy analysis, report generation',
          access: 'Free tier available; Plus ($20/mo) adds GPT-4o and Deep Research',
        },
        {
          platform: 'Claude (Anthropic)',
          category: 'Generalist Generative AI',
          strength: 'Nuanced long-form writing, large context window, careful reasoning',
          bankingUse: 'Document analysis, policy drafting, complex memo writing, regulatory review',
          access: 'Free tier available; Pro ($20/mo) adds higher limits and extended context',
        },
        {
          platform: 'Gemini (Google)',
          category: 'Generalist Generative AI',
          strength: 'Google Workspace integration, high speed, web search grounding',
          bankingUse: 'Google Workspace-native tasks, real-time research, email and calendar integration',
          access: 'Free via Google account; Gemini Advanced via Google One AI Premium',
        },
        {
          platform: 'Microsoft 365 Copilot',
          category: 'Workspace-Integrated AI',
          strength: 'Deep integration with Outlook, Teams, Word, Excel, and SharePoint',
          bankingUse: 'Meeting summaries, email drafting, Excel analysis, SharePoint document search',
          access: 'Requires M365 E3/E5 + Copilot add-on license; institution must activate',
        },
        {
          platform: 'Perplexity',
          category: 'Research-Focused AI',
          strength: 'Real-time web search with cited sources, fast research summaries',
          bankingUse: 'Regulatory research, competitive intelligence, market analysis with citations',
          access: 'Free tier with limited queries; Pro ($20/mo) for unlimited searches',
        },
        {
          platform: 'NotebookLM (Google)',
          category: 'Document Intelligence',
          strength: 'Upload documents and query them semantically; audio overviews',
          bankingUse: 'Policy document Q&A, exam prep, compliance manual search, training materials',
          access: 'Free via Google account; NotebookLM Plus via Google One AI Premium',
        },
        {
          platform: 'Microsoft Copilot (Free)',
          category: 'Consumer AI Assistant',
          strength: 'Integrated into Windows 11 and Edge browser; web-grounded responses',
          bankingUse: 'Basic research and drafting for staff without paid AI subscriptions',
          access: 'Free with Microsoft account; included in Windows 11',
        },
      ],
    },
    {
      id: 'm2-full-ecosystem',
      caption: 'Full AI Tool Ecosystem — Complete Platform Landscape (AiBI Foundations Scope and Beyond)',
      columns: [
        { header: 'Platform', key: 'platform' },
        { header: 'Category', key: 'category' },
        { header: 'Primary Strength', key: 'strength' },
        { header: 'Access Status', key: 'access' },
        { header: 'AiBI Foundations Scope', key: 'scope' },
      ],
      rows: [
        {
          platform: 'ChatGPT (OpenAI)',
          category: 'Generalist Generative AI',
          strength: 'Multimodal versatility and deep reasoning',
          access: 'Free tier available; Plus $20/mo',
          scope: 'In scope — core practitioner tool',
        },
        {
          platform: 'Claude (Anthropic)',
          category: 'Generalist Generative AI',
          strength: 'Nuanced long-form writing and large context window',
          access: 'Free tier available; Pro $20/mo',
          scope: 'In scope — core practitioner tool',
        },
        {
          platform: 'Gemini (Google)',
          category: 'Generalist Generative AI',
          strength: 'Google Workspace integration and high-speed search grounding',
          access: 'Free via Google account; Advanced via Google One AI Premium',
          scope: 'In scope — core practitioner tool',
        },
        {
          platform: 'Microsoft 365 Copilot',
          category: 'Workspace-Integrated AI',
          strength: 'Native Outlook, Teams, Word, Excel, SharePoint integration',
          access: 'Requires M365 E3/E5 + Copilot add-on',
          scope: 'In scope — institutional deployment path',
        },
        {
          platform: 'Perplexity',
          category: 'Research-Focused AI',
          strength: 'Real-time web search with cited sources',
          access: 'Free tier; Pro $20/mo',
          scope: 'In scope — cited regulatory research',
        },
        {
          platform: 'NotebookLM (Google)',
          category: 'Document Intelligence',
          strength: 'Semantic document querying and audio overviews',
          access: 'Free via Google account; Plus via Google One AI Premium',
          scope: 'In scope — policy and compliance document Q&A',
        },
        {
          platform: 'Framer',
          category: 'Website Creator',
          strength: 'High-fidelity UI animation and hosting',
          access: 'SaaS premium subscription',
          scope: 'AiBI-S scope — not covered in AiBI Foundations',
        },
        {
          platform: '10Web',
          category: 'Website Creator',
          strength: 'AI-driven WordPress generation and site migration',
          access: 'Enterprise tier subscription',
          scope: 'AiBI-S scope — not covered in AiBI Foundations',
        },
        {
          platform: 'Lovable / Bolt.new',
          category: 'Full-Stack App Builder',
          strength: 'Full-stack application scaffolding from natural language',
          access: 'Developer preview',
          scope: 'AiBI-S scope — requires software development context',
        },
        {
          platform: 'Replit Agent',
          category: 'Full-Stack App Builder',
          strength: 'Autonomous coding and instant deployment in IDE',
          access: 'Subscription plus',
          scope: 'AiBI-S scope — requires software development context',
        },
        {
          platform: 'Midjourney',
          category: 'Image Generator',
          strength: 'Unrivaled aesthetic quality and artistic style control',
          access: 'Discord/Web Pro subscription',
          scope: 'Awareness only — marketing and communications teams; not covered in depth',
        },
        {
          platform: 'DALL-E 3 (via ChatGPT)',
          category: 'Image Generator',
          strength: 'Precise prompt adherence and text rendering in images',
          access: 'ChatGPT Plus ($20/mo)',
          scope: 'Covered in Module 4 feature matrix — image generation feature',
        },
      ],
    },
  ],
  activities: [
    {
      id: '2.1',
      title: 'Your Subscription Inventory',
      description: 'Audit your current AI toolkit. For each platform, indicate whether you have free access, paid access, or are unsure. This inventory is used to personalize your skill-building exercises in Modules 6 and 7.',
      type: 'form',
      fields: [
        {
          id: 'chatgpt-access',
          label: 'ChatGPT (OpenAI)',
          type: 'radio',
          required: true,
          options: [
            { value: 'free', label: 'Free tier' },
            { value: 'paid', label: 'Paid (Plus or Team)' },
            { value: 'not-sure', label: 'Not sure' },
            { value: 'none', label: 'Not using' },
          ],
        },
        {
          id: 'claude-access',
          label: 'Claude (Anthropic)',
          type: 'radio',
          required: true,
          options: [
            { value: 'free', label: 'Free tier' },
            { value: 'paid', label: 'Paid (Pro or Team)' },
            { value: 'not-sure', label: 'Not sure' },
            { value: 'none', label: 'Not using' },
          ],
        },
        {
          id: 'gemini-access',
          label: 'Gemini (Google)',
          type: 'radio',
          required: true,
          options: [
            { value: 'free', label: 'Free tier' },
            { value: 'paid', label: 'Paid (Advanced)' },
            { value: 'not-sure', label: 'Not sure' },
            { value: 'none', label: 'Not using' },
          ],
        },
        {
          id: 'copilot-access',
          label: 'Microsoft 365 Copilot',
          type: 'radio',
          required: true,
          options: [
            { value: 'institutional', label: 'Institutional license (IT-provisioned)' },
            { value: 'not-provisioned', label: 'Not provisioned for me' },
            { value: 'not-sure', label: 'Not sure' },
            { value: 'none', label: 'Institution does not have it' },
          ],
        },
        {
          id: 'perplexity-access',
          label: 'Perplexity',
          type: 'radio',
          required: true,
          options: [
            { value: 'free', label: 'Free tier' },
            { value: 'paid', label: 'Paid (Pro)' },
            { value: 'not-sure', label: 'Not sure' },
            { value: 'none', label: 'Not using' },
          ],
        },
        {
          id: 'notebooklm-access',
          label: 'NotebookLM (Google)',
          type: 'radio',
          required: true,
          options: [
            { value: 'free', label: 'Free tier' },
            { value: 'paid', label: 'Paid (Plus)' },
            { value: 'not-sure', label: 'Not sure' },
            { value: 'none', label: 'Not using' },
          ],
        },
      ],
      completionTrigger: 'module-advance',
    },
  ],
} as const;
