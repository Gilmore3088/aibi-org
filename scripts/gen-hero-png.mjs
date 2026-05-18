// scripts/gen-hero-png.mjs
//
// Generate ONE combined image of the homepage hero text block
// (eyebrow + H1 + lede). Output as a tightly-cropped PNG, embedded
// in a generated React component as a base64 data URI so it ships
// inline in the server HTML with zero extra requests and zero font
// dependency for the LCP element.
//
// Pipeline:
//   1. Resolve Newsreader Regular + Italic + Cormorant SC URLs from
//      Google Fonts CSS2 with a desktop User-Agent (forces .woff
//      delivery so Satori can read them).
//   2. Render the hero text block via Satori → SVG.
//   3. Rasterize SVG → PNG via @resvg/resvg-js at 2x for retina.
//   4. Inline PNG as base64 data URI in src/components/_generated/HeroBlockPng.tsx.
//
// Run: node scripts/gen-hero-png.mjs

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_CACHE = resolve(ROOT, 'scripts/.cache/fonts');
const OUTPUT_PNG = resolve(ROOT, 'src/components/_generated/hero-block.png');
const OUTPUT_TSX = resolve(ROOT, 'src/components/_generated/HeroBlockPng.tsx');

// Old Firefox UA — Google Fonts CSS2 serves .woff to UAs that pre-date
// .woff2 support. Satori reads .woff/.ttf, not .woff2, so we need this
// vintage UA to coax the correct format URLs out of the API.
const FONT_CSS_UA =
  'Mozilla/5.0 (Windows NT 6.1; rv:6.0.1) Gecko/20100101 Firefox/6.0.1';

async function fetchFontUrls() {
  // Newsreader Regular + Italic.
  const a = await fetch(
    'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;1,400&display=swap',
    { headers: { 'User-Agent': FONT_CSS_UA } },
  );
  const aCss = await a.text();
  const blocks = aCss.split('@font-face').slice(1);
  const newsreader = { normal: null, italic: null };
  for (const b of blocks) {
    const style = /font-style:\s*italic/.test(b) ? 'italic' : 'normal';
    const url = b.match(/url\((https:[^)]+)\)/)?.[1];
    if (url) newsreader[style] = url;
  }
  // Cormorant SC Regular.
  const c = await fetch(
    'https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@500&display=swap',
    { headers: { 'User-Agent': FONT_CSS_UA } },
  );
  const cCss = await c.text();
  const cBlock = cCss.split('@font-face')[1] ?? '';
  const cormorantUrl = cBlock.match(/url\((https:[^)]+)\)/)?.[1];
  return {
    newsreaderNormal: newsreader.normal,
    newsreaderItalic: newsreader.italic,
    cormorantSc: cormorantUrl,
  };
}

async function fetchFont(url, name) {
  const cached = resolve(FONT_CACHE, name);
  if (existsSync(cached)) {
    return new Uint8Array(await readFile(cached));
  }
  console.log(`[gen-hero-png] downloading ${name}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed (${res.status}) for ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  await mkdir(FONT_CACHE, { recursive: true });
  await writeFile(cached, buf);
  return buf;
}

// Combined hero JSX: eyebrow + H1 + lede in one Satori render.
// Sizes match the page's tailwind classes at the lg breakpoint:
//   - eyebrow: ~14px Cormorant SC, terra, 0.2em tracking, uppercase
//   - H1:      96px Newsreader 400, ink, "Builders." italic + terra
//   - lede:    28px Newsreader italic 400, ink-80
function buildJsx() {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        width: '100%',
        padding: '0',
        background: 'transparent',
      },
      children: [
        // Eyebrow
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'CormorantSC',
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#B5512E',
              display: 'flex',
            },
            children: 'An institute for community banking',
          },
        },
        // H1
        {
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
                  style: { color: '#B5512E', fontStyle: 'italic' },
                  children: 'Builders.',
                },
              },
            ],
          },
        },
        // Lede
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '100%',
              maxWidth: '720px',
              fontFamily: 'Newsreader',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 28,
              lineHeight: 1.45,
              color: '#0E1B2DCC',
            },
            children:
              'Independent AI assessment and education for community banks and credit unions.',
          },
        },
      ],
    },
  };
}

async function main() {
  const urls = await fetchFontUrls();
  const [newsRegular, newsItalic, cormorant] = await Promise.all([
    fetchFont(urls.newsreaderNormal, 'Newsreader-Regular.woff'),
    fetchFont(urls.newsreaderItalic, 'Newsreader-Italic.woff'),
    fetchFont(urls.cormorantSc, 'CormorantSC-500.woff'),
  ]);

  const svg = await satori(buildJsx(), {
    width: 1400,
    height: 380,
    fonts: [
      { name: 'Newsreader', data: newsRegular, weight: 400, style: 'normal' },
      { name: 'Newsreader', data: newsItalic, weight: 400, style: 'italic' },
      { name: 'CormorantSC', data: cormorant, weight: 500, style: 'normal' },
    ],
  });

  // Try both PNG and inline SVG, use the smaller one.
  const resvg = new Resvg(svg, {
    background: 'rgba(0,0,0,0)',
    fitTo: { mode: 'width', value: 2800 },
  });
  const png = resvg.render().asPng();
  const pngKb = Math.round(png.length / 1024);
  const svgGzipApprox = Math.round(Buffer.from(svg).length / 1024);

  await mkdir(dirname(OUTPUT_PNG), { recursive: true });
  await writeFile(OUTPUT_PNG, png);
  console.log(`[gen-hero-png] PNG: ${pngKb} KB at 2800×760`);
  console.log(`[gen-hero-png] SVG raw: ${svgGzipApprox} KB (will gzip smaller)`);

  // Inline as data URI for the smaller of the two.
  let dataUri;
  let format;
  if (pngKb <= svgGzipApprox * 0.6) {
    // PNG meaningfully smaller (gzip estimate: SVG → ~30-40% of raw).
    dataUri = `data:image/png;base64,${png.toString('base64')}`;
    format = 'png';
  } else {
    // SVG wins (or near-tie — SVG is text, gzips much better than PNG).
    // URL-encode to keep the data URI valid in HTML.
    const svgUtf8 = encodeURIComponent(svg)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    dataUri = `data:image/svg+xml;charset=utf-8,${svgUtf8}`;
    format = 'svg';
  }
  console.log(`[gen-hero-png] chose ${format} for inline data URI`);
  const tsx = `// AUTO-GENERATED by scripts/gen-hero-png.mjs — do not edit by hand.
// Regenerate with: node scripts/gen-hero-png.mjs
//
// Combined hero text block (eyebrow + H1 + lede) baked into a single
// PNG, inlined as a base64 data URI. Why a PNG and not text + webfont?
//
// On Lighthouse's throttled-4G run, ANY text element above the fold
// that uses Newsreader or Cormorant SC waits for its font to download,
// pinning LCP at ~3.3s. By baking the whole hero text into one
// pre-rendered image, the LCP element is the <img>, which paints as
// soon as the HTML response arrives — no font wait, no whack-a-mole.
//
// Accessibility:
//   - <h1 className="sr-only"> mirrors the visible headline for screen
//     readers and search-engine crawlers.
//   - The eyebrow + lede are emitted as sr-only too so the page still
//     reads naturally with a screen reader.
//   - The <img> has empty alt because the surrounding sr-only text
//     already provides the semantic content (avoids duplicate
//     announcement of the headline).
//
// On real-user networks the saved bytes vs three separate font
// requests + their CSS parsing dominate. Net: faster perceived load,
// identical visual outcome, brand fully preserved (the rendered text
// is the actual fonts, just rasterized at build time).

const HERO_BLOCK_DATA_URI = "${dataUri}";

interface HeroBlockPngProps {
  readonly className?: string;
}

export function HeroBlockPng({ className }: HeroBlockPngProps): JSX.Element {
  return (
    <>
      {/* Visually-hidden semantic content for a11y + SEO. */}
      <p className="sr-only">An institute for community banking</p>
      <h1 className="sr-only">Turning Bankers into Builders.</h1>
      <p className="sr-only">
        Independent AI assessment and education for community banks and credit unions.
      </p>
      {/* We deliberately use <img> not next/image because the source
          is an inline data URI — next/image's optimizer can't process
          it and would warn. fetchpriority="high" prioritizes the LCP
          element. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_BLOCK_DATA_URI}
        alt=""
        role="presentation"
        decoding="sync"
        // @ts-expect-error — fetchpriority is valid HTML; React types lag
        fetchpriority="high"
        className={className}
        style={{ display: 'block', width: '100%', height: 'auto', maxWidth: '1400px' }}
      />
    </>
  );
}
`;
  await writeFile(OUTPUT_TSX, tsx);

  const tsxSize = Math.round(tsx.length / 1024);
  console.log(`[gen-hero-png] wrote ${OUTPUT_PNG}`);
  console.log(`[gen-hero-png] wrote ${OUTPUT_TSX} (${tsxSize} KB including base64)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
