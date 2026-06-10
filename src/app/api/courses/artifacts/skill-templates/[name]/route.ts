// /api/courses/artifacts/skill-templates/[name]
//
// Serves an individual (branded) skill-template markdown file and logs the
// download into resource_downloads — the same analytics table the resource
// catalog uses. These templates stay markdown on purpose: they are meant to
// be pasted into ChatGPT / Claude / Gemini, which a PDF can't do. Routing the
// download through this handler (instead of the bare /artifacts/... static
// path) is what makes them trackable.
//
// Logging is best-effort: if Supabase isn't configured or the insert fails,
// the download still succeeds. If the file can't be read from the bundle we
// fall back to a redirect to the static asset, so a download never breaks.

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';
import { TEMPLATE_FILES } from '@/app/courses/foundation/program/_lib/skillDiagnosisData';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DIR = join(process.cwd(), 'public', 'artifacts', 'skill-templates');

interface RouteContext {
  readonly params: Promise<{ readonly name: string }>;
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const { name } = await context.params;

  // Allowlist: only the files the UI actually offers, and never a path that
  // could escape the directory.
  const isAllowed =
    typeof name === 'string' &&
    !name.includes('/') &&
    !name.includes('..') &&
    TEMPLATE_FILES.some((f) => f.name === name);
  if (!isAllowed) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  let body: string;
  try {
    body = await readFile(join(DIR, name), 'utf-8');
  } catch {
    // Bundle read failed (e.g. tracing miss) — fall back to the static asset
    // so the learner still gets the file.
    return NextResponse.redirect(new URL(`/artifacts/skill-templates/${name}`, request.url), 302);
  }

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
        resource_slug: `skill-template-${name.replace(/\.md$/, '')}`,
        ip_hash: hashIp(ipHeader),
        user_agent: headerList.get('user-agent'),
        referrer: headerList.get('referer'),
      });
    } catch {
      // Logging is non-blocking.
    }
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}
