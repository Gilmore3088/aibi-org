'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type {
  DraftPayload,
  ModuleInteractiveTakeawayProps,
  SafetyHit,
  SafetyKind,
} from './types';
import { saveInteractiveDraft } from './saveInteractiveDraft';

const SAFETY_PATTERNS: readonly { readonly kind: SafetyKind; readonly re: RegExp }[] = [
  { kind: 'pii', re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { kind: 'pii', re: /\b(?:acct|account)\s*#?\s*\d{3,}\b/gi },
  { kind: 'pii', re: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g },
  { kind: 'pii', re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g },
  {
    kind: 'action',
    re: /\b(waive|approve|deny|decline|refund|reverse|grant|close the account|increase the (?:credit )?limit)\b/gi,
  },
  {
    kind: 'send',
    re: /\b(?:email|send)\b[^.]{0,44}\b(?:member|customer|borrower|client|her|him|them|directly)\b/gi,
  },
];

const SAFETY_SAMPLES: readonly { readonly label: string; readonly text: string }[] = [
  {
    label: 'Overdraft notice',
    text: 'Draft an overdraft notice for Maria Lopez, SSN 481-22-9930, account 0042871, balance -$240.18, and email it directly to her. Also go ahead and waive the $35 fee.',
  },
  {
    label: 'Rate explainer',
    text: 'Explain how a 7.5% APR applies to a personal loan over a 60-month term. Use the attached rate disclosure as the only source.',
  },
  {
    label: 'Credit decision',
    text: 'Review this application and decline the loan, then draft the denial letter and send it to the borrower today.',
  },
];

const ISSUE_COPY: Record<SafetyKind, { readonly title: string; readonly body: string }> = {
  pii: {
    title: 'Customer data detected',
    body: 'Strip account, SSN, card, email, and other identifiers before a general AI tool sees the prompt.',
  },
  action: {
    title: 'Money or account decision',
    body: 'AI can prepare the picture. A person owns waiving, approving, denying, refunding, or closing.',
  },
  send: {
    title: 'No review before send',
    body: 'Customer-facing output needs a named human review step before it leaves the bank.',
  },
};

function scanPrompt(text: string): SafetyHit[] {
  const hits: SafetyHit[] = [];
  for (const { kind, re } of SAFETY_PATTERNS) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      hits.push({ start: match.index, end: match.index + match[0].length, kind });
      if (match.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  hits.sort((a, b) => a.start - b.start);
  const out: SafetyHit[] = [];
  let cursor = -1;
  for (const hit of hits) {
    if (hit.start >= cursor) {
      out.push(hit);
      cursor = hit.end;
    }
  }
  return out;
}

function safeRewrite(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  cleaned = cleaned.replace(/\b(?:acct|account)\s*#?\s*\d{3,}\b/gi, 'account [last 4]');
  cleaned = cleaned.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[card]');
  cleaned = cleaned.replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, '[email]');
  cleaned = cleaned.replace(
    /\b(?:and )?(?:go ahead and )?(waive|approve|deny|decline|refund|reverse|grant)\b/gi,
    'note whether to $1, pending approval',
  );
  cleaned = cleaned.replace(
    /\b(email|send)\b([^.]{0,44})\b(member|customer|borrower|client|her|him|them|directly)\b/gi,
    'prepare$2for human review before any send',
  );
  return `${cleaned.trim()} Use only fields provided; a person reviews and owns any decision before sending.`;
}

function HighlightedPrompt({ text, hits }: { readonly text: string; readonly hits: readonly SafetyHit[] }) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  hits.forEach((hit, index) => {
    if (hit.start > cursor) {
      parts.push(<span key={`plain-${index}`}>{text.slice(cursor, hit.start)}</span>);
    }
    parts.push(
      <mark key={`hit-${index}`} className={`foundation-safety-highlight foundation-safety-highlight--${hit.kind}`}>
        {text.slice(hit.start, hit.end)}
      </mark>,
    );
    cursor = hit.end;
  });

  if (cursor < text.length) {
    parts.push(<span key="plain-end">{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

export function UnusedPromptSafetyCheck({ moduleId, artifactLabel }: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [text, setText] = useState(SAFETY_SAMPLES[0].text);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const hits = useMemo(() => scanPrompt(text), [text]);
  const kinds = useMemo(() => new Set(hits.map((hit) => hit.kind)), [hits]);
  const level = kinds.has('pii') || kinds.has('action') ? 'red' : kinds.has('send') ? 'yellow' : 'green';
  const levelLabel =
    level === 'red' ? 'Red - do not run' : level === 'yellow' ? 'Yellow - review first' : 'Green - usable with review';
  const issueKinds = Array.from(kinds);
  const rewrite = safeRewrite(text);

  function save() {
    const saved = new Date().toISOString();
    const content = `# Prompt Safety Check\n\n## Original prompt\n${text}\n\n## Verdict\n${levelLabel}\n\n## Issues\n${issueKinds.length > 0 ? issueKinds.map((kind) => `- ${ISSUE_COPY[kind].title}: ${ISSUE_COPY[kind].body}`).join('\n') : '- No PII or red-zone action detected. Human review still required.'}\n\n## Safer version\n${rewrite}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 9,
      model: 'AiBI prompt safety check',
      dataset: 'Prompt Safety Check samples',
      savedAt: saved,
      reviewChecklist: ['Customer data is stripped', 'Decision boundary is clear', 'Reviewer is named'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-safety-check">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Run the reusable tool</p>
          <h3>Prompt Safety Check</h3>
          <p>Paste a prompt, spot unsafe inputs, and save the safer version to your packet.</p>
        </div>
        <span className={`foundation-safety-verdict foundation-safety-verdict--${level}`}>{levelLabel}</span>
      </div>

      <div className="foundation-safety-check__samples" aria-label="Sample prompts">
        {SAFETY_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => {
              setText(sample.text);
              setSavedAt(null);
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div className="foundation-safety-check__workspace">
        <label className="foundation-safety-check__input">
          <span>Your prompt</span>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSavedAt(null);
            }}
            rows={7}
          />
        </label>

        <div className="foundation-tool-panel foundation-tool-panel--scan">
          <p className="foundation-tool-panel__label">Safety scan</p>
          <p className="foundation-safety-scan-text">
            <HighlightedPrompt text={text} hits={hits} />
          </p>
          <div className="foundation-safety-issues">
            {issueKinds.length > 0 ? (
              issueKinds.map((kind) => (
                <div key={kind}>
                  <strong>{ISSUE_COPY[kind].title}</strong>
                  <span>{ISSUE_COPY[kind].body}</span>
                </div>
              ))
            ) : (
              <div>
                <strong>No flagged pattern</strong>
                <span>Still review the source, facts, and final output before use.</span>
              </div>
            )}
          </div>
          <div className="foundation-safety-rewrite">
            <p className="foundation-tool-panel__label">Safer version</p>
            <p>{rewrite}</p>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save}>
          {savedAt ? 'Saved to packet draft' : `Save to ${artifactLabel}`}
        </button>
        <p>Runs locally in the lesson. No sample prompt is sent to a model.</p>
      </div>
    </section>
  );
}
