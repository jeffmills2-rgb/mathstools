/*
  Mills Maths Tools — Stage 2 Question Bank: Data A
  --------------------------------------------------
  question-banks/stage-2/data-a/index.js

  NSW Mathematics K–10 (2022), Stage 2:
    MA2-DATA-01  collect data; tally; construct graphs (one-to-one scales)
    MA2-DATA-02  interpret data in tables, dot plots and column graphs

  Big ideas:
    - a tally groups marks in fives so they are quick to count;
    - a table, a column graph, a pictogram and a dot plot can all show the
      SAME data — each column or row of symbols is a count;
    - to read a graph: read the title and labels first, then compare.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, stats, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Data A";
const q1 = makeStage2(TOPIC, "MA2-DATA-01");
const q2 = makeStage2(TOPIC, "MA2-DATA-02");

const TYPE_LIST = [
  { id: "read-tally", label: "Read a tally chart" },
  { id: "complete-tally", label: "Complete the totals" },
  { id: "tally-from-list", label: "Make a tally from a list" },
  { id: "read-column-graph", label: "Read a column graph" },
  { id: "compare-column-graph", label: "Most, least and how many more" },
  { id: "read-pictogram", label: "Read a pictogram (one symbol = one)" },
  { id: "read-dot-plot", label: "Read a dot plot" },
  { id: "read-table", label: "Read a table" },
  { id: "draw-column-graph", label: "Draw a column graph" },
  { id: "survey-question", label: "Ask a survey question" }
];

const CONTEXTS = [
  { title: "Favourite fruit", ask: "What is your favourite fruit?", head: "Fruit", unit: "students", cats: ["Apple", "Banana", "Grapes", "Mango", "Orange"] },
  { title: "Favourite sport", ask: "What is your favourite sport?", head: "Sport", unit: "students", cats: ["Soccer", "Netball", "Cricket", "Swimming", "Tennis"] },
  { title: "How we get to school", ask: "How do you get to school?", head: "Transport", unit: "students", cats: ["Walk", "Car", "Bus", "Bike", "Train"] },
  { title: "Pets at home", ask: "What pet do you have?", head: "Pet", unit: "students", cats: ["Dog", "Cat", "Fish", "Bird", "None"] },
  { title: "Favourite colour", ask: "What is your favourite colour?", head: "Colour", unit: "students", cats: ["Red", "Blue", "Green", "Yellow", "Purple"] }
];

function dataset(k = 4, lo = 1, hi = 12) {
  const ctx = choice(CONTEXTS); const cats = ctx.cats.slice(0, k);
  let values; do { values = cats.map(() => randInt(lo, hi)); } while (new Set(values).size < k);
  return { ...ctx, cats, values };
}
const column = (d, extra = {}) => stats({ chartType: "column", categories: d.cats, values: d.values, yStep: 1, yLabel: `Number of ${d.unit}`, xLabel: d.head, title: d.title, ...extra });

function readTallyQuestion() {
  const d = dataset(4, 3, 14); const i = randInt(0, 3);
  return q2({ type: "read-tally", marks: 1, prompt: `${d.title}: how many ${d.unit} chose ${d.cats[i].toLowerCase()}?`, diagram: mani({ diagramType: "tally", heads: [d.head, "Tally"], rows: d.cats.map((c, k) => ({ label: c, count: d.values[k] })) }), answer: String(d.values[i]), working: ["Count each bundle of 5, then the single marks.", `${Math.floor(d.values[i] / 5)} fives and ${d.values[i] % 5} more = ${d.values[i]}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] + 1), String(d.values[i] - 1), String(Math.floor(d.values[i] / 5) + (d.values[i] % 5))].filter(x => x !== String(d.values[i]) && x !== "0"), tags: ["tally"] });
}

function completeTallyQuestion() {
  const d = dataset(4, 3, 14);
  return q1({ type: "complete-tally", marks: 2, prompt: "Write the total for each row. How many altogether?", diagram: mani({ diagramType: "tally", heads: [d.head, "Tally", "Total"], rows: d.cats.map((c, k) => ({ label: c, count: d.values[k], total: null })) }), answer: `${d.cats.map((c, k) => `${c} ${d.values[k]}`).join(", ")}; altogether ${d.values.reduce((a, b) => a + b, 0)}`, working: [`${d.values.join(" + ")} = ${d.values.reduce((a, b) => a + b, 0)}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["tally", "totals"] });
}

function tallyFromListQuestion() {
  const ctx = choice(CONTEXTS); const cats = ctx.cats.slice(0, 3);
  const list = Array.from({ length: randInt(12, 16) }, () => choice(cats));
  const counts = cats.map(c => list.filter(x => x === c).length);
  return q1({ type: "tally-from-list", marks: 2, prompt: `Class 3M were asked "${ctx.ask}". Their answers were: ${list.join(", ")}. Make a tally chart.`, diagram: mani({ diagramType: "tally", heads: [ctx.head, "Tally", "Total"], rows: cats.map(c => ({ label: c, count: 0, total: null })) }), answer: cats.map((c, k) => `${c}: ${counts[k]}`).join(", "), working: ["Cross off each answer as you make its tally mark.", `Check: ${counts.join(" + ")} = ${list.length} answers.`], space: "none", mcEligible: false, tags: ["tally", "collect"] });
}

function readColumnGraphQuestion() {
  const d = dataset(4, 2, 10); const i = randInt(0, 3);
  return q2({ type: "read-column-graph", marks: 1, prompt: `How many ${d.unit} chose ${d.cats[i].toLowerCase()}?`, diagram: column(d), answer: String(d.values[i]), working: [`Go to the top of the ${d.cats[i]} column and read across to the scale: ${d.values[i]}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] + 1), String(d.values[i] - 1), String(Math.max(...d.values))].filter(x => x !== String(d.values[i])), tags: ["column graph"] });
}

function compareColumnGraphQuestion() {
  const d = dataset(4, 2, 10);
  const v = choice(["most", "least", "more", "total"]);
  const mx = d.cats[d.values.indexOf(Math.max(...d.values))]; const mn = d.cats[d.values.indexOf(Math.min(...d.values))];
  if (v === "most" || v === "least") { const a = v === "most" ? mx : mn; return q2({ type: "compare-column-graph", marks: 1, prompt: `Which ${d.head.toLowerCase()} was chosen ${v === "most" ? "the most" : "the least"}?`, diagram: column(d), answer: a, working: [v === "most" ? "The tallest column." : "The shortest column."], space: SPACE_SIZES.SMALL, mcDistractors: d.cats.filter(c => c !== a).slice(0, 3), tags: ["column graph", "compare"] }); }
  if (v === "more") { const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2); const [a, b] = d.values[i] > d.values[j] ? [i, j] : [j, i]; return q2({ type: "compare-column-graph", marks: 1, prompt: `How many more ${d.unit} chose ${d.cats[a].toLowerCase()} than ${d.cats[b].toLowerCase()}?`, diagram: column(d), answer: String(d.values[a] - d.values[b]), working: [`${d.values[a]} − ${d.values[b]} = ${d.values[a] - d.values[b]}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[a] + d.values[b]), String(d.values[a]), String(d.values[a] - d.values[b] + 1)], tags: ["column graph", "compare"] }); }
  const t = d.values.reduce((a, b) => a + b, 0);
  return q2({ type: "compare-column-graph", marks: 1, prompt: `How many ${d.unit} were asked altogether?`, diagram: column(d), answer: String(t), working: [`${d.values.join(" + ")} = ${t}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(t + 1), String(t - 2), String(d.cats.length)], tags: ["column graph", "total"] });
}

function readPictogramQuestion() {
  const d = dataset(4, 1, 8); const i = randInt(0, 3);
  return q2({ type: "read-pictogram", marks: 1, prompt: `Each symbol stands for 1 student. How many chose ${d.cats[i].toLowerCase()}?`, diagram: stats({ chartType: "pictogram", categories: d.cats, values: d.values, perSymbol: 1, unit: "student", title: d.title }), answer: String(d.values[i]), working: [`Count the symbols in the ${d.cats[i]} row.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] + 1), String(d.values[i] - 1 || d.values[i] + 2), String(Math.max(...d.values))].filter(x => x !== String(d.values[i])), tags: ["pictogram"] });
}

function readDotPlotQuestion() {
  const ctx = choice([{ name: "Number of pets", lo: 0, hi: 5 }, { name: "Number of siblings", lo: 0, hi: 4 }, { name: "Goals scored", lo: 0, hi: 6 }, { name: "Books read this week", lo: 0, hi: 5 }]);
  const data = Array.from({ length: randInt(10, 16) }, () => randInt(ctx.lo, ctx.hi));
  const counts = {}; data.forEach(x => (counts[x] = (counts[x] || 0) + 1));
  const top = Math.max(...Object.values(counts)); const modes = Object.keys(counts).filter(k => counts[k] === top);
  const v = modes.length === 1 && Math.random() < 0.5 ? "most" : "count";
  const diagram = stats({ chartType: "dot-plot", data, min: ctx.lo, max: ctx.hi, xLabel: ctx.name });
  if (v === "most") return q2({ type: "read-dot-plot", marks: 1, prompt: "Each dot is one student. Which value was the most common?", diagram, answer: modes[0], working: ["The tallest stack of dots."], space: SPACE_SIZES.SMALL, mcDistractors: Object.keys(counts).filter(k => k !== modes[0]).slice(0, 3), tags: ["dot plot"] });
  const k = choice(Object.keys(counts));
  return q2({ type: "read-dot-plot", marks: 1, prompt: `Each dot is one student. How many students had ${k}? How many students are shown altogether?`, diagram, answer: `${counts[k]}; ${data.length} altogether`, working: [`Count the dots above ${k}. Then count every dot.`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["dot plot"] });
}

function readTableQuestion() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]; const vals = days.map(() => randInt(3, 20));
  const i = randInt(0, 4); const v = choice(["read", "most", "diff"]);
  const table = { headerRow: true, rows: [["Day", ...days], ["Books", ...vals.map(String)]] };
  if (v === "read") return q2({ type: "read-table", marks: 1, prompt: `The table shows books borrowed from the library. How many books were borrowed on ${days[i]}?`, table, answer: String(vals[i]), working: [`Find ${days[i]} and read down.`], space: SPACE_SIZES.SMALL, mcDistractors: vals.filter((_, k) => k !== i).map(String).slice(0, 3), tags: ["table"] });
  if (v === "most") { const m = days[vals.indexOf(Math.max(...vals))]; return q2({ type: "read-table", marks: 1, prompt: "On which day were the most books borrowed?", table, answer: m, working: ["Find the biggest number."], space: SPACE_SIZES.SMALL, mcDistractors: days.filter(d => d !== m).slice(0, 3), tags: ["table"] }); }
  const j = (i + 1) % 5;
  return q2({ type: "read-table", marks: 1, prompt: `What is the difference between ${days[i]} and ${days[j]}?`, table, answer: String(Math.abs(vals[i] - vals[j])), working: [`${Math.max(vals[i], vals[j])} − ${Math.min(vals[i], vals[j])}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(vals[i] + vals[j]), String(Math.abs(vals[i] - vals[j]) + 1)], tags: ["table"] });
}

function drawColumnGraphQuestion() {
  const d = dataset(4, 1, 8);
  return q1({ type: "draw-column-graph", marks: 3, prompt: `Draw a column graph of the data. Give your graph a title.`, table: { headerRow: true, rows: [[d.head, ...d.cats], ["Number", ...d.values.map(String)]] }, diagram: column(d, { blank: true, yMax: Math.max(...d.values) + 1 }), answer: `Columns: ${d.cats.map((c, k) => `${c} ${d.values[k]}`).join(", ")}. Title, e.g. "${d.title}".`, working: ["Each column goes up to its number on the scale. Leave gaps between columns."], space: "none", mcEligible: false, tags: ["construct", "column graph"] });
}

function surveyQuestionQuestion() {
  const S = [["what pets students have", "What pets do you have?"], ["how students get to school", "How do you get to school?"], ["students' favourite fruit", "What is your favourite fruit?"], ["which sport students like best", "What is your favourite sport?"]];
  const [topic, qn] = choice(S);
  return q1({ type: "survey-question", marks: 1, prompt: `Write a survey question to find out ${topic}. List some answer choices.`, answer: `For example: "${qn}" with a list of choices, including "other".`, working: ["A good survey question is clear and gives simple choices."], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["collect"] });
}

const GENERATORS = {
  "read-tally": readTallyQuestion,
  "complete-tally": completeTallyQuestion,
  "tally-from-list": tallyFromListQuestion,
  "read-column-graph": readColumnGraphQuestion,
  "compare-column-graph": compareColumnGraphQuestion,
  "read-pictogram": readPictogramQuestion,
  "read-dot-plot": readDotPlotQuestion,
  "read-table": readTableQuestion,
  "draw-column-graph": drawColumnGraphQuestion,
  "survey-question": surveyQuestionQuestion
};

export { CONTEXTS };
export function getDataAQuestionTypes() { return TYPE_LIST; }
export function generateDataAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
