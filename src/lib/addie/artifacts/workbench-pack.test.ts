import { describe, it, expect } from 'vitest';
import {
  packToMarkdown,
  isPackComplete,
  type WorkbenchPackContent,
} from './workbench-pack';

const validPack: WorkbenchPackContent = {
  sourcePacket: 'A draft adverse-action letter (synthetic) with a fabricated reg cite.',
  promptUsed: 'You are a compliance analyst. Tighten the writing and remove invented citations.',
  firstOutput: 'Dear Member, ...',
  reviewTags: ['fabricated citation', 'tone off for member-facing'],
  improvedOutput: 'Dear Member, ... (cleaner tone)',
  questionsToConfirm: [
    'Does the output cite anything outside the source packet?',
    'Comfortable sending as-is?',
    'Where does it need a human pass?',
    'One input that would break this Pack?',
  ],
  finalWorkProduct: 'Dear Member, ... (final, anonymized, send-ready).',
  version: 1,
  approver: null,
  useBoundary: 'personal sandbox',
  validationNotes: 'Two clean runs on different synthetic adverse-action shapes.',
};

describe('packToMarkdown', () => {
  it('renders all seven pedagogical sections + governance header', () => {
    const md = packToMarkdown(validPack);
    expect(md).toContain('# Workbench Pack — v1');
    expect(md).toContain('**Use boundary:** personal sandbox');
    expect(md).toContain('## Source packet');
    expect(md).toContain('## Prompt used');
    expect(md).toContain('## First output');
    expect(md).toContain('## Review tags');
    expect(md).toContain('## Improved output');
    expect(md).toContain('## Questions to confirm');
    expect(md).toContain('## Final work product');
    expect(md).toContain('## Validation notes');
  });

  it('formats review tags as a bullet list', () => {
    const md = packToMarkdown(validPack);
    expect(md).toContain('- fabricated citation');
    expect(md).toContain('- tone off for member-facing');
  });

  it('numbers the confirmation questions', () => {
    const md = packToMarkdown(validPack);
    expect(md).toContain('1. Does the output cite anything outside the source packet?');
    expect(md).toContain('4. One input that would break this Pack?');
  });

  it('shows _(none — personal use)_ for the approver when null', () => {
    const md = packToMarkdown(validPack);
    expect(md).toContain('**Approver:** _(none — personal use)_');
  });

  it('shows the named approver when set', () => {
    const md = packToMarkdown({ ...validPack, approver: 'Margaret Holloway, CRO' });
    expect(md).toContain('**Approver:** Margaret Holloway, CRO');
  });

  it('wraps the prompt in a fenced code block', () => {
    const md = packToMarkdown(validPack);
    expect(md).toMatch(/```\n[\s\S]*?\n```/);
  });

  it('handles an empty review-tags array gracefully', () => {
    const md = packToMarkdown({ ...validPack, reviewTags: [] });
    expect(md).toContain('_(no review tags)_');
  });
});

describe('isPackComplete', () => {
  it('passes a valid pack', () => {
    expect(isPackComplete(validPack)).toBe(true);
  });

  it('fails when any pedagogical core field is empty', () => {
    expect(isPackComplete({ ...validPack, sourcePacket: '' })).toBe(false);
    expect(isPackComplete({ ...validPack, promptUsed: '   ' })).toBe(false);
    expect(isPackComplete({ ...validPack, firstOutput: '' })).toBe(false);
    expect(isPackComplete({ ...validPack, improvedOutput: '' })).toBe(false);
    expect(isPackComplete({ ...validPack, finalWorkProduct: '' })).toBe(false);
  });

  it('fails when no confirmation questions are present', () => {
    expect(isPackComplete({ ...validPack, questionsToConfirm: [] })).toBe(false);
  });

  it('passes with null approver (personal-use Pack)', () => {
    expect(isPackComplete({ ...validPack, approver: null })).toBe(true);
  });
});
