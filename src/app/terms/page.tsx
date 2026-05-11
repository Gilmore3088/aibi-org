import { LedgerArticle } from '@/components/ledger';

export const metadata = {
  title: 'Terms of Use | The AI Banking Institute',
};

export default function TermsPage() {
  return (
    <LedgerArticle eyebrow="Terms" title={<>Terms of <em>use.</em></>}>
      <p>
        The AI Banking Institute provides educational content, practice
        exercises, prompts, artifacts, assessments, and certification workflows
        for community financial institutions.
      </p>
      <p>
        Course materials are for training and internal capability building. They
        are not legal, compliance, credit, security, accounting, or regulatory
        advice.
      </p>
      <p>
        Learners are responsible for following their institution&apos;s AI, data
        handling, customer privacy, vendor management, and compliance policies.
      </p>
      <p>
        Certificates indicate completion of the stated course requirements. They
        do not authorize a learner to make regulated decisions without
        institution oversight.
      </p>
    </LedgerArticle>
  );
}
