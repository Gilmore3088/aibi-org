// /courses/foundation/program/tool-guides — Platform deep-dive guides page
// Server Component: lists all platform guides with client-rendered ToolGuide accordions.
// Currently covers: NotebookLM, Perplexity
// Designed to expand as additional platforms are added to tool-guides-*.ts files.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CourseShellWrapper } from "@/components/lms/CourseShellWrapper";
import { ToolGuide } from '../_components/ToolGuide';
import { getEnrollment } from '../_lib/getEnrollment';
import {
  notebooklmGuide,
  perplexityGuide,
  ALL_TOOL_GUIDES,
} from '@content/courses/foundation-program/tool-guides-notebooklm-perplexity';

export const metadata: Metadata = {
  title: 'Platform Deep Dive Guides | AiBI-Foundation | The AI Banking Institute',
  description:
    'In-depth guides for NotebookLM and Perplexity — two high-value AI platforms for community banking professionals. Getting started, banking use cases, data safety, and pro tips.',
};

// Platform nav items for jump links
const PLATFORMS = ALL_TOOL_GUIDES.map((g) => ({
  id: g.platformId,
  label: g.platformLabel,
  colorVar: g.colorVar,
}));

export default async function ToolGuidesPage() {
  // Platform deep-dive guides are part of the AiBI-Foundation lifetime-access
  // bundle. Non-enrolled visitors must hit the purchase page.
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Platform Guides']}>
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ledger-accent)',
            }}
          >
            Deep Dive · Platform Reference
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--ledger-rule)' }} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontWeight: 500,
            fontSize: 'clamp(40px, 5vw, 60px)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
            color: 'var(--ledger-ink)',
          }}
        >
          Platform Deep Dive{' '}
          <em style={{ color: 'var(--ledger-accent)', fontStyle: 'normal', fontWeight: 500 }}>
            Guides.
          </em>
        </h1>

        <p
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontStyle: 'italic',
            fontSize: 20,
            lineHeight: 1.45,
            color: 'var(--ledger-ink-2)',
            margin: '0 0 12px',
            maxWidth: '60ch',
          }}
        >
          The platforms most valuable to community banking, end-to-end.
        </p>
        <p
          style={{
            color: 'var(--ledger-slate)',
            fontSize: 14.5,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '64ch',
          }}
        >
          Each guide covers getting started, free vs. paid decisions, five banking
          use cases with copy-paste prompts, custom instructions, data safety for
          institutional use, and five pro tips. Use these as reference alongside
          Module 3 (First Try) and Module 4 (Platform Features Deep Dive).
        </p>
      </header>

      {/* Platform jump navigation */}
      <nav
        className="flex flex-wrap gap-2 mb-10 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm"
        aria-label="Jump to platform"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] self-center mr-2">
          Jump to:
        </span>
        {PLATFORMS.map((p) => (
          <a
            key={p.id}
            href={`#guide-${p.id}`}
            className="inline-flex items-center px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-sm text-[color:var(--color-linen)] transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1"
            style={{ backgroundColor: p.colorVar }}
          >
            {p.label}
          </a>
        ))}
      </nav>

      {/* Guide sections */}
      <div className="space-y-16">

        {/* NotebookLM */}
        <section id={`guide-${notebooklmGuide.platformId}`} aria-labelledby="heading-notebooklm">
          <div className="flex items-center gap-4 mb-5">
            <h2
              id="heading-notebooklm"
              className="font-serif text-2xl font-bold text-[color:var(--color-ink)]"
            >
              NotebookLM
            </h2>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: notebooklmGuide.colorVar, opacity: 0.3 }}
              aria-hidden="true"
            />
          </div>
          <ToolGuide guide={notebooklmGuide} />
        </section>

        {/* Perplexity */}
        <section id={`guide-${perplexityGuide.platformId}`} aria-labelledby="heading-perplexity">
          <div className="flex items-center gap-4 mb-5">
            <h2
              id="heading-perplexity"
              className="font-serif text-2xl font-bold text-[color:var(--color-ink)]"
            >
              Perplexity
            </h2>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: perplexityGuide.colorVar, opacity: 0.3 }}
              aria-hidden="true"
            />
          </div>
          <ToolGuide guide={perplexityGuide} />
        </section>

      </div>

      {/* Footer guidance */}
      <footer className="mt-16 pt-8 border-t border-[color:var(--color-parch-dark)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h2 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-2">
              How to use these guides
            </h2>
            <p className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed">
              Open a section that matches your immediate need. Copy a prompt directly from
              any use case box and paste it into the platform. Start with the Free tier —
              both platforms offer substantial capability before any payment is required.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-2">
              Related course content
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses/foundation/program/3"
                  className="font-sans text-sm text-[color:var(--color-terra)] hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
                >
                  Module 3 — What You Already Have + Activation
                </Link>
              </li>
              <li>
                <Link
                  href="/courses/foundation/program/4"
                  className="font-sans text-sm text-[color:var(--color-terra)] hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
                >
                  Module 4 — Platform Features Deep Dive
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/toolbox/library"
                  className="font-sans text-sm text-[color:var(--color-terra)] hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
                >
                  Toolbox Library
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </CourseShellWrapper>
  );
}
