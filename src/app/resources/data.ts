/* Data model for /resources. Each item links to a real artifact in
 * public/downloads/ or public/artifacts/, or to a live route. The page
 * must not reference an href that does not resolve — the Playwright
 * suite asserts HTTP 200 on every download link rendered here. */

import type { ComponentType, SVGProps } from 'react';
import {
  BarChart3,
  BadgeCheck,
  BookOpen,
  ClipboardCheck,
  Eye,
  FileText,
  Library,
  LockKeyhole,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from './icons';

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface StarterKit {
  id: string;
  title: string;
  desc: string;
  audience: string;
  items: { label: string; href: string }[];
  icon: IconType;
}

export const starterKits: StarterKit[] = [
  {
    id: 'governance',
    title: 'AI Governance Starter Kit',
    desc: 'Start here if your team is beginning to allow AI tools.',
    audience: 'Compliance, risk, executive team',
    items: [
      { label: 'Safe AI Use Checklist', href: '/downloads/safe-ai-use-checklist.pdf' },
      { label: 'Red / Yellow / Green Use Card', href: '/downloads/red-yellow-green-use-card.pdf' },
      { label: 'AI Use-Case Inventory', href: '/artifacts/ai-use-case-inventory.md' },
      { label: 'AI Workflow SOP', href: '/research/templates/ai-workflow-sop' },
    ],
    icon: ShieldCheck,
  },
  {
    id: 'frontline',
    title: 'Frontline Enablement Kit',
    desc: 'Give branch and contact center teams safer AI practice routines.',
    audience: 'Retail, branch, contact center',
    items: [
      { label: 'Retail Playbook', href: '/downloads/retail-playbook.pdf' },
      { label: 'Safe AI Use Checklist', href: '/downloads/safe-ai-use-checklist.pdf' },
      { label: 'Prompt Strategy Cheat Sheet', href: '/downloads/prompt-strategy-cheat-sheet.pdf' },
      { label: 'Data Handling Reference Card', href: '/artifacts/data-handling-reference-card.md' },
    ],
    icon: Users,
  },
  {
    id: 'marketing',
    title: 'Marketing Review Kit',
    desc: 'Create faster campaign drafts without skipping claims and disclosure review.',
    audience: 'Marketing, product, compliance',
    items: [
      { label: 'Marketing Playbook', href: '/downloads/marketing-playbook.pdf' },
      { label: 'Prompt Strategy Cheat Sheet', href: '/downloads/prompt-strategy-cheat-sheet.pdf' },
      { label: 'AI Workflow SOP', href: '/research/templates/ai-workflow-sop' },
      { label: 'AI Use Policy Starter', href: '/research/templates/ai-use-policy-starter' },
    ],
    icon: Megaphone,
  },
  {
    id: 'lending',
    title: 'Lending Review Kit',
    desc: 'Keep adverse-action, fair-lending, and decision packet work traceable.',
    audience: 'Lending, credit, compliance',
    items: [
      { label: 'Lending Playbook', href: '/downloads/lending-playbook.pdf' },
      { label: 'Fair-Lending AI Review Checklist', href: '/artifacts/fair-lending-ai-review-checklist.md' },
      { label: 'AI Use-Case Inventory', href: '/artifacts/ai-use-case-inventory.md' },
      { label: 'AI Workflow SOP', href: '/research/templates/ai-workflow-sop' },
    ],
    icon: FileText,
  },
];

export interface RolePlaybook {
  slug: string;
  title: string;
  desc: string;
  includes: string[];
  pdf: string;
  icon: IconType;
}

export const rolePlaybooks: RolePlaybook[] = [
  {
    slug: 'compliance',
    title: 'Compliance',
    desc: 'Governance, use-case review, workflow SOPs, evidence packets, and board update rhythm.',
    includes: ['Use-case intake', 'Review checklist', 'Board update'],
    pdf: '/downloads/compliance-playbook.pdf',
    icon: ShieldCheck,
  },
  {
    slug: 'retail',
    title: 'Branch / Retail',
    desc: 'Frontline summaries, service replies, coaching cards, huddle scripts, and customer signal reports.',
    includes: ['Reply library', 'Coaching card', 'Voice report'],
    pdf: '/downloads/retail-playbook.pdf',
    icon: Users,
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    desc: 'Brand voice, campaign kits, disclosure flags, reporting narratives, and segment-safe messaging.',
    includes: ['Brand prompt', 'Campaign kit', 'Review route'],
    pdf: '/downloads/marketing-playbook.pdf',
    icon: Megaphone,
  },
  {
    slug: 'lending',
    title: 'Lending',
    desc: 'Adverse-action traceability, fair-lending checks, decision packet indexes, and language coaching.',
    includes: ['Traceability', 'Phrase screen', 'Packet index'],
    pdf: '/downloads/lending-playbook.pdf',
    icon: FileText,
  },
  {
    slug: 'bsa-aml',
    title: 'BSA / AML',
    desc: 'SAR scaffolds, CDD baselines, synthetic typology training, alert patterning, and SOPs.',
    includes: ['SAR scaffold', 'CDD baseline', 'Training scenario'],
    pdf: '/downloads/bsa-aml-playbook.pdf',
    icon: Target,
  },
  {
    slug: 'infosec',
    title: 'IT / InfoSec',
    desc: 'Data classes, approved tools, AI vetting memos, gateway rules, and AgentSecOps controls.',
    includes: ['Tool verdict', 'Data matrix', 'Agent review'],
    pdf: '/downloads/infosec-playbook.pdf',
    icon: LockKeyhole,
  },
];

export interface ProblemPath {
  title: string;
  artifact: string;
  href: string;
  icon: IconType;
}

export const problemPaths: ProblemPath[] = [
  { title: 'Set AI rules', artifact: 'AI Use Policy Starter', href: '/research/templates/ai-use-policy-starter', icon: ShieldCheck },
  { title: 'Review a use case', artifact: 'AI Use-Case Inventory', href: '/artifacts/ai-use-case-inventory.md', icon: ClipboardCheck },
  { title: 'Train staff', artifact: 'Safe AI Use + R/Y/G cards', href: '/downloads/safe-ai-use-checklist.pdf', icon: BookOpen },
  { title: 'Build a workflow SOP', artifact: 'AI Workflow SOP', href: '/research/templates/ai-workflow-sop', icon: Workflow },
  { title: 'Brief leadership', artifact: 'Board Briefing Checklist', href: '/research/templates/board-briefing-checklist', icon: BarChart3 },
  { title: 'Preview paid output', artifact: 'Sample Readiness Report', href: '/downloads/sample-readiness-report.pdf', icon: Eye },
];

export interface Template {
  title: string;
  format: string;
  desc: string;
  preview: string[];
  /** Primary URL — HTML page (canonical) or raw markdown. */
  href: string;
  /** Optional PDF mirror generated by scripts/generate-template-pdfs.mjs. */
  pdf?: string;
  icon: IconType;
}

export const templates: Template[] = [
  {
    title: 'AI Use-Case Inventory',
    format: 'Markdown · Register',
    desc: 'Document purpose, tool, data class, owner, risk tier, reviewer, and cadence.',
    preview: ['Use case', 'Tool', 'Data', 'Reviewer'],
    href: '/artifacts/ai-use-case-inventory.md',
    icon: ClipboardCheck,
  },
  {
    title: 'AI Workflow SOP',
    format: 'Template · SOP',
    desc: 'Capture tool, input, output, reviewer, approval checkpoint, and retention rule.',
    preview: ['Tool', 'Input', 'Output', 'Review'],
    href: '/research/templates/ai-workflow-sop',
    pdf: '/downloads/template-ai-workflow-sop.pdf',
    icon: Workflow,
  },
  {
    title: 'Board / Leadership Briefing Checklist',
    format: 'Template · 5 min',
    desc: 'What to show before, during, and after an AI rollout conversation.',
    preview: ['Policy', 'Inventory', 'Risk', 'Next'],
    href: '/research/templates/board-briefing-checklist',
    pdf: '/downloads/template-board-briefing-checklist.pdf',
    icon: BarChart3,
  },
  {
    title: 'AI Use Policy Starter',
    format: 'Template · 8 min',
    desc: 'A practical starter policy defining tools, data, review, incidents, and ownership.',
    preview: ['Allowed', 'Blocked', 'Review', 'Escalate'],
    href: '/research/templates/ai-use-policy-starter',
    pdf: '/downloads/template-ai-use-policy-starter.pdf',
    icon: FileText,
  },
];

export interface DeskCard {
  title: string;
  type: string;
  desc: string;
  href: string;
  icon: IconType;
}

export const deskCards: DeskCard[] = [
  {
    title: 'Safe AI Use Checklist',
    type: 'Staff card',
    desc: 'Strip data, ask clearly, fact-check, escalate.',
    href: '/downloads/safe-ai-use-checklist.pdf',
    icon: ShieldCheck,
  },
  {
    title: 'Red / Yellow / Green Use Card',
    type: 'Staff card',
    desc: 'Classify AI use cases in ten seconds.',
    href: '/downloads/red-yellow-green-use-card.pdf',
    icon: BadgeCheck,
  },
  {
    title: 'Prompt Strategy Cheat Sheet',
    type: 'Prompt card',
    desc: 'Write prompts with role, context, format, constraints, and review.',
    href: '/downloads/prompt-strategy-cheat-sheet.pdf',
    icon: Sparkles,
  },
  {
    title: 'Regulatory Cheatsheet',
    type: 'Reference',
    desc: 'SR 11-7, ECOA / Reg B, TPRM, and AI lexicon basics.',
    href: '/downloads/regulatory-cheatsheet.pdf',
    icon: BookOpen,
  },
];

export interface PaidPreview {
  title: string;
  desc: string;
  href: string;
  icon: IconType;
}

export const paidPreviews: PaidPreview[] = [
  {
    title: 'Sample Readiness Report',
    desc: 'Score, maturity tier, top gap, dimension snapshot, and starter artifact.',
    href: '/downloads/sample-readiness-report.pdf',
    icon: BarChart3,
  },
  {
    title: 'In-Depth Assessment Playbook',
    desc: 'How the $99 report turns assessment results into a 90-day AI win.',
    href: '/downloads/in-depth-playbook.pdf',
    icon: Library,
  },
];

export const chooserTabs = ['By role', 'By problem', 'By format'] as const;
export type ChooserTab = (typeof chooserTabs)[number];

/** Used by Playwright to enumerate every downloadable href on the page. */
export function allDownloadHrefs(): string[] {
  const hrefs = new Set<string>();
  starterKits.forEach((k) => k.items.forEach((i) => hrefs.add(i.href)));
  rolePlaybooks.forEach((r) => hrefs.add(r.pdf));
  problemPaths.forEach((p) => hrefs.add(p.href));
  templates.forEach((t) => {
    hrefs.add(t.href);
    if (t.pdf) hrefs.add(t.pdf);
  });
  deskCards.forEach((d) => hrefs.add(d.href));
  paidPreviews.forEach((p) => hrefs.add(p.href));
  return Array.from(hrefs);
}
