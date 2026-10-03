// Public Module 1 preview — /courses/foundation/preview
//
// Try-before-buy: Module 1's real build, free. The visitor leaves with a
// working tool (house rules in their own AI tool), rendered from the same
// course data paid learners see, so the preview cannot drift from it.
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
import { MICRO_MODULES_BY_NUMBER } from '@content/courses/foundation-program/micro-modules';
import { BuildGuide } from '@/components/courses/BuildGuide';

const PREVIEW_MODULE_NUMBER = 1;

export const metadata: Metadata = {
  alternates: { canonical: '/courses/foundation/preview' },
  title: 'Free Preview — Module 1 | AiBI Foundation',
  description:
    'Build Module 1 of the AiBI Foundation course free: house rules that make your AI tool flag customer data and mark every answer as a draft.',
};

export default function FoundationPreviewPage() {
  const expandedModule = V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(PREVIEW_MODULE_NUMBER);
  const mod = getModuleByNumber(PREVIEW_MODULE_NUMBER);
  const totalModules = foundationCourseConfig.modules.length;
  const build = MICRO_MODULES_BY_NUMBER.get(PREVIEW_MODULE_NUMBER)?.build;
  const artifact = getArtifactFirst(PREVIEW_MODULE_NUMBER);

  return (
    <div
      className="mockup-scope ax-page pv-page"
      style={
        {
          // The build guide's small labels need the darker gold/slate on cream (WCAG AA).
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
          <Button variant="gold" size="lg" href="#pv-build">
            Build it now, free <ArrowGlyph />
          </Button>
        }
      />

      <main>
        {build && (
          <section id="pv-build" className="ax-section ax-light pv-build" aria-label="Module 1 build" data-testid="preview-build">
            <div className="mk-container">
              <BuildGuide build={build} />
            </div>
          </section>
        )}

        <section
          className="ax-section ax-light is-paper ax-close"
          aria-label="Enroll in the full course"
          data-testid="preview-save"
        >
          <div className="mk-container">
            {artifact && (
              <p className="ax-k">
                You just built your {artifact.saved}
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
