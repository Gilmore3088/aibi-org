// Puppeteer-driven PDF generation. Snapshots the print route and
// returns a Buffer ready to upload. Detects local vs Vercel runtime
// to pick the right Chromium binary.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import puppeteer, { type Browser } from 'puppeteer-core';

interface GenerateOptions {
  readonly profileId: string;
  readonly origin: string;
}

// Minimal launch flags that work on macOS system Chrome. The Linux
// production flags come from @sparticuz/chromium and are loaded
// dynamically on Vercel only — importing it at module scope on
// macOS triggers a binary extraction whose ELF can't exec, which is
// the spawn ENOEXEC the dev server saw.
const LOCAL_CHROME_ARGS = [
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
];

export async function generateAssessmentPdf({
  profileId,
  origin,
}: GenerateOptions): Promise<Buffer> {
  // The .env.local file may export VERCEL=1 for things like preview
  // detection in the app. We can't trust it alone — we also have to
  // confirm we're actually on Linux before trying to extract the
  // bundled chromium binary (which is Linux-only).
  const isLinuxRuntime = process.platform === 'linux';
  const useSparticuz = process.env.VERCEL === '1' && isLinuxRuntime;

  const { args, executablePath } = useSparticuz
    ? await loadVercelChromium()
    : {
        args: LOCAL_CHROME_ARGS,
        executablePath:
          process.env.PUPPETEER_LOCAL_CHROME ??
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      };

  const browser: Browser = await puppeteer.launch({
    args,
    defaultViewport: { width: 1200, height: 1600 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const url = `${origin}/assessment/results/print/${profileId}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.evaluateHandle('document.fonts.ready');

    const buffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
    });

    return buffer as Buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Dynamic import for @sparticuz/chromium so the Linux binary is never
 * extracted on macOS dev. Only runs when VERCEL=1.
 */
async function loadVercelChromium(): Promise<{
  readonly args: string[];
  readonly executablePath: string;
}> {
  const mod = await import('@sparticuz/chromium');
  const chromium = mod.default;
  return {
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  };
}
