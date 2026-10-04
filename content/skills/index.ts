// Banker skills library: every skill, plus lookups by id, slug and group.

import type { BankerSkill, SkillGroup } from './types';
import { EVERYDAY_SKILLS } from './everyday';
import { OFFICE_SKILLS } from './office';
import { MARKETING_SKILLS } from './marketing';
import { RETAIL_SKILLS } from './retail';
import { LENDING_SKILLS } from './lending';
import { COMPLIANCE_SKILLS } from './compliance';
import { BSA_AML_SKILLS } from './bsa-aml';
import { OPERATIONS_SKILLS } from './operations';
import { EXECUTIVE_SKILLS } from './executive';
import { INFOSEC_SKILLS } from './infosec';
import { TRAINING_HR_SKILLS } from './training-hr';

export type { BankerSkill, SkillField, SkillGroup, SkillApp, SkillTest } from './types';
export { SKILL_CATALOG } from './catalog';

export const ALL_SKILLS: readonly BankerSkill[] = [
  ...EVERYDAY_SKILLS,
  ...OFFICE_SKILLS,
  ...MARKETING_SKILLS,
  ...RETAIL_SKILLS,
  ...LENDING_SKILLS,
  ...COMPLIANCE_SKILLS,
  ...BSA_AML_SKILLS,
  ...OPERATIONS_SKILLS,
  ...EXECUTIVE_SKILLS,
  ...INFOSEC_SKILLS,
  ...TRAINING_HR_SKILLS,
];

export function getSkillBySlug(slug: string): BankerSkill | undefined {
  return ALL_SKILLS.find((s) => s.slug === slug);
}

export function getSkillsByGroup(group: SkillGroup): readonly BankerSkill[] {
  return ALL_SKILLS.filter((s) => s.group === group);
}

/** {{field}} keys used in a skill's instructions, in order of first use. */
export function fieldKeysIn(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{([a-z0-9_]+)\}\}/g)].map((m) => m[1]))];
}
