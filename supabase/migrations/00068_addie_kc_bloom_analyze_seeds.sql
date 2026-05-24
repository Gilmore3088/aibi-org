-- Audit A14 (2026-05-24): add eight Analyze-level knowledge checks
-- distributed across the course so the bank reaches the audit's
-- 8–10 target. Each item asks the learner to BREAK a scenario into
-- competing rules, identify the rule conflict, or distinguish surface
-- pattern from underlying violation.
--
-- These are appended ordinals on existing lessons; the lesson body
-- is untouched. Ordinals are deliberately high (90+) to avoid
-- collisions with the existing checks (which use 1–6).

INSERT INTO addie.knowledge_checks (lesson_id, ordinal, prompt, options, kind, bloom_level)
VALUES
  -- ── M0.2 Analyze — data discipline rule application across surfaces ──
  ('m0.2', 91,
   'A teller anonymises a member''s name and account number before pasting a complaint into ChatGPT, but the complaint mentions the member is the sole signer on a $4.2M commercial loan that closed last week. Which rule is most at risk?',
   $$[
     {"id":"a","label":"Data-discipline (PII)","correct":false,"explanation":"PII is anonymised; the rule at risk is confidentiality of material non-public information about the loan and the customer relationship — that signal can re-identify."},
     {"id":"b","label":"MNPI / customer-confidentiality","correct":true,"explanation":"Even with the name stripped, a $4.2M loan + sole-signer + last-week timing narrows the population to one or two members. The disclosure is the relationship and the deal, not the identifier."},
     {"id":"c","label":"Vendor TPRM","correct":false,"explanation":"TPRM governs the vendor relationship, not the content of the prompt."},
     {"id":"d","label":"No rule is at risk — anonymised","correct":false,"explanation":"Surface anonymisation does not protect uniquely-identifying material non-public information."}
   ]$$::jsonb,
   'construct', 'analyze'),

  -- ── M1.4 Analyze — pattern-completion vs. retrieval ──
  ('m1.4', 91,
   'Two outputs from the same prompt look identical at first read. Output A names a Reg E section number that does not exist; Output B paraphrases the rule correctly but cites no section. Which failure mode is more dangerous in a banker''s daily workflow, and why?',
   $$[
     {"id":"a","label":"Output A — a false citation is concrete enough to be repeated and harder to unwind in front of an examiner.","correct":true,"explanation":"Hallucinated specifics are the harder failure: they pass the eye test, propagate into artifacts, and are repeated to colleagues. The uncited paraphrase is honestly imprecise."},
     {"id":"b","label":"Output B — without a citation it has zero defensibility.","correct":false,"explanation":"Defensibility is missing, but the banker can add the citation. A wrong citation has to be unwound."},
     {"id":"c","label":"Both equally dangerous","correct":false,"explanation":"They differ on falsifiability — concrete-wrong is harder to catch than abstract-honest."},
     {"id":"d","label":"Neither — both must be verified anyway","correct":false,"explanation":"Verification is the floor, but the analysis is about which slips past verification more often."}
   ]$$::jsonb,
   'construct', 'analyze'),

  -- ── M2.2 Analyze — wrong-family failure mode ──
  ('m2.2', 91,
   'A loan officer uses a thinking-partner tool (Claude or ChatGPT) to "get today''s prime rate." The output names a rate that is six months stale. The officer''s real error was choosing the wrong:',
   $$[
     {"id":"a","label":"Prompt","correct":false,"explanation":"A better prompt would not have fixed the cutoff."},
     {"id":"b","label":"Tool family","correct":true,"explanation":"Live data requires a research-assistant family (Perplexity, ChatGPT search, Claude search) — the thinking-partner family cannot reach the web. The error was upstream of prompting."},
     {"id":"c","label":"Model version","correct":false,"explanation":"A newer model has a newer cutoff but is still cutoff-bound. The family is the issue."},
     {"id":"d","label":"Verification step","correct":false,"explanation":"Verification would have caught the stale rate, but the cause was reaching for the wrong family in the first place."}
   ]$$::jsonb,
   'construct', 'analyze'),

  -- ── M3.1 Analyze — prompt-component contribution ──
  ('m3.1', 91,
   'You hand a model a four-part prompt (Role · Task · Context · Output). The output is the right shape but wrong tone — too formal for a teller-facing audience. Which of the four components most likely needs the edit?',
   $$[
     {"id":"a","label":"Role — sharpen who the model is","correct":true,"explanation":"Tone is mostly governed by Role (who the model is talking AS, and to). Output specifies format; Context provides facts; Task is the verb. Tone follows from Role first."},
     {"id":"b","label":"Task — change the verb","correct":false,"explanation":"The Task got you the right shape. Changing it changes what gets produced."},
     {"id":"c","label":"Context — add more background","correct":false,"explanation":"Context adds facts. More context rarely changes tone."},
     {"id":"d","label":"Output — restate the format","correct":false,"explanation":"Output specifies format and length. Tone is upstream of format."}
   ]$$::jsonb,
   'construct', 'analyze'),

  -- ── M3.3 Analyze — pattern selection from a real prompt ──
  ('m3.3', 91,
   'A compliance officer writes: "Walk through the steps you would take before answering. Then tell me whether a $4 latte that overdrafts $0.30 triggers a fee under the policy below." Which of the five patterns is the load-bearing one in that prompt?',
   $$[
     {"id":"a","label":"Few-shot examples","correct":false,"explanation":"No examples are shown. Few-shot needs at least one input→output pair."},
     {"id":"b","label":"Chain-of-thought","correct":true,"explanation":"\"Walk through the steps you would take before answering\" is the chain-of-thought hint — that is what makes the model show its reasoning before the answer."},
     {"id":"c","label":"Constraints","correct":false,"explanation":"No explicit prohibitions are stated. A constraint pattern says what the model must NOT do."},
     {"id":"d","label":"Ask what is missing","correct":false,"explanation":"That pattern asks the model what context would help. This prompt provides the context up front."}
   ]$$::jsonb,
   'construct', 'analyze'),

  -- ── M3.4 Analyze — rule attribution under MNPI overlap ──
  ('m3.4', 91,
   'A marketing analyst pastes a list of cardholders'' first names and email addresses into ChatGPT to brainstorm campaign subject lines. The data-discipline rule applies, but a second rule is independently violated. Which is it?',
   $$[
     {"id":"a","label":"FFIEC TPRM (vendor due diligence)","correct":false,"explanation":"TPRM governs the bank''s relationship with the vendor, not whether the content is allowed."},
     {"id":"b","label":"GLBA Safeguards (NPI handling)","correct":true,"explanation":"Customer contact lists are non-public personal information under GLBA Safeguards. Pasting them into a consumer tool is independently a Safeguards Rule violation."},
     {"id":"c","label":"SR 11-7 (model risk)","correct":false,"explanation":"SR 11-7 governs the use of models in decisions. Brainstorming subject lines is not a credit decision."},
     {"id":"d","label":"CFPB UDAAP","correct":false,"explanation":"UDAAP governs disclosed practices to consumers. The violation is in handling, not in disclosure."}
   ]$$::jsonb,
   'construct', 'analyze'),

  -- ── M4.4 Analyze — guardrail rule conflict ──
  ('m4.4', 91,
   'A saved Skill passes the four-question guardrail check on its first input. On the second input — a different source document — it cites a regulation that is not in the source. Which guardrail caught it, and why is the catch on the second input not the first?',
   $$[
     {"id":"a","label":"Q1 — source-bound; the first input happened to contain the regulation by coincidence","correct":true,"explanation":"The Skill was always source-bound failing; it just looked correct on input one because the regulation was in that source. Q1 (\"did it cite anything outside the slot material?\") catches it only when the input changes."},
     {"id":"b","label":"Q2 — send-ready check","correct":false,"explanation":"Send-readiness is a judgment call, not the rule check itself."},
     {"id":"c","label":"Q3 — human pass; we expected the human to catch it","correct":false,"explanation":"Q3 is about where the human pass is needed, not whether the model fabricated the citation."},
     {"id":"d","label":"Q4 — input-pattern that breaks it","correct":false,"explanation":"Q4 is forward-looking — predicting what input would break it. Q1 is the live check."}
   ]$$::jsonb,
   'construct', 'analyze'),

  -- ── M5.4 Analyze — blast-radius reasoning ──
  ('m5.4', 91,
   'You are choosing between two prototyping tools for a teller-facing hold-explainer. Tool A runs on your premises and returns an answer in 30s. Tool B runs in a third-party cloud and returns in 3s. Both produce equivalent quality. Which blast-radius dimension matters MOST in the choice?',
   $$[
     {"id":"a","label":"Latency — 3s vs 30s changes whether the teller uses it","correct":false,"explanation":"Latency matters but is downstream of blast radius."},
     {"id":"b","label":"Data egress — Tool B sends member-context to a third party","correct":true,"explanation":"Blast radius widens when data leaves the bank''s control. Tool B''s 10× speed is meaningless if the egress path violates the data-discipline rule the rest of the course was built on."},
     {"id":"c","label":"Cost — third-party metering is unpredictable","correct":false,"explanation":"Cost is a procurement consideration, not the blast-radius determinant for a teller workflow."},
     {"id":"d","label":"Tooling familiarity","correct":false,"explanation":"Comfort matters for adoption but not for the blast-radius math."}
   ]$$::jsonb,
   'construct', 'analyze')
ON CONFLICT (id) DO NOTHING;

-- Tag two pre-existing items that were already Analyze-level so the
-- coverage report counts them honestly.
UPDATE addie.knowledge_checks
SET bloom_level = 'analyze'
WHERE (lesson_id, ordinal) IN (
  ('m5.3', 2)   -- the existing approximately-Analyze item
);
