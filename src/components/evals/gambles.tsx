import React from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from './button';
import {
  ChapterBreak,
  ChartCard,
  DotWhisker,
  EvalHero,
  Loading,
  MarkLegend,
  MetricsTable,
  NEWER,
  P,
  Section,
  SettingsFootnote,
  Takeaway,
  WhatAmI,
  WithCI,
  useWidth,
} from './common';
import type { DotReference, DotRow, MetricsColumn, MetricsRow } from './common';
import { HUMAN, ModelSelect, RULE } from './proofs';
import { downloadCsv, useBundle } from '../../lib/evals/data';
import { num, pct, range, useShowStats } from '../../lib/evals/stats';
import { cap, countOf, describeGamble, expectedValue, lopsided, money, noteDetail, noteText, word, wrongSide } from '../../lib/evals/proofs';
import type { ExampleKind, GambleExample as Example, GambleMode, GambleModel, GamblesBundle, PredictorPoint, R } from '../../lib/evals/types';
import { cn } from '../../lib/utils';

type Mode = 'participant' | 'predictor';
const MODE_LABEL: Record<Mode, string> = { participant: 'Play', predictor: 'Predict' };
const p0 = (x: number) => pct(x, 0);
const p1 = (x: number) => pct(x, 1);
const pctTick = (v: number) => `${Math.round(100 * v)}%`;
const r2 = (x: number) => num(x, 2);

/** Plain-word names for the rules (the UI never says "EV" or "random"). */
const ruleLabel = (label: string) => (label === 'EV rule' ? 'Higher-average rule' : label === 'Random' ? 'Coin flip' : label);
const evRule = (d: GamblesBundle) => d.baselines.find((b) => b.label === 'EV rule');
const evRuleAll = (d: GamblesBundle) => d.baselines_all_problems.find((b) => b.label === 'EV rule');
const withMode = (d: GamblesBundle, mode: Mode) => d.models.filter((m) => m[mode]);
const val = (m: GambleModel, mode: Mode, k: 'majority_accuracy' | 'ev_agreement' | 'mse' | 'pearson_r') => m[mode]?.[k].value ?? NaN;
const hasNote = (m: GambleModel, mode: Mode) => Boolean(m[mode]?.settings_note);

/** Settings-note footnotes, per model and mode; none -> no footnote. */
export function gambleNotes(d: GamblesBundle, only?: Mode) {
  const out: { label: string; text: string }[] = [];
  for (const m of d.models) {
    for (const mode of ['predictor', 'participant'] as Mode[]) {
      const note = m[mode]?.settings_note;
      if (!note || (only && only !== mode)) continue;
      const other: Mode = mode === 'predictor' ? 'participant' : 'predictor';
      const verb = mode === 'predictor' ? 'predicted' : 'played';
      const detail = noteDetail(m.label, note, d.caveats);
      const otherDefault = !only && m[other] && !m[other]?.settings_note ? ` Its ${MODE_LABEL[other]} run used the default setting.` : '';
      out.push({ label: m.label, text: `${m.label} ${verb} with ${noteText(note)}.${detail ? ` ${detail}` : ''}${otherDefault}` });
    }
  }
  return out;
}

const overlaps = (c: R, v: number) => c.ci_low != null && c.ci_high != null && c.ci_low <= v && v <= c.ci_high;

// ── Guess-then-reveal example ────────────────────────────────────────────────

const GambleTile: React.FC<{ name: string; g: Example['gamble_a']; picked: boolean; onPick: () => void }> = ({ name, g, picked, onPick }) => {
  const { head, rest } = describeGamble(g);
  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onPick}
      className={cn(
        'rounded-xl border-2 bg-white p-3 sm:p-4 text-left transition-colors hover:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        picked ? 'border-navy ring-2 ring-navy/30' : 'border-border'
      )}
    >
      <div className="text-sm font-beezee text-muted-foreground">Gamble {name}</div>
      <div className="font-patrick text-xl sm:text-2xl leading-tight mt-1">{head}</div>
      {rest && <div className="font-beezee text-sm sm:text-base">{rest}</div>}
      <div className="font-beezee text-sm text-muted-foreground mt-1">Average {money(Math.round(100 * expectedValue(g)) / 100)}</div>
    </button>
  );
};

export const GambleExample: React.FC<{ example: Example; labels: Record<string, string> }> = ({ example, labels }) => {
  const [picked, setPicked] = React.useState<'A' | 'B' | null>(null);
  const maj = example.human_b > 0.5 ? 'B' : 'A';
  const majShare = maj === 'B' ? example.human_b : 1 - example.human_b;
  const preds = example.predictions.map((p) => p.model_b);
  return (
    <Card className="bg-white/80 mb-4">
      <CardHeader className="pb-2">
        <CardDescription className="font-beezee text-sm">
          Problem {example.row} · {example.people} people answered
        </CardDescription>
        <CardTitle className="text-xl">Which would most people pick?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <GambleTile name="A" g={example.gamble_a} picked={picked === 'A'} onPick={() => setPicked('A')} />
          <GambleTile name="B" g={example.gamble_b} picked={picked === 'B'} onPick={() => setPicked('B')} />
        </div>
        <div role="status" aria-live="polite" className="mt-3 font-beezee">
          {picked ? (
            <>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="bg-navy" style={{ width: `${100 * majShare}%` }} />
              </div>
              <p className="mt-2 text-base">
                <strong>
                  {p0(majShare)} of people chose {maj}.
                </strong>{' '}
                {example.predictions.length > 0 && (
                  <>
                    Asked to predict, the models said {range(preds, p0, '–')} would choose B.{' '}
                  </>
                )}
                <span className="text-muted-foreground">
                  {picked === maj
                    ? `You picked ${picked}, like most people.`
                    : `You picked ${picked}; most people didn't.`}
                </span>
              </p>
              <ul className="sr-only">
                {example.predictions.map((p) => (
                  <li key={p.slug}>
                    {labels[p.slug] ?? p.slug}: {p0(p.model_b)} choose B
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Pick one to see what people chose.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ── More sample problems ─────────────────────────────────────────────────────

const KIND_TITLE: Record<ExampleKind, string> = {
  near_unanimous: 'Nearly everyone agrees',
  even_split: 'People split down the middle',
  sure_thing: 'A sure thing beats a better gamble',
  against_average: 'Most people pick the lower average',
  models_wrong: 'The models misread the room',
};

const avg = (g: Example['gamble_a']) => money(Math.round(100 * expectedValue(g)) / 100);

const ProblemCard: React.FC<{ e: Example & { kind: ExampleKind }; labels: Record<string, string> }> = ({ e, labels }) => {
  const maj = e.human_b > 0.5 ? 'B' : 'A';
  // Whole percents that add up to 100, so the A and B labels never sum to 101%.
  const pctA = Math.round(100 * (1 - e.human_b));
  const [sA, sB] = [`${pctA}%`, `${100 - pctA}%`];
  const majStr = maj === 'B' ? sB : sA;
  const [ga, gb] = [e.gamble_a, e.gamble_b];
  const evA = expectedValue(ga);
  const evB = expectedValue(gb);
  const higher = evB > evA ? 'B' : 'A';
  const wrong = e.predictions.filter((p) => (p.model_b - 0.5) * (e.human_b - 0.5) < 0);
  const sure = ga.length === 1 ? 'A' : gb.length === 1 ? 'B' : null;
  const note: Record<ExampleKind, string> = {
    near_unanimous: `${majStr} of people picked ${maj}.`,
    even_split: `${sB} picked B and ${sA} picked A.`,
    sure_thing: `${majStr} took the sure ${sure === 'A' ? money(ga[0].x) : sure === 'B' ? money(gb[0].x) : 'option'}, even though the gamble averages ${higher === 'A' ? avg(ga) : avg(gb)}.`,
    against_average: `${majStr} picked ${maj}, the gamble with the lower average (${maj === 'A' ? avg(ga) : avg(gb)} against ${maj === 'A' ? avg(gb) : avg(ga)}).`,
    models_wrong: `${majStr} picked ${maj}, but ${countOf(wrong.length, e.predictions.length)} predicted most people would pick ${maj === 'A' ? 'B' : 'A'}.`,
  };
  return (
    <Card className="bg-white/80">
      <CardContent className="p-4 font-beezee">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-semibold text-lg leading-snug">{KIND_TITLE[e.kind]}</h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Problem {e.row} · {e.people} people
          </span>
        </div>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 mt-2 text-sm">
          {([['A', ga], ['B', gb]] as const).map(([name, g]) => (
            <div key={name} className={cn('rounded-md border p-2', name === maj ? 'border-navy bg-navy/5' : 'border-border')}>
              <div className="text-xs text-muted-foreground">Gamble {name}</div>
              <div className="leading-snug">{cap(gambleText(g))}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Average {avg(g)}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="bg-navy" style={{ width: `${100 * (1 - e.human_b)}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>A {sA}</span>
          <span>B {sB}</span>
        </div>
        <p className="mt-2 text-base leading-snug">{note[e.kind]}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-snug">
          Predicted share picking B:{' '}
          {e.predictions.map((p, i) => (
            <React.Fragment key={p.slug}>
              {i > 0 && ' · '}
              <span className="whitespace-nowrap">
                {labels[p.slug] ?? p.slug} {p0(p.model_b)}
                {(p.model_b - 0.5) * (e.human_b - 0.5) < 0 ? ' ✗' : ''}
              </span>
            </React.Fragment>
          ))}
        </p>
      </CardContent>
    </Card>
  );
};

const GambleProblems: React.FC<{ d: GamblesBundle }> = ({ d }) => {
  const labels = Object.fromEntries(d.models.map((m) => [m.slug, m.label]));
  const ex = d.examples ?? [];
  return (
    <Section title="More problems people faced">
      <P>
        Here are {word(ex.length)} more problems from the {d.problems} I used, each picked by a simple rule to show a different
        pattern. The highlighted gamble is the one most people chose. A ✗ marks a model that predicted the wrong majority.
      </P>
      <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] mb-6">
        {ex.map((e) => (
          <ProblemCard key={e.row} e={e} labels={labels} />
        ))}
      </div>
    </Section>
  );
};

// ── Scatter: predicted vs real share choosing B ──────────────────────────────

export const PredictorScatter: React.FC<{ points: PredictorPoint[]; size?: 'lg' | 'sm'; label: string; highlight?: number }> = ({
  points,
  size = 'lg',
  label,
  highlight,
}) => {
  const hl = points.find((p) => p.row === highlight);
  const lg = size === 'lg';
  const [ref, W] = useWidth<HTMLDivElement>(lg ? 520 : 220, lg ? 240 : 120);
  if (!points.length) {
    return <p className="text-sm font-beezee text-muted-foreground py-6">No per-problem predictions for this model.</p>;
  }
  const m = lg ? { l: 46, r: 18, t: 8, b: 42 } : { l: 32, r: 15, t: 4, b: 18 };
  const S = Math.max(60, W - m.l - m.r);
  const H = m.t + S + m.b;
  const X = (v: number) => m.l + v * S;
  const Y = (v: number) => m.t + (1 - v) * S;
  const ticks = lg ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1];
  return (
    <div ref={ref} className={cn('w-full', lg && 'max-w-[520px]')}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="max-w-full h-auto font-beezee"
        role="img"
        aria-label={`${label}: predicted versus actual share of people choosing B on ${points.length} problems`}
      >
        <rect x={X(0)} y={Y(1)} width={S / 2} height={S / 2} fill="hsl(var(--muted))" />
        <rect x={X(0.5)} y={Y(0.5)} width={S / 2} height={S / 2} fill="hsl(var(--muted))" />
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={X(t)}
              x2={X(t)}
              y1={Y(0)}
              y2={Y(1)}
              stroke="hsl(var(--border))"
              strokeWidth={t === 0.5 ? 1.5 : 1}
            />
            <line x1={X(0)} x2={X(1)} y1={Y(t)} y2={Y(t)} stroke="hsl(var(--border))" strokeWidth={t === 0.5 ? 1.5 : 1} />
            <text x={t === 0 ? X(0) + 1 : X(t)} y={Y(0) + 14} textAnchor={t === 0 ? 'start' : 'middle'} fontSize={11} fill="hsl(var(--muted-foreground))">
              {pctTick(t)}
            </text>
            <text x={X(0) - 4} y={Y(t) + 4} textAnchor="end" fontSize={11} fill="hsl(var(--muted-foreground))">
              {pctTick(t)}
            </text>
          </g>
        ))}
        {lg && (
          <>
            <text x={X(0) + 5} y={Y(1) + 14} fontSize={11} fill="hsl(var(--muted-foreground))">
              Wrong majority
            </text>
            <text x={X(1) - 5} y={Y(0) - 6} textAnchor="end" fontSize={11} fill="hsl(var(--muted-foreground))">
              Wrong majority
            </text>
            <text x={X(0.5)} y={H - 4} textAnchor="middle" fontSize={12} fill={HUMAN}>
              People who actually picked B
            </text>
            <text transform={`translate(12 ${Y(0.5)}) rotate(-90)`} textAnchor="middle" fontSize={12} fill={HUMAN}>
              Predicted to pick B
            </text>
          </>
        )}
        <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke={HUMAN} strokeDasharray="4 4" strokeWidth={1.25} />
        {points.map((p) => (
          <circle
            key={p.row}
            cx={X(p.human)}
            cy={Y(p.model)}
            r={lg ? 4 : 2.6}
            fill={NEWER}
            fillOpacity={0.55}
            stroke={NEWER}
            strokeWidth={lg ? 1 : 0.75}
          >
            <title>
              Problem {p.row}: {p0(p.human)} of people chose B; predicted {p0(p.model)}
            </title>
          </circle>
        ))}
        {hl && (
          <circle cx={X(hl.human)} cy={Y(hl.model)} r={lg ? 9 : 6} fill="none" stroke={HUMAN} strokeWidth={lg ? 2 : 1.5}>
            <title>
              Example, problem {hl.row}: {p0(hl.human)} of people chose B; predicted {p0(hl.model)}
            </title>
          </circle>
        )}
      </svg>
    </div>
  );
};

const ScatterLegend: React.FC = () => (
  <MarkLegend
    items={[
      { mark: 'dot', label: 'One problem' },
      { mark: 'dash', color: HUMAN, label: 'Perfect prediction' },
      { mark: 'swatch', color: 'hsl(var(--muted))', label: 'Wrong majority' },
    ]}
  />
);

/** "an" before numbers read aloud with a vowel sound: 8, 11, 18, 80–89. */
const article = (n: string) => (/^(8|11%|18%)/.test(n) ? 'an' : 'a');

/** "an 80% chance of $27, otherwise $1", most likely outcome first. */
const gambleText = (g: Example['gamble_a']) => {
  const o = [...g].sort((a, b) => b.p - a.p);
  if (o.length === 1) return `a sure ${money(o[0].x)}`;
  if (o.length === 2) return `${article(p0(o[0].p))} ${p0(o[0].p)} chance of ${money(o[0].x)}, otherwise ${money(o[1].x)}`;
  return o.map((x) => `${p0(x.p)} chance of ${money(x.x)}`).join(', ');
};

/** Typical miss in percentage points: the square root of the mean squared error. */
const typicalMiss = (mse: number) => `${Math.round(100 * Math.sqrt(mse))} points`;

/** Plain-language key for the scatter: what A and B are, what one dot means, worked on the example problem. */
const ReadingTheScatter: React.FC<{ d: GamblesBundle; model: GambleModel }> = ({ d, model }) => {
  const ex = d.example;
  const pred = ex?.predictions.find((p) => p.slug === model.slug)?.model_b;
  return (
    <div className="mb-4 rounded-lg bg-muted/40 px-4 py-3 font-beezee text-base leading-relaxed space-y-2">
      <p>
        <strong>What are A and B?</strong> Every problem offers two gambles. The original study labelled them A and B; the
        letters don't mean anything. Since everyone picked one or the other, a single number describes the whole split: the
        share of people who picked B. If 70% picked B, the other 30% picked A.
      </p>
      <p>
        <strong>Each dot is one problem.</strong> Across: the share of people who actually picked B. Up: the share the model
        predicted would pick B. A dot on the dashed line is a perfect prediction. A dot in a shaded corner means the model
        got the majority wrong (it said most people pick A when most picked B, or the reverse).
      </p>
      {ex && pred !== undefined && (
        <p>
          <strong>Example (the ringed dot).</strong> In problem {ex.row}, A is {gambleText(ex.gamble_a)}, and B is{' '}
          {gambleText(ex.gamble_b)}.{' '}
          {p0(ex.human_b)} of people picked B, and {model.label} predicted {p0(pred)}. So its dot sits at {p0(ex.human_b)} across
          and {p0(pred)} up,{' '}
          {Math.abs(pred - ex.human_b) < 0.005
            ? 'right on the line'
            : pred < ex.human_b
              ? 'below the line because it expected even fewer people to pick B'
              : 'above the line because it expected more people to pick B'}
          .{' '}
          {(pred - 0.5) * (ex.human_b - 0.5) > 0
            ? `Both numbers are on the same side of 50%, so it got the majority right: most people picked ${ex.human_b < 0.5 ? 'A' : 'B'}.`
            : 'The two numbers are on opposite sides of 50%, so it got the majority wrong.'}
        </p>
      )}
    </div>
  );
};

const ScatterReadout: React.FC<{ mode: GambleMode; points: PredictorPoint[] }> = ({ mode, points }) => {
  const ws = wrongSide(points);
  const tiles = [
    { n: r2(mode.pearson_r.value), cap: 'correlation with people' },
    {
      n: `${ws.wrong} of ${ws.n}`,
      cap: `problems where it got the majority wrong${ws.even ? ` (${ws.even} more where it said 50/50)` : ''}`,
    },
    { n: p0(mode.majority_accuracy.value), cap: 'sides with the majority' },
    { n: p0(mode.order_consistency), cap: 'same answer with A and B swapped' },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
      {tiles.map((t) => (
        <div key={t.cap}>
          <dt className="sr-only">{t.cap}</dt>
          <dd className="font-patrick text-3xl leading-none">{t.n}</dd>
          <dd className="font-beezee text-sm text-muted-foreground mt-1 leading-snug">{t.cap}</dd>
        </div>
      ))}
    </dl>
  );
};

const csvRows = (d: GamblesBundle) => {
  const models = d.models.filter((m) => m.predictor_points.length);
  const rows = new Map<number, { human: number; preds: Record<string, number> }>();
  for (const m of models)
    for (const p of m.predictor_points) {
      const r = rows.get(p.row) ?? { human: p.human, preds: {} };
      r.preds[m.slug] = p.model;
      rows.set(p.row, r);
    }
  return [
    ['problem', 'share_choosing_b', ...models.map((m) => `predicted_${m.slug}`)],
    ...[...rows.entries()].sort((a, b) => a[0] - b[0]).map(([row, r]) => [row, r.human, ...models.map((m) => r.preds[m.slug])]),
  ];
};

const ShowTheNumbers: React.FC<{ d: GamblesBundle }> = ({ d }) => (
  <details className="mt-1">
    <summary className="cursor-pointer text-navy">Show the numbers</summary>
    <p className="mt-1">
      Every problem's real share and each model's prediction, as a spreadsheet.{' '}
      <button
        type="button"
        onClick={() => downloadCsv('gambles-predictions.csv', csvRows(d))}
        className="inline-flex items-center gap-1 text-navy underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <Download className="h-4 w-4" aria-hidden /> Download CSV
      </button>
    </p>
  </details>
);

// ── G1: Play -> Predict dumbbell ─────────────────────────────────────────────

function refsFor(d: GamblesBundle, opts: { ev: boolean; band: boolean }): DotReference[] {
  const ev = evRule(d);
  const pub = d.published.map((p) => p.accuracy);
  const c = d.ceiling.oracle_accuracy;
  return [
    ...(opts.ev && ev
      ? [
          {
            value: ev.majority_accuracy.value,
            label: `Pick the higher average: ${p0(ev.majority_accuracy.value)}`,
            labelNarrow: `Higher average: ${p0(ev.majority_accuracy.value)}`,
            anchor: 'end' as const,
          },
        ]
      : []),
    ...(opts.band && pub.length
      ? [
          {
            value: (Math.min(...pub) + Math.max(...pub)) / 2,
            lo: Math.min(...pub),
            hi: Math.max(...pub),
            band: true,
            label: `Published models‡ ${range(pub, p0, '–')}`,
            labelNarrow: 'Published‡',
            anchor: 'end' as const,
          },
        ]
      : []),
    {
      value: c,
      label: `Best possible: ${p1(c)}`,
      labelNarrow: `Best: ${p1(c)}`,
      anchor: 'end' as const,
      shadeBeyond: true,
      row: 1 as const,
    },
  ];
}

function playPredictTakeaway(d: GamblesBundle) {
  const both = d.models.filter((m) => m.participant && m.predictor);
  const up = both.filter((m) => p0(val(m, 'predictor', 'majority_accuracy')) > p0(val(m, 'participant', 'majority_accuracy')) && val(m, 'predictor', 'majority_accuracy') > val(m, 'participant', 'majority_accuracy'));
  const level = both.filter((m) => p0(val(m, 'predictor', 'majority_accuracy')) === p0(val(m, 'participant', 'majority_accuracy')));
  const down = both.filter((m) => !up.includes(m) && !level.includes(m));
  const n = both.length;
  const names = (ms: GambleModel[]) => ms.map((m) => m.label).join(' and ');
  let s = `${cap(countOf(up.length, n))} side${up.length === 1 ? 's' : ''} with the majority more often when predicting than when playing`;
  if (level.length)
    s += `; ${names(level)} ${level.length === 1 ? 'is' : 'are'} level${level.length === 1 ? ` (${p0(val(level[0], 'predictor', 'majority_accuracy'))} both ways)` : ''}`;
  if (down.length) s += `; ${names(down)} ${down.length === 1 ? 'does' : 'do'} better playing`;
  s += '.';
  const c = d.ceiling.oracle_accuracy;
  const all = d.models.flatMap((m) => [m.participant?.majority_accuracy.value, m.predictor?.majority_accuracy.value]).filter((x): x is number => x != null);
  if (all.every((x) => x < c)) s += ` All stay below the ${p1(c)} best possible.`;
  return s;
}

const PlayPredict: React.FC<{ d: GamblesBundle; stats: boolean }> = ({ d, stats }) => {
  const models = withMode(d, 'predictor').sort((a, b) => val(b, 'predictor', 'majority_accuracy') - val(a, 'predictor', 'majority_accuracy'));
  const rows: DotRow[] = models.map((m) => ({
    label: m.label,
    from: m.participant?.majority_accuracy.value ?? null,
    fromLo: m.participant?.majority_accuracy.ci_low,
    fromHi: m.participant?.majority_accuracy.ci_high,
    value: val(m, 'predictor', 'majority_accuracy'),
    lo: m.predictor?.majority_accuracy.ci_low,
    hi: m.predictor?.majority_accuracy.ci_high,
    color: NEWER,
    dagger: hasNote(m, 'predictor') || hasNote(m, 'participant'),
    note: 'Play → Predict',
  }));
  const c = d.ceiling.oracle_accuracy;
  const tableId = 'gambles-play-predict-table';
  return (
    <ChartCard
      id="gambles-accuracy"
      title="How often each model sides with most people"
      subtitle={`${d.problems} problems. The hatched area is out of reach: people themselves disagree, so even a perfect prediction matches the majority ${p1(c)} of the time.`}
    >
      <MarkLegend
        className="mb-2"
        items={[
          { mark: 'hollow', label: 'Play' },
          { mark: 'dot', label: 'Predict' },
          { mark: 'hatch', label: 'Out of reach' },
        ]}
      />
      <DotWhisker
        rows={rows}
        domain={[0.6, 0.95]}
        ticks={[0.6, 0.7, 0.8, 0.9]}
        format={pctTick}
        references={refsFor(d, { ev: true, band: false })}
        showCI={stats}
        ariaLabel="Share of problems where each model sides with most people, when playing and when predicting"
        describedBy={tableId}
      />
      <table id={tableId} className="sr-only">
        <caption>Sides with the majority</caption>
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Play</th>
            <th scope="col">Predict</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.slug}>
              <th scope="row">{m.label}</th>
              <td>{m.participant ? p0(m.participant.majority_accuracy.value) : '—'}</td>
              <td>{p0(val(m, 'predictor', 'majority_accuracy'))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SettingsFootnote notes={gambleNotes(d)} />
      <WhatAmI>
        <p>
          A model sides with the majority when the side it favours (above or below 50% for B) is the side most people chose.
          Problems that people split exactly evenly are left out. The hollow dot is the model choosing for itself (Play); the
          filled dot is the model predicting what people chose (Predict).
        </p>
        <p>
          The best possible score knows each problem's true choice rate. It still misses some problems, because each one had a
          limited number of people. {stats ? 'Whiskers are 95% intervals from resampling problems; they overlap heavily on 101 problems.' : 'Turn on "Show the statistics" for 95% intervals.'}
        </p>
      </WhatAmI>
      <Takeaway>{playPredictTakeaway(d)}</Takeaway>
    </ChartCard>
  );
};

// ── G2: one big scatter with a model selector ────────────────────────────────

const ScatterExplorer: React.FC<{ d: GamblesBundle }> = ({ d }) => {
  const models = d.models.filter((m) => m.predictor && m.predictor_points.length).sort((a, b) => val(a, 'predictor', 'mse') - val(b, 'predictor', 'mse'));
  const [sel, setSel] = React.useState(models[0]?.slug ?? '');
  const m = models.find((x) => x.slug === sel) ?? models[0];
  if (!m || !m.predictor) return null;
  const k = lopsided(m.predictor_points);
  return (
    <ChartCard
      id="gambles-predictions"
      title="How well each model predicts the split between two gambles"
      subtitle="For each problem, the model guessed what share of people would pick gamble B. Here's how those guesses compare with what people actually did."
    >
      <ReadingTheScatter d={d} model={m} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <ScatterLegend />
        <ModelSelect
          options={models.map((x) => ({ key: x.slug, label: `${x.label}${hasNote(x, 'predictor') ? '†' : ''}` }))}
          value={m.slug}
          onChange={setSel}
          ariaLabel="Model to show"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-[minmax(0,520px)_1fr] items-center">
        <PredictorScatter points={m.predictor_points} label={m.label} highlight={d.example?.row} />
        <ScatterReadout mode={m.predictor} points={m.predictor_points} />
      </div>
      <SettingsFootnote notes={hasNote(m, 'predictor') ? gambleNotes(d, 'predictor').filter((n) => n.label === m.label) : []} />
      <WhatAmI>
        <p>
          The shaded corners are the same "wrong majority" mistakes the chart above counts. <strong>Correlation</strong> (r)
          says how well the dots follow the line overall: 1 is a perfect line, 0 is no relation.
        </p>
        <p>The model shown first is the one whose guesses are closest to the real shares on average.</p>
        <ShowTheNumbers d={d} />
      </WhatAmI>
      <Takeaway>
        The guesses follow people (r {r2(m.predictor.pearson_r.value)}), but {m.label} expects people to agree more than they
        do: on {k} of {m.predictor_points.length} problems it predicts a bigger majority than people actually showed.
      </Takeaway>
    </ChartCard>
  );
};

// ── Story chapter ────────────────────────────────────────────────────────────

const Lead: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold">{children}</strong>;

const halfWidth = (d: GamblesBundle) => {
  const hw = d.models
    .flatMap((m) => [m.participant?.majority_accuracy, m.predictor?.majority_accuracy])
    .filter((c): c is R => Boolean(c && c.ci_low != null && c.ci_high != null))
    .map((c) => ((c.ci_high as number) - (c.ci_low as number)) / 2);
  return hw.length ? Math.round((100 * hw.reduce((a, b) => a + b, 0)) / hw.length) : null;
};

const GamblesFindings: React.FC<{ d: GamblesBundle; stats: boolean }> = ({ d, stats }) => {
  const ev = evRule(d);
  const play = withMode(d, 'participant');
  const pred = withMode(d, 'predictor');
  const evPlay = play.map((m) => val(m, 'participant', 'ev_agreement'));
  const accPlay = play.map((m) => val(m, 'participant', 'majority_accuracy'));
  const accPred = pred.map((m) => val(m, 'predictor', 'majority_accuracy'));
  const rPred = pred.map((m) => val(m, 'predictor', 'pearson_r'));
  const evMaj = ev?.majority_accuracy.value;
  const allOverlap =
    ev != null &&
    d.models.every((m) => (['participant', 'predictor'] as Mode[]).every((k) => !m[k] || overlaps(m[k]!.majority_accuracy, ev.majority_accuracy.value)));
  const moreEV = evMaj != null && evPlay.every((x) => x > evMaj);
  const extreme = pred.every((m) => lopsided(m.predictor_points) > m.predictor_points.length / 2);
  const c = d.ceiling.oracle_accuracy;
  const upCount = d.models.filter((m) => m.participant && m.predictor && val(m, 'predictor', 'majority_accuracy') > val(m, 'participant', 'majority_accuracy')).length;
  const nBoth = d.models.filter((m) => m.participant && m.predictor).length;
  return (
    <Section title="What I found" wide>
      <div className="max-w-3xl mx-auto">
        {evMaj != null && (
          <>
            <p className="text-2xl font-semibold leading-snug mb-4">
              {moreEV
                ? 'When they play, the models go for the higher average more than people do.'
                : 'When they play, the models go for the higher average about as often as people do.'}
            </p>
            <P>
              Most people chose the higher-average gamble on {p0(evMaj)} of problems. When the models choose for themselves, they
              pick it {range(evPlay, p0)} of the time.
            </P>
          </>
        )}
        <P>
          <Lead>
            {upCount * 2 > nBoth ? 'Predicting people beats being one.' : 'Predicting people is no better than being one.'}
          </Lead>{' '}
          When they predict, the models match the majority on {range(accPred, p0)} of problems. When they play, they reach{' '}
          {range(accPlay, p0)}.
          {allOverlap && evMaj != null
            ? ` With only ${d.problems} problems, however, neither way is clearly better than the higher-average rule's ${p0(evMaj)}.`
            : ''}
        </P>
        <P>
          <Lead>{accPred.concat(accPlay).every((x) => x < c) ? 'There\'s still room to improve.' : 'Some runs reach the best possible.'}</Lead>{' '}
          {accPred.concat(accPlay).every((x) => x < c)
            ? `No model reaches the ${p0(c)} that a perfect prediction would get on these problems.`
            : ''}
        </P>
      </div>
      <PlayPredict d={d} stats={stats} />
      <div className="max-w-3xl mx-auto">
        <P>
          <Lead>The bigger gain is in the share, not the side.</Lead> The models' predicted shares correlate with the real shares
          at r = {range(rPred, r2)}
          {ev ? `, compared with ${r2(ev.pearson_r.value)} for the higher-average rule` : ''}.
          {extreme ? ' Their predictions are more extreme than people are: they call a problem lopsided when people are closer to evenly split.' : ''}
        </P>
      </div>
      <ScatterExplorer d={d} />
    </Section>
  );
};

export const GamblesStoryBody: React.FC = () => {
  const { data: d, error } = useBundle('gambles');
  const [stats] = useShowStats(false);
  const pub = d ? d.published.map((p) => p.accuracy) : [];
  const all = d ? evRuleAll(d) : undefined;
  const ev = d ? evRule(d) : undefined;
  const hw = d ? halfWidth(d) : null;
  const labels = d ? Object.fromEntries(d.models.map((m) => [m.slug, m.label])) : {};
  return (
    <>
      <EvalHero badge="Eval 3 · risky choices" title="Which gamble would you take?">
        Offered a sure $10 or a 50% chance at $25, people don't simply pick the option with the bigger average payoff. Can AI
        models predict what people actually choose?
      </EvalHero>
      <div className="max-w-3xl mx-auto mb-14">
        <P>
          My <Link to="/evals" className="text-navy underline underline-offset-2">first eval</Link> asked a question that anyone
          can answer at a glance: which of two shapes looks more complex? Here I wanted to know if the same approach works when
          people are known to be inconsistent. The structure is the same: real people made choices between two options, AI models
          saw the same choices, and I measured how closely the models match the people.
        </P>
      </div>
      {!d ? (
        <Loading error={error} />
      ) : (
        <>
          <Section title="What the humans did">
            <P>
              The choices13k study (Peterson and colleagues, 2021) showed many people pairs of gambles and asked which one they
              would take. The two gambles in each problem are labelled A and B; the letters don't mean anything. Since everyone
              picked one or the other, one number describes how people split: the share who chose B. If 70% chose B, the other
              30% chose A.
              {pub.length
                ? ` Earlier researchers built models that predict those choices, and the best ones pick the same option as most people ${range(pub, p0)} of the time.`
                : ''}{' '}
              People are also inconsistent: because each problem had a limited number of people, even a perfect prediction would
              match the majority only about {p0(d.ceiling.oracle_accuracy)} of the time.
            </P>
            {d.example && <GambleExample example={d.example} labels={labels} />}
          </Section>
          <Section title="How I asked the models">
            <P>
              I used {d.problems} of the {all ? all.problems.toLocaleString('en-US') : ''} problems described in words, and chose them so
              they cover the full range from lopsided to evenly split. Each model did the task in two ways:
            </P>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <Card className="bg-white/70">
                <CardContent className="p-4 font-beezee">
                  <div className="text-base font-semibold">Play</div>
                  <div className="text-sm text-muted-foreground">
                    The model picks a gamble itself. It saw each problem in both orders, 5 times each. I count how often it picks B.
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/70">
                <CardContent className="p-4 font-beezee">
                  <div className="text-base font-semibold">Predict</div>
                  <div className="text-sm text-muted-foreground">The model says what share of people chose B.</div>
                </CardContent>
              </Card>
            </div>
            <P>
              I compared both against two simple rules. The <em>higher-average rule</em> always picks the gamble with the higher
              average payout: what you'd get per play if you played the gamble many times (its expected value). The{' '}
              <em>coin flip</em> picks either gamble at random.
            </P>
          </Section>
          {d.examples && d.examples.length > 0 && <GambleProblems d={d} />}
        </>
      )}
      {d && <ChapterBreak id="findings" label="The results" />}
      {d && <GamblesFindings d={d} stats={stats} />}
      {d && (
        <Section title="What to be careful about">
          <ul className="list-disc pl-6 space-y-3 font-beezee text-lg leading-relaxed mb-6">
            <li>
              This is a pilot of {d.problems} problems{hw ? `, so every percentage here has a margin of about ±${hw} points` : ''}.
              {ev && all
                ? ` On these ${d.problems} problems, the higher-average rule matches ${p0(ev.majority_accuracy.value)} of majorities. On all ${all.problems.toLocaleString('en-US')} problems it matches ${p0(all.majority_accuracy.value)}${ev.majority_accuracy.value > all.majority_accuracy.value ? ', so this sample is easier than the full set' : ''}.`
                : ''}
            </li>
            {pub.length > 0 && (
              <li>
                The published {range(pub, p0)} comes from a different set of problems, where people saw the outcomes of their
                choices. It's a rough reference point, not a direct comparison.
              </li>
            )}
            {gambleNotes(d).map((n) => (
              <li key={n.label + n.text}>{n.text}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button to="/evals/gambles/results">See the gamble results</Button>
            <Button to="/evals/proofs" variant="outline">
              Back to the proofs eval
            </Button>
          </div>
        </Section>
      )}
    </>
  );
};

// ── Results page ─────────────────────────────────────────────────────────────

const Majority: React.FC<{ d: GamblesBundle; stats: boolean }> = ({ d, stats }) => {
  const [mode, setMode] = React.useState<Mode>('predictor');
  const models = withMode(d, mode).sort((a, b) => val(b, mode, 'majority_accuracy') - val(a, mode, 'majority_accuracy'));
  const ev = evRule(d);
  const rows: DotRow[] = [
    ...models.map((m) => {
      const c = m[mode]!.majority_accuracy;
      return { label: m.label, value: c.value, lo: c.ci_low, hi: c.ci_high, color: NEWER, dagger: hasNote(m, mode) };
    }),
    ...d.baselines.map((b, i) => ({
      label: ruleLabel(b.label),
      value: b.majority_accuracy.value,
      lo: b.majority_accuracy.ci_low,
      hi: b.majority_accuracy.ci_high,
      color: RULE,
      marker: 'diamond' as const,
      baseline: true,
      gapBefore: i === 0,
    })),
  ];
  const n = models.length;
  const both = d.models.filter((m) => m.participant && m.predictor);
  const up = both.filter((m) => val(m, 'predictor', 'majority_accuracy') > val(m, 'participant', 'majority_accuracy')).length;
  const allOverlap = ev && d.models.every((m) => (['participant', 'predictor'] as Mode[]).every((k) => !m[k] || overlaps(m[k]!.majority_accuracy, ev.majority_accuracy.value)));
  const hw = halfWidth(d);
  const all = evRuleAll(d);
  return (
    <ChartCard
      id="gambles-majority"
      title="How often each model sides with most people"
      subtitle={`${d.problems} problems. Switch between the models predicting what people chose and choosing for themselves.`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <MarkLegend
          items={[
            { mark: 'dot', label: 'Models' },
            { mark: 'diamond', color: RULE, label: 'Rules' },
            ...(d.published.length ? [{ mark: 'swatch' as const, color: 'hsl(var(--muted-foreground) / 0.25)', label: 'Published models' }] : []),
            { mark: 'hatch' as const, label: 'Out of reach' },
          ]}
        />
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList aria-label="How the models answered">
            <TabsTrigger value="predictor">Predict</TabsTrigger>
            <TabsTrigger value="participant">Play</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <DotWhisker
        rows={rows}
        domain={[0.4, 0.95]}
        ticks={[0.4, 0.5, 0.6, 0.7, 0.8, 0.9]}
        format={pctTick}
        references={refsFor(d, { ev: false, band: true })}
        showCI={stats}
        ariaLabel={`Share of problems where each model sides with most people (${MODE_LABEL[mode]}), with the higher-average rule and a coin flip`}
        describedBy="gambles-metrics-table"
      />
      <SettingsFootnote
        notes={gambleNotes(d, mode)}
        extra={
          d.published.length
            ? `‡ Published models (${d.published.map((p) => p.label).join(', ')}) are scored on the full set of problems where people saw the outcomes of their choices, not on this sample.`
            : undefined
        }
      />
      <WhatAmI>
        <p>
          A model sides with the majority when the side it favours (above or below 50% for B) is the side most people chose.
          Problems that people split exactly evenly are left out. <strong>Predict</strong> asks the model what share of people
          chose B; <strong>Play</strong> lets it choose for itself.
        </p>
        <p>
          The best possible score knows each problem's true choice rate. It still misses some problems, because each one had a
          limited number of people.
        </p>
        <p>
          This is a pilot of {d.problems} problems{hw ? `, so every percentage has a margin of about ±${hw} points` : ''}.
          {ev && all
            ? ` The higher-average rule matches ${p0(ev.majority_accuracy.value)} of majorities here and ${p0(all.majority_accuracy.value)} on all ${all.problems.toLocaleString('en-US')} problems.`
            : ''}{' '}
          The shaded band is a rough reference point, not a direct comparison.
        </p>
      </WhatAmI>
      <Takeaway>
        Predicting does better than playing for {countOf(up, both.length)}.
        {allOverlap && ev ? ` Every interval overlaps the higher-average rule's ${p0(ev.majority_accuracy.value)}.` : ''}
        {n === 0 ? ' No model has results in this mode.' : ''}
      </Takeaway>
    </ChartCard>
  );
};

const SmallMultiples: React.FC<{ d: GamblesBundle }> = ({ d }) => {
  const models = d.models.filter((m) => m.predictor).sort((a, b) => val(a, 'predictor', 'mse') - val(b, 'predictor', 'mse'));
  const withPts = models.filter((m) => m.predictor_points.length);
  const lop = withPts.map((m) => lopsided(m.predictor_points));
  const nPts = withPts[0]?.predictor_points.length ?? 0;
  return (
    <ChartCard
      id="gambles-scatter"
      title="How well each model predicts the split between two gambles"
      subtitle="One panel per model, closest guesses first. Each guess is averaged over both orders (A shown first, then B shown first)."
    >
      {withPts[0] && <ReadingTheScatter d={d} model={withPts[0]} />}
      <ScatterLegend />
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-4 gap-x-4 gap-y-5 mt-3">
        {models.map((m) => {
          const ws = wrongSide(m.predictor_points);
          return (
            <figure key={m.slug} className="min-w-0 m-0">
              <figcaption className="text-base font-semibold mb-1">
                {m.label}
                {hasNote(m, 'predictor') ? '†' : ''}
              </figcaption>
              <PredictorScatter points={m.predictor_points} size="sm" label={m.label} highlight={d.example?.row} />
              <p className="mt-1 text-xs font-beezee text-muted-foreground leading-snug">
                r {r2(val(m, 'predictor', 'pearson_r'))} · typical miss {typicalMiss(val(m, 'predictor', 'mse'))} · wrong
                majority {ws.wrong} of {ws.n}
              </p>
            </figure>
          );
        })}
      </div>
      <SettingsFootnote notes={gambleNotes(d, 'predictor')} />
      <WhatAmI>
        <p>
          Under each panel: <strong>r</strong> is how well the dots follow the line (1 is perfect, 0 is no relation).{' '}
          <strong>Typical miss</strong> is how far a guess usually lands from the real share, in percentage points (the square
          root of the average squared gap). <strong>Wrong majority</strong> counts the dots in the shaded corners; problems
          people split exactly 50/50 are left out.
        </p>
        <ShowTheNumbers d={d} />
      </WhatAmI>
      {withPts.length > 0 && (
        <Takeaway>
          {withPts.every((m, i) => lop[i] > m.predictor_points.length / 2) ? 'Every model expects' : 'Some models expect'} people
          to agree more than they do: the predicted majority is bigger than the real one on {range(lop, String, '–')} of the{' '}
          {nPts} problems.
        </Takeaway>
      )}
    </ChartCard>
  );
};

const GambleMetricsTable: React.FC<{ d: GamblesBundle; stats: boolean }> = ({ d, stats }) => {
  const pc = (c: R | undefined) =>
    c ? <WithCI value={p1(c.value)} lo={c.ci_low == null ? null : (100 * c.ci_low).toFixed(1)} hi={c.ci_high == null ? null : (100 * c.ci_high).toFixed(1)} stats={stats} /> : '—';
  const rc = (c: R | undefined) =>
    c ? <WithCI value={r2(c.value)} lo={c.ci_low == null ? null : r2(c.ci_low)} hi={c.ci_high == null ? null : r2(c.ci_high)} stats={stats} /> : '—';
  const mse = (c: R | undefined) => (c ? num(c.value, 3) : '—');
  const columns: MetricsColumn[] = [
    { key: 'label', label: 'Model or rule' },
    { key: 'mode', label: 'Mode' },
    { key: 'maj', label: 'Sides with majority', short: 'Majority', num: true },
    { key: 'ev', label: 'Picks higher average', short: 'Higher avg.', num: true },
    { key: 'mse', label: 'Squared error', short: 'Sq. error', num: true },
    { key: 'r', label: 'r with people', short: 'r', num: true },
    { key: 'cons', label: 'Same answer both orders', short: 'Same answer', num: true },
    { key: 'first', label: 'Picks first option', short: 'First', num: true },
  ];
  const models = [...d.models].sort((a, b) => (val(b, 'predictor', 'majority_accuracy') || 0) - (val(a, 'predictor', 'majority_accuracy') || 0));
  const rows: MetricsRow[] = [];
  models.forEach((m, i) => {
    (['predictor', 'participant'] as Mode[])
      .filter((k) => m[k])
      .forEach((k, j) => {
        const g = m[k]!;
        rows.push({
          kind: 'model',
          sepBefore: i > 0 && j === 0,
          cells: {
            label: j === 0 ? m.label : '',
            mode: `${MODE_LABEL[k]}${g.settings_note ? '†' : ''}`,
            maj: pc(g.majority_accuracy),
            ev: pc(g.ev_agreement),
            mse: mse(g.mse),
            r: rc(g.pearson_r),
            cons: p1(g.order_consistency),
            first: g.first_position_rate == null ? '—' : p1(g.first_position_rate),
          },
        });
      });
  });
  d.baselines.forEach((b, i) =>
    rows.push({
      kind: 'baseline',
      sepBefore: i === 0,
      cells: { label: ruleLabel(b.label), mode: '—', maj: pc(b.majority_accuracy), ev: pc(b.ev_agreement), mse: mse(b.mse), r: rc(b.pearson_r) },
    })
  );
  const all = evRuleAll(d);
  if (all)
    rows.push({
      kind: 'baseline',
      cells: {
        label: `Higher-average rule, all ${all.problems.toLocaleString('en-US')} problems`,
        mode: '—',
        maj: pc(all.majority_accuracy),
        ev: pc(all.ev_agreement),
        mse: mse(all.mse),
        r: rc(all.pearson_r),
      },
    });
  rows.push({
    kind: 'human',
    sepBefore: true,
    cells: { label: 'Best possible (noise ceiling)', mode: '—', maj: p1(d.ceiling.oracle_accuracy), mse: num(d.ceiling.mse_floor, 4) },
  });
  const predMse = withMode(d, 'predictor').map((m) => val(m, 'predictor', 'mse'));
  const playMse = withMode(d, 'participant').map((m) => val(m, 'participant', 'mse'));
  const ev = evRule(d);
  return (
    <ChartCard
      id="gambles-table"
      title="Play versus predict, every metric"
      subtitle={`Two rows per model: Predict, then Play.${stats ? ' Brackets are 95% intervals from resampling problems.' : ''}`}
    >
      <MetricsTable id="gambles-metrics-table" columns={columns} rows={rows} caption="Every gamble metric for each model and mode, the rules and the best possible score" />
      <SettingsFootnote notes={gambleNotes(d)} />
      <WhatAmI>
        <p>
          <strong>Squared error</strong> is the average squared gap between the model's share and the real share. 0 is perfect. A
          Play share is built from the model's own repeated choices, so it tends to sit near 0% or 100%, which is why Play
          squared error is much higher ({range(playMse, (x) => num(x, 2), ' to ')}).
        </p>
        <p>
          <strong>Play:</strong> the model makes the choice itself (2 orders × 5 repeats). <strong>Predict:</strong> it predicts
          the share of people choosing B (2 orders × 1 repeat). <strong>Picks first option</strong> only applies to Play.
        </p>
        <p>
          This is a pilot of {d.problems} of the {all ? all.problems.toLocaleString('en-US') : ''} problems described in words,
          chosen to cover the full range of human choice rates.
        </p>
      </WhatAmI>
      <Takeaway>
        The predicted shares have errors of {range(predMse, (x) => num(x, 3))}
        {ev ? `, compared with ${num(ev.mse.value, 2)} for the higher-average rule` : ''}. The best possible error, given the noise in
        the human data, is {num(d.ceiling.mse_floor, 4)}.
      </Takeaway>
    </ChartCard>
  );
};

export const GamblesResultsSection: React.FC = () => {
  const { data: d, error } = useBundle('gambles');
  const [stats] = useShowStats(false);
  const pred = d ? withMode(d, 'predictor').map((m) => val(m, 'predictor', 'majority_accuracy')) : [];
  const ev = d ? evRule(d) : undefined;
  const allOverlap =
    d && ev && d.models.every((m) => (['participant', 'predictor'] as Mode[]).every((k) => !m[k] || overlaps(m[k]!.majority_accuracy, ev.majority_accuracy.value)));
  return (
    <Section id="gambles" title="Gambles: predicting risky choices" kicker="Eval 3 · Risky choices" wide>
      {!d ? (
        <Loading error={error} />
      ) : (
        <>
          <P className="max-w-3xl">
            On {d.problems} choices13k problems, models predicting people match the majority on {range(pred, p0)} of problems.
            That's below the best possible {p0(d.ceiling.oracle_accuracy)}
            {ev ? `, and ${allOverlap ? 'not clearly above' : 'compared with'} the higher-average rule's ${p0(ev.majority_accuracy.value)}` : ''}.
          </P>
          <Majority d={d} stats={stats} />
          <SmallMultiples d={d} />
          <GambleMetricsTable d={d} stats={stats} />
        </>
      )}
    </Section>
  );
};

