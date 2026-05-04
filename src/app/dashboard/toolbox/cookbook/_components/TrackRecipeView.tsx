'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/plausible';

interface TrackRecipeViewProps {
  readonly slug: string;
}

export function TrackRecipeView({ slug }: TrackRecipeViewProps): null {
  useEffect(() => {
    trackEvent('cookbook_recipe_viewed', { slug });
  }, [slug]);

  return null;
}
