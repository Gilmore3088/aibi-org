'use client';

import { useState } from 'react';
import { questions } from '@content/assessments/v3/questions';
import { getPracticeRepById } from '@content/practice-reps/foundation-program';

// Assess · Train · Build — each tab shows the real thing, not an illustration:
// a live assessment question, a Foundation practice rep (starter prompt +
// model answer from the course), and a skill file from the toolbox. Static;
// the visitor switches tabs, nothing auto-advances.

const ASSESS_QUESTION = questions.find((q) => q.id === 'atp-01') ?? questions[0];
const TRAIN_REP = getPracticeRepById('rewrite-for-clarity');

/**
 * Verbatim excerpt of public/artifacts/skill-templates/exception-report.md.
 * HowItWorks.test.ts asserts every non-command line still appears in that
 * file, so the terminal never drifts from the real skill.
 */
export const SKILL_EXCERPT: ReadonlyArray<{ kind: 'cmd' | 'out' | 'h1' | 'h2' | 'flag'; text: string }> = [
  { kind: 'cmd', text: '$ ls skills/' },
  { kind: 'out', text: 'exception-report.md   executive-briefing.md   loan-pipeline.md' },
  { kind: 'out', text: 'marketing-content.md  meeting-summary.md      regulatory-research.md' },
  { kind: 'cmd', text: '$ cat skills/exception-report.md' },
  { kind: 'h1', text: '# Exception Report Skill - v1.0' },
  { kind: 'h2', text: '## Constraints' },
  { kind: 'out', text: '- Never include full account numbers — use masked format (last 4 digits only: XXXX-1234).' },
  { kind: 'out', text: '- Never make a regulatory determination about whether an exception constitutes a BSA/SAR reportable event.' },
  { kind: 'flag', text: '  Flag any exception involving unusual cash activity with [BSA REVIEW — DO NOT RESOLVE WITHOUT COMPLIANCE].' },
  { kind: 'out', text: '- Do not resolve or close exceptions in the report — this is a status and routing document only.' },
];

const STEPS = [
  { id: 'assess', num: '01', tag: 'Free', title: 'Assess', line: 'Twelve questions. Score, top gap, next step.' },
  { id: 'train', num: '02', tag: 'Course', title: 'Train', line: 'Practice reps in a real AI tool, on synthetic data.' },
  { id: 'build', num: '03', tag: 'Toolbox', title: 'Build', line: 'Skill files your team runs and reviews.' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

export function HowItWorks() {
  const [active, setActive] = useState<StepId>('assess');

  return (
    <div className="hm-steps">
      <div className="hm-steps-tabs" role="tablist" aria-label="How it works">
        {STEPS.map((s) => (
          <button
            key={s.id}
            id={`hm-step-${s.id}`}
            type="button"
            role="tab"
            aria-selected={active === s.id}
            aria-controls="hm-step-panel"
            className={active === s.id ? 'is-active' : undefined}
            onClick={() => setActive(s.id)}
          >
            <span className="hm-k">
              {s.num} · {s.tag}
            </span>
            <span className="hm-steps-title">{s.title}</span>
            <span className="hm-steps-line">{s.line}</span>
          </button>
        ))}
      </div>

      <div id="hm-step-panel" role="tabpanel" aria-labelledby={`hm-step-${active}`} className="hm-steps-panel">
        {active === 'assess' && (
          <div className="hm-panel-dark">
            <p className="hm-k hm-gold">Sample question · one of twelve</p>
            <p className="hm-panel-q">{ASSESS_QUESTION.prompt}</p>
            <ul className="hm-options">
              {ASSESS_QUESTION.options.map((o) => (
                <li key={o.label} className={o.points === 3 ? 'is-picked' : undefined}>
                  {o.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {active === 'train' && TRAIN_REP && (
          <div className="hm-panel-dark">
            <p className="hm-k hm-gold">
              Practice rep · Module {TRAIN_REP.moduleNumber} · {TRAIN_REP.title}
            </p>
            <p className="hm-msg hm-msg-user">{TRAIN_REP.starterPrompt}</p>
            <div className="hm-msg hm-msg-ai">
              <span className="hm-ai-badge" aria-hidden="true">
                AI
              </span>
              <p>{TRAIN_REP.modelAnswer}</p>
            </div>
            <p className="hm-panel-note">Starter prompt and model answer from the Foundation course.</p>
          </div>
        )}

        {active === 'build' && (
          <div className="hm-terminal" aria-label="Terminal showing the exception report skill file">
            <div className="hm-terminal-bar" aria-hidden="true">
              <span />
              <span />
              <span />
              <em>~/team-toolbox</em>
            </div>
            <pre>
              {SKILL_EXCERPT.map((l) => (
                <span key={l.text} className={`hm-t-${l.kind}`}>
                  {l.text}
                  {'\n'}
                </span>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
