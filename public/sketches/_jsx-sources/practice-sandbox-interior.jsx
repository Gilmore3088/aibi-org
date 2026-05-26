"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  FlaskConical,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  PlayCircle,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Workflow,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const scenarios = {
  Operations: [
    {
      id: "procedure",
      title: "Procedure Cleanup",
      goal: "Turn dense internal procedure text into a frontline job aid.",
      sampleData: "A sample internal procedure for handling account maintenance exceptions. The source text is intentionally dense and fictional.",
      prompt: "Rewrite this internal procedure as a frontline job aid. Use plain language, numbered steps, exceptions, risk notes, and a manager review checklist. Do not change the policy meaning.",
      outputType: "Job aid",
      reviewOwner: "Manager",
      risk: "Medium",
    },
    {
      id: "handoff",
      title: "Team Handoff Summary",
      goal: "Convert meeting notes into a clear operational handoff.",
      sampleData: "Fictional notes from an operations team discussion about process ownership and next steps.",
      prompt: "Create a handoff summary with owner, next step, open risk, due date, and review owner. Flag missing details.",
      outputType: "Handoff summary",
      reviewOwner: "Process owner",
      risk: "Low",
    },
  ],
  Compliance: [
    {
      id: "use-case-review",
      title: "AI Use-Case Review",
      goal: "Structure a proposed AI use case for compliance review.",
      sampleData: "A fictional business team wants to use AI to summarize internal policy updates for staff.",
      prompt: "Create an AI use-case review summary. Include business purpose, tool, data used, expected output, risks, reviewer, approval checkpoint, and retention rule.",
      outputType: "Review packet",
      reviewOwner: "Compliance officer",
      risk: "High",
    },
    {
      id: "review-checklist",
      title: "Output Review Checklist",
      goal: "Create a review checklist for AI-generated work.",
      sampleData: "A fictional team wants to use AI-generated content before sharing it internally.",
      prompt: "Create a review checklist for AI-generated output. Include accuracy, data sensitivity, customer impact, approval owner, escalation triggers, and retention guidance.",
      outputType: "Checklist",
      reviewOwner: "Compliance officer",
      risk: "Medium",
    },
  ],
  Marketing: [
    {
      id: "campaign-review",
      title: "Campaign Review Prep",
      goal: "Prepare AI-assisted marketing copy for review.",
      sampleData: "A fictional deposit promotion campaign brief with audience, channel, offer, and required disclosures.",
      prompt: "Draft campaign copy options and a compliance review checklist. Flag claims, missing disclosures, urgency language, and approval questions.",
      outputType: "Campaign review workspace",
      reviewOwner: "Marketing + Compliance",
      risk: "High",
    },
  ],
  Retail: [
    {
      id: "coaching-guide",
      title: "Branch Coaching Guide",
      goal: "Turn a customer service scenario into coaching guidance.",
      sampleData: "A fictional customer service situation involving confusion about digital banking enrollment.",
      prompt: "Create a branch coaching guide. Include the scenario, coaching points, suggested language, escalation note, and manager checklist.",
      outputType: "Coaching guide",
      reviewOwner: "Branch manager",
      risk: "Low",
    },
  ],
};

const roles = Object.keys(scenarios);

const reviewItems = [
  "Output reviewed for accuracy",
  "No customer or confidential data included",
  "Human review owner identified",
  "Escalation rule is clear",
  "Retention rule confirmed",
];

const promptHelpers = [
  "Add role context",
  "Add output sections",
  "Add review requirement",
  "Add data boundary",
];

function riskClass(risk) {
  if (risk === "High") return "bg-red-50 text-red-700";
  if (risk === "Medium") return "bg-amber-50 text-amber-800";
  return "bg-emerald-50 text-emerald-700";
}

function buildMockOutput(scenario) {
  if (!scenario) return "Run the scenario to generate a draft output.";

  if (scenario.outputType === "Job aid") {
    return `# Draft Job Aid\n\n## Purpose\nHelp frontline staff complete the process clearly and consistently.\n\n## Steps\n1. Confirm the request and identify the applicable procedure.\n2. Review the approved process before taking action.\n3. Complete the required steps in order.\n4. Escalate exceptions to the review owner.\n5. Document the completed action.\n\n## Exceptions\n- If the procedure is unclear, stop and escalate.\n- If customer-specific data is involved, use approved systems only.\n\n## Risk Notes\n- This draft does not replace policy.\n- Manager review is required before distribution.\n\n## Reviewer Checklist\n- [ ] Procedure meaning preserved\n- [ ] Steps are accurate\n- [ ] Exceptions are clear\n- [ ] No customer data included`;
  }

  if (scenario.outputType === "Review packet") {
    return `# AI Use-Case Review Packet\n\n## Business Purpose\nSummarize internal policy updates for staff awareness.\n\n## Proposed Tool\nAI writing assistant.\n\n## Data Used\nInternal policy text only. No customer data.\n\n## Expected Output\nPlain-English internal summary.\n\n## Risks\n- Inaccurate summary\n- Missing context\n- Unreviewed staff guidance\n\n## Approval Checkpoint\nCompliance review before distribution.\n\n## Retention Rule\nSave reviewed version and source reference.`;
  }

  return `# Draft Output\n\n## Summary\nThe scenario has been converted into a structured, review-ready work product.\n\n## Output Sections\n- Purpose\n- Key points\n- Risk notes\n- Open questions\n- Review checklist\n\n## Review Note\nThis output is a draft and requires review by ${scenario.reviewOwner}.`;
}

function runSmokeChecks() {
  return [
    { label: "Roles", pass: roles.length >= 4 },
    { label: "Scenarios", pass: Object.values(scenarios).flat().length >= 5 },
    { label: "Review items", pass: reviewItems.length >= 5 },
    { label: "Prompt helpers", pass: promptHelpers.length >= 4 },
    { label: "Mock output", pass: typeof buildMockOutput === "function" },
  ];
}

export default function PracticeSandboxInteriorPage() {
  const [role, setRole] = useState("Operations");
  const [scenarioId, setScenarioId] = useState(scenarios.Operations[0].id);
  const [prompt, setPrompt] = useState(scenarios.Operations[0].prompt);
  const [output, setOutput] = useState("Run the scenario to generate a draft output.");
  const [checked, setChecked] = useState([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const checks = useMemo(() => runSmokeChecks(), []);

  const scenarioList = scenarios[role];
  const scenario = scenarioList.find((item) => item.id === scenarioId) || scenarioList[0];
  const reviewComplete = checked.length === reviewItems.length;

  function changeRole(nextRole) {
    const first = scenarios[nextRole][0];
    setRole(nextRole);
    setScenarioId(first.id);
    setPrompt(first.prompt);
    setOutput("Run the scenario to generate a draft output.");
    setChecked([]);
    setSaved(false);
  }

  function changeScenario(nextId) {
    const next = scenarioList.find((item) => item.id === nextId) || scenarioList[0];
    setScenarioId(next.id);
    setPrompt(next.prompt);
    setOutput("Run the scenario to generate a draft output.");
    setChecked([]);
    setSaved(false);
  }

  function applyPromptHelper(helper) {
    const additions = {
      "Add role context": "\n\nRole context: This is for a banking team member using AI for internal work only.",
      "Add output sections": "\n\nOutput format: Purpose, steps, risk notes, open questions, review checklist.",
      "Add review requirement": "\n\nReview requirement: Label the output as draft and identify the human reviewer before use.",
      "Add data boundary": "\n\nData boundary: Do not include customer identifiers, account numbers, SSNs, or confidential records.",
    };
    setPrompt((current) => `${current}${additions[helper] || ""}`);
    setSaved(false);
  }

  function runScenario() {
    setOutput(buildMockOutput(scenario));
    setCopied(false);
    setSaved(false);
  }

  function toggleReview(item) {
    setChecked((current) => (current.includes(item) ? current.filter((x) => x !== item) : [...current, item]));
    setSaved(false);
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${scenario.id}-sandbox-output.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#071A2F]">
      <header className="sticky top-0 z-50 border-b border-[#071A2F]/10 bg-[#F7F3EA]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A2F] text-[#C8A24A] shadow-sm">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">The AI Banking Institute</p>
              <p className="text-xs text-slate-500">Practice Sandbox</p>
            </div>
          </div>
          <Button className="rounded-xl bg-[#C8A24A] px-5 text-[#071A2F] hover:bg-[#d8b867]">Back to Course</Button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#071A2F] text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#C8A24A]/30" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#C8A24A]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C8A24A]/40 bg-[#C8A24A]/10 px-4 py-2 text-sm text-[#E6D39B]">
              <FlaskConical className="h-4 w-4" />
              Signed-in sandbox
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Practice safely before using AI at work.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Use role-based scenarios, safe sample data, review checklists, and saveable outputs to turn lessons into usable work products.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={runScenario} className="h-12 rounded-xl bg-[#C8A24A] px-6 text-[#071A2F] hover:bg-[#d8b867]">
                Run Scenario <PlayCircle className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10">
                Open Toolbox <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white text-[#071A2F] shadow-2xl">
            <CardContent className="p-0">
              <div className="bg-[#F7F3EA] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A2F]">Active Scenario</p>
                <h3 className="mt-2 text-3xl font-semibold">{scenario.title}</h3>
              </div>
              <div className="grid gap-0 md:grid-cols-4">
                {[
                  { label: "Role", value: role, icon: BadgeCheck },
                  { label: "Output", value: scenario.outputType, icon: FileText },
                  { label: "Review", value: scenario.reviewOwner, icon: UserCheck },
                  { label: "Risk", value: scenario.risk, icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="border-b border-r border-slate-200 p-5 last:border-r-0 md:border-b-0">
                      <Icon className="h-7 w-7 text-[#C8A24A]" />
                      <p className="mt-5 text-sm text-slate-500">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold">{item.value}</p>
                    </div>
                  );
                })}
              </div>
              <div className="p-6">
                <div className="rounded-2xl bg-[#071A2F] p-5 text-white">
                  <p className="text-sm text-white/55">Scenario goal</p>
                  <p className="mt-1 text-lg font-semibold text-[#E6D39B]">{scenario.goal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
        <aside className="space-y-6">
          <Card className="rounded-[2rem] border-[#071A2F]/10 bg-white shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A2F]">Choose Scenario</p>
              <p className="mt-2 text-2xl font-semibold">Role and task</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {roles.map((item) => (
                  <button
                    key={item}
                    onClick={() => changeRole(item)}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${role === item ? "bg-[#071A2F] text-white" : "bg-[#F7F3EA] text-[#071A2F] hover:bg-[#efe7d7]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {scenarioList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => changeScenario(item.id)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${scenarioId === item.id ? "bg-[#C8A24A] text-[#071A2F]" : "bg-[#F7F3EA] text-[#071A2F] hover:bg-[#efe7d7]"}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-[#071A2F]/10 bg-white shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A2F]">Safe Sample Data</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">{scenario.sampleData}</p>
              <div className="mt-5 rounded-2xl border border-[#C8A24A]/30 bg-[#C8A24A]/10 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#9A7A2F]" />
                  <p className="text-sm leading-6 text-slate-700">Use fictional, redacted, or approved sample content only. Do not paste customer or confidential data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[2rem] border-[#071A2F]/10 bg-white shadow-2xl">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-[0.48fr_0.52fr]">
                <div className="border-r border-slate-200 p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A2F]">Prompt Workspace</p>
                      <h2 className="mt-1 text-3xl font-semibold">Edit and run</h2>
                    </div>
                    <MessageSquareText className="h-8 w-8 text-[#C8A24A]" />
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(event) => {
                      setPrompt(event.target.value);
                      setSaved(false);
                    }}
                    className="min-h-72 w-full rounded-2xl border border-[#071A2F]/10 bg-[#F7F3EA] p-4 text-sm leading-6 outline-none focus:border-[#C8A24A]"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {promptHelpers.map((helper) => (
                      <button key={helper} onClick={() => applyPromptHelper(helper)} className="rounded-full bg-[#F7F3EA] px-3 py-2 text-xs font-semibold text-[#071A2F] hover:bg-[#efe7d7]">
                        {helper}
                      </button>
                    ))}
                  </div>
                  <Button onClick={runScenario} className="mt-5 h-11 rounded-xl bg-[#071A2F] text-white hover:bg-[#0b2745]">
                    Run Scenario <PlayCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A2F]">Draft Output</p>
                      <p className="mt-1 text-sm text-slate-500">Review required before saving.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyOutput} variant="outline" className="h-10 rounded-xl border-[#071A2F]/20 bg-white">
                        <Copy className="mr-2 h-4 w-4" /> {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button onClick={downloadOutput} variant="outline" className="h-10 rounded-xl border-[#071A2F]/20 bg-white">
                        <Download className="mr-2 h-4 w-4" /> .md
                      </Button>
                    </div>
                  </div>
                  <pre className="min-h-72 overflow-auto rounded-2xl bg-[#071A2F] p-5 text-sm leading-6 text-[#E6D39B] whitespace-pre-wrap">{output}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-[#071A2F]/10 bg-white shadow-xl">
            <CardContent className="p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A2F]">Review Before Saving</p>
                  <h3 className="mt-2 text-2xl font-semibold">Turn practice into a reusable asset.</h3>
                </div>
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${reviewComplete ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  {checked.length}/{reviewItems.length} complete
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {reviewItems.map((item) => (
                  <label key={item} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F7F3EA] p-4">
                    <input type="checkbox" checked={checked.includes(item)} onChange={() => toggleReview(item)} className="mt-1 h-4 w-4 accent-[#C8A24A]" />
                    <span className="font-medium leading-6">{item}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Button onClick={() => setSaved(true)} disabled={!reviewComplete} className="h-11 rounded-xl bg-[#071A2F] text-white hover:bg-[#0b2745] disabled:opacity-50">
                  <Save className="mr-2 h-4 w-4" /> Save to Toolbox
                </Button>
                <Button variant="outline" className="h-11 rounded-xl border-[#071A2F]/20 bg-white">
                  <Workflow className="mr-2 h-4 w-4" /> Convert to Skill
                </Button>
                <Button variant="outline" className="h-11 rounded-xl border-[#071A2F]/20 bg-white">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
              {saved ? <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Reviewed sandbox output saved to toolbox.</div> : null}
            </CardContent>
          </Card>

          <SmokeTests checks={checks} />
        </div>
      </main>
    </div>
  );
}

function SmokeTests({ checks }) {
  return (
    <Card className="rounded-[2rem] border-[#071A2F]/10 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A2F]">Smoke Checks</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {checks.map((check) => (
            <div key={check.label} className={`rounded-xl p-3 text-sm font-semibold ${check.pass ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {check.pass ? "✓" : "!"} {check.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
