// Track descriptions consumed by TrackPicker (Wave 2a) and any other
// surface that needs the five-track copy in one place. Voice rules per
// CLAUDE.md: no banned words, no italics, no emoji.

import type { Track } from '@/components/addie/lesson/types';

export type AddieTrack = Track;

export interface TrackDescription {
  readonly label: string;
  readonly blurb: string;
  readonly who_for: string;
}

export const TRACK_DESCRIPTIONS: Record<AddieTrack, TrackDescription> = {
  risk_compliance: {
    label: 'Risk & Compliance',
    blurb:
      'You hold the line between curiosity and an exam finding. This track frames every lesson around the controls, the regulators, and the language you already use, with applied work that maps cleanly to SR 11-7, TPRM, and Reg B.',
    who_for: 'Risk officers, CCOs, BSA, audit, model risk, controls.',
  },
  customer_facing: {
    label: 'Customer-Facing',
    blurb:
      'You spend your day in member and customer conversations. This track keeps the examples close to the branch, the contact center, and the lending desk, and shows you how to get real help without ever putting a real name through a tool.',
    who_for: 'Branch, contact center, retail, lending, relationship banking.',
  },
  back_office: {
    label: 'Back-Office Process',
    blurb:
      'You move work through the bank: operations, payments, vendor handoffs, marketing campaigns. This track is built around process clarity, file hygiene, and the kinds of repeatable tasks AI tools handle well when the inputs are clean.',
    who_for: 'Operations, loan ops, treasury services, marketing, vendor management.',
  },
  technical: {
    label: 'Technical',
    blurb:
      'You own the systems other people lean on. This track moves faster on jargon, and treats credentials, logs, and production data as off-limits by default. Applied work focuses on prototypes, vendor evaluation, and safe debugging patterns.',
    who_for: 'IT, security, data, engineering, integration teams.',
  },
  leadership: {
    label: 'Leadership',
    blurb:
      'You set direction and answer to the board. This track stays at the framing layer: strategy, governance, talent, and the questions to ask a vendor or a regulator. Applied work produces talking points and one-page briefs, not technical artifacts.',
    who_for: 'CEO, COO, CFO, CIO/CTO, division heads, board reporters.',
  },
};
