// Perplexity — citation-grounded research with live web sources.

import type { ToolGuide } from './types';

export const perplexityGuide: ToolGuide = {
  platformId: 'perplexity',
  platformLabel: 'Perplexity',
  platform: 'perplexity',
  colorVar: 'var(--ink)',
  tagline:
    'Research answers with numbered sources you can open and check.',
  url: 'https://perplexity.ai',
  pricingUrl: 'https://www.perplexity.ai/pro',
  verifiedOn: '2026-10-04',
  reviewBy: '2027-01-04',

  gettingStarted: {
    steps: [
      'Navigate to perplexity.ai in any browser.',
      'Click "Sign up" — you can sign up with Google, Apple, or email.',
      'Free accounts can search without limit; deeper research modes are capped. Paid plans raise the caps.',
      'Type your question or research prompt and press Enter. Every response includes numbered source citations.',
      'Click any citation number to open the source in a new tab and verify the claim.',
    ],
    firstSessionNote:
      "Perplexity's distinguishing feature is that every response is grounded in live web sources with numbered citations. For banking and compliance work where every claim must trace to a named source, that makes its answers quick to check. A citation is still only a pointer: open it.",
  },

  pricing: [
    {
      tierName: 'Free',
      cost: '$0',
      keyLimits: [
        'Unlimited basic searches, all cited',
        'Limited deep research and file uploads',
      ],
      bankingVerdict:
        'Enough for occasional regulatory lookups. Public information only.',
    },
    {
      tierName: 'Paid plans',
      cost: 'Several tiers · see pricing page',
      keyLimits: [
        'More deep research, more uploads, choice of models',
        'Projects: saved research workspaces with their own instructions',
      ],
      bankingVerdict:
        'Worth it for roles that research daily. Still a research tool for public sources, not a home for internal documents.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Status check: CFPB overdraft rules',
      prompt:
        'What is the current status of CFPB rules on overdraft fees for depository institutions? For each rule, say whether it is in effect, withdrawn, or overturned, with the date and the primary source. Cite congress.gov or the Federal Register where possible.',
      expectedOutput:
        'A cited status summary. It should report that Congress overturned the CFPB\'s 2024 overdraft rule for very large financial institutions in 2025 under the Congressional Review Act (S.J.Res. 18, Public Law 119-10), so the rule never took effect. Check every status against congress.gov or the Federal Register before using it in compliance documentation. Research tools often describe a rule from its original announcement and miss that it was later withdrawn or overturned.',
    },
    {
      number: 2,
      title: 'FDIC efficiency ratio peer data',
      prompt:
        'What is the current median efficiency ratio for community banks under $1 billion in assets according to FDIC data? Include the most recent FDIC Quarterly Banking Profile data and the methodology for calculating efficiency ratio.',
      expectedOutput:
        'Cited efficiency ratio data from FDIC sources with a clear methodology explanation. Use this as a starting point for peer benchmarking — verify the figures directly at bankdata.fdic.gov/bankstats/ before presenting to your board.',
    },
    {
      number: 3,
      title: 'Commercial borrower industry research',
      prompt:
        'Summarize the current economic conditions in the [BORROWER INDUSTRY] sector relevant to a community bank credit officer evaluating a commercial loan. Include recent trends, key risk factors, and any sector-specific regulatory considerations. Cite all sources.',
      expectedOutput:
        'A cited sector intelligence brief suitable for a credit memo or loan committee presentation. Replace [BORROWER INDUSTRY] with the specific sector (e.g., "agricultural equipment dealership" or "medical office building"). Review and verify all cited sources before including in formal credit documentation.',
    },
    {
      number: 4,
      title: 'Competitor product monitoring',
      prompt:
        'What are the current high-yield savings account rates and promotional CD rates being offered by the largest direct banks and fintechs competing with community banks? Include current rate listings with sources and dates.',
      expectedOutput:
        'A cited competitive rate survey with source links and dates. Useful for pricing committee prep and product management. Rates change daily — treat this as a point-in-time snapshot and verify current rates directly on competitor sites before making pricing decisions.',
    },
    {
      number: 5,
      title: 'Regulatory research collection for your team',
      prompt:
        'Compile the most recent guidance from the Federal Reserve, OCC, FDIC, and CFPB on artificial intelligence use by depository institutions, including any supervisory letters, proposed rules, or examination guidance issued in the past 12 months. Cite all sources with publication dates.',
      expectedOutput:
        'A cited inventory of recent AI-related regulatory guidance from all four primary banking regulators. Save it in a Perplexity Project to share with your compliance team — and re-run quarterly to catch new guidance as it issues.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'Add personal instructions in your account settings; they apply to every search. For one topic, create a Project and give it its own instructions.',
    bankingExample:
      'I am a compliance officer at a federally insured community bank. When answering regulatory questions, always cite the primary source (Federal Register, agency website, or official supervisory letter) rather than secondary sources. Flag any regulatory threshold, dollar amount, or deadline for my independent verification at the primary source before I use it in compliance documentation.',
  },

  dataSafety: {
    summary:
      'Perplexity sends your query to its servers and to the model providers it uses. Check its current privacy settings before any work use.',
    details: [
      'Review the data-retention and AI-training settings in your account; defaults differ by plan and change over time.',
      'Project content (saved research, files, instructions) is stored in your account and shared only with people you invite.',
      "Like all cloud services, Perplexity queries travel over the internet to Perplexity's servers — treat every query as you would a web search.",
    ],
    bankingVerdict:
      'Perplexity is appropriate for Tier 1 (public) research — regulatory guidance, market data, industry analysis, competitor research. Do not include non-public, confidential, or sensitive institutional information in Perplexity queries. The platform is designed for research using public sources, not document analysis of internal materials.',
  },

  proTips: [
    {
      number: 1,
      tip: "Always verify regulatory citations at the primary source. Perplexity's citations are a map, not the territory. Before using any regulatory threshold, deadline, or compliance requirement in documentation, navigate to the actual CFPB, FDIC, Federal Reserve, or OCC publication and confirm the language.",
    },
    {
      number: 2,
      tip: "Use Perplexity for research, Gemini Notebook for policy querying. Perplexity finds and synthesizes public information with citations. Gemini Notebook searches your own uploaded documents. The professional workflow is: research current guidance in Perplexity, then cross-reference against your institution's policies in Gemini Notebook.",
    },
    {
      number: 3,
      tip: 'Create Projects for recurring research. If you monitor overdraft guidance, BSA updates, or CRA rulemaking regularly, create a Perplexity Project for each topic. Save your best research queries and results so you can build on previous research rather than starting from scratch each time.',
    },
    {
      number: 4,
      tip: 'Add a date constraint to regulatory research. Regulatory guidance changes. Add "issued after [DATE]" to your queries to filter for recent guidance rather than older superseded rules. Example: "CFPB overdraft guidance issued after January 2024."',
    },
    {
      number: 5,
      tip: "Use Perplexity for borrower due diligence before calls. Five minutes of Perplexity research on a commercial borrower's industry before a relationship manager call — recent sector news, regulatory environment, publicly available financial context — demonstrates preparation that distinguishes community bankers who use AI from those who do not.",
    },
  ],
};
