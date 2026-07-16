// /api/resources/[slug]/download
//
// Looks up the resource by slug, verifies the requester's entitlement if
// the resource is gated, generates a short-lived signed URL from Supabase
// Storage, logs the download, and 302-redirects the browser to the
// signed URL.
//
// Free-tier resources are downloadable without auth (lead-gen artifacts).
// Gated resources require a matching entitlements row.

import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cookies, headers } from 'next/headers';
import { createServerClientWithCookies, createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import { getDownloadResource, type DownloadResource } from '@/lib/resources/downloadCatalog';
import { parseDownloadAttribution } from '@/lib/resources/downloadAttribution';
import { getRequestIpFromHeaders } from '@/lib/api/rate-limit';
import {
  FREE_RESOURCE_CAPTURE_COOKIE,
  normalizeCaptureEmail,
} from '@/lib/resources/freeResourceCapture';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SIGNED_URL_TTL_SECONDS = 300; // 5 minutes
interface ResourceRow {
  readonly id: string | null;
  readonly slug: string;
  readonly file_path: string;
  readonly tier_required: 'free' | 'foundation' | 'aibi-s' | 'aibi-l' | 'in-depth-assessment';
  readonly published: boolean;
}

interface RouteContext {
  readonly params: Promise<{ readonly slug: string }>;
}

const TIER_TO_PRODUCTS: Record<ResourceRow['tier_required'], readonly string[]> = {
  'free': [],
  'foundation': ['foundation', 'foundations', 'aibi-p'],
  'aibi-s': ['aibi-s'],
  'aibi-l': ['aibi-l'],
  'in-depth-assessment': ['in-depth-assessment'],
};

// Best-effort download logging. A logging failure must never break delivery.
async function logDownload(
  service: ReturnType<typeof createServiceRoleClient>,
  downloadLog: Record<string, unknown>,
  slug: string,
): Promise<void> {
  try {
    const { error } = await service.from('resource_downloads').insert(downloadLog);
    if (error) {
      console.warn(`[resources:download] log insert failed for ${slug}:`, error.message);
    }
  } catch (err) {
    console.warn(`[resources:download] log insert threw for ${slug}:`, err);
  }
}

function inferDownloadContentType(filePath: string): string {
  return filePath.toLowerCase().endsWith('.zip') ? 'application/zip' : 'application/pdf';
}

async function staticDownloadResponse(
  resource: Pick<ResourceRow, 'file_path'>,
): Promise<Response> {
  try {
    const file = await readFile(join(process.cwd(), 'public', 'downloads', resource.file_path));
    const filename = resource.file_path.split('/').pop() ?? resource.file_path;
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': inferDownloadContentType(resource.file_path),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error(`[resources:download] static file missing for ${resource.file_path}:`, error);
    return NextResponse.json({ error: 'Download temporarily unavailable.' }, { status: 503 });
  }
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const { slug } = await context.params;
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
  }

  const staticResource = getDownloadResource(slug);
  let service: ReturnType<typeof createServiceRoleClient>;
  try {
    service = createServiceRoleClient();
  } catch {
    if (staticResource?.tier_required === 'free') {
      return staticDownloadResponse(staticResource);
    }
    return NextResponse.json({ error: 'Download temporarily unavailable.' }, { status: 503 });
  }

  const { data: persistedResource, error } = await service
    .from('resources')
    .select('id, slug, file_path, tier_required, published')
    .eq('slug', slug)
    .maybeSingle<ResourceRow>();

  if (persistedResource && !persistedResource.published) {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
  }

  if (error && !staticResource) {
    console.warn(`[resources:download] resource catalog lookup failed for ${slug}:`, error.message);
  }

  const resource: ResourceRow | DownloadResource | null = persistedResource ?? staticResource;

  if (!resource) {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
  }

  // Entitlement check for gated resources
  let userId: string | null = null;
  let userEmail: string | null = null;
  const cookieStore = await cookies();
  const capturedResourceEmail = normalizeCaptureEmail(
    cookieStore.get(FREE_RESOURCE_CAPTURE_COOKIE)?.value,
  );

  if (resource.tier_required !== 'free') {
    const supabase = createServerClientWithCookies(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Sign in to access this resource.' },
        { status: 401 },
      );
    }

    userId = user.id;
    userEmail = user.email ?? null;

    const allowedProducts = TIER_TO_PRODUCTS[resource.tier_required];
    const { data: entitlement } = await service
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('active', true)
      .is('revoked_at', null)
      .in('product', allowedProducts as string[])
      .limit(1)
      .maybeSingle();

    if (!entitlement) {
      return NextResponse.json(
        { error: 'This resource requires an active entitlement.' },
        { status: 403 },
      );
    }
  } else {
    // For free resources still try to attribute the download to a logged-in user
    const supabase = createServerClientWithCookies(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      userEmail = user.email ?? null;
    } else {
      userEmail = capturedResourceEmail;
    }
  }

  const headerList = await headers();
  const ipHeader =
    getRequestIpFromHeaders(headerList);
  const downloadLog = {
    resource_id: resource.id,
    resource_slug: resource.slug,
    user_id: userId,
    email: userEmail,
    ip_hash: hashIp(ipHeader),
    user_agent: headerList.get('user-agent'),
    referrer: headerList.get('referer'),
    ...parseDownloadAttribution(request.url),
  };

  // Free-tier resources are served straight from the repo-committed file under
  // /public/downloads — the source of truth that ships with every deploy and is
  // traced into this function (see outputFileTracingIncludes in next.config).
  //
  // We deliberately do NOT serve free resources from the Storage bucket. The
  // bucket is populated by a manual seed script and silently drifts out of date:
  // it was serving stale website-screenshot playbook PDFs (a print of the
  // /playbooks/[role] marketing page) to every visitor while the correct, rich
  // PDFs sat committed in the repo. Serving the committed file removes that
  // entire class of bug. Gated resources still use short-lived signed URLs
  // (they have no public file and require an authenticated entitlement).
  if (resource.tier_required === 'free') {
    await logDownload(service, downloadLog, slug);
    return staticDownloadResponse(resource);
  }

  // Gated resource — generate a short-lived signed URL from Storage.
  const { data: signed, error: signedErr } = await service
    .storage
    .from('resources')
    .createSignedUrl(resource.file_path, SIGNED_URL_TTL_SECONDS, {
      download: resource.file_path,
    });

  if (signedErr || !signed?.signedUrl) {
    console.error(`[resources:download] storage error for ${slug}:`, signedErr?.message);
    return NextResponse.json({ error: 'Download temporarily unavailable.' }, { status: 503 });
  }

  await logDownload(service, downloadLog, slug);

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
