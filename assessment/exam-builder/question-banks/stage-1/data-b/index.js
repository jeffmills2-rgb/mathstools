/*
  Mills Maths Tools — Stage 1 Question Bank: Data (B)
  ----------------------------------------------------
  question-banks/stage-1/data-b/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-DATA-01  plan a question, collect, record in tallies and tables
    MA1-DATA-02  interpret picture graphs and tables; check statements

  Big ideas:
    - a good survey question has clear choices;
    - data is organised so it can ANSWER the question;
    - a statement about data is true only if the data shows it.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, stats, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";
import { CONTEXTS, dataset, pictureGraph } from "../data-a/index.js";

const TOPIC = "Data B";
const q1 = makeStage1(TOPIC, "MA1-DATA-01");
const q2 = makeStage1(TOPIC, "MA1-DATA-02");

const TYPE_LIST = [
  { id: "tally-from-list", label: "Make a tally from a list" },
  { id: "table-from-tally", label: "Tally to table" },
  { id: "total-surveyed", label: "How many altogether?" },
  { id: "true-or-false", label: "True or false?" },
  { id: "compare-rows", label: "Compare two rows" },
  { id: "column-graph-read", label: "Read a column graph (1 each)" },
  { id: "good-question", label: "Choose a good survey question" },
  { id: "what-it-tells", label: "What does the graph tell us?" }
];

function tallyFromListQuestion() {
  const kinds = shuffle(["star", "heart", "ball", "fish"]).slice(0, 3);
  const items = Array.from({ length: randInt(9, 14) }, () => choice(kinds));
  const names = { star: "Stars", heart: "Hearts", ball: "Balls", fish: "Fish" };
  const counts = kinds.map(k => items.filter(x => x === k).length);
  return q1({ type: "tally-from-list", marks: 2, prompt: "Make a tally of the pictures. Write the totals.", diagram: mani({ diagramType: "objects", items, perRow: 7 }), table: { headerRow: true, rows: [["Picture", "Tally", "Total"], ...kinds.map(k => [names[k], "", ""])] }, answer: kinds.map((k, i) => `${names[k]}: ${counts[i]}`).join(", "), working: ["One mark for each picture. Every 5th mark crosses the 4.", `Check: ${counts.join(" + ")} = ${items.length}`], space: "none", mcEligible: false, tags: ["tally"] });
}

function tableFromTallyQuestion() {
  const d = dataset(3, 3, 12); const i = randInt(0, 2);
  return q1({ type: "table-from-tally", marks: 1, prompt: `What number goes in the table for ${d.cats[i]}?`, diagram: mani({ diagramType: "tally", heads: [d.head, "Tally", "Total"], rows: d.cats.map((c, k) => ({ label: c, count: d.values[k], total: k === i ? null : d.values[k] })) }), answer: String(d.values[i]), working: ["Count the tally marks."], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] + 1), String(d.values[i] - 1)], tags: ["tally", "table"] });
}

function totalSurveyedQuestion() {
  const d = dataset(3, 1, 7); const t = d.values.reduce((a, b) => a + b, 0);
  return q2({ type: "total-surveyed", marks: 1, prompt: "How many children are in the graph altogether?", diagram: pictureGraph(d), answer: String(t), working: [`${d.values.join(" + ")} = ${t}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(t + 1), String(t - 1), String(d.cats.length)], tags: ["total"] });
}

function trueOrFalseQuestion() {
  const d = dataset(3, 1, 8); const mx = d.cats[d.values.indexOf(Math.max(...d.values))]; const mn = d.cats[d.values.indexOf(Math.min(...d.values))];
  const i = randInt(0, 2);
  const [claim, t] = choice([[`${mx} was chosen the most.`, true], [`${mn} was chosen the most.`, false], [`${d.values[i]} children chose ${d.cats[i]}.`, true], [`${d.values[i] + 1} children chose ${d.cats[i]}.`, false]]);
  return q2({ type: "true-or-false", marks: 1, prompt: `True or false? ${claim}`, diagram: pictureGraph(d), answer: t ? "True" : "False", working: [d.cats.map((c, k) => `${c} ${d.values[k]}`).join(", ")], space: SPACE_SIZES.SMALL, mcDistractors: [t ? "False" : "True"], tags: ["interpret"] });
}

function compareRowsQuestion() {
  const d = dataset(4, 1, 8); const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2);
  const same = d.values[i] === d.values[j];
  const ans = same ? "the same" : d.values[i] > d.values[j] ? d.cats[i] : d.cats[j];
  return q2({ type: "compare-rows", marks: 1, prompt: `Which was chosen more: ${d.cats[i]} or ${d.cats[j]}?`, diagram: pictureGraph(d), answer: ans, working: [`${d.cats[i]} ${d.values[i]}, ${d.cats[j]} ${d.values[j]}`], space: SPACE_SIZES.SMALL, mcDistractors: [d.cats[i], d.cats[j]].filter(x => x !== ans), tags: ["compare"] });
}

function columnGraphReadQuestion() {
  const d = dataset(4, 1, 9); const i = randInt(0, 3);
  return q2({ type: "column-graph-read", marks: 1, prompt: `How many chose ${d.cats[i].toLowerCase()}?`, diagram: stats({ chartType: "column", categories: d.cats, values: d.values, yStep: 1, yLabel: "Children", xLabel: d.head, title: d.title }), answer: String(d.values[i]), working: ["Go to the top of the column and read across."], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] + 1), String(d.values[i] - 1 || d.values[i] + 2)], tags: ["column graph"] });
}

function goodQuestionQuestion() {
  const good = choice(["What is your favourite fruit: apple, banana or grapes?", "How do you come to school: walk, car, bus or bike?", "Which pet do you like best: dog, cat or fish?"]);
  const bad = ["Do you like things?", "What is it?"];
  const opts = shuffle([good, ...bad]); const L = ["A", "B", "C"]; const ans = L[opts.indexOf(good)];
  return q1({ type: "good-question", marks: 1, prompt: "Which is the best survey question?", table: { headerRow: false, rows: opts.map((o, i) => [L[i], o]) }, answer: ans, working: ["A good question is clear and gives choices."], space: SPACE_SIZES.SMALL, mcDistractors: L.filter(x => x !== ans), tags: ["survey"] });
}

function whatItTellsQuestion() {
  const d = dataset(3, 1, 8); const mx = d.cats[d.values.indexOf(Math.max(...d.values))];
  const statements = [`More children chose ${mx} than anything else.`, "Everyone chose the same thing.", "Nobody was asked."];
  return q2({ type: "what-it-tells", marks: 1, prompt: "What does the graph tell us?", diagram: pictureGraph(d), answer: statements[0], working: [], space: SPACE_SIZES.SMALL, mcDistractors: statements.slice(1), tags: ["interpret"] });
}

const GENERATORS = {
  "tally-from-list": tallyFromListQuestion,
  "table-from-tally": tableFromTallyQuestion,
  "total-surveyed": totalSurveyedQuestion,
  "true-or-false": trueOrFalseQuestion,
  "compare-rows": compareRowsQuestion,
  "column-graph-read": columnGraphReadQuestion,
  "good-question": goodQuestionQuestion,
  "what-it-tells": whatItTellsQuestion
};

export function getDataBQuestionTypes() { return TYPE_LIST; }
export function generateDataBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
