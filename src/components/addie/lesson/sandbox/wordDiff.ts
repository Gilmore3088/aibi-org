// wordDiff — tiny word-level diff for the A/B sandbox output panels.
// LCS over whitespace-split tokens. No dependencies. Returns per-side
// token streams flagged with their "shared" / "only here" status so the
// renderer can highlight what each version produced uniquely.

export type DiffTag = 'same' | 'unique';

export interface DiffToken {
  readonly text: string;
  readonly tag: DiffTag;
}

interface DiffResult {
  readonly left: ReadonlyArray<DiffToken>;
  readonly right: ReadonlyArray<DiffToken>;
}

function tokenize(text: string): string[] {
  // Split into [word, gap, word, gap, ...] preserving whitespace so the
  // rendered output reads naturally. We diff only on the non-space tokens.
  if (!text) return [];
  const out: string[] = [];
  const re = /(\s+|[^\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push(m[0]);
  }
  return out;
}

export function diffWords(a: string, b: string): DiffResult {
  const A = tokenize(a);
  const B = tokenize(b);
  // Operate on non-whitespace indices to keep the LCS small.
  const aWords = A.map((t, i) => ({ t, i, ws: /^\s+$/.test(t) }));
  const bWords = B.map((t, i) => ({ t, i, ws: /^\s+$/.test(t) }));
  const aIdx = aWords.filter((x) => !x.ws);
  const bIdx = bWords.filter((x) => !x.ws);

  // LCS DP — short outputs (<5000 tokens) so O(n*m) is fine.
  const n = aIdx.length;
  const m = bIdx.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (aIdx[i].t === bIdx[j].t) dp[i + 1][j + 1] = dp[i][j] + 1;
      else dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const sameA = new Set<number>();
  const sameB = new Set<number>();
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (aIdx[i - 1].t === bIdx[j - 1].t) {
      sameA.add(aIdx[i - 1].i);
      sameB.add(bIdx[j - 1].i);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  const left: DiffToken[] = A.map((t, k) =>
    /^\s+$/.test(t)
      ? { text: t, tag: 'same' }
      : { text: t, tag: sameA.has(k) ? 'same' : 'unique' },
  );
  const right: DiffToken[] = B.map((t, k) =>
    /^\s+$/.test(t)
      ? { text: t, tag: 'same' }
      : { text: t, tag: sameB.has(k) ? 'same' : 'unique' },
  );
  return { left, right };
}
