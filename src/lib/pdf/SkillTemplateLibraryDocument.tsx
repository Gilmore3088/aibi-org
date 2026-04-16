// SkillTemplateLibraryDocument — React PDF document component for the Skill Template Library artifact.
// Rendered server-side via @react-pdf/renderer renderToBuffer().
// Static artifact — not personalized. Contains all five banking AI skill templates.
// Brand system: terracotta (#b5512e), parchment (#f5f0e6), ink (#1e1a14).
// Must NOT be imported in Client Components — PDF renderer is server-only.

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Brand constants
const TERRA = '#b5512e';
const PARCH = '#f5f0e6';
const INK = '#1e1a14';
const SAGE = '#4a6741';
const WHITE = '#ffffff';
const BORDER = '#d9cfc0';
const COBALT = '#2d4a7a';

const styles = StyleSheet.create({
  page: {
    backgroundColor: PARCH,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: INK,
    paddingBottom: 48,
  },
  header: {
    backgroundColor: TERRA,
    paddingVertical: 24,
    paddingHorizontal: 36,
    marginBottom: 0,
  },
  headerLabel: {
    fontSize: 7,
    color: WHITE,
    opacity: 0.8,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontFamily: 'Helvetica',
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
    opacity: 0.88,
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 20,
  },
  introSection: {
    backgroundColor: WHITE,
    borderRadius: 2,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COBALT,
  },
  introTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: COBALT,
    marginBottom: 6,
  },
  introText: {
    fontSize: 8.5,
    color: INK,
    lineHeight: 1.5,
  },
  frameworkRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  frameworkItem: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 2,
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: TERRA,
    marginRight: 8,
  },
  frameworkLetter: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: TERRA,
    marginBottom: 2,
  },
  frameworkLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: INK,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  frameworkDesc: {
    fontSize: 7.5,
    color: '#56423d',
    lineHeight: 1.4,
  },
  divider: {
    height: 0.5,
    backgroundColor: BORDER,
    marginVertical: 16,
  },
  templateCard: {
    backgroundColor: WHITE,
    borderRadius: 2,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: TERRA,
    opacity: 0.25,
    marginRight: 10,
    lineHeight: 1,
  },
  templateTitleBlock: {
    flex: 1,
  },
  templateLabel: {
    fontSize: 7,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  templateTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: INK,
  },
  componentRow: {
    marginBottom: 6,
  },
  componentLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1,
    marginBottom: 2,
  },
  componentText: {
    fontSize: 8,
    color: '#3a3330',
    lineHeight: 1.45,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#89726c',
  },
  pageNum: {
    fontSize: 7,
    color: '#89726c',
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: INK,
    marginBottom: 12,
  },
  twoCol: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  col: {
    flex: 1,
    marginRight: 12,
  },
  deployCard: {
    backgroundColor: WHITE,
    borderRadius: 2,
    padding: 12,
    marginBottom: 8,
  },
  deployPlatform: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: COBALT,
    marginBottom: 4,
  },
  deployStep: {
    fontSize: 7.5,
    color: INK,
    lineHeight: 1.45,
    marginBottom: 1,
  },
});

const TEMPLATES = [
  {
    number: '01',
    label: 'OPERATIONS',
    title: 'Meeting Summary',
    accentColor: TERRA,
    labelColor: TERRA,
    role: 'You are a Senior Operations Manager at a community bank with 10+ years of experience producing structured, action-oriented meeting documentation.',
    context: 'Raw meeting notes from an internal operational meeting. Output will be distributed to all attendees within 24 hours.',
    task: 'Extract: (1) Key Decisions Made (bullet list, past tense), (2) Action Items with owner and due date, (3) Open Issues / Parking Lot, (4) Next Meeting details.',
    format: 'Structured Markdown with five labeled sections (## headers). Bullet lists for decisions, numbered list for action items.',
    constraints: 'Never invent information. Never convert discussion to decision without evidence. Flag regulatory action items with [REQUIRES COMPLIANCE REVIEW].',
  },
  {
    number: '02',
    label: 'COMPLIANCE',
    title: 'Regulatory Research',
    accentColor: COBALT,
    labelColor: COBALT,
    role: 'You are a Senior Compliance Officer with specialized expertise in BSA/AML, ECOA/Reg B, TILA/Reg Z, RESPA, and FDIC/NCUA examination standards.',
    context: 'A regulatory guidance document, interagency statement, or compliance question at a community bank or credit union under $2B in assets.',
    task: 'Produce: (1) Plain-language Regulatory Summary (150 words max), (2) Effective Date / Applicability, (3) Operational Impact (3-5 action statements), (4) Examination Risk, (5) Recommended Next Steps.',
    format: 'Structured Markdown with five sections. Bullet lists for operational impact. Numbered list for next steps.',
    constraints: 'Never provide a definitive legal determination. Always cite specific regulation sections. Flag fair lending implications with [FAIR LENDING FLAG]. Flag TPRM items with [TPRM REVIEW REQUIRED].',
  },
  {
    number: '03',
    label: 'LENDING',
    title: 'Loan Pipeline Report',
    accentColor: SAGE,
    labelColor: SAGE,
    role: 'You are a Senior Credit Analyst with expertise in CRE, C&I, and consumer loan underwriting, producing management-quality pipeline reports.',
    context: 'Structured pipeline data — CSV export or plain-text dump — from a loan origination system, for the weekly loan committee meeting.',
    task: 'Produce: (1) Pipeline Summary by type and stage, (2) Aging Flags (>30 days in stage), (3) Documentation Exceptions, (4) Top Five by Volume, (5) Weekly Movement if prior data available.',
    format: 'Structured Markdown. Tables for pipeline summary and top-five. Bullet lists for aging flags and exceptions.',
    constraints: 'Never calculate or imply a credit decision. Use masked account references. Flag concentration types with [CONCENTRATION — VERIFY LIMITS]. Do not make portfolio health commentary.',
  },
  {
    number: '04',
    label: 'OPERATIONS',
    title: 'Exception Report',
    accentColor: TERRA,
    labelColor: TERRA,
    role: 'You are an Operations Manager with expertise in payment processing, transaction exceptions, and daily balancing at a community financial institution.',
    context: 'Raw exception data — system-generated report or CSV export — from today\'s processing cycle. For operations supervisor and end-of-day management reporting.',
    task: 'Produce: (1) Exception Summary by category, (2) Priority Items (same-day resolution, [SAME-DAY REQUIRED]), (3) Standard Items (2-day resolution), (4) Recurrence Flags, (5) Resolved Since Last Report.',
    format: 'Structured Markdown. Summary table for categories. Numbered lists for priority and standard items.',
    constraints: 'Never include full account numbers — use masked format (XXXX-1234). Flag unusual cash activity with [BSA REVIEW]. Flag data inconsistencies with [DATA DISCREPANCY — VERIFY SOURCE].',
  },
  {
    number: '05',
    label: 'MARKETING',
    title: 'Marketing Content',
    accentColor: '#7c5c3b',
    labelColor: '#7c5c3b',
    role: 'You are a Marketing Communications Specialist for a community bank or credit union with expertise in member-facing content across digital, print, and in-branch channels.',
    context: 'A content brief, product details, or raw draft. Audience: community bank members and customers valuing personalized service. Must comply with Reg DD, Reg Z, and applicable state consumer protection requirements.',
    task: 'For each content piece, produce: (1) Headline (under 10 words, benefit-focused), (2) Body copy per channel requirements, (3) Call-to-Action statement, (4) Compliance Notes.',
    format: 'Formatted Markdown: **Headline** / **Body** / **Call to Action** / **Compliance Notes** structure. Copy only — no design instructions.',
    constraints: 'Flag rate claims with [RATE/TERM — VERIFY BEFORE PUBLICATION]. Never use urgency language. Write at 10th-grade reading level. Flag claims requiring source verification with [SOURCE REQUIRED].',
  },
];

const DEPLOY_STEPS = [
  {
    platform: 'ChatGPT (Custom Instructions)',
    steps: 'Settings > Custom Instructions > paste skill into "What would you like ChatGPT to know?" > Save.',
  },
  {
    platform: 'ChatGPT (Project)',
    steps: 'Create Project > Project Settings > Custom Instructions > paste skill > Save.',
  },
  {
    platform: 'Claude (Project)',
    steps: 'Create Project > Project Settings (gear icon) > Project Instructions > paste skill > Save.',
  },
  {
    platform: 'Gemini (Gem)',
    steps: 'Gem Manager in Gemini Advanced > Create new Gem > Instructions field > paste skill > Save.',
  },
];

function TemplatePage({ template, index }: { template: typeof TEMPLATES[0]; index: number }) {
  return (
    <Page size="LETTER" style={styles.page} wrap>
      <View style={styles.body}>
        <View style={[styles.templateCard, { borderLeftColor: template.accentColor }]}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateNumber}>{template.number}</Text>
            <View style={styles.templateTitleBlock}>
              <Text style={[styles.templateLabel, { color: template.labelColor }]}>
                {template.label} SKILL TEMPLATE
              </Text>
              <Text style={styles.templateTitle}>{template.title}</Text>
            </View>
          </View>

          <View style={styles.componentRow}>
            <Text style={[styles.componentLabel, { color: template.accentColor }]}>R — ROLE</Text>
            <Text style={styles.componentText}>{template.role}</Text>
          </View>

          <View style={[styles.divider, { marginVertical: 8 }]} />

          <View style={styles.componentRow}>
            <Text style={[styles.componentLabel, { color: template.accentColor }]}>C — CONTEXT</Text>
            <Text style={styles.componentText}>{template.context}</Text>
          </View>

          <View style={[styles.divider, { marginVertical: 8 }]} />

          <View style={styles.componentRow}>
            <Text style={[styles.componentLabel, { color: template.accentColor }]}>T — TASK</Text>
            <Text style={styles.componentText}>{template.task}</Text>
          </View>

          <View style={[styles.divider, { marginVertical: 8 }]} />

          <View style={styles.componentRow}>
            <Text style={[styles.componentLabel, { color: template.accentColor }]}>F — FORMAT</Text>
            <Text style={styles.componentText}>{template.format}</Text>
          </View>

          <View style={[styles.divider, { marginVertical: 8 }]} />

          <View style={styles.componentRow}>
            <Text style={[styles.componentLabel, { color: template.accentColor }]}>
              C — CONSTRAINTS
            </Text>
            <Text style={styles.componentText}>{template.constraints}</Text>
          </View>
        </View>

        <View style={styles.introSection}>
          <Text style={[styles.introText, { fontSize: 7.5, color: '#56423d' }]}>
            Deploying this template: Copy the Role and Context into your AI platform's system prompt
            field. Add Task, Format, and Constraints. Paste this skill into your next session to test.
            Refine based on actual outputs. Download the full .md version from Module 7 for copy-paste
            deployment.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AiBI-P: Banking AI Practitioner · Skill Template Library · Module 6 Artifact
        </Text>
        <Text style={styles.pageNum}>Template {index + 1} of {TEMPLATES.length}</Text>
      </View>
    </Page>
  );
}

export function SkillTemplateLibraryDocument() {
  return (
    <Document
      title="AiBI-P Skill Template Library"
      author="The AI Banking Institute"
      subject="Banking AI Skill Templates — Module 6 Artifact"
    >
      {/* Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>AiBI-P: BANKING AI PRACTITIONER</Text>
          <Text style={styles.headerTitle}>Skill Template Library</Text>
          <Text style={styles.headerSubtitle}>
            Module 6 Artifact · Five Banking AI Skill Templates · Ready to Deploy
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>About This Library</Text>
            <Text style={styles.introText}>
              The Skill Template Library contains five institution-grade banking AI skills across four
              core functional areas: Operations, Compliance, Lending, and Marketing. Each template
              contains all five components of a complete skill (Role, Context, Task, Format,
              Constraints) and is formatted for immediate deployment in ChatGPT, Claude, Gemini, or
              any AI platform with custom instruction capabilities.{'\n\n'}
              These templates are starting points, not finished products. Adapt the Role to your
              institution's specific context, modify the Task to match your workflow, and update
              Constraints to reflect your institution's policies and risk tolerance. A skill that has
              been adapted to your specific institution will consistently outperform a generic template.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>The RTFC Framework</Text>
          <View style={styles.frameworkRow}>
            {[
              {
                letter: 'R',
                label: 'Role',
                desc: 'The expert persona the AI adopts. Sets vocabulary, assumptions, and reasoning depth.',
              },
              {
                letter: 'T',
                label: 'Task',
                desc: 'The specific, measurable action required. Use action verbs. Define the deliverable precisely.',
              },
              {
                letter: 'F',
                label: 'Format',
                desc: 'The output structure. Name the format and specify its structure explicitly.',
              },
              {
                letter: 'C',
                label: 'Constraints',
                desc: 'The guardrails. Write as "never" or "always" statements to prevent inappropriate outputs.',
              },
            ].map((item) => (
              <View key={item.letter} style={styles.frameworkItem}>
                <Text style={styles.frameworkLetter}>{item.letter}</Text>
                <Text style={styles.frameworkLabel}>{item.label.toUpperCase()}</Text>
                <Text style={styles.frameworkDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Templates in This Library</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              {TEMPLATES.slice(0, 3).map((t) => (
                <View key={t.number} style={[styles.deployCard, { borderLeftWidth: 3, borderLeftColor: t.accentColor }]}>
                  <Text style={[styles.deployPlatform, { color: t.accentColor }]}>
                    {t.number} · {t.label}
                  </Text>
                  <Text style={[styles.deployStep, { fontFamily: 'Helvetica-Bold', fontSize: 8.5 }]}>
                    {t.title}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.col}>
              {TEMPLATES.slice(3).map((t) => (
                <View key={t.number} style={[styles.deployCard, { borderLeftWidth: 3, borderLeftColor: t.accentColor }]}>
                  <Text style={[styles.deployPlatform, { color: t.accentColor }]}>
                    {t.number} · {t.label}
                  </Text>
                  <Text style={[styles.deployStep, { fontFamily: 'Helvetica-Bold', fontSize: 8.5 }]}>
                    {t.title}
                  </Text>
                </View>
              ))}
              <View style={[styles.deployCard, { backgroundColor: PARCH }]}>
                <Text style={[styles.deployStep, { fontFamily: 'Helvetica-Bold', color: INK }]}>
                  Module 7: Build your own
                </Text>
                <Text style={styles.deployStep}>
                  Use the Skill Builder in Module 7 to create a custom .md skill file tailored to your
                  specific role and workflow.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Quick Deployment Guide</Text>
          <View style={styles.twoCol}>
            {DEPLOY_STEPS.map((d) => (
              <View key={d.platform} style={styles.col}>
                <View style={styles.deployCard}>
                  <Text style={styles.deployPlatform}>{d.platform}</Text>
                  <Text style={styles.deployStep}>{d.steps}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            The AI Banking Institute · AiBI-P: Banking AI Practitioner
          </Text>
          <Text style={styles.pageNum}>1 of {TEMPLATES.length + 1}</Text>
        </View>
      </Page>

      {/* One page per template */}
      {TEMPLATES.map((template, idx) => (
        <TemplatePage key={template.number} template={template} index={idx} />
      ))}
    </Document>
  );
}
