/**
 * generate-static-artifacts.mjs
 * Generates two static brand-consistent PDFs for the AiBI-P course:
 *   1. public/artifacts/regulatory-cheatsheet.pdf  (ARTF-01)
 *   2. public/artifacts/platform-feature-reference-card.pdf (ARTF-05)
 *
 * Run: node scripts/generate-static-artifacts.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'artifacts');

mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------
const TERRA = '#b5512e';
const PARCH = '#f5f0e6';
const INK = '#1e1a14';
const SAGE = '#4a6741';
const ERROR_RED = '#9b2226';
const WHITE = '#ffffff';
const BORDER = '#d9cfc0';

// ---------------------------------------------------------------------------
// Shared stylesheet fragments
// ---------------------------------------------------------------------------
const baseStyles = StyleSheet.create({
  page: {
    backgroundColor: PARCH,
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: INK,
  },
  header: {
    backgroundColor: TERRA,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: WHITE,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 9,
    color: WHITE,
    opacity: 0.85,
  },
  body: {
    paddingHorizontal: 32,
  },
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: TERRA,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: INK,
    opacity: 0.55,
  },
});

// ---------------------------------------------------------------------------
// TABLE helpers
// ---------------------------------------------------------------------------
function TableHeader({ columns }) {
  return React.createElement(
    View,
    {
      style: {
        flexDirection: 'row',
        backgroundColor: TERRA,
        borderRadius: 0,
      },
    },
    ...columns.map((col, i) =>
      React.createElement(
        View,
        {
          key: i,
          style: {
            flex: col.flex ?? 1,
            padding: '5 6',
            borderRightWidth: i < columns.length - 1 ? 1 : 0,
            borderRightColor: 'rgba(255,255,255,0.25)',
          },
        },
        React.createElement(
          Text,
          { style: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: WHITE } },
          col.header
        )
      )
    )
  );
}

function TableRow({ columns, row, even }) {
  return React.createElement(
    View,
    {
      style: {
        flexDirection: 'row',
        backgroundColor: even ? 'rgba(181,81,46,0.05)' : WHITE,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
      },
    },
    ...columns.map((col, i) =>
      React.createElement(
        View,
        {
          key: i,
          style: {
            flex: col.flex ?? 1,
            padding: '5 6',
            borderRightWidth: i < columns.length - 1 ? 1 : 0,
            borderRightColor: BORDER,
          },
        },
        React.createElement(
          Text,
          { style: { fontSize: col.fontSize ?? 7.5, color: INK, lineHeight: 1.4 } },
          row[col.key] ?? ''
        )
      )
    )
  );
}

// ---------------------------------------------------------------------------
// DOCUMENT 1: Regulatory Cheatsheet (ARTF-01)
// ---------------------------------------------------------------------------

const frameworkRows = [
  {
    framework: 'SR 11-7',
    body: 'Federal Reserve / OCC',
    aiApplication: 'Any AI used in credit underwriting, fraud detection, or risk scoring is a "model" requiring validation, documentation, and monitoring.',
    staffImpact: 'Explain what the AI tool does and its limitations. Explainability and conceptual soundness are required, not optional.',
  },
  {
    framework: 'TPRM',
    body: 'Interagency',
    aiApplication: 'Every AI vendor tool — including Microsoft Copilot, ChatGPT Enterprise, and AI-enabled core features — requires TPRM assessment before deployment.',
    staffImpact: 'Do not activate new AI vendor tools until IT and compliance have completed TPRM review. "Free tier" tools are not exempt.',
  },
  {
    framework: 'ECOA / Reg B',
    body: 'CFPB',
    aiApplication: 'AI-driven lending models must provide specific adverse action reasons. Black-box "score too low" outputs do not satisfy ECOA requirements.',
    staffImpact: 'If AI touches any lending or credit decision, adverse action explanations must be human-readable, specific, and traceable to model inputs.',
  },
  {
    framework: 'BSA / AML',
    body: 'FinCEN',
    aiApplication: 'AI transaction monitoring systems must meet the same documentation and auditability standards as manual SAR processes.',
    staffImpact: 'AI-generated SAR recommendations require human review before filing. You are accountable — the AI does not carry regulatory responsibility.',
  },
  {
    framework: 'AIEOG AI Lexicon',
    body: 'US Treasury / FBIIC / FSSCC',
    aiApplication: 'Published February 2026. Establishes shared definitions for hallucination, AI governance, HITL, third-party AI risk, and explainability.',
    staffImpact: "Align your institution's AI policy language with the AIEOG Lexicon. Inconsistent terminology creates examination risk.",
  },
];

const frameworkCols = [
  { header: 'Framework', key: 'framework', flex: 0.8 },
  { header: 'Regulatory Body', key: 'body', flex: 1 },
  { header: 'How It Applies to AI', key: 'aiApplication', flex: 2.2 },
  { header: 'Staff-Level Impact', key: 'staffImpact', flex: 2 },
];

const lexiconTerms = [
  {
    term: 'Hallucination',
    definition:
      'An AI output that is factually incorrect, fabricated, or misleading, presented with apparent confidence. Distinct from model error — specifically refers to outputs lacking grounding in source data.',
  },
  {
    term: 'AI Governance',
    definition:
      'The policies, processes, and organizational structures that define how an institution develops, deploys, monitors, and retires AI systems. Applies to the institutional AI program as a whole, not individual models.',
  },
  {
    term: 'AI Use Case Inventory',
    definition:
      'A structured record of all AI systems and tools in active use at an institution, including purpose, data inputs, outputs, and applicable risk controls. Treated as a baseline governance requirement.',
  },
  {
    term: 'HITL (Human-in-the-Loop)',
    definition:
      'A design pattern in which a human reviews or approves AI outputs before they are acted upon. Required for any AI system that makes or influences material decisions affecting customers.',
  },
  {
    term: 'Third-Party AI Risk',
    definition:
      'Risks arising from AI systems operated by vendors or service providers. TPRM guidance requires the same risk assessment rigor for AI-enabled vendor tools as for any other critical third party.',
  },
  {
    term: 'Explainability',
    definition:
      'The capacity of an AI system to provide human-understandable reasons for its outputs. SR 11-7 requires conceptual soundness and transparency for model outputs used in decisions.',
  },
];

function RegulatoryCheatsheet() {
  return React.createElement(
    Document,
    { title: 'Regulatory Cheatsheet — The AI Banking Institute' },
    // Page 1: Frameworks
    React.createElement(
      Page,
      { size: 'LETTER', style: baseStyles.page },
      // Header
      React.createElement(
        View,
        { style: baseStyles.header },
        React.createElement(Text, { style: baseStyles.headerTitle }, 'Regulatory Cheatsheet'),
        React.createElement(
          Text,
          { style: baseStyles.headerSubtitle },
          'Five Frameworks Applied to AI in Community Banking  |  The AI Banking Institute  |  v1.0 — April 2026'
        )
      ),
      // Body
      React.createElement(
        View,
        { style: baseStyles.body },
        React.createElement(
          Text,
          { style: baseStyles.sectionHeading },
          'Five Regulatory Frameworks'
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: 8,
              color: INK,
              opacity: 0.7,
              marginBottom: 10,
              lineHeight: 1.5,
            },
          },
          'No single law governs AI in banking. These five existing frameworks have been extended to cover it. Per GAO-25-107197 (May 2025), no comprehensive AI-specific banking regulation yet exists.'
        ),
        // Table
        React.createElement(TableHeader, { columns: frameworkCols }),
        ...frameworkRows.map((row, i) =>
          React.createElement(TableRow, { key: i, columns: frameworkCols, row, even: i % 2 === 1 })
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: baseStyles.footer },
        React.createElement(Text, { style: baseStyles.footerText }, 'AIBankingInstitute.com'),
        React.createElement(
          Text,
          { style: baseStyles.footerText },
          'The AI Banking Institute  |  v1.0 — April 2026'
        )
      )
    ),
    // Page 2: AIEOG Lexicon
    React.createElement(
      Page,
      { size: 'LETTER', style: baseStyles.page },
      // Header
      React.createElement(
        View,
        { style: baseStyles.header },
        React.createElement(
          Text,
          { style: baseStyles.headerTitle },
          'AIEOG AI Lexicon — Key Terms'
        ),
        React.createElement(
          Text,
          { style: baseStyles.headerSubtitle },
          'US Treasury / FBIIC / FSSCC  |  Published February 2026  |  The AI Banking Institute'
        )
      ),
      // Terms
      React.createElement(
        View,
        { style: baseStyles.body },
        React.createElement(
          Text,
          {
            style: {
              fontSize: 8,
              color: INK,
              opacity: 0.7,
              marginBottom: 14,
              lineHeight: 1.5,
            },
          },
          'Regulators will use this vocabulary in examinations. Align your institution\'s AI policy language with these definitions to reduce examination risk.'
        ),
        ...lexiconTerms.map((item, i) =>
          React.createElement(
            View,
            {
              key: i,
              style: {
                marginBottom: 14,
                borderLeftWidth: 3,
                borderLeftColor: TERRA,
                paddingLeft: 10,
              },
            },
            React.createElement(
              Text,
              {
                style: {
                  fontFamily: 'Helvetica-Bold',
                  fontSize: 9.5,
                  color: INK,
                  marginBottom: 3,
                },
              },
              item.term
            ),
            React.createElement(
              Text,
              { style: { fontSize: 8.5, color: INK, lineHeight: 1.5, opacity: 0.85 } },
              item.definition
            )
          )
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: baseStyles.footer },
        React.createElement(Text, { style: baseStyles.footerText }, 'AIBankingInstitute.com'),
        React.createElement(
          Text,
          { style: baseStyles.footerText },
          'Source: AIEOG AI Lexicon, February 2026 — US Treasury / FBIIC / FSSCC'
        )
      )
    )
  );
}

// ---------------------------------------------------------------------------
// DOCUMENT 2: Platform Feature Reference Card (ARTF-05)
// ---------------------------------------------------------------------------

const platformRows = [
  {
    feature: 'Deep Research / Web Search',
    chatgpt: 'Deep Research mode (Plus)',
    claude: 'Limited (no live web by default)',
    perplexity: 'Native — all searches web-grounded with citations',
    copilot: 'Bing-grounded search in some contexts',
    notebooklm: 'Not available',
    gemini: 'Google Search grounded (free + paid)',
    bankingUse: 'Regulatory research, market intelligence, competitive analysis',
  },
  {
    feature: 'File Analysis',
    chatgpt: 'Upload PDFs, Excel, Word, images (Plus)',
    claude: 'Upload PDFs and documents (Pro)',
    perplexity: 'Limited file analysis',
    copilot: 'Native SharePoint and OneDrive access',
    notebooklm: 'Upload sources — semantic querying of uploaded docs',
    gemini: 'File upload in Gemini Advanced',
    bankingUse: 'Loan document QC, policy analysis, financial statement review',
  },
  {
    feature: 'Voice Mode',
    chatgpt: 'Advanced Voice Mode (Plus)',
    claude: 'Not available',
    perplexity: 'Not available',
    copilot: 'Teams integration (transcription + summary)',
    notebooklm: 'Audio overview generation (not live voice)',
    gemini: 'Available on mobile (free)',
    bankingUse: 'Hands-free drafting, meeting transcription, on-the-go research',
  },
  {
    feature: 'Custom Instructions',
    chatgpt: 'Custom Instructions + Projects (Plus)',
    claude: 'Custom system prompts in Projects (Pro)',
    perplexity: 'Spaces with custom instructions (Pro)',
    copilot: 'Not configurable at staff level',
    notebooklm: 'Instructions per Notebook',
    gemini: 'Gems — custom instruction sets (Advanced)',
    bankingUse: 'Persistent role context, brand voice, compliance constraints',
  },
  {
    feature: 'Image Generation',
    chatgpt: 'DALL-E 3 integrated (Plus)',
    claude: 'Not available',
    perplexity: 'Not available',
    copilot: 'Image generation via Designer integration',
    notebooklm: 'Not available',
    gemini: 'Imagen 3 integrated (Advanced)',
    bankingUse: 'Marketing mockups, presentation graphics, training materials',
  },
  {
    feature: 'Long Context',
    chatgpt: '128K tokens (Plus)',
    claude: '200K tokens — industry-leading (Pro)',
    perplexity: 'Standard context',
    copilot: 'Limited to specific document context',
    notebooklm: 'Up to ~500K words across sources',
    gemini: '1M tokens (Advanced)',
    bankingUse: 'Lengthy regulatory documents, multi-file analysis',
  },
  {
    feature: 'Workspace Integration',
    chatgpt: 'GPT connectors (beta)',
    claude: 'Limited integrations',
    perplexity: 'Limited integrations',
    copilot: 'Native Outlook, Teams, Word, Excel, SharePoint',
    notebooklm: 'Google Drive integration',
    gemini: 'Native Google Workspace integration',
    bankingUse: 'Email drafting, meeting summaries, document creation',
  },
  {
    feature: 'Code / Data Analysis',
    chatgpt: 'Code Interpreter / Advanced Data Analysis (Plus)',
    claude: 'Strong code analysis (Pro)',
    perplexity: 'Limited',
    copilot: 'Excel Copilot for spreadsheet analysis',
    notebooklm: 'Not available',
    gemini: 'Code execution available (Advanced)',
    bankingUse: 'Loan data analysis, charts, Excel automation',
  },
];

const platformCols = [
  { header: 'Feature', key: 'feature', flex: 1.1 },
  { header: 'ChatGPT', key: 'chatgpt', flex: 1.1 },
  { header: 'Claude', key: 'claude', flex: 1.1 },
  { header: 'Copilot', key: 'copilot', flex: 1.1 },
  { header: 'Gemini', key: 'gemini', flex: 1.1 },
  { header: 'NotebookLM', key: 'notebooklm', flex: 1 },
  { header: 'Perplexity', key: 'perplexity', flex: 1 },
  { header: 'Best Banking Use', key: 'bankingUse', flex: 1.6 },
];

// Compact col set that fits on one LANDSCAPE page
const platformColsLandscape = [
  { header: 'Feature', key: 'feature', flex: 1.1, fontSize: 6.5 },
  { header: 'ChatGPT', key: 'chatgpt', flex: 1, fontSize: 6.5 },
  { header: 'Claude', key: 'claude', flex: 1, fontSize: 6.5 },
  { header: 'M365 Copilot', key: 'copilot', flex: 1, fontSize: 6.5 },
  { header: 'Gemini', key: 'gemini', flex: 1, fontSize: 6.5 },
  { header: 'NotebookLM', key: 'notebooklm', flex: 1, fontSize: 6.5 },
  { header: 'Perplexity', key: 'perplexity', flex: 1, fontSize: 6.5 },
  { header: 'Best Banking Use', key: 'bankingUse', flex: 1.5, fontSize: 6.5 },
];

const roleRows = [
  {
    role: 'Lending',
    features: 'File Analysis, Deep Research, Custom Instructions',
    platform: 'ChatGPT Plus + Perplexity',
    example: 'Upload a loan package to ChatGPT, flag missing docs and summarize risk. Use Perplexity for cited sector research.',
  },
  {
    role: 'Compliance',
    features: 'Web Search with Citations, Document Semantic Search, Long Context',
    platform: 'Perplexity + NotebookLM + Claude',
    example: "Upload BSA policy to NotebookLM, query against a transaction scenario. Cross-reference with current FinCEN guidance via Perplexity.",
  },
  {
    role: 'Operations',
    features: 'Meeting Summaries, File Analysis, Custom Instructions',
    platform: 'Microsoft 365 Copilot or ChatGPT Plus',
    example: 'Auto-generate meeting minutes with Copilot in Teams. Analyze exception report exports in ChatGPT.',
  },
  {
    role: 'Marketing',
    features: 'Image Generation, Custom Instructions, Long-Form Writing',
    platform: 'ChatGPT Plus + Claude',
    example: 'Create Custom Instructions with brand voice guide. Generate campaign copy, then DALL-E 3 mockups for stakeholder review.',
  },
  {
    role: 'Retail / Frontline',
    features: 'Quick Drafting, Email Assistance, Knowledge Base Q&A',
    platform: 'Microsoft 365 Copilot or Gemini',
    example: 'Use Copilot in Outlook to draft member responses. Use NotebookLM with product knowledge base for staff Q&A.',
  },
  {
    role: 'Finance / Accounting',
    features: 'Excel Analysis, Data Interpretation, Report Drafting',
    platform: 'Microsoft 365 Copilot or ChatGPT Plus',
    example: 'Excel Copilot for monthly variance analysis. ChatGPT Code Interpreter for loan portfolio visualizations.',
  },
];

const roleCols = [
  { header: 'Role', key: 'role', flex: 0.7 },
  { header: 'Priority Features', key: 'features', flex: 1.3 },
  { header: 'Platform', key: 'platform', flex: 1.3 },
  { header: 'Example Use Case', key: 'example', flex: 2.2 },
];

function PlatformReferenceCard() {
  return React.createElement(
    Document,
    { title: 'Platform Feature Reference Card — The AI Banking Institute' },
    // Page 1: Feature Matrix (Landscape for space)
    React.createElement(
      Page,
      { size: 'LETTER', orientation: 'landscape', style: baseStyles.page },
      React.createElement(
        View,
        { style: baseStyles.header },
        React.createElement(
          Text,
          { style: baseStyles.headerTitle },
          'Platform Feature Reference Card'
        ),
        React.createElement(
          Text,
          { style: baseStyles.headerSubtitle },
          'Six AI Platforms  |  Eight Features  |  Banking Use Cases  |  The AI Banking Institute  |  April 2026'
        )
      ),
      React.createElement(
        View,
        { style: baseStyles.body },
        React.createElement(Text, { style: baseStyles.sectionHeading }, 'Feature Matrix'),
        React.createElement(TableHeader, { columns: platformColsLandscape }),
        ...platformRows.map((row, i) =>
          React.createElement(TableRow, {
            key: i,
            columns: platformColsLandscape,
            row,
            even: i % 2 === 1,
          })
        ),
        // Tier note
        React.createElement(
          View,
          {
            style: {
              marginTop: 12,
              backgroundColor: 'rgba(181,81,46,0.07)',
              borderLeftWidth: 3,
              borderLeftColor: ERROR_RED,
              paddingLeft: 10,
              paddingVertical: 6,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontFamily: 'Helvetica-Bold',
                fontSize: 7.5,
                color: ERROR_RED,
                marginBottom: 3,
              },
            },
            'Data Classification Reminder'
          ),
          React.createElement(
            Text,
            { style: { fontSize: 7.5, color: INK, lineHeight: 1.4 } },
            'Before uploading any document to an AI platform, apply the three-tier classification: Tier 1 (Public) — any platform permitted. Tier 2 (Internal) — enterprise-licensed tools only. Tier 3 (Restricted) — PROHIBITED in AI tools. See Module 5.'
          )
        )
      ),
      React.createElement(
        View,
        { style: baseStyles.footer },
        React.createElement(Text, { style: baseStyles.footerText }, 'AIBankingInstitute.com'),
        React.createElement(
          Text,
          { style: baseStyles.footerText },
          'The AI Banking Institute  |  v1.0 — April 2026'
        )
      )
    ),
    // Page 2: Role Spotlights
    React.createElement(
      Page,
      { size: 'LETTER', style: baseStyles.page },
      React.createElement(
        View,
        { style: baseStyles.header },
        React.createElement(
          Text,
          { style: baseStyles.headerTitle },
          'Role-Specific Feature Clusters'
        ),
        React.createElement(
          Text,
          { style: baseStyles.headerSubtitle },
          'Recommended Platform and Feature Combinations by Department  |  The AI Banking Institute'
        )
      ),
      React.createElement(
        View,
        { style: baseStyles.body },
        React.createElement(Text, { style: baseStyles.sectionHeading }, 'By Department'),
        React.createElement(TableHeader, { columns: roleCols }),
        ...roleRows.map((row, i) =>
          React.createElement(TableRow, { key: i, columns: roleCols, row, even: i % 2 === 1 })
        ),
        React.createElement(
          View,
          {
            style: {
              marginTop: 14,
              backgroundColor: 'rgba(74,103,65,0.07)',
              borderLeftWidth: 3,
              borderLeftColor: SAGE,
              paddingLeft: 10,
              paddingVertical: 6,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontFamily: 'Helvetica-Bold',
                fontSize: 7.5,
                color: SAGE,
                marginBottom: 3,
              },
            },
            'Paid Tier Requirements'
          ),
          React.createElement(
            Text,
            { style: { fontSize: 7.5, color: INK, lineHeight: 1.4 } },
            'Most advanced features (File Analysis, Deep Research, Custom Instructions) require a paid tier on each platform. ChatGPT Plus: $20/mo. Claude Pro: $20/mo. Perplexity Pro: $20/mo. Microsoft 365 Copilot: $30/user/mo. Google Gemini Advanced: $20/mo. NotebookLM Plus: $20/mo. Verify current pricing at each platform before recommending to staff.'
          )
        )
      ),
      React.createElement(
        View,
        { style: baseStyles.footer },
        React.createElement(Text, { style: baseStyles.footerText }, 'AIBankingInstitute.com'),
        React.createElement(
          Text,
          { style: baseStyles.footerText },
          'The AI Banking Institute  |  v1.0 — April 2026'
        )
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Generate both PDFs
// ---------------------------------------------------------------------------
async function main() {
  console.log('Generating Regulatory Cheatsheet...');
  const cheatsheetBuffer = await renderToBuffer(React.createElement(RegulatoryCheatsheet));
  const cheatsheetPath = join(OUT_DIR, 'regulatory-cheatsheet.pdf');
  writeFileSync(cheatsheetPath, cheatsheetBuffer);
  console.log(`  Written: ${cheatsheetPath} (${cheatsheetBuffer.length} bytes)`);

  console.log('Generating Platform Feature Reference Card...');
  const refCardBuffer = await renderToBuffer(React.createElement(PlatformReferenceCard));
  const refCardPath = join(OUT_DIR, 'platform-feature-reference-card.pdf');
  writeFileSync(refCardPath, refCardBuffer);
  console.log(`  Written: ${refCardPath} (${refCardBuffer.length} bytes)`);

  console.log('Done.');
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
