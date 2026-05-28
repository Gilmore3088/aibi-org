'use client';

// CoursePreview with 5 concrete animated demos —
// replaces the prior abstract-illustration preview (bars/dots/lines).
// Each module shows real banking content the learner actually produces:
// Task fit table, prompt rewrite, .skill.md file, SOP draft, agent run log.
//
// Ported from /Users/jgmbp/Downloads/aibi_course_preview_artifact_simulator (2).jsx
// (the polished JSX the user shared 2026-05-28). No lucide / no shadcn —
// inline SVG icons + mockup CSS tokens to match the rest of the site.

import { useCallback, useEffect, useState } from 'react';

// ---------- Icons (inline SVG) ----------

type IconProps = { size?: number; className?: string };
const sw = (p: IconProps) => ({
  width: p.size ?? 16,
  height: p.size ?? 16,
  className: p.className,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const BookIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>);
const ChatIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const WorkflowIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h3a3 3 0 0 1 3 3v3" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const SparklesIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" /><path d="M5 17l.7 2.3L8 20l-2.3.7L5 23l-.7-2.3L2 20l2.3-.7z" /></svg>);
const UserCheckIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>);
const CheckCircleIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><polyline points="9 12 12 15 16 10" /></svg>);
const PlayIcon = (p: IconProps) => (<svg {...sw(p)}><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" /></svg>);
const PauseIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" /></svg>);

// ---------- Module data ----------

interface ModuleData {
  readonly title: string;
  readonly eyebrow: string;
  readonly lesson: string;
  readonly artifact: string;
  readonly icon: (p: IconProps) => JSX.Element;
}

const MODULES: readonly ModuleData[] = [
  {
    title: 'Choose the right task',
    eyebrow: 'Task fit',
    lesson: 'Classify the task before prompting.',
    artifact: 'AI Task Fit Card',
    icon: BookIcon,
  },
  {
    title: 'Improve a prompt',
    eyebrow: 'Prompt rewrite',
    lesson: 'Rewrite a weak prompt into a review-ready prompt.',
    artifact: 'Prompt Strategy Cheat Sheet',
    icon: ChatIcon,
  },
  {
    title: 'Save a skill',
    eyebrow: 'Skill builder',
    lesson: 'Save a strong prompt as a reusable skill file.',
    artifact: 'Saved Skill Template',
    icon: WorkflowIcon,
  },
  {
    title: 'Build a workflow',
    eyebrow: 'Workflow builder',
    lesson: 'Turn one source document into a reviewed SOP.',
    artifact: 'AI Workflow SOP',
    icon: FileIcon,
  },
  {
    title: 'See an agent work',
    eyebrow: 'Agent preview',
    lesson: 'Watch an agent draft, pause, and wait for approval.',
    artifact: 'Agent Review Checklist',
    icon: SparklesIcon,
  },
];

const FRAME_MS = 1500;
const FRAME_COUNT = 4;

// ---------- Root component ----------

export function CoursePreviewDemos() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const activeModule = MODULES[activeIndex];

  useEffect(() => {
    setFrameIndex(0);
  }, [activeIndex]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAME_COUNT);
    }, FRAME_MS);
    return () => window.clearInterval(timer);
  }, [playing, activeIndex]);

  const togglePlaying = useCallback(() => setPlaying((p) => !p), []);

  return (
    <div className="cpd-card">
      <CpdAnimationStyles />

      {/* Header band */}
      <div className="cpd-head">
        <div>
          <p className="cpd-kicker cpd-kicker-on-dark">Course preview</p>
          <h3 className="cpd-head-h">From rough prompt to reviewed artifact.</h3>
        </div>
        <div className="cpd-controls">
          <div className="cpd-frame-controls" role="group" aria-label="Preview steps">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFrameIndex(i)}
                className={`cpd-frame-btn${i === frameIndex ? ' is-active' : ''}`}
                aria-label={`Show preview step ${i + 1}`}
                aria-current={i === frameIndex ? 'true' : undefined}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={togglePlaying}
            className="cpd-playpause"
            aria-label={playing ? 'Pause preview' : 'Play preview'}
            aria-pressed={!playing}
          >
            {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
        </div>
      </div>

      {/* Two-column body */}
      <div className="cpd-body">
        <ModuleNav
          modules={MODULES}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
        <div className="cpd-detail">
          <div className="cpd-lesson">
            <span className="cpd-lesson-icon">
              <activeModule.icon size={22} />
            </span>
            <div>
              <p className="cpd-kicker">Lesson preview</p>
              <h4 className="cpd-lesson-h">{activeModule.lesson}</h4>
            </div>
          </div>

          <ModuleDemo activeModule={activeModule} frameIndex={frameIndex} />
        </div>
      </div>
    </div>
  );
}

// ---------- Left-rail module nav ----------

function ModuleNav({
  modules,
  activeIndex,
  onSelect,
}: {
  readonly modules: readonly ModuleData[];
  readonly activeIndex: number;
  readonly onSelect: (i: number) => void;
}) {
  return (
    <div className="cpd-nav">
      <p className="cpd-kicker">Learning path</p>
      <div className="cpd-nav-list">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          const active = activeIndex === index;
          return (
            <button
              key={mod.title}
              type="button"
              onClick={() => onSelect(index)}
              className={`cpd-nav-btn${active ? ' is-active' : ''}`}
              aria-pressed={active}
            >
              <span className="cpd-nav-btn-icon">
                <Icon size={18} />
              </span>
              <span>
                <span className="cpd-nav-btn-eyebrow">{mod.eyebrow}</span>
                <span className="cpd-nav-btn-title">{mod.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Demo dispatcher ----------

function ModuleDemo({
  activeModule,
  frameIndex,
}: {
  readonly activeModule: ModuleData;
  readonly frameIndex: number;
}) {
  switch (activeModule.title) {
    case 'Improve a prompt':
      return <PromptTypingDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'Save a skill':
      return <SkillFileDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'Build a workflow':
      return <WorkflowDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'See an agent work':
      return <AgentDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    default:
      return <TaskFitDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
  }
}

// ---------- Demo: Task fit ----------

const TASK_FIT_ROWS = [
  { task: 'Branch huddle notes', fit: 'Good fit', control: 'Manager review', blocked: false },
  { task: 'Public guidance', fit: 'Good fit', control: 'Source check', blocked: false },
  { task: 'Credit decision', fit: 'Do not use', control: 'Escalate', blocked: true },
  { task: 'Team examples', fit: 'Reusable guide', control: 'Approved', blocked: false },
] as const;

function TaskFitDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  return (
    <DemoShell artifact={artifact} label="Classify before prompting">
      <div className="cpd-demo-card cpd-tf">
        {TASK_FIT_ROWS.map((row, index) => {
          const active = frameIndex >= index;
          return (
            <div
              key={row.task}
              className={`cpd-tf-row${active ? ' is-active' : ''}${row.blocked ? ' is-blocked' : ''}`}
            >
              <div>
                <p className="cpd-tf-task">{row.task}</p>
                <p className="cpd-tf-control">{row.control}</p>
              </div>
              <span className={`cpd-tf-pill${row.blocked ? ' is-blocked' : ''}`}>{row.fit}</span>
            </div>
          );
        })}
      </div>
    </DemoShell>
  );
}

// ---------- Demo: Prompt typing ----------

const PROMPT_DRAFTS = [
  'Summarize this procedure',
  'Rewrite this procedure for frontline branch staff',
  'Rewrite this procedure for frontline branch staff. Use plain language. Keep policy meaning intact.',
  'Rewrite this procedure for frontline branch staff. Use plain language. Keep policy meaning intact. Flag unclear items with [VERIFY]. Include escalation triggers. This is a draft for manager review.',
] as const;

const AI_DRAFT_ITEMS = ['Purpose', 'Key steps', 'Escalation trigger', '[VERIFY] unclear exception'] as const;

function PromptTypingDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const currentPrompt = PROMPT_DRAFTS[frameIndex];
  const showRewriting = frameIndex === 1;
  const showResponse = frameIndex >= 2;
  const canSend = frameIndex >= 3;

  return (
    <DemoShell artifact={artifact} label="Prompt builder experience">
      <div className="cpd-chat-card">
        <div className="cpd-chat-titlebar">
          <span className="cpd-traffic-dot" style={{ background: '#f5a8a8' }} />
          <span className="cpd-traffic-dot" style={{ background: '#f5cf86' }} />
          <span className="cpd-traffic-dot" style={{ background: '#8de2bf' }} />
          <span className="cpd-chat-tag">Practice chat</span>
        </div>

        <div className="cpd-chat-body">
          <div className="cpd-chat-msg cpd-chat-msg-bot">
            <p className="cpd-kicker">Prompt Builder</p>
            <p className="cpd-chat-msg-body">
              Build the prompt in layers: task, audience, constraints, output, and review.
            </p>
          </div>

          <div className="cpd-chat-msg cpd-chat-msg-user">
            <p className="cpd-kicker cpd-kicker-on-dark">You</p>
            <p className="cpd-chat-msg-prompt">
              {currentPrompt}
              <span className="cpd-cursor" aria-hidden />
            </p>
            <div className="cpd-chat-msg-foot">
              <span className={`cpd-chat-tag-pill${showRewriting ? ' is-warn' : ''}`}>
                {showRewriting ? 'rewriting' : frameIndex === 0 ? 'too vague' : 'improving'}
              </span>
              <span className={`cpd-send-pill${canSend ? ' is-active' : ''}`}>Send</span>
            </div>
          </div>

          <div className={`cpd-chat-msg cpd-chat-msg-bot cpd-chat-msg-response${showResponse ? ' is-visible' : ''}`}>
            <p className="cpd-kicker">AI draft</p>
            <div className="cpd-ai-list">
              {AI_DRAFT_ITEMS.map((item) => (
                <div key={item} className="cpd-ai-list-row">
                  <CheckCircleIcon size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

// ---------- Demo: Skill file ----------

const SKILL_FILE_LINES = [
  '# Skill: Procedure Translator',
  '',
  'Purpose: Convert approved procedure text into a frontline job aid.',
  '',
  'Allowed inputs:',
  '- Approved internal procedure text',
  '- Role or audience',
  '- Known escalation rules',
  '',
  'Blocked inputs:',
  '- Customer PII or NPI',
  '- Account numbers or balances',
  '- Examiner correspondence',
  '',
  'Output:',
  '- Plain-English staff summary',
  '- Escalation triggers',
  '- [VERIFY] items',
  '',
  'Reviewer: Department owner',
  'Version: v1.0',
  'Status: Ready to test',
] as const;

const SKILL_VISIBLE_COUNTS = [4, 9, 17, SKILL_FILE_LINES.length] as const;

function SkillFileDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const visibleCount = SKILL_VISIBLE_COUNTS[frameIndex];
  const converting = frameIndex >= 1;
  const saved = frameIndex >= 3;

  return (
    <DemoShell artifact={artifact} label="Save prompt as a skill file">
      <div className="cpd-skill-grid">
        <div className="cpd-skill-prompt">
          <p className="cpd-kicker">Approved prompt</p>
          <div className="cpd-skill-prompt-text">
            <p>
              Rewrite this procedure for frontline staff. Keep policy meaning intact. Flag
              unclear items with [VERIFY]. Include escalation triggers. Draft only.
            </p>
          </div>
          <div className={`cpd-skill-convert${converting ? ' is-active' : ''}`}>
            {converting ? 'Convert to skill' : 'Prompt ready'}
          </div>
        </div>

        <div className="cpd-skill-file">
          <div className="cpd-skill-file-bar">
            <span className="cpd-skill-file-name">
              <FileIcon size={14} /> procedure-translator.skill.md
            </span>
            <span className={`cpd-skill-file-status${saved ? ' is-saved' : ''}`}>
              {saved ? 'saved' : 'draft'}
            </span>
          </div>
          <pre className="cpd-skill-file-pre">
            {SKILL_FILE_LINES.slice(0, visibleCount).map((line, i) => (
              <div key={`${line}-${i}`} className="cpd-skill-line" style={{ animationDelay: `${i * 0.025}s` }}>
                {line || ' '}
              </div>
            ))}
            <span className="cpd-cursor cpd-cursor-on-dark" aria-hidden />
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}

// ---------- Demo: Workflow ----------

const WORKFLOW_DRAFT_LINES = [
  '# AI Workflow SOP',
  'Purpose: Explain the procedure update to staff.',
  'Input: Approved procedure-update.pdf',
  'Output: Draft staff job aid',
  'Reviewer: Branch operations manager',
  'Retention: Save reviewed SOP to toolbox',
] as const;

function WorkflowDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const aiDraft = frameIndex >= 1;
  const reviewOpen = frameIndex >= 2;
  const saved = frameIndex >= 3;

  return (
    <DemoShell artifact={artifact} label="Upload a procedure. Build a reviewed SOP.">
      <div className="cpd-wf-grid">
        <div className="cpd-wf-source">
          <div className="cpd-wf-source-head">
            <span className="cpd-wf-source-name">
              <FileIcon size={14} /> procedure-update.pdf
            </span>
            <span className="cpd-wf-source-status">uploaded</span>
          </div>
          <div className="cpd-wf-source-card">
            <p className="cpd-kicker">Source excerpt</p>
            <p className="cpd-wf-source-text">
              Branch staff must follow the updated exception process before releasing a hold.
              Escalate same-day exceptions to the branch operations manager.
            </p>
            <div className={`cpd-wf-highlights${aiDraft ? ' is-visible' : ''}`}>
              <SourceHighlight label="Key step found" />
              <SourceHighlight label="Exception found" />
              <SourceHighlight label="Escalation owner found" />
            </div>
          </div>
        </div>

        <div className="cpd-wf-output">
          <div className="cpd-wf-output-head">
            <span className="cpd-wf-output-name">
              <WorkflowIcon size={14} /> workflow-sop.md
            </span>
            <span
              className={`cpd-wf-output-status${
                saved ? ' is-saved' : reviewOpen ? ' is-review' : ''
              }`}
            >
              {saved ? 'saved' : reviewOpen ? 'review' : 'draft'}
            </span>
          </div>

          <div className="cpd-wf-output-code">
            {WORKFLOW_DRAFT_LINES.map((line, i) => (
              <div
                key={line}
                className={`cpd-wf-output-line${
                  aiDraft && i < frameIndex + 3 ? ' is-visible' : ''
                }`}
              >
                {line}
              </div>
            ))}
          </div>

          <div className={`cpd-wf-review${reviewOpen ? ' is-visible' : ''}`}>
            <UserCheckIcon size={18} />
            <div>
              <p className="cpd-kicker">Human review</p>
              <p className="cpd-wf-review-text">Manager approves before staff can reuse it.</p>
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

function SourceHighlight({ label }: { label: string }) {
  return (
    <div className="cpd-source-highlight">
      <span className="cpd-source-dot" />
      <span>{label}</span>
    </div>
  );
}

// ---------- Demo: Agent ----------

const AGENT_LOG_ITEMS = [
  { label: 'New file detected', value: 'procedure-update.pdf', icon: FileIcon },
  { label: 'Reading source', value: 'Finding changes staff need to know', icon: SparklesIcon },
  { label: 'Writing draft', value: 'Creating a plain-language staff summary', icon: FileIcon },
  { label: 'Review needed', value: 'One unclear item marked [VERIFY]', icon: UserCheckIcon },
] as const;

const AGENT_DRAFT_LINES = [
  {
    title: 'Draft staff summary',
    text:
      'The hold-release procedure has been updated. Staff should use the new exception step before releasing a hold outside the standard process.',
    verify: false,
  },
  {
    title: 'New exception step added',
    text:
      'Before releasing a same-day exception, confirm the reason for the exception and document the customer request in the account notes.',
    verify: false,
  },
  {
    title: 'Escalation required',
    text:
      'Same-day exceptions must be escalated to the branch operations manager before the final customer response is given.',
    verify: false,
  },
  {
    title: '[VERIFY] unclear policy item',
    text:
      'Confirm whether teller overrides are still allowed under the updated rule, or whether all overrides now require manager approval.',
    verify: true,
  },
] as const;

function AgentDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const needsApproval = frameIndex >= 3;
  const drafting = frameIndex >= 2;

  return (
    <DemoShell artifact={artifact} label="Agent drafts work, then pauses for approval.">
      <div className="cpd-agent-grid">
        <div className="cpd-agent-run">
          <div className="cpd-agent-run-head">
            <div>
              <p className="cpd-kicker cpd-kicker-on-dark">Agent run</p>
              <h4 className="cpd-agent-run-h">Procedure Aid Agent</h4>
            </div>
            <span className="cpd-agent-run-badge">
              <SparklesIcon size={26} />
            </span>
          </div>
          <div className="cpd-agent-log">
            <p className="cpd-kicker cpd-kicker-on-dark cpd-agent-log-label">
              What the agent is doing
            </p>
            <div className="cpd-agent-log-list">
              {AGENT_LOG_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const active = frameIndex >= index;
                const waiting = item.label === 'Review needed';
                return (
                  <div
                    key={item.label}
                    className={`cpd-agent-log-row${active ? ' is-active' : ''}`}
                  >
                    <span
                      className={`cpd-agent-log-icon${waiting && active ? ' is-waiting' : ''}`}
                    >
                      <Icon size={14} />
                    </span>
                    <span>
                      <span className="cpd-agent-log-row-label">{item.label}</span>
                      <span className="cpd-agent-log-row-value">{item.value}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="cpd-agent-out">
          <div className="cpd-agent-out-head">
            <p className="cpd-kicker">Draft output being created</p>
            <span
              className={`cpd-agent-out-status${
                needsApproval ? ' is-approval' : drafting ? ' is-drafting' : ''
              }`}
            >
              {needsApproval ? 'needs approval' : drafting ? 'drafting' : 'working'}
            </span>
          </div>

          <div className="cpd-agent-out-card">
            <div className="cpd-agent-out-name">
              <FileIcon size={14} /> draft-staff-summary.md
            </div>

            <div className="cpd-agent-draft-list">
              {AGENT_DRAFT_LINES.map((line, index) => {
                const active = frameIndex >= Math.max(1, index);
                return (
                  <div
                    key={line.title}
                    className={`cpd-agent-draft-row${active ? ' is-active' : ''}${
                      line.verify ? ' is-verify' : ''
                    }`}
                  >
                    <p
                      className={`cpd-kicker${
                        line.verify ? ' cpd-kicker-gold' : ''
                      }`}
                    >
                      {line.title}
                    </p>
                    <p className="cpd-agent-draft-text">{line.text}</p>
                  </div>
                );
              })}
            </div>

            <div className={`cpd-agent-approval${needsApproval ? ' is-visible' : ''}`}>
              <UserCheckIcon size={18} />
              <div>
                <p className="cpd-kicker cpd-kicker-gold">Manager approval</p>
                <p className="cpd-agent-approval-text">
                  The agent waits here. A human reviews the draft before it is saved or shared.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

// ---------- Shared demo shell ----------

function DemoShell({
  artifact,
  label,
  children,
}: {
  readonly artifact: string;
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="cpd-shell">
      <div className="cpd-shell-head">
        <p className="cpd-kicker">{label}</p>
        <span className="cpd-live-pill">Live preview</span>
      </div>
      {children}
      <div className="cpd-leave">
        <p className="cpd-kicker">Learner leaves with</p>
        <p className="cpd-leave-artifact">{artifact}</p>
      </div>
    </div>
  );
}

// ---------- Animation styles (scoped) ----------

function CpdAnimationStyles() {
  return (
    <style>{`
      .cpd-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background: var(--gold);
        margin-left: 4px;
        vertical-align: middle;
        animation: cpd-blink 1s step-end infinite;
      }
      .cpd-cursor-on-dark { background: var(--gold-soft); }
      .cpd-skill-line { animation: cpd-line-in 0.24s ease both; }
      @keyframes cpd-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      @keyframes cpd-line-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .cpd-card * { animation: none !important; transition: none !important; }
      }
    `}</style>
  );
}
