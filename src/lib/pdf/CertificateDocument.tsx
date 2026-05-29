// CertificateDocument — React PDF component for the AiBI-Foundation certificate.
// Rendered server-side via @react-pdf/renderer renderToBuffer().
// Must NOT be imported in Client Components — PDF renderer is server-only.
//
// Ported to mockup design system 2026-05-27. Brand v1 (2026-05-28).
// Visual alignment with the on-screen certificate
// (src/app/courses/foundation/program/certificate/page.tsx):
//   - Cream page background (#F7F3EA), navy ink (#071A2F)
//   - Navy rounded-square containing the bracketed [Ai] mark (brand v1)
//   - "AiBI-Foundation · The AI Banking Institute" credential format
//   - Gold hairline accent under the recipient name
//   - Cormorant retained for the recipient name + "Certificate of Completion"
//     header (institutional gravitas on the printed page) AND for the
//     italic "i" glyph in the brand mark (Cormorant Italic is already
//     registered; Instrument Serif is not embedded for PDF to keep
//     server-side rendering cheap — Cormorant Italic carries the same
//     optical role).
//   - DM Mono for labels, metadata, and footer.

import React from 'react';
import path from 'node:path';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Cormorant',
  fonts: [
    { src: path.join(process.cwd(), 'assets/pdf-fonts/Cormorant-Regular.ttf') },
    { src: path.join(process.cwd(), 'assets/pdf-fonts/Cormorant-Bold.ttf'), fontWeight: 'bold' },
    { src: path.join(process.cwd(), 'assets/pdf-fonts/Cormorant-Italic.ttf'), fontStyle: 'italic' },
    {
      src: path.join(process.cwd(), 'assets/pdf-fonts/Cormorant-BoldItalic.ttf'),
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});
Font.register({
  family: 'DM Mono',
  fonts: [
    { src: path.join(process.cwd(), 'assets/pdf-fonts/DMMono-Regular.ttf') },
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

// Mockup brand colors — react-pdf requires literal hex.
const INK = '#071A2F';
const INK_A10 = 'rgba(7, 26, 47, 0.10)';
const INK_A15 = 'rgba(7, 26, 47, 0.15)';
const CREAM = '#F7F3EA';
const GOLD = '#C8A24A';
const GOLD_DEEP = '#9A7A2F';
const SLATE_500 = '#64748B';
const SLATE_600 = '#475569';

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    color: INK,
    padding: 0,
    fontFamily: 'DM Mono',
  },

  outerBorder: {
    margin: 28,
    flex: 1,
    border: `1px solid ${INK_A10}`,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 40,
  },

  innerBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    border: `0.5px solid ${INK_A10}`,
  },

  header: {
    alignItems: 'center',
    marginTop: 4,
  },

  sealOuter: {
    width: 72,
    height: 72,
    backgroundColor: INK,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  kicker: {
    fontFamily: 'DM Mono',
    fontSize: 10,
    color: GOLD_DEEP,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
  },
  certificateTitle: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 32,
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 14,
    textAlign: 'center',
  },
  divider: {
    width: 96,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.6,
  },

  recipient: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  honorsText: {
    fontFamily: 'DM Mono',
    fontSize: 11,
    color: SLATE_600,
    marginBottom: 12,
  },
  holderName: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 36,
    color: INK,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  curriculumLabel: {
    fontFamily: 'DM Mono',
    fontSize: 10,
    color: SLATE_600,
    marginBottom: 8,
  },
  designation: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 22,
    color: INK,
    textAlign: 'center',
    letterSpacing: 1,
  },
  institution: {
    fontFamily: 'DM Mono',
    fontSize: 11,
    color: SLATE_600,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },

  bottomSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: INK_A10,
    paddingTop: 20,
  },

  metadataColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
  },
  metadataItem: {
    marginBottom: 4,
  },
  metadataLabel: {
    fontFamily: 'DM Mono',
    fontSize: 7,
    color: SLATE_500,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 3,
  },
  metadataDate: {
    fontFamily: 'DM Mono',
    fontSize: 11,
    color: INK,
  },
  metadataCertId: {
    fontFamily: 'DM Mono',
    fontSize: 9,
    color: INK,
    letterSpacing: 0.5,
  },

  sealColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealColumnSquare: {
    width: 44,
    height: 44,
    backgroundColor: INK,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signatureColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  signatureBlock: {
    alignItems: 'flex-end',
    maxWidth: 180,
  },
  signatureName: {
    fontFamily: 'Cormorant',
    fontWeight: 'bold',
    fontSize: 16,
    color: INK,
    marginBottom: 4,
    textAlign: 'right',
  },
  signatureLine: {
    width: 160,
    height: 0.5,
    backgroundColor: INK_A15,
    marginBottom: 4,
  },
  signatureTitle: {
    fontFamily: 'DM Mono',
    fontSize: 7,
    color: SLATE_500,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'right',
  },

  footer: {
    position: 'absolute',
    bottom: 16,
    left: 64,
    right: 64,
    alignItems: 'center',
  },
  footerVerifyUrl: {
    fontFamily: 'DM Mono',
    fontSize: 9,
    color: SLATE_500,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  assessmentNote: {
    fontFamily: 'DM Mono',
    fontSize: 8,
    color: SLATE_500,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});

// Brand v1 (2026-05-28) — the bracketed [Ai] mark inside a navy rounded
// square. Replaces the retired columned-landmark glyph. Cormorant Italic
// stands in for Instrument Serif on the "i" (font is already registered
// for the recipient name; same optical role).
function BracketMark({ size }: { size: number }) {
  // The mark sits centered inside the seal container. Heights are tuned
  // so the brackets, "A", and "i" share an optical baseline.
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ fontFamily: 'Cormorant', fontSize: size, color: GOLD }}>[</Text>
      <Text style={{ fontFamily: 'Cormorant', fontWeight: 'bold', fontSize: size, color: CREAM }}>
        A
      </Text>
      <Text
        style={{
          fontFamily: 'Cormorant',
          fontStyle: 'italic',
          fontSize: size * 1.12,
          color: CREAM,
        }}
      >
        i
      </Text>
      <Text style={{ fontFamily: 'Cormorant', fontSize: size, color: GOLD }}>]</Text>
    </View>
  );
}

export function CertificateDocument({
  holderName,
  designation,
  issuingInstitution,
  issuedDate,
  certificateId,
  verificationUrl,
}: CertificateDocumentProps) {
  const credentialLine = designation.includes('·')
    ? designation
    : `${designation} · ${issuingInstitution}`;

  return (
    <Document title={`Certificate of Completion — ${holderName} — The AI Banking Institute`}>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder} />

          {/* Header: seal + kicker + title + gold divider */}
          <View style={styles.header}>
            <View style={styles.sealOuter}>
              <BracketMark size={22} />
            </View>
            <Text style={styles.kicker}>The AI Banking Institute</Text>
            <Text style={styles.certificateTitle}>Certificate of Completion</Text>
            <View style={styles.divider} />
          </View>

          {/* Recipient */}
          <View style={styles.recipient}>
            <Text style={styles.honorsText}>This certifies that</Text>
            <Text style={styles.holderName}>{holderName}</Text>
            <Text style={styles.curriculumLabel}>has completed the curriculum of</Text>
            <Text style={styles.designation}>{credentialLine}</Text>
            {!designation.includes('·') && (
              <Text style={styles.institution}>· The AI Banking Institute ·</Text>
            )}
          </View>

          {/* Bottom: metadata | small seal | signature */}
          <View style={styles.bottomSection}>
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

            <View style={styles.sealColumn}>
              <View style={styles.sealColumnSquare}>
                <BracketMark size={14} />
              </View>
            </View>

            <View style={styles.signatureColumn}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureName}>The Digital Curator</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureTitle}>The AI Banking Institute</Text>
              </View>
            </View>
          </View>

          {/* Footer — verification URL + assessment note */}
          <View style={styles.footer}>
            <Text style={styles.footerVerifyUrl}>{verificationUrl}</Text>
            <Text style={styles.assessmentNote}>
              Assessed by skill submission and work product — not a test score
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
