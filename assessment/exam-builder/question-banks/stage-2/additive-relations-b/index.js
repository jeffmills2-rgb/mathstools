/*
  Mills Maths Tools — Stage 2 Question Bank: Addition and Subtraction B
  ----------------------------------------------------------------------
  question-banks/stage-2/additive-relations-b/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Additive relations B" —
  MA2-AR-01 and MA2-AR-02, now with 3-digit numbers.

  Big ideas carried from Part A, scaled up:
    - split by place value (hundreds, tens, ones) and trade when a place
      goes past 9 — the column method is place value written down;
    - estimate first by rounding, then check with the inverse;
    - the bar model still shows which number is unknown.

  Money problems use whole dollars or friendly cents so the arithmetic, not
  the decimal, is the skill.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, onl, barD, sp, makeStage2, randInt, choice } from "../../_shared/stage2-helpers.js";

const TOPIC = "Addition and Subtraction B";
const q = makeStage2(TOPIC, "MA2-AR-01");
const q2 = makeStage2(TOPIC, "MA2-AR-02");

const TYPE_LIST = [
  { id: "add-hundreds-tens", label: "Add and subtract hundreds and tens mentally" },
  { id: "jump-3-digit", label: "Jump strategy with 3-digit numbers (+ and −)" },
  { id: "split-3-digit", label: "Split strategy with 3-digit numbers" },
  { id: "column-add", label: "Column addition with trading" },
  { id: "column-subtract", label: "Column subtraction with trading" },
  { id: "find-the-error", label: "Find the mistake" },
  { id: "estimate-3-digit", label: "Estimate by rounding" },
  { id: "missing-3-digit", label: "Missing numbers" },
  { id: "bar-model-3-digit", label: "Bar model word problems" },
  { id: "money-change", label: "Money and change" },
  { id: "two-step-problem", label: "Two-step problems" },
  { id: "which-strategy", label: "Choose a good strategy" }
];

function addHundredsTensQuestion() {
  const a = randInt(1, 8) * 100 + randInt(0, 9) * 10 + randInt(0, 9);
  const d = choice([randInt(1, 4) * 100, randInt(2, 9) * 10, randInt(1, 3) * 100 + randInt(1, 9) * 10]);
  const sub = Math.random() < 0.4 && a > d;
  const ans = sub ? a - d : a + d;
  return q({ type: "add-hundreds-tens", marks: 1, prompt: `${a} ${sub ? "−" : "+"} ${d} = ☐`, answer: sp(ans), working: [`Change only the hundreds and tens: ${a} ${sub ? "−" : "+"} ${d} = ${ans}`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(sub ? a + d : a - d > 0 ? a - d : a + d + 1), sp(ans + 100), sp(ans - 10)].filter(s => s !== sp(ans)), tags: ["mental"] });
}

function jump3DigitQuestion() {
  const a = randInt(120, 580); const b = randInt(110, 390);
  const h = Math.floor(b / 100) * 100; const rest = b - h;
  const sub = Math.random() < 0.35 && a > b + 50;
  const A = sub ? a + b : a;
  const mid = sub ? A - h : A + h; const end = sub ? A - b : A + b;
  return q({
    type: "jump-3-digit", marks: 2,
    prompt: sub ? `Find ${A} − ${b}. Jump back the hundreds first, then the rest.` : `Find ${A} + ${b}. Jump the hundreds first, then the rest.`,
    diagram: { ...onl({ diagramType: "open-number-line", jumps: [{ size: h, ...(sub ? { direction: "back" } : {}) }, { size: rest, ...(sub ? { direction: "back" } : {}) }], stops: [A, null, null] }), caption: "Open number line — not to scale." },
    answer: String(end),
    working: [`${A} ${sub ? "−" : "+"} ${h} = ${mid}`, `${mid} ${sub ? "−" : "+"} ${rest} = ${end}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(sub ? end - 100 : end + 100), String(sub ? end + 10 : end - 10), String(mid)],
    tags: ["jump strategy"]
  });
}

function split3DigitQuestion() {
  const a = randInt(211, 589); const b = randInt(111, 399);
  const pa = [Math.floor(a / 100) * 100, Math.floor((a % 100) / 10) * 10, a % 10];
  const pb = [Math.floor(b / 100) * 100, Math.floor((b % 100) / 10) * 10, b % 10];
  const sums = pa.map((v, i) => v + pb[i]);
  return q({ type: "split-3-digit", marks: 2, prompt: `Split to add ${a} + ${b}. Hundreds: ☐ Tens: ☐ Ones: ☐ Total: ☐`, answer: `${sums[0]} + ${sums[1]} + ${sums[2]} = ${a + b}`, working: [`${pa[0]} + ${pb[0]} = ${sums[0]}`, `${pa[1]} + ${pb[1]} = ${sums[1]}`, `${pa[2]} + ${pb[2]} = ${sums[2]}`, `Total ${a + b}`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["split strategy"] });
}

function columnAddQuestion() {
  let a; let b;
  do { a = randInt(128, 689); b = randInt(115, 299); } while ((a % 10) + (b % 10) < 10 && Math.random() < 0.7);
  const o = (a % 10) + (b % 10); const t = Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 + (o >= 10 ? 1 : 0);
  const noCarry = Number(String(a).padStart(3, "0").split("").map((d, i) => (Number(d) + Number(String(b).padStart(3, "0")[i])) % 10).join(""));
  return q({
    type: "column-add", marks: 2,
    prompt: "Add using the column method. Trade when a column makes 10 or more.",
    diagram: mani({ diagramType: "column-sum", a, b, op: "+", trades: true, answer: null }),
    answer: String(a + b),
    working: [
      `Ones: ${a % 10} + ${b % 10} = ${o}${o >= 10 ? ` → write ${o % 10}, trade 1 ten` : ""}`,
      `Tens: ${t} tens${t >= 10 ? ` → write ${t % 10}, trade 1 hundred` : ""}`,
      `Answer: ${a + b}`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [String(noCarry), String(a + b + 10), String(a + b - 100)],
    tags: ["written method", "trading"]
  });
}

function columnSubtractQuestion() {
  let a; let b;
  do { a = randInt(312, 895); b = randInt(117, a - 50); } while (a % 10 >= b % 10 && Math.random() < 0.7);
  const bs = String(b).padStart(3, "0");
  const smallFromBig = Number(String(a).split("").map((d, i) => Math.abs(Number(d) - Number(bs[i]))).join(""));
  return q({
    type: "column-subtract", marks: 2,
    prompt: "Subtract using the column method. Trade 1 ten for 10 ones when you need to.",
    diagram: mani({ diagramType: "column-sum", a, b, op: "−", trades: true, answer: null }),
    answer: String(a - b),
    working: [
      a % 10 < b % 10 ? `Ones: ${a % 10} − ${b % 10} can't be done, so trade 1 ten for 10 ones: ${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}` : `Ones: ${a % 10} − ${b % 10} = ${(a % 10) - (b % 10)}`,
      "Then the tens, then the hundreds.",
      `Answer: ${a - b}. Check: ${a - b} + ${b} = ${a}`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [String(smallFromBig), String(a - b + 10), String(a - b - 100)].filter(v => Number(v) > 0),
    tags: ["written method", "trading"]
  });
}

function findTheErrorQuestion() {
  const a = randInt(215, 689); const b = randInt(116, 299);
  const noTrade = Number(String(a).padStart(3, "0").split("").map((d, i) => (Number(d) + Number(String(b).padStart(3, "0")[i])) % 10).join(""));
  if (noTrade === a + b) return findTheErrorQuestion();
  return q({ type: "find-the-error", marks: 2, prompt: "Sam's working is shown. What mistake did Sam make? What is the right answer?", diagram: mani({ diagramType: "column-sum", a, b, op: "+", answer: noTrade }), answer: `Sam did not trade (carry) the extra ten or hundred. ${a} + ${b} = ${a + b}.`, working: ["When a column adds to 10 or more, trade to the next place."], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["error analysis"] });
}

function estimate3DigitQuestion() {
  const a = randInt(210, 890); const b = randInt(110, 490); const sub = Math.random() < 0.4 && a > b;
  const r = v => Math.round(v / 100) * 100; const est = sub ? r(a) - r(b) : r(a) + r(b);
  return q({ type: "estimate-3-digit", marks: 1, prompt: `Round to the nearest hundred to estimate ${a} ${sub ? "−" : "+"} ${b}.`, answer: `about ${sp(est)}`, working: [`${a} → ${r(a)}, ${b} → ${r(b)}`, `${r(a)} ${sub ? "−" : "+"} ${r(b)} = ${est}`], space: SPACE_SIZES.SMALL, mcDistractors: [`about ${sp(est + 100)}`, `about ${sp(est - 100)}`, `about ${sp(sub ? a - b : a + b)}`].filter(s => s !== `about ${sp(est)}`), tags: ["estimate"] });
}

function missing3DigitQuestion() {
  const a = randInt(120, 560); const b = randInt(110, 390); const c = a + b;
  const [s, ans] = choice([[`${a} + ☐ = ${c}`, b], [`☐ + ${b} = ${c}`, a], [`${c} − ☐ = ${a}`, b], [`☐ − ${b} = ${a}`, c]]);
  return q2({ type: "missing-3-digit", marks: 1, prompt: `What number goes in the box?  ${s}`, answer: String(ans), working: ["Use the inverse: addition and subtraction undo each other."], space: SPACE_SIZES.SMALL, mcDistractors: [String(ans + 100), String(ans - 10), String(c + b)], tags: ["missing number", "inverse"] });
}

function barModel3DigitQuestion() {
  const a = randInt(125, 480); const b = randInt(118, 360);
  const v = choice(["total", "part", "compare"]);
  if (v === "compare") return q({ type: "bar-model-3-digit", marks: 2, prompt: `A school has ${a + b} books. A library has ${a} books. How many more books does the school have?`, diagram: barD({ diagramType: "compare", rows: [{ name: "School", value: a + b, label: String(a + b) }, { name: "Library", value: a, label: String(a) }], difference: null }), answer: String(b), working: [`${a + b} − ${a} = ${b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(2 * a + b), String(b + 10)], tags: ["bar model"] });
  if (v === "part") return q({ type: "bar-model-3-digit", marks: 2, prompt: `${a + b} people went to a show. ${a} were adults. How many were children?`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: null }], total: String(a + b) }), answer: String(b), working: [`${a + b} − ${a} = ${b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(2 * a + b), String(b - 10)], tags: ["bar model"] });
  return q({ type: "bar-model-3-digit", marks: 2, prompt: `A farm has ${a} sheep and ${b} cows. How many animals altogether?`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: String(b) }], total: null }), answer: String(a + b), working: [`${a} + ${b} = ${a + b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(Math.abs(a - b)), String(a + b + 100)], tags: ["bar model"] });
}

function moneyChangeQuestion() {
  const paid = choice([1000, 2000, 5000]);
  const cost = randInt(2, paid / 100 - 1) * 100 + choice([0, 50, 25, 75, 20, 80, 95]);
  const ch = paid - cost;
  const $ = c => `$${Math.floor(c / 100)}.${String(c % 100).padStart(2, "0")}`;
  const item = choice(["A toy", "A book", "A lunch", "A ball", "A puzzle"]);
  return q({ type: "money-change", marks: 2, prompt: `${item} costs ${$(cost)}. You pay with a $${paid / 100} note. How much change do you get?`, answer: $(ch), working: [`Count up from ${$(cost)} to $${paid / 100}.`, `$${paid / 100} − ${$(cost)} = ${$(ch)}`], space: SPACE_SIZES.SMALL, mcDistractors: [$(ch + 100), ch > 100 ? $(ch - 100) : null, $(paid + cost)], tags: ["money"] });
}

function twoStepProblemQuestion() {
  const a = randInt(120, 350); const b = randInt(40, 150); const c = randInt(30, 120);
  if (a + b - c <= 0) return twoStepProblemQuestion();
  return q({ type: "two-step-problem", marks: 3, prompt: `A train has ${a} passengers. At the next stop ${b} more get on and ${c} get off. How many passengers are on the train now?`, answer: String(a + b - c), working: [`${a} + ${b} = ${a + b}`, `${a + b} − ${c} = ${a + b - c}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [String(a + b + c), String(a - b + c), String(a + b)], tags: ["two-step"] });
}

function whichStrategyQuestion() {
  const opts = [
    [`${randInt(2, 7)}99 + ${randInt(2, 5)}5`, "Add 1 to make a round hundred, then take it off at the end (compensation)."],
    [`${randInt(3, 9)}00 − ${randInt(1, 2)}98`, "Take away 200, then add 2 back (compensation)."],
    [`${randInt(2, 4)}50 + ${randInt(2, 4)}50`, "Add the hundreds, then 50 + 50 = 100 (split)."],
    [`${randInt(4, 6)}02 − ${randInt(3, 5)}97`, "Count on from the smaller number (find the difference)."]
  ];
  const [expr, how] = choice(opts);
  return q({ type: "which-strategy", marks: 1, prompt: `What is a smart way to work out ${expr}?`, answer: how, working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["strategy"] });
}

const GENERATORS = {
  "add-hundreds-tens": addHundredsTensQuestion,
  "jump-3-digit": jump3DigitQuestion,
  "split-3-digit": split3DigitQuestion,
  "column-add": columnAddQuestion,
  "column-subtract": columnSubtractQuestion,
  "find-the-error": findTheErrorQuestion,
  "estimate-3-digit": estimate3DigitQuestion,
  "missing-3-digit": missing3DigitQuestion,
  "bar-model-3-digit": barModel3DigitQuestion,
  "money-change": moneyChangeQuestion,
  "two-step-problem": twoStepProblemQuestion,
  "which-strategy": whichStrategyQuestion
};

export function getAdditiveRelationsBQuestionTypes() { return TYPE_LIST; }
export function generateAdditiveRelationsBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
