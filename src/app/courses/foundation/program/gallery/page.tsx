// /courses/foundation/program/gallery — Browsable gallery of exemplary AI outputs by role
// Server Component shell with client-side role filtering

import type { Metadata } from 'next';
import Link from 'next/link';
import { OutputGalleryClient } from './OutputGalleryClient';

export const metadata: Metadata = {
  title: 'Output Gallery | AiBI-Foundation | The AI Banking Institute',
  description:
    'See what excellent AI outputs look like in every banking department. Role-specific examples from lending, operations, compliance, finance, marketing, and IT. Part of the AiBI-Foundation course.',
};

export default function OutputGalleryPage() {
  return (
    <div className="mx-auto px-8 lg:px-16 py-16">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
          <li>
            <Link
              href="/courses/foundation/program"
              className="hover:text-[color:var(--color-terra)] transition-colors"
            >
              AiBI-Foundation
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[color:var(--color-ink)]">Output Gallery</li>
        </ol>
      </nav>

      {/* Page header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-terra)]">
            Reference
          </span>
          <div className="h-px w-8 bg-[color:var(--color-terra)]/30" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-slate)]">
            Exemplary Outputs
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-4">
          Output Gallery
        </h1>

        <p className="font-sans text-base text-[color:var(--color-ink)]/80 leading-relaxed max-w-2xl">
          Excellence is recognizable before you can describe it. This gallery shows what
          institutional-grade AI output looks like across six banking departments — from
          loan file checklists to board memos to SAR narrative drafts.
        </p>

        <p className="font-sans text-sm text-[color:var(--color-slate)] mt-3 leading-relaxed max-w-2xl">
          Each example was produced using the skills, platforms, and prompting patterns
          taught in AiBI-Foundation. Study the quality markers — they are the same criteria your
          capstone submission will be evaluated against.
        </p>

        {/* Callout — how to use this gallery */}
        <div
          className="mt-6 border-l-2 border-[color:var(--color-terra)] pl-4 py-1"
          role="note"
          aria-label="How to use this gallery"
        >
          <p className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed">
            <strong className="font-bold text-[color:var(--color-ink)]">How to use this gallery:</strong>{' '}
            Filter to your role, expand an example, and read the &ldquo;What Makes This
            Effective&rdquo; section before producing your own output. Then compare. The
            quality markers are specific — not generic praise.
          </p>
        </div>
      </header>

      {/* Client-side filtered gallery */}
      <OutputGalleryClient />
    </div>
  );
}
