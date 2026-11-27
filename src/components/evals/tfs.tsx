import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
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
  Takeaway,
  WhatAmI,
  WithCI,
} from './common';
import type { DotReference, DotRow, MetricsColumn, MetricsRow } from './common';
import { useBundle } from '../../lib/evals/data';
import { num, pct, range, useShowStats } from '../../lib/evals/stats';
import type { R, TfsBundle, TfsModel, TfsShare, TfsStudyInfo, TfsStudyKey, TfsVersion } from '../../lib/evals/types';

const VERSIONS: TfsVersion[] = ['canonical', 'isomorph', 'new_numbers', 'deep'];
const ALL: TfsStudyKey[] = [
  'asian_disease',
  'lost_ticket',
  'jacket_calculator',
  'organ_default',
  'anchoring',
  'endowment',
  'loss_aversion',
  'prospect',
  'regret_action',
  'regret_exception',
];
const p0 = (x: number) => pct(x, 0);
const pctTick = (v: number) => `${Math.round(100 * v)}%`;

/** Value format and axis for each kind of measure. */
const AXIS: Record<TfsStudyInfo['kind'], { domain: [number, number]; ticks: number[]; fmt: (v: number) => string }> = {
  effect: { domain: [-100, 100], ticks: [-100, -50, 0, 50, 100], fmt: (v) => num(v, 0) },
  index: { domain: [-2, 1.5], ticks: [-2, -1, 0, 0.5, 1, 1.5], fmt: (v) => num(v, 2) },
  ratio: { domain: [0, 5], ticks: [0, 1, 2, 3, 4, 5], fmt: (v) => num(v, 2) },
  gap: { domain: [0, 100], ticks: [0, 25, 50, 75, 100], fmt: (v) => num(v, 0) },
};

const short = (m: TfsModel) => m.label.replace(/^Claude /, '');
const family = (m: TfsModel) => short(m).replace(/ [\d.]+$/, '');
const row = (m: TfsModel, s: TfsStudyKey, v: TfsVersion) => m.studies.find((r) => r.study === s && r.variant === v);
const human = (d: TfsBundle, s: TfsStudyKey) => d.models.map((m) => row(m, s, 'canonical')?.human).find((h) => h != null) ?? null;
const clamp = (x: number | null | undefined, [a, b]: [number, number]) => (x == null ? x : Math.min(b, Math.max(a, x)));

function references(d: TfsBundle, s: TfsStudyKey): DotReference[] {
  const info = d.studies[s];
  const h = human(d, s);
  const refs: DotReference[] = [];
  if (info.kind === 'gap') refs.push({ value: 0, label: 'Matches people', anchor: 'start' });
  else if (h != null) refs.push({ value: h, label: `People: ${AXIS[info.kind].fmt(h)}`, anchor: 'middle' });
  if (info.null != null && info.null !== h) refs.push({ value: info.null, label: 'No effect', labelNarrow: 'None', row: 1, anchor: 'middle' });
  return refs;
}

// ── Charts ────────────────────────────────────────────────────────────────────

/** One row per model: hollow = original wording, filled = disguised version. */
const StudyDumbbell: React.FC<{ d: TfsBundle; study: TfsStudyKey; stats: boolean }> = ({ d, study, stats }) => {
  const info = d.studies[study];
  const ax = AXIS[info.kind];
  const rows: DotRow[] = d.models.flatMap((m) => {
    const a = row(m, study, 'canonical');
    const b = row(m, study, 'deep');
    if (!a || !b) return [];
    return [
      {
        label: short(m),
        value: clamp(b.value, ax.domain) as number,
        lo: clamp(b.ci_low, ax.domain),
        hi: clamp(b.ci_high, ax.domain),
        from: clamp(a.value, ax.domain),
        fromLo: clamp(a.ci_low, ax.domain),
        fromHi: clamp(a.ci_high, ax.domain),
        color: NEWER,
      },
    ];
  });
  return (
    <DotWhisker
      rows={rows}
      domain={ax.domain}
      ticks={ax.ticks}
      format={ax.fmt}
      references={references(d, study)}
      showCI={stats}
      ariaLabel={`${info.label}: each model on the original wording and the disguised version, against people`}
    />
  );
};

/** Every version for one study, grouped by model. */
const StudyAllVersions: React.FC<{ d: TfsBundle; study: TfsStudyKey; stats: boolean }> = ({ d, study, stats }) => {
  const info = d.studies[study];
  const ax = AXIS[info.kind];
  const rows: DotRow[] = d.models.flatMap((m, i) =>
    VERSIONS.flatMap((v, j) => {
      const r = row(m, study, v);
      if (!r || r.value == null) return [];
      return [
        {
          label: `${short(m)} · ${d.versions[v]}`,
          value: clamp(r.value, ax.domain) as number,
          lo: clamp(r.ci_low, ax.domain),
          hi: clamp(r.ci_high, ax.domain),
          color: NEWER,
          marker: v === 'deep' ? 'diamond' : 'dot',
          gapBefore: i > 0 && j === 0,
        } as DotRow,
      ];
    })
  );
  return (
    <DotWhisker
      rows={rows}
      domain={ax.domain}
      ticks={ax.ticks}
      format={ax.fmt}
      references={references(d, study)}
      showCI={stats}
      ariaLabel={`${info.label}: every model and version, against people`}
    />
  );
};

const ShareDumbbell: React.FC<{
  rows: { label: string; from: TfsShare | { value: number; ci_low: number; ci_high: number } | undefined; to: TfsShare | { value: number; ci_low: number; ci_high: number } | undefined }[];
  stats: boolean;
  aria: string;
}> = ({ rows, stats, aria }) => (
  <DotWhisker
    rows={rows
      .filter((r) => r.to && r.to.value != null)
      .map((r) => ({
        label: r.label,
        value: r.to!.value as number,
        lo: r.to!.ci_low,
        hi: r.to!.ci_high,
        from: r.from?.value ?? null,
        fromLo: r.from?.ci_low ?? null,
        fromHi: r.from?.ci_high ?? null,
        color: NEWER,
      }))}
    domain={[0, 1]}
    ticks={[0, 0.25, 0.5, 0.75, 1]}
    format={pctTick}
    showCI={stats}
    ariaLabel={aria}
  />
);

const DumbbellLegend: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <MarkLegend
    className="mb-2"
    items={[
      { mark: 'hollow', label: from },
      { mark: 'dot', label: to },
    ]}
  />
);

// ── The cases and their wording ───────────────────────────────────────────────

const CONDITION_LABEL: Record<string, string> = {
  gain: 'Described as lives saved',
  loss: 'Described as lives lost',
  cash: 'Lost the cash',
  ticket: 'Lost the ticket',
  cheap: 'Saving on the cheap item',
  expensive: 'Saving on the expensive item',
  opt_in: 'Not pre-selected',
  opt_out: 'Pre-selected',
  seller: 'Owner, selling',
  buyer: 'Non-owner, buying',
  low: 'Low number',
  high: 'High number',
};

/** "Haiku 0 · Sonnet 0 · Opus 0" for one study and version. */
function modelLine(d: TfsBundle, s: TfsStudyKey, v: TfsVersion): string {
  const f = AXIS[d.studies[s].kind].fmt;
  return d.models
    .map((m) => {
      const r = row(m, s, v);
      return r && r.value != null ? `${family(m)} ${f(r.value)}` : null;
    })
    .filter(Boolean)
    .join(' · ');
}

/** One collapsible card per study: the question, the effect, what people and models did. */
const CaseCards: React.FC<{ d: TfsBundle }> = ({ d }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {ALL.map((s) => {
      const info = d.studies[s];
      const h = human(d, s);
      return (
        <details key={s} className="group rounded-xl border border-border bg-white/70 px-4 py-3 font-beezee">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-2">
            <span>
              <span className="block text-base font-semibold">{info.label}</span>
              <span className="block text-sm text-muted-foreground">{info.effect}</span>
            </span>
            <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-navy transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <dl className="mt-3 space-y-2 text-sm leading-relaxed">
            <div>
              <dt className="font-semibold text-navy">The question</dt>
              <dd>{info.asked}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">What people did</dt>
              <dd>
                {info.people} <span className="text-muted-foreground">({info.source})</span>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">What the models did</dt>
              <dd>
                <span className="block text-muted-foreground">{info.measure}{info.kind !== 'gap' && h != null ? `; people ${AXIS[info.kind].fmt(h)}` : ''}.</span>
                {(['canonical', 'deep'] as TfsVersion[]).map((v) => (
                  <span key={v} className="block">
                    <span className="font-semibold">{d.versions[v]}:</span> {modelLine(d, s, v)}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </details>
      );
    })}
  </div>
);

/** Words of `text` that aren't in `base` (longest common subsequence over words), for highlighting. */
function changedWords(base: string, text: string): { w: string; changed: boolean }[] {
  const a = base.split(/\s+/);
  const b = text.split(/\s+/);
  const L = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: { w: string; changed: boolean }[] = [];
  let i = 0;
  let j = 0;
  while (j < b.length) {
    if (i < a.length && a[i] === b[j]) {
      out.push({ w: b[j], changed: false });
      i++;
      j++;
    } else if (i < a.length && L[i + 1][j] >= L[i][j + 1]) i++;
    else out.push({ w: b[j++], changed: true });
  }
  return out;
}

const Diffed: React.FC<{ base?: string; text: string }> = ({ base, text }) =>
  base === undefined || base === text ? (
    <>{text}</>
  ) : (
    <>
      {changedWords(base, text)
        .reduce<{ w: string; changed: boolean }[]>((runs, t) => {
          const last = runs[runs.length - 1];
          if (last && last.changed === t.changed) last.w += ` ${t.w}`;
          else runs.push({ ...t });
          return runs;
        }, [])
        .map((t, k) => (
          <React.Fragment key={k}>
            {k > 0 && ' '}
            {t.changed ? <mark className="rounded bg-amber-100 px-0.5 text-[#001d36]">{t.w}</mark> : t.w}
          </React.Fragment>
        ))}
    </>
  );

const EXAMPLE_STUDIES: TfsStudyKey[] = ['asian_disease', 'lost_ticket', 'organ_default', 'prospect'];

/** The actual prompts for one study in every version; words that differ from the original are highlighted. */
const PromptExplorer: React.FC<{ d: TfsBundle }> = ({ d }) => {
  const [study, setStudy] = React.useState<TfsStudyKey>('asian_disease');
  const [version, setVersion] = React.useState<TfsVersion>('canonical');
  const byVersion = d.wording[study] ?? {};
  const versions = VERSIONS.filter((v) => byVersion[v]);
  const v = byVersion[version] ? version : 'canonical';
  const prompts = byVersion[v] ?? [];
  const original = byVersion.canonical ?? [];
  const change = d.studies[study].changes[v];
  return (
    <ChartCard title="The actual questions" subtitle="Pick a study and a version. Highlighted words differ from the original wording.">
      <div className="mb-2 overflow-x-auto">
        <Tabs value={study} onValueChange={(x) => setStudy(x as TfsStudyKey)}>
          <TabsList aria-label="Study" className="flex-wrap h-auto">
            {EXAMPLE_STUDIES.map((s) => (
              <TabsTrigger key={s} value={s}>
                {d.studies[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mb-4 overflow-x-auto">
        <Tabs value={v} onValueChange={(x) => setVersion(x as TfsVersion)}>
          <TabsList aria-label="Version" className="flex-wrap h-auto">
            {versions.map((x) => (
              <TabsTrigger key={x} value={x}>
                {d.versions[x]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <p className="mb-3 font-beezee text-sm">
        <span className="font-semibold">{v === 'canonical' ? 'The original wording.' : 'What changed:'}</span>{' '}
        {v === 'canonical' ? `${d.studies[study].source}.` : change}
      </p>
      <div className={cn('grid gap-3', prompts.length > 1 && 'sm:grid-cols-2')}>
        {prompts.map((w, k) => {
          const base = v === 'canonical' ? undefined : original.find((o) => o.condition === w.condition) ?? original[0];
          return (
            <Card key={k} className="bg-white/70">
              <CardContent className="p-4 font-beezee text-sm leading-relaxed">
                {w.condition && <div className="mb-2 text-base font-semibold">{CONDITION_LABEL[w.condition] ?? w.condition}</div>}
                <p className="mb-2">
                  <Diffed base={base?.stem} text={w.stem} />
                </p>
                {w.option_a && (
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <span className="font-semibold text-[#001d36]">A:</span> <Diffed base={base?.option_a} text={w.option_a} />
                    </li>
                    <li>
                      <span className="font-semibold text-[#001d36]">B:</span> <Diffed base={base?.option_b} text={w.option_b} />
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <WhatAmI>
        <p>
          Each card is one prompt, sent on its own in a fresh conversation. Where a study compares two conditions, each model saw
          only one of them per call, and the options were shown in both orders.
        </p>
      </WhatAmI>
    </ChartCard>
  );
};

/** Full-width block for chart cards between narrow narrative sections. */
const Wide: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="max-w-5xl mx-auto mb-14">{children}</div>;

// ── Story ─────────────────────────────────────────────────────────────────────

const recognized = (m: TfsModel, v: TfsVersion) => m.probe[v]?.value ?? null;
const ext = 'text-navy underline underline-offset-2';

export const TfsStoryBody: React.FC = () => {
  const { data: d, error } = useBundle('tfs');
  const [stats] = useShowStats(false);
  return (
    <>
      <EvalHero badge="Eval 4 · Thinking, Fast and Slow" title="Do AI models choose like people?">
        Claude models look most human on the famous textbook versions of these studies, largely because they know them. Disguise
        the questions and most of the human patterns disappear.
      </EvalHero>
      <div className="max-w-3xl mx-auto mb-14">
        <P>
          In my <Link to="/evals/gambles" className={ext}>gambles eval</Link>, models mostly picked the gamble with the higher
          average payout instead of choosing like people. Here I took ten famous studies of choice from Part IV of Daniel
          Kahneman's <em>Thinking, Fast and Slow</em>, plus the anchoring study, and asked three Claude models the same questions
          the original participants answered.
        </P>
        {d && (
          <P>
            This is an exploratory pilot: Claude Haiku, Sonnet and Opus 5.5, {d.questions} questions, 6 answers per question, and
            ${d.cost_usd.toFixed(2)} in API cost.
          </P>
        )}
      </div>
      {!d ? (
        <Loading error={error} />
      ) : (
        <>
          <Section title="How I asked the models">
            <P>
              Each model answered every question as a survey participant, in a fresh call that showed only one condition, the way
              each original participant saw only one. Every question ran 3 times, with the two options in both orders, and the
              answers were scored against the published human results.
            </P>
            <P>To separate reasoning from memory, each study came in four versions:</P>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              {(
                [
                  ['canonical', 'The wording from the original paper.'],
                  ['isomorph', 'The same structure and numbers in a new story, such as factory jobs instead of a disease.'],
                  ['new_numbers', 'The same structure with changed amounts.'],
                  ['deep', 'The same effect with no textbook signature: an orchard blight, a pre-checked towel box on a gym form, a library locker number as the anchor.'],
                ] as [TfsVersion, string][]
              ).map(([v, t]) => (
                <Card key={v} className="bg-white/70">
                  <CardContent className="p-4 font-beezee">
                    <div className="text-base font-semibold">{d.versions[v]}</div>
                    <div className="text-sm text-muted-foreground">{t}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <P className="text-base text-muted-foreground">
              Only the original wordings have measured human data. The other versions assume people would answer the same way.
            </P>
          </Section>
          <Section title="The cases">
            <P>
              Each study puts people in a small, everyday situation where most of them lean the same way. Open a card to see the
              question, what the effect is, what people did and what the models did.
            </P>
          </Section>
          <Wide>
            <CaseCards d={d} />
          </Wide>
          <Section title="What the models actually read">
            <P>
              Here are the real prompts for four of the studies, in all four versions. The reworded and new-number versions keep
              most of the original's telltale details, such as 600 lives split into thirds. The disguised version changes the
              setting, the numbers and the probabilities but keeps the choice the same.
            </P>
          </Section>
          <Wide>
            <PromptExplorer d={d} />
          </Wide>
        </>
      )}
      {d && <ChapterBreak id="findings" label="The results" />}
      {d && <TfsFindings d={d} stats={stats} />}
      {d && (
        <Section title="What to be careful about">
          <ul className="list-disc pl-6 space-y-3 font-beezee text-lg leading-relaxed mb-6">
            {d.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <P>
            Earlier work found that reasoning biases faded in newer models (
            <a href="https://www.nature.com/articles/s43588-023-00527-x" className={ext}>
              Hagendorff, Fabi and Kosinski, 2023
            </a>
            ) and that GPT-3's answers to these vignettes broke under small changes (
            <a href="https://arxiv.org/abs/2206.14576" className={ext}>
              Binz and Schulz, 2023
            </a>
            ). This pilot adds the original-versus-disguise contrast and a recognition check, which show how much a human-like
            answer depends on memory.
          </P>
          <P>
            Next: a confirmation run with 15 to 20 answers per question and three disguises per effect, a check with other
            reasoning settings, and human data on the disguised questions, which would make the comparison fully fair.
          </P>
          <div className="flex flex-wrap gap-3">
            <Button to="/evals/choices/results">See every study</Button>
            <Button to="/evals/gambles" variant="outline">
              Back to the gambles eval
            </Button>
          </div>
        </Section>
      )}
    </>
  );
};

const TfsFindings: React.FC<{ d: TfsBundle; stats: boolean }> = ({ d, stats }) => {
  const orig = d.models.map((m) => recognized(m, 'canonical')).filter((x): x is number => x != null);
  const deep = d.models.map((m) => recognized(m, 'deep')).filter((x): x is number => x != null);
  const gaps = d.models.flatMap((m) => VERSIONS.filter((v) => v !== 'deep').map((v) => row(m, 'prospect', v)?.value ?? NaN)).filter((x) => !Number.isNaN(x));
  const opus = d.models.find((m) => m.slug.includes('opus'));
  const v = (s: TfsStudyKey, ver: TfsVersion) => (opus ? row(opus, s, ver) : undefined);
  const diff = (s: TfsStudyKey, label: string) => opus?.diffs.find((x) => x.study === s && x.diff === label);
  const f0 = (r?: R) => (r ? `${num(r.value, 0)}${stats && r.ci_low != null ? ` [${num(r.ci_low, 0)}, ${num(r.ci_high, 0)}]` : ''}` : '—');
  return (
    <>
      <Section title="1. The models know the studies">
        <P>
          Sonnet and Opus recognized every textbook question, including the reworded versions. Rewording a story is not enough to
          hide a classic study from them. Only the deep disguises lowered recognition, and even then the models often named the
          original type of study.
        </P>
      </Section>
      <Wide>
        <ChartCard title="Do the models recognize the question?" subtitle="Share of questions a model says it has seen in published research">
          <DumbbellLegend from={d.versions.canonical} to={d.versions.deep} />
          <ShareDumbbell
            rows={d.models.map((m) => ({ label: short(m), from: m.probe.canonical, to: m.probe.deep }))}
            stats={stats}
            aria="Share of questions each model recognizes, original wording vs disguised"
          />
          <WhatAmI>
            <p>
              After the main run, I showed each model every question again and asked whether it had seen it before, and where. The
              hollow circle is the original wording; the filled circle is the disguised version.
            </p>
            <p>Opus cited most of the gamble problems by their number in the 1979 paper, and traced the factory-jobs version back to the Asian disease problem.</p>
            <p>
              For example, all three models named the Asian disease problem as the source of the orchard-blight question, even
              though it has no disease, no 600 and no thirds.
            </p>
          </WhatAmI>
          <Takeaway>
            The models recognize {range(orig, p0)} of the original questions. Disguising them brings that down to {range(deep, p0)},
            not to zero.
          </Takeaway>
        </ChartCard>
        <ChartCard title="Do they name the study while answering?" subtitle="Share of answers that mention a researcher, a study or an effect, unprompted">
          <DumbbellLegend from="Other versions" to={d.versions.deep} />
          <ShareDumbbell
            rows={d.models.map((m) => ({ label: short(m), from: m.awareness.first, to: m.awareness.deep }))}
            stats={stats}
            aria="Share of answers that name a study, other versions vs disguised"
          />
          <WhatAmI>
            <p>
              This counts answers that say things like "Tversky and Kahneman", "framing effect", "classic" or "sunk cost" while
              answering as a survey participant. It comes from a keyword search, so it's approximate.
            </p>
          </WhatAmI>
          <Takeaway>
            Knowing a study mostly pushes the models away from the human answer: they spot the trap and answer the same way in
            both frames. Re-scoring with only the answers that never name a study left the main results unchanged.
          </Takeaway>
        </ChartCard>
      </Wide>

      <Section title="2. No mental-accounting or default effects">
        <P>
          The most consistent result in the pilot is a null. People are far more willing to buy a ticket after losing cash than
          after losing the ticket itself, and they tend to keep whatever box comes pre-checked. For every model, on almost every
          version, the gap was zero.
        </P>
      </Section>
      <Wide>
        {(['lost_ticket', 'organ_default'] as TfsStudyKey[]).map((s) => (
          <ChartCard key={s} title={d.studies[s].label} subtitle={d.studies[s].measure}>
            <DumbbellLegend from={d.versions.canonical} to={d.versions.deep} />
            <StudyDumbbell d={d} study={s} stats={stats} />
            <WhatAmI>
              <p>{d.studies[s].people}</p>
              <p>
                Each row is a model: the hollow circle is its effect on the original wording, the filled circle on the disguised
                version. "No effect" means it answered the same way in both conditions.
              </p>
            </WhatAmI>
          </ChartCard>
        ))}
        <Takeaway>
          In the gym-form version, the $4-a-month towel box was already checked in one set of calls and unchecked in another,
          and every model made the same choice either way. In the climbing-gym version, losing $45 in cash and booking the $45
          pass for the wrong day led to the same answer. This held for the gym towel box, which no model recognized as a known study, and in answers that never mentioned a
          study. So it doesn't look like test-dodging: the models treat money as money, whatever account it came from, and aren't
          moved by which option is pre-selected.
        </Takeaway>
      </Wide>

      <Section title="3. Gambles don't follow the human pattern">
        <P>
          On Kahneman and Tversky's 1979 gamble problems, the models' choices sat {range(gaps, (x) => num(x, 0))} points away from
          people's, and further away as the questions got less familiar. The disguised version has two gambles: a sure $480 store
          credit against a 90% chance of $560, and the same as a bill to pay. People typically take the sure thing for gains and
          gamble on losses. Haiku and Opus did the opposite on both, taking the higher average every time.
        </P>
      </Section>
      <Wide>
        <ChartCard title={d.studies.prospect.label} subtitle={d.studies.prospect.measure}>
          <DumbbellLegend from={d.versions.canonical} to={d.versions.deep} />
          <StudyDumbbell d={d} study="prospect" stats={stats} />
          <WhatAmI>
            <p>
              For each problem I compare the share of a model's answers that picked option A with the share of people who did,
              then average the gaps. Zero would mean the model splits exactly like people.
            </p>
            <p>
              The original problem offered an 80% chance of $4,000 or $3,000 for sure; 80% of people took the sure $3,000. The
              disguised one offers a hotel store credit: a 90% chance of $560 or $480 for sure. The gamble is worth slightly more
              on average in both.
            </p>
          </WhatAmI>
          <Takeaway>
            The closer match on the textbook gambles seems to come partly from knowing the textbook. With nothing to recall, the
            models fall back on the higher average.
          </Takeaway>
        </ChartCard>
      </Wide>

      <Section title="The other studies">
        <P>
          Both regret studies matched people closely for all three models. Owning something raised the price the models would
          sell it for, and they wanted to win more than they could lose, but both effects were weaker than in people. The
          results page has every study and version.
        </P>
      </Section>

      <Section title="Leads to confirm">
        <P>
          Two Claude Opus results hold up within their intervals, but each rests on a single scenario with 6 answers per
          condition. They're worth a confirmation run, not a claim yet.
        </P>
      </Section>
      <Wide>
        <ChartCard title="Opus's framing effect collapses when disguised" subtitle={d.studies.asian_disease.measure}>
          <DumbbellLegend from={d.versions.canonical} to={d.versions.deep} />
          <StudyDumbbell d={d} study="asian_disease" stats={stats} />
          <WhatAmI>
            <p>{d.studies.asian_disease.people}</p>
            <p>
              Opus's effect is {f0(v('asian_disease', 'canonical'))} points on the original wording, {f0(v('asian_disease', 'isomorph'))}{' '}
              on the factory-jobs version and {f0(v('asian_disease', 'deep'))} on the orchard version. The drops are{' '}
              {f0(diff('asian_disease', 'canonical - isomorph'))} and {f0(diff('asian_disease', 'canonical - deep'))} points.
            </p>
          </WhatAmI>
          <Takeaway>
            On the original wording, Opus flipped completely between frames, twice the human effect. This is the clearest sign of a
            model reproducing the famous human answer rather than reasoning its way to it.
          </Takeaway>
        </ChartCard>
        <ChartCard title="Opus shows a strong relative-savings effect when disguised" subtitle={d.studies.jacket_calculator.measure}>
          <DumbbellLegend from={d.versions.canonical} to={d.versions.deep} />
          <StudyDumbbell d={d} study="jacket_calculator" stats={stats} />
          <WhatAmI>
            <p>{d.studies.jacket_calculator.people}</p>
            <p>
              In the disguised version, the saving is $10 on a $30 case or on a $1,200 laptop, a 15-minute walk away.
            </p>
          </WhatAmI>
          <Takeaway>
            Opus would walk to save $10 on the case but not on the laptop: {f0(v('jacket_calculator', 'deep'))} points, against
            people's 39. On the textbook version it was {f0(v('jacket_calculator', 'canonical'))}.
          </Takeaway>
        </ChartCard>
        <P className="max-w-3xl mx-auto">
          Not supported: Opus anchoring on the locker number and Haiku's selling-to-buying ratio for the poster. Both intervals
          include the human value and no effect at all.
        </P>
      </Wide>
    </>
  );
};

// ── Results ───────────────────────────────────────────────────────────────────

const StudyExplorer: React.FC<{ d: TfsBundle; stats: boolean }> = ({ d, stats }) => {
  const [study, setStudy] = React.useState<TfsStudyKey>('asian_disease');
  const info = d.studies[study];
  return (
    <ChartCard title={info.label} subtitle={`${info.measure}. People: ${info.source}.`}>
      <div className="mb-3 overflow-x-auto">
        <Tabs value={study} onValueChange={(v) => setStudy(v as TfsStudyKey)}>
          <TabsList aria-label="Study" className="flex-wrap h-auto">
            {ALL.map((s) => (
              <TabsTrigger key={s} value={s}>
                {d.studies[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <MarkLegend
        className="mb-2"
        items={[
          { mark: 'dot', label: 'Original, reworded or new numbers' },
          { mark: 'diamond', label: d.versions.deep },
        ]}
      />
      <StudyAllVersions d={d} study={study} stats={stats} />
      <WhatAmI>
        <p>{info.people}</p>
        <p>
          Only the original wording has measured human data; the other versions are compared with the same human value. Turn on
          "Show the statistics" for 95% intervals (bootstrap over each model's answers).
        </p>
      </WhatAmI>
    </ChartCard>
  );
};

const StudyTable: React.FC<{ d: TfsBundle; stats: boolean }> = ({ d, stats }) => {
  const columns: MetricsColumn[] = [
    { key: 'study', label: 'Study' },
    { key: 'people', label: 'People', num: true },
    ...d.models.flatMap((m) => [
      { key: `${m.slug}:canonical`, label: `${short(m)}, original`, short: `${short(m)} orig.`, num: true },
      { key: `${m.slug}:deep`, label: `${short(m)}, disguised`, short: `${short(m)} disg.`, num: true },
    ]),
  ];
  const rows: MetricsRow[] = ALL.map((s) => {
    const info = d.studies[s];
    const h = human(d, s);
    const cells: Record<string, React.ReactNode> = {
      study: info.label,
      people: info.kind === 'gap' ? '0' : h == null ? '—' : AXIS[info.kind].fmt(h),
    };
    for (const m of d.models)
      for (const v of ['canonical', 'deep'] as TfsVersion[]) {
        const r = row(m, s, v);
        cells[`${m.slug}:${v}`] = r ? (
          <WithCI
            value={AXIS[info.kind].fmt(r.value)}
            lo={r.ci_low == null ? null : AXIS[info.kind].fmt(r.ci_low)}
            hi={r.ci_high == null ? null : AXIS[info.kind].fmt(r.ci_high)}
            stats={stats}
          />
        ) : (
          '—'
        );
      }
    return { cells };
  });
  return <MetricsTable columns={columns} rows={rows} caption="Every study: people, and each model on the original and disguised versions" />;
};

const ModelTable: React.FC<{ d: TfsBundle; stats: boolean }> = ({ d, stats }) => {
  const share = (s: { value: number | null; ci_low: number | null; ci_high: number | null } | undefined) =>
    s && s.value != null ? (
      <WithCI value={p0(s.value)} lo={s.ci_low == null ? null : p0(s.ci_low)} hi={s.ci_high == null ? null : p0(s.ci_high)} stats={stats} />
    ) : (
      '—'
    );
  const columns: MetricsColumn[] = [
    { key: 'model', label: 'Model' },
    { key: 'rec_c', label: 'Recognizes: original', short: 'Rec. orig.', num: true },
    { key: 'rec_i', label: 'Recognizes: reworded', short: 'Rec. rew.', num: true },
    { key: 'rec_d', label: 'Recognizes: disguised', short: 'Rec. disg.', num: true },
    { key: 'aw_f', label: 'Names the study: other versions', short: 'Names, other', num: true },
    { key: 'aw_d', label: 'Names the study: disguised', short: 'Names, disg.', num: true },
    { key: 'first', label: 'Picks the first option', short: 'First opt.', num: true },
    { key: 'invalid', label: 'Unreadable answers', short: 'Unreadable', num: true },
  ];
  const rows: MetricsRow[] = d.models.map((m) => ({
    cells: {
      model: m.label,
      rec_c: share(m.probe.canonical),
      rec_i: share(m.probe.isomorph),
      rec_d: share(m.probe.deep),
      aw_f: share(m.awareness.first),
      aw_d: share(m.awareness.deep),
      first: m.first_position_rate == null ? '—' : p0(m.first_position_rate),
      invalid: m.invalid_rate == null ? '—' : pct(m.invalid_rate, 1),
    },
  }));
  return <MetricsTable columns={columns} rows={rows} caption="Recognition, naming the study, position bias and unreadable answers by model" />;
};

export const TfsResultsSection: React.FC = () => {
  const { data: d, error } = useBundle('tfs');
  const [stats] = useShowStats(false);
  return (
    <Section id="choices" title="Choices: Thinking, Fast and Slow" kicker="Eval 4 · Thinking, Fast and Slow" wide>
      {!d ? (
        <Loading error={error} />
      ) : (
        <>
          <P className="max-w-3xl">
            Ten studies from the book, each in four versions, asked of {d.models.map(short).join(', ')}. {d.settings}
          </P>
          <StudyExplorer d={d} stats={stats} />
          <ChartCard title="Every study at a glance" subtitle="Each model on the original wording and on the disguised version">
            <StudyTable d={d} stats={stats} />
          </ChartCard>
          <ChartCard title="How the models answered" subtitle="Recognition, naming the study, and answer quality">
            <ModelTable d={d} stats={stats} />
            <Takeaway>
              Every answer could be read, and the models picked the first-listed option about half the time, so the order of the
              options didn't drive the results.
            </Takeaway>
          </ChartCard>
          <ul className="list-disc pl-6 space-y-2 font-beezee text-sm leading-relaxed text-muted-foreground max-w-3xl">
            {d.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
};
