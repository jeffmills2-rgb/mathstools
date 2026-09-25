/*
  Mills Maths Tools — Stage 5 Question Bank: Data Analysis A
  -----------------------------------------------------------
  question-banks/stage-5/data-analysis-a/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-DAT-C-01 (Core):
    compares datasets using measures of centre and spread, including the
    interquartile range and standard deviation, and box plots.

  Content:
    - quartiles (median of each half; the median is left out of both halves
      when n is odd) and the interquartile range, from lists, dot plots and
      stem-and-leaf plots
    - outliers: below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR
    - five-number summaries; reading and drawing box plots; parallel box
      plots and skew
    - standard deviation (population, σ) with a calculator, and interpreting
      it; the effect of adding a constant or an outlier
    - comparing two datasets by centre and spread

  The statistics come from the same arrays that are drawn, so the plot and
  the answer never disagree.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, fmt, fixed
} from "../../_shared/bank-helpers.js";

const TOPIC = "Data Analysis A";

const TYPE_LIST = [
  { id: "quartiles-iqr-list", label: "Quartiles and IQR from a list" },
  { id: "quartiles-stem-leaf", label: "Quartiles from a stem-and-leaf plot" },
  { id: "five-number-summary", label: "Five-number summary" },
  { id: "read-box-plot", label: "Read a box plot" },
  { id: "draw-box-plot", label: "Draw a box plot" },
  { id: "outliers", label: "Identify outliers (1.5 × IQR)" },
  { id: "parallel-box-plots", label: "Compare parallel box plots" },
  { id: "skewness", label: "Skewness and shape" },
  { id: "standard-deviation", label: "Standard deviation with a calculator" },
  { id: "interpret-sd", label: "Interpret standard deviation" },
  { id: "effect-on-statistics", label: "Effect of changes on mean, median and SD" },
  { id: "compare-datasets", label: "Compare two datasets" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "statistics", ...(spec.tags || [])] });
const chart = config => ({ engine: "statistics-engine", config });
const d1 = v => fmt(v, 1); const d2 = v => fixed(v, 2);

/* ── statistics ─────────────────────────────────────────── */
export const sortN = a => [...a].sort((x, y) => x - y);
export function medianOf(a) { const s = sortN(a); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
export function quartiles(a) {
  const s = sortN(a); const n = s.length;
  const lower = s.slice(0, Math.floor(n / 2)); const upper = s.slice(Math.ceil(n / 2));
  return { min: s[0], q1: medianOf(lower), med: medianOf(s), q3: medianOf(upper), max: s[n - 1] };
}
export const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
export const sdPop = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };

function dataset(n, lo, hi) { return Array.from({ length: n }, () => randInt(lo, hi)); }
function stemRows(data) {
  const s = sortN(data); const lo = Math.floor(s[0] / 10); const hi = Math.floor(s[s.length - 1] / 10);
  const rows = [];
  for (let st = lo; st <= hi; st++) rows.push({ stem: st, leaves: s.filter(v => Math.floor(v / 10) === st).map(v => v % 10) });
  return rows;
}
const CTX = [
  { name: "the number of goals scored by a netball team in each game", lo: 20, hi: 55 },
  { name: "the ages of people at a community meeting", lo: 18, hi: 72 },
  { name: "test marks out of 60", lo: 22, hi: 58 },
  { name: "the times (in minutes) students took to travel to school", lo: 5, hi: 48 },
  { name: "the heights (cm) of a group of seedlings", lo: 12, hi: 45 }
];

function quartilesIqrListQuestion() {
  const n = choice([9, 10, 11, 12]); const data = dataset(n, 2, 40); const Qs = quartiles(data);
  const s = sortN(data);
  return q({
    type: "quartiles-iqr-list", marks: 3,
    prompt: `For the data ${shuffle(data).join(", ")}, find the median, the lower and upper quartiles, and the interquartile range.`,
    answer: `Median ${d1(Qs.med)}, Q₁ = ${d1(Qs.q1)}, Q₃ = ${d1(Qs.q3)}, IQR = ${d1(Qs.q3 - Qs.q1)}`,
    working: [`In order: ${s.join(", ")}`, `Median = ${d1(Qs.med)}`, `Lower half ${s.slice(0, Math.floor(n / 2)).join(", ")}: Q₁ = ${d1(Qs.q1)}`, `Upper half ${s.slice(Math.ceil(n / 2)).join(", ")}: Q₃ = ${d1(Qs.q3)}`, `IQR = ${d1(Qs.q3)} − ${d1(Qs.q1)} = ${d1(Qs.q3 - Qs.q1)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`Median ${d1(Qs.med)}, Q₁ = ${d1(Qs.q1)}, Q₃ = ${d1(Qs.q3)}, IQR = ${d1(Qs.max - Qs.min)}`, `Median ${d1(mean(data))}, Q₁ = ${d1(Qs.q1)}, Q₃ = ${d1(Qs.q3)}, IQR = ${d1(Qs.q3 - Qs.q1)}`],
    tags: ["quartiles", "IQR"]
  });
}

function quartilesStemLeafQuestion() {
  const c = choice(CTX); const n = randInt(11, 16); const data = dataset(n, Math.max(10, c.lo), c.hi); const Qs = quartiles(data);
  const rows = stemRows(data); const ex = rows.find(r => r.leaves.length);
  return q({
    type: "quartiles-stem-leaf", marks: 3,
    prompt: `The stem-and-leaf plot shows ${c.name}. Find the interquartile range.`,
    diagram: chart({ chartType: "stem-leaf", rows, key: `${ex.stem} | ${ex.leaves[0]} = ${ex.stem * 10 + ex.leaves[0]}` }),
    answer: `IQR = ${d1(Qs.q3 - Qs.q1)}`,
    working: [`n = ${n}; median = ${d1(Qs.med)}`, `Q₁ = ${d1(Qs.q1)}, Q₃ = ${d1(Qs.q3)}`, `IQR = ${d1(Qs.q3 - Qs.q1)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`IQR = ${d1(Qs.max - Qs.min)}`, `IQR = ${d1(Qs.q3 - Qs.med)}`, `IQR = ${d1(Qs.med - Qs.q1)}`],
    tags: ["quartiles", "stem-and-leaf"]
  });
}

function fiveNumberSummaryQuestion() {
  const useDot = Math.random() < 0.5;
  const dd = useDot ? dataset(randInt(12, 18), 1, 10) : dataset(randInt(8, 13), 10, 60); const Q2 = quartiles(dd);
  return q({
    type: "five-number-summary", marks: 2,
    prompt: useDot ? "Write the five-number summary for the data in the dot plot." : `Write the five-number summary for: ${shuffle(dd).join(", ")}.`,
    diagram: useDot ? chart({ chartType: "dot-plot", data: dd, min: 1, max: 10, xLabel: "Score" }) : undefined,
    answer: `Min ${Q2.min}, Q₁ ${d1(Q2.q1)}, median ${d1(Q2.med)}, Q₃ ${d1(Q2.q3)}, max ${Q2.max}`,
    working: [`In order: ${sortN(dd).join(", ")}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`Min ${Q2.min}, Q₁ ${d1(Q2.q1)}, median ${d1(mean(dd))}, Q₃ ${d1(Q2.q3)}, max ${Q2.max}`],
    tags: ["five-number summary"]
  });
}

function boxFrom(Qs) { return { min: Qs.min, q1: Qs.q1, median: Qs.med, q3: Qs.q3, max: Qs.max }; }
function niceAxis(lo, hi) { const span = hi - lo; const step = span > 60 ? 10 : span > 25 ? 5 : 2; return { axisMin: Math.floor(lo / step) * step, axisMax: Math.ceil(hi / step) * step, step }; }

function readBoxPlotQuestion() {
  const c = choice(CTX); const data = dataset(20, c.lo, c.hi); const Qs = quartiles(data);
  const B = { min: Qs.min, q1: Math.round(Qs.q1), median: Math.round(Qs.med), q3: Math.round(Qs.q3), max: Qs.max };
  if (!(B.q1 < B.median && B.median < B.q3)) return readBoxPlotQuestion();
  return q({
    type: "read-box-plot", marks: 4,
    prompt: `The box plot shows ${c.name}.`,
    diagram: chart({ chartType: "box-plot", plots: [{ label: "", ...B }], ...niceAxis(B.min, B.max) }),
    subparts: [
      { label: "(a)", prompt: "Find the median.", marks: 1, answer: String(B.median), working: [] },
      { label: "(b)", prompt: "Find the range and the interquartile range.", marks: 2, answer: `Range ${B.max - B.min}; IQR ${B.q3 - B.q1}`, working: [`${B.max} − ${B.min}`, `${B.q3} − ${B.q1}`] },
      { label: "(c)", prompt: `What percentage of the data is above ${B.q3}?`, marks: 1, answer: "25%", working: ["A quarter of the data lies above the upper quartile."] }
    ],
    answer: `(a) ${B.median}; (b) range ${B.max - B.min}, IQR ${B.q3 - B.q1}; (c) 25%`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["box plot"]
  });
}

function drawBoxPlotQuestion() {
  const data = dataset(randInt(11, 15), 10, 50); const Qs = quartiles(data);
  const ax = niceAxis(Qs.min, Qs.max);
  return q({
    type: "draw-box-plot", marks: 3,
    prompt: `Find the five-number summary of ${shuffle(data).join(", ")}, and draw a box plot on the scale.`,
    diagram: chart({ chartType: "box-plot", plots: [{ label: "", ...boxFrom(Qs) }], blank: true, ...ax }),
    answer: `Min ${Qs.min}, Q₁ ${d1(Qs.q1)}, median ${d1(Qs.med)}, Q₃ ${d1(Qs.q3)}, max ${Qs.max}`,
    working: [`In order: ${sortN(data).join(", ")}`, "Box from Q₁ to Q₃ with a line at the median; whiskers to the min and max."],
    space: "none",
    mcEligible: false,
    tags: ["box plot", "construct"]
  });
}

function outliersQuestion() {
  const base = dataset(randInt(9, 12), 20, 40); const out = choice([randInt(70, 90), randInt(0, 4)]);
  const data = [...base, out]; const Qs = quartiles(data); const iqr = Qs.q3 - Qs.q1;
  const lo = Qs.q1 - 1.5 * iqr; const hi = Qs.q3 + 1.5 * iqr;
  const outs = sortN(data).filter(v => v < lo || v > hi);
  return q({
    type: "outliers", marks: 3,
    prompt: `Use the 1.5 × IQR rule to decide whether the data ${shuffle(data).join(", ")} contains any outliers.`,
    answer: outs.length ? `Outlier${outs.length > 1 ? "s" : ""}: ${outs.join(", ")} (outside ${d2(lo)} to ${d2(hi)})` : `No outliers (all within ${d2(lo)} to ${d2(hi)})`,
    working: [`Q₁ = ${d1(Qs.q1)}, Q₃ = ${d1(Qs.q3)}, IQR = ${d1(iqr)}`, `Lower fence ${d1(Qs.q1)} − 1.5 × ${d1(iqr)} = ${d2(lo)}`, `Upper fence ${d1(Qs.q3)} + 1.5 × ${d1(iqr)} = ${d2(hi)}`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["outliers"]
  });
}

function parallelBoxPlotsQuestion() {
  const A = quartiles(dataset(20, 30, 80)); const Bq = quartiles(dataset(20, 45, 95));
  const ax = niceAxis(Math.min(A.min, Bq.min), Math.max(A.max, Bq.max));
  const r = x => Math.round(x);
  const PA = { min: A.min, q1: r(A.q1), median: r(A.med), q3: r(A.q3), max: A.max }; const PB = { min: Bq.min, q1: r(Bq.q1), median: r(Bq.med), q3: r(Bq.q3), max: Bq.max };
  const higher = PB.median > PA.median ? "Class B" : PB.median < PA.median ? "Class A" : "neither";
  const iA = PA.q3 - PA.q1; const iB = PB.q3 - PB.q1;
  return q({
    type: "parallel-box-plots", marks: 3,
    prompt: "The parallel box plots show the test marks of two classes.",
    diagram: chart({ chartType: "box-plot", plots: [{ label: "Class A", ...PA }, { label: "Class B", ...PB }], ...ax, xLabel: "Mark" }),
    subparts: [
      { label: "(a)", prompt: "Which class has the higher median? By how much?", marks: 1, answer: higher === "neither" ? "They are equal." : `${higher}, by ${Math.abs(PB.median - PA.median)}`, working: [`Medians: A ${PA.median}, B ${PB.median}`] },
      { label: "(b)", prompt: "Compare the spread of the two classes using the IQR.", marks: 1, answer: `IQR A = ${iA}, IQR B = ${iB}: ${iA === iB ? "the same spread" : `Class ${iA > iB ? "A" : "B"} is more spread out in its middle 50%`}.`, working: [] },
      { label: "(c)", prompt: `What percentage of Class B scored more than ${PB.median}?`, marks: 1, answer: "50%", working: ["Half the data lies above the median."] }
    ],
    answer: `(a) ${higher}; (b) IQR A ${iA}, B ${iB}; (c) 50%`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["box plot", "compare"]
  });
}

function skewnessQuestion() {
  const kind = choice(["positive", "negative", "symmetric"]);
  const B = kind === "positive" ? { min: 10, q1: 14, median: 17, q3: 25, max: 42 } : kind === "negative" ? { min: 8, q1: 25, median: 33, q3: 36, max: 40 } : { min: 10, q1: 20, median: 25, q3: 30, max: 40 };
  return q({
    type: "skewness", marks: 1,
    prompt: "Describe the shape of the distribution shown by the box plot.",
    diagram: chart({ chartType: "box-plot", plots: [{ label: "", ...B }], axisMin: 0, axisMax: 45, step: 5 }),
    answer: kind === "symmetric" ? "Symmetric" : `${kind[0].toUpperCase()}${kind.slice(1)}ly skewed`,
    working: [kind === "positive" ? "The upper whisker and upper part of the box are longer: the tail is to the right." : kind === "negative" ? "The lower whisker and lower part of the box are longer: the tail is to the left." : "The median is central and the whiskers are equal."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["Symmetric", "Positively skewed", "Negatively skewed", "Bimodal"].filter(s => !s.toLowerCase().startsWith(kind === "symmetric" ? "symm" : kind)),
    tags: ["shape"]
  });
}

function standardDeviationQuestion() {
  const data = dataset(randInt(6, 10), 2, 30);
  return q({
    type: "standard-deviation", marks: 2,
    prompt: `Use a calculator to find the mean and the population standard deviation (σ) of ${data.join(", ")}, to 2 decimal places.`,
    answer: `Mean ${d2(mean(data))}, σ ≈ ${d2(sdPop(data))}`,
    working: ["Enter the data in statistics mode; read x̄ and σₓ."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`Mean ${d2(mean(data))}, σ ≈ ${d2(sdPop(data) * Math.sqrt(data.length / (data.length - 1)))}`, `Mean ${d2(medianOf(data))}, σ ≈ ${d2(sdPop(data))}`],
    tags: ["standard deviation"]
  });
}

function interpretSdQuestion() {
  const v = choice(["compare", "within"]);
  if (v === "compare") {
    const m = randInt(60, 75); const s1 = choice([3.2, 4.5, 5.1]); const s2 = choice([9.8, 12.4, 14.6]);
    const [la, lb] = shuffle(["Class A", "Class B"]);
    return q({ type: "interpret-sd", marks: 1, prompt: `${la} had a mean of ${m} with a standard deviation of ${s1}. ${lb} had a mean of ${m} with a standard deviation of ${s2}. What does this tell you?`, answer: `Both have the same average, but ${la}'s results are more consistent (clustered closer to the mean); ${lb}'s are more spread out.`, working: ["A smaller standard deviation means the data are closer to the mean."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["interpret"] });
  }
  const m = randInt(50, 80); const s = randInt(4, 10); const x = choice([m + 2 * s, m - s, m + s]);
  const k = (x - m) / s;
  return q({ type: "interpret-sd", marks: 1, prompt: `A test had a mean of ${m} and a standard deviation of ${s}. How many standard deviations from the mean is a mark of ${x}?`, answer: `${Math.abs(k)} standard deviation${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "above" : "below"} the mean`, working: [`(${x} − ${m}) ÷ ${s} = ${k}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${Math.abs(k)} standard deviation${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "below" : "above"} the mean`, `${Math.abs(x - m)} standard deviations ${k > 0 ? "above" : "below"} the mean`], tags: ["interpret"] });
}

function effectOnStatisticsQuestion() {
  const v = choice(["add", "outlier", "multiply"]);
  const k = randInt(3, 10);
  if (v === "add") return q({ type: "effect-on-statistics", marks: 2, prompt: `Every score in a dataset is increased by ${k}. What happens to the mean, the median and the standard deviation?`, answer: `The mean and median each increase by ${k}; the standard deviation is unchanged.`, working: ["Shifting all the data moves the centre but not the spread."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["effect"] });
  if (v === "multiply") return q({ type: "effect-on-statistics", marks: 2, prompt: `Every score in a dataset is doubled. What happens to the mean, the IQR and the standard deviation?`, answer: "All three are doubled.", working: ["Scaling the data scales the centre and the spread."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["effect"] });
  const data = dataset(8, 20, 30); const big = 95; const d2a = [...data, big];
  return q({ type: "effect-on-statistics", marks: 2, prompt: `The data ${data.join(", ")} has mean ${d2(mean(data))}, median ${d1(medianOf(data))} and σ ≈ ${d2(sdPop(data))}. The value ${big} is added. Find the new mean, median and σ, and comment.`, answer: `Mean ${d2(mean(d2a))}, median ${d1(medianOf(d2a))}, σ ≈ ${d2(sdPop(d2a))}: the outlier changes the mean and SD a lot but the median only a little.`, working: ["Recalculate with the calculator."], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["effect", "outliers"] });
}

function compareDatasetsQuestion() {
  const A = dataset(10, 40, 70); const B = dataset(10, 50, 90);
  const mA = mean(A); const mB = mean(B); const sA = sdPop(A); const sB = sdPop(B);
  return q({
    type: "compare-datasets", marks: 3,
    prompt: `Two basketball players' points over 10 games are shown in the table. Compare their performances using the mean and standard deviation.`,
    table: { headerRow: true, rows: [["Player", ...Array.from({ length: 10 }, (_, i) => `G${i + 1}`)], ["Ari", ...A.map(String)], ["Bo", ...B.map(String)]] },
    answer: `Ari: mean ${d1(mA)}, σ ${d2(sA)}; Bo: mean ${d1(mB)}, σ ${d2(sB)}. ${mB > mA ? "Bo" : "Ari"} scores more on average; ${sA < sB ? "Ari" : "Bo"} is more consistent.`,
    working: ["Use the calculator for each player."],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["compare"]
  });
}

const GENERATORS = {
  "quartiles-iqr-list": quartilesIqrListQuestion,
  "quartiles-stem-leaf": quartilesStemLeafQuestion,
  "five-number-summary": fiveNumberSummaryQuestion,
  "read-box-plot": readBoxPlotQuestion,
  "draw-box-plot": drawBoxPlotQuestion,
  "outliers": outliersQuestion,
  "parallel-box-plots": parallelBoxPlotsQuestion,
  "skewness": skewnessQuestion,
  "standard-deviation": standardDeviationQuestion,
  "interpret-sd": interpretSdQuestion,
  "effect-on-statistics": effectOnStatisticsQuestion,
  "compare-datasets": compareDatasetsQuestion
};

export function getDataAnalysisAQuestionTypes() { return TYPE_LIST; }
export function generateDataAnalysisAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
