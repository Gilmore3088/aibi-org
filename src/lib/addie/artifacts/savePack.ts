// savePack — POSTs a completed Workbench Pack to /api/addie/toolbox/items
// as a single addie.toolbox_items row of type='workbench_pack'.
//
// 2026-05-25 follow-up: closes open item #4 from the foundation UX
// recovery handoff (WorkbenchPackBuilder.onSave previously only set
// local React state). The Pack's markdown export is the body_md; the
// raw JSON content sits on the row's canonical content column server-
// side via the items API contract.

import { packToMarkdown, type WorkbenchPackContent } from './workbench-pack';

interface SavePackInput {
  readonly pack: WorkbenchPackContent;
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly track?: string | null;
}

interface SavePackError {
  readonly error: string;
  readonly cap?: number;
}

export interface SavePackResult {
  readonly id: string;
}

export async function savePack({
  pack,
  lessonId,
  lessonTitle,
  track,
}: SavePackInput): Promise<SavePackResult> {
  const title = deriveTitle(pack, lessonTitle);
  const body_md = packToMarkdown(pack);

  const res = await fetch('/api/addie/toolbox/items', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'workbench_pack',
      title,
      body_md,
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      track: track ?? undefined,
    }),
  });

  if (!res.ok) {
    let detail: SavePackError | null = null;
    try {
      detail = (await res.json()) as SavePackError;
    } catch {
      // fall through
    }
    const code = detail?.error ?? `http_${res.status}`;
    throw new Error(code);
  }

  return (await res.json()) as SavePackResult;
}

function deriveTitle(pack: WorkbenchPackContent, lessonTitle: string): string {
  const first = pack.promptUsed.trim().split('\n')[0]?.trim();
  if (first && first.length > 0) {
    return first.length <= 80 ? first : first.slice(0, 77).trimEnd() + '…';
  }
  return `Workbench Pack · ${lessonTitle}`.slice(0, 200);
}
