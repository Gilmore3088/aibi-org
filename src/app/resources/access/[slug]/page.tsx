import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button, SiteHeader } from '@/components/mockup';
import { FreeResourceDownloadGate } from '@/components/resources/FreeResourceDownloadGate';
import { getReadableResourceDocument, readableResourceStaticParams } from '@/lib/resources/readableResourceContent';
import { ArrowRight, Download } from '@/app/resources/icons';

interface PageParams {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateStaticParams() {
  return readableResourceStaticParams();
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const document = await getReadableResourceDocument(slug);
  if (!document) return { title: 'Resource not found' };

  return {
    title: `${document.resource.title} - Readable HTML`,
    description: `Screen-reader-friendly HTML version of ${document.resource.title}.`,
    alternates: { canonical: `/resources/access/${document.resource.slug}` },
  };
}

export default async function ReadableResourcePage({ params }: PageParams) {
  const { slug } = await params;
  const document = await getReadableResourceDocument(slug);
  if (!document) notFound();

  const { resource, bodyHtml } = document;
  const pdfHref = `/api/resources/${resource.slug}/download`;
  const wordHref = resource.variants.word;

  return (
    <div className="mockup-scope rx-readable-page">
      <nav className="rx-skip-links" aria-label="Readable resource shortcuts">
        <a href="#resource-document">Skip to resource text</a>
        <a href="#resource-actions">Skip to downloads</a>
      </nav>
      <SiteHeader activePath="/resources" />

      <section className="rx-readable-hero">
        <div className="mk-container rx-readable-hero-inner">
          <div>
            <p className="mk-k">Accessible resource</p>
            <p className="rx-readable-lede">
              This is a simplified HTML version for reading, search, zoom, and assistive
              technology. The PDF and Word files remain available from this page.
            </p>
          </div>
          <div className="rx-readable-actions" id="resource-actions" aria-label="Resource downloads">
            <Button variant="ghost-light" href="/resources">
              Back to library
            </Button>
            <FreeResourceDownloadGate
              title={resource.title}
              href={pdfHref}
              slug={resource.slug}
              source="resources-readable-pdf"
              actionLabel="Get PDF"
              capturedLabel="Download PDF"
              buttonVariant="ink"
            >
              PDF <Download size={16} />
            </FreeResourceDownloadGate>
            <FreeResourceDownloadGate
              title={resource.title}
              href={wordHref}
              slug={resource.slug}
              source="resources-readable-word"
              format="Word"
              actionLabel="Get Word"
              capturedLabel="Download Word"
              buttonVariant="ghost-light"
            >
              Word <Download size={16} />
            </FreeResourceDownloadGate>
          </div>
        </div>
      </section>

      <main className="rx-readable-main" id="resource-document">
        <article
          className="rx-readable-document"
          aria-label={`${resource.title} readable HTML`}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </main>

      <section className="rx-readable-next">
        <div className="mk-container">
          <Button variant="gold" href="/resources">
            Browse more resources <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    </div>
  );
}
