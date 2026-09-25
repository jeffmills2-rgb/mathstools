# Stage 5 — syllabus coverage for the question banks

NESA Mathematics K–10 (2022), Stage 5 (Years 9–10). **41 outcomes** — 13
Core and 28 Path — one Revision Generator topic each. The outcome codes,
focus-area names and statements are the ones in
`resources/resourcesManifest.js` (checked 2026-09-25). The content points
below are a paraphrase of each focus area, for planning; every prompt in the
banks is original.

NESA material is Crown copyright. This file paraphrases structure and outcome
codes for build planning.

Path abbreviations: **C** = Core (everyone), **Stn** = Standard path,
**Adv** = Advanced path, **Ext** = Extension path.

---

## Coverage

All 41 outcomes have a bank and are registered in `STAGE5_TOPICS` (app.js), in syllabus order — 528 question types in total. Harness: `node tools/stage5.mjs`.

| Outcome | Focus area (= topic) | Path | Bank | Status (types) |
|---|---|---|---|---|
| MA5-FIN-C-01 | Financial mathematics A | C | `stage-5/financial-mathematics-a/` | existing (20) |
| MA5-FIN-C-02 | Financial mathematics B | C | `stage-5/financial-mathematics-b/` | existing (12) |
| MA5-ALG-C-01 | Algebraic techniques A | C | `stage-5/algebraic-techniques-a/` | existing, gap-filled (12 → 17) |
| MA5-ALG-P-01 | Algebraic techniques B | Adv | `stage-5/algebraic-techniques-b/` | **new (12 types)** |
| MA5-ALG-P-02 | Algebraic techniques C | Adv | `stage-5/algebraic-techniques-c/` | **new (14 types)** |
| MA5-IND-C-01 | Indices A | C | `stage-5/indices-a/` | **new (15 types)** |
| MA5-IND-P-01 | Indices B | Adv | `stage-5/indices-b/` | **new (11 types)** |
| MA5-IND-P-02 | Indices C (surds, fractional indices) | Adv | `stage-5/indices-c/` | **new (16 types)** |
| MA5-EQU-C-01 | Equations A | C | `stage-5/equations-a/` | existing (24) |
| MA5-EQU-P-01 | Equations B | Adv | `stage-5/equations-b/` | **new (15 types)** |
| MA5-EQU-P-02 | Equations C | Adv | `stage-5/equations-c/` | **new (14 types)** |
| MA5-LIN-C-01 | Linear relationships A | C | `stage-5/linear-relationships-a/` | **new (15 types)** |
| MA5-LIN-C-02 | Linear relationships B | C | `stage-5/linear-relationships-b/` | **new (14 types)** |
| MA5-LIN-P-01 | Linear relationships C | Adv | `stage-5/linear-relationships-c/` | **new (14 types)** |
| MA5-NLI-C-01 | Non-linear relationships A | C | `stage-5/non-linear-relationships-a/` | existing (8) |
| MA5-NLI-C-02 | Non-linear relationships B | C | `stage-5/non-linear-relationships-b/` | existing (9) |
| MA5-NLI-P-01 | Non-linear relationships C | Adv | `stage-5/non-linear-relationships-c/` | **new (15 types)** |
| MA5-RAT-P-01 | Variation and rates of change A | Stn, Adv | `stage-5/variation-a/` | **new (12 types)** |
| MA5-RAT-P-02 | Variation and rates of change B | Adv | `stage-5/variation-b/` | **new (12 types)** |
| MA5-POL-P-01 | Polynomials | Adv, Ext | `stage-5/polynomials/` | **new (13 types)** |
| MA5-LOG-P-01 | Logarithms | Adv | `stage-5/logarithms/` | **new (13 types)** |
| MA5-FNC-P-01 | Functions and other graphs | Adv | `stage-5/functions-graphs/` | **new (12 types)** |
| MA5-MAG-C-01 | Numbers of any magnitude | C | `stage-5/numbers-of-any-magnitude/` | **new (14 types)** |
| MA5-TRG-C-01 | Trigonometry A | C | `stage-5/trigonometry-a/` | existing, gap-filled (10 → 14) |
| MA5-TRG-C-02 | Trigonometry B | C | `stage-5/trigonometry-b/` | existing (12) |
| MA5-TRG-P-01 | Trigonometry C | Stn, Adv | `stage-5/trigonometry-c/` | existing (9) |
| MA5-TRG-P-02 | Trigonometry D | Adv | `stage-5/trigonometry-d/` | **new (13 types)** |
| MA5-ARE-C-01 | Area and surface area A | C | `stage-5/area-and-surface-area-a/` | existing (17) |
| MA5-ARE-P-01 | Area and surface area B | Stn, Adv | `stage-5/area-and-surface-area-b/` | **new (11 types)** |
| MA5-VOL-C-01 | Volume A | C | `stage-5/volume-a/` | existing, gap-filled (10 → 13) |
| MA5-VOL-P-01 | Volume B | Stn, Adv | `stage-5/volume-b/` | **new (12 types)** |
| MA5-GEO-C-01 | Properties of geometrical figures A | C | `stage-5/geometrical-figures-a/` | **new (11 types)** |
| MA5-GEO-P-01 | Properties of geometrical figures B | Ext | `stage-5/geometrical-figures-b/` | **new (10 types)** |
| MA5-GEO-P-02 | Properties of geometrical figures C | Ext | `stage-5/geometrical-figures-c/` | **new (8 types)** |
| MA5-CIR-P-01 | Circle geometry | Ext | `stage-5/circle-geometry/` | **new (12 types)** |
| MA5-NET-P-01 | Introduction to networks | Stn | `stage-5/introduction-to-networks/` | existing, gap-filled (9 → 13) |
| MA5-DAT-C-01 | Data analysis A | C | `stage-5/data-analysis-a/` | **new (12 types)** |
| MA5-DAT-C-02 | Data analysis B | C | `stage-5/data-analysis-b/` | **new (9 types)** |
| MA5-DAT-P-01 | Data analysis C | Stn, Adv | `stage-5/data-analysis-c/` | **new (10 types)** |
| MA5-PRO-C-01 | Probability A | C | `stage-5/probability-a/` | **new (10 types)** |
| MA5-PRO-P-01 | Probability B | Adv | `stage-5/probability-b/` | **new (11 types)** |

---

## Content, by focus area (paraphrased)

### Algebraic techniques B — MA5-ALG-P-01
Four operations with algebraic fractions with pronumerals (and indices) in
the denominator · factorise by taking out a common factor (including a
negative or algebraic common factor, and a binomial common factor) · expand
binomial products (including (a + b)² and (a + b)(a − b) as patterns) ·
factorise monic quadratic trinomials x² + bx + c.

### Algebraic techniques C — MA5-ALG-P-02
Algebraic fractions with binomial numerators and numerical denominators ·
special products: perfect squares and difference of two squares, expand and
factorise · factorise by grouping in pairs · factorise non-monic quadratics
ax² + bx + c · simplify algebraic fractions by factorising first (including
× and ÷) · complete the square (x² + bx + ...).

### Indices A — MA5-IND-C-01
Index laws with pronumerals (product, quotient, power of a power, power of a
product/quotient) with positive-integer indices · the zero index · simplify
algebraic products and quotients with coefficients · negative indices for
NUMERICAL bases: meaning and evaluation (2⁻³ = 1/8), writing as a positive
index, and applying the laws to numerical expressions.

### Indices B — MA5-IND-P-01
Negative indices with pronumerals: rewrite with positive indices, and apply
all the index laws to algebraic expressions with negative-integer indices,
including fractions and coefficients.

### Indices C — MA5-IND-P-02
Rational and irrational numbers, surds as irrational roots · simplify surds
(√72 = 6√2) · add/subtract like surds · multiply and divide surds · expand
binomial products with surds · rationalise the denominator (including a
binomial denominator, Adv) · fractional indices: a^(1/n) = ⁿ√a, a^(m/n),
evaluating and converting between index and surd form, applying the laws.

### Equations B — MA5-EQU-P-01
Monic quadratic equations by factorising (and x² = k) · checking solutions ·
cubic equations of the form ax³ = k · linear inequalities: solve (including
reversing the sign when multiplying/dividing by a negative) and graph the
solution on a number line.

### Equations C — MA5-EQU-P-02
Linear equations of more than 3 steps, and with more than one algebraic
fraction · rearrange literal equations / formulas to change the subject ·
quadratic equations: factorising (non-monic), completing the square, the
quadratic formula, number of solutions from the discriminant (informally) ·
word problems leading to quadratics · linear simultaneous equations:
graphically (intersection), by substitution and by elimination, and from
word problems.

### Linear relationships A — MA5-LIN-C-01
Midpoint of an interval (from a graph and by averaging coordinates) ·
gradient as rise/run (positive, negative, zero, undefined) · distance between
two points using Pythagoras · graphing lines from a table or equation ·
horizontal (y = c) and vertical (x = c) lines · parallel lines have equal
gradients.

### Linear relationships B — MA5-LIN-C-02
Gradient–intercept form y = mx + c: read m and c, sketch from them, find the
equation from a graph, rearrange to y = mx + c · lines parallel and
perpendicular (m₁m₂ = −1) to a given line · finding the equation through a
point with a given gradient.

### Linear relationships C — MA5-LIN-P-01
Midpoint, gradient and distance formulas · point–gradient form y − y₁ =
m(x − x₁) and general form ax + by + c = 0 · the line through two points ·
collinearity, parallelograms/right angles by coordinate geometry · line and
rotational symmetry · transformations on the Cartesian plane with coordinates:
translations, reflections in an axis, rotations through multiples of 90°.

### Non-linear relationships C — MA5-NLI-P-01
Parabolas: y = a(x − h)² + k, intercepts, vertex, axis of symmetry,
transformations (dilation, reflection, translation) · exponentials y = aˣ,
y = a⁻ˣ, asymptotes and translations · hyperbolas y = k/x, asymptotes and
translations · circles x² + y² = r² and (x − h)² + (y − k)² = r² (centre,
radius, completing the square) · identify graphs from equations and vice
versa · cubic/polynomial curves (y = ax³ + d, y = a(x − p)(x − q)(x − r)).

### Variation and rates of change A — MA5-RAT-P-01
Direct variation y = kx (find k, use it, graphs through the origin) ·
inverse variation y = k/x (find k, use it, hyperbola graphs) · recognise
direct/inverse from tables, graphs and context · y ∝ x², y ∝ 1/x² variations.

### Variation and rates of change B — MA5-RAT-P-02
Constant rates of change (gradient as rate) · variable rates: interpret
distance–time and other graphs where the rate changes (steeper = faster,
increasing at an increasing/decreasing rate) · average rate of change between
two points · match stories to graphs and sketch graphs from stories
(including containers filling).

### Polynomials — MA5-POL-P-01
Vocabulary (degree, leading coefficient, constant term, monic) · P(x)
notation and evaluation · add, subtract, multiply polynomials · long division
P(x) = A(x)Q(x) + R(x) · remainder theorem · factor theorem · factorise and
solve cubic equations · graph polynomials from factored form (roots, double
roots, end behaviour).

### Logarithms — MA5-LOG-P-01
Definition y = aˣ ⇔ x = logₐ y · evaluate logs · log laws (product, quotient,
power, logₐ1 = 0, logₐa = 1) · simplify and evaluate with the laws · solve
simple exponential equations using logs · the graph of y = logₐx as the
reflection of y = aˣ.

### Functions and other graphs — MA5-FNC-P-01
Relations and functions (vertical line test, mapping diagrams) · function
notation f(x), evaluate and substitute · domain and range (from equations and
graphs) · graphs of linear inequalities in one variable (number line) and
two variables (half-planes, dashed vs solid boundaries, test points) ·
regions satisfying more than one inequality.

### Numbers of any magnitude — MA5-MAG-C-01
Very large and very small measurements (units, prefixes nano- to tera-) ·
absolute error (±½ the precision), upper and lower bounds, percentage error ·
rounding to decimal places and significant figures · scientific notation:
write, convert, calculate with a calculator, compare and order.

### Trigonometry D — MA5-TRG-P-02
Angles of any magnitude: the unit circle, sign of sin/cos/tan in each
quadrant (ASTC) · exact values for 30°, 45°, 60° (and 0°, 90°, 180°…) ·
supplementary and complementary angle relationships (sin(180° − θ) = sin θ,
sin(90° − θ) = cos θ) · graphs of y = sin x, y = cos x, y = tan x for
0° ≤ x ≤ 360° (amplitude, period, features) · solve trigonometric equations
sin x = k etc. for 0° ≤ x ≤ 360°.

### Area and surface area B — MA5-ARE-P-01
Surface area of right pyramids (square/rectangular base, slant height via
Pythagoras), right cones (πr² + πrl), spheres (4πr²), hemispheres, and
composite solids built from these, prisms and cylinders · practical problems.

### Volume B — MA5-VOL-P-01
Volume of right pyramids (⅓Ah), cones (⅓πr²h), spheres (4/3 πr³),
hemispheres, and composite solids · finding a dimension from a volume ·
practical problems (capacity, units).

### Properties of geometrical figures A — MA5-GEO-C-01
Similar figures: corresponding sides and angles, scale factor, enlargement ·
find unknown sides using the scale factor · scale drawings and maps (scale
as a ratio, real and drawn lengths) · similar triangles in practical
problems (shadows, heights) · area and volume of similar figures (k², k³ —
enrichment).

### Properties of geometrical figures B — MA5-GEO-P-01
Congruence: tests SSS, SAS, AAS, RHS (and why SSA/AAA are not) · similarity
tests: SSS, SAS, AA (equiangular), RHS · naming correspondences in order ·
reasoning about angles and sides in plane shapes (numerical problems with
reasons: isosceles, parallel lines, angle sums, polygons).

### Properties of geometrical figures C — MA5-GEO-P-02
Formal proofs of congruent and similar triangles · proving properties of
isosceles triangles and quadrilaterals (e.g. the diagonals of a
parallelogram bisect each other) · deductive reasoning chains with reasons.

### Circle geometry — MA5-CIR-P-01
Vocabulary (arc, chord, sector, segment, tangent, secant, subtend) ·
theorems: perpendicular from centre bisects a chord; equal chords are
equidistant; angle at the centre is twice the angle at the circumference;
angles in the same segment are equal; angle in a semicircle is 90°; opposite
angles of a cyclic quadrilateral are supplementary; exterior angle of a
cyclic quadrilateral; tangent ⊥ radius; tangents from an external point are
equal; alternate segment theorem; products of intercepts of intersecting
chords, secants and tangents · numerical problems with reasons and proofs.

### Data analysis A — MA5-DAT-C-01
Standard deviation as a measure of spread (calculator, interpret, compare) ·
quartiles and interquartile range (odd and even n) · outliers (1.5 × IQR) ·
five-number summary and box plots, parallel box plots · comparing datasets
(centre and spread), with dot plots, histograms and stem-and-leaf plots.

### Data analysis B — MA5-DAT-C-02
Bivariate data: independent/dependent variable · scatter plots · describe
association (positive/negative, strong/weak, linear/non-linear, none) · line
of best fit by eye, and using it to predict (interpolate/extrapolate and its
dangers) · correlation is not causation.

### Data analysis C — MA5-DAT-P-01
Plan a statistical inquiry (question, population, sample, variables) ·
sampling methods (random, systematic, stratified; bias) · primary and
secondary data · evaluating reports in the media (sample size, bias,
misleading graphs, claims beyond the data) · reviewing an inquiry.

### Probability A — MA5-PRO-C-01
Multistage experiments: sample spaces by lists, grids (tables) and tree
diagrams · independent and dependent events (with/without replacement) ·
probabilities of combined events (multiplying along branches, adding
outcomes) · "at least one" · simulations (design, relative frequency,
expected results).

### Probability B — MA5-PRO-P-01
Venn diagrams (two and three sets) and 2-way tables: counts and
probabilities · union, intersection, complement, "and", "or", "not" ·
mutually exclusive events · addition rule P(A or B) = P(A) + P(B) −
P(A and B) · conditional probability P(A | B) from Venn diagrams and tables,
and the language "given", "if … then", "of", "knowing that".

---

## Engines

| Engine | Stage 5 use |
|---|---|
| `plane-engine` (**new**) | one Cartesian plane for every function graph: lines, parabolas, exponentials, logs, hyperbolas with asymptotes, circles, cubics/polynomials, sin/cos/tan in degrees, points, intervals, shaded regions for inequalities, A–D option cards |
| `statistics-engine` | **+ box plots** (single and parallel), **+ scatter plots** with an optional line of best fit |
| `probability-engine` | **+ tree diagrams** (2–3 stages, branch probabilities or blanks), **+ Venn diagrams** (2 or 3 sets, counts or shading) |
| `geometry-engine` | **+ circles and arcs** (circle geometry), reused for similar and congruent figures |
| `solids-engine` | **+ measured solids**: pyramids, cones, spheres, hemispheres and composites with labelled dimensions |
| `equation-engine` | inequality number lines (existing) |
| `network-engine`, `trigonometry-engine`, `volume-engine`, `area-surface-engine` | existing |

A `[[sup:…]]` markup token renders a superscript (for fractional and
algebraic indices such as 8[[sup:2/3]] or x[[sup:n+1]]).

---

## Engine changes made for Stage 5

- **plane-engine (new)** — one number plane for every Stage 5 graph: lines, parabolas, polynomials, exponentials, logs, hyperbolas, circles, sin/cos/tan, regions for inequalities, points, segments, `polylines` (travel graphs, containers filling), and `options` cards (A–D) with a `columns` grid.
- **geometry-engine** — `circles` (circle geometry); `localLabels: true` so side-by-side similar/congruent triangles label away from their own centres.
- **solids-engine** — `measured` solids: pyramids, cones, cylinders, spheres, hemispheres and composites with labelled dimensions.
- **statistics-engine** — `box-plot` (with faint guides when `blank`) and `scatter` with a line of best fit.
- **probability-engine** — `tree` and `venn` (2 or 3 sets); a three-set diagram puts the "neither" count bottom-left, clear of the set names.
- **algebra-engine** — `area-grid`.
- Markup: `[[sup:…]]` superscript token (renderer, solutions, multiple choice).

## Gap-fill modules (existing banks)

`extra-types.js` next to the bank, pushed onto its `TYPE_LIST` and `GENERATORS`:
algebraic-techniques-a (factorising common factors, checking, expand-and-evaluate, area expressions), trigonometry-a (Pythagoras then ratio, shared-side triangles, isosceles split, choosing the ratio), volume-a (unit conversions, finding a dimension), introduction-to-networks (sum of degrees, weighted shortest path, route length, network from a table).
