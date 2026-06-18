// Structured data (JSON-LD) helpers — schema.org definitions emitted in
// <script type="application/ld+json"> tags for SEO. Validated against
// https://validator.schema.org/ and Google's Rich Results test.
//
// Reference: https://developers.google.com/search/docs/appearance/structured-data
//
// Keep the types loose (`Record<string, unknown>`) since the schema.org
// vocabulary is open-ended and TypeScript can't usefully model the full
// JSON-LD shape. We trust the inputs at the call site.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com';

export function organizationJsonLd(): Record<string, unknown> {
  // sameAs (#278): add verified profile URLs as env vars are configured.
  const sameAsUrls = [
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
  ].filter(Boolean) as string[];

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}#organization`,
    name: 'The AI Banking Institute',
    alternateName: 'AiBI',
    url: SITE_URL,
    // Resolves to the served favicon mark at app/icon.svg. The legacy
    // /aibi-logo.svg path 404'd — no such asset in public/.
    logo: `${SITE_URL}/icon.svg`,
    slogan: 'Turning Bankers into Builders',
    description:
      'The AI Banking Institute helps community banks and credit unions build AI proficiency through assessment, certification, and curriculum aligned with SR 11-7, TPRM, ECOA / Reg B, and the AIEOG AI Lexicon.',
    email: 'hello@aibankinginstitute.com',
    foundingDate: '2026',
    knowsAbout: [
      'AI governance',
      'SR 11-7 model risk management',
      'Interagency TPRM Guidance',
      'ECOA / Regulation B',
      'AIEOG AI Lexicon',
      'Community bank AI adoption',
      'Credit union AI training',
    ],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'community bank and credit union staff',
    },
    ...(sameAsUrls.length > 0 ? { sameAs: sameAsUrls } : {}),
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: 'The AI Banking Institute',
    publisher: { '@id': `${SITE_URL}#organization` },
    inLanguage: 'en-US',
  };
}

interface CourseJsonLdInput {
  readonly name: string;
  readonly description: string;
  readonly slug: string;
  readonly modules?: number;
  readonly hours?: number;
  readonly priceUSD?: number;
}

interface FAQJsonLdInput {
  readonly questions: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
}

interface ArticleJsonLdInput {
  readonly slug: string;
  readonly headline: string;
  readonly description: string;
  readonly datePublished?: string;
  readonly dateModified?: string;
  readonly authorName?: string;
}

interface BreadcrumbJsonLdInput {
  readonly items: readonly {
    readonly name: string;
    readonly slug: string;
  }[];
}

export function courseJsonLd(input: CourseJsonLdInput): Record<string, unknown> {
  const courseUrl = `${SITE_URL}${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${courseUrl}#course`,
    name: input.name,
    description: input.description,
    url: courseUrl,
    provider: { '@id': `${SITE_URL}#organization` },
    inLanguage: 'en-US',
    educationalLevel: 'Professional certification',
    teaches: [
      'Safe AI prompting for banking work',
      'Reviewing AI outputs for errors and unsupported claims',
      'Avoiding sensitive data exposure in public AI tools',
      'AI governance and policy alignment',
    ],
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: input.hours ? `PT${input.hours}H` : undefined,
      inLanguage: 'en-US',
    },
    ...(input.priceUSD
      ? {
          offers: {
            '@type': 'Offer',
            price: input.priceUSD.toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: courseUrl,
          },
        }
      : {}),
  };
}

export function faqPageJsonLd(input: FAQJsonLdInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: input.questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function articleJsonLd(input: ArticleJsonLdInput): Record<string, unknown> {
  const articleUrl = `${SITE_URL}${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: input.headline,
    description: input.description,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    publisher: { '@id': `${SITE_URL}#organization` },
    author: {
      '@type': 'Organization',
      name: input.authorName ?? 'The AI Banking Institute',
      url: SITE_URL,
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    inLanguage: 'en-US',
  };
}

export function breadcrumbListJsonLd(input: BreadcrumbJsonLdInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.slug}`,
    })),
  };
}

/**
 * Renders a JSON-LD object as the inner content of a <script> tag.
 * Caller is responsible for the surrounding <script type="application/ld+json">.
 * Strips trailing undefined values (which JSON.stringify omits) and HTML-escapes
 * the closing `</` sequence to prevent script-tag breakage.
 */
export function jsonLdString(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
