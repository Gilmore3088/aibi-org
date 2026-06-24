import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/pdf/generate', () => ({
  generatePdfFromHtml: vi.fn(async () => Buffer.from('%PDF-report')),
}));

import { generatePdfFromHtml } from '@/lib/pdf/generate';
import {
  buildTransformationReportHtml,
  buildTransformationReportPdfBuffer,
  type TransformationReportProps,
} from './transformation-report';

const baseReport: TransformationReportProps = {
  learnerName: 'Alex Banker',
  institution: 'Community Bank',
  reportDate: 'June 23, 2026',
  preScore: 12,
  postScore: 24,
  preTierLabel: 'Early Stage',
  postTierLabel: 'Building Momentum',
  dimensions: [
    { label: 'Governance', preScore: 2, postScore: 4, maxScore: 5 },
  ],
  skills: [
    {
      name: 'Complaint response summarizer',
      role: 'Branch operations',
      annualHoursSaved: 87,
    },
  ],
  totalAnnualHoursSaved: 188,
  workflowsAutomated: 1,
  quickWins: [
    {
      description: 'Drafted public branch notice',
      tool: 'Enterprise Copilot',
      timeSavedMinutes: 45,
    },
  ],
  modulesCompleted: 9,
  totalModules: 9,
  workProductSubmitted: true,
  workProductReviewed: true,
  verificationUrl: 'https://aibankinginstitute.com/verify/AIBI-FOUNDATION-123',
  enrollmentId: 'enroll-123',
};

describe('transformation report PDF rendering', () => {
  it('escapes learner and activity text before building print HTML', () => {
    const html = buildTransformationReportHtml({
      ...baseReport,
      learnerName: 'Alex <script>alert("x")</script>',
      institution: 'Bank & Trust',
      dimensions: [
        { label: '<Risk>', preScore: 1, postScore: 3, maxScore: 5 },
      ],
      skills: [
        {
          name: '<img src=x onerror=alert(1)>',
          role: `Use "public" documents only`,
          annualHoursSaved: 87,
        },
      ],
      quickWins: [
        {
          description: `Reviewed 'public' policy copy`,
          tool: 'ChatGPT & Copilot',
          timeSavedMinutes: 90,
        },
      ],
    });

    expect(html).toContain('Alex &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).toContain('Bank &amp; Trust');
    expect(html).toContain('&lt;Risk&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('Use &quot;public&quot; documents only');
    expect(html).toContain('Reviewed &#39;public&#39; policy copy');
    expect(html).toContain('ChatGPT &amp; Copilot');
    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('<img src=x');
  });

  it('renders via the Chromium HTML print helper', async () => {
    const buffer = await buildTransformationReportPdfBuffer(baseReport);

    expect(buffer.toString()).toBe('%PDF-report');
    expect(generatePdfFromHtml).toHaveBeenCalledWith({
      html: expect.stringContaining('Transformation<br />Report'),
      viewport: { width: 1200, height: 1600 },
      pdf: {
        format: 'Letter',
        printBackground: true,
        margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
        preferCSSPageSize: true,
      },
    });
  });
});
