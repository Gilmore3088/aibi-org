// NotebookLM — Google's document-grounded research assistant.

import type { ToolGuide } from './types';

export const notebooklmGuide: ToolGuide = {
  platformId: 'notebooklm',
  platformLabel: 'NotebookLM',
  platform: 'notebooklm',
  colorVar: 'var(--ledger-accent)',
  tagline:
    'Your private regulatory research library — grounded entirely in your own documents.',
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
      "NotebookLM is 100% free. There is no credit card required and no usage limit on the standard tier. Every response is grounded exclusively in the documents you upload — the model cannot access the internet or hallucinate outside your source material.",
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
        "The free tier is sufficient for most banking use cases. A 50-source notebook can hold an institution's full policy library, compliance manuals, and board packet archive simultaneously.",
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
      title: 'Cross-document policy library search',
      prompt:
        "I have uploaded our complete policy library. What does our institution's policy say about employee personal account monitoring thresholds? Cite the specific policy document and section.",
      expectedOutput:
        'A direct answer drawn from whichever uploaded policy documents address that topic, with citations to the exact document name and section. NotebookLM will not speculate beyond what is in the documents.',
    },
    {
      number: 2,
      title: 'BSA/AML SAR filing threshold query',
      prompt:
        "Based on our uploaded BSA/AML compliance manual, what is our institution's SAR filing threshold for suspicious activity? List any exceptions or special circumstances noted in the manual.",
      expectedOutput:
        'The exact threshold and exception language drawn from the uploaded manual, with a citation to the page or section. If the manual is silent on a specific threshold, NotebookLM will say so rather than fabricate an answer.',
    },
    {
      number: 3,
      title: 'Board packet trend summary',
      prompt:
        'I have uploaded board packets from the last three months. Identify the top three recurring themes or concerns that appear across all three packets. What issues are the board returning to repeatedly?',
      expectedOutput:
        'A synthesized trend summary drawn across all uploaded board packets, identifying recurring agenda items, flagged risks, or unresolved discussion points — the kind of executive briefing preparation that typically takes hours of manual review.',
    },
    {
      number: 4,
      title: 'Vendor contract key terms extraction',
      prompt:
        'Review the uploaded vendor contracts and create a table showing: vendor name, contract expiration date, auto-renewal clause (yes/no and notice period), and early termination fee or penalty.',
      expectedOutput:
        'A structured table of key contract terms pulled directly from the uploaded agreements. This is immediately usable for vendor management tracking and TPRM review cycles.',
    },
    {
      number: 5,
      title: 'Audio Overview briefing',
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
      'You are a compliance research assistant for a community bank. Always cite the specific source document and section number when answering. If a question falls outside the uploaded documents, say so explicitly rather than drawing on general knowledge. Flag any answer that involves a specific dollar threshold or deadline for human verification.',
  },

  dataSafety: {
    summary:
      'Your uploaded documents and conversations stay in your Google account. Google does not use your NotebookLM content to train its AI models.',
    details: [
      'Documents uploaded to NotebookLM are stored in your Google account, not in a shared model training pool.',
      "Google's enterprise data use policy explicitly excludes NotebookLM content from model training.",
      'For Google Workspace users, standard Workspace data governance policies apply to NotebookLM notebooks.',
      'NotebookLM does not have internet access — it cannot send your documents to external services or retrieve external data.',
    ],
    bankingVerdict:
      "NotebookLM has a favorable data safety profile for Tier 2 (internal use) documents such as policy manuals, board packets, and vendor contracts. Tier 3 (highly restricted) data — examination materials, investigation files, PII — should not be uploaded to any external AI platform regardless of the provider's data commitments. Confirm your institution's TPRM assessment before uploading policy documents.",
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
      tip: "This is your private regulatory research library. Unlike general-purpose AI, NotebookLM cannot answer outside your documents. That constraint is the point: every answer is grounded in your actual policies, not the model's training data about what policies generally say.",
    },
  ],
};
