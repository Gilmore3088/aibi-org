import type { ToolboxSkillTemplate, ToolboxWorkflowSkill } from '@/lib/toolbox/types';

export function toSkill(template: ToolboxSkillTemplate): ToolboxWorkflowSkill {
  return {
    ...template,
    id: '',
    templateId: template.id,
    version: '1.0',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  };
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugFromCommand(cmd: string): string {
  return cmd.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase() || 'skill';
}

// #8 layer 3 — Plausible event helper. Safe no-op when the script hasn't
// loaded yet thanks to the deferred-queue pattern set up in layout.tsx.
export function firePlausible(event: string, props?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && typeof (window as unknown as {
    plausible?: (e: string, opts?: { props?: Record<string, string | number> }) => void;
  }).plausible === 'function') {
    (window as unknown as {
      plausible: (e: string, opts?: { props?: Record<string, string | number> }) => void;
    }).plausible(event, props ? { props } : undefined);
  }
}
