/**
 * Marketing copy registry — taglines, mission, value props, CTAs.
 *
 * One source of truth for every voice-of-brand string that appears on more
 * than one page. Updating the tagline here updates Header, Footer, og:title,
 * sitemap, and any page that references it.
 */

export const BRAND = {
  name: "The AI Banking Institute",
  shortName: "AiBI",
  tagline: "Turning Bankers into Builders",
  positioning:
    "An education company for community banks and credit unions, built on regulator-aligned criteria.",
  mission:
    "Turn the people inside community banks into the people who get to build the next era of community banking.",
  audience: "community banks and credit unions",
  founder: {
    name: "James Gilmore",
    role: "Founder · The AI Banking Institute",
    // Bio intentionally empty until founder provides real copy.
    // Pages that render BRAND.founder.bio should treat empty as "hide the bio block."
    bio: "",
  },
  emails: {
    contact: "hello@aibankinginstitute.com",
  },
  domains: {
    primary: "aibankinginstitute.com",
    secondary: "aibankinginstitute.org",
  },
} as const;

/** Editorial principles — published on /about under "How we work". */
export const PRINCIPLES = [
  {
    number: "01",
    title: "Bankers, not platforms.",
    body: "Every program is for a person inside the bank. Software comes second — and only when it serves the curriculum.",
  },
  {
    number: "02",
    title: "Sourced numbers only.",
    body: "Every claim cites its origin. If we don't have data, we say so. No marketing statistics.",
  },
  {
    number: "03",
    title: "Regulator-aligned by design.",
    body: "Curriculum maps to SR 11-7, TPRM, ECOA / Reg B, and the AIEOG lexicon — not as a footnote, as the structure.",
  },
  {
    number: "04",
    title: "Reviewed work, not quizzes.",
    body: "Practitioners ship reviewed artifacts. We are not in the multiple-choice business.",
  },
  {
    number: "05",
    title: "Self-paced, role-aware.",
    body: "Tellers, lenders, ops, compliance, risk, executive support. The same curriculum, the right artifacts.",
  },
  {
    number: "06",
    title: "Plain language, plain prices.",
    body: "Tuition is published. Methodology is published. The Institute should read like a research shop, not a sales funnel.",
  },
] as const;

/** Standard CTAs — referenced from many pages. */
export const CTAS = {
  beginAssessment: { href: "/assessment/start", label: "Begin the readiness assessment" },
  takeAssessment: { href: "/assessment/start", label: "Take the assessment" },
  viewCurriculum: { href: "/education", label: "View the curriculum" },
  enrollPractitioner: { href: "/education/practitioner/purchase", label: "Enroll — $295" },
  contactInstitute: { href: `mailto:${BRAND.emails.contact}`, label: "Contact the Institute" },
  requestPilot: { href: "/for-institutions#pilot", label: "Request a pilot" },
} as const;
