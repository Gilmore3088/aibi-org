-- 00054_addie_artifact_type_add_where_ai_fits.sql
-- Extends addie.artifact_type with 'where_ai_fits' so the M2.4 weekly-fit
-- worksheet has a real artifact type (previously stubbed as 'first_conversation'
-- per Wave 2b M2 agent flag). Non-destructive enum ADD.
--
-- The same value is added to the TypeScript ArtifactType union in
-- src/components/addie/lesson/types.ts in the same commit.

ALTER TYPE addie.artifact_type ADD VALUE IF NOT EXISTS 'where_ai_fits';
