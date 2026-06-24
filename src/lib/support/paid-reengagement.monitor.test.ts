import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendFoundationNotStartedReminder: vi.fn(),
  sendFoundationStalledReminder: vi.fn(),
  sendInDepthWaitingReminder: vi.fn(),
  generateMagicLink: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendFoundationNotStartedReminder: mocks.sendFoundationNotStartedReminder,
  sendFoundationStalledReminder: mocks.sendFoundationStalledReminder,
  sendInDepthWaitingReminder: mocks.sendInDepthWaitingReminder,
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  generateMagicLink: mocks.generateMagicLink,
  getCanonicalSiteUrl: () => 'https://www.aibankinginstitute.com',
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

import { runPaidReengagementMonitor } from './paid-reengagement';

function serviceClient({
  enrollments = [
    {
      id: 'enroll-69',
      email: 'sleeper@communitybank.test',
      product: 'foundation',
      stripe_session_id: 'cs_test_69',
      user_id: 'user-69',
      current_module: 1,
      completed_modules: [],
      enrolled_at: '2026-06-20T12:00:00.000Z',
      created_at: '2026-06-20T12:00:00.000Z',
      updated_at: '2026-06-20T12:00:00.000Z',
    },
  ],
  userProfiles = [],
}: {
  enrollments?: readonly Record<string, unknown>[];
  userProfiles?: readonly Record<string, unknown>[];
} = {}) {
  const enrollmentLimit = vi.fn().mockResolvedValue({
    data: enrollments,
    error: null,
  });
  const existingDedupeIn = vi.fn().mockResolvedValue({ data: [], error: null });
  const insert = vi.fn().mockResolvedValue({ error: null });
  const profileLimit = vi.fn().mockResolvedValue({ data: userProfiles, error: null });

  const enrollmentQuery = {
    select: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    limit: enrollmentLimit,
  };
  enrollmentQuery.select.mockReturnValue(enrollmentQuery);
  enrollmentQuery.in.mockReturnValue(enrollmentQuery);
  enrollmentQuery.gte.mockReturnValue(enrollmentQuery);
  enrollmentQuery.lte.mockReturnValue(enrollmentQuery);
  enrollmentQuery.order.mockReturnValue(enrollmentQuery);

  const eventQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    in: existingDedupeIn,
    insert,
  };
  eventQuery.select.mockReturnValue(eventQuery);
  eventQuery.eq.mockReturnValue(eventQuery);

  const profileQuery = {
    select: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: profileLimit,
  };
  profileQuery.select.mockReturnValue(profileQuery);
  profileQuery.or.mockReturnValue(profileQuery);
  profileQuery.order.mockReturnValue(profileQuery);

  return {
    client: {
      from: vi.fn((table: string) => {
        if (table === 'course_enrollments') return enrollmentQuery;
        if (table === 'paid_reengagement_events') return eventQuery;
        if (table === 'user_profiles') return profileQuery;
        throw new Error(`Unexpected table ${table}`);
      }),
    },
    insert,
  };
}

describe('runPaidReengagementMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.generateMagicLink.mockResolvedValue('https://www.aibankinginstitute.com/auth/callback?token_hash=abc');
    mocks.sendFoundationNotStartedReminder.mockResolvedValue({ ok: true });
    mocks.sendFoundationStalledReminder.mockResolvedValue({ ok: true });
    mocks.sendInDepthWaitingReminder.mockResolvedValue({ ok: true });
  });

  it('sends and logs a not-started reminder for paid Foundation buyers', async () => {
    const { client, insert } = serviceClient();

    const result = await runPaidReengagementMonitor({
      now: new Date('2026-06-24T12:00:00.000Z'),
    }, client as never);

    expect(result.sentReminders).toEqual([
      {
        enrollmentId: 'enroll-69',
        email: 'sleeper@communitybank.test',
        campaign: 'foundation_not_started',
        moduleNumber: 1,
      },
    ]);
    expect(mocks.generateMagicLink).toHaveBeenCalledWith(
      'sleeper@communitybank.test',
      '/courses/foundation/program',
    );
    expect(mocks.sendFoundationNotStartedReminder).toHaveBeenCalledWith({
      email: 'sleeper@communitybank.test',
      actionUrl: 'https://www.aibankinginstitute.com/auth/callback?token_hash=abc',
    });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      campaign: 'foundation_not_started',
      enrollment_id: 'enroll-69',
      email: 'sleeper@communitybank.test',
      status: 'sent',
      dedupe_key: 'paid-reengagement:foundation_not_started:enroll-69',
      sent_at: '2026-06-24T12:00:00.000Z',
    }));
  });

  it('sends and logs a module-specific stalled reminder for paid Foundation buyers', async () => {
    const { client, insert } = serviceClient({
      enrollments: [
        {
          id: 'enroll-93',
          email: 'stalled@communitybank.test',
          product: 'foundation',
          stripe_session_id: 'cs_test_93',
          user_id: 'user-93',
          current_module: 6,
          completed_modules: [1, 2, 3, 4, 5],
          enrolled_at: '2026-06-01T12:00:00.000Z',
          created_at: '2026-06-01T12:00:00.000Z',
          updated_at: '2026-06-15T12:00:00.000Z',
        },
      ],
    });

    const result = await runPaidReengagementMonitor({
      now: new Date('2026-06-24T12:00:00.000Z'),
    }, client as never);

    expect(result.sentReminders).toEqual([
      {
        enrollmentId: 'enroll-93',
        email: 'stalled@communitybank.test',
        campaign: 'foundation_stalled',
        moduleNumber: 6,
      },
    ]);
    expect(mocks.generateMagicLink).toHaveBeenCalledWith(
      'stalled@communitybank.test',
      '/courses/foundation/program/6',
    );
    expect(mocks.sendFoundationStalledReminder).toHaveBeenCalledWith({
      email: 'stalled@communitybank.test',
      actionUrl: 'https://www.aibankinginstitute.com/auth/callback?token_hash=abc',
      moduleNumber: 6,
    });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      campaign: 'foundation_stalled',
      enrollment_id: 'enroll-93',
      email: 'stalled@communitybank.test',
      status: 'sent',
      dedupe_key: 'paid-reengagement:foundation_stalled:enroll-93:m6',
      sent_at: '2026-06-24T12:00:00.000Z',
    }));
  });

  it('sends and logs an In-Depth waiting reminder for idle $99 buyers', async () => {
    const { client, insert } = serviceClient({
      enrollments: [
        {
          id: 'enroll-75',
          email: 'idle@creditunion.test',
          product: 'in-depth-assessment',
          stripe_session_id: 'cs_test_75',
          user_id: 'user-75',
          current_module: null,
          completed_modules: [],
          enrolled_at: '2026-06-20T12:00:00.000Z',
          created_at: '2026-06-20T12:00:00.000Z',
          updated_at: '2026-06-20T12:00:00.000Z',
        },
      ],
      userProfiles: [],
    });

    const result = await runPaidReengagementMonitor({
      now: new Date('2026-06-24T12:00:00.000Z'),
    }, client as never);

    expect(result.sentReminders).toEqual([
      {
        enrollmentId: 'enroll-75',
        email: 'idle@creditunion.test',
        campaign: 'in_depth_waiting',
        moduleNumber: null,
      },
    ]);
    expect(mocks.generateMagicLink).toHaveBeenCalledWith(
      'idle@creditunion.test',
      '/assessment/in-depth/take',
    );
    expect(mocks.sendInDepthWaitingReminder).toHaveBeenCalledWith({
      email: 'idle@creditunion.test',
      actionUrl: 'https://www.aibankinginstitute.com/auth/callback?token_hash=abc',
    });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      campaign: 'in_depth_waiting',
      enrollment_id: 'enroll-75',
      email: 'idle@creditunion.test',
      product: 'in-depth-assessment',
      status: 'sent',
      dedupe_key: 'paid-reengagement:in_depth_waiting:enroll-75',
      sent_at: '2026-06-24T12:00:00.000Z',
    }));
  });
});
