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
  | 'Solution brief';

type DataClass =
  | 'Public'
  | 'Internal non-sensitive'
  | 'Confidential bank information'
  | 'Customer NPI / PII'
  | 'SAR / AML / fraud / security / examiner-sensitive'
  | 'Credentials / API keys / passwords';

type ToolContext =
  | 'Public AI tool'
  | 'Approved enterprise AI'
  | 'Private / controlled environment'
  | 'Not sure';

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

const BASIC_PROMPT_TYPES: readonly PromptType[] = [
  'Draft',
  'Summarize',
  'Rewrite',
  'Extract',
  'Compare',
  'Checklist',
];

const ADVANCED_PROMPT_TYPES: readonly PromptType[] = [
  'Critique',
  'Scenario',
  'Data-to-narrative',
  'Solution brief',
];

const DATA_CLASSES: readonly DataClass[] = [
  'Public',
  'Internal non-sensitive',
  'Confidential bank information',
  'Customer NPI / PII',
  'SAR / AML / fraud / security / examiner-sensitive',
  'Credentials / API keys / passwords',
];

const TOOL_CONTEXTS: readonly ToolContext[] = [
  'Public AI tool',
  'Approved enterprise AI',
  'Private / controlled environment',
  'Not sure',
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

const PLACEHOLDERS = [
  '[CUSTOMER]',
  '[ACCOUNT_TYPE]',
  '[ACCOUNT_NUMBER]',
  '[DATE]',
  '[AMOUNT]',
  '[TRANSACTION_TYPE]',
  '[BRANCH]',
  '[PRODUCT]',
  '[NEXT_STEP]',
  '[POLICY_SECTION]',
  '[REVIEWER]',
  '[VERIFY]',
] as const;

const DEFAULT_FORM: PromptForm = {
  promptType: 'Checklist',
  dataClass: 'Internal non-sensitive',
  toolContext: 'Approved enterprise AI',
  audience: 'Internal',
  outputFormat: 'Checklist',
  userRole: 'operations lead',
  task: 'turn an approved procedure summary into a staff handoff checklist',
  sourceDescription:
    '[APPROVED_PROCEDURE_SUMMARY] with [POLICY_SECTION], no customer names, account numbers, transaction details, credentials, or examiner-sensitive facts',
  constraints:
    'Preserve source meaning. Do not add policy requirements. Do not invent facts, rates, fees, dates, legal conclusions, or control requirements.',
  reviewer: 'process owner',
  escalationTrigger:
    'customer impact, credit, BSA/AML, fraud, authentication, complaints, examiner-facing material, legal/compliance interpretation, or prohibited data appears',
};

const REVIEW_ITEMS = [
  'Sensitive data removed or replaced with approved placeholders.',
  'Tool is approved for this data class.',
  'Prompt asks for draft support, not a final decision.',
  'Output format is clear.',
  'Uncertain items must be marked [VERIFY].',
  'Reviewer and escalation trigger are named.',
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
  'Solution brief': 'Turn workflow pain into an internal problem, user, constraints, and test note.',
};

const PROMPT_FORMULA = [
  { label: 'Role', question: 'Who should AI assist?', answer: 'Name the banker role or review lens.' },
  { label: 'Task', question: 'What should it produce?', answer: 'Ask for draft support, not a final decision.' },
  { label: 'Source', question: 'What material may it use?', answer: 'Use public, internal, redacted, or synthetic source material.' },
  { label: 'Format', question: 'What should it look like?', answer: 'Choose bullets, table, checklist, email, memo, SOP, or FAQ.' },
  { label: 'Constraints', question: 'What must it avoid?', answer: 'No invented facts, data exposure, decisions, or unsupported claims.' },
  { label: 'Review', question: 'Who checks it before use?', answer: 'Name the reviewer and escalation trigger.' },
];

const KIT_DOWNLOADS = [
  {
    title: 'Prompt Formula Card',
    slug: 'banker-prompt-formula-card',
    href: '/api/resources/banker-prompt-formula-card/download',
    description: 'Role, task, source, format, constraints, and review.',
    Icon: BadgeCheck,
  },
  {
    title: 'Placeholder Library',
    slug: 'safe-prompt-placeholder-card',
    href: '/api/resources/safe-prompt-placeholder-card/download',
    description: 'Safe tokens like [CUSTOMER], [ACCOUNT_NUMBER], [AMOUNT], and [VERIFY].',
    Icon: LockKeyhole,
  },
  {
    title: 'Prompt Types Cheat Sheet',
    slug: 'banker-prompt-types-cheat-sheet',
    href: '/api/resources/banker-prompt-types-cheat-sheet/download',
    description: 'Basic and advanced prompt types with bank-safe cautions.',
    Icon: ClipboardCheck,
  },
  {
    title: 'Safe vs. Unsafe Examples',
    slug: 'safe-vs-unsafe-prompt-examples',
    href: '/api/resources/safe-vs-unsafe-prompt-examples/download',
    description: 'Redacted examples that show the safer pattern.',
    Icon: ShieldCheck,
  },
  {
    title: 'Review Checklist',
    slug: 'prompt-output-review-checklist',
    href: '/api/resources/prompt-output-review-checklist/download',
    description: 'The six checks before output moves downstream.',
    Icon: CheckCircle,
  },
  {
    title: 'Foundation Guide',
    slug: 'prompting-foundation-guide',
    href: '/api/resources/prompting-foundation-guide/download',
    description: 'The complete Prompt Like a Banker guide.',
    Icon: BookOpen,
  },
];

const EXAMPLES = [
  {
    label: 'Customer issue',
    unsafe:
      'Summarize John Smith\'s account issue and draft a response about why his debit card transaction was denied.',
    safe:
      'Using only the redacted facts below, draft a customer-service response template. Do not include account numbers, balances, transaction details, eligibility decisions, fraud conclusions, or promises. Mark missing facts as [VERIFY]. Output as a draft pending banker review.',
  },
  {
    label: 'Credit language',
    unsafe: 'Write the adverse-action notice and decide the best reasons to deny this applicant.',
    safe:
      'Using only [HUMAN_PROVIDED_REASONS], rewrite the draft adverse-action explanation for clarity. Do not add, infer, rank, approve, deny, or decide. Mark unsupported language as [VERIFY].',
  },
  {
    label: 'BSA/AML training',
    unsafe: 'Improve this real SAR narrative from the case system and make it more persuasive.',
    safe:
      'Using [SYNTHETIC_CASE_FACTS] only, create a fictional training example organized by who, what, when, where, why, how, missing facts, and reviewer checklist.',
  },
];

function classifyRisk(form: PromptForm): RiskLane {
  const sensitiveData = [
    'Confidential bank information',
    'Customer NPI / PII',
    'SAR / AML / fraud / security / examiner-sensitive',
  ].includes(form.dataClass);
  const highestRiskData = [
    'Customer NPI / PII',
    'SAR / AML / fraud / security / examiner-sensitive',
    'Credentials / API keys / passwords',
  ].includes(form.dataClass);

  if (form.dataClass === 'Credentials / API keys / passwords') return 'Red';
  if (form.toolContext === 'Public AI tool' && sensitiveData) return 'Red';
  if (form.toolContext === 'Not sure' && highestRiskData) return 'Red';

  if (
    sensitiveData ||
    highestRiskData ||
    form.toolContext === 'Not sure' ||
    ['Customer', 'Examiner', 'Board', 'Public', 'Retained record'].includes(form.audience)
  ) {
    return 'Yellow';
  }

  return 'Green';
}

function laneMessage(lane: RiskLane): string {
  if (lane === 'Green') return 'Green: safe to draft. Human review still required.';
  if (lane === 'Yellow') return 'Yellow: draft only after approved-tool and named-reviewer confirmation.';
  return 'Blocked: this prompt crosses the public-tool data line.';
}

function laneNextStep(lane: RiskLane): string {
  if (lane === 'Green') return 'Complete the six review checks before copying.';
  if (lane === 'Yellow') return 'Use approved tools, keep placeholders, and name the reviewer before export.';
  return 'Use placeholders, approved redacted data, or an approved enterprise workflow.';
}

function buildPrompt(form: PromptForm, lane: RiskLane): string {
  if (lane === 'Red') {
    return `# Blocked Prompt

This prompt crosses the tool/data line.

Tool: ${form.toolContext}
Data: ${form.dataClass}
Audience / final use: ${form.audience}

Do not create a public-tool prompt with customer NPI/PII, account records, SAR/AML detail, fraud or security facts, credentials, production access, examiner-sensitive material, credit decisions, or legal/compliance determinations.

Use placeholders, approved redacted data, or an approved enterprise workflow.

Reviewer: ${form.reviewer}
Escalate if: ${form.escalationTrigger}
`;
  }

  return `# Prompt Like a Banker Working Brief

## Role
You are assisting a ${form.userRole}.

## Task
${form.task}

## Source
Use only this approved, redacted, or synthetic source material: ${form.sourceDescription}.

## Data Boundary
Do not use or request customer names, account numbers, balances, transaction-level details, SSNs, DOBs, complaint specifics, SAR/AML case details, authentication details, examiner-sensitive material, passwords, API keys, access tokens, or production system details.

## Format
Return the answer as: ${form.outputFormat}.

## Constraints
${form.constraints}

Mark uncertain, missing, unsupported, or source-dependent items as [VERIFY].

Label the output as draft pending human review. Do not make a final decision, approve, deny, file, send, publish, or retain the output as final.

## Review
${form.reviewer} confirms source accuracy, data handling, unclear items, final-use approval, and evidence retention before downstream use.

Escalate if ${form.escalationTrigger}.

## Metadata
- Prompt type: ${form.promptType}
- Risk lane: ${lane}
- Tool: ${form.toolContext}
- Data: ${form.dataClass}
- Audience / final use: ${form.audience}
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
  const canExport = !blocked && reviewComplete;

  function updateField<K extends keyof PromptForm>(field: K, value: PromptForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setCopied(false);
  }

  function reset() {
    setForm(DEFAULT_FORM);
    setChecked([]);
    setCopied(false);
  }

  function insertPlaceholder(token: string) {
    setForm((current) => ({
      ...current,
      sourceDescription: `${current.sourceDescription.trim()} ${token}`.trim(),
    }));
    setCopied(false);
  }

  async function copyPrompt() {
    if (!canExport) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadPrompt() {
    if (!canExport) return;
    const blob = new Blob([prompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'prompt-like-a-banker-working-brief.md';
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

      <section className="mk-hero prompt-hero">
        <div className="mk-container mk-hero-inner prompt-hero-inner">
          <div>
            <EyebrowChip icon={<Sparkles size={16} />}>Prompting foundation</EyebrowChip>
            <h1>Prompt Like a Banker</h1>
            <p className="mk-lede">
              Build a safe, review-ready banker prompt in five minutes. Use role, task, source,
              format, constraints, placeholders, and human review to get better AI output without
              crossing the data line.
            </p>
            <div className="prompt-hero-actions">
              <FreeResourceDownloadGate
                title="Prompt Like a Banker Kit"
                href="/api/resources/prompting-foundation-kit/download"
                slug="prompting-foundation-kit"
                source="prompting-foundation-hero-kit"
                format="ZIP"
                actionLabel="Get kit"
                capturedLabel="Download kit"
                buttonVariant="gold"
                buttonSize="lg"
              >
                Download foundation kit <Download size={16} />
              </FreeResourceDownloadGate>
              <a className="mk-btn mk-btn-ghost-dark mk-btn-lg" href="#prompt-builder">
                Open builder
              </a>
            </div>
          </div>

          <PromptFormulaPanel lane={lane} form={form} complete={complete} />
        </div>
      </section>

      <main className="prompt-page">
        <KitPromise />

        <section className="mk-container prompt-builder-section" id="prompt-builder">
          <div className="prompt-section-head">
            <div>
              <div className="mk-k">Interactive builder</div>
              <h2>Start with the data line, then write the prompt.</h2>
            </div>
            <p>
              This is a structured-field builder, not an AI call. It does not send or store source
              text. Export is blocked until the review checklist is complete.
            </p>
          </div>

          <div className="prompt-workspace">
            <div className="prompt-worksheet">
              <RiskGate form={form} updateField={updateField} lane={lane} />
              <PromptControls
                form={form}
                updateField={updateField}
                reset={reset}
                insertPlaceholder={insertPlaceholder}
              />
            </div>

            <aside className="prompt-review-rail">
              <ReviewChecklist
                checked={checked}
                toggle={toggle}
                reviewComplete={reviewComplete}
                blocked={blocked}
              />
              <PromptPreview
                form={form}
                prompt={prompt}
                lane={lane}
                copied={copied}
                canExport={canExport}
                reviewComplete={reviewComplete}
                copyPrompt={copyPrompt}
                downloadPrompt={downloadPrompt}
              />
            </aside>
          </div>
        </section>

        <ExamplesSection />
        <ReferenceDownloads />
      </main>
    </div>
  );
}

function PromptFormulaPanel({
  lane,
  form,
  complete,
}: {
  lane: RiskLane;
  form: PromptForm;
  complete: number;
}) {
  return (
    <aside className="prompt-formula-panel" aria-label="Prompt formula summary">
      <div className="prompt-formula-head">
        <div>
          <div className="mk-k">Prompt formula</div>
          <h2>Role + task + source + format + constraints + review</h2>
        </div>
        <span className={`prompt-lane prompt-lane-${lane.toLowerCase()}`}>{lane}</span>
      </div>
      <div className="prompt-formula-grid">
        {PROMPT_FORMULA.map((item) => (
          <div key={item.label} className="prompt-formula-item">
            <strong>{item.label}</strong>
            <span>{item.question}</span>
            <small>{item.answer}</small>
          </div>
        ))}
      </div>
      <div className="prompt-status-strip">
        <div>
          <strong>{laneMessage(lane)}</strong>
          <span>{laneNextStep(lane)}</span>
        </div>
        <dl>
          <div><dt>Tool</dt><dd>{form.toolContext}</dd></div>
          <div><dt>Data</dt><dd>{form.dataClass}</dd></div>
          <div><dt>Reviewer</dt><dd>{form.reviewer}</dd></div>
          <div><dt>Fields</dt><dd>{complete}%</dd></div>
        </dl>
      </div>
    </aside>
  );
}

function KitPromise() {
  const valueCards = [
    {
      title: 'Choose the work',
      body: 'Draft, summarize, rewrite, extract, compare, or checklist before writing the prompt.',
    },
    {
      title: 'Protect the data',
      body: 'Use placeholders and block risky public-tool combinations before export.',
    },
    {
      title: 'Review before use',
      body: 'Mark [VERIFY], name the reviewer, and retain only approved outputs.',
    },
  ];

  return (
    <section className="mk-container prompt-kit-section">
      <div className="prompt-kit-intro">
        <div>
          <div className="mk-k">What the kit gives your team</div>
          <h2>A practical foundation between the Safe AI Use Checklist and the Workflow SOP Builder.</h2>
        </div>
        <FreeResourceDownloadGate
          title="Prompt Like a Banker Kit"
          href="/api/resources/prompting-foundation-kit/download"
          slug="prompting-foundation-kit"
          source="prompting-foundation-kit-section"
          format="ZIP"
          actionLabel="Get full kit"
          capturedLabel="Download full kit"
          buttonVariant="ink"
        >
          Full kit <Download size={16} />
        </FreeResourceDownloadGate>
      </div>
      <div className="prompt-value-grid">
        {valueCards.map((card) => (
          <div className="prompt-value-item" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </div>
        ))}
      </div>
      <div className="prompt-kit-downloads">
        {KIT_DOWNLOADS.map((download) => (
          <div className="prompt-kit-download" key={download.slug}>
            <download.Icon size={22} />
            <div>
              <h3>{download.title}</h3>
              <p>{download.description}</p>
            </div>
            <FreeResourceDownloadGate
              title={download.title}
              href={download.href}
              slug={download.slug}
              source="prompting-foundation-kit-download"
              actionLabel="Get PDF"
              capturedLabel="PDF"
              buttonVariant="ghost-light"
              buttonClassName="prompt-download-icon-btn"
            >
              <Download size={16} />
            </FreeResourceDownloadGate>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskGate({
  form,
  updateField,
  lane,
}: {
  form: PromptForm;
  updateField: <K extends keyof PromptForm>(field: K, value: PromptForm[K]) => void;
  lane: RiskLane;
}) {
  return (
    <section className="prompt-step prompt-gate-panel">
      <div className="prompt-step-head">
        <div>
          <div className="mk-k">Step 1 - Data gate</div>
          <h3>What data will enter the prompt?</h3>
        </div>
        <span className={`prompt-lane prompt-lane-${lane.toLowerCase()}`}>{lane}</span>
      </div>
      <div className="sop-grid-2">
        <SelectField
          label="Data class"
          value={form.dataClass}
          options={DATA_CLASSES}
          onChange={(value) => updateField('dataClass', value as DataClass)}
        />
        <SelectField
          label="Where will this be used?"
          value={form.toolContext}
          options={TOOL_CONTEXTS}
          onChange={(value) => updateField('toolContext', value as ToolContext)}
        />
      </div>
      <div className={`prompt-risk-callout prompt-risk-${lane.toLowerCase()}`}>
        <strong>{laneMessage(lane)}</strong>
        <span>{laneNextStep(lane)}</span>
      </div>
      <p className="prompt-gate-note">
        Placeholders reduce exposure, but they do not automatically make sensitive facts safe. If
        the story still reveals a real customer, investigation, SAR, complaint, loan file, fraud
        case, or security issue, escalate instead of prompting.
      </p>
    </section>
  );
}

function PromptControls({
  form,
  updateField,
  reset,
  insertPlaceholder,
}: {
  form: PromptForm;
  updateField: <K extends keyof PromptForm>(field: K, value: PromptForm[K]) => void;
  reset: () => void;
  insertPlaceholder: (token: string) => void;
}) {
  return (
    <section className="prompt-step">
      <div className="prompt-step-head">
        <div>
          <div className="mk-k">Step 2 - Prompt worksheet</div>
          <h3>Choose the work and fill the formula.</h3>
        </div>
        <Button variant="ghost-light" onClick={reset}>Reset</Button>
      </div>

      <PromptTypeGroup
        title="Basic prompt types"
        types={BASIC_PROMPT_TYPES}
        selected={form.promptType}
        updateField={updateField}
      />

      <details className="prompt-advanced-types">
        <summary>Advanced prompt types</summary>
        <PromptTypeGroup
          title=""
          types={ADVANCED_PROMPT_TYPES}
          selected={form.promptType}
          updateField={updateField}
        />
      </details>

      <div className="sop-grid-2">
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
      <PlaceholderLibrary insertPlaceholder={insertPlaceholder} />
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

function PromptTypeGroup({
  title,
  types,
  selected,
  updateField,
}: {
  title: string;
  types: readonly PromptType[];
  selected: PromptType;
  updateField: <K extends keyof PromptForm>(field: K, value: PromptForm[K]) => void;
}) {
  return (
    <div className="prompt-type-group">
      {title ? <h4>{title}</h4> : null}
      <div className="prompt-type-grid">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            className={`prompt-type-card${selected === type ? ' is-active' : ''}`}
            onClick={() => updateField('promptType', type)}
            aria-pressed={selected === type}
          >
            <span>{type}</span>
            <small>{PROMPT_TYPE_HELP[type]}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function PlaceholderLibrary({ insertPlaceholder }: { insertPlaceholder: (token: string) => void }) {
  return (
    <div className="prompt-placeholder-library">
      <div>
        <strong>Placeholder insert menu</strong>
        <span>Click a token to append it to the source description.</span>
      </div>
      <div className="prompt-placeholder-grid">
        {PLACEHOLDERS.map((token) => (
          <button key={token} type="button" onClick={() => insertPlaceholder(token)}>
            {token}
          </button>
        ))}
      </div>
    </div>
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
  blocked,
}: {
  checked: string[];
  toggle: (item: string) => void;
  reviewComplete: boolean;
  blocked: boolean;
}) {
  return (
    <section className="prompt-step prompt-review-card">
      <div className="prompt-step-head">
        <div>
          <div className="mk-k">Step 3 - Review gate</div>
          <h3>Required before copy or download</h3>
        </div>
        <span className={`sop-counter${reviewComplete ? ' sop-counter-on' : ''}`}>
          {checked.length}/{REVIEW_ITEMS.length}
        </span>
      </div>
      <div className="sop-checks">
        {REVIEW_ITEMS.map((item) => (
          <label key={item} className="sop-check">
            <input
              type="checkbox"
              checked={checked.includes(item)}
              onChange={() => toggle(item)}
              disabled={blocked}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
      {blocked ? (
        <p className="prompt-review-note">This combination is blocked. Change the data/tool gate before review.</p>
      ) : (
        <p className="prompt-review-note">
          All six checks are required before the prompt can be copied or downloaded.
        </p>
      )}
    </section>
  );
}

function PromptPreview({
  form,
  prompt,
  lane,
  copied,
  canExport,
  reviewComplete,
  copyPrompt,
  downloadPrompt,
}: {
  form: PromptForm;
  prompt: string;
  lane: RiskLane;
  copied: boolean;
  canExport: boolean;
  reviewComplete: boolean;
  copyPrompt: () => void;
  downloadPrompt: () => void;
}) {
  const blocked = lane === 'Red';

  return (
    <section className="prompt-step prompt-preview-card">
      <div className="prompt-step-head">
        <div>
          <div className="mk-k">Generated prompt</div>
          <h3>{blocked ? 'Blocked state' : 'Review-ready working brief'}</h3>
        </div>
        <span className={`prompt-lane prompt-lane-${lane.toLowerCase()}`}>{lane}</span>
      </div>

      {blocked ? (
        <div className="prompt-blocked-box">
          <strong>Blocked: this prompt crosses the public-tool data line.</strong>
          <p>Use placeholders, approved redacted data, or an approved enterprise workflow.</p>
        </div>
      ) : (
        <PromptSectionPreview form={form} />
      )}

      <div className="prompt-preview-actions">
        {canExport ? (
          <>
            <FreeResourceDownloadGate
              title="Prompt Like a Banker Working Brief"
              slug="prompting-foundation-prompt-copy"
              source="prompting-foundation-builder-copy"
              format="Markdown"
              actionLabel="Copy safe prompt"
              capturedLabel={copied ? 'Copied' : 'Copy safe prompt'}
              buttonVariant="ghost-light"
              stayInteractiveAfterUnlock
              onUnlock={copyPrompt}
            />
            <FreeResourceDownloadGate
              title="Prompt Like a Banker Working Brief file"
              slug="prompting-foundation-prompt-md"
              source="prompting-foundation-builder-download"
              format="Markdown"
              actionLabel="Download .md"
              capturedLabel="Download .md"
              buttonVariant="ink"
              stayInteractiveAfterUnlock
              onUnlock={downloadPrompt}
            />
          </>
        ) : (
          <>
            <button className="mk-btn mk-btn-ghost-light" type="button" disabled>
              {blocked ? 'Copy blocked' : 'Complete review to copy'}
            </button>
            <button className="mk-btn mk-btn-ink" type="button" disabled>
              {blocked ? 'Download blocked' : 'Complete review to download'}
            </button>
          </>
        )}
      </div>

      {!blocked && !reviewComplete ? (
        <p className="prompt-export-note">Copy and download unlock after all six review checks.</p>
      ) : null}

      <details className="prompt-md-details">
        <summary>Markdown export</summary>
        <pre className={`sop-md prompt-md-${lane.toLowerCase()}`}>{prompt}</pre>
      </details>
    </section>
  );
}

function PromptSectionPreview({ form }: { form: PromptForm }) {
  const rows = [
    ['Role', `AI assists a ${form.userRole}.`],
    ['Task', form.task],
    ['Source', form.sourceDescription],
    ['Format', form.outputFormat],
    ['Constraints', form.constraints],
    ['Review', `${form.reviewer}; escalate if ${form.escalationTrigger}.`],
  ] as const;

  return (
    <div className="prompt-clean-preview">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}

function ExamplesSection() {
  return (
    <section className="mk-container prompt-examples-section">
      <div className="prompt-section-head">
        <div>
          <div className="mk-k">Examples</div>
          <h2>Bankers learn faster from safe versus unsafe prompts.</h2>
        </div>
        <FreeResourceDownloadGate
          title="Safe vs. Unsafe Prompt Examples"
          href="/api/resources/safe-vs-unsafe-prompt-examples/download"
          slug="safe-vs-unsafe-prompt-examples"
          source="prompting-foundation-examples"
          actionLabel="Get examples"
          capturedLabel="Download examples"
          buttonVariant="ink"
        >
          Examples PDF <Download size={16} />
        </FreeResourceDownloadGate>
      </div>
      <div className="prompt-example-grid">
        {EXAMPLES.map((example) => (
          <div className="prompt-example-pair" key={example.label}>
            <h3>{example.label}</h3>
            <div className="prompt-example-unsafe">
              <span>Unsafe</span>
              <p>{example.unsafe}</p>
            </div>
            <div className="prompt-example-safe">
              <span>Safer</span>
              <p>{example.safe}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReferenceDownloads() {
  return (
    <section className="mk-container prompt-reference-section">
      <div className="prompt-section-head">
        <div>
          <div className="mk-k">Foundation downloads</div>
          <h2>Use the documents without the interactive builder.</h2>
        </div>
        <FreeResourceDownloadGate
          title="Prompt Like a Banker Kit"
          href="/api/resources/prompting-foundation-kit/download"
          slug="prompting-foundation-kit"
          source="prompting-foundation-reference-kit"
          format="ZIP"
          actionLabel="Get kit"
          capturedLabel="Download kit"
          buttonVariant="gold"
        >
          Download all <Download size={16} />
        </FreeResourceDownloadGate>
      </div>
      <div className="sop-guide-grid prompt-reference-grid">
        {KIT_DOWNLOADS.map((download) => (
          <div key={download.slug} className="sop-guide-item">
            <download.Icon size={24} className="sop-stat-icon" />
            <h3>{download.title}</h3>
            <p>{download.description}</p>
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
