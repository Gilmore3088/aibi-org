// /courses/foundation/program/tool-guides — Platform deep-dive guides page.
//
// Server Component. Renders all 6 platform guides (ChatGPT, Claude,
// Copilot, Gemini, NotebookLM, Perplexity) inline from the canonical
// ALL_TOOL_GUIDES array. Each guide is rendered through the shared
// <ToolGuide> client component, which already drives its own collapsible
// accordion for getting-started / pricing / use-cases / data-safety / pro-tips.
//
// A top-of-page <ToolGuideFilter /> lets the banker pick a workflow
// ("drafting", "summarizing", "scenario-building", "chat") and dims
// platforms that don't fit — filter is reveal-by-use-case, not gate.
//
// Default order is set by ALL_TOOL_GUIDES in
// content/courses/foundation-program/tool-guides/index.ts. A future
// pass can apply contentRouting.getPlatformPriority(onboardingAnswers)
// to push the learner's institutional platform to the top.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { ToolGuide } from '../_components/ToolGuide';
import { getEnrollment } from '../_lib/getEnrollment';
import {
  ALL_TOOL_GUIDES,
  type PlatformId,
} from '@content/courses/foundation-program/tool-guides';
import {
  ToolGuideFilter,
  type UseCaseFilter,
} from './_local/ToolGuideFilter';

export const metadata: Metadata = {
  title: 'Platform Deep Dive Guides | AiBI-Foundation | The AI Banking Institute',
  description:
    'In-depth guides for the six AI platforms most relevant to community banking: ChatGPT, Claude, Microsoft Copilot, Google Gemini, NotebookLM, and Perplexity. Getting started, banking use cases, data safety, and pro tips.',
};

// Per-platform workflow tags — drive the filter. Sourced from each guide's
// bankingUseCases (the substantive content already on disk). Drafting,
// summarizing, scenario-building, and chat are the four buckets the
// banker thinks in; every platform is tagged for the buckets it serves.
const PLATFORM_TAGS: Readonly<Record<PlatformId, readonly UseCaseFilter[]>> = {
  chatgpt: ['drafting', 'summarizing', 'scenario-building', 'chat'],
  claude: ['drafting', 'summarizing', 'scenario-building'],
  copilot: ['drafting', 'summarizing', 'chat'],
  gemini: ['summarizing', 'scenario-building', 'chat'],
  notebooklm: ['summarizing'],
  perplexity: ['summarizing', 'chat'],
};

const kicker = {
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-deep)',
};

export default async function ToolGuidesPage() {
  // Platform deep-dive guides are part of the AiBI-Foundation lifetime-access
  // bundle. Non-enrolled visitors must hit the purchase page.
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Platform Guides']}>
      <header style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span style={kicker}>Deep dive · Platform reference</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
        </div>

        <h1
          style={{
            fontWeight: 700,
            fontSize: 'clamp(2.25rem, 4.6vw, 3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
            color: 'var(--ink)',
          }}
        >
          Pick the platform that fits the job.
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            lineHeight: 1.5,
            color: 'var(--slate-600)',
            margin: 0,
            maxWidth: '64ch',
          }}
        >
          Six platforms, end-to-end — built for community banking. Filter by
          the workflow you&rsquo;re trying to run, then expand a platform to see
          getting-started steps, pricing, banking use cases, custom
          instructions, data-safety guidance, and pro tips inline.
        </p>
      </header>

      {/* Top filter — reveals platforms by workflow */}
      <ToolGuideFilter platformTags={PLATFORM_TAGS} />

      {/* All 6 platforms — inline. ToolGuide handles its own accordion. */}
      <div data-tool-guides-root style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
        {ALL_TOOL_GUIDES.map((guide) => (
          <section
            key={guide.platformId}
            id={`guide-${guide.platformId}`}
            data-platform-id={guide.platformId}
            aria-labelledby={`heading-${guide.platformId}`}
          >
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 14,
                  marginBottom: 8,
                }}
              >
                <h2
                  id={`heading-${guide.platformId}`}
                  style={{
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    letterSpacing: '-0.02em',
                    color: 'var(--ink)',
                    margin: 0,
                  }}
                >
                  {guide.platformLabel}
                </h2>
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 1,
                    background: 'var(--ink-a10)',
                    alignSelf: 'center',
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: 'var(--slate-600)',
                  margin: 0,
                  maxWidth: '70ch',
                }}
              >
                <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>
                  You need this if:
                </strong>{' '}
                {guide.tagline}
              </p>
            </div>
            <ToolGuide guide={guide} />
          </section>
        ))}
      </div>

      {/* Footer guidance */}
      <footer
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: '1px solid var(--ink-a10)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
          }}
        >
          <div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'var(--ink)',
                margin: '0 0 8px',
              }}
            >
              How to use these guides
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--slate-600)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Open the section that matches your immediate need. Copy a prompt
              directly from any use case box and paste it into the platform.
              Start with the Free tier where available — every platform offers
              substantial capability before any payment is required.
            </p>
          </div>
          <div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'var(--ink)',
                margin: '0 0 8px',
              }}
            >
              Related course content
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { href: '/courses/foundation/program/3', label: 'Module 3 — What You Already Have + Activation' },
                { href: '/courses/foundation/program/4', label: 'Module 4 — Platform Features Deep Dive' },
                { href: '/dashboard/toolbox/library', label: 'Toolbox Library' },
              ].map((item) => (
                <li key={item.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: '1rem',
                      color: 'var(--gold-deep)',
                      textDecoration: 'underline',
                      textUnderlineOffset: 2,
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </CourseShellWrapper>
  );
}
