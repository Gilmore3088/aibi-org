-- 00055_addie_grants_and_exposure.sql
-- Codifies the two runtime fixes from the 2026-05-23 dev-debug session
-- (handoff-2026-05-23-addie-wave-1-2-3.md §B1, §B2). Without these the
-- Supabase JS SDK + PostgREST round-trip returns 42501 for every addie.*
-- query from server components and API routes.
--
-- Rationale walk-back: 00037_addie_schema_init.sql claimed "client traffic
-- flows through Next.js API routes using the service-role client" and
-- therefore PostgREST exposure wasn't required. That conflated transport
-- (PostgREST is hit either way — the SDK uses it) with authorization
-- (anon-key visibility, which we still deliberately withhold). See
-- DECISIONS.md 2026-05-23.

-- ──────────────────────────────────────────────────────────────────────
-- 1. PostgREST schema exposure
-- ──────────────────────────────────────────────────────────────────────
-- The `authenticator` role is the one PostgREST uses; its
-- pgrst.db_schemas setting is the allowlist of schemas PostgREST will
-- introspect and serve. Append `addie` while preserving the standard
-- Supabase set so we don't accidentally drop `graphql_public`, etc.

ALTER ROLE authenticator
  SET pgrst.db_schemas = 'public, graphql_public, storage, graphql, addie';

-- ──────────────────────────────────────────────────────────────────────
-- 2. Table-level grants for service_role
-- ──────────────────────────────────────────────────────────────────────
-- service_role bypasses RLS but still needs SQL-level GRANTs. anon and
-- authenticated remain at USAGE-only on the schema (granted in 00037),
-- which keeps the addie surface invisible to clients holding the anon
-- key — exactly the isolation we wanted.

GRANT ALL ON ALL TABLES    IN SCHEMA addie TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA addie TO service_role;
GRANT ALL ON ALL ROUTINES  IN SCHEMA addie TO service_role;

-- Future-proof: every new table/sequence/function created in addie by
-- the postgres role (the role migrations run as) auto-grants to
-- service_role. Without this, every new migration would have to remember
-- to issue grants and we'd be one forgotten line away from re-breaking
-- the runtime.

ALTER DEFAULT PRIVILEGES IN SCHEMA addie
  GRANT ALL ON TABLES    TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA addie
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA addie
  GRANT ALL ON ROUTINES  TO service_role;

-- ──────────────────────────────────────────────────────────────────────
-- 3. Tell PostgREST to reload
-- ──────────────────────────────────────────────────────────────────────
-- ALTER ROLE only takes effect on new connections; NOTIFY forces
-- PostgREST to drop its pool and re-introspect immediately. The schema
-- reload picks up the new exposed schema; the config reload picks up
-- pgrst.db_schemas.

NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
