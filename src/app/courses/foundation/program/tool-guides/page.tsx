// /courses/foundation/program/tool-guides — Platform deep-dive guides page.
//
// Server Component. Renders all 6 platform guides (ChatGPT, Claude,
// Copilot, Gemini, NotebookLM, Perplexity) from the canonical
// ALL_TOOL_GUIDES array. Each guide is rendered through the shared
// <ToolGuide> client component.
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
import { ALL_TOOL_GUIDES } from '@content/courses/foundation-program/tool-guides';

export const metadata: Metadata = {
  title: 'Platform Deep Dive Guides | AiBI-Foundation | The AI Banking Institute',
  description:
    'In-depth guides for the six AI platforms most relevant to community banking: ChatGPT, Claude, Microsoft Copilot, Google Gemini, NotebookLM, and Perplexity. Getting started, banking use cases, data safety, and pro tips.',
};

const kicker = {
  fontSize: 11,
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
      <header style={{ marginBottom: 40 }}>
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
            fontSize: 'clamp(36px, 4.6vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
            color: 'var(--ink)',
          }}
        >
          Platform deep-dive guides
        </h1>

        <p
          style={{
            fontSize: 19,
            lineHeight: 1.45,
            color: 'var(--slate-600)',
            margin: '0 0 12px',
            maxWidth: '60ch',
          }}
        >
          Six platforms, end-to-end — built for community banking.
        </p>
        <p
          style={{
            color: 'var(--slate-600)',
            fontSize: 15,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '64ch',
          }}
        >
          Each guide covers getting started, pricing tiers with banking
          verdicts, five banking use cases with copy-paste prompts,
          custom-instruction templates, data safety for institutional
          use, and five pro tips. Use these as reference alongside
          Module 3 (First Try) and Module 4 (Platform Features Deep
          Dive).
        </p>
      </header>

      {/* Platform jump navigation */}
      <nav
        aria-label="Jump to platform"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 40,
          padding: 16,
          background: 'var(--cream-2)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
        }}
      >
        <span
          style={{
            ...kicker,
            alignSelf: 'center',
            marginRight: 6,
            color: 'var(--slate-500)',
          }}
        >
          Jump to:
        </span>
        {ALL_TOOL_GUIDES.map((g) => (
          <a
            key={g.platformId}
            href={`#guide-${g.platformId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              borderRadius: 999,
              background: 'var(--ink)',
              color: 'var(--cream-2)',
              textDecoration: 'none',
            }}
          >
            {g.platformLabel}
          </a>
        ))}
      </nav>

      {/* Guide sections — one per platform from ALL_TOOL_GUIDES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        {ALL_TOOL_GUIDES.map((guide) => (
          <section
            key={guide.platformId}
            id={`guide-${guide.platformId}`}
            aria-labelledby={`heading-${guide.platformId}`}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
              }}
            >
              <h2
                id={`heading-${guide.platformId}`}
                style={{
                  fontWeight: 700,
                  fontSize: 26,
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
                }}
              />
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
                fontSize: 18,
                color: 'var(--ink)',
                margin: '0 0 8px',
              }}
            >
              How to use these guides
            </h2>
            <p
              style={{
                fontSize: 14,
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
                fontSize: 18,
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
                      fontSize: 14,
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
