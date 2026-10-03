// Public Module 1 preview — /courses/foundation/preview
//
// Try-before-buy, kept short: Module 1's real core idea, its real decision
// drill, and the artifact it saves — each shown once, all pulled from the
// course content so the preview cannot drift from what learners get.
// Deliberately a separate route from /courses/foundation/program/[module];
// the enrollment gate there is untouched.

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero } from '@/components/ax';
import {
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
  foundationCourseConfig,
  getArtifactFirst,
  getModuleByNumber,
} from '@content/courses/foundation-program';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { KnowledgeCheck } from '../program/_components/KnowledgeCheck';

const PREVIEW_MODULE_NUMBER = 1;

export const metadata: Metadata = {
  alternates: { canonical: '/courses/foundation/preview' },
  title: 'Free Preview — Module 1 | AiBI Foundation',
  description:
    'Try Module 1 of the AiBI Foundation course free: the core idea, the decision drill, and the card it saves.',
};

export default function FoundationPreviewPage() {
  const expandedModule = V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(PREVIEW_MODULE_NUMBER);
  const mod = getModuleByNumber(PREVIEW_MODULE_NUMBER);
  const totalModules = foundationCourseConfig.modules.length;
  const brief = getFoundationLabBrief(PREVIEW_MODULE_NUMBER);
  const artifact = getArtifactFirst(PREVIEW_MODULE_NUMBER);

  return (
    <div
      className="mockup-scope ax-page pv-page"
      style={
        {
          // KnowledgeCheck's small labels need the darker gold/slate on cream (WCAG AA).
          '--gold-deep': '#7a5f1e',
          '--slate-500': '#475569',
        } as React.CSSProperties
      }
    >
      <SiteHeader
        activePath="/courses"
        cta={{ label: 'Enroll · $295', href: '/courses/foundation/program/purchase' }}
      />

      <AxHero
        cmd={`courses/foundation --preview module-01 of ${totalModules}`}
        title={mod?.title ?? 'What AI Can and Cannot Do'}
        lede={expandedModule?.goal}
        actions={
          <Button variant="gold" size="lg" href="#pv-idea">
            Start the preview <ArrowGlyph />
          </Button>
        }
      />

      <main>
        {brief && (
          <section id="pv-idea" className="ax-section ax-light pv-idea" aria-label="The idea">
            <div className="mk-container">
              <p className="ax-k">The idea</p>
              <p className="pv-idea-text">{brief.concept}</p>
              <ol className="pv-flow" aria-label="The model you practice">
                {brief.visualModel.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {brief?.decisionDrill && (
          <section id="pv-try" className="ax-section pv-try" aria-label="Try it" data-testid="preview-try">
            <div className="mk-container">
              <KnowledgeCheck
                prompt="Which is the safer way to use AI here?"
                options={brief.decisionDrill.options}
                kicker="Try it now — same drill as the course"
              />
            </div>
          </section>
        )}

        <section
          className="ax-section ax-light ax-close"
          aria-label="Enroll in the full course"
          data-testid="preview-save"
        >
          <div className="mk-container">
            {artifact && (
              <p className="ax-k">
                Module 1 saves your {artifact.saved}
              </p>
            )}
            <h2 className="ax-display">
              {totalModules - 1} more modules. <span className="ax-gold">One packet.</span>
            </h2>
            <div className="ax-actions" style={{ justifyContent: 'center' }}>
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll in Foundation · $295
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses">
                Back to the course
              </Button>
            </div>
          </div>
        </section>
      </main>

      <div data-testid="preview-sticky-enroll" className="pv-sticky">
        <span>Free Module 1 preview</span>
        <Link href="/courses/foundation/program/purchase">Enroll · $295</Link>
      </div>
    </div>
  );
}
