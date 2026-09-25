/*
  Mills Maths Tools — Stage 2 Question Bank: Place Value A
  ---------------------------------------------------------
  question-banks/stage-2/place-value-a/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Representing numbers using place
  value A" — MA2-RN-01 (numbers to 10 000).

  Big idea: we group in tens. Ten ones make a ten, ten tens make a hundred,
  ten hundreds make a thousand. A digit's value depends on its place, and
  zero holds a place.

  Sequence of types (recognise → represent → apply):
    blocks → numeral, numeral → blocks, place-value charts, value of a digit,
    expanded form, renaming (non-standard partitions), zero as a placeholder,
    numerals ↔ words, comparing and ordering, number lines, counting
    patterns, 10/100/1000 more or less, making numbers from digit cards.

  Reading load: prompts are short and start with the question word; the
  model (blocks, chart, number line) carries the number.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, sp, words, digitsOf, PLACE, placeValueOf, distinct, makeStage2, pvDistractors, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Place Value A";
const q = makeStage2(TOPIC, "MA2-RN-01");

const TYPE_LIST = [
  { id: "blocks-to-number", label: "Read a number made with base-ten blocks" },
  { id: "number-to-blocks", label: "How many blocks make the number?" },
  { id: "read-pv-chart", label: "Read a place-value chart" },
  { id: "complete-pv-chart", label: "Complete a place-value chart" },
  { id: "value-of-digit", label: "The value of a digit" },
  { id: "expanded-form", label: "Expanded form" },
  { id: "rename-numbers", label: "Rename numbers (e.g. 34 hundreds)" },
  { id: "trading", label: "Trade ones, tens and hundreds" },
  { id: "zero-placeholder", label: "Zero holds a place" },
  { id: "numerals-and-words", label: "Numerals and words" },
  { id: "compare-numbers", label: "Compare numbers with < and >" },
  { id: "order-numbers", label: "Order numbers" },
  { id: "number-line-read", label: "Read a number line" },
  { id: "counting-patterns", label: "Count by 10s, 100s and 1000s" },
  { id: "more-or-less", label: "10, 100 or 1000 more or less" },
  { id: "digit-cards", label: "Make numbers from digit cards" }
];

const num4 = () => randInt(1000, 9999);
const num3or4 = () => (Math.random() < 0.35 ? randInt(100, 999) : num4());
const blocksOf = n => ({ thousands: Math.floor(n / 1000), hundreds: Math.floor(n / 100) % 10, tens: Math.floor(n / 10) % 10, ones: n % 10 });

function blocksToNumberQuestion() {
  // Kept to numbers whose blocks fit a printed page and can be counted.
  const th = Math.random() < 0.4 ? 0 : randInt(1, 2);
  const n = th * 1000 + randInt(th ? 0 : 1, th ? 4 : 5) * 100 + randInt(0, 6) * 10 + randInt(0, 9);
  const b = blocksOf(n);
  return q({
    type: "blocks-to-number", marks: 1,
    prompt: "What number do the blocks show?",
    diagram: mani({ diagramType: "base10", ...b, key: true }),
    answer: sp(n),
    working: [`${b.thousands} thousands, ${b.hundreds} hundreds, ${b.tens} tens, ${b.ones} ones`, `= ${sp(n)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [sp(b.thousands * 1000 + b.tens * 100 + b.hundreds * 10 + b.ones), sp(b.thousands + b.hundreds + b.tens + b.ones), sp(b.thousands * 100 + b.hundreds * 10 + b.tens + b.ones)],
    tags: ["base-ten blocks"]
  });
}

function numberToBlocksQuestion() {
  const n = num4(); const b = blocksOf(n);
  const which = choice(["thousands", "hundreds", "tens", "ones"]);
  const shapeName = { thousands: "big cubes (thousands)", hundreds: "flats (hundreds)", tens: "longs (tens)", ones: "small cubes (ones)" }[which];
  return q({
    type: "number-to-blocks", marks: 1,
    prompt: `You make ${sp(n)} with base-ten blocks. How many ${shapeName} do you need?`,
    diagram: mani({ diagramType: "base10", legend: true }),
    answer: String(b[which]),
    working: [`${sp(n)} = ${b.thousands} thousands, ${b.hundreds} hundreds, ${b.tens} tens and ${b.ones} ones`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [...new Set([b.thousands, b.hundreds, b.tens, b.ones, b[which] + 1].map(String))].filter(s => s !== String(b[which])).slice(0, 3),
    tags: ["base-ten blocks"]
  });
}

function readPvChartQuestion() {
  const n = num4(); const d = digitsOf(n);
  const useCounters = Math.random() < 0.45;
  const nn = useCounters ? Number(d.map(v => Math.min(v, 6)).join("")) : n;
  const dd = digitsOf(nn);
  return q({
    type: "read-pv-chart", marks: 1,
    prompt: useCounters ? "Each counter is worth 1 in its column. What number is shown?" : "What number is shown in the chart?",
    diagram: mani({ diagramType: "pv-chart", columns: ["Th", "H", "T", "O"], ...(useCounters ? { counters: dd } : { digits: dd.map(String) }) }),
    answer: sp(nn),
    working: [`${dd[0]} thousands, ${dd[1]} hundreds, ${dd[2]} tens, ${dd[3]} ones`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: pvDistractors(nn),
    tags: ["place-value chart"]
  });
}

function completePvChartQuestion() {
  const n = num4(); const d = digitsOf(n);
  const hide = shuffle([0, 1, 2, 3]).slice(0, 2);
  return q({
    type: "complete-pv-chart", marks: 1,
    prompt: `Fill in the empty boxes to show ${sp(n)}.`,
    diagram: mani({ diagramType: "pv-chart", columns: ["Th", "H", "T", "O"], digits: d.map((v, i) => (hide.includes(i) ? null : String(v))) }),
    answer: hide.sort().map(i => `${["Th", "H", "T", "O"][i]}: ${d[i]}`).join(", "),
    working: [`${sp(n)} has ${d[0]} thousands, ${d[1]} hundreds, ${d[2]} tens and ${d[3]} ones.`],
    space: "none",
    mcEligible: false,
    tags: ["place-value chart"]
  });
}

function valueOfDigitQuestion() {
  let n; let pos; do { n = num4(); pos = randInt(0, 3); } while (placeValueOf(n, pos) === 0);
  const d = placeValueOf(n, pos); const val = d * 10 ** pos;
  const alt = choice(["value", "place"]);
  if (alt === "place") {
    if (digitsOf(n).filter(v => v === d).length > 1) return valueOfDigitQuestion();
    return q({
      type: "value-of-digit", marks: 1,
      prompt: `In ${sp(n)}, which place is the digit ${d} in?`,
      diagram: mani({ diagramType: "pv-chart", columns: ["Th", "H", "T", "O"], digits: digitsOf(n).map(String) }),
      answer: PLACE[pos],
      working: [`The ${d} is in the ${PLACE[pos]} column.`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: PLACE.slice(0, 4).filter(p => p !== PLACE[pos]),
      tags: ["value of a digit"]
    });
  }
  if (digitsOf(n).filter(v => v === d).length > 1) return valueOfDigitQuestion();
  return q({
    type: "value-of-digit", marks: 1,
    prompt: `What is the value of the ${d} in ${sp(n)}?`,
    answer: sp(val),
    working: [`The ${d} is in the ${PLACE[pos]} place: ${d} × ${sp(10 ** pos)} = ${sp(val)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [0, 1, 2, 3].filter(p => p !== pos).map(p => sp(d * 10 ** p)),
    tags: ["value of a digit"]
  });
}

function expandedFormQuestion() {
  const n = num4(); const d = digitsOf(n);
  const parts = d.map((v, i) => v * 10 ** (3 - i)).filter(v => v > 0);
  const exp = parts.map(sp).join(" + ");
  if (Math.random() < 0.5) {
    return q({ type: "expanded-form", marks: 1, prompt: `Write ${sp(n)} in expanded form.`, answer: exp, working: [`${d[0]} thousands + ${d[1]} hundreds + ${d[2]} tens + ${d[3]} ones`], space: SPACE_SIZES.SMALL, mcDistractors: [d.filter(v => v).join(" + "), parts.map(v => sp(v * 10)).join(" + ")], tags: ["expanded form"] });
  }
  const mixed = shuffle(parts);
  return q({ type: "expanded-form", marks: 1, prompt: `What number is ${mixed.map(sp).join(" + ")}?`, answer: sp(n), working: ["Put each part in its place."], space: SPACE_SIZES.SMALL, mcDistractors: pvDistractors(n), tags: ["expanded form"] });
}

function renameNumbersQuestion() {
  const v = choice(["hundreds", "tens", "thousands-hundreds"]);
  if (v === "hundreds") { const h = randInt(12, 68); const o = randInt(0, 99); const n = h * 100 + o; return q({ type: "rename-numbers", marks: 1, prompt: `What number is ${h} hundreds and ${o} ones?`, answer: sp(n), working: [`${h} hundreds = ${sp(h * 100)}`, `${sp(h * 100)} + ${o} = ${sp(n)}`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(h * 10 + o), sp(h * 1000 + o), sp(h + o)], tags: ["renaming"] }); }
  if (v === "tens") { const n = randInt(12, 99) * 10; return q({ type: "rename-numbers", marks: 1, prompt: `How many tens are in ${sp(n)}?`, diagram: mani({ diagramType: "base10", hundreds: Math.floor(n / 100), tens: (n / 10) % 10, ones: 0 }), answer: String(n / 10), working: [`${sp(n)} = ${n / 10} tens (each hundred is 10 tens)`], space: SPACE_SIZES.SMALL, mcDistractors: [String((n / 10) % 10), String(n / 100 | 0), String(n)], tags: ["renaming"] }); }
  const n = randInt(11, 99) * 100;
  return q({ type: "rename-numbers", marks: 1, prompt: `${sp(n)} is how many hundreds?`, answer: `${n / 100} hundreds`, working: [`${Math.floor(n / 1000)} thousands = ${Math.floor(n / 1000) * 10} hundreds`, `${Math.floor(n / 1000) * 10} + ${(n / 100) % 10} = ${n / 100} hundreds`], space: SPACE_SIZES.SMALL, mcDistractors: [`${(n / 100) % 10} hundreds`, `${n / 10} hundreds`], tags: ["renaming"] });
}

function tradingQuestion() {
  const v = choice(["ones", "tens", "hundreds", "picture"]);
  if (v === "picture") {
    const h = randInt(1, 3); const t = randInt(11, 16); const o = randInt(0, 9); const n = h * 100 + t * 10 + o;
    return q({ type: "trading", marks: 2, prompt: `There are ${t} longs (tens). Trade 10 of them for a flat. What number is shown?`, diagram: mani({ diagramType: "base10", hundreds: h, tens: t, ones: o }), answer: sp(n), working: [`${t} tens = 1 hundred and ${t - 10} tens`, `${h + 1} hundreds, ${t - 10} tens, ${o} ones = ${sp(n)}`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(h * 100 + t + o), sp((h + t) * 100 + o)], tags: ["trading"] });
  }
  const k = randInt(1, 9);
  const map = { ones: [`${k * 10} ones`, `${k} tens`], tens: [`${k * 10} tens`, `${k} hundreds`], hundreds: [`${k * 10} hundreds`, `${k} thousands`] }[v];
  return q({ type: "trading", marks: 1, prompt: `${map[0]} is the same as how many ${map[1].split(" ")[1]}?`, answer: map[1], working: ["Ten of one place make one of the next place."], space: SPACE_SIZES.SMALL, mcDistractors: [`${k * 10} ${map[1].split(" ")[1]}`, `${k * 100} ${map[1].split(" ")[1]}`], tags: ["trading"] });
}

function zeroPlaceholderQuestion() {
  const v = choice(["write", "which", "meaning"]);
  if (v === "write") {
    const n = choice([randInt(1, 9) * 1000 + randInt(1, 9), randInt(1, 9) * 1000 + randInt(1, 9) * 10, randInt(1, 9) * 1000 + randInt(1, 9) * 100 + randInt(1, 9), randInt(1, 9) * 100 + randInt(1, 9)]);
    return q({ type: "zero-placeholder", marks: 1, prompt: `Write the numeral for: ${words(n)}.`, answer: sp(n), working: ["Use a zero for any empty place."], space: SPACE_SIZES.SMALL, mcDistractors: [sp(Number(String(n).replace(/0/g, ""))), sp(n * 10), sp(Number(String(n).replace(/0/, "00")))].filter(s => s !== sp(n)), tags: ["zero"] });
  }
  if (v === "which") {
    const place = choice([1, 2]); // tens or hundreds
    const good = (() => { let n; do { n = num4(); } while (placeValueOf(n, place) !== 0 || digitsOf(n).filter(x => x === 0).length !== 1); return n; })();
    const others = distinct(() => { let n; do { n = num4(); } while (placeValueOf(n, place) === 0); return n; }, 3);
    return q({ type: "zero-placeholder", marks: 1, prompt: `Which number has zero ${PLACE[place]}?`, diagram: mani({ diagramType: "cards", items: shuffle([good, ...others]).map(sp) }), answer: sp(good), working: [`In ${sp(good)} the ${PLACE[place]} digit is 0.`], space: SPACE_SIZES.SMALL, mcDistractors: others.map(sp), tags: ["zero"] });
  }
  const n = randInt(1, 9) * 1000 + randInt(1, 9) * 10 + randInt(1, 9);
  return q({ type: "zero-placeholder", marks: 1, prompt: `What does the 0 in ${sp(n)} tell us?`, answer: "There are no hundreds.", working: ["The 0 is in the hundreds place. It holds the place."], space: SPACE_SIZES.SMALL, mcDistractors: ["There are no thousands.", "There are no tens.", "The number is small."], tags: ["zero"] });
}

function numeralsAndWordsQuestion() {
  const n = num3or4();
  if (Math.random() < 0.5) return q({ type: "numerals-and-words", marks: 1, prompt: `Write ${sp(n)} in words.`, answer: words(n), working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["words"] });
  return q({ type: "numerals-and-words", marks: 1, prompt: `Write the numeral: ${words(n)}.`, answer: sp(n), working: [], space: SPACE_SIZES.SMALL, mcDistractors: pvDistractors(n), tags: ["words"] });
}

function compareNumbersQuestion() {
  const a = num4(); let b; do { b = Math.random() < 0.6 ? Number(String(a).slice(0, 2) + String(randInt(10, 99))) : num4(); } while (b === a);
  return q({ type: "compare-numbers", marks: 1, prompt: `Write < or > in the box: ${sp(a)} ☐ ${sp(b)}`, answer: a < b ? "<" : ">", working: [`Compare from the thousands place: ${sp(a)} is ${a < b ? "less" : "greater"} than ${sp(b)}.`], space: SPACE_SIZES.SMALL, mcDistractors: [a < b ? ">" : "<", "="], tags: ["compare"] });
}

function orderNumbersQuestion() {
  const base = randInt(1, 8) * 1000;
  const nums = distinct(() => base + randInt(0, 1) * 1000 + randInt(0, 9) * 100 + randInt(0, 9) * 10 + randInt(0, 9), 4);
  const asc = Math.random() < 0.6;
  const sorted = [...nums].sort((x, y) => (asc ? x - y : y - x));
  return q({ type: "order-numbers", marks: 1, prompt: `Order from ${asc ? "smallest to largest" : "largest to smallest"}.`, diagram: mani({ diagramType: "cards", items: nums.map(sp) }), answer: sorted.map(sp).join(", "), working: ["Compare thousands, then hundreds, then tens, then ones."], space: SPACE_SIZES.SMALL, mcDistractors: [[...sorted].reverse().map(sp).join(", "), nums.map(sp).join(", ")].filter(s => s !== sorted.map(sp).join(", ")), tags: ["order"] });
}

function numberLineReadQuestion() {
  const v = choice(["thousands", "hundreds", "tens"]);
  const [min, step] = v === "thousands" ? [0, 1000] : v === "hundreds" ? [randInt(1, 8) * 1000, 100] : [randInt(10, 90) * 100, 10];
  const max = min + step * 10; const k = randInt(1, 9); const val = min + k * step;
  return q({ type: "number-line-read", marks: 1, prompt: "What number is at A?", diagram: mani({ diagramType: "number-line", min, max, step, labels: "ends", points: [{ value: val, label: "A" }] }), answer: sp(val), working: [`Each jump is ${sp(step)}.`, `${sp(min)} + ${k} × ${sp(step)} = ${sp(val)}`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(min + k), sp(min + k * step / 10 || k), sp(val + step)], tags: ["number line"] });
}

function countingPatternsQuestion() {
  const step = choice([10, 100, 1000, -10, -100]);
  const start = step > 0 ? randInt(1000, 5000) : randInt(4000, 9000);
  const seq = Array.from({ length: 6 }, (_, i) => start + i * step);
  const hide = [3, 4];
  return q({ type: "counting-patterns", marks: 1, prompt: `Fill in the missing numbers. ${seq.map((v, i) => (hide.includes(i) ? "___" : sp(v))).join(", ")}`, answer: hide.map(i => sp(seq[i])).join(", "), working: [`The pattern ${step > 0 ? "adds" : "takes away"} ${sp(Math.abs(step))} each time.`], space: SPACE_SIZES.SMALL, mcDistractors: [hide.map(i => sp(seq[i] + step / 10)).join(", "), hide.map(i => sp(seq[i] + step)).join(", ")], tags: ["counting"] });
}

function moreOrLessQuestion() {
  const n = randInt(1000, 8900); const d = choice([10, 100, 1000]); const more = Math.random() < 0.5;
  const ans = more ? n + d : n - d;
  return q({ type: "more-or-less", marks: 1, prompt: `What is ${sp(d)} ${more ? "more" : "less"} than ${sp(n)}?`, diagram: Math.random() < 0.4 ? mani({ diagramType: "pv-chart", columns: ["Th", "H", "T", "O"], digits: digitsOf(n).map(String) }) : undefined, answer: sp(ans), working: [`Change the ${PLACE[String(d).length - 1]} digit by 1${(more ? n % (d * 10) >= d * 9 : n % (d * 10) < d) ? " (trade across a place)" : ""}.`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(more ? n - d : n + d), sp(more ? n + d / 10 || n + 1 : n - (d / 10 || 1)), sp(more ? n + d * 10 : n - d * 10 > 0 ? n - d * 10 : n + 1)], tags: ["more or less"] });
}

function digitCardsQuestion() {
  const ds = distinct(() => randInt(0, 9), 4);
  if (ds[0] === 0 && ds.every(x => x !== 0)) return digitCardsQuestion();
  const big = Number([...ds].sort((a, b) => b - a).join(""));
  const sm = [...ds].sort((a, b) => a - b); if (sm[0] === 0) { const k = sm.findIndex(x => x > 0); [sm[0], sm[k]] = [sm[k], sm[0]]; }
  const small = Number(sm.join(""));
  const which = choice(["largest", "smallest"]);
  return q({ type: "digit-cards", marks: 1, prompt: `Use all four cards once. Make the ${which} number you can.`, diagram: mani({ diagramType: "cards", items: ds.map(String) }), answer: sp(which === "largest" ? big : small), working: [which === "largest" ? "Put the biggest digit in the thousands place, then the next biggest…" : `Put the smallest digit that is not 0 first${ds.includes(0) ? " (a number cannot start with 0)" : ""}.`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(which === "largest" ? small : big), sp(Number(ds.join("")) || big - 1), sp(Number([...ds].sort((a, b) => a - b).join("")) || small + 9)].filter(s => s !== sp(which === "largest" ? big : small)), tags: ["digit cards"] });
}

const GENERATORS = {
  "blocks-to-number": blocksToNumberQuestion,
  "number-to-blocks": numberToBlocksQuestion,
  "read-pv-chart": readPvChartQuestion,
  "complete-pv-chart": completePvChartQuestion,
  "value-of-digit": valueOfDigitQuestion,
  "expanded-form": expandedFormQuestion,
  "rename-numbers": renameNumbersQuestion,
  "trading": tradingQuestion,
  "zero-placeholder": zeroPlaceholderQuestion,
  "numerals-and-words": numeralsAndWordsQuestion,
  "compare-numbers": compareNumbersQuestion,
  "order-numbers": orderNumbersQuestion,
  "number-line-read": numberLineReadQuestion,
  "counting-patterns": countingPatternsQuestion,
  "more-or-less": moreOrLessQuestion,
  "digit-cards": digitCardsQuestion
};

export function getPlaceValueAQuestionTypes() { return TYPE_LIST; }
export function generatePlaceValueAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
