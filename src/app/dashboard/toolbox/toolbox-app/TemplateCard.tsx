'use client';

import type { ToolboxSkillTemplate } from '@/lib/toolbox/types';

export function TemplateCard({ template, onTry, onCustomize }: { readonly template: ToolboxSkillTemplate; readonly onTry: () => void; readonly onCustomize: () => void }) {
  const cadenceLabel = template.cadence?.toLowerCase().replace(/^per\s+/, '') ?? 'use';
  return (
    <article className="border border-[color:var(--ink)]/10 bg-white/45 p-5 transition-colors hover:border-[color:var(--gold-deep)]/50">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)]">{template.deptFull}</span>
        <span className="text-[0.5625rem] uppercase tracking-widest text-[color:var(--slate-500)]">{template.difficulty}</span>
      </div>
      <h3 className="mt-4 text-2xl leading-tight text-[color:var(--ink)]">{template.name}</h3>
      <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-[color:var(--slate-500)]">{template.desc}</p>
      <div className="mt-5 border-t border-[color:var(--ink)]/10 pt-4 text-[0.6875rem] text-[color:var(--slate-500)]">
        Saves {template.timeSaved} per {cadenceLabel}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onTry} className="bg-[color:var(--gold-deep)] px-3 py-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]">Run it now</button>
        <button type="button" onClick={onCustomize} className="border border-[color:var(--ink)]/20 px-3 py-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)]">Edit and run</button>
      </div>
    </article>
  );
}
