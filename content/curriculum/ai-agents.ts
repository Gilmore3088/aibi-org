/**
 * AI Agents the AiBI Foundations curriculum teaches bankers to build.
 *
 * "Agent" here is the AI primitive distinct from a Skill — a multi-step
 * workflow that chains Skills, decision logic, and human checkpoints
 * (Module 8: Agents and Workflow Thinking). The discipline: map every
 * step, every decision, and every place a human signs off, BEFORE you
 * automate any of it.
 *
 * Each Agent in this file is composed from the Skills in
 * `content/curriculum/ai-skills.ts`. Steps are intentionally explicit
 * about which transitions are AI-drafted and which require a human gate.
 *
 * The flagships listed here are a representative sample — the full
 * library grows as practitioners ship their own and the curriculum
 * publishes new patterns.
 */

import type { AiSkillDept } from "./ai-skills";

export type AiAgentDept = AiSkillDept | "Strategy";

export interface AiAgent {
  readonly cmd: string;
  readonly name: string;
  readonly dept: AiAgentDept;
  readonly summary: string;
}

export const AI_AGENTS: readonly AiAgent[] = [
  {
    cmd: "/loan-origination",
    name: "Loan origination workflow",
    dept: "Lending",
    summary:
      "Intake → /credit-memo draft → exception memo if outside policy → /adverse-action if denied. Human gates at credit decision and final signoff.",
  },
  {
    cmd: "/vendor-onboarding",
    name: "Vendor risk onboarding",
    dept: "Compliance",
    summary:
      "SOC 2 + DPA summary → risk classification → SR 11-7 / TPRM mapping → board memo draft. Stops at model risk officer signoff. No auto-approve.",
  },
  {
    cmd: "/board-packet",
    name: "Board packet assembly",
    dept: "Executive",
    summary:
      "Calls /board-packet-section across ALCO, credit quality, deposits, capital. Appends /board-prep-market-brief. Returns one draft for CEO review.",
  },
  {
    cmd: "/sar-from-alert",
    name: "BSA alert to SAR",
    dept: "Compliance",
    summary:
      "Ingests the alert + KYC + transaction patterns. Drafts via /sar-narrative. Queues for BSA officer review with the supporting file linked.",
  },
  {
    cmd: "/exam-prep",
    name: "Examiner preparation",
    dept: "Compliance",
    summary:
      "Pulls prior findings + current posture + supporting evidence. Assembles the binder. Runs a mock interview against the likely questions.",
  },
  {
    cmd: "/competitive-intelligence",
    name: "Competitive intelligence cycle",
    dept: "Strategy",
    summary:
      "Calls /local-institution-research across a defined peer set. Synthesizes the patterns. Produces a market-positioning brief, sourced.",
  },
] as const;
