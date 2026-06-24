import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOUNDATION_MODULE_COUNT } from './course-config';
import { FOUNDATION_MICRO_MODULES } from './micro-modules';
import { getArtifactFirst } from './artifact-first';
import { getFoundationLabBrief, getFoundationRoleTransfer } from './lab-first';
import { buildModuleActivity, getModuleActivitySpec } from './module-activities';
import { MODULE_3_PROMPTING_ACTIVITIES } from './module-3-activities';
import { ROLE_PATHS } from './role-paths';
import { courseArtifactToToolboxSkill } from '@/lib/toolbox/save-mappers';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sampleValue(label: string): string {
  return `Sample banker work for ${label}. It is specific enough for a manager to review and reuse safely.`;
}

describe('late Foundation course activity artifacts', () => {
  const retiredLabPattern = new RegExp(
    ['final', 'lab'].join(' ') + '|' + ['Final Foundation', 'Lab'].join(' '),
    'i',
  );

  it('has one downloadable artifact contract per Foundation module', () => {
    for (let moduleNumber = 1; moduleNumber <= FOUNDATION_MODULE_COUNT; moduleNumber += 1) {
      const spec = getModuleActivitySpec(moduleNumber);

      expect(spec, `module ${moduleNumber} artifact spec`).toBeTruthy();
      expect(spec?.moduleNumber).toBe(moduleNumber);
      expect(spec?.fields.length).toBeGreaterThanOrEqual(1);
      expect(spec?.artifactFilename).toMatch(/^aibi-.+\.md$/);
      expect(spec?.artifactTemplate).toContain('Saved to the AiBI-Foundation Packet');
    }
  });

  it('does not keep stale 12-module activity contracts as a fallback', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'content/courses/foundation-program/module-activities.ts'),
      'utf8',
    );

    expect(source).not.toContain('const MODULE_ACTIVITIES:');
    expect(source).not.toContain('Workday wins — rewrite one banker email');
    expect(source).not.toContain('aibi-p-m1-email-rewrite.md');
    expect(source).not.toContain('Spot the AI hallucination');
    expect(source).not.toContain('aibi-foundation-m12-safe-use-checklist.md');
    expect(getModuleActivitySpec(0)).toBeUndefined();
    expect(getModuleActivitySpec(19)).toBeUndefined();
  });

  it('keeps every micro-module action-led with a distinct saved takeaway', () => {
    const outputs = new Set<string>();
    const missions = new Set<string>();

    for (const microModule of FOUNDATION_MICRO_MODULES) {
      const conceptWords = microModule.plainLanguageConcept.split(/\s+/).filter(Boolean);

      expect(microModule.mission, `module ${microModule.number} mission`).toMatch(/\S/);
      expect(microModule.tryTask, `module ${microModule.number} try task`).toMatch(/\S/);
      expect(microModule.buildTask, `module ${microModule.number} build task`).toMatch(/\S/);
      expect(microModule.saveArtifact, `module ${microModule.number} saved artifact`).toMatch(/\S/);
      expect(microModule.proofToSave, `module ${microModule.number} proof to save`).toMatch(/\S/);
      expect(microModule.bankingGuardrail, `module ${microModule.number} guardrail`).toMatch(/\S/);
      expect(conceptWords.length, `module ${microModule.number} visible concept word count`).toBeLessThanOrEqual(45);
      expect(microModule.tryTask).not.toBe(microModule.buildTask);

      expect(outputs.has(microModule.saveArtifact), `duplicate output: ${microModule.saveArtifact}`).toBe(false);
      expect(missions.has(microModule.mission), `duplicate mission: ${microModule.mission}`).toBe(false);
      outputs.add(microModule.saveArtifact);
      missions.add(microModule.mission);
    }
  });

  it('keeps each module output connected to the visible lab, packet, and day-job transfer path', () => {
    for (const microModule of FOUNDATION_MICRO_MODULES) {
      const labBrief = getFoundationLabBrief(microModule.number);
      const artifactMeta = getArtifactFirst(microModule.number);
      const roleTransfer = getFoundationRoleTransfer(microModule.number, 'other');
      const spec = getModuleActivitySpec(microModule.number);
      if (!spec) throw new Error(`Missing module ${microModule.number} artifact spec`);
      const activity = buildModuleActivity(spec);

      expect(labBrief?.outcome, `module ${microModule.number} lab outcome`).toBe(microModule.mission);
      expect(labBrief?.labTask, `module ${microModule.number} lab task`).toBe(microModule.tryTask);
      expect(labBrief?.artifactAction, `module ${microModule.number} artifact action`).toBe(microModule.buildTask);
      expect(labBrief?.learningLoop.transferPrompt, `module ${microModule.number} transfer prompt`).toBe(microModule.transferMove);
      expect(labBrief?.bankingGuardrail, `module ${microModule.number} lab guardrail`).toBe(microModule.bankingGuardrail);

      expect(artifactMeta?.saved, `module ${microModule.number} artifact saved label`).toBe(microModule.saveArtifact);
      expect(artifactMeta?.usedFor, `module ${microModule.number} artifact day-job use`).toBe(microModule.transferMove);
      expect(artifactMeta?.mustProve, `module ${microModule.number} artifact proof`).toBe(microModule.bankingGuardrail);

      expect(roleTransfer?.transferMove, `module ${microModule.number} role transfer move`).toBe(microModule.transferMove);
      expect(roleTransfer?.proofToSave, `module ${microModule.number} role proof to save`).toBe(microModule.proofToSave);

      expect(activity.id, `module ${microModule.number} activity id`).toBe(`${microModule.number}.1`);
      expect(activity.title, `module ${microModule.number} activity title`).toBe(`Build: ${microModule.saveArtifact}`);
      expect(activity.completionTrigger, `module ${microModule.number} activity trigger`).toBe('artifact-download');
      expect(activity.artifactId, `module ${microModule.number} artifact id`).toBe(
        spec.artifactFilename.replace(/\.md$/, ''),
      );
    }
  });

  it('aligns every activity artifact with the 18-module learning ladder', () => {
    for (const microModule of FOUNDATION_MICRO_MODULES) {
      const spec = getModuleActivitySpec(microModule.number);
      const expectedSlug = slugify(microModule.saveArtifact);

      expect(spec, `module ${microModule.number} artifact spec`).toBeTruthy();
      expect(spec?.title, `module ${microModule.number} activity title`).toBe(
        `Build: ${microModule.saveArtifact}`,
      );
      expect(spec?.description, `module ${microModule.number} activity description`).toBe(
        microModule.buildTask,
      );
      expect(spec?.artifactFilename, `module ${microModule.number} filename`).toContain(
        `m${microModule.number}-${expectedSlug}`,
      );
      expect(spec?.artifactTemplate, `module ${microModule.number} saved artifact heading`).toContain(
        microModule.saveArtifact,
      );
      expect(spec?.artifactTemplate, `module ${microModule.number} banking guardrail`).toContain(
        microModule.bankingGuardrail,
      );
    }
  });

  it('keeps role deep-dive paths aligned to current micro-modules', () => {
    const microModuleByNumber = new Map(
      FOUNDATION_MICRO_MODULES.map((module) => [module.number, module]),
    );

    for (const path of Object.values(ROLE_PATHS)) {
      for (const deepDive of path.deepDiveModules) {
        const microModule = microModuleByNumber.get(deepDive.moduleNumber);
        expect(microModule, `${path.role} module ${deepDive.moduleNumber}`).toBeTruthy();
        expect(deepDive.moduleId, `${path.role} module id`).toBe(microModule?.id);
        expect(deepDive.title, `${path.role} module title`).toBe(microModule?.title);
      }
    }
  });

  it('keeps activity builders short enough for a micro-module', () => {
    for (const microModule of FOUNDATION_MICRO_MODULES) {
      const spec = getModuleActivitySpec(microModule.number);
      if (!spec) throw new Error(`Missing module ${microModule.number} artifact spec`);

      expect(spec.fields.length, `module ${microModule.number} field count`).toBeLessThanOrEqual(4);
      expect(spec.description.split(/\s+/).length, `module ${microModule.number} description words`).toBeLessThanOrEqual(18);

      for (const field of spec.fields) {
        expect(field.minLength, `module ${microModule.number} ${field.id} min length`).toBeLessThanOrEqual(24);
        expect(field.label.split(/\s+/).length, `module ${microModule.number} ${field.id} label words`).toBeLessThanOrEqual(9);
        expect(field.placeholder, `module ${microModule.number} ${field.id} placeholder`).toMatch(/\S/);
      }
    }
  });

  it('keeps Module 3 prompt building scaffolded instead of a long blank-page gate', () => {
    const promptBuilder = MODULE_3_PROMPTING_ACTIVITIES.find((activity) => activity.id === '3.2');
    if (!promptBuilder) throw new Error('Missing Module 3 prompt builder');

    expect(MODULE_3_PROMPTING_ACTIVITIES.map((activity) => activity.id)).toEqual(['3.1', '3.2']);
    expect(promptBuilder.type).toBe('builder');
    expect(promptBuilder.description).toMatch(/worked starter prompt/i);
    expect(promptBuilder.fields[0]?.minLength).toBeLessThanOrEqual(30);
  });

  it('maps every module artifact into a Toolbox-ready day-job asset', () => {
    const commands = new Set<string>();
    const promptTemplateModules = new Set([2, 4, 5, 6, 8, 9, 10]);

    for (const microModule of FOUNDATION_MICRO_MODULES) {
      const spec = getModuleActivitySpec(microModule.number);
      if (!spec) throw new Error(`Missing module ${microModule.number} artifact spec`);
      const artifactName = spec.title.replace(/^Build:\s*/i, '').trim();
      const skill = courseArtifactToToolboxSkill(
        {
          moduleNumber: microModule.number,
          activityId: `${microModule.number}.1`,
          artifactName,
          fields: spec.fields.map((field) => ({
            id: field.id,
            label: field.label,
            value: sampleValue(field.label),
          })),
          reviewNote: `Reviewed against this banking guardrail: ${microModule.bankingGuardrail}`,
          transferPlan: microModule.transferMove,
          readiness: 'reuse',
        },
        'test-user',
      );

      expect(skill.name, `module ${microModule.number} toolbox skill name`).toBe(
        `M${microModule.number}: ${microModule.saveArtifact}`,
      );
      expect(skill.cmd, `module ${microModule.number} toolbox command`).toBe(
        `/foundation-m${microModule.number}-${slugify(microModule.saveArtifact)}`,
      );
      expect(skill.source, `module ${microModule.number} toolbox source`).toBe('course');
      expect(skill.sourceRef, `module ${microModule.number} toolbox source ref`).toBe(
        `aibi-p/module-${microModule.number}/${microModule.number}.1`,
      );
      expect(skill.maturity, `module ${microModule.number} toolbox maturity`).toBe('pilot');
      expect(skill.desc, `module ${microModule.number} day-job transfer`).toContain(
        'Saved from AiBI-Foundation',
      );
      expect(skill.desc, `module ${microModule.number} first reuse`).toContain(
        microModule.transferMove.slice(0, 30),
      );
      expect(skill.kind, `module ${microModule.number} toolbox kind`).toBe(
        promptTemplateModules.has(microModule.number) ? 'template' : 'workflow',
      );
      expect(commands.has(skill.cmd), `duplicate toolbox command: ${skill.cmd}`).toBe(false);
      commands.add(skill.cmd);
    }
  });

  it('gives modules 15, 16, and 17 distinct artifact contracts', () => {
    const module15 = getModuleActivitySpec(15);
    const module16 = getModuleActivitySpec(16);
    const module17 = getModuleActivitySpec(17);

    expect(module15?.title).toBe('Build: Human Review Gate Card');
    expect(module16?.title).toBe('Build: AI Evidence Note');
    expect(module17?.title).toBe('Build: Reusable Workflow Kit');

    expect(module15?.fields.map((field) => field.id)).toEqual([
      'paused_work',
      'reviewer_decision',
      'escalation_trigger',
      'resume_condition',
    ]);
    expect(module16?.fields.map((field) => field.id)).toEqual([
      'prompt_and_source',
      'raw_output_summary',
      'human_edits',
      'final_owner_boundary',
    ]);
    expect(module17?.fields.map((field) => field.id)).toEqual([
      'workflow_purpose',
      'prompt_or_skill',
      'checkpoint_and_escalation',
      'peer_test_plan',
    ]);
  });

  it('keeps module 17 focused on one reusable workflow, not the final packet review', () => {
    const module17 = getModuleActivitySpec(17);

    expect(module17?.artifactFilename).toBe(
      'aibi-foundation-m17-reusable-workflow-kit.md',
    );
    expect(module17?.artifactTemplate).toContain('Reusable Workflow Kit');
    expect(module17?.artifactTemplate).toContain('Peer test plan before reuse');
    expect(module17?.artifactTemplate).not.toContain('Foundation Packet Summary');
  });

  it('uses module 18 for the final Foundation Packet summary', () => {
    const module18 = getModuleActivitySpec(18);

    expect(module18?.title).toBe('Build: Foundation Packet Summary');
    expect(module18?.artifactFilename).toBe(
      'aibi-foundation-m18-foundation-packet-summary.md',
    );
    expect(module18?.artifactTemplate).toContain('Foundation Packet Summary');
    expect(module18?.artifactTemplate).not.toMatch(retiredLabPattern);
  });
});
