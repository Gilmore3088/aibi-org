/* Data model for /resources. Downloadable binaries (PDF + ZIP) are served
 * from Supabase Storage via /api/resources/[slug]/download (302 → signed URL,
 * 5-min TTL). The download API verifies entitlement (free vs gated tier)
 * and logs each download into resource_downloads. A few links point at
 * in-app HTML routes (/resources/templates/*, /resources/templates/*)
 * which remain as ordinary Next.js pages. The Playwright suite asserts
 * HTTP 200 on every link returned by allDownloadHrefs(). */

import type { ComponentType, SVGProps } from 'react';
import { PLAYBOOK_INDEX, type RoleSlug } from '@/app/playbooks/data';
import { TEMPLATE_INDEX, type TemplateSlug } from '@/app/resources/templates/templateIndex';
import {
  getFreeResource,
  largePrintResourceHref,
  publicFreeResources,
  readableResourceHref,
  type FreeResource,
  type FreeResourceCategory,
} from '@/lib/resources/freeResources';
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

type PublicDownloadResource = FreeResource & {
  readonly download: NonNullable<FreeResource['download']>;
};

function isPublicDownloadResource(resource: FreeResource | null): resource is PublicDownloadResource {
  return resource !== null && resource.status === 'public' && resource.download !== null;
}

function publicDownloadResourcesByCategory(
  category: FreeResourceCategory,
): PublicDownloadResource[] {
  return publicFreeResources.filter(
    (resource): resource is PublicDownloadResource =>
      isPublicDownloadResource(resource) &&
      resource.category === category &&
      resource.visibleSurfaces.includes('resources'),
  );
}

function resourceDownloadHref(resource: PublicDownloadResource): string {
  return `/api/resources/${resource.slug}/download`;
}

export interface StarterKit {
  slug: string;
  id: string;
  title: string;
  desc: string;
  audience: string;
  items: { label: string; href: string; readHref?: string; largePrint?: string }[];
  /** Download URL for the ZIP bundle of every artifact in the kit
   * (routed through /api/resources/[slug]/download). */
  zip: string;
  /** Approximate uncompressed size shown next to the download CTA. */
  zipSize: string;
  icon: IconType;
}

const STARTER_KIT_PRESENTATION: Record<string, { readonly id: string; readonly desc: string; readonly zipSize: string; readonly icon: IconType }> = {
  'governance-starter-kit': {
    id: 'governance',
    desc: 'Set the data line, classify AI use, start the inventory, and document your first workflow.',
    zipSize: '612 KB',
    icon: ShieldCheck,
  },
  'frontline-enablement-kit': {
    id: 'frontline',
    desc: 'Desk cards, prompts, and manager tools for safer branch and contact-center AI use.',
    zipSize: '1.2 MB',
    icon: Users,
  },
  'marketing-review-kit': {
    id: 'marketing',
    desc: 'Create faster campaign drafts without skipping claims and disclosure review.',
    zipSize: '1.5 MB',
    icon: Megaphone,
  },
  'lending-review-kit': {
    id: 'lending',
    desc: 'Review one AI-assisted lending workflow and keep decisions human, explainable, and file-supported.',
    zipSize: '744 KB',
    icon: FileText,
  },
};

function titleFromManifest(resource: FreeResource): string {
  if (resource.slug === 'retail-playbook') return 'Retail Playbook';
  return resource.title;
}

function starterKitItems(slug: string): StarterKit['items'] {
  return publicFreeResources
    .filter((resource) => resource.zipMembership.includes(slug))
    .map((resource) => ({
      label: titleFromManifest(resource),
      href: resource.canonicalRoute,
      readHref: readableResourceHref(resource) ?? undefined,
      largePrint: largePrintResourceHref(resource) ?? undefined,
    }));
}

export const starterKits: StarterKit[] = publicDownloadResourcesByCategory('starter-kit').map((resource) => {
  const presentation = STARTER_KIT_PRESENTATION[resource.slug];
  if (!presentation) throw new Error(`Missing starter-kit presentation for ${resource.slug}`);

  return {
    slug: resource.slug,
    id: presentation.id,
    title: resource.title,
    desc: presentation.desc,
    audience: resource.audience.join(', '),
    items: starterKitItems(resource.slug),
    zip: resourceDownloadHref(resource),
    zipSize: presentation.zipSize,
    icon: presentation.icon,
  };
});

export interface RolePlaybook {
  slug: RoleSlug;
  title: string;
  desc: string;
  includes: string[];
  pdf: string;
  word?: string;
  readHref?: string;
  icon: IconType;
}

const ROLE_PLAYBOOK_PRESENTATION = {
  compliance: {
    includes: ['Use-case intake', 'Review checklist', 'Board update'],
    icon: ShieldCheck,
  },
  retail: {
    includes: ['Reply library', 'Coaching card', 'Voice report'],
    icon: Users,
  },
  marketing: {
    includes: ['Brand prompt', 'Campaign kit', 'Review route'],
    icon: Megaphone,
  },
  lending: {
    includes: ['Traceability', 'Phrase screen', 'Packet index'],
    icon: FileText,
  },
  'bsa-aml': {
    includes: ['SAR scaffold', 'CDD baseline', 'Training scenario'],
    icon: Target,
  },
  infosec: {
    includes: ['Tool verdict', 'Data matrix', 'Agent review'],
    icon: LockKeyhole,
  },
  executive: {
    includes: ['Adoption thesis', 'Board briefing', 'Pilot scorecard'],
    icon: BarChart3,
  },
  operations: {
    includes: ['Workflow SOP', 'Working brief', 'Handoff check'],
    icon: Workflow,
  },
  'training-hr': {
    includes: ['Training path', 'Safe-use sheet', 'Capability tracker'],
    icon: BookOpen,
  },
} satisfies Record<RoleSlug, { readonly includes: readonly string[]; readonly icon: IconType }>;

function rolePlaybookResource(slug: RoleSlug): PublicDownloadResource {
  const resource = getFreeResource(`${slug}-playbook`);
  if (!isPublicDownloadResource(resource) || resource.category !== 'playbook') {
    throw new Error(`Missing public role playbook download for ${slug}`);
  }
  return resource;
}

export const rolePlaybooks: RolePlaybook[] = PLAYBOOK_INDEX.map(({ slug, title, desc }) => {
  const presentation = ROLE_PLAYBOOK_PRESENTATION[slug];
  const resource = rolePlaybookResource(slug);
  return {
    slug,
    title,
    desc,
    includes: [...presentation.includes],
    pdf: resourceDownloadHref(resource),
    word: resource.variants.word ?? undefined,
    readHref: readableResourceHref(resource) ?? undefined,
    icon: presentation.icon,
  };
});

export interface ProblemPath {
  title: string;
  artifact: string;
  format: 'Template' | 'Card' | 'Desk card' | 'Sample';
  href: string;
  readHref?: string;
  largePrint?: string;
  icon: IconType;
}

function problemArtifact(slug: string): Pick<ProblemPath, 'artifact' | 'href' | 'readHref' | 'largePrint'> {
  const resource = getFreeResource(slug);
  if (!resource || resource.status !== 'public') {
    throw new Error(`Missing public problem-path resource for ${slug}`);
  }

  return {
    artifact: resource.title,
    href: resource.canonicalRoute,
    readHref: readableResourceHref(resource) ?? undefined,
    largePrint: largePrintResourceHref(resource) ?? undefined,
  };
}

export const problemPaths: ProblemPath[] = [
  { title: 'Set AI rules', ...problemArtifact('template-ai-use-policy-starter'), format: 'Template', icon: ShieldCheck },
  { title: 'Review a use case', ...problemArtifact('artifact-ai-use-case-inventory'), format: 'Card', icon: ClipboardCheck },
  { title: 'Train staff', ...problemArtifact('safe-ai-use-checklist'), format: 'Desk card', icon: BookOpen },
  { title: 'Build a workflow SOP', ...problemArtifact('template-ai-workflow-sop'), format: 'Template', icon: Workflow },
  { title: 'Brief leadership', ...problemArtifact('template-board-briefing-checklist'), format: 'Template', icon: BarChart3 },
  { title: 'Preview paid output', ...problemArtifact('sample-readiness-report'), format: 'Sample', icon: Eye },
];

export interface Template {
  slug: string;
  title: string;
  format: string;
  desc: string;
  preview: string[];
  /** Primary URL — HTML page (canonical) or raw markdown. */
  href: string;
  /** Editable download for the template card, usually a Word-compatible doc. */
  download?: string;
  /** Optional role slugs for role-filtered discovery. */
  roles?: string[];
  icon: IconType;
}

const TEMPLATE_PRESENTATION = {
  'ai-use-case-inventory': { icon: ClipboardCheck },
  'ai-workflow-sop': { icon: Workflow },
  'board-briefing-checklist': { icon: BarChart3 },
  'cdfi-grant-ai-evidence-checklist': { icon: BadgeCheck },
  'ai-use-policy-starter': { icon: FileText },
  'gtm-plan': { icon: Megaphone },
} satisfies Record<TemplateSlug, { readonly icon: IconType }>;

function templateWordHref(slug: TemplateSlug): string {
  const wordHref = `/api/resources/templates/${slug}/word`;
  const resource = publicFreeResources.find(
    (entry) => entry.visibleSurfaces.includes('template') && entry.variants.word === wordHref,
  );
  if (!resource) throw new Error(`Missing public template Word resource for ${slug}`);
  return wordHref;
}

const genericTemplates: Template[] = TEMPLATE_INDEX.map((template) => {
  const presentation = TEMPLATE_PRESENTATION[template.slug];
  return {
    slug: template.slug,
    title: template.title,
    format: `Template · ${template.readMinutes} min`,
    desc: template.dek,
    preview: [...template.preview],
    href: `/resources/templates/${template.slug}`,
    download: templateWordHref(template.slug),
    icon: presentation.icon,
  };
});

const roleSpecificTemplates: Template[] = [
  {
    slug: 'sar-narrative-template',
    title: 'The BSA/AML SAR Narrative Scaffold',
    format: 'Template · BSA/AML',
    desc: 'A human-reviewed template for who, what, when, where, why, how, missing facts, and evidence retention.',
    preview: ['Who / what / when / where / why / how', 'Missing facts', 'Reviewer sign-off', 'Evidence retention'],
    href: '/playbooks/bsa-aml/sar-narrative-template',
    download: '/api/playbooks/bsa-aml/sar-narrative-template/word',
    roles: ['bsa-aml'],
    icon: FileText,
  },
];

export const templates: Template[] = [...genericTemplates, ...roleSpecificTemplates];

export interface DeskCard {
  slug: string;
  title: string;
  type: string;
  desc: string;
  href: string;
  word?: string;
  readHref?: string;
  largePrint?: string;
  icon: IconType;
}

const DESK_CARD_PRESENTATION: Record<string, { readonly type: string; readonly desc: string; readonly icon: IconType }> = {
  'safe-ai-use-checklist': {
    type: 'Staff card',
    desc: 'Strip data, ask clearly, fact-check, escalate.',
    icon: ShieldCheck,
  },
  'red-yellow-green-use-card': {
    type: 'Staff card',
    desc: 'Classify AI use cases in ten seconds.',
    icon: BadgeCheck,
  },
  'prompt-strategy-cheat-sheet': {
    type: 'Prompt card',
    desc: 'Write prompts with role, context, format, constraints, and review.',
    icon: Sparkles,
  },
  'regulatory-cheatsheet': {
    type: 'Reference',
    desc: 'SR 26-2, ECOA / Reg B, TPRM, BSA/AML, and AI lexicon basics.',
    icon: BookOpen,
  },
  'platform-feature-reference-card': {
    type: 'Reference',
    desc: 'Which platform features to use for drafting, summarizing, review, and evidence capture.',
    icon: Library,
  },
};

export const deskCards: DeskCard[] = publicDownloadResourcesByCategory('desk-card').map((resource) => {
  const presentation = DESK_CARD_PRESENTATION[resource.slug];
  if (!presentation) throw new Error(`Missing desk-card presentation for ${resource.slug}`);

  return {
    slug: resource.slug,
    title: resource.title,
    type: presentation.type,
    desc: presentation.desc,
    href: resourceDownloadHref(resource),
    word: resource.variants.word ?? undefined,
    readHref: readableResourceHref(resource) ?? undefined,
    largePrint: largePrintResourceHref(resource) ?? undefined,
    icon: presentation.icon,
  };
});

export interface PaidPreview {
  slug: string;
  title: string;
  desc: string;
  href: string;
  word?: string;
  readHref?: string;
  actionLabel: string;
  icon: IconType;
}

const PAID_PREVIEW_PRESENTATION: Record<string, { readonly desc: string; readonly actionLabel: string; readonly icon: IconType }> = {
  'in-depth-playbook': {
    desc: 'How the $99 report turns assessment results into a 90-day AI win.',
    actionLabel: 'Open playbook',
    icon: Library,
  },
  'sample-readiness-report': {
    desc: 'Score, maturity tier, top gap, dimension snapshot, and starter artifact.',
    actionLabel: 'Open sample',
    icon: BarChart3,
  },
};

export const paidPreviews: PaidPreview[] = publicDownloadResourcesByCategory('paid-preview').map((resource) => {
  const presentation = PAID_PREVIEW_PRESENTATION[resource.slug];
  if (!presentation) throw new Error(`Missing paid-preview presentation for ${resource.slug}`);

  return {
    slug: resource.slug,
    title: resource.title,
    desc: presentation.desc,
    href: resourceDownloadHref(resource),
    word: resource.variants.word ?? undefined,
    readHref: readableResourceHref(resource) ?? undefined,
    actionLabel: presentation.actionLabel,
    icon: presentation.icon,
  };
});

export const chooserTabs = ['By role', 'By problem', 'By format'] as const;
export type ChooserTab = (typeof chooserTabs)[number];

/** Used by Playwright to enumerate every downloadable href on the page. */
export function allDownloadHrefs(): string[] {
  const hrefs = new Set<string>();
  starterKits.forEach((k) => {
    k.items.forEach((i) => {
      hrefs.add(i.href);
      if (i.readHref) hrefs.add(i.readHref);
      if (i.largePrint) hrefs.add(i.largePrint);
    });
    hrefs.add(k.zip);
  });
  rolePlaybooks.forEach((r) => hrefs.add(r.pdf));
  problemPaths.forEach((p) => hrefs.add(p.href));
  templates.forEach((t) => {
    hrefs.add(t.href);
    if (t.download) hrefs.add(t.download);
  });
  deskCards.forEach((d) => {
    hrefs.add(d.href);
    if (d.word) hrefs.add(d.word);
    if (d.largePrint) hrefs.add(d.largePrint);
  });
  paidPreviews.forEach((p) => {
    hrefs.add(p.href);
    if (p.word) hrefs.add(p.word);
  });
  rolePlaybooks.forEach((r) => {
    if (r.word) hrefs.add(r.word);
    if (r.readHref) hrefs.add(r.readHref);
  });
  problemPaths.forEach((p) => {
    if (p.readHref) hrefs.add(p.readHref);
    if (p.largePrint) hrefs.add(p.largePrint);
  });
  deskCards.forEach((d) => {
    if (d.readHref) hrefs.add(d.readHref);
  });
  paidPreviews.forEach((p) => {
    if (p.readHref) hrefs.add(p.readHref);
  });
  return Array.from(hrefs);
}
