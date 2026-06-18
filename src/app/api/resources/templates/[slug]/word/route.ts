import { NextResponse } from 'next/server';
import { getTemplate } from '@/app/resources/templates/data';

export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly slug: string }>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function filenameFromSlug(slug: string): string {
  return `${slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')}.doc`;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params;
  const template = getTemplate(slug);

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const body = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(template.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #071a2f; line-height: 1.45; }
    h1 { font-size: 24pt; margin: 0 0 10pt; }
    h2 { font-size: 15pt; margin: 22pt 0 8pt; }
    p { margin: 0 0 10pt; }
    li { margin: 0 0 6pt; }
    .meta { color: #54627a; font-size: 10pt; margin-bottom: 18pt; }
    .footer { color: #54627a; font-size: 9pt; margin-top: 26pt; border-top: 1pt solid #d8c28c; padding-top: 10pt; }
  </style>
</head>
<body>
  <h1>${escapeHtml(template.title)}</h1>
  <p>${escapeHtml(template.dek)}</p>
  <p class="meta">For: ${escapeHtml(template.audience)} · ${template.readMinutes} min starter</p>
  ${template.sections
    .map((section) => {
      const items = section.items
        ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
      const steps = section.steps
        ? `<ol>${section.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`
        : '';
      return `<h2>${escapeHtml(section.heading)}</h2>${
        section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ''
      }${items}${steps}`;
    })
    .join('')}
  ${
    template.sourcedFrom.length
      ? `<h2>Sourced from</h2><ul>${template.sourcedFrom
          .map((source) => `<li>${escapeHtml(source)}</li>`)
          .join('')}</ul>`
      : ''
  }
  <p class="footer">Starter template from The AI Banking Institute. Adapt before adoption.</p>
</body>
</html>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/msword; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filenameFromSlug(slug)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
