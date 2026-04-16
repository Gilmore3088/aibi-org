// Supabase Storage helpers for work product file uploads.
//
// PREREQUISITE: The 'work-products' storage bucket must be created in the Supabase
// Dashboard (or via a migration) before these functions will work. Set bucket access
// to private so files are only readable via signed URLs.
//
// Upload pattern (avoids Vercel 4.5MB body limit):
//   1. Call getPresignedUploadUrl() server-side to generate a short-lived upload URL.
//   2. Client uploads directly to Supabase Storage via PUT to the signed URL.
//   3. Client sends the storage path back to the API route.
//   4. API route writes the path as skill_file_url in work_submissions.

import { createServiceRoleClient } from '@/lib/supabase/client';

export const WORK_PRODUCT_BUCKET = 'work-products';

// Validate that a storage path belongs to the expected bucket/enrollment prefix.
// Used server-side before writing skill_file_url to work_submissions.
export function isValidStoragePath(path: string, enrollmentId: string): boolean {
  if (typeof path !== 'string' || path.trim().length === 0) return false;
  // Path must start with the enrollment ID directory (prevents cross-enrollment path injection)
  const prefix = `${enrollmentId}/`;
  return path.startsWith(prefix);
}

export interface PresignedUploadResult {
  readonly signedUrl: string;
  readonly path: string;
}

/**
 * Generate a presigned upload URL for a work product file.
 *
 * Only call from server-side code (Route Handlers, Server Actions).
 * The URL is valid for 300 seconds (5 minutes) — enough for a file upload.
 *
 * @param enrollmentId - Scopes the upload to the learner's enrollment directory.
 * @param filename     - Original filename; sanitised before use in path.
 */
export async function getPresignedUploadUrl(
  enrollmentId: string,
  filename: string,
): Promise<PresignedUploadResult> {
  const serviceClient = createServiceRoleClient();

  // Sanitize: strip any path separators so the caller cannot escape the enrollment dir.
  const safeFilename = filename.replace(/[/\\]/g, '_');
  const path = `${enrollmentId}/${Date.now()}-${safeFilename}`;

  const { data, error } = await serviceClient.storage
    .from(WORK_PRODUCT_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Failed to generate presigned upload URL: ${error?.message ?? 'unknown error'}`);
  }

  return { signedUrl: data.signedUrl, path };
}

/**
 * Return the public URL for a stored file.
 *
 * Note: This assumes the bucket is public. If the bucket is private,
 * use createSignedUrl() with an expiry instead.
 */
export function getPublicUrl(path: string): string {
  const serviceClient = createServiceRoleClient();
  const { data } = serviceClient.storage.from(WORK_PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
