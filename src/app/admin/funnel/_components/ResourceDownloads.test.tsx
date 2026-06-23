import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ResourceDownloads } from './ResourceDownloads';
import type {
  ResourceDownloadMetricRow,
  ResourceDownloadTotalsRow,
} from '@/lib/funnel/queries';

const totals: ResourceDownloadTotalsRow = {
  downloads: 936,
  last_7d: 717,
  last_24h: 599,
  unique_visitors: 95,
  resources_tracked: 22,
};

const rows: ResourceDownloadMetricRow[] = [
  { resource_slug: 'governance-starter-kit', downloads: 81, last_7d: 47, last_24h: 38, unique_visitors: 17, last_download: '2026-06-23' },
  { resource_slug: 'compliance-playbook', downloads: 65, last_7d: 47, last_24h: 39, unique_visitors: 17, last_download: '2026-06-23' },
  { resource_slug: 'in-depth-playbook', downloads: 39, last_7d: 35, last_24h: 27, unique_visitors: 11, last_download: '2026-06-23' },
  { resource_slug: 'template-ai-workflow-sop', downloads: 11, last_7d: 2, last_24h: 0, unique_visitors: 9, last_download: '2026-06-21' },
];

describe('ResourceDownloads', () => {
  it('renders the headline tiles with formatted totals', () => {
    render(<ResourceDownloads totals={totals} rows={rows} />);
    expect(screen.getByText('Total downloads')).toBeTruthy();
    expect(screen.getByText('936')).toBeTruthy();
    expect(screen.getByText('Unique visitors (by IP)')).toBeTruthy();
    expect(screen.getByText('95')).toBeTruthy();
    expect(screen.getByText('Resources tracked')).toBeTruthy();
  });

  it('groups rows under their category headers with human labels', () => {
    render(<ResourceDownloads totals={totals} rows={rows} />);
    expect(screen.getByText('Role playbooks')).toBeTruthy();
    expect(screen.getByText('Starter kits')).toBeTruthy();
    expect(screen.getByText('Compliance Playbook')).toBeTruthy();
    expect(screen.getByText('AI Governance Starter Kit')).toBeTruthy();
  });

  it('places in-depth-playbook under Paid previews, not Role playbooks', () => {
    render(<ResourceDownloads totals={totals} rows={rows} />);
    // The "In-Depth Playbook (preview)" label must exist and the Paid previews
    // category header must render (it would not if the row were misfiled).
    expect(screen.getByText(/In-Depth Playbook/)).toBeTruthy();
    expect(screen.getByText('Paid previews')).toBeTruthy();
  });

  it('renders a row with its download counts', () => {
    const { container } = render(<ResourceDownloads totals={totals} rows={rows} />);
    const compRow = within(container).getByText('Compliance Playbook').closest('tr');
    expect(compRow).toBeTruthy();
    expect(within(compRow as HTMLElement).getByText('65')).toBeTruthy();
  });

  it('shows an empty state when there are no downloads', () => {
    render(<ResourceDownloads totals={null} rows={[]} />);
    expect(screen.getByText(/No resource downloads recorded yet/)).toBeTruthy();
  });
});
