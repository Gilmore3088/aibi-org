import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  createServerClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  issueCertificateForEnrollment: vi.fn(),
  buildCertificatePdfBuffer: vi.fn(),
  rateLimitOrFail: vi.fn(),
  getUser: vi.fn(),
  submissionMaybeSingle: vi.fn(),
  enrollmentMaybeSingle: vi.fn(),
  certificateMaybeSingle: vi.fn(),
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

vi.mock('@/lib/certificates/issue', () => ({
  issueCertificateForEnrollment: mocks.issueCertificateForEnrollment,
}));

vi.mock('@/lib/certificates/pdf', () => ({
  buildCertificatePdfBuffer: mocks.buildCertificatePdfBuffer,
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
}));

const ENROLLMENT_ID = 'enrollment-123';
const CERTIFICATE_ID = 'AIBI-FOUNDATION-2026-XYZ789';

function postRequest(body: unknown): Request {
  return new Request(
    'https://www.aibankinginstitute.com/api/courses/generate-certificate',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
}

function getRequest(enrollmentId?: string): Request {
  const url = new URL('https://www.aibankinginstitute.com/api/courses/generate-certificate');
  if (enrollmentId !== undefined) {
    url.searchParams.set('enrollmentId', enrollmentId);
  }
  return new Request(url, { method: 'GET' });
}

// The route does two separate Supabase reads keyed by table, each ending in a
// chained .maybeSingle(). This builder routes those chains to per-table mocks
// so individual tests can drive the 404/409/200 branches independently.
function serviceClient() {
  return {
    from: vi.fn((table: string) => {
      if (table === 'work_submissions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: mocks.submissionMaybeSingle,
              })),
            })),
          })),
        };
      }

      if (table === 'course_enrollments') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: mocks.enrollmentMaybeSingle,
              })),
            })),
          })),
        };
      }

      if (table === 'certificates') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mocks.certificateMaybeSingle,
            })),
          })),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

describe('/api/courses/generate-certificate', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.test';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.cookies.mockResolvedValue({ getAll: () => [] });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'learner@example.com' } },
      error: null,
    });
    mocks.createServerClient.mockReturnValue({
      auth: { getUser: mocks.getUser },
    });
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.createServiceRoleClient.mockReturnValue(serviceClient());
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.buildCertificatePdfBuffer.mockResolvedValue(Buffer.from('%PDF-1.7 generated'));

    mocks.submissionMaybeSingle.mockResolvedValue({
      data: { id: 'submission-1', review_status: 'approved' },
      error: null,
    });
    mocks.enrollmentMaybeSingle.mockResolvedValue({
      data: { id: ENROLLMENT_ID, user_id: 'user-123' },
      error: null,
    });
    mocks.certificateMaybeSingle.mockResolvedValue({
      data: {
        id: 'cert-row-1',
        certificate_id: CERTIFICATE_ID,
        holder_name: 'Alex Banker',
        designation: 'AiBI-Foundation',
        issued_at: '2026-06-23T12:00:00.000Z',
        enrollment_id: ENROLLMENT_ID,
      },
      error: null,
    });
    mocks.issueCertificateForEnrollment.mockResolvedValue({
      certificate: {
        id: 'cert-row-1',
        certificate_id: CERTIFICATE_ID,
        holder_name: 'Alex Banker',
        designation: 'AiBI-Foundation',
        issued_at: '2026-06-23T12:00:00.000Z',
        enrollment_id: ENROLLMENT_ID,
      },
      created: true,
    });
  });

  describe('POST', () => {
    it('returns 201 application/pdf on first issuance of an approved submission', async () => {
      const { POST } = await import('./route');

      const response = await POST(postRequest({ enrollmentId: ENROLLMENT_ID }));

      expect(response.status).toBe(201);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('X-Certificate-Id')).toBe(CERTIFICATE_ID);
      expect(response.headers.get('X-Already-Exists')).toBe('false');

      const body = Buffer.from(await response.arrayBuffer());
      expect(body.subarray(0, 5).toString('utf8')).toBe('%PDF-');
    });

    it('returns 200 (already exists) when the certificate was previously issued', async () => {
      mocks.issueCertificateForEnrollment.mockResolvedValueOnce({
        certificate: {
          id: 'cert-row-1',
          certificate_id: CERTIFICATE_ID,
          holder_name: 'Alex Banker',
          designation: 'AiBI-Foundation',
          issued_at: '2026-06-23T12:00:00.000Z',
          enrollment_id: ENROLLMENT_ID,
        },
        created: false,
      });
      const { POST } = await import('./route');

      const response = await POST(postRequest({ enrollmentId: ENROLLMENT_ID }));

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Certificate-Id')).toBe(CERTIFICATE_ID);
      expect(response.headers.get('X-Already-Exists')).toBe('true');
    });

    it('returns 409 when there is no approved submission', async () => {
      mocks.submissionMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const { POST } = await import('./route');

      const response = await POST(postRequest({ enrollmentId: ENROLLMENT_ID }));

      expect(response.status).toBe(409);
      expect(mocks.issueCertificateForEnrollment).not.toHaveBeenCalled();
    });

    it('returns 400 when enrollmentId is missing', async () => {
      const { POST } = await import('./route');

      const response = await POST(postRequest({}));

      expect(response.status).toBe(400);
    });

    it('returns 401 when the request has no authenticated session', async () => {
      mocks.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const { POST } = await import('./route');

      const response = await POST(postRequest({ enrollmentId: ENROLLMENT_ID }));

      expect(response.status).toBe(401);
    });

    it('returns 503 when Supabase is not configured', async () => {
      mocks.isSupabaseConfigured.mockReturnValueOnce(false);
      const { POST } = await import('./route');

      const response = await POST(postRequest({ enrollmentId: ENROLLMENT_ID }));

      expect(response.status).toBe(503);
    });
  });

  describe('GET', () => {
    it('returns 200 application/pdf for the owning user', async () => {
      const { GET } = await import('./route');

      const response = await GET(getRequest(ENROLLMENT_ID));

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('X-Certificate-Id')).toBe(CERTIFICATE_ID);

      const body = Buffer.from(await response.arrayBuffer());
      expect(body.subarray(0, 5).toString('utf8')).toBe('%PDF-');
    });

    it('returns 404 when the enrollment does not belong to the requesting user', async () => {
      mocks.enrollmentMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const { GET } = await import('./route');

      const response = await GET(getRequest(ENROLLMENT_ID));

      expect(response.status).toBe(404);
    });

    it('returns 404 when the certificate has not been issued yet', async () => {
      mocks.certificateMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const { GET } = await import('./route');

      const response = await GET(getRequest(ENROLLMENT_ID));

      expect(response.status).toBe(404);
    });

    it('returns 400 when enrollmentId query param is missing', async () => {
      const { GET } = await import('./route');

      const response = await GET(getRequest());

      expect(response.status).toBe(400);
    });
  });

  // Build-time guard: the Chromium binary must be traced into this serverless
  // function or the cert PDF 500s on Vercel only (invisible locally). A future
  // @sparticuz/chromium bump that drops this entry must fail CI here, not in
  // production. Reading the config source directly avoids depending on how the
  // MDX/bundle-analyzer wrappers merge keys at runtime.
  describe('Chromium tracing guard', () => {
    it('keeps /api/courses/generate-certificate in outputFileTracingIncludes', async () => {
      const { readFile } = await import('node:fs/promises');
      const { fileURLToPath } = await import('node:url');
      const configPath = fileURLToPath(
        new URL('../../../../../next.config.mjs', import.meta.url),
      );
      const source = await readFile(configPath, 'utf8');

      const tracingMatch = source.match(
        /outputFileTracingIncludes\s*:\s*\{([\s\S]*?)\n {2}\},/,
      );
      expect(tracingMatch, 'outputFileTracingIncludes block not found').not.toBeNull();
      const tracingBlock = tracingMatch![1];

      expect(tracingBlock).toContain("'/api/courses/generate-certificate'");
      // The cert route's tracing entry must include the Chromium bin glob.
      const certEntry = tracingBlock.match(
        /'\/api\/courses\/generate-certificate'\s*:\s*\[([\s\S]*?)\]/,
      );
      expect(certEntry, 'cert route tracing entry not found').not.toBeNull();
      expect(certEntry![1]).toContain('@sparticuz/chromium/bin');
    });
  });
});
