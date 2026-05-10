import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';

const ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/assessment/start', priority: 0.95, changeFrequency: 'monthly' as const },
  { path: '/assessment', priority: 0.75, changeFrequency: 'monthly' as const },
  { path: '/education', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/for-institutions', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/for-institutions/advisory', priority: 0.75, changeFrequency: 'monthly' as const },
  { path: '/for-institutions/samples/efficiency-ratio-workbook', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/courses/foundations', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/courses/aibi-s', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/courses/aibi-l', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/security', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.75, changeFrequency: 'monthly' as const },
  { path: '/resources', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/resources/the-widening-ai-gap', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/resources/members-will-switch', priority: 0.8, changeFrequency: 'monthly' as const },
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
