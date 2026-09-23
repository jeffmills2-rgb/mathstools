# Stage 4 — syllabus coverage for the question banks

NESA Mathematics K–10 (2022), Stage 4 (Years 7–8). Sixteen core outcomes, one
Revision Generator topic each. Completed 2026-09-24: before then the generator
had 11 of the 16 topics and several of those were missing content points.

NESA material is Crown copyright. This file paraphrases structure and outcome
codes for build planning; every prompt in the banks is original.

---

## Coverage

| Outcome | Topic in the generator | Bank | Types | Status |
|---|---|---|---|---|
| MA4-INT-C-01 | Integers | `question-banks/integers/` | 17 | unchanged |
| MA4-FRC-C-01 | Fractions, Decimals and Percentages | `question-banks/fdp/` | 29 | **+3** (see below) |
| MA4-RAT-C-01 | Ratios and Rates | `question-banks/ratios-rates/` | 21 | unchanged |
| MA4-IND-C-01 | Indices | `question-banks/indices/` | 25 | **+1** |
| MA4-ALG-C-01 | Algebraic Techniques | `question-banks/algebraic-techniques/` | 21 | unchanged |
| MA4-EQU-C-01 | Equations | `question-banks/equations/` | 23 | unchanged |
| MA4-LIN-C-01 | Cartesian Plane and Linear Relationships | `question-banks/linear-relationships/` | 23 | unchanged |
| MA4-LEN-C-01 | Length | `question-banks/length/` | 21 | unchanged |
| MA4-ARE-C-01 | Area | `question-banks/area/` | 23 | unchanged |
| MA4-VOL-C-01 | **Volume** | `question-banks/volume/` | 17 | **new** |
| MA4-PYT-C-01 | Pythagoras Theorem | `question-banks/pythagoras/` | 12 | **+1** |
| MA4-ANG-C-01 | Angle Relationships | `question-banks/angles/` | 14 | **+7** |
| MA4-GEO-C-01 | **Properties of Geometrical Figures** | `question-banks/geometrical-figures/` | 18 | **new** |
| MA4-DAT-C-01 | **Data Classification and Visualisation** | `question-banks/data-visualisation/` | 17 | **new** |
| MA4-DAT-C-02 | **Data Analysis** | `question-banks/data-analysis/` | 16 | **new** |
| MA4-PRO-C-01 | **Probability** | `question-banks/probability/` | 16 | **new** |

313 Stage 4 question types in total (was 227).

The outcome statements are in `resources/resourcesManifest.js`. The content
points below were checked against the Adventure's Stage 4 skill lists
(`game-platforms/mills-maths-adventure-source/src/maths/curriculum/stage4/`),
which were built to "full NESA coverage" for the same outcomes.

---

## What each new or extended topic covers

### Volume — MA4-VOL-C-01 (17 types)
Counting unit cubes · V = lwh · units of volume (mm³, cm³, m³) · units of
capacity (mL, L, kL, ML) · volume ↔ capacity (1 cm³ = 1 mL, 1 m³ = 1 kL) ·
identifying prisms and their uniform cross-section (and why a pyramid, cone or
sphere is not one) · V = Ah from a given area, and A from V · triangular,
trapezium/parallelogram/rhombus and composite prisms · cylinders (1 dp or
exact in π) · missing dimensions (including a cube's edge) · capacity of
containers · worded problems (fill time at a flow rate, pouring, concrete
cost, water-level rise, rainfall into a tank, a trough) · choosing units ·
spot the error · multi-part.
Stage 5 Volume A keeps part-circle prisms and composite cylinders.

### Properties of Geometrical Figures — MA4-GEO-C-01 (18 types)
Naming conventions (∠ABC, △ABC, the side opposite a vertex, ∥, ⊥) ·
classifying triangles by sides, by angles, and both · naming quadrilaterals
from their markings · properties of the special quadrilaterals (sides,
angles, diagonals) · the classification hierarchy, true or false · convex and
non-convex polygons · angle sum of a triangle · isosceles and equilateral
triangles · exterior angle of a triangle · angle sum of a quadrilateral
(including one with a reflex angle) · angles in parallelograms, rhombuses,
kites and isosceles trapeziums · unknown sides from properties · angles as
algebraic expressions · multi-step problems with reasons · explaining the
angle-sum and exterior-angle results · multi-part.
**Not included:** line/rotational symmetry and ruler-and-compass
constructions — not clearly Stage 4 content in the 2022 syllabus; add them as
types if the faculty wants them.

### Data Classification and Visualisation — MA4-DAT-C-01 (17 types)
Classifying variables (numerical discrete/continuous, categorical
nominal/ordinal) with and without reasons · census, sample, primary and
secondary data, bias · frequency tables from raw data · reading column/bar
graphs, dot plots, stem-and-leaf plots, histograms and frequency polygons,
sector graphs, divided bar graphs, line graphs and pictograms · calculating
sector angles · constructing a column graph, dot plot, histogram or
stem-and-leaf plot on provided axes · choosing the best display · misleading
graphs (truncated axes) · multi-part.

### Data Analysis — MA4-DAT-C-02 (16 types)
Mean, median, mode (including bimodal and "no mode") and range · all four
together · statistics from a frequency table, dot plot, stem-and-leaf plot and
column graph · missing value from a mean · outliers and their effect on the
mean vs the median · shape (symmetric, positively/negatively skewed, bimodal)
· comparing two groups on a back-to-back stem-and-leaf plot · choosing a
measure of centre · the effect of adding, removing, shifting or scaling data ·
multi-part.

### Probability — MA4-PRO-C-01 (16 types)
Sample spaces · chance language · the 0–1 scale · theoretical probability with
dice, spinners, counters in a bag, numbered cards and letter tiles ·
probability as a fraction, decimal and percentage · probabilities add to 1 ·
complementary events and P(not A) = 1 − P(A) · relative frequency ·
theoretical vs experimental · expected frequency · outcomes that are not
equally likely · multi-part. Single-step experiments only; two-step
experiments are Stage 5.

### Added to existing banks
- **Angle Relationships** (`angles/extra-types.js`): naming angles, classifying
  angles (acute → revolution), complementary and supplementary, reflex
  angles, naming the angle pair on a transversal, "are the lines parallel?"
  with reasons, multi-step parallel-line problems with reasons.
- **Fractions, Decimals and Percentages** (`fdp/extra-types.js`): terminating
  and recurring decimals with dot notation, one quantity as a percentage of
  another (with unit conversion), profit and loss.
- **Indices** (`indices/extra-types.js`): HCF and LCM by prime factorisation.
- **Pythagoras** (`pythagoras/extra-types.js`): identify the hypotenuse and
  state the theorem for a labelled triangle.

Each extra-types file is appended to its bank's `TYPE_LIST` / `GENERATORS`
with a spread, so the original file was touched in three lines only.

---

## New engines

| Engine | File | Draws |
|---|---|---|
| `geometry-engine` | `engines/geometry/geometry-engine.js` | any figure from named points: polygons, intervals, lines, equal-side ticks, parallel arrows, angle arcs (incl. reflex), right-angle marks, side labels |
| `statistics-engine` | `engines/statistics/statistics-engine.js` | column, bar, histogram (+ polygon), dot plot, stem-and-leaf (incl. back-to-back), line, sector, divided bar, pictogram; `blank` for construct questions; `yMin` for misleading graphs |
| `probability-engine` | `engines/probability/probability-engine.js` | spinner (equal or weighted, with a key when sectors are narrow), bag of lettered counters, 0–1 scale with markers, cards / letter tiles |

`volume-engine` gained a `cube-array` type (unit-cube stacks) and a
`showArea: false` option on the uniform-cross-section prism.

Shared bank code lives in `question-banks/_shared/`:
`bank-helpers.js` (random helpers, formatting, `makeQuestion`,
`generateFromRegistry`), `figure-helpers.js` (builds triangles and
quadrilaterals FROM THEIR ANGLES so the picture matches the numbers) and
`data-helpers.js` (contexts, dataset generators, summary statistics).

`utils/multiple-choice.js` now honours a bank-supplied `mcDistractors` array,
so word answers ("Isosceles", "Categorical (ordinal)", "Likely") convert to
good multiple-choice items without printing the options on the
short-answer version.

---

## Conventions (in addition to the Stage 3 ones)

- **Figures are built from their numbers.** A triangle labelled 40°, 65°, x IS
  that triangle; the harnesses re-measure every labelled angle.
- **Charts are drawn from the answer's data.** Bars, dots, leaves, bins and
  sectors are recounted by the harness, never trusted.
- Sector-graph totals divide 360, so every sector is a whole number of degrees.
- A rounded mean says "correct to 1 decimal place" in the prompt; an exact one
  does not.
- Probabilities are simplified fractions unless a decimal or percentage is
  asked for.
- A question whose answer is a single capital letter (a scale marker, a
  vertex) is `mcEligible: false` — "A. C, B. A…" reads badly.
- Solids drawn by the volume engine are always marked "not to scale", since
  the engine draws fixed proportions.

---

## Harnesses

`node tools/stage4-<topic>.mjs` — each re-derives every answer independently:

| Harness | Checks |
|---|---|
| `stage4-geometry.mjs` | re-measures 5 000+ labelled angles; classifications from the drawn shape |
| `stage4-volume.mjs` | V from the drawn dimensions; unit factors from definitions |
| `stage4-data.mjs` | both data banks; recounts displays; recomputes statistics |
| `stage4-probability.mjs` | recounts spinners, bags, cards; tables sum to 1 |
| `stage4-angles.mjs` | the 7 new angle types; parallel test and pair names from geometry |
| `stage4-gapfill.mjs` | FDP/Indices/Pythagoras additions (recurring decimals by BigInt division) |

Then `node tools/verify.mjs` for schema, diagram rendering and token leaks
across every bank, and `node tools/picker.mjs` (needs jsdom) for the UI.

## Known follow-ups
- Arabic/Farsi prompt translation for the five new topics falls back to the
  generic translator; topic-specific phrase tables would improve it.
- Possible extra types: symmetry of triangles and quadrilaterals; two-way
  tables (if the faculty treats them as Stage 4).
