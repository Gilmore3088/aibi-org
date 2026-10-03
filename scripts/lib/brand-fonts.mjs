// Shared by the PDF and kit generators.
//
// PW_EXECUTABLE_PATH: render with a specific pre-installed Chromium (for a
// sandbox whose browser build differs from the @playwright/test pin).
// PW_LOCAL_FONTS=1: serve the brand fonts (Inter, Instrument Serif italic)
// from the repo's self-hosted copies in src/app/fonts instead of Google
// Fonts, so a machine without outbound network still renders the real
// typefaces rather than silent fallbacks.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export function launchOptions() {
  return process.env.PW_EXECUTABLE_PATH ? { executablePath: process.env.PW_EXECUTABLE_PATH } : {};
}

export async function useLocalBrandFonts(ctx, root = process.cwd()) {
  if (process.env.PW_LOCAL_FONTS !== '1') return;
  const font = async (file) => (await readFile(resolve(root, 'src/app/fonts', file))).toString('base64');
  const css = `@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${await font('inter-latin-wght-normal.woff2')}) format('woff2');}
@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-display:block;src:url(data:font/woff2;base64,${await font('instrument-serif-latin-400-italic.woff2')}) format('woff2');}`;
  await ctx.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: css }),
  );
  await ctx.route('https://fonts.gstatic.com/**', (route) => route.abort());
}
