import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelPicker } from './ModelPicker';

describe('ModelPicker', () => {
  it('renders the six v1 models grouped by provider', () => {
    render(<ModelPicker value={{ provider: 'anthropic', model: 'claude-sonnet-4-6' }} onChange={() => {}} />);
    const select = screen.getByLabelText(/model/i) as HTMLSelectElement;
    // 6 options + 3 optgroups
    expect(select.querySelectorAll('option')).toHaveLength(6);
    expect(select.querySelectorAll('optgroup')).toHaveLength(3);
  });

  it('reflects the controlled value', () => {
    render(<ModelPicker value={{ provider: 'openai', model: 'gpt-4o' }} onChange={() => {}} />);
    const select = screen.getByLabelText(/model/i) as HTMLSelectElement;
    expect(select.value).toBe('openai::gpt-4o');
  });

  it('calls onChange with the new {provider, model} when selection changes', () => {
    const onChange = vi.fn();
    render(<ModelPicker value={{ provider: 'anthropic', model: 'claude-sonnet-4-6' }} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'gemini::gemini-2.5-flash' } });
    expect(onChange).toHaveBeenCalledWith({ provider: 'gemini', model: 'gemini-2.5-flash' });
  });

  it('renders a Last-verified compliance link', () => {
    render(<ModelPicker value={{ provider: 'anthropic', model: 'claude-sonnet-4-6' }} onChange={() => {}} />);
    expect(screen.getByText(/last verified/i)).toBeTruthy();
  });
});
