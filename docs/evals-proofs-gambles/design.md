# Proofs and gambles evals: design spec

This spec adds two evals, explanatory proofs and risky gambles, to the existing eval explorer. Each eval gets a chapter on the story page (`/evals`) and a section on the results page (`/evals/results`). The new content goes after the existing shape-complexity content on both pages. This spec adds no new pages and no new design system.

Files in this folder:

| File | What it is |
|---|---|
| `design.md` | This spec |
| `mock-story.html`, `mock-fast.html` | Static mocks built from the real numbers in `public/data/evals/{proofs,gambles}.json` |
| `mock-story-390.png`, `mock-story-1280.png`, `mock-fast-390.png`, `mock-fast-1280.png` | Playwright screenshots of the mocks |
| `copy.md` | Copy from the writer, which replaces the placeholder text in the mocks |

The mocks show the story page with "Show the statistics" **off** and the results page with it **on**, so they show both states. In the mocks, a dashed box stands in for the existing shape content.

---

## 1. Principles carried over from the existing pages

- **Story view** (`EvalsStory.tsx`): narrow narrative (`Section`, `max-w-3xl`). Each chapter has one headline sentence (`text-2xl font-semibold`), then wide chart cards (`Section wide`, `max-w-5xl`). Every chart is followed by a `WhatAmI` and then a `Takeaway`. Statistics are off by default.
- **Fast view** (`EvalsResults.tsx`): one `ChartCard` per question. Controls such as `Tabs` sit at the top right of each card, next to the legend. Every card ends with a `WhatAmI` and a `Takeaway`.
- **Plain words first.** The UI never says "EV", "participant", "predictor", "BT", or "oracle". Use these labels instead:

| Data term | UI label |
|---|---|
| `participant` mode | **Play** |
| `predictor` mode | **Predict** |
| `EV rule` baseline | **Higher-average rule**, or "Pick the higher average" in reference labels |
| `Random` (gambles) | **Coin flip** |
| `Random` (proofs) | **Random**, table only |
| `ceiling.oracle_accuracy` | **Best possible** |
| `pearson_controlling_length` | **After removing length** |
| `groups_of_8_r` | **Mathematicians vs each other** |
| `ev_agreement` | **Picks higher average** |
| `mse` | **Squared error** (results page only) |

- **One switch.** The existing `useShowStats` controls everything that is statistical: CI whiskers, bracketed intervals in tables, and the CI band on the shorter-wins reference.

## 2. Data plumbing

Add these types to `src/lib/evals/types.ts` and add `proofs` and `gambles` to `BundleFiles`. `loadBundleFile` already fetches `${name}.json`, so `useBundle('proofs')` works with no other change.

```ts
type R = { value: number; ci_low: number | null; ci_high: number | null };   // same shape as CI
type ProofScores = Record<string, number>;                                   // proof name -> Bradley-Terry score (mean 0)
interface ProofModel { slug: string; label: string; family: string; model_id: string; settings_note: string | null;
  left_rate: number; order_consistency: number; invalid_rate: number; pearson: R; spearman: R;
  pearson_controlling_length: number; pearson_at_160: number; judgements: number; scores: ProofScores }
interface ProofBaseline { label: 'Shorter wins' | 'Longer wins' | 'Random'; pearson: R; spearman: R;
  pearson_controlling_length: number; pearson_at_160: number; judgements: number; scores: ProofScores }
interface ProofsBundle { eval: 'proofs'; settings: string; proofs: string[];
  humans: { label: string; judgements: number; scores: ProofScores; split_half_r: number; groups_of_8_r: number };
  models: ProofModel[]; baselines: ProofBaseline[]; caveats: string[] }

interface GambleMetrics { majority_accuracy: R; ev_agreement: R; mse: R; pearson_r: R; problems: number }
interface GambleMode extends GambleMetrics { settings_note: string | null; order_consistency: number; first_position_rate: number | null }
interface GambleModel { slug: string; label: string; family: string; participant: GambleMode; predictor: GambleMode;
  predictor_points: { row: number; human: number; model: number }[] }
interface GamblesBundle { eval: 'gambles'; settings: string; condition: string; problems: number;
  ceiling: { oracle_accuracy: number; mse_floor: number };
  published: { label: string; accuracy: number }[];
  models: GambleModel[]; baselines: (GambleMetrics & { label: string })[];
  baselines_all_problems: (GambleMetrics & { label: string })[]; caveats: string[] }
```

Things to note in the data:

- **Proofs have no thesis/newer groups.** All four models are from October 2026. Don't use `GroupLegend` or amber for these models (see §6).
- **Bradley-Terry scales differ.** Human scores span about ±2.7; Gemini's span about ±10. Every per-proof chart **divides each source's scores by that source's population SD** before plotting. The scores already have mean 0, so no centering is needed. The correlations don't change, because r ignores scale. Put this helper in `src/lib/evals/proofs.ts`:

```ts
export const standardize = (s: ProofScores) => { const v = Object.values(s); const sd = Math.sqrt(v.reduce((a, x) => a + x * x, 0) / v.length); return Object.fromEntries(Object.entries(s).map(([k, x]) => [k, x / sd])); };
export const ranks = (s: ProofScores) => /* 1 = highest; tied values share a rank, shown as "6=" */
```

  Claude's Two-column and Visual are tied at −0.562, so the rank table shows both as `6=`.
- **The Qwen settings note is in different places.** In proofs it's on the model (`models[].settings_note`). In gambles it's on the **Predict mode only** (`models[].predictor.settings_note`); Qwen's Play run has no note. Read the note from wherever it lives, and never hard-code it to the model name.
- **Gamble example.** The bundle doesn't include gamble payoffs. The story example uses choices13k **row 225**: A is an 80% chance of $27, otherwise $1; B is an 80% chance of $22, otherwise $5; 66% of 16 people chose A. Models predicted that 22–37% would choose B (`predictor_points` where `row === 225`). Either hard-code a `GAMBLE_EXAMPLE` constant with a comment that cites `datasets/choices13k/problems.csv` row 225, or, better, add an `example` object to `gambles.json` in `export_proofs_gambles.py`.
- **Number formats.** Show correlations with 2 decimals and a Unicode minus: add `fmtR(c, stats)` to `stats.tsx`, mirroring `fmtCI`, so it prints `0.87 [0.85, 0.87]` when statistics are on. Show percentages with the existing `pct` and `fmtCI`: 0 decimals in chart labels, 1 decimal in tables.

## 3. Section order

### Story page (`/evals`), appended after the shape chapter's "What it means"

Leave the shape chapter's two buttons where they are.

1. **`ChapterBreak` "Chapter 2 · Proofs"** (new, `id="proofs"`)
2. `Section` (narrow), kicker "Explanatory proofs", title **"Which proof explains it best?"**
   - Two `P` paragraphs of copy
   - `ProofChips`: the nine proof names in a 3-column grid of the same small `Card`s used for the four shape questions. Show names only, in `proofs[]` order, so the grid doesn't give away the ranking.
3. `Section wide`
   - Headline sentence (`text-2xl font-semibold`, same markup as "What I found")
   - **Chart P1:** `ChartCard` "Where each model places the nine proofs", with `ProofRankDots` and a model selector
   - **Chart P2:** `ChartCard` "Agreement with the mathematicians, before and after length", a dumbbell chart, then `SettingsFootnote`
4. `Section` (narrow): one closing `P`, then `<Button to="/evals/results#proofs">See the proof results</Button>`
5. **`ChapterBreak` "Chapter 3 · Gambles"** (`id="gambles"`)
6. `Section` (narrow), kicker "Risky choices", title **"Would you take this bet?"**
   - `P` with the intro copy
   - `GambleExample` card (new)
   - Two `Card` chips explaining **Play** and **Predict** (`grid sm:grid-cols-2`)
7. `Section wide`
   - Headline sentence
   - **Chart G1:** `ChartCard` "How often each model sides with most people", a Play→Predict dumbbell chart, then `SettingsFootnote`
   - **Chart G2:** `ChartCard` "Predicted versus actual share of people choosing B", with `PredictorScatter`, a model selector, and a KPI readout
8. `Section` (narrow): closing `P`, then `<Button to="/evals/results#gambles">See the gamble results</Button>`

### Results page (`/evals/results`), appended after the existing `Section "The results"`

0. **Jump links:** a row of pill links ("Shapes", "Proofs", "Gambles") right under `EvalsNav`. Use the style `rounded-full border border-border bg-white px-3 py-1 text-sm text-navy`. Add `id="shapes"` to the existing results `Section`. On a page this long, readers who come in from the story buttons need these links.
1. `Section wide id="proofs"`, kicker "Eval 2 · Explanatory proofs", title **"Proofs"**, plus a one-paragraph `P` with the facts (9 proofs, 38 mathematicians, 760 judgements, 720 per model, 0% invalid)
   - **Chart PF1:** `ChartCard id="proofs-agreement"` "Agreement with the mathematicians", using `DotWhisker` with metric `Tabs`
   - **Chart PF2:** `ChartCard id="proofs-ranks"` "Rank of each proof", with `ProofRankTable`
   - **Table PF3:** `ChartCard id="proofs-table"` "Every proof metric", with `MetricsTable`
2. `Section wide id="gambles"`, kicker "Eval 3 · Risky choices", title **"Gambles"**, plus a one-paragraph `P`
   - **Chart GF1:** `ChartCard id="gambles-majority"` "Siding with the majority", using `DotWhisker` with **Predict | Play** `Tabs`
   - **Chart GF2:** `ChartCard id="gambles-scatter"` "Predicted versus actual share choosing B", with four small `PredictorScatter`s
   - **Table GF3:** `ChartCard id="gambles-table"` "Play versus predict, every metric", with `MetricsTable`

The caveats in the JSON go in the `WhatAmI` of the most relevant card, not in a separate box. The pilot subsample caveat and the published-on-full-set caveat go in GF1. The Random-is-noise caveat goes in the PF3 footnote.

## 4. Components

### Reused as they are

| Component | Source | Notes |
|---|---|---|
| `Section`, `P`, `ChartCard`, `WhatAmI`, `Takeaway`, `Loading`, `useWidth` | `components/evals/common.tsx` | |
| `Button` | `components/evals/button.tsx` | |
| `Card*`, `Badge`, `Tabs`/`TabsList`/`TabsTrigger` | `components/ui/` | For selectors with more than 3 options, pass `className="h-auto flex-wrap"` to `TabsList`. The default `h-9` clips wrapped rows at 390px. |
| `useBundle`, `useShowStats`, `pct`, `fmtCI` | `lib/evals/` | |

### `DotWhisker`: backwards-compatible extensions

Charts P2, PF1, G1, and GF1 all use `DotWhisker`, so extend it rather than forking it. Existing call sites keep working unchanged.

```ts
type DotRow = { label; value; lo?; hi?; color; note?;
  from?: number;          // NEW: dumbbell. Draws a hollow marker at `from`, a filled one at `value`, and a 2px line (opacity .55) between them
  marker?: 'dot' | 'diamond';   // NEW: 'diamond' for rules/baselines (shape, not only colour)
  baseline?: boolean;     // NEW: italic label, muted-foreground colour
  gapBefore?: boolean;    // NEW: 10px gap + dotted divider above this row (separates models from rules)
  dagger?: boolean;       // NEW: appends "†" to the label (settings note)
};
references?: Array<{ value: number; label: string; labelNarrow?: string;
  lo?: number; hi?: number; band?: boolean;     // band: always-on shaded range (published models)
  shadeBeyond?: boolean;                         // hatched region from value to domain max ("out of reach")
  row?: 0 | 1; anchor?: 'start' | 'middle' | 'end' }>;   // NEW: stacks labels in two lines so they don't collide
```

- Keep the single `reference` prop as an alias for `references: [reference]`. Add 18px of top padding for each label row in use.
- **Dumbbell value label.** Below 460px, show only the `value`. On desktop, show `from → value`, for example `0.87 → 0.72`. Put the label right of the rightmost marker. If it would overflow, put it left of the leftmost marker. Estimate width as `text.length * 6.5`.
- **Hatch pattern.** Create the `<pattern>` id with `React.useId()`. Several charts render on one page, so a fixed id would collide.

### New components (`src/components/evals/proofs.tsx` and `gambles.tsx`)

| Component | Props | Notes |
|---|---|---|
| `ChapterBreak` | `{ id: string; label: string }` | A full-width `max-w-5xl` row: a hairline (`border-border`), centred small caps text (`font-beezee text-[13px] tracking-widest uppercase text-navy`), another hairline. `mt-16 mb-8`, `scroll-mt-6`. Put it in `common.tsx`. |
| `ProofRankDots` | `{ humans: ProofScores; model: ProofScores; modelLabel: string; isBaseline?: boolean; order: string[] }` | Chart P1, SVG built on `useWidth`. See §5. |
| `ProofModelSelect` | `{ options: {key,label}[]; value; onChange }` | Uses `Tabs`. Options are the 4 models sorted by Pearson r, then "Shorter wins". |
| `ProofRankTable` | `{ data: ProofsBundle }` | Chart PF2. |
| `GambleExample` | `{ example: {row; n; a: {p,hi,lo,ev}; b: {...}; humanShareB: number}; predictions: {label; share}[] }` | Story only. See §5. |
| `PredictorScatter` | `{ points; size?: 'lg' \| 'sm'; label: string }` | Charts G2 and GF2. |
| `ScatterReadout` | `{ mode: GambleMode; points }` | Four KPI tiles: "0.78 correlation with people", "18 of 100 problems on the wrong side of 50%", "82% sides with the majority", "90% same answer with A and B swapped". The number uses `font-patrick text-3xl`; the caption uses `font-beezee text-sm`. |
| `MetricsTable` | `{ columns: {key; label; short?; num?}[]; rows: {cells; kind?: 'model' \| 'baseline' \| 'human'; sepBefore?}[] }` | PF3 and GF3. See §7 for 390px behaviour. |
| `SettingsFootnote` | `{ notes: { label: string; note: string }[] }` | Renders `† {label} ran with {note}. …` in `text-[13px] text-muted-foreground`. Renders nothing when `notes` is empty, so the dagger disappears automatically when a settings note is gone. |

## 5. Charts

Shared rules for every chart:

- Charts are SVG, drawn 1 unit = 1px, with widths from `useWidth`. The existing charts do the same; recharts isn't used here because it can't draw horizontal CI plots or the reference and band labels.
- Gridlines use `hsl(var(--border))`. Ticks are 12px `muted-foreground`. Labels are `#001d36`, 13px (11px below 460px).
- Tooltips use the native `<title>` on each mark, as in `DotWhisker`.

### P1. Where each model places the nine proofs (story)

- **Type:** dot plot with connectors, one row per proof.
- **Rows:** proofs ordered by `humans.scores` descending: Elementary, One-line, Substitution, Contradiction, Contrapositive, Two-column, Taylor series, Visual, Experimental.
- **x:** `standardize(score)`, domain fixed at [−2.4, 2.4] so the chart doesn't shift when the selection changes. The x axis has **no numeric ticks**: put "← Less explanatory" at the left end and "More explanatory →" at the right (shorten to "← Less" and "More →" below 460px). Draw one gridline at 0.
- **Marks:**
  - Mathematicians: filled dot `#001d36`, r 6, with a white 1.5px stroke.
  - Selected model: filled dot, navy (`--chart-1`).
  - "Shorter wins" when selected: diamond in `muted-foreground`.
  - Connector between the two dots: 2px `muted-foreground` at opacity .5. The length of the connector is the disagreement.
- **Legend:** "● Mathematicians (38)" and "● {selected label}", using the same markup as `GroupLegend`.
- **Selector:** `ProofModelSelect`, at the top right on desktop and wrapping under the legend at 390px. The default is the highest-r model, currently **Gemini 3.8 Flash**.
- **Tooltip:** `Contradiction: mathematicians rank it 4 of 9 (BT 0.77)` and `Contradiction: Gemini 3.8 Flash ranks it 6 of 9 (BT −1.26)`.
- **Takeaway:** computed, not hard-coded. "All four models rank the proof by contradiction 6th to 8th; the mathematicians rank it 4th."
- **Alt text and summary:** `aria-label="Where the mathematicians and {model} place each of the nine proofs"`, plus an `sr-only` table with columns proof, mathematicians' rank, and model rank.

### P2. Agreement before and after length (story)

- **Type:** `DotWhisker` with dumbbell rows.
- **Rows:** the 4 models sorted by Pearson r: from = `pearson.value` (hollow), value = `pearson_controlling_length` (filled). Then, after `gapBefore`, the **Shorter wins** row (`baseline`, `marker: 'diamond'`), which goes from 0.85 to 0.09.
- **x:** domain [0, 1], ticks 0, .25, .5, .75, 1.
- **Reference:** `humans.groups_of_8_r` = 0.88, labelled "Mathematicians vs each other: 0.88" (narrow: "Mathematicians: 0.88"), `anchor: 'end'`.
- **Legend:** "○ All proofs as written", "● After removing length", "◆ Shorter-wins rule".
- **Qwen flag:** `dagger` on Qwen's label, plus `SettingsFootnote` under the chart.
- **CIs:** statistics on shows the `pearson` CI as a whisker around the hollow marker. The length-controlled r has no CI in the data, so the filled marker never gets a whisker.
- **Takeaway:** "Picking the shorter proof matches the mathematicians about as well as the best model (r 0.85). Remove length and the rule falls to 0.09, while the models keep 0.62–0.78."

**Why a dumbbell and not a plain r bar with a shorter-wins line:** a plain chart makes the models look no better than a trivial rule. The dumbbell shows that the rule collapses once length is removed and the models don't, which is the real finding. The results page still has the plain version (PF1).

### G1. Play vs Predict, siding with the majority (story)

- **Type:** `DotWhisker` dumbbell.
- **Rows:** models sorted by predictor `majority_accuracy`: from = `participant.majority_accuracy` (hollow, **Play**), value = `predictor.majority_accuracy` (filled, **Predict**).
- **x:** domain [0.6, 0.95], ticks .6, .7, .8, .9, formatted as `pct`.
- **References:** two, with labels stacked:
  - Row 0: EV rule, 0.80, "Pick the higher average: 80%" (narrow: "Higher average: 80%"), `anchor: 'end'`.
  - Row 1: `ceiling.oracle_accuracy`, 0.888, "Best possible: 88.8%", `anchor: 'end'`, `shadeBeyond: true`. The hatched region from 88.8% to the right edge is "out of reach".
- **Qwen flag:** dagger on Qwen. Its note applies to Predict only, and the footnote says "predicted with reasoning effort set to low".
- **CIs:** statistics on shows whiskers on both markers. They overlap heavily, which is honest: on 101 problems the differences are small.
- **Takeaway:** computed. "Three of four models side with the majority more often when predicting than when playing; Qwen is level (79% both ways). All stay below the 88.8% ceiling."

### G2 and GF2. Predicted vs actual share choosing B

- **Type:** square scatter.
- **x:** `predictor_points[].human`, the share of people who chose B, 0–100%.
- **y:** `predictor_points[].model`, the model's predicted share, 0–100%.
- **Marks:** navy dots, `fill-opacity .55`, with a stroke the same colour. r 4 in `lg`, 2.6 in `sm`. 101 points.
- **Reference lines:**
  - Dashed diagonal y = x in `#001d36`, labelled "Perfect prediction" in the legend, not inside the plot, where it would overlap the dots.
  - 50% gridlines drawn slightly heavier (1.5px).
- **"Wrong side of 50%" shading:** the top-left and bottom-right quadrants get `--muted` fill. A dot there means the model predicted the wrong majority, which links the scatter to G1's metric. In `lg`, label both corners "Wrong side of 50%" in 11px `muted-foreground`. A legend swatch repeats the label.
- **Story (G2):** one `lg` scatter, 520px max on desktop, with `ScatterReadout` to its right (`grid-cols-[minmax(0,520px)_1fr]`). At 390px, the scatter is full width with the readout in a 2×2 grid below it.
  - Model selector `Tabs`: the default is **Claude Sonnet 5.5**, which has the lowest squared error (0.027).
  - Axis titles: "Share of people who chose B" and "Model's prediction".
- **Results (GF2):** four `sm` scatters sorted by `predictor.mse`, `grid-cols-4` on desktop and `grid-cols-2` at 390px.
  - Each has a title (with † for Qwen) and a caption: `r 0.78 · squared error 0.027 · wrong side 18/100`.
  - The wrong-side count excludes problems where people split exactly 50/50; there is one.
- **Tooltip:** `Problem 225: 34% of people chose B; predicted 25%`.
- **Takeaway:** computed. "Every model predicts more lopsided splits than people show: further from 50% on 60–79 of the 101 problems." Count the problems where `|model − .5| > |human − .5|`.
- **Alt text:** `aria-label="{model}: predicted versus actual share of people choosing B on 101 problems"`. Behind a "Show the numbers" `<details>` inside `WhatAmI`, add a downloadable CSV using the existing `downloadCsv`. Don't put a 101-row sr-only table here; the readout KPIs and the takeaway carry the summary.

### GF1. Siding with the majority (results)

- **Type:** `DotWhisker`.
- **Tabs:** **Predict** (default) | **Play**.
- **Rows:** 4 models for the selected mode, sorted. Then, after `gapBefore`, "Higher-average rule" (0.80) and "Coin flip" (0.52) as `baseline` rows in `muted-foreground`.
- **x:** domain [0.4, 0.95].
- **References:**
  - A band from 81.4% to 84.8% labelled "Published models‡ 81%–85%" (narrow: "Published‡"), row 0. The band is always on: it is a range of four published numbers, not a CI.
  - Ceiling 88.8%, labelled "Best possible: 88.8%" (narrow: "Best: 88.8%"), row 1, `shadeBeyond`.
- **Footnote:** † for Qwen, plus "‡ Published models (Neural EU, Neural PT, Mixture of theories, Context-dependent net) are scored on the full feedback set, not this subsample." Showing the published models as one band, not four separately labelled rows, avoids implying that they're comparable point by point.

### PF1. Agreement with the mathematicians (results)

- **Type:** `DotWhisker` with the 4 models.
- **Tabs:** **Pearson r** | **Spearman ρ** | **After removing length**.
- **Reference:** the Shorter wins value for the selected metric (0.85, 0.85, or 0.09), labelled "Shorter wins: 0.85". With statistics on, the reference also shows its CI band (`lo` and `hi` from `baselines[0].pearson` or `.spearman`). The length-controlled tab has no CI.
- **x:** domain [0, 1].
- Longer wins (−0.85) and Random (−0.60) appear in PF3 only. A [−1, 1] axis would squash the models.
- **Takeaway:** computed. With Pearson: "Only Gemini 3.8 Flash edges past the shorter-wins rule, and its interval overlaps it."

### PF2. Rank of each proof (results)

- **Type:** table.
- **Rows:** proofs ordered by the mathematicians.
- **Columns:** Mathematicians, then the 4 models by r, then Shorter wins. Cells are ranks 1–9 (`6=` for ties). Below 640px, headers shorten to "Math.", "Gemini", "Claude", "Qwen†", "GPT", "Shorter".
- **Highlight:** a cell that differs from the mathematicians' rank by 3 or more gets `Badge variant="warning"` colours (`bg-amber-100 text-amber-900`, already in `badge.tsx`). This shows Contradiction (8, 7, 8) and Taylor series (4, 4, 2) at a glance.

### PF3 and GF3. Every metric (results)

Use `MetricsTable`. Model rows come first, then baseline rows (italic, `muted-foreground`, divided by a 2px rule), then reference rows.

- **PF3 columns:** Pearson r, Spearman ρ, r after length, Same answer both orders (`order_consistency`), Picks left proof (`left_rate`). Reference rows: "Mathematicians, split in half 0.95" and "Two groups of 8 mathematicians 0.88".
- **GF3 columns:** Mode, Sides with majority, Picks higher average, Squared error, r with people, Same answer both orders. There are two rows per model, Predict then Play, with the model name on the first row only. Reference row: "Best possible (noise ceiling)", with 88.8% and squared error 0.0075.
- **Statistics on:** append intervals as `<span class="text-xs text-muted-foreground">[lo, hi]</span>`.

### GambleExample (story)

- Two option tiles in a `grid-cols-2` grid, at every width. Each tile is `rounded-xl border-2 bg-white p-4`, the same look as `ShapeTile`.
  - Header: "Gamble A" in `text-sm text-muted-foreground`.
  - Odds: "80% chance of $27" in `font-patrick text-2xl`.
  - Then "otherwise $1" and "Average $21.80".
- Make the tiles a **guess-first interaction**, like `TryItYourself`. They are `<button aria-pressed>`, and the reveal shows after a click: a `bg-navy` bar at 66% on `bg-muted`, then "66% of people chose A. Asked to predict, the models said 22%–37% would choose B." The tile the reader picked gets `border-navy ring-2 ring-navy/30`. The mock shows the revealed state with A highlighted.
- Add "Try another" only if the export ships more than one example. Otherwise, there's no reset button.

## 6. Colour and tokens

There are no new tokens. Every colour below already exists in `tailwind.css`, `tailwind.config.js`, or `badge.tsx`.

| Role | Token | Contrast on white |
|---|---|---|
| Models (all four, both evals) | `NEWER` = `hsl(var(--chart-1))` navy #22598f | 7.3:1 |
| Humans (mathematicians, people) | `#001d36` (`--foreground`), already used for "You" in `ModelsOnFive` | 16:1 |
| Rules and baselines (shorter wins, higher-average rule, coin flip) | `hsl(var(--muted-foreground))` #5c6670 with diamond marker and italic label | 5.9:1 |
| Gridlines, dividers | `hsl(var(--border))` | decorative |
| Wrong-side quadrants, tab track | `hsl(var(--muted))` | decorative |
| Rank-table highlight | Badge `warning` (`bg-amber-100 text-amber-900`) | 8.9:1 |

- **Don't use amber (`THESIS`, `--chart-2`) for these evals.** On this page, amber means "thesis models, early 2026", and none of the proofs or gambles models are thesis models.
- **Don't use `--chart-3` for marks.** At about 2.9:1 it fails the 3:1 minimum for non-text graphics.
- Mode and condition are shown by **shape, not colour**: hollow is the first or unadjusted value (Play, raw r), filled is the headline value (Predict, after length), and a diamond is a rule. The same convention holds across P2, G1, and the legends.

## 7. Responsive behaviour

Breakpoints match the existing code: `useWidth() < 460` switches a chart to its narrow layout, and the Tailwind `sm` (640px) breakpoint switches grids.

| Element | 390px (chart width about 308px) | Desktop (1280px; wide card content about 974px) |
|---|---|---|
| Chart labels | `labelW` 112, font 11, `rowH` 26 (same as `DotWhisker`) | `labelW` 150, font 13, `rowH` 30 |
| Dumbbell value labels | Value only (`0.72`) | `0.87 → 0.72` |
| Reference labels | `labelNarrow`, stacked in 2 rows | Full label, stacked if needed |
| P1 axis ends | "← Less" / "More →" | "← Less explanatory" / "More explanatory →" |
| Model selector `Tabs` | Wraps under the legend (`h-auto flex-wrap`) | Top right, next to the legend |
| Proof chips | 3 columns, `text-sm` | 3 columns |
| Gamble tiles | 2 columns (they fit at about 150px each) | 2 columns |
| Play/Predict chips | 1 column | 2 columns |
| G2 scatter | Full width (about 308px square), readout 2×2 below | 520px, readout to the right |
| GF2 small multiples | `grid-cols-2`, about 150px each | `grid-cols-4`, about 220px each |
| Tables | Inside `overflow-x-auto`, with a sticky first column (`sticky left-0 bg-white`), short headers, `px-1.5` cells, and a "Scroll the table sideways for more columns →" hint (`sm:hidden`) | Full table |

The mocks were checked at 390px and 1280px: `scrollWidth` equals the viewport width, so there's no horizontal page scroll.

## 8. Loading, empty, and error states

- **Load each eval's bundle in its own chapter or section component** (`useBundle('proofs')` inside `ProofsChapter`). Don't put it in the page's top-level guard. The shape content must render even if `proofs.json` is slow or missing.
- **Loading:** render the existing `<Loading />` inside the chapter. The look matches the existing pages ("Loading the results…", centred, muted).
- **Error:** render `<Loading error={error} />`, which shows "Couldn't load the results (proofs.json: HTTP 404)." Keep the `ChapterBreak` and the title above it, so the page structure stays the same.
- **Missing pieces:**
  - CI `null`: no whisker. `DotWhisker` already handles this.
  - Empty `predictor_points`: replace the scatter with "No per-problem predictions for this model." in `text-sm text-muted-foreground`.
  - A model without a mode: leave that model out of that mode's tab.
  - No settings notes: `SettingsFootnote` renders nothing.
  - Empty `published`: drop the band.
  - Computed takeaways must handle a different model count. Write "three of four" from counts, never as literal text.

## 9. Accessibility

- **Charts:** every SVG has `role="img"` and an `aria-label` that names what it shows. The story charts also get an `sr-only` summary table: P1 has proof × ranks, P2 has model, r, and r after length, and G1 has model, Play, and Predict. On the results page, the visible tables PF2, PF3, and GF3 serve as the accessible version of the charts above them. Add `aria-describedby` linking each chart to its table.
- **Colour:** no meaning depends on colour alone. Humans are dark and models are navy, and the legend names both. Rules use a diamond and an italic label. Play and Predict differ by hollow and filled markers.
- **Keyboard:** model selectors and metric switches use Radix `Tabs`, which provide arrow-key navigation and `aria-selected`. `GambleExample` tiles are real `<button>`s with `aria-pressed`, and the reveal goes in a `role="status"` region so screen readers announce the result. `WhatAmI` is a native `<details>`. Jump-link pills are links. Every focusable element keeps the existing `focus-visible:ring-2 ring-ring`.
- **Text size:** chart text is never below 11px; table interval text is 12px.
- **Motion:** sections use the existing `FadeIn` through `Section`. Add no other animation.

## 10. Integration checklist

1. Add the types, `fmtR`, `standardize`, and `ranks` (§2).
2. Extend `DotWhisker` (§4) and confirm the five existing charts render pixel-identical.
3. Build `ChapterBreak`, `ProofsChapter`, and `GamblesChapter` for `EvalsStory.tsx`, and `ProofsResults` and `GamblesResults` for `EvalsResults.tsx`.
4. Add the jump links and `id="shapes"`. Check that `/evals/results#proofs` scrolls on navigation, as the existing `#leaderboard` links do.
5. Replace the placeholder copy with `copy.md`. Keep every takeaway computed from the data.
6. Check 390px, 768px, and 1280px with statistics on and off, and check the error state by renaming `proofs.json` locally.
