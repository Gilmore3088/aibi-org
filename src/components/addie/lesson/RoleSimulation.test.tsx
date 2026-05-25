// RoleSimulation — multi-turn graded role drill. Tests focus on the
// behavioral surface: scenario gating, scoring, debrief paths.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSimulation } from './RoleSimulation';

describe('RoleSimulation', () => {
  it('renders nothing without a track', () => {
    const { container } = render(<RoleSimulation track={null} lessonId="m1.3" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the process-review scenario for back_office', () => {
    render(<RoleSimulation track="back_office" lessonId="m1.3" />);
    expect(screen.getByText(/Mock process review/i)).toBeTruthy();
    expect(screen.getByText(/Turn 1 of 3/i)).toBeTruthy();
  });

  it('renders the architecture-review scenario for technical', () => {
    render(<RoleSimulation track="technical" lessonId="m1.3" />);
    expect(screen.getByText(/Mock architecture review/i)).toBeTruthy();
    expect(screen.getByText(/Turn 1 of 3/i)).toBeTruthy();
  });

  it('renders the board-exchange scenario for leadership', () => {
    render(<RoleSimulation track="leadership" lessonId="m1.3" />);
    expect(screen.getByText(/Mock board exchange/i)).toBeTruthy();
    expect(screen.getByText(/Turn 1 of 3/i)).toBeTruthy();
  });

  it('renders the examiner Q&A scenario for risk_compliance', () => {
    render(<RoleSimulation track="risk_compliance" lessonId="m1.3" />);
    expect(screen.getByText(/Mock examiner/i)).toBeTruthy();
    expect(screen.getByText(/A field examiner/i)).toBeTruthy();
    expect(screen.getByText(/Turn 1 of 4/i)).toBeTruthy();
  });

  it('renders the member-call scenario for customer_facing', () => {
    render(<RoleSimulation track="customer_facing" lessonId="m1.3" />);
    expect(screen.getByText(/Mock member call/i)).toBeTruthy();
    expect(screen.getByText(/A member calls about an overdraft fee/i)).toBeTruthy();
    expect(screen.getByText(/Turn 1 of 3/i)).toBeTruthy();
  });

  it('shows feedback after a pick and advances on click', () => {
    render(<RoleSimulation track="customer_facing" lessonId="m1.3" />);
    // The first turn options exist; pick the second one
    const opts = screen.getAllByRole('button');
    fireEvent.click(opts[0]);
    // Feedback area renders with a score chip
    expect(
      screen.getByText(/Ideal · 2 pts|Partial · 1 pt|Miss · 0 pts/),
    ).toBeTruthy();
    // Next-turn affordance appears
    expect(screen.getByText(/Next turn →|See debrief →/)).toBeTruthy();
  });

  it('reaches debrief after all turns and shows a score', () => {
    render(<RoleSimulation track="customer_facing" lessonId="m1.3" />);
    // 3 turns; pick the first option each time and advance.
    for (let i = 0; i < 3; i++) {
      const buttons = screen.getAllByRole('button');
      // The first 3 buttons are the option buttons.
      fireEvent.click(buttons[0]);
      // After feedback, click the advance link.
      const advance = screen.getByText(/Next turn →|See debrief →/);
      fireEvent.click(advance);
    }
    // Debrief renders with a score X / 6
    expect(screen.getByText(/Debrief/i)).toBeTruthy();
    expect(screen.getByText(/\/ 6/)).toBeTruthy();
    expect(screen.getByText(/Run again →/)).toBeTruthy();
  });

  it('resets state when Run again is clicked', () => {
    render(<RoleSimulation track="customer_facing" lessonId="m1.3" />);
    // Burn through all 3 turns
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByText(/Next turn →|See debrief →/));
    }
    // On debrief — click Run again
    fireEvent.click(screen.getByText(/Run again →/));
    // Back at Turn 1
    expect(screen.getByText(/Turn 1 of 3/i)).toBeTruthy();
  });
});
