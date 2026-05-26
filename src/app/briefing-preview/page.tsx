import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Book Executive Briefing — The AI Banking Institute',
  description: '30 minutes with leadership. No slides, no sales pitch. We walk through the assessment, the dashboard, and what a 90-day rollout looks like.',
  alternates: { canonical: '/briefing-preview' },
};

export default function BriefingPreviewPage() {
  return (
    <MockupShell
      activePath="/for-institutions"
      eyebrow="Executive Briefing · Free · 30 min"
      title={<>Bring your leadership. We will skip the slides.</>}
      lede="A working session, not a pitch. We walk through your peer-class data, what readiness looks like for your size, and what a 90-day rollout looks like."
      heroActions={[
        { label: 'Book on Calendly', href: 'https://calendly.com/aibi-briefing', variant: 'gold' },
        { label: 'See Team Pricing', href: '/for-institutions', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'What you get',
          heading: <>Four things, in 30 minutes.</>,
          lede: <>FDIC peer comparison for your asset class · sample dashboard on real institution data · 90-day rollout plan tailored to your headcount · pricing for your departments.</>,
        },
        {
          kicker: 'Who should join',
          heading: <>Bring three to five people.</>,
          lede: <>Best mix: CEO, Compliance, IT, and one or two business-line leaders. Smaller institutions: just the CEO + Compliance.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Thirty minutes. Real data. Real plan.</>,
        body: <>If the briefing is not useful in the first ten minutes, end it. That is the deal.</>,
        actions: [
          { label: 'Book the Briefing', href: 'https://calendly.com/aibi-briefing', variant: 'gold' },
          { label: 'Get Pricing First', href: '/for-institutions', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
