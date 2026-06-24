// /api/assessment/starter-artifact/[dimension]
//
// Serves a banker's post-assessment starter artifact as a static branded PDF
// and logs the download into resource_downloads. Replaces the old unbranded,
// unlogged client-side .md blob download.
//
// The body is static per dimension, so no auth/entitlement is required — this
// is the free lead-gen artifact the banker earned by completing the
// assessment. Logging is best-effort and never blocks the download.

import { headers } from 'next/headers';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly dimension: string }>;
}

function isDimension(value: string): value is Dimension {
  return Object.prototype.hasOwnProperty.call(DIMENSION_LABELS, value);
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const { dimension } = await context.params;
  if (!isDimension(dimension)) {
    return new Response(JSON.stringify({ error: 'Artifact not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const artifact = getStarterArtifact(dimension);

  try {
    const file = await readFile(
      join(process.cwd(), 'public', 'downloads', 'starter-artifacts', `${dimension}.pdf`),
    );

    // Best-effort download log — never blocks the response.
    if (isSupabaseConfigured()) {
      try {
        const headerList = await headers();
        const ipHeader =
          headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          headerList.get('x-real-ip') ??
          'anonymous';
        const service = createServiceRoleClient();
        await service.from('resource_downloads').insert({
          resource_slug: `starter-${dimension}`,
          ip_hash: hashIp(ipHeader),
          user_agent: headerList.get('user-agent'),
          referrer: headerList.get('referer'),
        });
      } catch {
        // Logging is non-blocking.
      }
    }

    const filename = artifact.filename.replace(/\.md$/, '.pdf');
    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(file.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[starter-artifact] static PDF read failed:', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
