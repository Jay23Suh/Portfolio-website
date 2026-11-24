# Copy: proofs and gambles evals

Copy for two new evals. Every number comes from `public/data/evals/proofs.json` or
`public/data/evals/gambles.json`. Where copy shows a number, the JSON field it comes from is in
brackets so the integrator can compute it instead of hard-coding it. Remove the brackets before
shipping.

Voice matches the shape-complexity pages: first person ("I"), short sentences, sentence-case
headings, one idea per paragraph, and a plain-words definition the first time a metric shows up.

---

## 1. Story view (`/evals`, after "What it means")

### Bridge

**Section title:** Two new kinds of judgment

The shapes asked a question that anyone can answer at a glance. I wanted to know if the same
approach works when the judgment takes expertise, or when people are known to be inconsistent. So I
ran two more evals with the same structure: real people made choices between two options, AI
models saw the same choices, and I measured how closely the models match the people. The first
eval asks which proof explains more. The second asks which gamble someone would take.

---

### Chapter A: Proofs

**Section title:** Which proof explains better?
**Kicker:** Eval 2 · mathematicians

**Hook:** Nine proofs can show that the same theorem is true, but some also show *why* it's true.
Do AI models agree with mathematicians about which proofs do that best?

#### What the humans did

In a study by Mejía-Ramos and colleagues (2021), 38 mathematicians saw two proofs of the same
theorem at a time and picked the one that explained more. Together they made 760 picks
[`humans.judgements`]. The study then turned those picks into one score per proof with a
*Bradley-Terry* fit. Bradley-Terry is a standard way to turn many "A beat B" picks into a single
ranking. A proof that wins often, especially against strong proofs, scores high.

The mathematicians agreed with each other closely. When the panel is split into two random halves,
the halves' scores correlate at r = 0.95 [`humans.split_half_r`]. Here r is a correlation: 1
means two lists of scores line up perfectly, and 0 means they have nothing to do with each other.

#### What the proofs look like

Every proof shows the same proposition: if x³ − 6x² + 11x − 6 = 2x − 2, then x = 1 or x = 4.
Here's how six of the nine do it, in the order the mathematicians ranked them. (These are my
summaries. The proofs themselves are from Philip Ording's book *99 Variations on a Proof*.)

Cards (rank and length computed from `humans.scores` and `length_px`; text in `PROOF_SKETCHES`
in src/components/evals/proofs.tsx):
- **Elementary**: moves everything to one side, splits 9x into 5x + 4x so a common factor of
  (x − 1) appears, factors the leftover quadratic. x³ − 6x² + 9x − 4 = (x² − 5x + 4)(x − 1) = (x − 4)(x − 1)(x − 1).
- **One-line**: moves everything to one side and states the factored form. x³ − 6x² + 9x − 4 = (x − 1)²(x − 4) = 0.
- **Contradiction**: checks 1 and 4, supposes a third solution, divides out (x − 1), (x − 4), (x − 1) and reaches 1 = 0.
- **Two-column**: the Elementary factoring as 16 numbered statements, each with a reason.
- **Visual**: 15 pictures of slabs added to and cut from a cube until it's a box with sides (x − 1), (x − 1), (x − 4).
- **Experimental**: Newton's method from two starts, 15 steps each in a table, plus a thousand random starts;
  convincing, but never shows why there's no other solution.

Licensing: the typeset proof images must not be published (datasets/explanatory-proofs/dataset.yaml),
so the page uses these summaries, not the images.

#### How I asked the models

Each model saw all 36 pairs of the nine proofs as images, in both left-right orders, 10 times
each. That's 720 picks per model [`models[].judgements`], and every pick was a valid answer. I
fit Bradley-Terry to each model's picks the same way the study did for the mathematicians, and
then correlated the model's scores with theirs.

There's one catch. Short proofs tend to explain better, so a rule that always picks the shorter
proof already gets r = 0.85 [`baselines["Shorter wins"].pearson.value`]. The next two sections
explain what "shorter" means here and how I take it out.

#### What "shorter" means

All nine proofs show the same thing: if x³ − 6x² + 11x − 6 = 2x − 2, then x = 1 or x = 4. They
differ in how. I measure a proof's length as the height of its image on the page. Every image is
the same width, so a taller image means more lines, more steps or a bigger picture. The One-line
proof is 196 px tall; the Visual proof is 1,190 px [`length_px`].

Why would shorter explain more? The key idea is that once everything is moved to one side, the
equation factors as (x − 1)²(x − 4) = 0, so x can only be 1 or 4. The One-line proof says exactly
that and stops. The long proofs are long for reasons that bury that idea. The Two-column proof
lists 16 formal steps with a rule for each. The Visual proof draws the factoring as 15 pictures
of cubes. The Experimental proof runs Newton's method on a computer and lists the results in a
table, which shows *that* the answers are 1 and 4 but not *why*.

So length isn't what makes a proof explain. It's a rough measure of how much stands between the
reader and the key idea. Across the nine proofs, length and the mathematicians' scores correlate
at r = −0.86 [computed: `length_px` vs `humans.scores`]: the longer the proof, the lower it tends
to score. It isn't a perfect rule. The Contradiction proof is the second shortest but ranks 4th,
and the top-ranked proof, Elementary, takes 524 px to show where the factors come from.

#### Taking length out

Because length alone gets so close (r = 0.85), a high r doesn't show that a model judges
explanation. It could just prefer short proofs. So I also check how well a model agrees with the
mathematicians about the part of each score that length can't account for:

1. Fit a straight line through the nine scores against length. The line gives the score each
   proof would get from its length alone.
2. Keep each proof's leftover: how far above or below the line it lands. A positive leftover
   means the proof explains more than its length suggests.
3. Do the same with the model's scores, then correlate the two sets of leftovers. That
   correlation is "r after removing length."

For example, the Two-column proof is long (1,073 px) and the mathematicians rank it 6th, but
that's much better than its length predicts, so it ranks 1st after removing length. The One-line
proof is the shortest and ranks 2nd, but length alone predicts it should do even better, so after
removing length it falls to 8th [computed: ranks of `leftovers(humans.scores, length_px)`].

A rule that only looks at length has nothing left to match: the shorter-wins rule drops from
r = 0.85 to 0.09. A model that keeps a high r after removing length agrees with the
mathematicians about something other than length.

Table `proofs-length` (story and results pages): one row per proof, shortest first, with the
mathematicians' rank, their rank after removing length, and the length in pixels.

#### What I found

1. **Every model ranks the proofs a lot like mathematicians do.** The r values with the
   mathematicians run from 0.71 for GPT-6.2 Sol to 0.87 for Gemini 3.8 Flash
   [`models[].pearson.value`]. *Chart: `proofs-agreement`.*

2. **Length explains most of that agreement.** The "shorter wins" rule gets r = 0.85, which is
   above three of the four models. Once length is taken out, the rule falls to r = 0.09, and the
   models keep r = 0.62 to 0.78 [`models[].pearson_controlling_length`]. So each model sees
   something beyond length. *Chart: `proofs-length`.*

3. **The ranking changes once length is removed.** Gemini 3.8 Flash scores highest overall but
   falls from 0.87 to 0.72. Claude Sonnet 5.5 barely changes, going from 0.78 to 0.78 (0.7813 to
   0.7761). Claude Sonnet 5.5 is the model that best matches the mathematicians on something
   other than length. *Chart: `proofs-length`.*

4. **Every model ranks one proof much lower than the mathematicians do.** The mathematicians rank
   the proof by contradiction 4th of 9. Every model ranks it between 6th and 8th
   [`humans.scores`, `models[].scores`]. All four models agree with the mathematicians about the
   top proof (Elementary) and the bottom proof (Experimental). *Chart: `proofs-ranks`.*

#### What to be careful about

- With only nine proofs, a single proof that moves up or down changes r a lot. A rule that picks
  at random came out at r = −0.60 [`baselines["Random"].pearson.value`], from a single run. That
  number is noise, not a sign that picking at random goes against the mathematicians.
- Qwen 3.8 27B ran with low reasoning effort. At the default setting, it spent all of its
  4,096-token budget thinking and never gave an answer.
- Each model's 720 picks come from repeating the same 36 pairs. The 760 human picks come from 38
  different people. The two sets of scores have the same form, but they don't come from the same
  kind of source.

---

### Chapter B: Gambles

**Section title:** Which gamble would you take?
**Kicker:** Eval 3 · risky choices

**Hook:** Offered a sure $10 or a 50% chance at $25, people don't simply pick the option with the
bigger average payoff. Can AI models predict what people actually choose?

#### What the humans did

The choices13k study (Peterson and colleagues, 2021) showed many people pairs of gambles and
asked which one they would take. For each problem, the data records the share of people who chose
gamble B. Earlier researchers built models that predict those choices, and the best ones pick the
same option as most people 81% to 85% of the time [`published[].accuracy`]. People are also
inconsistent: because each problem had a limited number of people, even a perfect predictor would
match the majority only about 89% of the time [`ceiling.oracle_accuracy`].

#### How I asked the models

I used 101 of the 1,928 problems described in words, and chose them so they cover the full range
from lopsided to evenly split [`problems`]. Each model did the task in two ways:

- **As a participant:** the model picks a gamble itself. It saw each problem in both orders, 5
  times each. I count how often it picks B.
- **As a predictor:** the model says what share of people chose B.

I compared both modes against two simple rules. The *EV rule* always picks the gamble with the
higher expected value (EV), which is the average payout if you played the gamble many times. The
random rule picks either gamble at random.

#### What I found

1. **As participants, the models are more EV-minded than people are.** Most people chose the
   higher-EV gamble on 80% of problems [`baselines["EV rule"].majority_accuracy.value`]. When the
   models choose for themselves, they pick it 83% to 89% of the time
   [`models[].participant.ev_agreement.value`]. *Chart: `gambles-ev`.*

2. **Predicting people beats being one.** As predictors, the models match the majority on 79% to
   83% of problems. As participants they reach 74% to 80% [`models[].predictor.majority_accuracy`,
   `models[].participant.majority_accuracy`]. With only 101 problems, however, neither mode is
   clearly better than the EV rule's 80%. *Chart: `gambles-accuracy`.*

3. **The bigger gain is in the share, not the side.** The models' predicted shares correlate with
   the real shares at r = 0.78 to 0.81, compared with 0.64 for the EV rule
   [`models[].predictor.pearson_r.value`, `baselines["EV rule"].pearson_r.value`]. Their
   predictions are more extreme than people are: they call a problem lopsided when people are
   closer to evenly split. *Chart: `gambles-scatter`.*

4. **There's still room to improve.** No model reaches the 89% that a perfect predictor would get
   on these problems. *Chart: `gambles-accuracy`.*

#### What to be careful about

- This is a pilot of 101 problems, so every percentage here has a margin of about ±7 points. On
  these 101 problems, the EV rule matches 80% of majorities. On all 1,928 problems it matches 74%
  [`baselines_all_problems["EV rule"].majority_accuracy.value`], so this sample is easier than
  the full set.
- The published 81% to 85% comes from a different set of problems, where people saw the outcomes
  of their choices. It's a rough reference point, not a direct comparison.
- Qwen 3.8 27B ran with low reasoning effort for the predictor task. At the default setting, it
  ran out of tokens on 98% of problems. Its participant run used the default setting.

---

## 2. Fast view (`/evals/results`)

### Proofs

**Section heading:** Proofs: explanatory value
**Anchor id:** `proofs`
**One-line summary:** Four models ranked nine proofs from 720 picks each. Every model correlates
with 38 mathematicians at r = 0.71 to 0.87, and at r = 0.62 to 0.78 once proof length is removed.

**Headline stats** (r with mathematicians · r with length removed · same pick in both orders)

| Model | r | r, length removed | Same pick both orders |
|---|---|---|---|
| Gemini 3.8 Flash | 0.87 | 0.72 | 96% |
| Claude Sonnet 5.5 | 0.78 | 0.78 | 87% |
| Qwen 3.8 27B¹ | 0.73 | 0.62 | 86% |
| GPT-6.2 Sol | 0.71 | 0.72 | 89% |
| *Shorter wins (rule)* | *0.85* | *0.09* | — |

Fields: `pearson.value`, `pearson_controlling_length`, `order_consistency`.

#### Chart `proofs-agreement`: agreement with mathematicians

- **Title:** How closely each model's proof ranking matches the mathematicians'
- **Subtitle:** Bradley-Terry scores from 720 picks per model, compared with 38 mathematicians.
- **X axis:** Correlation with the mathematicians (r)
- **Y axis:** Model
- **Reference lines:** "Shorter wins: 0.85" · "Two halves of the mathematicians: 0.95"
- **Explainer (WhatAmI):** r is a correlation between the model's nine proof scores and the
  mathematicians' scores. 1 is a perfect match. The "shorter wins" rule always picks the shorter
  proof. The 0.95 line shows how closely two random halves of the mathematicians agree with each
  other.
- **Takeaway:** Only Gemini 3.8 Flash beats the "shorter wins" rule, and no model reaches the
  agreement between two halves of the mathematicians.

#### Chart `proofs-length`: with and without length

- **Title:** Agreement before and after removing proof length
- **Subtitle:** Each line joins a model's r (left dot) to its r once length is removed from both
  sets of scores (right dot).
- **X axis:** Correlation with the mathematicians (r)
- **Y axis:** Model, plus the "shorter wins" rule
- **Legend:** "All agreement" · "Length removed"
- **Takeaway:** The "shorter wins" rule drops to 0.09. Claude Sonnet 5.5 doesn't change, and
  Gemini 3.8 Flash's lead disappears.

#### Chart `proofs-ranks`: rank of each proof

- **Title:** Where each judge ranks the nine proofs
- **Subtitle:** Rank 1 explains best. Each line is one judge.
- **X axis:** Judge (Mathematicians, then the four models)
- **Y axis:** Rank (1 to 9)
- **Takeaway:** Every judge puts Elementary first and Experimental last. Mathematicians rank the
  proof by contradiction 4th, and the models rank it 6th to 8th.

#### Table `proofs-table`: full numbers

| Column label | Field |
|---|---|
| Model | `label` |
| r | `pearson.value` (95% CI `ci_low`–`ci_high` when the statistics are shown) |
| Rank r (Spearman) | `spearman.value` |
| r, length removed | `pearson_controlling_length` |
| r at 160 picks | `pearson_at_160` |
| Picks the left proof | `left_rate` |
| Same pick both orders | `order_consistency` |
| Invalid | `invalid_rate` |

- **Takeaway:** No model has a strong side bias: they pick the left proof 50% to 54% of the time,
  and they give the same pick in both orders 86% to 96% of the time.
- **"r at 160 picks" explainer:** The model's r using only 160 picks, which is the size of a
  panel of 8 mathematicians. Two panels of 8 mathematicians agree at r = 0.88
  [`humans.groups_of_8_r`].

#### Footnotes (proofs)

1. Qwen 3.8 27B ran with low reasoning effort. At the default setting, it used all 4,096 tokens
   on reasoning and gave no answer.
2. Proof length alone correlates r = 0.85 with the mathematicians, so compare models using the
   length-removed r as well.
3. The random rule (r = −0.60) is one run over nine proofs, so its r is noise.
4. Each model made 36 proof pairs × 2 orders × 10 repeats = 720 picks, all valid. The human
   scores come from 760 picks by 38 mathematicians (Mejía-Ramos et al., 2021).

---

### Gambles

**Section heading:** Gambles: predicting risky choices
**Anchor id:** `gambles`
**One-line summary:** On 101 choices13k problems, models predicting people match the majority on
79% to 83% of problems. That's below the 89% a perfect predictor could reach, and not clearly
above the EV rule's 80%.

**Headline stats** (predictor mode: majority match · r with real shares; participant mode:
majority match · picks higher EV)

| Model | Predictor: matches majority | Predictor: r | Participant: matches majority | Participant: picks higher EV |
|---|---|---|---|---|
| GPT-6.2 Sol | 83% | 0.79 | 74% | 83% |
| Claude Sonnet 5.5 | 82% | 0.78 | 76% | 84% |
| Gemini 3.8 Flash | 81% | 0.81 | 80% | 88% |
| Qwen 3.8 27B¹ | 79% | 0.80 | 79% | 89% |
| *EV rule* | *80%* | *0.64* | — | *100%* |
| *Random* | *52%* | *−0.07* | — | *51%* |

Fields: `predictor.majority_accuracy.value`, `predictor.pearson_r.value`,
`participant.majority_accuracy.value`, `participant.ev_agreement.value`. The EV-rule and random
rows come from `baselines[]`.

#### Chart `gambles-accuracy`: matching the majority

- **Title:** How often each model sides with most people
- **Subtitle:** 101 problems. Each model appears twice: choosing (participant) and predicting
  (predictor).
- **X axis:** Matches the human majority (%)
- **Y axis:** Model × mode
- **Reference lines:** "EV rule: 80%" · "Perfect predictor: 89%" · "Random: 52%"
- **Shaded band:** "Published models, different problem set: 81% to 85%"
- **Explainer (WhatAmI):** A model matches the majority when the side it favors (above or below
  50% for B) is the side most people chose. Problems that people split exactly evenly are left
  out. The perfect predictor knows each problem's true choice rate. It still misses some problems,
  because each one had a limited number of people.
- **Takeaway:** Predicting does better than choosing for three of the four models. Every interval
  overlaps the EV rule's 80%.

#### Chart `gambles-scatter`: predicted versus real share

- **Title:** Predicted versus real share choosing B
- **Subtitle:** One dot per problem. Predictor mode, averaged over both orders.
- **X axis:** Share of people choosing B
- **Y axis:** Model's predicted share choosing B
- **Small multiples:** One panel per model, with a diagonal line for a perfect prediction.
- **Takeaway:** The predictions track the real shares (r = 0.78 to 0.81) but are more extreme
  than people's choices.

#### Chart `gambles-ev`: choosing the higher average payout

- **Title:** How often the choice goes to the higher-EV gamble
- **Subtitle:** Participant mode, 101 problems. Problems where the two gambles have equal EV are
  left out.
- **X axis:** Picks the higher-EV gamble (%)
- **Y axis:** Model
- **Reference line:** "Most people: 80%"
- **Takeaway:** When the models choose for themselves, they pick the higher-EV gamble more often
  than most people do.

#### Table `gambles-table`: full numbers

| Column label | Field (under `participant` or `predictor`) |
|---|---|
| Model | `label` |
| Mode | `participant` / `predictor` |
| Matches majority | `majority_accuracy.value` (CI `ci_low`–`ci_high` when the statistics are shown) |
| Picks higher EV | `ev_agreement.value` |
| Error (MSE) | `mse.value` |
| r with real share | `pearson_r.value` |
| Same side both orders | `order_consistency` |
| Picks first option | `first_position_rate` (participant only; predictor shows "—") |

- **Takeaway:** The predicted shares have errors of 0.027 to 0.041 [`predictor.mse.value`],
  compared with 0.16 for the EV rule. The best possible error, given the noise in the human data,
  is 0.0075 [`ceiling.mse_floor`].
- **"Error (MSE)" explainer:** The average squared gap between the model's share and the real
  share. 0 is perfect. A participant's share is built from its own repeated choices, so it tends
  to sit near 0% or 100%, which is why participant MSE is much higher (0.13 to 0.19).

#### Footnotes (gambles)

1. Qwen 3.8 27B ran with low reasoning effort in predictor mode. At the default setting, 98% of
   its answers were invalid because it ran out of tokens. Its participant run used the default
   setting.
2. This is a pilot of 101 of the 1,928 problems described in words, chosen to cover the full range
   of human choice rates. On all 1,928 problems the EV rule matches the majority 74% of the time,
   compared with 80% here.
3. Participant mode: the model makes the choice itself (2 orders × 5 repeats). Predictor mode: it
   predicts the share of people choosing B (2 orders × 1 repeat).
4. The published model accuracies (Peterson et al., 2021) were measured on the full set of
   problems where people saw the outcomes of their choices, not on this sample.
5. Invalid answers: 0% for every final run except Qwen 3.8 27B as a participant (0.5%).

---

## 3. Chart list

| id | View | Type | What it plots (exact JSON fields) |
|---|---|---|---|
| `proofs-agreement` | Story (finding 1) + Fast | Dot-whisker | `proofs.models[].pearson.{value,ci_low,ci_high}` per `label`. Reference lines: `baselines[label="Shorter wins"].pearson.value`, `humans.split_half_r`. |
| `proofs-length` | Story (findings 2–3) + Fast | Dumbbell | Per `models[]` and `baselines[label="Shorter wins"]`: `pearson.value` → `pearson_controlling_length`. |
| `proofs-ranks` | Story (finding 4) + Fast | Bump or slope chart | Ranks 1–9 computed from `humans.scores` and each `models[].scores` (sort descending). The keys are the names in `proofs.proofs`. Don't plot raw scores on one axis, because each Bradley-Terry fit has its own scale. Claude Sonnet 5.5 has an exact tie (Two-column = Visual = −0.562), so show it as a shared rank. |
| `proofs-table` | Fast | Table | `models[]`: `label`, `pearson`, `spearman`, `pearson_controlling_length`, `pearson_at_160`, `left_rate`, `order_consistency`, `invalid_rate`. Footer rows from `baselines[]`. Note: `humans.groups_of_8_r`. |
| `gambles-accuracy` | Story (findings 2, 4) + Fast | Dot-whisker, 8 rows | `gambles.models[].{participant,predictor}.majority_accuracy.{value,ci_low,ci_high}`. References: `baselines[label="EV rule"].majority_accuracy.value`, `baselines[label="Random"].majority_accuracy.value`, `ceiling.oracle_accuracy`. Band: min–max of `published[].accuracy`. |
| `gambles-scatter` | Story (finding 3) + Fast | Scatter, small multiples | `gambles.models[].predictor_points[]` with x = `human` and y = `model` (101 points; `row` is the problem id for tooltips). Panel caption: `predictor.pearson_r.value`. |
| `gambles-ev` | Story (finding 1) + Fast | Dot-whisker | `gambles.models[].participant.ev_agreement.{value,ci_low,ci_high}`. Reference: `baselines[label="EV rule"].majority_accuracy.value` (the share of problems where most people chose the higher-EV gamble). |
| `gambles-table` | Fast | Table | For each `models[]` × {`participant`,`predictor`}: `majority_accuracy`, `ev_agreement`, `mse`, `pearson_r`, `order_consistency`, `first_position_rate`, `settings_note`. Footer: `baselines[]`, `ceiling.mse_floor`. Optional row: `baselines_all_problems[]`. |

## 4. Revision: reading the gambles scatter (Nov 24)

Both scatter cards (`gambles-predictions` on the story page, `gambles-scatter` on the results page)
are retitled "How well each model predicts the split between two gambles" and open with a
plain-language key (`ReadingTheScatter` in src/components/evals/gambles.tsx):
- What A and B are: the two gambles in each problem, labelled as in the original study; the letters
  carry no meaning. One number (share who picked B) describes the whole split.
- What one dot is: actual share who picked B (across) vs the model's predicted share (up); dashed line
  = perfect; shaded corners = wrong majority.
- A worked example on the `example` problem, with its dot ringed in every panel.
Jargon replaced: "squared error" → "typical miss N points" (√MSE in percentage points); "wrong side
of 50%" → "wrong majority"; "more lopsided" → "expects people to agree more than they do".

## 5. Revision: more gamble problems (Nov 24)

New section "More problems people faced" on the gambles story page, after "How I asked the models"
(`GambleProblems` in src/components/evals/gambles.tsx), from `examples` in gambles.json. Five problems,
each picked by a fixed rule in `more_examples()` in pairwise-evals' export_proofs_gambles.py, among
problems where each gamble has at most two outcomes (row 225, the guess-then-reveal, excluded):
- near_unanimous (most lopsided split): 2310, sure $9 vs 90% $9 / −$47 → 96% A
- even_split (closest to 50/50): 7434, sure $27 vs 99% $26 / $61 → 51% B
- sure_thing (majority takes a sure amount over a higher-average gamble, biggest gap): 5732 → 73% take sure $30
- against_average (majority picks the lower average, no sure option, biggest gap): 7081 → 65% B
- models_wrong (most models predict the wrong majority, then biggest margin): 6003 → 57% B, all four predicted A
Each card: both gambles with averages, the A/B split bar, a one-line note computed from the data, and
every model's predicted share with ✗ on a wrong majority.
