/*
  Mills Maths Tools — Stage 1 Question Bank: Adding and Taking Away (B)
  ----------------------------------------------------------------------
  question-banks/stage-1/combining-separating-b/index.js

  NSW Mathematics K–10 (2022), Stage 1, Combining and separating quantities
  B — MA1-CSQ-01.

  Big ideas:
    - bonds to 10 help with bonds to 20 and BRIDGING through 10
      (8 + 5 = 8 + 2 + 3);
    - adding tens moves down a row of the number chart;
    - a fact family: 7 + 5 = 12, 5 + 7 = 12, 12 − 5 = 7, 12 − 7 = 5;
    - the difference between two numbers is how far apart they are.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, barD, tf, makeStage1, numOptions, randInt, choice } from "../../_shared/stage1-helpers.js";

const TOPIC = "Adding and Taking Away B";
const q = makeStage1(TOPIC, "MA1-CSQ-01");

const TYPE_LIST = [
  { id: "make-twenty", label: "How many more to make 20?" },
  { id: "bridge-ten", label: "Make 10 first (bridging)" },
  { id: "add-tens", label: "Add or take away tens" },
  { id: "split-add", label: "Split into tens and ones to add" },
  { id: "fact-family", label: "Fact families" },
  { id: "difference", label: "How far apart? (difference)" },
  { id: "missing-number-b", label: "Missing numbers" },
  { id: "add-three", label: "Add three numbers" },
  { id: "part-whole-story", label: "Part–whole stories" },
  { id: "compare-story", label: "Compare stories" },
  { id: "doubles-halves", label: "Doubles and halves to 20" }
];

function makeTwentyQuestion() {
  const a = randInt(11, 19);
  return q({ type: "make-twenty", marks: 1, prompt: "How many more to make 20?", diagram: tf(a, 0, { frames: 2 }), answer: String(20 - a), working: [`${a} + ${20 - a} = 20`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(20 - a, { ten: false }).concat(String(10 - (a - 10) + 10)).filter(x => x !== String(20 - a)).slice(0, 3), tags: ["bonds to 20"] });
}

function bridgeTenQuestion() {
  const a = randInt(6, 9); const b = randInt(11 - a, 9); const need = 10 - a;
  return q({ type: "bridge-ten", marks: 2, prompt: `${a} + ${b} = ☐. Fill the ten first.`, diagram: tf(a, b), answer: String(a + b), working: [`${a} + ${need} = 10`, `${b} − ${need} = ${b - need} left`, `10 + ${b - need} = ${a + b}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a + b, { ten: false }), tags: ["bridging"] });
}

function addTensQuestion() {
  const n = randInt(11, 59); const k = randInt(1, 3); const sub = Math.random() < 0.4 && n > k * 10 + 1;
  const ans = sub ? n - 10 * k : n + 10 * k; const lo = Math.floor(Math.min(n, ans) / 10) * 10 + 1;
  return q({ type: "add-tens", marks: 1, prompt: `${n} ${sub ? "−" : "+"} ${10 * k} = ☐`, diagram: mani({ diagramType: "hundred-chart", from: lo, to: lo + (k + 1) * 10 - 1, shade: [n] }), answer: String(ans), working: [`${sub ? "Up" : "Down"} ${k} row${k > 1 ? "s" : ""} on the chart.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(sub ? n - k : n + k), String(sub ? ans - 10 : ans + 10), String(sub ? n + 10 * k : n - 10 * k)].filter(x => Number(x) > 0 && x !== String(ans)), tags: ["tens"] });
}

function splitAddQuestion() {
  const a = randInt(11, 45); const b = randInt(11, 99 - a - 10 > 11 ? 40 : 20);
  if ((a % 10) + (b % 10) >= 10) return splitAddQuestion();
  const t = Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10; const o = (a % 10) + (b % 10);
  return q({ type: "split-add", marks: 2, prompt: `${a} + ${b}. Tens: ☐  Ones: ☐  Total: ☐`, answer: `${t} and ${o}, so ${a + b}`, working: [`${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10} = ${t}`, `${a % 10} + ${b % 10} = ${o}`, `${t} + ${o} = ${a + b}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["split strategy"] });
}

function factFamilyQuestion() {
  const a = randInt(3, 9); const b = randInt(3, 9); const c = a + b;
  if (Math.random() < 0.6) return q({ type: "fact-family", marks: 1, prompt: `${a} + ${b} = ${c}. So ${c} − ${b} = ☐`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: String(b) }], total: String(c) }), answer: String(a), working: ["Adding and taking away undo each other."], space: SPACE_SIZES.SMALL, mcDistractors: [String(b), String(c + b), String(a + 1)].filter(x => x !== String(a)), tags: ["fact family"] });
  return q({ type: "fact-family", marks: 2, prompt: `Write 4 facts with ${a}, ${b} and ${c}.`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: String(b) }], total: String(c) }), answer: `${a} + ${b} = ${c}, ${b} + ${a} = ${c}, ${c} − ${a} = ${b}, ${c} − ${b} = ${a}`, working: [], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["fact family"] });
}

function differenceQuestion() {
  const a = randInt(3, 12); const b = a + randInt(2, 8);
  return q({ type: "difference", marks: 1, prompt: `How far is it from ${a} to ${b}?`, diagram: mani({ diagramType: "number-line", min: Math.max(0, a - 1), max: Math.max(a + 10, b + 1), step: 1, labels: "all", points: [{ value: a, label: "" }, { value: b, label: "" }] }), answer: String(b - a), working: [`Count on from ${a} to ${b}.`, `${b} − ${a} = ${b - a}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(b - a, { ten: false }).concat(String(a + b)).filter(x => x !== String(b - a)).slice(0, 3), tags: ["difference"] });
}

function missingNumberBQuestion() {
  const a = randInt(3, 12); const b = randInt(3, 9); const c = a + b;
  const [s, ans] = choice([[`☐ + ${b} = ${c}`, a], [`${a} + ☐ = ${c}`, b], [`${c} − ☐ = ${a}`, b], [`☐ − ${b} = ${a}`, c]]);
  const [L, R] = s.split(" = ");
  return q({ type: "missing-number-b", marks: 1, prompt: `What goes in the box?  ${s}`, diagram: mani({ diagramType: "balance", left: L, right: R, tilt: "level" }), answer: String(ans), working: ["Both sides must be equal."], space: SPACE_SIZES.SMALL, mcDistractors: [String(ans + 1), String(c + b), String(Math.abs(ans - 2))].filter(x => x !== String(ans)), tags: ["missing number", "equals"] });
}

function addThreeQuestion() {
  const a = randInt(1, 9); const b = 10 - a; const c = randInt(1, 9);
  const order = choice([[a, c, b], [a, b, c], [c, a, b]]);
  return q({ type: "add-three", marks: 1, prompt: `${order.join(" + ")} = ☐`, answer: String(a + b + c), working: [`Find the pair that makes 10: ${a} + ${b} = 10.`, `10 + ${c} = ${10 + c}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a + b + c, { ten: false }), tags: ["make 10"] });
}

function partWholeStoryQuestion() {
  const a = randInt(11, 40); const b = randInt(5, 30); const find = choice(["whole", "part"]);
  if (find === "whole") return q({ type: "part-whole-story", marks: 1, prompt: `${a} red cars and ${b} blue cars. How many cars?`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: String(b) }], total: null }), answer: String(a + b), working: [`${a} + ${b} = ${a + b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(Math.abs(a - b)), String(a + b + 10), String(a + b - 1)], tags: ["story", "bar model"] });
  return q({ type: "part-whole-story", marks: 1, prompt: `${a + b} cars. ${a} are red. The rest are blue. How many are blue?`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: null }], total: String(a + b) }), answer: String(b), working: [`${a + b} − ${a} = ${b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(2 * a + b), String(b + 1), String(a)].filter(x => x !== String(b)), tags: ["story", "bar model"] });
}

function compareStoryQuestion() {
  const b = randInt(5, 20); const a = b + randInt(2, 9);
  return q({ type: "compare-story", marks: 1, prompt: `Mia has ${a} shells. Tom has ${b}. How many more does Mia have?`, diagram: barD({ diagramType: "compare", rows: [{ name: "Mia", value: a, label: String(a) }, { name: "Tom", value: b, label: String(b) }], difference: null }), answer: String(a - b), working: [`${a} − ${b} = ${a - b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(a + b), String(a - b + 1), String(a)], tags: ["compare", "bar model"] });
}

function doublesHalvesQuestion() {
  const a = randInt(2, 10); const v = choice(["double", "half"]);
  if (v === "double") return q({ type: "doubles-halves", marks: 1, prompt: `Double ${a} = ☐`, diagram: tf(a, a), answer: String(2 * a), working: [`${a} + ${a} = ${2 * a}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(2 * a, { ten: false }), tags: ["doubles"] });
  return q({ type: "doubles-halves", marks: 1, prompt: `Half of ${2 * a} = ☐`, diagram: tf(a, a), answer: String(a), working: [`${a} + ${a} = ${2 * a}, so half is ${a}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(2 * a), String(a + 1), String(a - 1)], tags: ["halves"] });
}

const GENERATORS = {
  "make-twenty": makeTwentyQuestion,
  "bridge-ten": bridgeTenQuestion,
  "add-tens": addTensQuestion,
  "split-add": splitAddQuestion,
  "fact-family": factFamilyQuestion,
  "difference": differenceQuestion,
  "missing-number-b": missingNumberBQuestion,
  "add-three": addThreeQuestion,
  "part-whole-story": partWholeStoryQuestion,
  "compare-story": compareStoryQuestion,
  "doubles-halves": doublesHalvesQuestion
};

export function getCombiningSeparatingBQuestionTypes() { return TYPE_LIST; }
export function generateCombiningSeparatingBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
