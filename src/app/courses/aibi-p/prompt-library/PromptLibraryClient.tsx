'use client';

// PromptLibraryClient — filterable prompt browser for the AiBI-P prompt library
// Allows filtering by platform, role, and difficulty. Renders PromptCard for each result.

import { useState, useMemo } from 'react';
import type {
  PromptPlatform,
  PromptRole,
  PromptDifficulty,
  ContentLevel,
} from '@content/courses/aibi-p/prompt-library';
import {
  ALL_PROMPTS,
  PLATFORM_META,
  ROLE_LABELS,
  DIFFICULTY_LABELS,
  filterPrompts,
} from '@content/courses/aibi-p/prompt-library';
import { PromptCard } from '../_components/PromptCard';

type FilterValue<T> = T | 'all';

const PLATFORM_OPTIONS: readonly { value: FilterValue<PromptPlatform>; label: string }[] = [
  { value: 'all', label: 'All Platforms' },
  ...Object.entries(PLATFORM_META).map(([key, meta]) => ({
    value: key as PromptPlatform,
    label: meta.label,
  })),
];

const ROLE_OPTIONS: readonly { value: FilterValue<PromptRole>; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  ...Object.entries(ROLE_LABELS).map(([key, label]) => ({
    value: key as PromptRole,
    label,
  })),
];

const DIFFICULTY_OPTIONS: readonly { value: FilterValue<PromptDifficulty>; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  ...Object.entries(DIFFICULTY_LABELS).map(([key, label]) => ({
    value: key as PromptDifficulty,
    label,
  })),
];

interface PromptLibraryClientProps {
  readonly userLevel?: ContentLevel | null;
}

export function PromptLibraryClient({ userLevel = null }: PromptLibraryClientProps) {
  const [platform, setPlatform] = useState<FilterValue<PromptPlatform>>('all');
  const [role, setRole] = useState<FilterValue<PromptRole>>('all');
  const [difficulty, setDifficulty] = useState<FilterValue<PromptDifficulty>>('all');

  const filtered = useMemo(() => {
    return filterPrompts({
      platform: platform === 'all' ? undefined : platform,
      role: role === 'all' ? undefined : role,
      difficulty: difficulty === 'all' ? undefined : difficulty,
    });
  }, [platform, role, difficulty]);

  const totalCount = ALL_PROMPTS.length;

  return (
    <div className="space-y-8">
      {/* Filter controls */}
      <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FilterSelect
            label="Platform"
            value={platform}
            options={PLATFORM_OPTIONS}
            onChange={(v) => setPlatform(v as FilterValue<PromptPlatform>)}
          />
          <FilterSelect
            label="Role"
            value={role}
            options={ROLE_OPTIONS}
            onChange={(v) => setRole(v as FilterValue<PromptRole>)}
          />
          <FilterSelect
            label="Difficulty"
            value={difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={(v) => setDifficulty(v as FilterValue<PromptDifficulty>)}
          />
        </div>

        <p className="mt-3 font-mono text-[11px] text-[color:var(--color-dust)]">
          Showing {filtered.length} of {totalCount} prompts
          {filtered.some((p) => p.requiredLevel) && (
            <span className="ml-2" style={{ color: 'var(--color-terra)' }}>
              · {filtered.filter((p) => p.requiredLevel).length} require higher certification
            </span>
          )}
        </p>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-sans text-sm text-[color:var(--color-dust)]">
            No prompts match the selected filters. Try adjusting your selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} userLevel={userLevel} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterSelect — reusable select for filter controls
// ---------------------------------------------------------------------------

interface FilterSelectProps {
  readonly label: string;
  readonly value: string;
  readonly options: readonly { value: string; label: string }[];
  readonly onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--color-dust)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm font-sans bg-[color:var(--color-linen)] border border-[color:var(--color-parch-dark)] rounded-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
