# Working Skill — {{skill_name}}

**Learner:** {{learner_name}}
**Track:** {{track}}
**Date:** {{created_date}}
**Artifact type:** skill
**Source exercise:** {{source_exercise_id}}

---

## When to use this skill

{{when_to_use}}

This is a Working Skill — a named, parameterized prompt with the
choices locked. Run it on new material whenever the situation it was
built for comes around again. The shape of the output will be the
same every time; only the inputs change.

---

## Inputs

The skill asks you for these slots every run. Keep slot values
abstract — descriptions, public material, generic categories — and
never paste identifiable customer data, MNPI, or supervisory content.

{{#slot_schema}}
- **{{key}}** — {{label}}
  {{help}}
{{/slot_schema}}

---

## Locked choices

The skill fixes these controls for every run. To change them, open
the skill in the Skill Builder, edit, and save a new version — the
prior version is retained.

{{#fixed_lever_selections}}
- **{{lever}}**: `{{value}}`
{{/fixed_lever_selections}}

---

## Guardrail notes

One-line notes you wrote during Lesson 4.4. The notes travel with the
skill so future-you (or a colleague you hand it to) knows what to
watch for.

{{#guardrails}}
- **{{prompt}}** — {{note}}
{{/guardrails}}

---

## Try it

To run this skill, open the Toolbox, select this artifact, fill the
input slots, and press Run. The skill calls `/api/skill/run` with the
slot values; locked choices are applied server-side and cannot be
widened from the client.

---

AiBI-Foundation · The AI Banking Institute
Working Skill · v{{skill_version}}
