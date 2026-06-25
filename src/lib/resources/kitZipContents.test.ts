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
});
