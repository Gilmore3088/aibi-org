// Synthetic persona generator for the persona-wave harness.
//
// Deterministic: the same WAVE_SEED always yields the same 100 personas, so a
// wave can be re-run after a fix and compared row-for-row. Journey mix is a
// fixed quota (not a weighted draw) so every wave covers every journey, with
// the course deliberately over-weighted.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  const rand = mulberry32(seed);
  return {
    next: rand,
    int: (min, max) => min + Math.floor(rand() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    chance: (p) => rand() < p,
    shuffle: (arr) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

const FI_TYPES = [
  'Community bank <$250M',
  'Community bank $250M-$1B',
  'Community bank $1B-$10B',
  'Credit union <$250M',
  'Credit union $250M-$1B',
  'Credit union $1B+',
  'Mutual / thrift',
  'De novo bank',
  'CDFI',
  'MDI',
  'Trust company',
  "Bankers' bank",
];

const ROLES = [
  { role: 'CEO', track: 'exec' },
  { role: 'CFO', track: 'exec' },
  { role: 'COO', track: 'exec' },
  { role: 'Chief Risk Officer', track: 'risk' },
  { role: 'Compliance Officer', track: 'risk' },
  { role: 'BSA/AML Officer', track: 'risk' },
  { role: 'Internal Auditor', track: 'risk' },
  { role: 'CIO / IT Manager', track: 'it' },
  { role: 'CISO', track: 'it' },
  { role: 'Commercial Lender', track: 'lending' },
  { role: 'Consumer Lender', track: 'lending' },
  { role: 'Branch Manager', track: 'retail' },
  { role: 'Teller / MSR', track: 'retail' },
  { role: 'Operations Specialist', track: 'ops' },
  { role: 'Deposit Ops Manager', track: 'ops' },
  { role: 'Marketing Lead', track: 'marketing' },
  { role: 'HR / L&D Director', track: 'hr' },
  { role: 'Board Director', track: 'exec' },
  { role: 'Innovation Officer', track: 'it' },
  { role: 'Data Analyst', track: 'ops' },
];

const TEMPERAMENTS = [
  { temperament: 'eager early adopter', tech: 'high', patience: 1.3, curiosity: 0.3 },
  { temperament: 'skeptic, ROI-driven', tech: 'medium', patience: 0.7, curiosity: 0.1 },
  { temperament: 'time-starved', tech: 'medium', patience: 0.5, curiosity: 0.08 },
  { temperament: 'detail-oriented', tech: 'medium', patience: 1.2, curiosity: 0.15 },
  { temperament: 'overwhelmed, low tech', tech: 'low', patience: 0.8, curiosity: 0.2 },
  { temperament: 'box-checker', tech: 'medium', patience: 0.9, curiosity: 0.05 },
  { temperament: 'curious browser', tech: 'high', patience: 1.0, curiosity: 0.4 },
  { temperament: 'cautious, security-first', tech: 'high', patience: 1.0, curiosity: 0.12 },
];

// Source decides where the persona lands, which is how real traffic arrives.
const SOURCES = [
  { source: 'Google search', entry: '/' },
  { source: 'LinkedIn post', entry: '/' },
  { source: 'Trade newsletter', entry: '/resources' },
  { source: 'Conference QR code', entry: '/assessment' },
  { source: 'Retargeting ad', entry: '/assessment/take' },
  { source: 'Board forwarded link', entry: '/assessment' },
  { source: 'Typed URL', entry: '/' },
  { source: 'Peer referral', entry: '/courses' },
  { source: 'HR enrollment email', entry: '/courses/foundation/program' },
  { source: 'Purchase receipt email', entry: '/courses/foundation/program' },
];

// Journey quotas (sum = 100). The course carries 40 of 100 personas because
// that is where delivered value has to be proven.
import { FEATURE_JOURNEYS, FEATURE_QUOTAS } from './features.mjs';

// Wave 2 personas land where their chosen variant starts.
function featureSource(journey, rng) {
  const variants = FEATURE_JOURNEYS[journey];
  const variant = rng.int(0, variants.length - 1);
  const entry = variants[variant].find((st) => st.enter)?.enter ?? '/';
  const source = entry === '/' ? rng.pick(['Google search', 'LinkedIn post', 'Typed URL']) : rng.pick(['Trade newsletter', 'Peer referral', 'Google search', 'Email link']);
  return { source, entry, variant };
}

export const JOURNEY_QUOTAS = [
  { journey: 'course-sampler', count: 10, label: 'Buys course, samples 1-2 modules' },
  { journey: 'course-quitter', count: 10, label: 'Buys course, stalls around module 3-5' },
  { journey: 'course-steady', count: 10, label: 'Works through 6-12 modules' },
  { journey: 'course-completer', count: 10, label: 'Completes all 18 modules + certificate' },
  { journey: 'course-shopper', count: 8, label: 'Evaluates the course and tries to buy' },
  { journey: 'free-assessment', count: 14, label: 'Takes the free assessment' },
  { journey: 'assessment-to-indepth', count: 8, label: 'Free assessment then $99 In-Depth' },
  { journey: 'resource-hunter', count: 10, label: 'Hunts for a free template/download' },
  { journey: 'practice-tinkerer', count: 5, label: 'Tries the AI practice sandbox' },
  { journey: 'institution-buyer', count: 5, label: 'Evaluates a team/institution rollout' },
  { journey: 'pricing-skeptic', count: 5, label: 'Compares price and ROI, then decides' },
  { journey: 'cert-verifier', count: 2, label: 'Verifies a certificate' },
  { journey: 'explorer', count: 3, label: 'Pure random walk, no goal' },
];

function sourceFor(journey, rng) {
  if (journey.startsWith('course-') && journey !== 'course-shopper') {
    return rng.pick(SOURCES.filter((s) => s.entry.startsWith('/courses/foundation/program')));
  }
  if (journey === 'cert-verifier') return { source: 'Typed URL', entry: '/verify' };
  if (journey === 'resource-hunter') {
    return rng.pick(SOURCES.filter((s) => ['/', '/resources'].includes(s.entry)));
  }
  return rng.pick(SOURCES.filter((s) => !s.entry.startsWith('/courses/foundation/program')));
}

function courseDepth(journey, rng) {
  switch (journey) {
    case 'course-sampler': return rng.int(1, 2);
    case 'course-quitter': return rng.int(3, 5);
    case 'course-steady': return rng.int(6, 12);
    case 'course-completer': return 18;
    default: return 0;
  }
}

export function quotasFor(set = 'core') {
  return set === 'features' ? FEATURE_QUOTAS : JOURNEY_QUOTAS;
}

// Every journey label across both waves (for reports).
export const ALL_QUOTAS = [...JOURNEY_QUOTAS, ...FEATURE_QUOTAS];

export function generatePersonas(seed = 20260930, total = 100, set = 'core') {
  const rng = makeRng(seed);
  const journeys = rng.shuffle(
    quotasFor(set).flatMap((q) => Array.from({ length: q.count }, () => q.journey)),
  ).slice(0, total);

  return journeys.map((journey, i) => {
    const role = rng.pick(ROLES);
    const temper = rng.pick(TEMPERAMENTS);
    const src = set === 'features' ? featureSource(journey, rng) : sourceFor(journey, rng);
    const mobile = rng.chance(temper.temperament === 'time-starved' ? 0.6 : 0.3);
    const id = `P${String(i + 1).padStart(3, '0')}`;
    const courseDepthFor = courseDepth(journey, rng);
    return {
      id,
      seed: Math.floor(rng.next() * 2 ** 31),
      journey,
      fiType: rng.pick(FI_TYPES),
      role: role.role,
      track: role.track,
      temperament: temper.temperament,
      tech: temper.tech,
      device: mobile ? 'mobile' : 'desktop',
      source: src.source,
      entry: src.entry,
      variant: src.variant ?? 0,
      // Max clicks before the persona gives up on its own, independent of errors.
      // Course learners' patience is already expressed as courseDepth.
      clickBudget: journey.startsWith('course-') && journey !== 'course-shopper'
        ? 60 + 60 * courseDepthFor
        : Math.round((set === 'features' ? 60 : 30) * temper.patience),
      // Dead ends / errors tolerated before rage-quitting.
      frustrationTolerance: Math.max(1, Math.round(3 * temper.patience)),
      // Probability of wandering off-goal on any given step.
      curiosity: temper.curiosity,
      courseDepth: courseDepthFor,
      // Maturity bias for assessment answers: 0 = picks low options, 1 = high.
      maturity: rng.next(),
      emailsForReport: rng.chance(temper.temperament.includes('skeptic') ? 0.3 : 0.7),
    };
  });
}

export function personaLabel(p) {
  return `${p.id} ${p.role} · ${p.fiType} · ${p.temperament} · ${p.device}`;
}
