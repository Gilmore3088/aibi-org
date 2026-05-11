// AiBI-Foundation Module 8: Agents and Workflow Thinking
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Workflow Map

import type { Module } from './types';

export const module8: Module = {
  number: 8,
  id: 'm8-agents-workflow-thinking',
  title: 'Agents and Workflow Thinking',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Workflow Map',
  sections: [
    {
      id: 'm8-agent-basics',
      title: 'What an Agent Is',
      content: `An AI agent is a system that can take a goal, use tools or steps, and move through a workflow with less manual prompting. In this foundation course, you are not building agents. You are learning how to recognize when agent-style workflow thinking helps and when it introduces risk.

The safe beginner version is a workflow map: define the steps, inputs, outputs, human checkpoints, and escalation points before any automation happens.`,
    },
    {
      id: 'm8-human-checkpoints',
      title: 'Human Checkpoints',
      content: `Every banking workflow needs human checkpoints. AI can draft, summarize, classify, and organize. Humans remain responsible for decisions, approvals, customer impact, credit judgment, legal conclusions, compliance determinations, and sensitive data handling.

Use checkpoints after source intake, before customer-facing output, before decisions, and before anything becomes part of an official record.`,
      tryThis:
        'Map a simple workflow you do every week and mark where a human must review the output.',
    },
    {
      id: 'm8-banking-boundary',
      title: 'Banking Boundary',
      content: `Agent-style workflows become riskier when they connect to live systems, send messages, update records, access customer data, or make decisions without review.

For AiBI-Foundation, keep agents conceptual. The goal is to understand the workflow shape, not automate regulated activity.`,
    },
  ],
  activities: [
    {
      id: '8.1',
      title: 'Map a Simple AI Workflow',
      description:
        'Create a workflow map with input, AI task, output, human checkpoint, and escalation boundary.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'workflowMap',
          label: 'Workflow map',
          type: 'textarea',
          placeholder:
            'Input: ... AI task: ... Output: ... Human checkpoint: ... Escalation boundary: ...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
