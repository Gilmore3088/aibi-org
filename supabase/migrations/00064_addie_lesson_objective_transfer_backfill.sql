-- Audit A8 (2026-05-24): backfill objective_md and transfer_md for every
-- published lesson. Voice: verb-first, observable, Monday-morning. One
-- sentence each — no marketing prose, no "you'll learn." Each transfer
-- names the artifact or workflow the learner takes back to work.

-- ── M0 — Orientation ────────────────────────────────────────────────────────
UPDATE addie.lessons SET
  objective_md = 'Place yourself on the course map and pick the track that matches the work you actually do.',
  transfer_md  = 'On Monday, open the Toolbox once and look at what is already in it; that is the shape of what you will be saving for the rest of the course.'
WHERE id = 'm0.1';

UPDATE addie.lessons SET
  objective_md = 'State the single data-discipline rule in your own words and recognise the off-limits cases in your own role.',
  transfer_md  = 'On Monday, anonymise one piece of work before asking AI anything — describe the situation, not the person.'
WHERE id = 'm0.2';

-- ── M1 — Awareness ──────────────────────────────────────────────────────────
UPDATE addie.lessons SET
  objective_md = 'Explain what a large language model is doing when it answers, in language a colleague will accept.',
  transfer_md  = 'On Monday, when a peer asks "is this AI?", give them the cutoff / token-prediction / hallucination-as-property line — the one you wrote down in the lesson.'
WHERE id = 'm1.1';

UPDATE addie.lessons SET
  objective_md = 'Distinguish assistants from builders and place the three or four tools you have heard of into the right quadrant.',
  transfer_md  = 'On Monday, name the one tool your team is most likely to reach for first — assistant or builder — and why that order is right for your work.'
WHERE id = 'm1.2';

UPDATE addie.lessons SET
  objective_md = 'Articulate two reasons AI literacy is on your job, in the language of your specific role.',
  transfer_md  = 'On Monday, surface one task in your week where AI fluency would have changed last week''s outcome — share it with your manager.'
WHERE id = 'm1.3';

UPDATE addie.lessons SET
  objective_md = 'Tell a good bank-AI use case from a bad one by naming the specific failure mode of the bad one.',
  transfer_md  = 'On Monday, walk one colleague through one good example and one bad example you can name without notes.'
WHERE id = 'm1.4';

-- ── M2 — Access & Workflow ──────────────────────────────────────────────────
UPDATE addie.lessons SET
  objective_md = 'Have a sanctioned AI tool open in your browser by the end of the lesson.',
  transfer_md  = 'On Monday, sign in to the sanctioned tool once before lunch — proof the access actually works.'
WHERE id = 'm2.1';

UPDATE addie.lessons SET
  objective_md = 'Match each of the four tool families to the task you would use it on first.',
  transfer_md  = 'On Monday, pick one tool from one family and use it for the one task you matched it to — not two, not three.'
WHERE id = 'm2.2';

UPDATE addie.lessons SET
  objective_md = 'Run a first AI conversation that produces useful output without leaving the data-discipline rule.',
  transfer_md  = 'On Monday, run the same anonymised prompt against one real piece of work — keep what helps, save it to the Toolbox.'
WHERE id = 'm2.3';

UPDATE addie.lessons SET
  objective_md = 'Map three places in your typical week where an AI assist would compound (and why those, not others).',
  transfer_md  = 'On Monday, try the assist in one of the three spots you mapped — measure the time saved, write it down.'
WHERE id = 'm2.4';

-- ── M3 — Prompting (free finale) ────────────────────────────────────────────
UPDATE addie.lessons SET
  objective_md = 'Compose a four-part prompt (role · task · context · output) for a task on your desk this week.',
  transfer_md  = 'On Monday, replace your shortest "give me a draft of …" request with the four-part version — keep the diff.'
WHERE id = 'm3.1';

UPDATE addie.lessons SET
  objective_md = 'Predict and observe how audience and length levers change the same task''s output.',
  transfer_md  = 'On Monday, write the SAME prompt twice — once for your CEO, once for a new teller — and compare the two outputs side by side.'
WHERE id = 'm3.2';

UPDATE addie.lessons SET
  objective_md = 'Pick the right one of the five prompt patterns for a given task, and defend the pick.',
  transfer_md  = 'On Monday, tag one prompt in your Toolbox with the pattern it fits — Summarize, Draft, Extract, Compare, or Critique.'
WHERE id = 'm3.3';

UPDATE addie.lessons SET
  objective_md = 'Spot a data-discipline violation in a banker''s prompt and articulate which rule it broke.',
  transfer_md  = 'On Monday, read one of your last week''s prompts back to yourself — flag any line you would not put in a board memo.'
WHERE id = 'm3.4';

UPDATE addie.lessons SET
  objective_md = 'Save a Starter Prompt Pack of three real-use-case prompts you will actually open Monday morning.',
  transfer_md  = 'On Monday, open the Pack and run two of the three prompts before noon — the third is for Tuesday.'
WHERE id = 'm3.5';

-- ── M4 — Skills (paid) ──────────────────────────────────────────────────────
UPDATE addie.lessons SET
  objective_md = 'Define what a Skill is, distinct from a prompt, distinct from a workflow.',
  transfer_md  = 'On Monday, name one prompt in your Toolbox that ought to be a Skill — flag it for the next lesson.'
WHERE id = 'm4.1';

UPDATE addie.lessons SET
  objective_md = 'Convert one Toolbox prompt into a reusable Skill with locked levers and labelled slots.',
  transfer_md  = 'On Monday, run the Skill against three different inputs and confirm the locked levers held; if any input failed, refine and save.'
WHERE id = 'm4.2';

UPDATE addie.lessons SET
  objective_md = 'Build a Skill that fits the work specific to your track and could be used by another banker in the same role.',
  transfer_md  = 'On Monday, share the Skill with one peer in the same role — observe whether they use it without further instruction.'
WHERE id = 'm4.3';

UPDATE addie.lessons SET
  objective_md = 'Test a Skill against the guardrail rubric: source, scope, drift, and the data-discipline rule.',
  transfer_md  = 'On Monday, run the guardrail check on every Skill you saved last week — promote the ones that pass; archive the ones that fail.'
WHERE id = 'm4.4';

-- ── M5 — Build (paid) ───────────────────────────────────────────────────────
UPDATE addie.lessons SET
  objective_md = 'Describe what an AI agent is — and is not — in language your CRO would sign off on.',
  transfer_md  = 'On Monday, give the one-paragraph definition to a non-technical colleague and have them paraphrase it back to you.'
WHERE id = 'm5.1';

UPDATE addie.lessons SET
  objective_md = 'Frame a problem worth building for: real, repetitive, scoped, with a clear owner.',
  transfer_md  = 'On Monday, name the problem out loud to the owner and confirm they agree it is the one worth building for.'
WHERE id = 'm5.2';

UPDATE addie.lessons SET
  objective_md = 'Author a one-page PRD that another banker could open and start building from.',
  transfer_md  = 'On Monday, share the PRD with one peer — if they cannot tell you what the first build step is, the PRD is not done.'
WHERE id = 'm5.3';

UPDATE addie.lessons SET
  objective_md = 'Open a prototyping tool, paste the PRD as the opening prompt, and ship one working artifact before stopping.',
  transfer_md  = 'On Monday, send the prototype URL to one colleague with the question: "Would you use this if it were real?"'
WHERE id = 'm5.4';

UPDATE addie.lessons SET
  objective_md = 'Name the next two things you will build — and the support you need to keep building.',
  transfer_md  = 'On Monday, put the next build on your calendar and the support ask on the next leadership 1:1 agenda.'
WHERE id = 'm5.5';
