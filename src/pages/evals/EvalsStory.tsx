import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import FadeIn from '../../components/FadeIn';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/evals/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  ChartCard,
  DotWhisker,
  EvalsNav,
  GroupLegend,
  Loading,
  MoreEvals,
  P,
  Section,
  ShapeTile,
  Takeaway,
  WhatAmI,
  groupColor,
} from '../../components/evals/common';
import { pooledAgreement, shapeLabel, sortByAgreement, useBundle, useShapesAvailable } from '../../lib/evals/data';
import { fmtCI, pct, plainAgreement, useShowStats } from '../../lib/evals/stats';
import type { Pair, RunSummary, Summary } from '../../lib/evals/types';

// Five "more complex" pairs: two the crowd and the models find easy, three where several models
// went against the crowd. All have a clear human majority with 7–10 raters.
const TRY_PAIRS = [80, 132, 4, 135, 193];

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

// ── Try it yourself ──────────────────────────────────────────────────────────

type Choice = 'a' | 'b';

function crowdPick(p: Pair): Choice {
  const [a, b] = p.votes.complex;
  return a > b ? 'a' : 'b';
}

/** Share of models' AB answers (thesis order, all 8 runs) that matched the crowd on these pairs. */
function modelScores(pairs: Pair[], runs: RunSummary[]) {
  return runs.map((r) => {
    const hits = pairs.map((p) => {
      const ans = p.models.complex[r.run_id]?.AB;
      const pick = ans?.answer === 'A' ? 'a' : ans?.answer === 'B' ? 'b' : null;
      return pick === crowdPick(p) ? 1 : 0;
    });
    return { run: r, correct: hits.reduce<number>((a, b) => a + b, 0) };
  });
}

const TryItYourself: React.FC<{ pairs: Pair[]; summary: Summary }> = ({ pairs, summary }) => {
  const available = useShapesAvailable();
  const [answers, setAnswers] = React.useState<Record<number, Choice>>({});
  const [i, setI] = React.useState(0);
  const done = Object.keys(answers).length === pairs.length;
  const p = pairs[Math.min(i, pairs.length - 1)];

  // How often a single rater agreed with the majority on these five pairs.
  const personRate = mean(pairs.map((q) => Math.max(...q.votes.complex) / (q.votes.complex[0] + q.votes.complex[1])));
  const models = modelScores(pairs, summary.runs).sort((a, b) => b.correct - a.correct);
  const mine = pairs.filter((q) => answers[q.pair_id] === crowdPick(q)).length;

  if (!available) {
    return (
      <div>
        <Card className="bg-white/80 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Shape images coming soon</CardTitle>
            <CardDescription className="font-beezee text-base">
              The silhouettes come from Bazazian and colleagues, and I'm waiting for their permission to show them here.
              Until then, here is how people split on the five pairs you would have judged.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {pairs.map((q) => {
            const [a, b] = q.votes.complex;
            const win = a > b ? q.image_a : q.image_b;
            return (
              <Card key={q.pair_id} className="bg-white/70">
                <CardContent className="p-4 font-beezee">
                  <div className="text-sm text-muted-foreground mb-1">Pair {q.pair_id} · more complex?</div>
                  <div className="text-base">
                    <strong>{shapeLabel(q.image_a)}</strong> vs <strong>{shapeLabel(q.image_b)}</strong>
                  </div>
                  <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className="bg-navy" style={{ width: `${(100 * Math.max(a, b)) / (a + b)}%` }} />
                  </div>
                  <div className="mt-1 text-sm">
                    {Math.max(a, b)} of {a + b} people picked <strong>{shapeLabel(win)}</strong>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ModelsOnFive models={models} personRate={personRate} total={pairs.length} />
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <Card className="bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription className="font-beezee text-base">You agreed with the crowd on</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {mine} of {pairs.length} pairs
            </CardTitle>
          </CardHeader>
          <CardContent className="font-beezee text-base">
            On these five pairs, a typical person agreed with the crowd {pct(personRate, 0)} of the time. Three of them are
            pairs where several AI models went the other way.
            <div className="mt-3 flex flex-wrap gap-2">
              {pairs.map((q) => {
                const ok = answers[q.pair_id] === crowdPick(q);
                const [a, b] = q.votes.complex;
                return (
                  <Badge key={q.pair_id} variant={ok ? 'success' : 'warning'} className="font-beezee">
                    Pair {q.pair_id}: {ok ? 'with' : 'against'} the crowd ({Math.max(a, b)}/{a + b})
                  </Badge>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setI(0);
              }}
              className="mt-4 inline-flex items-center gap-1 text-sm text-navy underline"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Try again
            </button>
          </CardContent>
        </Card>
        <ModelsOnFive models={models} personRate={personRate} total={pairs.length} mine={mine} />
      </div>
    );
  }

  const choose = (c: Choice) => {
    setAnswers((s) => ({ ...s, [p.pair_id]: c }));
    setI((n) => n + 1);
  };
  return (
    <Card className="bg-white/80">
      <CardHeader className="pb-2">
        <CardDescription className="font-beezee text-base">
          Pair {Math.min(i, pairs.length - 1) + 1} of {pairs.length}
        </CardDescription>
        <CardTitle className="text-2xl">Which shape is more complex?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <ShapeTile id={p.image_a} onClick={() => choose('a')} caption="This one" />
          <ShapeTile id={p.image_b} onClick={() => choose('b')} caption="This one" />
        </div>
        <p className="mt-3 text-sm font-beezee text-muted-foreground">
          Go with your first impression. Your answers stay in this browser; nothing is sent anywhere.
        </p>
      </CardContent>
    </Card>
  );
};

const ModelsOnFive: React.FC<{
  models: { run: RunSummary; correct: number }[];
  personRate: number;
  total: number;
  mine?: number;
}> = ({ models, personRate, total, mine }) => (
  <Card className="bg-white/70 mt-4">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">The models on the same five pairs</CardTitle>
      <CardDescription className="font-beezee">
        Each model's answer with the images in the original order. A typical person would get about{' '}
        {(personRate * total).toFixed(1)} of {total}.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2 font-beezee">
      {mine !== undefined && (
        <Row label="You" value={mine} total={total} color="#001d36" />
      )}
      {models.map(({ run, correct }) => (
        <Row key={run.run_id} label={run.label} value={correct} total={total} color={groupColor(run.group)} />
      ))}
    </CardContent>
  </Card>
);

const Row: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => (
  <div className="flex items-center gap-3">
    <span className="w-36 shrink-0 text-sm">{label}</span>
    <div className="flex gap-1" aria-label={`${label}: ${value} of ${total}`}>
      {Array.from({ length: total }, (_, k) => (
        <span key={k} className="h-3.5 w-3.5 rounded-full border" style={{ background: k < value ? color : 'transparent', borderColor: color }} />
      ))}
    </div>
    <span className="text-sm tabular-nums">
      {value}/{total}
    </span>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const Square: React.FC<{ color: 'red' | 'blue'; tag: string }> = ({ color, tag }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`h-14 w-14 rounded-sm ${color === 'red' ? 'bg-red-500' : 'bg-blue-600'}`} />
    <span className="text-xs text-muted-foreground font-beezee">{tag}</span>
  </div>
);

const EvalsStory: React.FC = () => {
  const summary = useBundle('summary');
  const pairs = useBundle('pairs');
  const [stats] = useShowStats(false);

  const s = summary.data;
  if (!s || !pairs.data) return <Loading error={summary.error || pairs.error} />;

  const runs = sortByAgreement(s.runs);
  const ceiling = s.human_ceiling_loo;
  const agree = (g: 'thesis' | 'newer') => runs.filter((r) => r.group === g).map((r) => pooledAgreement(r)?.value ?? 0);
  const [thesisBest, newerBest] = [Math.max(...agree('thesis')), Math.max(...agree('newer'))];
  const [thesisMean, newerMean] = [mean(agree('thesis')), mean(agree('newer'))];
  const firstPick = (g: 'thesis' | 'newer') =>
    runs.filter((r) => r.group === g).map((r) => r.metrics[r.native_ordering]?.first_position_rate?.value ?? 0.5);
  const tryPairs = TRY_PAIRS.map((id) => pairs.data!.pairs.find((p) => p.pair_id === id)).filter(Boolean) as Pair[];
  const newerAbove = runs.filter((r) => r.group === 'newer' && (pooledAgreement(r)?.value ?? 0) > (ceiling.value ?? 1)).length;

  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} />
      <FadeIn>
        <section className="mb-10 text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 font-beezee">
            Math thesis · rerun October 2026
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Do AI models see shape complexity the way people do?</h1>
          <p className="text-xl sm:text-2xl text-gray-700">
            Judge five shape pairs yourself, then see how you compare with the crowd and with eight AI models.
          </p>
        </section>
      </FadeIn>

      <Section title="Try it yourself" kicker="Two minutes">
        <TryItYourself pairs={tryPairs} summary={s} />
      </Section>

      <Section title="What I found" wide>
        <p className="text-2xl font-semibold leading-snug mb-6 max-w-3xl mx-auto">
          In six months, AI models went from agreeing with people about as often as one person does to agreeing with the
          crowd more closely than a typical person.
        </p>
        <ChartCard
          title="How often each model picks the same shape as most people"
          subtitle="All 264 pairs and four questions, images in the original order. The dashed line is one person."
        >
          <GroupLegend />
          <DotWhisker
            rows={runs.map((r) => {
              const c = pooledAgreement(r)!;
              return { label: r.label, value: c.value ?? 0, lo: c.ci_low, hi: c.ci_high, color: groupColor(r.group) };
            })}
            domain={[0.6, 1]}
            format={(v) => `${Math.round(100 * v)}%`}
            reference={{
              value: ceiling.value ?? 0,
              lo: ceiling.ci_low,
              hi: ceiling.ci_high,
              label: stats ? `One person: ${fmtCI(ceiling, true)}` : `One person: ${pct(ceiling.value)}`,
            }}
            showCI={stats}
            ariaLabel="Agreement with people for eight models, compared with one person"
          />
          <WhatAmI>
            <p>
              Each dot is one AI model. Its position is the share of answers where the model picked the same shape as most
              of the people who saw that pair. The best newer model {plainAgreement(newerBest)}; the best thesis model{' '}
              {plainAgreement(thesisBest)}.
            </p>
            <p>
              The dashed line is how often one person agrees with everyone else who judged the same pair (
              {pct(ceiling.value)}). People disagree with each other too, so a model above the line matches the crowd more
              closely than a typical person does. Turn on "Show the statistics" for 95% intervals.
            </p>
          </WhatAmI>
          <Takeaway>
            {newerAbove} of 4 newer models sit above the one-person line; no thesis model does.
          </Takeaway>
        </ChartCard>
      </Section>

      <Section title="Three takeaways">
        <div className="grid gap-4">
          {[
            {
              title: 'Models now match the crowd',
              text: `Average agreement went from ${pct(thesisMean)} for the thesis models to ${pct(newerMean)} for the newer ones, on every one of the four questions.`,
              to: '/evals/results#leaderboard',
            },
            {
              title: 'Image order matters less',
              text: `The thesis models picked whichever image came first up to ${pct(Math.max(...firstPick('thesis')))} of the time. The newer models sit near 50%, though swapping the images still changes 6–8% of their answers.`,
              to: '/evals/results#order',
            },
            {
              title: 'Small cases still trip them up',
              text: 'On test pairs with a known answer, models call a recolored or shrunken copy of a shape more complex instead of a tie.',
              to: '/evals/results#controls',
            },
          ].map((t) => (
            <Link key={t.title} to={t.to} className="block">
              <Card className="bg-white/70 transition-colors hover:border-navy">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center justify-between gap-2">
                    {t.title} <ArrowRight className="h-5 w-5 text-navy shrink-0" aria-hidden />
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-beezee text-base text-muted-foreground">{t.text}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="The experiment">
        <P>
          A spiky star looks complicated at a glance, and a circle looks simple. My math thesis asked whether AI models that
          can read images pick the same shapes as people, and if they do, whether they notice the same features.
        </P>
        <P>
          The human data comes from a study by Bazazian and colleagues (2022). People saw two black-and-white silhouettes at a
          time and answered four questions about each pair. I used 264 of their pairs and, for each pair and question, took
          the answer most people picked.
        </P>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] sm:grid-cols-4 gap-3 mb-6">
          {Object.values(s.questions).map((q) => (
            <Card key={q} className="bg-white/70">
              <CardContent className="p-4 text-base font-beezee">{q}</CardContent>
            </Card>
          ))}
        </div>
        <P>
          I asked four AI models the same questions in early 2026, and four newer models in October 2026 with the thesis
          prompt word for word. Before the thesis, one test already showed why the order of the images matters:
        </P>
        <Card className="bg-white/70">
          <CardContent className="grid gap-4 sm:grid-cols-2 pt-6">
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <Square color="red" tag="first" />
              <Square color="blue" tag="second" />
              <div className="font-beezee text-base">
                Model: <strong>blue</strong> is more complex
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <Square color="blue" tag="first" />
              <Square color="red" tag="second" />
              <div className="font-beezee text-base">
                Swapped: now <strong>red</strong> is more complex
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="What it means">
        <P>
          On this task I can no longer tell the newer models and people apart by how often they agree with the crowd, or by
          the shape features that predict their choices. The remaining differences show up in small cases, like a change in
          color or two identical images, where a person would say the shapes are equally complex.
        </P>
        <P>
          A few limits apply. Most pairs compare small variations of the same shape. The prompt discourages ties. And the
          shape images are public online, so future models might have seen them during training.
        </P>
        <div className="flex flex-wrap gap-3">
          <Button to="/evals/results">See all the results</Button>
          <Button to="/evals/notebook" variant="outline">
            Open the lab notebook
          </Button>
        </div>
      </Section>
      <MoreEvals current="shapes" view="story" className="max-w-3xl -mt-8" />
    </div>
  );
};

export default EvalsStory;
