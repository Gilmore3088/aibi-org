import type { Metadata } from 'next';
import { WorkflowSopBuilder } from './WorkflowSopBuilder';

export const metadata: Metadata = {
  title: 'The Bank AI Workflow SOP Template',
  description:
    'Interactive working template for documenting one AI-assisted workflow: human review, data handling, vendor controls, monitoring thresholds, and shutoff triggers.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources/templates/ai-workflow-sop' },
  openGraph: {
    title: 'The Bank AI Workflow SOP Template',
    description:
      'Fill, review, and download a per-workflow AI SOP with control fields, data boundaries, monitoring thresholds, and reviewer evidence.',
    url: 'https://www.aibankinginstitute.com/resources/templates/ai-workflow-sop',
    type: 'website',
  },
};

export default function Page() {
  return <WorkflowSopBuilder />;
}
