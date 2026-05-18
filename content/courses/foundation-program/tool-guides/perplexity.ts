// Perplexity — citation-grounded research with live web sources.

import type { ToolGuide } from './types';

export const perplexityGuide: ToolGuide = {
  platformId: 'perplexity',
  platformLabel: 'Perplexity',
  platform: 'perplexity',
  colorVar: 'var(--ledger-accent-2)',
  tagline:
    'Cited research, every time. The only AI that treats every claim as a footnote.',
  url: 'https://perplexity.ai',

  gettingStarted: {
    steps: [
      'Navigate to perplexity.ai in any browser.',
      'Click "Sign up" — you can sign up with Google, Apple, or email.',
      'Free accounts get 5 Pro searches per day. Standard searches are unlimited.',
      'Type your question or research prompt and press Enter. Every response includes numbered source citations.',
      'Click any citation number to open the source in a new tab and verify the claim.',
    ],
    firstSessionNote:
      "Perplexity's distinguishing feature is that every response is grounded in live web sources with numbered citations. For banking and compliance work where every claim must trace to a named source, this makes Perplexity the most verifiable AI research tool available. Free searches use standard web search; Pro searches use deeper multi-source synthesis.",
  },

  pricing: [
    {
      tierName: 'Free',
      cost: '$0/month',
      keyLimits: [
        '5 Pro searches per day',
        'Unlimited standard searches',
        'All responses include citations',
        'Collections (saved research) available',
        'No file upload on free tier',
      ],
      bankingVerdict:
        'The free tier is useful for occasional regulatory research. The 5 Pro searches per day limit means you need to be deliberate about which queries warrant deeper synthesis. Standard searches are sufficient for straightforward citation lookups.',
    },
    {
      tierName: 'Pro',
      cost: '$20/month (or $200/year)',
      keyLimits: [
        'Unlimited Pro searches',
        'File upload and analysis',
        'Collections with team sharing',
        'Perplexity Spaces (team research workspaces)',
        'Choice of AI model (GPT-4, Claude, etc.)',
        'Additional privacy controls',
      ],
      bankingVerdict:
        'Pro is worth the cost for compliance officers, lending staff, and any role that runs daily regulatory or market research. Unlimited Pro searches plus file upload plus Spaces for team research collections makes this a professional research tool at a consumer price point.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Current CFPB guidance on overdraft fees',
      prompt:
        'What is the current CFPB guidance on overdraft fee practices for depository institutions? Include the most recent rulemaking activity, any final rules, and the compliance timeline. Cite all sources.',
      expectedOutput:
        'A cited summary of current CFPB overdraft fee guidance with numbered citations to cfpb.gov, federal register entries, and regulatory news sources. Every factual claim will have a linked source you can verify before using in compliance documentation.',
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
        'A cited inventory of recent AI-related regulatory guidance from all four primary banking regulators. Save this as a Perplexity Collection to share with your compliance team — and re-run quarterly to catch new guidance as it issues.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'Go to Settings (profile icon, bottom left) and click "AI profile." Add instructions in the text field. These apply globally to all your Perplexity searches. On Pro, you can also create Spaces with custom instructions that apply only within that research workspace.',
    bankingExample:
      'I am a compliance officer at a federally insured community bank. When answering regulatory questions, always cite the primary source (Federal Register, agency website, or official supervisory letter) rather than secondary sources. Flag any regulatory threshold, dollar amount, or deadline for my independent verification at the primary source before I use it in compliance documentation.',
  },

  dataSafety: {
    summary:
      'Perplexity does not store your search queries for model training. Pro subscribers have additional privacy controls. All searches are conducted over HTTPS.',
    details: [
      "Perplexity's privacy policy states that search queries are not used to train the underlying AI models.",
      'Pro subscribers can enable "Enhanced Privacy Mode" which prevents query logging.',
      'Perplexity Spaces content (saved collections and research) is stored in your account and not shared externally.',
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
      tip: "Use Perplexity for research, NotebookLM for policy querying. Perplexity finds and synthesizes public information with citations. NotebookLM searches your own uploaded documents. The professional workflow is: research current guidance in Perplexity, then cross-reference against your institution's policies in NotebookLM.",
    },
    {
      number: 3,
      tip: 'Create Collections for recurring research. If you monitor overdraft guidance, BSA updates, or CRA rulemaking regularly, create a Perplexity Collection for each topic. Save your best research queries and results so you can build on previous research rather than starting from scratch each time.',
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
