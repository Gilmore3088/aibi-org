// ToolboxItemCard — single-item summary tile in the Toolbox list.

import Link from 'next/link';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { ToolboxItem } from '@/lib/addie/toolbox/items';

interface ToolboxItemCardProps {
  readonly item: ToolboxItem;
}

const TYPE_LABELS: Record<string, string> = {
  data_discipline_card: 'Data Discipline Card',
  ai_toolkit_map: 'AI Toolkit Map',
  first_conversation: 'First Conversation',
  starter_prompt_pack: 'Starter Prompt Pack',
  skill: 'Skill',
  skill_template: 'Skill Template',
  agent_blueprint: 'Agent Blueprint',
  prd: 'PRD',
  prototype: 'Prototype',
  problem_backlog: 'Problem Backlog',
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ToolboxItemCard({ item }: ToolboxItemCardProps) {
  return (
    <Link href={`/foundation/dashboard/toolbox/${item.id}`} className="block">
      <LedgerCard className="p-4">
        <KickerLabel tone="muted">{TYPE_LABELS[item.type] ?? item.type}</KickerLabel>
        <h3 className="mt-2 font-serif text-lg text-[var(--ledger-ink)]">{item.title}</h3>
        <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
          Updated {fmtDate(item.updated_at)}
        </p>
      </LedgerCard>
    </Link>
  );
}
