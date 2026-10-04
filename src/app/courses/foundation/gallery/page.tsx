// /courses/foundation/gallery — server wrapper.
//
// Thin shell that owns Next.js metadata; rendering + filter state live in
// _client.tsx (added 2026-05-28 per the desktop audit's "add filters to
// the artifact gallery" recommendation).

import type { Metadata } from 'next';
import FoundationGalleryClient from './_client';

export const metadata: Metadata = {
  title: 'Gallery — AiBI-Foundation artifacts',
  description:
    'Anonymized examples of the artifacts community-bank learners produce in the AiBI-Foundation course — emails, SOPs, prompt cards, policy checklists.',
  alternates: { canonical: '/courses/foundation/gallery' },
};

export default function FoundationGalleryPage() {
  return <FoundationGalleryClient />;
}
