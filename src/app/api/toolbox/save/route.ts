import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import {
  promptCardToToolboxSkill,
  playgroundMessagesToToolboxSkill,
  libraryEntryToToolboxSkill,
} from '@/lib/toolbox/save-mappers';
import { trackEvent } from '@/lib/analytics/plausible';
import { getPromptById } from '@content/courses/foundations/prompt-library';
import type {
  ToolboxMessage,
  ToolboxSkill,
  ToolboxVariable,
  ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';

interface CoursePayload {
  origin: 'course';
  payload: { promptId: string; courseSlug: 'aibi-p'; moduleNumber: number };
}
interface PlaygroundPayload {
  origin: 'playground';
  payload: { skill: ToolboxSkill; messages: readonly ToolboxMessage[] };
}
interface LibraryPayload {
  origin: 'library';
  payload: { librarySkillId: string; versionId: string; recipeSourceRef?: string };
}
type SaveBody = CoursePayload | PlaygroundPayload | LibraryPayload;

interface LibraryRow {
  readonly id: string;
  readonly slug: string;
  readonly kind: 'workflow' | 'template';
  readonly title: string;
  readonly description: string;
  readonly system_prompt?: string | null;
  readonly user_prompt_template?: string | null;
  readonly variables?: readonly ToolboxVariable[] | null;
  readonly workflow_definition?: Partial<ToolboxWorkflowSkill> | null;
  readonly pillar?: 'A' | 'B' | 'C' | null;
  readonly category: string;
}

function isSaveBody(v: unknown): v is SaveBody {
  if (!v || typeof v !== 'object') return false;
  const o = v as { origin?: unknown };
  return o.origin === 'course' || o.origin === 'playground' || o.origin === 'library';
}

function libraryRowToEntry(row: LibraryRow): Parameters<typeof libraryEntryToToolboxSkill>[0] {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    description: row.description,
    systemPrompt: row.system_prompt ?? undefined,
    userPromptTemplate: row.user_prompt_template ?? undefined,
    variables: row.variables ?? undefined,
    workflowDefinition: row.workflow_definition ?? undefined,
    pillar: row.pillar ?? undefined,
    category: row.category,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) {
    return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Server-side Toolbox storage is not configured.' },
      { status: 503 },
    );
  }

  let body: SaveBody;
  try {
    const parsed: unknown = await request.json();
    if (!isSaveBody(parsed)) {
      return NextResponse.json({ error: 'Invalid origin.' }, { status: 400 });
    }
    body = parsed;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  let skill: ToolboxSkill;
  let sourceRef: string | undefined;

  if (body.origin === 'course') {
    const prompt = getPromptById(body.payload.promptId);
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found.' }, { status: 404 });
    }
    skill = promptCardToToolboxSkill(prompt, access.userId);
    sourceRef = skill.sourceRef;
  } else if (body.origin === 'playground') {
    skill = playgroundMessagesToToolboxSkill({
      skill: body.payload.skill,
      messages: body.payload.messages,
      userId: access.userId,
    });
    sourceRef = undefined;
  } else {
    const lookupClient = createServiceRoleClient();
    const { data: entry, error: lookupError } = await lookupClient
      .from('toolbox_library_skills')
      .select('*')
      .eq('id', body.payload.librarySkillId)
      .single();
    if (lookupError || !entry) {
      return NextResponse.json({ error: 'Library entry not found.' }, { status: 404 });
    }
    skill = libraryEntryToToolboxSkill(
      libraryRowToEntry(entry as LibraryRow),
      access.userId,
      body.payload.versionId,
      body.payload.recipeSourceRef,
    );
    sourceRef = skill.sourceRef;
  }

  const client = createServiceRoleClient();
  const insertPayload = {
    user_id: access.userId,
    command: skill.cmd,
    name: skill.name,
    maturity: skill.maturity,
    kind: skill.kind,
    system_prompt: skill.kind === 'template' ? skill.systemPrompt : null,
    user_prompt_template: skill.kind === 'template' ? skill.userPromptTemplate : null,
    variables: skill.kind === 'template' ? skill.variables : [],
    pillar: skill.pillar ?? null,
    teaching_annotations: skill.teachingAnnotations ?? [],
    source: skill.source ?? 'user',
    source_ref: sourceRef ?? null,
    skill,
  };

  const { data, error } = await client
    .from('toolbox_skills')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Insert failed.' },
      { status: 500 },
    );
  }

  trackEvent('save_to_toolbox_clicked', {
    origin: body.origin,
    source_ref: sourceRef ?? '',
  });

  return NextResponse.json({ id: (data as { id: string }).id });
}
