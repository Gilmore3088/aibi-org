// scripts/gen-hero-svg.mjs
//
// Build-time generator for the homepage hero headline SVG. The H1
// "Turning Bankers into Builders." is the LCP element on the homepage;
// rendering it as an inline SVG (vector paths, not text+font) eliminates
// the font-download dependency so the largest contentful paint happens
// in the first server response, not after the Newsreader webfont arrives.
//
// Pipeline:
//   1. Download Newsreader Regular + Italic from Google Fonts' static API.
//      Cached locally on first run.
//   2. Use Satori (Vercel's JSX → SVG renderer) to render the H1 JSX
//      with the actual font and the brand's terra color treatment.
//   3. Write the SVG markup to src/components/_generated/hero-headline.svg
//      and a thin TypeScript wrapper that imports it.
//
// Run via:  node scripts/gen-hero-svg.mjs
//
// Regenerate any time the headline text or design changes. The output
// is checked in so the build step doesn't need network access.

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_CACHE = resolve(ROOT, 'scripts/.cache/fonts');
const OUTPUT_SVG = resolve(ROOT, 'src/components/_generated/hero-headline.svg');
const OUTPUT_TSX = resolve(ROOT, 'src/components/_generated/HeroHeadlineSvg.tsx');

// Google Fonts versions roll forward. Resolve actual font URLs at
// regenerate time by hitting the CSS2 API with a desktop User-Agent
// (so we get .woff instead of .woff2, since Satori reads .woff/.ttf).
// The CSS payload contains the exact URLs for each requested ital/wght.
const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;1,400&display=swap';
const FONT_CSS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

async function resolveFontUrls() {
  const res = await fetch(FONT_CSS_URL, { headers: { 'User-Agent': FONT_CSS_UA } });
  if (!res.ok) throw new Error(`Font CSS fetch failed: ${res.status}`);
  const css = await res.text();
  // Match each @font-face block: pull style (italic/normal) + url.
  const blocks = css.split('@font-face').slice(1);
  const out = {};
  for (const b of blocks) {
    const style = /font-style:\s*italic/.test(b) ? 'italic' : 'normal';
    const url = b.match(/url\((https:[^)]+)\)/)?.[1];
    if (url) out[style] = url;
  }
  if (!out.normal || !out.italic) {
    throw new Error(`Could not resolve both font URLs from CSS: ${JSON.stringify(out)}`);
  }
  return out;
}

async function fetchFont(url, name) {
  const cached = resolve(FONT_CACHE, name);
  if (existsSync(cached)) {
    return new Uint8Array(await readFile(cached));
  }
  console.log(`[gen-hero-svg] downloading ${name}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed (${res.status}) for ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  await mkdir(FONT_CACHE, { recursive: true });
  await writeFile(cached, buf);
  return buf;
}

// The H1's visual treatment, replicated as Satori-compatible JSX. Satori
// uses a Yoga layout engine, so flexbox-style props are required (this
// matches what Vercel's @vercel/og does). Colors match the Ledger
// `--color-ink` and `--color-terra` tokens.
function buildJsx() {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.22em',
        width: '100%',
        fontFamily: 'Newsreader',
        fontWeight: 400,
        fontSize: 96,
        lineHeight: 1.06,
        color: '#0E1B2D',
        letterSpacing: '-0.012em',
      },
      children: [
        { type: 'span', props: { children: 'Turning' } },
        { type: 'span', props: { children: 'Bankers' } },
        { type: 'span', props: { children: 'into' } },
        {
          type: 'span',
          props: {
            // --ledger-accent (gold). The legacy --color-terra (#B5512E)
            // is retired per the 2026-05-09 Ledger refresh; using it here
            // gives "Builders." the wrong (terracotta-red) hue.
            style: { color: '#B5862A', fontStyle: 'italic' },
            children: 'Builders.',
          },
        },
      ],
    },
  };
}

async function main() {
  const urls = await resolveFontUrls();
  const [regular, italic] = await Promise.all([
    fetchFont(urls.normal, 'Newsreader-Regular.woff'),
    fetchFont(urls.italic, 'Newsreader-Italic.woff'),
  ]);

  // 1500x115 is the rendered raster region. The SVG is vector so it
  // scales infinitely; this just sets the natural box. The page CSS
  // sizes the wrapping element so the SVG stretches into the H1 slot.
  //
  // Height 115 = one line at 96px / 1.06 line-height (~102px) plus a
  // small allowance for the italic descenders ("g" in "Turning" and the
  // period after "Builders."). Earlier value 260 left ~150 units of empty
  // canvas below the glyphs which rendered as a visible vertical gap
  // between the H1 and lede on /. See hero-spacing fix 2026-05-19.
  const svg = await satori(buildJsx(), {
    width: 1500,
    height: 115,
    fonts: [
      { name: 'Newsreader', data: regular, weight: 400, style: 'normal' },
      { name: 'Newsreader', data: italic, weight: 400, style: 'italic' },
    ],
  });

  // Post-process: replace Satori's intrinsic width/height attributes with
  // responsive `width="100%" height="auto"` so the SVG scales to its
  // parent container at every viewport. The viewBox (preserved by Satori)
  // handles the aspect ratio. Without this, mobile viewports clip the
  // headline at the right edge. See #194.
  const responsiveSvg = svg.replace(
    /width="\d+" height="\d+" viewBox/,
    'width="100%" height="auto" viewBox',
  );

  await mkdir(dirname(OUTPUT_SVG), { recursive: true });
  await writeFile(OUTPUT_SVG, responsiveSvg + '\n');

  // SVGO pass — cuts the Satori output ~50% by dropping the mask/<g>
  // scaffolding and rounding path coordinates. The CLI is invoked via
  // npx so it stays out of package.json devDependencies (this is a
  // regenerate-time script, not a build-time one). If you regenerate
  // without network access, comment this block; the page still works
  // with the un-optimized Satori SVG, just heavier.
  try {
    execSync(
      `npx --yes svgo --multipass --precision=3 "${OUTPUT_SVG}"`,
      { stdio: 'inherit' },
    );
  } catch (err) {
    console.warn('[gen-hero-svg] SVGO pass skipped:', err.message);
  }

  const optimizedSvg = (await readFile(OUTPUT_SVG, 'utf8')).trim();

  // Thin React wrapper. The SVG markup is embedded directly in the .tsx
  // (not imported as a file) so it's part of the server-rendered HTML
  // response with no extra request or webpack loader needed. The
  // visually-hidden <h1> preserves semantic heading + screen-reader
  // accessibility.
  //
  // Escape backticks / dollar-braces so the SVG is safe inside the
  // template literal we're embedding below.
  const escaped = optimizedSvg.replace(/\\/g, '\\\\').replace(/`/g, '\\\`').replace(/\$\{/g, '\\\${');
  const tsx = `// AUTO-GENERATED by scripts/gen-hero-svg.mjs — do not edit by hand.
// Regenerate with: node scripts/gen-hero-svg.mjs
//
// The homepage hero H1 rendered as inline SVG so the LCP element does
// not wait for the Newsreader webfont to download. The SVG is embedded
// directly in this file so it ships in the server HTML payload — no
// extra request, no font-load dependency.
//
// SVGO post-processed at regeneration time (--multipass --precision=3)
// to roughly halve the path payload vs Satori's raw output.
//
// Accessibility:
//   - A visually-hidden <h1> mirrors the headline so screen readers
//     announce the page's primary heading and search engines index
//     the plain text.
//   - The SVG itself is aria-hidden to avoid duplicate announcement.
const SVG_MARKUP = ${'`'}${escaped}${'`'};

interface HeroHeadlineSvgProps {
  readonly className?: string;
}

export function HeroHeadlineSvg({ className }: HeroHeadlineSvgProps): JSX.Element {
  return (
    <>
      <h1 className="sr-only">Turning Bankers into Builders.</h1>
      <span
        aria-hidden="true"
        className={className}
        style={{ display: 'block', width: '100%' }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: SVG_MARKUP }}
      />
    </>
  );
}
`;
  await writeFile(OUTPUT_TSX, tsx);

  const { size } = await stat(OUTPUT_SVG);
  console.log(
    `[gen-hero-svg] wrote ${OUTPUT_SVG} (${Math.round(size / 1024)} KB)`,
  );
  console.log(`[gen-hero-svg] wrote ${OUTPUT_TSX}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
