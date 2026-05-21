// Schema.org JSON-LD for the Foundation course overview page.
// Emitted in <script type="application/ld+json"> at page top.

import { courseJsonLd } from '@/lib/seo/jsonld';

export const FOUNDATION_COURSE_JSONLD = courseJsonLd({
  name: 'AiBI-Foundation — AI Banking for Community Financial Institutions',
  description:
    'AiBI-Foundation teaches every staff member at a community bank or credit union how to use AI tools safely, professionally, and with regulatory confidence. 12 modules covering Awareness, Understanding, Creation, and Application of AI for community banking work.',
  slug: '/courses/foundation/program',
  modules: 12,
  hours: 7,
  priceUSD: 295,
});
