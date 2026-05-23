// Knowledge-check grading — server-side. Looks up the canonical correct
// answer from addie.knowledge_checks (server is authoritative — never
// trust the client's "this is the correct one" hint), writes the result,
// returns {correct, explanation}.

import { getAddieServiceClient } from '@/lib/addie/supabase/service';

interface KnowledgeCheckOption {
  id: string;
  label: string;
  correct?: boolean;
  explanation?: string;
}

export interface GradeInput {
  readonly check_id: string;
  readonly selected_option: string;
  readonly user_id: string | null;
  readonly anon_session_id: string | null;
}

export interface GradeOutput {
  readonly correct: boolean;
  readonly explanation: string | null;
  readonly correct_option_id: string;
}

export async function gradeKnowledgeCheck(input: GradeInput): Promise<GradeOutput | null> {
  if (!input.user_id && !input.anon_session_id) return null;
  const supa = getAddieServiceClient();
  const { data: check, error } = await supa
    .from('knowledge_checks')
    .select('id, options')
    .eq('id', input.check_id)
    .maybeSingle();
  if (error) throw new Error(`knowledge_check lookup failed: ${error.message}`);
  if (!check) return null;
  const options = Array.isArray(check.options) ? (check.options as KnowledgeCheckOption[]) : [];
  const correctOpt = options.find((o) => o.correct === true);
  if (!correctOpt) return null;
  const correct = input.selected_option === correctOpt.id;
  const explanation =
    options.find((o) => o.id === input.selected_option)?.explanation ?? null;

  // Write the result (best-effort — don't fail the request if write fails).
  try {
    await supa.from('knowledge_check_results').insert({
      check_id: input.check_id,
      user_id: input.user_id,
      anon_session_id: input.anon_session_id,
      selected_option: input.selected_option,
      correct,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn('[addie/checks/grade] result write warn:', msg);
  }

  return { correct, explanation, correct_option_id: correctOpt.id };
}
