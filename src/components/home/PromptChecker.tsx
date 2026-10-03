'use client';

import { useId, useMemo, useState } from 'react';
import { detect, sanitize, KIND_LABEL } from '@/lib/prompt-check/detect';

// "Customer data stays out." — a live prompt checker. Visitors paste a
// prompt; pattern matching in the browser flags customer data and proposes
// a placeholder version. Nothing typed leaves the page: no fetch, no
// storage, no analytics event carries the text.

export const EXAMPLE_PROMPT =
  'write a quick reply to John Smith — he’s furious we charged him 3 overdraft fees in one day on account 0042871. dob 04/12/1981, ssn •••–••–4829, cell (555) 123-4567. balance is $83.17. wants them reversed';

function Bracketed({ text }: { readonly text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('[') && part.endsWith(']') ? (
          <mark key={i} className={part.includes('remove') ? 'is-remove' : undefined}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function PromptChecker() {
  const inputId = useId();
  const [text, setText] = useState(EXAMPLE_PROMPT);
  const [copied, setCopied] = useState(false);
  const findings = useMemo(() => detect(text), [text]);
  const safer = useMemo(() => sanitize(text, findings), [text, findings]);
  const empty = text.trim().length === 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(safer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the text is still selectable */
    }
  };

  return (
    <section className="hm-redline" aria-labelledby="hm-redline-title">
      <div className="mk-container">
        <h2 id="hm-redline-title" className="hm-display">
          Customer data stays <span className="hm-red">out</span>.
        </h2>
        <p className="hm-redline-lede">
          Type or paste a prompt you would send to an AI tool. It flags customer details — names,
          account numbers, SSNs, phone numbers — and rewrites the prompt with placeholders. It runs in
          your browser; nothing you type leaves this page.
        </p>

        <div className="hm-redline-grid">
          <div className="hm-redline-before">
            <div className="hm-check-head">
              <label htmlFor={inputId} className="hm-k hm-red">
                Your prompt
              </label>
              <span className="hm-check-actions">
                <button type="button" onClick={() => setText(EXAMPLE_PROMPT)}>
                  example
                </button>
                <button type="button" onClick={() => setText('')}>
                  clear
                </button>
              </span>
            </div>
            <textarea
              id={inputId}
              className="hm-check-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              spellCheck={false}
              autoComplete="off"
              placeholder="Paste or type a prompt…"
            />
            <div className="hm-check-findings" aria-live="polite">
              {empty ? null : findings.length === 0 ? (
                <p className="hm-check-clean">✓ No customer details found.</p>
              ) : (
                <>
                  <p className="hm-k">
                    Found {findings.length} customer {findings.length === 1 ? 'detail' : 'details'}
                  </p>
                  <ul>
                    {findings.map((f) => (
                      <li key={`${f.start}-${f.kind}`}>
                        <span>{KIND_LABEL[f.kind]}</span>
                        <s className="hm-strike">{f.text}</s>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="hm-redline-after">
            <p className="hm-k hm-gold">{findings.length > 0 ? 'Safer version' : 'Result'}</p>
            {empty ? (
              <p className="hm-mono hm-check-output">
                <span className="hm-check-dim">Your safer prompt appears here.</span>
              </p>
            ) : findings.length === 0 ? (
              <div className="hm-check-output hm-check-ok">
                <p className="hm-check-ok-title">Nothing to replace.</p>
                <p>
                  No names, account numbers or IDs found. The prompt can go to your approved tool as
                  written — the facts in the answer still need checking.
                </p>
              </div>
            ) : (
              <p className="hm-mono hm-check-output">
                <Bracketed text={safer} />
              </p>
            )}
            <div className="hm-check-foot" hidden={!empty && findings.length === 0}>
              <button type="button" className="hm-check-copy" onClick={copy} disabled={empty}>
                {copied ? 'Copied' : 'Copy safer version'}
              </button>
              <span>Placeholders in gold; red means delete it — the task doesn&rsquo;t need it.</span>
            </div>
          </div>
        </div>
        <p className="hm-redline-note">
          A pattern check, not a judgement — it can miss things. A named person still reviews before
          anything is used.
        </p>
      </div>
    </section>
  );
}
