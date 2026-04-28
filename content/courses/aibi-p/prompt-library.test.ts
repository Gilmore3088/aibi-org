import { describe, expect, it } from 'vitest';
import {
  ALL_PROMPTS,
  filterPrompts,
  getPromptSafetyLevel,
  getPromptTaskType,
  getPromptTimeMinutes,
} from './prompt-library';

describe('prompt metadata helpers', () => {
  it('derives task type from prompt content', () => {
    const emailPrompt = ALL_PROMPTS.find((prompt) => prompt.title.includes('Email'));
    expect(emailPrompt).toBeDefined();
    expect(getPromptTaskType(emailPrompt!)).toBe('email');
  });

  it('derives safety level from banking content', () => {
    const compliancePrompt = ALL_PROMPTS.find((prompt) => prompt.role === 'compliance');
    expect(compliancePrompt).toBeDefined();
    expect(['yellow', 'red']).toContain(getPromptSafetyLevel(compliancePrompt!));
  });

  it('parses time estimate minutes', () => {
    expect(getPromptTimeMinutes(ALL_PROMPTS[0])).toBeGreaterThan(0);
  });
});

describe('filterPrompts', () => {
  it('filters by query and task type', () => {
    const results = filterPrompts({ query: 'email', taskType: 'email' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((prompt) => getPromptTaskType(prompt) === 'email')).toBe(true);
  });

  it('filters by module and maximum minutes', () => {
    const results = filterPrompts({ module: 3, maxMinutes: 10 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((prompt) => prompt.relatedModule === 3)).toBe(true);
    expect(results.every((prompt) => getPromptTimeMinutes(prompt) <= 10)).toBe(true);
  });
});
