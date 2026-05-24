-- Audit A20 (2026-05-24): standardise the [stat] open + [save] close
-- discipline across all 24 lessons. The bodies already carry [stat]
-- openers (24 in place); [save] closers only ship in 2 of 24. Pair 2
-- (Sara) flagged the inconsistency — the [save] beat is the
-- screenshot-bait closing line every lesson is supposed to earn.
--
-- This migration appends a one-line [save] beat to any lesson whose
-- body does not already contain one. The beat is the discrete takeaway
-- the learner is expected to carry — bold-led, banker-direct, no
-- marketing prose. Each line is hand-authored per lesson; the order
-- mirrors the lesson sequence so the appended block is consistent.
--
-- Idempotent — the position lookup uses `not contains '> [save]'`.

-- ── helper: append a beat if not already present ────────────────────────────
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN SELECT * FROM (VALUES
    ('m1.1', '**What it is doing is pattern-completion against a snapshot of the world.** Not retrieval. Not opinion. The implications follow from the mechanism.'),
    ('m1.2', '**Pick the family that fits the job — not the icon on your taskbar.** Thinking partner for drafts. Research assistant for citations. Construction crew for software. Embedded copilot for what is already inside your tools.'),
    ('m1.3', '**Your role is the lens. The course is the same; what you read against it is not.** Set the track once; switch any time.'),
    ('m1.4', '**A bank example earns its place when you can name what it is testing — and what it would fail.** No abstractions; the examples on this page are the examples to remember.'),
    ('m2.1', '**Access is the cheapest fix in the course.** Sanctioned tool open, signed in, before lunch on Monday.'),
    ('m2.2', '**Four families, one job each.** When the thinking partner fails on facts, the answer is not "try harder" — it is "switch families."'),
    ('m2.3', '**Describe the situation, not the person — and the model writes the part you wanted help with.** That is your first conversation; everything else is variation on this discipline.'),
    ('m2.4', '**Three places where an assist would compound — not a list of "AI use cases."** The rest of the course turns one of the three into something you can ship.'),
    ('m3.1', '**Role · Task · Context · Output.** Four lines, in order, every prompt that has to land cleanly.'),
    ('m3.2', '**Same task, different audience and length — different draft.** Two CEOs read the same Reg E summary differently. The lever is yours.'),
    ('m3.3', '**Five shapes carry most prompts. Memorise the shapes; the words bend to fit.** Pattern one until you need more — most prompts never do.'),
    ('m3.4', '**Read the second sentence. The violations hide there.** Trust the discomfort, then check the rule.'),
    ('m4.1', '**A Skill is a prompt with the levers locked, the slots labelled, and an owner.** That distinction is what separates "I used AI once" from "the team uses AI."'),
    ('m4.2', '**Two clean runs on different inputs verifies a Skill.** Perfection is a trap; consistency is the bar.'),
    ('m4.3', '**A Skill that fits another banker in the same role is a Skill that compounds.** Yours is the first; theirs is the test.'),
    ('m4.4', '**Four notes attach to a verified Skill. Future-you opens it knowing where the soft spots are.** Promote on the right answers; archive on the wrong ones.'),
    ('m5.1', '**Agents are systems that take action without re-prompting at every step.** Knowing what one is — and is not — is the prerequisite to writing a PRD for one.'),
    ('m5.2', '**A real problem is repetitive, scoped, and owned. The other ones are wishes.** Frame the wish away and the build follows.'),
    ('m5.3', '**A one-page PRD is a contract, not a wish list. Every sentence narrows the build.** Spend ten minutes on the goal; the other eight sections fall out.'),
    ('m5.4', '**Prototyping is the hour outside this course where the PRD meets the tool.** Come back with a URL.'),
    ('m5.5', '**Two more builds and the team-buy ask earn their place in your next leadership 1:1.** The course ends; the work does not.')
  ) AS t(lesson_id, save_line) LOOP
    UPDATE addie.lessons
    SET body_md = body_md || E'\n\n> [save] ' || rec.save_line
    WHERE id = rec.lesson_id
      AND body_md IS NOT NULL
      AND position('> [save]' IN body_md) = 0;
  END LOOP;
END $$;
