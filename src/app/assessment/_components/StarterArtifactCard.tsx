'use client';

import { useState } from 'react';
import { MarkdownRenderer } from '@/components/lms/MarkdownRenderer';
import type { StarterArtifact } from '@content/assessments/v2/starter-artifacts';
import type { Dimension } from '@content/assessments/v2/types';

interface StarterArtifactCardProps {
  readonly artifact: StarterArtifact;
  readonly dimension: Dimension;
  readonly tierLabel: string;
  readonly topGapLabel: string;
}

// Banker-facing post-assessment artifact. Renders the markdown body inline
// and offers two actions: copy the markdown to clipboard, or download a
// branded PDF. The PDF is rendered + logged server-side at
// /api/assessment/starter-artifact/<dimension>; the clipboard copy keeps the
// raw markdown handy for pasting into the banker's own tools.
export function StarterArtifactCard({
  artifact,
  dimension,
  tierLabel,
  topGapLabel,
}: StarterArtifactCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleCopy() {
    setCopyFailed(false);
    try {
      // navigator.clipboard requires a secure context (https or localhost).
      // Some embedded webviews and older Safari builds reject the call.
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(artifact.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Surface the failure visibly so the banker knows to use Download
      // instead — silent failure feels broken.
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 4000);
    }
  }

  const pdfFilename = artifact.filename.replace(/\.md$/, '.pdf');

  return (
    <section className="border border-[color:var(--gold)]/30 bg-[color:#FFFFFF] rounded-2xl p-8 md:p-10 print-avoid-break">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold)] mb-3">
        Your starter artifact
      </p>
      <p className="text-[0.6875rem] uppercase tracking-widest text-[color:var(--slate-600)] mb-6">
        Tailored to your top gap: {topGapLabel} · {tierLabel}
      </p>

      <h3 className="text-3xl md:text-4xl text-[color:var(--ink)] leading-tight mb-3">
        {artifact.title}
      </h3>
      <p className="text-base text-[color:var(--ink)]/75 leading-relaxed mb-8 max-w-2xl">
        {artifact.subtitle}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-8" data-print-hide="true">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-block px-5 py-2.5 bg-[color:var(--gold)] text-[color:var(--cream)] font-sans text-[0.6875rem] font-semibold uppercase tracking-[1.2px] rounded-xl hover:bg-[color:var(--gold-2)] active:scale-[0.98] transition-all"
        >
          {copied ? 'Copied' : 'Copy to clipboard'}
        </button>
        <a
          href={`/api/assessment/starter-artifact/${dimension}`}
          download={pdfFilename}
          className="inline-block px-5 py-2.5 border border-[color:var(--ink)]/25 text-[color:var(--ink)] font-sans text-[0.6875rem] font-semibold uppercase tracking-[1.2px] rounded-xl hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
        >
          Download PDF
        </a>
        <span className="text-[0.625rem] text-[color:var(--slate-600)]">
          {pdfFilename}
        </span>
        {copyFailed && (
          <span
            role="alert"
            className="text-[0.625rem] text-[color:#9b2226]"
          >
            Copy unavailable in this browser — use Download instead.
          </span>
        )}
      </div>

      <div className="border-t border-[color:var(--ink)]/10 pt-8">
        <MarkdownRenderer
          content={artifact.body}
          className="text-[color:var(--ink)]"
        />
      </div>
    </section>
  );
}
