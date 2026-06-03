'use client';

// Copy / download affordances for a static template page (qa-site-walk U18).
// The template renders as read-only HTML; a banker is meant to adapt it in an
// afternoon, so give them one-click "Copy Markdown" and "Download .md". The
// markdown is serialized on the server and passed in as a string.

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
      // Download button is the fallback path.
    }
  }

  function download() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mk-tpl-copy" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="gold" onClick={copy} aria-label="Copy this template as Markdown">
        {copied ? 'Copied' : 'Copy Markdown'}
      </Button>
      <Button variant="ghost-light" onClick={download} aria-label="Download this template as a Markdown file">
        Download .md
      </Button>
    </div>
  );
}
