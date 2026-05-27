'use client';

import { useState } from 'react';
import { PlaybookDownloadModal } from './PlaybookDownloadModal';

export interface PlaybookDownloadButtonProps {
  readonly role: string;
  readonly roleTitle: string;
}

export function PlaybookDownloadButton({
  role,
  roleTitle,
}: PlaybookDownloadButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mk-btn mk-btn-ghost-dark mk-btn-lg"
        onClick={() => setOpen(true)}
      >
        Download Playbook (PDF)
      </button>
      {open && (
        <PlaybookDownloadModal
          role={role}
          roleTitle={roleTitle}
          pdfHref={`/downloads/${role}-playbook.pdf`}
          pdfFilename={`AiBI-${roleTitle.replace(/[^A-Za-z0-9]+/g, '-')}-Playbook.pdf`}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
