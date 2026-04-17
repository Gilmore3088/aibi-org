// TransformationReportDocument — React PDF component for the AiBI-P Transformation Report.
// Rendered server-side via @react-pdf/renderer renderToBuffer().
// Must NOT be imported in Client Components — PDF renderer is server-only.
//
// Five pages:
//   1. Cover — learner name, institution, date
//   2. Pre/Post Assessment Comparison — scores, tier change, dimension bar chart
//   3. Skills Built — skill name, role context, estimated time savings
//   4. Cumulative Impact — hours saved, workflows automated, quick wins
//   5. Course Completion Summary — modules, work product, credential, verification URL

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface SkillEntry {
  readonly name: string;
  readonly role: string;
  readonly annualHoursSaved: number;
}

export interface QuickWinEntry {
  readonly description: string;
  readonly tool: string;
  readonly timeSavedMinutes: number;
}

export interface DimensionEntry {
  readonly label: string;
  readonly preScore: number | null;
  readonly postScore: number;
  readonly maxScore: number;
}

export interface TransformationReportProps {
  readonly learnerName: string;
  readonly institution: string;
  readonly reportDate: string;
  readonly preScore: number | null;
  readonly postScore: number;
  readonly preTierLabel: string | null;
  readonly postTierLabel: string;
  readonly dimensions: readonly DimensionEntry[];
  readonly skills: readonly SkillEntry[];
  readonly totalAnnualHoursSaved: number;
  readonly workflowsAutomated: number;
  readonly quickWins: readonly QuickWinEntry[];
  readonly modulesCompleted: number;
  readonly totalModules: number;
  readonly workProductSubmitted: boolean;
  readonly workProductReviewed: boolean;
  readonly verificationUrl: string;
  readonly enrollmentId: string;
}

// Brand constants (react-pdf requires literal hex values)
const TERRA = '#b5512e';
const TERRA_PALE = '#f0c4ab';
const PARCH = '#f5f0e6';
const LINEN = '#f9f6f0';
const INK = '#1e1a14';
const MUTED = '#8a7060';
const BORDER = '#d9cfc0';
const WHITE = '#ffffff';
const SAGE = '#4a6741';
const ERROR_RED = '#9b2226';

const FOOTER_TEXT = 'The AI Banking Institute  |  AIBankingInstitute.com  |  Confidential';

const styles = StyleSheet.create({
  page: {
    backgroundColor: LINEN,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: INK,
  },
  pageParch: {
    backgroundColor: PARCH,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: INK,
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: MUTED,
    opacity: 0.75,
  },

  // ── Cover page ──────────────────────────────────────────────────────────────
  coverAccent: {
    backgroundColor: TERRA,
    height: 6,
  },
  coverBody: {
    flex: 1,
    paddingHorizontal: 56,
    paddingTop: 72,
    paddingBottom: 80,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverEyebrow: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: TERRA,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 20,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 34,
    color: INK,
    lineHeight: 1.25,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 13,
    color: MUTED,
    marginBottom: 48,
  },
  coverDivider: {
    width: 48,
    height: 2,
    backgroundColor: TERRA,
    marginBottom: 40,
    opacity: 0.6,
  },
  coverMeta: {
    flexDirection: 'column',
    gap: 12,
  },
  coverMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  coverMetaLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    width: 80,
    paddingTop: 2,
  },
  coverMetaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: INK,
    flex: 1,
  },
  coverSeal: {
    alignItems: 'flex-end',
    marginTop: 32,
  },
  coverSealCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: TERRA,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  coverSealText: {
    fontFamily: 'Helvetica-BoldOblique',
    fontSize: 18,
    color: TERRA,
  },
  coverSealSub: {
    fontFamily: 'Helvetica',
    fontSize: 5.5,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },

  // ── Section pages shared ────────────────────────────────────────────────────
  pageHeader: {
    backgroundColor: TERRA,
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  pageHeaderEyebrow: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: TERRA_PALE,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  pageHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: WHITE,
  },
  pageBody: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 64,
  },

  // ── Score comparison ────────────────────────────────────────────────────────
  scoreRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 14,
    alignItems: 'center',
  },
  scoreCardLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  scoreCardNumber: {
    fontFamily: 'Courier',
    fontSize: 28,
    tabularNums: true,
  },
  scoreCardTier: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  scoreCardDelta: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: SAGE,
    marginTop: 4,
    tabularNums: true,
  },
  dimensionSection: {
    marginBottom: 8,
  },
  dimensionSectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: TERRA,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  dimensionRow: {
    marginBottom: 8,
  },
  dimensionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  dimensionLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: INK,
  },
  dimensionScore: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: MUTED,
    tabularNums: true,
  },
  barTrack: {
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 1,
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 6,
    borderRadius: 1,
  },
  barPre: {
    height: 2,
    position: 'absolute',
    top: 2,
    borderRadius: 1,
  },

  // ── Skills built ────────────────────────────────────────────────────────────
  skillRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 12,
  },
  skillIndex: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: MUTED,
    width: 18,
    paddingTop: 1,
    tabularNums: true,
  },
  skillBody: {
    flex: 1,
  },
  skillName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: INK,
    marginBottom: 2,
  },
  skillRole: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.4,
    marginBottom: 3,
  },
  skillSavings: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: TERRA,
    tabularNums: true,
  },
  emptyState: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
    color: MUTED,
    paddingVertical: 12,
  },

  // ── Impact numbers ──────────────────────────────────────────────────────────
  impactGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  impactCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 14,
  },
  impactCardLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  impactCardValue: {
    fontFamily: 'Courier',
    fontSize: 26,
    color: INK,
    tabularNums: true,
  },
  impactCardUnit: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },
  quickWinLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: TERRA,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },
  quickWinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingVertical: 6,
  },
  quickWinDesc: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: INK,
    flex: 1,
    lineHeight: 1.4,
  },
  quickWinMeta: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: MUTED,
    tabularNums: true,
    marginLeft: 12,
  },

  // ── Completion summary ──────────────────────────────────────────────────────
  completionGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  completionCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 14,
  },
  completionCardLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  completionCardValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: INK,
    lineHeight: 1.35,
  },
  completionCheck: {
    color: SAGE,
  },
  completionFail: {
    color: ERROR_RED,
  },
  credentialBox: {
    backgroundColor: INK,
    borderRadius: 2,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  credentialLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: TERRA_PALE,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  credentialValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: WHITE,
    letterSpacing: 1,
  },
  credentialSub: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },
  verifyRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  verifyLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  verifyUrl: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: TERRA,
  },
  noteText: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.5,
    marginTop: 16,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function minutesToLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes === 60) return '1 hr';
  return `${Math.round(minutes / 60)} hrs`;
}

function tierColor(label: string | null): string {
  if (!label) return MUTED;
  const lower = label.toLowerCase();
  if (lower.includes('scale')) return SAGE;
  if (lower.includes('momentum')) return '#c96a43';
  if (lower.includes('early')) return TERRA;
  return ERROR_RED;
}

// ── Footer subcomponent ──────────────────────────────────────────────────────

function PageFooter({ pageNum, total }: { readonly pageNum: number; readonly total: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{FOOTER_TEXT}</Text>
      <Text style={styles.footerText}>
        {pageNum} / {total}
      </Text>
    </View>
  );
}

// ── Page 1: Cover ────────────────────────────────────────────────────────────

function CoverPage({
  learnerName,
  institution,
  reportDate,
}: Pick<TransformationReportProps, 'learnerName' | 'institution' | 'reportDate'>) {
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.coverAccent} />
      <View style={styles.coverBody}>
        <View>
          <Text style={styles.coverEyebrow}>AiBI-P  ·  Banking AI Practitioner</Text>
          <Text style={styles.coverTitle}>Transformation{'\n'}Report</Text>
          <Text style={styles.coverSubtitle}>
            A record of AI readiness growth, skills built, and impact delivered.
          </Text>
          <View style={styles.coverDivider} />
          <View style={styles.coverMeta}>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>Prepared for</Text>
              <Text style={styles.coverMetaValue}>{learnerName}</Text>
            </View>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>Institution</Text>
              <Text style={styles.coverMetaValue}>{institution}</Text>
            </View>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>Date</Text>
              <Text style={styles.coverMetaValue}>{reportDate}</Text>
            </View>
          </View>
        </View>
        <View style={styles.coverSeal}>
          <View style={styles.coverSealCircle}>
            <Text style={styles.coverSealText}>AiBI</Text>
            <Text style={styles.coverSealSub}>Institutional</Text>
          </View>
        </View>
      </View>
      <PageFooter pageNum={1} total={5} />
    </Page>
  );
}

// ── Page 2: Pre/Post Assessment Comparison ───────────────────────────────────

function AssessmentPage({
  preScore,
  postScore,
  preTierLabel,
  postTierLabel,
  dimensions,
}: Pick<
  TransformationReportProps,
  'preScore' | 'postScore' | 'preTierLabel' | 'postTierLabel' | 'dimensions'
>) {
  const hasPreScore = preScore !== null && preScore > 0;
  const delta = hasPreScore ? postScore - preScore! : null;
  const deltaPercent =
    hasPreScore && preScore! > 0
      ? Math.round(((postScore - preScore!) / preScore!) * 100)
      : null;

  return (
    <Page size="LETTER" style={styles.pageParch}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderEyebrow}>AiBI-P Transformation Report  ·  Page 2</Text>
        <Text style={styles.pageHeaderTitle}>Pre / Post Assessment Comparison</Text>
      </View>

      <View style={styles.pageBody}>
        {/* Score cards row */}
        <View style={styles.scoreRow}>
          {hasPreScore && (
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>Pre-Course Score</Text>
              <Text style={[styles.scoreCardNumber, { color: tierColor(preTierLabel) }]}>
                {preScore}
              </Text>
              {preTierLabel && (
                <Text style={[styles.scoreCardTier, { color: tierColor(preTierLabel) }]}>
                  {preTierLabel}
                </Text>
              )}
            </View>
          )}

          <View style={styles.scoreCard}>
            <Text style={styles.scoreCardLabel}>Post-Course Score</Text>
            <Text style={[styles.scoreCardNumber, { color: tierColor(postTierLabel) }]}>
              {postScore}
            </Text>
            <Text style={[styles.scoreCardTier, { color: tierColor(postTierLabel) }]}>
              {postTierLabel}
            </Text>
            {deltaPercent !== null && delta !== null && (
              <Text style={styles.scoreCardDelta}>
                {delta > 0 ? '+' : ''}{delta} pts  ({deltaPercent > 0 ? '+' : ''}{deltaPercent}%)
              </Text>
            )}
          </View>

          {!hasPreScore && (
            <View style={[styles.scoreCard, { opacity: 0.5 }]}>
              <Text style={styles.scoreCardLabel}>Pre-Course Score</Text>
              <Text style={[styles.scoreCardNumber, { color: MUTED }]}>—</Text>
              <Text style={[styles.scoreCardTier, { color: MUTED }]}>Not recorded</Text>
            </View>
          )}
        </View>

        {/* Dimension comparison bars */}
        {dimensions.length > 0 && (
          <View style={styles.dimensionSection}>
            <Text style={styles.dimensionSectionLabel}>Dimension-by-Dimension Comparison</Text>
            {dimensions.map((dim) => {
              const postPct = Math.min(100, (dim.postScore / dim.maxScore) * 100);
              const prePct =
                dim.preScore !== null
                  ? Math.min(100, (dim.preScore / dim.maxScore) * 100)
                  : null;
              return (
                <View key={dim.label} style={styles.dimensionRow}>
                  <View style={styles.dimensionMeta}>
                    <Text style={styles.dimensionLabel}>{dim.label}</Text>
                    <Text style={styles.dimensionScore}>
                      {dim.preScore !== null
                        ? `${dim.preScore} → ${dim.postScore} / ${dim.maxScore}`
                        : `${dim.postScore} / ${dim.maxScore}`}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${postPct}%`,
                          backgroundColor: tierColor(postTierLabel),
                          opacity: 0.7,
                        },
                      ]}
                    />
                    {prePct !== null && (
                      <View
                        style={[
                          styles.barPre,
                          {
                            width: `${prePct}%`,
                            backgroundColor: MUTED,
                            opacity: 0.5,
                          },
                        ]}
                      />
                    )}
                  </View>
                </View>
              );
            })}
            <Text
              style={{
                fontFamily: 'Helvetica-Oblique',
                fontSize: 7,
                color: MUTED,
                marginTop: 8,
              }}
            >
              {hasPreScore
                ? 'Filled bar = post-course score. Mid-bar stripe = pre-course baseline.'
                : 'Filled bar = post-course score. Pre-course baseline not available.'}
            </Text>
          </View>
        )}
      </View>

      <PageFooter pageNum={2} total={5} />
    </Page>
  );
}

// ── Page 3: Skills Built ─────────────────────────────────────────────────────

function SkillsPage({ skills }: Pick<TransformationReportProps, 'skills'>) {
  return (
    <Page size="LETTER" style={styles.pageParch}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderEyebrow}>AiBI-P Transformation Report  ·  Page 3</Text>
        <Text style={styles.pageHeaderTitle}>Skills Built</Text>
      </View>

      <View style={styles.pageBody}>
        {skills.length === 0 ? (
          <Text style={styles.emptyState}>
            No skills on record yet. Complete Modules 7 and 8 to build your banking AI skill.
          </Text>
        ) : (
          skills.map((skill, i) => (
            <View key={i} style={styles.skillRow}>
              <Text style={styles.skillIndex}>{String(i + 1).padStart(2, '0')}.</Text>
              <View style={styles.skillBody}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillRole}>{skill.role}</Text>
                <Text style={styles.skillSavings}>
                  Est. {skill.annualHoursSaved} hrs saved / year
                </Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.noteText}>
          Skills were built during the course using the five-component RTFC framework (Role,
          Task, Format, Constraints, Context) and stress-tested against real banking scenarios
          in Module 8 before deployment.
        </Text>
      </View>

      <PageFooter pageNum={3} total={5} />
    </Page>
  );
}

// ── Page 4: Cumulative Impact ────────────────────────────────────────────────

function ImpactPage({
  totalAnnualHoursSaved,
  workflowsAutomated,
  quickWins,
}: Pick<TransformationReportProps, 'totalAnnualHoursSaved' | 'workflowsAutomated' | 'quickWins'>) {
  const totalQuarterlyMinutes = quickWins.reduce((sum, w) => sum + w.timeSavedMinutes, 0);
  const totalQuarterlyHours = Math.round(totalQuarterlyMinutes / 60);

  return (
    <Page size="LETTER" style={styles.pageParch}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderEyebrow}>AiBI-P Transformation Report  ·  Page 4</Text>
        <Text style={styles.pageHeaderTitle}>Cumulative Impact</Text>
      </View>

      <View style={styles.pageBody}>
        {/* Impact metrics */}
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactCardLabel}>Est. Hours Saved / Year</Text>
            <Text style={styles.impactCardValue}>{totalAnnualHoursSaved}</Text>
            <Text style={styles.impactCardUnit}>from course curriculum alone</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactCardLabel}>Workflows Automated</Text>
            <Text style={styles.impactCardValue}>{workflowsAutomated}</Text>
            <Text style={styles.impactCardUnit}>skills built and deployed</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactCardLabel}>Quick Wins Logged</Text>
            <Text style={styles.impactCardValue}>{quickWins.length}</Text>
            <Text style={styles.impactCardUnit}>
              {totalQuarterlyHours > 0
                ? `${totalQuarterlyHours} hrs total saved`
                : 'post-course automations'}
            </Text>
          </View>
        </View>

        {/* Quick wins list */}
        {quickWins.length > 0 && (
          <View>
            <Text style={styles.quickWinLabel}>Quick Wins Log</Text>
            {quickWins.map((win, i) => (
              <View key={i} style={styles.quickWinRow}>
                <Text style={styles.quickWinDesc}>{win.description}</Text>
                <Text style={styles.quickWinMeta}>
                  {win.tool}  ·  {minutesToLabel(win.timeSavedMinutes)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {quickWins.length === 0 && (
          <Text style={styles.emptyState}>
            No quick wins logged yet. Visit the Quick Win Tracker to record automations you
            have built post-course.
          </Text>
        )}

        <Text style={styles.noteText}>
          Estimated hours saved are based on course curriculum time-savings data and learner-reported
          quick wins. Actual savings will vary by institution, role, and frequency of use.
        </Text>
      </View>

      <PageFooter pageNum={4} total={5} />
    </Page>
  );
}

// ── Page 5: Course Completion Summary ────────────────────────────────────────

function CompletionPage({
  modulesCompleted,
  totalModules,
  workProductSubmitted,
  workProductReviewed,
  verificationUrl,
  enrollmentId,
}: Pick<
  TransformationReportProps,
  | 'modulesCompleted'
  | 'totalModules'
  | 'workProductSubmitted'
  | 'workProductReviewed'
  | 'verificationUrl'
  | 'enrollmentId'
>) {
  const allModulesComplete = modulesCompleted >= totalModules;

  return (
    <Page size="LETTER" style={styles.pageParch}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderEyebrow}>AiBI-P Transformation Report  ·  Page 5</Text>
        <Text style={styles.pageHeaderTitle}>Course Completion Summary</Text>
      </View>

      <View style={styles.pageBody}>
        {/* Completion checklist */}
        <View style={styles.completionGrid}>
          <View style={styles.completionCard}>
            <Text style={styles.completionCardLabel}>Modules Completed</Text>
            <Text style={styles.completionCardValue}>
              <Text
                style={allModulesComplete ? styles.completionCheck : styles.completionFail}
              >
                {modulesCompleted} / {totalModules}
              </Text>
            </Text>
          </View>
          <View style={styles.completionCard}>
            <Text style={styles.completionCardLabel}>Work Product Submitted</Text>
            <Text
              style={[
                styles.completionCardValue,
                workProductSubmitted ? styles.completionCheck : styles.completionFail,
              ]}
            >
              {workProductSubmitted ? 'Yes' : 'Not yet'}
            </Text>
          </View>
          <View style={styles.completionCard}>
            <Text style={styles.completionCardLabel}>Work Product Reviewed</Text>
            <Text
              style={[
                styles.completionCardValue,
                workProductReviewed ? styles.completionCheck : styles.completionFail,
              ]}
            >
              {workProductReviewed ? 'Approved' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Credential block */}
        <View style={styles.credentialBox}>
          <View>
            <Text style={styles.credentialLabel}>Credential Earned</Text>
            <Text style={styles.credentialValue}>AiBI-P</Text>
            <Text style={styles.credentialSub}>Banking AI Practitioner  ·  The AI Banking Institute</Text>
          </View>
          <View>
            <Text style={[styles.credentialLabel, { textAlign: 'right' }]}>Enrollment ID</Text>
            <Text
              style={{
                fontFamily: 'Courier',
                fontSize: 7.5,
                color: MUTED,
                textAlign: 'right',
              }}
            >
              {enrollmentId}
            </Text>
          </View>
        </View>

        {/* Verification URL */}
        <View>
          <Text style={styles.verifyLabel}>Credential Verification</Text>
          <Text style={styles.verifyUrl}>{verificationUrl}</Text>
        </View>

        <Text style={styles.noteText}>
          This report was generated by The AI Banking Institute upon course completion. The
          credential display format for sharing is: AiBI-P · The AI Banking Institute.
          Verification of credential issuance is available at the URL above.
        </Text>
      </View>

      <PageFooter pageNum={5} total={5} />
    </Page>
  );
}

// ── Document root ────────────────────────────────────────────────────────────

export function TransformationReportDocument(props: TransformationReportProps) {
  return (
    <Document
      title={`AiBI-P Transformation Report — ${props.learnerName} — The AI Banking Institute`}
      author="The AI Banking Institute"
      subject="AiBI-P Banking AI Practitioner Transformation Report"
    >
      <CoverPage
        learnerName={props.learnerName}
        institution={props.institution}
        reportDate={props.reportDate}
      />
      <AssessmentPage
        preScore={props.preScore}
        postScore={props.postScore}
        preTierLabel={props.preTierLabel}
        postTierLabel={props.postTierLabel}
        dimensions={props.dimensions}
      />
      <SkillsPage skills={props.skills} />
      <ImpactPage
        totalAnnualHoursSaved={props.totalAnnualHoursSaved}
        workflowsAutomated={props.workflowsAutomated}
        quickWins={props.quickWins}
      />
      <CompletionPage
        modulesCompleted={props.modulesCompleted}
        totalModules={props.totalModules}
        workProductSubmitted={props.workProductSubmitted}
        workProductReviewed={props.workProductReviewed}
        verificationUrl={props.verificationUrl}
        enrollmentId={props.enrollmentId}
      />
    </Document>
  );
}
