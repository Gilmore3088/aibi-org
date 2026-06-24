import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  createServerClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  isValidStoragePath: vi.fn(),
  issueCertificateForEnrollment: vi.fn(),
  enrollmentSingle: vi.fn(),
  submissionsOrder: vi.fn(),
  insertSingle: vi.fn(),
  updateEq: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

vi.mock('@/lib/supabase/storage', () => ({
  getPresignedUploadUrl: vi.fn(),
  isValidStoragePath: mocks.isValidStoragePath,
}));

vi.mock('@/lib/certificates/issue', () => ({
  issueCertificateForEnrollment: mocks.issueCertificateForEnrollment,
}));

function request(body: unknown): Request {
  return new Request('https://www.aibankinginstitute.com/api/courses/submit-work-product', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    enrollmentId: 'enrollment-123',
    skillFileUrl: 'enrollment-123/final-packet.md',
    inputText: 'This is the source banking task and prompt context used for the final packet.',
    rawOutputText: 'This is the raw model output captured before review and editing happened.',
    editedOutputText:
      'This is the reviewed, corrected, and policy-safe final output after the learner completed human review and made improvements.',
    annotationText:
      'The annotation explains what changed, why it changed, and how the bank-safe review step was applied.',
    ...overrides,
  };
}

function completedModules(): number[] {
  return Array.from({ length: 18 }, (_, index) => index + 1);
}

function serviceClient() {
  return {
    from: vi.fn((table: string) => {
      if (table === 'course_enrollments') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: mocks.enrollmentSingle,
              })),
            })),
          })),
        };
      }

      if (table === 'work_submissions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: mocks.submissionsOrder,
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: mocks.insertSingle,
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

describe('POST /api/courses/submit-work-product', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.test';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.cookies.mockResolvedValue({ getAll: () => [] });
    mocks.createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: 'user-123', email: 'learner@example.com' } },
          error: null,
        })),
      },
    });
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.createServiceRoleClient.mockReturnValue(serviceClient());
    mocks.isValidStoragePath.mockReturnValue(true);
    mocks.enrollmentSingle.mockResolvedValue({
      data: {
        id: 'enrollment-123',
        user_id: 'user-123',
        completed_modules: completedModules(),
      },
      error: null,
    });
    mocks.submissionsOrder.mockResolvedValue({ data: [], error: null });
    mocks.insertSingle.mockResolvedValue({ data: { id: 'submission-123' }, error: null });
    mocks.updateEq.mockResolvedValue({ error: null });
    mocks.issueCertificateForEnrollment.mockResolvedValue({
      certificate: { certificate_id: 'AIBIP-2026-ABC234' },
      created: true,
    });
  });

  it('auto-approves a completed final packet and issues the certificate', async () => {
    const { POST } = await import('./route');

    const response = await POST(request(validBody()));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({
      message: 'Work product approved',
      submissionId: 'submission-123',
      certificateId: 'AIBIP-2026-ABC234',
      verifyUrl: '/verify/AIBIP-2026-ABC234',
      certificateUrl: '/courses/foundation/program/certificate',
    });
    expect(mocks.insertSingle).toHaveBeenCalledTimes(1);
    expect(mocks.issueCertificateForEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({ enrollmentId: 'enrollment-123' }),
    );
  });

  it('approves an existing pending packet and issues the certificate idempotently', async () => {
    mocks.submissionsOrder.mockResolvedValueOnce({
      data: [{ id: 'submission-pending', review_status: 'pending' }],
      error: null,
    });
    mocks.issueCertificateForEnrollment.mockResolvedValueOnce({
      certificate: { certificate_id: 'AIBIP-2026-EXISTING' },
      created: false,
    });
    const { POST } = await import('./route');

    const response = await POST(request(validBody()));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.submissionId).toBe('submission-pending');
    expect(json.certificateId).toBe('AIBIP-2026-EXISTING');
    expect(mocks.updateEq).toHaveBeenCalledWith('id', 'submission-pending');
    expect(mocks.issueCertificateForEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({ enrollmentId: 'enrollment-123' }),
    );
  });

  it('does not issue when all modules are not complete', async () => {
    mocks.enrollmentSingle.mockResolvedValueOnce({
      data: {
        id: 'enrollment-123',
        user_id: 'user-123',
        completed_modules: [1, 2, 3],
      },
      error: null,
    });
    const { POST } = await import('./route');

    const response = await POST(request(validBody()));

    expect(response.status).toBe(403);
    expect(mocks.issueCertificateForEnrollment).not.toHaveBeenCalled();
  });
});
