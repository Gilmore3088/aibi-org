'use client';

// SkillFileUpload — File input with presign → PUT upload pattern.
// Emits the storage path on successful upload via onUploaded callback.

import React, { useState, useCallback } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

interface SkillFileUploadProps {
  readonly enrollmentId: string;
  readonly error?: string;
  readonly onUploaded: (path: string) => void;
  readonly onError: (message: string) => void;
  readonly onReset: () => void;
}

export function SkillFileUpload({
  enrollmentId,
  error,
  onUploaded,
  onError,
  onReset,
}: SkillFileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadStatus('uploading');
      setUploadedFilename(file.name);
      onReset();

      try {
        // Step 1: Get presigned upload URL
        const presignRes = await fetch('/api/courses/submit-work-product?action=presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId, filename: file.name }),
        });

        if (!presignRes.ok) {
          const data = (await presignRes.json()) as { error?: string };
          throw new Error(data.error ?? 'Failed to generate upload URL.');
        }

        const { signedUrl, path } = (await presignRes.json()) as {
          signedUrl: string;
          path: string;
        };

        // Step 2: Upload directly to Supabase Storage (skip in dev mode)
        if (!signedUrl.startsWith('data:')) {
          const uploadRes = await fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: file,
          });

          if (!uploadRes.ok) {
            throw new Error('File upload to storage failed. Please try again.');
          }
        }

        setUploadStatus('uploaded');
        onUploaded(path);
      } catch (err) {
        setUploadStatus('error');
        const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        onError(message);
      }
    },
    [enrollmentId, onUploaded, onError, onReset],
  );

  return (
    <div className="mb-6">
      <label
        htmlFor="skill-file"
        className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
      >
        Skill File (.md or .txt)
        <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
          *
        </span>
      </label>
      <p className="font-sans text-xs text-[color:var(--color-slate)] mb-2">
        Upload the completed skill template you built during the course.
      </p>

      <input
        id="skill-file"
        type="file"
        accept=".md,.txt"
        onChange={handleFileChange}
        disabled={uploadStatus === 'uploading'}
        aria-describedby={error ? 'skill-file-error' : 'skill-file-hint'}
        aria-invalid={Boolean(error)}
        className="block w-full text-sm font-sans text-[color:var(--color-ink)] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-[color:var(--color-terra)] file:text-[11px] file:font-mono file:uppercase file:tracking-widest file:text-[color:var(--color-terra)] file:bg-transparent hover:file:bg-[color:var(--color-terra)] hover:file:text-[color:var(--color-linen)] file:cursor-pointer file:transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2 rounded-sm"
      />

      <p id="skill-file-hint" className="mt-1 text-[11px] font-mono text-[color:var(--color-slate)]">
        Accepted formats: .md, .txt
      </p>

      {uploadStatus === 'uploading' && (
        <p className="mt-2 text-[11px] font-mono text-[color:var(--color-slate)]" aria-live="polite">
          Uploading{uploadedFilename ? ` ${uploadedFilename}` : ''}…
        </p>
      )}

      {uploadStatus === 'uploaded' && uploadedFilename && (
        <p
          className="mt-2 text-[11px] font-mono text-[color:var(--color-sage)]"
          aria-live="polite"
        >
          Uploaded: {uploadedFilename}
        </p>
      )}

      {uploadStatus === 'error' && error && (
        <p
          id="skill-file-error"
          className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
          role="alert"
        >
          Error: {error}
        </p>
      )}
    </div>
  );
}
