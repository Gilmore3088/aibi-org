// Resend transactional email adapter.
//
// Audit ref: PR-#1 EmailGate copy promised "we will email you a brief
// interpretation" but the system only tagged ConvertKit and created a
// HubSpot contact — no actual email was sent. This closes that gap.
//
// Uses Resend's HTTP API directly via fetch (no SDK dependency, matches the
// adapter pattern used for ConvertKit and HubSpot).
//
// Pattern: best-effort, non-blocking, no-op when env vars are unset. Failure
// is logged and swallowed so the assessment flow is never blocked by an
// outbound email problem.

import type { DimensionScoreSerialized } from '@/lib/user-data';

const RESEND_API_URL = 'https://api.resend.com/emails';

// Per CLAUDE.md 2026-04-17 decision, the interim sender is onboarding@resend.dev
// pending verification of the aibankinginstitute.com sending domain. Configurable
// via RESEND_FROM env var so the swap is a one-line config change later.
const DEFAULT_FROM = 'onboarding@resend.dev';
const DEFAULT_FROM_NAME = 'The AI Banking Institute';

const REPLY_TO = 'hello@aibankinginstitute.com';

export interface AssessmentBreakdownEmailPayload {
  readonly email: string;
  readonly score: number;
  readonly maxScore: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly tierHeadline: string;
  readonly tierSummary: string;
  readonly dimensionBreakdown?: Record<string, DimensionScoreSerialized>;
  readonly starterArtifactTitle?: string;
  readonly starterArtifactBody?: string; // markdown
}

export type ResendResult =
  | { skipped: true; reason: string }
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Send the post-assessment breakdown email.
 *
 * No-ops when RESEND_API_KEY is unset (dev / staging without keys) or when
 * SKIP_RESEND=true is set (test runs).
 */
export async function sendAssessmentBreakdown(
  payload: AssessmentBreakdownEmailPayload,
): Promise<ResendResult> {
  if (process.env.SKIP_RESEND === 'true') {
    return { skipped: true, reason: 'SKIP_RESEND env flag' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const fromAddress = process.env.RESEND_FROM ?? DEFAULT_FROM;
  const fromName = process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;

  const html = renderBreakdownHtml(payload);
  const text = renderBreakdownText(payload);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [payload.email],
        reply_to: REPLY_TO,
        subject: `Your AI readiness score — ${payload.tierLabel}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      return {
        ok: false,
        error: `Resend API ${response.status}: ${body.slice(0, 200)}`,
      };
    }

    const json = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: json.id ?? 'unknown' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    };
  }
}

// ── HTML email template ──────────────────────────────────────────────────────
//
// Inline-styled because most email clients ignore <head> styles. Brand tokens
// hardcoded as hex because email clients don't read CSS variables.

const BRAND = {
  terra: '#b5512e',
  terraLight: '#c96a43',
  parch: '#f5f0e6',
  linen: '#f9f6f0',
  ink: '#1e1a14',
  slate: '#6b6355',
} as const;

function renderBreakdownHtml(p: AssessmentBreakdownEmailPayload): string {
  const dims = p.dimensionBreakdown
    ? Object.values(p.dimensionBreakdown)
        .map(
          (d) =>
            `<tr><td style="padding:6px 0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:${BRAND.ink};">${escape(
              d.label,
            )}</td><td style="padding:6px 0;font-family:'DM Mono',Consolas,monospace;font-size:13px;color:${BRAND.slate};text-align:right;">${d.score} / ${d.maxScore}</td></tr>`,
        )
        .join('')
    : '';

  const dimsBlock = dims
    ? `<h2 style="font-family:Georgia,serif;font-size:20px;color:${BRAND.ink};margin:32px 0 12px;">Your dimension breakdown</h2>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">${dims}</table>`
    : '';

  const artifactBlock = p.starterArtifactTitle
    ? `<h2 style="font-family:Georgia,serif;font-size:20px;color:${BRAND.ink};margin:32px 0 12px;">Your starter artifact</h2>
<p style="font-family:'DM Sans',Arial,sans-serif;font-size:15px;line-height:1.6;color:${BRAND.ink};margin:0 0 16px;"><strong>${escape(
        p.starterArtifactTitle,
      )}</strong></p>
<p style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;line-height:1.6;color:${BRAND.slate};margin:0 0 16px;">The full artifact is on your results page — click below to copy or download as Markdown.</p>
<p style="margin:16px 0;"><a href="https://aibankinginstitute.com/assessment" style="display:inline-block;padding:12px 24px;background-color:${BRAND.terra};color:${BRAND.linen};font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;text-decoration:none;border-radius:2px;">Open my full results</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Your AI readiness score</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.linen};">
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${BRAND.linen};">
<tr><td align="center" style="padding:32px 16px;">
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background-color:${BRAND.linen};">
<tr><td>
<p style="font-family:Georgia,serif;font-size:11px;color:${BRAND.terra};letter-spacing:0.22em;text-transform:uppercase;margin:0 0 12px;">The AI Banking Institute</p>
<h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.15;color:${BRAND.ink};margin:0 0 16px;">${escape(
    p.tierHeadline,
  )}</h1>
<p style="font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.6;color:${BRAND.ink};margin:0 0 24px;">${escape(
    p.tierSummary,
  )}</p>
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${BRAND.parch};border:1px solid ${BRAND.ink}1a;border-radius:3px;width:100%;">
<tr><td style="padding:24px;">
<p style="font-family:Georgia,serif;font-size:11px;color:${BRAND.slate};letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">Your score</p>
<p style="font-family:'DM Mono',Consolas,monospace;font-size:32px;color:${BRAND.terra};margin:0 0 4px;">${p.score} / ${p.maxScore}</p>
<p style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:${BRAND.slate};margin:0;">${escape(
    p.tierLabel,
  )}</p>
</td></tr>
</table>
${dimsBlock}
${artifactBlock}
<p style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:${BRAND.slate};line-height:1.5;margin:32px 0 8px;">No marketing list, no sales follow-up unless you ask. The free assessment gives you the diagnostic; everything beyond is on your timeline.</p>
<p style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:${BRAND.slate};line-height:1.5;margin:24px 0 0;">— The AI Banking Institute<br><a href="mailto:${REPLY_TO}" style="color:${BRAND.terra};text-decoration:underline;">${REPLY_TO}</a> · <a href="https://aibankinginstitute.com" style="color:${BRAND.terra};text-decoration:underline;">aibankinginstitute.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function renderBreakdownText(p: AssessmentBreakdownEmailPayload): string {
  const dims = p.dimensionBreakdown
    ? Object.values(p.dimensionBreakdown)
        .map((d) => `  ${d.label.padEnd(28, ' ')} ${d.score} / ${d.maxScore}`)
        .join('\n')
    : '';

  return `Your AI readiness score
${'-'.repeat(40)}

${p.tierHeadline}

${p.tierSummary}

Score: ${p.score} / ${p.maxScore}
Tier:  ${p.tierLabel}

${dims ? `Dimension breakdown:\n${dims}\n` : ''}${
    p.starterArtifactTitle
      ? `\nYour starter artifact: ${p.starterArtifactTitle}\nOpen the full artifact at https://aibankinginstitute.com/assessment\n`
      : ''
  }

No marketing list, no sales follow-up unless you ask.

— The AI Banking Institute
${REPLY_TO} · aibankinginstitute.com
`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
