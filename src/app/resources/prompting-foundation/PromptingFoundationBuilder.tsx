'use client';

import { useMemo, useState } from 'react';
import { EyebrowChip, SiteHeader } from '@/components/mockup';
import { FreeResourceDownloadGate } from '@/components/resources/FreeResourceDownloadGate';
import { CheckCircle, Download, LockKeyhole, Sparkles } from '../icons';

type PromptType = 'Draft' | 'Summarize' | 'Rewrite' | 'Extract' | 'Compare' | 'Checklist';

type DataClass =
  | 'Public or published'
  | 'Internal, non-sensitive'
  | 'Confidential bank information'
  | 'Customer NPI / PII'
  | 'BSA/AML, SAR, fraud, credit, examiner, legal, security, credentials';

type ToolContext =
  | 'Public AI tool'
  | 'Approved enterprise AI'
  | 'Private / controlled environment'
  | 'Not sure';

type OutputFormat =
  | 'Email'
  | 'Checklist'
  | 'Table'
  | 'Memo'
  | 'Summary'
  | 'FAQ'
  | 'SOP'
  | 'Talking points';

type Reviewer =
  | 'Manager'
  | 'Process owner'
  | 'Compliance'
  | 'Risk'
  | 'Legal'
  | 'BSA'
  | 'Lending'
  | 'InfoSec';

type RiskLane = 'Green' | 'Yellow' | 'Red';
type WizardStep = 0 | 1 | 2 | 3;

interface PromptForm {
  readonly promptType: PromptType;
  readonly dataClass: DataClass;
  readonly toolContext: ToolContext;
  readonly outputFormat: OutputFormat;
  readonly reviewer: Reviewer;
  readonly role: string;
  readonly task: string;
  readonly source: string;
}

const WORK_OPTIONS: readonly { readonly value: PromptType; readonly body: string }[] = [
  { value: 'Draft', body: 'Create first-pass language for review.' },
  { value: 'Summarize', body: 'Condense approved material.' },
  { value: 'Rewrite', body: 'Improve clarity without changing meaning.' },
  { value: 'Extract', body: 'Pull actions, risks, dates, or missing facts.' },
  { value: 'Compare', body: 'Show differences and uncertainty.' },
  { value: 'Checklist', body: 'Turn work into reviewable steps.' },
];

const DATA_OPTIONS: readonly DataClass[] = [
  'Public or published',
  'Internal, non-sensitive',
  'Confidential bank information',
  'Customer NPI / PII',
  'BSA/AML, SAR, fraud, credit, examiner, legal, security, credentials',
];

const TOOL_OPTIONS: readonly ToolContext[] = [
  'Public AI tool',
  'Approved enterprise AI',
  'Private / controlled environment',
  'Not sure',
];

const OUTPUT_OPTIONS: readonly OutputFormat[] = [
  'Email',
  'Checklist',
  'Table',
  'Memo',
  'Summary',
  'FAQ',
  'SOP',
  'Talking points',
];

const REVIEWER_OPTIONS: readonly Reviewer[] = [
  'Manager',
  'Process owner',
  'Compliance',
  'Risk',
  'Legal',
  'BSA',
  'Lending',
  'InfoSec',
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

const REVIEW_ITEMS = [
  'Sensitive data removed or replaced with approved placeholders.',
  'Tool is approved for the data class.',
  'Prompt asks for draft support, not a final decision.',
  'Output format is clear.',
  'Uncertain items must be marked [VERIFY].',
  'Reviewer and escalation trigger are named.',
];

const DEFAULT_FORM: PromptForm = {
  promptType: 'Checklist',
  dataClass: 'Internal, non-sensitive',
  toolContext: 'Approved enterprise AI',
  outputFormat: 'Checklist',
  reviewer: 'Process owner',
  role: 'operations lead',
  task: 'turn an approved procedure summary into a staff handoff checklist',
  source:
    '[APPROVED_PROCEDURE_SUMMARY] with [POLICY_SECTION], no customer names, account numbers, transaction details, credentials, or examiner-sensitive facts',
};

function isRestrictedData(dataClass: DataClass): boolean {
  return [
    'Customer NPI / PII',
    'BSA/AML, SAR, fraud, credit, examiner, legal, security, credentials',
  ].includes(dataClass);
}

function classifyRisk(form: PromptForm): RiskLane {
  if (isRestrictedData(form.dataClass) && ['Public AI tool', 'Not sure'].includes(form.toolContext)) {
    return 'Red';
  }
  if (form.dataClass === 'Confidential bank information' && form.toolContext === 'Public AI tool') {
    return 'Red';
  }
  if (
    form.dataClass === 'Confidential bank information' ||
    isRestrictedData(form.dataClass) ||
    form.toolContext === 'Not sure'
  ) {
    return 'Yellow';
  }
  return 'Green';
}

function laneCopy(lane: RiskLane): { readonly title: string; readonly body: string } {
  if (lane === 'Green') {
    return {
      title: 'Green: safe to draft.',
      body: 'Human review is still required before the output is used.',
    };
  }
  if (lane === 'Yellow') {
    return {
      title: 'Yellow: review-required draft.',
      body: 'Use an approved tool, keep placeholders, and name the reviewer before copying.',
    };
  }
  return {
    title: 'Blocked: this crosses the data line.',
    body: 'Use placeholders, synthetic data, approved redacted data, or route this through an approved enterprise workflow.',
  };
}

function buildPrompt(form: PromptForm): string {
  return `You are helping a ${form.role}.
Use only ${form.source}.
Create ${form.outputFormat.toLowerCase()} using a ${form.promptType.toLowerCase()} approach for this task: ${form.task}.
Do not invent facts, make decisions, expose data, or add unsupported claims.
Mark uncertain items as [VERIFY]. Label the output as draft for ${form.reviewer} review.

Do not use or request customer names, account numbers, balances, transaction-level details, SSNs, DOBs, complaint specifics, SAR/AML case facts, authentication details, examiner-sensitive material, passwords, API keys, access tokens, or production system details.

Before use, ${form.reviewer} confirms source accuracy, data handling, final-use approval, and any required evidence retention. Escalate if customer impact, credit, BSA/AML, fraud, authentication, complaints, examiner-facing material, legal/compliance interpretation, or prohibited data appears.`;
}

function stepLabel(step: WizardStep): string {
  return ['Choose the work', 'Set the data line', 'Fill the prompt', 'Review and copy'][step];
}

export function PromptingFoundationBuilder() {
  const [form, setForm] = useState<PromptForm>(DEFAULT_FORM);
  const [step, setStep] = useState<WizardStep>(0);
  const [checked, setChecked] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const lane = useMemo(() => classifyRisk(form), [form]);
  const prompt = useMemo(() => buildPrompt(form), [form]);
  const reviewComplete = checked.length === REVIEW_ITEMS.length;
  const blocked = lane === 'Red';
  const canExport = !blocked && reviewComplete;
  const status = laneCopy(lane);

  function updateField<K extends keyof PromptForm>(field: K, value: PromptForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setChecked([]);
    setCopied(false);
  }

  function insertPlaceholder(token: string) {
    updateField('source', `${form.source.trim()} ${token}`.trim());
  }

  function toggleReview(item: string) {
    setChecked((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
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
    anchor.download = 'prompt-like-a-banker.md';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function goNext() {
    setStep((current) => Math.min(current + 1, 3) as WizardStep);
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0) as WizardStep);
  }

  return (
    <div className="mockup-scope prompt-scope prompt-simple-scope">
      <SiteHeader activePath="/resources" />

      <section className="prompt-simple-hero">
        <div className="mk-container prompt-simple-hero-inner">
          <div className="prompt-simple-hero-copy">
            <EyebrowChip icon={<Sparkles size={16} />}>Prompt builder</EyebrowChip>
            <h1>Prompt Like a Banker</h1>
            <p>
              Build one safe AI prompt in five minutes. Choose the work, protect the data, set the
              format, and name the reviewer before anything gets copied.
            </p>
            <div className="prompt-simple-actions">
              <a className="mk-btn mk-btn-gold mk-btn-lg" href="#prompt-builder">
                Build a prompt
              </a>
              <FreeResourceDownloadGate
                title="Prompt Like a Banker prompt card"
                href="/api/resources/prompting-foundation-guide/download"
                slug="prompting-foundation-guide"
                source="prompt-like-hero-card"
                actionLabel="Get prompt card"
                capturedLabel="Download prompt card"
                buttonVariant="ghost-dark"
                buttonSize="lg"
              >
                Download prompt card <Download size={16} />
              </FreeResourceDownloadGate>
            </div>
          </div>

          <div className="prompt-simple-method" aria-label="The 5-line banker prompt">
            <span>The 5-line banker prompt</span>
            <ol>
              <li>You are helping a [ROLE].</li>
              <li>Use only [SOURCE].</li>
              <li>Create [OUTPUT FORMAT].</li>
              <li>Do not invent facts, make decisions, expose data, or add unsupported claims.</li>
              <li>Mark uncertain items as [VERIFY]. Label the output as draft for [REVIEWER].</li>
            </ol>
          </div>
        </div>
      </section>

      <main className="prompt-simple-main">
        <section className="mk-container prompt-simple-principles" aria-label="Prompting rules">
          <div>
            <h2>Choose the work</h2>
            <p>Draft, summarize, rewrite, extract, compare, or checklist.</p>
          </div>
          <div>
            <h2>Protect the data</h2>
            <p>Use placeholders like [CUSTOMER], [ACCOUNT_NUMBER], [AMOUNT], and [VERIFY].</p>
          </div>
          <div>
            <h2>Review before use</h2>
            <p>AI drafts. A qualified human checks before the output is used.</p>
          </div>
        </section>

        <ExampleLesson />

        <section className="mk-container prompt-wizard-section" id="prompt-builder">
          <div className="prompt-wizard-head">
            <div>
              <div className="mk-k">Guided builder</div>
              <h2>I need to write a prompt.</h2>
            </div>
            <p>
              This builder runs in the browser. It does not call AI or store source text. It only
              assembles the prompt from the fields you choose.
            </p>
          </div>

          <div className="prompt-wizard-shell">
            <nav className="prompt-stepper" aria-label="Prompt builder steps">
              {[0, 1, 2, 3].map((item) => {
                const wizardStep = item as WizardStep;
                return (
                  <button
                    key={wizardStep}
                    type="button"
                    className={wizardStep === step ? 'is-active' : ''}
                    onClick={() => setStep(wizardStep)}
                  >
                    <span>{item + 1}</span>
                    {stepLabel(wizardStep)}
                  </button>
                );
              })}
            </nav>

            <div className="prompt-wizard-panel">
              <div className="prompt-wizard-status">
                <span className={`prompt-lane prompt-lane-${lane.toLowerCase()}`}>{lane}</span>
                <div>
                  <strong>{status.title}</strong>
                  <p>{status.body}</p>
                </div>
              </div>

              {step === 0 ? (
                <ChooseWorkStep form={form} updateField={updateField} />
              ) : null}
              {step === 1 ? (
                <DataLineStep form={form} updateField={updateField} blocked={blocked} />
              ) : null}
              {step === 2 ? (
                <FillPromptStep
                  form={form}
                  updateField={updateField}
                  insertPlaceholder={insertPlaceholder}
                />
              ) : null}
              {step === 3 ? (
                <ReviewStep
                  prompt={prompt}
                  blocked={blocked}
                  checked={checked}
                  copied={copied}
                  canExport={canExport}
                  toggleReview={toggleReview}
                  copyPrompt={copyPrompt}
                  downloadPrompt={downloadPrompt}
                />
              ) : null}

              <div className="prompt-wizard-nav">
                <button className="mk-btn mk-btn-ghost-light" type="button" onClick={goBack} disabled={step === 0}>
                  Back
                </button>
                {step < 3 ? (
                  <button className="mk-btn mk-btn-ink" type="button" onClick={goNext}>
                    {blocked && step === 1 ? 'View blocked guidance' : 'Continue'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <TeamDownloads />
      </main>
    </div>
  );
}

function ChooseWorkStep({
  form,
  updateField,
}: {
  form: PromptForm;
  updateField: <K extends keyof PromptForm>(field: K, value: PromptForm[K]) => void;
}) {
  return (
    <section className="prompt-wizard-step">
      <div className="prompt-wizard-step-head">
        <span>Step 1</span>
        <h3>What are you trying to do?</h3>
      </div>
      <div className="prompt-choice-grid">
        {WORK_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={form.promptType === option.value ? 'is-selected' : ''}
            onClick={() => updateField('promptType', option.value)}
          >
            <strong>{option.value}</strong>
            <span>{option.body}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DataLineStep({
  form,
  updateField,
  blocked,
}: {
  form: PromptForm;
  updateField: <K extends keyof PromptForm>(field: K, value: PromptForm[K]) => void;
  blocked: boolean;
}) {
  return (
    <section className="prompt-wizard-step">
      <div className="prompt-wizard-step-head">
        <span>Step 2</span>
        <h3>Set the data line.</h3>
      </div>
      <div className="prompt-field-grid">
        <SelectField
          label="What data will enter the prompt?"
          value={form.dataClass}
          options={DATA_OPTIONS}
          onChange={(value) => updateField('dataClass', value as DataClass)}
        />
        <SelectField
          label="Where will this be used?"
          value={form.toolContext}
          options={TOOL_OPTIONS}
          onChange={(value) => updateField('toolContext', value as ToolContext)}
        />
      </div>
      {blocked ? (
        <div className="prompt-blocked-simple">
          <LockKeyhole size={20} />
          <div>
            <strong>Blocked: this crosses the data line.</strong>
            <p>
              Use placeholders, synthetic data, approved redacted data, or route this through an
              approved enterprise workflow.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FillPromptStep({
  form,
  updateField,
  insertPlaceholder,
}: {
  form: PromptForm;
  updateField: <K extends keyof PromptForm>(field: K, value: PromptForm[K]) => void;
  insertPlaceholder: (token: string) => void;
}) {
  return (
    <section className="prompt-wizard-step">
      <div className="prompt-wizard-step-head">
        <span>Step 3</span>
        <h3>Fill five fields.</h3>
      </div>
      <div className="prompt-field-grid">
        <TextField
          label="Role: who should AI assist?"
          value={form.role}
          onChange={(value) => updateField('role', value)}
        />
        <SelectField
          label="Format: what should the output look like?"
          value={form.outputFormat}
          options={OUTPUT_OPTIONS}
          onChange={(value) => updateField('outputFormat', value as OutputFormat)}
        />
      </div>
      <TextField
        label="Task: what should it produce?"
        value={form.task}
        onChange={(value) => updateField('task', value)}
        textarea
      />
      <TextField
        label="Source: what approved material may it use?"
        value={form.source}
        onChange={(value) => updateField('source', value)}
        textarea
      />
      <PlaceholderMenu insertPlaceholder={insertPlaceholder} />
      <SelectField
        label="Reviewer: who checks it before use?"
        value={form.reviewer}
        options={REVIEWER_OPTIONS}
        onChange={(value) => updateField('reviewer', value as Reviewer)}
      />
    </section>
  );
}

function ReviewStep({
  prompt,
  blocked,
  checked,
  copied,
  canExport,
  toggleReview,
  copyPrompt,
  downloadPrompt,
}: {
  prompt: string;
  blocked: boolean;
  checked: string[];
  copied: boolean;
  canExport: boolean;
  toggleReview: (item: string) => void;
  copyPrompt: () => void;
  downloadPrompt: () => void;
}) {
  return (
    <section className="prompt-wizard-step">
      <div className="prompt-wizard-step-head">
        <span>Step 4</span>
        <h3>{blocked ? 'Blocked guidance' : 'Review and copy.'}</h3>
      </div>

      {blocked ? (
        <div className="prompt-blocked-result">
          <strong>Do not generate this prompt for the selected public or uncertain tool context.</strong>
          <p>
            Change the data line, use placeholders or synthetic data, or route the work through an
            approved enterprise workflow.
          </p>
        </div>
      ) : (
        <>
          <pre className="prompt-result-box">{prompt}</pre>
          <div className="prompt-review-list">
            {REVIEW_ITEMS.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={() => toggleReview(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </>
      )}

      <div className="prompt-export-row">
        {canExport ? (
          <>
            <FreeResourceDownloadGate
              title="Prompt Like a Banker generated prompt"
              slug="prompting-foundation-prompt-copy"
              source="prompt-like-copy"
              format="Markdown"
              actionLabel="Copy prompt"
              capturedLabel={copied ? 'Copied' : 'Copy prompt'}
              buttonVariant="ghost-light"
              stayInteractiveAfterUnlock
              onUnlock={copyPrompt}
            />
            <FreeResourceDownloadGate
              title="Prompt Like a Banker markdown"
              slug="prompting-foundation-prompt-md"
              source="prompt-like-md"
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
    </section>
  );
}

function PlaceholderMenu({ insertPlaceholder }: { insertPlaceholder: (token: string) => void }) {
  return (
    <div className="prompt-placeholder-menu">
      <div>
        <strong>Insert placeholder</strong>
        <p>
          Placeholders reduce exposure. They do not make sensitive facts automatically safe. If the
          story still reveals a real customer, SAR, fraud case, complaint, loan file, examiner
          issue, or security issue, escalate instead of prompting.
        </p>
      </div>
      <div>
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
    <label className="prompt-simple-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
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
    <label className="prompt-simple-field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ExampleLesson() {
  return (
    <section className="mk-container prompt-example-lesson">
      <div className="prompt-example-head">
        <div>
          <div className="mk-k">Fastest way to learn</div>
          <h2>Unsafe versus safe.</h2>
        </div>
        <FreeResourceDownloadGate
          title="Safe vs. Unsafe Prompt Examples"
          href="/api/resources/safe-vs-unsafe-prompt-examples/download"
          slug="safe-vs-unsafe-prompt-examples"
          source="prompt-like-example"
          actionLabel="Get examples"
          capturedLabel="Download examples"
          buttonVariant="ink"
        >
          Examples PDF <Download size={16} />
        </FreeResourceDownloadGate>
      </div>
      <div className="prompt-example-split">
        <div>
          <span>Unsafe</span>
          <p>
            Summarize a named customer&apos;s account issue and draft a response about why a debit
            card transaction was denied.
          </p>
        </div>
        <div>
          <span>Safe</span>
          <p>
            Using only the redacted facts below, draft a customer-service response template. Do not
            include account numbers, balances, transaction details, fraud conclusions, eligibility
            decisions, or promises. Mark missing facts as [VERIFY]. Label the output as draft
            pending banker review.
          </p>
        </div>
      </div>
    </section>
  );
}

function TeamDownloads() {
  return (
    <section className="mk-container prompt-team-downloads">
      <div className="prompt-example-head">
        <div>
          <div className="mk-k">For team rollout</div>
          <h2>Optional downloads.</h2>
        </div>
      </div>
      <div className="prompt-download-list">
        <DownloadRow
          title="Prompt card"
          body="The 5-line prompt method, placeholders, examples, and review checks."
          href="/api/resources/prompting-foundation-guide/download"
          slug="prompting-foundation-guide"
          format="PDF"
        />
        <DownloadRow
          title="Safe vs. unsafe examples"
          body="A short example set for training staff on the safer pattern."
          href="/api/resources/safe-vs-unsafe-prompt-examples/download"
          slug="safe-vs-unsafe-prompt-examples"
          format="PDF"
        />
        <DownloadRow
          title="Team package"
          body="All supporting cards, editable working brief, prompt library, and SOP next step."
          href="/api/resources/prompting-foundation-kit/download"
          slug="prompting-foundation-kit"
          format="ZIP"
        />
      </div>
    </section>
  );
}

function DownloadRow({
  title,
  body,
  href,
  slug,
  format,
}: {
  title: string;
  body: string;
  href: string;
  slug: string;
  format: string;
}) {
  return (
    <div className="prompt-download-row">
      <CheckCircle size={20} />
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <FreeResourceDownloadGate
        title={title}
        href={href}
        slug={slug}
        source="prompt-like-bottom-download"
        format={format}
        actionLabel={`Get ${format}`}
        capturedLabel={format}
        buttonVariant="ghost-light"
      >
        {format} <Download size={16} />
      </FreeResourceDownloadGate>
    </div>
  );
}
