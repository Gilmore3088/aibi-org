import { loadBriefing } from '@content/briefings/_lib/registry';
import { OG_SIZE, renderArticleCard } from '@/lib/og/articleCard';
import { formatDate } from '../covers';

// Per-briefing link preview: the headline as people will see it shared.
export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'AiBI briefing';

export default async function BriefingOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = await loadBriefing(slug);
  if (!mod) {
    return renderArticleCard({ kicker: 'Briefings', title: 'AI briefings for community banks and credit unions.', footer: 'AiBI Research Desk' });
  }
  const { meta } = mod;
  return renderArticleCard({
    kicker: `${meta.category} · ${formatDate(meta.date)}`,
    title: meta.title,
    footer: `${meta.author ?? 'AiBI Research Desk'}${meta.readMinutes ? ` · ${meta.readMinutes} min read` : ''}`,
  });
}
