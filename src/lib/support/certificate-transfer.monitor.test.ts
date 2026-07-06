import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendCertificateTransferReminder: vi.fn(),
  generateMagicLink: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendCertificateTransferReminder: mocks.sendCertificateTransferReminder,
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  generateMagicLink: mocks.generateMagicLink,
  getCanonicalSiteUrl: () => 'https://www.aibankinginstitute.com',
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

import { runCertificateTransferMonitor } from './certificate-transfer';

const CERTIFICATE_ROW = {
  id: 'cert-1',
  enrollment_id: 'enroll-1',
  issued_at: '2026-05-01T12:00:00.000Z',
  course_enrollments: {
    email: 'learner@communitybank.com',
    user_id: 'user-1',
    product: 'foundation',
    onboarding_answers: { primary_role: 'operations' },
  },
};

function serviceClient({
  certificates = [CERTIFICATE_ROW],
  existingDedupeKeys = [] as string[],
} = {}) {
  const certificateLimit = vi.fn().mockResolvedValue({ data: certificates, error: null });
  const existingDedupeIn = vi.fn().mockResolvedValue({
    data: existingDedupeKeys.map((key) => ({ dedupe_key: key })),
    error: null,
  });
  const insert = vi.fn().mockResolvedValue({ error: null });

  const certificateQuery = {
    select: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    limit: certificateLimit,
  };
  certificateQuery.select.mockReturnValue(certificateQuery);
  certificateQuery.gte.mockReturnValue(certificateQuery);
  certificateQuery.lte.mockReturnValue(certificateQuery);
  certificateQuery.order.mockReturnValue(certificateQuery);

  const eventQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    in: existingDedupeIn,
    insert,
  };
  eventQuery.select.mockReturnValue(eventQuery);
  eventQuery.eq.mockReturnValue(eventQuery);

  return {
    client: {
      from: vi.fn((table: string) => {
        if (table === 'certificates') return certificateQuery;
        if (table === 'paid_reengagement_events') return eventQuery;
        throw new Error(`Unexpected table ${table}`);
      }),
    },
    insert,
  };
}

describe('runCertificateTransferMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.generateMagicLink.mockResolvedValue(
      'https://www.aibankinginstitute.com/auth/callback?token_hash=abc',
    );
    mocks.sendCertificateTransferReminder.mockResolvedValue({ ok: true });
  });

  it('sends and logs the due-stage transfer reminder', async () => {
    const { client, insert } = serviceClient();

    const result = await runCertificateTransferMonitor(
      { now: new Date('2026-06-05T12:00:00.000Z') }, // 35 days after issue
      client as never,
    );

    expect(result.sentReminders).toEqual([
      {
        enrollmentId: 'enroll-1',
        email: 'learner@communitybank.com',
        campaign: 'certificate_transfer_30',
      },
    ]);
    expect(mocks.sendCertificateTransferReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'learner@communitybank.com',
        vars: expect.objectContaining({ stage: 30 }),
      }),
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        campaign: 'certificate_transfer_30',
        enrollment_id: 'enroll-1',
        status: 'sent',
        dedupe_key: 'paid-reengagement:certificate_transfer_30:enroll-1',
      }),
    );
  });

  it('skips stages that were already sent (dedupe)', async () => {
    const { client, insert } = serviceClient({
      existingDedupeKeys: ['paid-reengagement:certificate_transfer_30:enroll-1'],
    });

    const result = await runCertificateTransferMonitor(
      { now: new Date('2026-06-05T12:00:00.000Z') },
      client as never,
    );

    expect(result.sentReminders).toEqual([]);
    expect(result.skippedCandidates).toBe(1);
    expect(mocks.sendCertificateTransferReminder).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('skips seeded non-deliverable addresses', async () => {
    const { client } = serviceClient({
      certificates: [
        {
          ...CERTIFICATE_ROW,
          course_enrollments: {
            ...CERTIFICATE_ROW.course_enrollments,
            email: 'e2e+persona-7@aibankinginstitute.test',
          },
        },
      ],
    });

    const result = await runCertificateTransferMonitor(
      { now: new Date('2026-06-05T12:00:00.000Z') },
      client as never,
    );

    expect(result.eligibleCandidates).toBe(0);
    expect(mocks.sendCertificateTransferReminder).not.toHaveBeenCalled();
  });

  it('logs a failed event when the send fails', async () => {
    mocks.sendCertificateTransferReminder.mockResolvedValue({
      ok: false,
      error: 'resend-500',
    });
    const { client, insert } = serviceClient();

    const result = await runCertificateTransferMonitor(
      { now: new Date('2026-06-05T12:00:00.000Z') },
      client as never,
    );

    expect(result.failedReminders).toEqual([
      {
        enrollmentId: 'enroll-1',
        email: 'learner@communitybank.com',
        campaign: 'certificate_transfer_30',
        reason: 'resend-500',
      },
    ]);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed', failure_reason: 'resend-500' }),
    );
  });
});
