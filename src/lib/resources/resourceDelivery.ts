// resourceDelivery — resolve a free resource slug to an absolute, emailable
// download link.
//
// Used by the email-capture flows (/api/capture-email research path and
// /api/inquiry guide/playbook requests) so a requested artifact actually lands
// in the requester's inbox, not only as a transient browser download.
//
// Only free, email-gated resources are link-deliverable. Gated/paid resources
// require an authenticated entitlement and must never be handed out via an
// unauthenticated link.

import { getFreeResource, type FreeResource } from './freeResources';

// Canonical public origin used in transactional email links. Matches the base
// used by the Resend templates (non-www apex).
const SITE_URL = 'https://aibankinginstitute.com';

export interface DeliverableResource {
  readonly slug: string;
  readonly title: string;
  /** Absolute https URL the recipient can click to download the file. */
  readonly downloadUrl: string;
}

function downloadPath(resource: FreeResource): string {
  // Most resources expose a direct API download as their canonical route
  // (e.g. /api/resources/<slug>/download, /api/guides/safe-ai-use). When the
  // canonical route is a content page instead (templates), fall back to the
  // generic by-slug download endpoint, which serves the committed file.
  if (resource.canonicalRoute.startsWith('/api/')) return resource.canonicalRoute;
  return `/api/resources/${resource.slug}/download`;
}

export function resolveDeliverableResource(
  slug: string | null | undefined,
): DeliverableResource | null {
  if (!slug) return null;
  const resource = getFreeResource(slug);
  if (!resource || resource.status !== 'public' || !resource.download) return null;
  // Free-tier only — link delivery is unauthenticated.
  if (resource.download.tierRequired !== 'free') return null;
  return {
    slug: resource.slug,
    title: resource.title,
    downloadUrl: `${SITE_URL}${downloadPath(resource)}`,
  };
}
