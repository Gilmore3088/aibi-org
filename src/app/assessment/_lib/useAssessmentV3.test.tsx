import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { questions } from '@content/assessments/v3/questions';
import { QUESTIONS_PER_SESSION, useAssessmentV3 } from './useAssessmentV3';

vi.mock('@/lib/analytics/events', () => ({
  trackAssessmentStart: vi.fn(),
  trackAssessmentComplete: vi.fn(),
}));

describe('useAssessmentV3', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('starts over at question one without changing the selected question set', async () => {
    const { result } = renderHook(() => useAssessmentV3());

    await waitFor(() => {
      expect(result.current.selectedQuestions).toHaveLength(QUESTIONS_PER_SESSION);
    });

    const initialIds = result.current.selectedQuestions.map((question) => question.id);
    expect(initialIds).toEqual(questions.map((question) => question.id));

    for (let i = 0; i < QUESTIONS_PER_SESSION; i += 1) {
      act(() => {
        result.current.answer(4);
      });
    }

    expect(result.current.phase).toBe('score');
    expect(result.current.answers).toHaveLength(QUESTIONS_PER_SESSION);

    act(() => {
      result.current.restart();
    });

    expect(result.current.phase).toBe('questions');
    expect(result.current.currentQuestion).toBe(0);
    expect(result.current.answers).toEqual([]);
    expect(result.current.selectedQuestions.map((question) => question.id)).toEqual(initialIds);
  });
});
