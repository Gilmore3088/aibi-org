import { downloadableFreeResources } from './freeResources';

export type DownloadTier = 'free' | 'foundation' | 'aibi-s' | 'aibi-l' | 'in-depth-assessment';
export type DownloadFileType = 'pdf' | 'zip';
export type DownloadCategory =
  | 'playbook'
  | 'starter-kit'
  | 'template'
  | 'desk-card'
  | 'artifact'
  | 'paid-preview'
  | 'course-artifact'
  | 'other';

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

const DOWNLOAD_RESOURCES: readonly DownloadResource[] = downloadableFreeResources.map((resource) => {
  return {
    id: null,
    slug: resource.slug,
    title: resource.title,
    description: '',
    category: resource.category,
    file_path: resource.download.filePath,
    file_type: resource.download.fileType,
    tier_required: resource.download.tierRequired,
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
