import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getFreeResource } from '@/lib/resources/freeResources';

export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly slug: string }>;
}

const SOURCE_DIR = join(process.cwd(), 'public', 'downloads', 'source');
const WORD_ROUTE_PREFIX = '/api/resources/';
const WORD_ROUTE_SUFFIX = '/word';

function filenameFromSlug(slug: string): string {
  return `${slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')}.doc`;
}

function inlineBrandStyles(html: string, brandCss: string): string {
  const inlined = html.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']_brand\.css["']\s*\/?>/i,
    `<style>\n${brandCss}\n</style>`,
  );

  if (inlined !== html) return inlined;

  return html.replace('</head>', `<style>\n${brandCss}\n</style>\n</head>`);
}

function expectedWordRoute(slug: string): string {
  return `${WORD_ROUTE_PREFIX}${slug}${WORD_ROUTE_SUFFIX}`;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params;
  const resource = getFreeResource(slug);

  if (
    !resource ||
    resource.status !== 'public' ||
    !resource.download ||
    resource.download.fileType !== 'pdf' ||
    resource.variants.word !== expectedWordRoute(slug)
  ) {
    return NextResponse.json({ error: 'Word resource not found.' }, { status: 404 });
  }

  try {
    const [html, brandCss] = await Promise.all([
      readFile(join(SOURCE_DIR, `${slug}.html`), 'utf8'),
      readFile(join(SOURCE_DIR, '_brand.css'), 'utf8'),
    ]);

    return new NextResponse(inlineBrandStyles(html, brandCss), {
      headers: {
        'Content-Type': 'application/msword; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameFromSlug(slug)}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error(`[resources:word] source document missing for ${slug}:`, error);
    return NextResponse.json({ error: 'Word resource not available.' }, { status: 503 });
  }
}
