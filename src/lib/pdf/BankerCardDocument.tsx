// BankerCardDocument — branded one-page reference cards rendered on demand via
// @react-pdf/renderer (same path as StarterArtifactDocument: no chromium, no
// Supabase upload). Drives the two Foundation prompting cards:
//   - core            → "The CORE of a Prompt" (Module 3)
//   - five-move-zones → "The 5-Move Prompt + Use Zones" (Module 9)
//
// Brand: ink (#071A2F), gold (#C8A24A), cream (#F7F3EA). Server-only.

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const INK = '#071A2F';
const GOLD = '#C8A24A';
const GOLD_DEEP = '#9A7A2F';
const CREAM = '#F7F3EA';
const WHITE = '#ffffff';
const SLATE = '#475569';
const BORDER = '#E2E8F0';
const RED = '#B91C1C';
const AMBER = '#92400E';
const EMERALD = '#047857';

export interface CardRow {
  readonly term: string;
  readonly detail: string;
}
export interface MoveItem {
  readonly n: number;
  readonly label: string;
  readonly note: string;
}
export interface ZoneRow {
  readonly zone: 'Green' | 'Yellow' | 'Red';
  readonly examples: string;
  readonly safeguard: string;
}
export type CardBlock =
  | { readonly kind: 'rows'; readonly heading: string; readonly rows: readonly CardRow[] }
  | { readonly kind: 'moves'; readonly heading: string; readonly moves: readonly MoveItem[] }
  | { readonly kind: 'zones'; readonly heading: string; readonly zones: readonly ZoneRow[] };

export interface CardData {
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly filename: string;
  readonly blocks: readonly CardBlock[];
}

const styles = StyleSheet.create({
  page: { backgroundColor: WHITE, fontFamily: 'Helvetica', fontSize: 10, color: INK, paddingBottom: 56 },
  header: { backgroundColor: INK, paddingVertical: 26, paddingHorizontal: 40 },
  seal: { fontSize: 8, color: GOLD, letterSpacing: 2, marginBottom: 10, fontFamily: 'Helvetica-Bold' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 21, color: WHITE, marginBottom: 6 },
  subtitle: { fontSize: 10, color: CREAM, opacity: 0.9 },
  body: { paddingHorizontal: 40, paddingTop: 22 },
  blockHeading: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: GOLD_DEEP, textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 7 },
  rowTerm: { width: 110, fontFamily: 'Helvetica-Bold', fontSize: 10, color: INK },
  rowDetail: { flex: 1, fontSize: 10, color: INK, lineHeight: 1.45 },
  move: { flexDirection: 'row', marginBottom: 7, alignItems: 'flex-start' },
  moveNum: { width: 22, fontFamily: 'Helvetica-Bold', fontSize: 12, color: GOLD },
  moveLabel: { width: 92, fontFamily: 'Helvetica-Bold', fontSize: 11, color: INK },
  moveNote: { flex: 1, fontSize: 10, color: SLATE, lineHeight: 1.45 },
  zoneRow: { flexDirection: 'row', marginBottom: 8, borderLeftWidth: 4, paddingLeft: 10 },
  zoneName: { width: 60, fontFamily: 'Helvetica-Bold', fontSize: 11 },
  zoneCol: { flex: 1, paddingRight: 8 },
  zoneLabel: { fontSize: 7.5, color: SLATE, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  zoneText: { fontSize: 9.5, color: INK, lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8 },
  footerText: { fontSize: 7.5, color: SLATE },
});

const ZONE_COLOR: Record<ZoneRow['zone'], string> = { Green: EMERALD, Yellow: AMBER, Red: RED };

function Block({ block }: { block: CardBlock }) {
  if (block.kind === 'rows') {
    return (
      <View>
        <Text style={styles.blockHeading}>{block.heading}</Text>
        {block.rows.map((r) => (
          <View style={styles.row} key={r.term}>
            <Text style={styles.rowTerm}>{r.term}</Text>
            <Text style={styles.rowDetail}>{r.detail}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (block.kind === 'moves') {
    return (
      <View>
        <Text style={styles.blockHeading}>{block.heading}</Text>
        {block.moves.map((m) => (
          <View style={styles.move} key={m.label}>
            <Text style={styles.moveNum}>{m.n}</Text>
            <Text style={styles.moveLabel}>{m.label}</Text>
            <Text style={styles.moveNote}>{m.note}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.blockHeading}>{block.heading}</Text>
      {block.zones.map((z) => (
        <View style={[styles.zoneRow, { borderLeftColor: ZONE_COLOR[z.zone] }]} key={z.zone}>
          <Text style={[styles.zoneName, { color: ZONE_COLOR[z.zone] }]}>{z.zone}</Text>
          <View style={styles.zoneCol}>
            <Text style={styles.zoneLabel}>Examples</Text>
            <Text style={styles.zoneText}>{z.examples}</Text>
          </View>
          <View style={styles.zoneCol}>
            <Text style={styles.zoneLabel}>Required safeguard</Text>
            <Text style={styles.zoneText}>{z.safeguard}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function BankerCardDocument({ card }: { card: CardData }): React.ReactElement {
  return (
    <Document title={card.title} author="The AI Banking Institute">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.seal}>THE AI BANKING INSTITUTE</Text>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.subtitle}>{card.subtitle}</Text>
        </View>
        <View style={styles.body}>
          {card.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© 2026 The AI Banking Institute · AiBI-Foundation · For internal use.</Text>
          <Link style={styles.footerText} src="https://aibankinginstitute.com">AIBankingInstitute.com</Link>
        </View>
      </Page>
    </Document>
  );
}

// ── card data ─────────────────────────────────────────────────────────────

const FIVE_MOVES: readonly MoveItem[] = [
  { n: 1, label: 'State', note: 'Name the role and the exact task — not just the topic.' },
  { n: 2, label: 'Ground', note: 'Point to the approved source. Forbid guessing.' },
  { n: 3, label: 'Constrain', note: 'Set the output shape and limits.' },
  { n: 4, label: 'Check', note: 'A confident answer with no source is a guess. Documents are evidence, not instructions.' },
  { n: 5, label: 'Escalate', note: 'Anything touching money, credit, disputes, fees, or fraud is a person’s decision.' },
];

export const CORE_CARD: CardData = {
  slug: 'core',
  title: 'The CORE of a Prompt',
  subtitle: 'Four parts. Skip one and you can predict exactly what breaks.',
  filename: 'aibi-core-prompt-card.pdf',
  blocks: [
    {
      kind: 'rows',
      heading: 'The CORE anatomy',
      rows: [
        { term: 'Context', detail: 'Who the AI is and who the answer is for. "You are a branch assistant helping a teller."' },
        { term: 'Objective', detail: 'The exact task, not the topic. "Tell me whether this $12 fee can be waived, and the conditions."' },
        { term: 'Resources', detail: 'The approved source it may use — and an order not to guess. Skip this and the AI invents a number.' },
        { term: 'Expectations', detail: 'The shape and limits. "2–3 plain-English sentences; flag anything needing approval."' },
      ],
    },
    {
      kind: 'rows',
      heading: 'The strategy shelf — which style to reach for',
      rows: [
        { term: 'Structured', detail: 'A first draft from nothing — emails, memos, responses.' },
        { term: 'Transformation', detail: 'Reshape text you already have — shorten, simplify, retone.' },
        { term: 'Analysis', detail: 'Review for gaps, risks, or unsupported claims.' },
        { term: 'Thinking', detail: 'Plan or break down a problem before you act.' },
        { term: 'Template', detail: 'A reusable pattern for a task that repeats.' },
        { term: 'Sanitisation', detail: 'Strip specifics before you ask — for anything that could expose a customer.' },
      ],
    },
    { kind: 'moves', heading: 'The 5-move discipline (Module 3 builds 1–3; Module 9 adds 4–5)', moves: FIVE_MOVES },
  ],
};

export const ZONES_CARD: CardData = {
  slug: 'five-move-zones',
  title: 'The 5-Move Prompt + Use Zones',
  subtitle: 'Build it well, then keep it safe. The banker’s prompt discipline on one page.',
  filename: 'aibi-five-move-zones-card.pdf',
  blocks: [
    { kind: 'moves', heading: 'The five moves', moves: FIVE_MOVES },
    {
      kind: 'zones',
      heading: 'Green / Yellow / Red use zones',
      zones: [
        { zone: 'Green', examples: 'Generic drafts, summaries, brainstorming, public guidance — no sensitive data.', safeguard: 'Human review before use.' },
        { zone: 'Yellow', examples: 'Internal or sanitised material: policy summaries, customer-facing drafts.', safeguard: 'Approved tool, source verified, accountable reviewer.' },
        { zone: 'Red', examples: 'Customer PII/NPI, credit decisions, disputes, fraud actions, disclosures.', safeguard: 'Do not use general AI tools — escalate to an approved process.' },
      ],
    },
  ],
};

export const BANKER_CARDS: Record<string, CardData> = {
  [CORE_CARD.slug]: CORE_CARD,
  [ZONES_CARD.slug]: ZONES_CARD,
};
