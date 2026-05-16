import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { AIBI_SAFETY_NOTE, PROMPT_CARDS } from '@/content/prompt-cards/cards';

const PDF_FILENAME = 'AiBI-Prompt-Cards.pdf';

const styles = StyleSheet.create({
  page: { padding: 42, fontFamily: 'Helvetica', fontSize: 9, color: '#0E1B2D' },
  eyebrow: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 1.4, color: '#B5862A', marginBottom: 8 },
  title: { fontSize: 26, marginBottom: 8 },
  body: { fontSize: 10, lineHeight: 1.45, color: '#1F2A3F', marginBottom: 12 },
  sectionTitle: { fontSize: 14, marginTop: 14, marginBottom: 8, color: '#0E1B2D' },
  card: { borderTop: '1 solid #D5D1C2', paddingTop: 8, marginTop: 8 },
  cardTitle: { fontSize: 12, color: '#0E1B2D', marginBottom: 3 },
  meta: { fontSize: 8, color: '#5C6B82', marginBottom: 5 },
  prompt: { fontSize: 8, lineHeight: 1.35, backgroundColor: '#F4F1E7', padding: 7, marginTop: 5 },
});

function PromptCardsPdf() {
  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'LETTER', style: styles.page },
      React.createElement(Text, { style: styles.eyebrow }, 'The AI Banking Institute'),
      React.createElement(Text, { style: styles.title }, 'AiBI Prompt Cards'),
      React.createElement(
        Text,
        { style: styles.body },
        'Structured AI workflows for banking professionals. Use these cards to frame better inputs, generate clearer outputs, and review AI-assisted work before use.',
      ),
      React.createElement(Text, { style: styles.sectionTitle }, 'How to use these cards'),
      React.createElement(
        Text,
        { style: styles.body },
        '1. Choose the workflow. 2. Fill in only non-confidential inputs. 3. Copy the structured prompt into your approved AI tool. 4. Review the output before using it.',
      ),
      React.createElement(Text, { style: styles.sectionTitle }, 'Safety reminder'),
      React.createElement(Text, { style: styles.body }, AIBI_SAFETY_NOTE),
      React.createElement(Text, { style: styles.sectionTitle }, 'Cards'),
      ...PROMPT_CARDS.map((card) =>
        React.createElement(
          View,
          { key: card.id, style: styles.card, wrap: false },
          React.createElement(Text, { style: styles.cardTitle }, card.title),
          React.createElement(Text, { style: styles.meta }, `${card.category} | ${card.difficulty}`),
          React.createElement(Text, { style: styles.body }, card.description),
          React.createElement(Text, { style: styles.prompt }, card.promptTemplate),
        ),
      ),
      React.createElement(Text, { style: styles.sectionTitle }, 'Ready for the full AiBI Method?'),
      React.createElement(
        Text,
        { style: styles.body },
        'Continue with AiBI Foundations and the paid Toolbox to build, test, save, and export durable banking AI skills.',
      ),
    ),
  );
}

export async function GET(): Promise<Response> {
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

