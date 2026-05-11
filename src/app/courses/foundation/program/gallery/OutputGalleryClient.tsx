'use client';

// OutputGalleryClient — filterable gallery of exemplary AI output examples
// Allows filtering by banking role. Renders OutputExampleCard for each result.

import { useState, useMemo } from 'react';
import type { PromptRole } from '@content/courses/foundation-program/prompt-library';
import {
  OUTPUT_EXAMPLES,
  OUTPUT_ROLE_META,
  GALLERY_ROLE_OPTIONS,
  filterOutputExamples,
} from '@content/courses/foundation-program/output-examples';
import { OutputExampleCard } from '../_components/OutputExample';

type RoleFilter = PromptRole | 'all';

const ROLE_FILTER_OPTIONS: readonly { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  ...GALLERY_ROLE_OPTIONS.map((role) => ({
    value: role,
    label: OUTPUT_ROLE_META[role].label,
  })),
];

export function OutputGalleryClient() {
  const [activeRole, setActiveRole] = useState<RoleFilter>('all');

  const filtered = useMemo(() => {
    return filterOutputExamples(activeRole === 'all' ? undefined : activeRole);
  }, [activeRole]);

  const totalCount = OUTPUT_EXAMPLES.length;

  return (
    <div className="space-y-8">
      {/* Role filter pills */}
      <div
        className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-4"
        role="group"
        aria-label="Filter by role"
      >
        <div className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--color-slate)] mb-3">
          Filter by Role
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTER_OPTIONS.map((opt) => {
            const isActive = activeRole === opt.value;
            const roleMeta =
              opt.value !== 'all' ? OUTPUT_ROLE_META[opt.value as PromptRole] : null;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActiveRole(opt.value)}
                aria-pressed={isActive}
                className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--color-terra)]"
                style={
                  isActive
                    ? {
                        backgroundColor: roleMeta
                          ? roleMeta.colorVar
                          : 'var(--color-terra)',
                        color: 'var(--color-linen)',
                        border: '1px solid transparent',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'var(--color-ink)',
                        border: '1px solid var(--color-parch-dark)',
                      }
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 font-mono text-[11px] text-[color:var(--color-slate)]">
          Showing {filtered.length} of {totalCount} examples
        </p>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-sans text-sm text-[color:var(--color-slate)]">
            No examples match the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((example) => (
            <OutputExampleCard key={example.id} example={example} />
          ))}
        </div>
      )}
    </div>
  );
}
