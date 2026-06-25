import { NextResponse } from 'next/server';
import { getPlaybookAsset } from '@content/playbook-assets/data';

export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly role: string; readonly asset: string }>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function filenameFromParts(role: string, asset: string): string {
  return `${role}-${asset}`
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { role, asset: assetSlug } = await context.params;
  const asset = getPlaybookAsset(assetSlug);

  if (!asset || asset.playbook !== role) {
    return NextResponse.json({ error: 'Playbook asset not found.' }, { status: 404 });
  }

  const sections = asset.sections
    .map((section) => {
      const intro = section.intro ? `<p>${escapeHtml(section.intro)}</p>` : '';
      const items = section.items
        ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
      const fields = section.fields
        ? `<table>${section.fields
            .map(
              (field) =>
                `<tr><th>${escapeHtml(field.label)}</th><td>${escapeHtml(field.help)}</td></tr>`,
            )
            .join('')}</table>`
        : '';
      const steps = section.steps
        ? `<ol>${section.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`
        : '';
      const prompt = section.prompt ? `<pre>${escapeHtml(section.prompt)}</pre>` : '';
      const principle = section.principle
        ? `<p class="principle">${escapeHtml(section.principle)}</p>`
        : '';
      return `<h2>${escapeHtml(section.heading)}</h2>${intro}${items}${fields}${steps}${prompt}${principle}`;
    })
    .join('');

  const sources = asset.sourcedFrom.length
    ? `<h2>Sourced from</h2><ul>${asset.sourcedFrom
        .map((source) => `<li>${escapeHtml(source)}</li>`)
        .join('')}</ul>`
    : '';

  const body = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(asset.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #071a2f; line-height: 1.45; }
    .eyebrow { color: #9a7a2f; font-size: 9pt; font-weight: bold; letter-spacing: 2pt; text-transform: uppercase; margin: 0 0 4pt; }
    h1 { font-size: 24pt; margin: 0 0 10pt; padding-bottom: 10pt; border-bottom: 2pt solid #c8a24a; }
    h2 { font-size: 15pt; margin: 22pt 0 8pt; color: #071a2f; }
    p { margin: 0 0 10pt; }
    li { margin: 0 0 6pt; }
    table { border-collapse: collapse; width: 100%; margin: 8pt 0 12pt; }
    th, td { border: 1pt solid #d9cba9; padding: 7pt 8pt; text-align: left; vertical-align: top; }
    th { width: 34%; background: #f5f0e6; }
    pre { white-space: pre-wrap; background: #f5f0e6; padding: 10pt; border: 1pt solid #d9cba9; }
    .meta { color: #54627a; font-size: 10pt; margin-bottom: 18pt; }
    .principle { border-left: 3pt solid #c8a24a; padding-left: 10pt; color: #071a2f; }
    .footer { color: #54627a; font-size: 9pt; margin-top: 26pt; border-top: 1pt solid #c8a24a; padding-top: 10pt; }
  </style>
</head>
<body>
  <p class="eyebrow">The AI Banking Institute · ${escapeHtml(asset.kind)}</p>
  <h1>${escapeHtml(asset.title)}</h1>
  <p>${escapeHtml(asset.dek)}</p>
  <p class="meta">For: ${escapeHtml(asset.audience)} · ${asset.readMinutes} min starter</p>
  ${sections}
  ${sources}
  <p class="footer">Starter artifact from The AI Banking Institute · AIBankingInstitute.com · Adapt before adoption.</p>
</body>
</html>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/msword; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filenameFromParts(role, assetSlug)}.doc"`,
      'Cache-Control': 'no-store',
    },
  });
}
