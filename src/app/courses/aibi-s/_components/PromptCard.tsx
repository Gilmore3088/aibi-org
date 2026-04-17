'use client';

// PromptCard — displays a single prompt with copy-to-clipboard functionality for AiBI-S.
// Adapted from AiBI-P PromptCard with cobalt accent and role track badge.
// Uses platform badge, role track tag, monospace prompt box, expected output, and time estimate.
// A11Y-01: keyboard accessible with visible focus rings.

import { useState, useCallback } from 'react';
import type { RoleTrack } from '@content/courses/aibi-s';
import { ROLE_TRACK_META } from '@content/courses/aibi-s';

export interface SpecialistPrompt {
  readonly id: string;
  readonly title: string;
  readonly platform: string;
  readonly roleTrack: RoleTrack;
  readonly content: string;
  readonly expectedOutput: string;
  readonly timeMinutes: number;
  readonly relatedWeek?: number;
}

interface PromptCardProps {
  readonly prompt: SpecialistPrompt;
}

// Platform display metadata — shared set of platforms used across AiBI-S tracks
const PLATFORM_DISPLAY: Record<string, { label: string; color: string }> = {
  chatgpt:    { label: 'ChatGPT',           color: 'var(--color-cobalt)' },
  claude:     { label: 'Claude',            color: 'var(--color-cobalt)' },
  copilot:    { label: 'Copilot',           color: 'var(--color-cobalt)' },
  perplexity: { label: 'Perplexity',        color: 'var(--color-cobalt)' },
  notebooklm: { label: 'NotebookLM',        color: 'var(--color-cobalt)' },
  excel:      { label: 'Copilot in Excel',   color: 'var(--color-cobalt)' },
  outlook:    { label: 'Copilot in Outlook', color: 'var(--color-cobalt)' },
  teams:      { label: 'Copilot in Teams',   color: 'var(--color-cobalt)' },
  power:      { label: 'Power Automate',     color: 'var(--color-cobalt)' },
} as const;

const COPY_RESET_MS = 2000;

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = prompt.content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    }
  }, [prompt.content]);

  const platformKey = prompt.platform.toLowerCase().replace(/\s+/g, '');
  const platformDisplay = PLATFORM_DISPLAY[platformKey] ?? {
    label: prompt.platform,
    color: 'var(--color-cobalt)',
  };
  const trackMeta = ROLE_TRACK_META[prompt.roleTrack];

  return (
    <article className="border border-[color:var(--color-parch-dark)] rounded-sm bg-[color:var(--color-parch)] p-6 space-y-4">
      {/* Header: title + badges */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] leading-snug">
          {prompt.title}
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* Platform badge */}
          <span
            className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm text-[color:var(--color-linen)]"
            style={{ backgroundColor: platformDisplay.color }}
          >
            {platformDisplay.label}
          </span>

          {/* Role track badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm border border-[color:var(--color-cobalt)]/20 text-[color:var(--color-cobalt)]">
            <span
              className="w-1 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: 'var(--color-cobalt)' }}
              aria-hidden="true"
            />
            AiBI-S{trackMeta.code}
          </span>

          {/* Time estimate badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm border border-[color:var(--color-ink)]/10 text-[color:var(--color-slate)]">
            <span className="font-mono">{prompt.timeMinutes}</span>&nbsp;min
          </span>
        </div>
      </div>

      {/* Prompt text in monospace box */}
      <div className="relative">
        <div className="bg-[color:var(--color-linen)] border border-[color:var(--color-parch-dark)] rounded-sm p-4 max-h-64 overflow-y-auto">
          <pre className="font-mono text-[13px] leading-relaxed text-[color:var(--color-ink)] whitespace-pre-wrap break-words">
            {prompt.content}
          </pre>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-1"
          style={{
            backgroundColor: copied
              ? 'var(--color-sage)'
              : 'var(--color-cobalt)',
            color: 'var(--color-linen)',
          }}
          aria-label={copied ? 'Copied to clipboard' : 'Copy prompt to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* What you will get */}
      <div className="space-y-1">
        <p className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--color-slate)]">
          What you will get
        </p>
        <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
          {prompt.expectedOutput}
        </p>
      </div>

      {/* Footer: week reference */}
      {prompt.relatedWeek && (
        <div className="pt-2 border-t border-[color:var(--color-parch-dark)]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--color-slate)]">
            Week {prompt.relatedWeek}
          </p>
        </div>
      )}
    </article>
  );
}
