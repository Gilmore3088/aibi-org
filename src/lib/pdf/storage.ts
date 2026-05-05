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

export async function getSignedDownloadUrl(profileId: string): Promise<string | null> {
  const client = createServiceRoleClient();
  const path = `${profileId}.pdf`;

  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
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
