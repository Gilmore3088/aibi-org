import manifest from './freeResources.manifest.json';

export type FreeResourceStatus = 'public' | 'planned' | 'archived';
export type FreeResourceGatePolicy = 'free' | 'free-email-gated' | 'paid-entitlement' | 'planned' | 'source-only';
export type FreeResourceFileType = 'pdf' | 'zip';
export type FreeResourceCategory =
  | 'playbook'
  | 'starter-kit'
  | 'template'
  | 'desk-card'
  | 'artifact'
  | 'paid-preview'
  | 'course-artifact'
  | 'other';

export type FreeResourceDownloadTier =
  | 'free'
  | 'foundation'
  | 'aibi-s'
  | 'aibi-l'
  | 'in-depth-assessment';

export interface FreeResourceDownload {
  readonly filePath: string;
  readonly fileType: FreeResourceFileType;
  readonly tierRequired: FreeResourceDownloadTier;
}

export interface FreeResourceVariants {
  readonly pdf: string | null;
  readonly word: string | null;
  readonly zip: string | null;
  readonly largePrintPdf?: string | null;
}

export interface FreeResourceAssessmentMapping {
  readonly roles: readonly string[];
  readonly tierLabels: readonly string[];
  readonly topGaps: readonly string[];
}

export interface FreeResource {
  readonly slug: string;
  readonly title: string;
  readonly audience: readonly string[];
  readonly category: FreeResourceCategory;
  readonly funnelSegment: string;
  readonly visibleSurfaces: readonly string[];
  readonly download: FreeResourceDownload | null;
  readonly variants: FreeResourceVariants;
  readonly zipMembership: readonly string[];
  readonly canonicalRoute: string;
  readonly sourceCitations: readonly string[];
  readonly gatePolicy: FreeResourceGatePolicy;
  readonly assessmentMapping: FreeResourceAssessmentMapping;
  readonly status: FreeResourceStatus;
}

export const freeResourceManifestVersion = manifest.version;

export const freeResources = manifest.resources as readonly FreeResource[];

export const publicFreeResources = freeResources.filter(
  (resource) => resource.status === 'public',
);

export const downloadableFreeResources = publicFreeResources.filter(
  (resource): resource is FreeResource & { readonly download: FreeResourceDownload } =>
    resource.download !== null,
);

export type ReadableFreeResource = FreeResource & {
  readonly download: FreeResourceDownload & { readonly fileType: 'pdf' };
  readonly variants: FreeResourceVariants & { readonly word: string };
};

export type LargePrintFreeResource = FreeResource & {
  readonly download: FreeResourceDownload & { readonly fileType: 'pdf' };
  readonly variants: FreeResourceVariants & { readonly largePrintPdf: string };
};

const LARGE_PRINT_RESOURCE_CATEGORIES = new Set<FreeResourceCategory>([
  'desk-card',
  'artifact',
]);

const RESOURCE_BY_SLUG = new Map(freeResources.map((resource) => [resource.slug, resource]));

export function getFreeResource(slug: string): FreeResource | null {
  return RESOURCE_BY_SLUG.get(slug) ?? null;
}

export function expectedSourceBackedWordRoute(slug: string): string {
  return `/api/resources/${slug}/word`;
}

export function expectedLargePrintRoute(slug: string): string {
  return `/api/resources/${slug}/large-print`;
}

export function isReadableFreeResource(resource: FreeResource | null): resource is ReadableFreeResource {
  return Boolean(
    resource &&
      resource.status === 'public' &&
      resource.download &&
      resource.download.fileType === 'pdf' &&
      resource.variants.word === expectedSourceBackedWordRoute(resource.slug),
  );
}

export function readableResourceHref(resource: FreeResource | null): string | null {
  return isReadableFreeResource(resource) ? `/resources/access/${resource.slug}` : null;
}

export const readableFreeResources = publicFreeResources.filter(isReadableFreeResource);

export function isLargePrintFreeResource(resource: FreeResource | null): resource is LargePrintFreeResource {
  return Boolean(
    resource &&
      resource.status === 'public' &&
      LARGE_PRINT_RESOURCE_CATEGORIES.has(resource.category) &&
      resource.download &&
      resource.download.fileType === 'pdf' &&
      resource.variants.word === expectedSourceBackedWordRoute(resource.slug) &&
      resource.variants.largePrintPdf === expectedLargePrintRoute(resource.slug),
  );
}

export function largePrintResourceHref(resource: FreeResource | null): string | null {
  return isLargePrintFreeResource(resource) ? expectedLargePrintRoute(resource.slug) : null;
}

export function largePrintFilePath(slug: string): string {
  return `large-print/${slug}.pdf`;
}

export const largePrintFreeResources = publicFreeResources.filter(isLargePrintFreeResource);
