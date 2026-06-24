'use client';

import { FreeResourceDownloadGate } from '@/components/resources/FreeResourceDownloadGate';

interface TemplateActionsProps {
  readonly title: string;
  readonly slug: string;
}

export function TemplateActions({ title, slug }: TemplateActionsProps) {
  return (
    <div className="mk-tpl-copy" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <FreeResourceDownloadGate
        title={title}
        href={`/api/resources/templates/${slug}/word`}
        slug={`template-${slug}`}
        source="resources-template-page"
        format="Word"
        actionLabel="Get Word doc"
        capturedLabel="Download Word doc"
        buttonVariant="gold"
      />
    </div>
  );
}
