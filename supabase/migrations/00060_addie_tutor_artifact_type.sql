-- 00060_addie_tutor_artifact_type.sql
-- Extends addie.artifact_type with 'tutor_conversation' so the in-lesson
-- AI tutor (foundation-course-content-audit-2026-05-24 §3.1) can save
-- Q+A threads to the Toolbox using the existing addie.toolbox_items
-- mechanism. No schema/RLS change — the type enum addition is all.

ALTER TYPE addie.artifact_type ADD VALUE IF NOT EXISTS 'tutor_conversation';
