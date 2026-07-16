// Team Assessment transactional emails.

import {
  teamAssessmentPurchaseHtml,
  teamAssessmentPurchaseText,
} from '../templates/team-assessment-purchase';
import {
  teamAssessmentParticipantReportHtml,
  teamAssessmentParticipantReportText,
} from '../templates/team-assessment-participant-report';
import {
  teamAssessmentReportUnlockedHtml,
  teamAssessmentReportUnlockedText,
} from '../templates/team-assessment-report-unlocked';
import { sendInline, type ResendResult } from '../_core';

// ── Email 3.5: Team Assessment purchase ────────────────────────────────────

export interface TeamAssessmentPurchasePayload {
  readonly email: string;
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly amountPaid: string;
  readonly adminUrl: string;
  readonly participantUrl: string;
}

export function sendTeamAssessmentPurchase(
  payload: TeamAssessmentPurchasePayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `${payload.institutionName} — your Team Assessment is ready`,
    html: teamAssessmentPurchaseHtml({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl: payload.adminUrl,
      participantUrl: payload.participantUrl,
    }),
    text: teamAssessmentPurchaseText({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl: payload.adminUrl,
      participantUrl: payload.participantUrl,
    }),
    tag: '[resend:team-assessment-purchase]',
  });
}

// ── Email 3.6: Team Assessment participant personal report ────────────────

export interface TeamAssessmentParticipantReportPayload {
  readonly email: string;
  readonly institutionName: string;
  readonly score: number;
  readonly bandLabel: string;
  readonly reportUrl: string;
}

export function sendTeamAssessmentParticipantReport(
  payload: TeamAssessmentParticipantReportPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `Your ${payload.institutionName} AI readiness report`,
    html: teamAssessmentParticipantReportHtml({
      institutionName: payload.institutionName,
      score: payload.score,
      bandLabel: payload.bandLabel,
      reportUrl: payload.reportUrl,
    }),
    text: teamAssessmentParticipantReportText({
      institutionName: payload.institutionName,
      score: payload.score,
      bandLabel: payload.bandLabel,
      reportUrl: payload.reportUrl,
    }),
    tag: '[resend:team-assessment-participant-report]',
  });
}

// ── Email 3.7: Team Assessment aggregate unlocked ──────────────────────────

export interface TeamAssessmentReportUnlockedPayload {
  readonly email: string;
  readonly institutionName: string;
  readonly completedCount: number;
  readonly adminUrl: string;
}

export function sendTeamAssessmentReportUnlocked(
  payload: TeamAssessmentReportUnlockedPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `${payload.institutionName} — your Team Assessment report is ready`,
    html: teamAssessmentReportUnlockedHtml({
      institutionName: payload.institutionName,
      completedCount: payload.completedCount,
      adminUrl: payload.adminUrl,
    }),
    text: teamAssessmentReportUnlockedText({
      institutionName: payload.institutionName,
      completedCount: payload.completedCount,
      adminUrl: payload.adminUrl,
    }),
    tag: '[resend:team-assessment-report-unlocked]',
  });
}
