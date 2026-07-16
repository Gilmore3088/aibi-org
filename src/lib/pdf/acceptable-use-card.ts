import { generatePdfFromHtml } from './generate';
import { escapeHtml } from '@/lib/html/escape';

export interface AcceptableUseCardHtmlInput {
  readonly roleContext: string;
  readonly primaryAiTool: string;
  readonly highestRiskScenario: string;
  readonly quickWinUseCase: string;
  readonly generatedDate?: string;
}

export function formatAcceptableUseCardDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function safeText(value: string): string {
  const trimmed = value.trim();
  return escapeHtml(trimmed.length > 0 ? trimmed : 'Not provided.');
}

export function buildAcceptableUseCardHtml(input: AcceptableUseCardHtmlInput): string {
  const generatedDate = input.generatedDate ?? formatAcceptableUseCardDate();
  const roleContext = safeText(input.roleContext);
  const primaryAiTool = safeText(input.primaryAiTool);
  const highestRiskScenario = safeText(input.highestRiskScenario);
  const quickWinUseCase = safeText(input.quickWinUseCase);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Acceptable Use Card - The AI Banking Institute</title>
    <style>
      @page {
        size: Letter;
        margin: 0.35in;
      }

      * {
        box-sizing: border-box;
      }

      :root {
        --terra: #c8a24a;
        --parch: #f7f3ea;
        --ink: #071a2f;
        --sage: #047857;
        --red: #991b1b;
        --border: #e2e8f0;
        --white: #ffffff;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        background: var(--parch);
        color: var(--ink);
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        line-height: 1.45;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .card {
        min-height: calc(11in - 0.7in);
        background: var(--parch);
        display: flex;
        flex-direction: column;
      }

      .header {
        background: var(--terra);
        color: var(--white);
        padding: 20px 32px;
      }

      .header h1 {
        margin: 0 0 4px;
        font-size: 28px;
        line-height: 1.1;
        letter-spacing: 0;
      }

      .header p {
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
      }

      .body {
        flex: 1;
        padding: 22px 32px 0;
      }

      .section {
        margin-bottom: 14px;
      }

      .label {
        margin: 0 0 5px;
        color: var(--terra);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.1px;
        text-transform: uppercase;
      }

      .value {
        min-height: 33px;
        margin: 0;
        padding: 8px 10px;
        border: 1px solid var(--border);
        border-radius: 2px;
        background: var(--white);
        font-size: 12px;
        white-space: pre-wrap;
      }

      .callout {
        padding: 9px 10px;
        border-left: 4px solid;
        white-space: pre-wrap;
      }

      .callout h2 {
        margin: 0 0 4px;
        font-size: 10px;
        line-height: 1.2;
      }

      .callout p {
        margin: 0;
      }

      .warning {
        border-left-color: var(--red);
        background: rgba(153, 27, 27, 0.06);
      }

      .warning h2,
      .warning .rule {
        color: var(--red);
      }

      .warning .rule {
        margin-top: 7px;
        font-size: 11px;
        font-weight: 700;
      }

      .safe {
        border-left-color: var(--sage);
        background: rgba(4, 120, 87, 0.06);
      }

      .safe h2 {
        color: var(--sage);
      }

      .tiers {
        margin-top: 14px;
        border: 1px solid var(--border);
        background: var(--white);
      }

      .tiers-title {
        margin: 0;
        padding: 7px 10px;
        background: var(--terra);
        color: var(--white);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }

      .tier-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 2fr;
      }

      .tier {
        min-height: 54px;
        padding: 8px 10px;
        border-right: 1px solid var(--border);
      }

      .tier:last-child {
        border-right: 0;
      }

      .tier h3 {
        margin: 0 0 3px;
        font-size: 10px;
      }

      .tier p {
        margin: 0;
        color: rgba(7, 26, 47, 0.72);
        font-size: 9.5px;
      }

      .restricted h3 {
        color: var(--red);
      }

      .note {
        margin: 14px 0 0;
        color: rgba(7, 26, 47, 0.62);
        font-size: 10px;
        font-style: italic;
        text-align: center;
      }

      .footer {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        margin: 0 32px 16px;
        padding-top: 7px;
        border-top: 1px solid var(--border);
        color: rgba(7, 26, 47, 0.55);
        font-size: 9px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <header class="header">
        <h1>Acceptable Use Card</h1>
        <p>The AI Banking Institute | AiBI-Foundation</p>
      </header>

      <section class="body" aria-label="Personalized acceptable use card">
        <section class="section">
          <p class="label">Your Role</p>
          <p class="value">${roleContext}</p>
        </section>

        <section class="section">
          <p class="label">Authorized AI Tools</p>
          <p class="value">${primaryAiTool}</p>
        </section>

        <section class="section">
          <p class="label">STOP: Your Highest-Risk Scenario</p>
          <div class="callout warning">
            <h2>Highest-Risk Scenario Identified</h2>
            <p>${highestRiskScenario}</p>
            <p class="rule">Before using AI in this context, confirm: Is this data Tier 1 (Public), Tier 2 (Internal Only), or Tier 3 (Restricted)?<br />If Tier 3: DO NOT proceed.</p>
          </div>
        </section>

        <section class="section">
          <p class="label">START HERE: Your Safe Use Case</p>
          <div class="callout safe">
            <h2>Recommended Starting Use Case</h2>
            <p>${quickWinUseCase}</p>
          </div>
        </section>

        <section class="tiers" aria-label="Three-tier data classification quick reference">
          <p class="tiers-title">Quick Reference: Three-Tier Data Classification</p>
          <div class="tier-grid">
            <div class="tier">
              <h3>Tier 1 - Public</h3>
              <p>Any AI tool permitted</p>
            </div>
            <div class="tier">
              <h3>Tier 2 - Internal Only</h3>
              <p>Enterprise-licensed tools only</p>
            </div>
            <div class="tier restricted">
              <h3>Tier 3 - Restricted</h3>
              <p>PROHIBITED in AI tools</p>
            </div>
          </div>
        </section>

        <p class="note">This card is personalized to your role. Keep at your workstation.</p>
      </section>

      <footer class="footer">
        <span>Generated ${escapeHtml(generatedDate)} | AIBankingInstitute.com</span>
        <span>The AI Banking Institute</span>
      </footer>
    </main>
  </body>
</html>`;
}

export async function buildAcceptableUseCardPdfBuffer(
  input: AcceptableUseCardHtmlInput,
): Promise<Buffer> {
  return generatePdfFromHtml({
    html: buildAcceptableUseCardHtml(input),
    viewport: { width: 1200, height: 1600 },
    pdf: {
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.35in', right: '0.35in', bottom: '0.35in', left: '0.35in' },
      preferCSSPageSize: true,
    },
  });
}
