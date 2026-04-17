// /courses/aibi-p/prompt-library — Browsable prompt reference page
// Server Component shell with client-side filtering

import type { Metadata } from 'next';
import Link from 'next/link';
import { PromptLibraryClient } from './PromptLibraryClient';

export const metadata: Metadata = {
  title: 'Prompt Library | AiBI-P | The AI Banking Institute',
  description:
    'Copy-paste-ready AI prompts for community banking professionals. Organized by platform, role, and difficulty. Part of the AiBI-P Banking AI Practitioner course.',
};

export default function PromptLibraryPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)]">
          <li>
            <Link
              href="/courses/aibi-p"
              className="hover:text-[color:var(--color-terra)] transition-colors"
            >
              AiBI-P
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[color:var(--color-ink)]">Prompt Library</li>
        </ol>
      </nav>

      {/* Page header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-terra)]">
            Reference
          </span>
          <div className="h-px w-8 bg-[color:var(--color-terra)]/30" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-dust)]">
            Banking AI Prompts
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-4">
          Prompt Library
        </h1>

        <p className="font-sans text-base text-[color:var(--color-ink)]/80 leading-relaxed max-w-2xl">
          Copy-paste-ready prompts for community banking professionals. Each prompt
          is designed to produce institutional-grade output using the RTFC Framework
          from Module 6. Filter by your platform, department, or experience level,
          then paste into your AI tool and see what you get.
        </p>

        <p className="font-sans text-sm text-[color:var(--color-dust)] mt-3 leading-relaxed max-w-2xl">
          Every prompt includes constraints that prevent common AI pitfalls in banking:
          unsourced citations, compliance overreach, and confidential data exposure.
          Review all AI outputs before institutional use.
        </p>
      </header>

      {/* Filterable prompt grid */}
      <PromptLibraryClient />

      {/* Footer guidance */}
      <footer className="mt-16 pt-8 border-t border-[color:var(--color-parch-dark)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h2 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-2">
              How to use these prompts
            </h2>
            <ol className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed space-y-2 list-decimal list-inside">
              <li>Choose a prompt that matches your role and platform</li>
              <li>Click "Copy" to copy the full prompt text</li>
              <li>
                Paste into your AI tool (ChatGPT, Claude, Gemini, Copilot, or
                Perplexity)
              </li>
              <li>Replace any [PLACEHOLDER] values with your specific details</li>
              <li>Review the output against the "What you will get" description</li>
              <li>
                Iterate: if the output misses something, refine the prompt and try
                again
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-2">
              Data classification reminder
            </h2>
            <p className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed">
              Before pasting any institutional data into an AI prompt, apply the
              three-tier data classification framework from Module 5. Tier 1
              (public) data can be used freely. Tier 2 (internal) requires a paid
              enterprise account with data protection commitments. Tier 3 (highly
              restricted) data — including PII, investigation files, and examination
              materials — should never be entered into any external AI tool.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
