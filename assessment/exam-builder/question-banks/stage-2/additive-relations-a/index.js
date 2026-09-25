/*
  Mills Maths Tools — Stage 2 Question Bank: Addition and Subtraction A
  ----------------------------------------------------------------------
  question-banks/stage-2/additive-relations-a/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Additive relations A" —
  MA2-AR-01 (mental and written strategies, 2-digit numbers) and MA2-AR-02
  (number sentences with missing values).

  Big ideas:
    - part–part–whole: two parts make a whole, so if you know two of the
      three numbers you can find the third (the bar model shows this);
    - addition and subtraction undo each other (fact families);
    - numbers can be split and jumped in friendly pieces (tens, then ones;
      bridge to the next ten) — the open number line records the thinking.

  The open number line and the bar model carry each problem, so a student
  who is still building reading can see the structure before the words.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { onl, barD, sp, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Addition and Subtraction A";
const q = makeStage2(TOPIC, "MA2-AR-01");
const q2 = makeStage2(TOPIC, "MA2-AR-02");

const TYPE_LIST = [
  { id: "jump-add", label: "Jump strategy for adding (open number line)" },
  { id: "jump-subtract", label: "Jump back to subtract" },
  { id: "count-on-difference", label: "Find the difference by counting on" },
  { id: "split-strategy", label: "Split into tens and ones" },
  { id: "bridge-to-ten", label: "Bridge to ten" },
  { id: "compensation", label: "Add 9 or 19 (add 10, take 1)" },
  { id: "make-ten", label: "Add three numbers: look for ten" },
  { id: "fact-family", label: "Fact families (+ and − undo each other)" },
  { id: "missing-number", label: "Missing numbers in number sentences" },
  { id: "part-whole-problem", label: "Part–whole word problems (bar model)" },
  { id: "compare-problem", label: "How many more? (bar model)" },
  { id: "estimate-sum", label: "Estimate by rounding to tens" },
  { id: "check-with-inverse", label: "Check an answer with the inverse" }
];

const CAP = "Open number line — not to scale.";
const line = (jumps, stops, extra = {}) => ({ ...onl({ diagramType: "open-number-line", jumps, stops, ...extra }), caption: CAP });

function jumpAddQuestion() {
  const a = randInt(12, 68); const b = randInt(12, 39);
  const t = Math.floor(b / 10) * 10; const o = b % 10;
  const jumps = o ? [{ size: t }, { size: o }] : [{ size: t }];
  const stops = o ? [a, a + t, a + b] : [a, a + b];
  const hide = choice(["end", "middle", "jump"]);
  const shownStops = stops.map((v, i) => (i === stops.length - 1 || (hide === "middle" && i === 1) ? null : v));
  const shownJumps = jumps.map((j, i) => (hide === "jump" && i === 0 ? { size: null } : j));
  return q({
    type: "jump-add", marks: 2,
    prompt: `Use the number line to work out ${a} + ${b}. Fill in the boxes.`,
    diagram: line(shownJumps, shownStops),
    answer: `${a} + ${b} = ${a + b}`,
    working: [`${a} + ${t} = ${a + t}`, o ? `${a + t} + ${o} = ${a + b}` : ""].filter(Boolean),
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${a} + ${b} = ${a + b + 10}`, `${a} + ${b} = ${a + b - 10}`, `${a} + ${b} = ${a + t + o * 10}`].filter(s => !s.endsWith(`= ${a + b}`)),
    tags: ["jump strategy"]
  });
}

function jumpSubtractQuestion() {
  const a = randInt(45, 99); const b = randInt(12, a - 10);
  const t = Math.floor(b / 10) * 10; const o = b % 10;
  const jumps = o ? [{ size: t, direction: "back" }, { size: o, direction: "back" }] : [{ size: t, direction: "back" }];
  const stops = o ? [a, a - t, a - b] : [a, a - b];
  return q({
    type: "jump-subtract", marks: 2,
    prompt: `Jump back to work out ${a} − ${b}. Fill in the boxes.`,
    diagram: line(jumps, stops.map((v, i) => (i === 0 ? v : null))),
    answer: `${a} − ${b} = ${a - b}`,
    working: [`${a} − ${t} = ${a - t}`, o ? `${a - t} − ${o} = ${a - b}` : ""].filter(Boolean),
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${a} − ${b} = ${a - b + 10}`, `${a} − ${b} = ${a + b}`].filter(s => !s.endsWith(`= ${a - b}`)),
    tags: ["jump strategy", "subtraction"]
  });
}

function countOnDifferenceQuestion() {
  const a = randInt(21, 58); const b = a + randInt(15, 38);
  const toTen = (10 - (a % 10)) % 10 || 10; const mid = a + toTen;
  const tens = Math.floor((b - mid) / 10) * 10; const rest = b - mid - tens;
  const jumps = [{ size: toTen }, ...(tens ? [{ size: tens }] : []), ...(rest ? [{ size: rest }] : [])];
  const stops = [a, mid, ...(tens ? [mid + tens] : []), ...(rest ? [b] : [])];
  return q({
    type: "count-on-difference", marks: 2,
    prompt: `Count on from ${a} to ${b}. What is the difference?`,
    diagram: line(jumps.map(j => ({ size: null })), stops),
    answer: String(b - a),
    working: [`Jumps: ${jumps.map(j => `+${j.size}`).join(", ")}`, `${jumps.map(j => j.size).join(" + ")} = ${b - a}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(b - a + 10), String(b - a - 1), String(a + b)],
    tags: ["difference", "counting on"]
  });
}

function splitStrategyQuestion() {
  const a = randInt(21, 69); const b = randInt(11, 29);
  const [at, ao, bt, bo] = [a - a % 10, a % 10, b - b % 10, b % 10];
  return q({
    type: "split-strategy", marks: 2,
    prompt: `Split into tens and ones: ${a} + ${b} = (${at} + ${bt}) + (${ao} + ${bo}) = ___ + ___ = ___`,
    answer: `${at + bt} + ${ao + bo} = ${a + b}`,
    working: [`Tens: ${at} + ${bt} = ${at + bt}`, `Ones: ${ao} + ${bo} = ${ao + bo}`, `${at + bt} + ${ao + bo} = ${a + b}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${at + bt} + ${ao + bo} = ${a + b + 10}`, `${at + bt} + ${ao + bo} = ${at + bt + ao + bo - 10}`],
    tags: ["split strategy"]
  });
}

function bridgeToTenQuestion() {
  const a = randInt(1, 8) * 10 + randInt(6, 9); const b = randInt(4, 9);
  const toTen = 10 - (a % 10); const rest = b - toTen;
  if (rest <= 0) return bridgeToTenQuestion();
  return q({
    type: "bridge-to-ten", marks: 1,
    prompt: `${a} + ${b}: first jump to the next ten. Fill in the boxes.`,
    diagram: line([{ size: toTen }, { size: null }], [a, a + toTen, null]),
    answer: `+${rest}, ${a + b}`,
    working: [`${a} + ${toTen} = ${a + toTen}`, `${b} = ${toTen} + ${rest}`, `${a + toTen} + ${rest} = ${a + b}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`+${b}, ${a + b + toTen}`, `+${rest}, ${a + b + 10}`],
    tags: ["bridging ten"]
  });
}

function compensationQuestion() {
  const a = randInt(23, 78); const k = choice([9, 19, 29]); const sub = Math.random() < 0.4;
  if (sub) {
    const aa = a + 20;
    return q({ type: "compensation", marks: 1, prompt: `Work out ${aa} − ${k}. Hint: take away ${k + 1}, then add 1 back.`, diagram: line([{ size: k + 1, direction: "back" }, { size: 1 }], [aa, aa - k - 1, null]), answer: String(aa - k), working: [`${aa} − ${k + 1} = ${aa - k - 1}`, `${aa - k - 1} + 1 = ${aa - k}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(aa - k - 2), String(aa - k - 1)], tags: ["compensation"] });
  }
  return q({ type: "compensation", marks: 1, prompt: `Work out ${a} + ${k}. Hint: add ${k + 1}, then take 1 away.`, diagram: line([{ size: k + 1 }, { size: 1, direction: "back" }], [a, a + k + 1, null]), answer: String(a + k), working: [`${a} + ${k + 1} = ${a + k + 1}`, `${a + k + 1} − 1 = ${a + k}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(a + k + 1), String(a + k + 2)], tags: ["compensation"] });
}

function makeTenQuestion() {
  const x = randInt(1, 9); const y = 10 - x; const z = randInt(3, 9);
  const [a, b, c] = [x + randInt(0, 2) * 10, y, z + randInt(0, 3) * 10];
  const order = shuffle([a, b, c]);
  return q({
    type: "make-ten", marks: 1,
    prompt: `Add: ${order.join(" + ")}. Look for numbers that make a ten.`,
    answer: String(a + b + c),
    working: [`${a} + ${b} = ${a + b} (a ten!)`, `${a + b} + ${c} = ${a + b + c}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(a + b + c + 10), String(a + b + c - 10), String(a + c)],
    tags: ["make ten"]
  });
}

function factFamilyQuestion() {
  const a = randInt(12, 58); const b = randInt(11, 39); const c = a + b;
  if (Math.random() < 0.5) {
    return q2({ type: "fact-family", marks: 1, prompt: `${a} + ${b} = ${c}. Use this to find ${c} − ${b}.`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: String(b) }], total: String(c) }), answer: String(a), working: ["The parts make the whole, so the whole take away one part leaves the other part."], space: SPACE_SIZES.SMALL, mcDistractors: [String(b), String(c + b), String(a + 1)], tags: ["fact family", "inverse"] });
  }
  return q2({ type: "fact-family", marks: 2, prompt: `Write the four facts in the family of ${a}, ${b} and ${c}.`, diagram: barD({ diagramType: "part-whole", parts: [{ value: a, label: String(a) }, { value: b, label: String(b) }], total: String(c) }), answer: `${a} + ${b} = ${c}, ${b} + ${a} = ${c}, ${c} − ${a} = ${b}, ${c} − ${b} = ${a}`, working: ["Two addition facts and two subtraction facts."], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["fact family"] });
}

function missingNumberQuestion() {
  const a = randInt(12, 58); const b = randInt(11, 39); const c = a + b;
  const forms = [
    [`${a} + ☐ = ${c}`, b, [{ value: a, label: String(a) }, { value: b, label: null }], String(c)],
    [`☐ + ${b} = ${c}`, a, [{ value: a, label: null }, { value: b, label: String(b) }], String(c)],
    [`${c} − ☐ = ${a}`, b, [{ value: a, label: String(a) }, { value: b, label: null }], String(c)],
    [`☐ − ${b} = ${a}`, c, [{ value: a, label: String(a) }, { value: b, label: String(b) }], null]
  ];
  const [sentence, ans, parts, total] = choice(forms);
  return q2({
    type: "missing-number", marks: 1,
    prompt: `What number goes in the box? ${sentence}`,
    diagram: Math.random() < 0.6 ? barD({ diagramType: "part-whole", parts, total }) : undefined,
    answer: String(ans),
    working: [sentence.includes("+") ? `Think: ${c} − ${sentence.startsWith("☐") ? b : a} = ${ans}` : sentence.startsWith("☐") ? `Think: ${a} + ${b} = ${c}` : `Think: ${c} − ${a} = ${b}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(c + (sentence.startsWith("☐") ? b : a)), String(ans + 10), String(ans - 1)].filter(s => s !== String(ans)),
    tags: ["missing number"]
  });
}

const PW = [
  (a, b) => [`Mia has ${a} stickers. She gets ${b} more. How many stickers now?`, "total"],
  (a, b) => [`A class read ${a} books in May and ${b} books in June. How many books altogether?`, "total"],
  (a, b) => [`There are ${a + b} children. ${a} are at the pool. How many are not at the pool?`, "part"],
  (a, b) => [`A baker made ${a + b} rolls. ${b} were sold. How many are left?`, "part-a"],
  (a, b) => [`Sam had some marbles. He won ${b} more. Now he has ${a + b}. How many did he have at first?`, "part-a"]
];

function partWholeProblemQuestion() {
  const a = randInt(14, 58); const b = randInt(12, 39);
  const [text, kind] = choice(PW)(a, b);
  const ans = kind === "total" ? a + b : kind === "part" ? b : a;
  const parts = [{ value: a, label: kind === "part-a" ? null : String(a) }, { value: b, label: kind === "part" ? null : String(b) }];
  return q({
    type: "part-whole-problem", marks: 2,
    prompt: text,
    diagram: barD({ diagramType: "part-whole", parts, total: kind === "total" ? null : String(a + b) }),
    answer: String(ans),
    working: [kind === "total" ? `Whole = part + part: ${a} + ${b} = ${ans}` : `Part = whole − other part: ${a + b} − ${kind === "part" ? a : b} = ${ans}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(kind === "total" ? Math.abs(a - b) : a + b + (kind === "part" ? a : b)), String(ans + 10), String(ans - 10)].filter(s => s !== String(ans) && Number(s) > 0),
    tags: ["word problem", "bar model"]
  });
}

function compareProblemQuestion() {
  const big = randInt(40, 95); const small = randInt(12, big - 8);
  const [nA, nB] = choice([["Jack", "Ella"], ["Red team", "Blue team"], ["Ali", "Zoe"]]);
  return q({
    type: "compare-problem", marks: 2,
    prompt: `${nA} has ${big} points. ${nB} has ${small} points. How many more points does ${nA} have?`,
    diagram: barD({ diagramType: "compare", rows: [{ name: nA, value: big, label: String(big) }, { name: nB, value: small, label: String(small) }], difference: null }),
    answer: String(big - small),
    working: [`The difference is the gap: ${big} − ${small} = ${big - small}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(big + small), String(big - small + 10), String(small)],
    tags: ["compare", "bar model"]
  });
}

function estimateSumQuestion() {
  const a = randInt(21, 89); const b = randInt(11, 59);
  const r = v => Math.round(v / 10) * 10;
  const sub = Math.random() < 0.4 && a > b;
  const est = sub ? r(a) - r(b) : r(a) + r(b);
  return q({
    type: "estimate-sum", marks: 1,
    prompt: `Round each number to the nearest ten to estimate ${a} ${sub ? "−" : "+"} ${b}.`,
    answer: `about ${est}`,
    working: [`${a} → ${r(a)}, ${b} → ${r(b)}`, `${r(a)} ${sub ? "−" : "+"} ${r(b)} = ${est}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`about ${est + 10}`, `about ${est - 10}`, `about ${sub ? a - b : a + b}`].filter(s => s !== `about ${est}`),
    tags: ["estimate"]
  });
}

function checkWithInverseQuestion() {
  const a = randInt(40, 95); const b = randInt(12, a - 10); const right = Math.random() < 0.5;
  const claimed = right ? a - b : a - b + choice([-10, 10, 1]);
  return q2({
    type: "check-with-inverse", marks: 1,
    prompt: `Lily says ${a} − ${b} = ${claimed}. Check with addition. Is she right?`,
    answer: right ? `Yes: ${claimed} + ${b} = ${a}` : `No: ${claimed} + ${b} = ${claimed + b}, not ${a}. The answer is ${a - b}.`,
    working: ["Add the answer to the number taken away. You should get the starting number."],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["inverse", "checking"]
  });
}

const GENERATORS = {
  "jump-add": jumpAddQuestion,
  "jump-subtract": jumpSubtractQuestion,
  "count-on-difference": countOnDifferenceQuestion,
  "split-strategy": splitStrategyQuestion,
  "bridge-to-ten": bridgeToTenQuestion,
  "compensation": compensationQuestion,
  "make-ten": makeTenQuestion,
  "fact-family": factFamilyQuestion,
  "missing-number": missingNumberQuestion,
  "part-whole-problem": partWholeProblemQuestion,
  "compare-problem": compareProblemQuestion,
  "estimate-sum": estimateSumQuestion,
  "check-with-inverse": checkWithInverseQuestion
};

export function getAdditiveRelationsAQuestionTypes() { return TYPE_LIST; }
export function generateAdditiveRelationsAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
