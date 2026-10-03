'use client';

// The build a module leaves the learner holding, as three short steps:
// copy the prompt, save it in your tool, test it. One step shows at a time.
// Renders from FoundationBuild data so the course page and the free preview
// show the same build.

import { useState } from 'react';
import type { BuildTool, FoundationBuild } from '@content/courses/foundation-program/micro-modules';

const STEPS = ['Copy', 'Save', 'Test'] as const;
type Step = (typeof STEPS)[number];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the full text stays selectable below.
    }
  };
  return { copied, copy };
}

export function BuildGuide({ build }: { readonly build: FoundationBuild }) {
  const [step, setStep] = useState<Step>('Copy');
  const [tool, setTool] = useState<BuildTool>('ChatGPT');
  const [testIndex, setTestIndex] = useState(0);
  const { copied, copy } = useCopy();
  const test = build.tests[testIndex];
  const where = build.toolPaths.find((p) => p.tool === tool)?.where;
  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="bd" data-testid="build-guide">
      <p className="bd-before">{build.beforeYouStart}</p>

      <div className="bd-tabs" role="tablist" aria-label="Build steps">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            role="tab"
            id={`bd-tab-${s}`}
            aria-selected={step === s}
            aria-controls={`bd-panel-${s}`}
            className={step === s ? 'is-on' : i < stepIndex ? 'is-done' : undefined}
            onClick={() => setStep(s)}
          >
            <span className="bd-tab-n">{i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      {step === 'Copy' && (
        <section className="bd-panel" id="bd-panel-Copy" role="tabpanel" aria-labelledby="bd-tab-Copy">
          <ul className="bd-chips" aria-label={`What the ${build.promptLabel.toLowerCase()} do`}>
            {build.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <div className="bd-actions">
            <button type="button" className="bd-primary" onClick={() => copy(build.prompt)} aria-live="polite">
              {copied ? 'Copied' : `Copy the ${build.promptLabel.toLowerCase()}`}
            </button>
            <button type="button" className="bd-next" onClick={() => setStep('Save')}>
              Next: save it →
            </button>
          </div>
          <details className="bd-full">
            <summary>Read the full text</summary>
            <pre>{build.prompt}</pre>
          </details>
        </section>
      )}

      {step === 'Save' && (
        <section className="bd-panel" id="bd-panel-Save" role="tabpanel" aria-labelledby="bd-tab-Save">
          <div className="bd-tools" role="group" aria-label="Your AI tool">
            {build.toolPaths.map((p) => (
              <button
                key={p.tool}
                type="button"
                aria-pressed={tool === p.tool}
                className={tool === p.tool ? 'is-on' : undefined}
                onClick={() => setTool(p.tool)}
              >
                {p.tool}
              </button>
            ))}
          </div>
          <p className="bd-where">{where}</p>
          <div className="bd-actions">
            <button type="button" className="bd-next" onClick={() => setStep('Test')}>
              Next: test it →
            </button>
            <span className="bd-dated">Checked {formatDate(build.verifiedOn)}</span>
          </div>
        </section>
      )}

      {step === 'Test' && test && (
        <section className="bd-panel" id="bd-panel-Test" role="tabpanel" aria-labelledby="bd-tab-Test">
          {build.tests.length > 1 && (
            <div className="bd-tools" role="group" aria-label="Test prompts">
              {build.tests.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  aria-pressed={testIndex === i}
                  className={testIndex === i ? 'is-on' : undefined}
                  onClick={() => setTestIndex(i)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <div className="bd-chat">
            <div className="bd-msg bd-msg-you">
              <p>{test.prompt}</p>
              <TestCopy text={test.prompt} />
            </div>
            <div className="bd-msg bd-msg-ai">
              <span className="bd-msg-k">A working setup replies</span>
              <p>{test.reply}</p>
            </div>
          </div>
          <p className="bd-check">{build.check}</p>
          <p className="bd-done">
            <span aria-hidden="true">✓</span> Done when: {build.doneWhen}
          </p>
          {build.limits && <p className="bd-limits">{build.limits}</p>}
        </section>
      )}
    </div>
  );
}

function TestCopy({ text }: { readonly text: string }) {
  const { copied, copy } = useCopy();
  return (
    <button type="button" className="bd-copy" onClick={() => copy(text)} aria-live="polite">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
