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
import { cookies, headers } from 'next/headers';
import { createServerClientWithCookies, createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SIGNED_URL_TTL_SECONDS = 300; // 5 minutes

interface ResourceRow {
  readonly id: string;
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

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const { slug } = await context.params;
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
  }

  const service = createServiceRoleClient();

  const { data: resource, error } = await service
    .from('resources')
    .select('id, slug, file_path, tier_required, published')
    .eq('slug', slug)
    .maybeSingle<ResourceRow>();

  if (error || !resource || !resource.published) {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
  }

  // Entitlement check for gated resources
  let userId: string | null = null;
  let userEmail: string | null = null;

  if (resource.tier_required !== 'free') {
    const supabase = createServerClientWithCookies(cookies());
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
    const supabase = createServerClientWithCookies(cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      userEmail = user.email ?? null;
    }
  }

  // Generate signed URL
  const { data: signed, error: signedErr } = await service
    .storage
    .from('resources')
    .createSignedUrl(resource.file_path, SIGNED_URL_TTL_SECONDS, {
      download: resource.file_path,
    });

  if (signedErr || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate download URL.' }, { status: 500 });
  }

  // Log download (non-blocking; failure should not break the download)
  const headerList = await headers();
  const ipHeader =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerList.get('x-real-ip') ??
    'anonymous';

  await service.from('resource_downloads').insert({
    resource_id: resource.id,
    resource_slug: resource.slug,
    user_id: userId,
    email: userEmail,
    ip_hash: hashIp(ipHeader),
    user_agent: headerList.get('user-agent'),
    referrer: headerList.get('referer'),
  });

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
