// Schema.org JSON-LD for the Foundation course overview page.
// Emitted in <script type="application/ld+json"> at page top.

import { courseJsonLd } from '@/lib/seo/jsonld';
import { foundationCourseConfig, getFoundationTrainingRecord } from '@content/courses/foundation-program';

export const FOUNDATION_COURSE_JSONLD = courseJsonLd({
  name: 'AiBI-Foundation — AI Banking for Community Financial Institutions',
  description:
    'AiBI-Foundation teaches community bank and credit union employees how to use AI safely through bite-sized labs for prompts, reusable skills, workflow checkpoints, and reviewable evidence.',
  slug: '/courses/foundation/program',
  modules: foundationCourseConfig.modules.length,
  hours: getFoundationTrainingRecord().hours,
  priceUSD: 295,
});
