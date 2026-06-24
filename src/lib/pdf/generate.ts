// Puppeteer-driven PDF generation. Snapshots the print route and
// returns a Buffer ready to upload. Detects local vs Vercel runtime
// to pick the right Chromium binary.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer, { type Browser, type PDFOptions } from 'puppeteer-core';

interface GenerateOptions {
  readonly profileId: string;
  readonly origin: string;
}

interface GeneratePdfFromRouteOptions {
  readonly path: string;
  readonly origin: string;
  readonly viewport?: {
    readonly width: number;
    readonly height: number;
  };
  readonly pdf?: PDFOptions;
}

interface GeneratePdfFromHtmlOptions {
  readonly html: string;
  readonly viewport?: {
    readonly width: number;
    readonly height: number;
  };
  readonly pdf?: PDFOptions;
}

// Minimal launch flags that work on macOS system Chrome. The Linux
// production flags come from @sparticuz/chromium and are loaded
// dynamically on Vercel only — importing it at module scope on
// macOS triggers a binary extraction whose ELF can't exec, which is
// the spawn ENOEXEC the dev server saw.
//
// --user-data-dir is set per-call in the function below so each
// Puppeteer launch gets its own isolated profile and Chrome cannot
// piggyback on the user's already-running browser instance (which
// would open the print page in a real tab the user can see).
const LOCAL_CHROME_ARGS = [
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--headless=new',
  '--disable-gpu',
];

export async function generateAssessmentPdf({
  profileId,
  origin,
}: GenerateOptions): Promise<Buffer> {
  return generatePdfFromRoute({
    origin,
    path: `/assessment/results/print/${profileId}`,
    viewport: { width: 1200, height: 1600 },
    pdf: {
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
    },
  });
}

export async function generatePdfFromRoute({
  origin,
  path,
  viewport = { width: 1200, height: 1600 },
  pdf,
}: GeneratePdfFromRouteOptions): Promise<Buffer> {
  return withBrowserPdf({ viewport, pdf }, async (page) => {
    const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  });
}

export async function generatePdfFromHtml({
  html,
  viewport = { width: 1200, height: 1600 },
  pdf,
}: GeneratePdfFromHtmlOptions): Promise<Buffer> {
  return withBrowserPdf({ viewport, pdf }, async (page) => {
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
  });
}

async function withBrowserPdf(
  options: {
    readonly viewport: {
      readonly width: number;
      readonly height: number;
    };
    readonly pdf?: PDFOptions;
  },
  loadPage: (page: Awaited<ReturnType<Browser['newPage']>>) => Promise<void>,
): Promise<Buffer> {
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

  // Force an isolated user-data-dir so Chrome can't reuse the user's
  // running browser session. Without this, launching Chrome on macOS
  // hands the navigation off to the user's existing Chrome instance
  // and the print page opens as a real visible tab.
  const userDataDir = await mkdtemp(join(tmpdir(), 'aibi-pdf-chrome-'));
  const launchArgs = useSparticuz
    ? args
    : [...args, `--user-data-dir=${userDataDir}`];

  const browser: Browser = await puppeteer.launch({
    args: launchArgs,
    defaultViewport: options.viewport,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await loadPage(page);

    await page.evaluateHandle('document.fonts.ready');

    const buffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
      ...options.pdf,
    });

    return buffer as Buffer;
  } finally {
    await browser.close();
    // Clean up the temp profile dir. Best-effort — if Chrome left a
    // lock file we still don't want to leak it forever.
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
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
