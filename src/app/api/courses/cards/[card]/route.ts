// /api/courses/cards/[card]
//
// Serves a static branded one-page reference card (CORE, five-move-zones) as
// a PDF and logs the download into resource_downloads. These are free lead-gen
// / course reference artifacts, so no auth gate.

import { headers } from 'next/headers';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BANKER_CARDS } from '@/lib/pdf/BankerCardDocument';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import { getRequestIpFromHeaders } from '@/lib/api/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly card: string }>;
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const { card } = await context.params;
  const data = BANKER_CARDS[card];
  if (!data) {
    return new Response(JSON.stringify({ error: 'Card not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const file = await readFile(join(process.cwd(), 'public', 'downloads', 'cards', data.filename));

    if (isSupabaseConfigured()) {
      try {
        const headerList = await headers();
        const ipHeader =
          getRequestIpFromHeaders(headerList);
        const service = createServiceRoleClient();
        await service.from('resource_downloads').insert({
          resource_slug: `card-${data.slug}`,
          ip_hash: hashIp(ipHeader),
          user_agent: headerList.get('user-agent'),
          referrer: headerList.get('referer'),
        });
      } catch {
        // Logging is non-blocking.
      }
    }

    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.filename}"`,
        'Content-Length': String(file.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[courses/cards] static PDF read failed:', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
