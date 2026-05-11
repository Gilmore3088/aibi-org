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
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}#organization`,
    name: 'The AI Banking Institute',
    alternateName: 'AiBI',
    url: SITE_URL,
    logo: `${SITE_URL}/aibi-logo.svg`,
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

/**
 * Renders a JSON-LD object as the inner content of a <script> tag.
 * Caller is responsible for the surrounding <script type="application/ld+json">.
 * Strips trailing undefined values (which JSON.stringify omits) and HTML-escapes
 * the closing `</` sequence to prevent script-tag breakage.
 */
export function jsonLdString(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
