// Assessment-domain transactional emails.

import type { DimensionScoreSerialized } from '@/lib/user-data';
import {
  assessmentResultsBreakdownHtml,
  assessmentResultsBreakdownText,
} from '../templates/assessment-results-breakdown';
import {
  assessmentOptionsHtml,
  assessmentOptionsText,
} from '../templates/assessment-options';
import { sendInline, siteUrl, type ResendResult } from '../_core';
import { supportShell } from './support';

// ── Email 1: Assessment results breakdown ───────────────────────────────────

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
  readonly starterArtifactBody?: string;
  readonly profileId?: string | null;
  /** One-click magic-link login URL. */
  readonly magicLinkUrl?: string;
}

export function sendAssessmentBreakdown(
  payload: AssessmentBreakdownEmailPayload,
): Promise<ResendResult> {
  const resultsUrl = payload.profileId
    ? `${siteUrl()}/results/${payload.profileId}`
    : `${siteUrl()}/assessment`;

  const dashboardUrl =
    payload.magicLinkUrl ??
    `${siteUrl()}/auth/login?next=/dashboard`;

  return sendInline({
    to: payload.email,
    subject: `Your AI readiness score — ${payload.tierLabel}`,
    html: assessmentResultsBreakdownHtml({
      tierLabel: payload.tierLabel,
      tierHeadline: payload.tierHeadline,
      tierSummary: payload.tierSummary,
      score: payload.score,
      maxScore: payload.maxScore,
      resultsUrl,
      dashboardUrl,
    }),
    text: assessmentResultsBreakdownText({
      tierLabel: payload.tierLabel,
      tierHeadline: payload.tierHeadline,
      tierSummary: payload.tierSummary,
      score: payload.score,
      maxScore: payload.maxScore,
      resultsUrl,
      dashboardUrl,
    }),
    tag: '[resend:assessment-results-breakdown]',
  });
}

// ── Email 7: Assessment options ──────────────────────────────────────────────

export interface AssessmentOptionsPayload {
  readonly email: string;
  readonly institution?: string;
}

export function sendAssessmentOptions(
  payload: AssessmentOptionsPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'The AI readiness assessment is ready when you are',
    html: assessmentOptionsHtml({ institution: payload.institution ?? 'your institution' }),
    text: assessmentOptionsText({ institution: payload.institution ?? 'your institution' }),
    tag: '[resend:assessment-options]',
  });
}

export interface AssessmentResumeLinkPayload {
  readonly email: string;
  readonly resumeUrl: string;
  readonly currentQuestion: number;
  readonly totalQuestions: number;
  readonly expiresInDays: number;
}

export function sendAssessmentResumeLink(
  payload: AssessmentResumeLinkPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'Resume your AI readiness assessment',
    html: supportShell(
      'Resume your assessment',
      `<p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 18px">
        Continue from question ${payload.currentQuestion} of ${payload.totalQuestions}. This link keeps your current question set and saved answers.
      </p>
      <p style="margin:0 0 14px">
        <a href="${payload.resumeUrl}" style="display:inline-block;padding:12px 18px;background:#071A2F;color:#fff;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Resume assessment</a>
      </p>
      <p style="font-size:13px;line-height:1.5;color:#64748B;margin:0">
        The link expires in ${payload.expiresInDays} days. If you did not request it, you can ignore this email.
      </p>`,
    ),
    text:
      `AI Banking Institute\n\n` +
      `Resume your AI readiness assessment from question ${payload.currentQuestion} of ${payload.totalQuestions}:\n` +
      `${payload.resumeUrl}\n\n` +
      `This link expires in ${payload.expiresInDays} days. If you did not request it, you can ignore this email.`,
    tag: '[resend:assessment-resume-link]',
  });
}
