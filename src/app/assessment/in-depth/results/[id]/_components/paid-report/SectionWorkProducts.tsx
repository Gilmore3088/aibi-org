'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DIMENSION_LABELS, type Dimension } from '@content/assessments/v4/types';
import { orderWorkProducts, type WorkProduct } from '@content/assessments/v4/work-products';
import { INK, GOLD } from '@/lib/brand/colors';
import { SLATE, LINE, pageStyle, sectionPad, btnOutline } from './constants';
import { Label, PromptBlock, CopyButton, SaveToToolboxButton } from './primitives';
import { BookmarkIcon } from './icons';

// ── Section: Generated Work Products (+ Toolbox feed) ───────────────────────
// The thesis made tangible — not advice, assets. Each is a ready-to-run prompt
// that produces a usable banking document; copy it, or add it to the Toolbox
// as a skill in one click. "Add all" is the success-metric behaviour.
export function SectionWorkProducts({
  protect,
  use,
  roleLabel,
}: {
  protect: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  use: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  roleLabel: string;
}): JSX.Element {
  const priorityDims = [...protect, ...use].map((d) => d.key);
  const recommended = new Set(protect.map((d) => d.key));
  const products = orderWorkProducts(priorityDims);
  return (
    <section id="workproducts" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Generated work products</Label>
        <h2
          style={{
            fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          What you receive today.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58, maxWidth: 680 }}>
          Not advice — assets. Each is a ready-to-run prompt that produces a usable
          banking document, grounded in your own approved sources. Copy it, or add it
          to your Toolbox as a reusable skill in one click.
        </p>
        <div style={{ marginTop: 16 }}>
          <AddAllToToolbox products={products} roleLabel={roleLabel} />
        </div>
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {products.map((w) => (
            <WorkProductCard
              key={w.id}
              product={w}
              roleLabel={roleLabel}
              recommended={recommended.has(w.dimension)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkProductCard({
  product,
  roleLabel,
  recommended,
}: {
  product: WorkProduct;
  roleLabel: string;
  recommended: boolean;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${recommended ? GOLD : LINE}`,
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <b style={{ fontSize: '1.125rem', letterSpacing: '-0.01em' }}>{product.name}</b>
        {recommended && (
          <span
            style={{
              fontSize: '0.6563rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: INK,
              background: GOLD,
              borderRadius: 999,
              padding: '3px 10px',
            }}
          >
            Closes your {DIMENSION_LABELS[product.dimension]} gap
          </span>
        )}
      </div>
      <p style={{ margin: '6px 0 0', color: SLATE, fontSize: '0.875rem', lineHeight: 1.5 }}>{product.intent}</p>
      <p style={{ margin: '8px 0 0', color: SLATE, fontSize: '0.8125rem' }}>
        <b style={{ color: INK }}>Use before:</b> {product.useBefore}
      </p>
      {open && (
        <div style={{ marginTop: 12 }}>
          <PromptBlock text={product.copyPrompt} stretch />
          <p style={{ margin: '8px 0 0', color: SLATE, fontSize: '0.7813rem' }}>{product.copyRule}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{ ...btnOutline, border: `1px solid ${LINE}`, cursor: 'pointer' }}
        >
          {open ? 'Hide prompt' : 'View prompt'}
        </button>
        <CopyButton text={product.copyPrompt} label="Copy prompt" />
        <SaveToToolboxButton
          artifactName={product.name}
          roleLabel={roleLabel}
          prompt={product.copyPrompt}
          rule={product.copyRule}
        />
      </div>
    </div>
  );
}

function AddAllToToolbox({
  products,
  roleLabel,
}: {
  products: readonly WorkProduct[];
  roleLabel: string;
}): JSX.Element {
  type S = 'idle' | 'saving' | 'done' | 'auth' | 'upgrade' | 'error';
  const [status, setStatus] = useState<S>('idle');
  const [n, setN] = useState(0);
  const goldCta: React.CSSProperties = {
    background: GOLD,
    color: INK,
    border: 'none',
    borderRadius: 12,
    padding: '11px 18px',
    fontWeight: 800,
    fontSize: '0.8125rem',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  };
  if (status === 'upgrade') {
    return (
      <Link href="/courses/foundation/program/purchase" style={goldCta}>
        <BookmarkIcon />
        <span>Upgrade to add all</span>
      </Link>
    );
  }
  const label =
    status === 'saving'
      ? `Adding ${n}/${products.length}…`
      : status === 'done'
        ? `Added ${products.length} to Toolbox ✓`
        : status === 'auth'
          ? 'Sign in to add'
          : status === 'error'
            ? 'Try again'
            : `Add all ${products.length} to Toolbox`;
  return (
    <button
      type="button"
      onClick={async () => {
        setStatus('saving');
        setN(0);
        for (let i = 0; i < products.length; i++) {
          const w = products[i];
          try {
            const res = await fetch('/api/toolbox/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                origin: 'in-depth',
                payload: { artifactName: w.name, roleLabel, prompt: w.copyPrompt, rule: w.copyRule },
              }),
            });
            if (res.status === 401) {
              setStatus('auth');
              setTimeout(() => {
                window.location.href = '/auth/login?next=' + encodeURIComponent(window.location.pathname);
              }, 800);
              return;
            }
            if (res.status === 403) {
              setStatus('upgrade');
              return;
            }
            if (!res.ok) {
              setStatus('error');
              return;
            }
            setN(i + 1);
          } catch {
            setStatus('error');
            return;
          }
        }
        setStatus('done');
      }}
      style={goldCta}
    >
      <BookmarkIcon />
      <span>{label}</span>
    </button>
  );
}
