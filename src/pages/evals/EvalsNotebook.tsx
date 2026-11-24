import React from 'react';
import { Check, Download, X } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  ChartCard,
  DotWhisker,
  EvalsNav,
  GroupLegend,
  Loading,
  NEWER,
  P,
  Section,
  ShapeTile,
  Takeaway,
  WhatAmI,
  groupColor,
  useWidth,
} from '../../components/evals/common';
import { QUESTION_LABEL, downloadCsv, shapeLabel, useBundle } from '../../lib/evals/data';
import { PROMPT_SHA256, PROMPT_SYSTEM, PROMPT_TASKS, PROMPT_USER, PROMPT_VERSION } from '../../lib/evals/prompt';
import { fmtCI, fmtEst, useShowStats } from '../../lib/evals/stats';
import type { Features, Manifest, Pair, PairsBundle, Rankings, Summary, Task } from '../../lib/evals/types';
import { TASKS } from '../../lib/evals/types';

const selectCls = 'rounded-md border border-border bg-white px-2 py-1.5 text-sm font-beezee';

// ── Pair explorer ────────────────────────────────────────────────────────────

function crowdWinner(p: Pair, t: Task): string | null {
  const [a, b] = p.votes[t];
  return a === b ? null : a > b ? p.image_a : p.image_b;
}

function disagreements(p: Pair, t: Task): number {
  const w = crowdWinner(p, t);
  if (!w) return 0;
  return Object.values(p.models[t]).reduce(
    (n, byOrder) => n + Object.values(byOrder).filter((x) => x && x.winner !== w).length,
    0
  );
}

const PairExplorer: React.FC<{ bundle: PairsBundle; summary: Summary }> = ({ bundle, summary }) => {
  const [task, setTask] = React.useState<Task>('complex');
  const [category, setCategory] = React.useState('all');
  const [onlyDisagree, setOnlyDisagree] = React.useState(false);
  const [selected, setSelected] = React.useState<number>(193);
  const categories = React.useMemo(() => Array.from(new Set(bundle.pairs.map((p) => p.category))).sort(), [bundle]);
  const list = bundle.pairs.filter(
    (p) => (category === 'all' || p.category === category) && (!onlyDisagree || disagreements(p, task) > 0)
  );
  const pair = bundle.pairs.find((p) => p.pair_id === selected) ?? list[0];
  const runs = summary.runs;
  return (
    <ChartCard id="pairs" title="Pair explorer" subtitle="Every pair, the human votes, and each model's answer with its own reason.">
      <div className="flex flex-wrap items-center gap-3 mb-4 font-beezee text-sm">
        <label className="flex items-center gap-2">
          Question
          <select className={selectCls} value={task} onChange={(e) => setTask(e.target.value as Task)}>
            {TASKS.map((t) => (
              <option key={t} value={t}>
                {QUESTION_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Category
          <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All ({bundle.pairs.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={onlyDisagree} onChange={(e) => setOnlyDisagree(e.target.checked)} />
          Only pairs where a model went against the crowd
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <ul className="max-h-[220px] md:max-h-[520px] overflow-y-auto rounded-lg border border-border bg-white font-beezee text-sm" aria-label="Pairs">
          {list.map((p) => {
            const [a, b] = p.votes[task];
            const d = disagreements(p, task);
            return (
              <li key={p.pair_id}>
                <button
                  type="button"
                  onClick={() => setSelected(p.pair_id)}
                  className={`w-full px-3 py-2 text-left border-b border-border hover:bg-muted ${pair?.pair_id === p.pair_id ? 'bg-muted font-semibold' : ''}`}
                >
                  <div>
                    #{p.pair_id} {shapeLabel(p.image_a)} vs {shapeLabel(p.image_b)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    votes {a}–{b}
                    {d > 0 && ` · ${d} model answer${d > 1 ? 's' : ''} against the crowd`}
                  </div>
                </button>
              </li>
            );
          })}
          {!list.length && <li className="p-3 text-muted-foreground">No pairs match.</li>}
        </ul>
        {pair && (
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-3">
              {[pair.image_a, pair.image_b].map((img, k) => (
                <ShapeTile key={img} id={img} size="sm" caption={`${k === 0 ? 'Left' : 'Right'}: ${pair.votes[task][k]} votes`} />
              ))}
            </div>
            <div className="mt-2 font-beezee text-sm">
              Pair {pair.pair_id} · {pair.category} · {QUESTION_LABEL[task]}:{' '}
              {crowdWinner(pair, task) ? (
                <>
                  most people picked <strong>{shapeLabel(crowdWinner(pair, task) as string)}</strong>
                </>
              ) : (
                <strong>people split evenly (not scored)</strong>
              )}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm font-beezee border-collapse">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-1.5 pr-2 font-normal">Model</th>
                    <th className="py-1.5 pr-2 font-normal">Order</th>
                    <th className="py-1.5 pr-2 font-normal">Picked</th>
                    <th className="py-1.5 font-normal">Reason it gave</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.flatMap((r) =>
                    (['AB', 'BA'] as const)
                      .map((o) => ({ o, a: pair.models[task][r.run_id]?.[o] }))
                      .filter((x) => x.a)
                      .map(({ o, a }) => {
                        const w = crowdWinner(pair, task);
                        const ok = w && a!.winner === w;
                        return (
                          <tr key={r.run_id + o} className="border-b border-border align-top">
                            <td className="py-1.5 pr-2 whitespace-nowrap">
                              <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ background: groupColor(r.group) }} />
                              {r.label}
                            </td>
                            <td className="py-1.5 pr-2 whitespace-nowrap">{o === 'AB' ? 'left first' : 'right first'}</td>
                            <td className="py-1.5 pr-2 whitespace-nowrap">
                              {w &&
                                (ok ? (
                                  <Check className="inline h-4 w-4 text-emerald-600 mr-1" aria-label="matches the crowd" />
                                ) : (
                                  <X className="inline h-4 w-4 text-red-500 mr-1" aria-label="against the crowd" />
                                ))}
                              {a!.winner === 'tie' ? 'tie' : a!.winner ? shapeLabel(a!.winner) : 'no valid answer'}
                            </td>
                            <td className="py-1.5 text-muted-foreground">{a!.justification ?? '—'}</td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs font-beezee text-muted-foreground">
              Thesis runs kept only each model's pick, not its reason, and showed one order. Reasons are cut at 200
              characters.
            </p>
          </div>
        )}
      </div>
    </ChartCard>
  );
};

// ── Apple rankings ───────────────────────────────────────────────────────────

const rankOf = (scores: number[]) => {
  const idx = scores.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]);
  const r = new Array<number>(scores.length);
  idx.forEach(([, i], k) => (r[i] = k));
  return r;
};

const RankingLadder: React.FC<{ rk: Rankings; summary: Summary }> = ({ rk, summary }) => {
  const tm = rk.thesis_method;
  const runIds = summary.runs.map((r) => r.run_id).filter((id) => tm.models[id]);
  const [rid, setRid] = React.useState(runIds.find((r) => r.startsWith('google_gemini-3.8')) ?? runIds[0]);
  const human = rankOf(tm.human);
  const model = rankOf(tm.models[rid].scores);
  const n = tm.images.length;
  const [ref, W] = useWidth<HTMLDivElement>();
  const narrow = W < 460;
  const rowH = 22;
  const H = 30 + n * rowH;
  const fs = narrow ? 9.5 : 11;
  const xl = narrow ? W * 0.42 : 200;
  const xr = narrow ? W * 0.58 : W - 200;
  const short = (img: string) => shapeLabel(img).replace(/^apple-/, '').replace('stem gone', 'no stem');
  const y = (k: number) => 30 + k * rowH + rowH / 2;
  const fam = (img: string) => (img.startsWith('apple-3') ? 'hsl(var(--chart-2))' : NEWER);
  const run = summary.runs.find((r) => r.run_id === rid)!;
  const tauRows = summary.runs
    .filter((r) => tm.models[r.run_id]?.tau != null)
    .sort((a, b) => (tm.models[b.run_id].tau ?? 0) - (tm.models[a.run_id].tau ?? 0))
    .map((r) => ({ label: r.label, value: tm.models[r.run_id].tau as number, color: groupColor(r.group) }));
  const famIds = Object.keys(rk.families).sort();
  return (
    <ChartCard id="rankings" title="Apple rankings" subtitle="20 apple shapes ranked from most to least complex, people vs one model.">
      <label className="flex items-center gap-2 mb-3 font-beezee text-sm">
        Model
        <select className={selectCls} value={rid} onChange={(e) => setRid(e.target.value)}>
          {runIds.map((id) => (
            <option key={id} value={id}>
              {rk.labels[id]}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground">Kendall's τ = {tm.models[rid].tau?.toFixed(2)}</span>
      </label>
      <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="max-w-full h-auto font-beezee" role="img" aria-label={`Ranking of 20 apples: people vs ${run.label}`}>
        <text x={xl} y={16} textAnchor="end" fontSize={13} fontWeight={600} fill="#001d36">
          People
        </text>
        <text x={xr} y={16} fontSize={13} fontWeight={600} fill="#001d36">
          {run.label}
        </text>
        {tm.images.map((img, i) => (
          <g key={img}>
            <line x1={xl + 6} x2={xr - 6} y1={y(human[i])} y2={y(model[i])} stroke={fam(img)} strokeWidth={1.5} opacity={0.7} />
            <text x={xl} y={y(human[i]) + 4} textAnchor="end" fontSize={fs} fill="#001d36">
              {short(img)}
            </text>
            <text x={xr} y={y(model[i]) + 4} fontSize={fs} fill="#001d36">
              {short(img)}
            </text>
          </g>
        ))}
      </svg>
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-beezee text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ background: 'hsl(var(--chart-2))' }} /> apple-3 family
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ background: NEWER }} /> apple-5 family
        </span>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <div className="min-w-0">
          <div className="text-base font-semibold mb-1">All 20 apples (thesis method)</div>
          <DotWhisker rows={tauRows} domain={[0, 1]} format={(v) => v.toFixed(2)} showCI={false} ariaLabel="Kendall tau, all 20 apples" />
        </div>
        {famIds.map((f) => {
          const rows = summary.runs
            .filter((r) => rk.families[f].models[r.run_id])
            .sort((a, b) => rk.families[f].models[b.run_id].tau - rk.families[f].models[a.run_id].tau)
            .map((r) => ({ label: r.label, value: rk.families[f].models[r.run_id].tau, color: groupColor(r.group) }));
          return (
            <div key={f} className="min-w-0">
              <div className="text-base font-semibold mb-1">{f} family only</div>
              <DotWhisker rows={rows} domain={[0, 1]} format={(v) => v.toFixed(2)} showCI={false} ariaLabel={`Kendall tau, ${f} family`} />
            </div>
          );
        })}
      </div>
      <WhatAmI>
        <p>
          Every pairwise choice can be turned into a ranking with a Bradley–Terry model: a shape that wins many comparisons
          ranks high. The ladder joins each apple's place in the human ranking (left) to its place in the model's ranking
          (right). Crossing lines are disagreements.
        </p>
        <p>
          <strong>Kendall's τ</strong> scores the match: 1 means the same order, 0 means no relationship. The 20 apples are
          two families of 10 that people only compared within a family, so the per-family scores are the fairer test. The
          per-family fit is sensitive to the order of records in the data file; a fix is under review (see Methods).
        </p>
      </WhatAmI>
      <Takeaway>The newer models' rankings track the human ranking more closely than any thesis model's, in both families.</Takeaway>
    </ChartCard>
  );
};

// ── Features vs the human floor ──────────────────────────────────────────────

const FeaturesCard: React.FC<{ f: Features; summary: Summary; stats: boolean }> = ({ f, summary, stats }) => {
  const group = (id: string) => summary.runs.find((r) => r.run_id === id)?.group ?? 'newer';
  const floor = f.human_floor;
  return (
    <ChartCard
      id="features"
      title="Do models weigh the same shape features as people?"
      subtitle={`Rank SVM on 307 geometric features, "more complex", ${f.n_pairs_common} pairs every judge answered.`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="min-w-0">
          <div className="text-base font-semibold mb-1">How similar the feature weights are</div>
          <DotWhisker
            rows={f.models.map((m) => ({ label: m.label, value: m.spearman_abs, color: groupColor(group(m.run_id)) }))}
            domain={[0, 1]}
            format={(v) => v.toFixed(2)}
            reference={{ value: floor.spearman_abs.est, lo: floor.spearman_abs.lo, hi: floor.spearman_abs.hi, label: 'Human vs human' }}
            showCI={stats}
            ariaLabel="Spearman correlation of feature weights, model vs people"
          />
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold mb-1">Top-10 features in common</div>
          <DotWhisker
            rows={f.models.map((m) => ({ label: m.label, value: m.top10_overlap, color: groupColor(group(m.run_id)) }))}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            format={(v) => (Number.isInteger(v) ? String(v) : v.toFixed(1))}
            reference={{ value: floor.top10_overlap.est, lo: floor.top10_overlap.lo, hi: floor.top10_overlap.hi, label: 'Human vs human' }}
            showCI={stats}
            ariaLabel="Top-10 feature overlap, model vs people"
          />
        </div>
      </div>
      <p className="mt-2 text-sm font-beezee text-muted-foreground">
        Human vs human: {fmtEst(floor.spearman_abs, stats, false)} and {fmtEst(floor.top10_overlap, stats, false, 0)} of 10
        shared features, over {floor.reps} random splits of the raters.
      </p>
      <WhatAmI>
        <p>
          A Rank SVM finds which of 307 outline, area and skeleton measurements best predict a judge's choices. Comparing a
          model's weights with people's asks whether they use the same features.
        </p>
        <p>
          The dashed line is the <strong>human floor</strong>: split the raters into two random halves, fit the same model on
          each half, and compare. Two halves of the same people match this weakly, so a model sitting on the line can't be
          said to use different features. {stats ? 'The band is the spread over splits.' : ''}
        </p>
      </WhatAmI>
      <Takeaway>All four newer models fall inside the human-vs-human range, so this method can't show they attend to different features.</Takeaway>
    </ChartCard>
  );
};

// ── Human reliability ────────────────────────────────────────────────────────

const Reliability: React.FC<{ s: Summary; stats: boolean }> = ({ s, stats }) => (
  <ChartCard id="reliability" title="How consistent are the people?" subtitle="Two different measures of human noise.">
    <div className="grid gap-3 sm:grid-cols-3 font-beezee">
      <Card className="bg-white/70">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">One person agrees with the rest</div>
          <div className="text-2xl font-semibold tabular-nums">{fmtCI(s.human_ceiling_loo, stats)}</div>
        </CardContent>
      </Card>
      <Card className="bg-white/70">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Two half-panels pick the same shape</div>
          <div className="text-2xl font-semibold tabular-nums">{fmtEst(s.split_half.pooled.agreement_excluded, stats)}</div>
        </CardContent>
      </Card>
      <Card className="bg-white/70">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Reliability of the full panel (Spearman–Brown)</div>
          <div className="text-2xl font-semibold tabular-nums">{fmtEst(s.split_half.pooled.spearman_brown, stats, false)}</div>
        </CardContent>
      </Card>
    </div>
    <WhatAmI>
      <p>
        <strong>One person vs the rest</strong> (leave-one-out) is the fair bar for a model that answers once, like a single
        participant. <strong>Half vs half</strong> splits each pair's raters into two random halves 1,000 times and checks
        whether the two halves' majorities agree (pairs where a half is tied are left out). The Spearman–Brown value
        estimates how reproducible the full panel's vote shares are. The data records vote counts, not rater ids, so the
        splits are drawn by hypergeometric sampling.
      </p>
    </WhatAmI>
  </ChartCard>
);

// ── Methods and downloads ────────────────────────────────────────────────────

const Methods: React.FC<{ manifest: Manifest; s: Summary }> = ({ manifest, s }) => (
  <ChartCard id="methods" title="Methods" subtitle="What every model was sent, and what to keep in mind.">
    <div className="font-beezee text-base space-y-3">
      <p>
        Prompt <strong>{PROMPT_VERSION}</strong> (the thesis prompt, unchanged), temperature 0.45, one sample per pair and
        order. The October runs show every pair in both orders; the thesis runs used one order. Prompt SHA-256{' '}
        <code className="text-xs break-all">{PROMPT_SHA256}</code>.
      </p>
      <details className="rounded-lg border border-border bg-white p-3">
        <summary className="cursor-pointer font-semibold text-navy">Show the full prompt</summary>
        <div className="mt-2 text-sm">
          <div className="font-semibold">System</div>
          <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">{PROMPT_SYSTEM}</pre>
          <div className="font-semibold mt-2">User (then the two images)</div>
          <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">{PROMPT_USER}</pre>
          <div className="font-semibold mt-2">$task_question for each question</div>
          <ul className="list-disc pl-5 text-xs">
            {TASKS.map((t) => (
              <li key={t}>
                {QUESTION_LABEL[t]}: {PROMPT_TASKS[t]}
              </li>
            ))}
          </ul>
        </div>
      </details>
      <div>
        <div className="font-semibold">Caveats</div>
        <ul className="list-disc pl-6 space-y-1">
          <li>The thesis runs used one image order (left first), so their order-bias numbers mix preference with position.</li>
          <li>The exact prompt of the October 2025 Claude and Gemini thesis runs was not saved.</li>
          <li>The prompt tells models people rarely answer "tie", which pushes tie rates down.</li>
          <li>
            The per-family BTL fit stops before it fully converges, so its τ values depend on the order of records in the
            data file (by up to 0.27 in the worst case). A fix is under review and would change some per-family τ values.
          </li>
          <li>Most pairs compare small variations of one shape, and the images are public, so future models may have seen them.</li>
          <li>Shape images are not shown until Bazazian et al. confirm they can be redistributed.</li>
        </ul>
      </div>
      <div className="text-sm text-muted-foreground">
        Data exported {new Date(manifest.exported_utc).toLocaleDateString('en-US', { dateStyle: 'medium' })} from pairwise-evals
        {manifest.pairwise_evals_commit ? ` (commit ${manifest.pairwise_evals_commit.slice(0, 7)})` : ''}; dataset{' '}
        {manifest.dataset.name} v{manifest.dataset.version}; {Object.keys(manifest.runs).length} runs ({s.runs.length} shown).
      </div>
    </div>
  </ChartCard>
);

const Downloads: React.FC<{ s: Summary; pairs: PairsBundle }> = ({ s, pairs }) => {
  const summaryCsv = () => {
    const rows: (string | number | null)[][] = [['run_id', 'model', 'group', 'ordering', 'metric', 'question', 'value', 'ci_low', 'ci_high']];
    s.runs.forEach((r) =>
      (['AB', 'both'] as const).forEach((o) => {
        const m = r.metrics[o];
        if (!m) return;
        (['agreement_excluded', 'agreement_strict'] as const).forEach((k) =>
          (['pooled', ...TASKS] as const).forEach((t) => {
            const c = m[k][t];
            rows.push([r.run_id, r.label, r.group, o, k, t, c.value, c.ci_low, c.ci_high]);
          })
        );
        (['first_position_rate', 'order_consistency'] as const).forEach((k) => {
          const c = m[k];
          if (c) rows.push([r.run_id, r.label, r.group, o, k, 'pooled', c.value, c.ci_low, c.ci_high]);
        });
      })
    );
    downloadCsv('shape-complexity-results.csv', rows);
  };
  const answersCsv = () => {
    const rows: (string | number | null)[][] = [['pair_id', 'image_a', 'image_b', 'category', 'question', 'votes_a', 'votes_b', 'run_id', 'order', 'answer', 'winner', 'justification']];
    pairs.pairs.forEach((p) =>
      TASKS.forEach((t) =>
        Object.entries(p.models[t]).forEach(([rid, byOrder]) =>
          Object.entries(byOrder).forEach(([o, a]) =>
            rows.push([p.pair_id, p.image_a, p.image_b, p.category, t, p.votes[t][0], p.votes[t][1], rid, o, a!.answer, a!.winner, a!.justification])
          )
        )
      )
    );
    downloadCsv('shape-complexity-answers.csv', rows);
  };
  const btn = 'inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2 font-beezee text-navy hover:bg-muted';
  return (
    <ChartCard id="downloads" title="Downloads" subtitle="Built in your browser from the same data this site reads.">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btn} onClick={summaryCsv}>
          <Download className="h-4 w-4" aria-hidden /> Results by model (CSV)
        </button>
        <button type="button" className={btn} onClick={answersCsv}>
          <Download className="h-4 w-4" aria-hidden /> Every answer (CSV, ~2 MB)
        </button>
        <a className={btn} href="/data/evals/summary.json" download>
          <Download className="h-4 w-4" aria-hidden /> Raw summary.json
        </a>
      </div>
      <p className="mt-3 text-sm font-beezee text-muted-foreground">
        Code: the pairwise-evals harness (Inspect tasks, scorer, registry) is on GitHub as Jay23Suh/pairwise-evals, private
        for now.
      </p>
    </ChartCard>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const EvalsNotebook: React.FC = () => {
  const summary = useBundle('summary');
  const pairs = useBundle('pairs');
  const rankings = useBundle('rankings');
  const features = useBundle('features');
  const manifest = useBundle('manifest');
  const [stats] = useShowStats(true);
  const err = summary.error || pairs.error || rankings.error || features.error || manifest.error;
  if (!summary.data || !pairs.data || !rankings.data || !features.data || !manifest.data) return <Loading error={err} />;
  const s = summary.data;
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault />
      <Section title="Lab notebook" kicker="Layer 3" wide>
        <P className="max-w-3xl">
          Check any number on the other pages: the votes and answers behind every pair, the rankings, the feature analysis,
          and how it was all run.
        </P>
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            ['#pairs', 'Pair explorer'],
            ['#rankings', 'Apple rankings'],
            ['#features', 'Features'],
            ['#reliability', 'Human consistency'],
            ['#methods', 'Methods'],
            ['#downloads', 'Downloads'],
          ].map(([href, label]) => (
            <a key={href} href={href}>
              <Badge variant="outline" className="font-beezee text-sm hover:bg-muted">
                {label}
              </Badge>
            </a>
          ))}
        </div>
        <GroupLegend />
        <div className="mt-3" />
        <PairExplorer bundle={pairs.data} summary={s} />
        <RankingLadder rk={rankings.data} summary={s} />
        <FeaturesCard f={features.data} summary={s} stats={stats} />
        <Reliability s={s} stats={stats} />
        <Methods manifest={manifest.data} s={s} />
        <Downloads s={s} pairs={pairs.data} />
      </Section>
    </div>
  );
};

export default EvalsNotebook;
