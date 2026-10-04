import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, SKILL_CATALOG, fieldKeysIn } from '.';

const SECTIONS = ['ROLE', 'CONTEXT', 'TASK', 'OUTPUT', 'RULES', 'IF SOMETHING IS MISSING'];
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const today = new Date().toISOString().slice(0, 10);

describe('banker skills catalog', () => {
  it('builds every catalog entry exactly once, with the approved name and group', () => {
    const built = new Map(ALL_SKILLS.map((s) => [s.id, s]));
    expect(ALL_SKILLS.length, 'duplicate ids').toBe(built.size);
    for (const entry of SKILL_CATALOG) {
      const skill = built.get(entry.id);
      expect(skill, `${entry.id} ${entry.name} is not built`).toBeDefined();
      expect(skill?.name).toBe(entry.name);
      expect(skill?.group).toBe(entry.group);
    }
    expect(ALL_SKILLS.length).toBe(SKILL_CATALOG.length);
  });

  it('gives every skill a unique kebab-case slug', () => {
    const slugs = ALL_SKILLS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe.each(ALL_SKILLS.map((s) => [`${s.id} ${s.name}`, s] as const))('%s', (_label, skill) => {
  const declared = skill.fields.map((f) => f.key);
  const required = skill.fields.filter((f) => f.required).map((f) => f.key);

  it('declares exactly the fields its instructions use', () => {
    const used = fieldKeysIn(skill.instructions);
    expect([...used].sort()).toEqual([...declared].sort());
    for (const f of skill.fields) {
      expect(f.key).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.example.length, `${f.key} needs an example`).toBeGreaterThan(0);
      if (f.kind === 'choice') expect(f.options?.length ?? 0).toBeGreaterThanOrEqual(2);
    }
    expect(required.length).toBeGreaterThan(0);
  });

  it('has the full instruction structure', () => {
    let at = -1;
    for (const section of SECTIONS) {
      const i = skill.instructions.indexOf(section);
      expect(i, `${section} missing`).toBeGreaterThan(-1);
      expect(i, `${section} out of order`).toBeGreaterThan(at);
      at = i;
    }
    expect(words(skill.instructions)).toBeGreaterThanOrEqual(150);
  });

  it('keeps the card copy short and complete', () => {
    expect(words(skill.useWhen)).toBeLessThanOrEqual(25);
    expect(words(skill.youGet)).toBeLessThanOrEqual(25);
    expect(skill.checks.length).toBeGreaterThanOrEqual(3);
    expect(skill.checks.length).toBeLessThanOrEqual(5);
    expect(skill.neverPaste.length).toBeGreaterThan(0);
    expect(skill.apps.length).toBeGreaterThan(0);
  });

  it('has a worked example and at least two test cases using its own fields', () => {
    for (const inputs of [skill.example.inputs, ...skill.tests.map((t) => t.inputs)]) {
      for (const key of Object.keys(inputs)) expect(declared, `unknown field ${key}`).toContain(key);
      for (const key of required) expect(Object.keys(inputs), `missing ${key}`).toContain(key);
    }
    expect(skill.example.output.length).toBeGreaterThan(80);
    expect(skill.tests.length).toBeGreaterThanOrEqual(2);
    for (const t of skill.tests) expect(t.rubric.length).toBeGreaterThanOrEqual(2);
  });

  it('names a template field when it uses a bank template', () => {
    if (skill.usesTemplate) expect(declared.some((k) => k.includes('template'))).toBe(true);
  });

  it('is in date', () => {
    expect(skill.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(skill.reviewBy > skill.verifiedOn).toBe(true);
    expect(skill.reviewBy >= today, `${skill.id} needs review`).toBe(true);
  });
});
