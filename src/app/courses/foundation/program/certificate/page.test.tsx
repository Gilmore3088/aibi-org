import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getEnrollment: vi.fn(),
  createServiceRoleClient: vi.fn(),
  issueCertificateForEnrollment: vi.fn(),
  certMaybeSingle: vi.fn(),
  submissionMaybeSingle: vi.fn(),
  updateEq: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: (href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`);
  },
}));

vi.mock('../_lib/getEnrollment', () => ({
  getEnrollment: mocks.getEnrollment,
}));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => true,
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock('@/lib/certificates/issue', () => ({
  issueCertificateForEnrollment: mocks.issueCertificateForEnrollment,
}));

vi.mock('@/components/lms/CourseShellWrapper', () => ({
  CourseShellWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./_components/CertificateCard', () => ({
  CertificateCard: ({ certificateId }: { certificateId: string }) => (
    <div>Certificate card {certificateId}</div>
  ),
}));

vi.mock('./_components/CertificateMeta', () => ({
  CertificateMeta: ({ certificateId }: { certificateId: string }) => (
    <div>Certificate meta {certificateId}</div>
  ),
}));

function serviceClient() {
  return {
    from: vi.fn((table: string) => {
      if (table === 'certificates') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: mocks.certMaybeSingle })),
          })),
        };
      }

      if (table === 'work_submissions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({ maybeSingle: mocks.submissionMaybeSingle })),
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: mocks.updateEq,
          })),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

describe('CertificatePage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.createServiceRoleClient.mockReturnValue(serviceClient());
    mocks.getEnrollment.mockResolvedValue({
      id: 'enrollment-123',
      completed_modules: Array.from({ length: 18 }, (_, index) => index + 1),
    });
    mocks.certMaybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.submissionMaybeSingle.mockResolvedValue({
      data: { review_status: 'pending', status: 'pending', created_at: '2026-06-23T12:00:00.000Z' },
      error: null,
    });
    mocks.updateEq.mockResolvedValue({ error: null });
    mocks.issueCertificateForEnrollment.mockResolvedValue({
      certificate: {
        id: 'cert-123',
        enrollment_id: 'enrollment-123',
        certificate_id: 'AIBIP-2026-ABC234',
        holder_name: 'Alex Founder',
        designation: 'AiBI-Foundation',
        issued_at: '2026-06-23T12:30:00.000Z',
      },
      created: true,
    });
  });

  it('auto-issues instead of leaving completed learners on Credential Pending', async () => {
    const CertificatePage = (await import('./page')).default;

    render(await CertificatePage());

    expect(screen.getByRole('heading', { name: /your credential/i })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /credential pending/i })).toBeNull();
    expect(screen.getByText(/Certificate card AIBIP-2026-ABC234/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /refer a peer/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /share assessment link/i }).getAttribute('href')).toBe(
      'https://www.aibankinginstitute.com/assessment/take?ref=foundation-certificate',
    );
    expect(screen.getByRole('link', { name: /email referral/i }).getAttribute('href')).toContain(
      'AIBIP-2026-ABC234',
    );
    expect(mocks.updateEq).toHaveBeenCalledWith('enrollment_id', 'enrollment-123');
    expect(mocks.issueCertificateForEnrollment).toHaveBeenCalledWith(expect.objectContaining({
      enrollmentId: 'enrollment-123',
    }));
  });

  it('shows the training-record panel with documented seat time and the non-CPE boundary', async () => {
    const CertificatePage = (await import('./page')).default;

    render(await CertificatePage());

    expect(
      screen.getByRole('heading', { name: /for your institution.s training log/i }),
    ).toBeTruthy();
    expect(screen.getByText(/documents ~\d+(\.\d+)? hours of seat time/i)).toBeTruthy();
    expect(
      screen.getByText(/not CPE credit, accreditation, or\s+regulator-endorsed training/i),
    ).toBeTruthy();
    // The paste-ready training log entry carries the verify URL.
    expect(
      screen.getByText(/Verification: https:\/\/aibankinginstitute\.com\/verify\/AIBIP-2026-ABC234/i),
    ).toBeTruthy();
  });
});
