// src/lib/toolbox/library.ts
//
// Plan C — server-side data access for the Toolbox Library. Reads from
// toolbox_library_skills and toolbox_library_skill_versions; the fork
// operation copies a Library version into the user's personal toolbox_skills
// row with provenance pointing back at the version id.
//
// All functions use the service-role client. API routes are responsible for
// calling getPaidToolboxAccess(userId) before invoking these helpers — the
// row-level RLS policy is defense-in-depth, not the only gate.

import { createServiceRoleClient } from '@/lib/supabase/client';
import type {
  ToolboxKind,
  ToolboxPillar,
} from '@/lib/toolbox/types';

export interface LibrarySkillSummary {
  readonly id: string;
  readonly slug: string;
  readonly kind: ToolboxKind;
  readonly title: string;
  readonly description: string | null;
  readonly pillar: ToolboxPillar;
  readonly category: string;
  readonly complexity: 'beginner' | 'intermediate' | 'advanced' | null;
  readonly current_version: number;
}

export interface LibrarySkillVersion {
  readonly id: string;
  readonly library_skill_id: string;
  readonly version: number;
  readonly content: Record<string, unknown>;
  readonly published_at: string;
}

export interface LibrarySkillDetail {
  readonly skill: LibrarySkillSummary & {
    readonly course_source_ref: string | null;
    readonly published: boolean;
  };
  readonly currentVersion: LibrarySkillVersion;
}

export interface ListLibrarySkillsOpts {
  readonly pillar?: ToolboxPillar;
  readonly category?: string;
  readonly kind?: ToolboxKind;
}

export async function listLibrarySkills(
  opts: ListLibrarySkillsOpts = {}
): Promise<LibrarySkillSummary[]> {
  const client = createServiceRoleClient();
  let q = client
    .from('toolbox_library_skills')
    .select('id, slug, kind, title, description, pillar, category, complexity, current_version')
    .eq('published', true)
    .order('category', { ascending: true })
    .order('title', { ascending: true });

  if (opts.pillar) q = q.eq('pillar', opts.pillar);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.kind) q = q.eq('kind', opts.kind);

  const { data, error } = await q;
  if (error) throw new Error(`listLibrarySkills failed: ${error.message}`);
  return (data ?? []) as LibrarySkillSummary[];
}

export async function getLibrarySkill(
  slug: string
): Promise<LibrarySkillDetail | null> {
  const client = createServiceRoleClient();

  const { data: skill, error: skillErr } = await client
    .from('toolbox_library_skills')
    .select('id, slug, kind, title, description, pillar, category, complexity, current_version, course_source_ref, published')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (skillErr) throw new Error(`getLibrarySkill failed: ${skillErr.message}`);
  if (!skill) return null;

  const { data: version, error: versionErr } = await client
    .from('toolbox_library_skill_versions')
    .select('id, library_skill_id, version, content, published_at')
    .eq('library_skill_id', skill.id)
    .eq('version', skill.current_version)
    .single();

  if (versionErr) throw new Error(`getLibrarySkill version fetch failed: ${versionErr.message}`);

  return {
    skill: skill as LibrarySkillDetail['skill'],
    currentVersion: version as LibrarySkillVersion,
  };
}

export interface ForkLibrarySkillOpts {
  readonly ownerId: string;
  readonly librarySkillId: string;
  readonly versionId: string;
}

export interface ForkLibrarySkillResult {
  readonly id: string;
}

/**
 * Copies a Library Skill version into the user's personal toolbox_skills.
 * The forked row is editable; provenance is recorded as source='library'
 * and source_ref=<library_skill_version_id>.
 *
 * The library version content is a JSONB snapshot of the original skill at
 * publish time. We map its content fields onto the toolbox_skills columns,
 * preserving everything; the workflow-specific fields stay in the same shape
 * because Plan B's toolbox_skills schema is a superset of the legacy template
 * shape (decision #23).
 */
export async function forkLibrarySkill(
  opts: ForkLibrarySkillOpts
): Promise<ForkLibrarySkillResult> {
  const client = createServiceRoleClient();

  const { data: version, error: versionErr } = await client
    .from('toolbox_library_skill_versions')
    .select('id, library_skill_id, content')
    .eq('id', opts.versionId)
    .eq('library_skill_id', opts.librarySkillId)
    .single();

  if (versionErr || !version) {
    throw new Error(`forkLibrarySkill: version not found (${opts.versionId})`);
  }

  const content = version.content as Record<string, unknown>;

  const { data: skill, error: skillErr } = await client
    .from('toolbox_library_skills')
    .select('kind, title, description, pillar, category')
    .eq('id', opts.librarySkillId)
    .single();

  if (skillErr || !skill) {
    throw new Error(`forkLibrarySkill: skill not found (${opts.librarySkillId})`);
  }

  // Build the insert payload. Workflow-kind library skills carry the legacy
  // workflow fields in content (purpose, success, files, connectors, questions,
  // steps, guardrails, etc.). Template-kind library skills carry
  // system_prompt, user_prompt_template, variables, etc.
  const insertPayload: Record<string, unknown> = {
    owner_id: opts.ownerId,
    source: 'library',
    source_ref: opts.versionId,
    kind: skill.kind,
    title: skill.title,
    description: skill.description,
    pillar: skill.pillar,
    category: skill.category,
    // Workflow-shaped fields from content
    cmd: content.cmd ?? null,
    purpose: content.purpose ?? null,
    success: content.success ?? null,
    files: content.files ?? null,
    connectors: content.connectors ?? null,
    questions: content.questions ?? null,
    steps: content.steps ?? null,
    output: content.output ?? null,
    tone: content.tone ?? null,
    length: content.length ?? null,
    guardrails: content.guardrails ?? null,
    customGuard: content.customGuard ?? null,
    samples: content.samples ?? null,
    maturity: content.maturity ?? 'draft',
    // Template-shaped fields from content
    system_prompt: content.system_prompt ?? null,
    user_prompt_template: content.user_prompt_template ?? null,
    variables: content.variables ?? [],
    teaching_annotations: content.teaching_annotations ?? [],
  };

  const { data: inserted, error: insertErr } = await client
    .from('toolbox_skills')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insertErr || !inserted) {
    throw new Error(`forkLibrarySkill: insert failed (${insertErr?.message})`);
  }

  return { id: inserted.id as string };
}
