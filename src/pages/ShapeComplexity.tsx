import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ArrowRight, Clock, ListOrdered, Ruler, Users } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../components/ui/chart';

// ── Data (from the thesis and the October 2026 rerun) ─────────────────────────

const THESIS = 'hsl(var(--chart-2))';
const NEWER = 'hsl(var(--chart-1))';

type ModelRow = { model: string; newer: boolean };

const AGREEMENT: (ModelRow & { pct: number })[] = [
  { model: 'Gemini 3.8 Flash', newer: true, pct: 93.6 },
  { model: 'Claude Sonnet 5.5', newer: true, pct: 92.6 },
  { model: 'GPT-6.1-sol', newer: true, pct: 91.9 },
  { model: 'Qwen 3.8 27B', newer: true, pct: 88.5 },
  { model: 'ChatGPT 5.2', newer: false, pct: 87.3 },
  { model: 'Claude Sonnet 4.5', newer: false, pct: 85.8 },
  { model: 'Gemini 2.0 Flash', newer: false, pct: 83.9 },
  { model: 'Grok 4.1 Fast', newer: false, pct: 77.3 },
];

// Average agreement of the four models in each group, per question.
const BY_QUESTION = [
  { question: 'More complex', thesis: 85.4, newer: 92.9 },
  { question: 'Draw from memory', thesis: 81.4, newer: 90.8 },
  { question: 'Cut with scissors', thesis: 83.3, newer: 91.6 },
  { question: 'Trace', thesis: 84.2, newer: 91.3 },
];

// How closely each model's ranking of the 20 apple shapes matches the human ranking (Kendall's tau, 1 = identical).
const APPLES: (ModelRow & { tau: number })[] = [
  { model: 'Gemini 3.8 Flash', newer: true, tau: 0.92 },
  { model: 'GPT-6.1-sol', newer: true, tau: 0.86 },
  { model: 'Claude Sonnet 5.5', newer: true, tau: 0.84 },
  { model: 'Qwen 3.8 27B', newer: true, tau: 0.84 },
  { model: 'Claude Sonnet 4.5', newer: false, tau: 0.76 },
  { model: 'ChatGPT 5.2', newer: false, tau: 0.75 },
  { model: 'Gemini 2.0 Flash', newer: false, tau: 0.72 },
  { model: 'Grok 4.1 Fast', newer: false, tau: 0.57 },
];

// Same score, computed separately for the two apple families (people only compared apples within a family).
const APPLE_FAMILIES: { name: string; data: (ModelRow & { tau: number })[] }[] = [
  {
    name: 'First apple family',
    data: [
      { model: 'Gemini 3.8 Flash', newer: true, tau: 0.96 },
      { model: 'Qwen 3.8 27B', newer: true, tau: 0.87 },
      { model: 'GPT-6.1-sol', newer: true, tau: 0.78 },
      { model: 'Claude Sonnet 5.5', newer: true, tau: 0.76 },
      { model: 'ChatGPT 5.2', newer: false, tau: 0.74 },
      { model: 'Claude Sonnet 4.5', newer: false, tau: 0.73 },
      { model: 'Gemini 2.0 Flash', newer: false, tau: 0.69 },
      { model: 'Grok 4.1 Fast', newer: false, tau: 0.42 },
    ],
  },
  {
    name: 'Second apple family',
    data: [
      { model: 'Claude Sonnet 5.5', newer: true, tau: 0.96 },
      { model: 'Qwen 3.8 27B', newer: true, tau: 0.94 },
      { model: 'Gemini 3.8 Flash', newer: true, tau: 0.91 },
      { model: 'GPT-6.1-sol', newer: true, tau: 0.91 },
      { model: 'Claude Sonnet 4.5', newer: false, tau: 0.85 },
      { model: 'ChatGPT 5.2', newer: false, tau: 0.82 },
      { model: 'Gemini 2.0 Flash', newer: false, tau: 0.77 },
      { model: 'Grok 4.1 Fast', newer: false, tau: 0.74 },
    ],
  },
];

// Share of A-or-B answers that picked the image shown first.
const FIRST_PICK: (ModelRow & { pct: number })[] = [
  { model: 'Gemini 2.0 Flash', newer: false, pct: 58.1 },
  { model: 'ChatGPT 5.2', newer: false, pct: 54.7 },
  { model: 'Claude Sonnet 4.5', newer: false, pct: 52.5 },
  { model: 'Grok 4.1 Fast', newer: false, pct: 51.8 },
  { model: 'Claude Sonnet 5.5', newer: true, pct: 52.1 },
  { model: 'GPT-6.1-sol', newer: true, pct: 51.8 },
  { model: 'Qwen 3.8 27B', newer: true, pct: 50.0 },
  { model: 'Gemini 3.8 Flash', newer: true, pct: 49.3 },
];

// Test pairs with known answers: [correct, total] responses, both image orders.
const CONTROLS = [
  { model: 'Claude Sonnet 5.5', identical: [32, 32], color: [22, 24], size: [0, 12], obvious: [32, 32] },
  { model: 'GPT-6.1-sol', identical: [32, 32], color: [24, 24], size: [1, 12], obvious: [32, 32] },
  { model: 'Gemini 3.8 Flash', identical: [31, 32], color: [7, 24], size: [0, 12], obvious: [32, 32] },
  { model: 'Qwen 3.8 27B', identical: [15, 32], color: [15, 24], size: [0, 12], obvious: [32, 32] },
];
const CONTROL_ROWS: { key: 'identical' | 'color' | 'size' | 'obvious'; label: string; expected: string }[] = [
  { key: 'identical', label: 'Two identical images', expected: 'should say tie' },
  { key: 'color', label: 'Same shape, different color', expected: 'should say tie' },
  { key: 'size', label: 'Same shape, smaller copy', expected: 'should say tie' },
  { key: 'obvious', label: 'Circle vs. detailed insect', expected: 'should pick the insect' },
];

const groupConfig: ChartConfig = {
  thesis: { label: 'Thesis models (early 2026)', color: THESIS },
  newer: { label: 'Newer models (October 2026)', color: NEWER },
};

// ── Small building blocks ─────────────────────────────────────────────────────

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-lg font-beezee leading-relaxed mb-4">{children}</p>
);

const Section: React.FC<{ title: string; kicker?: string; children: React.ReactNode }> = ({ title, kicker, children }) => (
  <FadeIn delay={0.1}>
    <section className="mb-14 max-w-3xl mx-auto">
      {kicker && <div className="text-sm font-semibold tracking-wider uppercase text-navy mb-1">{kicker}</div>}
      <h2 className="text-3xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  </FadeIn>
);

const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-2xl font-semibold mb-3 mt-10">{children}</h3>
);

const Legend2: React.FC = () => (
  <div className="flex flex-wrap gap-4 text-sm font-beezee text-muted-foreground">
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: THESIS }} /> Thesis models (early 2026)
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: NEWER }} /> Newer models (October 2026)
    </span>
  </div>
);

// Horizontal bars, one per model, colored by group.
const ModelBars: React.FC<{
  data: (ModelRow & Record<string, number | string | boolean>)[];
  valueKey: string;
  domain: [number, number];
  format: (v: number) => string;
  reference?: { value: number; label: string };
  label: string;
  heightClass?: string;
}> = ({ data, valueKey, domain, format, reference, label, heightClass = 'h-[340px]' }) => (
  <ChartContainer config={{ [valueKey]: { label } }} className={`aspect-auto ${heightClass} w-full font-beezee`}>
    <BarChart data={data} layout="vertical" margin={{ left: 8, right: 48, top: reference ? 22 : 4, bottom: 4 }}>
      <CartesianGrid horizontal={false} />
      <XAxis type="number" domain={domain} tickFormatter={(v: number) => format(v)} tickLine={false} axisLine={false} />
      <YAxis type="category" dataKey="model" width={130} tickLine={false} axisLine={false} />
      <ChartTooltip cursor={false} content={<ChartTooltipContent valueFormatter={(v) => format(Number(v))} />} />
      {reference && (
        <ReferenceLine
          x={reference.value}
          stroke="hsl(var(--foreground))"
          strokeDasharray="4 4"
          label={{ value: reference.label, position: 'top', fill: 'hsl(var(--foreground))', fontSize: 12 }}
        />
      )}
      <Bar dataKey={valueKey} radius={4} barSize={18} isAnimationActive={false}>
        {data.map((d) => (
          <Cell key={d.model} fill={d.newer ? NEWER : THESIS} />
        ))}
        <LabelList
          dataKey={valueKey}
          position="right"
          className="fill-foreground"
          fontSize={12}
          formatter={(v: number) => format(v)}
        />
      </Bar>
    </BarChart>
  </ChartContainer>
);

const Square: React.FC<{ color: 'red' | 'blue'; tag: string }> = ({ color, tag }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`h-14 w-14 rounded-sm ${color === 'red' ? 'bg-red-500' : 'bg-blue-600'}`} />
    <span className="text-xs text-muted-foreground font-beezee">{tag}</span>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const ShapeComplexity: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <FadeIn>
        <section className="mb-10 text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 font-beezee">Math thesis · rerun October 2026</Badge>
          <h1 className="text-5xl font-bold mb-4">Do AI models see shape complexity the way people do?</h1>
          <p className="text-2xl text-gray-700">
            The experiment from my math thesis, and what changed when I ran it again six months later.
          </p>
        </section>
      </FadeIn>

      {/* At a glance */}
      <FadeIn delay={0.1}>
        <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto mb-16">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-beezee">Best agreement with people</CardDescription>
              <CardTitle className="text-3xl tabular-nums flex items-center gap-2">
                <span className="text-muted-foreground text-xl line-through decoration-1">87.3%</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden />
                93.6%
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-beezee text-muted-foreground">The best thesis model, then the best newer model.</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-beezee">Average agreement with people</CardDescription>
              <CardTitle className="text-3xl tabular-nums flex items-center gap-2">
                <span className="text-muted-foreground text-xl line-through decoration-1">83.6%</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden />
                91.6%
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-beezee text-muted-foreground">
              Average of the four thesis models, then the four newer models. A single person agrees with the group 84.5%
              of the time.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-beezee">Picks the first image</CardDescription>
              <CardTitle className="text-3xl tabular-nums flex items-center gap-2">
                <span className="text-muted-foreground text-xl line-through decoration-1">58%</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden />
                ~50%
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-beezee text-muted-foreground">How often a model picks the image shown first. 50% means order doesn't matter.</CardContent>
          </Card>
        </div>
      </FadeIn>

      <Section title="The question">
        <P>
          A spiky star looks complicated at a glance, and a circle looks simple. People have a strong sense of when one
          shape is more complex than another. My math thesis asked whether AI models that can read images pick the same
          shapes as people, and if they do, whether they notice the same features.
        </P>
        <div className="flex justify-center mt-2">
          <img
            src="/shape-complexity.svg"
            alt="A simple circle next to a spiky star"
            className="w-full max-w-2xl h-auto rounded-lg shadow-lg"
          />
        </div>
      </Section>

      <Section title="The human data">
        <P>
          I started from a study by Bazazian and colleagues, published in 2022. They showed people two black-and-white
          silhouettes at a time and asked four questions about each pair. I used 264 of their pairs, and for each pair
          and question I took the answer most people picked.
        </P>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] sm:grid-cols-4 gap-3">
          {['Which is more complex?', 'Harder to draw from memory?', 'Harder to cut with scissors?', 'Longer to trace?'].map(
            (q) => (
              <Card key={q} className="bg-white/70">
                <CardContent className="p-4 text-base font-beezee">{q}</CardContent>
              </Card>
            )
          )}
        </div>
      </Section>

      <Section title="How I tested the models">
        <P>
          I sent the same 264 pairs and four questions to four AI models through OpenRouter, a service that connects to
          many models with one account: Gemini 2.0 Flash, Claude Sonnet 4.5, ChatGPT 5.2, and Grok 4.1 Fast. Each model
          answered with the shape it thought a typical person would pick, or a tie.
        </P>
        <Card className="bg-white/70">
          <CardHeader>
            <CardTitle className="text-xl">A warning sign before the experiment</CardTitle>
            <CardDescription className="font-beezee text-base">
              I first tried a case with an obvious answer: two identical squares in different colors.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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

      <Section title="What I measured">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, title: 'Agreement', text: 'How often each model picked the same shape as most people.' },
            {
              icon: ListOrdered,
              title: 'Rankings',
              text: 'I turned each judge\'s choices on 20 apple shapes into one list, from simplest to most complex, and compared the lists.',
            },
            {
              icon: Ruler,
              title: 'Features',
              text: 'Each shape has 307 measurements of its outline, inner area, and skeleton. I estimated which ones best predict each judge\'s choices.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <Card key={title} className="bg-white/70">
              <CardHeader className="pb-2">
                <Icon className="h-5 w-5 text-navy mb-2" aria-hidden />
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="font-beezee text-base text-muted-foreground">{text}</CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="What I found">
        <P>
          The thesis models agreed with people 77–87% of the time, and their apple rankings lined up closely with the
          human ranking. But the shape measurements that best predicted their choices matched people's only a little. That
          gap led to the main idea of the thesis: AI models might reach the same answers as people while paying attention
          to different things.
        </P>
      </Section>

      <Section kicker="Follow-up" title="Six months later: what changed?">
        <P>
          AI models improve fast. In October 2026, I repeated the experiment with four newer models: Claude Sonnet 5.5,
          GPT-6.1-sol, Gemini 3.8 Flash, and Qwen 3.8 27B, an open-weight model that anyone can download and run. I used
          the thesis prompt word for word, so differences come from the models and not from new instructions.
        </P>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline" className="font-beezee"><Clock className="h-3 w-3 mr-1" aria-hidden />Same prompt as the thesis</Badge>
          <Badge variant="outline" className="font-beezee">Every pair shown in both orders</Badge>
          <Badge variant="outline" className="font-beezee">14 test pairs with known answers</Badge>
          <Badge variant="outline" className="font-beezee">Compared with one person's answers</Badge>
        </div>

        <H3>The newer models agree with people more often</H3>
        <P>
          All four newer models agreed with people more often than any model from the thesis. Even the open-weight Qwen
          model beat the best thesis model. The dashed line shows how often a single person agrees with everyone else.
        </P>
        <Card className="bg-white/80">
          <CardContent className="pt-6">
            <Tabs defaultValue="model">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <Legend2 />
                <TabsList>
                  <TabsTrigger value="model">By model</TabsTrigger>
                  <TabsTrigger value="question">By question</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="model">
                <ModelBars
                  data={AGREEMENT}
                  valueKey="pct"
                  label="Agrees with people"
                  domain={[0, 100]}
                  format={(v) => `${v.toFixed(1)}%`}
                  reference={{ value: 84.5, label: 'One person: 84.5%' }}
                />
              </TabsContent>
              <TabsContent value="question">
                <ChartContainer config={groupConfig} className="aspect-auto h-[340px] w-full font-beezee">
                  <BarChart data={BY_QUESTION} margin={{ top: 24, right: 8, left: -8, bottom: 4 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="question" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent valueFormatter={(v) => `${v}%`} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="thesis" fill="var(--color-thesis)" radius={4} isAnimationActive={false}>
                      <LabelList dataKey="thesis" position="top" className="fill-foreground" fontSize={11} formatter={(v: number) => `${v}%`} />
                    </Bar>
                    <Bar dataKey="newer" fill="var(--color-newer)" radius={4} isAnimationActive={false}>
                      <LabelList dataKey="newer" position="top" className="fill-foreground" fontSize={11} formatter={(v: number) => `${v}%`} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <p className="text-sm font-beezee text-muted-foreground mt-2">
                  Average of the four models in each group. The newer models gain on every question, and no question
                  stands out as harder for them.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <H3>They agree with the group more than a typical person does</H3>
        <P>
          People don't all agree with each other either. One person's answers match the group about 84.5% of the time.
          All four newer models beat that number, so on this task each model matches the crowd more closely than a
          single person does.
        </P>

        <H3>The apple rankings moved closer to people</H3>
        <P>
          The thesis turned everyone's pair choices on 20 apple shapes into one ranking, from simplest to most complex.
          The newer models' rankings match the human ranking more closely than any thesis model's did.
        </P>
        <Card className="bg-white/80">
          <CardContent className="pt-6">
            <Tabs defaultValue="all">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <Legend2 />
                <TabsList>
                  <TabsTrigger value="all">All 20 apples</TabsTrigger>
                  <TabsTrigger value="family">Each family</TabsTrigger>
                </TabsList>
              </div>
              <p className="text-sm font-beezee text-muted-foreground mb-2">
                How closely each model's ranking matches the human ranking. A score of 1 means the same order, and 0
                means no relationship.
              </p>
              <TabsContent value="all">
                <ModelBars data={APPLES} valueKey="tau" label="Match with human ranking" domain={[0, 1]} format={(v) => v.toFixed(2)} />
              </TabsContent>
              <TabsContent value="family">
                <div className="grid gap-6 sm:grid-cols-2">
                  {APPLE_FAMILIES.map((f) => (
                    <div key={f.name} className="min-w-0">
                      <div className="text-base font-semibold mb-1">{f.name}</div>
                      <ModelBars
                        data={f.data}
                        valueKey="tau"
                        label="Match with human ranking"
                        domain={[0, 1]}
                        format={(v) => v.toFixed(2)}
                        heightClass="h-[300px]"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <P>
          When I reran this, I noticed something the thesis missed. The 20 apples are really two families of 10, each
          built from a different apple outline, and people only compared apples within the same family. That makes one
          combined ranking of all 20 shaky, because nothing says how the two families line up. So I also ranked each
          family on its own. The result holds: in both families, every newer model beats every thesis model, except
          Claude Sonnet 5.5 in the first family, where it's only slightly ahead.
        </P>

        <H3>The "different features" idea didn't hold up</H3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-white/70">
            <CardHeader className="pb-2">
              <Badge variant="warning" className="w-fit font-beezee">Thesis</Badge>
              <CardTitle className="text-lg pt-2">Models seemed to focus on different features</CardTitle>
            </CardHeader>
            <CardContent className="font-beezee text-base text-muted-foreground">
              The measurements that best predicted each model's choices matched the ones that predicted people's choices
              only a little.
            </CardContent>
          </Card>
          <Card className="bg-white/70">
            <CardHeader className="pb-2">
              <Badge variant="success" className="w-fit font-beezee">Recheck</Badge>
              <CardTitle className="text-lg pt-2">The method was too noisy to tell</CardTitle>
            </CardHeader>
            <CardContent className="font-beezee text-base text-muted-foreground">
              I ran the method on two halves of the human data, and the two results barely matched each other. So a weak
              match with a model doesn't mean much. The newer models match people as closely as the two human halves
              match each other.
            </CardContent>
          </Card>
        </div>

        <H3>Image order matters less</H3>
        <Card className="bg-white/80">
          <CardHeader className="pb-0">
            <CardDescription className="font-beezee text-base">
              How often each model picked the image shown first. An unbiased model sits at 50%.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ModelBars
              data={FIRST_PICK}
              valueKey="pct"
              label="Picks the first image"
              domain={[0, 60]}
              format={(v) => `${v.toFixed(1)}%`}
              reference={{ value: 50, label: 'Even split' }}
            />
            <Legend2 />
          </CardContent>
        </Card>
        <p className="text-base font-beezee text-muted-foreground mt-3">
          Even so, when I swapped the two images, the newer models changed 6–8% of their answers.
        </p>

        <H3>Where the models still differ from people</H3>
        <P>
          Each test pair has an answer any person would agree on. Every model got the obvious cases right. The
          identical-image, color, and size cases showed where they differ.
        </P>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTROLS.map((m) => (
            <Card key={m.model} className="bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{m.model}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CONTROL_ROWS.map(({ key, label, expected }) => {
                  const [ok, n] = m[key];
                  const rate = (100 * ok) / n;
                  const variant = rate >= 90 ? 'success' : rate >= 60 ? 'warning' : 'destructive';
                  const bar = rate >= 90 ? 'bg-emerald-600' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-beezee">
                          {label} <span className="text-muted-foreground">({expected})</span>
                        </span>
                        <Badge variant={variant} className="tabular-nums">
                          {ok}/{n}
                        </Badge>
                      </div>
                      <Progress value={rate} indicatorClassName={bar} aria-label={`${label}: ${ok} of ${n} correct`} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
        <ul className="list-disc pl-6 mt-6 space-y-2 text-lg font-beezee leading-relaxed">
          <li>
            Gemini 3.8 Flash called a red or blue copy of a shape more complex than the white original in 17 of 24
            answers, the same effect as the squares before the thesis.
          </li>
          <li>When Qwen saw the same image twice, it picked one as more complex in 17 of 32 answers.</li>
          <li>
            No model called a smaller copy a tie. Claude and GPT usually picked the larger copy, and Gemini and Qwen the
            smaller one. The prompt tells models that people rarely answer "tie", which might push them away from ties.
          </li>
        </ul>
      </Section>

      <Section title="What it means">
        <P>
          In six months, AI models went from agreeing with people most of the time to agreeing with the group more
          closely than a typical person does. On this task, I can no longer tell the models and people apart by what
          they pay attention to. The remaining differences show up in small cases, like a change in color or two
          identical images, where a person would say the shapes are equally complex.
        </P>
        <P>
          A few limits apply. Most of the 264 pairs compare small variations of the same shape, so they don't cover
          every kind of shape. The prompt discourages ties. And the shape images are public online, so future models
          might have seen them during training.
        </P>
      </Section>
    </div>
  );
};

export default ShapeComplexity;
