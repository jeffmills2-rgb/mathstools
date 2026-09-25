/*
  Mills Maths Tools — Stage 1 Question Bank: Adding and Taking Away (A)
  ----------------------------------------------------------------------
  question-banks/stage-1/combining-separating-a/index.js

  NSW Mathematics K–10 (2022), Stage 1, Combining and separating quantities
  A — MA1-CSQ-01.

  Big ideas:
    - PART–PART–WHOLE: two parts make a whole; knowing any two tells the third;
    - number bonds to 10 (a full ten-frame);
    - count ON from the bigger number, count BACK to take away;
    - doubles and near doubles are facts we can "just know";
    - addition and subtraction undo each other.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, barD, pic, tf, makeStage1, numOptions, ICONS, nameOf, randInt, choice } from "../../_shared/stage1-helpers.js";

const TOPIC = "Adding and Taking Away A";
const q = makeStage1(TOPIC, "MA1-CSQ-01");

const TYPE_LIST = [
  { id: "make-ten", label: "How many more to make 10?" },
  { id: "two-colours", label: "Two parts, how many altogether?" },
  { id: "take-away-pictures", label: "Take away: how many are left?" },
  { id: "count-on-line", label: "Count on with a number line" },
  { id: "count-back-line", label: "Count back with a number line" },
  { id: "dice-total", label: "Add the dots" },
  { id: "doubles", label: "Doubles" },
  { id: "near-doubles", label: "Near doubles" },
  { id: "missing-part", label: "Missing part (part–part–whole)" },
  { id: "turnaround", label: "Turnaround facts" },
  { id: "how-many-more", label: "How many more? (compare rows)" },
  { id: "picture-story", label: "Picture stories" },
  { id: "bonds-to-10", label: "Number bonds to 10" }
];

function makeTenQuestion() {
  const a = randInt(1, 9);
  return q({ type: "make-ten", marks: 1, prompt: "How many more to make 10?", diagram: tf(a), answer: String(10 - a), working: [`${a} + ${10 - a} = 10`, "Count the empty boxes."], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(10 - a, { min: 0 }).concat(String(a)).filter(x => x !== String(10 - a)).slice(0, 3), tags: ["bonds to 10"] });
}

function twoColoursQuestion() {
  const a = randInt(2, 9); const b = randInt(1, 10 - Math.min(a, 9) + 5);
  return q({ type: "two-colours", marks: 1, prompt: `${a} red and ${b} yellow. How many altogether?`, diagram: tf(a, b), answer: String(a + b), working: [`${a} + ${b} = ${a + b}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a + b, { ten: false }).concat(String(Math.abs(a - b))).filter(x => x !== String(a + b)).slice(0, 3), tags: ["part-part-whole"] });
}

function takeAwayPicturesQuestion() {
  const n = randInt(5, 15); const k = randInt(1, n - 2); const item = choice(ICONS);
  return q({ type: "take-away-pictures", marks: 1, prompt: `${n} ${nameOf(item, n)}. ${k} are crossed out. How many are left?`, diagram: pic(n, item, { crossed: k }), answer: String(n - k), working: [`${n} − ${k} = ${n - k}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(n - k, { min: 0, ten: false }).concat(String(n + k)).filter(x => x !== String(n - k)).slice(0, 3), tags: ["subtraction"] });
}

/* A short number line (about 11 numbers) around the jumps, every number
   labelled, so the ticks are big enough to count along. */
function lineWindow(lo, hi, hops) {
  const min = Math.max(0, lo - 2); const max = Math.max(min + 10, hi + 2);
  // Half the time the jumps are left for the student to draw.
  return mani({ diagramType: "number-line", min, max, step: 1, labels: "all", ...(Math.random() < 0.5 ? { hops } : {}) });
}

function countOnLineQuestion() {
  const a = randInt(3, 15); const b = randInt(2, 5);
  const hops = Array.from({ length: b }, (_, i) => ({ from: a + i, to: a + i + 1 }));
  return q({ type: "count-on-line", marks: 1, prompt: `${a} + ${b} = ☐`, diagram: lineWindow(a, a + b, hops), answer: String(a + b), working: [`Start at ${a}. Count on ${b}: ${Array.from({ length: b }, (_, i) => a + i + 1).join(", ")}.`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a + b, { ten: false }), tags: ["count on"] });
}

function countBackLineQuestion() {
  const a = randInt(8, 20); const b = randInt(2, 5);
  const hops = Array.from({ length: b }, (_, i) => ({ from: a - i, to: a - i - 1 }));
  return q({ type: "count-back-line", marks: 1, prompt: `${a} − ${b} = ☐`, diagram: lineWindow(a - b, a, hops), answer: String(a - b), working: [`Start at ${a}. Count back ${b}: ${Array.from({ length: b }, (_, i) => a - i - 1).join(", ")}.`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a - b, { ten: false }).concat(String(a + b)).filter(x => x !== String(a - b)).slice(0, 3), tags: ["count back"] });
}

function diceTotalQuestion() {
  const a = randInt(1, 6); const b = randInt(1, 6);
  return q({ type: "dice-total", marks: 1, prompt: "How many dots altogether?", diagram: mani({ diagramType: "dice", values: [a, b] }), answer: String(a + b), working: [`${a} + ${b} = ${a + b}`, "Start with the bigger number and count on."], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a + b, { ten: false }), tags: ["subitise", "addition"] });
}

function doublesQuestion() {
  const a = randInt(1, 10);
  return q({ type: "doubles", marks: 1, prompt: `Double ${a} is ☐`, diagram: a <= 6 ? mani({ diagramType: "dice", values: [a, a] }) : tf(a, a), answer: String(2 * a), working: [`${a} + ${a} = ${2 * a}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(2 * a, { ten: false }).concat(String(a + 2)).filter(x => x !== String(2 * a)).slice(0, 3), tags: ["doubles"] });
}

function nearDoublesQuestion() {
  const a = randInt(2, 9);
  return q({ type: "near-doubles", marks: 1, prompt: `${a} + ${a} = ${2 * a}. So ${a} + ${a + 1} = ☐`, diagram: tf(a, a + 1), answer: String(2 * a + 1), working: [`Double ${a} is ${2 * a}. One more is ${2 * a + 1}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(2 * a), String(2 * a + 2), String(a + 1)], tags: ["near doubles"] });
}

function missingPartQuestion() {
  const w = randInt(5, 20); const a = randInt(1, w - 1);
  return q({ type: "missing-part", marks: 1, prompt: "What is the missing part?", diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: w - a, label: null }], total: String(w) }), answer: String(w - a), working: [`${a} + ☐ = ${w}`, `${w} − ${a} = ${w - a}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(w + a), String(w - a + 1), String(a)].filter(x => x !== String(w - a)), tags: ["part-part-whole", "missing number"] });
}

function turnaroundQuestion() {
  const a = randInt(2, 9); const b = randInt(2, 9); if (a === b) return turnaroundQuestion();
  return q({ type: "turnaround", marks: 1, prompt: `${a} + ${b} = ${b} + ☐`, diagram: tf(a, b), answer: String(a), working: ["Adding in any order gives the same total."], space: SPACE_SIZES.SMALL, mcDistractors: [String(b), String(a + b), String(a + 1)], tags: ["turnaround"] });
}

function howManyMoreQuestion() {
  const [x, y] = [choice(ICONS), choice(ICONS.slice(0, 5))]; if (x === y) return howManyMoreQuestion();
  const a = randInt(4, 9); const b = randInt(1, a - 1);
  const items = [...Array(a).fill(x), ...Array(b).fill(y), ...Array(a - b).fill("")];
  return q({ type: "how-many-more", marks: 1, prompt: `How many more ${nameOf(x, 2)} than ${nameOf(y, 2)}?`, diagram: mani({ diagramType: "objects", items, perRow: a }), answer: String(a - b), working: ["Match them up. Count the ones with no partner.", `${a} − ${b} = ${a - b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(a), String(b), String(a + b)].filter(v => v !== String(a - b)), tags: ["difference", "compare"] });
}

function pictureStoryQuestion() {
  const item = choice(["bird", "fish", "car", "ball"]); const a = randInt(3, 8); const b = randInt(1, 5); const add = Math.random() < 0.5;
  if (add) return q({ type: "picture-story", marks: 1, prompt: `${a} ${nameOf(item, a)}. ${b} more come. How many now?`, diagram: pic(a + b, item, { circle: [[a, a + b - 1]].filter(([s, e]) => Math.floor(s / 5) === Math.floor(e / 5)) }), answer: String(a + b), working: [`${a} + ${b} = ${a + b}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a + b, { ten: false }), tags: ["story", "addition"] });
  const n = a + b;
  return q({ type: "picture-story", marks: 1, prompt: `${n} ${nameOf(item, n)}. ${b} go away. How many are left?`, diagram: pic(n, item, { crossed: b }), answer: String(a), working: [`${n} − ${b} = ${a}`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(a, { ten: false }).concat(String(n + b)).filter(x => x !== String(a)).slice(0, 3), tags: ["story", "subtraction"] });
}

function bondsTo10Question() {
  const a = randInt(0, 10);
  const form = choice([[`${a} + ☐ = 10`, 10 - a], [`☐ + ${a} = 10`, 10 - a], [`10 − ${a} = ☐`, 10 - a]]);
  return q({ type: "bonds-to-10", marks: 1, prompt: form[0], answer: String(form[1]), working: [`${a} and ${10 - a} make 10.`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(form[1], { ten: false }).concat(String(a)).filter(x => x !== String(form[1])).slice(0, 3), tags: ["bonds to 10"] });
}

const GENERATORS = {
  "make-ten": makeTenQuestion,
  "two-colours": twoColoursQuestion,
  "take-away-pictures": takeAwayPicturesQuestion,
  "count-on-line": countOnLineQuestion,
  "count-back-line": countBackLineQuestion,
  "dice-total": diceTotalQuestion,
  "doubles": doublesQuestion,
  "near-doubles": nearDoublesQuestion,
  "missing-part": missingPartQuestion,
  "turnaround": turnaroundQuestion,
  "how-many-more": howManyMoreQuestion,
  "picture-story": pictureStoryQuestion,
  "bonds-to-10": bondsTo10Question
};

export function getCombiningSeparatingAQuestionTypes() { return TYPE_LIST; }
export function generateCombiningSeparatingAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
