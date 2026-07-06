'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { renderMarkdown } from '@/lib/sandbox/markdown-renderer';
import type { SandboxConfig, SandboxMessage, SandboxRoleStart } from '@/lib/sandbox/types';
import { PLAYGROUND_MODELS } from '@/lib/toolbox/playground-models';
import type { ProviderName } from '@/lib/ai-harness/types';
import type { FoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGES = 20;
const DEFAULT_MODEL = PLAYGROUND_MODELS[0];
const PROVIDER_LABELS: Record<ProviderName, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Google',
};
const ROLE_STARTERS = [
  {
    id: 'branch',
    label: 'Branch',
    context: 'branch staff handoff, coaching note, or member-service follow-up',
  },
  {
    id: 'lending',
    label: 'Lending',
    context: 'loan file support, borrower communication, or credit memo preparation',
  },
  {
    id: 'operations',
    label: 'Operations',
    context: 'procedure update, exception review, or back-office workflow',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    context: 'policy review, control evidence, training update, or escalation note',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    context: 'member education draft, campaign brief, or approved message review',
  },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIPracticeSandboxProps {
  readonly moduleId: string;
  // 'aibi-p' kept for legacy clients during transition; canonical post-rename
  // is 'foundation'. Both resolve to the same sandbox-data directory.
  readonly product: 'aibi-p' | 'foundation' | 'aibi-s' | 'aibi-l';
  readonly sandboxConfig: SandboxConfig;
  readonly accentColor?: string;
}

/**
 * Maps a product slug to its sandbox-data directory name.
 * 'aibi-p' (legacy) and 'foundation' (canonical) both resolve to
 * 'foundation-program' per the 2026-05-10 rename (Conflict 1 Option B).
 */
function productToDataDir(product: AIPracticeSandboxProps['product']): string {
  if (product === 'aibi-p' || product === 'foundation') return 'foundation-program';
  return product;
}

function moduleNumberFromId(moduleId: string): number {
  const match = /module-(\d+)/.exec(moduleId);
  return match ? Number(match[1]) : 0;
}

function promptLead(prompt: string): string {
  const compact = prompt.replace(/\s+/g, ' ').trim();
  if (compact.length <= 72) return compact;
  return `${compact.slice(0, 69).trim()}...`;
}

function promptActionLabel(prompt: string): string {
  const firstWord = prompt.trim().split(/\s+/, 1)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? '';
  switch (firstWord) {
    case 'using':
    case 'use':
      return 'Use sample data';
    case 'which':
      return 'Choose and explain';
    case 'turn':
    case 'convert':
      return 'Transform a sample';
    case 'review':
      return 'Review the output';
    case 'create':
    case 'build':
      return 'Create the artifact';
    case 'draft':
    case 'write':
      return 'Draft the asset';
    case 'compare':
      return 'Compare examples';
    case 'identify':
    case 'flag':
      return 'Find the risk';
    default:
      return 'Run guided start';
  }
}

function buildRoleStarts(
  labBrief: FoundationLabBrief | undefined,
  datasetLabel: string,
): readonly SandboxRoleStart[] {
  if (!labBrief) return [];

  return ROLE_STARTERS.map((starter) => ({
    id: starter.id,
    label: starter.label,
    prompt:
      `Use the loaded dataset "${datasetLabel}" to practice this module for ${starter.context}.\n\n` +
      `Module task: ${labBrief.artifactAction}\n\n` +
      'Create a first draft I can inspect. Include one role-specific risk to check, one human review step before reuse, and one sentence I could save into my Foundation Packet.',
  }));
}

// ---------------------------------------------------------------------------
// SampleDataViewer — renders sample data as browsable cards instead of
// a raw text dump. Detects markdown headings (## Scenario N:) and splits
// into collapsible cards. CSV data renders as a scrollable table.
// ---------------------------------------------------------------------------

function SampleDataViewer({
  content,
  type,
  accentColor,
  onSendToChat,
}: {
  content: string;
  type: 'csv' | 'document';
  accentColor: string;
  onSendToChat: (text: string) => void;
}) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  if (type === 'csv') {
    // Render CSV as a scrollable table
    const lines = content.trim().split('\n');
    const headers = lines[0]?.split(',') ?? [];
    const rows = lines.slice(1).map((line) => line.split(','));
    return (
      <div className="max-h-64 overflow-auto rounded-[2px] border border-[color:var(--ink)]/10">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[color:#FFFFFF]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-[color:var(--slate-600)] border-b border-[color:var(--ink)]/10 whitespace-nowrap">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[color:var(--ink)]/5 hover:bg-[color:#FFFFFF]/50">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 font-sans text-xs text-[color:var(--ink)] whitespace-nowrap">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Document type: split on ## headings into cards
  const sections = content.split(/^## /m).filter(Boolean);

  if (sections.length <= 1) {
    // No headings found — show a compact preview with first few lines
    const lines = content.trim().split('\n').filter(Boolean);
    const previewLines = lines.slice(0, 4);
    const remaining = lines.length - previewLines.length;
    return (
      <div className="rounded-[2px] bg-[color:#FFFFFF] p-4 space-y-2">
        {previewLines.map((line, i) => (
          <p key={i} className="font-sans text-xs text-[color:var(--ink)]/80 leading-relaxed truncate">
            {line.replace(/[#*_`]/g, '')}
          </p>
        ))}
        {remaining > 0 && (
          <p className="font-mono text-[9px] text-[color:var(--slate-600)] uppercase tracking-wider mt-2">
            + {remaining} more lines loaded into AI context
          </p>
        )}
      </div>
    );
  }

  // Parse each section into title + body
  const cards = sections.map((section) => {
    const firstNewline = section.indexOf('\n');
    const title = firstNewline > -1 ? section.slice(0, firstNewline).trim() : section.trim();
    const body = firstNewline > -1 ? section.slice(firstNewline).trim() : '';
    return { title, body };
  });

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {cards.map((card, idx) => {
        const isExpanded = expandedCard === idx;
        return (
          <div
            key={idx}
            className="rounded-[2px] border border-[color:var(--ink)]/10 bg-[color:#FFFFFF] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedCard(isExpanded ? null : idx)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[color:var(--cream-2)] transition-colors"
              aria-expanded={isExpanded}
            >
              <span className="font-sans text-sm font-medium text-[color:var(--ink)] leading-snug">
                {card.title}
              </span>
              <svg
                className="w-3 h-3 shrink-0 transition-transform duration-200"
                style={{ color: accentColor, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {isExpanded && card.body && (
              <div className="px-4 pb-3 border-t border-[color:var(--ink)]/5">
                <p className="font-sans text-xs text-[color:var(--ink)]/75 leading-relaxed mt-2 mb-3">
                  {card.body}
                </p>
                <button
                  type="button"
                  onClick={() => onSendToChat(`Analyze Scenario: ${card.title}\n\n${card.body}`)}
                  className="font-sans text-[10px] font-semibold uppercase tracking-[1.2px] rounded-[2px] px-3 py-1.5 transition-colors hover:opacity-80"
                  style={{ color: 'var(--cream)', backgroundColor: accentColor }}
                >
                  Ask AI about this
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIPracticeSandbox({
  moduleId,
  product,
  sandboxConfig,
  accentColor = 'var(--gold)',
}: AIPracticeSandboxProps) {
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [selectedDataIndex, setSelectedDataIndex] = useState(0);
  const [dataExpanded, setDataExpanded] = useState(false);
  const [dataContent, setDataContent] = useState<string | null>(null);
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Optional recovery link rendered next to the error (sign-in / support).
  const [errorAction, setErrorAction] = useState<{ label: string; href: string } | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState({
    provider: DEFAULT_MODEL.provider,
    model: DEFAULT_MODEL.id,
  });
  const [artifactSavedAt, setArtifactSavedAt] = useState<string | null>(null);
  const [reviewedItems, setReviewedItems] = useState<string[]>([]);
  const [prediction, setPrediction] = useState('');
  const [predictionSavedAt, setPredictionSavedAt] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => {
        setCopiedIdx((current) => (current === idx ? null : current));
      }, 1800);
    } catch {
      // Older browsers / iframe sandboxes block clipboard. Fail silent —
      // the user can still select-and-copy by hand.
    }
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remainingMessages = MAX_MESSAGES - messageCount;
  const selectedData = sandboxConfig.sampleData[selectedDataIndex];
  const moduleNumber = moduleNumberFromId(moduleId);
  const labBrief = getFoundationLabBrief(moduleNumber);
  const moduleDir = selectedData.sourceModuleNumber
    ? `module-${selectedData.sourceModuleNumber}`
    : moduleId.replace(/^aibi-[psl]-/, '');
  const selectedDataExt = selectedData.type === 'csv' ? 'csv' : 'md';
  const selectedDataPath = `/sandbox-data/${productToDataDir(product)}/${moduleDir}/${selectedData.id}.${selectedDataExt}`;
  const selectedModelMeta =
    PLAYGROUND_MODELS.find(
      (model) => model.provider === selectedModel.provider && model.id === selectedModel.model,
    ) ?? DEFAULT_MODEL;
  const dataReady = Boolean(dataContent && !dataContent.startsWith('Error loading'));
  const promptPrepared = input.trim().length > 0 || messages.some((message) => message.role === 'user');
  const assistantOutputReady = messages.some(
    (message) => message.role === 'assistant' && message.content.trim().length > 0,
  );
  const reviewChecklist = useMemo(() => labBrief?.reviewChecklist ?? [], [labBrief]);
  const predictionOptions = useMemo(() => {
    const source = reviewChecklist.length > 0 ? reviewChecklist : labBrief?.qualitySignals ?? [];
    return Array.from(new Set(source.map((item) => item.trim()).filter(Boolean))).slice(0, 3);
  }, [labBrief?.qualitySignals, reviewChecklist]);
  const reviewedCount = reviewChecklist.filter((item) => reviewedItems.includes(item)).length;
  const reviewComplete =
    !labBrief ||
    reviewChecklist.length === 0 ||
    (assistantOutputReady && reviewedCount === reviewChecklist.length);
  const savedPrediction = predictionSavedAt ? prediction.trim() : '';
  const predictionReady = savedPrediction.length > 0;
  const predictionStorageKey = `foundation-lab-prediction-${moduleId}`;
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.content.trim().length > 0);
  const roleStarts = useMemo(
    () =>
      sandboxConfig.roleStarts && sandboxConfig.roleStarts.length > 0
        ? sandboxConfig.roleStarts
        : buildRoleStarts(labBrief, selectedData.label),
    [labBrief, sandboxConfig.roleStarts, selectedData.label],
  );
  const reviewStatusLabel = artifactSavedAt
    ? 'Draft saved'
    : reviewComplete && assistantOutputReady
      ? 'Ready to save'
      : assistantOutputReady
        ? `${reviewedCount}/${reviewChecklist.length} checked`
        : 'Run lab first';
  const labRunSteps = [
    {
      label: 'Predict',
      body: savedPrediction || 'Name the first check',
      status: predictionReady ? 'done' : 'current',
    },
    {
      label: 'Data',
      body: selectedData.label,
      status: dataReady ? 'done' : predictionReady ? 'current' : 'pending',
    },
    {
      label: 'Run',
      body: 'Run one guided start',
      // Done only when a run actually produced output — a failed request must
      // never show the step as complete (persona audit: 401 left RUN ✓ while
      // the review panel still said "Run lab first").
      status: assistantOutputReady
        ? 'done'
        : promptPrepared || (predictionReady && dataReady)
          ? 'current'
          : 'pending',
    },
    {
      label: 'Review',
      body: labBrief?.reviewChecklist[0] ?? 'Check the output before reuse',
      status: reviewComplete && assistantOutputReady ? 'done' : assistantOutputReady ? 'current' : 'pending',
    },
    {
      label: 'Save',
      body: 'Send useful output to artifact',
      status: artifactSavedAt ? 'done' : reviewComplete && assistantOutputReady ? 'current' : 'pending',
    },
  ] as const;

  const toggleReviewedItem = useCallback((item: string) => {
    setReviewedItems((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  }, []);

  const savePrediction = useCallback(
    (value?: string) => {
      const trimmed = (value ?? prediction).trim();
      const savedAt = trimmed ? new Date().toISOString() : null;
      const detail = {
        moduleId,
        moduleNumber,
        value: trimmed,
        savedAt,
      };

      try {
        if (trimmed && savedAt) {
          localStorage.setItem(predictionStorageKey, JSON.stringify(detail));
        } else {
          localStorage.removeItem(predictionStorageKey);
        }
        window.dispatchEvent(new CustomEvent('foundation-lab-prediction-updated', { detail }));
      } catch {
        // Local storage can be blocked in some embedded contexts. Keep the
        // learning step usable even if persistence is unavailable.
      }

      setPrediction(trimmed);
      setPredictionSavedAt(savedAt);
    },
    [moduleId, moduleNumber, prediction, predictionStorageKey],
  );

  const choosePrediction = useCallback(
    (value: string) => {
      setPrediction(value);
      savePrediction(value);
    },
    [savePrediction],
  );

  const handleSendToArtifact = useCallback(
    async (content: string) => {
      const reviewEvidence = reviewChecklist.filter((item) => reviewedItems.includes(item));
      const payload = {
        moduleId,
        moduleNumber,
        model: selectedModelMeta.displayName,
        dataset: selectedData.label,
        savedAt: new Date().toISOString(),
        prediction: savedPrediction,
        reviewChecklist: reviewEvidence,
        content,
      };
      try {
        localStorage.setItem(`foundation-lab-draft-${moduleId}`, JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('foundation-lab-draft-updated', { detail: payload }));
        setArtifactSavedAt(payload.savedAt);
        await navigator.clipboard.writeText(content);
      } catch {
        setArtifactSavedAt(payload.savedAt);
      }
    },
    [moduleId, moduleNumber, reviewChecklist, reviewedItems, savedPrediction, selectedData.label, selectedModelMeta.displayName],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(predictionStorageKey);
      if (!raw) {
        setPrediction('');
        setPredictionSavedAt(null);
        return;
      }

      const parsed = JSON.parse(raw) as { value?: unknown; savedAt?: unknown };
      const nextPrediction = typeof parsed.value === 'string' ? parsed.value : '';
      const nextSavedAt = typeof parsed.savedAt === 'string' ? parsed.savedAt : null;
      setPrediction(nextPrediction);
      setPredictionSavedAt(nextPrediction.trim() ? nextSavedAt ?? new Date().toISOString() : null);
    } catch {
      setPrediction('');
      setPredictionSavedAt(null);
    }
  }, [predictionStorageKey]);

  // -------------------------------------------------------------------------
  // Fetch sample data — loaded eagerly so it can be injected into the
  // system prompt. The AI already has the data; learner just asks questions.
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (dataContent !== null) return;

    fetch(selectedDataPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sample data (${res.status})`);
        return res.text();
      })
      .then(setDataContent)
      .catch(() => setDataContent('Error loading sample data.'));
  }, [dataContent, selectedDataPath]);

  // Reset data content when switching datasets
  useEffect(() => {
    setDataContent(null);
    setReviewedItems([]);
    setArtifactSavedAt(null);
  }, [selectedDataIndex]);

  // -------------------------------------------------------------------------
  // Auto-scroll chat
  // -------------------------------------------------------------------------

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // -------------------------------------------------------------------------
  // Auto-resize textarea
  // -------------------------------------------------------------------------

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = 20;
    const maxHeight = lineHeight * 12; // expand up to 12 lines to show full prompt
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // -------------------------------------------------------------------------
  // PII check on input
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (input.trim().length === 0) {
      setPiiWarning(null);
      return;
    }
    const result = scanForPII(input);
    setPiiWarning(result.safe ? null : result.reason ?? 'PII detected. Remove personal data.');
  }, [input]);

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    if (!predictionReady) {
      setError('Save a prediction before running the lab.');
      setErrorAction(null);
      return;
    }

    // PII guard
    const piiResult = scanForPII(trimmed);
    if (!piiResult.safe) {
      setPiiWarning(piiResult.reason ?? 'PII detected. Remove personal data.');
      return;
    }

    // Message limit guard
    if (messageCount >= MAX_MESSAGES) {
      setError('Message limit reached. Download your conversation and reset to continue.');
      setErrorAction(null);
      return;
    }

    setError(null);
    setErrorAction(null);
    setReviewedItems([]);
    setArtifactSavedAt(null);
    const userMessage: SandboxMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    setStreaming(true);

    try {
      const response = await fetch('/api/sandbox/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.model,
          messages: updatedMessages,
          moduleId,
          product,
          systemPrompt: dataContent
            ? `${sandboxConfig.systemPrompt}\n\n---\n\nIMPORTANT RESPONSE GUIDELINES: Keep responses focused and complete. Aim for 300-600 words. Use concise tables (5-8 rows max). Do not produce exhaustive analyses — give the learner actionable insight they can use immediately. If the question spans multiple items, summarize in a comparison table rather than analyzing each one in depth. Always finish your response — never cut off mid-thought.\n\n---\n\nLEARNER PREDICTION BEFORE RUNNING AI: ${savedPrediction}\n\nWhen useful, make it easy for the learner to compare the output against that prediction during review. Do not invent facts to satisfy the prediction.\n\n---\n\nThe following sample data has been pre-loaded for this exercise. The learner can reference it directly without pasting it. Treat it as already provided.\n\n### ${selectedData.label}\n\n${dataContent}`
            : `${sandboxConfig.systemPrompt}\n\n---\n\nLEARNER PREDICTION BEFORE RUNNING AI: ${savedPrediction}\n\nWhen useful, make it easy for the learner to compare the output against that prediction during review. Do not invent facts to satisfy the prediction.`,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
        // Map auth/entitlement statuses to actionable copy + a recovery link
        // instead of the raw backend string (persona audit: bare
        // "Authentication required.").
        if (response.status === 401) {
          setErrorAction({ label: 'Go to sign-in', href: '/auth/login' });
          throw new Error(
            'Sign in to run the lab — your session has expired or you are not signed in on this device.',
          );
        }
        if (response.status === 403) {
          setErrorAction({ label: 'Get purchase help', href: '/support/purchase-help' });
          throw new Error(
            'The lab needs an active course enrollment. If you purchased the course and still see this, purchase help can restore your access.',
          );
        }
        if (response.status === 429) {
          throw new Error(
            errorData?.error ?? 'You have hit the lab message limit for now — take a break and try again shortly.',
          );
        }
        throw new Error(errorData?.error ?? `The lab could not run (error ${response.status}). Try again in a moment.`);
      }

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          return updated;
        });
      }

      setMessageCount((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      // Remove the empty assistant placeholder if present
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setStreaming(false);
    }
  }

  // -------------------------------------------------------------------------
  // Download conversation
  // -------------------------------------------------------------------------

  function downloadConversation() {
    if (messages.length === 0) return;

    const lines = messages.map((msg) => {
      const prefix = msg.role === 'user' ? '## You' : `## AiBI Lab (${selectedModelMeta.displayName})`;
      return `${prefix}\n\n${msg.content}\n`;
    });

    const content = `# AiBI Lab Conversation\n\nModule: ${moduleId}\nProduct: ${product}\nModel: ${selectedModelMeta.displayName}\nDataset: ${selectedData.label}\nDate: ${new Date().toISOString()}\n\n---\n\n${lines.join('\n---\n\n')}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sandbox-${moduleId}-${Date.now()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------------------
  // Reset chat
  // -------------------------------------------------------------------------

  function resetChat() {
    if (messages.length === 0) return;
    const confirmed = window.confirm('Reset the conversation? This cannot be undone.');
    if (!confirmed) return;

    setMessages([]);
    setMessageCount(0);
    setError(null);
    setErrorAction(null);
    setInput('');
    setPiiWarning(null);
    setReviewedItems([]);
    setArtifactSavedAt(null);
  }

  // -------------------------------------------------------------------------
  // Handle suggested prompt click
  // -------------------------------------------------------------------------

  function handlePromptClick(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  // -------------------------------------------------------------------------
  // Handle key down
  // -------------------------------------------------------------------------

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="aibi-lab-shell w-full rounded-[18px] border border-[color:var(--ink)]/10 bg-[color:#FFFFFF] p-5 md:p-8 shadow-[var(--shadow-soft)]">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3
            className="font-sans text-2xl font-bold tracking-[-0.02em]"
            style={{ color: accentColor }}
          >
            AiBI Lab
          </h3>
          <p className="mt-1 max-w-[62ch] font-sans text-sm leading-relaxed text-[color:var(--slate-600)]">
            {labBrief?.learningLoop.deliberatePractice ??
              'Run the module task against non-sensitive sample data, then send the useful output into your artifact draft.'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 rounded-[12px] border border-[color:var(--ink)]/10 bg-[color:var(--cream-2)] px-3 py-2">
          <div
            className="font-mono text-sm tabular-nums"
            style={{ color: remainingMessages < 5 ? '#9b2226' : 'var(--slate-600)' }}
            aria-label={`${messageCount} of ${MAX_MESSAGES} messages used`}
          >
            {messageCount}/{MAX_MESSAGES}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--slate-600)]">
            Messages used
          </span>
        </div>
      </div>

      {/* Lab run sheet */}
      <div className="aibi-lab-run-sheet mb-4 grid gap-2 rounded-[14px] border border-[color:var(--ink)]/10 bg-[color:var(--cream-2)] p-3 md:grid-cols-5">
        {labRunSteps.map((step, index) => (
          <div
            key={step.label}
            className="aibi-lab-run-step rounded-[10px] bg-white px-3 py-2"
            style={{
              border: '1px solid',
              borderColor:
                step.status === 'current'
                  ? 'var(--gold)'
                  : step.status === 'done'
                    ? 'var(--gold-a40)'
                    : 'var(--ink-a10)',
              background:
                step.status === 'current'
                  ? 'var(--cream)'
                  : step.status === 'done'
                    ? 'var(--cream-2)'
                    : '#FFFFFF',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[9px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]">
                {index + 1}. {step.label}
              </p>
              <span
                aria-label={`${step.label} ${step.status}`}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.8px]"
                style={{
                  background: step.status === 'done' ? 'var(--gold)' : step.status === 'current' ? 'var(--ink)' : 'var(--ink-a10)',
                  color: step.status === 'done' ? 'var(--ink)' : step.status === 'current' ? '#FFFFFF' : 'var(--slate-600)',
                }}
              >
                {step.status === 'done' ? '✓' : step.status === 'current' ? 'Now' : 'Next'}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs font-semibold leading-snug text-[color:var(--ink)]">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      {/* Calibration checkpoint */}
      <section
        data-testid="aibi-lab-calibration"
        className="mb-4 rounded-[14px] border border-[color:var(--ink)]/10 bg-[color:#FFFFFF] p-4"
        aria-labelledby="aibi-lab-calibration-heading"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]">
                  Calibration
                </p>
                <h4
                  id="aibi-lab-calibration-heading"
                  className="mt-1 font-sans text-lg font-bold leading-tight text-[color:var(--ink)]"
                >
                  Predict the first check.
                </h4>
              </div>
              <span
                className="rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[1.2px]"
                style={{
                  background: savedPrediction ? 'var(--gold-a20)' : 'var(--cream-2)',
                  color: savedPrediction ? 'var(--gold-deep)' : 'var(--slate-600)',
                }}
                aria-live="polite"
              >
                {savedPrediction ? 'Prediction saved' : 'Not saved yet'}
              </span>
            </div>
            <p className="mt-2 max-w-[64ch] font-sans text-sm leading-relaxed text-[color:var(--slate-600)]">
              Before running AI, name the risk or quality check you expect to verify. After the
              output appears, compare what happened against your prediction.
            </p>
            {predictionOptions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested prediction checks">
                {predictionOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choosePrediction(option)}
                    className="rounded-[999px] border border-[color:var(--ink)]/10 bg-[color:var(--cream)] px-3 py-1.5 font-sans text-xs font-semibold text-[color:var(--ink)] transition-colors hover:border-[color:var(--gold)] hover:bg-[color:var(--cream-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[color:var(--ink)]/10 bg-[color:var(--cream-2)] p-3">
            <label
              htmlFor={`aibi-lab-prediction-${moduleId}`}
              className="font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]"
            >
              My prediction
            </label>
            <textarea
              id={`aibi-lab-prediction-${moduleId}`}
              value={prediction}
              onChange={(event) => {
                setPrediction(event.target.value);
                setPredictionSavedAt(null);
              }}
              rows={3}
              placeholder="Example: The output may add a fact that is not in the source."
              className="mt-2 w-full resize-none rounded-[10px] border border-[color:var(--ink)]/10 bg-white px-3 py-2 font-sans text-sm leading-relaxed text-[color:var(--ink)] placeholder:text-[color:var(--slate-600)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => savePrediction()}
                disabled={!prediction.trim()}
                className="rounded-[10px] bg-[color:var(--ink)] px-3 py-2 font-sans text-[11px] font-bold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[color:var(--gold-deep)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save prediction
              </button>
              {assistantOutputReady && (
                <p className="m-0 font-sans text-xs font-semibold text-[color:var(--slate-600)]">
                  Compare now: did the output pass?
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Provider/model selector */}
      <details className="aibi-lab-model-details mb-4 rounded-[14px] border border-[color:var(--ink)]/10 bg-[color:var(--cream-2)]">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]">
            Model settings
          </span>
          <span className="font-sans text-sm font-semibold text-[color:var(--ink)]">
            {selectedModelMeta.displayName}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--slate-600)]">
            Optional
          </span>
        </summary>
        <div className="grid gap-3 border-t border-[color:var(--ink)]/10 p-4 md:grid-cols-[minmax(260px,360px)_minmax(0,1fr)] md:items-center">
          <label className="grid gap-1 font-sans text-sm font-semibold text-[color:var(--ink)]">
            Third-party model
            <select
              value={`${selectedModel.provider}::${selectedModel.model}`}
              onChange={(e) => {
                const [provider, model] = e.target.value.split('::') as [ProviderName, string];
                setSelectedModel({ provider, model });
              }}
              disabled={streaming}
              className="rounded-[10px] border border-[color:var(--ink)]/10 bg-white px-3 py-2 font-sans text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] disabled:opacity-60"
            >
              {(['anthropic', 'openai', 'gemini'] as const).map((provider) => (
                <optgroup key={provider} label={PROVIDER_LABELS[provider]}>
                  {PLAYGROUND_MODELS.filter((model) => model.provider === provider).map((model) => (
                    <option key={model.id} value={`${model.provider}::${model.id}`}>
                      {model.displayName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <p className="m-0 font-sans text-sm leading-relaxed text-[color:var(--slate-600)]">
            {selectedModelMeta.description} AiBI provides the API keys; learners do not paste keys or sensitive bank data.
          </p>
        </div>
      </details>

      {/* Sample data section */}
      <div className="mb-4 rounded-[14px] border border-[color:var(--ink)]/10 bg-[color:var(--cream)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]">
              Sample data
            </p>
            <p className="mt-1 font-sans text-sm font-semibold text-[color:var(--ink)]">
              {selectedData.label}
            </p>
            <p className="mt-0.5 font-sans text-xs text-[color:var(--slate-600)]">
              {selectedData.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sandboxConfig.sampleData.length > 1 && (
              <select
                value={selectedDataIndex}
                onChange={(e) => setSelectedDataIndex(Number(e.target.value))}
                className="rounded-[10px] border border-[color:var(--ink)]/10 bg-[color:#FFFFFF] px-2 py-1.5 font-mono text-[11px] text-[color:var(--ink)] focus:outline-none focus:ring-1"
                style={{ focusRingColor: accentColor } as React.CSSProperties}
                aria-label="Select sample dataset"
              >
                {sandboxConfig.sampleData.map((data, idx) => (
                  <option key={data.id} value={idx}>
                    {data.label}
                  </option>
                ))}
              </select>
            )}
            <a
              href={selectedDataPath}
              download
              className="rounded-[10px] border border-[color:var(--ink)]/10 bg-white px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
            >
              Download
            </a>
            <button
              type="button"
              onClick={() => {
                if (!dataContent) return;
                setInput((prev) =>
                  prev
                    ? `${prev}\n\nUse the loaded dataset "${selectedData.label}" as the source.`
                    : `Use the loaded dataset "${selectedData.label}" as the source.`,
                );
                textareaRef.current?.focus();
              }}
              disabled={!dataContent}
              className="rounded-[10px] border border-[color:var(--gold)] bg-white px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--gold-deep)] transition-colors hover:bg-[color:var(--cream-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] disabled:opacity-40"
            >
              Use in lab
            </button>
            <button
              onClick={() => setDataExpanded((prev) => !prev)}
              className="rounded-[10px] border border-[color:var(--ink)]/10 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors hover:bg-[color:#FFFFFF] focus:outline-none focus:ring-1"
              style={{ color: accentColor }}
              aria-label={dataExpanded ? 'Hide sample data' : 'View sample data'}
              aria-expanded={dataExpanded}
            >
              {dataExpanded ? 'Hide data' : 'View data'}
            </button>
          </div>
        </div>

        {dataExpanded && (
          <div className="mt-3">
            {dataContent ? (
              <SampleDataViewer
                content={dataContent}
                type={selectedData.type}
                accentColor={accentColor}
                onSendToChat={(text) => {
                  setInput((prev) => prev ? `${prev}\n\n${text}` : text);
                  textareaRef.current?.focus();
                }}
              />
            ) : (
              <p className="font-mono text-xs text-[color:var(--slate-600)] p-3">Loading...</p>
            )}
          </div>
        )}
      </div>

      {/* Suggested prompts — hidden when data viewer is expanded (cards have their own "Ask AI" buttons) */}
      {messages.length === 0 && !dataExpanded && (
        <div className="mb-4">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[1.2px] text-[color:var(--slate-600)]">
              Guided lab starts
            </p>
            <p className="font-sans text-xs font-semibold text-[color:var(--slate-600)]">
              {predictionReady ? 'Pick one. Prompt details stay inspectable.' : 'Save a prediction first.'}
            </p>
          </div>
          {roleStarts.length > 0 && (
            <div className="mb-3 rounded-[12px] border border-[color:var(--ink)]/10 bg-[color:var(--cream-2)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]">
                  Role starts
                </p>
                <p className="m-0 font-sans text-xs font-semibold text-[color:var(--slate-600)]">
                  Start from banking work you recognize.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Role-specific lab starts">
                {roleStarts.map((start) => (
                  <button
                    key={start.id}
                    type="button"
                    onClick={() => handlePromptClick(start.prompt)}
                    disabled={!predictionReady}
                    className="min-h-[40px] rounded-[999px] border border-[color:var(--ink)]/10 bg-white px-3 py-1.5 font-sans text-xs font-bold text-[color:var(--ink)] transition-colors hover:border-[color:var(--gold)] hover:bg-[color:var(--cream)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {start.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2 md:grid-cols-3">
            {sandboxConfig.suggestedPrompts.slice(0, 3).map((prompt, idx) => {
              const actionLabel = promptActionLabel(prompt);
              return (
                <article
                  key={idx}
                  className="aibi-lab-prompt-card rounded-[12px] border border-[color:var(--ink)]/10 bg-[color:#FFFFFF] p-3 transition-colors hover:border-[color:var(--gold)]"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]">
                    Start {idx + 1}
                  </p>
                  <h4 className="mt-1 font-sans text-base font-bold leading-tight text-[color:var(--ink)]">
                    {actionLabel}
                  </h4>
                  <p className="mt-1 min-h-[34px] font-sans text-xs font-semibold leading-snug text-[color:var(--slate-600)]">
                    {promptLead(prompt)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      disabled={!predictionReady}
                      className="min-h-[44px] rounded-[10px] bg-[color:var(--ink)] px-3 py-2 font-sans text-[11px] font-bold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[color:var(--gold-deep)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {predictionReady ? 'Use this start' : 'Predict first'}
                    </button>
                    <details className="group">
                      <summary className="flex min-h-[44px] cursor-pointer list-none items-center rounded-[10px] border border-[color:var(--ink)]/10 px-3 py-2 font-sans text-[11px] font-bold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]">
                        Prompt
                      </summary>
                      <p className="mt-2 rounded-[10px] border border-[color:var(--ink)]/10 bg-[color:var(--cream)] p-3 font-sans text-xs font-semibold leading-relaxed text-[color:var(--ink)]">
                        {prompt}
                      </p>
                    </details>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div
        ref={chatContainerRef}
        className="aibi-lab-chat mb-4 min-h-[140px] max-h-[400px] overflow-y-auto rounded-[14px] border border-[color:var(--ink)]/10 bg-[color:var(--cream)] p-4 md:min-h-[200px]"
        role="log"
        aria-label="Conversation history"
        aria-live="polite"
      >
        {messages.length === 0 && !streaming ? (
          <div className="grid min-h-[96px] place-items-center text-center">
            <p className="max-w-[42ch] font-sans text-sm font-semibold leading-relaxed text-[color:var(--slate-600)]">
            Choose a guided start above. The sample data is already loaded into the lab context.
              {!predictionReady ? ' Save a prediction first so you have something to compare after the output appears.' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[2px] px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[color:#FFFFFF]'
                      : 'bg-[color:var(--cream)] border border-[color:var(--ink)]/5'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[1.2px] text-[color:var(--slate-600)]">
                        {selectedModelMeta.displayName}
                      </span>
                      {msg.content && (
                        <span className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!reviewComplete) return;
                              handleSendToArtifact(msg.content);
                            }}
                            disabled={!reviewComplete}
                            className="rounded-[2px] font-mono text-[9px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)] hover:text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-[color:var(--gold-deep)]"
                            aria-label={
                              reviewComplete
                                ? 'Send this response to the module artifact draft'
                                : 'Complete the output review before saving this response'
                            }
                          >
                            {reviewComplete ? 'Send to artifact' : 'Review first'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.content, idx)}
                            className="font-mono text-[9px] uppercase tracking-[1.2px] text-[color:var(--slate-600)] hover:text-[color:var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-1 rounded-[2px]"
                            aria-label={copiedIdx === idx ? 'Copied to clipboard' : 'Copy response to clipboard'}
                          >
                            {copiedIdx === idx ? 'Copied' : 'Copy'}
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-sm font-sans text-[color:var(--ink)]">
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              </div>
            ))}
            {streaming && messages.length > 0 && messages[messages.length - 1].content === '' && (
              <div className="flex justify-start">
                <span className="font-sans text-sm text-[color:var(--slate-600)]">
                  Thinking...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <p className="mb-3 font-sans text-sm text-[color:#9b2226]" role="alert">
          {error}
          {errorAction && (
            <>
              {' '}
              <a
                href={errorAction.href}
                className="font-semibold underline underline-offset-2 text-[color:#9b2226]"
              >
                {errorAction.label}
              </a>
            </>
          )}
        </p>
      )}

      {labBrief && (
        <div className="mb-4 rounded-[14px] border border-[color:var(--ink)]/10 bg-[color:var(--cream-2)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]">
                Output review
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-[color:var(--ink)]">
                {labBrief.learningLoop.feedbackCue}
              </p>
            </div>
            <span
              className="rounded-full bg-[color:var(--gold-a20)] px-3 py-1 font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--gold-deep)]"
              aria-live="polite"
            >
              {reviewStatusLabel}
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3" role="group" aria-label="Output review checklist">
            {labBrief.reviewChecklist.map((item) => (
              <label
                key={item}
                className={`flex min-h-[58px] gap-3 rounded-[12px] border bg-white p-3 font-sans text-sm font-semibold leading-snug text-[color:var(--ink)] transition-colors ${
                  assistantOutputReady
                    ? 'cursor-pointer border-[color:var(--ink)]/10 hover:border-[color:var(--gold)]'
                    : 'cursor-not-allowed border-[color:var(--ink)]/5 opacity-55'
                }`}
              >
                <input
                  type="checkbox"
                  checked={reviewedItems.includes(item)}
                  disabled={!assistantOutputReady}
                  onChange={() => toggleReviewedItem(item)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-[color:var(--gold)] font-mono text-[11px] font-bold text-[color:var(--ink)]"
                  style={{
                    background: reviewedItems.includes(item) ? 'var(--gold)' : '#FFFFFF',
                  }}
                >
                  {reviewedItems.includes(item) ? '✓' : ''}
                </span>
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3 rounded-[12px] border border-[color:var(--ink)]/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 max-w-[52ch] font-sans text-sm leading-snug text-[color:var(--slate-600)]">
              Check the latest output against the review rules before it becomes packet evidence.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!latestAssistantMessage || !reviewComplete) return;
                handleSendToArtifact(latestAssistantMessage.content);
              }}
              disabled={!latestAssistantMessage || !reviewComplete}
              className="rounded-[10px] bg-[color:var(--ink)] px-4 py-2.5 font-sans text-sm font-bold text-white transition-colors hover:bg-[color:var(--gold-deep)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Save latest output
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="mb-4">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            placeholder={streaming ? 'Thinking...' : 'Type your message...'}
            rows={1}
            className="flex-1 resize-none rounded-[2px] border border-[color:var(--ink)]/10 bg-[color:var(--cream)] px-4 py-2.5 font-sans text-sm text-[color:var(--ink)] placeholder:text-[color:var(--slate-600)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60"
            style={
              {
                '--tw-ring-color': accentColor,
              } as React.CSSProperties
            }
            aria-label="Message input"
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim() || piiWarning !== null || !predictionReady}
            className="rounded-[2px] px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-white transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: accentColor,
              ['--tw-ring-color' as string]: accentColor,
            }}
            aria-label={predictionReady ? 'Send message' : 'Save a prediction before sending'}
          >
            {predictionReady ? 'Send' : 'Predict'}
          </button>
        </div>

        {/* PII warning */}
        {piiWarning && (
          <p className="mt-2 font-sans text-xs text-[color:#9b2226]" role="alert">
            {piiWarning}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 border-t border-[color:var(--ink)]/10 pt-4">
        <button
          onClick={downloadConversation}
          disabled={messages.length === 0}
          className="rounded-[2px] border border-[color:var(--ink)]/10 px-3 py-1.5 font-serif-sc text-[11px] uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ ['--tw-ring-color' as string]: accentColor }}
          aria-label="Download conversation as markdown"
        >
          Download Lab Notes
        </button>
        <button
          onClick={resetChat}
          disabled={messages.length === 0}
          className="rounded-[2px] border border-[color:var(--ink)]/10 px-3 py-1.5 font-serif-sc text-[11px] uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ ['--tw-ring-color' as string]: accentColor }}
          aria-label="Reset conversation"
        >
          Reset Lab
        </button>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .aibi-lab-model-details summary::-webkit-details-marker {
              display: none;
            }
            @media (max-width: 640px) {
              .aibi-lab-shell {
                padding: 18px !important;
                border-radius: 16px !important;
              }
              .aibi-lab-run-sheet {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              .aibi-lab-run-step {
                min-height: 72px;
              }
              .aibi-lab-prompt-card span:last-child {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            }
          `,
        }}
      />
    </div>
  );
}
