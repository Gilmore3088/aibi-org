import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function zipEntries(filename: string) {
  const output = execFileSync('unzip', ['-Z1', join(process.cwd(), 'public', 'downloads', filename)], {
    encoding: 'utf8',
  });

  return output.split('\n').filter(Boolean);
}

describe('starter kit ZIP contents', () => {
  it('packages the governance starter kit as an ordered working kit', () => {
    expect(zipEntries('governance-starter-kit.zip')).toEqual([
      '00-Start-Here.pdf',
      '01-Before-You-Paste-Safe-AI-Checklist.pdf',
      '02-Red-Yellow-Green-AI-Use-Card.pdf',
      '03-AI-Use-Case-Inventory-Card.pdf',
      '04-AI-Use-Case-Inventory.xlsx',
      '05-AI-Workflow-SOP-Template.pdf',
      '06-AI-Workflow-SOP-Builder.docx',
      'README.md',
    ]);
  });

  it('packages the frontline enablement kit as an ordered working kit', () => {
    expect(zipEntries('frontline-enablement-kit.zip')).toEqual([
      '00-Start-Here.pdf',
      '01-Frontline-Data-Handling-Card.pdf',
      '02-Before-You-Paste-Safe-AI-Checklist.pdf',
      '03-Prompt-Strategy-Cheat-Sheet.pdf',
      '04-Retail-Branch-Manager-Guide.pdf',
      '05-Branch-Style-Brief-Template.docx',
      '06-First-Draft-Reply-Library.docx',
      '07-Procedure-to-Job-Aid-Prompt.docx',
      '08-Branch-Coaching-Scenario-Pack.docx',
      '09-Customer-Voice-Report-Template.docx',
      '10-Retail-AI-Evidence-Packet.docx',
      '11-30-Day-Frontline-Rollout-Tracker.xlsx',
      'README.md',
    ]);
  });

  it('packages the lending review kit as an ordered working kit', () => {
    expect(zipEntries('lending-review-kit.zip')).toEqual([
      '00-Start-Here.pdf',
      '01-Lending-AI-Control-Playbook.pdf',
      '02-Lending-AI-Use-Case-Register.xlsx',
      '03-Fair-Lending-AI-Review-Checklist.pdf',
      '04-Fair-Lending-AI-Review-Worksheet.xlsx',
      '05-Principal-Reason-Traceability-Table.xlsx',
      '06-Adverse-Action-AI-Review-Log.xlsx',
      '07-Lending-Workflow-SOP-Template.docx',
      '08-Decision-Packet-Evidence-Index.docx',
      'README.md',
    ]);
  });

  it('packages the marketing review kit as an ordered working kit', () => {
    expect(zipEntries('marketing-review-kit.zip')).toEqual([
      '00-Start-Here.pdf',
      '01-Marketing-AI-Playbook.pdf',
      '02-Marketing-Prompt-Cheat-Sheet.pdf',
      '03-Campaign-Intake-Form.docx',
      '04-Marketing-Claim-Control-Matrix.xlsx',
      '05-AI-Marketing-Review-Checklist.docx',
      '06-Segment-Approval-Log.xlsx',
      '07-Channel-Review-Grid.xlsx',
      '08-Campaign-Evidence-Packet.docx',
      '09-AI-Campaign-Workflow-SOP.docx',
      '10-Governance-Appendix-AI-Use-Policy-Starter.pdf',
      'README.md',
    ]);
  });
});
