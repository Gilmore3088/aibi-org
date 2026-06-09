// StarterArtifactDocument — React-PDF document for the post-assessment
// starter artifacts (content/assessments/v2/starter-artifacts.ts).
//
// Rendered server-side via @react-pdf/renderer renderToBuffer(), the same way
// SkillTemplateLibraryDocument is. These artifacts ship as markdown bodies, so
// this file carries a small, purpose-built markdown→PDF renderer covering the
// syntax those bodies actually use: ## headings, paragraphs, ordered and
// unordered lists, multi-line > blockquotes, inline **bold** and `code`.
//
// Brand system: mockup tokens — ink (#071A2F), gold (#C8A24A), cream (#F7F3EA).
// Must NOT be imported in Client Components — the PDF renderer is server-only.

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const INK = '#071A2F';
const GOLD = '#C8A24A';
const CREAM = '#F7F3EA';
const WHITE = '#ffffff';
const SLATE = '#475569';
const BORDER = '#E2E8F0';

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: INK,
    paddingBottom: 56,
    lineHeight: 1.5,
  },
  header: {
    backgroundColor: INK,
    paddingVertical: 28,
    paddingHorizontal: 40,
  },
  seal: {
    fontSize: 8,
    color: GOLD,
    letterSpacing: 2,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  headerKicker: {
    fontSize: 7,
    color: CREAM,
    opacity: 0.7,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 19,
    color: WHITE,
    marginBottom: 6,
    lineHeight: 1.25,
  },
  headerSubtitle: {
    fontSize: 9.5,
    color: CREAM,
    opacity: 0.9,
  },
  body: {
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  h2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: INK,
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    color: INK,
    marginBottom: 8,
  },
  listRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingRight: 8,
  },
  listMarker: {
    width: 18,
    fontSize: 10,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
  },
  listText: {
    flex: 1,
    fontSize: 10,
    color: INK,
  },
  quote: {
    backgroundColor: CREAM,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    padding: 12,
    marginVertical: 10,
  },
  quoteText: {
    fontSize: 9.5,
    color: INK,
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: CREAM,
    color: INK,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
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
  footerText: {
    fontSize: 7.5,
    color: SLATE,
  },
});

// ── Inline renderer: **bold** and `code` ──────────────────────────────────
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Split on **bold** or `code`, keeping the delimiters via capture groups.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={key} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Text key={key} style={styles.code}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={key}>{part}</Text>;
  });
}

// ── Block renderer ────────────────────────────────────────────────────────
function renderBody(markdown: string): React.ReactNode[] {
  // Drop a leading "# Title" line — the title already lives in the header band.
  const lines = markdown.replace(/^#\s+.*\n?/, '').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line — skip.
    if (line.trim() === '') {
      i++;
      continue;
    }

    // ## heading
    if (line.startsWith('## ')) {
      blocks.push(
        <Text key={`b${key++}`} style={styles.h2}>
          {line.slice(3).trim()}
        </Text>,
      );
      i++;
      continue;
    }

    // > blockquote (collect consecutive > lines, joining wrapped text)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, '').trim());
        i++;
      }
      blocks.push(
        <View key={`b${key++}`} style={styles.quote} wrap={false}>
          <Text style={styles.quoteText}>
            {renderInline(quoteLines.join(' ').trim(), `q${key}`)}
          </Text>
        </View>,
      );
      continue;
    }

    // Ordered / unordered list (collect consecutive items; indented
    // continuation lines fold into the current item).
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (olMatch || ulMatch) {
      while (i < lines.length) {
        const l = lines[i];
        const ol = l.match(/^(\d+)\.\s+(.*)$/);
        const ul = l.match(/^[-*]\s+(.*)$/);
        if (!ol && !ul) break; // continuations are folded into each item below
        const marker = ol ? `${ol[1]}.` : '•';
        const content = ol ? ol[2] : ul![1];
        // Fold following indented continuation lines into this item.
        let text = content;
        i++;
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          !/^(\d+)\.\s+/.test(lines[i]) &&
          !/^[-*]\s+/.test(lines[i]) &&
          !lines[i].startsWith('## ') &&
          !lines[i].startsWith('>')
        ) {
          text += ' ' + lines[i].trim();
          i++;
        }
        blocks.push(
          <View key={`b${key++}`} style={styles.listRow} wrap={false}>
            <Text style={styles.listMarker}>{marker}</Text>
            <Text style={styles.listText}>{renderInline(text, `li${key}`)}</Text>
          </View>,
        );
      }
      continue;
    }

    // Paragraph — collect consecutive plain lines until a blank/special line.
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('## ') &&
      !lines[i].startsWith('>') &&
      !/^(\d+)\.\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <Text key={`b${key++}`} style={styles.paragraph}>
        {renderInline(paraLines.join(' '), `p${key}`)}
      </Text>,
    );
  }

  return blocks;
}

export interface StarterArtifactDocumentProps {
  readonly title: string;
  readonly subtitle: string;
  readonly body: string;
}

export function StarterArtifactDocument({
  title,
  subtitle,
  body,
}: StarterArtifactDocumentProps): React.ReactElement {
  return (
    <Document title={title} author="The AI Banking Institute">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.seal}>THE AI BANKING INSTITUTE</Text>
          <Text style={styles.headerKicker}>STARTER ARTIFACT · AI READINESS ASSESSMENT</Text>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.body}>{renderBody(body)}</View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            © 2026 The AI Banking Institute · For internal use at your institution.
          </Text>
          <Link style={styles.footerText} src="https://aibankinginstitute.com">
            AIBankingInstitute.com
          </Link>
        </View>
      </Page>
    </Document>
  );
}
