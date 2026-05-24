# Skill Template — {{skill_name}}

**Learner:** {{learner_name}}
**Track:** {{track}}
**Date:** {{created_date}}
**Artifact type:** skill_template
**Source exercise:** {{source_exercise_id}}

---

## When to use this template

{{when_to_use}}

A template is a saved shape, not a finished skill. The locked choices
below are the recommended defaults; the input slots are the bits that
will change every time a Working Skill built from this template gets
run on new material.

---

## Inputs (filled at run time)

These are the slots a Working Skill built from this template will ask
for. Each slot is named, labelled for future-you, and constrained to
descriptions or public material — never customer identifiers, never
MNPI.

{{#slot_schema}}
- **{{key}}** — {{label}}
  {{help}}
{{/slot_schema}}

---

## Locked choices

These are the controls the template fixes for every run. Override at
the Skill Builder if your role's defaults need adjusting.

{{#fixed_lever_selections}}
- **{{lever}}**: `{{value}}`
{{/fixed_lever_selections}}

---

## How a Working Skill built from this template behaves

Run-time experience: the skill asks you for the input slots above,
applies the locked choices, calls the underlying source exercise
through the same controlled sandbox the rest of the course uses, and
returns the model output. The skill never widens the controls — only
the slot values change between runs.

---

AiBI-Foundation · The AI Banking Institute
Skill Template · v{{template_version}}
