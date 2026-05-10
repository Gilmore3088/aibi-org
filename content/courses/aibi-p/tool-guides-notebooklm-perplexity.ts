// AiBI Foundations Tool Guides — NotebookLM and Perplexity
// Deep-dive reference for two high-value platforms in banking AI practice
// Used by: /courses/aibi-p/tool-guides

export type PlatformId = 'notebooklm' | 'perplexity';

export interface BankingUseCase {
  readonly number: number;
  readonly title: string;
  readonly prompt: string;
  readonly expectedOutput: string;
}

export interface PricingTier {
  readonly tierName: string;
  readonly cost: string;
  readonly keyLimits: readonly string[];
  readonly bankingVerdict: string;
}

export interface ProTip {
  readonly number: number;
  readonly tip: string;
}

export interface ToolGuide {
  readonly platformId: PlatformId;
  readonly platformLabel: string;
  readonly colorVar: string;
  readonly tagline: string;
  readonly url: string;
  readonly gettingStarted: {
    readonly steps: readonly string[];
    readonly firstSessionNote: string;
  };
  readonly pricing: readonly PricingTier[];
  readonly bankingUseCases: readonly BankingUseCase[];
  readonly customInstructions: {
    readonly available: boolean;
    readonly howTo: string;
    readonly bankingExample?: string;
  };
  readonly dataSafety: {
    readonly summary: string;
    readonly details: readonly string[];
    readonly bankingVerdict: string;
  };
  readonly proTips: readonly ProTip[];
}

// ---------------------------------------------------------------------------
// NotebookLM
// ---------------------------------------------------------------------------

export const notebooklmGuide: ToolGuide = {
  platformId: 'notebooklm',
  platformLabel: 'NotebookLM',
  colorVar: 'var(--color-terra)',
  tagline: 'Your private regulatory research library — grounded entirely in your own documents.',
  url: 'https://notebooklm.google.com',

  gettingStarted: {
    steps: [
      'Navigate to notebooklm.google.com in any browser.',
      'Sign in with your Google account (personal or Google Workspace).',
      'Click "New notebook" and give it a descriptive name (e.g., "BSA/AML Policy Library").',
      'Click "Add sources" and upload your first document — PDF, Google Doc, or paste text.',
      'Once uploaded, type a question in the chat panel on the right.',
    ],
    firstSessionNote:
      'NotebookLM is 100% free. There is no credit card required and no usage limit on the standard tier. Every response is grounded exclusively in the documents you upload — the model cannot access the internet or hallucinate outside your source material.',
  },

  pricing: [
    {
      tierName: 'Free',
      cost: '$0/month',
      keyLimits: [
        'Up to 50 sources per notebook',
        'Up to 500,000 words per source',
        'Unlimited notebooks',
        'Audio Overview generation included',
      ],
      bankingVerdict:
        'The free tier is sufficient for most banking use cases. A 50-source notebook can hold an institution\'s full policy library, compliance manuals, and board packet archive simultaneously.',
    },
    {
      tierName: 'NotebookLM Plus',
      cost: 'Included with Google One AI Premium or Google Workspace add-on',
      keyLimits: [
        'Higher source limits per notebook',
        'Google Drive source sync (notebooks auto-update when Drive docs change)',
        'Priority access during peak usage',
        'Customizable Audio Overview style',
      ],
      bankingVerdict:
        'Plus is worth evaluating for compliance and operations teams that maintain living policy documents in Google Drive. Auto-sync means the notebook stays current without manual re-uploads.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Cross-Document Policy Library Search',
      prompt:
        'I have uploaded our complete policy library. What does our institution\'s policy say about employee personal account monitoring thresholds? Cite the specific policy document and section.',
      expectedOutput:
        'A direct answer drawn from whichever uploaded policy documents address that topic, with citations to the exact document name and section. NotebookLM will not speculate beyond what is in the documents.',
    },
    {
      number: 2,
      title: 'BSA/AML SAR Filing Threshold Query',
      prompt:
        'Based on our uploaded BSA/AML compliance manual, what is our institution\'s SAR filing threshold for suspicious activity? List any exceptions or special circumstances noted in the manual.',
      expectedOutput:
        'The exact threshold and exception language drawn from the uploaded manual, with a citation to the page or section. If the manual is silent on a specific threshold, NotebookLM will say so rather than fabricate an answer.',
    },
    {
      number: 3,
      title: 'Board Packet Trend Summary',
      prompt:
        'I have uploaded board packets from the last three months. Identify the top three recurring themes or concerns that appear across all three packets. What issues are the board returning to repeatedly?',
      expectedOutput:
        'A synthesized trend summary drawn across all uploaded board packets, identifying recurring agenda items, flagged risks, or unresolved discussion points — the kind of executive briefing preparation that typically takes hours of manual review.',
    },
    {
      number: 4,
      title: 'Vendor Contract Key Terms Extraction',
      prompt:
        'Review the uploaded vendor contracts and create a table showing: vendor name, contract expiration date, auto-renewal clause (yes/no and notice period), and early termination fee or penalty.',
      expectedOutput:
        'A structured table of key contract terms pulled directly from the uploaded agreements. This is immediately usable for vendor management tracking and TPRM review cycles.',
    },
    {
      number: 5,
      title: 'Audio Overview Briefing',
      prompt:
        'Generate an Audio Overview of all uploaded documents. Focus on the key themes and any areas of tension or unresolved questions across the documents.',
      expectedOutput:
        'A two-host audio briefing (5–15 minutes depending on source volume) that synthesizes the uploaded documents into a conversational summary. Useful for executives who prefer audio to reading, or for commute review of compliance updates.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'Each notebook has a "Notebook guide" panel where you can add instructions that shape how NotebookLM responds. Click the pencil icon in the Sources panel header to add notebook-level instructions. These apply to all conversations within that notebook.',
    bankingExample:
      'Example notebook instruction: "You are a compliance research assistant for a community bank. Always cite the specific source document and section number when answering. If a question falls outside the uploaded documents, say so explicitly rather than drawing on general knowledge. Flag any answer that involves a specific dollar threshold or deadline for human verification."',
  },

  dataSafety: {
    summary:
      'Your uploaded documents and conversations stay in your Google account. Google does not use your NotebookLM content to train its AI models.',
    details: [
      'Documents uploaded to NotebookLM are stored in your Google account, not in a shared model training pool.',
      'Google\'s enterprise data use policy explicitly excludes NotebookLM content from model training.',
      'For Google Workspace users, standard Workspace data governance policies apply to NotebookLM notebooks.',
      'NotebookLM does not have internet access — it cannot send your documents to external services or retrieve external data.',
    ],
    bankingVerdict:
      'NotebookLM has a favorable data safety profile for Tier 2 (internal use) documents such as policy manuals, board packets, and vendor contracts. Tier 3 (highly restricted) data — examination materials, investigation files, PII — should not be uploaded to any external AI platform regardless of the provider\'s data commitments. Confirm your institution\'s TPRM assessment before uploading policy documents.',
  },

  proTips: [
    {
      number: 1,
      tip: 'Create one notebook per domain, not one mega-notebook. A "BSA/AML" notebook, a "Lending Policy" notebook, and a "Vendor Contracts" notebook each give you focused, high-accuracy responses because the model is not searching across unrelated documents.',
    },
    {
      number: 2,
      tip: 'Always ask NotebookLM to cite its source. Add "Cite the source document and section" to the end of any compliance or policy query. NotebookLM will tell you when it cannot find an answer in the documents — this is a feature, not a bug.',
    },
    {
      number: 3,
      tip: 'Use the Audio Overview for board meeting prep. Upload the board packet the night before and generate an Audio Overview during your commute. The two-host format surfaces tensions and unresolved questions that a linear reading might miss.',
    },
    {
      number: 4,
      tip: 'NotebookLM is not a substitute for regulatory databases. It can only answer from what you upload. For current regulatory guidance, use Perplexity or a regulatory subscription service, then upload the relevant guidance to NotebookLM to cross-reference against your institution\'s policies.',
    },
    {
      number: 5,
      tip: 'This is your private regulatory research library. Unlike general-purpose AI, NotebookLM cannot answer outside your documents. That constraint is the point: every answer is grounded in your actual policies, not the model\'s training data about what policies generally say.',
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Perplexity
// ---------------------------------------------------------------------------

export const perplexityGuide: ToolGuide = {
  platformId: 'perplexity',
  platformLabel: 'Perplexity',
  colorVar: 'var(--color-cobalt)',
  tagline: 'Cited research, every time. The only AI that treats every claim as a footnote.',
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
      'Perplexity\'s distinguishing feature is that every response is grounded in live web sources with numbered citations. For banking and compliance work where every claim must trace to a named source, this makes Perplexity the most verifiable AI research tool available. Free searches use standard web search; Pro searches use deeper multi-source synthesis.',
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
      title: 'Current CFPB Guidance on Overdraft Fees',
      prompt:
        'What is the current CFPB guidance on overdraft fee practices for depository institutions? Include the most recent rulemaking activity, any final rules, and the compliance timeline. Cite all sources.',
      expectedOutput:
        'A cited summary of current CFPB overdraft fee guidance with numbered citations to cfpb.gov, federal register entries, and regulatory news sources. Every factual claim will have a linked source you can verify before using in compliance documentation.',
    },
    {
      number: 2,
      title: 'FDIC Efficiency Ratio Peer Data',
      prompt:
        'What is the current median efficiency ratio for community banks under $1 billion in assets according to FDIC data? Include the most recent FDIC Quarterly Banking Profile data and the methodology for calculating efficiency ratio.',
      expectedOutput:
        'Cited efficiency ratio data from FDIC sources with a clear methodology explanation. Use this as a starting point for peer benchmarking — verify the figures directly at bankdata.fdic.gov/bankstats/ before presenting to your board.',
    },
    {
      number: 3,
      title: 'Commercial Borrower Industry Research',
      prompt:
        'Summarize the current economic conditions in the [BORROWER INDUSTRY] sector relevant to a community bank credit officer evaluating a commercial loan. Include recent trends, key risk factors, and any sector-specific regulatory considerations. Cite all sources.',
      expectedOutput:
        'A cited sector intelligence brief suitable for a credit memo or loan committee presentation. Replace [BORROWER INDUSTRY] with the specific sector (e.g., "agricultural equipment dealership" or "medical office building"). Review and verify all cited sources before including in formal credit documentation.',
    },
    {
      number: 4,
      title: 'Competitor Product Monitoring',
      prompt:
        'What are the current high-yield savings account rates and promotional CD rates being offered by the largest direct banks and fintechs competing with community banks? Include current rate listings with sources and dates.',
      expectedOutput:
        'A cited competitive rate survey with source links and dates. Useful for pricing committee prep and product management. Rates change daily — treat this as a point-in-time snapshot and verify current rates directly on competitor sites before making pricing decisions.',
    },
    {
      number: 5,
      title: 'Regulatory Research Collection for Your Team',
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
      'Example AI profile instruction: "I am a compliance officer at a federally insured community bank. When answering regulatory questions, always cite the primary source (Federal Register, agency website, or official supervisory letter) rather than secondary sources. Flag any regulatory threshold, dollar amount, or deadline for my independent verification at the primary source before I use it in compliance documentation."',
  },

  dataSafety: {
    summary:
      'Perplexity does not store your search queries for model training. Pro subscribers have additional privacy controls. All searches are conducted over HTTPS.',
    details: [
      'Perplexity\'s privacy policy states that search queries are not used to train the underlying AI models.',
      'Pro subscribers can enable "Enhanced Privacy Mode" which prevents query logging.',
      'Perplexity Spaces content (saved collections and research) is stored in your account and not shared externally.',
      'Like all cloud services, Perplexity queries travel over the internet to Perplexity\'s servers — treat every query as you would a web search.',
    ],
    bankingVerdict:
      'Perplexity is appropriate for Tier 1 (public) research — regulatory guidance, market data, industry analysis, competitor research. Do not include non-public, confidential, or sensitive institutional information in Perplexity queries. The platform is designed for research using public sources, not document analysis of internal materials.',
  },

  proTips: [
    {
      number: 1,
      tip: 'Always verify regulatory citations at the primary source. Perplexity\'s citations are a map, not the territory. Before using any regulatory threshold, deadline, or compliance requirement in documentation, navigate to the actual CFPB, FDIC, Federal Reserve, or OCC publication and confirm the language.',
    },
    {
      number: 2,
      tip: 'Use Perplexity for research, NotebookLM for policy querying. Perplexity finds and synthesizes public information with citations. NotebookLM searches your own uploaded documents. The professional workflow is: research current guidance in Perplexity, then cross-reference against your institution\'s policies in NotebookLM.',
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
      tip: 'Use Perplexity for borrower due diligence before calls. Five minutes of Perplexity research on a commercial borrower\'s industry before a relationship manager call — recent sector news, regulatory environment, publicly available financial context — demonstrates preparation that distinguishes community bankers who use AI from those who do not.',
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Combined export
// ---------------------------------------------------------------------------

export const ALL_TOOL_GUIDES: readonly ToolGuide[] = [
  notebooklmGuide,
  perplexityGuide,
] as const;

export const TOOL_GUIDE_MAP: Record<PlatformId, ToolGuide> = {
  notebooklm: notebooklmGuide,
  perplexity: perplexityGuide,
} as const;
