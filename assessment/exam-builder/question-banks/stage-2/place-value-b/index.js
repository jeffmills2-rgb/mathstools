/*
  Mills Maths Tools — Stage 2 Question Bank: Place Value B
  ---------------------------------------------------------
  question-banks/stage-2/place-value-b/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Representing numbers using place
  value B" — MA2-RN-01 (to tens of thousands) and MA2-RN-02 (decimals to
  2 decimal places).

  Big ideas:
    - the same ten-for-one pattern keeps going left (ten thousands) and right
      (tenths, hundredths) of the ones place;
    - rounding asks "which landmark number is closer?", so it is taught on a
      number line;
    - a decimal is another way to write tenths and hundredths of one whole —
      shown on tenth strips and hundredth grids before the notation.

  Types run: bigger numbers → rounding (number line first) → tenths →
  hundredths → decimal place value → decimals on a number line → comparing
  and ordering → fractions ↔ decimals → money.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, sp, words, digitsOf, placeValueOf, distinct, makeStage2, pvDistractors, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Place Value B";
const q = makeStage2(TOPIC, "MA2-RN-01");
const qd = makeStage2(TOPIC, "MA2-RN-02");

const TYPE_LIST = [
  { id: "read-5-digit", label: "Read 5-digit numbers in a chart" },
  { id: "value-5-digit", label: "Value of a digit in a 5-digit number" },
  { id: "expanded-5-digit", label: "Expanded form to tens of thousands" },
  { id: "words-5-digit", label: "Numerals and words to tens of thousands" },
  { id: "round-number-line", label: "Round using a number line" },
  { id: "round-to-place", label: "Round to the nearest 10, 100 or 1000" },
  { id: "which-rounds", label: "Which numbers round to…?" },
  { id: "tenths-strip", label: "Tenths on a strip" },
  { id: "hundredths-grid", label: "Hundredths on a grid" },
  { id: "decimal-pv", label: "Place value in decimals" },
  { id: "decimal-number-line", label: "Decimals on a number line" },
  { id: "compare-decimals", label: "Compare decimals" },
  { id: "order-decimals", label: "Order decimals" },
  { id: "fraction-decimal", label: "Tenths and hundredths as fractions and decimals" },
  { id: "decimal-blocks", label: "Decimals with base-ten blocks" },
  { id: "money-decimals", label: "Money: dollars and cents" }
];

const num5 = () => randInt(10000, 99999);
const PLACES5 = ["ones", "tens", "hundreds", "thousands", "ten thousands"];
const dec = (n, dp = 2) => Number(n.toFixed(dp)).toString();

function read5DigitQuestion() {
  const n = num5(); const d = digitsOf(n);
  return q({ type: "read-5-digit", marks: 1, prompt: "What number is shown in the chart?", diagram: mani({ diagramType: "pv-chart", columns: ["TTh", "Th", "H", "T", "O"], digits: d.map(String) }), answer: sp(n), working: [`${d[0]} ten thousands, ${d[1]} thousands, ${d[2]} hundreds, ${d[3]} tens, ${d[4]} ones`], space: SPACE_SIZES.SMALL, mcDistractors: pvDistractors(n), tags: ["tens of thousands"] });
}

function value5DigitQuestion() {
  let n; let pos; do { n = num5(); pos = randInt(0, 4); } while (placeValueOf(n, pos) === 0 || digitsOf(n).filter(v => v === placeValueOf(n, pos)).length > 1);
  const d = placeValueOf(n, pos);
  return q({ type: "value-5-digit", marks: 1, prompt: `What is the value of the ${d} in ${sp(n)}?`, answer: sp(d * 10 ** pos), working: [`The ${d} is in the ${PLACES5[pos]} place.`], space: SPACE_SIZES.SMALL, mcDistractors: [0, 1, 2, 3, 4].filter(p => p !== pos).map(p => sp(d * 10 ** p)).slice(0, 3), tags: ["value"] });
}

function expanded5DigitQuestion() {
  const n = num5(); const parts = digitsOf(n).map((v, i) => v * 10 ** (4 - i)).filter(Boolean);
  if (Math.random() < 0.5) return q({ type: "expanded-5-digit", marks: 1, prompt: `Write ${sp(n)} in expanded form.`, answer: parts.map(sp).join(" + "), working: [], space: SPACE_SIZES.SMALL, mcDistractors: [parts.map(v => sp(v / 10)).join(" + ")], tags: ["expanded"] });
  return q({ type: "expanded-5-digit", marks: 1, prompt: `What number is ${shuffle(parts).map(sp).join(" + ")}?`, answer: sp(n), working: ["Put each part in its place."], space: SPACE_SIZES.SMALL, mcDistractors: pvDistractors(n), tags: ["expanded"] });
}

function words5DigitQuestion() {
  const n = choice([num5(), randInt(10, 99) * 1000 + randInt(0, 9), randInt(10, 99) * 1000 + randInt(1, 9) * 100]);
  if (Math.random() < 0.5) return q({ type: "words-5-digit", marks: 1, prompt: `Write the numeral: ${words(n)}.`, answer: sp(n), working: ["Use zeros to hold empty places."], space: SPACE_SIZES.SMALL, mcDistractors: pvDistractors(n), tags: ["words"] });
  return q({ type: "words-5-digit", marks: 1, prompt: `Write ${sp(n)} in words.`, answer: words(n), working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["words"] });
}

const roundTo = (n, p) => Math.round(n / p) * p;

function roundNumberLineQuestion() {
  const p = choice([10, 100, 1000]);
  let n; do { n = p === 1000 ? randInt(1000, 9999) : randInt(100, 9999); } while (n % p === 0 || (n % p) === p / 2);
  const lo = Math.floor(n / p) * p; const hi = lo + p;
  return q({ type: "round-number-line", marks: 1, prompt: `${sp(n)} is marked. Is it closer to ${sp(lo)} or ${sp(hi)}? Round it to the nearest ${sp(p)}.`, diagram: mani({ diagramType: "number-line", min: lo, max: hi, step: p / 10, majorEvery: 5, labels: [lo, lo + p / 2, hi], points: [{ value: p === 10 ? n : Math.round((n - lo) / (p / 10)) * (p / 10) + lo, label: sp(n) }] }), answer: sp(roundTo(n, p)), working: [`Halfway is ${sp(lo + p / 2)}.`, `${sp(n)} is ${n > lo + p / 2 ? "past" : "before"} halfway, so it rounds to ${sp(roundTo(n, p))}.`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(roundTo(n, p) === lo ? hi : lo), sp(roundTo(n, p * 10))].filter(s => s !== sp(roundTo(n, p))), tags: ["rounding"] });
}

function roundToPlaceQuestion() {
  const p = choice([10, 100, 1000]); const n = randInt(1000, 99999);
  return q({ type: "round-to-place", marks: 1, prompt: `Round ${sp(n)} to the nearest ${sp(p)}.`, answer: sp(roundTo(n, p)), working: [`Look at the digit to the right of the ${p === 10 ? "tens" : p === 100 ? "hundreds" : "thousands"} place. 5 or more rounds up.`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(Math.floor(n / p) * p), sp(Math.ceil(n / p) * p), sp(roundTo(n, p * 10))].filter(s => s !== sp(roundTo(n, p))), tags: ["rounding"] });
}

function whichRoundsQuestion() {
  const p = choice([10, 100]); const target = randInt(3, 90) * p;
  const good = target + choice([-1, 1]) * randInt(1, p / 2 - 1);
  const bad = distinct(() => target + choice([-1, 1]) * randInt(p / 2 + 1, p + p / 3), 3);
  return q({ type: "which-rounds", marks: 1, prompt: `Which number rounds to ${sp(target)} (to the nearest ${p})?`, diagram: mani({ diagramType: "cards", items: shuffle([good, ...bad]).map(sp) }), answer: sp(good), working: [`It must be within ${p / 2} of ${sp(target)}.`], space: SPACE_SIZES.SMALL, mcDistractors: bad.map(sp), tags: ["rounding"] });
}

function tenthsStripQuestion() {
  const k = randInt(1, 9);
  return qd({ type: "tenths-strip", marks: 1, prompt: "The strip is one whole. What part is shaded? Write it as a decimal.", diagram: mani({ diagramType: "grid10", size: 10, shaded: k }), answer: `0.${k}`, working: [`${k} of the 10 equal parts = ${k} tenths = 0.${k}`], space: SPACE_SIZES.SMALL, mcDistractors: [`0.0${k}`, `${k}.0`, `0.${10 - k}`], tags: ["tenths"] });
}

function hundredthsGridQuestion() {
  const k = randInt(3, 97);
  const asDec = (k / 100).toString();
  return qd({ type: "hundredths-grid", marks: 1, prompt: "The big square is one whole. What part is shaded? Write it as a decimal.", diagram: mani({ diagramType: "grid10", size: 100, shaded: k }), answer: asDec, working: [`${k} of 100 squares = ${k} hundredths = ${asDec}`, k >= 10 ? `(${Math.floor(k / 10)} full columns are ${Math.floor(k / 10)} tenths)` : ""].filter(Boolean), space: SPACE_SIZES.SMALL, mcDistractors: [`${k}`, (k / 10).toString(), (k / 1000).toString()].filter(s => s !== asDec), tags: ["hundredths"] });
}

function decimalPvQuestion() {
  const o = randInt(0, 9); const t = randInt(1, 9); const h = randInt(1, 9);
  const n = `${o}.${t}${h}`;
  const ask = choice(["tenths", "hundredths", "value"]);
  if (ask === "value") {
    const which = choice(["t", "h"]); const dgt = which === "t" ? t : h;
    if (t === h) return decimalPvQuestion();
    return qd({ type: "decimal-pv", marks: 1, prompt: `What is the value of the ${dgt} in ${n}?`, diagram: mani({ diagramType: "pv-chart", columns: ["O", ".", "t", "h"], digits: [String(o), "", String(t), String(h)] }), answer: which === "t" ? `${dgt} tenths (0.${dgt})` : `${dgt} hundredths (0.0${dgt})`, working: [`The ${dgt} is in the ${which === "t" ? "tenths" : "hundredths"} place.`], space: SPACE_SIZES.SMALL, mcDistractors: [which === "t" ? `${dgt} hundredths (0.0${dgt})` : `${dgt} tenths (0.${dgt})`, `${dgt} ones (${dgt})`], tags: ["decimal place value"] });
  }
  return qd({ type: "decimal-pv", marks: 1, prompt: `Which digit is in the ${ask} place in ${n}?`, answer: String(ask === "tenths" ? t : h), working: ["Tenths come first after the point, then hundredths."], space: SPACE_SIZES.SMALL, mcDistractors: [String(ask === "tenths" ? h : t), String(o)].filter(s => s !== String(ask === "tenths" ? t : h)), tags: ["decimal place value"] });
}

function decimalNumberLineQuestion() {
  const v = choice(["tenths", "tenths-2", "hundredths"]);
  if (v === "hundredths") { const base = randInt(0, 3) + randInt(1, 8) / 10; const k = randInt(1, 9); const val = +(base + k / 100).toFixed(2); return qd({ type: "decimal-number-line", marks: 1, prompt: "What decimal is at A?", diagram: mani({ diagramType: "number-line", min: base, max: +(base + 0.1).toFixed(1), step: 0.01, majorEvery: 5, labels: [base, +(base + 0.1).toFixed(1)], fmt: "dec", points: [{ value: val, label: "A" }] }), answer: dec(val), working: [`Each small step is 0.01.`, `${dec(base)} + ${k} hundredths = ${dec(val)}`], space: SPACE_SIZES.SMALL, mcDistractors: [dec(base + k / 10), dec(val + 0.01), `${dec(base)}${k}`].filter(s => s !== dec(val)), tags: ["number line"] }); }
  const start = v === "tenths" ? 0 : randInt(1, 5); const k = randInt(1, 9); const val = +(start + k / 10).toFixed(1);
  return qd({ type: "decimal-number-line", marks: 1, prompt: "What decimal is at A?", diagram: mani({ diagramType: "number-line", min: start, max: start + 1, step: 0.1, labels: [start, start + 1], fmt: "dec", points: [{ value: val, label: "A" }] }), answer: dec(val, 1), working: [`The line from ${start} to ${start + 1} is cut into 10 tenths.`, `A is ${k} tenths past ${start}.`], space: SPACE_SIZES.SMALL, mcDistractors: [dec(start + k / 100), dec(start + k), dec(val + 0.1, 1)].filter(s => s !== dec(val, 1)), tags: ["number line"] });
}

function compareDecimalsQuestion() {
  const pairs = [[0.7, 0.65], [0.4, 0.38], [1.5, 1.45], [2.09, 2.1], [0.3, 0.29], [3.61, 3.6], [0.5, 0.05], [1.2, 1.19]];
  const shift = Math.random() < 0.5 ? 0 : randInt(1, 3);
  let [a, b] = choice(pairs).map(v => +(v + shift).toFixed(2));
  if (Math.random() < 0.5) [a, b] = [b, a];
  return qd({ type: "compare-decimals", marks: 1, prompt: `Write < or > in the box: ${dec(a)} ☐ ${dec(b)}`, answer: a < b ? "<" : ">", working: ["Compare ones, then tenths, then hundredths.", `${dec(a)} ${a < b ? "<" : ">"} ${dec(b)}`], space: SPACE_SIZES.SMALL, mcDistractors: [a < b ? ">" : "<", "="], tags: ["compare"] });
}

function orderDecimalsQuestion() {
  const base = randInt(0, 4);
  const vals = distinct(() => +(base + randInt(1, 99) / 100).toFixed(2), 4);
  const tricky = [...vals]; tricky[0] = +(base + randInt(1, 9) / 10).toFixed(1);
  const set = [...new Set(tricky)];
  if (set.length < 4) return orderDecimalsQuestion();
  const sorted = [...set].sort((x, y) => x - y);
  return qd({ type: "order-decimals", marks: 1, prompt: "Order from smallest to largest.", diagram: mani({ diagramType: "cards", items: set.map(v => dec(v)) }), answer: sorted.map(v => dec(v)).join(", "), working: ["Line up the decimal points. Compare tenths, then hundredths."], space: SPACE_SIZES.SMALL, mcDistractors: [[...set].sort((x, y) => String(x).length - String(y).length || x - y).map(v => dec(v)).join(", "), [...sorted].reverse().map(v => dec(v)).join(", ")].filter(s => s !== sorted.map(v => dec(v)).join(", ")), tags: ["order"] });
}

function fractionDecimalQuestion() {
  const v = choice(["t2d", "h2d", "d2f"]);
  if (v === "t2d") { const k = randInt(1, 9); return qd({ type: "fraction-decimal", marks: 1, prompt: `Write [[frac:${k}:10]] as a decimal.`, answer: `0.${k}`, working: [`${k} tenths = 0.${k}`], space: SPACE_SIZES.SMALL, mcDistractors: [`0.0${k}`, `${k}.10`, `1.${k}`], tags: ["fractions and decimals"] }); }
  if (v === "h2d") { const k = randInt(1, 99); const d = (k / 100).toString(); return qd({ type: "fraction-decimal", marks: 1, prompt: `Write [[frac:${k}:100]] as a decimal.`, answer: d, working: [`${k} hundredths = ${d}`], space: SPACE_SIZES.SMALL, mcDistractors: [(k / 10).toString(), `0.${k}`, `${k}.100`].filter(s => s !== d), tags: ["fractions and decimals"] }); }
  const k = randInt(11, 99); const d = (k / 100).toString();
  if (k % 10 === 0) return fractionDecimalQuestion();
  return qd({ type: "fraction-decimal", marks: 1, prompt: `Write ${d} as a fraction.`, answer: `[[frac:${k}:100]]`, working: [`${d} = ${k} hundredths`], space: SPACE_SIZES.SMALL, mcDistractors: [`[[frac:${k}:10]]`, `[[frac:${Math.floor(k / 10)}:10]]`, `[[frac:1:${k}]]`], tags: ["fractions and decimals"] });
}

function decimalBlocksQuestion() {
  const o = randInt(1, 3); const t = randInt(0, 6); const h = randInt(1, 9);
  const val = +(o + t / 10 + h / 100).toFixed(2);
  return qd({ type: "decimal-blocks", marks: 1, prompt: "Use the key. What decimal do the blocks show?", diagram: mani({ diagramType: "base10", hundreds: o, tens: t, ones: h, decimal: true }), answer: dec(val), working: [`${o} ones, ${t} tenths, ${h} hundredths = ${dec(val)}`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(o * 100 + t * 10 + h), dec(o + h / 10 + t / 100), `${o}.${t}`].filter(s => s !== dec(val)), tags: ["blocks", "decimals"] });
}

function moneyDecimalsQuestion() {
  const v = choice(["split", "write", "compare"]);
  const d = randInt(1, 19); const c = randInt(1, 99); const amt = `$${d}.${String(c).padStart(2, "0")}`;
  if (v === "split") return qd({ type: "money-decimals", marks: 1, prompt: `${amt} is ${d} dollars and how many cents?`, answer: `${c} cents`, working: ["The two digits after the point are the cents."], space: SPACE_SIZES.SMALL, mcDistractors: [`${c * 10} cents`, `${Math.floor(c / 10)} cents`, `${d} cents`].filter(s => s !== `${c} cents`), tags: ["money"] });
  if (v === "write") return qd({ type: "money-decimals", marks: 1, prompt: `Write ${d} dollars and ${c} cents using $.`, answer: amt, working: ["Cents need two places after the point."], space: SPACE_SIZES.SMALL, mcDistractors: [`$${d}.${c}`, `$${d}${c}`, `$${c}.${d}`].filter(s => s !== amt), tags: ["money"] });
  const other = `$${d}.${String(c).padStart(2, "0")[0]}`;
  const vals = [+(d + c / 100).toFixed(2), +(d + Number(String(c).padStart(2, "0")[0]) / 10).toFixed(2)];
  if (vals[0] === vals[1]) return moneyDecimalsQuestion();
  const more = vals[0] > vals[1] ? amt : `${other}0`;
  return qd({ type: "money-decimals", marks: 1, prompt: `Which is more: ${amt} or ${other}0?`, answer: more, working: ["Compare dollars, then the 10-cent digit, then the cents digit."], space: SPACE_SIZES.SMALL, mcDistractors: [more === amt ? `${other}0` : amt], tags: ["money"] });
}

const GENERATORS = {
  "read-5-digit": read5DigitQuestion,
  "value-5-digit": value5DigitQuestion,
  "expanded-5-digit": expanded5DigitQuestion,
  "words-5-digit": words5DigitQuestion,
  "round-number-line": roundNumberLineQuestion,
  "round-to-place": roundToPlaceQuestion,
  "which-rounds": whichRoundsQuestion,
  "tenths-strip": tenthsStripQuestion,
  "hundredths-grid": hundredthsGridQuestion,
  "decimal-pv": decimalPvQuestion,
  "decimal-number-line": decimalNumberLineQuestion,
  "compare-decimals": compareDecimalsQuestion,
  "order-decimals": orderDecimalsQuestion,
  "fraction-decimal": fractionDecimalQuestion,
  "decimal-blocks": decimalBlocksQuestion,
  "money-decimals": moneyDecimalsQuestion
};

export function getPlaceValueBQuestionTypes() { return TYPE_LIST; }
export function generatePlaceValueBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
