'use client';

import { useState } from 'react';
import { MarkdownRenderer } from '@/app/courses/aibi-p/_components/MarkdownRenderer';
import {
  type StarterArtifact,
  TIER_PREFACES,
} from '@content/assessments/v2/starter-artifacts';
import type { Tier } from '@content/assessments/v2/scoring';

interface StarterArtifactCardProps {
  readonly artifact: StarterArtifact;
  readonly tierLabel: string;
  readonly tierId?: Tier['id']; // optional for backward compat — falls back to no preface if absent
  readonly topGapLabel: string;
}

// Banker-facing post-assessment artifact. Renders the markdown body inline
// and offers two actions: copy to clipboard, download as .md. No analytics
// gating, no email gate beyond the one already passed — this content is
// the legitimate value the banker earned by handing over their email.
export function StarterArtifactCard({
  artifact,
  tierLabel,
  tierId,
  topGapLabel,
}: StarterArtifactCardProps) {
  const preface = tierId ? TIER_PREFACES[tierId] : null;
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // The downloadable / copyable body includes the tier preface as a
  // blockquote at the top so the framing travels with the artifact when
  // the banker shares it with colleagues. Stripped of HTML — pure markdown.
  const exportBody = preface
    ? `> **${preface.headline}** _(For ${tierLabel} institutions)_\n>\n> ${preface.body}\n\n${artifact.body}`
    : artifact.body;

  async function handleCopy() {
    setCopyFailed(false);
    try {
      // navigator.clipboard requires a secure context (https or localhost).
      // Some embedded webviews and older Safari builds reject the call.
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(exportBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Surface the failure visibly so the banker knows to use Download
      // instead — silent failure feels broken.
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 4000);
    }
  }

  function handleDownload() {
    const blob = new Blob([exportBody], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  return (
    <section className="border border-[color:var(--color-terra)]/30 bg-[color:var(--color-parch)] rounded-[3px] p-8 md:p-10 print-avoid-break">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
        Your starter artifact
      </p>
      <p className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] mb-6">
        Tailored to your top gap: {topGapLabel} · {tierLabel}
      </p>

      <h3 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-3">
        {artifact.title}
      </h3>
      <p className="text-base text-[color:var(--color-ink)]/75 leading-relaxed mb-8 max-w-2xl">
        {artifact.subtitle}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-8" data-print-hide="true">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-block px-5 py-2.5 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
        >
          {copied ? 'Copied' : 'Copy to clipboard'}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-block px-5 py-2.5 border border-[color:var(--color-ink)]/25 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
        >
          {downloaded ? 'Downloaded' : `Download .md`}
        </button>
        <span className="font-mono text-[10px] text-[color:var(--color-slate)]">
          {artifact.filename}
        </span>
        {copyFailed && (
          <span
            role="alert"
            className="font-mono text-[10px] text-[color:var(--color-error)]"
          >
            Copy unavailable in this browser — use Download instead.
          </span>
        )}
      </div>

      {preface && (
        <aside
          aria-label={`Framing for ${tierLabel} institutions`}
          className="mb-8 pb-6 border-b-2 border-[color:var(--color-terra)]/40"
        >
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-2">
            For {tierLabel} institutions
          </p>
          <p className="font-serif italic text-xl md:text-2xl text-[color:var(--color-ink)] leading-snug mb-3">
            {preface.headline}
          </p>
          <p className="font-sans text-base leading-relaxed text-[color:var(--color-ink)]/80">
            {preface.body}
          </p>
        </aside>
      )}

      <div className="border-t border-[color:var(--color-ink)]/10 pt-8">
        <MarkdownRenderer
          content={artifact.body}
          className="text-[color:var(--color-ink)]"
        />
      </div>
    </section>
  );
}
