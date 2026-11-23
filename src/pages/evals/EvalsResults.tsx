import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  ChartCard,
  DotWhisker,
  EvalsNav,
  GroupLegend,
  Loading,
  NEWER,
  P,
  Section,
  THESIS,
  Takeaway,
  WhatAmI,
  groupColor,
  useWidth,
} from '../../components/evals/common';
import { QUESTION_LABEL, sortByAgreement, useBundle } from '../../lib/evals/data';
import { fmtCI, pct, useShowStats } from '../../lib/evals/stats';
import type { CI, Ordering, RunSummary, Summary, Task } from '../../lib/evals/types';
import { TASKS } from '../../lib/evals/types';

const pctTick = (v: number) => `${Math.round(100 * v)}%`;

function rowsFor(runs: RunSummary[], pick: (r: RunSummary) => CI | null | undefined, note?: (r: RunSummary) => string) {
  return runs
    .map((r) => ({ r, c: pick(r) }))
    .filter((x) => x.c && x.c.value !== null)
    .map(({ r, c }) => ({
      label: r.label,
      value: c!.value as number,
      lo: c!.ci_low,
      hi: c!.ci_high,
      color: groupColor(r.group),
      note: note?.(r),
    }));
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

const Leaderboard: React.FC<{ s: Summary; stats: boolean }> = ({ s, stats }) => {
  const [ordering, setOrdering] = React.useState<Ordering>('AB');
  const [scoring, setScoring] = React.useState<'excluded' | 'strict'>('excluded');
  const runs = sortByAgreement(s.runs, ordering).filter((r) => r.metrics[ordering]);
  const key = scoring === 'excluded' ? 'agreement_excluded' : 'agreement_strict';
  const ceiling = s.human_ceiling_loo;
  return (
    <ChartCard
      id="leaderboard"
      title="Agreement with the human majority"
      subtitle={
        ordering === 'AB'
          ? 'All 8 models, images in the original order (the only order the thesis runs used).'
          : 'The 4 newer models only, averaged over both image orders.'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <GroupLegend />
        <div className="flex flex-wrap gap-2">
          <Tabs value={ordering} onValueChange={(v) => setOrdering(v as Ordering)}>
            <TabsList>
              <TabsTrigger value="AB">Original order</TabsTrigger>
              <TabsTrigger value="both">Both orders</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={scoring} onValueChange={(v) => setScoring(v as 'excluded' | 'strict')}>
            <TabsList>
              <TabsTrigger value="excluded">Ties left out</TabsTrigger>
              <TabsTrigger value="strict">Ties count as wrong</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <DotWhisker
        rows={rowsFor(runs, (r) => r.metrics[ordering]?.[key].pooled)}
        domain={[0.6, 1]}
        format={pctTick}
        reference={{
          value: ceiling.value ?? 0,
          lo: ceiling.ci_low,
          hi: ceiling.ci_high,
          label: `One person: ${fmtCI(ceiling, stats)}`,
        }}
        showCI={stats}
        ariaLabel="Leaderboard of agreement with the human majority"
      />
      <WhatAmI>
        <p>
          <strong>Agreement</strong> is the share of a model's answers that pick the same shape as most of the people who
          judged that pair, over 264 pairs and four questions. Pairs where people split exactly evenly are left out.
        </p>
        <p>
          <strong>Ties left out</strong> is how the thesis scored it: when a model says "tie", that answer is dropped.{' '}
          <strong>Ties count as wrong</strong> is stricter. The two differ most for Gemini 2.0 Flash, which said "tie" on 14%
          of pairs.
        </p>
        <p>
          <strong>One person</strong> (the dashed line) holds out one rater at a time and checks whether they agree with the
          rest. {stats ? 'Bars are 95% intervals from resampling pairs (cluster bootstrap).' : 'Turn on "Show the statistics" to see 95% intervals.'}
        </p>
      </WhatAmI>
      <Takeaway>Every newer model beats every thesis model, and all four newer models sit above the one-person line.</Takeaway>
    </ChartCard>
  );
};

// ── Per question ─────────────────────────────────────────────────────────────

const PerQuestion: React.FC<{ s: Summary; stats: boolean }> = ({ s, stats }) => {
  const runs = sortByAgreement(s.runs);
  return (
    <ChartCard id="questions" title="Agreement by question" subtitle="All 8 models, original image order, ties left out.">
      <GroupLegend />
      <div className="grid gap-6 md:grid-cols-2 mt-2">
        {TASKS.map((t: Task) => (
          <div key={t} className="min-w-0">
            <div className="text-base font-semibold mb-1">{QUESTION_LABEL[t]}</div>
            <DotWhisker
              rows={rowsFor(runs, (r) => r.metrics.AB?.agreement_excluded[t])}
              domain={[0.6, 1]}
              format={pctTick}
              showCI={stats}
              ariaLabel={`Agreement by model for: ${QUESTION_LABEL[t]}`}
            />
          </div>
        ))}
      </div>
      <WhatAmI>
        <p>
          The same agreement score, split by the four questions people answered. Each panel has its own ordering of models,
          kept the same as the overall leaderboard so you can compare across panels.
        </p>
      </WhatAmI>
      <Takeaway>{perQuestionTakeaway(s)}</Takeaway>
    </ChartCard>
  );
};

function perQuestionTakeaway(s: Summary): string {
  const cleanSweep = TASKS.filter((t) => {
    const v = (g: 'thesis' | 'newer') => s.runs.filter((r) => r.group === g).map((r) => r.metrics.AB?.agreement_excluded[t].value ?? 0);
    return Math.min(...v('newer')) > Math.max(...v('thesis'));
  });
  const missing = TASKS.filter((t) => !cleanSweep.includes(t)).map((t) => QUESTION_LABEL[t].toLowerCase());
  return missing.length
    ? `Every newer model beats every thesis model on ${cleanSweep.length} of 4 questions; the exception is ${missing.join(' and ')}, where the weakest newer model falls just below the best thesis model.`
    : 'Every newer model beats every thesis model on all four questions.';
}

// ── Thesis vs newer ──────────────────────────────────────────────────────────

const GroupCompare: React.FC<{ s: Summary }> = ({ s }) => {
  const groupMean = (g: 'thesis' | 'newer', t: Task) => {
    const vals = s.runs.filter((r) => r.group === g).map((r) => r.metrics.AB?.agreement_excluded[t].value ?? 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const gains = TASKS.map((t) => 100 * (groupMean('newer', t) - groupMean('thesis', t))).sort((a, b) => a - b);
  const [ref, W] = useWidth<HTMLDivElement>();
  const narrow = W < 460;
  const labelW = narrow ? 122 : 190;
  const rowH = 40;
  const H = 20 + TASKS.length * rowH + 26;
  const domain: [number, number] = [0.75, 1];
  const x = (v: number) => labelW + ((v - domain[0]) / (domain[1] - domain[0])) * (W - labelW - (narrow ? 44 : 50));
  const label = (t: Task) => (narrow ? QUESTION_LABEL[t].replace('Harder to ', '').replace('with scissors', '').replace('from memory', '') : QUESTION_LABEL[t]);
  return (
    <ChartCard id="groups" title="Thesis models vs newer models" subtitle="Average of the four models in each group, original image order.">
      <GroupLegend />
      <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="max-w-full h-auto font-beezee" role="img" aria-label="Average agreement by question, thesis vs newer models">
        {[0.75, 0.8, 0.85, 0.9, 0.95, 1].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={10} y2={H - 22} stroke="hsl(var(--border))" />
            <text x={x(t)} y={H - 6} textAnchor="middle" fontSize={12} fill="hsl(var(--muted-foreground))">
              {pctTick(t)}
            </text>
          </g>
        ))}
        {TASKS.map((t, i) => {
          const cy = 20 + i * rowH + rowH / 2;
          const a = groupMean('thesis', t);
          const b = groupMean('newer', t);
          return (
            <g key={t}>
              <text x={labelW - 10} y={cy + 4} textAnchor="end" fontSize={13} fill="#001d36">
                {label(t)}
              </text>
              <line x1={x(a)} x2={x(b)} y1={cy} y2={cy} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
              <circle cx={x(a)} cy={cy} r={7} fill={THESIS} />
              <circle cx={x(b)} cy={cy} r={7} fill={NEWER} />
              <text x={x(a) - 10} y={cy + 4} textAnchor="end" fontSize={12} fill="#001d36">
                {pct(a)}
              </text>
              <text x={x(b) + 10} y={cy + 4} fontSize={12} fill="#001d36">
                {pct(b)}
              </text>
            </g>
          );
        })}
      </svg>
      </div>
      <WhatAmI>
        <p>
          Each line joins the average of the four thesis models (early 2026) to the average of the four newer models
          (October 2026) on one question. Both groups used the same prompt, word for word.
        </p>
      </WhatAmI>
      <Takeaway>
        The newer models gain {gains[0].toFixed(1)}–{gains[gains.length - 1].toFixed(1)} percentage points, on every question.
      </Takeaway>
    </ChartCard>
  );
};

// ── Order bias ───────────────────────────────────────────────────────────────

const OrderBias: React.FC<{ s: Summary; stats: boolean }> = ({ s, stats }) => {
  const runs = [...s.runs].sort((a, b) => (a.group === b.group ? 0 : a.group === 'thesis' ? -1 : 1));
  const native = (r: RunSummary) => r.metrics[r.native_ordering]?.first_position_rate;
  const newer = s.runs.filter((r) => r.group === 'newer');
  const changed = newer.map((r) => 1 - (r.metrics.both?.order_consistency?.value ?? 1)).sort((a, b) => a - b);
  const flips = `${Math.round(100 * changed[0])}–${Math.round(100 * changed[changed.length - 1])}%`;
  return (
    <ChartCard
      id="order"
      title="Does the order of the images matter?"
      subtitle="How often a model picks the image shown first. 50% means order doesn't matter."
    >
      <GroupLegend />
      <DotWhisker
        rows={rowsFor(runs, native, (r) => (r.native_ordering === 'AB' ? 'one order only' : 'both orders'))}
        domain={[0.4, 0.65]}
        ticks={[0.4, 0.45, 0.5, 0.55, 0.6, 0.65]}
        format={pctTick}
        reference={{ value: 0.5, label: 'Even split' }}
        showCI={stats}
        ariaLabel="Share of answers picking the first image, by model"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge variant="outline" className="font-beezee">
          Thesis models: one order only
        </Badge>
        <Badge variant="outline" className="font-beezee">
          Newer models: both orders
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-4 mt-4">
        {newer.map((r) => (
          <Card key={r.run_id} className="bg-white/70">
            <CardContent className="p-3 font-beezee text-sm">
              <div className="font-semibold">{r.label}</div>
              <div>
                Same answer in both orders: <strong>{fmtCI(r.metrics.both?.order_consistency, stats)}</strong>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <WhatAmI>
        <p>
          The thesis models saw each pair once, always in the same order, so their rate mixes a real preference for the
          first image with which image happened to be listed first. The newer models saw every pair both ways round, so
          for them 50% is exactly "no preference".
        </p>
        <p>
          <strong>Same answer in both orders</strong> asks: when the two images swap places, does the model still pick the
          same shape? Anything below 100% means the order changed the answer.
        </p>
      </WhatAmI>
      <Takeaway>
        The newer models are close to an even split, but swapping the images still changes {flips} of their answers.
      </Takeaway>
    </ChartCard>
  );
};

// ── Controls ─────────────────────────────────────────────────────────────────

const CONTROL_ROWS = [
  { key: 'identical', label: 'Two identical images', expected: 'should say tie' },
  { key: 'color_only', label: 'Same shape, different color', expected: 'should say tie' },
  { key: 'size_only', label: 'Same shape, smaller copy', expected: 'should say tie' },
  { key: 'obvious', label: 'Circle or square vs a detailed insect', expected: 'should pick the insect' },
];

const Controls: React.FC<{ s: Summary }> = ({ s }) => {
  const runs = s.runs.filter((r) => Object.keys(r.controls).length);
  return (
    <ChartCard
      id="controls"
      title="Test pairs with known answers"
      subtitle="14 control pairs, every answer counted in both image orders. Only the newer runs included them."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {runs.map((r) => (
          <Card key={r.run_id} className="bg-white/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{r.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CONTROL_ROWS.map(({ key, label, expected }) => {
                const c = r.controls[key];
                if (!c) return null;
                const rate = (100 * c.correct) / c.total;
                const variant = rate >= 90 ? 'success' : rate >= 60 ? 'warning' : 'destructive';
                const bar = rate >= 90 ? 'bg-emerald-600' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-beezee">
                        {label} <span className="text-muted-foreground">({expected})</span>
                      </span>
                      <Badge variant={variant} className="tabular-nums">
                        {c.correct}/{c.total}
                      </Badge>
                    </div>
                    <Progress value={rate} indicatorClassName={bar} aria-label={`${label}: ${c.correct} of ${c.total} correct`} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
      <WhatAmI>
        <p>
          Each control pair has an answer any person would agree on: two copies of the same shape are equally complex, and a
          detailed insect is more complex than a circle. The numbers are correct answers out of all answers, counting both
          image orders.
        </p>
        <p>
          The prompt tells models that people rarely answer "tie", which may push them away from the right answer on the
          identical, color and size pairs.
        </p>
      </WhatAmI>
      <Takeaway>
        Every model gets the obvious cases right; color and size changes are where they still differ from people.
      </Takeaway>
    </ChartCard>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const EvalsResults: React.FC = () => {
  const { data: s, error } = useBundle('summary');
  const [stats] = useShowStats(false);
  if (!s) return <Loading error={error} />;
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} />
      <Section title="The results" kicker="Layer 2" wide>
        <P className="max-w-3xl">
          Eight AI models judged 264 pairs of shapes on four questions. These charts show how often they agree with people,
          how sure we can be, and where they still differ. Every chart has a short explanation under it.
        </P>
        <Leaderboard s={s} stats={stats} />
        <PerQuestion s={s} stats={stats} />
        <GroupCompare s={s} />
        <OrderBias s={s} stats={stats} />
        <Controls s={s} />
      </Section>
    </div>
  );
};

export default EvalsResults;
