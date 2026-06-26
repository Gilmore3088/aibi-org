import type { Metadata } from 'next';
import CoursesIndexPage from './_client';
import {
  ARTIFACT_FIRST_BY_MODULE,
  foundationCourseConfig,
} from '@content/courses/foundation-program';

const MODULE_COUNT = foundationCourseConfig.modules.length;
const ARTIFACT_COUNT = Object.keys(ARTIFACT_FIRST_BY_MODULE).length;
const SAMPLE_PACKET_MODULES = [1, 4, 13, 18] as const;

const courseOverviewFacts = {
  moduleCount: MODULE_COUNT,
  artifactCount: ARTIFACT_COUNT,
  individualPriceLabel: '$295',
  teamSeatPriceLabel: '$199',
  samplePacketSlots: SAMPLE_PACKET_MODULES.map((moduleNumber) => ({
    moduleNumber,
    label: ARTIFACT_FIRST_BY_MODULE[moduleNumber].saved,
  })),
};

const TITLE = 'AiBI Foundation Course';
const DESCRIPTION =
  `AiBI Foundation is a ${MODULE_COUNT}-module course where bankers build prompt cards, skill templates, workflow maps, and a ${ARTIFACT_COUNT}-piece Foundation Packet.`;

export const metadata: Metadata = {
  alternates: { canonical: '/courses' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/courses',
    type: 'website',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <CoursesIndexPage facts={courseOverviewFacts} />;
}
