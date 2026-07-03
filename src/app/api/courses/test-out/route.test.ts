import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTestOutCheck } from '@content/courses/foundation-program/test-out';

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  createServerClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  isPreviewAuthBypassEnabled: vi.fn(),
  getUser: vi.fn(),
  enrollmentSingle: vi.fn(),
  evidenceInsert: vi.fn(),
  enrollmentUpdateEq: vi.fn(),
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

vi.mock('@/lib/auth/previewBypass', () => ({
  isPreviewAuthBypassEnabled: mocks.isPreviewAuthBypassEnabled,
}));

const ENROLLMENT_ID = 'enrollment-123';
const USER_ID = 'user-abc';

function passingAnswers(moduleNumber: number): Record<string, string> {
  const check = getTestOutCheck(moduleNumber)!;
  const answers: Record<string, string> = {};
  for (const question of check.questions) {
    answers[question.id] = question.options.find((option) => option.correct)!.id;
  }
  return answers;
}

function failingAnswers(moduleNumber: number): Record<string, string> {
  const answers = passingAnswers(moduleNumber);
  const check = getTestOutCheck(moduleNumber)!;
  const first = check.questions[0];
  answers[first.id] = first.options.find((option) => !option.correct)!.id;
  return answers;
}

function postRequest(body: unknown): Request {
  return new Request('https://www.aibankinginstitute.com/api/courses/test-out', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function serviceClient() {
  return {
    from: vi.fn((table: string) => {
      if (table === 'course_enrollments') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({ single: mocks.enrollmentSingle })),
            })),
          })),
          update: vi.fn(() => ({ eq: mocks.enrollmentUpdateEq })),
        };
      }
      if (table === 'activity_responses') {
        return { insert: mocks.evidenceInsert };
      }
      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

async function callRoute(body: unknown) {
  const { POST } = await import('./route');
  return POST(postRequest(body));
}

describe('POST /api/courses/test-out', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.isPreviewAuthBypassEnabled.mockReturnValue(false);
    mocks.cookies.mockResolvedValue({ getAll: () => [] });
    mocks.createServerClient.mockReturnValue({ auth: { getUser: mocks.getUser } });
    mocks.getUser.mockResolvedValue({ data: { user: { id: USER_ID } }, error: null });
    mocks.createServiceRoleClient.mockReturnValue(serviceClient());
    mocks.enrollmentSingle.mockResolvedValue({
      data: {
        id: ENROLLMENT_ID,
        user_id: USER_ID,
        completed_modules: [],
        current_module: 1,
        onboarding_answers: { primary_role: 'lending' },
      },
      error: null,
    });
    mocks.evidenceInsert.mockResolvedValue({ error: null });
    mocks.enrollmentUpdateEq.mockResolvedValue({ error: null });
  });

  it('returns 401 when not authenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await callRoute({
      enrollmentId: ENROLLMENT_ID,
      moduleNumber: 1,
      answers: passingAnswers(1),
    });
    expect(response.status).toBe(401);
  });

  it('returns 403 when the enrollment belongs to someone else', async () => {
    mocks.enrollmentSingle.mockResolvedValue({ data: null, error: { message: 'no rows' } });
    const response = await callRoute({
      enrollmentId: ENROLLMENT_ID,
      moduleNumber: 1,
      answers: passingAnswers(1),
    });
    expect(response.status).toBe(403);
  });

  it('returns 400 for a module without an authored check', async () => {
    const response = await callRoute({
      enrollmentId: ENROLLMENT_ID,
      moduleNumber: 9,
      answers: {},
    });
    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toMatch(/does not offer a test-out/i);
  });

  it('returns 400 when the module is out of sequence', async () => {
    mocks.enrollmentSingle.mockResolvedValue({
      data: {
        id: ENROLLMENT_ID,
        user_id: USER_ID,
        completed_modules: [1],
        current_module: 2,
        onboarding_answers: { primary_role: 'lending' },
      },
      error: null,
    });
    const response = await callRoute({
      enrollmentId: ENROLLMENT_ID,
      moduleNumber: 3,
      answers: passingAnswers(3),
    });
    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toMatch(/out of sequence/i);
  });

  it('does not write anything on a failed check', async () => {
    const response = await callRoute({
      enrollmentId: ENROLLMENT_ID,
      moduleNumber: 1,
      answers: failingAnswers(1),
    });
    expect(response.status).toBe(200);
    const data = (await response.json()) as { passed: boolean; correctCount: number };
    expect(data.passed).toBe(false);
    expect(data.correctCount).toBe(2);
    expect(mocks.evidenceInsert).not.toHaveBeenCalled();
    expect(mocks.enrollmentUpdateEq).not.toHaveBeenCalled();
  });

  it('records evidence and completes the current module on a pass', async () => {
    const response = await callRoute({
      enrollmentId: ENROLLMENT_ID,
      moduleNumber: 1,
      answers: passingAnswers(1),
    });
    expect(response.status).toBe(200);
    const data = (await response.json()) as { passed: boolean; nextModule: number };
    expect(data.passed).toBe(true);
    expect(data.nextModule).toBe(2);
    expect(mocks.evidenceInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        enrollment_id: ENROLLMENT_ID,
        module_number: 1,
        activity_id: 'test-out-m1',
      }),
    );
    expect(mocks.enrollmentUpdateEq).toHaveBeenCalledWith('id', ENROLLMENT_ID);
  });
});
