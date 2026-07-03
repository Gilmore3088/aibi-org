import { describe, expect, it } from 'vitest';
import {
  buildCertificateTransferContent,
  certificateTransferDedupeKey,
  evaluateCertificateTransferCandidate,
  type CertificateTransferRow,
} from './certificate-transfer';

function certificateRow(overrides: Partial<CertificateTransferRow> = {}): CertificateTransferRow {
  return {
    id: 'cert-1',
    enrollment_id: 'enroll-1',
    issued_at: '2026-05-01T12:00:00.000Z',
    course_enrollments: {
      email: 'learner@communitybank.com',
      user_id: 'user-1',
      product: 'foundation',
      onboarding_answers: { primary_role: 'lending' } as never,
    },
    ...overrides,
  };
}

describe('evaluateCertificateTransferCandidate', () => {
  it('returns null before the first stage is due', () => {
    const now = new Date('2026-05-15T12:00:00.000Z'); // 14 days
    expect(evaluateCertificateTransferCandidate(certificateRow(), now)).toBeNull();
  });

  it('picks the highest due stage, not a backlog of all of them', () => {
    const at35Days = new Date('2026-06-05T12:00:00.000Z');
    expect(evaluateCertificateTransferCandidate(certificateRow(), at35Days)?.campaign).toBe(
      'certificate_transfer_30',
    );

    const at65Days = new Date('2026-07-05T12:00:00.000Z');
    expect(evaluateCertificateTransferCandidate(certificateRow(), at65Days)?.campaign).toBe(
      'certificate_transfer_60',
    );

    const at95Days = new Date('2026-08-04T12:00:00.000Z');
    const candidate = evaluateCertificateTransferCandidate(certificateRow(), at95Days);
    expect(candidate?.campaign).toBe('certificate_transfer_90');
    expect(candidate?.stage).toBe(90);
  });

  it('returns null without an issue date or a reachable email', () => {
    const now = new Date('2026-08-04T12:00:00.000Z');
    expect(
      evaluateCertificateTransferCandidate(certificateRow({ issued_at: null }), now),
    ).toBeNull();
    expect(
      evaluateCertificateTransferCandidate(
        certificateRow({ course_enrollments: null }),
        now,
      ),
    ).toBeNull();
  });
});

describe('certificateTransferDedupeKey', () => {
  it('keys one reminder per stage per enrollment', () => {
    const now = new Date('2026-06-05T12:00:00.000Z');
    const candidate = evaluateCertificateTransferCandidate(certificateRow(), now)!;
    expect(certificateTransferDedupeKey(candidate)).toBe(
      'paid-reengagement:certificate_transfer_30:enroll-1',
    );
  });
});

describe('buildCertificateTransferContent', () => {
  it('uses role-path quick wins at 30 days and automation targets at 60', () => {
    const day30 = buildCertificateTransferContent(30, 'lending');
    expect(day30.items.length).toBeGreaterThan(0);
    expect(day30.items.length).toBeLessThanOrEqual(3);
    expect(day30.path).toBe('/dashboard/toolbox');

    const day60 = buildCertificateTransferContent(60, 'lending');
    expect(day60.items[0]).toMatch(/loan file completeness/i);
  });

  it('falls back to generic transfer reps for the "other" role', () => {
    for (const stage of [30, 60, 90] as const) {
      const content = buildCertificateTransferContent(stage, 'other');
      expect(content.items.length).toBeGreaterThan(0);
      expect(content.headingText.length).toBeGreaterThan(0);
      expect(content.path.startsWith('/')).toBe(true);
    }
  });

  it('keeps 90-day content focused on reuse and referral', () => {
    const day90 = buildCertificateTransferContent(90, 'compliance');
    expect(day90.items.some((item) => /assessment/i.test(item))).toBe(true);
    expect(day90.path).toBe('/courses/foundation/program/toolkit');
  });

  it('never claims measured outcomes in transfer copy', () => {
    for (const stage of [30, 60, 90] as const) {
      for (const role of ['lending', 'compliance', 'other'] as const) {
        const content = buildCertificateTransferContent(stage, role);
        const text = [content.headingText, content.bodyText, ...content.items].join(' ');
        expect(text).not.toMatch(/average of \d+/i);
        expect(text).not.toMatch(/\d+% (faster|of learners)/i);
      }
    }
  });
});
