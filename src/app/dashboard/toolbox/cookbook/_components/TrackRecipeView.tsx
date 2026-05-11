'use client';

import { useEffect } from 'react';
interface TrackRecipeViewProps {
  readonly slug: string;
}

export function TrackRecipeView({ slug }: TrackRecipeViewProps): null {
  useEffect(() => {
  }, [slug]);

  return null;
}
