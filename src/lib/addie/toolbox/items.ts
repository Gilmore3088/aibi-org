// Toolbox item persistence — server-only helpers.
// Free tier hard cap (4 light artifacts per identity) is enforced here, NOT
// at the client. Paid identities (active foundation entitlement) are uncapped.

import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { hasAnyFoundationEntitlement } from '@/lib/addie/entitlements/check';

export const FREE_TIER_ARTIFACT_CAP = 4;

export type ArtifactType =
  | 'data_discipline_card'
  | 'ai_toolkit_map'
  | 'first_conversation'
  | 'starter_prompt_pack'
  | 'skill'
  | 'skill_template'
  | 'agent_blueprint'
  | 'prd'
  | 'prototype'
  | 'problem_backlog';

export interface ToolboxItem {
  readonly id: string;
  readonly type: ArtifactType;
  readonly title: string;
  readonly lesson_id: string | null;
  readonly track: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ToolboxItemVersion {
  readonly id: string;
  readonly version: number;
  readonly body_md: string;
  readonly created_at: string;
}

export interface IdentityKey {
  readonly user_id: string | null;
  readonly lead_id: string | null;
}

interface CountResult {
  readonly count: number;
}

async function countItemsFor(identity: IdentityKey): Promise<number> {
  const supa = getAddieServiceClient();
  let q = supa.from('toolbox_items').select('id', { count: 'exact', head: true });
  if (identity.user_id) q = q.eq('user_id', identity.user_id);
  else if (identity.lead_id) q = q.eq('lead_id', identity.lead_id);
  else return 0;
  const { count, error } = await q;
  if (error) throw new Error(`toolbox count failed: ${error.message}`);
  return count ?? 0;
}

export async function isOverFreeCap(identity: IdentityKey): Promise<{
  over: boolean;
  count: number;
  unlimited: boolean;
}> {
  if (identity.user_id) {
    const paid = await hasAnyFoundationEntitlement(identity.user_id);
    if (paid) return { over: false, count: -1, unlimited: true };
  }
  const count = await countItemsFor(identity);
  return { over: count >= FREE_TIER_ARTIFACT_CAP, count, unlimited: false };
}

export async function listItemsFor(identity: IdentityKey): Promise<ToolboxItem[]> {
  const supa = getAddieServiceClient();
  let q = supa
    .from('toolbox_items')
    .select('id, type, title, lesson_id, track, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (identity.user_id) q = q.eq('user_id', identity.user_id);
  else if (identity.lead_id) q = q.eq('lead_id', identity.lead_id);
  else return [];
  const { data, error } = await q;
  if (error) throw new Error(`toolbox list failed: ${error.message}`);
  return (data ?? []) as ToolboxItem[];
}

export interface CreateItemInput {
  readonly identity: IdentityKey;
  readonly type: ArtifactType;
  readonly title: string;
  readonly body_md: string;
  readonly lesson_id?: string | null;
  readonly track?: string | null;
}

export async function createItem(input: CreateItemInput): Promise<{ id: string; capped?: true }> {
  const { identity } = input;
  if (!identity.user_id && !identity.lead_id) {
    throw new Error('toolbox create requires identity (user_id or lead_id)');
  }
  const cap = await isOverFreeCap(identity);
  if (cap.over) return { id: '', capped: true };

  const supa = getAddieServiceClient();
  const { data: inserted, error } = await supa
    .from('toolbox_items')
    .insert({
      user_id: identity.user_id,
      lead_id: identity.lead_id,
      type: input.type,
      title: input.title,
      lesson_id: input.lesson_id ?? null,
      track: input.track ?? null,
    })
    .select('id')
    .single();
  if (error || !inserted) throw new Error(`toolbox insert failed: ${error?.message ?? 'no row'}`);

  const { error: vErr } = await supa.from('toolbox_item_versions').insert({
    item_id: inserted.id as string,
    version: 1,
    body_md: input.body_md,
  });
  if (vErr) throw new Error(`toolbox version insert failed: ${vErr.message}`);
  return { id: inserted.id as string };
}

export async function getItem(
  id: string,
  identity: IdentityKey,
): Promise<{ item: ToolboxItem; versions: ToolboxItemVersion[] } | null> {
  const supa = getAddieServiceClient();
  let q = supa
    .from('toolbox_items')
    .select('id, type, title, lesson_id, track, created_at, updated_at, user_id, lead_id')
    .eq('id', id);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(`toolbox get failed: ${error.message}`);
  if (!data) return null;
  // Identity check
  if (identity.user_id && data.user_id !== identity.user_id) return null;
  if (!identity.user_id && identity.lead_id && data.lead_id !== identity.lead_id) return null;

  const { data: versions, error: vErr } = await supa
    .from('toolbox_item_versions')
    .select('id, version, body_md, created_at')
    .eq('item_id', id)
    .order('version', { ascending: false });
  if (vErr) throw new Error(`toolbox versions failed: ${vErr.message}`);
  const { user_id: _u, lead_id: _l, ...item } = data;
  return { item: item as ToolboxItem, versions: (versions ?? []) as ToolboxItemVersion[] };
}

export async function appendVersion(
  id: string,
  body_md: string,
  identity: IdentityKey,
): Promise<{ version: number } | null> {
  const existing = await getItem(id, identity);
  if (!existing) return null;
  const nextVersion = (existing.versions[0]?.version ?? 0) + 1;
  const supa = getAddieServiceClient();
  const { error } = await supa
    .from('toolbox_item_versions')
    .insert({ item_id: id, version: nextVersion, body_md });
  if (error) throw new Error(`toolbox version insert failed: ${error.message}`);
  // touch parent
  await supa.from('toolbox_items').update({ updated_at: new Date().toISOString() }).eq('id', id);
  return { version: nextVersion };
}

export async function deleteItem(id: string, identity: IdentityKey): Promise<boolean> {
  const existing = await getItem(id, identity);
  if (!existing) return false;
  const supa = getAddieServiceClient();
  const { error } = await supa.from('toolbox_items').delete().eq('id', id);
  if (error) throw new Error(`toolbox delete failed: ${error.message}`);
  return true;
}

const ARTIFACT_TYPES: ReadonlySet<ArtifactType> = new Set<ArtifactType>([
  'data_discipline_card',
  'ai_toolkit_map',
  'first_conversation',
  'starter_prompt_pack',
  'skill',
  'skill_template',
  'agent_blueprint',
  'prd',
  'prototype',
  'problem_backlog',
]);

export function isArtifactType(v: unknown): v is ArtifactType {
  return typeof v === 'string' && ARTIFACT_TYPES.has(v as ArtifactType);
}
