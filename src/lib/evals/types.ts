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

// ── Proofs eval (proofs.json) ─────────────────────────────────────────────────

/** A correlation with an optional 95% interval (same shape as CI, but always has a value). */
export interface R {
  value: number;
  ci_low: number | null;
  ci_high: number | null;
}

/** Proof name -> Bradley-Terry score (mean 0; each source has its own scale). */
export type ProofScores = Record<string, number>;

export interface ProofModel {
  slug: string;
  label: string;
  family: string;
  model_id: string;
  settings_note: string | null;
  left_rate: number;
  order_consistency: number;
  invalid_rate: number;
  pearson: R;
  spearman: R;
  pearson_controlling_length: number;
  pearson_at_160: number;
  judgements: number;
  scores: ProofScores;
}

export interface ProofBaseline {
  label: string; // 'Shorter wins' | 'Longer wins' | 'Random'
  pearson: R;
  spearman: R;
  pearson_controlling_length: number;
  pearson_at_160: number;
  judgements: number;
  scores: ProofScores;
}

export interface ProofsBundle {
  eval: 'proofs';
  settings: string;
  proofs: string[];
  /** Typeset height of each proof image in pixels, the stand-in for proof length. */
  length_px: Record<string, number>;
  humans: { label: string; judgements: number; scores: ProofScores; split_half_r: number; groups_of_8_r: number };
  models: ProofModel[];
  baselines: ProofBaseline[];
  caveats: string[];
}

// ── Gambles eval (gambles.json) ───────────────────────────────────────────────

export interface GambleMetrics {
  majority_accuracy: R;
  ev_agreement: R;
  mse: R;
  pearson_r: R;
  problems: number;
}

export interface GambleMode extends GambleMetrics {
  settings_note: string | null;
  order_consistency: number;
  first_position_rate: number | null;
}

export interface PredictorPoint {
  row: number;
  human: number;
  model: number;
}

export interface GambleModel {
  slug: string;
  label: string;
  family: string;
  participant?: GambleMode | null;
  predictor?: GambleMode | null;
  predictor_points: PredictorPoint[];
}

export interface GambleOutcome {
  p: number;
  x: number;
}

/** One choices13k problem for the story's guess-then-reveal example. */
export interface GambleExample {
  row: number;
  people: number;
  human_b: number;
  gamble_a: GambleOutcome[];
  gamble_b: GambleOutcome[];
  predictions: { slug: string; model_b: number }[];
}

export interface GamblesBundle {
  eval: 'gambles';
  settings: string;
  condition: string;
  problems: number;
  ceiling: { oracle_accuracy: number; mse_floor: number };
  published: { label: string; accuracy: number }[];
  models: GambleModel[];
  baselines: (GambleMetrics & { label: string })[];
  baselines_all_problems: (GambleMetrics & { label: string })[];
  caveats: string[];
  example?: GambleExample | null;
  /** More sample problems, each picked by a fixed rule in the export (`kind` says which). */
  examples?: (GambleExample & { kind: ExampleKind })[];
}

export type ExampleKind = 'near_unanimous' | 'even_split' | 'sure_thing' | 'against_average' | 'models_wrong';

// ── Thinking, Fast and Slow eval (tfs.json) ──────────────────────────────────

export type TfsVersion = 'canonical' | 'isomorph' | 'new_numbers' | 'deep';
export type TfsStudyKey =
  | 'asian_disease'
  | 'lost_ticket'
  | 'jacket_calculator'
  | 'organ_default'
  | 'anchoring'
  | 'endowment'
  | 'loss_aversion'
  | 'prospect'
  | 'regret_action'
  | 'regret_exception';

/** effect: points between two conditions; index: anchoring index; ratio: 1 = none; gap: points from people. */
export interface TfsStudyInfo {
  label: string;
  chapter: string;
  kind: 'effect' | 'index' | 'ratio' | 'gap';
  null: number | null;
  measure: string;
  people: string;
  source: string;
  /** The question in plain words, and the effect in everyday words. */
  asked: string;
  effect: string;
  /** Version -> what changed from the original wording. */
  changes: Partial<Record<TfsVersion, string>>;
}

export interface TfsStudyRow extends R {
  study: TfsStudyKey;
  variant: TfsVersion;
  human: number | null;
}

export interface TfsShare {
  value: number | null;
  k: number;
  n: number;
  ci_low: number | null;
  ci_high: number | null;
}

export interface TfsModel {
  slug: string;
  label: string;
  model_id: string;
  studies: TfsStudyRow[];
  diffs: (R & { study: TfsStudyKey; diff: string })[];
  probe: Partial<Record<TfsVersion, { value: number; n: number; ci_low: number; ci_high: number }>>;
  probe_sources: { id: string; study: TfsStudyKey; variant: TfsVersion; recognized: boolean | null; source: string }[];
  /** Share of answers whose text names a study or effect: non-disguised items vs disguised items. */
  awareness: { first: TfsShare; deep: TfsShare };
  first_position_rate: number | null;
  invalid_rate: number | null;
}

export interface TfsWording {
  stem: string;
  option_a: string;
  option_b: string;
}

export interface TfsBundle {
  eval: 'tfs';
  exported_utc: string;
  prompt_version: string;
  cost_usd: number;
  questions: number;
  settings: string;
  versions: Record<TfsVersion, string>;
  studies: Record<TfsStudyKey, TfsStudyInfo>;
  models: TfsModel[];
  examples: { study: TfsStudyKey; condition: string; canonical: TfsWording; deep: TfsWording }[];
  /** Study -> version -> the prompt for each condition. */
  wording: Partial<Record<TfsStudyKey, Partial<Record<TfsVersion, (TfsWording & { condition: string })[]>>>>;
  caveats: string[];
}

export interface BundleFiles {
  summary: Summary;
  pairs: PairsBundle;
  rankings: Rankings;
  features: Features;
  manifest: Manifest;
  proofs: ProofsBundle;
  gambles: GamblesBundle;
  tfs: TfsBundle;
}
