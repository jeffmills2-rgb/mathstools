/*
  Mills Maths Tools — Stage 2 Question Bank: Fractions A
  -------------------------------------------------------
  question-banks/stage-2/fractions-a/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Partitioned fractions A" —
  MA2-PF-01.

  Big ideas:
    - a fraction needs EQUAL parts of one whole;
    - repeated halving makes halves → quarters → eighths, and halving thirds
      makes sixths — the fraction wall shows the family;
    - the bottom number says how many equal parts, the top how many we have;
    - more parts means SMALLER parts (1/8 < 1/4);
    - a fraction is also a LENGTH, so it has a place on a number line.

  Part A fractions: halves, quarters, eighths, thirds, sixths.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Fractions A";
const q = makeStage2(TOPIC, "MA2-PF-01");

const TYPE_LIST = [
  { id: "name-shaded", label: "Name the shaded fraction" },
  { id: "equal-parts", label: "Equal parts or not?" },
  { id: "shade-fraction", label: "Shade a fraction" },
  { id: "halving-wall", label: "Halving: halves, quarters, eighths" },
  { id: "compare-unit", label: "Compare unit fractions" },
  { id: "compare-same-denominator", label: "Compare fractions with the same bottom number" },
  { id: "number-line-0-1", label: "Fractions on a number line from 0 to 1" },
  { id: "parts-in-whole", label: "How many parts make a whole?" },
  { id: "count-fractions", label: "Count by fractions" },
  { id: "fraction-words", label: "Fraction words and symbols" },
  { id: "fraction-of-strip", label: "Fractions as lengths" }
];

const DENS = [2, 3, 4, 6, 8];
const NAMES = { 2: ["half", "halves"], 3: ["third", "thirds"], 4: ["quarter", "quarters"], 6: ["sixth", "sixths"], 8: ["eighth", "eighths"], 5: ["fifth", "fifths"], 10: ["tenth", "tenths"] };
const f = (n, d) => `[[frac:${n}:${d}]]`;
const numWord = n => ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][n];
const wordsFor = (n, d) => `${numWord(n)} ${n === 1 ? NAMES[d][0] : NAMES[d][1]}`;

function nameShadedQuestion() {
  const d = choice(DENS); const n = randInt(1, d - 1);
  const shape = d === 3 || d === 6 ? choice(["rect", "circle"]) : choice(["rect", "circle", "square"]);
  return q({ type: "name-shaded", marks: 1, prompt: "What fraction is shaded?", diagram: mani({ diagramType: "fraction-shape", shape, den: d, shaded: n, grid: d === 8 && shape !== "circle" }), answer: f(n, d), working: [`${d} equal parts, ${n} shaded`], space: SPACE_SIZES.SMALL, mcDistractors: [f(d - n, d), f(n, d + 1), `${f(d, n)}`].filter(x => x !== f(n, d)), tags: ["shaded"] });
}

function equalPartsQuestion() {
  const d = choice([3, 4]); const equal = Math.random() < 0.5; const shape = choice(["rect", "circle"]);
  return q({ type: "equal-parts", marks: 1, prompt: `Does the shaded part show ${f(1, d)}? Why?`, diagram: mani({ diagramType: "fraction-shape", shape, den: d, shaded: 1, unequal: !equal }), answer: equal ? `Yes. The whole is cut into ${d} equal parts.` : "No. The parts are not equal.", working: ["A fraction needs equal parts."], space: SPACE_SIZES.SMALL, mcDistractors: [equal ? "No. The parts are not equal." : `Yes. The whole is cut into ${d} equal parts.`], tags: ["equal parts"] });
}

function shadeFractionQuestion() {
  const d = choice(DENS); const n = randInt(1, d - 1);
  return q({ type: "shade-fraction", marks: 1, prompt: `Shade ${f(n, d)} of the shape.`, diagram: mani({ diagramType: "fraction-shape", shape: choice(["rect", "circle"]), den: d, shaded: 0 }), answer: `Any ${n} of the ${d} parts shaded`, working: [`${d} equal parts; shade ${n}.`], space: "none", mcEligible: false, tags: ["shade"] });
}

function halvingWallQuestion() {
  const v = choice(["eighths-in-half", "quarters-in-half", "eighths-in-quarter", "sixths-in-third"]);
  if (v === "sixths-in-third") return q({ type: "halving-wall", marks: 1, prompt: `Look at the strips. How many sixths are the same as ${f(1, 3)}?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 1, partLabels: true }, { den: 3, shaded: 1, partLabels: true }, { den: 6, shaded: 2, partLabels: true }] }), answer: `2 sixths (${f(2, 6)})`, working: ["Halve each third to make sixths."], space: SPACE_SIZES.SMALL, mcDistractors: ["3 sixths", "6 sixths"], tags: ["halving", "fraction wall"] });
  const [small, big] = { "eighths-in-half": [8, 2], "quarters-in-half": [4, 2], "eighths-in-quarter": [8, 4] }[v];
  const k = small / big;
  return q({ type: "halving-wall", marks: 1, prompt: `Look at the strips. How many ${NAMES[small][1]} are the same as ${f(1, big)}?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 1, partLabels: true }, { den: 2, shaded: big === 2 ? 1 : 0, partLabels: true }, { den: 4, shaded: big === 2 ? 2 : big === 4 ? 1 : 0, partLabels: true }, { den: 8, shaded: small === 8 ? k : 0, partLabels: true }] }), answer: `${k} ${NAMES[small][1]} (${f(k, small)})`, working: [`Each time we halve, the number of parts doubles.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${k + 1} ${NAMES[small][1]}`, `${small} ${NAMES[small][1]}`], tags: ["halving", "fraction wall"] });
}

function compareUnitQuestion() {
  const [a, b] = shuffle(choice([[2, 4], [2, 8], [4, 8], [3, 6], [2, 3], [3, 4], [4, 6], [6, 8]]));
  const bigger = a < b ? a : b;
  return q({ type: "compare-unit", marks: 1, prompt: `Which is bigger: ${f(1, a)} or ${f(1, b)}?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: a, shaded: 1, partLabels: true }, { den: b, shaded: 1, partLabels: true }] }), answer: f(1, bigger), working: ["More parts means smaller parts.", `${f(1, bigger)} is bigger.`], space: SPACE_SIZES.SMALL, mcDistractors: [f(1, a === bigger ? b : a), "They are the same"], tags: ["compare", "unit fractions"] });
}

function compareSameDenominatorQuestion() {
  const d = choice([4, 6, 8]); const [a, b] = shuffle([randInt(1, d - 1), randInt(1, d - 1)]); if (a === b) return compareSameDenominatorQuestion();
  return q({ type: "compare-same-denominator", marks: 1, prompt: `Write < or > : ${f(a, d)} ☐ ${f(b, d)}`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: d, shaded: a }, { den: d, shaded: b }] }), answer: a < b ? "<" : ">", working: ["Same size parts, so compare how many parts."], space: SPACE_SIZES.SMALL, mcDistractors: [a < b ? ">" : "<", "="], tags: ["compare"] });
}

function numberLine01Question() {
  const d = choice([2, 3, 4, 6, 8]); const n = randInt(1, d - 1);
  const hideLabels = Math.random() < 0.5;
  return q({ type: "number-line-0-1", marks: 1, prompt: "What fraction is at A?", diagram: mani({ diagramType: "number-line", min: 0, max: 1, step: 1 / d, den: d, labels: hideLabels ? [0, 1] : undefined, points: [{ value: n / d, label: "A" }] }), answer: f(n, d), working: [`0 to 1 is cut into ${d} equal parts. A is ${n} part${n > 1 ? "s" : ""} along.`], space: SPACE_SIZES.SMALL, mcDistractors: [f(n, d + 1), f(n + 1, d), f(d - n, d)].filter(x => x !== f(n, d) && !x.includes(`:${d}:${d}`) && !x.startsWith(`[[frac:${d}:`)), tags: ["number line"] });
}

function partsInWholeQuestion() {
  const d = choice(DENS);
  return q({ type: "parts-in-whole", marks: 1, prompt: `How many ${NAMES[d][1]} make one whole?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 1, partLabels: true }, { den: d, shaded: d, partLabels: true }] }), answer: `${d} (${f(d, d)} = 1)`, working: [`${d} equal parts fill the whole.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${d - 1}`, `${d * 2}`, "1"], tags: ["whole"] });
}

function countFractionsQuestion() {
  const d = choice([3, 4, 6, 8]); const start = randInt(0, Math.max(0, d - 4));
  const seq = Array.from({ length: 5 }, (_, i) => start + i);
  const show = k => (k === 0 ? "0" : k % d === 0 ? String(k / d) : f(k, d));
  const hide = 3;
  return q({ type: "count-fractions", marks: 1, prompt: `Count by ${NAMES[d][1]}. What comes next? ${seq.slice(0, hide).map(show).join(", ")}, ☐`, answer: show(seq[hide]), working: [`Add one ${NAMES[d][0]} each time.`], space: SPACE_SIZES.SMALL, mcDistractors: [show(seq[hide] + 1), f(seq[hide], d + 1)].filter(x => x !== show(seq[hide])), tags: ["counting"] });
}

function fractionWordsQuestion() {
  const d = choice(DENS); const n = randInt(1, d - 1);
  if (Math.random() < 0.5) return q({ type: "fraction-words", marks: 1, prompt: `Write "${wordsFor(n, d)}" as a fraction.`, answer: f(n, d), working: [`${n} parts out of ${d}`], space: SPACE_SIZES.SMALL, mcDistractors: [f(d, n), f(n, d + 1)].filter(x => !x.startsWith(`[[frac:${d}:${n}]]`) || true), tags: ["words"] });
  return q({ type: "fraction-words", marks: 1, prompt: `Write ${f(n, d)} in words.`, answer: wordsFor(n, d), working: [], space: SPACE_SIZES.SMALL, mcDistractors: [wordsFor(d - n > 0 ? d - n : 1, d), `${numWord(d)} ${n === 1 ? NAMES[d][0] : NAMES[d][1]}`].filter(x => x !== wordsFor(n, d)), tags: ["words"] });
}

function fractionOfStripQuestion() {
  const d = choice([2, 4, 8, 3, 6]); const n = randInt(1, d - 1);
  const len = choice([24, 48, 12]) * (d === 3 || d === 6 ? 1 : 1);
  if (len % d) return fractionOfStripQuestion();
  return q({ type: "fraction-of-strip", marks: 2, prompt: `The whole ribbon is ${len} cm long. How long is the shaded part?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: d, shaded: n }] }), answer: `${(len / d) * n} cm (${f(n, d)} of ${len} cm)`, working: [`One part is ${len} ÷ ${d} = ${len / d} cm`, `${n} parts = ${(len / d) * n} cm`], space: SPACE_SIZES.SMALL, mcDistractors: [`${len / d} cm`, `${len - (len / d) * n} cm`, `${len * n} cm`].filter(x => !x.startsWith(`${(len / d) * n} cm`)), tags: ["length"] });
}

const GENERATORS = {
  "name-shaded": nameShadedQuestion,
  "equal-parts": equalPartsQuestion,
  "shade-fraction": shadeFractionQuestion,
  "halving-wall": halvingWallQuestion,
  "compare-unit": compareUnitQuestion,
  "compare-same-denominator": compareSameDenominatorQuestion,
  "number-line-0-1": numberLine01Question,
  "parts-in-whole": partsInWholeQuestion,
  "count-fractions": countFractionsQuestion,
  "fraction-words": fractionWordsQuestion,
  "fraction-of-strip": fractionOfStripQuestion
};

export function getFractionsAQuestionTypes() { return TYPE_LIST; }
export function generateFractionsAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
