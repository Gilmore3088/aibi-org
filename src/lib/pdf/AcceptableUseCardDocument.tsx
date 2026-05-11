// AcceptableUseCardDocument — React PDF document component for the Acceptable Use Card artifact.
// Rendered server-side via @react-pdf/renderer renderToBuffer().
// Brand system: terracotta (#b5512e), parchment (#f5f0e6), ink (#1e1a14).
// Must NOT be imported in Client Components — PDF renderer is server-only.

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface AcceptableUseCardProps {
  readonly roleContext: string;
  readonly primaryAiTool: string;
  readonly highestRiskScenario: string;
  readonly quickWinUseCase: string;
  readonly generatedDate: string;
}

// Brand constants
const TERRA = '#b5512e';
const PARCH = '#f5f0e6';
const INK = '#1e1a14';
const SAGE = '#4a6741';
const ERROR_RED = '#9b2226';
const WHITE = '#ffffff';
const BORDER = '#d9cfc0';

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
    paddingVertical: 20,
    paddingHorizontal: 36,
    marginBottom: 0,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
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
    paddingTop: 22,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: TERRA,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 9.5,
    color: INK,
    lineHeight: 1.5,
    padding: '7 10',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 1,
  },
  warningBox: {
    borderLeftWidth: 4,
    borderLeftColor: ERROR_RED,
    padding: '8 10',
    backgroundColor: 'rgba(155,34,38,0.05)',
    marginBottom: 3,
  },
  warningLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: ERROR_RED,
    marginBottom: 3,
  },
  warningText: {
    fontSize: 8.5,
    color: INK,
    lineHeight: 1.5,
  },
  safeBox: {
    borderLeftWidth: 4,
    borderLeftColor: SAGE,
    padding: '8 10',
    backgroundColor: 'rgba(74,103,65,0.05)',
  },
  safeLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: SAGE,
    marginBottom: 3,
  },
  tierBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  tierHeader: {
    backgroundColor: TERRA,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tierHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tierRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tierRowLast: {
    flexDirection: 'row',
  },
  tierCell: {
    flex: 1,
    padding: '6 10',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  tierCellLast: {
    flex: 2,
    padding: '6 10',
  },
  tierLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: INK,
    marginBottom: 2,
  },
  tierValue: {
    fontSize: 7.5,
    color: INK,
    opacity: 0.75,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: INK,
    opacity: 0.5,
  },
  workstationNote: {
    fontSize: 7.5,
    color: INK,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 14,
  },
});

export function AcceptableUseCardDocument({
  roleContext,
  primaryAiTool,
  highestRiskScenario,
  quickWinUseCase,
  generatedDate,
}: AcceptableUseCardProps) {
  return (
    <Document title="Acceptable Use Card — The AI Banking Institute">
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Acceptable Use Card</Text>
          <Text style={styles.headerSubtitle}>
            The AI Banking Institute  |  AiBI-Foundation — AiBI-Foundation
          </Text>
        </View>

        <View style={styles.body}>
          {/* Section 1 — Role */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your Role</Text>
            <Text style={styles.sectionContent}>{roleContext}</Text>
          </View>

          {/* Section 2 — Authorized Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Authorized AI Tools</Text>
            <Text style={styles.sectionContent}>{primaryAiTool}</Text>
          </View>

          {/* Section 3 — Stop: Highest-Risk Scenario */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>STOP: Your Highest-Risk Scenario</Text>
            <View style={styles.warningBox}>
              <Text style={styles.warningLabel}>Highest-Risk Scenario Identified</Text>
              <Text style={styles.warningText}>{highestRiskScenario}</Text>
              <Text
                style={{
                  fontSize: 8,
                  color: ERROR_RED,
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                Before using AI in this context, confirm: Is this data Tier 1 (Public), Tier 2
                (Internal Only), or Tier 3 (Restricted)?{'\n'}If Tier 3: DO NOT proceed.
              </Text>
            </View>
          </View>

          {/* Section 4 — Start Here: Safe Use Case */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>START HERE: Your Safe Use Case</Text>
            <View style={styles.safeBox}>
              <Text style={styles.safeLabel}>Recommended Starting Use Case</Text>
              <Text style={{ fontSize: 8.5, color: INK, lineHeight: 1.5 }}>{quickWinUseCase}</Text>
            </View>
          </View>

          {/* Section 5 — Three-Tier Quick Reference */}
          <View style={styles.tierBox}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierHeaderText}>Quick Reference: Three-Tier Data Classification</Text>
            </View>
            <View style={styles.tierRow}>
              <View style={styles.tierCell}>
                <Text style={styles.tierLabel}>Tier 1 — Public</Text>
                <Text style={styles.tierValue}>Any AI tool permitted</Text>
              </View>
              <View style={styles.tierCell}>
                <Text style={styles.tierLabel}>Tier 2 — Internal Only</Text>
                <Text style={styles.tierValue}>Enterprise-licensed tools only</Text>
              </View>
              <View style={styles.tierCellLast}>
                <Text style={[styles.tierLabel, { color: ERROR_RED }]}>
                  Tier 3 — Restricted
                </Text>
                <Text style={styles.tierValue}>PROHIBITED in AI tools</Text>
              </View>
            </View>
          </View>

          <Text style={styles.workstationNote}>
            This card is personalized to your role. Keep at your workstation.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated {generatedDate}  |  AIBankingInstitute.com</Text>
          <Text style={styles.footerText}>The AI Banking Institute</Text>
        </View>
      </Page>
    </Document>
  );
}
