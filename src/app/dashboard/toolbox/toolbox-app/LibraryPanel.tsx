'use client';

import type { ToolboxSkill, ToolboxSkillTemplate } from '@/lib/toolbox/types';
import { FirstRunHint } from './FirstRunHint';
import { TemplateCard } from './TemplateCard';

export function LibraryPanel({
  skills,
  templates,
  roles,
  roleFilter,
  setRoleFilter,
  difficultyFilter,
  setDifficultyFilter,
  filteredTemplates,
  onTry,
  onCustomize,
}: {
  readonly skills: readonly ToolboxSkill[];
  readonly templates: readonly ToolboxSkillTemplate[];
  readonly roles: readonly string[];
  readonly roleFilter: string;
  readonly setRoleFilter: (value: string) => void;
  readonly difficultyFilter: string;
  readonly setDifficultyFilter: (value: string) => void;
  readonly filteredTemplates: readonly ToolboxSkillTemplate[];
  readonly onTry: (template: ToolboxSkillTemplate) => void;
  readonly onCustomize: (template: ToolboxSkillTemplate) => void;
}) {
  return (
    <section className="space-y-6">
      <FirstRunHint
        skills={skills}
        templates={templates}
        onTry={onTry}
      />
      <div className="flex flex-col gap-4 border-b border-[color:var(--ink)]/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            Library
          </p>
          <h2 className="mt-2 text-4xl text-[color:var(--ink)]">
            Pre-built playbooks for common banking AI tasks.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-500)]">
            Pick one, run it as-is in the AiBI Lab, or edit it for your institution.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)]">Role</span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm">
              {roles.map((role) => <option key={role} value={role}>{role === 'all' ? 'All roles' : role}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)]">Difficulty</span>
            <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm">
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>
      </div>
      {filteredTemplates.length === 0 ? (
        <div className="border border-[color:var(--ink)]/10 bg-[color:var(--cream)] px-6 py-10 text-center">
          <p className="text-2xl text-[color:var(--ink)]">No playbooks match these filters.</p>
          <p className="mt-2 text-sm text-[color:var(--slate-500)]">Try clearing the role or difficulty filter.</p>
          <button
            type="button"
            onClick={() => { setRoleFilter('all'); setDifficultyFilter('all'); }}
            className="mt-5 border border-[color:var(--ink)]/20 px-4 py-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)] hover:border-[color:var(--gold-deep)] hover:text-[color:var(--gold-deep)]"
          >
            Show all playbooks
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onTry={() => onTry(template)}
              onCustomize={() => onCustomize(template)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
