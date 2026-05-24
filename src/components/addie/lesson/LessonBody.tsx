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

interface Scene {
  intro?: string;
  numeral?: string;
  lead?: string;
  body: string;
  conclusion?: boolean;
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
  | { kind: 'callout'; tone: CalloutKind; lines: string[] };

const CALLOUT_RE = /^>\s*\[(tip|warn|save|field)\]\s*(.*)$/i;
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
      // Capture the full blockquote.
      const buf: string[] = [];
      while (i < lines.length && (lines[i].startsWith('>') || (buf.length > 0 && lines[i].trim() === ''))) {
        // Allow blank lines inside a > block (they appear as "> " with
        // nothing after, but some authors write a real blank line
        // between > paragraphs).
        if (lines[i].startsWith('>')) {
          const stripped = lines[i].replace(/^>\s?/, '');
          buf.push(stripped);
        } else {
          buf.push(''); // paragraph break inside quote
        }
        i++;
      }
      // Callout detection on the very first non-empty line.
      const firstNonEmpty = buf.find((x) => x.trim() !== '') ?? '';
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
      return (
        <section
          key={key}
          className="my-10 rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] shadow-[var(--ledger-shadow)] overflow-hidden"
        >
          <div className="px-6 sm:px-8 py-7 sm:py-8 relative">
            <span
              aria-hidden
              className="absolute top-3 left-4 font-serif text-[3rem] leading-none text-[var(--ledger-accent)] opacity-60 select-none"
            >
              &ldquo;
            </span>
            <div className="pl-8 space-y-4 font-serif text-[1.125rem] leading-[1.75] text-[var(--ledger-ink)]">
              {b.paras.map((para, j) => {
                if (j === 0) {
                  return (
                    <p
                      key={j}
                      className="first-letter:font-serif first-letter:text-[3rem] first-letter:leading-[0.85] first-letter:font-semibold first-letter:float-left first-letter:pr-3 first-letter:pt-1 first-letter:text-[var(--ledger-ink)]"
                    >
                      {renderInline(para)}
                    </p>
                  );
                }
                return <p key={j}>{renderInline(para)}</p>;
              })}
            </div>
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
  }
}

// --- Scene rendering -------------------------------------------------

function renderScene(s: Scene, key: number, _total: number): ReactNode {
  if (s.intro) {
    return (
      <section
        key={key}
        className="rounded-[8px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 sm:px-7 py-6 sm:py-7 relative overflow-hidden"
      >
        <span
          aria-hidden
          className="absolute -top-2 -left-2 font-serif text-[3rem] leading-none text-[var(--ledger-accent)] opacity-30 select-none"
        >
          &ldquo;
        </span>
        <p className="font-serif text-[1.0625rem] leading-[1.75] text-[var(--ledger-ink-2)] pl-6 first-letter:font-serif first-letter:text-[3rem] first-letter:leading-[0.85] first-letter:font-semibold first-letter:float-left first-letter:pr-3 first-letter:pt-1 first-letter:text-[var(--ledger-ink)]">
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
  return (
    <section
      key={key}
      id={s.lead ? slugifyHeading(s.lead) : undefined}
      className="scroll-mt-24 grid grid-cols-[auto_1fr] gap-4 sm:gap-6 rounded-[8px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-5 sm:px-7 py-6 sm:py-7 shadow-[0_1px_0_color-mix(in_srgb,var(--ledger-ink)_5%,transparent),0_4px_12px_-6px_color-mix(in_srgb,var(--ledger-ink)_10%,transparent)] hover:shadow-[0_2px_0_color-mix(in_srgb,var(--ledger-ink)_8%,transparent),0_8px_22px_-8px_color-mix(in_srgb,var(--ledger-ink)_16%,transparent)] transition-shadow duration-[200ms]"
    >
      <div className="flex flex-col items-center">
        <div className="font-serif text-[2.75rem] leading-none text-[var(--ledger-accent)] tabular-nums">
          {s.numeral}
        </div>
        <div className="mt-2 w-px flex-1 bg-[var(--ledger-rule-strong)] min-h-[40px]" aria-hidden />
      </div>
      <div className="min-w-0">
        {s.lead ? (
          <h4 className="font-serif text-[1.25rem] leading-tight text-[var(--ledger-ink)] mb-3">
            {renderInline(s.lead)}
          </h4>
        ) : null}
        {s.body ? (
          <div className="font-serif text-[1rem] leading-[1.7] text-[var(--ledger-ink-2)] space-y-3">
            {s.body.split('\n\n').map((para, j) => (
              <p key={j}>{renderInline(para.trim())}</p>
            ))}
          </div>
        ) : null}
      </div>
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
