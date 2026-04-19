import type { UnitFrameworkHooks } from '../../../../../../../lib/aibi-s/types';

export function FrameworkHooks({ hooks }: { readonly hooks: UnitFrameworkHooks }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-mono text-[color:var(--color-ink)]/70 border border-[color:var(--color-ink)]/10 rounded px-3 py-2 bg-[color:var(--color-parch)]">
      <span className="font-semibold">Pillar {hooks.pillar}</span>
      {hooks.frameworks.length > 0 && (
        <span>· {hooks.frameworks.join(', ')}</span>
      )}
      {hooks.dataTiers.length > 0 && (
        <span>· Tier {hooks.dataTiers.join('/')}</span>
      )}
    </div>
  );
}
