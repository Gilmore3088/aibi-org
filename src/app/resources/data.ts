/* Data model for /resources. Downloadable binaries (PDF + ZIP) are served
 * from Supabase Storage via /api/resources/[slug]/download (302 → signed URL,
 * 5-min TTL). The download API verifies entitlement (free vs gated tier)
 * and logs each download into resource_downloads. A few links point at
 * in-app HTML routes (/resources/templates/*, /resources/templates/*)
 * which remain as ordinary Next.js pages. The Playwright suite asserts
 * HTTP 200 on every link returned by allDownloadHrefs(). */

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
  /** Download URL for the ZIP bundle of every artifact in the kit
   * (routed through /api/resources/[slug]/download). */
  zip: string;
  /** Approximate uncompressed size shown next to the download CTA. */
  zipSize: string;
  icon: IconType;
}

export const starterKits: StarterKit[] = [
  {
    id: 'governance',
    title: 'AI Governance Starter Kit',
    desc: 'Start here if your team is beginning to allow AI tools.',
    audience: 'Compliance, risk, executive team',
    items: [
      { label: 'Safe AI Use Checklist', href: '/api/resources/safe-ai-use-checklist/download' },
      { label: 'Red / Yellow / Green Use Card', href: '/api/resources/red-yellow-green-use-card/download' },
      { label: 'AI Use-Case Inventory', href: '/api/resources/artifact-ai-use-case-inventory/download' },
      { label: 'AI Workflow SOP', href: '/resources/templates/ai-workflow-sop' },
    ],
    zip: '/api/resources/governance-starter-kit/download',
    zipSize: '459 KB',
    icon: ShieldCheck,
  },
  {
    id: 'frontline',
    title: 'Frontline Enablement Kit',
    desc: 'Give branch and contact center teams safer AI practice routines.',
    audience: 'Retail, branch, contact center',
    items: [
      { label: 'Retail Playbook', href: '/api/resources/retail-playbook/download' },
      { label: 'Safe AI Use Checklist', href: '/api/resources/safe-ai-use-checklist/download' },
      { label: 'Prompt Strategy Cheat Sheet', href: '/api/resources/prompt-strategy-cheat-sheet/download' },
      { label: 'Data Handling Reference Card', href: '/api/resources/artifact-data-handling-reference-card/download' },
    ],
    zip: '/api/resources/frontline-enablement-kit/download',
    zipSize: '695 KB',
    icon: Users,
  },
  {
    id: 'marketing',
    title: 'Marketing Review Kit',
    desc: 'Create faster campaign drafts without skipping claims and disclosure review.',
    audience: 'Marketing, product, compliance',
    items: [
      { label: 'Marketing Playbook', href: '/api/resources/marketing-playbook/download' },
      { label: 'Prompt Strategy Cheat Sheet', href: '/api/resources/prompt-strategy-cheat-sheet/download' },
      { label: 'AI Workflow SOP', href: '/resources/templates/ai-workflow-sop' },
      { label: 'AI Use Policy Starter', href: '/resources/templates/ai-use-policy-starter' },
    ],
    zip: '/api/resources/marketing-review-kit/download',
    zipSize: '563 KB',
    icon: Megaphone,
  },
  {
    id: 'lending',
    title: 'Lending Review Kit',
    desc: 'Keep adverse-action, fair-lending, and decision packet work traceable.',
    audience: 'Lending, credit, compliance',
    items: [
      { label: 'Lending Playbook', href: '/api/resources/lending-playbook/download' },
      { label: 'Fair-Lending AI Review Checklist', href: '/api/resources/artifact-fair-lending-ai-review-checklist/download' },
      { label: 'AI Use-Case Inventory', href: '/api/resources/artifact-ai-use-case-inventory/download' },
      { label: 'AI Workflow SOP', href: '/resources/templates/ai-workflow-sop' },
    ],
    zip: '/api/resources/lending-review-kit/download',
    zipSize: '308 KB',
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
    pdf: '/api/resources/compliance-playbook/download',
    icon: ShieldCheck,
  },
  {
    slug: 'retail',
    title: 'Branch / Retail',
    desc: 'Frontline summaries, service replies, coaching cards, huddle scripts, and customer signal reports.',
    includes: ['Reply library', 'Coaching card', 'Voice report'],
    pdf: '/api/resources/retail-playbook/download',
    icon: Users,
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    desc: 'Brand voice, campaign kits, disclosure flags, reporting narratives, and segment-safe messaging.',
    includes: ['Brand prompt', 'Campaign kit', 'Review route'],
    pdf: '/api/resources/marketing-playbook/download',
    icon: Megaphone,
  },
  {
    slug: 'lending',
    title: 'Lending',
    desc: 'Adverse-action traceability, fair-lending checks, decision packet indexes, and language coaching.',
    includes: ['Traceability', 'Phrase screen', 'Packet index'],
    pdf: '/api/resources/lending-playbook/download',
    icon: FileText,
  },
  {
    slug: 'bsa-aml',
    title: 'BSA / AML',
    desc: 'SAR scaffolds, CDD baselines, synthetic typology training, alert patterning, and SOPs.',
    includes: ['SAR scaffold', 'CDD baseline', 'Training scenario'],
    pdf: '/api/resources/bsa-aml-playbook/download',
    icon: Target,
  },
  {
    slug: 'infosec',
    title: 'IT / InfoSec',
    desc: 'Data classes, approved tools, AI vetting memos, gateway rules, and AgentSecOps controls.',
    includes: ['Tool verdict', 'Data matrix', 'Agent review'],
    pdf: '/api/resources/infosec-playbook/download',
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
  { title: 'Set AI rules', artifact: 'AI Use Policy Starter', href: '/resources/templates/ai-use-policy-starter', icon: ShieldCheck },
  { title: 'Review a use case', artifact: 'AI Use-Case Inventory', href: '/api/resources/artifact-ai-use-case-inventory/download', icon: ClipboardCheck },
  { title: 'Train staff', artifact: 'Safe AI Use + R/Y/G cards', href: '/api/resources/safe-ai-use-checklist/download', icon: BookOpen },
  { title: 'Build a workflow SOP', artifact: 'AI Workflow SOP', href: '/resources/templates/ai-workflow-sop', icon: Workflow },
  { title: 'Brief leadership', artifact: 'Board Briefing Checklist', href: '/resources/templates/board-briefing-checklist', icon: BarChart3 },
  { title: 'Preview paid output', artifact: 'Sample Readiness Report', href: '/api/resources/sample-readiness-report/download', icon: Eye },
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
    format: 'Template · Register',
    desc: 'Document purpose, tool, data class, owner, risk tier, reviewer, and cadence.',
    preview: ['Use case', 'Tool', 'Data', 'Reviewer'],
    href: '/api/resources/artifact-ai-use-case-inventory/download',
    icon: ClipboardCheck,
  },
  {
    title: 'AI Workflow SOP',
    format: 'Template · SOP',
    desc: 'Capture tool, input, output, reviewer, approval checkpoint, and retention rule.',
    preview: ['Tool', 'Input', 'Output', 'Review'],
    href: '/resources/templates/ai-workflow-sop',
    pdf: '/api/resources/template-ai-workflow-sop/download',
    icon: Workflow,
  },
  {
    title: 'Board / Leadership Briefing Checklist',
    format: 'Template · 5 min',
    desc: 'What to show before, during, and after an AI rollout conversation.',
    preview: ['Policy', 'Inventory', 'Risk', 'Next'],
    href: '/resources/templates/board-briefing-checklist',
    pdf: '/api/resources/template-board-briefing-checklist/download',
    icon: BarChart3,
  },
  {
    title: 'AI Use Policy Starter',
    format: 'Template · 8 min',
    desc: 'A practical starter policy defining tools, data, review, incidents, and ownership.',
    preview: ['Allowed', 'Blocked', 'Review', 'Escalate'],
    href: '/resources/templates/ai-use-policy-starter',
    pdf: '/api/resources/template-ai-use-policy-starter/download',
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
    href: '/api/resources/safe-ai-use-checklist/download',
    icon: ShieldCheck,
  },
  {
    title: 'Red / Yellow / Green Use Card',
    type: 'Staff card',
    desc: 'Classify AI use cases in ten seconds.',
    href: '/api/resources/red-yellow-green-use-card/download',
    icon: BadgeCheck,
  },
  {
    title: 'Prompt Strategy Cheat Sheet',
    type: 'Prompt card',
    desc: 'Write prompts with role, context, format, constraints, and review.',
    href: '/api/resources/prompt-strategy-cheat-sheet/download',
    icon: Sparkles,
  },
  {
    title: 'Regulatory Cheatsheet',
    type: 'Reference',
    desc: 'SR 11-7, ECOA / Reg B, TPRM, and AI lexicon basics.',
    href: '/api/resources/regulatory-cheatsheet/download',
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
    href: '/api/resources/sample-readiness-report/download',
    icon: BarChart3,
  },
  {
    title: 'In-Depth Assessment Playbook',
    desc: 'How the $99 report turns assessment results into a 90-day AI win.',
    href: '/api/resources/in-depth-playbook/download',
    icon: Library,
  },
];

export const chooserTabs = ['By role', 'By problem', 'By format'] as const;
export type ChooserTab = (typeof chooserTabs)[number];

/** Used by Playwright to enumerate every downloadable href on the page. */
export function allDownloadHrefs(): string[] {
  const hrefs = new Set<string>();
  starterKits.forEach((k) => {
    k.items.forEach((i) => hrefs.add(i.href));
    hrefs.add(k.zip);
  });
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
