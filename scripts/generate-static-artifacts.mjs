/**
 * generate-static-artifacts.mjs
 * Generates two static brand-consistent PDFs for the AiBI-P course:
 *   1. public/artifacts/regulatory-cheatsheet.pdf  (ARTF-01)
 *   2. public/artifacts/platform-feature-reference-card.pdf (ARTF-05)
 *
 * Typography: Helvetica (headings/body), Courier (mono/numbers) — PDF built-ins
 * Brand system: Terracotta #b5512e, Parchment #f5f0e6, Ink #1e1a14
 *
 * Run: node scripts/generate-static-artifacts.mjs
 *
 * NOTE on fonts: @react-pdf/renderer uses PDF built-in fonts (Helvetica,
 * Helvetica-Bold, Courier) which require no network fetch and embed cleanly
 * in all PDF viewers. Custom fonts require full (non-subset) font files.
 * To upgrade to Cormorant/DM Sans: place full .ttf files in public/fonts/
 * and update the Font.register calls below.
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

// Disable hyphenation for clean table text
Font.registerHyphenationCallback((word) => [word]);

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------
const TERRA = '#b5512e';
const TERRA_PALE = '#f0c4ab';
const PARCH = '#f5f0e6';
const PARCH_MID = '#ebe4d4';
const INK = '#1e1a14';
const SAGE = '#4a6741';
const COBALT = '#2d4a7a';
const ERROR_RED = '#9b2226';
const WHITE = '#ffffff';
const BORDER = '#d9cfc0';
const INK_MID = '#56423d';

// Typography — PDF built-in families
const FONT_HEADING = 'Helvetica-Bold';
const FONT_BODY = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';
const FONT_MONO = 'Courier';

const VERSION = 'v1.0';
const VERSION_DATE = 'April 2026';
const FOOTER_DATE = `${VERSION} \u2014 ${VERSION_DATE}`;

// ---------------------------------------------------------------------------
// Shared stylesheet
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  page: {
    backgroundColor: PARCH,
    paddingTop: 0,
    paddingBottom: 44,
    paddingHorizontal: 0,
    fontFamily: FONT_BODY,
    fontSize: 9,
    color: INK,
  },
  pageLandscape: {
    backgroundColor: PARCH,
    paddingTop: 0,
    paddingBottom: 44,
    paddingHorizontal: 0,
    fontFamily: FONT_BODY,
    fontSize: 9,
    color: INK,
  },
  header: {
    backgroundColor: TERRA,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 36,
  },
  headerInstitution: {
    fontFamily: FONT_MONO,
    fontSize: 6.5,
    color: WHITE,
    opacity: 0.72,
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  headerTitle: {
    fontFamily: FONT_HEADING,
    fontSize: 22,
    color: WHITE,
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: FONT_BODY,
    fontSize: 8,
    color: WHITE,
    opacity: 0.85,
  },
  headerVersion: {
    fontFamily: FONT_MONO,
    fontSize: 7,
    color: WHITE,
    opacity: 0.6,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  headerDivider: {
    height: 0.75,
    backgroundColor: WHITE,
    opacity: 0.18,
    marginTop: 12,
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 18,
  },
  sectionHeading: {
    fontFamily: FONT_HEADING,
    fontSize: 10,
    color: TERRA,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 7,
    marginTop: 16,
  },
  introText: {
    fontFamily: FONT_BODY,
    fontSize: 8,
    color: INK_MID,
    marginBottom: 10,
    lineHeight: 1.55,
  },
  divider: {
    height: 0.5,
    backgroundColor: BORDER,
    marginVertical: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.75,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerBrand: {
    fontFamily: FONT_HEADING,
    fontSize: 7.5,
    color: INK,
    opacity: 0.4,
  },
  footerCenter: {
    fontFamily: FONT_BODY,
    fontSize: 7,
    color: INK,
    opacity: 0.38,
  },
  footerMeta: {
    fontFamily: FONT_MONO,
    fontSize: 6.5,
    color: INK,
    opacity: 0.38,
  },
});

// ---------------------------------------------------------------------------
// Reusable components (createElement API — no JSX in .mjs)
// ---------------------------------------------------------------------------

function PageHeader({ title, subtitle, version }) {
  return React.createElement(
    View,
    { style: s.header },
    React.createElement(
      Text,
      { style: s.headerInstitution },
      'THE AI BANKING INSTITUTE'
    ),
    React.createElement(Text, { style: s.headerTitle }, title),
    React.createElement(
      View,
      { style: s.headerMeta },
      React.createElement(Text, { style: s.headerSubtitle }, subtitle),
      React.createElement(
        Text,
        { style: { ...s.headerSubtitle, marginHorizontal: 8 } },
        '\u00b7'
      ),
      React.createElement(
        Text,
        { style: s.headerVersion },
        version ?? FOOTER_DATE
      )
    ),
    React.createElement(View, { style: s.headerDivider })
  );
}

function PageFooter({ center, right }) {
  return React.createElement(
    View,
    { style: s.footer },
    React.createElement(Text, { style: s.footerBrand }, 'The AI Banking Institute'),
    React.createElement(Text, { style: s.footerCenter }, center ?? ''),
    React.createElement(
      Text,
      { style: s.footerMeta },
      right ?? `AIBankingInstitute.com  \u00b7  ${FOOTER_DATE}`
    )
  );
}

function NoteBox({ accentColor, label, body }) {
  const rgb = hexRgb(accentColor);
  return React.createElement(
    View,
    {
      style: {
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
        backgroundColor: `rgba(${rgb},0.05)`,
        paddingLeft: 10,
        paddingRight: 10,
        paddingVertical: 7,
      },
    },
    React.createElement(
      Text,
      {
        style: {
          fontFamily: FONT_BOLD,
          fontSize: 7.5,
          color: accentColor,
          marginBottom: 3,
        },
      },
      label
    ),
    React.createElement(
      Text,
      { style: { fontFamily: FONT_BODY, fontSize: 7.5, color: INK, lineHeight: 1.45 } },
      body
    )
  );
}

function hexRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return '0,0,0';
  return `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}`;
}

// ---------------------------------------------------------------------------
// Table helpers
// ---------------------------------------------------------------------------

function TableHeader({ columns }) {
  return React.createElement(
    View,
    { style: { flexDirection: 'row', backgroundColor: TERRA } },
    ...columns.map((col, i) =>
      React.createElement(
        View,
        {
          key: i,
          style: {
            flex: col.flex ?? 1,
            paddingVertical: 5,
            paddingHorizontal: 7,
            borderRightWidth: i < columns.length - 1 ? 0.5 : 0,
            borderRightColor: 'rgba(255,255,255,0.22)',
          },
        },
        React.createElement(
          Text,
          {
            style: {
              fontFamily: FONT_BOLD,
              fontSize: col.hSize ?? 7,
              color: WHITE,
              letterSpacing: 0.2,
            },
          },
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
        backgroundColor: even ? 'rgba(181,81,46,0.04)' : WHITE,
        borderBottomWidth: 0.5,
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
            paddingVertical: 5,
            paddingHorizontal: 7,
            borderRightWidth: i < columns.length - 1 ? 0.5 : 0,
            borderRightColor: BORDER,
          },
        },
        React.createElement(
          Text,
          {
            style: {
              fontFamily: col.mono ? FONT_MONO : FONT_BODY,
              fontSize: col.size ?? 7.5,
              color: col.color ?? INK,
              lineHeight: 1.42,
            },
          },
          row[col.key] ?? ''
        )
      )
    )
  );
}

// ---------------------------------------------------------------------------
// DOCUMENT 1: Regulatory Cheatsheet (ARTF-01)
// Two pages: Page 1 — Five Frameworks. Page 2 — AIEOG Lexicon.
// ---------------------------------------------------------------------------

const frameworkRows = [
  {
    framework: 'SR 11-7',
    regBody: 'Federal Reserve\n/ OCC',
    aiApplication:
      'Any AI used in credit underwriting, fraud detection, or risk scoring qualifies as a "model" requiring validation, documentation, ongoing monitoring, and governance.',
    staffImpact:
      'Be able to explain what the AI tool does, its known limitations, and how its outputs are validated. Explainability is a regulatory requirement, not optional.',
  },
  {
    framework: 'Interagency\nTPRM',
    regBody: 'OCC / FDIC\n/ NCUA / CFPB',
    aiApplication:
      'Every AI vendor tool — including Microsoft Copilot, ChatGPT Enterprise, and AI-enabled core features — requires a third-party risk assessment before deployment.',
    staffImpact:
      'Do not activate new AI vendor tools without IT and compliance completing TPRM review. Free tier and personal accounts are not exempt from institutional policy.',
  },
  {
    framework: 'ECOA\n/ Reg B',
    regBody: 'CFPB',
    aiApplication:
      'AI-driven lending and credit models must provide specific, human-readable adverse action reasons. Black-box "score too low" outputs do not satisfy ECOA requirements.',
    staffImpact:
      'If AI touches any lending or credit decision, adverse action explanations must be traceable, specific, and understandable to the customer — not just the model.',
  },
  {
    framework: 'BSA / AML',
    regBody: 'FinCEN',
    aiApplication:
      'AI transaction monitoring systems must meet the same documentation and auditability standards as manual SAR processes. AI alerts do not reduce examiner scrutiny.',
    staffImpact:
      'AI-generated SAR recommendations require human review and approval before filing. Regulatory accountability remains with staff — the AI does not carry that responsibility.',
  },
  {
    framework: 'AIEOG\nAI Lexicon',
    regBody: 'US Treasury\n/ FBIIC / FSSCC',
    aiApplication:
      'Published February 2026. Establishes shared regulatory definitions for hallucination, AI governance, AI use case inventory, HITL, third-party AI risk, and explainability.',
    staffImpact:
      "Align your institution's AI policy language with AIEOG Lexicon definitions. Inconsistent terminology in policy documents creates examination risk.",
  },
];

const frameworkCols = [
  { header: 'Framework', key: 'framework', flex: 0.72, size: 7.5 },
  { header: 'Regulatory Body', key: 'regBody', flex: 0.85, size: 7.5 },
  { header: 'How It Applies to AI Use', key: 'aiApplication', flex: 2.2, size: 7.5 },
  { header: 'Staff-Level Impact', key: 'staffImpact', flex: 2, size: 7.5 },
];

const lexiconTerms = [
  {
    term: 'Hallucination',
    definition:
      'An AI output that is factually incorrect, fabricated, or misleading, presented with apparent confidence. Distinct from ordinary model error — specifically refers to outputs lacking grounding in source data. Regulators treat hallucination risk as a governance and disclosure concern.',
  },
  {
    term: 'AI Governance',
    definition:
      'The policies, processes, roles, and organizational structures that define how an institution develops, acquires, deploys, monitors, and retires AI systems. Applies to the institutional AI program as a whole, not to individual models in isolation.',
  },
  {
    term: 'AI Use Case Inventory',
    definition:
      'A structured, maintained record of all AI systems and tools in active use at an institution, including purpose, data inputs, outputs, and applicable risk controls. Treated as a baseline AI governance requirement by examiners and regulators.',
  },
  {
    term: 'HITL (Human-in-the-Loop)',
    definition:
      'A design pattern in which a human reviews or approves AI-generated outputs before they are acted upon. Required for any AI system that makes or influences material decisions affecting customers. HITL cannot be delegated away by policy — it must be operationally enforced.',
  },
  {
    term: 'Third-Party AI Risk',
    definition:
      'Risks arising from AI systems operated by vendors or service providers. Interagency TPRM guidance requires the same risk assessment rigor for AI-enabled vendor tools as for any other critical third party — including cloud-hosted AI APIs.',
  },
  {
    term: 'Explainability',
    definition:
      'The capacity of an AI system to provide human-understandable reasons for its outputs. SR 11-7 requires conceptual soundness and transparency for model outputs used in decisions with regulatory implications. A model that cannot explain itself does not meet examination standards.',
  },
];

function LexiconCard({ item, accentColor }) {
  return React.createElement(
    View,
    {
      style: {
        backgroundColor: WHITE,
        borderTopWidth: 2,
        borderTopColor: accentColor,
        padding: 10,
        marginBottom: 0,
      },
    },
    React.createElement(
      Text,
      {
        style: {
          fontFamily: FONT_BOLD,
          fontSize: 9.5,
          color: INK,
          marginBottom: 4,
        },
      },
      item.term
    ),
    React.createElement(
      Text,
      {
        style: {
          fontFamily: FONT_BODY,
          fontSize: 8,
          color: INK_MID,
          lineHeight: 1.5,
        },
      },
      item.definition
    )
  );
}

const LEXICON_ACCENTS = [TERRA, COBALT, SAGE, TERRA, COBALT, SAGE];

function RegulatoryCheatsheet() {
  return React.createElement(
    Document,
    {
      title: 'Regulatory Cheatsheet — The AI Banking Institute',
      author: 'The AI Banking Institute',
      subject: 'Five AI Regulatory Frameworks for Community Banking',
    },

    // ---- Page 1: Five Frameworks ----
    React.createElement(
      Page,
      { size: 'LETTER', style: s.page },

      React.createElement(PageHeader, {
        title: 'Regulatory Cheatsheet',
        subtitle: 'Five Frameworks Applied to AI in Community Banking',
      }),

      React.createElement(
        View,
        { style: s.body },

        React.createElement(
          Text,
          { style: s.sectionHeading },
          'Five Regulatory Frameworks'
        ),

        React.createElement(
          Text,
          { style: s.introText },
          'No single law governs AI in banking. These five existing frameworks have been extended to cover it. Per GAO-25-107197 (May 2025), no comprehensive AI-specific banking regulation yet exists — these are the frameworks examiners apply today.'
        ),

        React.createElement(TableHeader, { columns: frameworkCols }),
        ...frameworkRows.map((row, i) =>
          React.createElement(TableRow, {
            key: i,
            columns: frameworkCols,
            row,
            even: i % 2 === 1,
          })
        ),

        React.createElement(NoteBox, {
          accentColor: COBALT,
          label: 'Examination Context',
          body: 'Per GAO-25-107197 (May 2025), no comprehensive AI-specific banking statute exists. SR 11-7, Interagency TPRM guidance, ECOA/Reg B, and BSA/AML are the current examination frameworks regulators apply to AI systems. The AIEOG AI Lexicon (February 2026) establishes the shared vocabulary regulators will use.',
        })
      ),

      React.createElement(PageFooter, {
        center: 'ARTF-01  \u00b7  AiBI-P: Banking AI Practitioner',
        right: `AIBankingInstitute.com  \u00b7  ${FOOTER_DATE}`,
      })
    ),

    // ---- Page 2: AIEOG Lexicon ----
    React.createElement(
      Page,
      { size: 'LETTER', style: s.page },

      React.createElement(PageHeader, {
        title: 'AIEOG AI Lexicon',
        subtitle: 'Six Terms Every Banker Needs to Know',
        version: 'Source: US Treasury / FBIIC / FSSCC \u2014 February 2026',
      }),

      React.createElement(
        View,
        { style: s.body },

        React.createElement(
          Text,
          { style: s.introText },
          "Regulators will use this vocabulary in AI-related examination findings. Align your institution's AI policy language with these definitions to reduce examination risk. Inconsistent terminology between your policy and AIEOG definitions may be treated as a governance gap."
        ),

        // Two-column layout
        React.createElement(
          View,
          { style: { flexDirection: 'row', gap: 14 } },

          // Left column
          React.createElement(
            View,
            { style: { flex: 1, gap: 10 } },
            ...lexiconTerms.slice(0, 3).map((item, i) =>
              React.createElement(LexiconCard, {
                key: i,
                item,
                accentColor: LEXICON_ACCENTS[i],
              })
            )
          ),

          // Right column
          React.createElement(
            View,
            { style: { flex: 1, gap: 10 } },
            ...lexiconTerms.slice(3).map((item, i) =>
              React.createElement(LexiconCard, {
                key: i + 3,
                item,
                accentColor: LEXICON_ACCENTS[i + 3],
              })
            )
          )
        ),

        React.createElement(NoteBox, {
          accentColor: ERROR_RED,
          label: 'Examination Risk Note',
          body: "Regulators will use AIEOG Lexicon definitions in AI-related examination findings. If your institution's AI policy uses different terminology for hallucination, HITL, or explainability, examiners may interpret that as a governance gap. Review your AI policy language against this vocabulary before your next examination cycle.",
        })
      ),

      React.createElement(PageFooter, {
        center: 'ARTF-01  \u00b7  AiBI-P: Banking AI Practitioner',
        right: `AIBankingInstitute.com  \u00b7  ${FOOTER_DATE}`,
      })
    )
  );
}

// ---------------------------------------------------------------------------
// DOCUMENT 2: Platform Feature Reference Card (ARTF-05)
// Page 1 (landscape): Feature matrix. Page 2 (portrait): Roles + paid tiers.
// ---------------------------------------------------------------------------

const platformRows = [
  {
    feature: 'Deep Research\n& Web Search',
    chatgpt: 'Deep Research mode\n(Plus required)',
    claude: 'Limited — no live\nweb by default',
    copilot: 'Bing-grounded in\nsome contexts',
    gemini: 'Google Search grounded\n(free + Advanced)',
    notebooklm: 'Not available',
    perplexity: 'Native — all searches\ncited & web-grounded',
    bankingUse: 'Regulatory research, market intelligence, competitive analysis',
  },
  {
    feature: 'File Analysis',
    chatgpt: 'PDFs, Excel, Word,\nimages (Plus)',
    claude: 'PDFs & documents\n(Pro)',
    copilot: 'Native SharePoint\n& OneDrive access',
    gemini: 'File upload\n(Gemini Advanced)',
    notebooklm: 'Upload sources —\nsemantic querying',
    perplexity: 'Limited file analysis',
    bankingUse: 'Loan doc QC, policy analysis, financial statement review',
  },
  {
    feature: 'Custom Instructions\n& Persistent Context',
    chatgpt: 'Custom Instructions\n+ Projects (Plus)',
    claude: 'System prompts in\nProjects (Pro)',
    copilot: 'Not configurable\nat staff level',
    gemini: 'Gems \u2014 custom\ninstruction sets (Adv.)',
    notebooklm: 'Per-Notebook\ninstructions',
    perplexity: 'Spaces with custom\ninstructions (Pro)',
    bankingUse: 'Persistent role context, brand voice, compliance guardrails',
  },
  {
    feature: 'Long Context\nWindow',
    chatgpt: '128K tokens\n(Plus)',
    claude: '200K tokens \u2014\nindustry-leading (Pro)',
    copilot: 'Limited to specific\ndocument context',
    gemini: '1M tokens\n(Advanced)',
    notebooklm: 'Up to ~500K words\nacross sources',
    perplexity: 'Standard context\nwindow',
    bankingUse: 'Lengthy regulatory docs, multi-file analysis, full policy review',
  },
  {
    feature: 'Voice Mode',
    chatgpt: 'Advanced Voice Mode\n(Plus)',
    claude: 'Not available',
    copilot: 'Teams integration\n(transcription + summary)',
    gemini: 'Available on\nmobile (free)',
    notebooklm: 'Audio overview\ngeneration (async)',
    perplexity: 'Not available',
    bankingUse: 'Hands-free drafting, meeting transcription, on-the-go research',
  },
  {
    feature: 'Image Generation',
    chatgpt: 'DALL-E 3\n(Plus)',
    claude: 'Not available',
    copilot: 'Designer integration\nfor image gen',
    gemini: 'Imagen 3\n(Advanced)',
    notebooklm: 'Not available',
    perplexity: 'Not available',
    bankingUse: 'Marketing mockups, presentation graphics, training visuals',
  },
  {
    feature: 'Workspace\nIntegration',
    chatgpt: 'GPT connectors\n(beta)',
    claude: 'Limited\nintegrations',
    copilot: 'Native Outlook, Teams,\nWord, Excel, SharePoint',
    gemini: 'Native Google\nWorkspace integration',
    notebooklm: 'Google Drive\nintegration',
    perplexity: 'Limited\nintegrations',
    bankingUse: 'Email drafting, meeting summaries, document creation in-workflow',
  },
  {
    feature: 'Code & Data\nAnalysis',
    chatgpt: 'Code Interpreter &\nAdv. Data Analysis (Plus)',
    claude: 'Strong code analysis\n(Pro)',
    copilot: 'Excel Copilot for\nspreadsheet analysis',
    gemini: 'Code execution\navailable (Advanced)',
    notebooklm: 'Not available',
    perplexity: 'Limited',
    bankingUse: 'Loan data analysis, charts, Excel automation, variance reports',
  },
];

const platformColsLandscape = [
  { header: 'Feature', key: 'feature', flex: 0.9, size: 6.5 },
  { header: 'ChatGPT', key: 'chatgpt', flex: 1, size: 6.5 },
  { header: 'Claude', key: 'claude', flex: 1, size: 6.5 },
  { header: 'M365 Copilot', key: 'copilot', flex: 1, size: 6.5 },
  { header: 'Gemini', key: 'gemini', flex: 1, size: 6.5 },
  { header: 'NotebookLM', key: 'notebooklm', flex: 1, size: 6.5 },
  { header: 'Perplexity', key: 'perplexity', flex: 0.95, size: 6.5 },
  { header: 'Best Banking Use', key: 'bankingUse', flex: 1.5, size: 6.5 },
];

const roleRows = [
  {
    role: 'Lending',
    features: 'File Analysis, Deep Research, Custom Instructions',
    platform: 'ChatGPT Plus + Perplexity',
    example:
      'Upload a loan package to ChatGPT to flag missing docs and summarize risk. Use Perplexity for cited sector and borrower research.',
  },
  {
    role: 'Compliance',
    features: 'Web Search + Citations, Semantic Doc Search, Long Context',
    platform: 'Perplexity + NotebookLM + Claude',
    example:
      "Upload BSA/AML policy to NotebookLM, query against a transaction scenario. Cross-reference with current FinCEN guidance via Perplexity.",
  },
  {
    role: 'Operations',
    features: 'Meeting Summaries, File Analysis, Workflow Automation',
    platform: 'Microsoft 365 Copilot or ChatGPT Plus',
    example:
      'Auto-generate meeting minutes with Copilot in Teams. Analyze exception report exports in ChatGPT with Code Interpreter.',
  },
  {
    role: 'Marketing',
    features: 'Image Generation, Custom Instructions, Long-Form Writing',
    platform: 'ChatGPT Plus + Claude',
    example:
      'Build Custom Instructions from brand voice guide. Draft campaign copy in Claude, generate DALL-E 3 visual mockups for stakeholder review.',
  },
  {
    role: 'Retail / Frontline',
    features: 'Quick Drafting, Email Assistance, Knowledge Q&A',
    platform: 'Microsoft 365 Copilot or Gemini',
    example:
      'Use Copilot in Outlook to draft member responses. Load product knowledge base into NotebookLM for staff Q&A support.',
  },
  {
    role: 'Finance / Accounting',
    features: 'Excel Analysis, Data Interpretation, Report Drafting',
    platform: 'Microsoft 365 Copilot or ChatGPT Plus',
    example:
      'Excel Copilot for monthly variance analysis. ChatGPT Code Interpreter for loan portfolio visualization and trend reports.',
  },
];

const roleCols = [
  { header: 'Department', key: 'role', flex: 0.65, size: 8 },
  { header: 'Priority Features', key: 'features', flex: 1.3, size: 7.5 },
  { header: 'Recommended Platform', key: 'platform', flex: 1.3, size: 7.5 },
  { header: 'Example Use Case', key: 'example', flex: 2.2, size: 7.5 },
];

const paidTierRows = [
  {
    platform: 'ChatGPT Plus',
    price: '$20/mo',
    keyFeatures:
      'File Analysis, DALL-E 3 image gen, Deep Research, Custom Instructions + Projects, Code Interpreter',
  },
  {
    platform: 'Claude Pro',
    price: '$20/mo',
    keyFeatures: 'Projects with custom system prompts, 200K context window, extended file analysis, priority access',
  },
  {
    platform: 'Perplexity Pro',
    price: '$20/mo',
    keyFeatures: 'Unlimited Pro searches, file uploads, Spaces with custom instructions, model choice',
  },
  {
    platform: 'Gemini Advanced',
    price: '$20/mo',
    keyFeatures: '1M context window, Imagen 3 image gen, Gems (custom instructions), deep Google Workspace integration',
  },
  {
    platform: 'Microsoft 365 Copilot',
    price: '$30/user/mo',
    keyFeatures: 'Native Outlook, Teams, Word, Excel, SharePoint integration — requires M365 Business plan',
  },
  {
    platform: 'NotebookLM Plus',
    price: '$20/mo',
    keyFeatures: 'Unlimited notebooks, more sources per notebook, priority generation, shared notebooks',
  },
];

const paidTierCols = [
  { header: 'Platform', key: 'platform', flex: 1, size: 8 },
  { header: 'Paid Tier', key: 'price', flex: 0.55, mono: true, size: 8 },
  { header: 'Key Features Unlocked at Paid Tier', key: 'keyFeatures', flex: 3.2, size: 7.5 },
];

function PlatformReferenceCard() {
  return React.createElement(
    Document,
    {
      title: 'Platform Feature Reference Card \u2014 The AI Banking Institute',
      author: 'The AI Banking Institute',
      subject: 'Six AI Platforms \u2014 Features, Paid Tiers, Banking Use Cases',
    },

    // ---- Page 1: Feature Matrix (Landscape) ----
    React.createElement(
      Page,
      { size: 'LETTER', orientation: 'landscape', style: s.pageLandscape },

      React.createElement(PageHeader, {
        title: 'Platform Feature Reference Card',
        subtitle: 'Six AI Platforms \u00b7 Eight Key Features \u00b7 Banking Use Cases',
      }),

      React.createElement(
        View,
        { style: s.body },

        React.createElement(
          Text,
          { style: s.sectionHeading },
          'Feature Comparison Matrix'
        ),

        React.createElement(
          Text,
          { style: s.introText },
          'Features marked "(Plus)", "(Pro)", or "(Advanced)" require a paid subscription. Free tier capabilities vary and change frequently \u2014 verify current availability before recommending to staff or budget committees.'
        ),

        React.createElement(TableHeader, { columns: platformColsLandscape }),
        ...platformRows.map((row, i) =>
          React.createElement(TableRow, {
            key: i,
            columns: platformColsLandscape,
            row,
            even: i % 2 === 1,
          })
        ),

        React.createElement(NoteBox, {
          accentColor: ERROR_RED,
          label: 'Data Classification Reminder',
          body: 'Before uploading any document: Tier 1 (Public) \u2014 any platform permitted. Tier 2 (Internal Only) \u2014 enterprise-licensed tools only (M365 Copilot, Google Workspace). Tier 3 (Restricted/PII) \u2014 PROHIBITED in all AI tools, including enterprise platforms. When in doubt, classify up. See Module 5.',
        })
      ),

      React.createElement(PageFooter, {
        center: 'ARTF-05  \u00b7  AiBI-P: Banking AI Practitioner',
        right: `AIBankingInstitute.com  \u00b7  ${FOOTER_DATE}`,
      })
    ),

    // ---- Page 2: Role Guide + Paid Tiers (Portrait) ----
    React.createElement(
      Page,
      { size: 'LETTER', style: s.page },

      React.createElement(PageHeader, {
        title: 'Role-Specific Platform Guide',
        subtitle: 'Recommended Platforms and Features by Department',
      }),

      React.createElement(
        View,
        { style: s.body },

        React.createElement(
          Text,
          { style: s.sectionHeading },
          'Recommended Setup by Department'
        ),

        React.createElement(TableHeader, { columns: roleCols }),
        ...roleRows.map((row, i) =>
          React.createElement(TableRow, {
            key: i,
            columns: roleCols,
            row,
            even: i % 2 === 1,
          })
        ),

        React.createElement(View, { style: { ...s.divider, marginTop: 18 } }),

        React.createElement(
          Text,
          { style: { ...s.sectionHeading, marginTop: 0 } },
          'Paid Tier Requirements'
        ),

        React.createElement(
          Text,
          { style: s.introText },
          'Prices as of April 2026 \u2014 verify before recommending to budget committees. All platforms offer free tiers suitable for initial pilot testing.'
        ),

        React.createElement(TableHeader, { columns: paidTierCols }),
        ...paidTierRows.map((row, i) =>
          React.createElement(TableRow, {
            key: i,
            columns: paidTierCols,
            row,
            even: i % 2 === 1,
          })
        ),

        React.createElement(NoteBox, {
          accentColor: SAGE,
          label: 'Implementation Recommendation',
          body: 'Start with one platform, one department, one use case. Define success criteria before expanding. The highest ROI pattern at community institutions is a skilled user with a custom-instructed platform. Broad deployment without structured training produces marginal results. See the Quick Win Sprint engagement for a structured rollout framework.',
        })
      ),

      React.createElement(PageFooter, {
        center: 'ARTF-05  \u00b7  AiBI-P: Banking AI Practitioner',
        right: `AIBankingInstitute.com  \u00b7  ${FOOTER_DATE}`,
      })
    )
  );
}

// ---------------------------------------------------------------------------
// Generate both PDFs
// ---------------------------------------------------------------------------
async function main() {
  console.log('Generating Regulatory Cheatsheet (ARTF-01)...');
  const cheatsheetBuffer = await renderToBuffer(React.createElement(RegulatoryCheatsheet));
  const cheatsheetPath = join(OUT_DIR, 'regulatory-cheatsheet.pdf');
  writeFileSync(cheatsheetPath, cheatsheetBuffer);
  console.log(`  Written: ${cheatsheetPath} (${(cheatsheetBuffer.length / 1024).toFixed(1)} KB)`);

  console.log('Generating Platform Feature Reference Card (ARTF-05)...');
  const refCardBuffer = await renderToBuffer(React.createElement(PlatformReferenceCard));
  const refCardPath = join(OUT_DIR, 'platform-feature-reference-card.pdf');
  writeFileSync(refCardPath, refCardBuffer);
  console.log(`  Written: ${refCardPath} (${(refCardBuffer.length / 1024).toFixed(1)} KB)`);

  console.log('\nDone. Both artifacts written to public/artifacts/.');
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
