// GET /api/courses/generate-module-artifact?module=N
//
// Generates the per-module Apply artifact .md by merging the learner's saved
// activity_response with the module's markdown template (defined in
// content/courses/aibi-p/module-activities.ts).
//
// Returns text/markdown with a Content-Disposition: attachment header so the
// browser downloads the file with the spec's filename.
//
// Audit ref: C2 — every module yields a real downloadable artifact.

import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, createServiceRoleClient } from '@/lib/supabase/client';
import { getEnrollment } from '@/app/courses/aibi-p/_lib/getEnrollment';
import { getModuleActivitySpec } from '@content/courses/aibi-p/module-activities';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const moduleParam = url.searchParams.get('module');
  const moduleNum = moduleParam ? Number.parseInt(moduleParam, 10) : NaN;

  if (!Number.isInteger(moduleNum) || moduleNum < 1 || moduleNum > 12) {
    return NextResponse.json(
      { error: 'Invalid or missing module parameter (expected 1-12).' },
      { status: 400 },
    );
  }

  const spec = getModuleActivitySpec(moduleNum);
  if (!spec) {
    return NextResponse.json({ error: 'No artifact spec for this module.' }, { status: 404 });
  }

  // Enrollment-gated. The artifact contains the learner's own saved input —
  // unauthenticated requests get 401 even with a valid module number.
  const enrollment = await getEnrollment();
  if (!enrollment) {
    return NextResponse.json({ error: 'Enrollment required.' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured; artifact generation requires saved response.' },
      { status: 503 },
    );
  }

  const client = createServiceRoleClient();
  const activityId = `${moduleNum}.1`;
  const { data, error } = await client
    .from('activity_responses')
    .select('response')
    .eq('enrollment_id', enrollment.id)
    .eq('module_number', moduleNum)
    .eq('activity_id', activityId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: `Could not load activity response: ${error.message}` },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json(
      {
        error:
          'No saved response yet. Complete and save the Apply activity before downloading the artifact.',
      },
      { status: 404 },
    );
  }

  // The response column is JSONB shaped as Record<string, string>.
  const response = (data as { response: Record<string, string> }).response;

  // Merge response fields into the markdown template. Placeholders are
  // {{field_id}} or the special {{date}} / {{name}} tokens.
  const today = new Date().toISOString().slice(0, 10);
  // Best-effort banker name from enrollment profile (may be email-only users).
  const name =
    (enrollment as unknown as { user_full_name?: string | null }).user_full_name ??
    (enrollment as unknown as { user_email?: string | null }).user_email ??
    'AiBI-Foundation learner';

  const merged = spec.artifactTemplate
    .replace(/\{\{date\}\}/g, today)
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{(\w+)\}\}/g, (match, fieldId: string) => {
      const value = response[fieldId];
      // Leave the placeholder visible if the field is missing — better to
      // show "{{field}}" than to silently produce a confusing artifact.
      return typeof value === 'string' && value.trim().length > 0
        ? value
        : `[${fieldId} not provided]`;
    });

  return new NextResponse(merged, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${spec.artifactFilename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
