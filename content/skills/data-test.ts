// The green / yellow / red data test on each playbook page. Six things a
// person in that role might want to paste into an AI tool; the reader sorts
// each one, then sees why. Definitions match course module 12 (Data Traffic
// Light):
//   GREEN: public or internal material with no customer details. OK to use.
//   YELLOW: internal material that needs names, numbers or identifiers removed
//           first.
//   RED: customer or member data, credentials, exam material, or anything that
//        affects a customer decision. Do not use it. Ask.
// Every item is invented.

import type { RoleSlug } from '@/app/playbooks/data';

export type DataLight = 'green' | 'yellow' | 'red';

export interface DataTestItem {
  readonly item: string;
  readonly answer: DataLight;
  readonly why: string;
}

export const DATA_LIGHT_LABEL: Record<DataLight, string> = {
  green: 'Green: OK to use',
  yellow: 'Yellow: remove details first',
  red: 'Red: do not use',
};

export const DATA_TEST: Record<RoleSlug, readonly DataTestItem[]> = {
  retail: [
    { item: 'Your published fee schedule, to explain an overdraft fee in plain words', answer: 'green', why: 'It is public. Paste it.' },
    { item: 'A member complaint email with their name and the last four of their account', answer: 'red', why: 'It identifies a member. Describe the situation instead: "a member was charged two overdraft fees on one day".' },
    { item: 'Last week\'s branch scorecard export with each banker\'s name and sales', answer: 'yellow', why: 'Internal, and it names staff. Replace names with Banker A, B, C, then use an approved tool.' },
    { item: 'Your internal funds-availability procedure', answer: 'yellow', why: 'Internal but no customer data. Use it only in a tool your bank approved.' },
    { item: 'A photo of a check a member wants to deposit', answer: 'red', why: 'It carries account and routing numbers and a name.' },
    { item: 'A script for greeting members at the door', answer: 'green', why: 'No customer data and nothing confidential.' },
  ],
  marketing: [
    { item: 'Your brand style guide PDF', answer: 'green', why: 'No customer data. Fine to use for brand work.' },
    { item: 'A list of members who opened a CD last quarter, to personalize a campaign', answer: 'red', why: 'It is customer data. Build the campaign from segments, not names.' },
    { item: 'Next month\'s rate sheet before it is published', answer: 'yellow', why: 'Not customer data, but unreleased. Approved tool only, and only once the rates are final.' },
    { item: 'A competitor\'s public ad you want to compare against', answer: 'green', why: 'It is public.' },
    { item: 'Survey comments from members, with names attached', answer: 'yellow', why: 'Strip names and anything identifying, then use the comments.' },
    { item: 'Campaign results by branch, no member details', answer: 'green', why: 'Aggregated, no customer data.' },
  ],
  lending: [
    { item: 'A borrower\'s full loan file to summarize', answer: 'red', why: 'Identifies the borrower and drives a credit decision. Summarize from a redacted version, or use a tool your bank approved for loan files.' },
    { item: 'Your credit policy section on debt-service coverage', answer: 'yellow', why: 'Internal policy. Approved tool only.' },
    { item: 'Financial statements with the business name replaced by "Borrower A"', answer: 'yellow', why: 'Redacted, but still a real credit. Approved tool only, and check nothing else identifies them.' },
    { item: 'The adverse-action reasons you chose, to draft the letter wording', answer: 'yellow', why: 'Use the reasons without the applicant\'s name or details. A person signs off.' },
    { item: 'A public article on the local farm economy', answer: 'green', why: 'It is public.' },
    { item: 'A credit report pulled for an applicant', answer: 'red', why: 'Consumer report data. Never into an AI tool.' },
  ],
  compliance: [
    { item: 'A newly published rule from the Federal Register', answer: 'green', why: 'It is public.' },
    { item: 'Your exam report and its findings', answer: 'red', why: 'Confidential supervisory information. Keep it out.' },
    { item: 'Your complaint log with member names', answer: 'red', why: 'Customer data. Use counts by category instead.' },
    { item: 'Complaint counts by category, no names', answer: 'green', why: 'Aggregated. Fine.' },
    { item: 'A draft ad from marketing to review', answer: 'yellow', why: 'Unreleased internal material. Approved tool only.' },
    { item: 'Your BSA policy, to map it to a new rule', answer: 'yellow', why: 'Internal policy. Approved tool only.' },
  ],
  'bsa-aml': [
    { item: 'A real alert with the customer\'s name and transactions', answer: 'red', why: 'Customer data in an investigation. Use a redacted timeline: Subject A, dates, amounts.' },
    { item: 'Anything that says a SAR was filed on someone', answer: 'red', why: 'SAR confidentiality. Never into an AI tool or any document a customer could see.' },
    { item: 'A FinCEN advisory on a fraud typology', answer: 'green', why: 'It is public.' },
    { item: 'A redacted timeline: Subject A, dates and amounts only', answer: 'yellow', why: 'Approved tool only, and recheck that nothing identifies them.' },
    { item: 'Monthly counts of alerts, cases and filings for the board', answer: 'green', why: 'Aggregated counts with no case details.' },
    { item: 'Your CDD procedure', answer: 'yellow', why: 'Internal. Approved tool only.' },
  ],
  operations: [
    { item: 'Today\'s exception report with account numbers', answer: 'red', why: 'Account-level customer data. Use totals by type instead.' },
    { item: 'Exception totals by type, no accounts', answer: 'green', why: 'Aggregated. Fine.' },
    { item: 'A vendor contract, to find the SLA', answer: 'yellow', why: 'Confidential terms. Approved tool only.' },
    { item: 'Your steps for a daily task, written in your own words', answer: 'green', why: 'No customer data.' },
    { item: 'A screenshot of the core system with a member record open', answer: 'red', why: 'Customer data and system details.' },
    { item: 'A reconciliation break, described with amounts but no accounts', answer: 'yellow', why: 'Internal figures. Approved tool only.' },
  ],
  executive: [
    { item: 'Your public call report data', answer: 'green', why: 'It is public.' },
    { item: 'Board minutes discussing a possible acquisition', answer: 'red', why: 'Material non-public information.' },
    { item: 'A vendor\'s sales deck', answer: 'yellow', why: 'Usually confidential. Approved tool only.' },
    { item: 'Your draft strategy one-pager', answer: 'yellow', why: 'Internal. Approved tool only.' },
    { item: 'Notes on an employee performance issue', answer: 'red', why: 'Personnel information. Keep it out.' },
    { item: 'A published industry article', answer: 'green', why: 'It is public.' },
  ],
  infosec: [
    { item: 'A phishing email a staff member reported, with their name and address', answer: 'yellow', why: 'Remove staff names and internal addresses, then use it.' },
    { item: 'Passwords, keys or MFA codes', answer: 'red', why: 'Credentials. Never.' },
    { item: 'A vendor\'s published security whitepaper', answer: 'green', why: 'It is public.' },
    { item: 'Your network diagram', answer: 'red', why: 'It maps your defenses.' },
    { item: 'A user access export with names and roles', answer: 'yellow', why: 'Replace names with IDs, then use an approved tool.' },
    { item: 'The FFIEC IT handbook section on access controls', answer: 'green', why: 'It is public.' },
  ],
  'training-hr': [
    { item: 'A job posting you already published', answer: 'green', why: 'It is public.' },
    { item: 'A manager\'s notes for a performance review', answer: 'yellow', why: 'Remove the employee\'s name and anything about health or family, then use an approved tool.' },
    { item: 'An employee\'s medical leave paperwork', answer: 'red', why: 'Protected personal information. Never.' },
    { item: 'Training completion export with names', answer: 'yellow', why: 'Approved tool only, or replace names with IDs.' },
    { item: 'Your AI acceptable-use policy', answer: 'green', why: 'Internal, but meant to be shared with staff. Fine.' },
    { item: 'Salary data by employee', answer: 'red', why: 'Confidential personal data.' },
  ],
};

/** A risky prompt for the "check a prompt" test, written the way someone in the role might. All invented. */
export const PROMPT_CHECK_EXAMPLE: Record<RoleSlug, string> = {
  retail:
    'write a quick reply to John Smith — he’s furious we charged him 3 overdraft fees in one day on account 0042871. dob 04/12/1981, cell (555) 123-4567. wants them reversed',
  marketing:
    'write a thank-you email to our new CD customers: Maria Lopez (maria.lopez@example.com), account 7781203, and Dan Ortiz, phone (555) 201-8890',
  lending:
    'summarize this loan file for committee: borrower Harlan Feed & Seed, owner Tom Harlan, ssn 123-45-6789, loan 55-0091, credit score 702',
  compliance:
    'draft a response to the complaint from Linda Park, account 3390112, phone (555) 410-2231, about her Reg E dispute',
  'bsa-aml':
    'write a SAR narrative for Robert Chen, dob 02/14/1975, account 8812004, who made 9 cash deposits of $9,500 last month',
  operations:
    'explain why account 6601993 for Ellen Brooks didn’t post the ACH on time, her email is ellen.brooks@example.com',
  executive:
    'draft a board note about the overdraft complaint from our director’s neighbor Paul Grant, account 2219087, cell (555) 300-1144',
  infosec:
    'reset access for jsmith, password is Spring2026! and the MFA backup code is 448812, then email john.smith@example.com',
  'training-hr':
    'write a performance review for Kim Nguyen, employee 10442, ssn 987-65-4320, who was out on medical leave in March',
};
