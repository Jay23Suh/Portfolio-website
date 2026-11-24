import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
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
import type { DotRow, MetricsColumn, MetricsRow } from './common';
import { useBundle } from '../../lib/evals/data';
import { num, pct, range, useShowStats } from '../../lib/evals/stats';
import {
  cap,
  countOf,
  leftovers,
  noteDetail,
  noteText,
  ordinal,
  pearson,
  proofPhrase,
  rankText,
  ranks,
  standardize,
  word,
} from '../../lib/evals/proofs';
import type { Rank } from '../../lib/evals/proofs';
import type { ProofBaseline, ProofModel, ProofScores, ProofsBundle } from '../../lib/evals/types';
import { cn } from '../../lib/utils';

export const HUMAN = '#001d36';
export const RULE = 'hsl(var(--muted-foreground))';
const SHORTER = 'Shorter wins';

// ── Selectors over the bundle ────────────────────────────────────────────────

const byPearson = (d: ProofsBundle) => [...d.models].sort((a, b) => b.pearson.value - a.pearson.value);
const shorter = (d: ProofsBundle): ProofBaseline | undefined => d.baselines.find((b) => b.label === SHORTER);
const panelSize = (d: ProofsBundle) => Number(d.humans.label.match(/\((\d+)\)/)?.[1]) || null;
const r2 = (x: number) => num(x, 2);
const rTick = (v: number) => (v === 0 || v === 1 ? String(v) : num(v, 2));
export const shortLabel = (label: string) => label.split(/[\s-]/)[0];

/** Settings-note footnotes for every model that has one (none -> no footnote). */
export const proofNotes = (d: ProofsBundle) =>
  d.models
    .filter((m) => m.settings_note)
    .map((m) => {
      const note = m.settings_note as string;
      const detail = noteDetail(m.label, note, d.caveats);
      return { label: m.label, text: `${m.label} ran with ${noteText(note)}.${detail ? ` ${detail}` : ''}` };
    });

/** Ranks for the mathematicians and every model. */
function allRanks(d: ProofsBundle) {
  return { humans: ranks(d.humans.scores), models: d.models.map((m) => ({ m, r: ranks(m.scores) })) };
}

/** The proof every model ranks lower (or higher) than the mathematicians, by the widest margin. */
function sharedDisagreement(d: ProofsBundle, dir: 'lower' | 'higher') {
  const { humans, models } = allRanks(d);
  let best: { proof: string; human: number; lo: number; hi: number; gap: number } | null = null;
  for (const proof of d.proofs) {
    const h = humans[proof]?.rank;
    const mr = models.map(({ r }) => r[proof]?.rank).filter((x): x is number => x !== undefined);
    if (h === undefined || !mr.length) continue;
    const lo = Math.min(...mr);
    const hi = Math.max(...mr);
    const gap = dir === 'lower' ? lo - h : h - hi;
    if (gap > 0 && (!best || gap > best.gap)) best = { proof, human: h, lo, hi, gap };
  }
  return best;
}

/** Proof that every judge (mathematicians and models) puts at rank `k` (1 or n), if they all agree. */
function agreedAt(d: ProofsBundle, which: 'top' | 'bottom') {
  const judges = [d.humans.scores, ...d.models.map((m) => m.scores)];
  const pick = (s: ProofScores) => {
    const e = Object.entries(s).sort((a, b) => (which === 'top' ? b[1] - a[1] : a[1] - b[1]));
    return e.length > 1 && e[0][1] === e[1][1] ? null : e[0]?.[0] ?? null;
  };
  const picks = judges.map(pick);
  return picks.every((p) => p && p === picks[0]) ? picks[0] : null;
}

const between = (lo: number, hi: number) => (lo === hi ? ordinal(lo) : `between ${ordinal(lo)} and ${ordinal(hi)}`);

// ── P1: where each judge places the nine proofs ──────────────────────────────

export const ProofRankDots: React.FC<{
  humans: ProofScores;
  humanLabel: string;
  model: ProofScores;
  modelLabel: string;
  isBaseline?: boolean;
  order: string[];
}> = ({ humans, humanLabel, model, modelLabel, isBaseline, order }) => {
  const [ref, W] = useWidth<HTMLDivElement>();
  const tableId = `proof-ranks-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const narrow = W < 460;
  const labelW = narrow ? 100 : 138;
  const fs = narrow ? 11 : 13;
  const rowH = narrow ? 24 : 28;
  const top = 8;
  const bottom = 30;
  const H = top + order.length * rowH + bottom;
  const D = 2.4;
  const x = (v: number) => labelW + ((Math.max(-D, Math.min(D, v)) + D) / (2 * D)) * (W - labelW - 12);
  const hz = standardize(humans);
  const mz = standardize(model);
  const hr = ranks(humans);
  const mr = ranks(model);
  const n = order.length;
  const color = isBaseline ? RULE : NEWER;
  const who = humanLabel.replace(/\s*\(\d+\)$/, '').toLowerCase();
  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="max-w-full h-auto font-beezee"
        role="img"
        aria-label={`Where the ${who} and ${modelLabel} place each of the nine proofs`}
        aria-describedby={tableId}
      >
        <line x1={x(0)} x2={x(0)} y1={top - 2} y2={H - bottom + 4} stroke="hsl(var(--border))" />
        {order.map((proof, i) => {
          const cy = top + i * rowH + rowH / 2;
          const hx = x(hz[proof] ?? 0);
          const mx = x(mz[proof] ?? 0);
          return (
            <g key={proof}>
              <text x={labelW - 10} y={cy + 4} textAnchor="end" fontSize={fs} fill={HUMAN}>
                {proof}
              </text>
              <line x1={hx} x2={mx} y1={cy} y2={cy} stroke={RULE} strokeWidth={2} opacity={0.5} />
              {isBaseline ? (
                <path d={`M${mx} ${cy - 7}L${mx + 7} ${cy}L${mx} ${cy + 7}L${mx - 7} ${cy}Z`} fill={color} stroke="white" strokeWidth={1.5}>
                  <title>
                    {proof}: {modelLabel} ranks it {rankText(mr[proof])} of {n} (score {num(model[proof])})
                  </title>
                </path>
              ) : (
                <circle cx={mx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={1.5}>
                  <title>
                    {proof}: {modelLabel} ranks it {rankText(mr[proof])} of {n} (score {num(model[proof])})
                  </title>
                </circle>
              )}
              <circle cx={hx} cy={cy} r={6} fill={HUMAN} stroke="white" strokeWidth={1.5}>
                <title>
                  {proof}: {who} rank it {rankText(hr[proof])} of {n} (score {num(humans[proof])})
                </title>
              </circle>
            </g>
          );
        })}
        <text x={labelW} y={H - 8} fontSize={12} fill="hsl(var(--muted-foreground))">
          {narrow ? '← Less' : '← Less explanatory'}
        </text>
        <text x={W - 4} y={H - 8} textAnchor="end" fontSize={12} fill="hsl(var(--muted-foreground))">
          {narrow ? 'More →' : 'More explanatory →'}
        </text>
      </svg>
      <table id={tableId} className="sr-only">
        <caption>Rank of each proof (1 explains best)</caption>
        <thead>
          <tr>
            <th scope="col">Proof</th>
            <th scope="col">{humanLabel}</th>
            <th scope="col">{modelLabel}</th>
          </tr>
        </thead>
        <tbody>
          {order.map((p) => (
            <tr key={p}>
              <th scope="row">{p}</th>
              <td>{rankText(hr[p])}</td>
              <td>{rankText(mr[p])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ModelSelect: React.FC<{
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}> = ({ options, value, onChange, ariaLabel }) => (
  <Tabs value={value} onValueChange={onChange}>
    <TabsList className="h-auto flex-wrap justify-start" aria-label={ariaLabel}>
      {options.map((o) => (
        <TabsTrigger key={o.key} value={o.key}>
          {o.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

const ProofPlacement: React.FC<{ d: ProofsBundle }> = ({ d }) => {
  const models = byPearson(d);
  const rule = shorter(d);
  const options = [
    ...models.map((m) => ({ key: m.slug, label: `${m.label}${m.settings_note ? '†' : ''}` })),
    ...(rule ? [{ key: SHORTER, label: SHORTER }] : []),
  ];
  const [sel, setSel] = React.useState(options[0]?.key ?? '');
  const model = models.find((m) => m.slug === sel);
  const scores = model ? model.scores : rule?.scores ?? {};
  const label = model ? model.label : SHORTER;
  const order = [...d.proofs].sort((a, b) => (d.humans.scores[b] ?? 0) - (d.humans.scores[a] ?? 0));
  const lower = sharedDisagreement(d, 'lower');
  const higher = sharedDisagreement(d, 'higher');
  const n = d.models.length;
  return (
    <ChartCard
      id="proofs-placement"
      title="Where each model places the nine proofs"
      subtitle="Proofs ordered by the mathematicians, most explanatory first. Each judge's scores are rescaled so both sit on one axis."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <MarkLegend
          items={[
            { mark: 'dot', color: HUMAN, label: d.humans.label },
            { mark: model ? 'dot' : 'diamond', color: model ? NEWER : RULE, label },
          ]}
        />
        <ModelSelect options={options} value={sel} onChange={setSel} ariaLabel="Model to compare with the mathematicians" />
      </div>
      <ProofRankDots humans={d.humans.scores} humanLabel={d.humans.label} model={scores} modelLabel={label} isBaseline={!model} order={order} />
      <WhatAmI>
        <p>
          Each row is one proof. The dark dot is where the mathematicians place it and the blue dot is where the selected
          model places it. The longer the line between them, the more they disagree. Each judge's Bradley-Terry scores have
          their own scale, so I divide each set by its spread before plotting. That doesn't change any ranking or any r.
        </p>
        <p>Hover over a dot to see the rank and the raw score.</p>
      </WhatAmI>
      <Takeaway>
        {lower
          ? `${cap(countOf(n, n))} rank ${proofPhrase(lower.proof)} ${between(lower.lo, lower.hi)}; the mathematicians rank it ${ordinal(lower.human)}.`
          : 'No proof is ranked lower by every model than by the mathematicians.'}
        {higher ? ` Every model ranks ${proofPhrase(higher.proof)} higher than the mathematicians do.` : ''}
      </Takeaway>
    </ChartCard>
  );
};

// ── P2: dumbbell, before and after removing length ───────────────────────────

const LengthDumbbell: React.FC<{ d: ProofsBundle; stats: boolean }> = ({ d, stats }) => {
  const models = byPearson(d);
  const rule = shorter(d);
  const ctrl = models.map((m) => m.pearson_controlling_length);
  const best = models[0];
  const rows: DotRow[] = [
    ...models.map((m) => ({
      label: m.label,
      from: m.pearson.value,
      fromLo: m.pearson.ci_low,
      fromHi: m.pearson.ci_high,
      value: m.pearson_controlling_length,
      color: NEWER,
      dagger: Boolean(m.settings_note),
      note: 'all proofs as written → after removing length',
    })),
    ...(rule
      ? [
          {
            label: 'Shorter wins',
            from: rule.pearson.value,
            fromLo: rule.pearson.ci_low,
            fromHi: rule.pearson.ci_high,
            value: rule.pearson_controlling_length,
            color: RULE,
            marker: 'diamond' as const,
            baseline: true,
            gapBefore: true,
          },
        ]
      : []),
  ];
  const g8 = d.humans.groups_of_8_r;
  const close = rule && best && Math.abs(rule.pearson.value - best.pearson.value) < 0.05;
  const tableId = 'proofs-length-table';
  return (
    <ChartCard
      id="proofs-length"
      title="Agreement before and after removing proof length"
      subtitle="Each line joins a model's r (hollow dot) to its r once length is removed from both sets of scores (filled dot). 1 means the same ranking as the mathematicians."
    >
      <MarkLegend
        className="mb-2"
        items={[
          { mark: 'hollow', label: 'All proofs as written' },
          { mark: 'dot', label: 'After removing length' },
          { mark: 'diamond', color: RULE, label: 'Shorter-wins rule' },
        ]}
      />
      <DotWhisker
        rows={rows}
        domain={[0, 1]}
        ticks={[0, 0.25, 0.5, 0.75, 1]}
        format={rTick}
        references={[
          {
            value: g8,
            label: `Mathematicians vs each other: ${r2(g8)}`,
            labelNarrow: `Mathematicians: ${r2(g8)}`,
            anchor: 'end',
          },
        ]}
        showCI={stats}
        ariaLabel="Correlation with the mathematicians for each model and the shorter-wins rule, before and after removing proof length"
        describedBy={tableId}
      />
      <table id={tableId} className="sr-only">
        <caption>Correlation with the mathematicians</caption>
        <thead>
          <tr>
            <th scope="col">Model or rule</th>
            <th scope="col">r</th>
            <th scope="col">r after removing length</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>{r2(r.from as number)}</td>
              <td>{r2(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SettingsFootnote notes={proofNotes(d)} />
      <WhatAmI>
        <p>
          r is a correlation between a model's nine proof scores and the mathematicians' scores. 1 is a perfect match and 0
          means no relation. The "shorter wins" rule always picks the shorter proof.
        </p>
        <p>
          Shorter proofs tend to explain better, so part of any agreement could come from length alone. The filled dot is r
          after proof length is taken out of both sets of scores: what's left is agreement about something other than
          length.
        </p>
        <p>
          The dashed line ({r2(g8)}) is how closely two panels of 8 mathematicians agree with each other.
          {stats ? ' Whiskers are 95% intervals from resampling picks; the length-removed r has no interval.' : ' Turn on "Show the statistics" for 95% intervals.'}
        </p>
      </WhatAmI>
      {rule && (
        <Takeaway>
          Picking the shorter proof matches the mathematicians {close ? 'about as well as' : rule.pearson.value > best.pearson.value ? 'better than' : 'nearly as well as'}{' '}
          the best model (r {r2(rule.pearson.value)}). Remove length and the rule falls to {r2(rule.pearson_controlling_length)}, while the
          models keep {range(ctrl, r2, '–')}.
        </Takeaway>
      )}
    </ChartCard>
  );
};

// ── Story chapter ────────────────────────────────────────────────────────────


const Lead: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold">{children}</strong>;

function proofFindings(d: ProofsBundle) {
  const models = byPearson(d);
  const rule = shorter(d);
  const top = models[0];
  const low = models[models.length - 1];
  const byCtrl = [...models].sort((a, b) => b.pearson_controlling_length - a.pearson_controlling_length);
  const topCtrl = byCtrl[0];
  const below = rule ? models.filter((m) => m.pearson.value < rule.pearson.value).length : 0;
  const n = models.length;
  return { models, rule, top, low, topCtrl, below, n };
}

const changeText = (m: ProofModel) => {
  const a = m.pearson.value;
  const b = m.pearson_controlling_length;
  return r2(a) === r2(b) ? `staying at ${r2(b)}` : `going from ${r2(a)} to ${r2(b)}`;
};

const ProofsFindings: React.FC<{ d: ProofsBundle; stats: boolean }> = ({ d, stats }) => {
  const { models, rule, top, low, topCtrl, below, n } = proofFindings(d);
  const lower = sharedDisagreement(d, 'lower');
  const first = agreedAt(d, 'top');
  const last = agreedAt(d, 'bottom');
  const topChange = Math.abs(topCtrl.pearson.value - topCtrl.pearson_controlling_length);
  return (
    <Section title="What I found" wide>
      <div className="max-w-3xl mx-auto">
        <p className="text-2xl font-semibold leading-snug mb-4">
          {models.every((m) => m.pearson.value >= 0.5) ? 'Every model ranks the proofs a lot like mathematicians do.' : 'The models rank the proofs only loosely like mathematicians do.'}
        </p>
        <P>
          The r values with the mathematicians run from {r2(low.pearson.value)} for {low.label} to {r2(top.pearson.value)} for{' '}
          {top.label}.
        </P>
        {rule && (
          <P>
            <Lead>Length explains most of that agreement.</Lead> The "shorter wins" rule gets r = {r2(rule.pearson.value)}, which is
            above {countOf(below, n)}. Once length is taken out, the rule falls to r = {r2(rule.pearson_controlling_length)}, and
            the models keep r = {range(models.map((m) => m.pearson_controlling_length), r2)}.
            {models.every((m) => m.pearson_controlling_length > rule.pearson_controlling_length + 0.2)
              ? ' So each model sees something beyond length.'
              : ''}
          </P>
        )}
        <P>
          <Lead>The ranking changes once length is removed.</Lead>{' '}
          {top.slug !== topCtrl.slug
            ? `${top.label} scores highest overall but falls from ${r2(top.pearson.value)} to ${r2(top.pearson_controlling_length)}. `
            : ''}
          {topCtrl.label} {topChange < 0.02 ? 'barely changes' : 'changes'}, {changeText(topCtrl)}. {topCtrl.label} is the model that
          best matches the mathematicians on something other than length.
        </P>
      </div>
      <LengthDumbbell d={d} stats={stats} />
      <div className="max-w-3xl mx-auto">
        {lower && (
          <P>
            <Lead>Every model ranks one proof much lower than the mathematicians do.</Lead> The mathematicians rank{' '}
            {proofPhrase(lower.proof)} {ordinal(lower.human)} of {d.proofs.length}. Every model ranks it {between(lower.lo, lower.hi)}.
            {first && last
              ? ` All ${word(models.length)} models agree with the mathematicians about the top proof (${first}) and the bottom proof (${last}).`
              : ''}
          </P>
        )}
      </div>
      <ProofPlacement d={d} />
    </Section>
  );
};

export const ProofsStoryBody: React.FC = () => {
  const { data: d, error } = useBundle('proofs');
  const [stats] = useShowStats(false);
  const random = d?.baselines.find((b) => b.label === 'Random');
  const judgements = d ? d.models.map((m) => m.judgements) : [];
  const panel = d ? panelSize(d) : null;
  const pairs = d ? (d.proofs.length * (d.proofs.length - 1)) / 2 : 0;
  return (
    <>
      <EvalHero badge="Eval 2 · mathematicians" title="Which proof explains better?">
        Nine proofs can show that the same theorem is true, but some also show <em>why</em> it's true. Do AI models agree with
        mathematicians about which proofs do that best?
      </EvalHero>
      <div className="max-w-3xl mx-auto mb-14">
        <P>
          My <Link to="/evals" className="text-navy underline underline-offset-2">first eval</Link> asked a question that anyone
          can answer at a glance: which of two shapes looks more complex? Here I wanted to know if the same approach works when
          the judgment takes expertise. The structure is the same: real people made choices between two options, AI models saw
          the same choices, and I measured how closely the models match the people.
        </P>
      </div>
      {!d ? (
        <Loading error={error} />
      ) : (
        <>
          <Section title="What the humans did">
            <P>
              In a study by Mejía-Ramos and colleagues (2021), {panel ?? 'a panel of'} mathematicians saw two proofs of the same theorem
              at a time and picked the one that explained more. Together they made {d.humans.judgements.toLocaleString('en-US')} picks.
              The study then turned those picks into one score per proof with a <em>Bradley-Terry</em> fit. Bradley-Terry is a
              standard way to turn many "A beat B" picks into a single ranking. A proof that wins often, especially against
              strong proofs, scores high.
            </P>
            <P>
              The mathematicians agreed with each other closely. When the panel is split into two random halves, the halves'
              scores correlate at r = {r2(d.humans.split_half_r)}. Here r is a correlation: 1 means two lists of scores line up
              perfectly, and 0 means they have nothing to do with each other.
            </P>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6" aria-label="The nine proofs">
              {d.proofs.map((p) => (
                <Card key={p} className="bg-white/70">
                  <CardContent className="p-2.5 sm:p-3 text-sm sm:text-base font-beezee">{p}</CardContent>
                </Card>
              ))}
            </div>
          </Section>
          <ProofExamples d={d} />
          <Section title="How I asked the models">
            <P>
              Each model saw all {pairs} pairs of the {word(d.proofs.length)} proofs as images, in both left-right orders,{' '}
              {word(Math.round((judgements[0] ?? 0) / (2 * pairs)))} times each. That's {range(judgements, (x) => x.toLocaleString('en-US'))} picks per model
              {d.models.every((m) => m.invalid_rate === 0) ? ', and every pick was a valid answer' : ''}. I fit Bradley-Terry to
              each model's picks the same way the study did for the mathematicians, and then correlated the model's scores with
              theirs.
            </P>
            {shorter(d) && (
              <P>
                There's one catch. Short proofs tend to explain better, so a rule that always picks the shorter proof already gets
                r = {r2(shorter(d)!.pearson.value)}. The next two sections explain what "shorter" means here and how I take it out.
              </P>
            )}
          </Section>
          <LengthStory d={d} />
        </>
      )}
      {d && <ChapterBreak id="findings" label="The results" />}
      {d && <ProofsFindings d={d} stats={stats} />}
      {d && (
        <Section title="What to be careful about">
          <ul className="list-disc pl-6 space-y-3 font-beezee text-lg leading-relaxed mb-6">
            <li>
              With only {word(d.proofs.length)} proofs, a single proof that moves up or down changes r a lot.
              {random
                ? ` A rule that picks at random came out at r = ${r2(random.pearson.value)}, from a single run. That number is noise, not a sign that picking at random goes against the mathematicians.`
                : ''}
            </li>
            {proofNotes(d).map((n) => (
              <li key={n.label}>{n.text}</li>
            ))}
            <li>
              Each model's {range(judgements, (x) => x.toLocaleString('en-US'))} picks come from repeating the same {pairs} pairs.
              The {d.humans.judgements.toLocaleString('en-US')} human picks come from {panel ?? 'many'} different people. The two
              sets of scores have the same form, but they don't come from the same kind of source.
            </li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button to="/evals/proofs/results">See the proof results</Button>
            <Button to="/evals/gambles" variant="outline">
              Next: which gamble would you take?
            </Button>
          </div>
        </Section>
      )}
    </>
  );
};

// ── Example proofs ───────────────────────────────────────────────────────────

// My own short descriptions of how each proof works. The typeset proofs come from Ording (2019),
// "99 Variations on a Proof" (Princeton UP), and aren't published here.
const PROOF_SKETCHES: Record<string, { how: string; math?: string }> = {
  Elementary: {
    how: 'Moves everything to one side, then splits 9x into 5x + 4x so that a common factor of (x − 1) appears. Pulling it out leaves a quadratic that also factors. A product is zero only when one of its factors is, so x = 1 or x = 4.',
    math: 'x³ − 6x² + 9x − 4 = (x² − 5x + 4)(x − 1)\n= (x − 4)(x − 1)(x − 1)',
  },
  'One-line': {
    how: 'Moves everything to one side and states the factored form. Nothing else.',
    math: 'x³ − 6x² + 9x − 4 = (x − 1)²(x − 4) = 0',
  },
  Contradiction: {
    how: 'Checks that 1 and 4 work, then supposes there is a third solution. Dividing out (x − 1), then (x − 4), then (x − 1) again ends at 1 = 0, which is impossible.',
  },
  'Two-column': {
    how: 'The same factoring as the Elementary proof, written as 16 numbered statements, each with a reason in a second column ("Addition property of equations", "Distributive property", …).',
  },
  Visual: {
    how: 'Draws x³ as a cube, then shows the factoring as 15 pictures of slabs being added to and cut from the cube until it becomes a box with sides (x − 1), (x − 1) and (x − 4).',
  },
  Experimental: {
    how: "Runs Newton's method on a computer from two starting points, lists 15 steps of each in a table, and reports that a thousand more random starts land on 1 or 4. It makes the answer convincing but never shows why there's no other solution.",
  },
};

const ProofExamples: React.FC<{ d: ProofsBundle }> = ({ d }) => {
  const hr = ranks(d.humans.scores);
  const shown = d.proofs.filter((p) => PROOF_SKETCHES[p]).sort((a, b) => (hr[a]?.rank ?? 0) - (hr[b]?.rank ?? 0));
  return (
    <Section title="What the proofs look like">
      <P>
        Every proof shows the same proposition: if x³ − 6x² + 11x − 6 = 2x − 2, then x = 1 or x = 4. Here's how{' '}
        {word(shown.length)} of the {word(d.proofs.length)} do it, in the order the mathematicians ranked them. (These are my
        summaries. The proofs themselves are from Philip Ording's book <em>99 Variations on a Proof</em>.)
      </P>
      <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] mb-6">
        {shown.map((p) => (
          <Card key={p} className="bg-white/80">
            <CardContent className="p-4 font-beezee">
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <h4 className="font-semibold text-lg">{p}</h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                  rank {rankText(hr[p])} of {d.proofs.length} · {px(d.length_px[p])}
                </span>
              </div>
              {/* Non-breaking spaces around − + = keep terms like (x − 1) on one line. */}
              <p className="text-base leading-relaxed">{PROOF_SKETCHES[p].how.replace(/ ([−+=]) /g, ' $1 ')}</p>
              {PROOF_SKETCHES[p].math && (
                <p className="mt-2 rounded-md bg-muted/60 px-2.5 py-1.5 font-serif text-[0.95rem] text-center overflow-x-auto whitespace-pre-line">
                  {PROOF_SKETCHES[p].math}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

// ── Proof length: what it means and how it's taken out ──────────────────────

const byLength = (d: ProofsBundle) => [...d.proofs].sort((a, b) => d.length_px[a] - d.length_px[b]);
const px = (x: number) => `${x.toLocaleString('en-US')} px`;

/** One row per proof, shortest first: its length, the mathematicians' rank, and their rank once length is removed. */
export const ProofLengths: React.FC<{ d: ProofsBundle }> = ({ d }) => {
  const order = byLength(d);
  const max = Math.max(...order.map((p) => d.length_px[p]));
  const hr = ranks(d.humans.scores);
  const lr = ranks(leftovers(d.humans.scores, d.length_px));
  const columns: MetricsColumn[] = [
    { key: 'proof', label: 'Proof' },
    { key: 'rank', label: "Mathematicians' rank", short: 'Rank', num: true },
    { key: 'after', label: 'Rank after removing length', short: 'After', num: true },
    { key: 'length', label: 'Length on the page', short: 'Length' },
  ];
  const rows: MetricsRow[] = order.map((p) => ({
    cells: {
      proof: p,
      length: (
        <span className="flex items-center gap-2">
          <span className="w-10 sm:w-24 shrink-0" aria-hidden>
            <span className="block h-2.5 rounded-sm" style={{ width: `${(d.length_px[p] / max) * 100}%`, background: HUMAN }} />
          </span>
          <span className="tabular-nums text-sm">{px(d.length_px[p])}</span>
        </span>
      ),
      rank: <RankCell r={hr[p]} human={undefined} />,
      after: <RankCell r={lr[p]} human={hr[p]} />,
    },
  }));
  const rLen = pearson(order.map((p) => d.length_px[p]), order.map((p) => d.humans.scores[p]));
  return (
    <ChartCard
      id="proofs-length"
      title="How long each proof is, and how that relates to its rank"
      subtitle="Shortest first. Length is the height of the proof's image; every image is the same width."
    >
      <MetricsTable columns={columns} rows={rows} caption="Length of each proof with the mathematicians' rank before and after removing length" />
      <WhatAmI>
        <p>
          <strong>Mathematicians' rank</strong> orders the proofs by the study's scores, 1 being the most explanatory.{' '}
          <strong>Rank after removing length</strong> orders them by how much better or worse each proof scored than its length
          alone predicts. Highlighted cells move 3 or more places.
        </p>
      </WhatAmI>
      <Takeaway>
        Length and the mathematicians' scores correlate at r = {r2(rLen)}: the longer the proof, the lower it tends to score.
      </Takeaway>
    </ChartCard>
  );
};

const LengthStory: React.FC<{ d: ProofsBundle }> = ({ d }) => {
  const rule = shorter(d);
  const order = byLength(d);
  const hr = ranks(d.humans.scores);
  const lr = ranks(leftovers(d.humans.scores, d.length_px));
  const [shortest, second] = order;
  const longest = order[order.length - 1];
  const best = d.proofs.find((p) => hr[p]?.rank === 1);
  const topLeft = d.proofs.find((p) => lr[p]?.rank === 1);
  const rLen = pearson(order.map((p) => d.length_px[p]), order.map((p) => d.humans.scores[p]));
  const nth = (r: Rank | undefined) => (r ? ordinal(r.rank) : '?');
  return (
    <>
      <Section title={'What "shorter" means'}>
        <P>
          I measure a proof's length as the height of its image on the page. Every image is the same width, so a
          taller image means more lines, more steps or a bigger picture. The {shortest} proof is {px(d.length_px[shortest])} tall;
          the {longest} proof is {px(d.length_px[longest])}.
        </P>
        <P>
          Why would shorter explain more? The key idea is that once everything is moved to one side, the equation factors as
          (x − 1)²(x − 4) = 0, so x can only be 1 or 4. The One-line proof says exactly that and stops. The long proofs are long
          for reasons that bury that idea. The Two-column proof lists 16 formal steps with a rule for each. The Visual proof
          draws the factoring as 15 pictures of cubes. The Experimental proof runs Newton's method on a computer and lists the
          results in a table, which shows <em>that</em> the answers are 1 and 4 but not <em>why</em>.
        </P>
        <P>
          So length isn't what makes a proof explain. It's a rough measure of how much stands between the reader and the key
          idea. Across the {word(d.proofs.length)} proofs, length and the mathematicians' scores correlate at r = {r2(rLen)}: the
          longer the proof, the lower it tends to score. It isn't a perfect rule. The {second} proof is the second shortest
          but ranks {nth(hr[second])}
          {best && best !== shortest
            ? `, and the top-ranked proof, ${best}, takes ${px(d.length_px[best])} to show where the factors come from.`
            : '.'}
        </P>
      </Section>
      <Section title="Taking length out">
        <P>
          Because length alone gets so close{rule ? ` (r = ${r2(rule.pearson.value)})` : ''}, a high r doesn't show that a model
          judges explanation. It could just prefer short proofs. So I also check how well a model agrees with the mathematicians
          about the part of each score that length can't account for:
        </P>
        <ol className="list-decimal pl-6 space-y-2 font-beezee text-lg leading-relaxed mb-4">
          <li>
            Fit a straight line through the {word(d.proofs.length)} scores against length. The line gives the score each proof
            would get from its length alone.
          </li>
          <li>
            Keep each proof's leftover: how far above or below the line it lands. A positive leftover means the proof explains
            more than its length suggests.
          </li>
          <li>
            Do the same with the model's scores, then correlate the two sets of leftovers. That correlation is "r after removing
            length."
          </li>
        </ol>
        {topLeft && (
          <P>
            For example, the {topLeft} proof is long ({px(d.length_px[topLeft])}) and the mathematicians rank it{' '}
            {nth(hr[topLeft])}, but that's much better than its length predicts, so it ranks {nth(lr[topLeft])} after removing
            length. The {shortest} proof is the shortest and ranks {nth(hr[shortest])}, but length alone predicts it should do
            even better, so after removing length it falls to {nth(lr[shortest])}.
          </P>
        )}
        {rule && (
          <P>
            A rule that only looks at length has nothing left to match: the shorter-wins rule drops from r ={' '}
            {r2(rule.pearson.value)} to {r2(rule.pearson_controlling_length)}. A model that keeps a high r after removing length
            agrees with the mathematicians about something other than length.
          </P>
        )}
        <ProofLengths d={d} />
      </Section>
    </>
  );
};

// ── Results page ─────────────────────────────────────────────────────────────

type ProofMetric = 'pearson' | 'spearman' | 'length';

const ProofAgreement: React.FC<{ d: ProofsBundle; stats: boolean }> = ({ d, stats }) => {
  const [metric, setMetric] = React.useState<ProofMetric>('pearson');
  const pick = (m: ProofModel | ProofBaseline) =>
    metric === 'length' ? { value: m.pearson_controlling_length, ci_low: null, ci_high: null } : m[metric];
  const models = [...d.models].sort((a, b) => pick(b).value - pick(a).value);
  const rule = shorter(d);
  const rv = rule ? pick(rule) : null;
  const beats = rv ? models.filter((m) => pick(m).value > rv.value) : [];
  const n = models.length;
  const best = Math.max(...models.map((m) => pick(m).value));
  const refs = [
    ...(rv
      ? [
          {
            value: rv.value,
            lo: rv.ci_low,
            hi: rv.ci_high,
            label: `Shorter wins: ${r2(rv.value)}`,
            labelNarrow: `Shorter: ${r2(rv.value)}`,
            anchor: (rv.value > 0.5 ? 'end' : 'start') as 'end' | 'start',
          },
        ]
      : []),
    ...(metric === 'pearson'
      ? [
          {
            value: d.humans.split_half_r,
            label: `Two halves of the mathematicians: ${r2(d.humans.split_half_r)}`,
            labelNarrow: `Two halves: ${r2(d.humans.split_half_r)}`,
            anchor: 'end' as const,
            row: 1 as const,
          },
        ]
      : []),
  ];
  let take: string;
  if (!rv) take = '';
  else if (beats.length === 0) take = `No model beats the "shorter wins" rule (${r2(rv.value)})`;
  else if (beats.length === 1 && n > 1) take = `Only ${beats[0].label} beats the "shorter wins" rule`;
  else if (beats.length === n) take = `Every model beats the "shorter wins" rule (${r2(rv.value)})`;
  else take = `${cap(countOf(beats.length, n))} beat the "shorter wins" rule`;
  if (metric === 'pearson' && best < d.humans.split_half_r) take += ', and no model reaches the agreement between two halves of the mathematicians';
  const metricLabel = { pearson: 'Pearson r', spearman: 'Spearman ρ', length: 'After removing length' }[metric];
  return (
    <ChartCard
      id="proofs-agreement"
      title="How closely each model's proof ranking matches the mathematicians'"
      subtitle={`Bradley-Terry scores from ${range(d.models.map((m) => m.judgements), String)} picks per model, compared with ${panelSize(d) ?? 'the'} mathematicians.`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <MarkLegend
          items={[
            { mark: 'dot', label: 'Models (October 2026)' },
            { mark: 'dash', color: HUMAN, label: 'Reference' },
          ]}
        />
        <Tabs value={metric} onValueChange={(v) => setMetric(v as ProofMetric)}>
          <TabsList className="h-auto flex-wrap justify-start" aria-label="Correlation to show">
            <TabsTrigger value="pearson">Pearson r</TabsTrigger>
            <TabsTrigger value="spearman">Spearman ρ</TabsTrigger>
            <TabsTrigger value="length">After removing length</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <DotWhisker
        rows={models.map((m) => {
          const c = pick(m);
          return { label: m.label, value: c.value, lo: c.ci_low, hi: c.ci_high, color: NEWER, dagger: Boolean(m.settings_note) };
        })}
        domain={[0, 1]}
        ticks={[0, 0.25, 0.5, 0.75, 1]}
        format={rTick}
        references={refs}
        showCI={stats}
        ariaLabel={`${metricLabel} between each model's proof scores and the mathematicians'`}
        describedBy="proofs-metrics-table"
      />
      <SettingsFootnote notes={proofNotes(d)} />
      <WhatAmI>
        <p>
          r is a correlation between the model's nine proof scores and the mathematicians' scores. 1 is a perfect match. The
          "shorter wins" rule always picks the shorter proof. The {r2(d.humans.split_half_r)} line shows how closely two random
          halves of the mathematicians agree with each other.
        </p>
        <p>
          <strong>Spearman ρ</strong> compares only the order of the proofs, not the size of the gaps between them.{' '}
          <strong>After removing length</strong> is r once proof length is taken out of both sets of scores.
        </p>
        <p>{stats ? 'Whiskers and the shaded band are 95% intervals from resampling picks.' : 'Turn on "Show the statistics" for 95% intervals.'}</p>
      </WhatAmI>
      {take && <Takeaway>{take}.</Takeaway>}
    </ChartCard>
  );
};

const RankCell: React.FC<{ r: Rank | undefined; human: Rank | undefined }> = ({ r, human }) => {
  const far = r && human && Math.abs(r.rank - human.rank) >= 3;
  return (
    <span
      className={cn('inline-block min-w-[2.25rem] rounded-md px-1.5 py-0.5 text-center', far && 'bg-amber-100 text-amber-900 font-semibold')}
      title={far ? '3 or more places from the mathematicians' : undefined}
    >
      {rankText(r)}
    </span>
  );
};

const ProofRanks: React.FC<{ d: ProofsBundle }> = ({ d }) => {
  const models = byPearson(d);
  const rule = shorter(d);
  const hr = ranks(d.humans.scores);
  const order = [...d.proofs].sort((a, b) => (hr[a]?.rank ?? 0) - (hr[b]?.rank ?? 0));
  const judges = [
    ...models.map((m) => ({ key: m.slug, label: `${m.label}${m.settings_note ? '†' : ''}`, short: `${shortLabel(m.label)}${m.settings_note ? '†' : ''}`, r: ranks(m.scores) })),
    ...(rule ? [{ key: 'shorter', label: SHORTER, short: 'Shorter', r: ranks(rule.scores) }] : []),
  ];
  const columns: MetricsColumn[] = [
    { key: 'proof', label: 'Proof' },
    { key: 'humans', label: 'Mathematicians', short: 'Math.', num: true },
    ...judges.map((j) => ({ key: j.key, label: j.label, short: j.short, num: true })),
  ];
  const rows: MetricsRow[] = order.map((p) => ({
    cells: {
      proof: p,
      humans: <RankCell r={hr[p]} human={undefined} />,
      ...Object.fromEntries(judges.map((j) => [j.key, <RankCell r={j.r[p]} human={hr[p]} />])),
    },
  }));
  const lower = sharedDisagreement(d, 'lower');
  const first = agreedAt(d, 'top');
  const last = agreedAt(d, 'bottom');
  return (
    <ChartCard
      id="proofs-ranks"
      title="Where each judge ranks the nine proofs"
      subtitle={'Rank 1 explains best. Highlighted cells differ from the mathematicians by 3 or more places; "=" marks a tie.'}
    >
      <MetricsTable columns={columns} rows={rows} caption="Rank of each proof by the mathematicians, each model and the shorter-wins rule" />
      <SettingsFootnote notes={proofNotes(d)} />
      <WhatAmI>
        <p>
          Each column ranks the nine proofs from one judge's Bradley-Terry scores, 1 being the most explanatory. Scores that
          are exactly equal share a rank. I compare ranks rather than raw scores because each fit has its own scale.
        </p>
      </WhatAmI>
      <Takeaway>
        {first && last ? `Every judge puts ${first} first and ${last} last.` : 'The judges disagree even about the top and bottom proofs.'}
        {lower
          ? ` Mathematicians rank ${proofPhrase(lower.proof)} ${ordinal(lower.human)}, and the models rank it ${lower.lo === lower.hi ? ordinal(lower.lo) : `${ordinal(lower.lo)} to ${ordinal(lower.hi)}`}.`
          : ''}
      </Takeaway>
    </ChartCard>
  );
};

const ProofMetrics: React.FC<{ d: ProofsBundle; stats: boolean }> = ({ d, stats }) => {
  const models = byPearson(d);
  const random = d.baselines.find((b) => b.label === 'Random');
  const rC = (c: { value: number; ci_low: number | null; ci_high: number | null }) => (
    <WithCI value={r2(c.value)} lo={c.ci_low == null ? null : r2(c.ci_low)} hi={c.ci_high == null ? null : r2(c.ci_high)} stats={stats} />
  );
  const columns: MetricsColumn[] = [
    { key: 'label', label: 'Model or rule' },
    { key: 'r', label: 'r', num: true },
    { key: 'rho', label: 'Rank r (Spearman)', short: 'Rank r', num: true },
    { key: 'ctrl', label: 'After removing length', short: 'No length', num: true },
    { key: 'r160', label: 'r at 160 picks', short: 'r @160', num: true },
    { key: 'consistent', label: 'Same pick both orders', short: 'Same pick', num: true },
    { key: 'left', label: 'Picks the left proof', short: 'Left', num: true },
    { key: 'invalid', label: 'Invalid', num: true },
  ];
  const rows: MetricsRow[] = [
    ...models.map((m) => ({
      kind: 'model' as const,
      cells: {
        label: `${m.label}${m.settings_note ? '†' : ''}`,
        r: rC(m.pearson),
        rho: rC(m.spearman),
        ctrl: r2(m.pearson_controlling_length),
        r160: r2(m.pearson_at_160),
        consistent: pct(m.order_consistency),
        left: pct(m.left_rate),
        invalid: pct(m.invalid_rate),
      },
    })),
    ...d.baselines.map((b, i) => ({
      kind: 'baseline' as const,
      sepBefore: i === 0,
      cells: { label: b.label, r: rC(b.pearson), rho: rC(b.spearman), ctrl: r2(b.pearson_controlling_length), r160: r2(b.pearson_at_160) },
    })),
    {
      kind: 'human' as const,
      sepBefore: true,
      cells: { label: 'Mathematicians, split in half', r: r2(d.humans.split_half_r) },
    },
    { kind: 'human' as const, cells: { label: 'Two groups of 8 mathematicians', r: r2(d.humans.groups_of_8_r) } },
  ];
  const lefts = models.map((m) => m.left_rate);
  const cons = models.map((m) => m.order_consistency);
  const shortRule = shorter(d);
  const pairs = (d.proofs.length * (d.proofs.length - 1)) / 2;
  return (
    <ChartCard
      id="proofs-table"
      title="Every proof metric"
      subtitle={`Models sorted by r.${stats ? ' Brackets are 95% intervals from resampling picks.' : ''}`}
    >
      <MetricsTable id="proofs-metrics-table" columns={columns} rows={rows} caption="Every proof metric for each model, rule and reference" />
      <SettingsFootnote
        notes={proofNotes(d)}
        extra={random ? `The random rule (r = ${r2(random.pearson.value)}) is one run over ${word(d.proofs.length)} proofs, so its r is noise.` : undefined}
      />
      <WhatAmI>
        <p>
          <strong>r at 160 picks</strong> is the model's r using only 160 picks, which is the size of a panel of 8
          mathematicians. Two panels of 8 mathematicians agree at r = {r2(d.humans.groups_of_8_r)}.
        </p>
        {shortRule && (
          <p>
            Proof length alone correlates r = {r2(shortRule.pearson.value)} with the mathematicians, so compare models using the
            length-removed r as well.
          </p>
        )}
        <p>
          Each model made {pairs} proof pairs × 2 orders × {Math.round((d.models[0]?.judgements ?? 0) / (2 * pairs))} repeats = {range(d.models.map((m) => m.judgements), (x) => x.toLocaleString('en-US'))}{' '}
          picks{d.models.every((m) => m.invalid_rate === 0) ? ', all valid' : ''}. The human scores come from{' '}
          {d.humans.judgements.toLocaleString('en-US')} picks by {panelSize(d) ?? 'the'} mathematicians (Mejía-Ramos et al., 2021).
        </p>
      </WhatAmI>
      <Takeaway>
        {lefts.every((x) => x >= 0.4 && x <= 0.6) ? 'No model has a strong side bias: they' : 'Some models favour one side: they'} pick the
        left proof {range(lefts, (x) => pct(x, 0))} of the time, and they give the same pick in both orders {range(cons, (x) => pct(x, 0))} of
        the time.
      </Takeaway>
    </ChartCard>
  );
};

export const ProofsResultsSection: React.FC = () => {
  const { data: d, error } = useBundle('proofs');
  const [stats] = useShowStats(false);
  const ms = d?.models ?? [];
  return (
    <Section id="proofs" title="Proofs: explanatory value" kicker="Eval 2 · Explanatory proofs" wide>
      {!d ? (
        <Loading error={error} />
      ) : (
        <>
          <P className="max-w-3xl">
            {cap(word(ms.length))} models ranked {word(d.proofs.length)} proofs from {range(ms.map((m) => m.judgements), (x) => x.toLocaleString('en-US'))}{' '}
            picks each. {ms.length > 1 ? 'Every model correlates' : 'The model correlates'} with {panelSize(d) ?? 'the'} mathematicians at r ={' '}
            {range(ms.map((m) => m.pearson.value), r2)}, and at r = {range(ms.map((m) => m.pearson_controlling_length), r2)} once proof
            length is removed.
          </P>
          <ProofAgreement d={d} stats={stats} />
          <ProofRanks d={d} />
          <ProofLengths d={d} />
          <ProofMetrics d={d} stats={stats} />
        </>
      )}
    </Section>
  );
};
