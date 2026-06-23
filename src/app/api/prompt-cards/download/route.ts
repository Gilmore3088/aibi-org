import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { Document, Page, StyleSheet, Text, View, Link, renderToBuffer } from '@react-pdf/renderer';
import { AIBI_SAFETY_NOTE, PROMPT_CARDS } from '@/content/prompt-cards/cards';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

const PDF_FILENAME = 'AiBI-Prompt-Cards.pdf';

// Mockup brand tokens — match the other branded PDFs (StarterArtifactDocument,
// CertificateDocument): ink #071A2F, gold #C8A24A, cream #F7F3EA.
const INK = '#071A2F';
const GOLD = '#C8A24A';
const CREAM = '#F7F3EA';
const WHITE = '#ffffff';
const SLATE = '#475569';
const BORDER = '#E2E8F0';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: INK, paddingBottom: 56, lineHeight: 1.45 },
  header: { backgroundColor: INK, paddingVertical: 28, paddingHorizontal: 40 },
  seal: { fontSize: 8, color: GOLD, letterSpacing: 2, marginBottom: 10, fontFamily: 'Helvetica-Bold' },
  headerKicker: { fontSize: 7, color: CREAM, opacity: 0.7, letterSpacing: 1.5, marginBottom: 6 },
  headerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 22, color: WHITE, marginBottom: 6, lineHeight: 1.25 },
  headerSubtitle: { fontSize: 9.5, color: CREAM, opacity: 0.9, maxWidth: 360 },
  body: { paddingHorizontal: 40, paddingTop: 24 },
  bodyText: { fontSize: 10, lineHeight: 1.45, color: INK, marginBottom: 12 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 13, marginTop: 14, marginBottom: 8, color: INK },
  card: { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8, marginTop: 8 },
  cardTitle: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: INK, marginBottom: 3 },
  meta: { fontSize: 8, color: SLATE, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.6 },
  cardBody: { fontSize: 9.5, lineHeight: 1.4, color: INK, marginBottom: 6 },
  prompt: { fontSize: 8, lineHeight: 1.35, backgroundColor: CREAM, borderLeftWidth: 3, borderLeftColor: GOLD, padding: 8, marginTop: 4 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: SLATE },
});

function PromptCardsPdf() {
  return React.createElement(
    Document,
    { title: 'AiBI Prompt Cards', author: 'The AI Banking Institute' },
    React.createElement(
      Page,
      { size: 'LETTER', style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.seal }, 'THE AI BANKING INSTITUTE'),
        React.createElement(Text, { style: styles.headerKicker }, 'PROMPT CARDS · BANKING AI WORKFLOWS'),
        React.createElement(Text, { style: styles.headerTitle }, 'AiBI Prompt Cards'),
        React.createElement(
          Text,
          { style: styles.headerSubtitle },
          'Structured AI workflows for banking professionals.',
        ),
      ),
      React.createElement(
        View,
        { style: styles.body },
        React.createElement(
          Text,
          { style: styles.bodyText },
          'Use these cards to frame better inputs, generate clearer outputs, and review AI-assisted work before use.',
        ),
        React.createElement(Text, { style: styles.sectionTitle }, 'How to use these cards'),
        React.createElement(
          Text,
          { style: styles.bodyText },
          '1. Choose the workflow. 2. Fill in only non-confidential inputs. 3. Copy the structured prompt into your approved AI tool. 4. Review the output before using it.',
        ),
        React.createElement(Text, { style: styles.sectionTitle }, 'Safety reminder'),
        React.createElement(Text, { style: styles.bodyText }, AIBI_SAFETY_NOTE),
        React.createElement(Text, { style: styles.sectionTitle }, 'Cards'),
        ...PROMPT_CARDS.map((card) =>
          React.createElement(
            View,
            { key: card.id, style: styles.card, wrap: false },
            React.createElement(Text, { style: styles.cardTitle }, card.title),
            React.createElement(Text, { style: styles.meta }, `${card.category} · ${card.difficulty}`),
            React.createElement(Text, { style: styles.cardBody }, card.description),
            React.createElement(Text, { style: styles.prompt }, card.promptTemplate),
          ),
        ),
        React.createElement(Text, { style: styles.sectionTitle }, 'Ready for the full AiBI Method?'),
        React.createElement(
          Text,
          { style: styles.bodyText },
          'Continue with AiBI-Foundation and the paid Toolbox to build, test, save, and export durable banking AI skills.',
        ),
      ),
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(
          Text,
          { style: styles.footerText },
          '© 2026 The AI Banking Institute · For internal use at your institution.',
        ),
        React.createElement(
          Link,
          { style: styles.footerText, src: 'https://aibankinginstitute.com' },
          'AIBankingInstitute.com',
        ),
      ),
    ),
  );
}

export async function GET(request: Request): Promise<Response> {
  // PDF generation is expensive; throttle to discourage scrape-abuse.
  // The PDF is the same for every caller (static content) so a generous
  // per-IP cap is fine.
  const limited = await rateLimitOrFail({
    key: 'prompt-cards-download',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 20,
    windowSeconds: 3600,
  });
  if (limited) return limited as unknown as Response;

  try {
    const element = React.createElement(PromptCardsPdf) as React.ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(element);
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[prompt-cards/download] PDF generation failed:', error);
    return new Response(JSON.stringify({ error: 'PDF generation failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

