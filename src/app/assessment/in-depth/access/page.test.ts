import { beforeEach, describe, expect, it, vi } from 'vitest';
import InDepthDashboardPage from './page';
import { getInDepthEnrollment } from '../_lib/getInDepthEnrollment';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/lib/auth/previewBypass', () => ({
  isPreviewAuthBypassEnabled: vi.fn(() => true),
}));

vi.mock('../_lib/getInDepthEnrollment', () => ({
  getInDepthEnrollment: vi.fn(),
}));

describe('/assessment/in-depth/access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects entitled buyers to the real assessment dashboard instead of scaffolding', async () => {
    vi.mocked(getInDepthEnrollment).mockResolvedValue({
      id: 'enroll_123',
      user_id: 'user_123',
      email: 'buyer@example.com',
      enrolled_at: '2026-06-23T00:00:00.000Z',
      stripe_session_id: 'cs_test_123',
    });

    await expect(InDepthDashboardPage()).rejects.toThrow('NEXT_REDIRECT:/dashboard/assessments');
    expect(redirect).toHaveBeenCalledWith('/dashboard/assessments');
  });

  it('redirects non-buyers to the In-Depth landing page', async () => {
    vi.mocked(getInDepthEnrollment).mockResolvedValue(null);

    await expect(InDepthDashboardPage()).rejects.toThrow('NEXT_REDIRECT:/assessment/in-depth?reason=no-purchase');
    expect(redirect).toHaveBeenCalledWith('/assessment/in-depth?reason=no-purchase');
  });
});
