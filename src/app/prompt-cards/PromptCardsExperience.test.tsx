import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PromptCardsExperience } from './PromptCardsExperience';

describe('PromptCardsExperience', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:prompt-cards');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('unlocks the prompt card library only after the static PDF streams', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob([Buffer.from('%PDF-1.7 prompt cards')], { type: 'application/pdf' }),
      } as Response);

    render(<PromptCardsExperience />);

    fireEvent.click(screen.getByRole('button', { name: /get the aibi prompt cards/i }));
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'marketing@communitybank.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: /unlock and download cards/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/prompt-cards/lead', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    expect(JSON.parse((fetchMock.mock.calls[0]?.[1] as { body: string }).body)).toEqual(expect.objectContaining({
      email: 'marketing@communitybank.test',
      role: 'practitioner',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/prompt-cards/download', { cache: 'no-store' });
    expect(screen.getByRole('heading', { name: /all 20 workflow cards/i })).toBeTruthy();
    expect(window.localStorage.getItem('aibi-prompt-cards-unlocked')).toBe('true');
  });

  it('keeps the library locked when the PDF download fails', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'PDF unavailable. Please try again.' }),
      } as Response);

    render(<PromptCardsExperience />);

    fireEvent.click(screen.getByRole('button', { name: /get the aibi prompt cards/i }));
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'marketing@communitybank.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: /unlock and download cards/i }));

    await waitFor(() => expect(screen.getByText(/PDF unavailable. Please try again./i)).toBeTruthy());
    expect(screen.getByRole('heading', { name: /preview cards/i })).toBeTruthy();
    expect(window.localStorage.getItem('aibi-prompt-cards-unlocked')).toBeNull();
  });
});
