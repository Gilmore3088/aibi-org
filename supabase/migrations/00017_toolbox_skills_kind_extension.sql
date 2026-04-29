-- 00017_toolbox_skills_kind_extension.sql
-- Plan B (decision #23): make toolbox_skills support two kinds.
--
-- - 'workflow' (existing): rich workflow definition; system prompt is generated
--   from purpose/questions/steps/guardrails by buildToolboxSystemPrompt().
-- - 'template' (new): fill-in-the-blank prompt with {{variables}}; system_prompt
--   is stored explicitly.
--
-- Production has 0 rows in toolbox_skills (verified 2026-04-29) so this is a
-- pure ALTER without data migration.

ALTER TABLE toolbox_skills
  ADD COLUMN kind text NOT NULL DEFAULT 'workflow'
    CHECK (kind IN ('workflow', 'template')),
  ADD COLUMN system_prompt text,
  ADD COLUMN user_prompt_template text,
  ADD COLUMN variables jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN pillar char(1) CHECK (pillar IN ('A', 'B', 'C')),
  ADD COLUMN teaching_annotations jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN source text DEFAULT 'user'
    CHECK (source IN ('library', 'course', 'user', 'forked')),
  ADD COLUMN source_ref text;

-- Per-kind invariants enforced at the row level. Workflow rows MAY also set
-- system_prompt (override); template rows MUST have system_prompt + template.
ALTER TABLE toolbox_skills
  ADD CONSTRAINT toolbox_skills_template_kind_required CHECK (
    kind = 'workflow'
    OR (
      kind = 'template'
      AND system_prompt IS NOT NULL
      AND user_prompt_template IS NOT NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_toolbox_skills_user_kind
  ON toolbox_skills (user_id, kind);

CREATE INDEX IF NOT EXISTS idx_toolbox_skills_pillar
  ON toolbox_skills (pillar) WHERE pillar IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_toolbox_skills_source
  ON toolbox_skills (source);
