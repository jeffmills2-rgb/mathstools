/*
  Mills Maths Tools — Stage 1 Question Bank: Numbers to 120 (A)
  --------------------------------------------------------------
  question-banks/stage-1/whole-numbers-a/index.js

  NSW Mathematics K–10 (2022), Stage 1, Representing whole numbers A —
  MA1-RWN-01 and MA1-RWN-02.

  Big ideas:
    - the last number said tells how many (counting collections);
    - ten ones make one ten: teen numbers are "ten and some more";
    - the digit's place tells its value (tens and ones);
    - numbers have an order and a place on a number line and a number chart.

  Reading load: every prompt is one short sentence a Year 1 student can
  hear once and act on. The picture holds the maths.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, pic, tf, words, makeStage1, numOptions, ICONS, nameOf, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Numbers to 120 A";
const q = makeStage1(TOPIC, "MA1-RWN-01");
const q2 = makeStage1(TOPIC, "MA1-RWN-02");

const TYPE_LIST = [
  { id: "count-pictures", label: "Count the pictures" },
  { id: "ten-frame-count", label: "Count with ten-frames" },
  { id: "teen-numbers", label: "Teen numbers: ten and some more" },
  { id: "tens-ones-blocks", label: "Tens and ones (blocks)" },
  { id: "tens-ones-split", label: "Split into tens and ones" },
  { id: "before-after", label: "Before, after and between" },
  { id: "chart-missing", label: "Missing numbers on a number chart" },
  { id: "one-ten-more-less", label: "1 more, 1 less, 10 more, 10 less" },
  { id: "number-line-a", label: "Numbers on a number line" },
  { id: "more-or-less", label: "Which number is more?" },
  { id: "order-cards", label: "Order the numbers" },
  { id: "skip-count", label: "Skip count by 2s, 5s and 10s" },
  { id: "read-number-words", label: "Number words" }
];

function countPicturesQuestion() {
  const n = randInt(6, 20); const item = choice(ICONS);
  return q({ type: "count-pictures", marks: 1, prompt: `How many ${nameOf(item, 2)}?`, diagram: pic(n, item), answer: String(n), working: ["Touch and count each one once.", n > 10 ? "Count the full rows of 5 first." : ""].filter(Boolean), space: SPACE_SIZES.SMALL, mcDistractors: numOptions(n, { ten: false }), tags: ["counting"] });
}

function tenFrameCountQuestion() {
  const n = randInt(11, 20);
  return q({ type: "ten-frame-count", marks: 1, prompt: "How many dots?", diagram: tf(n), answer: String(n), working: ["One full ten-frame is 10.", `10 and ${n - 10} more is ${n}.`], space: SPACE_SIZES.SMALL, mcDistractors: numOptions(n, { ten: false }).concat(String(n - 10)).slice(0, 3), tags: ["ten-frame"] });
}

function teenNumbersQuestion() {
  const k = randInt(1, 9); const v = choice(["make", "split"]);
  if (v === "make") return q2({ type: "teen-numbers", marks: 1, prompt: `10 and ${k} make ☐`, diagram: tf(10, k), answer: String(10 + k), working: [`10 + ${k} = ${10 + k}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(k), String(10 + k + 1), String(k * 10)].filter(x => x !== String(10 + k)), tags: ["teen numbers"] });
  return q2({ type: "teen-numbers", marks: 1, prompt: `${10 + k} is 10 and ☐`, diagram: tf(10, k), answer: String(k), working: [`${10 + k} = 10 + ${k}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(k + 1), String(10 + k), "1"].filter(x => x !== String(k)), tags: ["teen numbers"] });
}

function tensOnesBlocksQuestion() {
  const t = randInt(1, 9); const o = randInt(0, 9); const n = t * 10 + o;
  return q({ type: "tens-ones-blocks", marks: 1, prompt: "What number do the blocks show?", diagram: mani({ diagramType: "base10", tens: t, ones: o }), answer: String(n), working: [`${t} tens = ${t * 10}`, `${t * 10} + ${o} = ${n}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(o * 10 + t), String(t + o), String(n + 10)].filter(x => x !== String(n)), tags: ["place value"] });
}

function tensOnesSplitQuestion() {
  const t = randInt(1, 9); const o = randInt(0, 9); const n = t * 10 + o;
  return q2({ type: "tens-ones-split", marks: 1, prompt: `${n} = ☐ tens and ☐ ones`, diagram: mani({ diagramType: "pv-chart", columns: ["T", "O"], digits: [null, null] }), answer: `${t} tens and ${o} ones`, working: [`The ${t} is in the tens place. The ${o} is in the ones place.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${o} tens and ${t} ones`, `${n} tens and 0 ones`, `${t + 1} tens and ${o} ones`].filter(x => x !== `${t} tens and ${o} ones`), tags: ["place value", "partition"] });
}

function beforeAfterQuestion() {
  const n = randInt(12, 118); const v = choice(["after", "before", "between"]);
  const lo = n - 2;
  if (v === "after") return q({ type: "before-after", marks: 1, prompt: `What number comes after ${n}?`, diagram: mani({ diagramType: "hundred-chart", from: lo, to: n + 2, cols: 5, blanks: [n + 1] }), answer: String(n + 1), working: [`${n}, ${n + 1}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n - 1), String(n + 10), String(n + 2)], tags: ["order"] });
  if (v === "before") return q({ type: "before-after", marks: 1, prompt: `What number comes before ${n}?`, diagram: mani({ diagramType: "hundred-chart", from: lo, to: n + 2, cols: 5, blanks: [n - 1] }), answer: String(n - 1), working: [`${n - 1}, ${n}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n + 1), String(n - 10), String(n - 2)], tags: ["order"] });
  return q({ type: "before-after", marks: 1, prompt: `What number is between ${n - 1} and ${n + 1}?`, diagram: mani({ diagramType: "hundred-chart", from: n - 1, to: n + 1, cols: 3, blanks: [n] }), answer: String(n), working: [`${n - 1}, ${n}, ${n + 1}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n + 1), String(n - 1), String(n + 10)], tags: ["order"] });
}

function chartMissingQuestion() {
  const startRow = randInt(0, 8); const from = startRow * 10 + 1; const to = from + 29;
  const blanks = shuffle(Array.from({ length: 30 }, (_, i) => from + i)).slice(0, 3).sort((a, b) => a - b);
  return q({ type: "chart-missing", marks: 2, prompt: "Write the missing numbers.", diagram: mani({ diagramType: "hundred-chart", from, to, blanks }), answer: blanks.join(", "), working: ["Across: add 1. Down: add 10."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["number chart"] });
}

function oneTenMoreLessQuestion() {
  const n = randInt(12, 88); const [label, d] = choice([["1 more", 1], ["1 less", -1], ["10 more", 10], ["10 less", -10]]);
  const row = Math.floor((n - 1) / 10) * 10;
  return q({ type: "one-ten-more-less", marks: 1, prompt: `What is ${label} than ${n}?`, diagram: mani({ diagramType: "hundred-chart", from: Math.max(1, row - 9), to: Math.min(120, row + 20), shade: [n] }), answer: String(n + d), working: [Math.abs(d) === 10 ? `Go ${d > 0 ? "down" : "up"} one row: ${n + d}.` : `Go one ${d > 0 ? "right" : "left"}: ${n + d}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n - d), String(n + (Math.abs(d) === 1 ? d * 10 : d / 10)), String(n)], tags: ["more and less"] });
}

function numberLineAQuestion() {
  const max = choice([10, 20, 20, 100]); const step = max === 100 ? 10 : 1;
  const val = max === 100 ? randInt(1, 9) * 10 : randInt(1, max - 1);
  return q2({ type: "number-line-a", marks: 1, prompt: "What number is at A?", diagram: mani({ diagramType: "number-line", min: 0, max, step, majorEvery: max === 20 ? 5 : 1, labels: max === 20 ? [0, 5, 10, 15, 20] : max === 10 ? [0, 10] : [0, 50, 100], points: [{ value: val, label: "A" }] }), answer: String(val), working: [`Count the jumps of ${step} from 0.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(val + step), String(val - step || val + 2 * step), String(max - val)].filter(x => x !== String(val)), tags: ["number line"] });
}

function moreOrLessQuestion() {
  let a = randInt(11, 99); let b = Number(String(a).split("").reverse().join("")); if (a === b || b < 10) b = a + choice([-10, 10, 3, -3]);
  const ask = choice(["more", "less"]); const ans = ask === "more" ? Math.max(a, b) : Math.min(a, b);
  return q({ type: "more-or-less", marks: 1, prompt: `Which number is ${ask}?`, diagram: mani({ diagramType: "cards", items: shuffle([String(a), String(b)]) }), answer: String(ans), working: ["Look at the tens first."], space: SPACE_SIZES.SMALL, mcDistractors: [String(ans === a ? b : a)], tags: ["compare"] });
}

function orderCardsQuestion() {
  const nums = []; while (nums.length < 4) { const v = randInt(5, 120); if (!nums.includes(v)) nums.push(v); }
  const sorted = nums.slice().sort((x, y) => x - y);
  return q({ type: "order-cards", marks: 1, prompt: "Order from smallest to largest.", diagram: mani({ diagramType: "cards", items: nums.map(String) }), answer: sorted.join(", "), working: ["Compare hundreds, then tens, then ones."], space: SPACE_SIZES.SMALL, mcDistractors: [sorted.slice().reverse().join(", "), nums.join(", ")].filter(x => x !== sorted.join(", ")), tags: ["order"] });
}

function skipCountQuestion() {
  const s = choice([2, 5, 10]); const start = s * randInt(1, s === 10 ? 6 : 8);
  const seq = Array.from({ length: 5 }, (_, i) => start + i * s); const gap = randInt(2, 4);
  return q2({ type: "skip-count", marks: 1, prompt: `Count by ${s}s. What is missing?  ${seq.map((v, i) => (i === gap ? "☐" : v)).join(", ")}`, diagram: mani({ diagramType: "hundred-chart", from: 1, to: s === 2 ? 30 : 60, shade: seq.filter((_, i) => i !== gap) }), answer: String(seq[gap]), working: [`Add ${s} each time.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(seq[gap] + 1), String(seq[gap] + s), String(seq[gap] - 1)], tags: ["skip counting"] });
}

function readNumberWordsQuestion() {
  const n = randInt(11, 99);
  if (Math.random() < 0.5) return q({ type: "read-number-words", marks: 1, prompt: `Write ${words(n)} as a number.`, answer: String(n), working: [], space: SPACE_SIZES.SMALL, mcDistractors: [String(Number(String(n).split("").reverse().join("")) || n + 1), String(n + 10), String(n + 1)].filter(x => x !== String(n)), tags: ["number words"] });
  return q({ type: "read-number-words", marks: 1, prompt: `Write ${n} in words.`, answer: words(n), working: [], space: SPACE_SIZES.SMALL, mcDistractors: [words(n + 1), words(Number(String(n).split("").reverse().join("")) || n + 2)].filter(x => x !== words(n)), tags: ["number words"] });
}

const GENERATORS = {
  "count-pictures": countPicturesQuestion,
  "ten-frame-count": tenFrameCountQuestion,
  "teen-numbers": teenNumbersQuestion,
  "tens-ones-blocks": tensOnesBlocksQuestion,
  "tens-ones-split": tensOnesSplitQuestion,
  "before-after": beforeAfterQuestion,
  "chart-missing": chartMissingQuestion,
  "one-ten-more-less": oneTenMoreLessQuestion,
  "number-line-a": numberLineAQuestion,
  "more-or-less": moreOrLessQuestion,
  "order-cards": orderCardsQuestion,
  "skip-count": skipCountQuestion,
  "read-number-words": readNumberWordsQuestion
};

export function getWholeNumbersAQuestionTypes() { return TYPE_LIST; }
export function generateWholeNumbersAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
