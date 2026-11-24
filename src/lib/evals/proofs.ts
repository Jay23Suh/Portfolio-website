// Helpers for the proofs and gambles evals: score scaling, ranks, settings notes and small text
// utilities. Everything the pages say about the data is computed from the bundle with these.

import type { GambleOutcome, PredictorPoint, ProofScores } from './types';

// ── Proofs ────────────────────────────────────────────────────────────────────

/** Divide each score by the source's population SD. Scores already have mean 0; r is unchanged. */
export const standardize = (s: ProofScores): ProofScores => {
  const v = Object.values(s);
  const sd = Math.sqrt(v.reduce((a, x) => a + x * x, 0) / (v.length || 1)) || 1;
  return Object.fromEntries(Object.entries(s).map(([k, x]) => [k, x / sd]));
};

export type Rank = { rank: number; tied: boolean };

/** 1 = highest score. Exactly tied values share the better rank ("6=" and "6="). */
export const ranks = (s: ProofScores): Record<string, Rank> => {
  const entries = Object.entries(s);
  const out: Record<string, Rank> = {};
  for (const [k, x] of entries) {
    const above = entries.filter(([, y]) => y > x).length;
    const same = entries.filter(([, y]) => y === x).length;
    out[k] = { rank: above + 1, tied: same > 1 };
  }
  return out;
};

export const rankText = (r: Rank | undefined) => (r ? `${r.rank}${r.tied ? '=' : ''}` : '—');

export function pearson(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((a, v) => a + v, 0) / n;
  const my = y.reduce((a, v) => a + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/**
 * What's left of each score after a straight-line fit on proof length: how much better (+) or worse (-)
 * a proof scored than its length alone predicts. The length-controlled r correlates these leftovers.
 */
export function leftovers(s: ProofScores, lengths: Record<string, number>): ProofScores {
  const keys = Object.keys(s).filter((k) => k in lengths);
  const x = keys.map((k) => lengths[k]);
  const y = keys.map((k) => s[k]);
  const mx = x.reduce((a, v) => a + v, 0) / x.length;
  const my = y.reduce((a, v) => a + v, 0) / y.length;
  const b = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0) / x.reduce((a, v) => a + (v - mx) ** 2, 0);
  return Object.fromEntries(keys.map((k, i) => [k, y[i] - my - b * (x[i] - mx)]));
}

export const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${s}`;
};

/** How the prose names a proof: "the proof by contradiction", "the Taylor series proof". */
export const proofPhrase = (name: string) =>
  name === 'Contradiction' ? 'the proof by contradiction' : name === 'Contrapositive' ? 'the proof by contrapositive' : `the ${name} proof`;

// ── Settings notes (never keyed to a model name) ──────────────────────────────

/** "reasoning effort low" -> "reasoning effort set to low". */
export const noteText = (note: string) => note.replace(/^reasoning effort (\w+)$/i, 'reasoning effort set to $1');

/** The explanation for a model's settings note, taken from the bundle's caveat that names it. */
export function noteDetail(label: string, note: string, caveats: string[]): string {
  const c = caveats.find((x) => x.includes(label) && x.includes(note)) ?? caveats.find((x) => x.includes(label));
  if (!c) return '';
  const m = c.match(/[:;]\s*(.+)$/);
  if (!m) return '';
  let d = m[1].trim().replace(/\b(\d{4,})\b/g, (n) => Number(n).toLocaleString('en-US'));
  d = d.charAt(0).toUpperCase() + d.slice(1);
  return /[.!?]$/.test(d) ? d : `${d}.`;
}

// ── Gambles ───────────────────────────────────────────────────────────────────

/**
 * Problems where the prediction is on the other side of 50% from people. Problems people split
 * exactly evenly are left out of `n`; predictions of exactly 50% are counted in `even`, not `wrong`.
 */
export function wrongSide(points: PredictorPoint[]) {
  const pts = points.filter((p) => p.human !== 0.5);
  return {
    n: pts.length,
    wrong: pts.filter((p) => (p.model - 0.5) * (p.human - 0.5) < 0).length,
    even: pts.filter((p) => p.model === 0.5).length,
  };
}

/** Problems where the prediction is further from 50% than the real share. */
export const lopsided = (points: PredictorPoint[]) =>
  points.filter((p) => Math.abs(p.model - 0.5) > Math.abs(p.human - 0.5)).length;

export const expectedValue = (g: GambleOutcome[]) => g.reduce((a, o) => a + o.p * o.x, 0);

export const money = (x: number) => {
  const a = Math.abs(x);
  return `${x < 0 ? '−' : ''}$${Number.isInteger(a) ? a : a.toFixed(2)}`;
};

/** Headline and "otherwise" lines for a gamble: "80% chance of $27", "otherwise $1". */
export function describeGamble(g: GambleOutcome[]): { head: string; rest: string | null } {
  const o = [...g].filter((x) => x.p > 0).sort((a, b) => b.p - a.p);
  if (o.length === 1) return { head: `${money(o[0].x)} for sure`, rest: null };
  const head = `${Math.round(100 * o[0].p)}% chance of ${money(o[0].x)}`;
  if (o.length === 2) return { head, rest: `otherwise ${money(o[1].x)}` };
  return { head, rest: o.slice(1).map((x) => `${Math.round(100 * x.p)}% chance of ${money(x.x)}`).join(', ') };
}

// ── Prose helpers ─────────────────────────────────────────────────────────────

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
export const word = (n: number) => WORDS[n] ?? String(n);
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** "three of the four models", "all four models", "no model". */
export function countOf(k: number, n: number, noun = 'model') {
  if (k === 0) return `no ${noun}`;
  if (k === n) return n === 2 ? `both ${noun}s` : `all ${word(n)} ${noun}s`;
  return `${word(k)} of the ${word(n)} ${noun}s`;
}
