import { OG_SIZE, renderArticleCard } from '@/lib/og/articleCard';

// Default Open Graph image — 1200×630, served at /opengraph-image (Next.js
// convention). Same card as briefings and playbooks so every shared link
// reads as one brand.
export const runtime = 'nodejs';
export const alt = 'The AI Banking Institute — Turning Bankers into Builders';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return renderArticleCard({
    kicker: 'AI proficiency for community banks & credit unions',
    title: 'Turning bankers into builders.',
    footer: 'Assessment · Foundation course · Role playbooks',
  });
}
