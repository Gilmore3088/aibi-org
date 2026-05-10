// AiBI Foundations Role-Specific Learning Paths
// Defines depth and prioritization for each of the 8 learner roles.
// Consumed by RolePathCard (overview page) and module deep-dive callouts.

import type { LearnerRole } from '@/types/course';
import type { PromptPlatform } from './prompt-library';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoleToolRecommendation {
  readonly platform: PromptPlatform;
  readonly rationale: string;
}

export interface RoleDeepDiveModule {
  readonly moduleNumber: number;
  readonly moduleId: string;
  readonly title: string;
  readonly focusSection: string;
}

export interface RolePath {
  readonly role: LearnerRole;
  readonly label: string;
  readonly recommendedTools: readonly RoleToolRecommendation[];
  readonly deepDiveModules: readonly RoleDeepDiveModule[];
  readonly keyPromptIds: readonly string[];
  readonly automationTargets: readonly string[];
  readonly skillStarters: readonly string[];
  readonly peerBenchmark: string;
  readonly startHereModule: number;
  readonly quickWins: readonly string[];
}

// ---------------------------------------------------------------------------
// Role path definitions
// ---------------------------------------------------------------------------

const lendingPath: RolePath = {
  role: 'lending',
  label: 'Lending',
  recommendedTools: [
    {
      platform: 'chatgpt',
      rationale: 'File Upload processes loan docs and generates gap-analysis tables against your documentation checklist.',
    },
    {
      platform: 'chatgpt',
      rationale: 'Deep Research synthesizes CRE market data with cited sources into committee-ready briefs.',
    },
    {
      platform: 'copilot',
      rationale: 'Excel analysis in Copilot accelerates DSCR modeling and variance commentary directly inside your spreadsheets.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'File Upload and Deep Research — the two features that eliminate manual document review',
    },
    {
      moduleNumber: 7,
      moduleId: 'm7-skill-builder',
      title: 'Write Your First Skill',
      focusSection: 'Loan File Completeness Checker — your starter skill maps directly to the 22-item CRE checklist',
    },
    {
      moduleNumber: 9,
      moduleId: 'm9-final-capstone',
      title: 'Final Capstone Application',
      focusSection: 'Automation identification for loan origination and credit memo workflows',
    },
  ],
  keyPromptIds: ['m4-lending-deep-research', 'm7-lending-loan-checklist', 'm3-first-chatgpt'],
  automationTargets: [
    'Loan file completeness check against 22-item CRE documentation checklist',
    'CRE market intelligence brief for loan committee (sourced data, cited)',
    'Credit memo first draft from borrower financials and appraisal summary',
  ],
  skillStarters: [
    'Loan File Completeness Checker',
    'CRE Market Intelligence Brief',
    'Credit Memo Draft Generator',
  ],
  peerBenchmark:
    'Lending officers who complete AiBI Foundations automate an average of 4 workflows within 30 days — most commonly loan file review and committee brief preparation.',
  startHereModule: 4,
  quickWins: [
    'Run a loan file through ChatGPT File Upload against the 22-item checklist and cut review time in half',
    'Generate a CRE market brief using Deep Research before your next committee meeting',
    'Draft a credit memo introduction from borrower financials in under 10 minutes',
  ],
};

const operationsPath: RolePath = {
  role: 'operations',
  label: 'Operations',
  recommendedTools: [
    {
      platform: 'copilot',
      rationale: 'Copilot for Teams and meetings produces structured meeting summaries with decisions, action items, and owners automatically.',
    },
    {
      platform: 'chatgpt',
      rationale: 'Custom Instructions lock in your report formats so every exception report, audit response, and status update follows the same structure.',
    },
    {
      platform: 'claude',
      rationale: 'Claude handles long-form document analysis — policy reviews, vendor contracts, and exception triage — with precision and auditability.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'Custom Instructions and meeting summary workflows — the highest-ROI features for operations teams',
    },
    {
      moduleNumber: 7,
      moduleId: 'm7-skill-builder',
      title: 'Write Your First Skill',
      focusSection: 'Daily Exception Report Analyzer — your starter skill reduces morning triage from 45 minutes to under 15',
    },
    {
      moduleNumber: 8,
      moduleId: 'm8-test-iterate-share',
      title: 'Test, Iterate, Share',
      focusSection: 'Skill portability — your exception report skill can be shared across operations staff once tested',
    },
  ],
  keyPromptIds: ['m4-operations-custom-instructions', 'm7-operations-exception-report', 'm3-first-claude'],
  automationTargets: [
    'Daily exception report triage — grouped by category, prioritized by regulatory urgency',
    'Meeting summaries with decisions, action items, owners, and deadlines in consistent format',
    'Vendor contract clause extraction and flagging for TPRM review',
  ],
  skillStarters: [
    'Exception Report Triage Analyzer',
    'Meeting Summary Formatter',
    'Policy Document Review Checklist',
  ],
  peerBenchmark:
    'Operations managers who complete AiBI Foundations automate an average of 5 workflows within 30 days — exception triage and meeting documentation are consistently the first two.',
  startHereModule: 4,
  quickWins: [
    'Set up Custom Instructions in ChatGPT to standardize your exception report format across the team',
    'Use Copilot to generate your next meeting summary — compare it to your manual notes',
    'Run a vendor contract through Claude and extract the top 5 compliance-relevant provisions in under 10 minutes',
  ],
};

const compliancePath: RolePath = {
  role: 'compliance',
  label: 'Compliance',
  recommendedTools: [
    {
      platform: 'perplexity',
      rationale: 'Perplexity provides cited regulatory research with live web access — every claim links to source documents for your workpapers.',
    },
    {
      platform: 'notebooklm',
      rationale: 'NotebookLM turns your policy library into a searchable knowledge base that answers questions grounded only in your actual documents.',
    },
    {
      platform: 'claude',
      rationale: 'Claude handles long document analysis, SAR narrative drafting, and policy gap assessments with structured, auditable output.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'Perplexity for regulatory research and NotebookLM for policy library management',
    },
    {
      moduleNumber: 5,
      moduleId: 'm5-safe-use-guardrails',
      title: 'Safe Use Guardrails',
      focusSection: 'Data classification rules and what never goes into a public LLM — especially critical for SAR, BSA, and customer PII contexts',
    },
    {
      moduleNumber: 7,
      moduleId: 'm7-skill-builder',
      title: 'Write Your First Skill',
      focusSection: 'SAR Narrative Drafting Assistant — your starter skill with the full FinCEN five-element structure built in',
    },
  ],
  keyPromptIds: ['m4-compliance-perplexity', 'm7-compliance-sar-narrative', 'm3-first-chatgpt'],
  automationTargets: [
    'SAR narrative drafting from investigation summaries following FinCEN five-element structure',
    'Regulatory change monitoring with cited sources and action item extraction',
    'Policy gap analysis comparing your current library against new interagency guidance',
  ],
  skillStarters: [
    'SAR Narrative Drafting Assistant',
    'Regulatory Research Brief',
    'Policy Gap Analyzer',
  ],
  peerBenchmark:
    'Compliance officers who complete AiBI Foundations automate an average of 3 workflows within 30 days — SAR narrative drafting and regulatory research preparation are the most common.',
  startHereModule: 5,
  quickWins: [
    'Use Perplexity to research the latest CFPB guidance on a topic on your watch list — note every citation links directly to source',
    'Upload your policy library to NotebookLM and ask "Do we have a gap in our AI acceptable use policy?"',
    'Draft a SAR narrative introduction using Claude with the FinCEN five-element prompt — review against a recent filing',
  ],
};

const financePath: RolePath = {
  role: 'finance',
  label: 'Finance',
  recommendedTools: [
    {
      platform: 'claude',
      rationale: 'Claude produces structured variance analysis with materiality flags and CFO-ready commentary from uploaded financials.',
    },
    {
      platform: 'chatgpt',
      rationale: 'ChatGPT drafts board memos and finance committee narratives that translate numbers into plain-language board-appropriate explanations.',
    },
    {
      platform: 'copilot',
      rationale: 'Copilot inside Excel accelerates multi-period modeling and annotates spreadsheets with natural-language explanations of formulas.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'File Upload for balance sheet variance analysis and Copilot Excel modeling workflows',
    },
    {
      moduleNumber: 7,
      moduleId: 'm7-skill-builder',
      title: 'Write Your First Skill',
      focusSection: 'Monthly Variance Commentary Generator — produces board-ready variance tables with materiality flags and CFO commentary paragraph',
    },
    {
      moduleNumber: 9,
      moduleId: 'm9-final-capstone',
      title: 'Final Capstone Application',
      focusSection: 'Automation targets for monthly board reporting and regulatory filing preparation',
    },
  ],
  keyPromptIds: ['m4-finance-file-upload', 'm7-finance-variance-analysis', 'm3-first-claude'],
  automationTargets: [
    'Monthly income statement variance commentary with materiality thresholds and CFO narrative',
    'Balance sheet variance analysis with dollar and percentage changes flagged against board thresholds',
    'Board report package assembly — translating financial data into non-technical director language',
  ],
  skillStarters: [
    'Monthly Variance Commentary Generator',
    'Balance Sheet Variance Analyzer',
    'Board Report Narrative Writer',
  ],
  peerBenchmark:
    'Finance professionals who complete AiBI Foundations automate an average of 3 workflows within 30 days — monthly variance commentary and board report drafting are the most consistent.',
  startHereModule: 4,
  quickWins: [
    'Upload last month\'s income statement to ChatGPT and run the variance analysis prompt — compare to your manual commentary',
    'Use Claude to draft the executive summary paragraph for your next board report from the variance table you already have',
    'Try Copilot inside Excel on your DSCR model — ask it to explain the formula in the loan-to-value column in plain English',
  ],
};

const marketingPath: RolePath = {
  role: 'marketing',
  label: 'Marketing',
  recommendedTools: [
    {
      platform: 'gemini',
      rationale: 'Gemini produces multi-channel campaign copy packages — LinkedIn, Facebook, email, and branch flyers — with compliance-safe language built into the prompt.',
    },
    {
      platform: 'chatgpt',
      rationale: 'ChatGPT with Custom Instructions enforces your brand voice and UDAP-compliant disclaimers consistently across all social content.',
    },
    {
      platform: 'claude',
      rationale: 'Claude handles member communications — rate change letters, product announcements, and campaign narratives — with the right community bank tone.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'Gemini for campaign copy and Custom Instructions for enforcing brand voice and compliance disclaimers',
    },
    {
      moduleNumber: 5,
      moduleId: 'm5-safe-use-guardrails',
      title: 'Safe Use Guardrails',
      focusSection: 'UDAP/UDAAP constraints in AI-generated marketing copy — what language automatically requires compliance review',
    },
    {
      moduleNumber: 7,
      moduleId: 'm7-skill-builder',
      title: 'Write Your First Skill',
      focusSection: 'Product Campaign Copy Writer — produces all five channels with Reg DD disclosures and UDAP-flagged language',
    },
  ],
  keyPromptIds: ['m4-marketing-gemini', 'm7-marketing-campaign-copy', 'm3-first-copilot'],
  automationTargets: [
    'Product launch campaign copy across five channels with built-in compliance flagging',
    'Social media content calendar for recurring community bank themes (financial literacy, rate updates, local events)',
    'Member communication drafts — rate change notices, product transitions, and service announcements',
  ],
  skillStarters: [
    'Product Campaign Copy Writer',
    'Social Media Content Calendar Builder',
    'Member Communication Drafter',
  ],
  peerBenchmark:
    'Marketing professionals who complete AiBI Foundations automate an average of 4 workflows within 30 days — campaign copy production and social content drafting are the most common time savings.',
  startHereModule: 4,
  quickWins: [
    'Run the social media prompt in Gemini for your next product promotion — note how the UDAP constraints are already built in',
    'Set up Custom Instructions in ChatGPT with your brand voice guidelines and post one draft social post for compliance review',
    'Use Claude to draft a rate change letter for a member — compare the tone to your last manual draft',
  ],
};

const itPath: RolePath = {
  role: 'it',
  label: 'IT',
  recommendedTools: [
    {
      platform: 'claude',
      rationale: 'Claude structures AI vendor due diligence questionnaires against TPRM guidance, covering data security, model governance, and contractual protections.',
    },
    {
      platform: 'notebooklm',
      rationale: 'NotebookLM builds a searchable policy knowledge base from your IT security policies, acceptable use policies, and BCP documents.',
    },
    {
      platform: 'chatgpt',
      rationale: 'ChatGPT assists with code review, script documentation, and translating technical requirements into non-technical language for executive approval.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'NotebookLM for policy library management — IT has the most complex policy portfolio of any department',
    },
    {
      moduleNumber: 5,
      moduleId: 'm5-safe-use-guardrails',
      title: 'Safe Use Guardrails',
      focusSection: 'Data classification for IT environments — what goes in public vs. private LLMs, and the private cloud inference pattern for sensitive data',
    },
    {
      moduleNumber: 9,
      moduleId: 'm9-final-capstone',
      title: 'Final Capstone Application',
      focusSection: 'Vendor evaluation automation and IT governance documentation workflows',
    },
  ],
  keyPromptIds: ['ref-it-vendor-assessment', 'm4-it-notebooklm', 'm3-first-claude'],
  automationTargets: [
    'AI vendor due diligence questionnaire generation from TPRM guidance frameworks',
    'Policy library knowledge base — searchable across IT security, AUP, BCP, and vendor management policies',
    'Executive-ready technical summaries translating security assessments into board-appropriate language',
  ],
  skillStarters: [
    'AI Vendor Due Diligence Questionnaire',
    'Policy Library Knowledge Base Builder',
    'Technical-to-Executive Summary Converter',
  ],
  peerBenchmark:
    'IT professionals who complete AiBI Foundations automate an average of 3 workflows within 30 days — vendor due diligence documentation and policy gap analysis are the most common.',
  startHereModule: 5,
  quickWins: [
    'Use the IT vendor assessment prompt in Claude to generate a TPRM questionnaire for a vendor you are currently evaluating',
    'Upload your top 5 IT policies to NotebookLM and ask "Do any of these policies address employee use of AI tools?"',
    'Draft an AI risk briefing for your CEO using Claude — translate your security assessment findings into non-technical board language',
  ],
};

const retailPath: RolePath = {
  role: 'retail',
  label: 'Retail / Frontline',
  recommendedTools: [
    {
      platform: 'copilot',
      rationale: 'Copilot drafts professional customer emails in your institution\'s voice — rate change notices, appointment confirmations, and follow-up messages.',
    },
    {
      platform: 'chatgpt',
      rationale: 'ChatGPT with Custom Instructions becomes a product knowledge assistant that answers customer FAQ questions using only your approved product information.',
    },
    {
      platform: 'claude',
      rationale: 'Claude produces branch training materials, product guides, and staff reference documents with institutional tone and compliance-safe language.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 3,
      moduleId: 'm3-activation',
      title: 'What You Already Have + Activation',
      focusSection: 'Your first Copilot email draft — the fastest path from zero to visible productivity gain for frontline staff',
    },
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'Custom Instructions for product knowledge and consistent customer communication tone',
    },
    {
      moduleNumber: 6,
      moduleId: 'm6-anatomy-of-a-skill',
      title: 'Anatomy of a Skill',
      focusSection: 'Building repeatable skills for your most frequent customer scenarios — the 20% of interactions that take 80% of your drafting time',
    },
  ],
  keyPromptIds: ['m3-first-copilot', 'ref-retail-product-qa', 'm3-first-chatgpt'],
  automationTargets: [
    'Customer email drafts — rate change notices, product transitions, appointment follow-ups',
    'Product knowledge Q&A assistant using Custom Instructions and your current rate sheet',
    'Branch training material drafts for new product launches and regulatory updates',
  ],
  skillStarters: [
    'Customer Email Drafter',
    'Product Knowledge Assistant',
    'Branch Training Material Builder',
  ],
  peerBenchmark:
    'Retail and frontline staff who complete AiBI Foundations automate an average of 4 workflows within 30 days — customer email drafting is the most universal first win.',
  startHereModule: 3,
  quickWins: [
    'Draft a rate change email to a customer using the Copilot prompt — your first draft in under 5 minutes',
    'Set up Custom Instructions in ChatGPT with your product rate sheet — ask it a customer FAQ and check the answer against your product guide',
    'Use Claude to draft a one-page training brief for your team on a new product or policy change',
  ],
};

const executivePath: RolePath = {
  role: 'executive',
  label: 'Executive',
  recommendedTools: [
    {
      platform: 'claude',
      rationale: 'Claude produces board-ready briefings, AI adoption summaries, and executive communication packages with the precision and tone boards expect.',
    },
    {
      platform: 'perplexity',
      rationale: 'Perplexity provides cited peer intelligence — community bank AI adoption trends, regulatory developments, and competitive landscape data.',
    },
    {
      platform: 'notebooklm',
      rationale: 'NotebookLM builds a board prep knowledge base from your strategic plan, past board materials, and regulatory filings for rapid briefing preparation.',
    },
  ],
  deepDiveModules: [
    {
      moduleNumber: 1,
      moduleId: 'm1-regulatory-landscape',
      title: 'Navigating the Regulatory Landscape',
      focusSection: 'The five governance frameworks — understanding what your board needs to know about AI regulatory exposure at your institution',
    },
    {
      moduleNumber: 4,
      moduleId: 'm4-platform-features',
      title: 'Platform Features Deep Dive',
      focusSection: 'Perplexity market intelligence and Claude executive briefing workflows for board preparation',
    },
    {
      moduleNumber: 9,
      moduleId: 'm9-final-capstone',
      title: 'Final Capstone Application',
      focusSection: 'AI transformation roadmap for institution-wide adoption — the executive\'s capstone deliverable',
    },
  ],
  keyPromptIds: ['ref-exec-board-prep', 'm4-compliance-perplexity', 'm3-first-claude'],
  automationTargets: [
    'Board AI adoption update — adoption metrics, risk assessment, peer context, and next steps in one page',
    'Market intelligence brief — peer bank AI activity, regulatory developments, and competitive landscape with citations',
    'Strategic briefing preparation from internal documents using NotebookLM as your board prep assistant',
  ],
  skillStarters: [
    'Board AI Adoption Update',
    'Peer Market Intelligence Brief',
    'Strategic Briefing Assembler',
  ],
  peerBenchmark:
    'Executives who complete AiBI Foundations implement institution-wide AI policies within 60 days and report board-level AI adoption updates within 90 days.',
  startHereModule: 1,
  quickWins: [
    'Use the board AI update prompt in Claude to draft your next quarterly AI report in under 20 minutes',
    'Run a Perplexity search on community bank AI adoption trends in your peer group — note how every data point links to a source',
    'Upload your strategic plan to NotebookLM and ask "What are the top three areas where AI could accelerate our 2026 objectives?"',
  ],
};

// ---------------------------------------------------------------------------
// Lookup map
// ---------------------------------------------------------------------------

export const ROLE_PATHS: Readonly<Record<Exclude<LearnerRole, 'other'>, RolePath>> = {
  lending:    lendingPath,
  operations: operationsPath,
  compliance: compliancePath,
  finance:    financePath,
  marketing:  marketingPath,
  it:         itPath,
  retail:     retailPath,
  executive:  executivePath,
} as const;

/**
 * Returns the RolePath for a given LearnerRole, or null for 'other'.
 */
export function getRolePath(role: LearnerRole): RolePath | null {
  if (role === 'other') return null;
  return ROLE_PATHS[role];
}

/**
 * Returns true if the given module number is a deep-dive module for this role.
 */
export function isDeepDiveModule(role: LearnerRole, moduleNumber: number): boolean {
  const path = getRolePath(role);
  if (!path) return false;
  return path.deepDiveModules.some((m) => m.moduleNumber === moduleNumber);
}

/**
 * Returns the deep-dive focus section for a module, or null if not a deep-dive for this role.
 */
export function getDeepDiveFocus(role: LearnerRole, moduleNumber: number): string | null {
  const path = getRolePath(role);
  if (!path) return null;
  return path.deepDiveModules.find((m) => m.moduleNumber === moduleNumber)?.focusSection ?? null;
}
