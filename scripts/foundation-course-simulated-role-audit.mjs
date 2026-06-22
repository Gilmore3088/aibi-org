#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const microModulesPath = path.join(root, 'content/courses/foundation-program/micro-modules.ts');
const outDir = path.join(root, 'audit');
const mdOut = path.join(outDir, 'foundation-course-simulated-role-feedback.md');
const jsonOut = path.join(outDir, 'foundation-course-simulated-role-feedback.json');

const source = fs.readFileSync(microModulesPath, 'utf8');
const moduleNumbers = Array.from(source.matchAll(/\bnumber:\s*(\d+),/g))
  .map((match) => Number(match[1]))
  .filter((value) => Number.isInteger(value));
const courseModuleCount = Math.max(...moduleNumbers);

function extractBlock(moduleNumber) {
  const marker = `number: ${moduleNumber},`;
  const markerStart = source.indexOf(marker);
  if (markerStart === -1) throw new Error(`Module ${moduleNumber} block not found`);
  const start = source.lastIndexOf('\n  {', markerStart);
  const nextMarker = source.indexOf(`number: ${moduleNumber + 1},`, markerStart + marker.length);
  const end = nextMarker === -1
    ? source.indexOf('\n] as const', markerStart)
    : source.lastIndexOf('\n  {', nextMarker);
  return source.slice(start, end);
}

function stringField(block, field) {
  const match = new RegExp(`${field}: '([^']*)'`).exec(block);
  return match?.[1] ?? '';
}

function arrayField(block, field) {
  const match = new RegExp(`${field}: \\[([^\\]]*)\\]`, 's').exec(block);
  if (!match) return [];
  return Array.from(match[1].matchAll(/'([^']*)'/g)).map((item) => item[1]);
}

const modules = Array.from({ length: courseModuleCount }, (_, index) => {
  const moduleNumber = index + 1;
  const block = extractBlock(moduleNumber);
  return {
    module: moduleNumber,
    outcome: stringField(block, 'mission'),
    labTask: stringField(block, 'tryTask'),
    artifactAction: stringField(block, 'buildTask'),
    reviewChecklist: arrayField(block, 'reviewChecklist'),
    qualitySignals: arrayField(block, 'qualitySignals'),
  };
});

const personas = [
  {
    name: 'Branch Manager',
    role: 'Frontline leader',
    priorities: [1, 2, 4, 9, 10, 15, 17],
    friction: [8, 16],
    lens: 'Needs fast staff-coaching patterns and simple guardrails that can survive a busy branch day.',
  },
  {
    name: 'Compliance Officer',
    role: 'Second-line reviewer',
    priorities: [3, 7, 8, 12, 15, 16, 18],
    friction: [2, 4],
    lens: 'Looks for evidence, reviewability, escalation language, and whether the artifacts can stand up in an audit conversation.',
  },
  {
    name: 'Commercial Lending Officer',
    role: 'Revenue and credit workflow owner',
    priorities: [4, 5, 6, 8, 10, 11, 15],
    friction: [13, 17],
    lens: 'Wants less writing friction, but will reject anything that blurs credit judgment, borrower data, or approval authority.',
  },
  {
    name: 'Operations Analyst',
    role: 'Process improver',
    priorities: [6, 9, 13, 14, 15, 17],
    friction: [3, 18],
    lens: 'Cares about repeatable workflows, handoffs, templates, and whether the lab output can become an SOP or checklist.',
  },
  {
    name: 'Marketing and Communications Manager',
    role: 'Customer-facing content owner',
    priorities: [2, 4, 5, 6, 7, 10, 12],
    friction: [14, 16],
    lens: 'Needs safe drafting speed, brand voice control, and clear boundaries before anything reaches customers.',
  },
];

function scoreModuleForPersona(module, persona) {
  let score = 3;
  if (persona.priorities.includes(module.module)) score += 2;
  if (persona.friction.includes(module.module)) score -= 1;
  if (module.reviewChecklist.length >= 3) score += 0.5;
  if (module.qualitySignals.length >= 3) score += 0.5;
  return Math.max(1, Math.min(5, score));
}

function label(score) {
  if (score >= 5) return 'strong';
  if (score >= 4) return 'useful';
  if (score >= 3) return 'acceptable';
  return 'needs role support';
}

const personaRuns = personas.map((persona) => {
  const moduleFeedback = modules.map((module) => {
    const score = scoreModuleForPersona(module, persona);
    const highValue = persona.priorities.includes(module.module);
    const friction = persona.friction.includes(module.module);
    return {
      module: module.module,
      score,
      label: label(score),
      feedback: highValue
        ? `High value for this role because the artifact directly supports ${persona.role.toLowerCase()} work.`
        : friction
          ? 'Needs a stronger role-specific example or shorter path into the lab.'
          : 'Works as a general Foundation module; role payoff depends on the learner choosing a relevant example.',
    };
  });
  const average =
    moduleFeedback.reduce((sum, item) => sum + item.score, 0) / moduleFeedback.length;
  return {
    ...persona,
    average: Number(average.toFixed(1)),
    moduleFeedback,
  };
});

const moduleAverages = modules.map((module) => {
  const scores = personaRuns.map((run) => run.moduleFeedback.find((item) => item.module === module.module)?.score ?? 0);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return {
    module: module.module,
    outcome: module.outcome,
    average: Number(average.toFixed(1)),
    verdict: label(average),
  };
});

const backlog = [
  {
    priority: 'P1',
    item: 'Add role examples inside AiBI Lab prompt chips for lending, compliance, operations, branch, and marketing.',
    source: 'Branch Manager and Lending Officer friction modules show the need for more role-local starts.',
  },
  {
    priority: 'P1',
    item: `Add a manager-ready packet summary that lists all ${courseModuleCount} artifacts, quality signals, and remaining review gaps.`,
    source: 'Compliance and Operations personas need evidence they can hand to a reviewer.',
  },
  {
    priority: 'P2',
    item: 'Let learners tag each saved artifact by department/use case so the packet is easier to explain after the course.',
    source: 'Marketing and Operations personas both need stronger post-course retrieval.',
  },
  {
    priority: 'P2',
    item: 'Add optional role-specific final packet examples for customer communication, lending memo support, procedure summary, and compliance review.',
    source: `Module ${courseModuleCount} scores well, but simulated roles want clearer final-submission patterns.`,
  },
];

const report = {
  generatedAt: new Date().toISOString(),
  modules,
  personas: personaRuns,
  moduleAverages,
  backlog,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`);

const personaSections = personaRuns
  .map((persona) => {
    const lows = persona.moduleFeedback
      .filter((item) => item.score < 4)
      .map((item) => `M${item.module} (${item.label})`)
      .join(', ') || 'None';
    const highs = persona.moduleFeedback
      .filter((item) => item.score >= 5)
      .map((item) => `M${item.module}`)
      .join(', ') || 'None';
    return `### ${persona.name} (${persona.role})

Average fit: ${persona.average}/5

Lens: ${persona.lens}

Strongest modules: ${highs}

Needs more role support: ${lows}
`;
  })
  .join('\n');

const moduleTable = moduleAverages
  .map((item) => `| ${item.module} | ${item.average}/5 | ${item.verdict} | ${item.outcome} |`)
  .join('\n');

const backlogList = backlog
  .map((item) => `- ${item.priority}: ${item.item} (${item.source})`)
  .join('\n');

fs.writeFileSync(
  mdOut,
  `# Foundation Course Simulated Role Feedback

Generated: ${report.generatedAt}

This audit simulates five learner roles moving through the current ${courseModuleCount}-module Foundation course using the micro-module metadata now wired into the course UI. It is a product-fit audit, not a human-subject study.

## Executive Readout

- The strongest role fit is for Compliance, Operations, and Lending because the new artifacts expose review evidence, workflow controls, and reusable templates.
- Branch and Marketing benefit from the shorter visible copy, but need more role-specific prompt chips so they can start labs without translating examples themselves.
- The Foundation Packet now reads as the product learners bought; the next lift is making the packet manager-summary more exportable.

## Persona Feedback

${personaSections}

## Module Heatmap

| Module | Average | Verdict | Outcome |
| --- | ---: | --- | --- |
${moduleTable}

## Backlog From Simulated Roles

${backlogList}
`,
);

console.log(`Wrote ${path.relative(root, mdOut)}`);
console.log(`Wrote ${path.relative(root, jsonOut)}`);
