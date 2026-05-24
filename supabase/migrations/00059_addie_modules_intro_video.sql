-- 00059_addie_modules_intro_video.sql
-- Adds a 2-3 minute intro video slot to every module. Sits at the top
-- of the module landing page (/foundation/[moduleId]) above the
-- "What you'll learn" section.
--
-- Operator records the videos later; in the meantime the
-- ModuleIntroVideo component renders an honest "Intro video in
-- production" placeholder using the existing addie-video-frame
-- treatment + the module illustration.

ALTER TABLE addie.modules
  ADD COLUMN IF NOT EXISTS intro_video_url text,
  ADD COLUMN IF NOT EXISTS intro_video_caption_url text,
  ADD COLUMN IF NOT EXISTS intro_video_duration_s integer
    CHECK (intro_video_duration_s IS NULL OR (intro_video_duration_s BETWEEN 30 AND 600)),
  ADD COLUMN IF NOT EXISTS intro_video_transcript text;

COMMENT ON COLUMN addie.modules.intro_video_url IS
  '2-3 minute module overview video. NULL renders the in-production placeholder.';
COMMENT ON COLUMN addie.modules.intro_video_caption_url IS
  'WebVTT captions track. MUST be set when intro_video_url is set (a11y).';
COMMENT ON COLUMN addie.modules.intro_video_duration_s IS
  'Video duration in seconds. Display rendered as M:SS. Bounded 30-600s.';
COMMENT ON COLUMN addie.modules.intro_video_transcript IS
  'Full transcript of the intro video. Always rendered below the player.';
