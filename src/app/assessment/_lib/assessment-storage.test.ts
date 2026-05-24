// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ASSESSMENT_STORAGE_TTL_MS,
  clearAssessment,
  loadAssessment,
  saveAssessment,
} from './assessment-storage';

const KEY = 'aibi-test-key';

describe('A3 — assessment-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T10:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('round-trips a payload through localStorage', () => {
    saveAssessment(KEY, { a: 1, b: 'two' });
    expect(loadAssessment(KEY)).toEqual({ a: 1, b: 'two' });
    // The envelope is in localStorage, not sessionStorage.
    expect(window.localStorage.getItem(KEY)).not.toBeNull();
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });

  it('returns null for an empty key', () => {
    expect(loadAssessment(KEY)).toBeNull();
  });

  it('expires payloads older than 24 hours', () => {
    saveAssessment(KEY, { resume: true });
    expect(loadAssessment(KEY)).toEqual({ resume: true });

    // Advance just past the TTL boundary.
    vi.setSystemTime(new Date(Date.now() + ASSESSMENT_STORAGE_TTL_MS + 1000));
    expect(loadAssessment(KEY)).toBeNull();
    // Expired entry is purged on the next read.
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it('returns the payload at the TTL boundary itself (≤ TTL is fresh)', () => {
    saveAssessment(KEY, { resume: true });
    vi.setSystemTime(new Date(Date.now() + ASSESSMENT_STORAGE_TTL_MS - 1000));
    expect(loadAssessment(KEY)).toEqual({ resume: true });
  });

  it('clearAssessment removes the entry', () => {
    saveAssessment(KEY, { resume: true });
    clearAssessment(KEY);
    expect(loadAssessment(KEY)).toBeNull();
  });

  it('ignores malformed JSON without crashing', () => {
    window.localStorage.setItem(KEY, '{not json');
    expect(loadAssessment(KEY)).toBeNull();
  });

  it('ignores envelopes missing savedAt', () => {
    window.localStorage.setItem(KEY, JSON.stringify({ payload: { x: 1 } }));
    expect(loadAssessment(KEY)).toBeNull();
  });
});
