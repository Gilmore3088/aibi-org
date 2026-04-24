'use client';

// PromptCard — displays a single prompt with copy-to-clipboard functionality
// Uses platform badge, role tag, monospace prompt box, expected output, and time estimate

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Prompt, ContentLevel } from '@content/courses/aibi-p/prompt-library';
import {
  PLATFORM_META,
  ROLE_LABELS,
  DIFFICULTY_LABELS,
  SAFETY_LEVEL_LABELS,
  TASK_TYPE_LABELS,
  getPromptSafetyLevel,
  getPromptTaskType,
  getPromptTimeMinutes,
} from '@content/courses/aibi-p/prompt-library';
import { getPlatformUrl, PLATFORM_URLS } from '@/lib/utm';
import type { PlatformId } from '@/lib/utm';
import { ContentGate } from './ContentGate';

interface PromptCardProps {
  readonly prompt: Prompt;
  readonly userLevel?: ContentLevel | null;
}

const COPY_RESET_MS = 2000;

export function PromptCard({ prompt, userLevel = null }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aibi-saved-prompts');
      const existing = raw ? (JSON.parse(raw) as string[]) : [];
      setSaved(existing.includes(prompt.id));
    } catch {
      setSaved(false);
    }
  }, [prompt.id]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = prompt.promptText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    }
  }, [prompt.promptText]);

  const platformMeta = PLATFORM_META[prompt.platform];
  const roleLabel = ROLE_LABELS[prompt.role];
  const difficultyLabel = DIFFICULTY_LABELS[prompt.difficulty];
  const taskType = getPromptTaskType(prompt);
  const safetyLevel = getPromptSafetyLevel(prompt);
  const timeMinutes = getPromptTimeMinutes(prompt);

  const handleSave = useCallback(async () => {
    setSavingPrompt(true);
    const nextSaved = !saved;
    try {
      const response = await fetch('/api/prompts/save', {
        method: nextSaved ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'aibi-p', promptId: prompt.id }),
      });

      if (!response.ok && response.status !== 401 && response.status !== 503) {
        throw new Error('Failed to save prompt');
      }
    } catch {
      // Unauthenticated preview users still get a local saved prompt list.
    } finally {
      try {
        const key = 'aibi-saved-prompts';
        const raw = localStorage.getItem(key);
        const existing = raw ? (JSON.parse(raw) as string[]) : [];
        const next = nextSaved
          ? Array.from(new Set([...existing, prompt.id]))
          : existing.filter((id) => id !== prompt.id);
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore local persistence failure; visual state still updates.
      }
      setSaved(nextSaved);
      setSavingPrompt(false);
    }
  }, [prompt.id, saved]);

  const card = (
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
            style={{ backgroundColor: platformMeta.colorVar }}
          >
            {platformMeta.label}
          </span>

          {/* Role tag */}
          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm border border-[color:var(--color-ink)]/20 text-[color:var(--color-ink)]">
            {roleLabel}
          </span>

          {/* Difficulty tag */}
          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm border border-[color:var(--color-ink)]/10 text-[color:var(--color-slate)]">
            {difficultyLabel}
          </span>

          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm border border-[color:var(--color-ink)]/10 text-[color:var(--color-slate)]">
            {TASK_TYPE_LABELS[taskType]}
          </span>

          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm border border-[color:var(--color-terra)]/20 text-[color:var(--color-terra)]">
            {SAFETY_LEVEL_LABELS[safetyLevel]} use
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs text-[color:var(--color-slate)]">
        <div>
          <p className="font-mono uppercase tracking-widest text-[10px] mb-1">
            When to use it
          </p>
          <p className="leading-relaxed">
            {prompt.whenToUse ?? prompt.expectedOutput}
          </p>
        </div>
        <div>
          <p className="font-mono uppercase tracking-widest text-[10px] mb-1">
            What not to paste
          </p>
          <p className="leading-relaxed">
            {prompt.whatNotToPaste ??
              'Do not paste customer PII, account numbers, credit decisions, SAR details, or sensitive financial records.'}
          </p>
        </div>
      </div>

      {/* Prompt text in monospace box */}
      <div className="relative">
        <div className="bg-[color:var(--color-linen)] border border-[color:var(--color-parch-dark)] rounded-sm p-4 max-h-64 overflow-y-auto">
          <pre className="font-mono text-[13px] leading-relaxed text-[color:var(--color-ink)] whitespace-pre-wrap break-words">
            {prompt.promptText}
          </pre>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1"
          style={{
            backgroundColor: copied
              ? 'var(--color-sage)'
              : 'var(--color-terra)',
            color: 'var(--color-linen)',
          }}
          aria-label={copied ? 'Copied to clipboard' : 'Copy prompt to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* What you'll get */}
      <div className="space-y-1">
        <p className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--color-slate)]">
          What you will get
        </p>
        <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
          {prompt.expectedOutput}
        </p>
      </div>

      {/* Footer: time estimate + open platform link */}
      <div className="flex items-center justify-between pt-2 border-t border-[color:var(--color-parch-dark)]">
        <span className="font-mono text-[12px] text-[color:var(--color-slate)]">
          {timeMinutes} min · Module {prompt.relatedModule}
        </span>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={savingPrompt}
            className="font-sans text-[12px] italic text-[color:var(--color-terra)] hover:underline focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
          >
            {savingPrompt ? 'Saving' : saved ? 'Saved' : 'Save'}
          </button>
          <Link
            href={`/courses/aibi-p/${prompt.relatedModule}`}
            className="font-sans text-[12px] italic text-[color:var(--color-terra)] hover:underline focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
          >
            Open in practice
          </Link>
          {prompt.platform in PLATFORM_URLS && (
            <a
              href={getPlatformUrl(prompt.platform as PlatformId, prompt.relatedModule)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[12px] italic text-[color:var(--color-terra)] hover:underline focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
            >
              Open in {platformMeta.label}
            </a>
          )}
        </div>
      </div>
    </article>
  );

  if (!prompt.requiredLevel) {
    return card;
  }

  return (
    <ContentGate
      requiredLevel={prompt.requiredLevel}
      userLevel={userLevel}
      previewDescription={`Advanced ${ROLE_LABELS[prompt.role]} prompt — ${prompt.timeEstimate}`}
    >
      {card}
    </ContentGate>
  );
}
