'use client';

// The build a module leaves the learner holding: what they will have, the
// exact text to copy, the steps, the tests, and when they are done. Renders
// from FoundationBuild data so the course page and the free preview show the
// same build.

import { useState } from 'react';
import type { FoundationBuild } from '@content/courses/foundation-program/micro-modules';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function CopyButton({ text, label }: { readonly text: string; readonly label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the text stays selectable.
    }
  };
  return (
    <button type="button" className="bd-copy" onClick={copy} aria-live="polite">
      {copied ? 'Copied' : label}
    </button>
  );
}

export function BuildGuide({ build }: { readonly build: FoundationBuild }) {
  return (
    <div className="bd" data-testid="build-guide">
      <div className="bd-have">
        <p className="bd-k">What you will have</p>
        <p className="bd-have-text">{build.youWillHave}</p>
      </div>

      <p className="bd-before">
        <strong>Before you start.</strong> {build.beforeYouStart}
      </p>

      <figure className="bd-prompt">
        <figcaption>
          <span className="bd-k">{build.promptLabel}</span>
          <CopyButton text={build.prompt} label="Copy" />
        </figcaption>
        <pre>{build.prompt}</pre>
      </figure>

      <ol className="bd-steps">
        {build.steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}.</strong> {step.body}
          </li>
        ))}
      </ol>

      {build.tests && build.tests.length > 0 && (
        <div className="bd-tests">
          <p className="bd-k">Test prompts</p>
          <ol>
            {build.tests.map((test) => (
              <li key={test.prompt}>
                <div className="bd-test-prompt">
                  <p>{test.prompt}</p>
                  <CopyButton text={test.prompt} label="Copy" />
                </div>
                <p className="bd-test-expect">
                  <span>You should get:</span> {test.expect}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="bd-tool">
        <strong>Where to save it.</strong> {build.toolNote}{' '}
        <span className="bd-dated">Checked {formatDate(build.verifiedOn)}.</span>
      </p>

      {build.limits && (
        <p className="bd-limits">
          <strong>What it does not do.</strong> {build.limits}
        </p>
      )}

      <p className="bd-done">
        <span className="bd-k">Done when</span>
        {build.doneWhen}
      </p>
    </div>
  );
}
