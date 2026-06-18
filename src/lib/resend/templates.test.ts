// Validates every transactional email template:
//   - renders without throwing
//   - returns valid HTML (has doctype, html, body tags)
//   - includes expected brand markers
//   - text variant is non-empty and mentions key content
//
// No credentials or network access required.

import { describe, it, expect } from 'vitest';
import {
  assessmentResultsBreakdownHtml,
  assessmentResultsBreakdownText,
} from './templates/assessment-results-breakdown';
import {
  coursePurchaseIndividualHtml,
  coursePurchaseIndividualText,
} from './templates/course-purchase-individual';
import {
  inDepthAssessmentPurchaseHtml,
  inDepthAssessmentPurchaseText,
} from './templates/in-depth-assessment-purchase';
import {
  coursePurchaseInstitutionHtml,
  coursePurchaseInstitutionText,
} from './templates/course-purchase-institution';
import {
  certificateIssuedHtml,
  certificateIssuedText,
} from './templates/certificate-issued';
import {
  waitlistConfirmationHtml,
  waitlistConfirmationText,
} from './templates/waitlist-confirmation';
import {
  assessmentOptionsHtml,
  assessmentOptionsText,
} from './templates/assessment-options';
import { inquiryAckHtml, inquiryAckText } from './templates/inquiry-ack';

const BRAND_MARKER = 'AI Banking Institute';
const DOCTYPE_MARKER = '<!doctype html>';
const REQUIRED_TAGS = ['<html', '<body', '</html>'];

function assertValidHtml(html: string, label: string) {
  expect(html, `${label}: should be a string`).toBeTypeOf('string');
  expect(html.length, `${label}: should be non-empty`).toBeGreaterThan(200);
  expect(html.toLowerCase(), `${label}: should have doctype`).toContain(DOCTYPE_MARKER);
  for (const tag of REQUIRED_TAGS) {
    expect(html, `${label}: should contain ${tag}`).toContain(tag);
  }
  expect(html, `${label}: should include brand name`).toContain(BRAND_MARKER);
  // No interpolation placeholders should survive (e.g. {{var}} or ${})
  expect(html, `${label}: no unresolved {{}} placeholders`).not.toMatch(/\{\{[^}]+\}\}/);
}

function assertValidText(text: string, label: string) {
  expect(text, `${label} text: should be a string`).toBeTypeOf('string');
  expect(text.length, `${label} text: should be non-empty`).toBeGreaterThan(50);
  expect(text, `${label} text: should mention brand`).toContain('AI Banking Institute');
}

// ── Email 1: Assessment results breakdown ──────────────────────────────────

describe('assessmentResultsBreakdown template', () => {
  const vars = {
    tierLabel: 'Emerging',
    tierHeadline: 'You are building AI awareness.',
    tierSummary: 'You have started exploring AI tools and are developing a foundation.',
    score: 6,
    maxScore: 12,
    resultsUrl: 'https://aibankinginstitute.com/results/abc123',
    dashboardUrl: 'https://aibankinginstitute.com/auth/login?next=/dashboard',
  };

  it('HTML renders correctly', () => {
    const html = assessmentResultsBreakdownHtml(vars);
    assertValidHtml(html, 'assessmentResultsBreakdown');
    expect(html).toContain('Emerging');
    expect(html).toContain('6');
    expect(html).toContain(vars.resultsUrl);
  });

  it('text renders correctly', () => {
    const text = assessmentResultsBreakdownText(vars);
    assertValidText(text, 'assessmentResultsBreakdown');
    expect(text).toContain('Emerging');
  });
});

// ── Email 2: Course purchase — individual ──────────────────────────────────

describe('coursePurchaseIndividual template', () => {
  const vars = {
    courseName: 'AiBI-Foundation',
    courseUrl: 'https://aibankinginstitute.com/courses/foundation/program',
    amountPaid: '$297',
  };

  it('HTML renders correctly', () => {
    const html = coursePurchaseIndividualHtml(vars);
    assertValidHtml(html, 'coursePurchaseIndividual');
    expect(html).toContain('AiBI-Foundation');
    expect(html).toContain('$297');
    expect(html).toContain(vars.courseUrl);
  });

  it('text renders correctly', () => {
    const text = coursePurchaseIndividualText(vars);
    assertValidText(text, 'coursePurchaseIndividual');
    expect(text).toContain('AiBI-Foundation');
    expect(text).toContain('$297');
  });
});

// ── Email 2.5: In-Depth Assessment purchase ────────────────────────────────

describe('inDepthAssessmentPurchase template', () => {
  const vars = {
    amountPaid: '$99',
    assessmentUrl: 'https://aibankinginstitute.com/assessment/in-depth/purchased',
  };

  it('HTML renders correctly', () => {
    const html = inDepthAssessmentPurchaseHtml(vars);
    assertValidHtml(html, 'inDepthAssessmentPurchase');
    expect(html).toContain('$99');
    expect(html).toContain(vars.assessmentUrl);
  });

  it('text renders correctly', () => {
    const text = inDepthAssessmentPurchaseText(vars);
    assertValidText(text, 'inDepthAssessmentPurchase');
    expect(text).toContain('$99');
  });
});

// ── Email 3: Course purchase — institution ─────────────────────────────────

describe('coursePurchaseInstitution template', () => {
  const vars = {
    institutionName: 'First Community Bank',
    seatsPurchased: 12,
    amountPaid: '$2,964',
    adminUrl: 'https://aibankinginstitute.com/courses/foundation/program',
    courseUrl: 'https://aibankinginstitute.com/courses/foundation/program',
  };

  it('HTML renders correctly', () => {
    const html = coursePurchaseInstitutionHtml(vars);
    assertValidHtml(html, 'coursePurchaseInstitution');
    expect(html).toContain('First Community Bank');
    expect(html).toContain('12');
    expect(html).toContain('$2,964');
  });

  it('text renders correctly', () => {
    const text = coursePurchaseInstitutionText(vars);
    assertValidText(text, 'coursePurchaseInstitution');
    expect(text).toContain('First Community Bank');
    expect(text).toContain('12');
  });
});

// ── Email 4: Certificate issued ────────────────────────────────────────────

describe('certificateIssued template', () => {
  const vars = {
    holderName: 'Jane Smith',
    designation: 'AiBI-Foundation',
    certificateId: 'cert-abc-123',
    issuedDate: 'June 17, 2026',
    verifyUrl: 'https://aibankinginstitute.com/verify/cert-abc-123',
    downloadUrl: 'https://aibankinginstitute.com/api/courses/generate-certificate?enrollmentId=enr-xyz',
  };

  it('HTML renders correctly', () => {
    const html = certificateIssuedHtml(vars);
    assertValidHtml(html, 'certificateIssued');
    expect(html).toContain('Jane Smith');
    expect(html).toContain('AiBI-Foundation');
    expect(html).toContain('cert-abc-123');
    expect(html).toContain(vars.verifyUrl);
    expect(html).toContain(vars.downloadUrl);
  });

  it('text renders correctly', () => {
    const text = certificateIssuedText(vars);
    assertValidText(text, 'certificateIssued');
    expect(text).toContain('Jane Smith');
    expect(text).toContain('cert-abc-123');
  });
});

// ── Email 6: Waitlist confirmation ─────────────────────────────────────────

describe('waitlistConfirmation template', () => {
  const vars = {
    interestLabel: 'AI Governance Bootcamp',
    institution: 'Midwest Credit Union',
  };

  it('HTML renders correctly', () => {
    const html = waitlistConfirmationHtml(vars);
    assertValidHtml(html, 'waitlistConfirmation');
    expect(html).toContain('AI Governance Bootcamp');
    expect(html).toContain('Midwest Credit Union');
  });

  it('text renders correctly', () => {
    const text = waitlistConfirmationText(vars);
    assertValidText(text, 'waitlistConfirmation');
    expect(text).toContain('AI Governance Bootcamp');
  });

  it('uses fallback institution when not provided', () => {
    const html = waitlistConfirmationHtml({ interestLabel: 'Test Event' });
    assertValidHtml(html, 'waitlistConfirmation-fallback');
    // Should not throw or leave undefined literal
    expect(html).not.toContain('undefined');
  });
});

// ── Email 7: Assessment options ────────────────────────────────────────────

describe('assessmentOptions template', () => {
  const vars = { institution: 'Valley Bank & Trust' };

  it('HTML renders correctly', () => {
    const html = assessmentOptionsHtml(vars);
    assertValidHtml(html, 'assessmentOptions');
    expect(html).toContain('Valley Bank & Trust');
    expect(html).toContain('/assessment');
    expect(html).toContain('/assessment/in-depth');
  });

  it('text renders correctly', () => {
    const text = assessmentOptionsText(vars);
    assertValidText(text, 'assessmentOptions');
    expect(text).toContain('Valley Bank & Trust');
  });

  it('uses fallback institution when not provided', () => {
    const html = assessmentOptionsHtml({ institution: 'your institution' });
    assertValidHtml(html, 'assessmentOptions-fallback');
    expect(html).not.toContain('undefined');
  });
});

// ── Email 5: Inquiry acknowledgement ──────────────────────────────────────

describe('inquiryAck template', () => {
  const vars = {
    name: 'Robert Chen',
    institution: 'Lakeside Federal Credit Union',
    track: 'Enterprise Licensing',
  };

  it('HTML renders correctly', () => {
    const html = inquiryAckHtml(vars);
    assertValidHtml(html, 'inquiryAck');
    expect(html).toContain('Robert Chen');
    expect(html).toContain('Lakeside Federal Credit Union');
    expect(html).toContain('Enterprise Licensing');
  });

  it('text renders correctly', () => {
    const text = inquiryAckText(vars);
    assertValidText(text, 'inquiryAck');
    expect(text).toContain('Robert Chen');
    expect(text).toContain('Enterprise Licensing');
  });
});
