'use client';

import { useState } from 'react';
import {
  SiteHeader,
  Section,
  Button,
  EyebrowChip,
} from '@/components/mockup';

type IconProps = { className?: string; size?: number };
const sw = (p: IconProps) => ({
  className: p.className,
  width: p.size,
  height: p.size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const FlaskIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M10 2v7.31" /><path d="M14 9.3V2" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /></svg>);
const PlayIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const BadgeIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M9 11l3 3L22 4" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const UserCheckIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M16 11l2 2 4-4" /><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /></svg>);
const ShieldCheckIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>);
const LockIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const SaveIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /></svg>);
const RefreshIcon = (p: IconProps) => (<svg {...sw(p)}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>);
const WorkflowIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M6 9v6h6M18 9v6h-6" /></svg>);
const CopyIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
const DownloadIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);

type Role = 'Operations' | 'Compliance' | 'Marketing' | 'Retail';

type Scenario = {
  id: string;
  title: string;
  goal: string;
  sampleData: string;
  prompt: string;
  outputType: string;
  reviewOwner: string;
  risk: 'Low' | 'Medium' | 'High';
};

const SCENARIOS: Record<Role, Scenario[]> = {
  Operations: [
    { id: 'procedure', title: 'Procedure Cleanup', goal: 'Turn dense internal procedure text into a frontline job aid.', sampleData: 'A sample internal procedure for handling account maintenance exceptions. The source text is intentionally dense and fictional.', prompt: 'Rewrite this internal procedure as a frontline job aid. Use plain language, numbered steps, exceptions, risk notes, and a manager review checklist. Do not change the policy meaning.', outputType: 'Job aid', reviewOwner: 'Manager', risk: 'Medium' },
    { id: 'handoff', title: 'Team Handoff Summary', goal: 'Convert meeting notes into a clear operational handoff.', sampleData: 'Fictional notes from an operations team discussion about process ownership and next steps.', prompt: 'Create a handoff summary with owner, next step, open risk, due date, and review owner. Flag missing details.', outputType: 'Handoff summary', reviewOwner: 'Process owner', risk: 'Low' },
  ],
  Compliance: [
    { id: 'use-case-review', title: 'AI Use-Case Review', goal: 'Structure a proposed AI use case for compliance review.', sampleData: 'A fictional business team wants to use AI to summarize internal policy updates for staff.', prompt: 'Create an AI use-case review summary. Include business purpose, tool, data used, expected output, risks, reviewer, approval checkpoint, and retention rule.', outputType: 'Review packet', reviewOwner: 'Compliance officer', risk: 'High' },
    { id: 'review-checklist', title: 'Output Review Checklist', goal: 'Create a review checklist for AI-generated work.', sampleData: 'A fictional team wants to use AI-generated content before sharing it internally.', prompt: 'Create a review checklist for AI-generated output. Include accuracy, data sensitivity, customer impact, approval owner, escalation triggers, and retention guidance.', outputType: 'Checklist', reviewOwner: 'Compliance officer', risk: 'Medium' },
  ],
  Marketing: [
    { id: 'campaign-review', title: 'Campaign Review Prep', goal: 'Prepare AI-assisted marketing copy for review.', sampleData: 'A fictional deposit promotion campaign brief with audience, channel, offer, and required disclosures.', prompt: 'Draft campaign copy options and a compliance review checklist. Flag claims, missing disclosures, urgency language, and approval questions.', outputType: 'Campaign review workspace', reviewOwner: 'Marketing + Compliance', risk: 'High' },
  ],
  Retail: [
    { id: 'coaching-guide', title: 'Branch Coaching Guide', goal: 'Turn a customer service scenario into coaching guidance.', sampleData: 'A fictional customer service situation involving confusion about digital banking enrollment.', prompt: 'Create a branch coaching guide. Include the scenario, coaching points, suggested language, escalation note, and manager checklist.', outputType: 'Coaching guide', reviewOwner: 'Branch manager', risk: 'Low' },
  ],
};

const ROLES = Object.keys(SCENARIOS) as Role[];

const REVIEW_ITEMS = [
  'Output reviewed for accuracy',
  'No customer or confidential data included',
  'Human review owner identified',
  'Escalation rule is clear',
  'Retention rule confirmed',
];

const PROMPT_HELPERS: { label: string; addition: string }[] = [
  { label: 'Add role context', addition: '\n\nRole context: This is for a banking team member using AI for internal work only.' },
  { label: 'Add output sections', addition: '\n\nOutput format: Purpose, steps, risk notes, open questions, review checklist.' },
  { label: 'Add review requirement', addition: '\n\nReview requirement: Label the output as draft and identify the human reviewer before use.' },
  { label: 'Add data boundary', addition: '\n\nData boundary: Do not include customer identifiers, account numbers, SSNs, or confidential records.' },
];

function buildMockOutput(s: Scenario | null) {
  if (!s) return 'Run the scenario to generate a draft output.';
  if (s.outputType === 'Job aid') {
    return `# Draft Job Aid

## Purpose
Help frontline staff complete the process clearly and consistently.

## Steps
1. Confirm the request and identify the applicable procedure.
2. Review the approved process before taking action.
3. Complete the required steps in order.
4. Escalate exceptions to the review owner.
5. Document the completed action.

## Exceptions
- If the procedure is unclear, stop and escalate.
- If customer-specific data is involved, use approved systems only.

## Risk Notes
- This draft does not replace policy.
- Manager review is required before distribution.

## Reviewer Checklist
- [ ] Procedure meaning preserved
- [ ] Steps are accurate
- [ ] Exceptions are clear
- [ ] No customer data included`;
  }
  if (s.outputType === 'Review packet') {
    return `# AI Use-Case Review Packet

## Business Purpose
Summarize internal policy updates for staff awareness.

## Proposed Tool
AI writing assistant.

## Data Used
Internal policy text only. No customer data.

## Expected Output
Plain-English internal summary.

## Risks
- Inaccurate summary
- Missing context
- Unreviewed staff guidance

## Approval Checkpoint
Compliance review before distribution.

## Retention Rule
Save reviewed version and source reference.`;
  }
  return `# Draft Output

## Summary
The scenario has been converted into a structured, review-ready work product.

## Output Sections
- Purpose
- Key points
- Risk notes
- Open questions
- Review checklist

## Review Note
This output is a draft and requires review by ${s.reviewOwner}.`;
}

export default function PracticeSandboxPage() {
  const [role, setRole] = useState<Role>('Operations');
  const [scenarioId, setScenarioId] = useState(SCENARIOS.Operations[0].id);
  const [prompt, setPrompt] = useState(SCENARIOS.Operations[0].prompt);
  const [output, setOutput] = useState('Run the scenario to generate a draft output.');
  const [checked, setChecked] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const scenarioList = SCENARIOS[role];
  const scenario = scenarioList.find((s) => s.id === scenarioId) ?? scenarioList[0];
  const reviewComplete = checked.length === REVIEW_ITEMS.length;

  function changeRole(r: Role) {
    const first = SCENARIOS[r][0];
    setRole(r);
    setScenarioId(first.id);
    setPrompt(first.prompt);
    setOutput('Run the scenario to generate a draft output.');
    setChecked([]);
    setSaved(false);
  }
  function changeScenario(id: string) {
    const next = scenarioList.find((s) => s.id === id) ?? scenarioList[0];
    setScenarioId(next.id);
    setPrompt(next.prompt);
    setOutput('Run the scenario to generate a draft output.');
    setChecked([]);
    setSaved(false);
  }
  function applyHelper(addition: string) {
    setPrompt((cur) => cur + addition);
    setSaved(false);
  }
  function run() {
    setOutput(buildMockOutput(scenario));
    setSaved(false);
  }
  function toggle(item: string) {
    setChecked((cur) => (cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item]));
    setSaved(false);
  }
  async function copyOut() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(output);
      }
    } catch {
      /* noop */
    }
  }
  function downloadOut() {
    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.id}-sandbox-output.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/practice" cta={{ label: 'Back to Course', href: '/courses/foundation' }} />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<FlaskIcon className="mk-ic" />}>Signed-in sandbox</EyebrowChip>
            <h1>Practice safely before using AI at work.</h1>
            <p className="mk-lede">
              Use role-based scenarios, safe sample data, review checklists, and saveable outputs
              to turn lessons into usable work products.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" onClick={run}>
                Run Scenario <PlayIcon className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/my-toolbox">
                Open Toolbox <ArrowR className="mk-ic" />
              </Button>
            </div>
          </div>

          <div className="mk-pr-active">
            <div className="mk-head">
              <div className="mk-k">Active Scenario</div>
              <div className="mk-t">{scenario.title}</div>
            </div>
            <div className="mk-fields">
              <div className="mk-field-cell">
                <BadgeIcon size={24} />
                <div className="mk-l">Role</div>
                <div className="mk-v">{role}</div>
              </div>
              <div className="mk-field-cell">
                <FileIcon size={24} />
                <div className="mk-l">Output</div>
                <div className="mk-v">{scenario.outputType}</div>
              </div>
              <div className="mk-field-cell">
                <UserCheckIcon size={24} />
                <div className="mk-l">Review</div>
                <div className="mk-v">{scenario.reviewOwner}</div>
              </div>
              <div className="mk-field-cell">
                <ShieldCheckIcon size={24} />
                <div className="mk-l">Risk</div>
                <div className="mk-v">{scenario.risk}</div>
              </div>
            </div>
            <div className="mk-goal">
              <div className="mk-l">Scenario goal</div>
              <div className="mk-v">{scenario.goal}</div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <Section variant="std" contained={false}>
        <div className="mk-container mk-pr-body">
          {/* LEFT — scenario picker */}
          <aside className="mk-col">
            <div className="mk-panel">
              <div className="mk-panel-head">
                <div className="mk-k">Choose Scenario</div>
                <h3>Role and task</h3>
              </div>
              <div className="mk-panel-body">
                <div style={{ display: 'grid', gap: 8 }}>
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => changeRole(r)}
                      className={`mk-rf${role === r ? ' is-active' : ''}`}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="mk-og-rule" />
                <div style={{ display: 'grid', gap: 8 }}>
                  {scenarioList.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => changeScenario(s.id)}
                      className="mk-sz-pill"
                      style={{
                        background: scenarioId === s.id ? 'var(--gold)' : '#fff',
                        color: scenarioId === s.id ? 'var(--ink)' : 'var(--ink)',
                        borderColor: scenarioId === s.id ? 'var(--gold)' : 'var(--slate-200)',
                        width: '100%',
                      }}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mk-panel" style={{ marginTop: 16 }}>
              <div className="mk-panel-head">
                <div className="mk-k">Safe Sample Data</div>
              </div>
              <div className="mk-panel-body">
                <p style={{ color: 'var(--slate-600)', fontSize: 13, margin: 0 }}>
                  {scenario.sampleData}
                </p>
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    border: '1px solid var(--gold-a30)',
                    background: 'var(--gold-a10)',
                    borderRadius: 'var(--r-lg)',
                    display: 'flex',
                    gap: 12,
                  }}
                >
                  <LockIcon size={20} />
                  <p style={{ fontSize: 13, margin: 0, color: 'var(--slate-600)' }}>
                    Use fictional, redacted, or approved sample content only. Do not paste
                    customer or confidential data.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT — workspace + review */}
          <div className="mk-col">
            <div className="mk-pr-workspace">
              <div className="mk-pr-workspace-grid">
                <div className="mk-prompt-col">
                  <div style={{ marginBottom: 16 }}>
                    <div className="mk-k" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)' }}>
                      Prompt Workspace
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 600, margin: '6px 0 0' }}>Edit and run</h2>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      setSaved(false);
                    }}
                  />
                  <div className="mk-pr-helpers">
                    {PROMPT_HELPERS.map((h) => (
                      <button key={h.label} type="button" onClick={() => applyHelper(h.addition)}>
                        {h.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <Button variant="ink" onClick={run}>
                      Run Scenario <PlayIcon className="mk-ic" />
                    </Button>
                  </div>
                </div>

                <div className="mk-out-col">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div className="mk-k" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)' }}>
                        Draft Output
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: '4px 0 0' }}>
                        Review required before saving.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="ghost-light" onClick={copyOut}>
                        <CopyIcon className="mk-ic" />
                        Copy
                      </Button>
                      <Button variant="ghost-light" onClick={downloadOut}>
                        <DownloadIcon className="mk-ic" />
                        .md
                      </Button>
                    </div>
                  </div>
                  <pre className="mk-pr-output">{output}</pre>
                </div>
              </div>
            </div>

            <div className="mk-pr-review" style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                <div>
                  <div className="mk-k" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)' }}>
                    Review Before Saving
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 600, margin: '8px 0 0' }}>Turn practice into a reusable asset.</h3>
                </div>
                <span
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: 13,
                    fontWeight: 700,
                    background: reviewComplete ? 'rgba(4,120,87,0.12)' : 'var(--gold-a20)',
                    color: reviewComplete ? 'var(--emerald-800)' : 'var(--gold-deep)',
                  }}
                >
                  {checked.length}/{REVIEW_ITEMS.length} complete
                </span>
              </div>
              <div className="mk-pr-review-items">
                {REVIEW_ITEMS.map((item) => (
                  <label key={item} className="mk-pr-review-item">
                    <input
                      type="checkbox"
                      checked={checked.includes(item)}
                      onChange={() => toggle(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="mk-pr-actions">
                <Button variant="ink" onClick={() => setSaved(true)} disabled={!reviewComplete}>
                  <SaveIcon className="mk-ic" />
                  Save to Toolbox
                </Button>
                <Button variant="ghost-light" href="/my-toolbox/skill-builder">
                  <WorkflowIcon className="mk-ic" />
                  Convert to Skill
                </Button>
                <Button
                  variant="ghost-light"
                  onClick={() => {
                    setOutput('Run the scenario to generate a draft output.');
                    setChecked([]);
                    setSaved(false);
                  }}
                >
                  <RefreshIcon className="mk-ic" />
                  Try Again
                </Button>
              </div>
              {saved && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: 'var(--r-lg)',
                    background: 'rgba(4,120,87,0.10)',
                    color: 'var(--emerald-800)',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Reviewed sandbox output saved to toolbox.
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
