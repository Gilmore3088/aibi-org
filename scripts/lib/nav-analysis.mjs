// Navigation-quality analysis: clicks-to-value + circular-navigation detection.
//
// Answers the user's two efficiency questions:
//   1. "How many clicks before they get something of value?"  -> clicksToValue
//   2. "Are we sending people around in circles?"              -> detectCircular

// clicksToValue: index (1-based) of the first step whose `matchedMoment` is set,
// or null if the persona never reached a value moment in the walk.
// `steps` is the per-step array produced by the sweep; each step may carry
// { matchedMoment: { id, label } | null }.
export function clicksToValue(steps) {
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].matchedMoment) {
      return { clicks: i, step: i + 1, moment: steps[i].matchedMoment };
    }
  }
  return { clicks: null, step: null, moment: null };
}

// detectCircular: examine the visited-path sequence for loop smells.
// Returns { incidents: [...], oscillations, revisits, looped }.
//   - oscillation: A -> B -> A (immediate ping-pong back)
//   - revisit: any path visited 3+ times in the walk
export function detectCircular(paths) {
  const incidents = [];

  // Immediate A->B->A oscillations.
  let oscillations = 0;
  for (let i = 0; i + 2 < paths.length; i++) {
    if (paths[i] && paths[i] === paths[i + 2] && paths[i] !== paths[i + 1]) {
      oscillations++;
      incidents.push({ type: 'oscillation', at: i + 1, detail: `${paths[i]} ↔ ${paths[i + 1]}` });
    }
  }

  // Heavy revisits (visited 3+ times).
  const counts = new Map();
  for (const p of paths) counts.set(p, (counts.get(p) || 0) + 1);
  const revisits = [];
  for (const [p, c] of counts) {
    if (c >= 3) {
      revisits.push({ path: p, count: c });
      incidents.push({ type: 'revisit', detail: `${p} visited ${c}×` });
    }
  }

  return {
    incidents,
    oscillations,
    revisits,
    looped: incidents.length > 0,
  };
}

// Aggregate clicks-to-value across many persona results for the report.
// `results` items must carry { state, clicksToValue: {clicks} }.
export function summarizeClicksToValue(results) {
  const reached = results.filter((r) => r.clicksToValue && r.clicksToValue.clicks != null);
  const never = results.length - reached.length;
  const byState = {};
  for (const r of results) {
    const s = r.state || 'unknown';
    byState[s] ||= { total: 0, reached: 0, sumClicks: 0, never: 0, max: 0 };
    byState[s].total++;
    if (r.clicksToValue && r.clicksToValue.clicks != null) {
      byState[s].reached++;
      byState[s].sumClicks += r.clicksToValue.clicks;
      byState[s].max = Math.max(byState[s].max, r.clicksToValue.clicks);
    } else {
      byState[s].never++;
    }
  }
  for (const s of Object.keys(byState)) {
    const b = byState[s];
    b.avgClicks = b.reached ? Number((b.sumClicks / b.reached).toFixed(2)) : null;
  }
  const allClicks = reached.map((r) => r.clicksToValue.clicks).sort((a, b) => a - b);
  const median = allClicks.length
    ? allClicks[Math.floor((allClicks.length - 1) / 2)]
    : null;
  return {
    personas: results.length,
    reachedValue: reached.length,
    neverReachedValue: never,
    medianClicks: median,
    avgClicks: reached.length
      ? Number((reached.reduce((a, r) => a + r.clicksToValue.clicks, 0) / reached.length).toFixed(2))
      : null,
    maxClicks: allClicks.length ? allClicks[allClicks.length - 1] : null,
    byState,
  };
}
