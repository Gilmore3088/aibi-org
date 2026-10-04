import type { MetadataRoute } from 'next';
import { PLAYBOOK_INDEX } from './playbooks/data';
import { TEMPLATES } from './resources/templates/data';
import { PLAYBOOK_ASSETS } from '@content/playbook-assets/data';
import { listAllBriefings } from '@content/briefings/_lib/registry';
import { listGuides } from '@content/guides/_lib/registry';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com';

// Date the static marketing pages' content was last reviewed. This is a fixed
// value on purpose: `new Date()` stamped every URL with the build time, so all
// 104 entries changed on every deploy and crawlers learned to ignore lastmod.
// Bump this when page copy changes in a way worth re-crawling. Briefings and
// guides carry their own dates below.
const STATIC_CONTENT_LAST_MODIFIED = '2026-10-04';

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
  { path: '/assessment', priority: 0.75, changeFrequency: 'monthly' as const },
  { path: '/assessment/in-depth', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/courses', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/for-institutions', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.65, changeFrequency: 'monthly' as const },
  { path: '/prompt-cards', priority: 0.65, changeFrequency: 'monthly' as const },
  {
    path: '/for-institutions/samples/efficiency-ratio-workbook',
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  },
  // The Foundation purchase page (/courses/foundation/program/purchase) is a
  // checkout surface and is intentionally NOT listed: sitemaps should list pages
  // meant to be found through search, and /courses is the marketing page for it.
  // /courses/foundation/program is auth-gated (307 → /auth/login) and excluded
  // for the same reason. Both stay crawlable; nothing is noindexed.
  {
    path: '/courses/foundation/gallery',
    priority: 0.72,
    changeFrequency: 'monthly' as const,
  },
  { path: '/security', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/security/data-handling', priority: 0.65, changeFrequency: 'monthly' as const },
  { path: '/security/it-approval', priority: 0.65, changeFrequency: 'monthly' as const },
  { path: '/certifications', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/verify', priority: 0.45, changeFrequency: 'monthly' as const },
  { path: '/resources', priority: 0.85, changeFrequency: 'weekly' as const },
  { path: '/resources/prompting-foundation', priority: 0.72, changeFrequency: 'monthly' as const },
  { path: '/playbooks', priority: 0.8, changeFrequency: 'monthly' as const },
  ...PLAYBOOK_INDEX.map((playbook) => ({
    path: `/playbooks/${playbook.slug}`,
    priority: 0.72,
    changeFrequency: 'monthly' as const,
  })),
  ...PLAYBOOK_ASSETS.map((asset) => ({
    path: `/playbooks/${asset.playbook}/${asset.slug}`,
    priority: 0.62,
    changeFrequency: 'monthly' as const,
  })),
  ...TEMPLATES.map((template) => ({
    path: `/resources/templates/${template.slug}`,
    priority: 0.68,
    changeFrequency: 'monthly' as const,
  })),

  // Artifact Library + every published essay (consolidated from /research,
  // 2026-06-01). Legacy /research and /research/* URLs permanently redirect
  // to /resources/* via next.config; only canonical /resources/* ship here.
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date(`${STATIC_CONTENT_LAST_MODIFIED}T12:00:00Z`);
  const staticEntries = ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Briefings come from the filesystem registry so new MDX posts are indexed
  // without touching this file. Legacy essays (href under /resources) are
  // already in ROUTES above and are filtered out here to avoid duplicates.
  const briefings = await listAllBriefings();
  const briefingEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/briefings`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    ...briefings
      .filter((b) => b.href.startsWith('/briefings/'))
      .map((b) => ({
        url: `${SITE_URL}${b.href}`,
        lastModified: new Date(`${b.date}T12:00:00Z`),
        changeFrequency: 'monthly' as const,
        priority: b.tier === 'deep-dive' ? 0.8 : 0.7,
      })),
  ];

  // Guides: evergreen search-intent pages. lastModified tracks the guide's
  // own review date so crawlers re-fetch only what actually changed.
  const guides = await listGuides();
  const guideEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/guides`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(`${g.updated}T12:00:00Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];

  return [...staticEntries, ...briefingEntries, ...guideEntries];
}
