// Supabase Storage wrappers for the assessment-pdfs bucket.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { createServiceRoleClient } from '@/lib/supabase/client';

const BUCKET = 'assessment-pdfs';

export interface UploadResult {
  readonly path: string;
  readonly bytes: number;
}

export async function uploadAssessmentPdf(
  profileId: string,
  buffer: Buffer,
): Promise<UploadResult> {
  const client = createServiceRoleClient();
  const path = `${profileId}.pdf`;

  const { error } = await client.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) {
    throw new Error(`[pdf/storage] upload failed: ${error.message}`);
  }

  const { error: dbError } = await client
    .from('user_profiles')
    .update({
      pdf_storage_path: path,
      pdf_generated_at: new Date().toISOString(),
    })
    .eq('id', profileId);

  if (dbError) {
    throw new Error(`[pdf/storage] user_profiles stamp failed: ${dbError.message}`);
  }

  return { path, bytes: buffer.length };
}

// Supabase signs object paths without verifying the object exists — the
// minted URL then 404s at fetch time (2026-06-10 prod incident: download
// button handed the user a dead storage link). Verify existence first.
async function pdfObjectExists(
  client: ReturnType<typeof createServiceRoleClient>,
  path: string,
): Promise<boolean> {
  const { data, error } = await client.storage
    .from(BUCKET)
    .list('', { limit: 1, search: path });
  if (error) return false;
  return (data ?? []).some((obj) => obj.name === path);
}

export async function getSignedDownloadUrl(profileId: string): Promise<string | null> {
  const client = createServiceRoleClient();

  // Candidate paths, most-authoritative first:
  //   1. user_profiles.pdf_storage_path — what upload / back-fill recorded
  //   2. `${profileId}.pdf` — the upload convention
  //   3. `${previous_id}.pdf` — back-fill re-keys the row id on account
  //      creation; if its storage move failed the object still lives at the
  //      pre-conversion path.
  const candidates: string[] = [];
  const primary = await client
    .from('user_profiles')
    .select('pdf_storage_path, previous_id')
    .eq('id', profileId)
    .maybeSingle();
  let row = primary.data;
  if (primary.error) {
    // previous_id column missing (migration 00042 not applied) — retry
    // with the always-present column only.
    ({ data: row } = await client
      .from('user_profiles')
      .select('pdf_storage_path')
      .eq('id', profileId)
      .maybeSingle());
  }
  const storedPath = (row as { pdf_storage_path?: string | null } | null)?.pdf_storage_path;
  const previousId = (row as { previous_id?: string | null } | null)?.previous_id;
  if (storedPath) candidates.push(storedPath);
  candidates.push(`${profileId}.pdf`);
  if (previousId) candidates.push(`${previousId}.pdf`);

  for (const path of [...new Set(candidates)]) {
    if (!(await pdfObjectExists(client, path))) continue;
    const { data, error } = await client.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24);
    if (!error && data?.signedUrl) return data.signedUrl;
  }

  // No object found at any candidate path → caller returns pdf-not-ready and
  // the download button re-warms (regenerates) and retries automatically.
  return null;
}

export async function deleteOldPdfs(olderThanDays: number): Promise<{ deleted: number }> {
  const client = createServiceRoleClient();
  const cutoffIso = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: stale, error: queryError } = await client
    .from('user_profiles')
    .select('id, pdf_storage_path')
    .lt('pdf_generated_at', cutoffIso)
    .not('pdf_storage_path', 'is', null);

  if (queryError) throw new Error(`[pdf/storage] cleanup query failed: ${queryError.message}`);
  if (!stale || stale.length === 0) return { deleted: 0 };

  const paths = stale
    .map((row) => row.pdf_storage_path)
    .filter((p): p is string => Boolean(p));
  const { error: deleteError } = await client.storage.from(BUCKET).remove(paths);
  if (deleteError) throw new Error(`[pdf/storage] delete failed: ${deleteError.message}`);

  const { error: clearError } = await client
    .from('user_profiles')
    .update({ pdf_storage_path: null, pdf_generated_at: null })
    .in(
      'id',
      stale.map((r) => r.id),
    );

  if (clearError) throw new Error(`[pdf/storage] clear-columns failed: ${clearError.message}`);

  return { deleted: paths.length };
}
