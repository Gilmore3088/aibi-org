// Render the markdown artifacts in public/artifacts/ to styled PDFs in
// public/downloads/artifact-<slug>.pdf. For artifacts without a separate
// template route, also write the branded HTML source to
// public/downloads/source/artifact-<slug>.html so /api/resources/[slug]/word
// can serve a Word-compatible version from the same source.
//
// Why: shipping raw .md to the browser shows unstyled source text. Each
// artifact is a finished reference card that bankers print or save, so
// it ships as a designed PDF mirror. The .md file remains the source of
// truth; the PDF is regenerated when the .md changes.
//
// Usage:
//   node scripts/generate-artifact-pdfs.mjs
//   node scripts/generate-artifact-pdfs.mjs --only data-handling-reference-card,fair-lending-ai-review-checklist

import { chromium } from '@playwright/test';
import { marked } from 'marked';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ARTIFACTS = [
  {
    slug: 'data-handling-reference-card',
    resourceSlug: 'artifact-data-handling-reference-card',
    title: 'Data Handling Reference Card',
    writeSourceHtml: true,
  },
  {
    slug: 'ai-use-case-inventory',
    resourceSlug: 'artifact-ai-use-case-inventory',
    title: 'AI Use-Case Inventory',
    writeSourceHtml: false,
  },
  {
    slug: 'fair-lending-ai-review-checklist',
    resourceSlug: 'artifact-fair-lending-ai-review-checklist',
    title: 'Fair-Lending AI Review Checklist',
    writeSourceHtml: true,
  },
];

const ROOT = process.cwd();
const SRC_DIR = resolve(ROOT, 'public/artifacts');
const OUT_DIR = resolve(ROOT, 'public/downloads');
const SOURCE_HTML_DIR = resolve(OUT_DIR, 'source');

// Mockup tokens (kept in sync with src/styles/tokens-mockup.css).
const STYLES = `
:root {
  --ink: #071A2F; --ink-2: #0B2745;
  --gold: #C8A24A; --gold-deep: #9A7A2F;
  --cream: #F7F3EA; --cream-2: #EFE7D7;
  --slate-200: #E2E8F0; --slate-500: #64748B; --slate-600: #475569;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: var(--ink); }
body {
  font-family: -apple-system, "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 11pt; line-height: 1.55;
}
.wrap { max-width: 720px; margin: 0 auto; padding: 0 0 24pt; }
.cover {
  background: var(--ink); color: #fff;
  padding: 36pt 32pt; margin: 0 0 24pt;
  border-bottom: 4pt solid var(--gold);
}
.cover .kicker {
  font-size: 8.5pt; letter-spacing: .22em; text-transform: uppercase;
  color: #E6D39B; font-weight: 600;
}
/* Brand v1 [Ai] mark — typographic lockup. Inline since the script does
   not have access to the React <Wordmark> component. Matches src/styles/brand.css. */
.aibi-mark {
  font-family: "Inter", -apple-system, sans-serif;
  font-weight: 600; font-size: 12pt;
  letter-spacing: -.012em; color: #F7F3EA;
  display: inline-flex; align-items: baseline; line-height: 1;
}
.aibi-mark .bk { color: var(--gold); font-weight: 500; padding: 0 .03em; }
.aibi-mark .ai { padding: 0 0 0 .02em; }
.aibi-mark .si {
  font-family: "Instrument Serif", Georgia, serif;
  font-style: italic; font-weight: 400; font-size: 1.14em;
  line-height: 0; margin: 0 .005em 0 -.04em; color: inherit;
}
.aibi-mark .full { margin-left: .32em; }
.cover h1 {
  margin: 8pt 0 0; font-size: 22pt; line-height: 1.15;
  font-weight: 700; letter-spacing: -.01em;
}
.cover .meta {
  margin-top: 14pt; font-size: 9pt; color: #c8d0d8;
  border-top: 1pt solid rgba(255,255,255,.18);
  padding-top: 10pt;
}
.body { padding: 0 32pt; }
.body h1, .body h2, .body h3 { color: var(--ink); font-weight: 600; line-height: 1.25; }
.body h1 { font-size: 18pt; margin: 22pt 0 8pt; }
.body h2 {
  font-size: 13pt; margin: 22pt 0 8pt;
  padding-bottom: 4pt; border-bottom: 1pt solid var(--slate-200);
}
.body h3 { font-size: 11pt; margin: 16pt 0 4pt; color: var(--gold-deep); text-transform: uppercase; letter-spacing: .12em; }
.body p, .body li { color: var(--slate-600); }
.body p { margin: 10pt 0; }
.body strong { color: var(--ink); }
.body ul, .body ol { padding-left: 18pt; margin: 10pt 0; }
.body li { margin: 4pt 0; }
.body code {
  background: var(--cream); color: var(--ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9.5pt; padding: 1pt 4pt; border-radius: 3pt;
}
.body pre {
  background: var(--ink); color: #E6D39B; padding: 12pt;
  border-radius: 6pt; overflow: auto; font-size: 9.5pt; line-height: 1.45;
}
.body pre code { background: transparent; color: inherit; padding: 0; }
.body hr {
  border: 0; border-top: 1pt solid var(--slate-200); margin: 20pt 0;
}
.body table { border-collapse: collapse; width: 100%; margin: 12pt 0; font-size: 10pt; }
.body th, .body td { border: 1pt solid var(--slate-200); padding: 6pt 8pt; text-align: left; vertical-align: top; }
.body th { background: var(--cream); color: var(--ink); font-weight: 600; }
.body blockquote {
  border-left: 3pt solid var(--gold);
  margin: 12pt 0; padding: 2pt 0 2pt 14pt; color: var(--slate-600);
}
.footer {
  margin: 28pt 32pt 0; padding-top: 12pt;
  border-top: 1pt solid var(--slate-200);
  font-size: 8.5pt; color: var(--slate-500); text-align: center;
}
@page { margin: 0.5in; size: Letter; }
`;

function pageHtml({ title, contentHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<style>${STYLES}</style>
</head>
<body>
  <div class="wrap">
    <header class="cover">
      <span class="aibi-mark"><span class="bk">[</span><span class="ai">A</span><span class="si">i</span><span class="bk">]</span><span class="full">Banking Institute</span></span>
      <h1>${title}</h1>
      <div class="meta">Reference card · For community banks and credit unions</div>
    </header>
    <main class="body">${contentHtml}</main>
    <div class="footer">aibankinginstitute.com · Adapt before adopting.</div>
  </div>
</body>
</html>`;
}

// Strip the leading "# Title" heading from the markdown since the cover
// already shows it, so we don't double-render.
function stripLeadingH1(md) {
  return md.replace(/^#\s+.+?(\r?\n+)/, '');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(SOURCE_HTML_DIR, { recursive: true });
  const onlyArg = process.argv.includes('--only')
    ? process.argv[process.argv.indexOf('--only') + 1].split(',').map((slug) => slug.trim()).filter(Boolean)
    : null;
  const artifacts = onlyArg
    ? ARTIFACTS.filter((artifact) => onlyArg.includes(artifact.slug) || onlyArg.includes(artifact.resourceSlug))
    : ARTIFACTS;

  // PW_EXECUTABLE_PATH: render against a specific pre-installed Chromium when
  // the bundled browser version differs from the @playwright/test pin. Unset in
  // CI → Playwright uses its managed browser.
  const browser = await chromium.launch(
    process.env.PW_EXECUTABLE_PATH ? { executablePath: process.env.PW_EXECUTABLE_PATH } : {},
  );
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const { slug, resourceSlug, title, writeSourceHtml } of artifacts) {
    const mdPath = resolve(SRC_DIR, `${slug}.md`);
    const md = await readFile(mdPath, 'utf8');
    const contentHtml = marked.parse(stripLeadingH1(md), { async: false });
    const html = pageHtml({ title, contentHtml });
    if (writeSourceHtml) {
      await writeFile(resolve(SOURCE_HTML_DIR, `${resourceSlug}.html`), html);
    }
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      format: 'Letter',
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
      printBackground: true,
      preferCSSPageSize: true,
    });
    const out = resolve(OUT_DIR, `artifact-${slug}.pdf`);
    await writeFile(out, pdf);
    process.stdout.write(`✓ ${slug}: ${pdf.length.toLocaleString()}b → ${out.replace(ROOT + '/', '')}\n`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Artifact PDF generation failed:', err);
  process.exit(1);
});
