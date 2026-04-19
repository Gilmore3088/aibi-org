// CertificateDocument — React PDF component for the AiBI-P certificate.
// Rendered server-side via @react-pdf/renderer renderToBuffer().
// Must NOT be imported in Client Components — PDF renderer is server-only.
//
// Typography per CERT-02 (non-negotiable):
//   Recipient name: Cormorant Bold, 28pt
//   Designation:    Cormorant Bold uppercase + letterSpacing, 18pt
//   Institution:    Cormorant Bold uppercase + letterSpacing, 14pt
//   Date issued:    DM Mono, 12pt
//   Certificate ID: DM Mono, 10pt
//   Verify URL:     DM Mono, 10pt
//   Assessment note: Cormorant Italic, 10pt
//   AiBI seal watermark: 8% opacity text-based seal (no image dependency)

import React from 'react';
import path from 'node:path';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register brand fonts once at module load (safe at module scope for Next.js serverless).
Font.register({
  family: 'Cormorant',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/Cormorant-Regular.ttf') },
    { src: path.join(process.cwd(), 'public/fonts/Cormorant-Bold.ttf'), fontWeight: 'bold' },
    { src: path.join(process.cwd(), 'public/fonts/Cormorant-Italic.ttf'), fontStyle: 'italic' },
    {
      src: path.join(process.cwd(), 'public/fonts/Cormorant-BoldItalic.ttf'),
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});
Font.register({
  family: 'DM Mono',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/DMMono-Regular.ttf') },
  ],
});

export interface CertificateDocumentProps {
  readonly holderName: string;
  readonly designation: string;
  readonly issuingInstitution: string;
  readonly issuedDate: string;
  readonly certificateId: string;
  readonly verificationUrl: string;
}

// Brand constants (CLAUDE.md — never hardcode hex, but react-pdf requires literals)
const TERRA = '#b5512e';
const TERRA_BORDER = 'rgba(154,64,40,0.2)';
const TERRA_BORDER_INNER = 'rgba(154,64,40,0.1)';
const PARCH = '#f5f0e6';
const INK = '#1e1a14';
const PRIMARY = '#9a4028';
const MUTED = '#8a7060';

const styles = StyleSheet.create({
  page: {
    backgroundColor: PARCH,
    fontFamily: 'Cormorant',
    color: INK,
    padding: 0,
  },

  // Outer border container
  outerBorder: {
    margin: 24,
    flex: 1,
    border: '1px solid rgba(154,64,40,0.2)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
  },

  // Inner border rule (inset 4px from outer)
  innerBorder: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    border: '0.5px solid rgba(154,64,40,0.1)',
  },

  // AiBI seal watermark — centered, 8% opacity
  sealWatermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.08,
  },
  sealWatermarkCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealWatermarkInnerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  sealWatermarkText: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 72,
    color: INK,
    letterSpacing: 4,
  },
  sealWatermarkSubtext: {
    fontFamily: 'Cormorant',
    fontSize: 14,
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 4,
  },

  // Header section
  header: {
    alignItems: 'center',
    marginTop: 8,
  },
  presentsText: {
    fontFamily: 'Cormorant',
    fontStyle: 'italic',
    fontSize: 14,
    color: PRIMARY,
    marginBottom: 8,
  },
  certificateTitle: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 36,
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 12,
  },
  divider: {
    width: 120,
    height: 1,
    backgroundColor: TERRA,
    opacity: 0.4,
  },

  // Recipient section
  recipient: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  honorsText: {
    fontFamily: 'Cormorant',
    fontStyle: 'italic',
    fontSize: 12,
    color: MUTED,
    marginBottom: 12,
  },
  holderName: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 28,
    color: PRIMARY,
    marginBottom: 14,
    textAlign: 'center',
  },
  curriculumLabel: {
    fontFamily: 'Cormorant',
    fontSize: 9,
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  designation: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 18,
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  institution: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 14,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 6,
    textAlign: 'center',
  },

  // Bottom three-column section
  bottomSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  // Left: metadata
  metadataColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
  },
  metadataItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: TERRA_BORDER,
    paddingBottom: 4,
    marginBottom: 2,
  },
  metadataLabel: {
    fontFamily: 'Cormorant',
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  metadataDate: {
    fontFamily: 'DM Mono',
    fontSize: 12,
    color: INK,
  },
  metadataCertId: {
    fontFamily: 'DM Mono',
    fontSize: 10,
    color: INK,
  },

  // Center: seal
  sealColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: TERRA_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInnerCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: TERRA_BORDER_INNER,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  sealText: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
    color: PRIMARY,
  },
  sealSubtext: {
    fontFamily: 'Cormorant',
    fontSize: 6,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },

  // Right: signature
  signatureColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  signatureBlock: {
    alignItems: 'flex-end',
    maxWidth: 160,
  },
  signatureName: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 16,
    color: INK,
    marginBottom: 4,
    textAlign: 'right',
  },
  signatureLine: {
    width: 160,
    height: 0.5,
    backgroundColor: INK,
    marginBottom: 4,
    opacity: 0.4,
  },
  signatureTitle: {
    fontFamily: 'Cormorant',
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'right',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 56,
    right: 56,
    alignItems: 'center',
  },
  footerVerifyUrl: {
    fontFamily: 'DM Mono',
    fontSize: 10,
    color: MUTED,
    opacity: 0.7,
    textAlign: 'center',
  },
  assessmentNote: {
    fontFamily: 'Cormorant',
    fontStyle: 'italic',
    fontSize: 10,
    color: MUTED,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
  },
});

export function CertificateDocument({
  holderName,
  designation,
  issuingInstitution,
  issuedDate,
  certificateId,
  verificationUrl,
}: CertificateDocumentProps) {
  return (
    <Document title={`Certificate of Achievement — ${holderName} — The AI Banking Institute`}>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          {/* Inner ruling border */}
          <View style={styles.innerBorder} />

          {/* AiBI seal watermark — 8% opacity, centered behind content */}
          <View style={styles.sealWatermark}>
            <View style={styles.sealWatermarkCircle}>
              <View style={styles.sealWatermarkInnerCircle}>
                <Text style={styles.sealWatermarkText}>AiBI</Text>
                <Text style={styles.sealWatermarkSubtext}>Institutional</Text>
              </View>
            </View>
          </View>

          {/* Institutional header */}
          <View style={styles.header}>
            <Text style={styles.presentsText}>AI Banking Institute Presents</Text>
            <Text style={styles.certificateTitle}>Certificate of Achievement</Text>
            <View style={styles.divider} />
          </View>

          {/* Recipient section */}
          <View style={styles.recipient}>
            <Text style={styles.honorsText}>
              This honors the distinguished performance of
            </Text>
            <Text style={styles.holderName}>{holderName}</Text>
            <Text style={styles.curriculumLabel}>
              For completing the specialized curriculum of
            </Text>
            <Text style={styles.designation}>{designation}</Text>
            <Text style={styles.institution}>{issuingInstitution}</Text>
          </View>

          {/* Bottom: metadata | seal | signature */}
          <View style={styles.bottomSection}>
            {/* Left — Issue Date + Certificate ID */}
            <View style={styles.metadataColumn}>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Issue Date</Text>
                <Text style={styles.metadataDate}>{issuedDate}</Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Certificate ID</Text>
                <Text style={styles.metadataCertId}>{certificateId}</Text>
              </View>
            </View>

            {/* Center — AiBI seal */}
            <View style={styles.sealColumn}>
              <View style={styles.sealCircle}>
                <View style={styles.sealInnerCircle}>
                  <Text style={styles.sealText}>AiBI</Text>
                  <Text style={styles.sealSubtext}>Institutional</Text>
                </View>
              </View>
            </View>

            {/* Right — Signature */}
            <View style={styles.signatureColumn}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureName}>The Digital Curator</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureTitle}>
                  The Digital Curator, AI Banking Institute
                </Text>
              </View>
            </View>
          </View>

          {/* Footer — verification URL + assessment note */}
          <View style={styles.footer}>
            <Text style={styles.footerVerifyUrl}>{verificationUrl}</Text>
            <Text style={styles.assessmentNote}>
              Assessed by skill submission and work product -- not a test score
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
