// Homepage ticker content — sourced statistics, regulatory references, and
// platform updates that rotate beneath the SiteNav on /.
//
// Every `stat` and `cite` item MUST have a `source` field — per CLAUDE.md
// "No unsourced statistic in any user-facing copy." Verify sources against
// `CLAUDE.md` § Sourced Statistics before adding new entries.
//
// To add an item:
//   1. Pick a type (stat | regulation | update | cite | standard).
//   2. Keep `text` under ~90 chars so it doesn't wrap awkwardly on mobile.
//   3. For `stat` or `cite`: include `source` with publisher + year.
//   4. Optionally set `expiresAt` for time-bounded news.
//
// To pause an item: comment it out or set `expiresAt` in the past.

import type { TickerItem } from '@/types/ticker';

export const TICKER_ITEMS: readonly TickerItem[] = [
  {
    id: '2026-05-fdic-efficiency-community',
    type: 'stat',
    text: 'Community bank median efficiency ratio: 65%.',
    source: 'FDIC CEIC data, 1992–2025',
    publishedAt: '2026-05-18',
  },
  {
    id: '2026-05-fdic-efficiency-industry',
    type: 'stat',
    text: 'Industry-wide efficiency ratio: 55.7%.',
    source: 'FDIC Quarterly Banking Profile, Q4 2024',
    publishedAt: '2026-05-18',
  },
  {
    id: '2026-05-bank-director-budget',
    type: 'stat',
    text: '66% of banks are discussing AI budget allocations this year.',
    source: 'Bank Director 2024 Technology Survey, via Jack Henry',
    publishedAt: '2026-05-18',
  },
  {
    id: '2026-05-gartner-skills',
    type: 'stat',
    text: '57% of financial institutions report struggling with AI skill gaps.',
    source: 'Gartner Peer Community, via Jack Henry',
    publishedAt: '2026-05-18',
  },
  {
    id: '2026-05-gartner-governance',
    type: 'stat',
    text: '55% of FIs have no AI governance framework yet.',
    source: 'Gartner, via Jack Henry',
    publishedAt: '2026-05-18',
  },
  {
    id: '2026-05-personetics-switch',
    type: 'stat',
    text: '84% of consumers would switch institutions for AI-driven financial insights.',
    source: 'Personetics 2025, via Apiture',
    publishedAt: '2026-05-18',
  },
  {
    id: '2026-05-sr-11-7',
    type: 'regulation',
    text: 'SR 11-7 governs model risk management for banks using AI.',
    publishedAt: '2026-05-18',
  },
  {
    id: '2026-05-aieog-lexicon',
    type: 'cite',
    text: 'The AIEOG AI Lexicon defines hallucination, governance, explainability, and HITL.',
    source: 'US Treasury · FBIIC · FSSCC, Feb 2026',
    publishedAt: '2026-05-18',
  },
] as const;

/**
 * Filter expired items at render time so a passed `expiresAt` automatically
 * drops the row. The hosting Ticker component calls this.
 */
export function getActiveTickerItems(now: Date = new Date()): readonly TickerItem[] {
  const nowMs = now.getTime();
  return TICKER_ITEMS.filter((item) => {
    if (!item.expiresAt) return true;
    return new Date(item.expiresAt).getTime() > nowMs;
  });
}
