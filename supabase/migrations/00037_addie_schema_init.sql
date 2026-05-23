-- 00037_addie_schema_init.sql
-- ADDIE Foundation Course rebuild — schema isolation
-- See DECISIONS.md 2026-05-23 entry "ADDIE schema isolated under a separate `addie.*` Postgres schema"
-- Spec: docs/Foundation-Course-ADDIE/AiBI_Database_Schema_RLS_Spec.md §2

CREATE SCHEMA IF NOT EXISTS addie;

-- Server-side code uses service_role; we grant USAGE so authenticated/anon
-- policies inside addie schema can be evaluated by the RLS planner. Table-
-- level GRANTs are issued per-table in subsequent migrations.
GRANT USAGE ON SCHEMA addie TO anon, authenticated, service_role;

-- PostgREST exposure of the addie schema is OFF by default. Client traffic
-- flows through Next.js API routes using the service-role client; RLS is
-- belt-and-suspenders. To expose later, set Supabase project setting
-- `db.schemas` to include `addie` (or use the dashboard API → "Exposed schemas").

COMMENT ON SCHEMA addie IS
  'ADDIE Foundation Course rebuild (feature/addie-v1). Isolated from public.* '
  'to avoid collision with 37 existing migrations. See DECISIONS.md 2026-05-23.';
