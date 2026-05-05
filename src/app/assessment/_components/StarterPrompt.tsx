'use client';

import { useState } from 'react';
import type { StarterPrompt as StarterPromptType } from '@content/assessments/v2/personalization';

interface StarterPromptProps {
  readonly prompt: StarterPromptType;
}

export function StarterPrompt({ prompt }: StarterPromptProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked — degrade silently. The prompt is visible
      // and selectable, so the visitor can still copy manually.
    }
  }

  const chatGptUrl = `https://chat.openai.com/?q=${encodeURIComponent(prompt.prompt)}`;

  return (
    <section
      className="border border-[color:var(--color-ink)]/15 rounded-[3px] bg-[color:var(--color-ink)] text-[color:var(--color-linen)] overflow-hidden print-avoid-break"
      data-print-hide="true"
      aria-label="Starter prompt"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--color-linen)]/15">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-linen)]/65">
          {prompt.label}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-linen)]/45">
          AiBI starter
        </span>
      </div>
      <pre className="px-5 py-5 font-mono text-[13px] leading-[1.6] text-[color:var(--color-linen)] whitespace-pre-wrap break-words">
        {prompt.prompt}
      </pre>
      <div className="flex flex-col sm:flex-row gap-0 border-t border-[color:var(--color-linen)]/15">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy starter prompt to clipboard"
          className="flex-1 px-5 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--color-linen)] hover:bg-[color:var(--color-linen)]/10 transition-colors border-b sm:border-b-0 sm:border-r border-[color:var(--color-linen)]/15"
        >
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
        <a
          href={chatGptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-5 py-3 text-center font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--color-linen)] hover:bg-[color:var(--color-linen)]/10 transition-colors"
        >
          Try this now →
        </a>
      </div>
    </section>
  );
}
