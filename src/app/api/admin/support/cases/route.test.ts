import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getSupportAdminSessionMock = vi.fn();
const listSupportCasesMock = vi.fn();
const createSupportCaseMock = vi.fn();

vi.mock('@/lib/support/auth', () => ({
  getSupportAdminSession: getSupportAdminSessionMock,
}));

vi.mock('@/lib/support/cases', () => ({
  listSupportCases: listSupportCasesMock,
  createSupportCase: createSupportCaseMock,
}));

describe('/api/admin/support/cases', () => {
  beforeEach(() => {
    vi.resetModules();
    getSupportAdminSessionMock.mockReset();
    listSupportCasesMock.mockReset();
    createSupportCaseMock.mockReset();
    listSupportCasesMock.mockResolvedValue([]);
    createSupportCaseMock.mockResolvedValue({ id: 'case-1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated users', async () => {
    getSupportAdminSessionMock.mockResolvedValue({ ok: false, status: 401, reason: 'unauthenticated' });
    const { GET } = await import('./route');

    const response = await GET(new Request('https://example.test/api/admin/support/cases'));

    expect(response.status).toBe(401);
    expect(listSupportCasesMock).not.toHaveBeenCalled();
  });

  it('lists cases for allowlisted admins', async () => {
    getSupportAdminSessionMock.mockResolvedValue({
      ok: true,
      user: { id: 'user-1', email: 'hello@aibankinginstitute.com' },
    });
    listSupportCasesMock.mockResolvedValue([{ id: 'case-1' }]);
    const { GET } = await import('./route');

    const response = await GET(new Request('https://example.test/api/admin/support/cases?status=new&q=buyer'));

    expect(response.status).toBe(200);
    expect(listSupportCasesMock).toHaveBeenCalledWith(expect.objectContaining({
      status: 'new',
      q: 'buyer',
    }));
  });

  it('creates manual admin cases', async () => {
    getSupportAdminSessionMock.mockResolvedValue({
      ok: true,
      user: { id: 'user-1', email: 'hello@aibankinginstitute.com' },
    });
    const { POST } = await import('./route');

    const response = await POST(new Request('https://example.test/api/admin/support/cases', {
      method: 'POST',
      body: JSON.stringify({
        buyerEmail: 'buyer@example.com',
        subject: 'Access issue',
        category: 'access',
      }),
    }));

    expect(response.status).toBe(201);
    expect(createSupportCaseMock).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'buyer@example.com',
      source: 'admin',
      actorEmail: 'hello@aibankinginstitute.com',
    }));
  });
});
