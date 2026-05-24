-- 00058_addie_modules_hero_image.sql
-- Adds optional photographic hero support to addie.modules. The existing
-- bespoke SVG illustrations (src/components/addie/illustrations/
-- ModuleIllustration.tsx) remain the visual fallback whenever
-- hero_image_url is NULL.
--
-- Per DECISIONS.md 2026-05-23: the "no stock photography" Ledger rule is
-- relaxed inside the /foundation/* surface only. Operators can swap the
-- curated Unsplash defaults seeded below for licensed/branded photography
-- at any time with a single UPDATE — no code change required.
--
-- Columns:
--   hero_image_url     — absolute URL (Unsplash, Supabase storage, or any
--                        approved CDN). When NULL, the SVG renders.
--   hero_image_alt     — descriptive alt text (banker-context, no emoji,
--                        no italics, brand voice).
--   hero_image_credit  — short photographer / source credit shown as a
--                        low-opacity mono-caps overlay in the corner.

ALTER TABLE addie.modules ADD COLUMN IF NOT EXISTS hero_image_url    text;
ALTER TABLE addie.modules ADD COLUMN IF NOT EXISTS hero_image_alt    text;
ALTER TABLE addie.modules ADD COLUMN IF NOT EXISTS hero_image_credit text;

-- Seed curated Unsplash defaults per module. URLs use Unsplash's
-- on-the-fly image API (w=800, q=85, auto=format, fit=crop) so they
-- arrive at appropriate size and format for the module-card aspect
-- ratio (320x220). Each photo was selected to match the module theme:
--   M0 Orientation         — compass / desk / notebook (wayfinding)
--   M1 Awareness           — abstract network / pattern
--   M2 Access & Workflow   — doorway / office entrance (getting in)
--   M3 Prompting           — typewriter / keyboard / notebook
--   M4 Skills              — organized desk / stacked papers (library)
--   M5 Build               — whiteboard / diagrams (prototype launch)

UPDATE addie.modules SET
  hero_image_url    = 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=85&auto=format&fit=crop&crop=focalpoint',
  hero_image_alt    = 'A compass and notebook on a wooden desk, suggesting orientation before a journey.',
  hero_image_credit = 'Photo: Unsplash'
WHERE id = 'm0';

UPDATE addie.modules SET
  hero_image_url    = 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=85&auto=format&fit=crop&crop=focalpoint',
  hero_image_alt    = 'An abstract network of connected nodes, suggesting the structure of a generative model.',
  hero_image_credit = 'Photo: Unsplash'
WHERE id = 'm1';

UPDATE addie.modules SET
  hero_image_url    = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=85&auto=format&fit=crop&crop=focalpoint',
  hero_image_alt    = 'An open office doorway with light spilling through, suggesting access and entry.',
  hero_image_credit = 'Photo: Unsplash'
WHERE id = 'm2';

UPDATE addie.modules SET
  hero_image_url    = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=85&auto=format&fit=crop&crop=focalpoint',
  hero_image_alt    = 'A vintage typewriter beside a notebook, suggesting careful, structured writing.',
  hero_image_credit = 'Photo: Unsplash'
WHERE id = 'm3';

UPDATE addie.modules SET
  hero_image_url    = 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=85&auto=format&fit=crop&crop=focalpoint',
  hero_image_alt    = 'An organized desk with stacked papers and a notebook, suggesting a personal library of saved work.',
  hero_image_credit = 'Photo: Unsplash'
WHERE id = 'm4';

UPDATE addie.modules SET
  hero_image_url    = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=85&auto=format&fit=crop&crop=focalpoint',
  hero_image_alt    = 'A whiteboard covered in diagrams and sticky notes, suggesting a prototype taking shape.',
  hero_image_credit = 'Photo: Unsplash'
WHERE id = 'm5';
