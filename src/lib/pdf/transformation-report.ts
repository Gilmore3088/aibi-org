import { generatePdfFromHtml } from './generate';

export interface SkillEntry {
  readonly name: string;
  readonly role: string;
}

export interface QuickWinEntry {
  readonly description: string;
  readonly tool: string;
  readonly timeSavedMinutes: number;
}

export interface DimensionEntry {
  readonly label: string;
  readonly preScore: number | null;
  readonly postScore: number;
  readonly maxScore: number;
}

export interface TransformationReportProps {
  readonly learnerName: string;
  readonly institution: string;
  readonly reportDate: string;
  readonly preScore: number | null;
  readonly postScore: number;
  readonly preTierLabel: string | null;
  readonly postTierLabel: string;
  readonly dimensions: readonly DimensionEntry[];
  readonly skills: readonly SkillEntry[];
  readonly workflowsAutomated: number;
  readonly quickWins: readonly QuickWinEntry[];
  readonly modulesCompleted: number;
  readonly totalModules: number;
  readonly workProductSubmitted: boolean;
  readonly workProductReviewed: boolean;
  readonly verificationUrl: string;
  readonly enrollmentId: string;
}

const FOOTER_TEXT = 'The AI Banking Institute | AIBankingInstitute.com | Confidential';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });
}

function safeText(value: string | null | undefined, fallback = 'Not recorded'): string {
  const trimmed = value?.trim() ?? '';
  return escapeHtml(trimmed.length > 0 ? trimmed : fallback);
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function minutesToLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes === 60) return '1 hr';
  return `${Math.round(minutes / 60)} hrs`;
}

function tierColor(label: string | null): string {
  if (!label) return '#8a7060';
  const lower = label.toLowerCase();
  if (lower.includes('scale')) return '#047857';
  if (lower.includes('momentum')) return '#c96a43';
  if (lower.includes('early')) return '#c8a24a';
  return '#991b1b';
}

function pageFooter(pageNum: number, total: number): string {
  return `<footer class="footer"><span>${FOOTER_TEXT}</span><span>${pageNum} / ${total}</span></footer>`;
}

function scoreCard(label: string, score: string, tier: string, color: string, delta?: string): string {
  return `<article class="score-card">
    <p class="metric-label">${label}</p>
    <p class="score-number" style="color: ${color}">${score}</p>
    <p class="score-tier" style="color: ${color}">${tier}</p>
    ${delta ? `<p class="score-delta">${delta}</p>` : ''}
  </article>`;
}

function dimensionRows(dimensions: readonly DimensionEntry[], postTierLabel: string): string {
  if (dimensions.length === 0) {
    return '<p class="empty">No dimension scores were recorded for this report.</p>';
  }

  const color = tierColor(postTierLabel);
  return dimensions
    .map((dim) => {
      const maxScore = Math.max(1, dim.maxScore);
      const postPct = clampPercent((dim.postScore / maxScore) * 100);
      const prePct = dim.preScore === null ? null : clampPercent((dim.preScore / maxScore) * 100);
      const scoreLabel =
        dim.preScore === null
          ? `${dim.postScore} / ${dim.maxScore}`
          : `${dim.preScore} -> ${dim.postScore} / ${dim.maxScore}`;

      return `<div class="dimension-row">
        <div class="dimension-meta">
          <span>${safeText(dim.label)}</span>
          <span>${escapeHtml(scoreLabel)}</span>
        </div>
        <div class="bar-track">
          <span class="bar-fill" style="width: ${postPct}%; background: ${color};"></span>
          ${prePct === null ? '' : `<span class="bar-pre" style="width: ${prePct}%;"></span>`}
        </div>
      </div>`;
    })
    .join('');
}

function skillsList(skills: readonly SkillEntry[]): string {
  if (skills.length === 0) {
    return '<p class="empty">No skills on record yet. Complete Modules 7 and 8 to build your banking AI skill.</p>';
  }

  return skills
    .map(
      (skill, index) => `<article class="list-row">
        <p class="row-index">${String(index + 1).padStart(2, '0')}.</p>
        <div>
          <h3>${safeText(skill.name)}</h3>
          <p class="muted italic">${safeText(skill.role)}</p>
        </div>
      </article>`,
    )
    .join('');
}

function quickWinsList(quickWins: readonly QuickWinEntry[]): string {
  if (quickWins.length === 0) {
    return '<p class="empty">No quick wins logged yet. Visit the Quick Win Tracker to record automations you have built post-course.</p>';
  }

  return `<section class="quickwins">
    <p class="section-label">Quick Wins Log</p>
    ${quickWins
      .map(
        (win) => `<article class="quickwin-row">
          <p>${safeText(win.description)}</p>
          <p class="quickwin-meta">${safeText(win.tool)} | ${minutesToLabel(win.timeSavedMinutes)}</p>
        </article>`,
      )
      .join('')}
  </section>`;
}

export function buildTransformationReportHtml(props: TransformationReportProps): string {
  const hasPreScore = props.preScore !== null && props.preScore > 0;
  const delta = hasPreScore ? props.postScore - props.preScore! : null;
  const deltaPercent =
    hasPreScore && props.preScore! > 0
      ? Math.round(((props.postScore - props.preScore!) / props.preScore!) * 100)
      : null;
  const deltaLabel =
    delta !== null && deltaPercent !== null
      ? `${delta > 0 ? '+' : ''}${delta} pts (${deltaPercent > 0 ? '+' : ''}${deltaPercent}%)`
      : undefined;
  const totalQuarterlyMinutes = props.quickWins.reduce(
    (sum, win) => sum + win.timeSavedMinutes,
    0,
  );
  const totalQuarterlyHours = Math.round(totalQuarterlyMinutes / 60);
  const allModulesComplete = props.modulesCompleted >= props.totalModules;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AiBI-Foundation Transformation Report - ${safeText(props.learnerName)}</title>
    <style>
      @page {
        size: Letter;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      :root {
        --terra: #c8a24a;
        --terra-pale: #e6d39b;
        --parch: #f7f3ea;
        --linen: #f9f6f0;
        --ink: #071a2f;
        --muted: #8a7060;
        --border: #e2e8f0;
        --white: #ffffff;
        --sage: #047857;
        --red: #991b1b;
      }

      html,
      body {
        margin: 0;
        background: var(--linen);
        color: var(--ink);
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        line-height: 1.4;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .page {
        position: relative;
        width: 8.5in;
        min-height: 11in;
        overflow: hidden;
        background: var(--parch);
        page-break-after: always;
      }

      .page:last-child {
        page-break-after: auto;
      }

      .cover {
        background: var(--linen);
      }

      .cover-accent {
        height: 6px;
        background: var(--terra);
      }

      .cover-body {
        min-height: calc(11in - 6px);
        padding: 72px 56px 86px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .eyebrow,
      .metric-label,
      .section-label {
        color: var(--terra);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .cover .eyebrow {
        letter-spacing: 2.5px;
        margin: 0 0 20px;
      }

      .cover h1 {
        margin: 0 0 8px;
        font-size: 44px;
        line-height: 1.15;
        letter-spacing: 0;
      }

      .cover-subtitle {
        margin: 0 0 48px;
        color: var(--muted);
        font-size: 16px;
        font-style: italic;
      }

      .cover-divider {
        width: 48px;
        height: 2px;
        margin-bottom: 40px;
        background: var(--terra);
      }

      .cover-meta {
        display: grid;
        gap: 12px;
      }

      .cover-row {
        display: grid;
        grid-template-columns: 92px 1fr;
        gap: 16px;
      }

      .cover-label {
        margin: 2px 0 0;
        color: var(--muted);
        font-size: 9px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .cover-value {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
      }

      .seal {
        align-self: flex-end;
        width: 72px;
        height: 72px;
        border: 2px solid var(--terra);
        border-radius: 999px;
        display: grid;
        place-items: center;
        color: var(--terra);
        opacity: 0.78;
        text-align: center;
      }

      .seal strong {
        display: block;
        font-size: 18px;
        font-style: italic;
      }

      .seal span {
        display: block;
        color: var(--muted);
        font-size: 6px;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .page-header {
        padding: 18px 40px;
        background: var(--terra);
        color: var(--white);
      }

      .page-header .eyebrow {
        margin: 0 0 4px;
        color: var(--terra-pale);
        font-size: 8px;
        letter-spacing: 2px;
      }

      .page-header h2 {
        margin: 0;
        color: var(--white);
        font-size: 22px;
      }

      .page-body {
        padding: 24px 40px 64px;
      }

      .grid-2,
      .grid-3 {
        display: grid;
        gap: 18px;
      }

      .grid-2 {
        grid-template-columns: 1fr 1fr;
      }

      .grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }

      .score-row,
      .impact-grid,
      .completion-grid {
        margin-bottom: 24px;
      }

      .score-card,
      .impact-card,
      .completion-card {
        min-height: 104px;
        padding: 14px;
        border: 1px solid var(--border);
        border-radius: 2px;
        background: var(--white);
      }

      .score-card {
        text-align: center;
      }

      .metric-label,
      .section-label {
        margin: 0 0 8px;
        color: var(--muted);
      }

      .score-number,
      .impact-value {
        margin: 0;
        font-family: "Courier New", Courier, monospace;
        font-size: 32px;
        line-height: 1.1;
      }

      .score-tier,
      .score-delta,
      .gold {
        margin: 5px 0 0;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }

      .score-delta,
      .completion-ok {
        color: var(--sage);
      }

      .completion-miss {
        color: var(--red);
      }

      .dimension-row {
        margin-bottom: 9px;
      }

      .dimension-meta {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 4px;
        color: var(--muted);
        font-family: "Courier New", Courier, monospace;
        font-size: 10px;
      }

      .dimension-meta span:first-child {
        color: var(--ink);
        font-family: Arial, Helvetica, sans-serif;
      }

      .bar-track {
        position: relative;
        height: 7px;
        border-radius: 2px;
        background: var(--border);
      }

      .bar-fill,
      .bar-pre {
        position: absolute;
        left: 0;
        display: block;
        border-radius: 2px;
      }

      .bar-fill {
        top: 0;
        height: 7px;
        opacity: 0.72;
      }

      .bar-pre {
        top: 2px;
        height: 3px;
        background: var(--muted);
        opacity: 0.5;
      }

      .list-row {
        display: grid;
        grid-template-columns: 28px 1fr;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
      }

      .row-index,
      .quickwin-meta {
        margin: 0;
        color: var(--muted);
        font-family: "Courier New", Courier, monospace;
        font-size: 10px;
      }

      .list-row h3 {
        margin: 0 0 3px;
        font-size: 13px;
      }

      .muted {
        color: var(--muted);
      }

      .italic {
        font-style: italic;
      }

      .gold {
        color: var(--terra);
        font-size: 10px;
      }

      .empty,
      .note {
        color: var(--muted);
        font-style: italic;
      }

      .empty {
        margin: 0;
        padding: 12px 0;
      }

      .note {
        margin-top: 16px;
        line-height: 1.5;
      }

      .impact-value {
        color: var(--ink);
      }

      .impact-unit {
        margin: 2px 0 0;
        color: var(--muted);
        font-size: 10px;
      }

      .quickwin-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 14px;
        padding: 7px 0;
        border-bottom: 1px solid var(--border);
      }

      .quickwin-row p {
        margin: 0;
      }

      .completion-value {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
      }

      .credential {
        margin-bottom: 16px;
        padding: 18px;
        border-radius: 2px;
        background: var(--ink);
        color: var(--white);
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 24px;
        align-items: center;
      }

      .credential .metric-label {
        color: var(--terra-pale);
      }

      .credential-title {
        margin: 0;
        color: var(--white);
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .credential-sub {
        margin: 3px 0 0;
        color: var(--muted);
      }

      .enrollment-id {
        max-width: 220px;
        margin: 0;
        color: var(--muted);
        font-family: "Courier New", Courier, monospace;
        font-size: 9px;
        overflow-wrap: anywhere;
        text-align: right;
      }

      .verify-url {
        margin: 0;
        color: var(--terra);
        font-family: "Courier New", Courier, monospace;
        font-size: 11px;
        overflow-wrap: anywhere;
      }

      .footer {
        position: absolute;
        left: 40px;
        right: 40px;
        bottom: 20px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-top: 6px;
        border-top: 1px solid var(--border);
        color: rgba(138, 112, 96, 0.78);
        font-size: 9px;
      }
    </style>
  </head>
  <body>
    <section class="page cover">
      <div class="cover-accent"></div>
      <div class="cover-body">
        <div>
          <p class="eyebrow">AiBI-Foundation</p>
          <h1>Transformation<br />Report</h1>
          <p class="cover-subtitle">A record of AI readiness growth, skills built, and impact delivered.</p>
          <div class="cover-divider"></div>
          <div class="cover-meta">
            <div class="cover-row">
              <p class="cover-label">Prepared for</p>
              <p class="cover-value">${safeText(props.learnerName)}</p>
            </div>
            <div class="cover-row">
              <p class="cover-label">Institution</p>
              <p class="cover-value">${safeText(props.institution)}</p>
            </div>
            <div class="cover-row">
              <p class="cover-label">Date</p>
              <p class="cover-value">${safeText(props.reportDate)}</p>
            </div>
          </div>
        </div>
        <div class="seal" aria-label="AiBI institutional seal"><div><strong>AiBI</strong><span>Institutional</span></div></div>
      </div>
      ${pageFooter(1, 5)}
    </section>

    <section class="page">
      <header class="page-header">
        <p class="eyebrow">AiBI-Foundation Transformation Report | Page 2</p>
        <h2>Pre / Post Assessment Comparison</h2>
      </header>
      <div class="page-body">
        <div class="grid-2 score-row">
          ${
            hasPreScore
              ? scoreCard(
                  'Pre-Course Score',
                  String(props.preScore),
                  safeText(props.preTierLabel),
                  tierColor(props.preTierLabel),
                )
              : scoreCard('Pre-Course Score', '-', 'Not recorded', '#8a7060')
          }
          ${scoreCard(
            'Post-Course Score',
            String(props.postScore),
            safeText(props.postTierLabel),
            tierColor(props.postTierLabel),
            deltaLabel,
          )}
        </div>
        <section>
          <p class="section-label">Dimension-by-Dimension Comparison</p>
          ${dimensionRows(props.dimensions, props.postTierLabel)}
          <p class="note">${
            hasPreScore
              ? 'Filled bar = post-course score. Mid-bar stripe = pre-course baseline.'
              : 'Filled bar = post-course score. Pre-course baseline not available.'
          }</p>
        </section>
      </div>
      ${pageFooter(2, 5)}
    </section>

    <section class="page">
      <header class="page-header">
        <p class="eyebrow">AiBI-Foundation Transformation Report | Page 3</p>
        <h2>Skills Built</h2>
      </header>
      <div class="page-body">
        ${skillsList(props.skills)}
        <p class="note">Skills were built during the course using the five-component RTFC framework (Role, Task, Format, Constraints, Context) and stress-tested against real banking scenarios in Module 8 before deployment.</p>
      </div>
      ${pageFooter(3, 5)}
    </section>

    <section class="page">
      <header class="page-header">
        <p class="eyebrow">AiBI-Foundation Transformation Report | Page 4</p>
        <h2>Cumulative Impact</h2>
      </header>
      <div class="page-body">
        <div class="grid-2 impact-grid">
          <article class="impact-card">
            <p class="metric-label">Workflows Automated</p>
            <p class="impact-value">${props.workflowsAutomated}</p>
            <p class="impact-unit">skills built and deployed</p>
          </article>
          <article class="impact-card">
            <p class="metric-label">Quick Wins Logged</p>
            <p class="impact-value">${props.quickWins.length}</p>
            <p class="impact-unit">${totalQuarterlyHours > 0 ? `${totalQuarterlyHours} hrs total saved` : 'post-course automations'}</p>
          </article>
        </div>
        ${quickWinsList(props.quickWins)}
        <p class="note">Estimated hours saved are based on course curriculum time-savings data and learner-reported quick wins. Actual savings will vary by institution, role, and frequency of use.</p>
      </div>
      ${pageFooter(4, 5)}
    </section>

    <section class="page">
      <header class="page-header">
        <p class="eyebrow">AiBI-Foundation Transformation Report | Page 5</p>
        <h2>Course Completion Summary</h2>
      </header>
      <div class="page-body">
        <div class="grid-3 completion-grid">
          <article class="completion-card">
            <p class="metric-label">Modules Completed</p>
            <p class="completion-value ${allModulesComplete ? 'completion-ok' : 'completion-miss'}">${props.modulesCompleted} / ${props.totalModules}</p>
          </article>
          <article class="completion-card">
            <p class="metric-label">Work Product Submitted</p>
            <p class="completion-value ${props.workProductSubmitted ? 'completion-ok' : 'completion-miss'}">${props.workProductSubmitted ? 'Yes' : 'Not yet'}</p>
          </article>
          <article class="completion-card">
            <p class="metric-label">Work Product Reviewed</p>
            <p class="completion-value ${props.workProductReviewed ? 'completion-ok' : 'completion-miss'}">${props.workProductReviewed ? 'Approved' : 'Pending'}</p>
          </article>
        </div>

        <section class="credential">
          <div>
            <p class="metric-label">Credential Earned</p>
            <p class="credential-title">AiBI-Foundation</p>
            <p class="credential-sub">AiBI-Foundation | The AI Banking Institute</p>
          </div>
          <div>
            <p class="metric-label" style="text-align: right;">Enrollment ID</p>
            <p class="enrollment-id">${safeText(props.enrollmentId)}</p>
          </div>
        </section>

        <section>
          <p class="section-label">Credential Verification</p>
          <p class="verify-url">${safeText(props.verificationUrl)}</p>
        </section>

        <p class="note">This report was generated by The AI Banking Institute upon course completion. The credential display format for sharing is: AiBI-Foundation | The AI Banking Institute. Verification of credential issuance is available at the URL above.</p>
      </div>
      ${pageFooter(5, 5)}
    </section>
  </body>
</html>`;
}

export async function buildTransformationReportPdfBuffer(
  props: TransformationReportProps,
): Promise<Buffer> {
  return generatePdfFromHtml({
    html: buildTransformationReportHtml(props),
    viewport: { width: 1200, height: 1600 },
    pdf: {
      format: 'Letter',
      printBackground: true,
      margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
      preferCSSPageSize: true,
    },
  });
}
