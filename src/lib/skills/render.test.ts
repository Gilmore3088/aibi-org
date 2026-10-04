import { describe, expect, it } from 'vitest';
import { ALL_SKILLS } from '@content/skills';
import { SKILL_DESCRIPTION_MAX, fillPrompt, skillDescription, toSkillMd } from './render';
import { buildZip, crc32 } from './zip';

const e1 = ALL_SKILLS.find((s) => s.id === 'E1')!;

describe('fillPrompt', () => {
  it('fills given values and leaves visible gaps for the rest', () => {
    const text = fillPrompt(e1, { draft: 'Please send the file.', audience: 'Ops team' });
    expect(text).toContain('Please send the file.');
    expect(text).toContain('Readers: Ops team');
    expect(text).toContain('[What you need them to do]');
    expect(text).not.toMatch(/\{\{/);
  });
});

describe('toSkillMd', () => {
  it.each(ALL_SKILLS.map((s) => [s.id, s] as const))('%s is a valid Claude Skill', (_id, skill) => {
    const md = toSkillMd(skill);
    expect(md.startsWith('---\nname: ')).toBe(true);
    expect(md).toContain(`name: ${skill.slug}\n`);
    expect(skill.slug.length).toBeLessThanOrEqual(64);
    expect(skillDescription(skill).length).toBeLessThanOrEqual(SKILL_DESCRIPTION_MAX);
    expect(md).not.toMatch(/\{\{/);
    for (const f of skill.fields) expect(md).toContain(f.label);
  });
});

describe('buildZip', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('hello'))).toBe(0x3610a686);
  });

  it('writes a well-formed archive', () => {
    const zip = buildZip([{ path: 'a/SKILL.md', content: 'hi' }]);
    const view = new DataView(zip.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(zip.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(zip.length - 22 + 10, true)).toBe(1);
  });
});
