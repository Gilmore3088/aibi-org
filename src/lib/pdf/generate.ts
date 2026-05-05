// Puppeteer-driven PDF generation. Snapshots the print route and
// returns a Buffer ready to upload. Detects local vs Vercel runtime
// to pick the right Chromium binary.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import chromium from '@sparticuz/chromium';
import puppeteer, { type Browser } from 'puppeteer-core';

interface GenerateOptions {
  readonly profileId: string;
  readonly origin: string;
}

export async function generateAssessmentPdf({
  profileId,
  origin,
}: GenerateOptions): Promise<Buffer> {
  const isVercel = process.env.VERCEL === '1';

  const browser: Browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1200, height: 1600 },
    executablePath: isVercel
      ? await chromium.executablePath()
      : process.env.PUPPETEER_LOCAL_CHROME ??
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: chromium.headless,
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
