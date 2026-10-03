'use client';

// The build a module leaves the learner holding, as three short steps:
// copy the prompt, save it in your tool, test it. Controls on the left; on
// the right, a tool window shows the step happening (the text, the settings
// box with it pasted in, the test chat). Renders from FoundationBuild data so
// the course page and the free preview show the same build.

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
      // Clipboard blocked: the full text stays selectable in the window.
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
  const where = build.toolPaths.find((p) => p.tool === tool)?.where ?? '';
  const stepIndex = STEPS.indexOf(step);
  const label = build.promptLabel.toLowerCase();

  const heading: Record<Step, string> = {
    Copy: `Copy the ${label}`,
    Save: 'Save it in your tool',
    Test: build.tests.length > 1 ? 'Test it' : 'Run it once',
  };

  return (
    <div className="bd" data-testid="build-guide">
      <div className="bd-side">
        <p className="bd-before">{build.beforeYouStart}</p>

        <div className="bd-tabs" role="tablist" aria-label="Build steps">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              role="tab"
              id={`bd-tab-${s}`}
              aria-selected={step === s}
              aria-controls="bd-stage"
              className={step === s ? 'is-on' : i < stepIndex ? 'is-done' : undefined}
              onClick={() => setStep(s)}
            >
              <span className="bd-tab-n">{i + 1}</span>
              {s}
            </button>
          ))}
        </div>

        <h3 className="bd-h">{heading[step]}</h3>

        {step === 'Copy' && (
          <>
            <ul className="bd-chips" aria-label={`What the ${label} do`}>
              {build.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="bd-actions">
              <button type="button" className="bd-primary" onClick={() => copy(build.prompt)} aria-live="polite">
                {copied ? 'Copied' : `Copy the ${label}`}
              </button>
              <button type="button" className="bd-next" onClick={() => setStep('Save')}>
                Next →
              </button>
            </div>
          </>
        )}

        {step === 'Save' && (
          <>
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
            <div className="bd-actions">
              <button type="button" className="bd-next" onClick={() => setStep('Test')}>
                Next →
              </button>
              <span className="bd-dated">Menus checked {formatDate(build.verifiedOn)}</span>
            </div>
          </>
        )}

        {step === 'Test' && (
          <>
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
            <p className="bd-check">{build.check}</p>
            <p className="bd-done">
              <span aria-hidden="true">✓</span> Done when {build.doneWhen.charAt(0).toLowerCase() + build.doneWhen.slice(1)}
            </p>
            {build.limits && <p className="bd-limits">{build.limits}</p>}
          </>
        )}
      </div>

      <div className="bd-stage" id="bd-stage" role="tabpanel" aria-labelledby={`bd-tab-${step}`}>
        <div className="bd-win-bar">
          <span className="bd-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="bd-win-title">
            {step === 'Copy' && `${label}.txt`}
            {step === 'Save' && `${tool} · settings`}
            {step === 'Test' && `${tool} · new chat`}
          </span>
        </div>

        {step === 'Copy' && <pre className="bd-doc">{build.prompt}</pre>}

        {step === 'Save' && (
          <div className="bd-settings">
            <p className="bd-path">{where}</p>
            <div className="bd-field">
              <p>{build.prompt}</p>
            </div>
            <span className="bd-saved">Saved</span>
          </div>
        )}

        {step === 'Test' && test && (
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
        )}
      </div>
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
