-- 00043_find_auth_user_by_email.sql
--
-- Replace the O(all users) GoTrue admin listUsers scan in ensureAuthUser with
-- an indexed email lookup on the purchase / capture hot path. Previously every
-- Stripe webhook and every free-assessment capture paged through ALL auth
-- users (up to 50 admin API calls of 1000) just to find one row — fine at
-- small scale, a growing latency + timeout risk as the user base climbs.
--
-- The function receives BOTH the lowercased and the Gmail-canonical form of the
-- email (computed in application code by canonicalEmail), so it never has to
-- replicate that logic in SQL — avoiding JS/SQL canonicalization drift. It
-- matches auth.users on either form. ensureAuthUser stores the canonical form
-- on create, so canonical-stored users match directly; an exact (lowered)
-- match covers users created elsewhere (e.g. signup).
--
-- The one case this does NOT cover — a non-canonical Gmail alias stored as the
-- auth.users email by some other path, looked up by its base form — returns
-- NULL here, and the caller falls back to the full scan. So correctness is
-- preserved; this is purely a fast path for the overwhelming common case.
--
-- SECURITY DEFINER so the service role can read auth.users through PostgREST
-- without exposing the auth schema. Locked down: not callable by anon/auth.

create or replace function public.find_auth_user_id_by_email(
  p_lowered text,
  p_canonical text
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from auth.users
  where lower(email) = p_lowered
     or lower(email) = p_canonical
  order by (lower(email) = p_lowered) desc, last_sign_in_at desc nulls last
  limit 1
$$;

revoke all on function public.find_auth_user_id_by_email(text, text) from public;
revoke all on function public.find_auth_user_id_by_email(text, text) from anon, authenticated;
grant execute on function public.find_auth_user_id_by_email(text, text) to service_role;

comment on function public.find_auth_user_id_by_email(text, text) is
  'Indexed email -> auth.users.id lookup for ensureAuthUser. Pass the JS lowercased + canonicalEmail forms. Returns NULL when no exact/canonical-stored match exists (caller falls back to a full scan for the alias-stored edge).';
