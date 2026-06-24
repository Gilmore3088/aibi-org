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

async function staticDownloadResponse(
  resource: Pick<ResourceRow, 'file_path'> & { readonly file_type?: 'pdf' | 'zip' },
): Promise<Response> {
  try {
    const file = await readFile(join(process.cwd(), 'public', 'downloads', resource.file_path));
    const filename = resource.file_path.split('/').pop() ?? resource.file_path;
    const contentType = resource.file_type === 'zip' ? 'application/zip' : 'application/pdf';
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error(`[resources:download] static fallback missing for ${resource.file_path}:`, error);
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
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerList.get('x-real-ip') ??
    'anonymous';
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

  // Generate signed URL
  const { data: signed, error: signedErr } = await service
    .storage
    .from('resources')
    .createSignedUrl(resource.file_path, SIGNED_URL_TTL_SECONDS, {
      download: resource.file_path,
    });

  if (signedErr || !signed?.signedUrl) {
    // Storage failed (bucket not seeded or not created yet). For free-tier
    // resources the file is also committed under /public/downloads, so stream it
    // directly rather than relying on legacy /downloads redirects. Gated
    // resources have no public fallback — return 503 instead of 500 so the
    // caller knows it's transient.
    if (resource.tier_required === 'free') {
      await service.from('resource_downloads').insert(downloadLog);
      return staticDownloadResponse(resource);
    }
    console.error(`[resources:download] storage error for ${slug}:`, signedErr?.message);
    return NextResponse.json({ error: 'Download temporarily unavailable.' }, { status: 503 });
  }

  // Log download (non-blocking; failure should not break the download)
  await service.from('resource_downloads').insert(downloadLog);

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
