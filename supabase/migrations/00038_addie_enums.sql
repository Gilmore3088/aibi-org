-- 00038_addie_enums.sql
-- ADDIE enums per DB Spec §4. Defined inside addie schema for isolation.

CREATE TYPE addie.track AS ENUM (
  'risk_compliance', 'customer_facing', 'back_office', 'technical', 'leadership'
);

CREATE TYPE addie.comfort_level AS ENUM (
  'new', 'curious', 'comfortable', 'fluent'
);

CREATE TYPE addie.tool_exposure AS ENUM (
  'none', 'consumer', 'work_assistant', 'builder'
);

CREATE TYPE addie.tier AS ENUM (
  'free', 'paid'
);

CREATE TYPE addie.entitlement_status AS ENUM (
  'active', 'expired', 'revoked'
);

CREATE TYPE addie.seat_status AS ENUM (
  'invited', 'assigned', 'revoked'
);

CREATE TYPE addie.artifact_type AS ENUM (
  'data_discipline_card',
  'ai_toolkit_map',
  'first_conversation',
  'starter_prompt_pack',
  'skill',
  'skill_template',
  'agent_blueprint',
  'prd',
  'prototype',
  'problem_backlog'
);

CREATE TYPE addie.gate_decision AS ENUM (
  'pay', 'email', 'decline'
);

CREATE TYPE addie.lesson_modality AS ENUM (
  'video', 'audio', 'interactive', 'sandbox', 'worksheet', 'reading'
);
