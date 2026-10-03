import { OG_SIZE, renderArticleCard } from '@/lib/og/articleCard';
import { PLAYBOOKS, type RoleSlug } from '../data';

// Per-role link preview for the role playbooks.
export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'AiBI role playbook';

export default async function PlaybookOgImage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const pb = PLAYBOOKS[role as RoleSlug];
  return renderArticleCard({
    kicker: pb ? pb.eyebrow : 'Role playbooks',
    title: pb ? pb.title : 'A playbook for every seat at the bank.',
    footer: pb ? `${pb.uses.length} use cases · ${pb.ops.length}-step workflow · free` : 'Nine roles · free',
  });
}
