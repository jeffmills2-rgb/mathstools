/*
  Mills Maths Tools — Stage 4 Question Bank: Data Analysis
  ---------------------------------------------------------
  question-banks/data-analysis/index.js

  NSW Mathematics K–10 (2022), Stage 4, MA4-DAT-C-02:
    "analyses simple datasets using measures of centre, range and shape of
     the data"

  Content covered (docs/stage-4-syllabus-reference.md has the mapping):
    - mean, median, mode and range of a dataset, from a list, a frequency
      table, a dot plot, a stem-and-leaf plot and a column graph
    - finding a missing value from a given mean
    - outliers and their effect on the mean and median
    - describing the shape of a distribution (symmetric, skewed, bimodal,
      clusters, outliers)
    - comparing two datasets using centre and spread (back-to-back stem-and-
      leaf plots, parallel dot plots)
    - choosing the most appropriate measure of centre, and the effect of
      changing the data

  Displays come from engines/statistics/statistics-engine.js; every
  statistic is computed from the raw values the display is drawn from.

  Conventions: a mean that does not terminate is given to 1 decimal place and
  the prompt says so; "no mode" is a legitimate answer; a bimodal dataset has
  both modes listed.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, fmt, fixed, capitalise
} from "../_shared/bank-helpers.js";

import {
  mean, median, modes, range, sum, sorted, listText, discreteData, frequencyFromData,
  twoDigitData, stemLeafRows, TWO_DIGIT_CONTEXTS, DISCRETE_CONTEXTS
} from "../_shared/data-helpers.js";

const TOPIC = "Data Analysis";

const TYPE_LIST = [
  { id: "mean", label: "Calculate the mean" },
  { id: "median", label: "Find the median" },
  { id: "mode", label: "Find the mode" },
  { id: "range", label: "Find the range" },
  { id: "summary-statistics", label: "Mean, median, mode and range together" },
  { id: "frequency-table-stats", label: "Statistics from a frequency table" },
  { id: "dot-plot-stats", label: "Statistics from a dot plot" },
  { id: "stem-leaf-stats", label: "Statistics from a stem-and-leaf plot" },
  { id: "graph-stats", label: "Statistics from a column graph" },
  { id: "missing-value", label: "Find a missing value from the mean" },
  { id: "outliers", label: "Outliers and their effect" },
  { id: "shape", label: "Describe the shape of a distribution" },
  { id: "compare-datasets", label: "Compare two datasets" },
  { id: "choose-measure", label: "Choose the best measure of centre" },
  { id: "effect-of-change", label: "The effect of changing the data" },
  { id: "multi-part-analysis", label: "Multi-part data analysis problem" }
];

const q = spec => makeQuestion(TOPIC, spec);
const chart = config => ({ engine: "statistics-engine", config });

/* A mean as an answer string: exact if it terminates within 2 dp, else 1 dp. */
function meanText(values) {
  const m = mean(values);
  const exact = Math.abs(m * 100 - Math.round(m * 100)) < 1e-9;
  return exact ? fmt(m, 2) : fixed(m, 1);
}

function meanTerminates(values) {
  const m = mean(values);
  return Math.abs(m * 100 - Math.round(m * 100)) < 1e-9;
}

function modeText(values) {
  const m = modes(values);
  if (!m.length) return "No mode";
  return m.join(" and ");
}

function smallList(n = randInt(5, 9), lo = 2, hi = 30) {
  return Array.from({ length: n }, () => randInt(lo, hi));
}

/* Each context carries a realistic range; lists are drawn from inside it. */
const LIST_CONTEXTS = [
  { s: "The numbers of points scored by a basketball player in her last games were", lo: 2, hi: 34 },
  { s: "The ages of the members of a chess club are", lo: 11, hi: 68 },
  { s: "The numbers of minutes Leo spent reading each day were", lo: 5, hi: 60 },
  { s: "The daily maximum temperatures (°C) for some days were", lo: 12, hi: 36 },
  { s: "The masses (kg) of some dogs at a vet clinic were", lo: 3, hi: 42 },
  { s: "The numbers of emails received each day were", lo: 0, hi: 40 }
];

/* A list from a context, optionally squeezed into a narrower window so that
   repeats (modes) are likely. */
function ctxList(ctx, n, width = null) {
  const lo = width ? randInt(ctx.lo, Math.max(ctx.lo, ctx.hi - width)) : ctx.lo;
  const hi = width ? Math.min(ctx.hi, lo + width) : ctx.hi;
  return smallList(n, lo, hi);
}

/* ── the four statistics ─────────────────────────────────── */

function meanQuestion() {
  const ctx = choice(LIST_CONTEXTS);
  let data;
  const needExact = Math.random() < 0.65;
  do { data = ctxList(ctx, randInt(5, 8)); } while (needExact && !meanTerminates(data));
  const ans = meanText(data);
  return q({
    type: "mean",
    marks: 2,
    prompt: `${ctx.s} ${listText(data)}. Calculate the mean${meanTerminates(data) ? "" : ", correct to 1 decimal place"}.`,
    answer: ans,
    working: ["Mean = sum of the values ÷ number of values", `Sum = ${data.join(" + ")} = ${sum(data)}`, `Mean = ${sum(data)} ÷ ${data.length} = ${ans}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "mean"]
  });
}

function medianQuestion() {
  const ctx = choice(LIST_CONTEXTS);
  const even = Math.random() < 0.45;
  let data;
  do { data = shuffle(ctxList(ctx, even ? choice([6, 8]) : choice([5, 7, 9]))); } while (data.join() === sorted(data).join());
  const s = sorted(data);
  const n = s.length;
  const med = median(data);
  return q({
    type: "median",
    marks: even ? 2 : 1,
    prompt: `${ctx.s} ${listText(data)}. Find the median.`,
    answer: fmt(med, 1),
    working: even
      ? [`In order: ${s.join(", ")}`, `There are ${n} values, so the median is halfway between the ${n / 2}th and ${n / 2 + 1}th: ${s[n / 2 - 1]} and ${s[n / 2]}.`, `Median = (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${fmt(med, 1)}`]
      : [`In order: ${s.join(", ")}`, `The middle (${(n + 1) / 2}th) value is ${med}.`],
    space: even ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    mcDistractors: even ? undefined : [String(data[(n - 1) / 2]), fmt(mean(data), 1), String(s[(n - 1) / 2 + 1])],
    tags: ["data", "median"]
  });
}

function modeQuestion() {
  const kind = choice(["single", "single", "bimodal", "none"]);
  let data;
  const ctx = choice(LIST_CONTEXTS);
  for (let i = 0; i < 300; i++) {
    const base = ctxList(ctx, randInt(6, 9), kind === "none" ? null : 14);
    const m = modes(base);
    if ((kind === "single" && m.length === 1) || (kind === "bimodal" && m.length === 2) || (kind === "none" && m.length === 0)) { data = base; break; }
  }
  if (!data) return modeQuestion();
  const ans = modeText(data);
  return q({
    type: "mode",
    marks: 1,
    prompt: `${ctx.s} ${listText(data)}. What is the mode?`,
    answer: ans,
    working: [
      kind === "none" ? "Every value occurs only once." : kind === "bimodal" ? `Two values occur most often: ${modes(data).join(" and ")}.` : `The value ${modes(data)[0]} occurs most often.`,
      ans
    ],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [fmt(median(data), 1), String(Math.max(...data)), kind === "none" ? String(data[0]) : "No mode", String(range(data)), String(Math.min(...data)), String(data[1])],
    tags: ["data", "mode"]
  });
}

function rangeQuestion() {
  const ctx = choice(LIST_CONTEXTS);
  const withNegatives = /temperatures/.test(ctx.s) && Math.random() < 0.5;
  const data = withNegatives ? smallList(randInt(6, 8), -6, 14) : ctxList(ctx, randInt(6, 9));
  const show = data.map(v => (v < 0 ? `−${-v}` : String(v)));
  const r = range(data);
  const mn = Math.min(...data);
  return q({
    type: "range",
    marks: 1,
    prompt: `${withNegatives ? "The overnight minimum temperatures (°C) in Canberra were" : ctx.s} ${show.join(", ")}. Find the range.`,
    answer: String(r),
    working: ["Range = highest − lowest", `Range = ${Math.max(...data)} − ${mn < 0 ? `(−${-mn})` : mn} = ${r}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(Math.max(...data)), String(Math.max(...data) + mn), fmt(mean(data), 1)],
    tags: ["data", "range"]
  });
}

function summaryStatisticsQuestion() {
  const ctx = choice(LIST_CONTEXTS);
  let data;
  do { data = ctxList(ctx, randInt(7, 10), 18); } while (!meanTerminates(data) || modes(data).length !== 1);
  return q({
    type: "summary-statistics",
    marks: 4,
    prompt: `${ctx.s} ${listText(data)}.`,
    subparts: [
      { label: "(a)", prompt: "Find the mean.", marks: 1, answer: meanText(data), working: [`${sum(data)} ÷ ${data.length} = ${meanText(data)}`] },
      { label: "(b)", prompt: "Find the median.", marks: 1, answer: fmt(median(data), 1), working: [`In order: ${sorted(data).join(", ")}`, `Median = ${fmt(median(data), 1)}`] },
      { label: "(c)", prompt: "Find the mode.", marks: 1, answer: modeText(data), working: [`${modeText(data)} occurs most often.`] },
      { label: "(d)", prompt: "Find the range.", marks: 1, answer: String(range(data)), working: [`${Math.max(...data)} − ${Math.min(...data)} = ${range(data)}`] }
    ],
    answer: `(a) ${meanText(data)}; (b) ${fmt(median(data), 1)}; (c) ${modeText(data)}; (d) ${range(data)}`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "summary statistics", "multi-part"]
  });
}

/* ── from displays ───────────────────────────────────────── */

function frequencyTableStatsQuestion() {
  let ctx; let data; let rows;
  do {
    ({ ctx, data } = discreteData({ n: randInt(15, 25) }));
    rows = frequencyFromData(data, ctx.lo, ctx.hi);
  } while (modes(data).length !== 1);
  const ask = choice(["mean", "median", "mode", "range"]);
  const fx = rows.map(r => r.value * r.freq);
  const table = {
    headerRow: true,
    rows: [[capitalise(ctx.name), "Frequency"], ...rows.map(r => [String(r.value), String(r.freq)]), ["Total", String(data.length)]]
  };
  const n = data.length;
  const s = sorted(data);
  const specs = {
    mean: { a: meanText(data), m: 3, p: `Calculate the mean ${ctx.name}${meanTerminates(data) ? "" : ", correct to 1 decimal place"}.`,
      w: ["Add an f × x column: " + rows.map((r, i) => `${r.value} × ${r.freq} = ${fx[i]}`).join(", "), `Σfx = ${sum(fx)}, Σf = ${n}`, `Mean = ${sum(fx)} ÷ ${n} = ${meanText(data)}`] },
    median: { a: fmt(median(data), 1), m: 2, p: `Find the median ${ctx.name}.`,
      w: [n % 2 ? `There are ${n} values; the median is the ${(n + 1) / 2}th value.` : `There are ${n} values; the median is halfway between the ${n / 2}th and ${n / 2 + 1}th values.`, "Count down the frequency column to find it.", `Median = ${fmt(median(data), 1)}`] },
    mode: { a: String(modes(data)[0]), m: 1, p: `What is the mode?`, w: [`${modes(data)[0]} has the highest frequency.`] },
    range: { a: String(s[n - 1] - s[0]), m: 1, p: "What is the range?", w: [`Lowest value with a frequency: ${s[0]}; highest: ${s[n - 1]}.`, `Range = ${s[n - 1]} − ${s[0]} = ${s[n - 1] - s[0]}`] }
  };
  const sp = specs[ask];
  return q({
    type: "frequency-table-stats",
    marks: sp.m,
    prompt: `The frequency table shows the ${ctx.name} for some ${ctx.unit}. ${sp.p}`,
    table,
    answer: sp.a,
    working: sp.w,
    space: sp.m > 1 ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    ...(ask === "mode" ? { mcDistractors: [String(Math.max(...rows.map(r => r.freq))), fmt(median(data), 1), ...rows.map(r => String(r.value))] } : {}),
    tags: ["data", "frequency table", ask]
  });
}

function dotPlotStatsQuestion() {
  let ctx; let data;
  do { ({ ctx, data } = discreteData({ n: randInt(11, 19) })); } while (modes(data).length !== 1);
  const ask = choice(["median", "mode", "range", "mean"]);
  const ans = ask === "median" ? fmt(median(data), 1) : ask === "mode" ? String(modes(data)[0]) : ask === "range" ? String(range(data)) : meanText(data);
  const work = {
    median: [`There are ${data.length} dots. In order, the middle value is ${fmt(median(data), 1)}.`],
    mode: [`The tallest stack of dots is at ${modes(data)[0]}.`],
    range: [`${Math.max(...data)} − ${Math.min(...data)} = ${range(data)}`],
    mean: [`Sum of all values = ${sum(data)}`, `Mean = ${sum(data)} ÷ ${data.length} = ${ans}`]
  }[ask];
  const n0 = Number(ans);
  return q({
    type: "dot-plot-stats",
    ...(ask === "mean" ? {} : { mcDistractors: [String(n0 + 1), String(n0 === 0 ? n0 + 2 : n0 - 1), String(Math.max(...data)), String(data.length)] }),
    marks: ask === "mean" || ask === "median" ? 2 : 1,
    prompt: `The dot plot shows the ${ctx.name} for some ${ctx.unit}. Find the ${ask}${ask === "mean" && !meanTerminates(data) ? ", correct to 1 decimal place" : ""}.`,
    diagram: chart({ chartType: "dot-plot", data, min: ctx.lo, max: ctx.hi, xLabel: capitalise(ctx.name) }),
    answer: ans,
    working: work,
    space: SPACE_SIZES.SMALL,
    tags: ["data", "dot plot", ask]
  });
}

function stemLeafStatsQuestion() {
  let ctx; let data;
  do { ({ ctx, data } = twoDigitData({ n: randInt(11, 17) })); } while (modes(data).length > 1);
  const rows = stemLeafRows(data);
  const ex = rows.find(r => r.leaves.length);
  const ask = choice(["median", "range", "mode", "median"]);
  const s = sorted(data);
  const n = s.length;
  const ans = ask === "median" ? fmt(median(data), 1) : ask === "range" ? String(range(data)) : modeText(data);
  return q({
    type: "stem-leaf-stats",
    marks: ask === "median" ? 2 : 1,
    prompt: `The stem-and-leaf plot shows ${ctx.name}. Find the ${ask}.`,
    diagram: chart({ chartType: "stem-leaf", rows, key: `${ex.stem} | ${ex.leaves[0]} = ${ex.stem * 10 + ex.leaves[0]}` }),
    answer: ans,
    working: ask === "median"
      ? [`There are ${n} values, already in order.`, n % 2 ? `The ${(n + 1) / 2}th value is ${median(data)}.` : `Halfway between the ${n / 2}th (${s[n / 2 - 1]}) and ${n / 2 + 1}th (${s[n / 2]}): ${fmt(median(data), 1)}`]
      : ask === "range" ? [`Smallest ${s[0]}, largest ${s[n - 1]}`, `Range = ${s[n - 1]} − ${s[0]} = ${range(data)}`]
        : [modes(data).length ? `The repeated leaf ${modes(data)[0] % 10} on stem ${Math.floor(modes(data)[0] / 10)} is the most common value.` : "No value occurs more than once.", ans],
    space: SPACE_SIZES.SMALL,
    ...(ask === "mode" ? { mcDistractors: [String(s[0]), fmt(median(data), 1), modes(data).length ? "No mode" : String(s[n - 1])] } : {}),
    tags: ["data", "stem-and-leaf", ask]
  });
}

function graphStatsQuestion() {
  let ctx; let data; let rows;
  do {
    ({ ctx, data } = discreteData({ n: randInt(15, 26), ctx: choice(DISCRETE_CONTEXTS) }));
    rows = frequencyFromData(data, ctx.lo, ctx.hi);
  } while (modes(data).length !== 1 || Math.max(...rows.map(r => r.freq)) > 12);
  const ask = choice(["total", "mean", "mode", "median"]);
  const ans = ask === "total" ? String(data.length) : ask === "mean" ? meanText(data) : ask === "mode" ? String(modes(data)[0]) : fmt(median(data), 1);
  const n0 = Number(ans);
  return q({
    type: "graph-stats",
    ...(ask === "mode" ? { mcDistractors: [String(Math.max(...rows.map(r => r.freq))), ...rows.map(r => String(r.value))] } : ask === "total" ? { mcDistractors: [String(n0 - 1), String(n0 + 1), String(rows.length)] } : {}),
    marks: ask === "mean" ? 3 : ask === "median" ? 2 : 1,
    prompt: `The column graph shows the ${ctx.name} for a group of ${ctx.unit}. ${ask === "total" ? `How many ${ctx.unit} are in the group?` : `Find the ${ask}${ask === "mean" && !meanTerminates(data) ? ", correct to 1 decimal place" : ""}.`}`,
    diagram: chart({ chartType: "column", categories: rows.map(r => String(r.value)), values: rows.map(r => r.freq), yStep: 1, yMax: Math.max(...rows.map(r => r.freq)) + 1, xLabel: capitalise(ctx.name), yLabel: "Frequency" }),
    answer: ans,
    working: ask === "total" ? [`Add the column heights: ${rows.map(r => r.freq).join(" + ")} = ${data.length}`]
      : ask === "mean" ? [`Σfx = ${rows.map(r => `${r.value}×${r.freq}`).join(" + ")} = ${sum(data)}`, `Mean = ${sum(data)} ÷ ${data.length} = ${ans}`]
        : ask === "mode" ? [`The tallest column is ${modes(data)[0]}.`]
          : [`${data.length} values; count along the columns to the middle.`, `Median = ${ans}`],
    space: ask === "mean" ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    tags: ["data", "column graph", ask]
  });
}

/* ── reasoning with the statistics ───────────────────────── */

function missingValueQuestion() {
  const n = randInt(4, 7);
  const target = randInt(8, 30);
  let known; let missing;
  do {
    known = smallList(n - 1, Math.max(1, target - 12), target + 12);
    missing = target * n - sum(known);
  } while (missing < 1 || missing > 60);
  const ctx = choice(["test scores", "numbers of goals", "ages", "numbers of laps swum"]);
  return q({
    type: "missing-value",
    marks: 2,
    prompt: `The mean of ${n} ${ctx} is ${target}. ${n - 1} of them are ${listText(known)}. Find the missing value.`,
    answer: String(missing),
    working: [`Total of all ${n} values = ${n} × ${target} = ${n * target}`, `Known total = ${sum(known)}`, `Missing value = ${n * target} − ${sum(known)} = ${missing}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "mean", "reverse"]
  });
}

function outliersQuestion() {
  let data;
  do { data = smallList(randInt(6, 8), 22, 38); } while (range(data) < 6);
  const high = Math.random() < 0.65;
  const outlier = high ? Math.max(...data) + randInt(35, 70) : Math.min(...data) - randInt(17, 20);
  const all = shuffle([...data, outlier]);
  const m1 = mean(all); const m0 = mean(data);
  const md1 = median(all); const md0 = median(data);
  // The lesson is that the mean moves more than the median; make sure it does.
  if (Math.abs(m1 - m0) <= Math.abs(md1 - md0) + 1) return outliersQuestion();
  return q({
    type: "outliers",
    marks: 3,
    prompt: `Consider the data ${listText(all)}. (a) Identify the outlier. (b) Find the mean with and without the outlier, correct to 1 decimal place. (c) Which is affected more by the outlier, the mean or the median?`,
    answer: `(a) ${outlier}; (b) with ${fixed(m1, 1)}, without ${fixed(m0, 1)}; (c) the mean (the median changes only from ${fmt(md0, 1)} to ${fmt(md1, 1)})`,
    working: [
      `${outlier} is far ${high ? "above" : "below"} the rest of the data.`,
      `Mean with: ${sum(all)} ÷ ${all.length} ≈ ${fixed(m1, 1)}; without: ${sum(data)} ÷ ${data.length} ≈ ${fixed(m0, 1)}`,
      `Median with: ${fmt(md1, 1)}; without: ${fmt(md0, 1)}. The mean moves much more, because it uses the size of every value.`
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["data", "outliers", "mean", "median"]
  });
}

/* Shapes built on a 1–9 scale so the dot plot reads cleanly. */
const SHAPES = {
  "Symmetric": [1, 2, 4, 6, 4, 2, 1],
  "Positively skewed": [3, 6, 5, 3, 2, 1, 1],
  "Negatively skewed": [1, 1, 2, 3, 5, 6, 3],
  "Bimodal": [1, 5, 3, 1, 3, 5, 1]
};

function shapeQuestion() {
  const name = choice(Object.keys(SHAPES));
  const freqs = /skewed/.test(name) ? SHAPES[name].map(f => Math.max(1, f + (f > 2 ? randInt(-1, 1) : 0))) : SHAPES[name].slice();
  const start = randInt(0, 3);
  const data = [];
  freqs.forEach((f, i) => { for (let k = 0; k < f; k++) data.push(start + i); });
  const useHist = Math.random() < 0.4;
  const width = choice([5, 10]);
  const lo = choice([10, 20, 40]);
  const diagram = useHist
    ? chart({ chartType: "histogram", bins: freqs.map((f, i) => ({ lo: lo + i * width, hi: lo + (i + 1) * width, count: f })), yStep: 1, xLabel: "Score", yLabel: "Frequency" })
    : chart({ chartType: "dot-plot", data, min: start, max: start + freqs.length - 1, xLabel: "Score" });
  const why = {
    "Symmetric": "The data is evenly spread either side of a single central peak.",
    "Positively skewed": "Most of the data is at the lower end, with a tail stretching to the right (higher values).",
    "Negatively skewed": "Most of the data is at the higher end, with a tail stretching to the left (lower values).",
    "Bimodal": "There are two separate peaks (clusters) in the data."
  }[name];
  return q({
    type: "shape",
    marks: 1,
    prompt: `Describe the shape of the distribution shown.`,
    diagram,
    answer: name,
    working: [why, name],
    space: SPACE_SIZES.SMALL,
    mcDistractors: Object.keys(SHAPES).filter(k => k !== name),
    tags: ["data", "shape", useHist ? "histogram" : "dot plot"]
  });
}

function compareDatasetsQuestion() {
  const ctx = choice(TWO_DIGIT_CONTEXTS.filter(c => c.hi - c.lo >= 25));
  let A; let B;
  do {
    A = Array.from({ length: randInt(10, 13) }, () => randInt(ctx.lo, ctx.hi - 12));
    B = Array.from({ length: randInt(10, 13) }, () => randInt(ctx.lo + 8, ctx.hi));
  } while (median(B) - median(A) < 5 || range(A) === range(B));
  const groups = choice([["Class A", "Class B"], ["Boys", "Girls"], ["Before", "After"], ["Team 1", "Team 2"]]);
  const rows = stemLeafRows(B, { left: A });
  // A back-to-back key has to explain BOTH directions of reading.
  const ex = rows.find(r => r.leaves.length && r.left.length) || rows.find(r => r.leaves.length);
  const exL = ex.left.length ? ex.left[0] : 0;
  const higher = median(B) > median(A) ? groups[1] : groups[0];
  const spread = range(A) > range(B) ? groups[0] : groups[1];
  return q({
    type: "compare-datasets",
    marks: 3,
    prompt: `The back-to-back stem-and-leaf plot compares ${ctx.name} for two groups. (a) Find the median and range of each group. (b) Compare the two groups, referring to centre and spread.`,
    diagram: chart({ chartType: "stem-leaf", backToBack: true, rows, headings: groups, key: `${exL} | ${ex.stem} | ${ex.leaves[0]} means ${ex.stem * 10 + exL} (${groups[0]}) and ${ex.stem * 10 + ex.leaves[0]} (${groups[1]})` }),
    answer: `(a) ${groups[0]}: median ${fmt(median(A), 1)}, range ${range(A)}; ${groups[1]}: median ${fmt(median(B), 1)}, range ${range(B)}. (b) ${higher} has the higher median, so generally higher ${ctx.short}; ${spread} has the larger range, so its ${ctx.short} are more spread out.`,
    working: [
      `${groups[0]} (read leaves right to left from the stem): ${sorted(A).join(", ")}`,
      `${groups[1]}: ${sorted(B).join(", ")}`,
      `Medians ${fmt(median(A), 1)} and ${fmt(median(B), 1)}; ranges ${range(A)} and ${range(B)}.`
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["data", "compare", "stem-and-leaf"]
  });
}

const MEASURE_CHOICES = [
  { s: "the house prices in a street where one mansion costs far more than the others", a: "Median", why: "The median is not pulled up by the one very expensive house." },
  { s: "the most popular shoe size to stock in a shop", a: "Mode", why: "The shop needs the size that occurs most often." },
  { s: "the average of a student's five similar test marks", a: "Mean", why: "There are no outliers, so the mean uses every mark." },
  { s: "the favourite colour of students in a class", a: "Mode", why: "The data is categorical, so only the mode makes sense." },
  { s: "the typical salary at a company where the owner earns ten times anyone else", a: "Median", why: "The owner's salary is an outlier that would inflate the mean." },
  { s: "the typical number of goals scored per game by a team, with no unusual games", a: "Mean", why: "With no outliers the mean represents the data well." }
];

function chooseMeasureQuestion() {
  const c = choice(MEASURE_CHOICES);
  const withReason = Math.random() < 0.4;
  return q({
    type: "choose-measure",
    marks: withReason ? 2 : 1,
    prompt: withReason
      ? `Which measure of centre (mean, median or mode) is most suitable for ${c.s}? Explain.`
      : `Which measure of centre (mean, median or mode) is most suitable for ${c.s}?`,
    answer: withReason ? `${c.a}. ${c.why}` : c.a,
    working: [c.why],
    space: withReason ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    mcDistractors: withReason ? undefined : ["Mean", "Median", "Mode", "Range"].filter(x => x !== c.a),
    tags: ["data", "measures of centre"]
  });
}

function effectOfChangeQuestion() {
  const variant = choice(["add-constant", "add-value", "remove-value", "multiply"]);
  let data;
  do { data = smallList(randInt(5, 7), 4, 20); } while (!meanTerminates(data));
  const m = mean(data);
  if (variant === "add-constant") {
    const k = randInt(2, 9);
    return q({
      type: "effect-of-change", marks: 2,
      prompt: `The mean of ${data.length} scores is ${fmt(m, 2)} and their range is ${range(data)}. Every score is increased by ${k}. What are the new mean and range?`,
      answer: `Mean ${fmt(m + k, 2)}, range ${range(data)}`,
      working: [`Adding ${k} to every value adds ${k} to the mean: ${fmt(m, 2)} + ${k} = ${fmt(m + k, 2)}.`, "The highest and lowest both go up by the same amount, so the range does not change."],
      space: SPACE_SIZES.MEDIUM, tags: ["data", "mean", "range", "reasoning"]
    });
  }
  if (variant === "multiply") {
    return q({
      type: "effect-of-change", marks: 2,
      prompt: `The mean of a set of scores is ${fmt(m, 2)} and the range is ${range(data)}. Every score is doubled. What are the new mean and range?`,
      answer: `Mean ${fmt(2 * m, 2)}, range ${2 * range(data)}`,
      working: ["Doubling every value doubles the total, so it doubles the mean.", "It also doubles the gap between the highest and lowest values."],
      space: SPACE_SIZES.MEDIUM, tags: ["data", "mean", "range", "reasoning"]
    });
  }
  if (variant === "add-value") {
    const extra = randInt(1, 40);
    const all = [...data, extra];
    const newMean = mean(all);
    return q({
      type: "effect-of-change", marks: 2,
      prompt: `The scores ${listText(data)} have a mean of ${fmt(m, 2)}. A new score of ${extra} is added. Find the new mean${meanTerminates(all) ? "" : ", correct to 1 decimal place"}, and say whether the mean went up or down.`,
      answer: `${meanText(all)} (${newMean > m ? "up" : newMean < m ? "down" : "unchanged"})`,
      working: [`New total = ${sum(data)} + ${extra} = ${sum(all)}`, `New mean = ${sum(all)} ÷ ${all.length} = ${meanText(all)}`, extra > m ? "The new score is above the old mean, so the mean increases." : extra < m ? "The new score is below the old mean, so the mean decreases." : "The new score equals the mean, so it is unchanged."],
      space: SPACE_SIZES.MEDIUM, tags: ["data", "mean", "reasoning"]
    });
  }
  const i = randInt(0, data.length - 1);
  const rest = data.filter((_, k) => k !== i);
  return q({
    type: "effect-of-change", marks: 2,
    prompt: `The scores ${listText(data)} have a mean of ${fmt(m, 2)}. The score ${data[i]} is removed. Find the new mean${meanTerminates(rest) ? "" : ", correct to 1 decimal place"}.`,
    answer: meanText(rest),
    working: [`New total = ${sum(data)} − ${data[i]} = ${sum(rest)}`, `New mean = ${sum(rest)} ÷ ${rest.length} = ${meanText(rest)}`],
    space: SPACE_SIZES.MEDIUM, tags: ["data", "mean", "reasoning"]
  });
}

function multiPartAnalysisQuestion() {
  let ctx; let data;
  do { ({ ctx, data } = twoDigitData({ n: randInt(11, 15) })); } while (modes(data).length !== 1 || !meanTerminates(data));
  const rows = stemLeafRows(data);
  const ex = rows.find(r => r.leaves.length);
  return q({
    type: "multi-part-analysis",
    marks: 5,
    prompt: `The stem-and-leaf plot shows ${ctx.name}.`,
    diagram: chart({ chartType: "stem-leaf", rows, key: `${ex.stem} | ${ex.leaves[0]} = ${ex.stem * 10 + ex.leaves[0]}` }),
    subparts: [
      { label: "(a)", prompt: "How many values are there?", marks: 1, answer: String(data.length), working: ["Count the leaves."] },
      { label: "(b)", prompt: "Find the range.", marks: 1, answer: String(range(data)), working: [`${Math.max(...data)} − ${Math.min(...data)}`] },
      { label: "(c)", prompt: "Find the mode.", marks: 1, answer: modeText(data), working: ["The most common value."] },
      { label: "(d)", prompt: "Find the median.", marks: 1, answer: fmt(median(data), 1), working: ["The middle value of the ordered data."] },
      { label: "(e)", prompt: "Find the mean.", marks: 1, answer: meanText(data), working: [`${sum(data)} ÷ ${data.length}`] }
    ],
    answer: `(a) ${data.length}; (b) ${range(data)}; (c) ${modeText(data)}; (d) ${fmt(median(data), 1)}; (e) ${meanText(data)}`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "multi-part", "stem-and-leaf"]
  });
}

const GENERATORS = {
  mean: meanQuestion,
  median: medianQuestion,
  mode: modeQuestion,
  range: rangeQuestion,
  "summary-statistics": summaryStatisticsQuestion,
  "frequency-table-stats": frequencyTableStatsQuestion,
  "dot-plot-stats": dotPlotStatsQuestion,
  "stem-leaf-stats": stemLeafStatsQuestion,
  "graph-stats": graphStatsQuestion,
  "missing-value": missingValueQuestion,
  outliers: outliersQuestion,
  shape: shapeQuestion,
  "compare-datasets": compareDatasetsQuestion,
  "choose-measure": chooseMeasureQuestion,
  "effect-of-change": effectOfChangeQuestion,
  "multi-part-analysis": multiPartAnalysisQuestion
};

void sample;

export function getDataAnalysisQuestionTypes() {
  return TYPE_LIST;
}

export function generateDataAnalysisQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
