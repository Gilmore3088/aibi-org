import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  rateLimitOrFail: vi.fn(),
  getRequestIp: vi.fn(),
  logStaticResourceDownload: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: mocks.readFile,
  },
  readFile: mocks.readFile,
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
  getRequestIp: mocks.getRequestIp,
}));

vi.mock('@/lib/resources/downloadLogging', () => ({
  logStaticResourceDownload: mocks.logStaticResourceDownload,
}));

import { GET } from './route';

describe('GET /api/prompt-cards/download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.getRequestIp.mockReturnValue('203.0.113.31');
    mocks.readFile.mockResolvedValue(Buffer.from('%PDF-1.7 prompt cards'));
    mocks.logStaticResourceDownload.mockResolvedValue(undefined);
  });

  it('streams the committed Prompt Cards PDF', async () => {
    const response = await GET(new Request('https://www.aibankinginstitute.com/api/prompt-cards/download'));
    const body = await response.arrayBuffer();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="AiBI-Prompt-Cards.pdf"',
    );
    expect(response.headers.get('Content-Length')).toBe(String(Buffer.from('%PDF-1.7 prompt cards').length));
    expect(Buffer.from(body).toString('utf8')).toBe('%PDF-1.7 prompt cards');
    expect(mocks.rateLimitOrFail).toHaveBeenCalledWith({
      key: 'prompt-cards-download',
      scope: 'ip',
      identifier: '203.0.113.31',
      max: 20,
      windowSeconds: 3600,
    });
    expect(mocks.logStaticResourceDownload).toHaveBeenCalledWith(
      expect.any(Request),
      {
        resourceSlug: 'aibi-prompt-cards',
        defaultSourceSurface: 'prompt-cards-download',
      },
    );
  });

  it('returns 500 when the committed PDF cannot be read', async () => {
    mocks.readFile.mockRejectedValue(new Error('missing'));

    const response = await GET(new Request('https://www.aibankinginstitute.com/api/prompt-cards/download'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'PDF unavailable. Please try again.' });
    expect(mocks.logStaticResourceDownload).not.toHaveBeenCalled();
  });

  // The mocked tests above prove response shaping. This guard reads the REAL
  // committed asset (bypassing the fs mock) so a future cleanup that deletes
  // public/downloads/*.pdf — which would 500 the route at runtime but leave the
  // mocked tests green — fails here instead of in production.
  it('ships a real committed PDF asset', async () => {
    const fs = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
    const { join } = await vi.importActual<typeof import('node:path')>('node:path');
    const pdfPath = join(process.cwd(), 'public', 'downloads', 'aibi-prompt-cards.pdf');
    const buffer = await fs.readFile(pdfPath);

    expect(buffer.subarray(0, 5).toString('utf8')).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(10_000);
  });
});
