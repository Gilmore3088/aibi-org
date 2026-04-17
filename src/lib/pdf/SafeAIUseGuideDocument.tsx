// SafeAIUseGuideDocument — React PDF document component for the Safe AI Use Guide.
// Rendered server-side via @react-pdf/renderer renderToBuffer().
// Pillar B artifact: cobalt (#2d4a7a) primary, terracotta accents, parchment backgrounds.
// Must NOT be imported in Client Components — PDF renderer is server-only.
//
// Fonts must be registered by the caller before rendering (see route.ts).
// Six chapters, 8 pages, board-shareable quality.

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Brand constants — never hardcode hex elsewhere in this file
// ---------------------------------------------------------------------------
const COBALT = '#2d4a7a';
const COBALT_DARK = '#1e3356';
const COBALT_PALE = '#dde4ef';
const TERRA = '#b5512e';
const TERRA_PALE = '#f0c4ab';
const PARCH = '#f5f0e6';
const PARCH_MID = '#ebe4d4';
const INK = '#1e1a14';
const SAGE = '#4a6741';
const ERROR_RED = '#9b2226';
const WHITE = '#ffffff';
const BORDER = '#d9cfc0';
const COBALT_BORDER = '#7a94bc';

const VERSION = 'v1.0';
const VERSION_DATE = 'April 2026';
const FOOTER_URL = 'AIBankingInstitute.com';

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  // Pages
  coverPage: {
    backgroundColor: COBALT,
    fontFamily: 'DMSans',
    fontSize: 9,
    color: WHITE,
  },
  page: {
    backgroundColor: PARCH,
    fontFamily: 'DMSans',
    fontSize: 9,
    color: INK,
    paddingBottom: 48,
  },

  // Cover elements
  coverBand: {
    backgroundColor: COBALT_DARK,
    paddingVertical: 12,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverBandLabel: {
    fontFamily: 'CormorantSC',
    fontSize: 7,
    color: WHITE,
    opacity: 0.7,
    letterSpacing: 1.4,
  },
  coverBandVersion: {
    fontFamily: 'DMMono',
    fontSize: 7,
    color: WHITE,
    opacity: 0.55,
  },
  coverBody: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 56,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  coverPillarLabel: {
    fontFamily: 'CormorantSC',
    fontSize: 8,
    color: WHITE,
    opacity: 0.65,
    letterSpacing: 1.8,
    marginBottom: 20,
  },
  coverTitle: {
    fontFamily: 'Cormorant',
    fontSize: 46,
    color: WHITE,
    lineHeight: 1.05,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  coverSubtitle: {
    fontFamily: 'DMSans',
    fontSize: 12,
    color: WHITE,
    opacity: 0.82,
    lineHeight: 1.55,
    maxWidth: 380,
    marginBottom: 28,
  },
  coverTagline: {
    fontFamily: 'Cormorant',
    fontStyle: 'italic',
    fontSize: 14,
    color: TERRA_PALE,
    marginBottom: 40,
  },
  coverTOCHeader: {
    fontFamily: 'CormorantSC',
    fontSize: 7.5,
    color: WHITE,
    opacity: 0.5,
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  coverTOCRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 7,
  },
  coverTOCNum: {
    fontFamily: 'DMMono',
    fontSize: 7.5,
    color: TERRA_PALE,
    width: 22,
  },
  coverTOCTitle: {
    fontFamily: 'DMSans',
    fontSize: 8.5,
    color: WHITE,
    opacity: 0.85,
    flex: 1,
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: WHITE,
    borderTopStyle: 'solid',
    opacity: 0.15,
    marginHorizontal: 48,
  },
  coverFooterContent: {
    paddingHorizontal: 48,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverFooterText: {
    fontFamily: 'DMMono',
    fontSize: 7,
    color: WHITE,
    opacity: 0.45,
  },

  // Chapter pages — shared header
  chapterHeader: {
    backgroundColor: COBALT,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 40,
  },
  chapterHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterPillarBadge: {
    fontFamily: 'CormorantSC',
    fontSize: 6.5,
    color: WHITE,
    opacity: 0.6,
    letterSpacing: 1.4,
  },
  chapterNum: {
    fontFamily: 'DMMono',
    fontSize: 7.5,
    color: TERRA_PALE,
    letterSpacing: 0.8,
  },
  chapterTitle: {
    fontFamily: 'Cormorant',
    fontSize: 26,
    color: WHITE,
    lineHeight: 1.1,
    marginBottom: 5,
  },
  chapterLead: {
    fontFamily: 'DMSans',
    fontSize: 8.5,
    color: WHITE,
    opacity: 0.8,
    lineHeight: 1.55,
    maxWidth: 440,
  },

  // Body
  body: {
    paddingHorizontal: 40,
    paddingTop: 20,
  },

  // Reusable text blocks
  h3: {
    fontFamily: 'Cormorant',
    fontSize: 15,
    color: COBALT,
    marginBottom: 5,
    marginTop: 14,
  },
  bodyText: {
    fontFamily: 'DMSans',
    fontSize: 8.5,
    color: INK,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bodyTextSmall: {
    fontFamily: 'DMSans',
    fontSize: 8,
    color: INK,
    lineHeight: 1.55,
    opacity: 0.82,
  },
  label: {
    fontFamily: 'CormorantSC',
    fontSize: 6.5,
    color: COBALT,
    letterSpacing: 1.2,
    marginBottom: 4,
    marginTop: 12,
  },
  monoNote: {
    fontFamily: 'DMMono',
    fontSize: 7.5,
    color: INK,
    opacity: 0.65,
  },

  // Boxes
  warningBox: {
    borderLeftWidth: 3,
    borderLeftColor: ERROR_RED,
    borderLeftStyle: 'solid',
    backgroundColor: '#fdf2f2',
    padding: '9 12',
    marginBottom: 10,
    marginTop: 6,
  },
  warningLabel: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    fontWeight: 700,
    color: ERROR_RED,
    marginBottom: 3,
  },
  warningText: {
    fontFamily: 'DMSans',
    fontSize: 8,
    color: INK,
    lineHeight: 1.5,
  },
  infoBox: {
    borderLeftWidth: 3,
    borderLeftColor: COBALT,
    borderLeftStyle: 'solid',
    backgroundColor: COBALT_PALE,
    padding: '9 12',
    marginBottom: 10,
    marginTop: 6,
  },
  infoLabel: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    fontWeight: 700,
    color: COBALT,
    marginBottom: 3,
  },
  infoText: {
    fontFamily: 'DMSans',
    fontSize: 8,
    color: INK,
    lineHeight: 1.5,
  },
  safeBox: {
    borderLeftWidth: 3,
    borderLeftColor: SAGE,
    borderLeftStyle: 'solid',
    backgroundColor: 'rgba(74,103,65,0.07)',
    padding: '9 12',
    marginBottom: 10,
    marginTop: 6,
  },
  safeLabel: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    fontWeight: 700,
    color: SAGE,
    marginBottom: 3,
  },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'solid',
    marginTop: 8,
    marginBottom: 12,
  },
  tableHeader: {
    backgroundColor: COBALT,
    flexDirection: 'row',
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: COBALT_BORDER,
    borderRightStyle: 'solid',
  },
  tableHeaderCellLast: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontFamily: 'CormorantSC',
    fontSize: 7,
    color: WHITE,
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: 'solid',
    backgroundColor: WHITE,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: 'solid',
    backgroundColor: PARCH,
  },
  tableRowLast: {
    flexDirection: 'row',
    backgroundColor: WHITE,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    borderRightStyle: 'solid',
  },
  tableCellLast: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableCellText: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    color: INK,
    lineHeight: 1.45,
  },
  tableCellBold: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    color: INK,
    fontWeight: 700,
  },

  // Decision tree
  decisionBox: {
    borderWidth: 1,
    borderColor: COBALT_BORDER,
    borderStyle: 'solid',
    backgroundColor: WHITE,
    padding: '10 14',
    marginBottom: 8,
  },
  decisionQ: {
    fontFamily: 'Cormorant',
    fontSize: 12,
    color: COBALT,
    marginBottom: 5,
  },
  decisionYes: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    color: SAGE,
    fontWeight: 700,
  },
  decisionNo: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    color: ERROR_RED,
    fontWeight: 700,
  },
  decisionArrow: {
    fontFamily: 'DMMono',
    fontSize: 8,
    color: COBALT,
    opacity: 0.5,
    marginVertical: 2,
    textAlign: 'center',
  },

  // Bullet lists
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletDot: {
    fontFamily: 'DMMono',
    fontSize: 9,
    color: TERRA,
    width: 12,
    marginTop: 1,
  },
  bulletText: {
    fontFamily: 'DMSans',
    fontSize: 8.5,
    color: INK,
    lineHeight: 1.55,
    flex: 1,
  },

  // Score cards (Chapter 4)
  scoreCardRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  scoreCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'solid',
    backgroundColor: WHITE,
    padding: '8 10',
  },
  scoreCardNum: {
    fontFamily: 'DMMono',
    fontSize: 16,
    color: COBALT,
    marginBottom: 3,
  },
  scoreCardLabel: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: INK,
    marginBottom: 4,
    lineHeight: 1.2,
  },
  scoreCardDesc: {
    fontFamily: 'DMSans',
    fontSize: 7,
    color: INK,
    opacity: 0.7,
    lineHeight: 1.45,
  },

  // Vocabulary (Chapter 6)
  vocabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: 'solid',
    paddingVertical: 7,
  },
  vocabTerm: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COBALT,
    width: 120,
    lineHeight: 1.3,
  },
  vocabDef: {
    fontFamily: 'DMSans',
    fontSize: 7.5,
    color: INK,
    lineHeight: 1.5,
    flex: 1,
    opacity: 0.88,
  },
  vocabSource: {
    fontFamily: 'DMMono',
    fontSize: 6.5,
    color: COBALT,
    opacity: 0.55,
    marginTop: 2,
  },

  // Watermark band
  watermarkBand: {
    backgroundColor: COBALT_PALE,
    paddingVertical: 5,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watermarkText: {
    fontFamily: 'CormorantSC',
    fontSize: 6.5,
    color: COBALT,
    opacity: 0.6,
    letterSpacing: 1.1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: 'solid',
    paddingTop: 5,
  },
  footerText: {
    fontFamily: 'DMMono',
    fontSize: 6.5,
    color: INK,
    opacity: 0.45,
  },

  // Citation line
  citation: {
    fontFamily: 'DMMono',
    fontSize: 6.5,
    color: INK,
    opacity: 0.5,
    marginTop: 10,
    lineHeight: 1.4,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: 'solid',
    marginVertical: 12,
  },

  // Highlight chip
  chip: {
    backgroundColor: COBALT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 5,
  },
  chipText: {
    fontFamily: 'CormorantSC',
    fontSize: 7,
    color: WHITE,
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 8,
  },
});

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------
function PageFooter({ pageNum, total }: { pageNum: number; total: number }) {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>
        Safe AI Use Guide  |  The AI Banking Institute  |  {FOOTER_URL}
      </Text>
      <Text style={s.footerText}>
        {VERSION} — {VERSION_DATE}  |  Page {pageNum} of {total}
      </Text>
    </View>
  );
}

function ChapterHeader({
  num,
  title,
  lead,
}: {
  num: string;
  title: string;
  lead: string;
}) {
  return (
    <View style={s.chapterHeader}>
      <View style={s.chapterHeaderTop}>
        <Text style={s.chapterPillarBadge}>BOUNDARY-SAFE  ·  PILLAR B</Text>
        <Text style={s.chapterNum}>{num}</Text>
      </View>
      <Text style={s.chapterTitle}>{title}</Text>
      <Text style={s.chapterLead}>{lead}</Text>
    </View>
  );
}

function WatermarkBand() {
  return (
    <View style={s.watermarkBand}>
      <Text style={s.watermarkText}>THE AI BANKING INSTITUTE</Text>
      <Text style={s.watermarkText}>SAFE AI USE GUIDE  ·  CONFIDENTIAL — INTERNAL USE</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletDot}>·</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Page 1 — Cover
// ---------------------------------------------------------------------------
function CoverPage() {
  const chapters = [
    { num: '01', title: 'The never-paste list' },
    { num: '02', title: 'Private cloud vs. public model' },
    { num: '03', title: 'Mapping to SR 11-7' },
    { num: '04', title: 'Vendor evaluation scoring' },
    { num: '05', title: 'Shadow AI discovery' },
    { num: '06', title: 'Examiner readiness' },
  ];

  return (
    <Page size="LETTER" style={s.coverPage}>
      <View style={s.coverBand}>
        <Text style={s.coverBandLabel}>THE AI BANKING INSTITUTE  ·  BOUNDARY-SAFE</Text>
        <Text style={s.coverBandVersion}>{VERSION} — {VERSION_DATE}</Text>
      </View>

      <View style={s.coverBody}>
        <View>
          <Text style={s.coverPillarLabel}>PILLAR B  ·  FREE GOVERNANCE GUIDE</Text>
          <Text style={s.coverTitle}>Safe AI Use Guide</Text>
          <Text style={s.coverSubtitle}>
            Six chapters. Written for community banks and credit unions. Aligned with
            SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon
            (US Treasury, FBIIC, FSSCC — February 2026).
          </Text>
          <Text style={s.coverTagline}>Turning Bankers into Builders.</Text>

          <Text style={s.coverTOCHeader}>CONTENTS</Text>
          {chapters.map((ch) => (
            <View key={ch.num} style={s.coverTOCRow}>
              <Text style={s.coverTOCNum}>{ch.num}</Text>
              <Text style={s.coverTOCTitle}>{ch.title}</Text>
            </View>
          ))}
        </View>

        <View>
          <View style={s.coverFooter} />
          <View style={s.coverFooterContent}>
            <Text style={s.coverFooterText}>
              Not legal advice. For governance guidance purposes only.
              Consult your counsel for institution-specific applicability.
            </Text>
            <Text style={s.coverFooterText}>{FOOTER_URL}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Page 2 — Chapter 1: The Never-Paste List
// ---------------------------------------------------------------------------
function Chapter1Page() {
  const neverPasteItems = [
    {
      category: 'Member / Customer PII',
      examples: 'Names, SSNs, account numbers, DOBs, addresses, phone numbers, email addresses',
      why: 'GLBA Safeguards Rule requires data minimization and limits disclosure. Submitting PII to a public LLM constitutes an uncontrolled third-party disclosure.',
    },
    {
      category: 'Loan application data',
      examples: 'Income figures, employment history, credit scores, debt schedules, collateral values',
      why: 'ECOA / Reg B, FCRA, and Fair Lending obligations attach to this data. Adverse action analysis performed by an unvalidated model triggers SR 11-7 model risk requirements.',
    },
    {
      category: 'Non-public examination data',
      examples: 'CAMELS ratings, MRAs / MRIAs, examination reports, supervisory communications',
      why: 'Federal law prohibits unauthorized disclosure of examination information (12 U.S.C. § 1828(x)). Regulators have cited institutions for inadequate controls over this data.',
    },
    {
      category: 'BSA / AML records',
      examples: 'SAR narratives, CTR details, OFAC screening results, beneficial ownership records',
      why: 'SAR confidentiality provisions (31 U.S.C. § 5318(g)) carry criminal penalties for unauthorized disclosure. Training data contamination is an unresolved legal risk.',
    },
    {
      category: 'Internal audit & legal',
      examples: 'Draft audit findings, attorney-client communications, litigation hold materials',
      why: 'Privilege can be waived by disclosure to third parties. Public LLM terms of service typically do not preserve attorney-client or work-product protections.',
    },
    {
      category: 'Vendor contracts & pricing',
      examples: 'Core processor MSAs, fintech contracts, negotiated rate schedules',
      why: 'Most contracts contain confidentiality clauses. Disclosure to a public LLM may constitute a breach triggering liability.',
    },
  ];

  return (
    <Page size="LETTER" style={s.page}>
      <WatermarkBand />
      <ChapterHeader
        num="01 / 06"
        title="The never-paste list."
        lead="Six categories of data that must never touch a public large language model — and the regulatory reasoning behind each prohibition."
      />
      <View style={s.body}>
        <View style={s.warningBox}>
          <Text style={s.warningLabel}>Standing rule — no exceptions</Text>
          <Text style={s.warningText}>
            A public LLM is a third party. Any data entered into a public LLM prompt is transmitted
            outside your institution's security perimeter. When in doubt about a data category not
            listed here, apply the same analysis: would you email this to an unknown vendor?
            If no, do not paste it.
          </Text>
        </View>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <View style={[s.tableHeaderCell, { flex: 1.2 }]}>
              <Text style={s.tableHeaderText}>Data category</Text>
            </View>
            <View style={[s.tableHeaderCell, { flex: 1.8 }]}>
              <Text style={s.tableHeaderText}>Common examples</Text>
            </View>
            <View style={[s.tableHeaderCellLast, { flex: 2 }]}>
              <Text style={s.tableHeaderText}>Regulatory / legal basis</Text>
            </View>
          </View>
          {neverPasteItems.map((item, i) => (
            <View
              key={item.category}
              style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}
            >
              <View style={[s.tableCell, { flex: 1.2 }]}>
                <Text style={s.tableCellBold}>{item.category}</Text>
              </View>
              <View style={[s.tableCell, { flex: 1.8 }]}>
                <Text style={s.tableCellText}>{item.examples}</Text>
              </View>
              <View style={[s.tableCellLast, { flex: 2 }]}>
                <Text style={s.tableCellText}>{item.why}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoLabel}>Practical staff test</Text>
          <Text style={s.infoText}>
            Before pasting: ask "Does this contain a real person's information, a real account's
            data, or information I received under a regulatory expectation of confidentiality?"
            If yes to any: stop. Use only synthetic or fully anonymized data for AI-assisted
            drafting and analysis.
          </Text>
        </View>

        <Text style={s.citation}>
          Regulatory basis: GLBA Safeguards Rule (16 C.F.R. Part 314), ECOA / Reg B (12 C.F.R. Part 202),
          BSA SAR confidentiality (31 U.S.C. § 5318(g)), 12 U.S.C. § 1828(x).
        </Text>
      </View>
      <PageFooter pageNum={2} total={8} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Page 3 — Chapter 2: Private Cloud vs. Public Model Decision Tree
// ---------------------------------------------------------------------------
function Chapter2Page() {
  return (
    <Page size="LETTER" style={s.page}>
      <WatermarkBand />
      <ChapterHeader
        num="02 / 06"
        title="Private cloud vs. public model."
        lead="A structured decision tree every staff member should run before entering data into any AI tool. Five questions. One clear answer."
      />
      <View style={s.body}>
        <Text style={s.bodyText}>
          Not every AI use case requires private infrastructure. The following decision tree
          determines the minimum deployment tier for a given task based on data sensitivity,
          regulatory exposure, and output use. Walk each question in order — stop at the first
          YES that directs you to a deployment tier.
        </Text>

        {/* Decision tree as a vertical flow */}
        <View style={s.decisionBox}>
          <Text style={s.decisionQ}>Q1  Does the task require inputting any data from the never-paste list (Chapter 1)?</Text>
          <Text style={s.decisionYes}>YES → Private inference required. Approved private cloud or on-premises deployment only. Public models prohibited.</Text>
          <Text style={s.decisionNo}>NO → Continue to Q2.</Text>
        </View>

        <Text style={s.decisionArrow}>▼</Text>

        <View style={s.decisionBox}>
          <Text style={s.decisionQ}>Q2  Will the AI output be used to make or support a credit, compliance, or hiring decision?</Text>
          <Text style={s.decisionYes}>YES → Private inference required. Output constitutes a model output under SR 11-7 and requires validation, documentation, and an independent review.</Text>
          <Text style={s.decisionNo}>NO → Continue to Q3.</Text>
        </View>

        <Text style={s.decisionArrow}>▼</Text>

        <View style={s.decisionBox}>
          <Text style={s.decisionQ}>Q3  Does the vendor's terms of service permit training on submitted data?</Text>
          <Text style={s.decisionYes}>YES → Public model not permitted for internal use cases. Evaluate enterprise tier (training opt-out) or private deployment.</Text>
          <Text style={s.decisionNo}>NO (training opt-out confirmed in writing) → Continue to Q4.</Text>
        </View>

        <Text style={s.decisionArrow}>▼</Text>

        <View style={s.decisionBox}>
          <Text style={s.decisionQ}>Q4  Is the data classified as Internal Only (not public-facing, not restricted)?</Text>
          <Text style={s.decisionYes}>YES → Enterprise-licensed tier required (e.g., Microsoft 365 Copilot, Google Workspace Gemini with DLP controls). Consumer / free-tier tools prohibited.</Text>
          <Text style={s.decisionNo}>NO (data is genuinely public-domain or synthetic) → Continue to Q5.</Text>
        </View>

        <Text style={s.decisionArrow}>▼</Text>

        <View style={s.decisionBox}>
          <Text style={s.decisionQ}>Q5  Is the institution's AI vendor inventory list approved and does this tool appear on it?</Text>
          <Text style={s.decisionYes}>YES (approved tool, public data only) → Public model permitted. Document use case in AI use case inventory per AIEOG guidance.</Text>
          <Text style={s.decisionNo}>NO → Do not use. Submit for vendor evaluation (see Chapter 4) before proceeding.</Text>
        </View>

        <Text style={s.citation}>
          Framework basis: SS&C Managed IT Hybrid Multi-Cloud AI Strategy (2025) — "PII never in public LLMs;
          private cloud for sensitive inference; Zero Trust + RBAC." SR 11-7 Model Risk Management (FRB, 2011).
          AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026.
        </Text>
      </View>
      <PageFooter pageNum={3} total={8} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Page 4 — Chapter 3: SR 11-7 Mapping for Generative AI
// ---------------------------------------------------------------------------
function Chapter3Page() {
  const mappings = [
    {
      sr117: 'Model development, implementation, and use',
      genAI: 'Generative AI system selection and deployment',
      action: 'Document intended use case, data inputs, and business process before deployment. Assign a model owner.',
    },
    {
      sr117: 'Model validation',
      genAI: 'Output accuracy and hallucination testing',
      action: 'Establish a challenge / validation process. For high-stakes outputs (credit, compliance), require human review of AI-generated content before use.',
    },
    {
      sr117: 'Ongoing monitoring',
      genAI: 'Model drift and output quality degradation',
      action: 'Track output quality over time. Establish a trigger for re-evaluation when foundational model is updated by vendor.',
    },
    {
      sr117: 'Model inventory',
      genAI: 'AI use case inventory',
      action: 'Maintain a living register of every AI tool in use, its data inputs, business purpose, and risk tier. AIEOG AI Lexicon defines this as the "AI use case inventory."',
    },
    {
      sr117: 'Third-party model risk',
      genAI: 'Vendor / API-based AI services',
      action: 'Apply Interagency TPRM Guidance to all AI vendors. Obtain SOC 2 Type II, review data retention terms, confirm right-to-audit clause.',
    },
    {
      sr117: 'Sensitivity analysis and stress testing',
      genAI: 'Adversarial prompt / red-team testing',
      action: 'For any AI model used in lending or compliance decisions: conduct red-team testing for prompt injection, jailbreaks, and data leakage before production.',
    },
    {
      sr117: 'Independent review function',
      genAI: 'AI governance committee',
      action: 'Establish a cross-functional AI governance committee (IT, Compliance, Risk, Operations, Audit) with quarterly review cadence and board reporting.',
    },
  ];

  return (
    <Page size="LETTER" style={s.page}>
      <WatermarkBand />
      <ChapterHeader
        num="03 / 06"
        title="Mapping to SR 11-7."
        lead="Model Risk Management guidance was written for statistical models. It applies to generative AI — here is the mapping with action language for your governance framework."
      />
      <View style={s.body}>
        <View style={s.infoBox}>
          <Text style={s.infoLabel}>What examiners are asking</Text>
          <Text style={s.infoText}>
            Per GAO-25-107197 (May 2025): there is no comprehensive AI-specific banking framework yet.
            Examiners are applying existing guidance — SR 11-7 for model risk, Interagency TPRM for
            vendor oversight — through the lens of the AIEOG AI Lexicon. Institutions with documented
            governance frameworks are significantly better positioned in examinations.
          </Text>
        </View>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <View style={[s.tableHeaderCell, { flex: 1.4 }]}>
              <Text style={s.tableHeaderText}>SR 11-7 component</Text>
            </View>
            <View style={[s.tableHeaderCell, { flex: 1.4 }]}>
              <Text style={s.tableHeaderText}>Generative AI equivalent</Text>
            </View>
            <View style={[s.tableHeaderCellLast, { flex: 2.2 }]}>
              <Text style={s.tableHeaderText}>Action for your framework</Text>
            </View>
          </View>
          {mappings.map((row, i) => (
            <View key={row.sr117} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <View style={[s.tableCell, { flex: 1.4 }]}>
                <Text style={s.tableCellBold}>{row.sr117}</Text>
              </View>
              <View style={[s.tableCell, { flex: 1.4 }]}>
                <Text style={s.tableCellText}>{row.genAI}</Text>
              </View>
              <View style={[s.tableCellLast, { flex: 2.2 }]}>
                <Text style={s.tableCellText}>{row.action}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.citation}>
          Sources: SR 11-7 Supervisory Guidance on Model Risk Management, Federal Reserve Board (2011).
          GAO-25-107197, US Government Accountability Office (May 2025). AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC (February 2026).
        </Text>
      </View>
      <PageFooter pageNum={4} total={8} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Page 5 — Chapter 4: Vendor Evaluation Scoring
// ---------------------------------------------------------------------------
function Chapter4Page() {
  const questions = [
    {
      num: 'Q1',
      title: 'Data handling and retention',
      desc: 'Does the vendor contractually commit to zero training on your submitted data? Is retention period documented and within your TPRM policy limits?',
      score3: 'Written opt-out confirmed; data deleted within 30 days',
      score2: 'Training opt-out available; retention policy unclear',
      score1: 'No opt-out; data retained for model improvement',
      score0: 'Terms silent on training or retention',
    },
    {
      num: 'Q2',
      title: 'Security certifications',
      desc: 'Does the vendor maintain SOC 2 Type II, ISO 27001, or FedRAMP certification? Current within 12 months?',
      score3: 'SOC 2 Type II current; penetration test available',
      score2: 'SOC 2 Type I or ISO 27001 only',
      score1: 'Certification in progress; not yet issued',
      score0: 'No third-party security certification',
    },
    {
      num: 'Q3',
      title: 'Right to audit and subprocessors',
      desc: 'Does the contract include a right-to-audit clause? Are all material subprocessors disclosed and subject to equivalent controls?',
      score3: 'Right-to-audit confirmed; subprocessors listed and auditable',
      score2: 'Audit rights limited to questionnaire; subprocessors disclosed',
      score1: 'No right to audit; subprocessors partially disclosed',
      score0: 'Contract silent; subprocessors not disclosed',
    },
    {
      num: 'Q4',
      title: 'Concentration risk',
      desc: 'What share of your AI-dependent workflows would this vendor represent? Does adding this vendor create excessive concentration in a single provider?',
      score3: 'Under 25% of AI workflows; redundancy plan exists',
      score2: '25–50% of AI workflows; backup vendor identified',
      score1: 'Over 50% of AI workflows; no fallback plan',
      score0: 'Single point of failure; no contingency',
    },
    {
      num: 'Q5',
      title: 'Explainability and human-in-the-loop',
      desc: 'For outputs used in decisions: does the system provide an explanation of its reasoning? Is human review required before action is taken?',
      score3: 'Explanations available; HITL required by workflow design',
      score2: 'Explanations available on request; HITL optional',
      score1: 'Limited explainability; HITL not enforced',
      score0: 'Black-box output; no human review step',
    },
  ];

  return (
    <Page size="LETTER" style={s.page}>
      <WatermarkBand />
      <ChapterHeader
        num="04 / 06"
        title="Vendor evaluation scoring."
        lead="Five questions. Score 0–3 on each for a maximum of 15. Minimum passing score: 9. Below 9: do not deploy without remediation plan and board notification."
      />
      <View style={s.body}>
        <View style={s.scoreCardRow}>
          {[
            { score: '15', label: 'Approved', color: SAGE },
            { score: '12–14', label: 'Approved with conditions', color: COBALT },
            { score: '9–11', label: 'Conditional — remediation required', color: TERRA },
            { score: '< 9', label: 'Do not deploy', color: ERROR_RED },
          ].map((tier) => (
            <View key={tier.score} style={[s.scoreCard, { borderTopWidth: 3, borderTopColor: tier.color, borderTopStyle: 'solid' }]}>
              <Text style={[s.scoreCardNum, { color: tier.color }]}>{tier.score}</Text>
              <Text style={s.scoreCardLabel}>{tier.label}</Text>
            </View>
          ))}
        </View>

        {questions.map((q, i) => (
          <View key={q.num} style={[s.decisionBox, { marginBottom: 7 }]}>
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
              <Text style={[s.monoNote, { color: TERRA, marginRight: 8 }]}>{q.num}</Text>
              <Text style={[s.decisionQ, { flex: 1, fontSize: 11 }]}>{q.title}</Text>
            </View>
            <Text style={[s.bodyTextSmall, { marginBottom: 5 }]}>{q.desc}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { label: '3', text: q.score3, color: SAGE },
                { label: '2', text: q.score2, color: COBALT },
                { label: '1', text: q.score1, color: TERRA },
                { label: '0', text: q.score0, color: ERROR_RED },
              ].map((opt) => (
                <View key={opt.label} style={{ flex: 1, borderLeftWidth: 2, borderLeftColor: opt.color, borderLeftStyle: 'solid', paddingLeft: 5 }}>
                  <Text style={[s.monoNote, { color: opt.color }]}>{opt.label}</Text>
                  <Text style={[s.bodyTextSmall, { fontSize: 7 }]}>{opt.text}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={s.citation}>
          Framework basis: Interagency Guidance on Third-Party Relationships: Risk Management (OCC, FRB, FDIC, 2023).
          AIEOG AI Lexicon definitions: "human-in-the-loop (HITL)," "explainability," "third-party AI risk" (February 2026).
        </Text>
      </View>
      <PageFooter pageNum={5} total={8} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Page 6 — Chapter 5: Shadow AI Discovery
// ---------------------------------------------------------------------------
function Chapter5Page() {
  const phases = [
    {
      phase: 'Phase 1',
      name: 'Anonymous discovery survey',
      duration: 'Week 1',
      desc: 'Deploy a short anonymous survey to all staff: "What AI tools do you use in your work, including personal tools?" Guarantee no individual responses will be reviewed by management. Psychological safety is the key variable — without it, staff underreport by an estimated 60–80%.',
      output: 'Raw inventory of AI tools in use, segmented by department.',
    },
    {
      phase: 'Phase 2',
      name: 'DNS / proxy log review',
      duration: 'Week 1–2',
      desc: 'Pull 30-day outbound DNS queries or proxy logs. Search for known AI domains: openai.com, claude.ai, gemini.google.com, perplexity.ai, character.ai, and emerging tools. Cross-reference against approved vendor list.',
      output: 'Gap list: tools in use but not on approved inventory.',
    },
    {
      phase: 'Phase 3',
      name: 'Department interviews',
      duration: 'Week 2–3',
      desc: 'Conduct 20-minute structured interviews with department heads. Ask: "Walk me through a week of work — where do you use AI?" Do not begin with compliance questions; begin with productivity. Note: Lending, Operations, and IT typically surface the highest shadow AI counts.',
      output: 'Use-case map per department; identification of high-risk workflows.',
    },
    {
      phase: 'Phase 4',
      name: 'Risk classification',
      duration: 'Week 3',
      desc: 'Classify each discovered tool against the decision tree from Chapter 2. Tools receiving scores that indicate private inference requirements but running on public models are Tier 1 remediation priorities.',
      output: 'Risk-tiered shadow AI register.',
    },
    {
      phase: 'Phase 5',
      name: 'Governance integration',
      duration: 'Week 4',
      desc: 'Bring each tool through the vendor evaluation framework (Chapter 4). Tools scoring 9+ and aligned to approved data tiers: add to official AI use case inventory. Tools scoring below 9: notify users, provide approved alternatives, document decision.',
      output: 'Updated AI use case inventory; closure notification to affected staff.',
    },
  ];

  return (
    <Page size="LETTER" style={s.page}>
      <WatermarkBand />
      <ChapterHeader
        num="05 / 06"
        title="Shadow AI discovery."
        lead="A structured five-phase method for identifying the AI tools your staff are already using — and bringing them inside a governance perimeter without killing adoption."
      />
      <View style={s.body}>
        <View style={s.warningBox}>
          <Text style={s.warningLabel}>Why this matters now</Text>
          <Text style={s.warningText}>
            Gartner research (via Jack Henry, 2025) finds 57% of financial institutions report AI skill
            gaps and 55% have no AI governance framework yet. The most common root cause: staff adopted
            tools independently before governance existed. A punitive discovery process drives shadow AI
            further underground. This method is designed to surface tools through trust, not surveillance.
          </Text>
        </View>

        {phases.map((p) => (
          <View key={p.phase} style={{ marginBottom: 9 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 3 }}>
              <Text style={[s.monoNote, { color: COBALT, marginRight: 8, width: 54 }]}>{p.phase}</Text>
              <Text style={[s.h3, { marginTop: 0, marginBottom: 0, flex: 1 }]}>{p.name}</Text>
              <Text style={[s.monoNote, { color: TERRA, marginLeft: 8 }]}>{p.duration}</Text>
            </View>
            <Text style={[s.bodyText, { marginBottom: 3 }]}>{p.desc}</Text>
            <View style={s.safeBox}>
              <Text style={s.safeLabel}>Output</Text>
              <Text style={{ fontFamily: 'DMSans', fontSize: 8, color: INK, lineHeight: 1.5 }}>
                {p.output}
              </Text>
            </View>
          </View>
        ))}

        <Text style={s.citation}>
          Data: "Getting Started in AI," Jack Henry & Associates (2025) — 57% skill gaps, 55% no governance framework,
          sourced from Gartner Peer Community research. Shadow AI underreporting estimate: Gartner (2024).
        </Text>
      </View>
      <PageFooter pageNum={6} total={8} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Pages 7–8 — Chapter 6: Examiner Readiness (AIEOG Vocabulary)
// ---------------------------------------------------------------------------
function Chapter6Page1() {
  const vocab = [
    {
      term: 'Artificial intelligence (AI)',
      def: 'A machine-based system that can, for a given set of objectives, make predictions, recommendations, or decisions influencing real or virtual environments. AI systems are designed to operate with varying levels of autonomy.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
    {
      term: 'AI governance',
      def: 'The framework of policies, procedures, and controls an institution uses to manage the development, deployment, monitoring, and decommissioning of AI systems — including oversight structures, accountability assignments, and audit trails.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
    {
      term: 'AI use case inventory',
      def: 'A living register of all AI systems an institution uses or intends to use, documenting the business purpose, data inputs, risk tier, validation status, and responsible owner for each use case.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
    {
      term: 'Hallucination',
      def: 'Output generated by an AI model that is factually incorrect, nonsensical, or fabricated — but presented by the model with apparent confidence. A hallucination risk management plan is required for any high-stakes AI output used in decisions.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
    {
      term: 'Human-in-the-loop (HITL)',
      def: 'A system design in which a human reviewer is required to evaluate and approve AI-generated outputs before those outputs are acted upon. For regulated decisions (credit, compliance), HITL is a baseline governance requirement.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
    {
      term: 'Explainability',
      def: 'The degree to which the reasoning behind an AI system\'s output can be understood and communicated in plain language. Under ECOA / Reg B, adverse action notices require an explanation that cannot be satisfied by "the model said so."',
      source: 'AIEOG AI Lexicon, February 2026',
    },
  ];

  return (
    <Page size="LETTER" style={s.page}>
      <WatermarkBand />
      <ChapterHeader
        num="06 / 06"
        title="Examiner readiness."
        lead="What to have on the table when an examiner walks in. Built around the official AIEOG AI Lexicon vocabulary — the first cross-agency AI governance vocabulary for financial institutions."
      />
      <View style={s.body}>
        <View style={s.infoBox}>
          <Text style={s.infoLabel}>The examiner context</Text>
          <Text style={s.infoText}>
            The AIEOG AI Lexicon (US Treasury, FBIIC, FSSCC, February 2026) is the first shared
            cross-agency vocabulary for financial AI governance. Examiners from the OCC, FDIC, NCUA,
            and Federal Reserve are beginning to reference this lexicon in supervisory conversations.
            An institution that speaks this vocabulary fluently is demonstrating governance maturity —
            not just technical sophistication.
          </Text>
        </View>

        <Text style={s.label}>AIEOG VOCABULARY — DEFINITIONS YOUR EXAMINERS WILL RECOGNIZE</Text>

        {vocab.map((v) => (
          <View key={v.term} style={s.vocabRow}>
            <Text style={s.vocabTerm}>{v.term}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.vocabDef}>{v.def}</Text>
              <Text style={s.vocabSource}>{v.source}</Text>
            </View>
          </View>
        ))}
      </View>
      <PageFooter pageNum={7} total={8} />
    </Page>
  );
}

function Chapter6Page2() {
  const vocab2 = [
    {
      term: 'Third-party AI risk',
      def: 'The risk arising from an institution\'s use of AI systems developed, operated, or hosted by a third party. Requires application of Interagency TPRM Guidance including vendor due diligence, contractual protections, ongoing monitoring, and concentration risk analysis.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
    {
      term: 'Model risk',
      def: 'The potential for adverse consequences from decisions based on incorrect or misused model outputs. For generative AI, model risk extends to hallucinated outputs, prompt injection, and unintended behavioral drift after foundational model updates.',
      source: 'SR 11-7 / AIEOG AI Lexicon cross-reference',
    },
    {
      term: 'AI bias',
      def: 'Systematic and unfair discrimination in AI outputs resulting from biased training data, model architecture, or deployment context. Fair lending regulators are specifically focused on whether AI-assisted underwriting perpetuates disparate impact under ECOA / Reg B.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
    {
      term: 'Generative AI',
      def: 'AI systems capable of generating new content — text, images, code, audio — based on patterns learned from training data. Distinct from predictive AI in that outputs are novel rather than selected from a fixed category.',
      source: 'AIEOG AI Lexicon, February 2026',
    },
  ];

  const examinerChecklist = [
    'AI use case inventory — current, dated, owner-assigned',
    'AI governance policy — board-approved, with annual review cycle',
    'Vendor evaluation records for each AI tool (Chapter 4 scorecard or equivalent)',
    'SR 11-7 model risk mapping document (Chapter 3 framework or equivalent)',
    'Shadow AI discovery log — at minimum one cycle completed',
    'HITL documentation for any AI-assisted lending or compliance workflow',
    'Hallucination incident log (even if empty — the log itself demonstrates awareness)',
    'Board presentation on AI governance — within prior 12 months',
    'Staff training records — AI acceptable use training completion by role',
    'Adverse action notice review — confirm AI-generated reasoning is not cited verbatim',
  ];

  return (
    <Page size="LETTER" style={s.page}>
      <WatermarkBand />
      <View style={[s.chapterHeader, { paddingVertical: 12 }]}>
        <Text style={[s.chapterPillarBadge, { marginBottom: 3 }]}>BOUNDARY-SAFE  ·  PILLAR B  ·  CONTINUED</Text>
        <Text style={[s.chapterTitle, { fontSize: 18, marginBottom: 0 }]}>Examiner readiness — continued.</Text>
      </View>
      <View style={s.body}>
        {vocab2.map((v) => (
          <View key={v.term} style={s.vocabRow}>
            <Text style={s.vocabTerm}>{v.term}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.vocabDef}>{v.def}</Text>
              <Text style={s.vocabSource}>{v.source}</Text>
            </View>
          </View>
        ))}

        <View style={s.divider} />

        <Text style={s.label}>EXAMINER-READY DOCUMENT CHECKLIST</Text>
        <Text style={[s.bodyTextSmall, { marginBottom: 10 }]}>
          Have these available on the day of examination. For each item, maintain both a current
          version and a dated history showing the governance program has been operating, not just
          assembled in response to the examination notice.
        </Text>

        {examinerChecklist.map((item, i) => (
          <Bullet key={i} text={item} />
        ))}

        <View style={[s.infoBox, { marginTop: 12 }]}>
          <Text style={s.infoLabel}>Board reporting language</Text>
          <Text style={s.infoText}>
            The AI Banking Institute recommends a quarterly AI governance summary to the full board,
            covering: (1) active AI tools by department and risk tier; (2) any vendor evaluation
            changes; (3) shadow AI discovered and remediated; (4) staff training completion rates;
            (5) any incidents involving AI-generated outputs. Five slides. Twenty minutes. Sufficient
            for most community bank and credit union governance requirements.
          </Text>
        </View>

        <Text style={s.citation}>
          Sources: AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC (February 2026).
          GAO-25-107197, US Government Accountability Office (May 2025) — no comprehensive AI-specific banking framework yet;
          SR 11-7 and TPRM guidance apply. Cornerstone Advisors AI Playbook for Banks and Credit Unions (2025).{'\n'}
          This guide is provided for governance guidance purposes only and does not constitute legal advice.
          Consult your institution's counsel and primary federal regulator for institution-specific requirements.{'\n'}
          The AI Banking Institute  ·  AIBankingInstitute.com  ·  {VERSION} — {VERSION_DATE}
        </Text>
      </View>
      <PageFooter pageNum={8} total={8} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Document root
// ---------------------------------------------------------------------------
export function SafeAIUseGuideDocument() {
  return (
    <Document
      title="Safe AI Use Guide — The AI Banking Institute"
      author="The AI Banking Institute"
      subject="AI governance for community banks and credit unions"
      keywords="AI governance, SR 11-7, AIEOG, community bank, credit union, safe AI use"
      creator="AIBankingInstitute.com"
    >
      <CoverPage />
      <Chapter1Page />
      <Chapter2Page />
      <Chapter3Page />
      <Chapter4Page />
      <Chapter5Page />
      <Chapter6Page1 />
      <Chapter6Page2 />
    </Document>
  );
}
