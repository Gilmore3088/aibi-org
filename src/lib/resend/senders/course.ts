// Course-purchase transactional emails.

import {
  coursePurchaseIndividualHtml,
  coursePurchaseIndividualText,
} from '../templates/course-purchase-individual';
import {
  inDepthAssessmentPurchaseHtml,
  inDepthAssessmentPurchaseText,
} from '../templates/in-depth-assessment-purchase';
import {
  coursePurchaseInstitutionHtml,
  coursePurchaseInstitutionText,
} from '../templates/course-purchase-institution';
import { sendInline, siteUrl, type ResendResult } from '../_core';

// ── Email 2: Course purchase — individual ───────────────────────────────────

export interface CoursePurchaseIndividualPayload {
  readonly email: string;
  readonly courseName?: string;
  readonly courseUrl?: string;
  readonly amountPaid: string;
  readonly magicLinkUrl?: string;
}

export function sendCoursePurchaseIndividual(
  payload: CoursePurchaseIndividualPayload,
): Promise<ResendResult> {
  const courseName = payload.courseName ?? 'AiBI-Foundation';
  const courseUrl =
    payload.magicLinkUrl ??
    payload.courseUrl ??
    `${siteUrl()}/courses/foundation/program`;

  return sendInline({
    to: payload.email,
    subject: `Welcome to the ${courseName} program`,
    html: coursePurchaseIndividualHtml({ courseName, courseUrl, amountPaid: payload.amountPaid }),
    text: coursePurchaseIndividualText({ courseName, courseUrl, amountPaid: payload.amountPaid }),
    tag: '[resend:course-purchase-individual]',
  });
}

// ── Email 2.5: In-Depth Assessment purchase ────────────────────────────────

export interface IndepthAssessmentPurchasePayload {
  readonly email: string;
  readonly amountPaid: string;
  readonly magicLinkUrl?: string;
}

export function sendIndepthAssessmentPurchase(
  payload: IndepthAssessmentPurchasePayload,
): Promise<ResendResult> {
  const assessmentUrl =
    payload.magicLinkUrl ??
    `${siteUrl()}/assessment/in-depth/purchased`;

  return sendInline({
    to: payload.email,
    subject: 'Your In-Depth AI Readiness Assessment is unlocked',
    html: inDepthAssessmentPurchaseHtml({ amountPaid: payload.amountPaid, assessmentUrl }),
    text: inDepthAssessmentPurchaseText({ amountPaid: payload.amountPaid, assessmentUrl }),
    tag: '[resend:in-depth-assessment-purchase]',
  });
}

// ── Email 3: Course purchase — institution bundle ───────────────────────────

export interface CoursePurchaseInstitutionPayload {
  readonly email: string;
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly amountPaid: string;
  readonly magicLinkUrl?: string;
}

export function sendCoursePurchaseInstitution(
  payload: CoursePurchaseInstitutionPayload,
): Promise<ResendResult> {
  const adminUrl =
    payload.magicLinkUrl ?? `${siteUrl()}/courses/foundation/program`;

  return sendInline({
    to: payload.email,
    subject: `${payload.institutionName} — your AiBI-Foundation seats are ready`,
    html: coursePurchaseInstitutionHtml({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl,
      courseUrl: `${siteUrl()}/courses/foundation/program`,
    }),
    text: coursePurchaseInstitutionText({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl,
      courseUrl: `${siteUrl()}/courses/foundation/program`,
    }),
    tag: '[resend:course-purchase-institution]',
  });
}
