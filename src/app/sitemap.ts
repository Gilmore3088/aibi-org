import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com';

// Only canonical, non-redirected, publicly-marketable routes. Routes that
// 301 elsewhere (handled by next.config.mjs) are intentionally excluded so
// search engines index the destination directly.
//
// `aibi-s` and `aibi-l` are soft-hidden per the 2026-05-05 product
// simplification — they redirect to /education and their Stripe products
// are deactivated. Keep them out of the sitemap until they relaunch.
const ROUTES = [
  // Marquee marketing pages
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/assessment/start', priority: 0.95, changeFrequency: 'monthly' as const },
  { path: '/assessment', priority: 0.75, changeFrequency: 'monthly' as const },
  { path: '/assessment/in-depth', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/education', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/for-institutions', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/for-institutions/advisory', priority: 0.75, changeFrequency: 'monthly' as const },
  {
    path: '/for-institutions/samples/efficiency-ratio-workbook',
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  },
  // Foundation course purchase page — public (no auth gate), the Stripe checkout
  // surface. /courses/foundation/program itself is auth-gated (307 → /auth/login)
  // and is intentionally excluded so search engines don't index login redirects.
  // /courses/foundation-preview is also excluded — it carries `robots: noindex`.
  {
    path: '/courses/foundation/program/purchase',
    priority: 0.85,
    changeFrequency: 'monthly' as const,
  },
  { path: '/security', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.75, changeFrequency: 'monthly' as const },

  // Research hub + every published essay (resources/* will migrate to
  // research/* in Phase 07; both URL families stay indexable until then).
  { path: '/research', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/resources/the-widening-ai-gap', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/resources/members-will-switch', priority: 0.8, changeFrequency: 'monthly' as const },
  {
    path: '/resources/six-ways-ai-fails-in-banking',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/resources/ai-governance-without-the-jargon',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/resources/the-skill-not-the-prompt',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/resources/what-your-efficiency-ratio-is-hiding',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },

  // Compliance / informational — low priority but indexable so search
  // engines can answer policy queries directly.
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/ai-use-disclaimer', priority: 0.3, changeFrequency: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
