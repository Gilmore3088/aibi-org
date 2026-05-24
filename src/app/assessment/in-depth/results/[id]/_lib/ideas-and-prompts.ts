// Audit A6 (2026-05-24): the In-Depth product markets four deliverables —
// scorecard, deep dives, action register, AND ideas+prompts. The first
// three shipped; this module is the fourth.
//
// The free-flow surface gets ONE starter artifact for its top-gap
// dimension (StarterArtifactCard.tsx). The paid surface gets THREE
// artifacts (one per lowest dimension) and the editorial Briefing
// shows the two highest-signal blocks of each: the "Three things you
// can do this week" ordered list, and the starter prompt blockquote.
//
// Why extract rather than re-author: the source markdown in
// content/assessments/v2/starter-artifacts.ts is already banker-tested
// for the free flow. Extraction keeps the two surfaces in sync; the
// editorial chapter cherry-picks the parts that earn space in a
// long-form ledger document.

import {
  getStarterArtifact,
  type StarterArtifact,
} from '@content/assessments/v2/starter-artifacts';
import type { Dimension } from '@content/assessments/v2/types';
import type { DimRow } from './derive';

export interface IdeasAndPromptsCard {
  readonly dimension: Dimension;
  readonly dimCode: string;
  readonly dimLabel: string;
  readonly pct: number;
  readonly artifactTitle: string;
  readonly artifactSubtitle: string;
  readonly thisWeek: readonly string[]; // 2–4 action items pulled from the body
  readonly starterPrompt: string;        // the > blockquote, prose-joined
  readonly filename: string;
}

// ── Markdown extractors (intentionally narrow) ──────────────────────────────
//
// These do NOT replace a full markdown parser. The starter-artifacts.ts
// bodies are author-controlled and follow a consistent shape; a few
// targeted regexes are safer and faster than pulling in a parser.

function extractThisWeek(body: string): readonly string[] {
  // The "## Three things you can do this week" section is an ordered
  // list. Capture text from the heading down to the next blank line +
  // heading. Then strip `N. ` prefixes and **bold** markdown.
  const sectionMatch = body.match(
    /## Three things you can do this week[\s\S]*?\n((?:\d+\.[\s\S]+?)(?=\n##|$))/,
  );
  if (!sectionMatch) return [];
  const block = sectionMatch[1];
  // Split on numeric list markers at line start.
  const items = block
    .split(/\n(?=\d+\.\s)/)
    .map((s) => s.replace(/^\d+\.\s+/, '').trim())
    .filter((s) => s.length > 0)
    // Collapse multi-line items to a single paragraph.
    .map((s) => s.replace(/\s+/g, ' '))
    // Strip leading **Bold preamble.** if present — the Briefing card has
    // its own typographic emphasis; the bold preamble is for the free
    // flow's plain-markdown render.
    .map((s) => s.replace(/^\*\*([^*]+)\*\*\s*/, '$1 '));
  return items.slice(0, 4);
}

function extractStarterPrompt(body: string): string {
  // The "## A starter prompt" section is a blockquote. Capture lines
  // that begin with `> ` and trim the marker.
  const idx = body.search(/## A starter prompt[^\n]*\n/);
  if (idx === -1) return '';
  const after = body.slice(idx);
  const lines = after.split('\n');
  const quoted: string[] = [];
  let inQuote = false;
  for (const ln of lines) {
    if (ln.startsWith('> ')) {
      inQuote = true;
      quoted.push(ln.slice(2));
    } else if (ln.startsWith('>')) {
      inQuote = true;
      quoted.push(ln.slice(1));
    } else if (inQuote && ln.trim() === '') {
      // soft-wrap inside the quote
      quoted.push('');
    } else if (inQuote) {
      // First non-quoted, non-blank line after we started collecting → stop.
      break;
    }
  }
  return quoted.join(' ').replace(/\s+/g, ' ').trim();
}

export function buildIdeaCard(row: DimRow): IdeasAndPromptsCard {
  const artifact: StarterArtifact = getStarterArtifact(row.id);
  return {
    dimension: row.id,
    dimCode: row.code,
    dimLabel: row.label,
    pct: row.pct,
    artifactTitle: artifact.title,
    artifactSubtitle: artifact.subtitle,
    thisWeek: extractThisWeek(artifact.body),
    starterPrompt: extractStarterPrompt(artifact.body),
    filename: artifact.filename,
  };
}

export function selectIdeasAndPromptsRows(
  rows: readonly DimRow[],
): readonly IdeasAndPromptsCard[] {
  // Three lowest-scoring dimensions, in ascending order (worst first).
  // These are the dimensions where the user will get the most leverage
  // from a Monday-morning starter prompt.
  const sorted = [...rows].sort((a, b) => a.pct - b.pct).slice(0, 3);
  return sorted.map(buildIdeaCard);
}
