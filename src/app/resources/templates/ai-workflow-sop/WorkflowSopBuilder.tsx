'use client';

import { useMemo, useState } from 'react';
import { Button, EyebrowChip, SiteHeader } from '@/components/mockup';
import { FreeResourceDownloadGate } from '@/components/resources/FreeResourceDownloadGate';
import {
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Users,
  Workflow,
} from '../../icons';

/* ── Model ──────────────────────────────────────────────────────────── */

interface SopForm {
  workflowId: string;
  workflowName: string;
  department: string;
  owner: string;
  accountableExecutive: string;
  riskTier: 'Green' | 'Yellow' | 'Red';
  status: 'Draft' | 'Reviewed' | 'Approved';
  purpose: string;
  approvedTool: string;
  deploymentType: string;
  dataClass: string;
  customerDataInvolved: string;
  regulatedProcessInvolved: string;
  approvalDate: string;
  nextReviewDate: string;
  allowedInputs: string;
  prohibitedInputs: string;
  promptInstructions: string;
  outputDescription: string;
  humanReviewer: string;
  reviewStandard: string;
  approvalCheckpoint: string;
  retentionRule: string;
  materialErrorThreshold: string;
  customerImpactingErrorThreshold: string;
  pauseTrigger: string;
  restartApproval: string;
  fallbackProcess: string;
  recordsRetained: string;
  lastVersionReviewed: string;
  escalationTriggers: string;
}

const EMPTY_FORM: SopForm = {
  workflowId: 'AI-OPS-001',
  workflowName: 'AI-Assisted Procedure Summary Workflow',
  department: 'Operations',
  owner: 'Department lead',
  accountableExecutive: 'Chief Operating Officer',
  riskTier: 'Yellow',
  status: 'Draft',
  purpose:
    'Use an approved AI tool to convert internal procedure text into a plain-English draft summary for staff review.',
  approvedTool: 'Approved AI writing assistant',
  deploymentType: 'Approved enterprise AI account',
  dataClass: 'Internal procedure text; no customer NPI',
  customerDataInvolved: 'No',
  regulatedProcessInvolved: 'None unless the source procedure touches a regulated process',
  approvalDate: 'YYYY-MM-DD',
  nextReviewDate: 'YYYY-MM-DD',
  allowedInputs:
    'Approved internal procedure text, role/audience, process owner, known exceptions, review owner.',
  prohibitedInputs:
    'Customer names, account numbers, balances, transactions, SSNs, DOBs, confidential records, examiner correspondence, legal advice requests, SAR or AML case details, authentication details, API keys, passwords, or access tokens.',
  promptInstructions:
    'Rewrite the approved procedure text into a plain-English staff summary. Preserve policy meaning. Do not add requirements. Flag unclear or missing information with [VERIFY]. Label output as draft pending review.',
  outputDescription:
    'Draft staff-facing summary with purpose, key steps, exceptions, escalation triggers, and reviewer checklist.',
  humanReviewer: 'Department lead or process owner',
  reviewStandard:
    'Reviewer confirms the source meaning was preserved, no prohibited data was included, uncertain items are flagged, escalation language is accurate, and the output is labeled draft until approved.',
  approvalCheckpoint:
    'The output may be distributed only after the human reviewer approves the final version.',
  retentionRule:
    'Save only the reviewed final version and source reference in the approved internal repository or toolbox. Do not retain unreviewed drafts as official records.',
  materialErrorThreshold: 'More than 5% of reviewed outputs require material correction in a month.',
  customerImpactingErrorThreshold: 'Any customer-impacting error.',
  pauseTrigger: 'Any prohibited input, data exposure, severe error, vendor model change, or two consecutive months over the material error threshold.',
  restartApproval: 'Workflow owner plus Compliance and Risk approval.',
  fallbackProcess: 'Complete the procedure summary manually using the approved source document and review checklist.',
  recordsRetained: 'Final reviewed output, source reference, reviewer note, approval record, and any exception or incident ticket.',
  lastVersionReviewed: 'Version/date/reviewer',
  escalationTriggers:
    'Escalate to Compliance, Legal, InfoSec, or Risk if the workflow touches customer impact, credit, BSA/AML, fraud, authentication, complaints, examiner-facing material, confidential records, or uncertain regulatory interpretation.',
};

const RISK_TIERS: SopForm['riskTier'][] = ['Green', 'Yellow', 'Red'];
const STATUSES: SopForm['status'][] = ['Draft', 'Reviewed', 'Approved'];
const DEPARTMENTS = [
  'Compliance',
  'Operations',
  'Retail',
  'Marketing',
  'Lending',
  'BSA / AML',
  'IT / InfoSec',
];

const REVIEW_ITEMS = [
  'Front-page control fields are complete',
  'Business purpose is clear',
  'Approved tool is named',
  'Allowed inputs are defined',
  'Prohibited inputs are explicit',
  'Human reviewer is identified',
  'Monitoring thresholds are written',
  'Pause and restart approvals are defined',
  'Approval checkpoint is documented',
  'Records retained are defined',
  'Escalation triggers are listed',
];

function buildMarkdown(form: SopForm): string {
  return `# ${form.workflowName}

## SOP Front Page

| Field | Response |
|---|---|
| Workflow ID | ${form.workflowId} |
| Workflow Name | ${form.workflowName} |
| Department | ${form.department} |
| Named Owner | ${form.owner} |
| Accountable Executive | ${form.accountableExecutive} |
| Tool/Vendor | ${form.approvedTool} |
| Deployment Type | ${form.deploymentType} |
| Data Class | ${form.dataClass} |
| Customer Data Involved | ${form.customerDataInvolved} |
| Regulated Process Involved | ${form.regulatedProcessInvolved} |
| Risk Tier | ${form.riskTier} |
| Status | ${form.status} |
| Approval Date | ${form.approvalDate} |
| Next Review Date | ${form.nextReviewDate} |
| Material Error Threshold | ${form.materialErrorThreshold} |
| Customer-Impacting Error Threshold | ${form.customerImpactingErrorThreshold} |
| Pause Trigger | ${form.pauseTrigger} |
| Restart Approval | ${form.restartApproval} |
| Fallback Process | ${form.fallbackProcess} |
| Records Retained | ${form.recordsRetained} |
| Last Version Reviewed | ${form.lastVersionReviewed} |

---

**Department:** ${form.department}
**Workflow owner:** ${form.owner}
**Accountable executive:** ${form.accountableExecutive}
**Risk tier:** ${form.riskTier}
**Status:** ${form.status}

---

## 1. Business Purpose

${form.purpose}

---

## 2. Approved Tool

${form.approvedTool}

**Deployment type:** ${form.deploymentType}

---

## 3. Allowed Inputs

${form.allowedInputs}

---

## 4. Prohibited Inputs

${form.prohibitedInputs}

---

## 5. Prompt / Task Instructions

${form.promptInstructions}

---

## 6. Expected Output

${form.outputDescription}

---

## 7. Human Reviewer

${form.humanReviewer}

---

## 8. Review Standard

${form.reviewStandard}

---

## 9. Approval Checkpoint

${form.approvalCheckpoint}

---

## 10. Retention Rule

${form.retentionRule}

**Records retained:** ${form.recordsRetained}

---

## 11. Monitoring Thresholds And Shutoff Triggers

| Field | Response |
|---|---|
| Material error threshold | ${form.materialErrorThreshold} |
| Customer-impacting error threshold | ${form.customerImpactingErrorThreshold} |
| Pause trigger | ${form.pauseTrigger} |
| Restart approval | ${form.restartApproval} |
| Fallback process | ${form.fallbackProcess} |

---

## 12. Escalation Triggers

${form.escalationTriggers}

---

## 13. Review Checklist

${REVIEW_ITEMS.map((item) => `- [ ] ${item}`).join('\n')}

---

## 14. Final Approval

| Field | Response |
|---|---|
| Reviewed by |  |
| Review date |  |
| Approved for use? | Yes / No / Conditional |
| Conditions or notes |  |
| Next review date |  |
`;
}

function getCompleteness(form: SopForm): number {
  const fields = Object.values(form);
  const filled = fields.filter((v) => String(v ?? '').trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

/* ── Component ──────────────────────────────────────────────────────── */

export function WorkflowSopBuilder() {
  const [form, setForm] = useState<SopForm>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  const markdown = useMemo(() => buildMarkdown(form), [form]);
  const completeness = useMemo(() => getCompleteness(form), [form]);
  const reviewComplete = checked.length === REVIEW_ITEMS.length;

  function updateField<K extends keyof SopForm>(field: K, value: SopForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setCopied(false);
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ai-workflow-sop-template.md';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function toggleReviewItem(item: string) {
    setChecked((cur) => (cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item]));
    setSaved(false);
  }

  function resetTemplate() {
    setForm(EMPTY_FORM);
    setCopied(false);
    setSaved(false);
    setChecked([]);
  }

  return (
    <div className="mockup-scope sop-scope">
      <SiteHeader activePath="/resources" />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<Workflow size={16} />}>Working markdown template</EyebrowChip>
            <h1>Document one AI-assisted workflow with controls.</h1>
            <p className="mk-lede">
              Capture the tool, data boundary, reviewer, vendor controls, monitoring thresholds,
              fallback process, and retained evidence before an AI workflow is reused.
            </p>
            <div className="mk-ctas">
              <FreeResourceDownloadGate
                title="Bank AI Workflow SOP Markdown"
                slug="template-ai-workflow-sop"
                source="resources-ai-workflow-sop-copy"
                format="Markdown"
                actionLabel="Get Markdown"
                capturedLabel={copied ? 'Copied' : 'Copy Markdown'}
                buttonVariant="gold"
                buttonSize="lg"
                formAriaLabel="Enter your email to use the Bank AI Workflow SOP Markdown"
                submitLabel="Continue"
                stayInteractiveAfterUnlock
                onUnlock={copyMarkdown}
              />
              <FreeResourceDownloadGate
                title="Bank AI Workflow SOP Markdown file"
                slug="template-ai-workflow-sop-md"
                source="resources-ai-workflow-sop-download"
                format="Markdown"
                actionLabel="Get .md"
                capturedLabel="Download .md"
                buttonVariant="ghost-dark"
                buttonSize="lg"
                formAriaLabel="Enter your email to download the Bank AI Workflow SOP Markdown file"
                stayInteractiveAfterUnlock
                onUnlock={downloadMarkdown}
              />
            </div>
          </div>

          <HeroSnapshot
            form={form}
            completeness={completeness}
            reviewComplete={reviewComplete}
            saved={saved}
            copied={copied}
          />
        </div>
      </section>

      <main className="mk-container sop-main">
        <div className="sop-col-form">
          <TemplateConfig form={form} updateField={updateField} reset={resetTemplate} />
          <ReviewChecklist
            checked={checked}
            toggle={toggleReviewItem}
            reviewComplete={reviewComplete}
            setSaved={setSaved}
            completeness={completeness}
          />
        </div>

        <div className="sop-col-preview">
          <MarkdownPreview
            markdown={markdown}
            copied={copied}
            copyMarkdown={copyMarkdown}
            downloadMarkdown={downloadMarkdown}
          />
          <UseGuide />
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function HeroSnapshot({
  form,
  completeness,
  reviewComplete,
  saved,
  copied,
}: {
  form: SopForm;
  completeness: number;
  reviewComplete: boolean;
  saved: boolean;
  copied: boolean;
}) {
  const stats = [
    { label: 'Workflow ID', value: form.workflowId, Icon: ClipboardCheck },
    { label: 'Risk tier', value: form.riskTier, Icon: ShieldCheck },
    { label: 'Status', value: form.status, Icon: BadgeCheck },
    { label: 'Reviewer', value: form.humanReviewer, Icon: Users },
  ];
  return (
    <aside className="sop-hero-card" data-testid="sop-hero-card">
      <div className="sop-hero-card-head">
        <div className="mk-k">Template snapshot</div>
        <h3>{form.workflowName}</h3>
      </div>
      <div className="sop-hero-card-stats">
        {stats.map((s) => (
          <div key={s.label} className="sop-stat">
            <s.Icon size={24} className="sop-stat-icon" />
            <p className="sop-stat-k">{s.label}</p>
            <p className="sop-stat-v">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="sop-hero-card-progress">
        <div className="sop-bar"><div className="sop-bar-fill" style={{ width: `${completeness}%` }} /></div>
        <div className="sop-pills">
          <StatusPill label="Review complete" active={reviewComplete} />
          <StatusPill label="Copied" active={copied} />
          <StatusPill label="Saved" active={saved} />
        </div>
      </div>
    </aside>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`sop-pill${active ? ' sop-pill-on' : ''}`}>
      {active ? '✓' : '—'} {label}
    </div>
  );
}

function TemplateConfig({
  form,
  updateField,
  reset,
}: {
  form: SopForm;
  updateField: <K extends keyof SopForm>(field: K, value: SopForm[K]) => void;
  reset: () => void;
}) {
  return (
    <section className="sop-card">
      <div className="sop-card-head">
        <div>
          <div className="mk-k">Step 1 · Fill the SOP</div>
          <h2>Workflow details</h2>
        </div>
        <Button variant="ghost-light" onClick={reset}>Reset</Button>
      </div>
      <p className="sop-card-lede">
        Use this for any AI-assisted task that could become repeatable, customer-facing,
        examiner-facing, or part of a retained business record.
      </p>

      <div className="sop-grid-2">
        <TextField label="Workflow ID" value={form.workflowId} onChange={(v) => updateField('workflowId', v)} />
        <SelectField
          label="Department"
          value={form.department}
          options={DEPARTMENTS}
          onChange={(v) => updateField('department', v)}
        />
        <SelectField
          label="Risk tier"
          value={form.riskTier}
          options={RISK_TIERS}
          onChange={(v) => updateField('riskTier', v as SopForm['riskTier'])}
        />
        <SelectField
          label="Status"
          value={form.status}
          options={STATUSES}
          onChange={(v) => updateField('status', v as SopForm['status'])}
        />
        <TextField label="Workflow owner" value={form.owner} onChange={(v) => updateField('owner', v)} />
        <TextField
          label="Accountable executive"
          value={form.accountableExecutive}
          onChange={(v) => updateField('accountableExecutive', v)}
        />
        <TextField
          label="Approval date"
          value={form.approvalDate}
          onChange={(v) => updateField('approvalDate', v)}
        />
        <TextField
          label="Next review date"
          value={form.nextReviewDate}
          onChange={(v) => updateField('nextReviewDate', v)}
        />
      </div>

      <TextField label="Workflow name" value={form.workflowName} onChange={(v) => updateField('workflowName', v)} />
      <TextField label="Business purpose" value={form.purpose} onChange={(v) => updateField('purpose', v)} textarea />
      <TextField label="Tool / vendor" value={form.approvedTool} onChange={(v) => updateField('approvedTool', v)} />
      <TextField label="Deployment type" value={form.deploymentType} onChange={(v) => updateField('deploymentType', v)} />
      <TextField label="Data class" value={form.dataClass} onChange={(v) => updateField('dataClass', v)} />
      <TextField
        label="Customer data involved"
        value={form.customerDataInvolved}
        onChange={(v) => updateField('customerDataInvolved', v)}
      />
      <TextField
        label="Regulated process involved"
        value={form.regulatedProcessInvolved}
        onChange={(v) => updateField('regulatedProcessInvolved', v)}
      />
      <TextField label="Allowed inputs" value={form.allowedInputs} onChange={(v) => updateField('allowedInputs', v)} textarea />
      <TextField label="Prohibited inputs" value={form.prohibitedInputs} onChange={(v) => updateField('prohibitedInputs', v)} textarea />
      <TextField label="Prompt / task instructions" value={form.promptInstructions} onChange={(v) => updateField('promptInstructions', v)} textarea />
      <TextField label="Expected output" value={form.outputDescription} onChange={(v) => updateField('outputDescription', v)} textarea />
      <TextField label="Human reviewer" value={form.humanReviewer} onChange={(v) => updateField('humanReviewer', v)} />
      <TextField label="Review standard" value={form.reviewStandard} onChange={(v) => updateField('reviewStandard', v)} textarea />
      <TextField label="Approval checkpoint" value={form.approvalCheckpoint} onChange={(v) => updateField('approvalCheckpoint', v)} textarea />
      <TextField label="Retention rule" value={form.retentionRule} onChange={(v) => updateField('retentionRule', v)} textarea />
      <TextField
        label="Material error threshold"
        value={form.materialErrorThreshold}
        onChange={(v) => updateField('materialErrorThreshold', v)}
        textarea
      />
      <TextField
        label="Customer-impacting error threshold"
        value={form.customerImpactingErrorThreshold}
        onChange={(v) => updateField('customerImpactingErrorThreshold', v)}
        textarea
      />
      <TextField label="Pause trigger" value={form.pauseTrigger} onChange={(v) => updateField('pauseTrigger', v)} textarea />
      <TextField label="Restart approval" value={form.restartApproval} onChange={(v) => updateField('restartApproval', v)} textarea />
      <TextField label="Fallback process" value={form.fallbackProcess} onChange={(v) => updateField('fallbackProcess', v)} textarea />
      <TextField label="Records retained" value={form.recordsRetained} onChange={(v) => updateField('recordsRetained', v)} textarea />
      <TextField
        label="Last version reviewed"
        value={form.lastVersionReviewed}
        onChange={(v) => updateField('lastVersionReviewed', v)}
      />
      <TextField label="Escalation triggers" value={form.escalationTriggers} onChange={(v) => updateField('escalationTriggers', v)} textarea />
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
  onChange: (v: string) => void;
}) {
  return (
    <label className="sop-field">
      <span className="sop-field-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sop-input"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="sop-field sop-field-stack">
      <span className="sop-field-label">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sop-input sop-textarea"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sop-input"
        />
      )}
    </label>
  );
}

function ReviewChecklist({
  checked,
  toggle,
  reviewComplete,
  setSaved,
  completeness,
}: {
  checked: string[];
  toggle: (item: string) => void;
  reviewComplete: boolean;
  setSaved: (v: boolean) => void;
  completeness: number;
}) {
  return (
    <section className="sop-card">
      <div className="sop-card-head">
        <div>
          <div className="mk-k">Step 2 · Review</div>
          <h3>Before this SOP is adopted</h3>
        </div>
        <span
          className={`sop-counter${reviewComplete ? ' sop-counter-on' : ''}`}
          data-testid="review-counter"
        >
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

      <Button
        variant="ink"
        onClick={() => setSaved(true)}
        disabled={!reviewComplete || completeness < 100}
        className="sop-mark-btn"
      >
        Mark SOP reviewed <CheckCircle size={16} />
      </Button>
    </section>
  );
}

function MarkdownPreview({
  markdown,
  copied,
  copyMarkdown,
  downloadMarkdown,
}: {
  markdown: string;
  copied: boolean;
  copyMarkdown: () => void;
  downloadMarkdown: () => void;
}) {
  return (
    <section className="sop-card sop-card-preview">
      <div className="sop-card-head sop-card-head-bordered">
        <div>
          <div className="mk-k">Markdown output</div>
          <h3>ai-workflow-sop-template.md</h3>
        </div>
        <div className="sop-preview-actions">
          <FreeResourceDownloadGate
            title="Bank AI Workflow SOP Markdown"
            slug="template-ai-workflow-sop"
            source="resources-ai-workflow-sop-preview-copy"
            format="Markdown"
            actionLabel="Get Markdown"
            capturedLabel={copied ? 'Copied' : 'Copy'}
            buttonVariant="ghost-light"
            formAriaLabel="Enter your email to use the Bank AI Workflow SOP Markdown"
            submitLabel="Continue"
            stayInteractiveAfterUnlock
            onUnlock={copyMarkdown}
          />
          <FreeResourceDownloadGate
            title="Bank AI Workflow SOP Markdown file"
            slug="template-ai-workflow-sop-md"
            source="resources-ai-workflow-sop-preview-download"
            format="Markdown"
            actionLabel="Get .md"
            capturedLabel="Download .md"
            buttonVariant="ink"
            formAriaLabel="Enter your email to download the Bank AI Workflow SOP Markdown file"
            stayInteractiveAfterUnlock
            onUnlock={downloadMarkdown}
          />
        </div>
      </div>
      <pre className="sop-md" data-testid="markdown-preview">{markdown}</pre>
    </section>
  );
}

function UseGuide() {
  const items = [
    { title: 'Use for repeatable work', desc: 'If the workflow will be reused, document it before scaling.', Icon: Workflow },
    { title: 'Name the reviewer', desc: 'Medium and high-risk outputs need a clear accountable human owner.', Icon: Users },
    { title: 'Define the data boundary', desc: 'Allowed and prohibited inputs should be clear before anyone runs the prompt.', Icon: LockKeyhole },
    { title: 'Write the shutoff trigger', desc: 'The SOP should say exactly when use pauses and who can restart it.', Icon: FileText },
  ];
  return (
    <section className="sop-card">
      <div className="mk-k">How to use this template</div>
      <div className="sop-guide-grid">
        {items.map((i) => (
          <div key={i.title} className="sop-guide-item">
            <i.Icon size={24} className="sop-stat-icon" />
            <h3>{i.title}</h3>
            <p>{i.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
