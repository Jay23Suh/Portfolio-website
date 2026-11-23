import React from 'react';
import type { BundleFiles, CI, Ordering, RunSummary, Task } from './types';

// ── Loading the bundle ────────────────────────────────────────────────────────

const BASE = '/data/evals';
const cache = new Map<keyof BundleFiles, Promise<unknown>>();

export function loadBundleFile<K extends keyof BundleFiles>(name: K): Promise<BundleFiles[K]> {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`${BASE}/${name}.json`).then((r) => {
        if (!r.ok) throw new Error(`${name}.json: HTTP ${r.status}`);
        return r.json();
      })
    );
  }
  return cache.get(name) as Promise<BundleFiles[K]>;
}

type State<T> = { data: T | null; error: string | null };

/** Fetch one bundle file once per page load; `data` is null while loading. */
export function useBundle<K extends keyof BundleFiles>(name: K): State<BundleFiles[K]> {
  const [state, setState] = React.useState<State<BundleFiles[K]>>({ data: null, error: null });
  React.useEffect(() => {
    let live = true;
    loadBundleFile(name)
      .then((data) => live && setState({ data, error: null }))
      .catch((e: Error) => live && setState({ data: null, error: e.message }));
    return () => {
      live = false;
    };
  }, [name]);
  return state;
}

/** Shape images are only served when the (git-ignored) flag file exists, i.e. in local dev. */
export function useShapesAvailable(): boolean {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    let live = true;
    fetch(`${BASE}/shapes/available.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && setOk(Boolean(j && j.available)))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  return ok;
}

export const shapeUrl = (id: string) => `${BASE}/shapes/${id}`;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const QUESTION_LABEL: Record<Task, string> = {
  complex: 'More complex',
  memory: 'Harder to draw from memory',
  cut: 'Harder to cut with scissors',
  trace: 'Longer to trace',
};

export const GROUP_LABEL = { thesis: 'Thesis models (early 2026)', newer: 'Newer models (October 2026)' };

/** The ordering every run has: AB (the thesis order). */
export const COMMON_ORDERING: Ordering = 'AB';

export function metric(run: RunSummary, ordering: Ordering) {
  return run.metrics[ordering] ?? null;
}

export function pooledAgreement(run: RunSummary, ordering: Ordering = COMMON_ORDERING): CI | null {
  return metric(run, ordering)?.agreement_excluded.pooled ?? null;
}

export function sortByAgreement(runs: RunSummary[], ordering: Ordering = COMMON_ORDERING) {
  return [...runs].sort((a, b) => (pooledAgreement(b, ordering)?.value ?? 0) - (pooledAgreement(a, ordering)?.value ?? 0));
}

/** Short image label: "apple-3_bite.jpeg" -> "apple-3 bite". */
export const shapeLabel = (id: string) => id.replace(/\.jpe?g$/, '').replace(/_/g, ' ');

// ── CSV downloads (built in the browser from the bundle) ─────────────────────

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\n') + '\n'], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
