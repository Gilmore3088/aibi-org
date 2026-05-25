// TrackChrome — renders governance margin notes only when a track-and-
// lesson hook is defined. Renders nothing on tracks/lessons without a
// hook so it can be mounted unconditionally on every lesson.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrackChrome } from './TrackChrome';

describe('TrackChrome', () => {
  it('renders nothing without a track', () => {
    const { container } = render(<TrackChrome activeTrack={null} moduleId="m3" lessonId="m3.4" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a governance note when track + lesson hook match', () => {
    render(<TrackChrome activeTrack="risk_compliance" moduleId="m3" lessonId="m3.4" />);
    expect(screen.getByLabelText('Track-specific governance note')).toBeTruthy();
    // m3.4 has the examiner-perspective hook for risk_compliance
    expect(screen.getByText(/Examiner perspective/i)).toBeTruthy();
  });

  it('matches the most-specific hook (lessonId beats moduleId)', () => {
    // m3.4 is more specific than the generic m3 module-prefix hook.
    render(<TrackChrome activeTrack="risk_compliance" moduleId="m3" lessonId="m3.4" />);
    // Should pick "Examiner perspective" (m3.4 specific), not module-level.
    expect(screen.getByText(/spot-the-violation drill/i)).toBeTruthy();
  });

  it('falls back to module-prefix when no lesson-specific hook exists', () => {
    // m4.2 — no lesson-specific hook for risk_compliance, but module-level "m4" hook exists.
    render(<TrackChrome activeTrack="risk_compliance" moduleId="m4" lessonId="m4.2" />);
    expect(screen.getByText(/Governance note/i)).toBeTruthy();
  });

  it('renders nothing when no hook matches', () => {
    // m2 has no risk_compliance hook by default beyond the module-level one.
    // Use a track + module combination that has no entry: leadership × m0
    const { container } = render(
      <TrackChrome activeTrack="leadership" moduleId="m0" lessonId="m0.1" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the source citation as mono caps', () => {
    render(<TrackChrome activeTrack="risk_compliance" moduleId="m5" lessonId="m5.4" />);
    // m5 hook for risk_compliance is "Pre-deployment note"
    expect(screen.getByText(/OCC Bulletin/i)).toBeTruthy();
  });
});
