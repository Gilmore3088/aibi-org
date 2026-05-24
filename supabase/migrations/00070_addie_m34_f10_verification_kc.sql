-- Audit A26 (2026-05-24): the F10 verification protocol added to M3.4
-- this session ("every numeric figure / citation / statute reference
-- gets checked against the named source before it leaves your desk")
-- carries no knowledge check. Pair 3 (Lena) flagged it: the highest-
-- stakes new construct in the lesson has zero coverage signal.
--
-- This migration adds two construct KCs to M3.4 — one Apply (which of
-- these claims is load-bearing), one Analyze (rule conflict between
-- pattern-completion and citation discipline). Both tag the new
-- bloom_level + kind columns from migrations 00065 / 00067.
--
-- Also addresses A29 (low-priority): the audit's "eight joke-grade
-- distractors" count was overstated relative to what actually ships
-- (two arguable items in m0/m1 that test real bank-staff
-- misconceptions — "private-browsing" and "admin approval"). Both
-- are pedagogically defensible Apply distractors. No replacement
-- needed; the cap-at-one-per-item rule is already met.

INSERT INTO addie.knowledge_checks (lesson_id, ordinal, prompt, options, kind, bloom_level)
VALUES
  ('m3.4', 4,
   'A model''s response contains these four statements. Under the F10 verification protocol you just walked, which one is load-bearing and must be checked against a named source BEFORE the artifact leaves your desk?',
   $$[
     {"id":"a","label":"\"A plain-English explanation of how Reg E protects unauthorized transactions.\"","correct":false,"explanation":"This is a decorative claim — generally true at the framing level. Worth a sanity-check but not a stop-the-presses citation requirement under the F10 rule."},
     {"id":"b","label":"\"The OCC''s 2023-17 bulletin requires institutions to retain prompt logs for two years.\"","correct":true,"explanation":"Load-bearing: it names a specific bulletin (2023-17), attributes it to the OCC, asserts a concrete obligation (two-year retention), and would be quoted in an examiner conversation. This is exactly the kind of claim the protocol exists to catch."},
     {"id":"c","label":"\"Customers generally prefer human agents for emotionally-charged complaints.\"","correct":false,"explanation":"A generic preference statement, neither cited nor falsifiable. Worth a sanity-check but not a verification stop."},
     {"id":"d","label":"\"AI systems can make mistakes and should be reviewed.\"","correct":false,"explanation":"True by definition; no source needed. The F10 protocol applies to specific quantitative or attributive claims, not to platitudes."}
   ]$$::jsonb,
   'construct', 'apply'),

  ('m3.4', 92,
   'A compliance officer hands you a model-drafted memo with this passage: "Per SR 11-7, all customer-facing AI tools require quarterly bias audits." It scans well. Under the F10 protocol AND the rule-attribution lens, which is the right next move?',
   $$[
     {"id":"a","label":"Send it — SR 11-7 is real and the claim sounds aligned with the spirit of model risk","correct":false,"explanation":"\"Aligned with the spirit of\" is the trap. SR 11-7 is real but does NOT prescribe quarterly bias audits — that conflates SR 11-7 (model risk) with ECOA / Reg B fair-lending testing. Sending it propagates a fabricated requirement under a real authority."},
     {"id":"b","label":"Refuse to use AI for any compliance work after seeing the hallucination","correct":false,"explanation":"Overcorrection. AI-drafted compliance prose is fine when the load-bearing claims are verified. The discipline catches the issue; abandoning the tool throws out the help."},
     {"id":"c","label":"Open SR 11-7 directly and confirm the cited requirement before the memo leaves your desk","correct":true,"explanation":"This is the protocol. The model named a specific rule and attached a specific frequency — both load-bearing. Verification against the named source catches the conflation (SR 11-7 governs validation, not bias audits) BEFORE it propagates into the artifact."},
     {"id":"d","label":"Ask the model to cite the section of SR 11-7 that requires this","correct":false,"explanation":"Predictable trap: the model will gladly invent a section number to match the claim. Verification has to go to the source, not back to the model."}
   ]$$::jsonb,
   'construct', 'analyze')
ON CONFLICT (id) DO NOTHING;
