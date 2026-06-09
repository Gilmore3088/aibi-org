'use client';

// Copy / download affordances for a static template page (qa-site-walk U18).
// The template renders as read-only HTML; a banker is meant to adapt it in an
// afternoon, so give them one-click "Copy Markdown" (paste into their own
// tools) plus a branded PDF download. The PDF is served from Supabase Storage
// via /api/resources/template-<slug>/download — the same signed-URL +
// download-log path as every other resource, so the file is on-brand,
// trackable, and counted. The old raw .md blob download was unbranded and
// bypassed that logging entirely.

import { useState } from 'react';
import { Button } from '@/components/mockup';

interface TemplateActionsProps {
  readonly markdown: string;
  readonly slug: string;
}

export function TemplateActions({ markdown, slug }: TemplateActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / permissions) — no-op; the
      // PDF download is the fallback path.
    }
  }

  return (
    <div className="mk-tpl-copy" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="gold" onClick={copy} aria-label="Copy this template as Markdown">
        {copied ? 'Copied' : 'Copy Markdown'}
      </Button>
      <Button
        variant="ghost-light"
        href={`/api/resources/template-${slug}/download`}
        aria-label="Download this template as a branded PDF"
      >
        Download PDF
      </Button>
    </div>
  );
}
