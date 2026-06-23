import { resourceMeta, type ResourceCategory } from './resourceMeta';

export type DownloadTier = 'free' | 'foundation' | 'aibi-s' | 'aibi-l' | 'in-depth-assessment';
export type DownloadFileType = 'pdf' | 'zip';
export type DownloadCategory =
  | 'playbook'
  | 'starter-kit'
  | 'template'
  | 'desk-card'
  | 'artifact'
  | 'paid-preview';

export interface DownloadResource {
  readonly id: string | null;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly category: DownloadCategory;
  readonly file_path: string;
  readonly file_type: DownloadFileType;
  readonly tier_required: DownloadTier;
  readonly published: true;
}

interface DownloadFile {
  readonly slug: string;
  readonly filePath: string;
  readonly fileType: DownloadFileType;
  readonly tierRequired?: DownloadTier;
}

const CATEGORY_TO_DOWNLOAD_CATEGORY: Record<ResourceCategory, DownloadCategory> = {
  'Role playbooks': 'playbook',
  'Starter kits': 'starter-kit',
  'Desk cards': 'desk-card',
  'Artifacts': 'artifact',
  'Templates': 'template',
  'Paid previews': 'paid-preview',
  'Course artifacts': 'artifact',
  'Other': 'artifact',
};

const DOWNLOAD_FILES: readonly DownloadFile[] = [
  { slug: 'safe-ai-use-checklist', filePath: 'safe-ai-use-checklist.pdf', fileType: 'pdf' },
  { slug: 'red-yellow-green-use-card', filePath: 'red-yellow-green-use-card.pdf', fileType: 'pdf' },
  { slug: 'prompt-strategy-cheat-sheet', filePath: 'prompt-strategy-cheat-sheet.pdf', fileType: 'pdf' },
  { slug: 'regulatory-cheatsheet', filePath: 'regulatory-cheatsheet.pdf', fileType: 'pdf' },
  { slug: 'platform-feature-reference-card', filePath: 'platform-feature-reference-card.pdf', fileType: 'pdf' },
  { slug: 'artifact-ai-use-case-inventory', filePath: 'artifact-ai-use-case-inventory.pdf', fileType: 'pdf' },
  {
    slug: 'artifact-data-handling-reference-card',
    filePath: 'artifact-data-handling-reference-card.pdf',
    fileType: 'pdf',
  },
  {
    slug: 'artifact-fair-lending-ai-review-checklist',
    filePath: 'artifact-fair-lending-ai-review-checklist.pdf',
    fileType: 'pdf',
  },
  { slug: 'compliance-playbook', filePath: 'compliance-playbook.pdf', fileType: 'pdf' },
  { slug: 'retail-playbook', filePath: 'retail-playbook.pdf', fileType: 'pdf' },
  { slug: 'lending-playbook', filePath: 'lending-playbook.pdf', fileType: 'pdf' },
  { slug: 'marketing-playbook', filePath: 'marketing-playbook.pdf', fileType: 'pdf' },
  { slug: 'bsa-aml-playbook', filePath: 'bsa-aml-playbook.pdf', fileType: 'pdf' },
  { slug: 'infosec-playbook', filePath: 'infosec-playbook.pdf', fileType: 'pdf' },
  { slug: 'in-depth-playbook', filePath: 'in-depth-playbook.pdf', fileType: 'pdf' },
  { slug: 'sample-readiness-report', filePath: 'sample-readiness-report.pdf', fileType: 'pdf' },
  { slug: 'governance-starter-kit', filePath: 'governance-starter-kit.zip', fileType: 'zip' },
  { slug: 'frontline-enablement-kit', filePath: 'frontline-enablement-kit.zip', fileType: 'zip' },
  { slug: 'marketing-review-kit', filePath: 'marketing-review-kit.zip', fileType: 'zip' },
  { slug: 'lending-review-kit', filePath: 'lending-review-kit.zip', fileType: 'zip' },
  { slug: 'template-ai-use-policy-starter', filePath: 'template-ai-use-policy-starter.pdf', fileType: 'pdf' },
  { slug: 'template-ai-workflow-sop', filePath: 'template-ai-workflow-sop.pdf', fileType: 'pdf' },
  {
    slug: 'template-board-briefing-checklist',
    filePath: 'template-board-briefing-checklist.pdf',
    fileType: 'pdf',
  },
  { slug: 'template-gtm-plan', filePath: 'template-gtm-plan.pdf', fileType: 'pdf' },
] as const;

const DOWNLOAD_RESOURCES: readonly DownloadResource[] = DOWNLOAD_FILES.map((file) => {
  const meta = resourceMeta(file.slug);
  return {
    id: null,
    slug: file.slug,
    title: meta.label,
    description: '',
    category: CATEGORY_TO_DOWNLOAD_CATEGORY[meta.category],
    file_path: file.filePath,
    file_type: file.fileType,
    tier_required: file.tierRequired ?? 'free',
    published: true,
  };
});

const DOWNLOAD_RESOURCE_BY_SLUG = new Map(DOWNLOAD_RESOURCES.map((resource) => [resource.slug, resource]));

export function getDownloadResource(slug: string): DownloadResource | null {
  return DOWNLOAD_RESOURCE_BY_SLUG.get(slug) ?? null;
}

export function allDownloadResources(): readonly DownloadResource[] {
  return DOWNLOAD_RESOURCES;
}
