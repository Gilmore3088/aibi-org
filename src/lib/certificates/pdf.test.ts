import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/pdf/generate', () => ({
  generatePdfFromRoute: vi.fn(async () => Buffer.from('%PDF-test')),
}));

import { generatePdfFromRoute } from '@/lib/pdf/generate';
import { buildCertificatePdfBuffer } from './pdf';

describe('certificate PDF rendering', () => {
  it('renders via the Chromium print route instead of React PDF', async () => {
    const buffer = await buildCertificatePdfBuffer(
      {
        id: 'cert-row-1',
        certificate_id: 'AIBI-FOUNDATION-123',
        holder_name: 'Alex Banker',
        designation: 'AiBI-Foundation',
        issued_at: '2026-06-23T12:00:00.000Z',
        enrollment_id: 'enroll-1',
      },
      'https://www.aibankinginstitute.com',
    );

    expect(buffer.toString()).toBe('%PDF-test');
    expect(generatePdfFromRoute).toHaveBeenCalledWith({
      origin: 'https://www.aibankinginstitute.com',
      path: '/verify/AIBI-FOUNDATION-123/print',
      viewport: { width: 1600, height: 1200 },
      pdf: {
        format: 'Letter',
        landscape: true,
        printBackground: true,
        margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
        preferCSSPageSize: true,
      },
    });
  });
});
