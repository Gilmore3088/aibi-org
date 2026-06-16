-- 00044 — Action Packet notes (#443 item 1).
--
-- Lets In-Depth buyers attach personal follow-up notes to their diagnostic
-- that survive across visits. Stored on user_profiles so the same bearer-
-- token URL that serves the report also loads and saves the notes — no
-- additional auth layer needed.
--
-- Fail-open: code reads/writes this column with ?. operator; if this
-- migration has not yet been applied the read returns null and the write
-- is a no-op at the Supabase level.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS action_packet_notes text;

COMMENT ON COLUMN public.user_profiles.action_packet_notes IS
  'Personal follow-up notes attached to the In-Depth Action Packet by the bearer. Plain text. #443';
