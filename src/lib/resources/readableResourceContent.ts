import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  getFreeResource,
  isReadableFreeResource,
  readableFreeResources,
  type ReadableFreeResource,
} from './freeResources';

const SOURCE_DIR = join(process.cwd(), 'public', 'downloads', 'source');

export interface ReadableResourceDocument {
  readonly resource: ReadableFreeResource;
  readonly bodyHtml: string;
}

export function readableResourceStaticParams(): { readonly slug: string }[] {
  return readableFreeResources.map((resource) => ({ slug: resource.slug }));
}

export function extractReadableBodyHtml(sourceHtml: string): string {
  const bodyMatch = sourceHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? sourceHtml;

  return bodyHtml
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[\s\S]*?<\/object>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .trim();
}

export async function getReadableResourceDocument(
  slug: string,
): Promise<ReadableResourceDocument | null> {
  const resource = getFreeResource(slug);
  if (!isReadableFreeResource(resource)) return null;

  try {
    const sourceHtml = await readFile(join(SOURCE_DIR, `${slug}.html`), 'utf8');
    return {
      resource,
      bodyHtml: extractReadableBodyHtml(sourceHtml),
    };
  } catch (error) {
    console.error(`[resources:readable] source document missing for ${slug}:`, error);
    return null;
  }
}
