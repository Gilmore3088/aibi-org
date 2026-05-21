-- Security hardening (2026-05-20 ship-it audit)
-- Tighten certificate read access.
--
-- Before: "Public read certificates" granted SELECT to anon + authenticated
-- with USING (true). Because the anon key ships in the browser, anyone could
-- run `select * from certificates` and enumerate the FULL table — every
-- graduate's holder_name + designation + issue date — not just verify a
-- single credential they already hold the ID for.
--
-- After: drop the blanket policy. Verification now runs server-side through
-- the service-role client (src/app/verify/[certificateId]/page.tsx), which
-- bypasses RLS and selects only the three public fields for one specific
-- certificate_id. Lookup-by-known-id (bearer-token semantics) is preserved;
-- enumeration via the anon key is removed.
--
-- RLS stays ENABLED on certificates, so with no anon/authenticated SELECT
-- policy the table is now service-role-only — matching institution_enrollments.

DROP POLICY IF EXISTS "Public read certificates" ON certificates;
