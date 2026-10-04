// generate-prompt-cards-pdf — builds public/downloads/aibi-prompt-cards.pdf,
// the free download behind /prompt-cards (served by /api/prompt-cards/download).
// Content comes from src/content/prompt-cards/cards.ts, the same data the page
// renders, so the PDF and the page say the same thing. Layout matches the
// starter artifacts (scripts/generate-starter-artifacts.tsx).
// Run: npm run generate:prompt-cards [-- out.pdf]
//
// Run through the esbuild bundle in package.json, not plain tsx: @react-pdf's
// hyphenation package is ESM-only and this repo's scripts load as CommonJS.

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AIBI_SAFETY_NOTE, PROMPT_CARDS } from '../src/content/prompt-cards/cards';

const INK = '#071A2F';
const GOLD = '#C8A24A';
const CREAM = '#F7F3EA';
const WHITE = '#ffffff';
const SLATE = '#475569';
const BORDER = '#E2E8F0';

const styles = StyleSheet.create({
  page: { backgroundColor: WHITE, fontFamily: 'Helvetica', fontSize: 10, color: INK, paddingBottom: 56, lineHeight: 1.5 },
  header: { backgroundColor: INK, paddingVertical: 28, paddingHorizontal: 40 },
  seal: { fontSize: 8, color: GOLD, letterSpacing: 2, marginBottom: 10, fontFamily: 'Helvetica-Bold' },
  headerKicker: { fontSize: 7, color: CREAM, opacity: 0.7, letterSpacing: 1.5, marginBottom: 6 },
  headerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 19, color: WHITE, marginBottom: 6, lineHeight: 1.25 },
  headerSubtitle: { fontSize: 9.5, color: CREAM, opacity: 0.85 },
  body: { paddingHorizontal: 40, paddingTop: 24 },
  h2: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: INK, marginTop: 14, marginBottom: 6 },
  paragraph: { fontSize: 10, color: INK, marginBottom: 8 },
  card: { borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 10, marginTop: 6 },
  cardTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11.5, color: INK },
  cardMeta: { fontSize: 7, color: SLATE, letterSpacing: 0.8, marginBottom: 6 },
  template: { backgroundColor: CREAM, borderLeftWidth: 3, borderLeftColor: GOLD, padding: 10, marginTop: 4, marginBottom: 6 },
  templateText: { fontSize: 8, color: INK },
  footer: {
    position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: SLATE },
});

const HOW_TO_USE =
  '1. Choose the workflow. 2. Fill in only non-confidential inputs. 3. Copy the structured prompt into your approved AI tool. 4. Review the output before using it.';

function PromptCardsDocument() {
  return (
    <Document title="AiBI Prompt Cards" author="The AI Banking Institute">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.seal}>THE AI BANKING INSTITUTE</Text>
          <Text style={styles.headerKicker}>PROMPT CARDS · BANKING AI WORKFLOWS</Text>
          <Text style={styles.headerTitle}>AiBI Prompt Cards</Text>
          <Text style={styles.headerSubtitle}>Structured AI workflows for banking professionals.</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>
            Use these cards to frame better inputs, generate clearer outputs, and review AI-assisted work before use.
          </Text>
          <Text style={styles.h2}>How to use these cards</Text>
          <Text style={styles.paragraph}>{HOW_TO_USE}</Text>
          <Text style={styles.h2}>Safety reminder</Text>
          <Text style={styles.paragraph}>{AIBI_SAFETY_NOTE}</Text>
          <Text style={styles.h2}>Cards</Text>
          {PROMPT_CARDS.map((card) => (
            <View key={card.id} style={styles.card} wrap={false}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardMeta}>
                {card.category.toUpperCase()} · {card.difficulty.toUpperCase()}
              </Text>
              <Text style={styles.paragraph}>{card.description}</Text>
              <View style={styles.template}>
                <Text style={styles.templateText}>{card.promptTemplate}</Text>
              </View>
            </View>
          ))}
          <View style={styles.card} wrap={false}>
            <Text style={styles.h2}>Ready for the full AiBI Method?</Text>
            <Text style={styles.paragraph}>
              Continue with AiBI-Foundation and the paid Toolbox to build, test, save, and export durable banking AI skills.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© 2026 The AI Banking Institute · For internal use at your institution.</Text>
          <Link style={styles.footerText} src="https://aibankinginstitute.com">
            AIBankingInstitute.com
          </Link>
        </View>
      </Page>
    </Document>
  );
}

const out = resolve(process.cwd(), process.argv[2] ?? 'public/downloads/aibi-prompt-cards.pdf');
renderToBuffer(<PromptCardsDocument />).then((buf) => {
  writeFileSync(out, buf);
  console.log(`wrote ${out} (${buf.length.toLocaleString()}b)`);
});
