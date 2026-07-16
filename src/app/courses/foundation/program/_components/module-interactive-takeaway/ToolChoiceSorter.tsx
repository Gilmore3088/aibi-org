'use client';

import { useState } from 'react';
import type {
  DraftPayload,
  ModuleInteractiveTakeawayProps,
  ToolCategory,
  ToolChoiceAnswer,
  ToolZone,
} from './types';
import { saveInteractiveDraft } from './saveInteractiveDraft';

const TOOL_CATEGORY_LABEL: Record<ToolCategory, string> = {
  general: 'General chat',
  copilot: 'Workplace copilot',
  search: 'Search-answer',
  notebook: 'Notebook',
  escalate: 'Escalate',
};

const TOOL_ZONE_LABEL: Record<ToolZone, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
};

const TOOL_CHOICE_TASKS: readonly {
  readonly id: string;
  readonly task: string;
  readonly correctCategory: ToolCategory;
  readonly correctZone: ToolZone;
  readonly reason: string;
}[] = [
  {
    id: 'public-reg-update',
    task: 'Summarize a public FDIC article for tomorrow morning huddle.',
    correctCategory: 'search',
    correctZone: 'green',
    reason: 'Public source, low sensitivity, and source links matter more than chat fluency.',
  },
  {
    id: 'policy-compare',
    task: 'Compare two internal policy PDFs and extract changed review steps.',
    correctCategory: 'notebook',
    correctZone: 'yellow',
    reason: 'The source set should stay bounded, and internal documents need an approved tool.',
  },
  {
    id: 'denial-notice',
    task: 'Draft a member-specific denial notice from an application file.',
    correctCategory: 'escalate',
    correctZone: 'red',
    reason: 'Credit decisions and customer-specific data belong in approved controlled processes.',
  },
  {
    id: 'meeting-summary',
    task: 'Summarize a Teams meeting transcript already stored in the institution tenant.',
    correctCategory: 'copilot',
    correctZone: 'yellow',
    reason: 'The data is internal, and the safer path is the approved workplace environment.',
  },
] as const;

export function UnusedToolChoiceSorter({
  moduleId,
  artifactLabel,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ToolChoiceAnswer>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const activeTask = TOOL_CHOICE_TASKS[activeIndex] ?? TOOL_CHOICE_TASKS[0];
  const activeAnswer = answers[activeTask.id] ?? {};
  const answered = TOOL_CHOICE_TASKS.filter((task) => answers[task.id]?.category && answers[task.id]?.zone).length;
  const score = TOOL_CHOICE_TASKS.filter((task) => {
    const answer = answers[task.id];
    return answer?.category === task.correctCategory && answer.zone === task.correctZone;
  }).length;
  const complete = answered === TOOL_CHOICE_TASKS.length;
  const activeCorrect =
    activeAnswer.category === activeTask.correctCategory && activeAnswer.zone === activeTask.correctZone;
  const activeAnswered = Boolean(activeAnswer.category && activeAnswer.zone);

  function updateAnswer(next: ToolChoiceAnswer) {
    setSavedAt(null);
    setAnswers((current) => ({
      ...current,
      [activeTask.id]: {
        ...current[activeTask.id],
        ...next,
      },
    }));
  }

  function save() {
    const saved = new Date().toISOString();
    const rows = TOOL_CHOICE_TASKS.map((task) => {
      const answer = answers[task.id] ?? {};
      return `| ${task.task} | ${answer.category ? TOOL_CATEGORY_LABEL[answer.category] : 'Not selected'} | ${answer.zone ? TOOL_ZONE_LABEL[answer.zone] : 'Not selected'} | ${TOOL_CATEGORY_LABEL[task.correctCategory]} / ${TOOL_ZONE_LABEL[task.correctZone]} | ${task.reason} |`;
    }).join('\n');
    const content = `# Tool Choice Map\n\n| Task | Chosen tool path | Data zone | Model answer | Reason |\n| --- | --- | --- | --- | --- |\n${rows}\n\n## Reuse rule\nCapability does not equal approval. Match the work to source, data class, and approved tool before prompting.`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 7,
      model: 'AiBI tool choice sorter',
      dataset: 'Tool Choice Scenarios',
      savedAt: saved,
      reviewChecklist: ['Tool category matches the task', 'Data zone is named before prompting', 'Approval and capability are treated separately'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-tool-choice-sorter">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the decision map</p>
          <h3>Tool Choice Sorter</h3>
          <p>Pick the tool path and data zone before the task reaches a prompt window.</p>
        </div>
        <span className="foundation-interactive-score">{score}/{TOOL_CHOICE_TASKS.length} mapped</span>
      </div>

      <div className="foundation-tool-choice__workspace">
        <div className="foundation-tool-choice__queue" aria-label="Tool-choice tasks">
          {TOOL_CHOICE_TASKS.map((task, index) => {
            const answer = answers[task.id];
            const done = Boolean(answer?.category && answer.zone);
            const correct = answer?.category === task.correctCategory && answer.zone === task.correctZone;
            return (
              <button
                key={task.id}
                type="button"
                aria-pressed={index === activeIndex}
                className="foundation-tool-choice__queue-item"
                onClick={() => setActiveIndex(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{task.task}</strong>
                <small>{done ? (correct ? 'Mapped' : 'Needs review') : 'Not mapped'}</small>
              </button>
            );
          })}
        </div>

        <div className="foundation-tool-choice__decision">
          <div className="foundation-tool-panel">
            <p className="foundation-tool-panel__label">Task</p>
            <h4>{activeTask.task}</h4>
          </div>

          <div className="foundation-tool-choice__options">
            <div>
              <p className="foundation-tool-panel__label">Tool path</p>
              <div className="foundation-tool-choice__button-grid">
                {(Object.keys(TOOL_CATEGORY_LABEL) as ToolCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeAnswer.category === category}
                    className="foundation-claim-choice"
                    onClick={() => updateAnswer({ category })}
                  >
                    {TOOL_CATEGORY_LABEL[category]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="foundation-tool-panel__label">Data zone</p>
              <div className="foundation-tool-choice__button-grid foundation-tool-choice__button-grid--zones">
                {(Object.keys(TOOL_ZONE_LABEL) as ToolZone[]).map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    aria-pressed={activeAnswer.zone === zone}
                    className="foundation-claim-choice"
                    onClick={() => updateAnswer({ zone })}
                  >
                    {TOOL_ZONE_LABEL[zone]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`foundation-tool-panel foundation-tool-panel--${!activeAnswered ? 'warn' : activeCorrect ? 'good' : 'bad'}`}>
            <p className="foundation-tool-panel__label">
              {!activeAnswered ? 'Feedback' : activeCorrect ? 'Good fit' : 'Review the match'}
            </p>
            <p>
              {activeAnswered
                ? activeTask.reason
                : 'Choose both the tool path and the data zone. The reason appears after your decision.'}
            </p>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : `${answered}/${TOOL_CHOICE_TASKS.length} tasks mapped`}
        </button>
        <p>{complete ? 'The map is ready to reuse before the next AI task.' : 'Make the routing decision before the prompt.'}</p>
      </div>
    </section>
  );
}
