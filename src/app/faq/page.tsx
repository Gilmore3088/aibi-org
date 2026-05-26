import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'FAQ — The AI Banking Institute',
  description: 'Common questions about the AI Readiness Assessment, the Foundation Course, the Sandbox, the Toolbox, and Institution rollouts.',
  alternates: { canonical: '/faq' },
};

const QAS = [
  ['Who is The AI Banking Institute for?', 'Community banks, credit unions, and the staff who actually use AI day to day. The course, sandbox, and toolbox are built around banking-specific scenarios.'],
  ['How long is the free assessment?', 'Twelve questions, about three minutes on mobile. You see your score, tier, and weakest dimension before any email is captured.'],
  ['What is the difference between the free assessment and the $99 In-Depth?', 'The free baseline is 12 questions across 8 dimensions. The $99 In-Depth is 48 questions plus a role-specific action plan, examiner-ready PDF, and a 30-day refund window.'],
  ['Does the course require a cohort or a calendar?', 'No. The Foundation Course is self-paced. You buy a seat and move at your speed.'],
  ['Is my member data ever sent to a model?', 'Never inside the Institute. The sandbox uses fictional, synthetic scenarios. We teach the boundary so your staff never crosses it inside their own tools either.'],
  ['How do institution seats work?', 'Buy in bulk with volume pricing. You get an admin dashboard, aggregated assessment data, and seat assignment by role. SSO available at 25+ seats.'],
];

export default function FaqPage() {
  return (
    <MockupShell
      activePath="/faq"
      eyebrow="Frequently Asked"
      title={<>Answers without the runaround.</>}
      lede="The questions community banks and credit unions ask most. If your question is not here, book a briefing — we will answer it in person."
      heroActions={[
        { label: 'Take the Assessment', href: '/assessment', variant: 'gold' },
        { label: 'Book a Briefing', href: '/briefing-preview', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'Common questions',
          heading: <>Six answers, in plain language.</>,
          body: (
            <div style={{ display: 'grid', gap: 16 }}>
              {QAS.map(([q, a]) => (
                <div key={q} className="mk-card-white">
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{q}</h3>
                  <p style={{ color: 'var(--slate-600)', margin: '8px 0 0', lineHeight: 1.55 }}>{a}</p>
                </div>
              ))}
            </div>
          ),
        },
      ]}
      ctaBand={{
        heading: <>Still have questions? Bring them to a briefing.</>,
        body: <>Thirty minutes, no slides, no sales pitch. Bring your leadership team and we will walk through your institution&apos;s shape.</>,
        actions: [
          { label: 'Book Briefing', href: '/briefing-preview', variant: 'gold' },
          { label: 'Get Pricing', href: '/for-institutions', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
