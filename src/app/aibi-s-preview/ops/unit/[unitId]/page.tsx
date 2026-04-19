import { notFound } from 'next/navigation';
import { opsUnits } from '../../../../../../content/courses/aibi-s/ops';
import { UnitRenderer } from './_components/UnitRenderer';

interface UnitPageProps {
  readonly params: { readonly unitId: string };
}

export default function UnitPage({ params }: UnitPageProps) {
  const unit = opsUnits[params.unitId as keyof typeof opsUnits];
  if (!unit) return notFound();
  return <UnitRenderer unit={unit} />;
}
