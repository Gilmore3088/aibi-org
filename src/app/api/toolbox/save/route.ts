import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { canBuildOrRun, getPaidToolboxAccess } from '@/lib/toolbox/access';
import {
  courseArtifactToToolboxSkill,
  promptCardToToolboxSkill,
  playgroundMessagesToToolboxSkill,
  libraryEntryToToolboxSkill,
  type CourseArtifactField,
} from '@/lib/toolbox/save-mappers';
import { getPromptById } from '@content/courses/foundation-program/prompt-library';
import type {
  ToolboxMessage,
  ToolboxSkill,
  ToolboxVariable,
  ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';

interface CoursePayload {
  origin: 'course';
  payload:
    | { promptId: string; courseSlug: 'aibi-p'; moduleNumber: number }
    | {
        kind: 'module-artifact';
        courseSlug: 'aibi-p';
        moduleNumber: number;
        activityId: string;
        artifactName: string;
        fields: readonly CourseArtifactField[];
        reviewNote?: string;
        transferPlan?: string;
        readiness?: string;
      };
}
interface PlaygroundPayload {
  origin: 'playground';
  payload: { skill: ToolboxSkill; messages: readonly ToolboxMessage[] };
}
interface LibraryPayload {
  origin: 'library';
  payload: { librarySkillId: string; versionId: string; recipeSourceRef?: string };
}
interface InDepthPayload {
  origin: 'in-depth';
  payload: { artifactName: string; roleLabel: string; prompt: string; rule: string };
}
type SaveBody = CoursePayload | PlaygroundPayload | LibraryPayload | InDepthPayload;

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
  return (
    o.origin === 'course' ||
    o.origin === 'playground' ||
    o.origin === 'library' ||
    o.origin === 'in-depth'
  );
}

function isCourseArtifactPayload(
  payload: CoursePayload['payload'],
): payload is Extract<CoursePayload['payload'], { kind: 'module-artifact' }> {
  return (
    'kind' in payload &&
    payload.kind === 'module-artifact' &&
    payload.courseSlug === 'aibi-p' &&
    typeof payload.moduleNumber === 'number' &&
    Number.isInteger(payload.moduleNumber) &&
    payload.moduleNumber > 0 &&
    typeof payload.activityId === 'string' &&
    payload.activityId.trim().length > 0 &&
    typeof payload.artifactName === 'string' &&
    payload.artifactName.trim().length > 0 &&
    Array.isArray(payload.fields)
  );
}

function isCoursePromptPayload(
  payload: CoursePayload['payload'],
): payload is Extract<CoursePayload['payload'], { promptId: string }> {
  return (
    'promptId' in payload &&
    typeof payload.promptId === 'string' &&
    payload.promptId.trim().length > 0 &&
    payload.courseSlug === 'aibi-p' &&
    typeof payload.moduleNumber === 'number'
  );
}

function inDepthArtifactToToolboxSkill(
  payload: InDepthPayload['payload'],
  userId: string,
): ToolboxSkill {
  const slug = payload.artifactName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const cmd = `/in-depth-${slug}-${Date.now().toString(36)}`;
  return {
    kind: 'template',
    id: '', // assigned by Postgres on insert
    cmd,
    name: payload.artifactName,
    dept: payload.roleLabel,
    deptFull: payload.roleLabel,
    difficulty: 'intermediate',
    timeSaved: '15 min',
    cadence: 'As needed',
    desc: `Saved from your In-Depth diagnostic. Rule: ${payload.rule}`,
    owner: userId,
    maturity: 'draft',
    version: '1.0',
    systemPrompt: '',
    userPromptTemplate: payload.prompt,
    variables: [],
    example: { input: {}, output: '' },
    source: 'user',
    sourceRef: undefined,
  };
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

function isLocalPreviewToolboxSave(userId: string): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_ENROLLMENT_GATE === 'true' &&
    userId === 'dev-bypass'
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) {
    return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  }
  // Paid-write guard: reject before the DB call so non-entitled users cannot
  // bypass the UI via a direct fetch.
  if (!canBuildOrRun(access)) {
    return NextResponse.json(
      { error: 'Saving requires paid Toolbox access.' },
      { status: 403 },
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
  let shouldUpsert = false;

  if (body.origin === 'course') {
    if (isCourseArtifactPayload(body.payload)) {
      skill = courseArtifactToToolboxSkill(body.payload, access.userId);
      sourceRef = skill.sourceRef;
      shouldUpsert = true;
    } else if (isCoursePromptPayload(body.payload)) {
      const prompt = getPromptById(body.payload.promptId);
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt not found.' }, { status: 404 });
      }
      skill = promptCardToToolboxSkill(prompt, access.userId);
      sourceRef = skill.sourceRef;
    } else {
      return NextResponse.json({ error: 'Invalid course payload.' }, { status: 400 });
    }
  } else if (body.origin === 'playground') {
    skill = playgroundMessagesToToolboxSkill({
      skill: body.payload.skill,
      messages: body.payload.messages,
      userId: access.userId,
    });
    sourceRef = undefined;
  } else if (body.origin === 'in-depth') {
    skill = inDepthArtifactToToolboxSkill(body.payload, access.userId);
    sourceRef = `in-depth:${body.payload.artifactName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  } else {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Server-side Toolbox storage is not configured.' },
        { status: 503 },
      );
    }
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

  if (isLocalPreviewToolboxSave(access.userId)) {
    return NextResponse.json({
      id: `dev-${skill.cmd.replace(/^\/+/, '').replace(/[^a-z0-9-]/gi, '-')}`,
      localPreview: true,
    });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Server-side Toolbox storage is not configured.' },
      { status: 503 },
    );
  }

  const client = createServiceRoleClient();
  const insertPayload = {
    user_id: access.userId,
    command: skill.cmd,
    name: skill.name,
    maturity: skill.maturity,
    kind: skill.kind,
    system_prompt:
      skill.kind === 'template'
        ? skill.systemPrompt
        : skill.systemPromptOverride ?? null,
    user_prompt_template: skill.kind === 'template' ? skill.userPromptTemplate : null,
    variables: skill.kind === 'template' ? skill.variables : [],
    pillar: skill.pillar ?? null,
    teaching_annotations: skill.teachingAnnotations ?? [],
    source: skill.source ?? 'user',
    source_ref: sourceRef ?? null,
    skill,
  };

  const write = shouldUpsert
    ? client
        .from('toolbox_skills')
        .upsert(insertPayload, { onConflict: 'user_id,command' })
    : client.from('toolbox_skills').insert(insertPayload);

  const { data, error } = await write.select('id').single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Insert failed.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: (data as { id: string }).id });
}
