'use client';

// Green / yellow / red: sort six things you might paste into an AI tool,
// then see why. Nothing is stored or sent.

import { useState } from 'react';
import { DATA_LIGHT_LABEL, type DataLight, type DataTestItem } from '@content/skills/data-test';

const LIGHTS: readonly DataLight[] = ['green', 'yellow', 'red'];
const SHORT: Record<DataLight, string> = { green: 'Green', yellow: 'Yellow', red: 'Red' };

export function DataLightTest({ items }: { readonly items: readonly DataTestItem[] }) {
  const [picks, setPicks] = useState<Record<number, DataLight>>({});
  const answered = Object.keys(picks).length;
  const right = items.filter((it, i) => picks[i] === it.answer).length;

  return (
    <div className="pt-test" data-testid="data-light-test">
      <ol className="pt-items">
        {items.map((it, i) => {
          const pick = picks[i];
          const correct = pick === it.answer;
          return (
            <li key={it.item} className={pick ? (correct ? 'is-right' : 'is-wrong') : undefined}>
              <p className="pt-item">{it.item}</p>
              <div className="pt-lights" role="group" aria-label={`Sort: ${it.item}`}>
                {LIGHTS.map((light) => (
                  <button
                    key={light}
                    type="button"
                    className={`pt-light is-${light}`}
                    aria-pressed={pick === light}
                    disabled={Boolean(pick)}
                    onClick={() => setPicks((p) => ({ ...p, [i]: light }))}
                  >
                    {SHORT[light]}
                  </button>
                ))}
              </div>
              {pick && (
                <p className="pt-why" aria-live="polite">
                  <strong>{correct ? 'Right.' : `It's ${DATA_LIGHT_LABEL[it.answer].toLowerCase()}.`}</strong> {it.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="pt-score" aria-live="polite">
        {answered < items.length ? (
          <span>
            {answered} of {items.length} sorted
          </span>
        ) : (
          <>
            <span>
              {right} of {items.length} right.{' '}
              {right === items.length ? 'You know where the line is.' : 'When in doubt, treat it as red and ask.'}
            </span>
            <button type="button" className="pt-reset" onClick={() => setPicks({})}>
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
