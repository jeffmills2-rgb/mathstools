/*
  Mills Maths Tools — Stage 2 Question Bank: Data B
  --------------------------------------------------
  question-banks/stage-2/data-b/index.js

  NSW Mathematics K–10 (2022), Stage 2:
    MA2-DATA-01  construct graphs using a given many-to-one scale
    MA2-DATA-02  interpret and compare data; check statements against data

  Big ideas:
    - a SCALE counts in steps (2s, 5s, 10s) so big numbers fit; a column
      halfway between two lines is halfway between their values;
    - in a pictogram with a key, one symbol stands for several — half a
      symbol is half of that;
    - data answers questions: a claim is only true if the data shows it.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { stats, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";
import { CONTEXTS } from "../data-a/index.js";

const TOPIC = "Data B";
const q1 = makeStage2(TOPIC, "MA2-DATA-01");
const q2 = makeStage2(TOPIC, "MA2-DATA-02");

const TYPE_LIST = [
  { id: "scale-column-read", label: "Read a column graph with a scale of 2, 5 or 10" },
  { id: "scale-compare", label: "Compare using a scale" },
  { id: "pictogram-key", label: "Pictograms with a key" },
  { id: "pictogram-draw", label: "How many symbols?" },
  { id: "choose-scale", label: "Choose a good scale" },
  { id: "draw-scaled-graph", label: "Draw a column graph with a scale" },
  { id: "true-false", label: "Is the statement true?" },
  { id: "compare-groups", label: "Compare two classes" },
  { id: "table-to-graph", label: "Which graph matches the table?" },
  { id: "dot-plot-compare", label: "Dot plots: most, fewest, how many" }
];

function scaled(steps = [2, 5, 10], k = 4) {
  const ctx = choice(CONTEXTS); const step = choice(steps); const cats = ctx.cats.slice(0, k);
  let values; do { values = cats.map(() => randInt(1, 8) * step + (step > 2 && Math.random() < 0.3 ? step / 2 : 0)); } while (new Set(values).size < k || values.some(v => v % 1));
  return { ...ctx, cats, values, step };
}
const column = (d, extra = {}) => stats({ chartType: "column", categories: d.cats, values: d.values, yStep: d.step, yLabel: `Number of ${d.unit}`, xLabel: d.head, title: d.title, ...extra });

function scaleColumnReadQuestion() {
  const d = scaled(); const i = randInt(0, d.cats.length - 1);
  return q2({ type: "scale-column-read", marks: 1, prompt: `The scale goes up in ${d.step}s. How many ${d.unit} chose ${d.cats[i].toLowerCase()}?`, diagram: column(d), answer: String(d.values[i]), working: [`Each line is ${d.step} more.`, d.values[i] % d.step ? `The column stops halfway between lines: ${d.values[i]}.` : `The column reaches ${d.values[i]}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] / d.step), String(d.values[i] + d.step), String(d.values[i] - (d.step > 2 ? d.step / 2 : 1))].filter(x => x !== String(d.values[i]) && Number(x) > 0), tags: ["column graph", "scale"] });
}

function scaleCompareQuestion() {
  const d = scaled([2, 5, 10]); const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2); const [a, b] = d.values[i] > d.values[j] ? [i, j] : [j, i];
  if (Math.random() < 0.5) return q2({ type: "scale-compare", marks: 2, prompt: `How many more ${d.unit} chose ${d.cats[a].toLowerCase()} than ${d.cats[b].toLowerCase()}?`, diagram: column(d), answer: String(d.values[a] - d.values[b]), working: [`${d.cats[a]}: ${d.values[a]}. ${d.cats[b]}: ${d.values[b]}.`, `${d.values[a]} − ${d.values[b]} = ${d.values[a] - d.values[b]}`], space: SPACE_SIZES.SMALL, mcDistractors: [String((d.values[a] - d.values[b]) / d.step), String(d.values[a] + d.values[b]), String(d.values[a] - d.values[b] + d.step)].filter(x => x !== String(d.values[a] - d.values[b])), tags: ["column graph", "compare"] });
  const t = d.values.reduce((x, y) => x + y, 0);
  return q2({ type: "scale-compare", marks: 2, prompt: `How many ${d.unit} were surveyed altogether?`, diagram: column(d), answer: String(t), working: [`${d.values.join(" + ")} = ${t}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(t / d.step), String(t + d.step), String(t - d.step)], tags: ["column graph", "total"] });
}

function pictogramKeyQuestion() {
  const ctx = choice(CONTEXTS); const per = choice([2, 4, 5, 10]); const cats = ctx.cats.slice(0, 4);
  let values; do { values = cats.map(() => randInt(1, 6) * per + (per % 2 === 0 && Math.random() < 0.4 ? per / 2 : 0)); } while (new Set(values).size < 4);
  const i = randInt(0, 3);
  return q2({ type: "pictogram-key", marks: 1, prompt: `Use the key. How many ${ctx.unit} chose ${cats[i].toLowerCase()}?`, diagram: stats({ chartType: "pictogram", categories: cats, values, perSymbol: per, unit: ctx.unit, title: ctx.title }), answer: String(values[i]), working: [`Each symbol = ${per}${per % 2 === 0 ? `, half a symbol = ${per / 2}` : ""}.`, `${Math.floor(values[i] / per)} × ${per}${values[i] % per ? ` + ${per / 2}` : ""} = ${values[i]}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(Math.ceil(values[i] / per)), String(values[i] + per), String(values[i] - (per / 2 || 1))].filter(x => x !== String(values[i])), tags: ["pictogram", "key"] });
}

function pictogramDrawQuestion() {
  const per = choice([2, 5, 10]); const n = randInt(2, 7); const half = per === 2 || per === 10 ? Math.random() < 0.5 : false;
  const v = n * per + (half ? per / 2 : 0);
  return q1({ type: "pictogram-draw", marks: 1, prompt: `In a pictogram, one symbol stands for ${per} students. How many symbols are needed to show ${v} students?`, answer: half ? `${n} and a half` : String(n), working: [`${v} ÷ ${per} = ${n}${half ? " and a half" : ""}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(v), String(n + 1), half ? String(n) : `${n} and a half`], tags: ["pictogram", "construct"] });
}

function chooseScaleQuestion() {
  const [values, best] = choice([[[12, 18, 20, 16], "2s"], [[25, 40, 15, 35], "5s"], [[60, 90, 40, 70], "10s"], [[8, 14, 10, 6], "2s"], [[45, 30, 50, 20], "5s"], [[80, 100, 30, 50], "10s"]]);
  return q1({ type: "choose-scale", marks: 1, prompt: `The data is ${values.join(", ")}. Which scale is best for a column graph: counting by 1s, 2s, 5s or 10s?`, answer: best, working: ["Choose a scale that makes every number easy to find and fits on the graph."], space: SPACE_SIZES.SMALL, mcDistractors: ["1s", "2s", "5s", "10s"].filter(x => x !== best), tags: ["scale"] });
}

function drawScaledGraphQuestion() {
  const d = scaled([2, 5]);
  return q1({ type: "draw-scaled-graph", marks: 3, prompt: `Draw a column graph of the data. Use a scale of ${d.step}s. Add a title and labels.`, table: { headerRow: true, rows: [[d.head, ...d.cats], ["Number", ...d.values.map(String)]] }, diagram: column(d, { blank: true, yMax: Math.ceil(Math.max(...d.values) / d.step) * d.step + d.step }), answer: `Columns: ${d.cats.map((c, k) => `${c} ${d.values[k]}`).join(", ")}; title e.g. "${d.title}".`, working: [`A value halfway between two lines (like ${d.step / 2} more) stops halfway.`], space: "none", mcEligible: false, tags: ["construct", "scale"] });
}

function trueFalseQuestion() {
  const d = scaled([2, 5]);
  const mx = d.cats[d.values.indexOf(Math.max(...d.values))]; const mn = d.cats[d.values.indexOf(Math.min(...d.values))];
  const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2);
  const claims = [
    [`${mx} was the most popular.`, true], [`${mn} was the most popular.`, false],
    [`${d.cats[i]} had ${d.values[i]} ${d.unit}.`, true], [`${d.cats[i]} had ${d.values[i] + d.step} ${d.unit}.`, false],
    [`${d.cats[i]} had more than ${d.cats[j]}.`, d.values[i] > d.values[j]]
  ];
  const [c, t] = choice(claims);
  return q2({ type: "true-false", marks: 1, prompt: `Look at the graph. True or false: "${c}" Explain.`, diagram: column(d), answer: `${t ? "True" : "False"} — ${d.cats.map((x, k) => `${x} ${d.values[k]}`).join(", ")}.`, working: ["Check the claim against the heights of the columns."], space: SPACE_SIZES.SMALL, mcDistractors: [`${t ? "False" : "True"} — ${d.cats.map((x, k) => `${x} ${d.values[k]}`).join(", ")}.`], tags: ["interpret"] });
}

function compareGroupsQuestion() {
  const ctx = choice(CONTEXTS); const cats = ctx.cats.slice(0, 3);
  const A = cats.map(() => randInt(2, 10)); const B = cats.map(() => randInt(2, 10));
  const i = randInt(0, 2);
  const diagram = stats({ chartType: "grouped-column", categories: cats, series: [{ name: "Class 3A", values: A }, { name: "Class 3B", values: B }], yStep: 1, yLabel: `Number of ${ctx.unit}`, xLabel: ctx.head, title: ctx.title });
  if (A[i] === B[i]) return compareGroupsQuestion();
  return q2({ type: "compare-groups", marks: 2, prompt: `Which class had more ${ctx.unit} choose ${cats[i].toLowerCase()}, and by how many?`, diagram, answer: `Class ${A[i] > B[i] ? "3A" : "3B"}, by ${Math.abs(A[i] - B[i])}`, working: [`3A: ${A[i]}, 3B: ${B[i]}`], space: SPACE_SIZES.SMALL, mcDistractors: [`Class ${A[i] > B[i] ? "3B" : "3A"}, by ${Math.abs(A[i] - B[i])}`, `Class ${A[i] > B[i] ? "3A" : "3B"}, by ${A[i] + B[i]}`], tags: ["compare", "two groups"] });
}

function tableToGraphQuestion() {
  const d = scaled([2]);
  const i = randInt(0, 3); const wrong = d.values.slice(); wrong[i] += d.step;
  return q2({ type: "table-to-graph", marks: 1, prompt: `The table shows the data. The graph was drawn from it. Which ${d.head.toLowerCase()} is drawn wrongly?`, table: { headerRow: true, rows: [[d.head, ...d.cats], ["Number", ...d.values.map(String)]] }, diagram: column({ ...d, values: wrong }), answer: `${d.cats[i]} — it should be ${d.values[i]}, not ${wrong[i]}.`, working: ["Check each column against the table."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["interpret"] });
}

function dotPlotCompareQuestion() {
  const data = Array.from({ length: randInt(12, 18) }, () => randInt(1, 7));
  const counts = {}; data.forEach(x => (counts[x] = (counts[x] || 0) + 1));
  const v = choice(["more-than", "fewest", "range"]);
  const diagram = stats({ chartType: "dot-plot", data, min: 1, max: 7, xLabel: "Hours of sport each week" });
  if (v === "more-than") { const k = randInt(3, 5); const n = data.filter(x => x > k).length; return q2({ type: "dot-plot-compare", marks: 1, prompt: `How many students did more than ${k} hours of sport?`, diagram, answer: String(n), working: [`Count the dots to the right of ${k}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n + (counts[k] || 1)), String(data.length - n), String(n + 1)].filter(x => x !== String(n)), tags: ["dot plot"] }); }
  if (v === "range") { const lo = Math.min(...data); const hi = Math.max(...data); return q2({ type: "dot-plot-compare", marks: 1, prompt: "What is the smallest value and the largest value shown?", diagram, answer: `smallest ${lo}, largest ${hi}`, working: ["Find the dots furthest left and furthest right."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["dot plot"] }); }
  const minC = Math.min(...Object.values(counts)); const f = Object.keys(counts).filter(k => counts[k] === minC);
  return q2({ type: "dot-plot-compare", marks: 1, prompt: "Which value(s) had the fewest dots (not counting values with no dots)?", diagram, answer: f.join(" and "), working: ["Find the shortest stack(s)."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["dot plot"] });
}

const GENERATORS = {
  "scale-column-read": scaleColumnReadQuestion,
  "scale-compare": scaleCompareQuestion,
  "pictogram-key": pictogramKeyQuestion,
  "pictogram-draw": pictogramDrawQuestion,
  "choose-scale": chooseScaleQuestion,
  "draw-scaled-graph": drawScaledGraphQuestion,
  "true-false": trueFalseQuestion,
  "compare-groups": compareGroupsQuestion,
  "table-to-graph": tableToGraphQuestion,
  "dot-plot-compare": dotPlotCompareQuestion
};

export function getDataBQuestionTypes() { return TYPE_LIST; }
export function generateDataBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
