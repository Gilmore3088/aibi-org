import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DownloadReportButton } from './DownloadReportButton';

describe('DownloadReportButton', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('surfaces a support path when the transformation report endpoint fails', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ error: 'PDF failed' }), { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<DownloadReportButton enrollmentId="enrollment-123" />);

    fireEvent.click(screen.getByRole('button', { name: /download aibi-foundation transformation report pdf/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/report PDF did not generate/i);
    expect(screen.getByRole('link', { name: /contact support/i }).getAttribute('href')).toBe(
      '/support/purchase-help',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/courses/generate-transformation-report?enrollmentId=enrollment-123',
    );
  });
});
