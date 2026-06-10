// /api/courses/cards/[card]
//
// Renders a branded one-page reference card (CORE, five-move-zones) as a PDF
// on demand via @react-pdf/renderer, and logs the download into
// resource_downloads. Same pattern as the starter-artifact route — no
// chromium, no Supabase Storage upload. These are free lead-gen / course
// reference artifacts, so no auth gate.

import { headers } from 'next/headers';
import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import { BankerCardDocument, BANKER_CARDS } from '@/lib/pdf/BankerCardDocument';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';

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
    const element = React.createElement(BankerCardDocument, {
      card: data,
    }) as React.ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(element);
    const pdf = new Uint8Array(buffer);

    if (isSupabaseConfigured()) {
      try {
        const headerList = await headers();
        const ipHeader =
          headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          headerList.get('x-real-ip') ??
          'anonymous';
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

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.filename}"`,
        'Content-Length': String(pdf.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[courses/cards] PDF generation error:', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
