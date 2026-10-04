// Gemini Notebook (formerly NotebookLM) — Google's document-grounded
// research assistant. platformId stays 'notebooklm' so saved data and the
// prompt-library platform enum keep working.

import type { ToolGuide } from './types';

export const notebooklmGuide: ToolGuide = {
  platformId: 'notebooklm',
  platformLabel: 'Gemini Notebook',
  platform: 'notebooklm',
  colorVar: 'var(--gold)',
  tagline:
    'Formerly NotebookLM. A research library that answers from the documents you give it, with citations.',
  url: 'https://notebook.google',
  pricingUrl: 'https://support.google.com/gemininotebook/answer/16213268',
  verifiedOn: '2026-10-04',
  reviewBy: '2027-01-04',

  gettingStarted: {
    steps: [
      'Go to notebook.google (the old notebooklm.google.com address may redirect).',
      'Sign in with your Google account (personal or Google Workspace).',
      'Click "New notebook" and give it a descriptive name (e.g., "BSA/AML Policy Library").',
      'Click "Add sources" and upload your first document — PDF, Google Doc, or paste text.',
      'Once uploaded, type a question in the chat panel on the right.',
    ],
    firstSessionNote:
      "The standard plan is free with a Google account and holds up to 50 sources per notebook. Answers are drawn from the documents you add and cite them. That cuts down on invented answers but does not eliminate them, so check every citation before you rely on it.",
  },

  pricing: [
    {
      tierName: 'Standard',
      cost: '$0 with a Google account',
      keyLimits: [
        'Up to 100 notebooks',
        'Up to 50 sources per notebook',
        'Up to 500,000 words per source',
      ],
      bankingVerdict:
        'Enough for most learners. A 50-source notebook holds a department\'s core policies.',
    },
    {
      tierName: 'With a Google AI plan',
      cost: 'Included with Google AI Plus, Pro, or Ultra',
      keyLimits: [
        'Plus: 200 notebooks, 100 sources each',
        'Pro: 500 notebooks, 300 sources each',
        'Ultra: 500 notebooks, 500–600 sources each',
      ],
      bankingVerdict:
        'Only needed if you outgrow the standard limits. For work, use your institution\'s Workspace account.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Cross-document policy library search',
      prompt:
        "I have uploaded our complete policy library. What does our institution's policy say about employee personal account monitoring thresholds? Cite the specific policy document and section.",
      expectedOutput:
        'A direct answer drawn from whichever uploaded policy documents address that topic, with citations to the exact document name and section. It should not go beyond the documents; check the citations to confirm it did not.',
    },
    {
      number: 2,
      title: 'BSA/AML SAR filing threshold query',
      prompt:
        "Based on our uploaded BSA/AML compliance manual, what is our institution's SAR filing threshold for suspicious activity? List any exceptions or special circumstances noted in the manual.",
      expectedOutput:
        'The exact threshold and exception language drawn from the uploaded manual, with a citation to the page or section. If the manual is silent, it should say so. Confirm the cited page before you rely on the answer.',
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
        'A two-host audio briefing whose length depends on the sources, that synthesizes the uploaded documents into a conversational summary. Useful for executives who prefer audio to reading, or for commute review of compliance updates.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'Each notebook has chat settings where you can set a custom goal or style for how it responds. They apply to every conversation in that notebook.',
    bankingExample:
      'You are a compliance research assistant for a community bank. Always cite the specific source document and section number when answering. If a question falls outside the uploaded documents, say so explicitly rather than drawing on general knowledge. Flag any answer that involves a specific dollar threshold or deadline for human verification.',
  },

  dataSafety: {
    summary:
      'Your uploaded documents and conversations stay in your Google account. Google says it does not use your notebook content to train its AI models.',
    details: [
      'Documents uploaded to a notebook are stored in your Google account, not in a shared model training pool.',
      "With a Workspace account, Workspace data protections apply. Confirm with IT that the notebook service is enabled for your edition.",
      'For Google Workspace users, standard Workspace data governance policies apply to notebooks.',
      'It answers from your sources. If you use its source-discovery features to pull in web pages, those become sources too, so review what you added.',
    ],
    bankingVerdict:
      "Gemini Notebook has a favorable data safety profile for Tier 2 (internal use) documents such as policy manuals, board packets, and vendor contracts. Tier 3 (highly restricted) data — examination materials, investigation files, PII — should not be uploaded to any external AI platform regardless of the provider's data commitments. Confirm your institution's TPRM assessment before uploading policy documents.",
  },

  proTips: [
    {
      number: 1,
      tip: 'Create one notebook per domain, not one mega-notebook. A "BSA/AML" notebook, a "Lending Policy" notebook, and a "Vendor Contracts" notebook each give you focused, high-accuracy responses because the model is not searching across unrelated documents.',
    },
    {
      number: 2,
      tip: 'Always ask the notebook to cite its source. Add "Cite the source document and section" to the end of any compliance or policy query. It should tell you when it cannot find an answer in the documents — this is a feature, not a bug.',
    },
    {
      number: 3,
      tip: 'Use the Audio Overview for board meeting prep. Upload the board packet the night before and generate an Audio Overview during your commute. The two-host format surfaces tensions and unresolved questions that a linear reading might miss.',
    },
    {
      number: 4,
      tip: 'Gemini Notebook is not a substitute for regulatory databases. It can only answer from what you upload. For current regulatory guidance, use Perplexity or a regulatory subscription service, then add the relevant guidance to a notebook to cross-reference against your institution\'s policies.',
    },
    {
      number: 5,
      tip: "Treat it as your private regulatory research library. It is built to answer from your documents, not from what policies generally say. That constraint is the point, and the citations are how you check it held.",
    },
  ],
};
