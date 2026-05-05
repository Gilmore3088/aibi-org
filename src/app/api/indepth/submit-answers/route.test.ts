// Validation tests for POST /api/indepth/submit-answers.
//
// The DB happy path requires a live Supabase instance and is exercised in
// manual QA + Task 20's end-to-end walkthrough. These tests cover the input
// validation that fails before any DB work — matching the project pattern
// established by /api/create-checkout/route.test.ts.

import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { questions } from '@content/assessments/v2/questions';

const ALL_IDS = questions.map((q) => q.id);

const makeReq = (body: unknown) =>
  new Request('https://aibankinginstitute.com/api/indepth/submit-answers', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const fullValidAnswers = (): Record<string, number> =>
  Object.fromEntries(ALL_IDS.map((id) => [id, 3]));

describe('POST /api/indepth/submit-answers — validation', () => {
  it('rejects missing takerId with 400', async () => {
    const res = await POST(makeReq({ answers: fullValidAnswers() }));
    expect(res.status).toBe(400);
  });

  it('rejects non-string takerId with 400', async () => {
    const res = await POST(
      makeReq({ takerId: 123, answers: fullValidAnswers() }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects when answers count is wrong (not 48)', async () => {
    const partial = fullValidAnswers();
    delete partial[ALL_IDS[0]];
    const res = await POST(
      makeReq({ takerId: '00000000-0000-0000-0000-000000000000', answers: partial }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects unknown question id', async () => {
    const answers = fullValidAnswers();
    delete answers[ALL_IDS[0]];
    answers['bogus-id-99'] = 2;
    const res = await POST(
      makeReq({ takerId: '00000000-0000-0000-0000-000000000000', answers }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects out-of-range score (>4)', async () => {
    const answers = fullValidAnswers();
    answers[ALL_IDS[0]] = 5;
    const res = await POST(
      makeReq({ takerId: '00000000-0000-0000-0000-000000000000', answers }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects out-of-range score (<1)', async () => {
    const answers = fullValidAnswers();
    answers[ALL_IDS[0]] = 0;
    const res = await POST(
      makeReq({ takerId: '00000000-0000-0000-0000-000000000000', answers }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects non-integer score', async () => {
    const answers = fullValidAnswers();
    answers[ALL_IDS[0]] = 2.5;
    const res = await POST(
      makeReq({ takerId: '00000000-0000-0000-0000-000000000000', answers }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects malformed JSON body with 400', async () => {
    const res = await POST(
      new Request('https://aibankinginstitute.com/api/indepth/submit-answers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not json',
      }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects missing answers field', async () => {
    const res = await POST(makeReq({ takerId: '00000000-0000-0000-0000-000000000000' }));
    expect(res.status).toBe(400);
  });
});
