// generate-template-pdfs.ts — render the resource templates to branded,
// vector PDFs via @react-pdf/renderer (no browser, no page-print).
//
// This REPLACES the old page-print generator that screenshotted the
// /resources/templates/[slug] marketing pages into rasterized PDFs. Content is
// sourced from the canonical registry in src/app/resources/templates/data.ts,
// so the PDF and the on-site/Word versions can never drift.
//
// Typography: Cormorant (headings), DM Sans (body), DM Mono (meta) — brand v1.
// Run:  npx tsx scripts/generate-template-pdfs.ts  (or: npm run generate:templates)

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import { TEMPLATES, type Template, type TemplateSection } from '../src/app/resources/templates/data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'downloads');
const FONTS_DIR = join(ROOT, 'assets', 'pdf-fonts');

// Templates that ship as their own branded template-<slug>.pdf. The sixth
// registry entry (ai-use-case-inventory) ships as artifact-ai-use-case-inventory
// .pdf via the artifact generator, so it is intentionally excluded here.
const TEMPLATE_PDF_SLUGS = [
  'ai-use-policy-starter',
  'ai-workflow-sop',
  'board-briefing-checklist',
  'cdfi-grant-ai-evidence-checklist',
  'gtm-plan',
] as const;

mkdirSync(OUT_DIR, { recursive: true });
Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: 'Cormorant',
  fonts: [
    { src: join(FONTS_DIR, 'Cormorant-Variable.ttf'), fontWeight: 400 },
    { src: join(FONTS_DIR, 'Cormorant-Variable.ttf'), fontWeight: 700 },
  ],
});
Font.register({ family: 'CormorantSC', fonts: [{ src: join(FONTS_DIR, 'CormorantSC-Bold.ttf'), fontWeight: 700 }] });
Font.register({
  family: 'DMSans',
  fonts: [
    { src: join(FONTS_DIR, 'DMSans-Variable.ttf'), fontWeight: 400 },
    { src: join(FONTS_DIR, 'DMSans-Variable.ttf'), fontWeight: 700 },
  ],
});
Font.register({ family: 'DMMono', fonts: [{ src: join(FONTS_DIR, 'DMMono-Regular.ttf'), fontWeight: 400 }] });

// Brand v1 palette
const INK = '#071A2F';
const INK_2 = '#0B2745';
const TERRA = '#C8A24A';
const TERRA_PALE = '#E6D39B';
const PARCH = '#F7F3EA';
const WHITE = '#ffffff';
const BORDER = '#E2E8F0';
const INK_MID = '#475569';
const ERROR_RED = '#B42318';

const VERSION = 'v1.0';
const VERSION_DATE = 'June 2026';
const el = React.createElement;

const s = StyleSheet.create({
  coverPage: { backgroundColor: INK, color: WHITE, fontFamily: 'DMSans', fontSize: 9 },
  coverBand: {
    backgroundColor: INK_2, paddingVertical: 12, paddingHorizontal: 44,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  coverBandLabel: { fontFamily: 'CormorantSC', fontSize: 7.5, color: WHITE, opacity: 0.7, letterSpacing: 1.6 },
  coverBandVersion: { fontFamily: 'DMMono', fontSize: 7, color: WHITE, opacity: 0.55 },
  coverBody: { flex: 1, paddingHorizontal: 44, paddingTop: 54, paddingBottom: 44, justifyContent: 'space-between' },
  coverKicker: { fontFamily: 'CormorantSC', fontSize: 8, color: TERRA_PALE, letterSpacing: 1.8, marginBottom: 18 },
  coverTitle: { fontFamily: 'Cormorant', fontSize: 40, color: WHITE, lineHeight: 1.05, letterSpacing: -0.5, marginBottom: 14 },
  coverDek: { fontFamily: 'DMSans', fontSize: 12, color: WHITE, opacity: 0.82, lineHeight: 1.55, maxWidth: 410, marginBottom: 26 },
  metaRow: { flexDirection: 'row', marginBottom: 30, gap: 28 },
  metaItem: {},
  metaLabel: { fontFamily: 'CormorantSC', fontSize: 7, color: TERRA_PALE, letterSpacing: 1.2, marginBottom: 3 },
  metaValue: { fontFamily: 'DMSans', fontSize: 9.5, color: WHITE, opacity: 0.92 },
  tocHeader: { fontFamily: 'CormorantSC', fontSize: 7.5, color: WHITE, opacity: 0.5, letterSpacing: 1.4, marginBottom: 11 },
  tocRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  tocNum: { fontFamily: 'DMMono', fontSize: 7.5, color: TERRA_PALE, width: 20 },
  tocText: { fontFamily: 'DMSans', fontSize: 9, color: WHITE, opacity: 0.85, flex: 1 },
  coverFootRule: { borderTopWidth: 1, borderTopColor: WHITE, opacity: 0.15 },
  coverFoot: { paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  coverFootText: { fontFamily: 'DMMono', fontSize: 7, color: WHITE, opacity: 0.5 },

  page: { backgroundColor: PARCH, color: INK, fontFamily: 'DMSans', fontSize: 9, paddingBottom: 46 },
  watermark: {
    backgroundColor: '#EEF2F6', paddingVertical: 5, paddingHorizontal: 40,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  watermarkText: { fontFamily: 'CormorantSC', fontSize: 6.5, color: INK_2, opacity: 0.6, letterSpacing: 1.1 },
  body: { paddingHorizontal: 40, paddingTop: 20 },

  sectionWrap: { marginBottom: 16 },
  sectionNum: { fontFamily: 'DMMono', fontSize: 7.5, color: TERRA, letterSpacing: 1, marginBottom: 3 },
  sectionHeading: { fontFamily: 'Cormorant', fontSize: 17, color: INK, marginBottom: 5, lineHeight: 1.1 },
  intro: { fontFamily: 'DMSans', fontSize: 9, color: INK_MID, lineHeight: 1.55, marginBottom: 6 },
  bulletRow: { flexDirection: 'row', marginBottom: 4, paddingRight: 6 },
  bulletDot: { fontFamily: 'DMSans', fontSize: 9, color: TERRA, width: 12, marginTop: 0.5 },
  stepNum: { fontFamily: 'DMMono', fontSize: 8, color: TERRA, width: 16, marginTop: 1 },
  itemText: { fontFamily: 'DMSans', fontSize: 9, color: INK, lineHeight: 1.5, flex: 1 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: BORDER, marginVertical: 14 },
  tableWrap: { borderWidth: 0.5, borderColor: BORDER, marginTop: 6, marginBottom: 7 },
  tableCaption: { fontFamily: 'DMSans', fontSize: 7.5, fontWeight: 700, color: INK_2, marginBottom: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableRowLast: { flexDirection: 'row' },
  tableHeaderCell: { flex: 1, backgroundColor: '#EEF2F6', padding: '5 6' },
  tableCell: { flex: 1, padding: '5 6' },
  tableHeaderText: { fontFamily: 'DMSans', fontSize: 7.2, fontWeight: 700, color: INK_2, lineHeight: 1.35 },
  tableCellText: { fontFamily: 'DMSans', fontSize: 7.2, color: INK, lineHeight: 1.35 },

  sourceBox: { borderLeftWidth: 3, borderLeftColor: INK_2, backgroundColor: '#EEF2F6', padding: '9 12', marginTop: 6 },
  sourceLabel: { fontFamily: 'DMSans', fontSize: 7.5, fontWeight: 700, color: INK_2, marginBottom: 3 },
  sourceItem: { fontFamily: 'DMSans', fontSize: 8, color: INK, lineHeight: 1.5 },
  warnBox: { borderLeftWidth: 3, borderLeftColor: TERRA, backgroundColor: 'rgba(200,162,74,0.08)', padding: '9 12', marginTop: 10 },
  warnLabel: { fontFamily: 'DMSans', fontSize: 7.5, fontWeight: 700, color: '#8A6D1F', marginBottom: 3 },
  warnText: { fontFamily: 'DMSans', fontSize: 8, color: INK, lineHeight: 1.5 },

  footer: {
    position: 'absolute', bottom: 16, left: 40, right: 40,
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 0.75, borderTopColor: BORDER, paddingTop: 5,
  },
  footerText: { fontFamily: 'DMMono', fontSize: 6.5, color: INK, opacity: 0.45 },
});

function SectionBlock(section: TemplateSection, index: number) {
  const children: React.ReactNode[] = [
    el(Text, { style: s.sectionNum, key: 'n' }, `SECTION ${String(index + 1).padStart(2, '0')}`),
    el(Text, { style: s.sectionHeading, key: 'h' }, section.heading),
  ];
  if (section.intro) children.push(el(Text, { style: s.intro, key: 'i' }, section.intro));
  (section.items ?? []).forEach((item, i) =>
    children.push(
      el(View, { style: s.bulletRow, key: `b${i}`, wrap: false },
        el(Text, { style: s.bulletDot }, '-'),
        el(Text, { style: s.itemText }, item),
      ),
    ),
  );
  (section.steps ?? []).forEach((step, i) =>
    children.push(
      el(View, { style: s.bulletRow, key: `s${i}`, wrap: false },
        el(Text, { style: s.stepNum }, `${i + 1}.`),
        el(Text, { style: s.itemText }, step),
      ),
    ),
  );
  (section.tables ?? []).forEach((table, tableIndex) => {
    if (table.caption) {
      children.push(el(Text, { style: s.tableCaption, key: `tc${tableIndex}` }, table.caption));
    }
    children.push(
      el(View, { style: s.tableWrap, key: `t${tableIndex}` },
        el(View, { style: s.tableRow, wrap: false },
          ...table.headers.map((header, headerIndex) =>
            el(View, { style: s.tableHeaderCell, key: `h${headerIndex}` },
              el(Text, { style: s.tableHeaderText }, header),
            ),
          ),
        ),
        ...table.rows.map((row, rowIndex) =>
          el(View, {
            style: rowIndex === table.rows.length - 1 ? s.tableRowLast : s.tableRow,
            key: `r${rowIndex}`,
            wrap: false,
          },
            ...row.map((cell, cellIndex) =>
              el(View, { style: s.tableCell, key: `c${cellIndex}` },
                el(Text, { style: s.tableCellText }, cell),
              ),
            ),
          ),
        ),
      ),
    );
  });
  return el(View, { style: s.sectionWrap, key: index, wrap: false }, ...children);
}

function Footer(title: string) {
  return el(View, { style: s.footer, fixed: true },
    el(Text, { style: s.footerText }, `${title}  |  The AI Banking Institute`),
    el(Text, {
      style: s.footerText,
      render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
        `${VERSION} — ${VERSION_DATE}  |  Page ${pageNumber} of ${totalPages}`,
    }),
  );
}

function TemplateDocument(t: Template) {
  return el(Document, { title: `${t.title} — The AI Banking Institute`, author: 'The AI Banking Institute', subject: t.dek },
    // Cover
    el(Page, { size: 'LETTER', style: s.coverPage },
      el(View, { style: s.coverBand },
        el(Text, { style: s.coverBandLabel }, 'THE AI BANKING INSTITUTE  ·  TEMPLATE'),
        el(Text, { style: s.coverBandVersion }, `${VERSION} — ${VERSION_DATE}`),
      ),
      el(View, { style: s.coverBody },
        el(View, null,
          el(Text, { style: s.coverKicker }, 'STARTER TEMPLATE  ·  ADAPT BEFORE ADOPTION'),
          el(Text, { style: s.coverTitle }, t.title),
          el(Text, { style: s.coverDek }, t.dek),
          el(View, { style: s.metaRow },
            el(View, { style: s.metaItem }, el(Text, { style: s.metaLabel }, 'WHO IT IS FOR'), el(Text, { style: s.metaValue }, t.audience)),
            el(View, { style: s.metaItem }, el(Text, { style: s.metaLabel }, 'FILL TIME'), el(Text, { style: s.metaValue }, `${t.readMinutes} min`)),
          ),
          el(Text, { style: s.tocHeader }, "WHAT'S INSIDE"),
          ...t.sections.map((sec, i) =>
            el(View, { style: s.tocRow, key: i },
              el(Text, { style: s.tocNum }, String(i + 1).padStart(2, '0')),
              el(Text, { style: s.tocText }, sec.heading),
            ),
          ),
        ),
        el(View, null,
          el(View, { style: s.coverFootRule }),
          el(View, { style: s.coverFoot },
            el(Text, { style: s.coverFootText }, 'Not legal advice. Adapt to your institution and route through compliance.'),
            el(Text, { style: s.coverFootText }, 'AIBankingInstitute.com'),
          ),
        ),
      ),
    ),
    // Content
    el(Page, { size: 'LETTER', style: s.page },
      el(View, { style: s.watermark, fixed: true },
        el(Text, { style: s.watermarkText }, 'THE AI BANKING INSTITUTE'),
        el(Text, { style: s.watermarkText }, `${t.title.toUpperCase()}  ·  STARTER TEMPLATE`),
      ),
      el(View, { style: s.body },
        ...t.sections.map((sec, i) => SectionBlock(sec, i)),
        el(View, { style: s.divider }),
        el(View, { style: s.sourceBox },
          el(Text, { style: s.sourceLabel }, 'SOURCE BASIS'),
          ...t.sourcedFrom.map((src, i) => el(Text, { style: s.sourceItem, key: i }, `· ${src}`)),
        ),
        el(View, { style: s.warnBox },
          el(Text, { style: s.warnLabel }, 'ADAPT BEFORE ADOPTION'),
          el(Text, { style: s.warnText },
            'This is a starter template, not legal advice or an examiner-approved policy. ' +
            'Replace every [bracketed] placeholder, align the language with your institution’s ' +
            'policies, and route the final document through compliance, risk, and legal review.'),
        ),
      ),
      Footer(t.title),
    ),
  );
}

async function main() {
  const bySlug = new Map(TEMPLATES.map((t) => [t.slug, t]));
  console.log(`▸ rendering ${TEMPLATE_PDF_SLUGS.length} template PDF(s) via @react-pdf\n`);
  for (const slug of TEMPLATE_PDF_SLUGS) {
    const template = bySlug.get(slug);
    if (!template) throw new Error(`Template content missing for slug: ${slug}`);
    const buffer = await renderToBuffer(TemplateDocument(template));
    const out = join(OUT_DIR, `template-${slug}.pdf`);
    writeFileSync(out, buffer);
    console.log(`  ✓ template-${slug}.pdf  (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
  console.log('\n✓ done');
}

main().catch((err) => {
  console.error('Template PDF generation failed:', err);
  process.exit(1);
});
