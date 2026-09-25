/*
  Mills Maths Tools — Stage 1 Question Bank: Numbers to 1000 (B)
  ---------------------------------------------------------------
  question-banks/stage-1/whole-numbers-b/index.js

  NSW Mathematics K–10 (2022), Stage 1, Representing whole numbers B —
  MA1-RWN-01 and MA1-RWN-02.

  Big ideas:
    - ten tens make one hundred (the same "bundle of ten" idea again);
    - zero holds a place: 305 has no tens;
    - a number can be split (partitioned) in more than one way:
      46 = 4 tens 6 ones = 3 tens 16 ones;
    - even numbers make pairs with none left over.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, pic, words, makeStage1, randInt, choice } from "../../_shared/stage1-helpers.js";

const TOPIC = "Numbers to 1000 B";
const q = makeStage1(TOPIC, "MA1-RWN-01");
const q2 = makeStage1(TOPIC, "MA1-RWN-02");

const TYPE_LIST = [
  { id: "hto-blocks", label: "Hundreds, tens and ones (blocks)" },
  { id: "hto-split", label: "Split into hundreds, tens and ones" },
  { id: "zero-place", label: "Zero holds a place" },
  { id: "rename", label: "Split another way (renaming)" },
  { id: "expanded", label: "Expanded form" },
  { id: "digit-value", label: "What is the digit worth?" },
  { id: "bigger-smaller", label: "Bigger or smaller?" },
  { id: "order-3digit", label: "Order 3-digit numbers" },
  { id: "number-line-b", label: "Number lines to 1000" },
  { id: "odd-even", label: "Odd or even?" },
  { id: "count-by-tens-hundreds", label: "Count by 10s and 100s" },
  { id: "words-to-1000", label: "Number words to 1000" },
  { id: "ten-hundred-more", label: "10 more, 100 more" }
];

const hto = n => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];

function htoBlocksQuestion() {
  const h = randInt(1, 3); const t = randInt(0, 6); const o = randInt(0, 7); const n = h * 100 + t * 10 + o;
  return q({ type: "hto-blocks", marks: 1, prompt: "What number do the blocks show?", diagram: mani({ diagramType: "base10", hundreds: h, tens: t, ones: o }), answer: String(n), working: [`${h} hundreds, ${t} tens, ${o} ones`, `${h * 100} + ${t * 10} + ${o} = ${n}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(h + t + o), `${h}${o}${t}`, String(n + 10)].filter(x => x !== String(n)), tags: ["place value"] });
}

function htoSplitQuestion() {
  const n = randInt(101, 999); const [h, t, o] = hto(n);
  if (h === t && t === o) return htoSplitQuestion();
  return q2({ type: "hto-split", marks: 1, prompt: `${n} = ☐ hundreds, ☐ tens, ☐ ones`, diagram: mani({ diagramType: "pv-chart", columns: ["H", "T", "O"], digits: [null, null, null] }), answer: `${h} hundreds, ${t} tens, ${o} ones`, working: ["Read each digit's place."], space: SPACE_SIZES.SMALL, mcDistractors: [`${o} hundreds, ${t} tens, ${h} ones`, `${h} hundreds, ${o} tens, ${t} ones`].filter(x => x !== `${h} hundreds, ${t} tens, ${o} ones`), tags: ["place value"] });
}

function zeroPlaceQuestion() {
  const h = randInt(1, 4); const o = randInt(1, 9); const noTens = Math.random() < 0.6;
  const t = noTens ? 0 : randInt(1, 9); const oo = noTens ? o : 0; const n = h * 100 + t * 10 + oo;
  return q({ type: "zero-place", marks: 1, prompt: "Write the number. Be careful with zero!", diagram: mani({ diagramType: "base10", hundreds: h, tens: t, ones: oo }), answer: String(n), working: [noTens ? `There are no tens, so write 0 in the tens place: ${n}.` : `There are no ones, so write 0 in the ones place: ${n}.`], space: SPACE_SIZES.SMALL, mcDistractors: [noTens ? `${h}${o}` : `${h}${t}`, String(n + 10), noTens ? `${h}${o}0` : `${h}0${t}`].filter(x => x !== String(n)), tags: ["zero"] });
}

function renameQuestion() {
  const t = randInt(2, 9); const o = randInt(0, 9); const n = t * 10 + o; const k = randInt(1, Math.min(3, t - 1));
  return q2({ type: "rename", marks: 1, prompt: `${n} = ${t - k} tens and ☐ ones`, diagram: mani({ diagramType: "base10", tens: t, ones: o }), answer: String(o + 10 * k), working: [`Break ${k} ten${k > 1 ? "s" : ""} into ${10 * k} ones.`, `${(t - k) * 10} + ${o + 10 * k} = ${n}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(o), String(o + k), String(o + 10 * k + 10)], tags: ["partition", "renaming"] });
}

function expandedQuestion() {
  const n = randInt(101, 999); const [h, t, o] = hto(n); if (!t || !o) return expandedQuestion();
  const blank = choice(["h", "t", "o"]);
  const parts = { h: h * 100, t: t * 10, o };
  const s = ["h", "t", "o"].map(k => (k === blank ? "☐" : parts[k])).join(" + ");
  return q2({ type: "expanded", marks: 1, prompt: `${n} = ${s}`, answer: String(parts[blank]), working: [`${h * 100} + ${t * 10} + ${o} = ${n}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(blank === "h" ? h : blank === "t" ? t : o * 10), String(parts[blank] * 10), String(blank === "o" ? o + 1 : parts[blank] + (blank === "h" ? 100 : 10))], tags: ["expanded"] });
}

function digitValueQuestion() {
  const n = randInt(111, 999); const d = String(n); const i = randInt(0, 2); if (new Set(d).size < 3 || d.includes("0")) return digitValueQuestion();
  const val = Number(d[i]) * 10 ** (2 - i);
  return q({ type: "digit-value", marks: 1, prompt: `What is the ${d[i]} worth in ${n}?`, diagram: mani({ diagramType: "pv-chart", columns: ["H", "T", "O"], digits: d.split("") }), answer: String(val), working: [`The ${d[i]} is in the ${["hundreds", "tens", "ones"][i]} place.`], space: SPACE_SIZES.SMALL, mcDistractors: [d[i], String(Number(d[i]) * 10), String(Number(d[i]) * 100)].filter(x => x !== String(val)), tags: ["place value"] });
}

function biggerSmallerQuestion() {
  const a = randInt(100, 999); let b = Number(String(a).split("").reverse().join(""));
  if (b === a || b < 100) { const steps = [100, -100, 10, -10, 1].filter(x => a + x < 1000 && a + x > 99); b = a + choice(steps); }
  const ask = choice(["bigger", "smaller"]); const ans = ask === "bigger" ? Math.max(a, b) : Math.min(a, b);
  return q({ type: "bigger-smaller", marks: 1, prompt: `Which number is ${ask}?`, diagram: mani({ diagramType: "cards", items: [String(a), String(b)] }), answer: String(ans), working: ["Compare the hundreds first, then the tens, then the ones."], space: SPACE_SIZES.SMALL, mcDistractors: [String(ans === a ? b : a)], tags: ["compare"] });
}

function order3DigitQuestion() {
  const nums = []; const h = randInt(1, 8);
  while (nums.length < 4) { const v = choice([h, h + 1]) * 100 + randInt(0, 99); if (!nums.includes(v)) nums.push(v); }
  const sorted = nums.slice().sort((x, y) => x - y);
  return q({ type: "order-3digit", marks: 1, prompt: "Order from smallest to largest.", diagram: mani({ diagramType: "cards", items: nums.map(String) }), answer: sorted.join(", "), working: ["Look at hundreds, then tens, then ones."], space: SPACE_SIZES.SMALL, mcDistractors: [sorted.slice().reverse().join(", "), nums.join(", ")].filter(x => x !== sorted.join(", ")), tags: ["order"] });
}

function numberLineBQuestion() {
  const kind = choice(["hundreds", "tens"]);
  if (kind === "hundreds") { const v = randInt(1, 9) * 100; return q2({ type: "number-line-b", marks: 1, prompt: "What number is at A?", diagram: mani({ diagramType: "number-line", min: 0, max: 1000, step: 100, labels: [0, 500, 1000], points: [{ value: v, label: "A" }] }), answer: String(v), working: ["Each jump is 100."], space: SPACE_SIZES.SMALL, mcDistractors: [String(v + 100), String(v - 100 || 50), String(v / 10)], tags: ["number line"] }); }
  const base = randInt(1, 8) * 100; const v = base + randInt(1, 9) * 10;
  return q2({ type: "number-line-b", marks: 1, prompt: "What number is at A?", diagram: mani({ diagramType: "number-line", min: base, max: base + 100, step: 10, labels: [base, base + 100], points: [{ value: v, label: "A" }] }), answer: String(v), working: [`Each jump is 10. Count on from ${base}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(v + 10), String(v - 10), String(base + (v - base) / 10)], tags: ["number line"] });
}

function oddEvenQuestion() {
  const n = randInt(3, 16); const even = n % 2 === 0;
  return q({ type: "odd-even", marks: 1, prompt: `Is ${n} odd or even?`, diagram: pic(n, choice(["heart", "ball", "star"]), { perRow: Math.ceil(n / 2) }), answer: even ? "even" : "odd", working: [even ? "They all make pairs. No one is left over." : "One is left over without a partner."], space: SPACE_SIZES.SMALL, mcDistractors: [even ? "odd" : "even"], tags: ["odd and even"] });
}

function countByTensHundredsQuestion() {
  const s = choice([10, 100]); const start = s === 10 ? randInt(10, 90) * 10 + randInt(0, 9) : randInt(1, 5) * 100 + randInt(0, 9) * 10;
  const seq = Array.from({ length: 5 }, (_, i) => start + i * s).filter(v => v <= 1000);
  if (seq.length < 5) return countByTensHundredsQuestion();
  const gap = randInt(2, 4);
  return q2({ type: "count-by-tens-hundreds", marks: 1, prompt: `Count by ${s}s. What is missing?  ${seq.map((v, i) => (i === gap ? "☐" : v)).join(", ")}`, answer: String(seq[gap]), working: [`Add ${s} each time.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(seq[gap] + 1), String(seq[gap - 1] + (s === 10 ? 100 : 10)), String(seq[gap] + s)], tags: ["skip counting"] });
}

function wordsTo1000Question() {
  const n = randInt(101, 999);
  if (Math.random() < 0.5) return q({ type: "words-to-1000", marks: 1, prompt: `Write the number: ${words(n)}`, answer: String(n), working: [], space: SPACE_SIZES.SMALL, mcDistractors: [`${Math.floor(n / 100)}00${n % 100}`, String(n + 10), String(n + 100)].filter(x => x !== String(n)), tags: ["number words"] });
  return q({ type: "words-to-1000", marks: 1, prompt: `Write ${n} in words.`, answer: words(n), working: [], space: SPACE_SIZES.SMALL, mcDistractors: [words(n + 10), words(n + 100 > 999 ? n - 100 : n + 100)], tags: ["number words"] });
}

function tenHundredMoreQuestion() {
  const n = randInt(110, 880); const [label, d] = choice([["10 more", 10], ["10 less", -10], ["100 more", 100], ["100 less", -100]]);
  return q({ type: "ten-hundred-more", marks: 1, prompt: `What is ${label} than ${n}?`, diagram: mani({ diagramType: "base10", hundreds: Math.floor(n / 100), tens: Math.floor(n / 10) % 10, ones: n % 10 }), answer: String(n + d), working: [Math.abs(d) === 100 ? "Only the hundreds digit changes." : "Only the tens digit changes (unless it rolls over)."], space: SPACE_SIZES.SMALL, mcDistractors: [String(n - d), String(n + (Math.abs(d) === 10 ? d * 10 : d / 10)), String(n + d / 10)], tags: ["more and less"] });
}

const GENERATORS = {
  "hto-blocks": htoBlocksQuestion,
  "hto-split": htoSplitQuestion,
  "zero-place": zeroPlaceQuestion,
  "rename": renameQuestion,
  "expanded": expandedQuestion,
  "digit-value": digitValueQuestion,
  "bigger-smaller": biggerSmallerQuestion,
  "order-3digit": order3DigitQuestion,
  "number-line-b": numberLineBQuestion,
  "odd-even": oddEvenQuestion,
  "count-by-tens-hundreds": countByTensHundredsQuestion,
  "words-to-1000": wordsTo1000Question,
  "ten-hundred-more": tenHundredMoreQuestion
};

export function getWholeNumbersBQuestionTypes() { return TYPE_LIST; }
export function generateWholeNumbersBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
