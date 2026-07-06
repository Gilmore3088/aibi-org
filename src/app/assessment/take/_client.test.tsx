import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTierV3 } from '@content/assessments/v3/scoring';
import AssessmentPage from './_client';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  state: {
    selectedQuestions: [
      {
        id: 'sv-01',
        dimension: 'Strategy',
        prompt: 'How clear is your AI ownership model?',
        options: [
          { label: 'No owner', points: 0 },
          { label: 'Named executive owner', points: 4 },
        ],
      },
      {
        id: 'atp-01',
        dimension: 'Adoption',
        prompt: 'How consistently do teams use approved AI workflows?',
        options: [
          { label: 'Ad hoc use only', points: 0 },
          { label: 'Approved workflow in place', points: 4 },
        ],
      },
    ],
    answers: [4],
    currentQuestion: 1,
    phase: 'questions' as const,
    progress: 1 / 12,
    isComplete: false,
    totalScore: 4,
    tier: null,
    answer: vi.fn(),
    goBack: vi.fn(),
    restart: vi.fn(),
    advanceToResults: vi.fn(),
    getDimensionBreakdown: vi.fn(() => ({})),
    restoreDraft: vi.fn(() => true),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('next/dynamic', () => ({
  default: () => function DynamicStub() {
    return null;
  },
}));

vi.mock('../_lib/useAssessmentV3', () => ({
  QUESTIONS_PER_SESSION: 12,
  useAssessmentV3: () => mocks.state,
}));

describe('AssessmentPage resume recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.state, {
      answers: [4],
      currentQuestion: 1,
      phase: 'questions' as const,
      progress: 1 / 12,
      isComplete: false,
      totalScore: 4,
      tier: null,
      getDimensionBreakdown: vi.fn(() => ({})),
    });
    window.history.replaceState(null, '', '/assessment/take');
  });

  it('emails a server-backed resume link from the question screen', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, message: 'Check your email for a resume link.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AssessmentPage />);

    expect(screen.getByText('Question 2 of 12')).toBeTruthy();
    expect(screen.getByText(/1 of 12 answered .* save your place anytime/i)).toBeTruthy();
    expect(await screen.findByRole('link', { name: /email resume link/i })).toBeTruthy();
    // The resume form is collapsed by default — open it first.
    fireEvent.click(screen.getByText(/need to finish later\? email yourself a resume link/i));
    fireEvent.change(screen.getByLabelText(/email for the resume link/i), {
      target: { value: 'CRO@Bank.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith('/api/assessment/drafts', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cro@bank.test',
        selectedQuestionIds: ['sv-01', 'atp-01'],
        answers: [4],
        currentQuestion: 1,
        phase: 'questions',
      }),
    }));
    expect(await screen.findByText('Check your email for a resume link.')).toBeTruthy();
  });

  it('restores a saved draft from a resume token', async () => {
    window.history.replaceState(null, '', '/assessment/take?resume=resume-token');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        draft: {
          selectedQuestionIds: ['sv-01', 'atp-01'],
          answers: [4],
          currentQuestion: 1,
          phase: 'questions',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AssessmentPage />);

    await waitFor(() => expect(mocks.state.restoreDraft).toHaveBeenCalledWith({
      selectedQuestionIds: ['sv-01', 'atp-01'],
      answers: [4],
      currentQuestion: 1,
      phase: 'questions',
    }));
    expect(fetchMock).toHaveBeenCalledWith('/api/assessment/drafts/resume-token', {
      cache: 'no-store',
    });
    expect(screen.getByText('Your saved assessment is restored.')).toBeTruthy();
    expect(window.location.pathname).toBe('/assessment/take');
    expect(window.location.search).toBe('');
  });

  it('renders a real restart target and score-phase answer review controls', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ user: null }), { status: 401 })));
    Object.assign(mocks.state, {
      answers: Array.from({ length: 12 }, () => 4),
      currentQuestion: 11,
      phase: 'score' as const,
      progress: 1,
      isComplete: true,
      totalScore: 48,
      tier: getTierV3(48),
      getDimensionBreakdown: vi.fn(() => ({
        'strategic-value': { score: 4, maxScore: 4, label: 'Strategic Value' },
      })),
    });

    render(<AssessmentPage />);

    expect(await screen.findByRole('link', { name: /restart/i })).toHaveProperty('hash', '#restart');
    expect(document.getElementById('restart')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /review answers/i }));
    expect(mocks.state.goBack).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(mocks.state.restart).toHaveBeenCalled();
  });

  it('carries ROI calculator context into the score gate', async () => {
    window.history.replaceState(
      null,
      '',
      '/assessment/take?roi=calculator&roi_fte=125&roi_cost=90000&roi_lo=3&roi_hi=8',
    );
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ user: null }), { status: 401 })));
    Object.assign(mocks.state, {
      answers: Array.from({ length: 12 }, () => 4),
      currentQuestion: 11,
      phase: 'score' as const,
      progress: 1,
      isComplete: true,
      totalScore: 48,
      tier: getTierV3(48),
      getDimensionBreakdown: vi.fn(() => ({
        'strategic-value': { score: 4, maxScore: 4, label: 'Strategic Value' },
      })),
    });

    render(<AssessmentPage />);

    expect(await screen.findByText(/ROI context carried forward/i)).toBeTruthy();
    expect(screen.getByText(/125 employees/i)).toBeTruthy();
  });
});
