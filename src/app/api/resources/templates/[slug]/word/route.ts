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

function renderList(items: readonly string[] | undefined, tag: 'ul' | 'ol'): string {
  if (!items || items.length === 0) return '';

  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

function renderSourceBox(sources: readonly string[]): string {
  if (sources.length === 0) return '';

  return `<section class="source-box">
    <p class="source-label">Source basis</p>
    <ul>${sources.map((source) => `<li>${escapeHtml(source)}</li>`).join('')}</ul>
    <p class="source-note">This is a starter template, not legal advice or an examiner-approved policy. Adapt it to your institution's risk appetite, vendor stack, data classifications, and records-retention rules before adoption.</p>
  </section>`;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params;
  const template = getTemplate(slug);

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(template.title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #071a2f;
      background: #ffffff;
      line-height: 1.48;
      font-size: 11pt;
    }
    .cover {
      background: #071a2f;
      color: #ffffff;
      padding: 30pt 34pt 28pt;
      border-bottom: 4pt solid #c8a24a;
    }
    .brand {
      font-weight: 700;
      font-size: 13pt;
      margin-bottom: 22pt;
    }
    .brand .bracket { color: #c8a24a; font-weight: 500; }
    .brand .serif-i { font-family: Georgia, serif; font-style: italic; font-weight: 400; }
    .eyebrow {
      color: #e6d39b;
      font-size: 8.5pt;
      font-weight: bold;
      letter-spacing: 2pt;
      text-transform: uppercase;
      margin: 0 0 6pt;
    }
    h1 {
      color: #ffffff;
      font-size: 26pt;
      line-height: 1.12;
      margin: 0 0 10pt;
    }
    .dek {
      color: #d8e0ea;
      font-size: 12pt;
      margin: 0 0 16pt;
      max-width: 6.3in;
    }
    .meta {
      color: #d8e0ea;
      font-size: 9.5pt;
      border-top: 1pt solid rgba(255,255,255,.22);
      padding-top: 10pt;
      margin: 0;
    }
    .body {
      padding: 28pt 34pt 0;
    }
    .status {
      background: #f7f3ea;
      border-left: 3pt solid #c8a24a;
      padding: 10pt 12pt;
      margin: 0 0 22pt;
      color: #475569;
      font-size: 10pt;
    }
    h2 {
      color: #071a2f;
      font-size: 15.5pt;
      margin: 22pt 0 8pt;
      padding-bottom: 4pt;
      border-bottom: 1pt solid #e2e8f0;
    }
    p { margin: 0 0 10pt; color: #475569; }
    li { margin: 0 0 6pt; color: #475569; }
    strong { color: #071a2f; }
    ul, ol { margin-top: 6pt; margin-bottom: 12pt; }
    .source-box {
      margin-top: 26pt;
      padding: 13pt 15pt;
      border: 1pt solid #e2e8f0;
      border-left: 3pt solid #c8a24a;
      background: #f8fafc;
    }
    .source-label {
      margin: 0 0 6pt;
      color: #9a7a2f;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 1.6pt;
      text-transform: uppercase;
    }
    .source-note {
      margin-top: 10pt;
      font-size: 9.5pt;
      color: #64748b;
    }
    .footer {
      color: #64748b;
      font-size: 9pt;
      margin: 28pt 34pt 0;
      border-top: 1pt solid #c8a24a;
      padding-top: 10pt;
    }
  </style>
</head>
<body>
  <section class="cover">
    <div class="brand"><span class="bracket">[</span>A<span class="serif-i">i</span><span class="bracket">]</span> Banking Institute</div>
    <p class="eyebrow">Editable starter template</p>
    <h1>${escapeHtml(template.title)}</h1>
    <p class="dek">${escapeHtml(template.dek)}</p>
    <p class="meta">Audience: ${escapeHtml(template.audience)} &middot; Estimated use: ${template.readMinutes} minutes &middot; Version: 2026 resource library</p>
  </section>
  <main class="body">
    <p class="status"><strong>Document status:</strong> Starter artifact for internal adaptation. Replace bracketed placeholders, confirm ownership, and route final language through your institution's normal compliance, risk, legal, or leadership review before adoption.</p>
    ${template.sections
      .map((section) => {
        return `<section><h2>${escapeHtml(section.heading)}</h2>${
          section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ''
        }${renderList(section.items, 'ul')}${renderList(section.steps, 'ol')}</section>`;
      })
      .join('')}
    ${renderSourceBox(template.sourcedFrom)}
  </main>
  <p class="footer">The AI Banking Institute &middot; AIBankingInstitute.com &middot; Turning Bankers into Builders</p>
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
