import type { Metadata } from 'next';
import { WorkflowSopBuilder } from './WorkflowSopBuilder';

export const metadata: Metadata = {
  title: 'AI Workflow SOP — Working Template | The AI Banking Institute',
  description:
    'Interactive working template for documenting one AI-assisted workflow end to end: tool, allowed inputs, output, reviewer, approval checkpoint, escalation path, and retention rule. Copy or download as markdown.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources/templates/ai-workflow-sop' },
  openGraph: {
    title: 'AI Workflow SOP — Working Template',
    description:
      'Fill, review, and download a per-workflow AI SOP. Real markdown output you can paste into your governance repository.',
    url: 'https://www.aibankinginstitute.com/resources/templates/ai-workflow-sop',
    type: 'website',
  },
};

export default function Page() {
  return <WorkflowSopBuilder />;
}
