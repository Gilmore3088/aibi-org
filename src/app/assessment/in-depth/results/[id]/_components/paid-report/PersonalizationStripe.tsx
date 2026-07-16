import { INK } from '@/lib/brand/colors';
import type { InstitutionContext } from '@/lib/assessment/load-response';
import { GOLD_SOFT } from './constants';

export function PersonalizationStripe({
  ctx,
  roleLabel,
}: {
  ctx: InstitutionContext;
  roleLabel: string;
}): JSX.Element {
  const parts: string[] = [];
  if (ctx.institution_name) parts.push(ctx.institution_name);
  if (ctx.asset_size_usd_millions)
    parts.push(`~$${ctx.asset_size_usd_millions}M assets`);
  else if (ctx.asset_band) parts.push(`${ctx.asset_band} band`);
  if (ctx.state) parts.push(ctx.state);
  if (ctx.regulator) parts.push(`${ctx.regulator}-supervised`);
  if (ctx.dept_fte) parts.push(`${roleLabel} team of ${ctx.dept_fte}`);
  return (
    <div
      style={{
        background: INK,
        color: 'white',
        borderRadius: 30,
        padding: '20px 30px',
        marginBottom: 22,
        boxShadow: '0 12px 36px rgba(7,26,47,.10)',
      }}
    >
      <div
        style={{
          color: GOLD_SOFT,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: '0.625rem',
          fontWeight: 900,
        }}
      >
        Built for
      </div>
      <div
        style={{
          fontSize: '1.375rem',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          marginTop: 4,
        }}
      >
        {[ctx.first_name, ctx.last_name].filter(Boolean).join(' ')}
        {parts.length > 0 ? ' · ' : ''}
        <span style={{ color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>
          {parts.join(' · ')}
        </span>
      </div>
    </div>
  );
}
