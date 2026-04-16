'use client';

// ModuleContentClient — top-level client wrapper for interactive module content.
// Owns moduleComplete state shared between ActivitySection (setter) and ModuleNavigation (reader).
// Rendered by the server ModulePage to bridge server-fetched data to client interactivity.

import { useState } from 'react';
import type { Activity, ContentTable } from '@content/courses/aibi-p';
import type { LearnerRole } from '@/types/course';
import { ActivitySection } from './ActivitySection';
import { ModuleNavigation } from './ModuleNavigation';

export interface ModuleContentClientProps {
  readonly activities: readonly Activity[];
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponses: Record<string, Record<string, string>>;
  readonly isLastModule: boolean;
  readonly isAlreadyCompleted: boolean;
  readonly tables?: readonly ContentTable[];
  readonly learnerRole?: LearnerRole;
}

export function ModuleContentClient({
  activities,
  enrollmentId,
  moduleNumber,
  existingResponses,
  isLastModule,
  isAlreadyCompleted,
  tables,
  learnerRole,
}: ModuleContentClientProps) {
  const [moduleComplete, setModuleComplete] = useState(isAlreadyCompleted);

  const handleAllActivitiesComplete = () => {
    setModuleComplete(true);
  };

  return (
    <>
      {activities.length > 0 && (
        <ActivitySection
          activities={activities}
          enrollmentId={enrollmentId}
          moduleNumber={moduleNumber}
          existingResponses={existingResponses}
          isLastModule={isLastModule}
          onAllActivitiesComplete={handleAllActivitiesComplete}
          tables={tables}
          learnerRole={learnerRole}
        />
      )}

      <ModuleNavigation
        moduleNumber={moduleNumber}
        isLastModule={isLastModule}
        moduleComplete={moduleComplete}
      />
    </>
  );
}
