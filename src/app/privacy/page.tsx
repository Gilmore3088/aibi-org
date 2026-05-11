import { LedgerArticle } from '@/components/ledger';

export const metadata = {
  title: 'Privacy Policy | The AI Banking Institute',
};

export default function PrivacyPage() {
  return (
    <LedgerArticle eyebrow="Privacy" title={<>Privacy <em>policy.</em></>}>
      <p>
        The AI Banking Institute collects only the information needed to operate
        assessments, courses, payments, learner progress, support, and
        institution reporting.
      </p>
      <p>
        Assessment answers, readiness scores, course activity responses, saved
        prompts, practice completions, and certificate records may be stored to
        provide learner progress and institutional training visibility.
      </p>
      <p>
        Learners should not submit customer PII, account numbers, credit
        decisions, SAR information, or other highly restricted banking data into
        course exercises, prompt fields, or practice areas.
      </p>
      <p>
        Payment processing is handled by Stripe. Authentication and course data
        are handled through Supabase. Analytics may be used to improve product
        flow and launch readiness.
      </p>
      <p>
        For privacy or data handling questions, contact support using the
        institution contact path provided by your course sponsor.
      </p>
    </LedgerArticle>
  );
}
