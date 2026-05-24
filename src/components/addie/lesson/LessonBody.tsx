// LessonBody — dependency-free markdown subset renderer for lesson
// bodies. Handles the editorial moves the seed bodies use:
//
//   - ## SCRIPT / ## SCRIPT (intro) / ## SCRIPT (verbatim) / ## SHARED INTRO
//     — these are *production scaffold* headings, not learner content.
//     The heading is stripped; the body underneath is rendered as the
//     primary narration.
//   - ## PRODUCTION blocks are stripped ENTIRELY. They contain shot
//     notes for the video team ("Cold open on a single dense card",
//     etc.) and have no business being shown to learners.
//   - Large blockquote runs (a full SCRIPT section is one big > block)
//     render as a hero narration with dropcap on the first paragraph
//     and a serif scale up, not a thin pull-quote rule.
//   - Standalone short blockquotes render as a small pull-quote.
//   - [tip] / [warn] / [save] / [field] callouts render as cards.

import type { ReactNode } from 'react';
import { slugifyHeading } from './lessonHeadings';

interface LessonBodyProps {
  readonly body: string;
}

export function LessonBody({ body }: LessonBodyProps) {
  if (!body) return null;
  const stripped = stripProductionBlocks(body.trim());
  const blocks = splitBlocks(stripped);
  return (
    <article className="prose-lesson max-w-[68ch] font-serif text-[var(--ledger-ink)] text-[1.0625rem] leading-[1.75]">
      {blocks.map((b, i) => renderBlock(b, i))}
    </article>
  );
}

// --- Preprocess -----------------------------------------------------
// Production-meta strip + script-heading transparency.

function stripProductionBlocks(src: string): string {
  // Walk line by line. Drop everything from a `## PRODUCTION` heading
  // through end-of-doc or the next `## ` heading. Drop the SCRIPT
  // headings themselves but keep their content.
  const SKIP_TITLES = /^##\s+(SCRIPT(\s*\([^)]*\))?|SHARED\s+INTRO)\s*$/i;
  const PRODUCTION = /^##\s+PRODUCTION\s*$/i;
  const ANY_H2 = /^##\s+/;
  const out: string[] = [];
  const lines = src.split(/\n/);
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (PRODUCTION.test(ln)) {
      // Skip until next H2 or end
      i++;
      while (i < lines.length && !ANY_H2.test(lines[i])) i++;
      continue;
    }
    if (SKIP_TITLES.test(ln)) {
      // Drop heading, keep body
      i++;
      continue;
    }
    out.push(ln);
    i++;
  }
  // Collapse 3+ blank lines to 2.
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// --- Block split ----------------------------------------------------

type CalloutKind = 'tip' | 'warn' | 'save' | 'field';
type CaseTone = 'good' | 'bad';

interface Scene {
  intro?: string;
  numeral?: string;
  lead?: string;
  body: string;
  conclusion?: boolean;
}

interface StatBlock {
  value: string;     // "65%"
  source: string;    // "FDIC Quarterly Banking Profile, Q4 2024"
  takeaway: string;  // single-line implication
}

interface CaseBlock {
  tone: CaseTone;    // good | bad
  title: string;     // headline
  body: string;      // narrative paragraph
  outcome: string;   // optional one-liner outcome (rendered as footer)
}

interface TableBlockRow {
  cells: string[];
}

type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string; isFirst?: boolean }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'hero_quote'; paras: string[] }
  | { kind: 'scene_set'; scenes: Scene[] }
  | { kind: 'callout'; tone: CalloutKind; lines: string[] }
  | { kind: 'stat'; data: StatBlock }
  | { kind: 'case_grid'; cases: CaseBlock[] }
  | { kind: 'table'; header: string[]; rows: TableBlockRow[] };

const CALLOUT_RE = /^>\s*\[(tip|warn|save|field)\]\s*(.*)$/i;
// [stat] value | source | takeaway. Pipe-delimited. Value goes huge, source
// is the mono-caps citation, takeaway is the editorial implication line.
const STAT_RE = /^>\s*\[stat\]\s*(.*)$/i;
// [case:good] Title here. The next > lines until [outcome] are the body;
// [outcome] is the closing one-liner that anchors the card.
const CASE_RE = /^>\s*\[case:(good|bad)\]\s*(.*)$/i;
const CASE_OUTCOME_RE = /^>\s*\[outcome\]\s*(.*)$/i;
const CALLOUT_META: Record<CalloutKind, { label: string; border: string; bg: string }> = {
  tip:   { label: 'Try this',       border: 'border-[var(--ledger-accent)]',   bg: 'bg-[color-mix(in_srgb,var(--ledger-accent)_6%,var(--ledger-paper))]' },
  warn:  { label: 'Watch out',      border: 'border-[var(--ledger-weak)]',     bg: 'bg-[color-mix(in_srgb,var(--ledger-weak)_5%,var(--ledger-paper))]' },
  save:  { label: 'Save this',      border: 'border-[var(--ledger-ink)]',      bg: 'bg-[var(--ledger-tape)]' },
  field: { label: 'From the field', border: 'border-[var(--ledger-accent-2)]', bg: 'bg-[color-mix(in_srgb,var(--ledger-accent-2)_4%,var(--ledger-paper))]' },
};

function splitBlocks(src: string): Block[] {
  const lines = src.split(/\n/);
  const out: Block[] = [];
  let i = 0;
  let sawFirstParagraph = false;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      out.push({ kind: 'h3', text: line.slice(4).trim() });
      sawFirstParagraph = false;
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const raw = line.slice(3).trim().replace(/\s*\(verbatim\)\s*$/i, '');
      out.push({ kind: 'h2', text: raw });
      sawFirstParagraph = false;
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      out.push({ kind: 'h2', text: line.slice(2).trim() });
      sawFirstParagraph = false;
      i++;
      continue;
    }
    if (line.startsWith('>')) {
      // Capture the full blockquote. End at the first BARE blank line —
      // that's how authors separate one block from the next. Paragraph
      // breaks INSIDE a quote use the canonical `>` empty marker
      // (a line that's just `>` or `> `), which still starts with `>`
      // and is preserved.
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        const stripped = lines[i].replace(/^>\s?/, '');
        buf.push(stripped);
        i++;
      }
      // Callout detection on the very first non-empty line.
      const firstNonEmpty = buf.find((x) => x.trim() !== '') ?? '';

      // [stat] — sourced statistic card. Pipe-delimited.
      const statM = STAT_RE.exec(`> ${firstNonEmpty}`);
      if (statM) {
        const parts = statM[1].split('|').map((s) => s.trim());
        out.push({
          kind: 'stat',
          data: {
            value: parts[0] ?? '',
            source: parts[1] ?? '',
            takeaway: parts[2] ?? '',
          },
        });
        continue;
      }

      // [case:good] / [case:bad] — case-study cards. Auto-grid: consecutive
      // case blocks in source order get grouped into a single grid block so
      // the renderer can lay them side-by-side instead of stacked.
      const caseM = CASE_RE.exec(`> ${firstNonEmpty}`);
      if (caseM) {
        const cases: CaseBlock[] = [parseCase(caseM, buf)];
        // Look ahead: if the next non-empty quote block is also [case:...],
        // pull it into the same grid. Repeat until the next block isn't a case.
        while (i < lines.length) {
          // Skip blank lines between cases.
          let j = i;
          while (j < lines.length && lines[j].trim() === '') j++;
          if (j >= lines.length || !lines[j].startsWith('>')) break;
          const peekBuf: string[] = [];
          let k = j;
          while (k < lines.length && lines[k].startsWith('>')) {
            peekBuf.push(lines[k].replace(/^>\s?/, ''));
            k++;
          }
          const peekFirst = peekBuf.find((x) => x.trim() !== '') ?? '';
          const peekCase = CASE_RE.exec(`> ${peekFirst}`);
          if (!peekCase) break;
          cases.push(parseCase(peekCase, peekBuf));
          i = k;
        }
        out.push({ kind: 'case_grid', cases });
        continue;
      }

      const m = CALLOUT_RE.exec(`> ${firstNonEmpty}`);
      if (m) {
        const tone = m[1].toLowerCase() as CalloutKind;
        const body0 = m[2];
        const cleaned: string[] = [];
        let started = false;
        for (const x of buf) {
          if (!started && x.trim() === firstNonEmpty.trim()) {
            if (body0) cleaned.push(body0);
            started = true;
            continue;
          }
          if (started) cleaned.push(x);
        }
        out.push({ kind: 'callout', tone, lines: collapseQuoteParas(cleaned) });
        continue;
      }
      const paras = collapseQuoteParas(buf);
      const total = paras.join(' ').length;
      // Scene detection: if the quote contains "One:" / "Two:" / "Three:"
      // bold leads, break it into numbered scene cards instead of one
      // continuous hero quote. This is the pattern most SCRIPT sections
      // follow (intro setup → 3 concepts → conclusion).
      const scenes = detectScenes(paras);
      if (scenes) {
        out.push({ kind: 'scene_set', scenes });
      } else if (paras.length >= 2 || total > 280) {
        out.push({ kind: 'hero_quote', paras });
      } else {
        out.push({ kind: 'quote', text: paras.join(' ') });
      }
      sawFirstParagraph = true;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, '').trim());
        i++;
      }
      out.push({ kind: 'ul', items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, '').trim());
        i++;
      }
      out.push({ kind: 'ol', items });
      continue;
    }
    // GitHub-flavoured pipe table: `| h1 | h2 |` then `|---|---|` then rows.
    // Detected as: current line starts and ends with `|` and the *next* line
    // is a separator (pipes + dashes only). Renders as a real <table>.
    // Added 2026-05-24 to support the M5.4 blast-radius matrix (F5 fix).
    if (
      line.trim().startsWith('|') &&
      line.trim().endsWith('|') &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-{2,}.*\|/.test(lines[i + 1])
    ) {
      const splitRow = (raw: string): string[] => {
        const trimmed = raw.trim().replace(/^\|/, '').replace(/\|$/, '');
        return trimmed.split('|').map((c) => c.trim());
      };
      const header = splitRow(line);
      const rows: TableBlockRow[] = [];
      i += 2; // skip the header and the separator
      while (
        i < lines.length &&
        lines[i].trim().startsWith('|') &&
        lines[i].trim().endsWith('|')
      ) {
        rows.push({ cells: splitRow(lines[i]) });
        i++;
      }
      out.push({ kind: 'table', header, rows });
      continue;
    }
    // Paragraph
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('###') &&
      !lines[i].startsWith('##') &&
      !lines[i].startsWith('# ') &&
      !lines[i].startsWith('>') &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    out.push({ kind: 'p', text: buf.join(' ').trim(), isFirst: !sawFirstParagraph });
    sawFirstParagraph = true;
  }
  return out;
}

// Scene detection — the narration shape we see in M1.1, M2 etc is:
//   intro paragraph(s)
//   "**One: <lead>.** <body>"
//   "**Two: <lead>.** <body>"
//   "**Three: <lead>.** <body>"
//   closing paragraph(s)
// If we see 2+ such numbered leads, render as a scene set.
const NUM_LEAD = /^\*\*(One|Two|Three|Four|Five|Six):\s*([^*]+?)\*\*\s*(.*)$/i;
const NUM_TO_ORDINAL: Record<string, string> = {
  one: '01', two: '02', three: '03', four: '04', five: '05', six: '06',
};

function detectScenes(paras: ReadonlyArray<string>): Scene[] | null {
  const numberedIdx: number[] = [];
  paras.forEach((p, i) => {
    if (NUM_LEAD.test(p)) numberedIdx.push(i);
  });
  if (numberedIdx.length < 2) return null;

  const scenes: Scene[] = [];
  const firstNumIdx = numberedIdx[0];
  if (firstNumIdx > 0) {
    scenes.push({ intro: paras.slice(0, firstNumIdx).join('\n\n'), body: '' });
  }
  for (let k = 0; k < numberedIdx.length; k++) {
    const start = numberedIdx[k];
    const end = k + 1 < numberedIdx.length ? numberedIdx[k + 1] : paras.length;
    const m = NUM_LEAD.exec(paras[start])!;
    const num = m[1].toLowerCase();
    const lead = m[2].trim();
    const tail = m[3].trim();
    const restParas = paras.slice(start + 1, end);
    const body = [tail, ...restParas].filter(Boolean).join('\n\n');
    scenes.push({
      numeral: NUM_TO_ORDINAL[num] ?? '',
      lead,
      body,
    });
  }
  // Trailing conclusion paragraph(s) after the last numbered block
  // are already included in the last scene's body via the slice above —
  // but if the closing paragraph clearly recaps ("Hold those three"),
  // promote it to a conclusion scene.
  const lastScene = scenes[scenes.length - 1];
  const recapMatch = lastScene.body.match(/\n\n(Hold those|Together|In short|Taken together)[^]*$/i);
  if (recapMatch) {
    lastScene.body = lastScene.body.slice(0, recapMatch.index).trim();
    scenes.push({
      conclusion: true,
      body: recapMatch[0].trim(),
    } as Scene);
  }
  return scenes;
}

function parseCase(match: RegExpExecArray, buf: string[]): CaseBlock {
  const tone = match[1].toLowerCase() as CaseTone;
  const title = match[2].trim();
  // Body = everything after the [case:...] line up to but not including [outcome].
  // Outcome = the trailing [outcome] line if present.
  const paras = collapseQuoteParas(buf);
  let outcome = '';
  const bodyParas: string[] = [];
  let started = false;
  for (const p of paras) {
    if (!started) {
      // First non-empty para is the [case:...] line itself; skip it.
      if (CASE_RE.test(`> ${p}`)) {
        started = true;
        continue;
      }
    }
    const oM = CASE_OUTCOME_RE.exec(`> ${p}`);
    if (oM) {
      outcome = oM[1].trim();
      continue;
    }
    bodyParas.push(p);
  }
  return {
    tone,
    title,
    body: bodyParas.join('\n\n').trim(),
    outcome,
  };
}

function collapseQuoteParas(buf: string[]): string[] {
  // Group consecutive non-empty lines into paragraphs.
  const out: string[] = [];
  let cur: string[] = [];
  for (const ln of buf) {
    if (ln.trim() === '') {
      if (cur.length > 0) {
        out.push(cur.join(' ').trim());
        cur = [];
      }
    } else {
      cur.push(ln);
    }
  }
  if (cur.length > 0) out.push(cur.join(' ').trim());
  return out.filter((p) => p.length > 0);
}

// --- Render ---------------------------------------------------------

function renderBlock(b: Block, key: number): ReactNode {
  switch (b.kind) {
    case 'h2':
      return (
        <div key={key} id={slugifyHeading(b.text)} className="mt-12 mb-5 flex items-center gap-4 scroll-mt-24">
          <span className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)]">§</span>
          <h2 className="font-serif text-[1.5rem] leading-tight text-[var(--ledger-ink)]">
            {renderInline(b.text)}
          </h2>
          <span className="flex-1 h-px bg-[var(--ledger-rule)]" aria-hidden />
        </div>
      );
    case 'h3':
      return (
        <h3
          key={key}
          id={slugifyHeading(b.text)}
          className="font-serif text-[1.25rem] leading-tight text-[var(--ledger-ink)] mt-9 mb-3 scroll-mt-24"
        >
          {renderInline(b.text)}
        </h3>
      );
    case 'p':
      if (b.isFirst) {
        return (
          <p
            key={key}
            className="mb-5 first-letter:font-serif first-letter:text-[3.5rem] first-letter:leading-[0.85] first-letter:font-semibold first-letter:float-left first-letter:pr-3 first-letter:pt-1 first-letter:text-[var(--ledger-accent)]"
          >
            {renderInline(b.text)}
          </p>
        );
      }
      return (
        <p key={key} className="mb-5">
          {renderInline(b.text)}
        </p>
      );
    case 'ul':
      return (
        <ul key={key} className="my-5 pl-6 list-disc marker:text-[var(--ledger-accent)] space-y-2">
          {b.items.map((it, j) => (
            <li key={j} className="pl-1">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="my-5 pl-6 list-decimal marker:text-[var(--ledger-accent)] marker:font-mono marker:font-semibold space-y-2">
          {b.items.map((it, j) => (
            <li key={j} className="pl-1">
              {renderInline(it)}
            </li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote
          key={key}
          className="my-6 border-l-2 border-[var(--ledger-accent)] pl-4 text-[var(--ledger-ink-2)] italic-off"
        >
          {renderInline(b.text)}
        </blockquote>
      );
    case 'hero_quote':
      // Calmer treatment: a single parchment block with a thin gold rule
      // on the left. No drop-cap, no giant quote glyph, no shadow — the
      // hero quote must share the same visual language as case_grid,
      // stat, and callout so the page reads as one document.
      return (
        <section
          key={key}
          className="my-8 border-l-2 border-[var(--ledger-accent)] bg-[var(--ledger-paper)] px-5 py-5 sm:px-6 sm:py-6 rounded-r-[3px]"
        >
          <div className="space-y-3 font-serif text-[1.05rem] leading-[1.65] text-[var(--ledger-ink)]">
            {b.paras.map((para, j) => (
              <p key={j}>{renderInline(para)}</p>
            ))}
          </div>
        </section>
      );
    case 'scene_set': {
      return (
        <div key={key} className="my-10 space-y-5">
          {b.scenes.map((s, j) => renderScene(s, j, b.scenes.length))}
        </div>
      );
    }
    case 'callout': {
      const m = CALLOUT_META[b.tone];
      return (
        <aside
          key={key}
          className={`my-6 rounded-[5px] border-l-[3px] ${m.border} ${m.bg} px-5 py-4`}
        >
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-muted)] mb-2">
            {m.label}
          </div>
          {b.lines.map((ln, j) => (
            <p key={j} className="text-[var(--ledger-ink)] mb-2 last:mb-0 font-serif">
              {renderInline(ln)}
            </p>
          ))}
        </aside>
      );
    }
    case 'stat': {
      // Sourced-statistic card. Big number in serif, source in mono caps,
      // takeaway in body serif. Single column always — these earn their
      // line break above and below.
      const { value, source, takeaway } = b.data;
      return (
        <aside
          key={key}
          className="my-8 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-8 gap-y-3 sm:items-center rounded-[6px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] px-6 py-6"
        >
          <div className="font-serif text-[3.25rem] sm:text-[3.75rem] leading-none text-[var(--ledger-ink)] tabular-nums">
            {value}
          </div>
          <div className="min-w-0">
            {takeaway ? (
              <p className="font-serif text-[1.0625rem] leading-snug text-[var(--ledger-ink)]">
                {renderInline(takeaway)}
              </p>
            ) : null}
            {source ? (
              <p className="mt-2 font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
                Source · {source}
              </p>
            ) : null}
          </div>
        </aside>
      );
    }
    case 'case_grid': {
      // 1, 2, or 3+ case-study cards laid out as a grid. Each card carries
      // a tone (good = ink, bad = oxblood) for the title rule + outcome
      // footer. Two-up on md, three-up on lg+ when the count allows.
      const n = b.cases.length;
      const colsClass =
        n === 1 ? 'grid-cols-1' :
        n === 2 ? 'sm:grid-cols-2' :
        'sm:grid-cols-2 lg:grid-cols-3';
      return (
        <div key={key} className={`my-8 grid ${colsClass} gap-4`}>
          {b.cases.map((c, j) => {
            const isGood = c.tone === 'good';
            const accentClass = isGood
              ? 'border-l-[3px] border-[var(--ledger-ink)]'
              : 'border-l-[3px] border-[var(--ledger-weak)]';
            const labelClass = isGood ? 'text-[var(--ledger-ink-2)]' : 'text-[var(--ledger-weak)]';
            const outcomeClass = isGood
              ? 'bg-[color-mix(in_srgb,var(--ledger-ink)_4%,var(--ledger-paper))] text-[var(--ledger-ink)]'
              : 'bg-[color-mix(in_srgb,var(--ledger-weak)_6%,var(--ledger-paper))] text-[var(--ledger-weak)]';
            return (
              <section
                key={j}
                className={`flex flex-col rounded-[5px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] ${accentClass}`}
              >
                <header className="px-5 pt-4 pb-2">
                  <div className={`font-mono uppercase tracking-[0.18em] text-[0.6rem] ${labelClass} mb-1`}>
                    {isGood ? 'Good use' : 'Bad use'}
                  </div>
                  <h4 className="font-serif text-[1.125rem] leading-tight text-[var(--ledger-ink)]">
                    {renderInline(c.title)}
                  </h4>
                </header>
                {c.body ? (
                  <div className="px-5 pb-4 font-serif text-[0.95rem] leading-[1.65] text-[var(--ledger-ink-2)] space-y-2 flex-1">
                    {c.body.split('\n\n').map((para, k) => (
                      <p key={k}>{renderInline(para.trim())}</p>
                    ))}
                  </div>
                ) : null}
                {c.outcome ? (
                  <footer className={`mt-auto px-5 py-3 border-t border-[var(--ledger-rule)] ${outcomeClass}`}>
                    <span className="font-mono uppercase tracking-[0.16em] text-[0.6rem] block mb-1 opacity-70">
                      Outcome
                    </span>
                    <span className="font-serif text-[0.95rem] leading-snug">
                      {renderInline(c.outcome)}
                    </span>
                  </footer>
                ) : null}
              </section>
            );
          })}
        </div>
      );
    }
    case 'table': {
      // Real <table> with WCAG 1.3.1/1.3.2 semantics. Header cells use
      // scope="col"; body cells render inline markdown. Ledger-styled —
      // hairline rules from --ledger-rule, mono caps header row in
      // --ledger-muted, tabular numbers on the body. Horizontal scroll
      // wrapper for narrow viewports; the matrix is dense by design.
      return (
        <div key={key} className="my-8 overflow-x-auto">
          <table className="w-full border-collapse text-[0.95rem] tabular-nums">
            <thead>
              <tr className="border-b border-[var(--ledger-rule-strong)]">
                {b.header.map((h, j) => (
                  <th
                    key={j}
                    scope="col"
                    className="text-left align-bottom px-3 py-2 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]"
                  >
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, j) => (
                <tr
                  key={j}
                  className="border-b border-[var(--ledger-rule)] last:border-b-0"
                >
                  {r.cells.map((c, k) => (
                    <td
                      key={k}
                      className="align-top px-3 py-2.5 text-[var(--ledger-ink)] leading-snug"
                    >
                      {renderInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

// --- Scene rendering -------------------------------------------------

function renderScene(s: Scene, key: number, _total: number): ReactNode {
  if (s.intro) {
    // Calm lesson intro — no drop-cap, no giant quote glyph, no shadow.
    // Just a confident lede paragraph in the body face, matching every
    // other block on the page.
    return (
      <section
        key={key}
        className="border-l-2 border-[var(--ledger-accent)] bg-[var(--ledger-paper)] rounded-r-[3px] px-5 sm:px-6 py-4 sm:py-5"
      >
        <p className="font-serif text-[1.05rem] leading-[1.65] text-[var(--ledger-ink-2)]">
          {renderInline(s.intro.replace(/\n\n/g, ' '))}
        </p>
      </section>
    );
  }
  if (s.conclusion) {
    return (
      <section
        key={key}
        className="rounded-[8px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] px-6 sm:px-7 py-6 sm:py-7 relative"
      >
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-3">
          Mental model
        </div>
        <p className="font-serif text-[1.0625rem] leading-[1.7] text-[var(--ledger-paper)]">
          {renderInline(s.body.replace(/\n\n/g, ' '))}
        </p>
      </section>
    );
  }
  // Numbered concept scene. The id matches slugifyHeading(s.lead) so the
  // sticky TOC's virtual-heading anchors (see lessonHeadings.SCENE_LEAD)
  // can scroll-to and scroll-spy these cards.
  // Calmer numbered scene: the numeral is a mono-caps kicker, not a giant
  // serif numeral that competes with the lesson title. Shadow removed —
  // the gold rule does the work. Shares visual language with case_grid.
  return (
    <section
      key={key}
      id={s.lead ? slugifyHeading(s.lead) : undefined}
      className="scroll-mt-24 border-l-2 border-[var(--ledger-accent)] bg-[var(--ledger-paper)] rounded-r-[3px] px-5 sm:px-6 py-4 sm:py-5"
    >
      <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-accent)] mb-1.5 tabular-nums">
        {s.numeral}
      </div>
      {s.lead ? (
        <h4 className="font-serif text-[1.125rem] leading-tight text-[var(--ledger-ink)] mb-2">
          {renderInline(s.lead)}
        </h4>
      ) : null}
      {s.body ? (
        <div className="font-serif text-[0.95rem] leading-[1.65] text-[var(--ledger-ink-2)] space-y-2.5">
          {s.body.split('\n\n').map((para, j) => (
            <p key={j}>{renderInline(para.trim())}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

// --- Inline ---------------------------------------------------------

function renderInline(src: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < src.length) {
    const lm = src.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (lm) {
      tokens.push(
        <a
          key={key++}
          href={lm[2]}
          className="text-[var(--ledger-accent)] underline underline-offset-2 hover:text-[var(--ledger-ink)]"
          target={lm[2].startsWith('http') ? '_blank' : undefined}
          rel={lm[2].startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {lm[1]}
        </a>,
      );
      i += lm[0].length;
      continue;
    }
    if (src[i] === '*' && src[i + 1] === '*') {
      const end = src.indexOf('**', i + 2);
      if (end > i + 2) {
        tokens.push(
          <strong key={key++} className="font-semibold text-[var(--ledger-ink)]">
            {src.slice(i + 2, end)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }
    if (src[i] === '*' && src[i + 1] !== '*' && src[i + 1] !== ' ') {
      const end = src.indexOf('*', i + 1);
      if (end > i + 1) {
        tokens.push(
          <strong key={key++} className="font-semibold text-[var(--ledger-ink)]">
            {src.slice(i + 1, end)}
          </strong>,
        );
        i = end + 1;
        continue;
      }
    }
    if (src[i] === '`') {
      const end = src.indexOf('`', i + 1);
      if (end > i + 1) {
        tokens.push(
          <code
            key={key++}
            className="font-mono text-[0.9em] bg-[var(--ledger-parch)] px-1.5 py-0.5 rounded-[2px] border border-[var(--ledger-rule)]"
          >
            {src.slice(i + 1, end)}
          </code>,
        );
        i = end + 1;
        continue;
      }
    }
    const next = src.slice(i).search(/[*`\[]/);
    if (next === -1) {
      tokens.push(src.slice(i));
      break;
    }
    if (next === 0) {
      tokens.push(src[i]);
      i++;
    } else {
      tokens.push(src.slice(i, i + next));
      i += next;
    }
  }
  return tokens;
}
