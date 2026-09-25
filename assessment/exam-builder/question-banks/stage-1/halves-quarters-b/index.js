/*
  Mills Maths Tools — Stage 1 Question Bank: Halves, Quarters and Eighths (B)
  ----------------------------------------------------------------------------
  question-banks/stage-1/halves-quarters-b/index.js

  NSW Mathematics K–10 (2022), Stage 1, Geometric measure — MA1-GM-03
  ("creates and recognises halves, quarters and eighths as part measures of a
  whole length"). Part B adds eighths and the RELATIONSHIPS between them.

  Big ideas:
    - halve → halves, halve again → quarters, halve again → eighths;
    - more parts means SMALLER parts (an eighth is smaller than a quarter);
    - 2 quarters make a half; 2 eighths make a quarter; 4 eighths make a half;
    - a fraction of a length can be measured in units.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Halves, Quarters and Eighths B";
const q = makeStage1(TOPIC, "MA1-GM-03");

const NAME = { 2: ["half", "halves"], 4: ["quarter", "quarters"], 8: ["eighth", "eighths"] };
const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const say = (n, d) => `${NUM[n]} ${n === 1 ? NAME[d][0] : NAME[d][1]}`;

const TYPE_LIST = [
  { id: "halving-wall", label: "Halve, halve again, halve again" },
  { id: "name-coloured", label: "How many halves, quarters or eighths are coloured?" },
  { id: "bigger-part", label: "Which part is bigger?" },
  { id: "same-as-half", label: "Parts that make one half" },
  { id: "parts-in-whole-b", label: "How many make one whole?" },
  { id: "fraction-of-length", label: "A half, quarter or eighth of a length" },
  { id: "colour-parts", label: "Colour the parts" },
  { id: "where-on-line", label: "Halves and quarters on a line" }
];

function halvingWallQuestion() {
  return q({ type: "halving-wall", marks: 1, prompt: "Cut each quarter in half. What is each new part called?", diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 1 }, { den: 2 }, { den: 4 }, { den: 8 }] }), answer: "an eighth", working: ["4 quarters become 8 equal parts: eighths."], space: SPACE_SIZES.SMALL, mcDistractors: ["a quarter", "a half", "a sixth"], tags: ["halving"] });
}

function nameColouredQuestion() {
  const d = choice([2, 4, 8, 8]); const n = randInt(1, d - 1); const shape = choice(["rect", "circle", "square"]);
  return q({ type: "name-coloured", marks: 1, prompt: `How many ${NAME[d][1]} are coloured?`, diagram: mani({ diagramType: "fraction-shape", shape, den: d, shaded: n, grid: d === 8 && shape !== "circle" }), answer: say(n, d), working: [`${d} equal parts. ${n} coloured.`], space: SPACE_SIZES.SMALL, mcDistractors: [say(d - n, d), say(Math.min(8, n + 1), d)].filter(x => x !== say(n, d)), tags: ["name the parts"] });
}

function biggerPartQuestion() {
  const [a, b] = shuffle([2, 4, 8]).slice(0, 2);
  const big = a < b ? a : b;
  return q({ type: "bigger-part", marks: 1, prompt: `Which is bigger: one ${NAME[a][0]} or one ${NAME[b][0]}?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: a, shaded: 1 }, { den: b, shaded: 1 }] }), answer: `one ${NAME[big][0]}`, working: ["Fewer parts means bigger parts."], space: SPACE_SIZES.SMALL, mcDistractors: [`one ${NAME[a === big ? b : a][0]}`, "They are the same"], tags: ["compare"] });
}

function sameAsHalfQuestion() {
  const d = choice([4, 8]);
  return q({ type: "same-as-half", marks: 1, prompt: `How many ${NAME[d][1]} are the same as one half?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 2, shaded: 1 }, { den: d, shaded: 0 }] }), answer: String(d / 2), working: [`${say(d / 2, d)} line up with one half.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(d), "1", String(d / 2 + 1)], tags: ["equivalence"] });
}

function partsInWholeBQuestion() {
  const d = choice([2, 4, 8]);
  return q({ type: "parts-in-whole-b", marks: 1, prompt: `How many ${NAME[d][1]} make one whole?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 1 }, { den: d, shaded: d }] }), answer: String(d), working: [`${d} equal parts fill the whole.`], space: SPACE_SIZES.SMALL, mcDistractors: ["1", "2", "4", "8"].filter(x => x !== String(d)).slice(0, 3), tags: ["whole"] });
}

function fractionOfLengthQuestion() {
  const d = choice([2, 4, 8]); const L = d === 8 ? 8 : d * randInt(1, 3); const ob = choice(["ribbon", "snake", "pencil"]);
  return q({ type: "fraction-of-length", marks: 1, prompt: `The ${ob} is ${L} cubes long. How long is one ${NAME[d][0]} of it?`, diagram: mani({ diagramType: "unit-length", unit: "cube", rows: [{ object: ob, units: L }] }), answer: `${L / d} cube${L / d === 1 ? "" : "s"}`, working: [`Share ${L} cubes into ${d} equal parts: ${L / d} each.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${L} cubes`, `${L / d + 1} cubes`, `${d} cubes`].filter(x => !x.startsWith(`${L / d} cube`)), tags: ["length"] });
}

function colourPartsQuestion() {
  const d = choice([4, 8]); const n = randInt(1, d - 1);
  return q({ type: "colour-parts", marks: 1, prompt: `Colour ${say(n, d)}.`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: d, shaded: 0 }] }), answer: `Any ${n} of the ${d} parts coloured.`, working: [], space: "none", mcEligible: false, tags: ["colour"] });
}

function whereOnLineQuestion() {
  const targets = [["one half", 0.5], ["one quarter", 0.25], ["three quarters", 0.75]];
  const [name, v] = choice(targets); const L = ["A", "B", "C"];
  const pts = shuffle([0.25, 0.5, 0.75]); const ans = L[pts.indexOf(v)];
  return q({ type: "where-on-line", marks: 1, prompt: `Which letter shows ${name} of the way from 0 to 1?`, diagram: mani({ diagramType: "number-line", min: 0, max: 1, step: 0.25, labels: [0, 1], points: pts.map((p, i) => ({ value: p, label: L[i] })) }), answer: ans, working: ["The line is cut into 4 equal parts (quarters).", "Halfway is one half."], space: SPACE_SIZES.SMALL, mcDistractors: L.filter(l => l !== ans), tags: ["number line"] });
}

const GENERATORS = {
  "halving-wall": halvingWallQuestion,
  "name-coloured": nameColouredQuestion,
  "bigger-part": biggerPartQuestion,
  "same-as-half": sameAsHalfQuestion,
  "parts-in-whole-b": partsInWholeBQuestion,
  "fraction-of-length": fractionOfLengthQuestion,
  "colour-parts": colourPartsQuestion,
  "where-on-line": whereOnLineQuestion
};

export function getHalvesQuartersBQuestionTypes() { return TYPE_LIST; }
export function generateHalvesQuartersBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
