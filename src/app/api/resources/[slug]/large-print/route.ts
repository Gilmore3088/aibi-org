import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import { parseDownloadAttribution } from '@/lib/resources/downloadAttribution';
import {
  FREE_RESOURCE_CAPTURE_COOKIE,
  normalizeCaptureEmail,
} from '@/lib/resources/freeResourceCapture';
import {
  getFreeResource,
  isLargePrintFreeResource,
  largePrintFilePath,
} from '@/lib/resources/freeResources';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly slug: string }>;
}

function filenameFromSlug(slug: string): string {
  return `${slug}-large-print.pdf`;
}

async function logLargePrintDownload(request: Request, slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  let service: ReturnType<typeof createServiceRoleClient>;
  try {
    service = createServiceRoleClient();
  } catch {
    return;
  }

  const cookieStore = await cookies();
  const headerList = await headers();
  const ipHeader =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerList.get('x-real-ip') ??
    'anonymous';
  const attribution = parseDownloadAttribution(request.url);
  const { error } = await service.from('resource_downloads').insert({
    resource_id: null,
    resource_slug: slug,
    user_id: null,
    email: normalizeCaptureEmail(cookieStore.get(FREE_RESOURCE_CAPTURE_COOKIE)?.value),
    ip_hash: hashIp(ipHeader),
    user_agent: headerList.get('user-agent'),
    referrer: headerList.get('referer'),
    ...attribution,
    source_surface: attribution.source_surface ?? 'resources-large-print',
  });

  if (error) {
    console.warn(`[resources:large-print] download log failed for ${slug}:`, error.message);
  }
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params;
  const resource = getFreeResource(slug);

  if (!isLargePrintFreeResource(resource)) {
    return NextResponse.json({ error: 'Large-print resource not found.' }, { status: 404 });
  }

  try {
    const file = await readFile(join(process.cwd(), 'public', 'downloads', largePrintFilePath(slug)));
    await logLargePrintDownload(request, slug);

    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filenameFromSlug(slug)}"`,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error(`[resources:large-print] file missing for ${slug}:`, error);
    return NextResponse.json({ error: 'Large-print resource unavailable.' }, { status: 503 });
  }
}
