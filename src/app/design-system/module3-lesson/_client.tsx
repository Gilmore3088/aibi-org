'use client';

import React, { useState } from 'react';
import { CourseShell, LMSTopBar, type LMSModule } from '@/components/lms';
import { ModuleTabs } from '@/app/courses/foundation/program/_components/ModuleTabs';

/* Preview — Module 3 lesson inside the REAL course shell + canonical ModuleTabs. */

const MODULES: LMSModule[] = [
  { num: 1, pillar: 'awareness', title: 'Daily wins that build the habit', mins: 18, output: 'Rewritten email starter', goal: 'Low-risk daily AI wins.' },
  { num: 2, pillar: 'awareness', title: 'How AI really works', mins: 22, output: 'AI output review worksheet', goal: 'What AI is and is not.' },
  { num: 3, pillar: 'understanding', title: 'Prompts that get to the CORE', mins: 25, output: 'Fee-waiver prompt', goal: 'Build prompts that get to the CORE.' },
  { num: 4, pillar: 'understanding', title: 'Your AI work profile', mins: 20, output: 'AI work profile', goal: 'A profile AI can reuse safely.' },
  { num: 5, pillar: 'understanding', title: 'Project briefs', mins: 18, output: 'Project brief template', goal: 'Reusable context for projects.' },
  { num: 6, pillar: 'creation', title: 'File & document workflows', mins: 24, output: 'Document workflow prompt', goal: 'Safe file workflows.' },
  { num: 7, pillar: 'creation', title: 'The tool choice map', mins: 16, output: 'Tool choice map', goal: 'Match tools to tasks.' },
  { num: 8, pillar: 'creation', title: 'Agents & workflows', mins: 20, output: 'Workflow map', goal: 'Agents as workflow thinking.' },
  { num: 9, pillar: 'creation', title: 'Effective vs. safe', mins: 22, output: 'Safe AI use checklist', goal: 'Effective is not the same as safe.' },
  { num: 10, pillar: 'application', title: 'Your role’s tools', mins: 26, output: 'Role use-case card', goal: 'Apply foundations to real roles.' },
  { num: 11, pillar: 'application', title: 'Your prompt library', mins: 18, output: 'Personal prompt library', goal: 'Turn prompts into a daily system.' },
  { num: 12, pillar: 'application', title: 'Practitioner lab', mins: 30, output: 'Final lab submission', goal: 'Demonstrate safe AI use.' },
];

const CORE = [
  { id: 'c', letter: 'C', nm: 'Context / role', ds: 'Who the AI is and who it’s for.', text: 'You are a branch banking assistant helping a teller answer a member.' },
  { id: 'o', letter: 'O', nm: 'Objective', ds: 'The exact task — not the topic.', text: 'Tell me whether this $12 maintenance fee can be waived, and the conditions.' },
  { id: 'r', letter: 'R', nm: 'Resources', ds: 'Point to the source; forbid guessing.', text: 'Use ONLY the fee-waiver policy below. If it isn’t covered, say so — don’t guess.' },
  { id: 'e', letter: 'E', nm: 'Expectations', ds: 'Shape and limit the output.', text: 'Answer in 2–3 plain sentences; flag anything needing approval.' },
];

type Ans = { tone: 'bad' | 'mid' | 'good'; label: string; text: string; flag?: string };

function answerFor(on: Set<string>): Ans {
  if (!on.has('o')) return { tone: 'bad', label: 'Vague — no real task', text: 'Sure! Bank fees can sometimes be waived depending on the situation. Want some general tips on fees?' };
  if (!on.has('r')) return { tone: 'bad', label: 'Invented policy — a hallucination', text: 'Yes — first-time maintenance fees under $25 are always waived automatically. Just reverse it in the system.', flag: 'The AI made that policy up. Nothing pointed it at your real source.' };
  if (!on.has('e')) return { tone: 'mid', label: 'Right idea, buried answer', text: 'Thank you for your question regarding the $12 maintenance fee. There are a number of considerations that may bear on whether a waiver is appropriate in this circumstance, including but not limited to account history, balance thresholds, prior courtesy adjustments, and the member’s standing, all of which should be weighed before…' };
  if (!on.has('c')) return { tone: 'mid', label: 'Correct facts, wrong voice', text: 'A $12 maintenance fee may be waived once per 12-month period where minimum-balance requirements were met during the cycle in question.' };
  return { tone: 'good', label: 'Grounded, scoped, usable at the window', text: 'Per the fee-waiver policy, this $12 maintenance fee can be waived once every 12 months if the member kept the minimum balance. This member already used their waiver in March, so it isn’t eligible — offer to set up a balance alert instead. Flag to a supervisor if they want an exception.' };
}

function LearnContent() {
  return (
    <div>
      <p className="m3lead">
        Length is not quality — <b>structure is.</b> Every prompt that holds up at work hits four marks. Miss one and the
        answer breaks in a predictable way: skip <b>Resources</b> and the AI invents policy; skip <b>Expectations</b> and
        the answer buries the point.
      </p>
      <div className="m3core">
        {CORE.map((c) => (
          <div className="m3core-row" key={c.id}>
            <span className="lt">{c.letter}</span>
            <span>
              <span className="nm">{c.nm}</span> — <span className="ds">{c.ds}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="m3note">Open <b>Try it</b> to build the prompt and watch the answer change.</p>
    </div>
  );
}

function PromptWizard() {
  const [on, setOn] = useState<Set<string>>(new Set(['c', 'o']));
  const [saved, setSaved] = useState(false);
  const toggle = (id: string) =>
    setOn((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const ans = answerFor(on);
  const score = CORE.filter((c) => on.has(c.id)).length;

  return (
    <div className="m3wiz">
      <div>
        <div className="m3scn">
          <b>Scenario:</b> a teller asks — can this member’s <b>$12 maintenance fee</b> be waived?
        </div>
        <div className="m3togs">
          {CORE.map((c) => (
            <button key={c.id} type="button" className={`m3tog${on.has(c.id) ? ' on' : ''}`} onClick={() => toggle(c.id)}>
              <span className="lt">{c.letter}</span>
              <span>
                <span className="nm">{c.nm}</span>
                <span className="ds">{c.ds}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="m3act">
          <button type="button" className="m3btn" disabled={score < 4} onClick={() => setSaved(true)}>
            {score < 4 ? 'Add all of CORE to save' : saved ? '✓ Saved to toolbox' : 'Save this prompt →'}
          </button>
          <span className="m3note">{saved ? 'Open Use it to see it' : `CORE ${score}/4`}</span>
        </div>
      </div>

      <div>
        <div className="m3prompt">
          <div className="m3ph">
            Your prompt
            <span className="sc">CORE {score}/4</span>
          </div>
          <div className="m3pb">
            {score === 0 && <span className="m3empty">Toggle CORE elements to build the prompt…</span>}
            {CORE.filter((c) => on.has(c.id)).map((c) => (
              <span className="m3seg" key={c.id}>
                <span className="lab">{c.letter}</span> {c.text}
              </span>
            ))}
            <span className="m3dots">
              {CORE.map((c) => (
                <i key={c.id} className={on.has(c.id) ? 'on' : ''} />
              ))}
            </span>
          </div>
        </div>

        <div className={`m3answer ${ans.tone}`}>
          <div className="m3ah">
            {ans.tone === 'good' ? '✓' : ans.tone === 'mid' ? '!' : '✕'} AI answer · {ans.label}
          </div>
          <div className="m3ab">{ans.text}</div>
          {ans.flag && <div className="m3aflag">⚠ {ans.flag}</div>}
        </div>
      </div>
    </div>
  );
}

function ApplyContent() {
  return (
    <div className="m3saved">
      <div className="ok">✓</div>
      <h4>Your CORE prompt, saved.</h4>
      <p>The fee-waiver prompt you built is now a reusable tool in your toolbox — open it on any fee question, or tune it for your branch.</p>
      <div className="m3chip">
        <span className="ic">P</span>
        <span style={{ textAlign: 'left' }}>
          <span className="tn">Fee-Waiver Prompt</span>
          <br />
          <span className="tm">Prompt · CORE 4/4 · from Module 03</span>
        </span>
      </div>
    </div>
  );
}

export default function Module3LessonClient() {
  return (
    <CourseShell modules={MODULES} completed={[1, 2]} current={3} learner={{ name: 'Preview', role: 'Loan officer' }}>
      <LMSTopBar crumbs={['Education', 'AiBI-Foundation', 'Module 03']} />

      <div className="m3h">
        <div className="eyebrow">Understanding · Module 03</div>
        <h1>Prompts that get to the CORE</h1>
        <p className="goal">Build prompts that get to the CORE — and learn which strategy to reach for.</p>
      </div>

      <div className="m3body">
        <ModuleTabs
          moduleNumber={3}
          learnContent={<LearnContent />}
          practiceContent={<PromptWizard />}
          applyContent={<ApplyContent />}
        />
      </div>
    </CourseShell>
  );
}
