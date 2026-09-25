/*
  Mills Maths Tools — Stage 1 Question Bank: Halves and Quarters (A)
  -------------------------------------------------------------------
  question-banks/stage-1/halves-quarters-a/index.js

  NSW Mathematics K–10 (2022), Stage 1, Geometric measure — MA1-GM-03
  ("creates and recognises halves, quarters and eighths as part measures of a
  whole length"). Part A: halves and quarters.

  Big ideas:
    - a half is one of TWO EQUAL parts (equal is the whole point);
    - two halves make a whole; halving a half makes a quarter;
    - four quarters make a whole;
    - a half of a length is a length.

  Words, not symbols: Stage 1 students name "one half" and "one quarter".
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Halves and Quarters A";
const q = makeStage1(TOPIC, "MA1-GM-03");

const TYPE_LIST = [
  { id: "equal-parts", label: "Is it cut into halves?" },
  { id: "half-or-quarter", label: "Half or quarter shaded?" },
  { id: "shade-half", label: "Colour one half" },
  { id: "which-strip", label: "Which strip shows a half (or a quarter)?" },
  { id: "halves-in-whole", label: "How many halves (quarters) in a whole?" },
  { id: "half-a-length", label: "Half of a length" },
  { id: "halve-again", label: "Halve a half" },
  { id: "half-on-line", label: "Halfway on a number line" }
];

function equalPartsQuestion() {
  const den = choice([2, 2, 4]); const equal = Math.random() < 0.5; const shape = choice(["rect", "circle", "square"]);
  const name = den === 2 ? "halves" : "quarters";
  return q({ type: "equal-parts", marks: 1, prompt: `Is this cut into ${name}? Yes or no?`, diagram: mani({ diagramType: "fraction-shape", shape, den, shaded: 0, unequal: !equal }), answer: equal ? "Yes" : "No", working: [equal ? `The ${den} parts are equal.` : "The parts are not the same size."], space: SPACE_SIZES.SMALL, mcDistractors: [equal ? "No" : "Yes"], tags: ["equal parts"] });
}

function halfOrQuarterQuestion() {
  const den = choice([2, 4]); const shape = choice(["rect", "circle", "square"]);
  const ans = den === 2 ? "one half" : "one quarter";
  return q({ type: "half-or-quarter", marks: 1, prompt: "Is one half or one quarter coloured?", diagram: mani({ diagramType: "fraction-shape", shape, den, shaded: 1 }), answer: ans, working: [den === 2 ? "2 equal parts: each is a half." : "4 equal parts: each is a quarter."], space: SPACE_SIZES.SMALL, mcDistractors: [den === 2 ? "one quarter" : "one half"], tags: ["name the part"] });
}

function shadeHalfQuestion() {
  const den = choice([2, 4]); const shape = choice(["rect", "circle", "square"]);
  const ask = den === 2 ? "one half" : choice(["one quarter", "one half"]);
  return q({ type: "shade-half", marks: 1, prompt: `Colour ${ask} of the shape.`, diagram: mani({ diagramType: "fraction-shape", shape, den, shaded: 0 }), answer: ask === "one half" ? `Colour ${den / 2} of the ${den} parts.` : "Colour 1 of the 4 parts.", working: [], space: "none", mcEligible: false, tags: ["colour"] });
}

function whichStripQuestion() {
  const target = choice([2, 4]); const L = ["A", "B", "C"];
  const opts = shuffle([{ den: target, shaded: 1, ok: true }, { den: target, shaded: 1, unequal: true, ok: false }, { den: target === 2 ? 3 : 3, shaded: 1, ok: false }]);
  const ans = L[opts.findIndex(o => o.ok)];
  return q({ type: "which-strip", marks: 1, prompt: `Which strip shows one ${target === 2 ? "half" : "quarter"} coloured?`, diagram: mani({ diagramType: "fraction-strip", strips: opts.map((o, i) => ({ den: o.den, shaded: o.shaded, unequal: o.unequal, label: L[i] })) }), answer: ans, working: [`It needs ${target} EQUAL parts with 1 coloured.`], space: SPACE_SIZES.SMALL, mcDistractors: L.filter(l => l !== ans), tags: ["equal parts"] });
}

function halvesInWholeQuestion() {
  const den = choice([2, 4]);
  return q({ type: "halves-in-whole", marks: 1, prompt: `How many ${den === 2 ? "halves" : "quarters"} make one whole?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 1, label: "" }, { den, shaded: den }] }), answer: String(den), working: [`${den} equal parts fill the whole.`], space: SPACE_SIZES.SMALL, mcDistractors: ["1", den === 2 ? "4" : "2", "3"], tags: ["whole"] });
}

function halfALengthQuestion() {
  const h = randInt(2, 6); const ob = choice(["ribbon", "snake", "pencil"]);
  return q({ type: "half-a-length", marks: 1, prompt: `The ${ob} is ${2 * h} cubes long. How long is half of it?`, diagram: mani({ diagramType: "unit-length", unit: "cube", rows: [{ object: ob, units: 2 * h }] }), answer: `${h} cubes`, working: [`Half of ${2 * h} is ${h}. ${h} + ${h} = ${2 * h}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${2 * h} cubes`, `${h + 1} cubes`, `${h - 1 || h + 2} cubes`], tags: ["length"] });
}

function halveAgainQuestion() {
  return q({ type: "halve-again", marks: 1, prompt: "Cut each half in half. What is each new part called?", diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 2, label: "" }, { den: 4, label: "" }] }), answer: "a quarter", working: ["2 halves become 4 equal parts. Each part is a quarter."], space: SPACE_SIZES.SMALL, mcDistractors: ["a half", "a third", "a whole"], tags: ["halving"] });
}

function halfOnLineQuestion() {
  const max = choice([10, 20, 4, 6, 8, 12]);
  return q({ type: "half-on-line", marks: 1, prompt: `What number is halfway between 0 and ${max}?`, diagram: mani({ diagramType: "number-line", min: 0, max, step: 1, labels: [0, max] }), answer: String(max / 2), working: [`Half of ${max} is ${max / 2}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(max / 2 + 1), String(max / 2 - 1), String(max)], tags: ["length", "number line"] });
}

const GENERATORS = {
  "equal-parts": equalPartsQuestion,
  "half-or-quarter": halfOrQuarterQuestion,
  "shade-half": shadeHalfQuestion,
  "which-strip": whichStripQuestion,
  "halves-in-whole": halvesInWholeQuestion,
  "half-a-length": halfALengthQuestion,
  "halve-again": halveAgainQuestion,
  "half-on-line": halfOnLineQuestion
};

export function getHalvesQuartersAQuestionTypes() { return TYPE_LIST; }
export function generateHalvesQuartersAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
