'use client';

// TEMPORARY preview page — renders the Module 3 / Module 9 prompting widgets
// with mock data so they can be viewed and clicked on the Vercel preview
// deploy WITHOUT an enrollment. Not linked from anywhere and noindex'd.
// Remove before merge (or gate behind a flag) — this exists only to demo the
// interactions for PR #450. Submitting "Save" will fail harmlessly (the mock
// enrollment id is not real); every other interaction is fully live.

import type { Activity } from '@content/courses/foundation-program';
import { StrategyDrill } from '../program/_components/StrategyDrill';
import { PromptWizard } from '../program/_components/PromptWizard';
import { SafetyLab } from '../program/_components/SafetyLab';

const drillActivity: Activity = {
  id: '3.1',
  title: 'Match the task to the strategy',
  description: '',
  type: 'drill',
  fields: [],
};
const wizardActivity: Activity = {
  id: '3.2',
  title: 'Build a prompt that gets to the CORE',
  description: '',
  type: 'builder',
  fields: [],
};
const safetyActivity: Activity = {
  id: '9.1',
  title: 'Repair four dangerous prompts',
  description: '',
  type: 'builder',
  fields: [],
};

const noop = () => {};
const MOCK_ENROLLMENT = 'preview-no-save';

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 800, color: '#071A2F', margin: '0 0 4px' }}>
        {n} · {title}
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#475569', margin: '0 0 4px' }}>
        Fully interactive. The final “Save” will error (mock enrollment) — that is expected here.
      </p>
      {children}
    </section>
  );
}

export default function PromptLabPreviewPage() {
  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 36px' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A7A2F' }}>
        Internal preview · PR #450 · remove before merge · canvas width matches the live module page (1180px article)
      </p>
      <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 800, color: '#071A2F', margin: '6px 0 28px' }}>
        Modules 3 &amp; 9 — prompting interactions
      </h1>

      <Section n="Module 3 · Activity 3.1" title="Strategy drill">
        <StrategyDrill activity={drillActivity} enrollmentId={MOCK_ENROLLMENT} moduleNumber={3} onSubmitSuccess={noop} />
      </Section>

      <Section n="Module 3 · Activity 3.2" title="Prompt Wizard">
        <PromptWizard activity={wizardActivity} enrollmentId={MOCK_ENROLLMENT} moduleNumber={3} onSubmitSuccess={noop} />
      </Section>

      <Section n="Module 9 · Activity 9.1" title="Safety Lab">
        <SafetyLab activity={safetyActivity} enrollmentId={MOCK_ENROLLMENT} moduleNumber={9} onSubmitSuccess={noop} />
      </Section>
    </main>
  );
}
