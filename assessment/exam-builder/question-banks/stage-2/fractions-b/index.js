/*
  Mills Maths Tools — Stage 2 Question Bank: Fractions B
  --------------------------------------------------------
  question-banks/stage-2/fractions-b/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Partitioned fractions B" — MA2-PF-01.

  Big ideas:
    - the denominator names the size of the part; more parts means smaller
      parts (fifths and tenths join the halves–quarters–eighths and
      thirds–sixths families);
    - fractions are NUMBERS: they live on the number line and keep going past 1;
    - the same amount can have different names — EQUIVALENT fractions line up
      on a fraction wall;
    - tenths are the bridge to decimals.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, makeStage2, randInt, choice } from "../../_shared/stage2-helpers.js";

const TOPIC = "Fractions B";
const q = makeStage2(TOPIC, "MA2-PF-01");

const TYPE_LIST = [
  { id: "fifths-tenths", label: "Fifths and tenths" },
  { id: "halving-thirds", label: "Thirds, sixths (and twelfths) by halving" },
  { id: "number-line-beyond-1", label: "Fractions on a number line beyond 1" },
  { id: "count-beyond-1", label: "Count by fractions past 1" },
  { id: "equivalent-wall", label: "Equivalent fractions on a fraction wall" },
  { id: "equivalent-shapes", label: "Name equal fractions" },
  { id: "compare-order-b", label: "Compare and order fractions" },
  { id: "half-benchmark", label: "More or less than one half?" },
  { id: "make-a-whole", label: "How much more to make a whole?" },
  { id: "fraction-of-collection", label: "Fraction of a group of objects" },
  { id: "tenths-decimals", label: "Tenths as decimals" }
];

const NAMES = { 2: ["half", "halves"], 3: ["third", "thirds"], 4: ["quarter", "quarters"], 5: ["fifth", "fifths"], 6: ["sixth", "sixths"], 8: ["eighth", "eighths"], 10: ["tenth", "tenths"], 12: ["twelfth", "twelfths"] };
const f = (n, d) => `[[frac:${n}:${d}]]`;
const mixed = (n, d) => (n % d === 0 ? String(n / d) : n > d ? `${Math.floor(n / d)} ${f(n % d, d)}` : f(n, d));
const both = (n, d) => (n > d && n % d ? `${f(n, d)} (or ${mixed(n, d)})` : mixed(n, d));

function fifthsTenthsQuestion() {
  const d = choice([5, 10]); const n = randInt(1, d - 1);
  const v = choice(["name", "shade", "words"]);
  if (v === "shade") return q({ type: "fifths-tenths", marks: 1, prompt: `Shade ${f(n, d)} of the strip.`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: d, shaded: 0 }] }), answer: `Any ${n} of the ${d} parts shaded`, working: [`${d} equal parts, shade ${n}.`], space: "none", mcEligible: false, tags: [NAMES[d][1]] });
  if (v === "words") return q({ type: "fifths-tenths", marks: 1, prompt: `Write "${["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][n]} ${n === 1 ? NAMES[d][0] : NAMES[d][1]}" as a fraction.`, answer: f(n, d), working: [`${NAMES[d][1]} → bottom number ${d}`], space: SPACE_SIZES.SMALL, mcDistractors: [f(d, n), f(n, d === 5 ? 10 : 5), f(1, n)], tags: [NAMES[d][1]] });
  return q({ type: "fifths-tenths", marks: 1, prompt: "What fraction is shaded?", diagram: mani({ diagramType: "fraction-shape", shape: d === 10 ? "rect" : choice(["rect", "circle"]), den: d, shaded: n, grid: d === 10 }), answer: f(n, d), working: [`${d} equal parts, ${n} shaded`], space: SPACE_SIZES.SMALL, mcDistractors: [f(d - n, d), f(n, d === 5 ? 10 : 5), f(n, d + 1)], tags: [NAMES[d][1]] });
}

function halvingThirdsQuestion() {
  const [a, b] = choice([[3, 6], [6, 12], [5, 10]]);
  return q({ type: "halving-thirds", marks: 1, prompt: `Each ${NAMES[a][0]} is cut in half. What is each new part called?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: a, partLabels: true }, { den: b, partLabels: b <= 10 }] }), answer: `${NAMES[b][1]} (${f(1, b)})`, working: [`${a} parts become ${b} parts. Half of ${f(1, a)} is ${f(1, b)}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${NAMES[a][1]} (${f(1, a)})`, `${NAMES[b / 2 === a && a > 2 ? a - 1 : 2][1]} (${f(1, b / 2 === a && a > 2 ? a - 1 : 2)})`], tags: ["halving"] });
}

function numberLineBeyond1Question() {
  const d = choice([2, 3, 4, 5]); const max = choice([2, 3]); const n = randInt(d + 1, max * d - 1);
  if (n % d === 0) return numberLineBeyond1Question();
  return q({
    type: "number-line-beyond-1", marks: 1,
    prompt: "What number is at A?",
    diagram: mani({ diagramType: "number-line", min: 0, max, step: 1 / d, majorEvery: d, den: d, labels: Array.from({ length: max + 1 }, (_, i) => i), points: [{ value: n / d, label: "A" }] }),
    answer: both(n, d),
    working: [`Each whole is cut into ${d} equal parts.`, `A is ${n} ${NAMES[d][1]} from 0: ${f(n, d)} = ${mixed(n, d)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [both(n + 1, d), both(n % d, d), f(n, d + 1)],
    tags: ["number line", "beyond 1"]
  });
}

function countBeyond1Question() {
  const d = choice([2, 3, 4, 5]); const s = randInt(1, d); const len = 5;
  const seq = Array.from({ length: len }, (_, i) => s + i);
  const gap = randInt(2, len - 1);
  return q({ type: "count-beyond-1", marks: 1, prompt: `Count by ${NAMES[d][1]}. What is missing?  ${seq.map((v, i) => (i === gap ? "☐" : f(v, d))).join(",  ")}`, diagram: mani({ diagramType: "number-line", min: 0, max: Math.ceil((s + len) / d), step: 1 / d, majorEvery: d, den: d }), answer: both(seq[gap], d), working: [`Each step adds ${f(1, d)}.`], space: SPACE_SIZES.SMALL, mcDistractors: [f(seq[gap], d + 1), both(seq[gap] + 1, d), f(1, seq[gap])], tags: ["counting", "beyond 1"] });
}

function equivalentWallQuestion() {
  const [a, b] = choice([[2, 4], [2, 8], [4, 8], [2, 6], [3, 6], [5, 10], [2, 10]]);
  const n = randInt(1, a - 1); const m = n * (b / a);
  return q({
    type: "equivalent-wall", marks: 1,
    prompt: `Use the fraction wall. ${f(n, a)} = ☐ ${NAMES[b][1]}`,
    diagram: mani({ diagramType: "fraction-strip", strips: [{ den: a, shaded: n }, { den: b, shaded: 0 }] }),
    answer: f(m, b),
    working: [`${f(n, a)} lines up with ${m} ${NAMES[b][1]}.`, `${f(n, a)} = ${f(m, b)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [f(n, b), f(m + 1, b), f(m - 1 || m + 2, b)],
    tags: ["equivalent"]
  });
}

function equivalentShapesQuestion() {
  const [a, b] = choice([[2, 4], [4, 8], [3, 6], [5, 10]]); const n = randInt(1, a - 1); const m = n * (b / a);
  return q({ type: "equivalent-shapes", marks: 1, prompt: `Strips A and B have the same amount shaded. Write two fractions that are equal.`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: a, shaded: n, label: "A" }, { den: b, shaded: m, label: "B" }] }), answer: `${f(n, a)} = ${f(m, b)}`, working: [`A: ${n} of ${a} parts. B: ${m} of ${b} parts. Same length shaded.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${f(n, a)} = ${f(n, b)}`, `${f(m, a)} = ${f(n, b)}`], tags: ["equivalent"] });
}

function compareOrderBQuestion() {
  const v = choice(["same-num", "same-den", "order"]);
  if (v === "same-num") {
    const [d1, d2] = choice([[4, 5], [3, 8], [5, 10], [4, 6], [8, 10], [3, 5]]); const n = randInt(1, Math.min(3, d1 - 1));
    const big = d1 < d2 ? f(n, d1) : f(n, d2);
    return q({ type: "compare-order-b", marks: 1, prompt: `Which is bigger: ${f(n, d1)} or ${f(n, d2)}?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: d1, shaded: n }, { den: d2, shaded: n }] }), answer: big, working: ["Same number of parts. The smaller bottom number means bigger parts."], space: SPACE_SIZES.SMALL, mcDistractors: [big === f(n, d1) ? f(n, d2) : f(n, d1), "They are equal"], tags: ["compare"] });
  }
  if (v === "same-den") {
    const d = choice([5, 6, 8, 10]); const a = randInt(1, d - 1); let b = randInt(1, d - 1); if (a === b) b = a === 1 ? 2 : a - 1;
    return q({ type: "compare-order-b", marks: 1, prompt: `Write <, > or =.   ${f(a, d)} ☐ ${f(b, d)}`, answer: a > b ? ">" : "<", working: [`Same-sized parts: ${Math.max(a, b)} parts is more than ${Math.min(a, b)} parts.`], space: SPACE_SIZES.SMALL, mcDistractors: [a > b ? "<" : ">", "="], tags: ["compare"] });
  }
  const set = [1 / 2, 1 / 4, 1 / 8, 1 / 3, 1 / 5, 1 / 10].map((x, i) => [x, [2, 4, 8, 3, 5, 10][i]]);
  let pick; do { pick = set.slice().sort(() => Math.random() - 0.5).slice(0, 3); } while (pick[0][0] < pick[1][0] && pick[1][0] < pick[2][0]);
  const sorted = pick.slice().sort((a, b) => a[0] - b[0]).map(p => f(1, p[1]));
  return q({ type: "compare-order-b", marks: 1, prompt: `Order from smallest to largest:  ${pick.map(p => f(1, p[1])).join(",  ")}`, answer: sorted.join(",  "), working: ["For unit fractions, the bigger the bottom number, the smaller the part."], space: SPACE_SIZES.SMALL, mcDistractors: [sorted.slice().reverse().join(",  ")], tags: ["order", "unit fractions"] });
}

function halfBenchmarkQuestion() {
  const d = choice([4, 5, 6, 8, 10]); let n = randInt(1, d - 1);
  if (2 * n === d && Math.random() < 0.6) n = n + 1;
  const rel = 2 * n > d ? "more than" : 2 * n < d ? "less than" : "equal to";
  return q({ type: "half-benchmark", marks: 1, prompt: `Is ${f(n, d)} more than, less than or equal to ${f(1, 2)}?`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 2, shaded: 1 }, { den: d, shaded: n }] }), answer: rel, working: [`Half of ${d} parts is ${d / 2} parts.`, `${n} ${rel === "equal to" ? "is" : rel === "more than" ? "is more than" : "is less than"} half of ${d}.`], space: SPACE_SIZES.SMALL, mcDistractors: ["more than", "less than", "equal to"].filter(x => x !== rel), tags: ["benchmark"] });
}

function makeAWholeQuestion() {
  const d = choice([3, 4, 5, 6, 8, 10]); const n = randInt(1, d - 1);
  return q({ type: "make-a-whole", marks: 1, prompt: `${f(n, d)} + ☐ = 1`, diagram: mani({ diagramType: "fraction-strip", strips: [{ den: d, shaded: n }] }), answer: f(d - n, d), working: [`1 whole = ${f(d, d)}. ${d} − ${n} = ${d - n}.`], space: SPACE_SIZES.SMALL, mcDistractors: [f(n, d), f(d - n + 1, d), f(1, d)], tags: ["whole"] });
}

function fractionOfCollectionQuestion() {
  const d = choice([2, 3, 4, 5]); const e = randInt(2, 4); const total = d * e; const n = randInt(1, d - 1);
  return q({ type: "fraction-of-collection", marks: 1, prompt: `There are ${total} stars in ${d} equal groups. What is ${f(n, d)} of ${total}?`, diagram: mani({ diagramType: "groups", groups: d, each: e, item: "star" }), answer: String(n * e), working: [`${f(1, d)} of ${total} = ${e} (one group)`, `${f(n, d)} of ${total} = ${n} groups = ${n * e}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(total), String(n * e + 1), String(n * e - 1 || n * e + 2), String(d)], tags: ["collection"] });
}

function tenthsDecimalsQuestion() {
  const n = randInt(1, 9);
  if (Math.random() < 0.5) return q({ type: "tenths-decimals", marks: 1, prompt: "Write the shaded part as a fraction and as a decimal.", diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 10, shaded: n }] }), answer: `${f(n, 10)} = 0.${n}`, working: [`${n} tenths shaded`], space: SPACE_SIZES.SMALL, mcDistractors: [`${f(n, 10)} = ${n}.0`, `${f(10 - n, 10)} = 0.${10 - n}`, `${f(n, 100)} = 0.0${n}`], tags: ["decimals"] });
  return q({ type: "tenths-decimals", marks: 1, prompt: `What decimal is at A?`, diagram: mani({ diagramType: "number-line", min: 0, max: 1, step: 0.1, majorEvery: 10, labels: [0, 1], points: [{ value: n / 10, label: "A" }] }), answer: `0.${n} (${f(n, 10)})`, working: [`0 to 1 is cut into 10 tenths. A is ${n} tenths along.`], space: SPACE_SIZES.SMALL, mcDistractors: [`0.${Math.min(9, n + 1)} (${f(Math.min(9, n + 1), 10)})`, `${n} (${f(n, 1)})`, `0.0${n}`], tags: ["decimals", "number line"] });
}

const GENERATORS = {
  "fifths-tenths": fifthsTenthsQuestion,
  "halving-thirds": halvingThirdsQuestion,
  "number-line-beyond-1": numberLineBeyond1Question,
  "count-beyond-1": countBeyond1Question,
  "equivalent-wall": equivalentWallQuestion,
  "equivalent-shapes": equivalentShapesQuestion,
  "compare-order-b": compareOrderBQuestion,
  "half-benchmark": halfBenchmarkQuestion,
  "make-a-whole": makeAWholeQuestion,
  "fraction-of-collection": fractionOfCollectionQuestion,
  "tenths-decimals": tenthsDecimalsQuestion
};

export function getFractionsBQuestionTypes() { return TYPE_LIST; }
export function generateFractionsBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
