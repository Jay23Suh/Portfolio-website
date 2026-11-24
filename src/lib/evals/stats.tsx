import React from 'react';
import type { CI, Est, R } from './types';

// "Show the statistics": one switch for every chart. Until the reader flips it, each page uses its
// own default (off on the story, on in the notebook); once flipped, the choice applies everywhere
// and is remembered in this browser.

const KEY = 'evals.showStats';
type Ctx = { choice: boolean | null; setChoice: (v: boolean) => void };
const StatsContext = React.createContext<Ctx>({ choice: null, setChoice: () => undefined });

function readChoice(): boolean | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
}

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [choice, set] = React.useState<boolean | null>(readChoice);
  const setChoice = React.useCallback((v: boolean) => {
    set(v);
    try {
      window.localStorage.setItem(KEY, v ? '1' : '0');
    } catch {
      /* private mode: keep it for this visit only */
    }
  }, []);
  return <StatsContext.Provider value={{ choice, setChoice }}>{children}</StatsContext.Provider>;
};

/** Whether to show statistical notation, given this page's default. */
export function useShowStats(pageDefault: boolean): [boolean, (v: boolean) => void] {
  const { choice, setChoice } = React.useContext(StatsContext);
  return [choice ?? pageDefault, setChoice];
}

// ── Formatting ────────────────────────────────────────────────────────────────

export const pct = (x: number | null | undefined, nd = 1) => (x === null || x === undefined ? '—' : `${(100 * x).toFixed(nd)}%`);

/** "92.6%" (plain) or "92.6% [90.1, 95.0]" (statistics on). */
export function fmtCI(c: CI | null | undefined, stats: boolean, nd = 1): string {
  if (!c || c.value === null) return '—';
  if (!stats || c.ci_low === null || c.ci_high === null) return pct(c.value, nd);
  return `${pct(c.value, nd)} [${(100 * c.ci_low).toFixed(nd)}, ${(100 * c.ci_high).toFixed(nd)}]`;
}

export function fmtEst(e: Est, stats: boolean, asPct = true, nd = 1): string {
  const f = (x: number) => (asPct ? (100 * x).toFixed(nd) : x.toFixed(nd + 1));
  const unit = asPct ? '%' : '';
  return stats ? `${f(e.est)}${unit} [${f(e.lo)}, ${f(e.hi)}]` : `${f(e.est)}${unit}`;
}

/** Plain-language sentence for an agreement value. */
export const plainAgreement = (x: number | null | undefined) =>
  x === null || x === undefined ? '—' : `agrees with people ${Math.round(100 * x)}% of the time`;

/** A signed number with a Unicode minus: "−0.60". */
export const num = (x: number | null | undefined, nd = 2) =>
  x === null || x === undefined || Number.isNaN(x) ? '—' : x.toFixed(nd).replace(/^-/, '\u2212');

/** "0.87" (plain) or "0.87 [0.85, 0.87]" (statistics on). Correlations, 2 decimals. */
export function fmtR(c: R | null | undefined, stats: boolean, nd = 2): string {
  if (!c || c.value === null || c.value === undefined) return '—';
  if (!stats || c.ci_low === null || c.ci_high === null) return num(c.value, nd);
  return `${num(c.value, nd)} [${num(c.ci_low, nd)}, ${num(c.ci_high, nd)}]`;
}

/** "0.62 to 0.78" or "0.78" when both ends round the same. */
export function range(xs: number[], f: (x: number) => string, sep = ' to '): string {
  if (!xs.length) return '—';
  const lo = f(Math.min(...xs));
  const hi = f(Math.max(...xs));
  return lo === hi ? lo : `${lo}${sep}${hi}`;
}
