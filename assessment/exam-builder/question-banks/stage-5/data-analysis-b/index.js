/*
  Mills Maths Tools — Stage 5 Question Bank: Data Analysis B
  -----------------------------------------------------------
  question-banks/stage-5/data-analysis-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-DAT-C-02 (Core):
    investigates relationships between two numerical variables using
    scatter plots and lines of best fit.

  Content:
    - bivariate data: independent (explanatory) and dependent (response)
      variables
    - constructing and reading scatter plots
    - describing association: direction (positive/negative), strength
      (strong/moderate/weak), form (linear/non-linear), or none; outliers
    - lines of best fit by eye: finding the equation, predicting,
      interpolation versus extrapolation and its dangers
    - association does not mean causation

  Scatter data are generated from a known line plus noise of a chosen size,
  so the "strength" in the answer is the strength that was built in.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, fmt
} from "../../_shared/bank-helpers.js";

const TOPIC = "Data Analysis B";

const TYPE_LIST = [
  { id: "identify-variables", label: "Independent and dependent variables" },
  { id: "describe-association", label: "Describe the association in a scatter plot" },
  { id: "read-scatter", label: "Read information from a scatter plot" },
  { id: "plot-scatter", label: "Construct a scatter plot" },
  { id: "line-of-best-fit-equation", label: "Equation of a line of best fit" },
  { id: "predict-from-line", label: "Predict using a line of best fit" },
  { id: "interpolate-extrapolate", label: "Interpolation or extrapolation?" },
  { id: "scatter-outlier", label: "Outliers in bivariate data" },
  { id: "causation", label: "Association and causation" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "bivariate", ...(spec.tags || [])] });
const chart = config => ({ engine: "statistics-engine", config });
const n1 = v => fmt(v, 1).replace(/^-/, "−");
const lineEq = (m, c) => `y = ${m === 1 ? "" : n1(m)}x ${c < 0 ? "−" : "+"} ${fmt(Math.abs(c), 1)}`.replace(/ \+ 0$/, "");

const PAIRS = [
  { x: "Hours studied", y: "Test mark (%)", xr: [0, 10], m: 5, c: 40, xs: 1, ys: 10, why: "The mark depends on the hours studied." },
  { x: "Temperature (°C)", y: "Ice-creams sold", xr: [15, 40], m: 4, c: -30, xs: 5, ys: 20, why: "Sales respond to the temperature." },
  { x: "Age of car (years)", y: "Value ($000)", xr: [0, 12], m: -2.5, c: 35, xs: 2, ys: 5, why: "The value depends on the age." },
  { x: "Height (cm)", y: "Arm span (cm)", xr: [140, 190], m: 1, c: 0, xs: 10, ys: 10, why: "Arm span is measured in response to height." },
  { x: "Distance from school (km)", y: "Travel time (min)", xr: [0, 20], m: 2.5, c: 5, xs: 5, ys: 10, why: "The time depends on the distance." },
  { x: "Hours of screen time", y: "Hours of sleep", xr: [0, 8], m: -0.5, c: 10, xs: 1, ys: 1, why: "Sleep is the response being studied." }
];

function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
function makeScatter(P, noiseLevel, n = 12) {
  const [a, b] = P.xr;
  const span = Math.abs(P.m) * (b - a);
  const pts = Array.from({ length: n }, () => { const x = +(a + Math.random() * (b - a)).toFixed(P.xs < 1 ? 1 : 0); const y = +(P.m * x + P.c + gauss() * span * noiseLevel).toFixed(P.ys < 5 ? 1 : 0); return [x, y]; });
  return pts;
}
function scatterCfg(P, pts, extra = {}) {
  const ys = pts.map(p => p[1]);
  const yMin = Math.floor(Math.min(...ys, P.m * P.xr[0] + P.c, P.m * P.xr[1] + P.c) / P.ys) * P.ys - P.ys;
  const yMax = Math.ceil(Math.max(...ys, P.m * P.xr[0] + P.c, P.m * P.xr[1] + P.c) / P.ys) * P.ys + P.ys;
  return chart({ chartType: "scatter", points: pts, xMin: P.xr[0], xMax: P.xr[1], xStep: P.xs, yMin: Math.max(P.c > 0 || P.m > 0 ? 0 : yMin, yMin), yMax, yStep: P.ys, xLabel: P.x, yLabel: P.y, ...extra });
}

function identifyVariablesQuestion() {
  const P = choice(PAIRS);
  const [first, second] = shuffle([P.x, P.y]);
  return q({
    type: "identify-variables", marks: 1,
    prompt: `A study compares "${first.replace(/ \(.*\)/, "")}" and "${second.replace(/ \(.*\)/, "")}". Which is the independent variable and which is the dependent variable?`,
    answer: `Independent: ${P.x.replace(/ \(.*\)/, "")}; dependent: ${P.y.replace(/ \(.*\)/, "")}`,
    working: [P.why, "The independent variable goes on the horizontal axis."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`Independent: ${P.y.replace(/ \(.*\)/, "")}; dependent: ${P.x.replace(/ \(.*\)/, "")}`],
    tags: ["variables"]
  });
}

function describeAssociationQuestion() {
  const P = choice(PAIRS);
  const strength = choice(["strong", "moderate", "weak", "none"]);
  const noise = { strong: 0.06, moderate: 0.16, weak: 0.32 }[strength];
  let pts;
  if (strength === "none") {
    const ys = [P.m * P.xr[0] + P.c, P.m * P.xr[1] + P.c].sort((a, b) => a - b);
    pts = Array.from({ length: 14 }, () => [+(P.xr[0] + Math.random() * (P.xr[1] - P.xr[0])).toFixed(0), randInt(Math.round(ys[0]), Math.round(ys[1]))]);
  } else pts = makeScatter(P, noise, 14);
  const dir = P.m > 0 ? "positive" : "negative";
  const ans = strength === "none" ? "No association" : `${strength[0].toUpperCase()}${strength.slice(1)}, ${dir}, linear association`;
  return q({
    type: "describe-association", marks: 2,
    prompt: "Describe the association shown in the scatter plot (strength, direction and form).",
    diagram: scatterCfg(P, pts),
    answer: ans,
    working: [strength === "none" ? "The points show no trend." : `As ${P.x.replace(/ \(.*\)/, "").toLowerCase()} increases, ${P.y.replace(/ \(.*\)/, "").toLowerCase()} tends to ${P.m > 0 ? "increase" : "decrease"}; the points are ${strength === "strong" ? "close to" : strength === "moderate" ? "fairly close to" : "widely scattered about"} a line.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["Strong, positive, linear association", "Strong, negative, linear association", "Weak, positive, linear association", "Weak, negative, linear association", "No association", "Moderate, positive, linear association", "Moderate, negative, linear association"].filter(s => s !== ans).slice(0, 3),
    tags: ["association"]
  });
}

function readScatterQuestion() {
  const P = choice(PAIRS.filter(p => Number.isInteger(p.m * 2)));
  const pts = makeScatter(P, 0.1, 12);
  const thr = Math.round((P.xr[0] + P.xr[1]) / 2);
  const cnt = pts.filter(p => p[0] > thr).length;
  const best = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
  return q({
    type: "read-scatter", marks: 2,
    prompt: "Use the scatter plot.",
    diagram: scatterCfg(P, pts),
    subparts: [
      { label: "(a)", prompt: `How many data points have ${P.x.replace(/ \(.*\)/, "").toLowerCase()} greater than ${thr}?`, marks: 1, answer: String(cnt), working: [] },
      { label: "(b)", prompt: `What is the ${P.x.replace(/ \(.*\)/, "").toLowerCase()} of the point with the greatest ${P.y.replace(/ \(.*\)/, "").toLowerCase()}?`, marks: 1, answer: n1(best[0]), working: [] }
    ],
    answer: `(a) ${cnt}; (b) ${n1(best[0])}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["read"]
  });
}

function plotScatterQuestion() {
  const P = choice(PAIRS); const pts = makeScatter(P, 0.08, 8);
  return q({
    type: "plot-scatter", marks: 3,
    prompt: `Plot the data on the scatter plot, then describe the association.`,
    table: { headerRow: false, rows: [[P.x, ...pts.map(p => n1(p[0]))], [P.y, ...pts.map(p => String(p[1]))]] },
    diagram: scatterCfg(P, pts, { blank: true }),
    answer: `Points plotted; ${P.m > 0 ? "positive" : "negative"}, strong, linear association.`,
    working: [],
    space: "none",
    mcEligible: false,
    tags: ["construct"]
  });
}

function fitLine(P) {
  // a tidy line close to the generating one, through two grid-friendly points
  const x1 = P.xr[0] + P.xs; const x2 = P.xr[1] - P.xs;
  const y1 = Math.round((P.m * x1 + P.c) / (P.ys / 2)) * (P.ys / 2); const y2 = Math.round((P.m * x2 + P.c) / (P.ys / 2)) * (P.ys / 2);
  return { x1, y1, x2, y2, m: (y2 - y1) / (x2 - x1), c: y1 - ((y2 - y1) / (x2 - x1)) * x1 };
}

function lineOfBestFitEquationQuestion() {
  const P = choice(PAIRS); const pts = makeScatter(P, 0.07, 12); const L = fitLine(P);
  const eq = lineEq(L.m, L.c);
  return q({
    type: "line-of-best-fit-equation", marks: 3,
    prompt: `A line of best fit has been drawn through (${L.x1}, ${n1(L.y1)}) and (${L.x2}, ${n1(L.y2)}). Find its equation, with x = ${P.x.replace(/ \(.*\)/, "").toLowerCase()} and y = ${P.y.replace(/ \(.*\)/, "").toLowerCase()}.`,
    diagram: scatterCfg(P, pts, { fit: { from: [L.x1, L.y1], to: [L.x2, L.y2] } }),
    answer: eq,
    working: [`m = (${n1(L.y2)} − ${n1(L.y1)}) ÷ (${L.x2} − ${L.x1}) = ${n1(L.m)}`, `c = ${n1(L.y1)} − ${n1(L.m)} × ${L.x1} = ${n1(L.c)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [lineEq(+(1 / L.m).toFixed(2), L.c), lineEq(L.m, L.y1), lineEq(-L.m, L.c)],
    tags: ["line of best fit"]
  });
}

function predictFromLineQuestion() {
  const P = choice(PAIRS); const pts = makeScatter(P, 0.07, 12); const L = fitLine(P);
  const xp = +(P.xr[0] + (P.xr[1] - P.xr[0]) * choice([0.35, 0.5, 0.65])).toFixed(0);
  const yp = L.m * xp + L.c;
  return q({
    type: "predict-from-line", marks: 2,
    prompt: `The line of best fit has equation ${lineEq(L.m, L.c)}. Predict the ${P.y.replace(/ \(.*\)/, "").toLowerCase()} when the ${P.x.replace(/ \(.*\)/, "").toLowerCase()} is ${xp}. Is this interpolation or extrapolation?`,
    diagram: scatterCfg(P, pts, { fit: { from: [L.x1, L.y1], to: [L.x2, L.y2] } }),
    answer: `≈ ${n1(yp)}; interpolation (within the range of the data)`,
    working: [`y = ${n1(L.m)} × ${xp} + ${n1(L.c)} = ${n1(yp)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`≈ ${n1(yp)}; extrapolation (outside the range of the data)`, `≈ ${n1(L.m * xp)}; interpolation (within the range of the data)`],
    tags: ["predict"]
  });
}

function interpolateExtrapolateQuestion() {
  const P = choice(PAIRS);
  const inside = Math.random() < 0.5;
  const x = inside ? Math.round((P.xr[0] + P.xr[1]) / 2) : P.xr[1] + (P.xr[1] - P.xr[0]);
  return q({
    type: "interpolate-extrapolate", marks: 2,
    prompt: `Data on ${P.x.replace(/ \(.*\)/, "").toLowerCase()} were collected between ${P.xr[0]} and ${P.xr[1]}. A prediction is made for ${x}. Is this interpolation or extrapolation? How reliable is it?`,
    answer: inside ? "Interpolation: it lies within the data range, so it is fairly reliable if the association is strong." : "Extrapolation: it lies outside the data range, so it may be unreliable; the trend may not continue.",
    working: [],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [inside ? "Extrapolation: it lies outside the data range, so it may be unreliable; the trend may not continue." : "Interpolation: it lies within the data range, so it is fairly reliable if the association is strong."],
    tags: ["extrapolation"]
  });
}

function scatterOutlierQuestion() {
  const P = choice(PAIRS); const pts = makeScatter(P, 0.05, 11);
  const xo = Math.round((P.xr[0] * 0.3 + P.xr[1] * 0.7)); const expected = P.m * xo + P.c;
  const yo = +(expected + (P.m > 0 ? -1 : 1) * Math.abs(P.m) * (P.xr[1] - P.xr[0]) * 0.55).toFixed(P.ys < 5 ? 1 : 0);
  pts.push([xo, yo]);
  return q({
    type: "scatter-outlier", marks: 2,
    prompt: "Identify the outlier in the scatter plot, and describe the effect of removing it on the strength of the association.",
    diagram: scatterCfg(P, shuffle(pts)),
    answer: `The point (${xo}, ${yo}); removing it makes the association stronger.`,
    working: ["It lies far from the trend of the other points."],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["outliers"]
  });
}

const CAUSE = [
  ["In summer, both ice-cream sales and drownings increase. Does eating ice-cream cause drowning?", "No: both are associated with hot weather (a third variable); association does not show causation."],
  ["Towns with more fire trucks have more fires. Do fire trucks cause fires?", "No: bigger towns have both more fire trucks and more fires; the association is explained by population."],
  ["Students who own more books tend to get higher marks. Does buying books cause higher marks?", "Not necessarily: other factors (such as home support or interest in reading) may explain both."],
  ["There is a strong positive association between shoe size and reading ability in primary students. Explain.", "Both increase with age; bigger feet do not cause better reading."]
];

function causationQuestion() {
  const [p, a] = choice(CAUSE);
  return q({ type: "causation", marks: 2, prompt: p, answer: a, working: ["Association does not imply causation."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["causation"] });
}

const GENERATORS = {
  "identify-variables": identifyVariablesQuestion,
  "describe-association": describeAssociationQuestion,
  "read-scatter": readScatterQuestion,
  "plot-scatter": plotScatterQuestion,
  "line-of-best-fit-equation": lineOfBestFitEquationQuestion,
  "predict-from-line": predictFromLineQuestion,
  "interpolate-extrapolate": interpolateExtrapolateQuestion,
  "scatter-outlier": scatterOutlierQuestion,
  "causation": causationQuestion
};

export function getDataAnalysisBQuestionTypes() { return TYPE_LIST; }
export function generateDataAnalysisBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
