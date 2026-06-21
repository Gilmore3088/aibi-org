'use client';

import React, { useMemo, useState } from 'react';
import { SiteHeader } from '@/components/mockup';

/* Preview — "Prompt Safety Check", a real toolbox tool (not a quiz).
 * Paste any prompt; it scans client-side for PII and red-zone decisions
 * before the prompt is ever sent to an AI. */

type Kind = 'pii' | 'action' | 'send';
type Hit = { start: number; end: number; kind: Kind };

const PATTERNS: { kind: Kind; re: RegExp }[] = [
  { kind: 'pii', re: /\b\d{3}-\d{2}-\d{4}\b/g }, // SSN
  { kind: 'pii', re: /\b(?:acct|account)\s*#?\s*\d{3,}\b/gi }, // account no.
  { kind: 'pii', re: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g }, // card no.
  { kind: 'pii', re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g }, // email
  { kind: 'action', re: /\b(waive|approve|deny|decline|refund|reverse|grant|close the account|increase the (?:credit )?limit)\b/gi },
  { kind: 'send', re: /\b(?:email|send)\b[^.]{0,40}\b(?:member|customer|borrower|client|her|him|them|directly)\b/gi },
];

function scan(text: string): Hit[] {
  const hits: Hit[] = [];
  for (const { kind, re } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      hits.push({ start: m.index, end: m.index + m[0].length, kind });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  hits.sort((a, b) => a.start - b.start);
  // Drop overlaps (keep the first).
  const out: Hit[] = [];
  let last = -1;
  for (const h of hits) {
    if (h.start >= last) {
      out.push(h);
      last = h.end;
    }
  }
  return out;
}

const SAMPLES: { label: string; text: string }[] = [
  {
    label: 'Overdraft notice (risky)',
    text: 'Draft an overdraft notice for Maria Lopez, SSN 481-22-9930, account 0042871, balance -$240.18, and email it directly to her. Also go ahead and waive the $35 fee.',
  },
  {
    label: 'Rate explainer (clean)',
    text: 'Explain, in plain language, how a 7.5% APR applies to a personal loan balance over a 60-month term. Use the attached rate disclosure as the only source.',
  },
  {
    label: 'Credit decision (risky)',
    text: 'Review this application and decline the loan, then draft the denial letter and send it to the borrower today.',
  },
];

const ISSUE_TEXT: Record<Kind, { title: string; why: string }> = {
  pii: { title: 'Customer PII detected', why: 'Names, SSNs, account or card numbers must never go into a general AI tool.' },
  action: { title: 'AI is told to make a money decision', why: 'Waiving, approving, or denying is a person’s call — the AI may only prepare it.' },
  send: { title: 'Output goes straight to the customer', why: 'No human review step before it reaches the member.' },
};

function safeRewrite(text: string): string {
  let t = text;
  t = t.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  t = t.replace(/\b(?:acct|account)\s*#?\s*\d{3,}\b/gi, 'account [last 4]');
  t = t.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[card]');
  t = t.replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, '[email]');
  t = t.replace(/\b(?:and )?(?:go ahead and )?(waive|approve|deny|decline|refund|reverse|grant)\b/gi, 'note whether to $1 (pending approval)');
  t = t.replace(/\b(email|send)\b([^.]{0,40})\b(member|customer|borrower|client|her|him|them|directly)\b/gi, 'prepare$2for review before any send');
  return t.trim() + ' Use only fields I provide; a person reviews and owns any decision before sending.';
}

export default function SafetyCheckClient() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [saved, setSaved] = useState(false);

  const hits = useMemo(() => scan(text), [text]);
  const kinds = useMemo(() => new Set(hits.map((h) => h.kind)), [hits]);
  const level: 'red' | 'yellow' | 'green' = kinds.has('pii') || kinds.has('action') ? 'red' : kinds.has('send') ? 'yellow' : 'green';
  const levelLabel = level === 'red' ? 'Red — do not send' : level === 'yellow' ? 'Yellow — needs review' : 'Green — safe to run';

  // Build highlighted render.
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  hits.forEach((h, i) => {
    if (h.start > cursor) parts.push(<span key={`t${i}`}>{text.slice(cursor, h.start)}</span>);
    parts.push(
      <mark key={`h${i}`} className={`sc-hl ${h.kind}`}>
        {text.slice(h.start, h.end)}
      </mark>,
    );
    cursor = h.end;
  });
  if (cursor < text.length) parts.push(<span key="end">{text.slice(cursor)}</span>);

  return (
    <div className="mockup-scope sc-page">
      <SiteHeader activePath="/" />
      <p className="sc-note">
        Preview · a <b>tool</b>, not a lesson. This is the reframed “Module 9” — instead of a safety quiz, a Prompt Safety
        Check the team keeps in their toolbox and runs before sending any prompt.
      </p>

      <div className="sc-wrap">
        <div className="sc-card">
          <div className="sc-head">
            <span className="ic">✓</span>
            <span>
              <span className="tt">Prompt Safety Check</span>
              <br />
              <span className="sb">Scans for PII &amp; red-zone decisions before you hit send</span>
            </span>
            <span className="tag">Toolbox tool</span>
          </div>

          <div className="sc-body">
            <div className="sc-col">
              <div className="lbl">Your prompt</div>
              <textarea
                className="sc-input"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setSaved(false);
                }}
                spellCheck={false}
              />
              <div className="sc-samples">
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="sc-sample"
                    onClick={() => {
                      setText(s.text);
                      setSaved(false);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sc-col">
              <div className="lbl">Safety scan</div>
              <div className="sc-scan">{parts.length ? parts : <span>{text}</span>}</div>

              <div className={`sc-verdict sc-${level}`}>
                <span className="sc-meter">
                  <i />
                </span>
                <span className="sc-chip">{levelLabel}</span>
              </div>

              {hits.length > 0 ? (
                <div className="sc-issues">
                  {[...kinds].map((k) => (
                    <div className={`sc-issue ${k}`} key={k}>
                      <span className="b">!</span>
                      <span>
                        <b>{ISSUE_TEXT[k].title}.</b> {ISSUE_TEXT[k].why}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sc-clear">✓ No PII or red-zone actions found. Still review the output before use.</div>
              )}

              {level !== 'green' && (
                <div className="sc-rewrite">
                  <div className="rh">Suggested safe version</div>
                  <div className="rb">{safeRewrite(text)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="sc-foot">
            <button type="button" className="gold" onClick={() => setSaved(true)}>
              {saved ? '✓ Saved to my toolbox' : '+ Save to my toolbox'}
            </button>
            <span className="hint">{saved ? 'Run it before any prompt — one click.' : 'Keep it; run it before any prompt.'}</span>
            <span className="sc-privacy">🔒 Runs in your browser. Nothing is sent anywhere.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
