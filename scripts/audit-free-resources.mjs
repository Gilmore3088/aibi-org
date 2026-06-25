import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const DOWNLOADS_DIR = join(ROOT, 'public', 'downloads');
const SOURCE_DIR = join(DOWNLOADS_DIR, 'source');
const LARGE_PRINT_DIR = join(DOWNLOADS_DIR, 'large-print');
const MANIFEST_PATH = join(ROOT, 'src', 'lib', 'resources', 'freeResources.manifest.json');
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

const errors = [];
const warnings = [];
const devTokens = [/localhost/i, /127\.0\.0\.1/i, /0\.0\.0\.0/i];
const browserChromeTokens = [
  /about:blank/i,
  /Page not found/i,
  /This site can[’']t be reached/i,
  /ERR_CONNECTION/i,
  /Google Chrome/i,
  /Safari Web Content/i,
];
const sourceLanguageToken = /(Source basis|Sources?:|Citations?)/i;
const adaptationLanguageToken = /(Adapt before adopting|Adapt before adoption|Adapt it|starter template|not legal advice|not a substitute)/i;
const ACCESS_ROUTE_PREFIX = '/resources/access/';
const LARGE_PRINT_ROUTE_SUFFIX = '/large-print';
const sampleReadinessRequiredTokens = [
  /12 readiness signals/i,
  /12[-\s]48/i,
  /36\/48/i,
  /Building Momentum/i,
  /Top gap\s*[·:-]\s*Documentation/i,
  /In-Depth Readiness Assessment/i,
  /48-question diagnostic/i,
  /v3 free snapshot/i,
];
const sampleReadinessStaleTokens = [
  /Structured Beginner/i,
  /\b62\b/,
  /score of 62/i,
  /The eight readiness dimensions/i,
  /same eight dimensions/i,
  /Readiness Assessment v2/i,
];
const regulatoryCheatsheetRequiredTokens = [
  /SR 26-2/i,
  /OCC Bulletin 2026-13/i,
  /FDIC FIL-15-2026/i,
  /Do not label every AI workflow as a/i,
  /First determine whether the/i,
  /over \$30B in assets/i,
];
const regulatoryCheatsheetStaleTokens = [
  /Any AI used in credit underwriting, fraud detection, or risk scoring qualifies as a ["']model["']/i,
  /SR 11-7,\s*Interagency TPRM Guidance,\s*ECOA \/ Reg B,\s*and BSA\/AML are the current examination frameworks/i,
  /SR 11-7 requires conceptual soundness/i,
];
const manifestByFile = new Map();
const slugs = new Set();
const sourceHtmlSlugs = new Set(
  existsSync(SOURCE_DIR)
    ? readdirSync(SOURCE_DIR)
        .filter((filename) => filename.endsWith('.html') && !filename.startsWith('_'))
        .map((filename) => filename.replace(/\.html$/, ''))
    : [],
);

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function rel(path) {
  return relative(ROOT, path);
}

function readBinaryText(path) {
  return readFileSync(path).toString('latin1');
}

function scanDevTokens(path, label = rel(path)) {
  const text = readBinaryText(path);
  for (const token of devTokens) {
    if (token.test(text)) error(`${label} contains dev/local token ${token}`);
  }
}

function commandOutput(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      maxBuffer: 30 * 1024 * 1024,
      ...options,
    });
  } catch (err) {
    error(`${command} failed for ${args.join(' ')}: ${err.message}`);
    return '';
  }
}

// Detect page-print / screenshot PDFs without poppler. A PDF made by printing a
// web page embeds roughly one full-page raster image PER PAGE. A real branded
// document (React-PDF or source-HTML) is vector text with only a few decorative
// header bands total, regardless of length. So the signal is the ratio, not an
// absolute count: flag when big raster images are as numerous as the pages.
function rasterProfile(path) {
  const data = readFileSync(path).toString('latin1');
  const pageCount = (data.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  const re = /\/Subtype\s*\/Image\b/g;
  let bigRasters = 0;
  let m;
  while ((m = re.exec(data))) {
    const seg = data.slice(Math.max(0, m.index - 60), m.index + 400);
    const w = seg.match(/\/Width\s+(\d+)/);
    const h = seg.match(/\/Height\s+(\d+)/);
    if (w && h && Number(w[1]) * Number(h[1]) > 200_000) bigRasters += 1;
  }
  return { bigRasters, pageCount };
}

function scanPdfArtifact(path, slug) {
  // Hard gate: never ship a page-print/screenshot PDF again. A printed web page
  // carries ~1 full-page raster per page; a real document has a handful of
  // decorative bands total. Fail when rasters reach the page count (with a floor
  // of 6 so short, multi-image page-prints are still caught while a real 31-page
  // playbook with 5 brand header bands passes).
  const { bigRasters, pageCount } = rasterProfile(path);
  if (bigRasters >= Math.max(6, pageCount)) {
    error(
      `${slug} PDF looks like a page-print/screenshot (${bigRasters} full-page raster images across ${pageCount} pages). ` +
      'Render it from source (React-PDF or source HTML), not by printing a web page.',
    );
  }

  const info = commandOutput('pdfinfo', [path]);
  const text = commandOutput('pdftotext', ['-layout', path, '-']);
  const pagesMatch = info.match(/^Pages:\s+(\d+)/m);
  const pages = pagesMatch ? Number(pagesMatch[1]) : 0;
  const trimmed = text.trim();

  if (!pages || pages < 1) {
    error(`${slug} PDF has no readable page count`);
  }
  if (trimmed.length < 750) {
    error(`${slug} PDF text extraction is too short (${trimmed.length} chars)`);
  }
  for (const token of browserChromeTokens) {
    if (token.test(text)) error(`${slug} PDF text contains browser/error chrome token ${token}`);
  }
  if (slug === 'sample-readiness-report') {
    scanSampleReadinessReportText(text, `${slug} PDF text`);
  }
  if (slug.startsWith('regulatory-cheatsheet')) {
    scanRegulatoryCheatsheetText(text, `${slug} PDF text`);
  }
}

function scanSourceHtml(path, slug) {
  const html = readFileSync(path, 'utf8');
  if (!sourceLanguageToken.test(html)) {
    error(`${slug} source HTML is missing source/citation language`);
  }
  if (!adaptationLanguageToken.test(html)) {
    error(`${slug} source HTML is missing adapt-before-adoption language`);
  }
  if (slug === 'sample-readiness-report') {
    scanSampleReadinessReportText(html, `${slug} source HTML`);
  }
  if (slug === 'regulatory-cheatsheet') {
    scanRegulatoryCheatsheetText(html, `${slug} source HTML`);
  }
}

function scanSampleReadinessReportText(text, label) {
  for (const token of sampleReadinessRequiredTokens) {
    if (!token.test(text)) error(`${label} is missing current v3 readiness language ${token}`);
  }
  for (const token of sampleReadinessStaleTokens) {
    if (token.test(text)) error(`${label} still contains stale readiness-report language ${token}`);
  }
}

function scanRegulatoryCheatsheetText(text, label) {
  for (const token of regulatoryCheatsheetRequiredTokens) {
    if (!token.test(text)) error(`${label} is missing current model-risk source language ${token}`);
  }
  for (const token of regulatoryCheatsheetStaleTokens) {
    if (token.test(text)) error(`${label} still contains stale SR 11-7-only framing ${token}`);
  }
}

function zipEntries(path) {
  const output = execFileSync('unzip', ['-Z1', path], { encoding: 'utf8' });
  return output.split('\n').map((entry) => entry.trim()).filter(Boolean);
}

function zipEntryText(path, entry) {
  return execFileSync('unzip', ['-p', path, entry], {
    encoding: 'latin1',
    maxBuffer: 30 * 1024 * 1024,
  });
}

for (const resource of manifest.resources) {
  if (!resource.slug) error('Manifest resource missing slug');
  if (slugs.has(resource.slug)) error(`Duplicate resource slug: ${resource.slug}`);
  slugs.add(resource.slug);

  if (!Array.isArray(resource.visibleSurfaces) || resource.visibleSurfaces.length === 0) {
    error(`${resource.slug} missing visibleSurfaces`);
  }
  if (!resource.assessmentMapping || !Array.isArray(resource.assessmentMapping.roles)) {
    error(`${resource.slug} missing assessmentMapping.roles`);
  }

  if (resource.status === 'public') {
    if (!Array.isArray(resource.sourceCitations) || resource.sourceCitations.length === 0) {
      error(`${resource.slug} missing sourceCitations`);
    }
    if (!resource.download) {
      error(`${resource.slug} is public but has no download`);
      continue;
    }

    const filePath = join(DOWNLOADS_DIR, resource.download.filePath);
    manifestByFile.set(resource.download.filePath, resource.slug);
    if (!existsSync(filePath)) {
      error(`${resource.slug} points at missing ${rel(filePath)}`);
      continue;
    }

    const expectedExt = `.${resource.download.fileType}`;
    if (extname(resource.download.filePath) !== expectedExt) {
      error(`${resource.slug} has fileType ${resource.download.fileType} but filePath ${resource.download.filePath}`);
    }
    scanDevTokens(filePath);

    if (resource.download.fileType === 'pdf') {
      scanPdfArtifact(filePath, resource.slug);

      const expectedSourceWordRoute = `/api/resources/${resource.slug}/word`;
      const hasSourceHtml = sourceHtmlSlugs.has(resource.slug);

      if (hasSourceHtml) {
        const sourcePath = join(SOURCE_DIR, `${resource.slug}.html`);
        scanDevTokens(sourcePath, rel(sourcePath));
        scanSourceHtml(sourcePath, resource.slug);
        if (resource.variants?.word !== expectedSourceWordRoute) {
          error(`${resource.slug} has source HTML but missing Word route ${expectedSourceWordRoute}`);
        }
        if (!existsSync(join(ROOT, 'src', 'app', 'resources', 'access', '[slug]', 'page.tsx'))) {
          error(`${resource.slug} has source HTML but readable route ${ACCESS_ROUTE_PREFIX}${resource.slug} is missing`);
        }
      }

      if (resource.variants?.word === expectedSourceWordRoute && !hasSourceHtml) {
        error(`${resource.slug} declares source-backed Word route but is missing ${rel(join(SOURCE_DIR, `${resource.slug}.html`))}`);
      }

      const expectedLargePrintRoute = `/api/resources/${resource.slug}${LARGE_PRINT_ROUTE_SUFFIX}`;
      const hasLargePrintRoute = resource.variants?.largePrintPdf === expectedLargePrintRoute;

      if (resource.variants?.largePrintPdf && !hasLargePrintRoute) {
        error(`${resource.slug} has unexpected large-print route ${resource.variants.largePrintPdf}; expected ${expectedLargePrintRoute}`);
      }

      if (resource.category === 'desk-card' && hasSourceHtml && !hasLargePrintRoute) {
        error(`${resource.slug} desk card is missing large-print route ${expectedLargePrintRoute}`);
      }

      if (hasLargePrintRoute) {
        const largePrintPath = join(LARGE_PRINT_DIR, `${resource.slug}.pdf`);
        if (!hasSourceHtml) {
          error(`${resource.slug} declares large-print route but is missing ${rel(join(SOURCE_DIR, `${resource.slug}.html`))}`);
        }
        if (!existsSync(largePrintPath)) {
          error(`${resource.slug} large-print route is missing ${rel(largePrintPath)}`);
        } else {
          scanDevTokens(largePrintPath);
          scanPdfArtifact(largePrintPath, `${resource.slug} large-print`);
        }
      }
    }

    if (resource.download.fileType === 'zip') {
      const entries = zipEntries(filePath);
      for (const entry of entries) {
        const base = entry.split('/').pop();
        if (base.endsWith('.md') && base !== 'README.md') {
          error(`${resource.slug} ZIP contains raw Markdown core asset: ${entry}`);
        }
        const contents = zipEntryText(filePath, entry);
        for (const token of devTokens) {
          if (token.test(contents)) error(`${resource.slug} ZIP entry ${entry} contains dev/local token ${token}`);
        }
      }
    }
  }

  if (
    resource.status === 'public' &&
    resource.category === 'template' &&
    resource.variants &&
    resource.variants.word === null
  ) {
    warn(`${resource.slug} is a public template without an editable Word route`);
  }
}

for (const filename of readdirSync(DOWNLOADS_DIR)) {
  if (!filename.endsWith('.pdf') && !filename.endsWith('.zip')) continue;
  if (!manifestByFile.has(filename)) {
    error(`Committed public download is missing from manifest: ${filename}`);
  }
}

if (warnings.length > 0) {
  console.warn('\nResource audit warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length > 0) {
  console.error('\nResource audit failed:');
  for (const auditError of errors) console.error(`- ${auditError}`);
  process.exit(1);
}

console.log(`Resource audit passed: ${manifest.resources.length} manifest rows, ${manifestByFile.size} public downloads.`);
