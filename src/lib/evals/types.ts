// Types for the eval explorer data bundle (public/data/evals/*.json).
// Hand-written to match pairwise-evals/src/pairwise_evals/site_schemas/*.schema.json;
// update both together when the export changes.

export type Task = 'complex' | 'memory' | 'cut' | 'trace';
export const TASKS: Task[] = ['complex', 'memory', 'cut', 'trace'];
export type Ordering = 'AB' | 'both';
export type Group = 'thesis' | 'newer';

/** A value with a 95% pair-bootstrap interval (fractions, 0–1). */
export interface CI {
  value: number | null;
  ci_low: number | null;
  ci_high: number | null;
}

/** Point estimate with percentile interval, as written by reliability.py. */
export interface Est {
  est: number;
  lo: number;
  hi: number;
}

export type ByTask<T> = Record<Task, T>;
export type PooledByTask = { pooled: CI } & ByTask<CI>;

export interface RunMetrics {
  agreement_excluded: PooledByTask;
  agreement_strict: PooledByTask;
  first_position_rate: CI | null;
  order_consistency: CI | null;
}

export interface RunSummary {
  run_id: string;
  label: string;
  group: Group;
  family: string | null;
  model: string;
  orderings: Ordering[];
  native_ordering: Ordering;
  metrics: Partial<Record<Ordering, RunMetrics>>;
  controls: Record<string, { correct: number; total: number }>;
}

export interface SplitHalf {
  agreement_excluded: Est;
  agreement_strict: Est;
  split_half_r: Est;
  spearman_brown: Est;
  n_items: number;
}

export interface Summary {
  dataset: string;
  questions: ByTask<string>;
  human_ceiling_loo: CI;
  split_half: { pooled: SplitHalf } & ByTask<SplitHalf>;
  runs: RunSummary[];
}

export type Answer = 'A' | 'B' | 'tie' | 'invalid';

export interface ModelAnswer {
  answer: Answer;
  winner: string | null;
  justification: string | null;
}

export interface Pair {
  pair_id: number;
  image_a: string;
  image_b: string;
  category: string;
  family: string;
  votes: ByTask<[number, number]>;
  /** task -> run_id -> order -> answer */
  models: ByTask<Record<string, Partial<Record<'AB' | 'BA', ModelAnswer>>>>;
}

export interface PairsBundle {
  runs: Record<string, string>;
  pairs: Pair[];
}

export interface Rankings {
  thesis_method: {
    images: string[];
    human: number[];
    models: Record<string, { scores: number[]; tau: number | null }>;
    note: string;
  };
  families: Record<
    string,
    { images: string[]; human: Record<string, number>; models: Record<string, { scores: Record<string, number>; tau: number }> }
  >;
  families_note: string;
  labels: Record<string, string>;
}

export interface Features {
  question: 'complex';
  n_pairs_common: number;
  human_floor: { spearman_abs: Est; top10_overlap: Est; reps: number; note: string };
  models: { run_id: string; label: string; spearman_abs: number; top10_overlap: number }[];
}

export interface Manifest {
  exported_utc: string;
  pairwise_evals_commit: string | null;
  dataset: { name: string; version: string; files: Record<string, string> };
  prompt: { version: string; sha256: string };
  runs: Record<
    string,
    {
      label: string;
      responses_sha256: string;
      prompt_version?: string;
      prompt_sha256?: string | null;
      temperature?: number | null;
      created_utc?: string | null;
    }
  >;
  bundle_files: Record<string, string>;
  images_included: boolean;
}

export interface BundleFiles {
  summary: Summary;
  pairs: PairsBundle;
  rankings: Rankings;
  features: Features;
  manifest: Manifest;
}
