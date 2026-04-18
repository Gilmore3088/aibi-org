// ModuleHeader — AiBI-P wrapper around shared CourseHeader
// Server Component: no interactivity needed

import { PILLAR_META } from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';
import { CourseHeader } from '@/components/courses/CourseHeader';

interface ModuleHeaderProps {
  readonly moduleNumber: number;
  readonly title: string;
  readonly pillar: Pillar;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
}

export function ModuleHeader({
  moduleNumber,
  title,
  pillar,
  estimatedMinutes,
  keyOutput,
}: ModuleHeaderProps) {
  const meta = PILLAR_META[pillar];

  return (
    <CourseHeader
      unitLabel="Module"
      unitNumber={moduleNumber}
      title={title}
      accentColor={meta.colorVar}
      meta={[
        { label: 'time', value: `${estimatedMinutes} min` },
        { label: 'output', value: keyOutput },
        { label: 'pillar', value: meta.label },
      ]}
    />
  );
}
