import { INK, CREAM, GOLD_DEEP, GOLD } from '@/lib/brand/colors';
import { type ActionPacket } from '@content/assessments/v4/action-packet';
import { LINE, pageStyle, sectionPad } from './constants';
import { Label, PromptBlock, CopyButton, SaveToToolboxButton } from './primitives';

export function Section2Artifact({
  packet,
  protect,
  use,
  build,
  roleLabel,
}: {
  packet: ActionPacket;
  protect: ReadonlyArray<{ score: number; label: string }>;
  use: ReadonlyArray<{ score: number; label: string }>;
  build: ReadonlyArray<{ score: number; label: string }>;
  roleLabel: string;
}): JSX.Element {
  const a = packet.primaryArtifact;
  return (
    <section id="artifact" style={pageStyle}>
      <div
        className="mk-pr-artHead"
        style={{
          background: INK,
          color: 'white',
          padding: 26,
        }}
      >
        <div>
          <Label tone="dark">Primary work product</Label>
          <h2
            style={{
              fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
              lineHeight: 1,
              letterSpacing: '-0.045em',
              margin: '6px 0 8px',
              fontWeight: 800,
            }}
          >
            {a.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.68)', margin: 0 }}>{a.intent}</p>
        </div>
        <div
          style={{
            background: GOLD,
            color: INK,
            borderRadius: 18,
            padding: 16,
          }}
        >
          <Label tone="badge">When to use</Label>
          <h3 style={{ fontSize: '1.125rem', letterSpacing: '-0.02em', margin: '4px 0 0', fontWeight: 800 }}>
            {a.useBefore}
          </h3>
        </div>
      </div>

      <div style={sectionPad}>
        {a.table && (
          <>
            <div
              style={{
                marginBottom: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#EFE7D7',
                color: GOLD_DEEP,
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Sample · replace with your own redacted cases
            </div>
            <ArtifactTable cols={a.table.columns} rows={a.table.rows} />
          </>
        )}

        <div
          style={{
            marginTop: 16,
            background: '#fff8e8',
            border: `1px solid rgba(200,162,74,.35)`,
            borderRadius: 18,
            padding: 15,
            fontWeight: 700,
            color: '#73591f',
          }}
        >
          Copy-ready rule: {a.copyRule}
        </div>

        <div className="mk-pr-grid2" style={{ marginTop: 18, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label>Copy-ready prompt</Label>
            <PromptBlock text={a.copyPrompt} stretch />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <CopyButton text={a.copyPrompt} label="Copy prompt" />
              <SaveToToolboxButton
                artifactName={a.name}
                roleLabel={roleLabel}
                prompt={a.copyPrompt}
                rule={a.copyRule}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label>Protect · Use · Build</Label>
            <div
              style={{
                display: 'grid',
                gap: 10,
                marginTop: 12,
                gridAutoRows: '1fr',
              }}
            >
              {protect.map((d) => (
                <DiagRow key={d.label} kicker="Protect first" label={d.label} score={d.score} />
              ))}
              {use.map((d) => (
                <DiagRow key={d.label} kicker="Use next" label={d.label} score={d.score} />
              ))}
              {build.map((d) => (
                <DiagRow key={d.label} kicker="Build next" label={d.label} score={d.score} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtifactTable({
  cols,
  rows,
}: {
  cols: readonly string[];
  rows: ReadonlyArray<ReadonlyArray<string>>;
}): JSX.Element {
  const gridTemplate = '1.1fr 1.2fr .55fr .7fr .9fr';
  return (
    <div
      className="mk-pr-table"
      style={{
        border: `1px solid ${LINE}`,
        borderRadius: 22,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <div
        className="mk-pr-thead"
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          background: CREAM,
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 950,
          color: '#73591f',
        }}
      >
        {cols.map((c, i) => (
          <div
            key={c}
            style={{
              padding: 14,
              borderRight: i < cols.length - 1 ? `1px solid ${LINE}` : 'none',
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="mk-pr-tr"
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            borderTop: `1px solid ${LINE}`,
            fontSize: '0.875rem',
            lineHeight: 1.45,
          }}
        >
          {row.map((cell, ci) => (
            <div
              key={ci}
              style={{
                padding: 14,
                borderRight: ci < row.length - 1 ? `1px solid ${LINE}` : 'none',
              }}
            >
              {renderCell(cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function renderCell(value: string): JSX.Element {
  // Light styling: tiny pill for short verdicts so the table reads at a glance.
  const v = value.trim();
  const ok = ['no', 'approve', 'yes — verify'];
  const edit = ['edit', 'verify', 'review'];
  if (ok.includes(v.toLowerCase())) {
    return <Pill tone="ok">{v}</Pill>;
  }
  if (edit.includes(v.toLowerCase())) {
    return <Pill tone="edit">{v}</Pill>;
  }
  return <span>{v}</span>;
}

function Pill({ tone, children }: { tone: 'ok' | 'edit'; children: string }): JSX.Element {
  const bg = tone === 'ok' ? '#D1FADF' : '#FEF0C7';
  const fg = tone === 'ok' ? '#05603A' : '#93370D';
  return (
    <span
      style={{
        display: 'inline-flex',
        borderRadius: 999,
        padding: '6px 9px',
        fontSize: '0.75rem',
        fontWeight: 800,
        background: bg,
        color: fg,
      }}
    >
      {children}
    </span>
  );
}

function DiagRow({
  kicker,
  label,
  score,
}: {
  kicker: string;
  label: string;
  score: number;
}): JSX.Element {
  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${LINE}`,
        borderRadius: 16,
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <div>
        <span
          style={{
            display: 'block',
            color: GOLD_DEEP,
            fontWeight: 950,
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
          }}
        >
          {kicker}
        </span>
        <b style={{ display: 'block', marginTop: 2 }}>{label}</b>
      </div>
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: 800,
          color: INK,
          fontSize: '1.25rem',
        }}
      >
        {score}
      </span>
    </div>
  );
}
