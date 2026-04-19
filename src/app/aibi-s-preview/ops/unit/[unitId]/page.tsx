import { notFound } from 'next/navigation';
import { opsUnits } from '../../../../../../content/courses/aibi-s/ops';
import { aibiSConfig } from '@/../content/courses/aibi-s/course.config';
import { mergeProgress } from '@/lib/course-harness/merge';
import { findItem, findSectionOf } from '@/lib/course-harness/lookup';
import { fetchAibiSProgress } from '../../../_lib/progress';
import { UnitRenderer } from './_components/UnitRenderer';

interface UnitPageProps {
  readonly params: { readonly unitId: string };
}

export default async function UnitPage({ params }: UnitPageProps) {
  const unit = opsUnits[params.unitId as keyof typeof opsUnits];
  if (!unit) return notFound();

  const progress = await fetchAibiSProgress();
  const view = mergeProgress(aibiSConfig, progress);
  const itemId = `u-${params.unitId}`;
  const item = findItem(view, itemId);
  const section = findSectionOf(view, itemId);
  if (!item || !section) return notFound();

  return (
    <UnitRenderer
      unit={unit}
      resolvedItem={item}
      resolvedSection={section}
      config={view.config}
    />
  );
}
