import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  launch: vi.fn(),
}));

vi.mock('puppeteer-core', () => ({
  default: { launch: mocks.launch },
}));

import { generatePdfFromHtml } from './generate';

function browserFixture() {
  const page = {
    setContent: vi.fn(async () => undefined),
    evaluateHandle: vi.fn(async () => undefined),
    pdf: vi.fn(async () => Buffer.from('%PDF-retry')),
  };
  const browser = {
    newPage: vi.fn(async () => page),
    close: vi.fn(async () => undefined),
  };
  return { browser, page };
}

describe('Chromium PDF launch', () => {
  beforeEach(() => {
    mocks.launch.mockReset();
    vi.stubEnv('VERCEL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('retries a transient executable-busy launch failure', async () => {
    const { browser, page } = browserFixture();
    const busy = Object.assign(new Error('spawn ETXTBSY'), { code: 'ETXTBSY' });
    mocks.launch.mockRejectedValueOnce(busy).mockResolvedValueOnce(browser);

    const result = await generatePdfFromHtml({ html: '<main>Report</main>' });

    expect(result.toString()).toBe('%PDF-retry');
    expect(mocks.launch).toHaveBeenCalledTimes(2);
    expect(page.setContent).toHaveBeenCalledWith('<main>Report</main>', {
      waitUntil: 'load',
      timeout: 30_000,
    });
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it('does not retry a permanent browser launch failure', async () => {
    mocks.launch.mockRejectedValueOnce(new Error('Chrome executable missing'));

    await expect(generatePdfFromHtml({ html: '<main>Report</main>' })).rejects.toThrow(
      'Chrome executable missing',
    );
    expect(mocks.launch).toHaveBeenCalledOnce();
  });
});
