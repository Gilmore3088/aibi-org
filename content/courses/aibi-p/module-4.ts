// AiBI-P Module 4: Platform Features Deep Dive
// Pillar: Understanding | Estimated: 30 minutes
// Key Output: Platform Feature Reference Card
// roleSpecific: true — role-specific spotlights vary by department

import type { Module } from './types';

export const module4: Module = {
  number: 4,
  id: 'm4-platform-features',
  title: 'Platform Features Deep Dive',
  pillar: 'understanding',
  estimatedMinutes: 30,
  keyOutput: 'Platform Feature Reference Card',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m4_platform_features_deep_dive',
  roleSpecific: true,
  sections: [
    {
      id: 'm4-opening',
      title: 'Beyond the Chat Box',
      content: `Most banking practitioners who describe themselves as "using AI" are using one feature: the chat interface. They type a question, read a response, and move on.

Professional banking AI practice requires understanding the full feature surface of the platforms your institution deploys. The difference between a staff member who uses the chat box and a staff member who uses deep research, file analysis, custom instructions, and voice mode is the difference between occasional productivity gains and systematic workflow transformation.

This module maps eight features across the primary platforms and shows how each maps to specific banking workflows. The goal is not to use every feature — it is to know which feature to reach for when you encounter a specific task.`,
    },
    {
      id: 'm4-feature-principles',
      title: 'Feature Selection Principles',
      content: `Choosing the right feature is a professional judgment, not a technical skill. Apply these principles:

**Match feature to output type:** Deep Research produces cited, synthesis-heavy outputs. File Analysis works with uploaded documents. Voice Mode enables hands-free interaction. Custom Instructions shape every conversation. Knowing which feature produces which output type eliminates wasted prompting attempts.

**Match platform to workflow:** ChatGPT's Deep Research is optimized for broad synthesis. Claude's extended context is best for long documents. Perplexity's search grounding is best for cited regulatory research. Microsoft 365 Copilot's value is in its integration with your institutional data — Outlook, Teams, SharePoint. The same task may produce meaningfully different outputs on different platforms.

**Respect data classification:** File Analysis requires uploading a document to the AI platform. Before doing so, apply the three-tier data classification framework from Module 5. Do not upload Tier 3 (Highly Restricted) documents to any consumer AI platform, regardless of the platform's enterprise commitments.`,
    },
    {
      id: 'm4-role-spotlights',
      title: 'Role-Specific Feature Clusters',
      content: `The following spotlights map platform features to the four primary staff roles in community banking. Your onboarding role selection activates the relevant spotlight in the course interface.

**Lending:** Focus on File Analysis for loan document quality control and real-time web search for sectoral market research. ChatGPT's file upload for analyzing loan files, and Perplexity for citing comparable market conditions, are the two highest-ROI features for lending staff.

**Compliance:** Use Perplexity for deep, cited regulatory research and NotebookLM for semantic querying of policy documents. The principle for compliance use is "cited logic only" — every AI-generated compliance finding must trace to a named source. Never use AI-generated compliance content without verifying the citation.

**Operations:** Meeting summary generation (Microsoft 365 Copilot in Teams or ChatGPT with transcript upload) and exception report analysis are the highest-value operations use cases. The objective is reducing administrative latency — time spent on meeting notes, report formatting, and routine correspondence.

**Marketing:** Precise image generation for campaign mockups (using ChatGPT with DALL-E or Midjourney via institutional account) and brand voice preservation via Custom Instructions in ChatGPT Projects or Claude Projects. The key discipline is maintaining institutional tone — AI-generated marketing copy must be reviewed against brand standards before use.`,
    },
  ],
  tables: [
    {
      id: 'm4-feature-matrix',
      caption: 'Platform Feature Matrix — Eight Features Across Primary Banking AI Platforms',
      columns: [
        { header: 'Feature', key: 'feature' },
        { header: 'ChatGPT', key: 'chatgpt' },
        { header: 'Claude', key: 'claude' },
        { header: 'Perplexity', key: 'perplexity' },
        { header: 'M365 Copilot', key: 'copilot' },
        { header: 'NotebookLM', key: 'notebooklm' },
        { header: 'Best Banking Use', key: 'bankingUse' },
      ],
      rows: [
        {
          feature: 'Deep Research / Web Search',
          chatgpt: 'Deep Research mode (Plus)',
          claude: 'Limited (no live web access by default)',
          perplexity: 'Native — all searches are web-grounded with citations',
          copilot: 'Bing-grounded search in some contexts',
          notebooklm: 'No web search — queries limited to uploaded source documents',
          bankingUse: 'Regulatory research, market intelligence, competitive analysis',
        },
        {
          feature: 'File Analysis',
          chatgpt: 'Upload PDFs, Excel, Word, images (Plus)',
          claude: 'Upload PDFs and documents (Pro)',
          perplexity: 'Limited file analysis',
          copilot: 'Native SharePoint and OneDrive document access',
          notebooklm: 'Core capability — upload up to 50 sources; semantic querying across all documents',
          bankingUse: 'Loan document QC, policy analysis, financial statement review',
        },
        {
          feature: 'Voice Mode',
          chatgpt: 'Advanced Voice Mode (Plus)',
          claude: 'Not available',
          perplexity: 'Not available',
          copilot: 'Teams integration (transcription and summary)',
          notebooklm: 'Audio Overview — generates a two-host podcast discussion of uploaded documents',
          bankingUse: 'Hands-free drafting, meeting transcription, on-the-go research',
        },
        {
          feature: 'Custom Instructions / System Prompt',
          chatgpt: 'Custom Instructions + Projects (Plus)',
          claude: 'Custom system prompts in Projects (Pro)',
          perplexity: 'Spaces with custom instructions (Pro)',
          copilot: 'Not configurable at staff level',
          notebooklm: 'Notebook instructions allow custom focus and response style per notebook',
          bankingUse: 'Persistent role context, brand voice, compliance constraints across sessions',
        },
        {
          feature: 'Image Generation',
          chatgpt: 'DALL-E 3 integrated (Plus)',
          claude: 'Not available',
          perplexity: 'Not available',
          copilot: 'Image generation via Designer integration',
          notebooklm: 'Not available',
          bankingUse: 'Marketing mockups, presentation graphics, training materials',
        },
        {
          feature: 'Workspace Integration',
          chatgpt: 'GPT connectors (beta)',
          claude: 'Limited integrations',
          perplexity: 'Limited integrations',
          copilot: 'Native Outlook, Teams, Word, Excel, PowerPoint, SharePoint',
          notebooklm: 'Google Workspace (Drive source sync in NotebookLM Plus)',
          bankingUse: 'Email drafting, meeting summaries, document creation in familiar tools',
        },
        {
          feature: 'Long Context / Document Length',
          chatgpt: '128K tokens (Plus)',
          claude: '200K tokens — industry-leading long context (Pro)',
          perplexity: 'Standard context',
          copilot: 'Context limited to specific document',
          notebooklm: 'Up to 50 sources per notebook — optimized for document corpus querying',
          bankingUse: 'Processing lengthy regulatory documents, multi-file analysis',
        },
        {
          feature: 'Code / Data Analysis',
          chatgpt: 'Code Interpreter / Advanced Data Analysis (Plus)',
          claude: 'Strong code analysis (Pro)',
          perplexity: 'Limited',
          copilot: 'Excel Copilot for spreadsheet analysis',
          notebooklm: 'Not available — document-focused tool only',
          bankingUse: 'Analyzing loan data spreadsheets, creating charts, automating Excel tasks',
        },
      ],
    },
    {
      id: 'm4-role-spotlights',
      caption: 'Role-Specific Feature Spotlight — Recommended Feature Clusters by Department',
      columns: [
        { header: 'Role', key: 'role' },
        { header: 'Primary Features', key: 'features' },
        { header: 'Platform Recommendation', key: 'platform' },
        { header: 'Example Use Case', key: 'example' },
      ],
      rows: [
        {
          role: 'Lending',
          features: 'File Analysis, Deep Research, Custom Instructions',
          platform: 'ChatGPT Plus (file analysis) + Perplexity (market research)',
          example: 'Upload a loan package to ChatGPT, ask it to flag missing documentation and summarize risk factors. Use Perplexity to research the borrower\'s sector with cited sources.',
        },
        {
          role: 'Compliance',
          features: 'Web Search with Citations, Document Semantic Search, Long Context',
          platform: 'Perplexity (research) + NotebookLM (policy querying) + Claude (long docs)',
          example: 'Upload your institution\'s BSA policy to NotebookLM, then query it against a specific transaction scenario. Use Perplexity to cross-reference with current FinCEN guidance.',
        },
        {
          role: 'Operations',
          features: 'Meeting Summaries, File Analysis, Custom Instructions',
          platform: 'Microsoft 365 Copilot (if licensed) or ChatGPT Plus',
          example: 'Use Copilot in Teams to auto-generate meeting minutes. Use ChatGPT to analyze exception report exports and identify top recurring issues.',
        },
        {
          role: 'Marketing',
          features: 'Image Generation, Custom Instructions, Long-Form Writing',
          platform: 'ChatGPT Plus (image + writing) + Claude (brand voice)',
          example: 'Create a Custom Instruction in ChatGPT with your institution\'s brand voice guide. Generate campaign copy, then create mockup images with DALL-E 3 for stakeholder review.',
        },
        {
          role: 'Retail / Frontline',
          features: 'Quick Drafting, Email Assistance, Knowledge Base Q&A',
          platform: 'Microsoft 365 Copilot (if licensed) or Gemini (Google Workspace)',
          example: 'Use Copilot in Outlook to draft member responses to complex account inquiries. Use NotebookLM with your product knowledge base to quickly answer staff questions.',
        },
        {
          role: 'Finance / Accounting',
          features: 'Excel Analysis, Data Interpretation, Report Drafting',
          platform: 'Microsoft 365 Copilot (Excel Copilot) or ChatGPT Plus (Code Interpreter)',
          example: 'Use Excel Copilot to analyze monthly variance reports and generate a plain-language summary. Use ChatGPT Code Interpreter to create visualizations from loan portfolio data.',
        },
      ],
    },
  ],
  activities: [
    {
      id: '4.1',
      title: 'Feature Discovery',
      description: 'Select one advanced feature from the feature matrix. Execute a work-related task using that feature and record the institutional impact. The task should be something you would normally do manually — research, document analysis, drafting, or data review.',
      type: 'free-text',
      fields: [
        {
          id: 'feature-selected',
          label: 'Which feature did you use? (e.g., File Analysis, Deep Research, Custom Instructions)',
          type: 'select',
          required: true,
          options: [
            { value: 'file-analysis', label: 'File Analysis — uploaded and analyzed a document' },
            { value: 'deep-research', label: 'Deep Research / Web Search — researched a topic with citations' },
            { value: 'custom-instructions', label: 'Custom Instructions — configured persistent role context' },
            { value: 'voice-mode', label: 'Voice Mode — used hands-free interaction' },
            { value: 'excel-analysis', label: 'Excel / Data Analysis — analyzed data or created visualizations' },
            { value: 'meeting-summary', label: 'Meeting Summary — summarized a meeting transcript or notes' },
            { value: 'image-generation', label: 'Image Generation — created a visual for work use' },
            { value: 'other', label: 'Other feature not listed above' },
          ],
        },
        {
          id: 'observation-log',
          label: 'Describe the outcome and the time saved or value created. What would you do differently next time?',
          type: 'textarea',
          minLength: 50,
          required: true,
          placeholder: 'Be specific: what was the task, what did the AI produce, how long did it take vs. doing it manually, and what was the quality of the output? Would you use this feature again for this type of task?',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'platform-feature-reference-card',
    },
  ],
  artifacts: [
    {
      id: 'platform-feature-reference-card',
      title: 'Platform Feature Reference Card',
      description: 'One-page quick reference card matching your onboarding platform to its key features and top banking use cases. Front: feature matrix for your platform. Back: role-specific workflow shortcuts.',
      format: 'pdf',
      triggeredBy: '4.1',
      dynamic: false,
    },
  ],
} as const;
