'use client';

import { useMemo, useState } from 'react';
import { Button, EyebrowChip, SiteHeader } from '@/components/mockup';
import { FreeResourceDownloadGate } from '@/components/resources/FreeResourceDownloadGate';
import {
  BadgeCheck,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Download,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from '../icons';

type PromptType =
  | 'Draft'
  | 'Summarize'
  | 'Rewrite'
  | 'Extract'
  | 'Compare'
  | 'Checklist'
  | 'Critique'
  | 'Scenario'
  | 'Data-to-narrative'
  | 'Builder brief';

type DataClass =
  | 'Public or synthetic'
  | 'Internal non-sensitive'
  | 'Confidential internal'
  | 'Customer NPI / PII'
  | 'Regulated or examiner-sensitive'
  | 'Security, credentials, or production access';

type ToolContext =
  | 'Public AI tool'
  | 'Approved enterprise AI'
  | 'Private environment'
  | 'Internal application';

type Audience =
  | 'Internal'
  | 'Customer'
  | 'Examiner'
  | 'Board'
  | 'Vendor'
  | 'Public'
  | 'Retained record';

type OutputFormat =
  | 'Bullets'
  | 'Table'
  | 'Checklist'
  | 'Email draft'
  | 'Script'
  | 'FAQ'
  | 'SOP'
  | 'Memo'
  | 'Markdown';

type RiskLane = 'Green' | 'Yellow' | 'Red';

interface PromptForm {
  readonly promptType: PromptType;
  readonly dataClass: DataClass;
  readonly toolContext: ToolContext;
  readonly audience: Audience;
  readonly outputFormat: OutputFormat;
  readonly userRole: string;
  readonly task: string;
  readonly sourceDescription: string;
  readonly constraints: string;
  readonly reviewer: string;
  readonly escalationTrigger: string;
}

const PROMPT_TYPES: readonly PromptType[] = [
  'Draft',
  'Summarize',
  'Rewrite',
  'Extract',
  'Compare',
  'Checklist',
  'Critique',
  'Scenario',
  'Data-to-narrative',
  'Builder brief',
];

const DATA_CLASSES: readonly DataClass[] = [
  'Public or synthetic',
  'Internal non-sensitive',
  'Confidential internal',
  'Customer NPI / PII',
  'Regulated or examiner-sensitive',
  'Security, credentials, or production access',
];

const TOOL_CONTEXTS: readonly ToolContext[] = [
  'Public AI tool',
  'Approved enterprise AI',
  'Private environment',
  'Internal application',
];

const AUDIENCES: readonly Audience[] = [
  'Internal',
  'Customer',
  'Examiner',
  'Board',
  'Vendor',
  'Public',
  'Retained record',
];

const OUTPUT_FORMATS: readonly OutputFormat[] = [
  'Bullets',
  'Table',
  'Checklist',
  'Email draft',
  'Script',
  'FAQ',
  'SOP',
  'Memo',
  'Markdown',
];

const DEFAULT_FORM: PromptForm = {
  promptType: 'Checklist',
  dataClass: 'Internal non-sensitive',
  toolContext: 'Approved enterprise AI',
  audience: 'Internal',
  outputFormat: 'Checklist',
  userRole: 'operations lead',
  task: 'turn an approved procedure summary into a staff handoff checklist',
  sourceDescription: '[APPROVED_PROCEDURE_SUMMARY] with no customer names, account numbers, transaction details, or credentials',
  constraints:
    'Preserve source meaning. Do not add policy requirements. Do not invent facts, rates, fees, dates, legal conclusions, or control requirements.',
  reviewer: 'process owner',
  escalationTrigger:
    'customer impact, credit, BSA/AML, fraud, authentication, complaints, examiner-facing material, legal/compliance interpretation, or prohibited data appears',
};

const REVIEW_ITEMS = [
  'Sensitive data removed or replaced with placeholders',
  'Tool is approved for the data class',
  'Prompt asks for draft support, not a final decision',
  'Output format is clear',
  'Uncertain items will be marked [VERIFY]',
  'Reviewer and escalation trigger are named',
];

const PROMPT_TYPE_HELP: Record<PromptType, string> = {
  Draft: 'Create first-pass language for a person to review.',
  Summarize: 'Condense approved source material into a reviewable format.',
  Rewrite: 'Adjust tone, length, or clarity while preserving meaning.',
  Extract: 'Pull actions, dates, risks, missing facts, or open questions.',
  Compare: 'Show differences, uncertainties, and review items.',
  Checklist: 'Convert approved work into steps, owners, evidence, and escalation.',
  Critique: 'Flag unsupported claims, vague language, missing sources, or risk flags.',
  Scenario: 'Create fictional practice or training material.',
  'Data-to-narrative': 'Explain approved aggregate metrics without deciding.',
  'Builder brief': 'Turn workflow pain into a buildable internal brief.',
};

function classifyRisk(form: PromptForm): RiskLane {
  const highRiskData = [
    'Customer NPI / PII',
    'Regulated or examiner-sensitive',
    'Security, credentials, or production access',
  ].includes(form.dataClass);

  if (form.toolContext === 'Public AI tool' && highRiskData) return 'Red';
  if (form.dataClass === 'Security, credentials, or production access') return 'Red';

  if (
    highRiskData ||
    form.dataClass === 'Confidential internal' ||
    ['Customer', 'Examiner', 'Board', 'Public', 'Retained record'].includes(form.audience)
  ) {
    return 'Yellow';
  }

  return 'Green';
}

function laneMessage(lane: RiskLane): string {
  if (lane === 'Green') return 'Prompt generation allowed. Keep routine human review.';
  if (lane === 'Yellow') {
    return 'Prompt generation allowed after approved-tool, reviewer, and output-review confirmation.';
  }
  return 'Public-tool prompt blocked. Route this to an approved workflow or specialist review.';
}

function buildPrompt(form: PromptForm, lane: RiskLane): string {
  if (lane === 'Red') {
    return `# Escalation Required

This prompt is blocked for the selected tool/data combination.

Selected tool context: ${form.toolContext}
Selected data class: ${form.dataClass}
Audience / final use: ${form.audience}

Do not create a public-tool prompt with customer NPI/PII, account records, SAR/AML detail, credit decisioning, authentication details, credentials, production access, examiner-sensitive material, fraud conclusions, or legal/compliance determinations.

Recommended next step:
- Move this into an approved enterprise workflow, private environment, or internal application.
- Name the reviewer: ${form.reviewer}
- Escalate if ${form.escalationTrigger}.
- Document the workflow in the AI Workflow SOP Builder before reuse.
`;
  }

  return `# Banker Prompt

Metadata:
- Prompt type: ${form.promptType}
- Risk lane: ${lane}
- Intended tool: ${form.toolContext}
- Data class: ${form.dataClass}
- Audience / final use: ${form.audience}
- Human reviewer: ${form.reviewer}

Prompt:
You are assisting a ${form.userRole} with this task: ${form.task}.

Use only this source material: ${form.sourceDescription}.

Do not use or request customer names, account numbers, balances, transaction-level details, SSNs, DOBs, complaint specifics, SAR/AML case details, authentication details, examiner-sensitive material, passwords, API keys, access tokens, or production system details.

Constraints:
${form.constraints}

Return the answer as: ${form.outputFormat}.

Mark uncertain, missing, unsupported, or source-dependent items as [VERIFY].

Label the output as draft pending human review. Do not make a final decision, approve, deny, file, send, publish, or retain the output as final.

Human review:
${form.reviewer} confirms source accuracy, data handling, unclear items, final-use approval, and evidence retention before downstream use.

Escalate if ${form.escalationTrigger}.
`;
}

function completeness(form: PromptForm): number {
  const values = Object.values(form);
  const filled = values.filter((value) => value.trim().length > 0).length;
  return Math.round((filled / values.length) * 100);
}

export function PromptingFoundationBuilder() {
  const [form, setForm] = useState<PromptForm>(DEFAULT_FORM);
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  const lane = useMemo(() => classifyRisk(form), [form]);
  const prompt = useMemo(() => buildPrompt(form, lane), [form, lane]);
  const complete = useMemo(() => completeness(form), [form]);
  const reviewComplete = checked.length === REVIEW_ITEMS.length;
  const blocked = lane === 'Red';

  function updateField<K extends keyof PromptForm>(field: K, value: PromptForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setCopied(false);
  }

  function reset() {
    setForm(DEFAULT_FORM);
    setChecked([]);
    setCopied(false);
  }

  async function copyPrompt() {
    if (blocked) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadPrompt() {
    if (blocked) return;
    const blob = new Blob([prompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'banker-prompt-working-brief.md';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function toggle(item: string) {
    setChecked((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  }

  return (
    <div className="mockup-scope sop-scope prompt-scope">
      <SiteHeader activePath="/resources" />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<Sparkles size={16} />}>Prompting foundation</EyebrowChip>
            <h1>Build a safe banker prompt in five minutes.</h1>
            <p className="mk-lede">
              Choose the prompt type, data class, tool context, output format, and reviewer. The
              builder assembles the prompt and blocks public-tool use when the data line is crossed.
            </p>
            <div className="mk-ctas">
              <FreeResourceDownloadGate
                title="AI Prompting Foundation Kit"
                href="/api/resources/prompting-foundation-kit/download"
                slug="prompting-foundation-kit"
                source="prompting-foundation-hero-kit"
                format="ZIP"
                actionLabel="Get kit"
                capturedLabel="Download kit"
                buttonVariant="gold"
                buttonSize="lg"
              >
                Download kit <Download size={16} />
              </FreeResourceDownloadGate>
              <FreeResourceDownloadGate
                title="AI Prompting Foundation Guide"
                href="/api/resources/prompting-foundation-guide/download"
                slug="prompting-foundation-guide"
                source="prompting-foundation-hero-guide"
                actionLabel="Get guide"
                capturedLabel="Download guide"
                buttonVariant="ghost-dark"
                buttonSize="lg"
              >
                Foundation guide <Download size={16} />
              </FreeResourceDownloadGate>
            </div>
          </div>

          <PromptSnapshot
            lane={lane}
            complete={complete}
            reviewComplete={reviewComplete}
            copied={copied}
            form={form}
          />
        </div>
      </section>

      <main className="mk-container sop-main">
        <div className="sop-col-form">
          <PromptControls form={form} updateField={updateField} reset={reset} lane={lane} />
          <ReviewChecklist checked={checked} toggle={toggle} reviewComplete={reviewComplete} />
        </div>
        <div className="sop-col-preview">
          <PromptPreview
            prompt={prompt}
            lane={lane}
            copied={copied}
            copyPrompt={copyPrompt}
            downloadPrompt={downloadPrompt}
          />
          <ReferenceDownloads />
        </div>
      </main>
    </div>
  );
}

function PromptSnapshot({
  lane,
  complete,
  reviewComplete,
  copied,
  form,
}: {
  lane: RiskLane;
  complete: number;
  reviewComplete: boolean;
  copied: boolean;
  form: PromptForm;
}) {
  const stats = [
    { label: 'Risk lane', value: lane, Icon: ShieldCheck },
    { label: 'Prompt type', value: form.promptType, Icon: ClipboardCheck },
    { label: 'Data class', value: form.dataClass, Icon: LockKeyhole },
    { label: 'Reviewer', value: form.reviewer, Icon: Users },
  ];

  return (
    <aside className="sop-hero-card">
      <div className="sop-hero-card-head">
        <div className="mk-k">Builder status</div>
        <h3>{laneMessage(lane)}</h3>
        <span className={`prompt-lane prompt-lane-${lane.toLowerCase()}`}>{lane}</span>
      </div>
      <div className="sop-hero-card-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="sop-stat">
            <stat.Icon size={24} className="sop-stat-icon" />
            <p className="sop-stat-k">{stat.label}</p>
            <p className="sop-stat-v">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="sop-hero-card-progress">
        <div className="sop-bar">
          <div className="sop-bar-fill" style={{ width: `${complete}%` }} />
        </div>
        <div className="sop-pills">
          <StatusPill label="Fields complete" active={complete === 100} />
          <StatusPill label="Review ready" active={reviewComplete} />
          <StatusPill label="Copied" active={copied} />
        </div>
      </div>
    </aside>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return <div className={`sop-pill${active ? ' sop-pill-on' : ''}`}>{active ? 'Yes' : 'No'} - {label}</div>;
}

function PromptControls({
  form,
  updateField,
  reset,
  lane,
}: {
  form: PromptForm;
  updateField: <K extends keyof PromptForm>(field: K, value: PromptForm[K]) => void;
  reset: () => void;
  lane: RiskLane;
}) {
  return (
    <section className="sop-card">
      <div className="sop-card-head">
        <div>
          <div className="mk-k">Step 1 - Define the prompt</div>
          <h2>Prompt setup</h2>
        </div>
        <Button variant="ghost-light" onClick={reset}>Reset</Button>
      </div>
      <p className="sop-card-lede">
        The builder uses structured fields instead of an AI call. It does not send or store source
        text.
      </p>

      <div className="prompt-type-grid">
        {PROMPT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`prompt-type-card${form.promptType === type ? ' is-active' : ''}`}
            onClick={() => updateField('promptType', type)}
            aria-pressed={form.promptType === type}
          >
            <span>{type}</span>
            <small>{PROMPT_TYPE_HELP[type]}</small>
          </button>
        ))}
      </div>

      <div className="sop-grid-2">
        <SelectField
          label="Data class"
          value={form.dataClass}
          options={DATA_CLASSES}
          onChange={(value) => updateField('dataClass', value as DataClass)}
        />
        <SelectField
          label="Tool context"
          value={form.toolContext}
          options={TOOL_CONTEXTS}
          onChange={(value) => updateField('toolContext', value as ToolContext)}
        />
        <SelectField
          label="Audience / final use"
          value={form.audience}
          options={AUDIENCES}
          onChange={(value) => updateField('audience', value as Audience)}
        />
        <SelectField
          label="Output format"
          value={form.outputFormat}
          options={OUTPUT_FORMATS}
          onChange={(value) => updateField('outputFormat', value as OutputFormat)}
        />
      </div>

      <div className={`prompt-risk-callout prompt-risk-${lane.toLowerCase()}`}>
        <strong>{lane} lane.</strong> {laneMessage(lane)}
      </div>

      <TextField
        label="Role for AI"
        value={form.userRole}
        onChange={(value) => updateField('userRole', value)}
      />
      <TextField
        label="Task"
        value={form.task}
        onChange={(value) => updateField('task', value)}
        textarea
      />
      <TextField
        label="Source description"
        value={form.sourceDescription}
        onChange={(value) => updateField('sourceDescription', value)}
        textarea
      />
      <TextField
        label="Constraints"
        value={form.constraints}
        onChange={(value) => updateField('constraints', value)}
        textarea
      />
      <TextField
        label="Human reviewer"
        value={form.reviewer}
        onChange={(value) => updateField('reviewer', value)}
      />
      <TextField
        label="Escalation trigger"
        value={form.escalationTrigger}
        onChange={(value) => updateField('escalationTrigger', value)}
        textarea
      />
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="sop-field">
      <span className="sop-field-label">{label}</span>
      <select className="sop-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="sop-field sop-field-stack">
      <span className="sop-field-label">{label}</span>
      {textarea ? (
        <textarea
          className="sop-input sop-textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="sop-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function ReviewChecklist({
  checked,
  toggle,
  reviewComplete,
}: {
  checked: string[];
  toggle: (item: string) => void;
  reviewComplete: boolean;
}) {
  return (
    <section className="sop-card">
      <div className="sop-card-head">
        <div>
          <div className="mk-k">Step 2 - Review</div>
          <h3>Before copying output downstream</h3>
        </div>
        <span className={`sop-counter${reviewComplete ? ' sop-counter-on' : ''}`}>
          {checked.length}/{REVIEW_ITEMS.length} complete
        </span>
      </div>
      <div className="sop-checks">
        {REVIEW_ITEMS.map((item) => (
          <label key={item} className="sop-check">
            <input
              type="checkbox"
              checked={checked.includes(item)}
              onChange={() => toggle(item)}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function PromptPreview({
  prompt,
  lane,
  copied,
  copyPrompt,
  downloadPrompt,
}: {
  prompt: string;
  lane: RiskLane;
  copied: boolean;
  copyPrompt: () => void;
  downloadPrompt: () => void;
}) {
  const blocked = lane === 'Red';

  return (
    <section className="sop-card sop-card-preview">
      <div className="sop-card-head sop-card-head-bordered">
        <div>
          <div className="mk-k">Prompt output</div>
          <h3>{blocked ? 'Escalation required' : 'banker-prompt-working-brief.md'}</h3>
        </div>
        <div className="sop-preview-actions">
          {blocked ? (
            <>
              <button className="mk-btn mk-btn-ghost-light" type="button" disabled>Copy blocked</button>
              <button className="mk-btn mk-btn-ink" type="button" disabled>Download blocked</button>
            </>
          ) : (
            <>
              <FreeResourceDownloadGate
                title="Banker Prompt Working Brief"
                slug="prompting-foundation-prompt-copy"
                source="prompting-foundation-builder-copy"
                format="Markdown"
                actionLabel="Get prompt"
                capturedLabel={copied ? 'Copied' : 'Copy'}
                buttonVariant="ghost-light"
                stayInteractiveAfterUnlock
                onUnlock={copyPrompt}
              />
              <FreeResourceDownloadGate
                title="Banker Prompt Working Brief file"
                slug="prompting-foundation-prompt-md"
                source="prompting-foundation-builder-download"
                format="Markdown"
                actionLabel="Get .md"
                capturedLabel="Download .md"
                buttonVariant="ink"
                stayInteractiveAfterUnlock
                onUnlock={downloadPrompt}
              />
            </>
          )}
        </div>
      </div>
      <pre className={`sop-md prompt-md-${lane.toLowerCase()}`}>{prompt}</pre>
    </section>
  );
}

function ReferenceDownloads() {
  const downloads = [
    {
      title: 'Formula card',
      slug: 'banker-prompt-formula-card',
      href: '/api/resources/banker-prompt-formula-card/download',
      Icon: BadgeCheck,
    },
    {
      title: 'Placeholder card',
      slug: 'safe-prompt-placeholder-card',
      href: '/api/resources/safe-prompt-placeholder-card/download',
      Icon: LockKeyhole,
    },
    {
      title: 'Review checklist',
      slug: 'prompt-output-review-checklist',
      href: '/api/resources/prompt-output-review-checklist/download',
      Icon: CheckCircle,
    },
    {
      title: 'Foundation guide',
      slug: 'prompting-foundation-guide',
      href: '/api/resources/prompting-foundation-guide/download',
      Icon: BookOpen,
    },
  ];

  return (
    <section className="sop-card">
      <div className="mk-k">Foundation references</div>
      <div className="sop-guide-grid">
        {downloads.map((download) => (
          <div key={download.slug} className="sop-guide-item">
            <download.Icon size={24} className="sop-stat-icon" />
            <h3>{download.title}</h3>
            <FreeResourceDownloadGate
              title={download.title}
              href={download.href}
              slug={download.slug}
              source="prompting-foundation-reference"
              actionLabel="Get PDF"
              capturedLabel="Download PDF"
              buttonVariant="ghost-light"
            >
              PDF <FileText size={16} />
            </FreeResourceDownloadGate>
          </div>
        ))}
      </div>
    </section>
  );
}
