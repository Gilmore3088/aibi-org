import { questions } from '@content/assessments/v3/questions';
import { FOUNDATION_MICRO_MODULES } from '@content/courses/foundation-program';

// Assess · Train · Build — a three-step journey laid out left to right, each
// step showing the real thing as a document rather than a window (the hero
// already has the window): a live assessment question as an answer sheet, a
// Foundation module's weak/strong example as a marked-up edit, and a skill
// file as a page. Static; nothing moves.

const ASSESS_QUESTION = questions.find((q) => q.id === 'atp-01') ?? questions[0];
const TRAIN_MODULE =
  FOUNDATION_MICRO_MODULES.find((m) => m.id === 'm2-low-risk-message-rewrite') ?? FOUNDATION_MICRO_MODULES[0];

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
  { id: 'train', num: '02', tag: 'Course', title: 'Train', line: 'Practice on synthetic data until the habit sticks.' },
  { id: 'build', num: '03', tag: 'Toolbox', title: 'Build', line: 'Skill files your team runs and reviews.' },
] as const;

const SKILL_PAGE = SKILL_EXCERPT.filter((l) => l.kind !== 'cmd' && !(l.kind === 'out' && l.text.endsWith('.md')));

export function HowItWorks() {
  return (
    <ol className="hm-journey">
      {STEPS.map((s) => (
        <li key={s.id} id={`hm-step-${s.id}`} className="hm-journey-step">
          <div className="hm-journey-head">
            <span className="hm-journey-node" aria-hidden="true">
              {s.num}
            </span>
            <span className="hm-k">{s.tag}</span>
            <h3 className="hm-steps-title">{s.title}</h3>
            <p className="hm-steps-line">{s.line}</p>
          </div>

          {s.id === 'assess' && (
            <figure className="hm-sheet" aria-label="Sample assessment question">
              <figcaption className="hm-sheet-k">Question 1 of 12</figcaption>
              <p className="hm-sheet-q">{ASSESS_QUESTION.prompt}</p>
              <ul className="hm-sheet-options">
                {ASSESS_QUESTION.options.map((o, i) => (
                  <li key={o.label} className={o.points === 3 ? 'is-picked' : undefined}>
                    <span aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                    {o.label}
                  </li>
                ))}
              </ul>
            </figure>
          )}

          {s.id === 'train' && (
            <figure className="hm-sheet" aria-label={`Module ${TRAIN_MODULE.number} example`}>
              <figcaption className="hm-sheet-k">
                Module {TRAIN_MODULE.number} · {TRAIN_MODULE.title}
              </figcaption>
              <p className="hm-edit-label">Before</p>
              <p className="hm-edit-weak">
                <s>{TRAIN_MODULE.weakExample}</s>
              </p>
              <p className="hm-edit-label">After</p>
              <p className="hm-edit-strong">{TRAIN_MODULE.strongExample}</p>
              <p className="hm-edit-why">{TRAIN_MODULE.exampleWhy}</p>
            </figure>
          )}

          {s.id === 'build' && (
            <figure className="hm-sheet hm-sheet-md" aria-label="Exception report skill file">
              <figcaption className="hm-sheet-k">skills/exception-report.md</figcaption>
              <pre>
                {SKILL_PAGE.map((l) => (
                  <span key={l.text} className={`hm-t-${l.kind}`}>
                    {l.text}
                    {'\n'}
                  </span>
                ))}
              </pre>
            </figure>
          )}
        </li>
      ))}
    </ol>
  );
}
