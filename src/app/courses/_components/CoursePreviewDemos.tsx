'use client';

// CoursePreview with 5 concrete animated demos —
// replaces the prior abstract-illustration preview (bars/dots/lines).
// Each preview mirrors a current Foundation artifact:
// rewritten email, claim review, prompt builder, skill builder, workflow map, final packet.
//
// Ported from /Users/jgmbp/Downloads/aibi_course_preview_artifact_simulator (2).jsx
// (the polished JSX the user shared 2026-05-28). No lucide / no shadcn —
// inline SVG icons + mockup CSS tokens to match the rest of the site.

import { useCallback, useEffect, useState } from 'react';
import { ARTIFACT_FIRST_BY_MODULE } from '@content/courses/foundation-program/artifact-first';

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
    title: 'Name the safe boundary',
    eyebrow: 'Module 01',
    lesson: 'Separate draft support from human-owned banking decisions.',
    artifact: ARTIFACT_FIRST_BY_MODULE[1].saved,
    icon: BookIcon,
  },
  {
    title: 'Catch bad AI claims',
    eyebrow: 'Module 03',
    lesson: 'Flag numbers, dates, names, and policy claims before trusting output.',
    artifact: ARTIFACT_FIRST_BY_MODULE[3].saved,
    icon: ChatIcon,
  },
  {
    title: 'Build a reusable prompt',
    eyebrow: 'Module 04',
    lesson: 'Turn a weak prompt into a reusable strategy with review rules.',
    artifact: ARTIFACT_FIRST_BY_MODULE[4].saved,
    icon: WorkflowIcon,
  },
  {
    title: 'Build a reusable skill',
    eyebrow: 'Module 13',
    lesson: 'Turn a repeated task into a saved skill template.',
    artifact: ARTIFACT_FIRST_BY_MODULE[13].saved,
    icon: WorkflowIcon,
  },
  {
    title: 'Map a workflow',
    eyebrow: 'Module 14',
    lesson: 'Mark AI steps, human handoffs, and blocked decisions.',
    artifact: ARTIFACT_FIRST_BY_MODULE[14].saved,
    icon: FileIcon,
  },
  {
    title: 'Review the final packet',
    eyebrow: 'Module 18',
    lesson: 'Show safe prompting, verification, limits, and human judgment.',
    artifact: ARTIFACT_FIRST_BY_MODULE[18].saved,
    icon: SparklesIcon,
  },
];

const FRAME_MS = 1500;
const FRAME_COUNT = 4;

// ---------- Root component ----------

export function CoursePreviewDemos() {
  const [activeIndex, setActiveIndex] = useState(2);
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
          <p className="cpd-kicker cpd-kicker-on-dark">Builder previews</p>
          <h3 className="cpd-head-h">Use the builder. Save the reusable template.</h3>
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
      <p className="cpd-kicker">Sample mileposts</p>
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
    case 'Catch bad AI claims':
      return <ClaimReviewDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'Build a reusable prompt':
      return <PromptTypingDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'Build a reusable skill':
      return <SkillBuilderDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'Rewrite a work note':
      return <SkillFileDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'Map a workflow':
      return <WorkflowDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    case 'Review the final packet':
      return <FinalPackageDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
    default:
      return <ClaimReviewDemo frameIndex={frameIndex} artifact={activeModule.artifact} />;
  }
}

// ---------- Demo: Claim review ----------

const CLAIM_REVIEW_ROWS = [
  {
    claim: 'Policy effective date: July 1',
    verdict: 'Verify',
    evidence: 'Date appears with no cited source.',
    flagged: true,
  },
  {
    claim: 'Procedure requires manager sign-off',
    verdict: 'Verified',
    evidence: 'Matches the supplied source excerpt.',
    flagged: false,
  },
  {
    claim: 'All community banks are exempt',
    verdict: 'Wrong',
    evidence: 'Contradicts the training source.',
    flagged: true,
  },
  {
    claim: 'Summary is draft-only',
    verdict: 'Verified',
    evidence: 'Human review boundary is explicit.',
    flagged: false,
  },
] as const;

function ClaimReviewDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  return (
    <DemoShell artifact={artifact} label="Flag claims before trusting the output">
      <div className="cpd-demo-card cpd-tf">
        {CLAIM_REVIEW_ROWS.map((row, index) => {
          const active = frameIndex >= index;
          return (
            <div
              key={row.claim}
              className={`cpd-tf-row${active ? ' is-active' : ''}${row.flagged ? ' is-blocked' : ''}`}
            >
              <div>
                <p className="cpd-tf-task">{row.claim}</p>
                <p className="cpd-tf-control">{row.evidence}</p>
              </div>
              <span className={`cpd-tf-pill${row.flagged ? ' is-blocked' : ''}`}>{row.verdict}</span>
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
    <DemoShell artifact={artifact} label="AiBI Lab prompt practice">
      <div className="cpd-chat-card">
        <div className="cpd-chat-titlebar">
          <span className="cpd-traffic-dot" style={{ background: '#f5a8a8' }} />
          <span className="cpd-traffic-dot" style={{ background: '#f5cf86' }} />
          <span className="cpd-traffic-dot" style={{ background: '#8de2bf' }} />
          <span className="cpd-chat-tag">AiBI Lab</span>
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

// ---------- Demo: Skill builder ----------

const SKILL_BUILDER_FIELDS = [
  {
    label: 'Role',
    value: 'Branch operations lead',
    note: 'Who will reuse the skill',
  },
  {
    label: 'Task',
    value: 'Summarize daily exception notes',
    note: 'The repeated work pattern',
  },
  {
    label: 'Format',
    value: 'Action table with owner and deadline',
    note: 'What the output must look like',
  },
  {
    label: 'Constraint',
    value: 'Use placeholders. No customer identifiers.',
    note: 'The safety boundary',
  },
] as const;

const SKILL_TEMPLATE_LINES = [
  '# Reusable Skill Template',
  'Name: Daily exception-note summary',
  'Role: Branch operations lead',
  'Task: Summarize exception notes',
  'Format: Action table',
  'Constraints:',
  '- Replace names with placeholders',
  '- Flag missing source detail as [VERIFY]',
  '- Human reviewer owns final use',
  'Reuse: paste into approved AI tool',
] as const;

const SKILL_TEMPLATE_VISIBLE_COUNTS = [3, 5, 8, SKILL_TEMPLATE_LINES.length] as const;

function SkillBuilderDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const visibleCount = SKILL_TEMPLATE_VISIBLE_COUNTS[frameIndex];
  const saved = frameIndex >= 3;

  return (
    <DemoShell artifact={artifact} label="Skill Builder turns repeated work into a reusable template">
      <div className="cpd-skill-grid">
        <div className="cpd-demo-card cpd-tf">
          {SKILL_BUILDER_FIELDS.map((field, index) => {
            const active = frameIndex >= Math.min(index, 3);
            return (
              <div key={field.label} className={`cpd-tf-row${active ? ' is-active' : ''}`}>
                <div>
                  <p className="cpd-kicker">{field.label}</p>
                  <p className="cpd-tf-task">{field.value}</p>
                  <p className="cpd-tf-control">{field.note}</p>
                </div>
                <span className="cpd-tf-pill">{active ? 'set' : 'draft'}</span>
              </div>
            );
          })}
        </div>

        <div className="cpd-skill-file">
          <div className="cpd-skill-file-bar">
            <span className="cpd-skill-file-name">
              <FileIcon size={14} /> reusable-skill-template.md
            </span>
            <span className={`cpd-skill-file-status${saved ? ' is-saved' : ''}`}>
              {saved ? 'saved' : 'draft'}
            </span>
          </div>
          <pre className="cpd-skill-file-pre">
            {SKILL_TEMPLATE_LINES.slice(0, visibleCount).map((line, i) => (
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

// ---------- Demo: Rewritten email artifact ----------

const SKILL_FILE_LINES = [
  '# Module 01 Artifact: Rewritten Email',
  '',
  'Purpose: Turn a rushed internal note into a clear staff bulletin.',
  '',
  'Original note:',
  '- Kiosk workflow buggy',
  '- Use iPad workflow for now',
  '- IT is aware',
  '',
  'Review rules:',
  '- Strip names and account data',
  '- Keep facts only',
  '- Add owner and deadline',
  '',
  'Output:',
  '- Clear staff bulletin',
  '- Reusable rewrite prompt',
  '- Human review note',
  '',
  'Saved to: Foundation Packet',
  'Toolbox: reusable rewrite prompt',
  'Status: reviewed draft',
] as const;

const SKILL_VISIBLE_COUNTS = [4, 9, 17, SKILL_FILE_LINES.length] as const;

function SkillFileDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const visibleCount = SKILL_VISIBLE_COUNTS[frameIndex];
  const converting = frameIndex >= 1;
  const saved = frameIndex >= 3;

  return (
    <DemoShell artifact={artifact} label="Practice, review, and save the module artifact">
      <div className="cpd-skill-grid">
        <div className="cpd-skill-prompt">
          <p className="cpd-kicker">Original staff note</p>
          <div className="cpd-skill-prompt-text">
            <p>
              Kiosk workflow is buggy. IT knows. Please use the iPad workflow until
              we confirm the fix. Make the message clear for branch staff.
            </p>
          </div>
          <div className={`cpd-skill-convert${converting ? ' is-active' : ''}`}>
            {converting ? 'Review draft' : 'Sample ready'}
          </div>
        </div>

        <div className="cpd-skill-file">
          <div className="cpd-skill-file-bar">
            <span className="cpd-skill-file-name">
              <FileIcon size={14} /> module-01-rewritten-email.md
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

// ---------- Demo: Workflow map ----------

const WORKFLOW_DRAFT_LINES = [
  '# Workflow Map',
  'Use case: Procedure update review',
  'AI step: summarize permitted source',
  'Human handoff: branch ops review',
  'Blocked decision: customer-impacting exception',
  'Evidence: source note + reviewer sign-off',
] as const;

function WorkflowDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const aiDraft = frameIndex >= 1;
  const reviewOpen = frameIndex >= 2;
  const saved = frameIndex >= 3;

  return (
    <DemoShell artifact={artifact} label="Map AI steps, human handoffs, and blocked decisions">
      <div className="cpd-wf-grid">
        <div className="cpd-wf-source">
          <div className="cpd-wf-source-head">
            <span className="cpd-wf-source-name">
              <FileIcon size={14} /> approved-source-excerpt.pdf
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
              <WorkflowIcon size={14} /> workflow-map.md
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
              <p className="cpd-wf-review-text">Reviewer confirms what AI can support and what stays blocked.</p>
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

// ---------- Demo: Final lab package ----------

const AGENT_LOG_ITEMS = [
  { label: 'Scenario loaded', value: 'sample banking task only', icon: FileIcon },
  { label: 'AiBI Lab run', value: 'Drafting from permitted context', icon: SparklesIcon },
  { label: 'Evidence captured', value: 'Prompt, output, and review note', icon: FileIcon },
  { label: 'Review needed', value: 'Human judgment before reuse', icon: UserCheckIcon },
] as const;

const AGENT_DRAFT_LINES = [
  {
    title: 'Prompt used',
    text:
      'The final package includes the prompt, the sanitized source context, and the reason the task is safe for AI support.',
    verify: false,
  },
  {
    title: 'AI-assisted output',
    text:
      'The draft output is preserved as evidence, not treated as final decisioning or customer-ready language.',
    verify: false,
  },
  {
    title: 'Human review note',
    text:
      'The learner names what they changed, what they verified, and what still requires an approved reviewer.',
    verify: false,
  },
  {
    title: '[VERIFY] boundary statement',
    text:
      'The submission states what data was excluded and which decisions remain outside the AI-assisted workflow.',
    verify: true,
  },
] as const;

function FinalPackageDemo({ frameIndex, artifact }: { frameIndex: number; artifact: string }) {
  const needsApproval = frameIndex >= 3;
  const drafting = frameIndex >= 2;

  return (
    <DemoShell artifact={artifact} label="Package the prompt, output, review note, and safety boundary">
      <div className="cpd-agent-grid">
        <div className="cpd-agent-run">
          <div className="cpd-agent-run-head">
            <div>
              <p className="cpd-kicker cpd-kicker-on-dark">Final lab</p>
              <h4 className="cpd-agent-run-h">Foundation Package</h4>
            </div>
            <span className="cpd-agent-run-badge">
              <SparklesIcon size={26} />
            </span>
          </div>
          <div className="cpd-agent-log">
            <p className="cpd-kicker cpd-kicker-on-dark cpd-agent-log-label">
              What the learner proves
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
            <p className="cpd-kicker">Final package contents</p>
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
              <FileIcon size={14} /> final-foundation-lab.md
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
                  The draft stops here. A human reviews the package before it is saved or shared.
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
