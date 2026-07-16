import { headers, cookies } from 'next/headers';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { parseDownloadAttribution } from '@/lib/resources/downloadAttribution';
import { getRequestIpFromHeaders } from '@/lib/api/rate-limit';
import {
  FREE_RESOURCE_CAPTURE_COOKIE,
  normalizeCaptureEmail,
} from '@/lib/resources/freeResourceCapture';

export interface StaticResourceDownloadLogOptions {
  readonly resourceSlug: string;
  readonly defaultSourceSurface: string;
  readonly resourceId?: string | null;
}

export async function logStaticResourceDownload(
  request: Request,
  {
    resourceSlug,
    defaultSourceSurface,
    resourceId = null,
  }: StaticResourceDownloadLogOptions,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  let service: ReturnType<typeof createServiceRoleClient>;
  try {
    service = createServiceRoleClient();
  } catch {
    return;
  }

  try {
    const cookieStore = await cookies();
    const headerList = await headers();
    const ipHeader =
      getRequestIpFromHeaders(headerList);
    const attribution = parseDownloadAttribution(request.url);

    const { error } = await service.from('resource_downloads').insert({
      resource_id: resourceId,
      resource_slug: resourceSlug,
      user_id: null,
      email: normalizeCaptureEmail(cookieStore.get(FREE_RESOURCE_CAPTURE_COOKIE)?.value),
      ip_hash: hashIp(ipHeader),
      user_agent: headerList.get('user-agent'),
      referrer: headerList.get('referer'),
      ...attribution,
      source_surface: attribution.source_surface ?? defaultSourceSurface,
    });

    if (error) {
      console.warn(`[resources:download-log] insert failed for ${resourceSlug}:`, error.message);
    }
  } catch (error) {
    console.warn(
      `[resources:download-log] failed for ${resourceSlug}:`,
      error instanceof Error ? error.message : error,
    );
  }
}
